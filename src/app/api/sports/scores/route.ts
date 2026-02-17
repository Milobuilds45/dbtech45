import { NextRequest, NextResponse } from 'next/server';

const SPORT_PATHS: Record<string, string> = {
  nba: 'basketball/nba',
  nfl: 'football/nfl',
  mlb: 'baseball/mlb',
};

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get('sport') || 'nba';
  const path = SPORT_PATHS[sport];
  
  if (!path) {
    return NextResponse.json({ error: 'Invalid sport' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );
    const data = await res.json();

    const games = data.events?.map((event: any) => {
      const competition = event.competitions?.[0];
      const home = competition?.competitors?.find((c: any) => c.homeAway === 'home');
      const away = competition?.competitors?.find((c: any) => c.homeAway === 'away');
      
      return {
        id: event.id,
        status: event.status?.type?.state || 'pre', // pre, in, post
        statusDetail: event.status?.type?.shortDetail || event.status?.type?.description || '',
        homeTeam: {
          name: home?.team?.displayName || home?.team?.name || 'TBD',
          abbreviation: home?.team?.abbreviation || '',
          logo: home?.team?.logo || '',
          score: home?.score || '',
          record: home?.records?.[0]?.summary || '',
        },
        awayTeam: {
          name: away?.team?.displayName || away?.team?.name || 'TBD',
          abbreviation: away?.team?.abbreviation || '',
          logo: away?.team?.logo || '',
          score: away?.score || '',
          record: away?.records?.[0]?.summary || '',
        },
        venue: competition?.venue?.fullName || '',
        broadcast: competition?.broadcasts?.[0]?.names?.[0] || '',
        time: event.date ? new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
      };
    }) || [];

    return NextResponse.json({ games, league: data.leagues?.[0]?.name || sport.toUpperCase() });
  } catch (e) {
    console.error('Scores fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch scores', games: [] }, { status: 500 });
  }
}
