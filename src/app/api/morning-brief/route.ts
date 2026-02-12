import { NextResponse } from 'next/server';

// Nashua, NH coordinates
const NASHUA_LAT = 42.7654;
const NASHUA_LON = -71.4676;

// Weather via NOAA (free, no API key) - Dwight's recommendation
async function getWeather() {
  try {
    // First get the forecast URL for Nashua
    const pointsRes = await fetch(
      `https://api.weather.gov/points/${NASHUA_LAT},${NASHUA_LON}`,
      { 
        headers: { 'User-Agent': '(DBTechOS, derek@dbtech45.com)' },
        next: { revalidate: 3600 }
      }
    );
    const pointsData = await pointsRes.json();
    
    // Get the forecast
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) throw new Error('No forecast URL');
    
    const forecastRes = await fetch(forecastUrl, {
      headers: { 'User-Agent': '(DBTechOS, derek@dbtech45.com)' },
      next: { revalidate: 1800 }
    });
    const forecastData = await forecastRes.json();
    
    const current = forecastData.properties?.periods?.[0];
    const tonight = forecastData.properties?.periods?.[1];
    
    if (!current) throw new Error('No forecast data');
    
    return {
      temp: `${current.temperature}°${current.temperatureUnit}`,
      condition: current.shortForecast,
      high: current.isDaytime ? `${current.temperature}°F` : `${tonight?.temperature || '--'}°F`,
      low: current.isDaytime ? `${tonight?.temperature || '--'}°F` : `${current.temperature}°F`,
      wind: current.windSpeed,
      detail: current.detailedForecast?.slice(0, 150) || ''
    };
  } catch (e) {
    console.error('NOAA weather failed, trying Open-Meteo:', e);
    // Fallback to Open-Meteo
    return getWeatherFallback();
  }
}

// Open-Meteo fallback (also free)
async function getWeatherFallback() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${NASHUA_LAT}&longitude=${NASHUA_LON}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America/New_York`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    
    const wmoCodeToCondition: Record<number, string> = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 66: 'Freezing Rain', 67: 'Heavy Freezing Rain',
      71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
      80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
      85: 'Light Snow Showers', 86: 'Heavy Snow Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Severe Thunderstorm'
    };
    
    return {
      temp: `${Math.round(data.current_weather.temperature)}°F`,
      condition: wmoCodeToCondition[data.current_weather.weathercode] || 'Unknown',
      high: `${Math.round(data.daily.temperature_2m_max[0])}°F`,
      low: `${Math.round(data.daily.temperature_2m_min[0])}°F`,
      wind: `${Math.round(data.current_weather.windspeed)} mph`,
      detail: ''
    };
  } catch (e) {
    console.error('Open-Meteo fallback failed:', e);
    return { temp: '--', condition: 'Error', high: '--', low: '--', wind: '--', detail: '' };
  }
}

// ESPN Sports News (free, no API key)
async function getSportsNews() {
  const sports: Array<{ title: string; summary: string; source: string; relevance: string; url: string }> = [];
  
  const teams = [
    { name: 'Celtics', sport: 'basketball', league: 'nba', team: 'bos', color: '#007A33' },
    { name: 'Red Sox', sport: 'baseball', league: 'mlb', team: 'bos', color: '#BD3039' },
    { name: 'Patriots', sport: 'football', league: 'nfl', team: 'ne', color: '#002244' },
  ];

  for (const t of teams) {
    try {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${t.sport}/${t.league}/teams/${t.team}/news`,
        { next: { revalidate: 3600 } }
      );
      const data = await res.json();
      if (data.articles?.[0]) {
        sports.push({
          title: data.articles[0].headline,
          summary: data.articles[0].description || '',
          source: 'ESPN',
          relevance: t.name,
          url: data.articles[0].links?.web?.href || '#'
        });
      }
    } catch (e) {
      console.error(`${t.name} news failed:`, e);
    }
  }

  return sports;
}

// NH Weather Alerts (free)
async function getWeatherAlerts() {
  try {
    const res = await fetch(
      'https://api.weather.gov/alerts/active?area=NH',
      { 
        headers: { 'User-Agent': '(DBTechOS, derek@dbtech45.com)' },
        next: { revalidate: 900 } // 15 min cache
      }
    );
    const data = await res.json();
    
    return data.features?.map((alert: { properties: { headline: string; severity: string; event: string } }) => ({
      headline: alert.properties.headline,
      severity: alert.properties.severity,
      event: alert.properties.event
    })) || [];
  } catch (e) {
    console.error('Alerts fetch failed:', e);
    return [];
  }
}

// Market data via Yahoo Finance (free)
async function getMarketData() {
  try {
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
          const prevClose = meta.chartPreviousClose || meta.previousClose;
          quotes[symbol] = {
            price: meta.regularMarketPrice,
            change: meta.regularMarketPrice - prevClose,
            changePercent: ((meta.regularMarketPrice - prevClose) / prevClose) * 100
          };
        }
      } catch (e) {
        console.error(`Failed to fetch ${symbol}:`, e);
      }
    }

    const es = quotes['ES=F'];
    const nq = quotes['NQ=F'];
    const vix = quotes['^VIX'];

    const formatChange = (q: typeof es) => q ? (q.changePercent >= 0 ? '+' : '') + q.changePercent.toFixed(2) + '%' : '--';

    return {
      premarket: `ES ${formatChange(es)} | NQ ${formatChange(nq)}`,
      keyLevels: [
        `ES: ${es ? es.price.toFixed(0) : '--'}`,
        `NQ: ${nq ? nq.price.toFixed(0) : '--'}`,
        `VIX: ${vix ? vix.price.toFixed(1) : '--'}`
      ],
      overnight: 'Live data from market feeds'
    };
  } catch (e) {
    console.error('Market data failed:', e);
    return { premarket: 'Market data unavailable', keyLevels: [], overnight: '' };
  }
}

// Daily quotes
const QUOTES = [
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Ship early, ship often.', author: 'Reid Hoffman' },
  { text: 'Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.', author: 'Mark Zuckerberg' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
];

export async function GET() {
  const [weather, sportsNews, alerts, market] = await Promise.all([
    getWeather(),
    getSportsNews(),
    getWeatherAlerts(),
    getMarketData()
  ]);

  // Combine all news
  const allNews = [...sportsNews];
  
  // Add weather alerts as news if any
  if (alerts.length > 0) {
    allNews.unshift({
      title: `⚠️ ${alerts[0].event}`,
      summary: alerts[0].headline,
      source: 'NWS',
      relevance: 'Weather Alert',
      url: '#'
    });
  }

  const quote = QUOTES[new Date().getDay()];

  const brief = {
    id: `brief-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }),
    location: 'Nashua, NH',
    sections: {
      weather,
      weatherAlerts: alerts,
      news: allNews,
      marketSnapshot: market,
      businessIdeas: [
        { title: 'AI Receipt Scanner', description: 'Snap → extract → categorize expenses for Bobola\'s', effort: '2-3 weeks' },
        { title: 'Family Task Coordinator', description: 'AI assigns chores across 9 family members by schedule', effort: '4-6 weeks' },
        { title: 'Voice Trading Journal', description: 'Speak trades, AI logs and analyzes patterns', effort: '3-4 weeks' },
      ],
      todaysTasks: [
        { task: 'Review Sunday Squares final QA', priority: 'high', source: 'Milo' },
        { task: 'Check Morning Brief deployment', priority: 'high', source: 'System' },
        { task: 'Weekly family calendar sync', priority: 'medium', source: 'Personal' },
      ],
      agentRecommendations: [
        { task: 'Deploy Morning Brief to production', agent: 'Anders', reason: 'Feature complete, ready for launch' },
        { task: 'Set up morning cron job', agent: 'Milo', reason: 'Automate daily brief delivery to Telegram' },
      ],
      overnightActivity: [
        { agent: 'Paula', action: 'Built Morning Brief newspaper layout', time: '6:15 PM' },
        { agent: 'System', action: 'Weather API integration complete', time: '6:17 PM' },
      ],
      quote
    }
  };

  return NextResponse.json(brief);
}
