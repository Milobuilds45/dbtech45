import { NextResponse } from 'next/server';

interface LocalStory {
  title: string;
  url: string;
  source: string;
  description: string;
  time: string;
  town: string;
}

// 5-town coverage area per Paula's spec (Dwight's method)
const COVERAGE_TOWNS = [
  { name: 'Nashua', state: 'NH', query: 'Nashua NH news today' },
  { name: 'Hudson', state: 'NH', query: 'Hudson NH news today' },
  { name: 'Lowell', state: 'MA', query: 'Lowell MA news today' },
  { name: 'Dracut', state: 'MA', query: 'Dracut MA news today' },
  { name: 'Chelmsford', state: 'MA', query: 'Chelmsford MA news today' },
];

const FALLBACK_STORIES: LocalStory[] = [
  {
    title: 'Nashua Telegraph - Local News',
    url: 'https://www.nashuatelegraph.com/news/local/',
    source: 'Nashua Telegraph',
    description: 'Visit the Nashua Telegraph for the latest local news coverage.',
    time: 'Today',
    town: 'Nashua, NH',
  },
  {
    title: 'Union Leader - Southern NH News',
    url: 'https://www.unionleader.com/news/local/',
    source: 'Union Leader',
    description: 'New Hampshire news and coverage from the Union Leader.',
    time: 'Today',
    town: 'Nashua, NH',
  },
  {
    title: 'Lowell Sun - Local Coverage',
    url: 'https://www.lowellsun.com/news/local-news/',
    source: 'Lowell Sun',
    description: 'Local news from Lowell, Dracut, Chelmsford and the Merrimack Valley.',
    time: 'Today',
    town: 'Lowell, MA',
  },
  {
    title: 'WMUR - Southern NH News',
    url: 'https://www.wmur.com/news',
    source: 'WMUR',
    description: 'New Hampshire news, weather, and local coverage from WMUR.',
    time: 'Today',
    town: 'Nashua, NH',
  },
];

// Note: Fallback stories appear when BRAVE_API_KEY is not set.
// Add BRAVE_API_KEY or BRAVE_SEARCH_API_KEY to Vercel env vars for real local news.

export async function GET() {
  const braveKey = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;

  if (braveKey) {
    try {
      const allStories: LocalStory[] = [];
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      // Run all 5 town queries per Dwight's method
      for (const town of COVERAGE_TOWNS) {
        const query = `${town.query} ${today}`;
        try {
          const res = await fetch(
            `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pd`,
            {
              headers: { 'X-Subscription-Token': braveKey, Accept: 'application/json' },
              next: { revalidate: 1800 }, // 30min cache
            }
          );
          if (!res.ok) continue;
          const data = await res.json();

          for (const result of data.web?.results || []) {
            let source = 'Web';
            try {
              const u = new URL(result.url);
              source = u.hostname.replace('www.', '');
            } catch { /* ignore */ }

            allStories.push({
              title: result.title,
              url: result.url,
              source,
              description: result.description || '',
              time: 'Today',
              town: `${town.name}, ${town.state}`,
            });
          }
        } catch (e) {
          console.error(`Brave search failed for ${town.name}:`, e);
        }
      }

      // Deduplicate by title similarity
      const seen = new Set<string>();
      const unique = allStories.filter(s => {
        const key = s.title.toLowerCase().substring(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (unique.length > 0) {
        return NextResponse.json({
          stories: unique.slice(0, 12),
          coverageArea: COVERAGE_TOWNS.map(t => `${t.name}, ${t.state}`),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Brave Search error:', error);
    }
  }

  // Fallback content
  return NextResponse.json({
    stories: FALLBACK_STORIES,
    coverageArea: COVERAGE_TOWNS.map(t => `${t.name}, ${t.state}`),
    updatedAt: new Date().toISOString(),
    fallback: true,
  });
}
