import { NextResponse } from 'next/server';

// NOAA Weather API - Free, no key needed
// Nashua, NH: 42.7654°N, 71.4676°W
// Grid: GYX (Gray/Portland ME forecast office) 40,10
// Nearest observation station: KASH (Boire Field, Nashua NH)
const NOAA_FORECAST_URL = 'https://api.weather.gov/gridpoints/GYX/40,10/forecast';
const NOAA_OBSERVATIONS_URL = 'https://api.weather.gov/stations/KASH/observations/latest';
const USER_AGENT = '(dbtech45.com, derek@dbtech45.com)';

// Open-Meteo fallback
const LAT = 42.7654;
const LON = -71.4676;

function noaaIconToEmoji(icon: string, shortForecast: string): string {
  const lower = shortForecast.toLowerCase();
  if (lower.includes('snow')) return '\u2744\uFE0F';
  if (lower.includes('thunder')) return '\u26C8\uFE0F';
  if (lower.includes('rain') || lower.includes('shower')) return '\uD83C\uDF27\uFE0F';
  if (lower.includes('fog')) return '\uD83C\uDF2B\uFE0F';
  if (lower.includes('cloud') || lower.includes('overcast')) return '\u2601\uFE0F';
  if (lower.includes('partly')) return '\u26C5';
  if (lower.includes('sunny') || lower.includes('clear')) return '\u2600\uFE0F';
  if (lower.includes('wind')) return '\uD83C\uDF2C\uFE0F';
  return '\u26C5';
}

function weatherCodeToCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing Rime Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
    80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
    85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with Slight Hail', 99: 'Thunderstorm with Heavy Hail',
  };
  return conditions[code] || 'Unknown';
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return '\u2600\uFE0F';
  if (code <= 2) return '\u26C5';
  if (code === 3) return '\u2601\uFE0F';
  if (code <= 48) return '\uD83C\uDF2B\uFE0F';
  if (code <= 67) return '\uD83C\uDF27\uFE0F';
  if (code <= 77) return '\u2744\uFE0F';
  if (code <= 82) return '\uD83C\uDF27\uFE0F';
  if (code <= 86) return '\u2744\uFE0F';
  return '\u26C8\uFE0F';
}

async function fetchCurrentObservation(): Promise<{ temp: number; condition: string; emoji: string; windSpeed: number; windDirection: string; humidity: number | null } | null> {
  try {
    const res = await fetch(NOAA_OBSERVATIONS_URL, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json' },
      next: { revalidate: 600 }, // 10min cache for current conditions
    });
    if (!res.ok) return null;
    const data = await res.json();
    const props = data.properties;
    if (!props) return null;

    // NOAA observations are in Celsius, convert to Fahrenheit
    const tempC = props.temperature?.value;
    const temp = tempC !== null && tempC !== undefined ? Math.round(tempC * 9 / 5 + 32) : null;
    if (temp === null) return null;

    const windMs = props.windSpeed?.value;
    const windMph = windMs !== null && windMs !== undefined ? Math.round(windMs * 2.237) : 0;

    const condition = props.textDescription || 'Unknown';

    return {
      temp,
      condition,
      emoji: noaaIconToEmoji('', condition),
      windSpeed: windMph,
      windDirection: props.windDirection?.value ? degreesToDirection(props.windDirection.value) : '',
      humidity: props.relativeHumidity?.value ? Math.round(props.relativeHumidity.value) : null,
    };
  } catch {
    return null;
  }
}

function degreesToDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

async function fetchNOAA() {
  // Fetch current observation + 7-day forecast in parallel
  const [observation, forecastRes] = await Promise.all([
    fetchCurrentObservation(),
    fetch(NOAA_FORECAST_URL, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json' },
      next: { revalidate: 1800 }, // 30min cache
    }),
  ]);

  if (!forecastRes.ok) throw new Error(`NOAA forecast API failed: ${forecastRes.status}`);
  const data = await forecastRes.json();

  const periods = data.properties.periods;
  if (!periods || periods.length === 0) throw new Error('No forecast periods');

  // Use real observation for current temp, fall back to forecast period
  const now = periods[0];
  const current = observation || {
    temp: now.temperature,
    condition: now.shortForecast,
    emoji: noaaIconToEmoji(now.icon, now.shortForecast),
    windSpeed: parseInt(now.windSpeed) || 0,
    windDirection: now.windDirection || '',
    humidity: now.relativeHumidity?.value || null,
  };

  // Build daily forecast - NOAA gives day/night pairs
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    emoji: string;
    precipChance: number | null;
  }> = [];

  // Group periods into days
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    if (!p.isDaytime && i === 0) {
      // If first period is tonight, add it as partial day
      forecast.push({
        day: 'Tonight',
        date: p.startTime.split('T')[0],
        high: p.temperature,
        low: p.temperature,
        condition: p.shortForecast,
        emoji: noaaIconToEmoji(p.icon, p.shortForecast),
        precipChance: p.probabilityOfPrecipitation?.value || null,
      });
    } else if (p.isDaytime) {
      const d = new Date(p.startTime);
      const nightPeriod = periods[i + 1];
      forecast.push({
        day: forecast.length === 0 ? 'Today' : days[d.getDay()],
        date: p.startTime.split('T')[0],
        high: p.temperature,
        low: nightPeriod ? nightPeriod.temperature : p.temperature - 10,
        condition: p.shortForecast,
        emoji: noaaIconToEmoji(p.icon, p.shortForecast),
        precipChance: p.probabilityOfPrecipitation?.value || null,
      });
    }
  }

  return { current, forecast: forecast.slice(0, 7), location: 'Nashua, NH', source: 'NOAA' };
}

async function fetchOpenMeteoFallback() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=7`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error('Open-Meteo failed');
  const data = await res.json();

  const current = {
    temp: data.current.temperature_2m,
    condition: weatherCodeToCondition(data.current.weather_code),
    emoji: weatherCodeToEmoji(data.current.weather_code),
    windSpeed: data.current.wind_speed_10m,
    humidity: data.current.relative_humidity_2m,
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const forecast = data.daily.time.map((date: string, i: number) => {
    const d = new Date(date + 'T12:00:00');
    return {
      day: i === 0 ? 'Today' : dayNames[d.getDay()],
      date,
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      condition: weatherCodeToCondition(data.daily.weather_code[i]),
      emoji: weatherCodeToEmoji(data.daily.weather_code[i]),
    };
  });

  return { current, forecast, location: 'Nashua, NH', source: 'Open-Meteo', fallback: true };
}

export async function GET() {
  try {
    // Try NOAA first (preferred, per Paula's spec)
    return NextResponse.json(await fetchNOAA());
  } catch (noaaError) {
    console.error('NOAA API error, falling back to Open-Meteo:', noaaError);
    try {
      // Fallback to Open-Meteo
      return NextResponse.json(await fetchOpenMeteoFallback());
    } catch (fallbackError) {
      console.error('All weather APIs failed:', fallbackError);
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
        source: 'fallback',
        fallback: true,
      });
    }
  }
}
