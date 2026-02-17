import { NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════════════════
   Economic Calendar API — Fetches macro events from Trading Economics
   ═══════════════════════════════════════════════════════════════════════════ */

interface CacheEntry { data: unknown; ts: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 300_000; // 5 min cache

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key: string, data: unknown) { cache.set(key, { data, ts: Date.now() }); }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  name: string;
  impact: 'high' | 'medium' | 'low';
  previous: string | null;
  forecast: string | null;
  actual: string | null;
  surprise: 'beat' | 'miss' | 'inline' | null;
  country: string;
}

/* Try multiple sources */
async function fetchFromTradingEconomics(): Promise<EconomicEvent[]> {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    const from = weekStart.toISOString().split('T')[0];
    const to = weekEnd.toISOString().split('T')[0];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://tradingeconomics.com/calendar?f=${from}&e=${to}`,
      { signal: controller.signal, headers: { 'User-Agent': UA, 'Accept': 'text/html' }, cache: 'no-store' }
    );
    clearTimeout(timeout);

    if (!res.ok) return [];

    const html = await res.text();
    // Parse HTML for calendar data
    const events: EconomicEvent[] = [];
    // Look for embedded JSON data
    const jsonMatch = html.match(/var\s+calendar\s*=\s*(\[[\s\S]*?\]);/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        for (const item of parsed) {
          events.push({
            id: item.CalendarId || String(Math.random()),
            date: item.Date || '',
            time: item.Time || '',
            name: item.Event || item.Category || '',
            impact: categorizeImpact(item.Event || item.Category || '', item.Importance),
            previous: item.Previous != null ? String(item.Previous) : null,
            forecast: item.Forecast != null ? String(item.Forecast) : null,
            actual: item.Actual != null ? String(item.Actual) : null,
            surprise: item.Actual != null && item.Forecast != null
              ? Number(item.Actual) > Number(item.Forecast) ? 'beat'
                : Number(item.Actual) < Number(item.Forecast) ? 'miss' : 'inline'
              : null,
            country: item.Country || 'US',
          });
        }
      } catch {}
    }
    return events;
  } catch { return []; }
}

/* Fallback: generate known recurring US economic events */
function generateKnownEvents(): EconomicEvent[] {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);

  const events: EconomicEvent[] = [];
  const knownEvents: Array<{
    name: string;
    dayOfWeek: number;
    time: string;
    impact: 'high' | 'medium' | 'low';
    recurring: 'weekly' | 'monthly';
  }> = [
    { name: 'Initial Jobless Claims', dayOfWeek: 4, time: '8:30 ET', impact: 'medium', recurring: 'weekly' },
    { name: 'Continuing Claims', dayOfWeek: 4, time: '8:30 ET', impact: 'low', recurring: 'weekly' },
    { name: 'EIA Crude Oil Inventories', dayOfWeek: 3, time: '10:30 ET', impact: 'medium', recurring: 'weekly' },
    { name: 'MBA Mortgage Applications', dayOfWeek: 3, time: '7:00 ET', impact: 'low', recurring: 'weekly' },
    { name: 'Consumer Sentiment (UMich)', dayOfWeek: 5, time: '10:00 ET', impact: 'medium', recurring: 'monthly' },
  ];

  // High-impact monthly events (check approximate schedule)
  const day = now.getDate();
  const month = now.getMonth();

  // CPI usually around 10th-14th
  if (day >= 8 && day <= 16) {
    const cpiDay = new Date(now.getFullYear(), month, 13);
    if (cpiDay >= weekStart && cpiDay <= new Date(weekStart.getTime() + 6 * 86400000)) {
      events.push({
        id: `cpi-${month}`, date: cpiDay.toISOString().split('T')[0],
        time: '8:30 ET', name: 'CPI (Consumer Price Index)', impact: 'high',
        previous: null, forecast: null, actual: null, surprise: null, country: 'US'
      });
    }
  }
  // NFP first Friday
  if (day <= 8) {
    const firstFriday = new Date(now.getFullYear(), month, 1);
    while (firstFriday.getDay() !== 5) firstFriday.setDate(firstFriday.getDate() + 1);
    if (firstFriday >= weekStart && firstFriday <= new Date(weekStart.getTime() + 6 * 86400000)) {
      events.push({
        id: `nfp-${month}`, date: firstFriday.toISOString().split('T')[0],
        time: '8:30 ET', name: 'Non-Farm Payrolls', impact: 'high',
        previous: null, forecast: null, actual: null, surprise: null, country: 'US'
      });
    }
  }

  // Add weekly recurring events
  for (const evt of knownEvents) {
    const evtDate = new Date(weekStart);
    evtDate.setDate(weekStart.getDate() + (evt.dayOfWeek - 1));
    events.push({
      id: `${evt.name.replace(/\s/g, '-').toLowerCase()}-${evtDate.toISOString().split('T')[0]}`,
      date: evtDate.toISOString().split('T')[0],
      time: evt.time,
      name: evt.name,
      impact: evt.impact,
      previous: null, forecast: null, actual: null, surprise: null, country: 'US'
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function categorizeImpact(name: string, importance?: number): 'high' | 'medium' | 'low' {
  if (importance === 3) return 'high';
  if (importance === 2) return 'medium';
  if (importance === 1) return 'low';
  const high = ['CPI', 'NFP', 'FOMC', 'Fed', 'GDP', 'PCE', 'Non-Farm', 'Interest Rate', 'Inflation'];
  const med = ['Jobless', 'Retail', 'PMI', 'ISM', 'PPI', 'Housing', 'Consumer', 'Employment', 'Durable'];
  const n = name.toUpperCase();
  if (high.some(h => n.includes(h.toUpperCase()))) return 'high';
  if (med.some(m => n.includes(m.toUpperCase()))) return 'medium';
  return 'low';
}

export async function GET() {
  try {
    const cacheKey = 'econ-cal';
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Try real source first
    let events = await fetchFromTradingEconomics();

    // Fallback to known events
    if (events.length === 0) {
      events = generateKnownEvents();
    }

    // Filter to US events primarily
    const usEvents = events.filter(e => e.country === 'US' || !e.country);
    const finalEvents = usEvents.length > 0 ? usEvents : events;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const result = {
      events: finalEvents.slice(0, 20),
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Economic calendar error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar', events: [] }, { status: 500 });
  }
}
