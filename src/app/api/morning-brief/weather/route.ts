import { NextResponse } from 'next/server';

// Open-Meteo API - Free, no key needed
// Nashua, NH: 42.7654, -71.4676
const LAT = 42.7654;
const LON = -71.4676;

function weatherCodeToCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Light Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Slight Hail',
    99: 'Thunderstorm with Heavy Hail',
  };
  return conditions[code] || 'Unknown';
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return '\u2600\uFE0F';
  if (code <= 2) return '\u26C5';
  if (code === 3) return '\u2601\uFE0F';
  if (code <= 48) return '\uD83C\uDF2B\uFE0F';
  if (code <= 55) return '\uD83C\uDF27\uFE0F';
  if (code <= 65) return '\uD83C\uDF27\uFE0F';
  if (code <= 67) return '\uD83C\uDF28\uFE0F';
  if (code <= 77) return '\u2744\uFE0F';
  if (code <= 82) return '\uD83C\uDF27\uFE0F';
  if (code <= 86) return '\u2744\uFE0F';
  return '\u26C8\uFE0F';
}

export async function GET() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=7`;

    const res = await fetch(url, { next: { revalidate: 900 } }); // 15min cache
    if (!res.ok) throw new Error('Weather API failed');
    
    const data = await res.json();
    
    const current = {
      temp: data.current.temperature_2m,
      condition: weatherCodeToCondition(data.current.weather_code),
      emoji: weatherCodeToEmoji(data.current.weather_code),
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = data.daily.time.map((date: string, i: number) => {
      const d = new Date(date + 'T12:00:00');
      return {
        day: i === 0 ? 'Today' : days[d.getDay()],
        date: date,
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        condition: weatherCodeToCondition(data.daily.weather_code[i]),
        emoji: weatherCodeToEmoji(data.daily.weather_code[i]),
      };
    });

    return NextResponse.json({ current, forecast, location: 'Nashua, NH' });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      current: { temp: 32, condition: 'Partly Cloudy', emoji: '\u26C5', windSpeed: 8, humidity: 45 },
      forecast: [
        { day: 'Today', high: 35, low: 22, condition: 'Partly Cloudy', emoji: '\u26C5' },
        { day: 'Thu', high: 38, low: 25, condition: 'Cloudy', emoji: '\u2601\uFE0F' },
        { day: 'Fri', high: 42, low: 28, condition: 'Clear', emoji: '\u2600\uFE0F' },
        { day: 'Sat', high: 40, low: 30, condition: 'Snow', emoji: '\u2744\uFE0F' },
        { day: 'Sun', high: 36, low: 24, condition: 'Clear', emoji: '\u2600\uFE0F' },
      ],
      location: 'Nashua, NH',
      fallback: true,
    });
  }
}
