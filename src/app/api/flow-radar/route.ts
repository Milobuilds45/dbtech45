import { NextResponse } from 'next/server';

const API_BASE = 'https://api.massive.com';
const API_KEY = process.env.MASSIVE_API_KEY || '';
const CACHE_TTL = 60_000;
const cache = new Map<string, { data: unknown; ts: number }>();

function getCached(key: string): unknown | null {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < CACHE_TTL) return e.data;
  return null;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

async function massiveFetch(path: string) {
  const cached = getCached(path);
  if (cached) return cached;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Massive API ${res.status}`);
  const data = await res.json();
  setCache(path, data);
  return data;
}

export interface FlowItem {
  id: string;
  ticker: string;
  contractType: 'CALL' | 'PUT';
  strike: number;
  expiry: string;
  premium: number;
  volume: number;
  openInterest: number;
  volOiRatio: number;
  sentiment: 'bullish' | 'bearish';
  translation: string;
  timestamp: string;
  daysToExpiry: number;
  isDemo?: boolean;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function buildTranslation(item: Omit<FlowItem, 'translation'>): string {
  const premStr =
    item.premium >= 1_000_000
      ? `$${(item.premium / 1_000_000).toFixed(1)}M`
      : `$${(item.premium / 1_000).toFixed(0)}K`;
  const direction = item.sentiment === 'bullish' ? 'up' : 'down';
  const type = item.contractType === 'CALL' ? 'calls' : 'puts';
  const exDate = new Date(item.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `Someone just dropped ${premStr} on ${item.ticker} $${item.strike} ${type} expiring ${exDate} — that's a bet the stock goes ${direction} in ${item.daysToExpiry} days.`;
}

const FLOW_TICKERS = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'META', 'AMZN', 'MSFT', 'AMD', 'PLTR'];
const MIN_VOL_OI = 3.0;
const MIN_PREMIUM = 50_000;

async function fetchLiveFlow(): Promise<FlowItem[]> {
  const results: FlowItem[] = [];
  const now = new Date().toISOString().split('T')[0];

  await Promise.allSettled(
    FLOW_TICKERS.map(async (ticker) => {
      try {
        const data = await massiveFetch(
          `/v3/snapshot/options/${encodeURIComponent(ticker)}?limit=200&expiration_date.gte=${now}&sort=day.volume&order=desc`
        ) as { results?: unknown[] };

        if (!data?.results) return;

        for (const contract of data.results as Record<string, unknown>[]) {
          const details = contract.details as Record<string, unknown> | undefined;
          const day = contract.day as Record<string, unknown> | undefined;
          const lastTrade = contract.last_trade as Record<string, unknown> | undefined;

          if (!details || !day) continue;

          const volume = (day.volume as number) ?? 0;
          const oi = (contract.open_interest as number) ?? 0;
          if (volume < 100 || oi < 10) continue;

          const ratio = oi > 0 ? volume / oi : 0;
          if (ratio < MIN_VOL_OI) continue;

          const contractType = String(details.contract_type ?? '').toUpperCase() as 'CALL' | 'PUT';
          if (contractType !== 'CALL' && contractType !== 'PUT') continue;

          const strike = (details.strike_price as number) ?? 0;
          const expiry = String(details.expiration_date ?? '');
          const price = (lastTrade?.price as number) ?? (day.close as number) ?? 0;
          const sharesPerContract = (details.shares_per_contract as number) ?? 100;
          const premium = price * sharesPerContract * volume;

          if (premium < MIN_PREMIUM) continue;

          const days = daysUntil(expiry);
          const sentiment: 'bullish' | 'bearish' = contractType === 'CALL' ? 'bullish' : 'bearish';

          const partial: Omit<FlowItem, 'translation'> = {
            id: String(details.ticker ?? `${ticker}-${strike}-${expiry}`),
            ticker,
            contractType,
            strike,
            expiry,
            premium,
            volume,
            openInterest: oi,
            volOiRatio: Math.round(ratio * 100) / 100,
            sentiment,
            timestamp: new Date().toISOString(),
            daysToExpiry: days,
          };

          results.push({ ...partial, translation: buildTranslation(partial) });
        }
      } catch (e) {
        console.error(`Flow fetch error for ${ticker}:`, e);
      }
    })
  );

  return results.sort((a, b) => b.premium - a.premium).slice(0, 50);
}

// Deterministic-ish mock data anchored to request time
function getMockFlow(): FlowItem[] {
  const now = Date.now();
  const baseTs = (offset: number) => new Date(now - offset * 60000).toISOString();

  const entries: Omit<FlowItem, 'translation'>[] = [
    { id: 'mock-1', ticker: 'NVDA', contractType: 'CALL', strike: 160, expiry: '2026-04-17', premium: 4_250_000, volume: 15_420, openInterest: 3_200, volOiRatio: 4.82, sentiment: 'bullish', timestamp: baseTs(2), daysToExpiry: 33, isDemo: true },
    { id: 'mock-2', ticker: 'SPY', contractType: 'PUT', strike: 550, expiry: '2026-03-21', premium: 2_100_000, volume: 28_500, openInterest: 8_100, volOiRatio: 3.52, sentiment: 'bearish', timestamp: baseTs(5), daysToExpiry: 6, isDemo: true },
    { id: 'mock-3', ticker: 'AAPL', contractType: 'CALL', strike: 240, expiry: '2026-05-15', premium: 1_800_000, volume: 9_200, openInterest: 2_400, volOiRatio: 3.83, sentiment: 'bullish', timestamp: baseTs(8), daysToExpiry: 61, isDemo: true },
    { id: 'mock-4', ticker: 'TSLA', contractType: 'CALL', strike: 350, expiry: '2026-04-24', premium: 3_400_000, volume: 22_100, openInterest: 5_800, volOiRatio: 3.81, sentiment: 'bullish', timestamp: baseTs(12), daysToExpiry: 40, isDemo: true },
    { id: 'mock-5', ticker: 'META', contractType: 'CALL', strike: 700, expiry: '2026-05-01', premium: 1_560_000, volume: 6_800, openInterest: 1_700, volOiRatio: 4.0, sentiment: 'bullish', timestamp: baseTs(15), daysToExpiry: 47, isDemo: true },
    { id: 'mock-6', ticker: 'QQQ', contractType: 'PUT', strike: 470, expiry: '2026-03-28', premium: 2_900_000, volume: 31_000, openInterest: 9_200, volOiRatio: 3.37, sentiment: 'bearish', timestamp: baseTs(18), daysToExpiry: 13, isDemo: true },
    { id: 'mock-7', ticker: 'AMD', contractType: 'CALL', strike: 130, expiry: '2026-04-17', premium: 780_000, volume: 12_400, openInterest: 3_100, volOiRatio: 4.0, sentiment: 'bullish', timestamp: baseTs(22), daysToExpiry: 33, isDemo: true },
    { id: 'mock-8', ticker: 'AMZN', contractType: 'CALL', strike: 230, expiry: '2026-05-15', premium: 2_200_000, volume: 8_900, openInterest: 2_300, volOiRatio: 3.87, sentiment: 'bullish', timestamp: baseTs(25), daysToExpiry: 61, isDemo: true },
    { id: 'mock-9', ticker: 'MSFT', contractType: 'PUT', strike: 400, expiry: '2026-04-03', premium: 1_100_000, volume: 7_600, openInterest: 2_100, volOiRatio: 3.62, sentiment: 'bearish', timestamp: baseTs(30), daysToExpiry: 19, isDemo: true },
    { id: 'mock-10', ticker: 'PLTR', contractType: 'CALL', strike: 45, expiry: '2026-04-17', premium: 540_000, volume: 18_700, openInterest: 5_200, volOiRatio: 3.6, sentiment: 'bullish', timestamp: baseTs(33), daysToExpiry: 33, isDemo: true },
    { id: 'mock-11', ticker: 'NVDA', contractType: 'PUT', strike: 120, expiry: '2026-03-21', premium: 890_000, volume: 11_200, openInterest: 2_800, volOiRatio: 4.0, sentiment: 'bearish', timestamp: baseTs(38), daysToExpiry: 6, isDemo: true },
    { id: 'mock-12', ticker: 'SPY', contractType: 'CALL', strike: 590, expiry: '2026-04-17', premium: 3_600_000, volume: 42_000, openInterest: 11_200, volOiRatio: 3.75, sentiment: 'bullish', timestamp: baseTs(42), daysToExpiry: 33, isDemo: true },
    { id: 'mock-13', ticker: 'TSLA', contractType: 'PUT', strike: 250, expiry: '2026-04-03', premium: 1_750_000, volume: 16_800, openInterest: 4_600, volOiRatio: 3.65, sentiment: 'bearish', timestamp: baseTs(47), daysToExpiry: 19, isDemo: true },
    { id: 'mock-14', ticker: 'AAPL', contractType: 'PUT', strike: 200, expiry: '2026-03-28', premium: 670_000, volume: 9_400, openInterest: 2_700, volOiRatio: 3.48, sentiment: 'bearish', timestamp: baseTs(52), daysToExpiry: 13, isDemo: true },
    { id: 'mock-15', ticker: 'META', contractType: 'PUT', strike: 580, expiry: '2026-04-24', premium: 1_230_000, volume: 7_100, openInterest: 1_900, volOiRatio: 3.74, sentiment: 'bearish', timestamp: baseTs(55), daysToExpiry: 40, isDemo: true },
    { id: 'mock-16', ticker: 'AMD', contractType: 'PUT', strike: 100, expiry: '2026-03-21', premium: 430_000, volume: 8_800, openInterest: 2_500, volOiRatio: 3.52, sentiment: 'bearish', timestamp: baseTs(60), daysToExpiry: 6, isDemo: true },
    { id: 'mock-17', ticker: 'MSFT', contractType: 'CALL', strike: 450, expiry: '2026-05-15', premium: 1_980_000, volume: 6_500, openInterest: 1_600, volOiRatio: 4.06, sentiment: 'bullish', timestamp: baseTs(65), daysToExpiry: 61, isDemo: true },
    { id: 'mock-18', ticker: 'AMZN', contractType: 'PUT', strike: 190, expiry: '2026-04-03', premium: 920_000, volume: 10_200, openInterest: 2_800, volOiRatio: 3.64, sentiment: 'bearish', timestamp: baseTs(70), daysToExpiry: 19, isDemo: true },
    { id: 'mock-19', ticker: 'QQQ', contractType: 'CALL', strike: 510, expiry: '2026-05-01', premium: 2_450_000, volume: 19_800, openInterest: 5_400, volOiRatio: 3.67, sentiment: 'bullish', timestamp: baseTs(75), daysToExpiry: 47, isDemo: true },
    { id: 'mock-20', ticker: 'PLTR', contractType: 'PUT', strike: 35, expiry: '2026-04-17', premium: 310_000, volume: 14_500, openInterest: 4_100, volOiRatio: 3.54, sentiment: 'bearish', timestamp: baseTs(80), daysToExpiry: 33, isDemo: true },
  ];

  return entries.map(e => ({ ...e, translation: buildTranslation(e) }));
}

export async function GET() {
  let flows: FlowItem[] = [];
  let source: 'live' | 'demo' = 'demo';

  if (API_KEY) {
    try {
      flows = await fetchLiveFlow();
      if (flows.length > 0) source = 'live';
    } catch (e) {
      console.error('Flow radar live fetch failed:', e);
    }
  }

  if (flows.length === 0) {
    flows = getMockFlow();
    source = 'demo';
  }

  return NextResponse.json({
    flows,
    source,
    timestamp: new Date().toISOString(),
    count: flows.length,
  });
}
