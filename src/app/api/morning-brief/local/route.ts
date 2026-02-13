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
    title: 'Route 3 Construction Continues: Delays Expected Through March',
    url: '#',
    source: 'Nashua Telegraph',
    description: 'NHDOT advises commuters to allow extra time. Work on the Exit 6 interchange is progressing despite weather delays.',
    time: 'Today',
    town: 'Nashua',
  },
  {
    title: 'Nashua School Board Reviews Annual Budget Proposal',
    url: '#',
    source: 'Union Leader',
    description: 'The budget includes funding for new technology initiatives and facility upgrades. Public hearing dates to be announced.',
    time: 'Today',
    town: 'Nashua',
  },
  {
    title: 'Hudson Selectmen Approve New Town Center Plans',
    url: '#',
    source: 'HLN',
    description: 'The board voted to move forward with a mixed-use development project near the town center.',
    time: 'Today',
    town: 'Hudson',
  },
  {
    title: 'Lowell City Council Addresses Housing Development',
    url: '#',
    source: 'Lowell Sun',
    description: 'Council members debate new zoning proposals aimed at increasing affordable housing options.',
    time: 'Yesterday',
    town: 'Lowell',
  },
  {
    title: 'Dracut Water District Announces Infrastructure Upgrades',
    url: '#',
    source: 'Lowell Sun',
    description: 'Multi-year plan to replace aging water mains begins this spring.',
    time: 'Yesterday',
    town: 'Dracut',
  },
  {
    title: 'Chelmsford Town Meeting Preview: Key Articles to Watch',
    url: '#',
    source: 'Chelmsford Independent',
    description: 'Voters will weigh in on school funding, road improvements, and conservation land purchases.',
    time: 'This Week',
    town: 'Chelmsford',
  },
  {
    title: 'Southern NH Unemployment Rate Remains Low',
    url: '#',
    source: 'NH Business Review',
    description: 'Tech and healthcare sectors continue to drive job growth in the region.',
    time: 'This Week',
    town: 'Nashua',
  },
  {
    title: 'Pheasant Lane Mall Announces Renovation Plans',
    url: '#',
    source: 'Boston Globe',
    description: 'The mall is planning significant updates to attract new tenants and improve the shopping experience.',
    time: 'This Week',
    town: 'Nashua',
  },
];

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
