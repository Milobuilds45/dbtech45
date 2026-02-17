import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// TECH API — HackerNews + Brave Search for tech news
// ═══════════════════════════════════════════════════════════════════════════

interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  descendants: number; // comments
  time: number;
}

interface TechStory {
  title: string;
  url: string;
  source: string;
  time: string;
  description: string;
  comments?: number;
  points?: number;
  related?: Array<{ source: string; title: string; url: string }>;
}

// ─── Hacker News API ────────────────────────────────────────────────────
async function getHNTopStories(count: number = 20): Promise<TechStory[]> {
  try {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { next: { revalidate: 600 } });
    if (!topRes.ok) return [];
    const topIds: number[] = await topRes.json();

    const storyPromises = topIds.slice(0, count).map(async (id) => {
      try {
        const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { next: { revalidate: 600 } });
        if (!res.ok) return null;
        return await res.json() as HNStory;
      } catch { return null; }
    });

    const stories = (await Promise.all(storyPromises)).filter(Boolean) as HNStory[];

    return stories.map(s => {
      const domain = s.url ? new URL(s.url).hostname.replace('www.', '') : 'news.ycombinator.com';
      const timeAgo = getTimeAgo(s.time * 1000);
      return {
        title: s.title,
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        source: domain,
        time: timeAgo,
        description: '',
        comments: s.descendants || 0,
        points: s.score || 0,
      };
    });
  } catch (e) {
    console.error('HN API failed:', e);
    return [];
  }
}

// ─── Brave Search for Tech News ─────────────────────────────────────────
async function searchTechNews(): Promise<TechStory[]> {
  const key = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=technology+news+today&count=10&freshness=pd`,
      {
        headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': key },
        next: { revalidate: 1800 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.web?.results ?? []).slice(0, 10).map((r: { title: string; url: string; description: string }) => {
      const domain = new URL(r.url).hostname.replace('www.', '');
      return {
        title: r.title,
        url: r.url,
        source: domain,
        time: 'Today',
        description: r.description || '',
      };
    });
  } catch (e) {
    console.error('Brave tech search failed:', e);
    return [];
  }
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Source Leaderboard ─────────────────────────────────────────────────
function buildLeaderboard(stories: TechStory[]): Array<{ name: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const s of stories) {
    const src = s.source.replace(/\.com$|\.org$|\.io$|\.net$/, '');
    counts[src] = (counts[src] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

// ─── Trending Topics ────────────────────────────────────────────────────
function extractTopics(stories: TechStory[]): string[] {
  const keywords = ['AI', 'OpenAI', 'GPT', 'Crypto', 'Bitcoin', 'Apple', 'Google', 'Meta', 'Microsoft', 'Nvidia', 'Rust', 'React', 'Startup', 'IPO', 'LLM', 'Cloud'];
  const found = new Set<string>();
  for (const s of stories) {
    const text = (s.title + ' ' + s.description).toLowerCase();
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) found.add(`#${kw}`);
    }
  }
  return [...found].slice(0, 10);
}

export async function GET() {
  const [hnStories, braveStories] = await Promise.all([
    getHNTopStories(20),
    searchTechNews(),
  ]);

  // Merge and deduplicate, preferring HN stories
  const seen = new Set<string>();
  const allStories: TechStory[] = [];

  for (const s of [...hnStories, ...braveStories]) {
    const key = s.title.toLowerCase().slice(0, 50);
    if (!seen.has(key)) {
      seen.add(key);
      allStories.push(s);
    }
  }

  const leaderboard = buildLeaderboard(allStories);
  const topics = extractTopics(allStories);

  // Split into main river (top stories) and sidebar HN items
  const riverStories = allStories.slice(0, 15);
  const hnSidebar = hnStories.slice(0, 6);

  return NextResponse.json({
    stories: riverStories,
    hn_sidebar: hnSidebar,
    leaderboard,
    topics,
    generated_at: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=60' },
  });
}
