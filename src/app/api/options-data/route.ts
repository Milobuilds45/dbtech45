import { NextResponse } from 'next/server';

/* ─── Types ─── */
interface OptionContract {
  strike: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

interface ChainResponse {
  symbol: string;
  expDate: string;
  currentPrice: number;
  calls: OptionContract[];
  puts: OptionContract[];
}

interface ZeroDTEContract {
  symbol: string;
  strike: number;
  type: 'CALL' | 'PUT';
  expiry: string;
  last: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

/* ─── Env ─── */
const MASSIVE_BASE = process.env.MASSIVE_BASE_URL || '';
const MASSIVE_KEY = process.env.MASSIVE_API_KEY || '';

/* ─── Mock generators ─── */
function mockChain(symbol: string): ChainResponse {
  const basePrice = symbol === 'QQQ' ? 510 : symbol === 'NVDA' ? 138 : 693;
  const startStrike = Math.round(basePrice) - 5;
  const today = new Date().toISOString().split('T')[0];

  return {
    symbol,
    expDate: today,
    currentPrice: basePrice,
    calls: Array.from({ length: 10 }, (_, i) => {
      const strike = startStrike + i;
      return {
        strike,
        bid: Math.max(0.01, +(basePrice - strike - 0.5 + Math.random()).toFixed(2)),
        ask: Math.max(0.05, +(basePrice - strike + 0.5 + Math.random()).toFixed(2)),
        last: Math.max(0.01, +(basePrice - strike + (Math.random() - 0.5)).toFixed(2)),
        volume: Math.floor(Math.random() * 50000) + 1000,
        openInterest: Math.floor(Math.random() * 100000) + 5000,
        impliedVolatility: +(0.15 + Math.random() * 0.15).toFixed(4),
        delta: +Math.max(0, Math.min(1, 0.5 - (strike - basePrice) * 0.05)).toFixed(3),
        gamma: +(0.01 + Math.random() * 0.03).toFixed(4),
        theta: +(-0.05 - Math.random() * 0.15).toFixed(4),
        vega: +(0.1 + Math.random() * 0.2).toFixed(4),
      };
    }),
    puts: Array.from({ length: 10 }, (_, i) => {
      const strike = startStrike + i;
      return {
        strike,
        bid: Math.max(0.01, +(strike - basePrice - 0.3 + Math.random()).toFixed(2)),
        ask: Math.max(0.05, +(strike - basePrice + 0.3 + Math.random()).toFixed(2)),
        last: Math.max(0.01, +(strike - basePrice + (Math.random() - 0.5)).toFixed(2)),
        volume: Math.floor(Math.random() * 30000) + 500,
        openInterest: Math.floor(Math.random() * 80000) + 3000,
        impliedVolatility: +(0.15 + Math.random() * 0.15).toFixed(4),
        delta: +(-Math.max(0, Math.min(1, 0.5 + (strike - basePrice) * 0.05))).toFixed(3),
        gamma: +(0.01 + Math.random() * 0.03).toFixed(4),
        theta: +(-0.05 - Math.random() * 0.15).toFixed(4),
        vega: +(0.1 + Math.random() * 0.2).toFixed(4),
      };
    }),
  };
}

function mockZeroDTE(): ZeroDTEContract[] {
  const today = new Date().toISOString().split('T')[0];
  const symbols = [
    { sym: 'SPY', base: 693 },
    { sym: 'QQQ', base: 510 },
    { sym: 'NVDA', base: 138 },
  ];
  const contracts: ZeroDTEContract[] = [];

  for (const { sym, base } of symbols) {
    for (let i = 0; i < 8; i++) {
      const strike = base + (i - 4) * (sym === 'NVDA' ? 1 : 2);
      const type: 'CALL' | 'PUT' = i % 2 === 0 ? 'CALL' : 'PUT';
      const vol = Math.floor(Math.random() * 80000) + 2000;
      const oi = Math.floor(Math.random() * 40000) + 500;
      contracts.push({
        symbol: sym,
        strike,
        type,
        expiry: today,
        last: Math.max(0.01, +(Math.abs(base - strike) + (Math.random() - 0.5) * 2).toFixed(2)),
        bid: Math.max(0.01, +(Math.abs(base - strike) - 0.3 + Math.random()).toFixed(2)),
        ask: Math.max(0.05, +(Math.abs(base - strike) + 0.3 + Math.random()).toFixed(2)),
        volume: vol,
        openInterest: oi,
        impliedVolatility: +(0.18 + Math.random() * 0.25).toFixed(4),
      });
    }
  }

  return contracts.sort((a, b) => b.volume - a.volume).slice(0, 20);
}

/* ─── Fetchers ─── */

async function fetchMassiveChain(symbol: string): Promise<ChainResponse | null> {
  if (!MASSIVE_BASE || !MASSIVE_KEY) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${MASSIVE_BASE}/v1/options/chain/${encodeURIComponent(symbol)}`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${MASSIVE_KEY}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    // Normalize Massive response to our ChainResponse format
    const currentPrice: number = data.underlyingPrice ?? data.currentPrice ?? 0;
    const expDate: string = data.expirationDate ?? new Date().toISOString().split('T')[0];

    const mapContract = (c: Record<string, unknown>): OptionContract => ({
      strike: (c.strike as number) ?? 0,
      bid: (c.bid as number) ?? 0,
      ask: (c.ask as number) ?? 0,
      last: (c.lastPrice as number) ?? (c.last as number) ?? 0,
      volume: (c.volume as number) ?? 0,
      openInterest: (c.openInterest as number) ?? 0,
      impliedVolatility: (c.impliedVolatility as number) ?? (c.iv as number) ?? 0,
      delta: (c.delta as number) ?? 0,
      gamma: (c.gamma as number) ?? 0,
      theta: (c.theta as number) ?? 0,
      vega: (c.vega as number) ?? 0,
    });

    const allCalls: OptionContract[] = (data.calls ?? []).map(mapContract);
    const allPuts: OptionContract[] = (data.puts ?? []).map(mapContract);

    // Filter to nearest 10 strikes above/below current price
    const filterStrikes = (opts: OptionContract[]) => {
      const sorted = [...opts].sort((a, b) => a.strike - b.strike);
      const atmIdx = sorted.findIndex(o => o.strike >= currentPrice);
      const start = Math.max(0, atmIdx - 10);
      const end = Math.min(sorted.length, atmIdx + 10);
      return sorted.slice(start, end);
    };

    return {
      symbol,
      expDate,
      currentPrice,
      calls: filterStrikes(allCalls),
      puts: filterStrikes(allPuts),
    };
  } catch {
    return null;
  }
}

async function fetchYahooOptions(symbol: string): Promise<ChainResponse | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(symbol)}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.optionChain?.result?.[0];
    if (!result) return null;

    const currentPrice = result.quote?.regularMarketPrice ?? 0;
    const expDate = result.expirationDates?.[0]
      ? new Date(result.expirationDates[0] * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const mapYahoo = (c: Record<string, unknown>): OptionContract => ({
      strike: (c.strike as number) ?? 0,
      bid: ((c.bid as Record<string, unknown>)?.raw as number) ?? (c.bid as number) ?? 0,
      ask: ((c.ask as Record<string, unknown>)?.raw as number) ?? (c.ask as number) ?? 0,
      last: ((c.lastPrice as Record<string, unknown>)?.raw as number) ?? (c.lastPrice as number) ?? 0,
      volume: ((c.volume as Record<string, unknown>)?.raw as number) ?? (c.volume as number) ?? 0,
      openInterest: ((c.openInterest as Record<string, unknown>)?.raw as number) ?? (c.openInterest as number) ?? 0,
      impliedVolatility: ((c.impliedVolatility as Record<string, unknown>)?.raw as number) ?? (c.impliedVolatility as number) ?? 0,
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
    });

    const opts = result.options?.[0];
    const allCalls: OptionContract[] = (opts?.calls ?? []).map(mapYahoo);
    const allPuts: OptionContract[] = (opts?.puts ?? []).map(mapYahoo);

    const filterStrikes = (list: OptionContract[]) => {
      const sorted = [...list].sort((a, b) => a.strike - b.strike);
      const atmIdx = sorted.findIndex(o => o.strike >= currentPrice);
      const start = Math.max(0, atmIdx - 10);
      const end = Math.min(sorted.length, atmIdx + 10);
      return sorted.slice(start, end);
    };

    return {
      symbol,
      expDate,
      currentPrice,
      calls: filterStrikes(allCalls),
      puts: filterStrikes(allPuts),
    };
  } catch {
    return null;
  }
}

async function getChain(symbol: string): Promise<ChainResponse> {
  // Try Massive first, then Yahoo, then mock
  const massive = await fetchMassiveChain(symbol);
  if (massive) return massive;

  const yahoo = await fetchYahooOptions(symbol);
  if (yahoo) return yahoo;

  return mockChain(symbol);
}

async function getZeroDTE(): Promise<ZeroDTEContract[]> {
  const symbols = ['SPY', 'QQQ', 'NVDA'];
  const allContracts: ZeroDTEContract[] = [];
  const today = new Date().toISOString().split('T')[0];

  const chains = await Promise.allSettled(symbols.map(s => getChain(s)));

  for (let si = 0; si < symbols.length; si++) {
    const res = chains[si];
    if (res.status !== 'fulfilled') continue;
    const chain = res.value;
    if (chain.expDate !== today && chain.calls.length > 0) {
      // If expDate isn't today, still include — they're today's nearest
    }

    for (const c of chain.calls) {
      allContracts.push({
        symbol: symbols[si],
        strike: c.strike,
        type: 'CALL',
        expiry: chain.expDate,
        last: c.last,
        bid: c.bid,
        ask: c.ask,
        volume: c.volume,
        openInterest: c.openInterest,
        impliedVolatility: c.impliedVolatility,
      });
    }
    for (const p of chain.puts) {
      allContracts.push({
        symbol: symbols[si],
        strike: p.strike,
        type: 'PUT',
        expiry: chain.expDate,
        last: p.last,
        bid: p.bid,
        ask: p.ask,
        volume: p.volume,
        openInterest: p.openInterest,
        impliedVolatility: p.impliedVolatility,
      });
    }
  }

  if (allContracts.length === 0) return mockZeroDTE();

  return allContracts.sort((a, b) => b.volume - a.volume).slice(0, 20);
}

function getUnusual(contracts: ZeroDTEContract[]): ZeroDTEContract[] {
  return contracts
    .filter(c => c.openInterest > 0 && c.volume > 3 * c.openInterest)
    .sort((a, b) => (b.volume / (b.openInterest || 1)) - (a.volume / (a.openInterest || 1)))
    .slice(0, 15);
}

/* ─── Handler ─── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'chain';
    const symbol = (searchParams.get('symbol') || 'SPY').toUpperCase();

    if (type === 'chain') {
      const chain = await getChain(symbol);
      const resp = NextResponse.json({ ...chain, timestamp: new Date().toISOString() });
      resp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return resp;
    }

    if (type === '0dte') {
      const contracts = await getZeroDTE();
      const resp = NextResponse.json({ contracts, timestamp: new Date().toISOString() });
      resp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return resp;
    }

    if (type === 'unusual') {
      const contracts = await getZeroDTE();
      const unusual = getUnusual(contracts);
      const resp = NextResponse.json({ contracts: unusual, timestamp: new Date().toISOString() });
      resp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return resp;
    }

    return NextResponse.json({ error: 'Invalid type. Use: chain, 0dte, unusual' }, { status: 400 });
  } catch (error) {
    console.error('Options data route error:', error);
    // Always return something
    return NextResponse.json({
      contracts: mockZeroDTE(),
      timestamp: new Date().toISOString(),
      error: 'Fallback data',
    });
  }
}
