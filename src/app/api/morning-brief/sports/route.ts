import { NextResponse } from 'next/server';

interface Game {
  league: string;
  status: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  detail: string;
  startTime: string;
  isBoston: boolean;
}

async function fetchESPN(sport: string, league: string): Promise<Game[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();

    const bostonTeams = ['BOS', 'NE', 'Boston', 'Celtics', 'Bruins', 'Red Sox', 'Patriots', 'Revolution'];

    return (data.events || []).map((event: Record<string, unknown>) => {
      const competition = (event.competitions as Record<string, unknown>[])?.[0];
      if (!competition) return null;

      const competitors = competition.competitors as Record<string, unknown>[];
      const home = competitors?.find((c: Record<string, unknown>) => c.homeAway === 'home');
      const away = competitors?.find((c: Record<string, unknown>) => c.homeAway === 'away');

      if (!home || !away) return null;

      const homeTeamData = home.team as Record<string, unknown>;
      const awayTeamData = away.team as Record<string, unknown>;

      const homeTeam = (homeTeamData?.displayName as string) || 'TBD';
      const awayTeam = (awayTeamData?.displayName as string) || 'TBD';
      const homeAbbrev = (homeTeamData?.abbreviation as string) || '';
      const awayAbbrev = (awayTeamData?.abbreviation as string) || '';
      const homeScore = home.score ? parseInt(home.score as string) : null;
      const awayScore = away.score ? parseInt(away.score as string) : null;

      const statusObj = event.status as Record<string, unknown>;
      const statusType = statusObj?.type as Record<string, unknown>;
      const statusName = (statusType?.name as string) || '';
      const statusDetail = (statusType?.shortDetail as string) || (statusType?.detail as string) || '';

      let status = 'scheduled';
      if (statusName === 'STATUS_FINAL') status = 'final';
      else if (statusName === 'STATUS_IN_PROGRESS') status = 'live';
      else if (statusName === 'STATUS_HALFTIME') status = 'halftime';

      const isBoston = bostonTeams.some(bt =>
        homeTeam.includes(bt) || awayTeam.includes(bt) ||
        homeAbbrev === bt || awayAbbrev === bt
      );

      const startDate = new Date(event.date as string);
      const startTime = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      });

      return {
        league: league.toUpperCase(),
        status,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        detail: statusDetail || (status === 'final' ? 'Final' : startTime),
        startTime,
        isBoston,
      };
    }).filter(Boolean) as Game[];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [nba, nhl, mlb, nfl] = await Promise.all([
      fetchESPN('basketball', 'nba'),
      fetchESPN('hockey', 'nhl'),
      fetchESPN('baseball', 'mlb'),
      fetchESPN('football', 'nfl'),
    ]);

    // Sort: Boston teams first, then by status (live > final > scheduled)
    const allGames = [...nba, ...nhl, ...mlb, ...nfl];
    
    const statusOrder: Record<string, number> = { live: 0, halftime: 1, final: 2, scheduled: 3 };
    allGames.sort((a, b) => {
      if (a.isBoston && !b.isBoston) return -1;
      if (!a.isBoston && b.isBoston) return 1;
      return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    });

    // Separate by completed/upcoming
    const completed = allGames.filter(g => g.status === 'final');
    const live = allGames.filter(g => g.status === 'live' || g.status === 'halftime');
    const upcoming = allGames.filter(g => g.status === 'scheduled');

    return NextResponse.json({
      completed,
      live,
      upcoming,
      allGames,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sports API error:', error);
    return NextResponse.json({
      completed: [],
      live: [],
      upcoming: [],
      allGames: [],
      fallback: true,
    });
  }
}
