import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
  }

  try {
    // Fetch recent commits from Milobuilds45/dbtech45
    const res = await fetch('https://api.github.com/repos/Milobuilds45/dbtech45/commits?per_page=20', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('GitHub API error:', res.status, err);
      return NextResponse.json({ error: 'GitHub API failed', status: res.status }, { status: 500 });
    }

    const commits = await res.json();

    const activities = commits.map((c: any) => {
      const msg = c.commit?.message?.split('\n')[0] || 'No message';
      const date = new Date(c.commit?.author?.date || c.commit?.committer?.date);
      const author = c.commit?.author?.name || c.author?.login || 'Unknown';

      // Map commit author to agent name
      let agent = 'Anders';
      const authorLower = author.toLowerCase();
      if (authorLower.includes('milo')) agent = 'Milo';
      else if (authorLower.includes('paula')) agent = 'Paula';
      else if (authorLower.includes('derek') || authorLower.includes('dbtech')) agent = 'Derek';
      else if (authorLower.includes('bobby')) agent = 'Bobby';
      else if (authorLower.includes('dax')) agent = 'Dax';

      return {
        id: c.sha?.substring(0, 7),
        time: date.toISOString(),
        type: 'commit',
        agent,
        msg: msg.substring(0, 120),
        sha: c.sha?.substring(0, 7),
        url: c.html_url,
      };
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Commits fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  }
}
