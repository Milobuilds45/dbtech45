// Daily Feed API — pulls real git commits and Vercel deploys

interface FeedEntry {
  time: string;
  tag: string;
  color: string;
  text: string;
  project?: string;
}

async function getVercelDeploys(): Promise<FeedEntry[]> {
  const entries: FeedEntry[] = [];

  try {
    const token = process.env.VERCEL_TOKEN;
    if (!token) return [];

    const res = await fetch(
      'https://api.vercel.com/v6/deployments?teamId=milos-projects-b55f88cf&limit=20&state=READY',
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } }
    );

    if (!res.ok) return [];
    const data = await res.json();

    for (const d of data.deployments || []) {
      const date = new Date(d.created);
      entries.push({
        time: date.toISOString(),
        tag: 'DEPLOY',
        color: '#10B981',
        text: `${d.name} deployed to ${d.target || 'preview'}${d.meta?.githubCommitMessage ? ` — "${d.meta.githubCommitMessage}"` : ''}`,
        project: d.name,
      });
    }
  } catch (e) {
    console.error('Vercel deploys fetch error:', e);
  }

  return entries;
}

async function getGitHubCommits(): Promise<FeedEntry[]> {
  const entries: FeedEntry[] = [];

  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return [];

    // Fetch recent events for the user
    const res = await fetch(
      'https://api.github.com/users/7layerlabs/events?per_page=30',
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }, next: { revalidate: 300 } }
    );

    if (!res.ok) return [];
    const events = await res.json();

    for (const event of events) {
      if (event.type === 'PushEvent') {
        const repo = event.repo?.name?.split('/')[1] || event.repo?.name || 'unknown';
        const commits = event.payload?.commits || [];
        for (const commit of commits.slice(0, 3)) {
          entries.push({
            time: event.created_at,
            tag: 'COMMIT',
            color: '#3B82F6',
            text: `${repo}: ${commit.message}`,
            project: repo,
          });
        }
      }
    }
  } catch (e) {
    console.error('GitHub events fetch error:', e);
  }

  return entries;
}

export async function GET() {
  const [deploys, commits] = await Promise.all([
    getVercelDeploys(),
    getGitHubCommits(),
  ]);

  // Combine and sort by time (newest first)
  const all = [...deploys, ...commits].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  // Cap at 50 entries
  return Response.json({ entries: all.slice(0, 50) });
}
