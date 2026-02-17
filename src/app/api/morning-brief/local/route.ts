import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL API — Nashua NH news via Brave Search + Weather
// ═══════════════════════════════════════════════════════════════════════════

interface LocalStory {
  title: string;
  url: string;
  source: string;
  description: string;
  time: string;
}

interface WeatherDetail {
  current: { temp: number; condition: string };
  forecast: Array<{ day: string; high: number; low: number; emoji?: string }>;
}

// ─── Brave Search for Nashua News ───────────────────────────────────────
async function searchLocalNews(): Promise<LocalStory[]> {
  const key = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return getPlaceholderNews();

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=Nashua+NH+news&count=10&freshness=pw`,
      {
        headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': key },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return getPlaceholderNews();
    const data = await res.json();
    return (data.web?.results ?? []).slice(0, 8).map((r: { title: string; url: string; description: string }) => {
      const domain = new URL(r.url).hostname.replace('www.', '');
      return {
        title: r.title,
        url: r.url,
        source: domain,
        description: r.description || '',
        time: 'This week',
      };
    });
  } catch (e) {
    console.error('Brave local search failed:', e);
    return getPlaceholderNews();
  }
}

function getPlaceholderNews(): LocalStory[] {
  return [
    { title: 'Visit local news sources for the latest Nashua, NH coverage', url: '#', source: 'Nashua Telegraph', description: 'Stay informed about your community.', time: '' },
  ];
}

// ─── Weather Detail ─────────────────────────────────────────────────────
async function getWeatherDetail(): Promise<WeatherDetail> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=42.7654&longitude=-71.4676&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=America/New_York&forecast_days=5',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Weather ${res.status}`);
    const data = await res.json();
    const wmo: Record<number, string> = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
      80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers', 95: 'Thunderstorm',
    };
    const snowCodes = [71, 73, 75];
    const rainCodes = [61, 63, 65, 80, 81, 82];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const forecast = (data.daily?.time ?? []).slice(0, 5).map((t: string, i: number) => {
      const d = new Date(t + 'T12:00:00');
      const label = i === 0 ? 'Today' : days[d.getDay()];
      const code = data.daily?.weather_code?.[i] ?? 0;
      let emoji = '';
      if (snowCodes.includes(code)) emoji = ' ❄️';
      else if (rainCodes.includes(code)) emoji = ' 🌧';
      return {
        day: label,
        high: Math.round(data.daily?.temperature_2m_max?.[i] ?? 0),
        low: Math.round(data.daily?.temperature_2m_min?.[i] ?? 0),
        emoji,
      };
    });

    return {
      current: {
        temp: Math.round(data.current?.temperature_2m ?? 0),
        condition: wmo[data.current?.weather_code] ?? 'Unknown',
      },
      forecast,
    };
  } catch (e) {
    console.error('Weather detail failed:', e);
    return { current: { temp: 0, condition: 'Unavailable' }, forecast: [] };
  }
}

export async function GET() {
  const [stories, weather] = await Promise.all([
    searchLocalNews(),
    getWeatherDetail(),
  ]);

  return NextResponse.json({
    stories,
    weather,
    generated_at: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60' },
  });
}
