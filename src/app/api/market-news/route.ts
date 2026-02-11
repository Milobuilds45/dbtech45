import { NextResponse } from 'next/server';

// Fetch news from Yahoo Finance
async function fetchYahooNews(symbols: string[]) {
  try {
    const allNews: any[] = [];
    
    for (const symbol of symbols.slice(0, 5)) { // Limit to 5 symbols
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=3`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      if (response.ok) {
        const data = await response.json();
        const news = data.news || [];
        allNews.push(...news.map((item: any) => ({
          ...item,
          relatedSymbol: symbol
        })));
      }
    }
    
    // Sort by date, most recent first
    allNews.sort((a, b) => (b.providerPublishTime || 0) - (a.providerPublishTime || 0));
    
    return allNews.slice(0, 20); // Return top 20 news items
  } catch (error) {
    console.error('Yahoo News error:', error);
    return [];
  }
}

// Format news for frontend
function formatNews(item: any) {
  return {
    id: item.uuid,
    title: item.title,
    summary: item.summary || '',
    publisher: item.publisher,
    link: item.link,
    thumbnail: item.thumbnail?.resolutions?.[0]?.url,
    publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : null,
    relatedSymbol: item.relatedSymbol,
    type: item.type
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',') || ['SPY', 'QQQ'];
  
  const news = await fetchYahooNews(symbols);
  const formattedNews = news.map(formatNews);
  
  return NextResponse.json({
    news: formattedNews,
    timestamp: new Date().toISOString(),
    symbols: symbols
  });
}
