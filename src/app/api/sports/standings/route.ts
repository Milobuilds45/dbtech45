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
      `https://site.api.espn.com/apis/v2/sports/${path}/standings`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    const data = await res.json();

    // ESPN standings structure can vary by sport
    const standings: Array<{
      team: string;
      abbreviation: string;
      wins: number;
      losses: number;
      pct: string;
      gb: string;
      streak: string;
      logo: string;
    }> = [];

    // Process standings from ESPN data
    const children = data.children || [];
    for (const conference of children) {
      const entries = conference.standings?.entries || [];
      for (const entry of entries) {
        const team = entry.team;
        const stats = entry.stats || [];
        
        const wins = stats.find((s: any) => s.name === 'wins')?.value || 0;
        const losses = stats.find((s: any) => s.name === 'losses')?.value || 0;
        const winPct = stats.find((s: any) => s.name === 'winPercent' || s.name === 'winpercent')?.value;
        const gb = stats.find((s: any) => s.name === 'gamesBehind')?.displayValue || '-';
        const streak = stats.find((s: any) => s.name === 'streak')?.displayValue || '-';

        standings.push({
          team: team?.displayName || team?.name || 'Unknown',
          abbreviation: team?.abbreviation || '',
          wins: Number(wins),
          losses: Number(losses),
          pct: winPct ? Number(winPct).toFixed(3).replace(/^0/, '') : '.000',
          gb: gb === '0' ? '-' : gb,
          streak,
          logo: team?.logos?.[0]?.href || '',
        });
      }
    }

    // Sort by win percentage
    standings.sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

    return NextResponse.json({ standings: standings.slice(0, 30) }); // Top 30
  } catch (e) {
    console.error('Standings fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch standings', standings: [] }, { status: 500 });
  }
}
