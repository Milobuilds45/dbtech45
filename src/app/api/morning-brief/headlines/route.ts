import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  description: string;
  thumbnail: string | null;
  age: string;
  category: string;
}

export async function GET() {
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;

  // Try Brave News API first
  if (braveKey) {
    try {
      const queries = [
        { q: 'stock market today', category: 'MARKETS' },
        { q: 'breaking news today', category: 'NATIONAL' },
        { q: 'technology news today', category: 'TECH' },
        { q: 'AI artificial intelligence news', category: 'AI' },
      ];

      const allStories: NewsItem[] = [];

      await Promise.all(
        queries.map(async ({ q, category }) => {
          try {
            const res = await fetch(
              `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(q)}&count=5&freshness=pd`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Accept-Encoding': 'gzip',
                  'X-Subscription-Token': braveKey,
                },
                next: { revalidate: 900 },
              }
            );
            if (!res.ok) return;
            const data = await res.json();
            const results = data.results || [];
            results.forEach((r: Record<string, unknown>) => {
              const meta = r.meta_url as Record<string, string> | undefined;
              allStories.push({
                title: r.title as string,
                url: r.url as string,
                source: meta?.hostname?.replace('www.', '') || 'unknown',
                description: (r.description as string) || '',
                thumbnail: (r.thumbnail as Record<string, string>)?.src || null,
                age: (r.age as string) || '',
                category,
              });
            });
          } catch {
            // skip this query
          }
        })
      );

      if (allStories.length > 0) {
        return NextResponse.json({
          stories: allStories,
          source: 'brave',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      // fall through to fallback
    }
  }

  // Fallback: Google News RSS (no key needed)
  try {
    const feeds = [
      { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', category: 'NATIONAL' },
      { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', category: 'TECH' },
      { url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', category: 'MARKETS' },
    ];

    const allStories: NewsItem[] = [];

    await Promise.all(
      feeds.map(async ({ url, category }) => {
        try {
          const res = await fetch(url, { next: { revalidate: 900 } });
          if (!res.ok) return;
          const text = await res.text();
          
          // Simple XML parsing for RSS
          const items = text.split('<item>').slice(1, 6);
          items.forEach(item => {
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '';
            const link = item.match(/<link>(.*?)<\/link>|<link\/>(.*?)(?=<)/)?.[1] || '';
            const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1] || '';
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
            const description = item.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || '';
            
            // Calculate age
            let age = '';
            if (pubDate) {
              const diffMs = Date.now() - new Date(pubDate).getTime();
              const hours = Math.floor(diffMs / 3600000);
              if (hours < 1) age = 'just now';
              else if (hours < 24) age = `${hours}h ago`;
              else age = `${Math.floor(hours / 24)}d ago`;
            }

            if (title) {
              allStories.push({
                title: title.replace(/<[^>]*>/g, '').trim(),
                url: link,
                source: source || 'Google News',
                description: description.replace(/<[^>]*>/g, '').trim().slice(0, 200),
                thumbnail: null,
                age,
                category,
              });
            }
          });
        } catch {
          // skip
        }
      })
    );

    return NextResponse.json({
      stories: allStories,
      source: 'google-rss',
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      stories: [],
      source: 'none',
      updatedAt: new Date().toISOString(),
    });
  }
}
