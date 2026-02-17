import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// SPORTS API — ESPN Scores, News, Standings, Schedules
// v2: Added news articles, standings, game IDs for box score links
// ═══════════════════════════════════════════════════════════════════════════

interface GameData {
  id: string;
  league: string;
  sport: string; // 'basketball' | 'hockey' | 'football'
  leagueSlug: string; // 'nba' | 'nhl' | 'nfl'
  away: string;
  awayFull: string;
  home: string;
  homeFull: string;
  awayScore: string;
  homeScore: string;
  awayLogo: string;
  homeLogo: string;
  status: string;
  statusDetail: string;
  time: string;
  broadcast: string;
  spread: string;
  overUnder: string;
  headline: string;
  awayRecord: string;
  homeRecord: string;
  boxScoreUrl: string;
}

interface NewsArticle {
  headline: string;
  description: string;
  url: string;
  source: string;
  imageUrl: string;
  published: string;
}

interface StandingsTeam {
  rank: number;
  name: string;
  abbr: string;
  record: string;
  isBostonTeam: boolean;
}

// ─── ESPN Scoreboard ────────────────────────────────────────────────────
async function getESPNScoreboard(sport: string, league: string): Promise<GameData[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = data.events ?? [];
    const games: GameData[] = [];

    for (const event of events) {
      const comp = event.competitions?.[0];
      if (!comp) continue;
      const competitors = comp.competitors ?? [];
      const away = competitors.find((c: { homeAway: string }) => c.homeAway === 'away');
      const home = competitors.find((c: { homeAway: string }) => c.homeAway === 'home');
      if (!away || !home) continue;

      const gameId = event.id ?? comp.id ?? '';
      const gameDate = new Date(event.date ?? comp.date);
      const timeStr = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
      const statusState = comp.status?.type?.state ?? event.status?.type?.state ?? '';
      const statusDesc = comp.status?.type?.description ?? event.status?.type?.description ?? '';

      let status = 'Scheduled';
      if (statusState === 'post') status = 'Final';
      else if (statusState === 'in') status = 'Live';

      const broadcasts = comp.broadcasts ?? [];
      let broadcast = '';
      if (broadcasts.length > 0 && broadcasts[0].names?.length > 0) broadcast = broadcasts[0].names[0];

      const odds = comp.odds?.[0];
      const spread = odds?.details ?? '';
      const overUnder = odds?.overUnder ? `${odds.overUnder}` : '';

      const headlines = comp.headlines ?? event.headlines ?? [];
      const headline = headlines[0]?.shortLinkText ?? headlines[0]?.description ?? '';

      // Build box score URL: https://www.espn.com/{sport}/boxscore/_/gameId/{id}
      const espnSport = sport === 'hockey' ? 'nhl' : sport === 'basketball' && league === 'nba' ? 'nba' : sport === 'football' ? 'nfl' : league;
      const boxScoreUrl = gameId ? `https://www.espn.com/${espnSport}/boxscore/_/gameId/${gameId}` : '';

      games.push({
        id: gameId,
        league: league.toUpperCase(),
        sport,
        leagueSlug: league,
        away: away.team?.abbreviation ?? '???',
        awayFull: away.team?.displayName ?? away.team?.abbreviation ?? '???',
        home: home.team?.abbreviation ?? '???',
        homeFull: home.team?.displayName ?? home.team?.abbreviation ?? '???',
        awayScore: away.score ?? '0',
        homeScore: home.score ?? '0',
        awayLogo: away.team?.logo ?? '',
        homeLogo: home.team?.logo ?? '',
        status,
        statusDetail: statusDesc,
        time: timeStr,
        broadcast,
        spread,
        overUnder,
        headline,
        awayRecord: away.records?.[0]?.summary ?? '',
        homeRecord: home.records?.[0]?.summary ?? '',
        boxScoreUrl,
      });
    }
    return games;
  } catch (e) {
    console.error(`ESPN ${league} scoreboard failed:`, e);
    return [];
  }
}

// ─── ESPN News ──────────────────────────────────────────────────────────
async function getESPNNews(sport: string, league: string, limit: number = 8): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?limit=${limit}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles ?? []).map((a: {
      headline?: string;
      description?: string;
      links?: { web?: { href?: string } };
      images?: Array<{ url?: string; caption?: string }>;
      published?: string;
      source?: string;
      type?: string;
    }) => ({
      headline: a.headline ?? '',
      description: a.description ?? '',
      url: a.links?.web?.href ?? '',
      source: a.source ?? 'ESPN',
      imageUrl: a.images?.[0]?.url ?? '',
      published: a.published ?? '',
    }));
  } catch (e) {
    console.error(`ESPN ${league} news failed:`, e);
    return [];
  }
}

// ─── ESPN Standings ─────────────────────────────────────────────────────
async function getNBAEastStandings(): Promise<StandingsTeam[]> {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // ESPN standings: children[0] = Eastern, children[1] = Western
    const eastern = data.children?.find((c: { name?: string; abbreviation?: string }) =>
      c.name?.includes('Eastern') || c.abbreviation === 'E'
    );
    if (!eastern) return [];
    
    const entries = eastern.standings?.entries ?? [];
    const bostonAbbrs = ['BOS'];
    
    return entries.slice(0, 8).map((entry: {
      team?: { abbreviation?: string; displayName?: string; shortDisplayName?: string };
      stats?: Array<{ name?: string; displayValue?: string }>;
    }, i: number) => {
      const team = entry.team;
      const wins = entry.stats?.find((s: { name?: string }) => s.name === 'wins')?.displayValue ?? '0';
      const losses = entry.stats?.find((s: { name?: string }) => s.name === 'losses')?.displayValue ?? '0';
      const abbr = team?.abbreviation ?? '???';
      return {
        rank: i + 1,
        name: team?.shortDisplayName ?? team?.displayName ?? '???',
        abbr,
        record: `${wins}-${losses}`,
        isBostonTeam: bostonAbbrs.includes(abbr),
      };
    });
  } catch (e) {
    console.error('NBA standings failed:', e);
    return [];
  }
}

async function getNHLAtlanticStandings(): Promise<StandingsTeam[]> {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // NHL: children are conferences, then divisions within
    // Find Atlantic division
    let atlanticEntries: Array<{
      team?: { abbreviation?: string; displayName?: string; shortDisplayName?: string };
      stats?: Array<{ name?: string; displayValue?: string }>;
    }> = [];
    
    for (const conference of (data.children ?? [])) {
      for (const division of (conference.children ?? [])) {
        if (division.name?.includes('Atlantic') || division.abbreviation === 'A') {
          atlanticEntries = division.standings?.entries ?? [];
          break;
        }
      }
      if (atlanticEntries.length > 0) break;
    }
    
    if (atlanticEntries.length === 0) return [];
    
    const bostonAbbrs = ['BOS'];
    
    return atlanticEntries.slice(0, 8).map((entry, i: number) => {
      const team = entry.team;
      const points = entry.stats?.find((s) => s.name === 'points')?.displayValue ?? '0';
      const abbr = team?.abbreviation ?? '???';
      return {
        rank: i + 1,
        name: team?.shortDisplayName ?? team?.displayName ?? '???',
        abbr,
        record: `${points} pts`,
        isBostonTeam: bostonAbbrs.includes(abbr),
      };
    });
  } catch (e) {
    console.error('NHL standings failed:', e);
    return [];
  }
}

export async function GET() {
  const [nba, nhl, nfl, nbaNews, nhlNews, nbaStandings, nhlStandings] = await Promise.all([
    getESPNScoreboard('basketball', 'nba'),
    getESPNScoreboard('hockey', 'nhl'),
    getESPNScoreboard('football', 'nfl'),
    getESPNNews('basketball', 'nba', 6),
    getESPNNews('hockey', 'nhl', 4),
    getNBAEastStandings(),
    getNHLAtlanticStandings(),
  ]);

  const allGames = [...nba, ...nhl, ...nfl];
  const scores = allGames.filter(g => g.status === 'Final' || g.status === 'Live');
  const today = allGames.filter(g => g.status === 'Scheduled');

  // Boston teams
  const bostonAbbrs = ['BOS', 'NE'];
  const isBostonGame = (g: GameData) => bostonAbbrs.includes(g.away) || bostonAbbrs.includes(g.home);

  // Merge and deduplicate news, interleaving NBA/NHL
  const allNews: NewsArticle[] = [];
  const maxLen = Math.max(nbaNews.length, nhlNews.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < nbaNews.length) allNews.push(nbaNews[i]);
    if (i < nhlNews.length) allNews.push(nhlNews[i]);
  }

  return NextResponse.json({
    scores,
    today,
    boston_games: allGames.filter(isBostonGame),
    news: allNews,
    standings: {
      nba_east: nbaStandings,
      nhl_atlantic: nhlStandings,
    },
    generated_at: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  });
}
