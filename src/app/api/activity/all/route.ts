import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Aggregate all activity sources into one sorted feed
export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const allActivities: any[] = [];

  // Fetch from all sources in parallel
  const [commitsRes, deploysRes] = await Promise.allSettled([
    fetch(`${baseUrl}/api/activity/commits`, { next: { revalidate: 0 } }),
    fetch(`${baseUrl}/api/activity/deployments`, { next: { revalidate: 0 } }),
  ]);

  if (commitsRes.status === 'fulfilled' && commitsRes.value.ok) {
    const data = await commitsRes.value.json();
    if (data.activities) allActivities.push(...data.activities);
  }

  if (deploysRes.status === 'fulfilled' && deploysRes.value.ok) {
    const data = await deploysRes.value.json();
    if (data.activities) allActivities.push(...data.activities);
  }

  // Sort by time descending
  allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Compute stats
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentActivities = allActivities.filter(a => new Date(a.time) >= sevenDaysAgo);

  const stats = {
    activeAgents: new Set(recentActivities.map(a => a.agent)).size,
    commits7d: recentActivities.filter(a => a.type === 'commit').length,
    deploys7d: recentActivities.filter(a => a.type === 'deploy').length,
    totalToday: allActivities.filter(a => {
      const d = new Date(a.time);
      return d.toDateString() === now.toDateString();
    }).length,
  };

  return NextResponse.json({
    activities: allActivities.slice(0, 30),
    stats,
    lastUpdated: now.toISOString(),
  });
}
