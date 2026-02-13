import { NextResponse } from 'next/server';

interface LocalStory {
  title: string;
  url: string;
  source: string;
  description: string;
  time: string;
}

const FALLBACK_STORIES: LocalStory[] = [
  {
    title: 'Route 3 Construction Continues: Delays Expected Through March',
    url: '#',
    source: 'Nashua Telegraph',
    description: 'NHDOT advises commuters to allow extra time. Work on the Exit 6 interchange is progressing despite weather delays.',
    time: 'Today',
  },
  {
    title: 'Nashua School Board Reviews Annual Budget Proposal',
    url: '#',
    source: 'Union Leader',
    description: 'The budget includes funding for new technology initiatives and facility upgrades. Public hearing dates to be announced.',
    time: 'Today',
  },
  {
    title: 'New Business Development Coming to South Nashua',
    url: '#',
    source: 'Nashua Patch',
    description: 'A new mixed-use development has been proposed for the Daniel Webster Highway corridor.',
    time: 'Yesterday',
  },
  {
    title: 'Nashua Fire Department Responds to Structure Fire',
    url: '#',
    source: 'WMUR',
    description: 'No injuries reported. Fire officials investigating cause of the incident.',
    time: 'Yesterday',
  },
  {
    title: 'Southern NH Unemployment Rate Remains Low',
    url: '#',
    source: 'NH Business Review',
    description: 'Tech and healthcare sectors continue to drive job growth in the region.',
    time: 'This Week',
  },
  {
    title: 'Pheasant Lane Mall Announces Renovation Plans',
    url: '#',
    source: 'Boston Globe',
    description: 'The mall is planning significant updates to attract new tenants and improve the shopping experience.',
    time: 'This Week',
  },
];

export async function GET() {
  const braveKey = process.env.BRAVE_API_KEY;

  if (braveKey) {
    try {
      const queries = ['Nashua NH news', 'Southern New Hampshire news today'];
      const allStories: LocalStory[] = [];

      for (const query of queries) {
        const res = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pd`,
          {
            headers: { 'X-Subscription-Token': braveKey, Accept: 'application/json' },
            next: { revalidate: 1800 },
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
          });
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
          stories: unique.slice(0, 8),
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
    updatedAt: new Date().toISOString(),
    fallback: true,
  });
}
