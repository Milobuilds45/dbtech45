import { NextResponse } from 'next/server';

// Weather API (OpenWeatherMap)
async function getWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return { temp: '--', condition: 'No API key', high: '--', low: '--' };
  }
  
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Nashua,NH,US&units=imperial&appid=${apiKey}`,
      { next: { revalidate: 1800 } } // Cache for 30 min
    );
    const data = await res.json();
    
    return {
      temp: `${Math.round(data.main.temp)}°F`,
      condition: data.weather[0].main,
      high: `${Math.round(data.main.temp_max)}°F`,
      low: `${Math.round(data.main.temp_min)}°F`,
      humidity: `${data.main.humidity}%`,
      wind: `${Math.round(data.wind.speed)} mph`
    };
  } catch (e) {
    console.error('Weather fetch failed:', e);
    return { temp: '--', condition: 'Error', high: '--', low: '--' };
  }
}

// News API
async function getNews() {
  const apiKey = process.env.NEWS_API_KEY;
  const news: Array<{ title: string; summary: string; source: string; relevance: string; url: string }> = [];
  
  // Search queries for Derek's interests
  const queries = [
    { q: 'Nashua NH OR New Hampshire', relevance: 'Local' },
    { q: 'Boston Celtics', relevance: 'Celtics' },
    { q: 'Boston Red Sox', relevance: 'Red Sox' },
    { q: 'New England Patriots', relevance: 'Patriots' },
    { q: 'AI artificial intelligence startup', relevance: 'AI/Tech' },
    { q: 'options trading stock market', relevance: 'Trading' },
  ];

  if (!apiKey) {
    // Return placeholder if no API key
    return [
      { title: 'News API key not configured', summary: 'Add NEWS_API_KEY to environment variables', source: 'System', relevance: 'Setup', url: '#' }
    ];
  }

  try {
    for (const query of queries.slice(0, 3)) { // Limit to avoid rate limits
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query.q)}&sortBy=publishedAt&pageSize=2&apiKey=${apiKey}`,
        { next: { revalidate: 3600 } }
      );
      const data = await res.json();
      
      if (data.articles) {
        for (const article of data.articles.slice(0, 1)) {
          news.push({
            title: article.title,
            summary: article.description || article.title,
            source: article.source.name,
            relevance: query.relevance,
            url: article.url
          });
        }
      }
    }
  } catch (e) {
    console.error('News fetch failed:', e);
  }

  return news.length > 0 ? news : [
    { title: 'Unable to fetch news', summary: 'Check API configuration', source: 'System', relevance: 'Error', url: '#' }
  ];
}

// Sports scores (ESPN unofficial)
async function getSportsNews() {
  const sports = [];
  
  try {
    // Celtics
    const celticsRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/bos/news', { next: { revalidate: 3600 } });
    const celticsData = await celticsRes.json();
    if (celticsData.articles?.[0]) {
      sports.push({
        title: celticsData.articles[0].headline,
        summary: celticsData.articles[0].description || '',
        source: 'ESPN',
        relevance: 'Celtics',
        url: celticsData.articles[0].links?.web?.href || '#'
      });
    }
  } catch (e) {
    console.error('Celtics news failed:', e);
  }

  try {
    // Red Sox
    const soxRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/bos/news', { next: { revalidate: 3600 } });
    const soxData = await soxRes.json();
    if (soxData.articles?.[0]) {
      sports.push({
        title: soxData.articles[0].headline,
        summary: soxData.articles[0].description || '',
        source: 'ESPN',
        relevance: 'Red Sox',
        url: soxData.articles[0].links?.web?.href || '#'
      });
    }
  } catch (e) {
    console.error('Red Sox news failed:', e);
  }

  try {
    // Patriots
    const patsRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/ne/news', { next: { revalidate: 3600 } });
    const patsData = await patsRes.json();
    if (patsData.articles?.[0]) {
      sports.push({
        title: patsData.articles[0].headline,
        summary: patsData.articles[0].description || '',
        source: 'ESPN',
        relevance: 'Patriots',
        url: patsData.articles[0].links?.web?.href || '#'
      });
    }
  } catch (e) {
    console.error('Patriots news failed:', e);
  }

  return sports;
}

// Market data
async function getMarketData() {
  try {
    // Using Yahoo Finance unofficial API for basic data
    const symbols = ['ES=F', 'NQ=F', '^VIX'];
    const quotes: Record<string, { price: number; change: number; changePercent: number }> = {};
    
    for (const symbol of symbols) {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { next: { revalidate: 300 } }
        );
        const data = await res.json();
        const result = data.chart?.result?.[0];
        if (result) {
          const meta = result.meta;
          quotes[symbol] = {
            price: meta.regularMarketPrice,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
          };
        }
      } catch (e) {
        console.error(`Failed to fetch ${symbol}:`, e);
      }
    }

    const es = quotes['ES=F'];
    const nq = quotes['NQ=F'];
    const vix = quotes['^VIX'];

    return {
      premarket: `ES ${es ? (es.changePercent >= 0 ? '+' : '') + es.changePercent.toFixed(2) + '%' : '--'} | NQ ${nq ? (nq.changePercent >= 0 ? '+' : '') + nq.changePercent.toFixed(2) + '%' : '--'}`,
      keyLevels: [
        `ES: ${es ? es.price.toFixed(0) : '--'}`,
        `NQ: ${nq ? nq.price.toFixed(0) : '--'}`,
        `VIX: ${vix ? vix.price.toFixed(1) : '--'}`
      ],
      overnight: 'Data from Yahoo Finance'
    };
  } catch (e) {
    console.error('Market data failed:', e);
    return {
      premarket: 'Market data unavailable',
      keyLevels: [],
      overnight: ''
    };
  }
}

export async function GET() {
  const [weather, generalNews, sportsNews, market] = await Promise.all([
    getWeather(),
    getNews(),
    getSportsNews(),
    getMarketData()
  ]);

  // Combine news
  const allNews = [...sportsNews, ...generalNews].slice(0, 6);

  const brief = {
    id: `brief-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    location: 'Nashua, NH',
    sections: {
      weather,
      news: allNews,
      marketSnapshot: market,
      // These would come from your agents/database
      businessIdeas: [
        { title: 'Loading...', description: 'Connect to agent system for daily ideas', effort: '--' }
      ],
      todaysTasks: [
        { task: 'Connect to task system', priority: 'medium', source: 'System' }
      ],
      agentRecommendations: [
        { task: 'Set up morning brief automation', agent: 'Milo', reason: 'Ready for cron job' }
      ],
      overnightActivity: [
        { agent: 'System', action: 'Morning Brief API initialized', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
      ],
      quote: {
        text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
        author: 'Chinese Proverb'
      }
    }
  };

  return NextResponse.json(brief);
}
