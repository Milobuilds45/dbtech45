import { NextRequest, NextResponse } from 'next/server';

// Massive API proxy — keeps API key server-side
const API_BASE = 'https://api.massive.com';
const API_KEY = process.env.MASSIVE_API_KEY || '';

// Response cache: 30 second TTL
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30_000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

async function massiveFetch(path: string) {
  const cacheKey = path;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Massive API ${res.status}: ${text}`);
  }

  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

// GET /api/market-data?action=snapshots&tickers=SPY,QQQ,NVDA
// GET /api/market-data?action=options-chain&ticker=NVDA&expDate=2026-02-20
// GET /api/market-data?action=zero-dte&tickers=SPY,QQQ,NVDA
// GET /api/market-data?action=bars&ticker=NVDA
// GET /api/market-data?action=sectors
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!API_KEY) {
    return NextResponse.json({ error: 'MASSIVE_API_KEY not configured', mock: true }, { status: 200 });
  }

  try {
    switch (action) {
      case 'snapshots': {
        const tickers = (searchParams.get('tickers') || 'SPY,QQQ,NVDA').split(',');
        const results = await Promise.allSettled(
          tickers.map(t => massiveFetch(`/v3/snapshot/ticker/${encodeURIComponent(t)}`))
        );
        const snapshots: Record<string, unknown> = {};
        tickers.forEach((t, i) => {
          const r = results[i];
          snapshots[t] = r.status === 'fulfilled' ? r.value : null;
        });
        return NextResponse.json({ snapshots, timestamp: new Date().toISOString() });
      }

      case 'options-chain': {
        const ticker = searchParams.get('ticker') || 'SPY';
        const expDate = searchParams.get('expDate');
        const limit = searchParams.get('limit') || '100';
        let path = `/v3/snapshot/options/${encodeURIComponent(ticker)}?limit=${limit}`;
        if (expDate) {
          path += `&expiration_date=${expDate}`;
        } else {
          const today = new Date().toISOString().split('T')[0];
          path += `&expiration_date.gte=${today}`;
        }
        const data = await massiveFetch(path);
        return NextResponse.json({ chain: data, ticker, timestamp: new Date().toISOString() });
      }

      case 'zero-dte': {
        const tickers = (searchParams.get('tickers') || 'SPY,QQQ,NVDA').split(',');
        const today = new Date().toISOString().split('T')[0];
        const results = await Promise.allSettled(
          tickers.map(t => massiveFetch(`/v3/snapshot/options/${encodeURIComponent(t)}?expiration_date=${today}&limit=100`))
        );
        const zeroDte: Record<string, unknown> = {};
        tickers.forEach((t, i) => {
          const r = results[i];
          zeroDte[t] = r.status === 'fulfilled' ? r.value : null;
        });
        return NextResponse.json({ zeroDte, timestamp: new Date().toISOString() });
      }

      case 'bars': {
        const ticker = searchParams.get('ticker') || 'SPY';
        const today = new Date().toISOString().split('T')[0];
        const data = await massiveFetch(`/v3/aggs/ticker/${encodeURIComponent(ticker)}/range/5/minute/${today}/${today}`);
        return NextResponse.json({ bars: data, ticker, timestamp: new Date().toISOString() });
      }

      case 'sectors': {
        const sectorETFs = ['XLK','XLF','XLE','XLV','XLI','XLC','XLY','XLP','XLB','XLRE','XLU','SMH'];
        const results = await Promise.allSettled(
          sectorETFs.map(t => massiveFetch(`/v3/snapshot/ticker/${encodeURIComponent(t)}`))
        );
        const sectors: Record<string, unknown> = {};
        sectorETFs.forEach((t, i) => {
          const r = results[i];
          sectors[t] = r.status === 'fulfilled' ? r.value : null;
        });
        return NextResponse.json({ sectors, timestamp: new Date().toISOString() });
      }

      default:
        return NextResponse.json({ error: 'Unknown action. Use: snapshots, options-chain, zero-dte, bars, sectors' }, { status: 400 });
    }
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json({ error: (error as Error).message, mock: true }, { status: 200 });
  }
}
