import { NextRequest, NextResponse } from 'next/server';

const SPORT_PATHS: Record<string, string> = {
  nba: 'basketball/nba',
  nfl: 'football/nfl',
  mlb: 'baseball/mlb',
};

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get('sport') || 'nba';
  const path = SPORT_PATHS[sport];
  
  if (!path) {
    return NextResponse.json({ error: 'Invalid sport' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${path}/news`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    const data = await res.json();

    const news = data.articles?.map((article: any) => {
      const published = article.published ? new Date(article.published) : new Date();
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
      
      let timeAgo = '';
      if (diffHours < 1) timeAgo = 'Just now';
      else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
      else if (diffHours < 48) timeAgo = 'Yesterday';
      else timeAgo = published.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        headline: article.headline,
        description: article.description || '',
        image: article.images?.[0]?.url || '',
        url: article.links?.web?.href || article.links?.api?.news?.href || '#',
        published: timeAgo,
      };
    }) || [];

    return NextResponse.json({ news });
  } catch (e) {
    console.error('News fetch failed:', e);
    return NextResponse.json({ error: 'Failed to fetch news', news: [] }, { status: 500 });
  }
}
