import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'VERCEL_TOKEN not configured' }, { status: 500 });
  }

  try {
    // Fetch recent deployments for the dbtech45 project
    const res = await fetch('https://api.vercel.com/v6/deployments?projectId=prj_pv2ujIx6yv0Y2ryEVAtBNLIfvadY&limit=15&state=READY', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Vercel API error:', res.status, err);
      return NextResponse.json({ error: 'Vercel API failed' }, { status: 500 });
    }

    const data = await res.json();
    const deployments = data.deployments || [];

    const activities = deployments.map((d: any) => {
      const date = new Date(d.created || d.createdAt);
      const target = d.target === 'production' ? 'production' : 'preview';
      const duration = d.ready && d.created ? Math.round((d.ready - d.created) / 1000) : null;

      return {
        id: d.uid?.substring(0, 8),
        time: date.toISOString(),
        type: 'deploy',
        agent: 'Anders',
        msg: `Deployed to ${target}${duration ? ` (${duration}s)` : ''} — ${d.url || 'dbtech45.com'}`,
        url: d.inspectorUrl || `https://${d.url}`,
        target,
      };
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Deployments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
}
