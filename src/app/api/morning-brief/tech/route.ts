import { NextResponse } from 'next/server';

interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  domain: string;
}

async function fetchHNStory(id: number): Promise<HNStory | null> {
  try {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.type !== 'story' || data.dead || data.deleted) return null;

    let domain = '';
    if (data.url) {
      try {
        const u = new URL(data.url);
        domain = u.hostname.replace('www.', '');
      } catch {
        domain = '';
      }
    }

    return {
      id: data.id,
      title: data.title,
      url: data.url || `https://news.ycombinator.com/item?id=${data.id}`,
      score: data.score || 0,
      by: data.by || 'anonymous',
      time: data.time || 0,
      descendants: data.descendants || 0,
      domain,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Get top story IDs
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 600 },
    });
    if (!topRes.ok) throw new Error('HN API failed');
    const topIds: number[] = await topRes.json();

    // Fetch top 30 stories
    const storyPromises = topIds.slice(0, 30).map(fetchHNStory);
    const stories = (await Promise.all(storyPromises)).filter(Boolean) as HNStory[];

    // Sort by score descending
    stories.sort((a, b) => b.score - a.score);

    // Calculate time ago
    const now = Math.floor(Date.now() / 1000);
    const formattedStories = stories.map(s => {
      const ago = now - s.time;
      let timeAgo = '';
      if (ago < 3600) timeAgo = `${Math.floor(ago / 60)}m ago`;
      else if (ago < 86400) timeAgo = `${Math.floor(ago / 3600)}h ago`;
      else timeAgo = `${Math.floor(ago / 86400)}d ago`;

      return {
        ...s,
        timeAgo,
        hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
      };
    });

    // Source leaderboard
    const sourceCounts: Record<string, number> = {};
    stories.forEach(s => {
      if (s.domain) {
        sourceCounts[s.domain] = (sourceCounts[s.domain] || 0) + 1;
      }
    });
    const leaderboard = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Extract trending topics from titles
    const techKeywords = ['AI', 'LLM', 'GPT', 'Rust', 'Python', 'Linux', 'Open Source', 'Startup', 'Crypto', 'Bitcoin', 'Database', 'Cloud', 'Security', 'Apple', 'Google', 'Microsoft', 'Meta', 'NVIDIA', 'Anthropic', 'OpenAI'];
    const topicCounts: Record<string, number> = {};
    stories.forEach(s => {
      techKeywords.forEach(kw => {
        if (s.title.toLowerCase().includes(kw.toLowerCase())) {
          topicCounts[kw] = (topicCounts[kw] || 0) + 1;
        }
      });
    });
    const trendingTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([topic]) => `#${topic}`);

    return NextResponse.json({
      stories: formattedStories,
      leaderboard,
      trendingTopics,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Tech API error:', error);
    return NextResponse.json({
      stories: [],
      leaderboard: [],
      trendingTopics: [],
      fallback: true,
    });
  }
}
