import { NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════════════════
   AxeCap Terminal — Options Data API Route (Massive v3 + Yahoo Finance)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Types ─── */
interface MassiveOptionResult {
  day?: {
    change?: number;
    change_percent?: number;
    close?: number;
    high?: number;
    low?: number;
    open?: number;
    previous_close?: number;
    volume?: number;
    vwap?: number;
  };
  details?: {
    contract_type?: string;
    exercise_style?: string;
    expiration_date?: string;
    shares_per_contract?: number;
    strike_price?: number;
    ticker?: string;
  };
  greeks?: {
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
  };
  implied_volatility?: number;
  open_interest?: number;
  underlying_asset?: {
    ticker?: string;
  };
}

interface MassiveResponse {
  results?: MassiveOptionResult[];
  status?: string;
  next_url?: string;
  request_id?: string;
}

interface OptionContract {
  strike: number;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  vwap: number;
  high: number;
  low: number;
  ticker: string;
}

interface ChainResponse {
  symbol: string;
  expDate: string;
  currentPrice: number;
  calls: OptionContract[];
  puts: OptionContract[];
  expirations: string[];
}

interface ZeroDTEContract {
  symbol: string;
  strike: number;
  type: 'CALL' | 'PUT';
  expiry: string;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  vwap: number;
  ticker: string;
}

interface UnusualContract extends ZeroDTEContract {
  volOiRatio: number;
}

/* ─── Env ─── */
const MASSIVE_BASE = process.env.MASSIVE_BASE_URL || 'https://api.massive.com';
const MASSIVE_KEY = process.env.MASSIVE_API_KEY_ALT || '';

/* ─── Cache ─── */
interface CacheEntry {
  data: unknown;
  ts: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30 seconds

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
  // Evict old entries
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.ts > CACHE_TTL * 2) cache.delete(k);
    }
  }
}

/* ─── Rate limiter (5 req/sec to Massive) ─── */
let lastMassiveCall = 0;
async function rateLimitMassive() {
  const now = Date.now();
  const elapsed = now - lastMassiveCall;
  if (elapsed < 200) { // 200ms = 5 req/sec
    await new Promise(r => setTimeout(r, 200 - elapsed));
  }
  lastMassiveCall = Date.now();
}

/* ─── Massive v3 Fetcher ─── */
async function fetchMassiveOptions(
  symbol: string,
  params: Record<string, string> = {}
): Promise<MassiveResponse | null> {
  if (!MASSIVE_KEY) return null;

  const cacheKey = `massive:${symbol}:${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as MassiveResponse;

  try {
    await rateLimitMassive();
    const qs = new URLSearchParams(params).toString();
    const url = `${MASSIVE_BASE}/v3/snapshot/options/${encodeURIComponent(symbol)}${qs ? '?' + qs : ''}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${MASSIVE_KEY}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Massive ${res.status} for ${url}`);
      return null;
    }

    const data: MassiveResponse = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('Massive fetch error:', err);
    return null;
  }
}

/* ─── Yahoo Finance Fetchers ─── */
async function fetchYahooQuotes(symbols: string[]): Promise<Record<string, {
  price: number; change: number; changePercent: number; volume: number;
  name: string; high: number; low: number;
}>> {
  const cacheKey = `yahoo:quotes:${symbols.join(',')}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as Record<string, { price: number; change: number; changePercent: number; volume: number; name: string; high: number; low: number }>;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return {};

    const data = await res.json();
    const result: Record<string, { price: number; change: number; changePercent: number; volume: number; name: string; high: number; low: number }> = {};
    for (const q of data?.quoteResponse?.result || []) {
      result[q.symbol] = {
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        volume: q.regularMarketVolume ?? 0,
        name: q.shortName ?? q.symbol,
        high: q.regularMarketDayHigh ?? 0,
        low: q.regularMarketDayLow ?? 0,
      };
    }
    setCache(cacheKey, result);
    return result;
  } catch {
    return {};
  }
}

async function fetchYahooSparkline(symbol: string): Promise<{ timestamps: number[]; closes: number[] } | null> {
  const cacheKey = `yahoo:spark:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as { timestamps: number[]; closes: number[] };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    const chart = data?.chart?.result?.[0];
    if (!chart) return null;

    const timestamps = chart.timestamp || [];
    const closes = chart.indicators?.quote?.[0]?.close || [];
    const result = { timestamps, closes: closes.filter((c: number | null) => c !== null) };
    setCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/* ─── Map Massive result → OptionContract ─── */
function mapToContract(r: MassiveOptionResult): OptionContract {
  return {
    strike: r.details?.strike_price ?? 0,
    last: r.day?.close ?? 0,
    change: r.day?.change ?? 0,
    changePercent: r.day?.change_percent ?? 0,
    volume: r.day?.volume ?? 0,
    openInterest: r.open_interest ?? 0,
    impliedVolatility: r.implied_volatility ?? 0,
    delta: r.greeks?.delta ?? 0,
    gamma: r.greeks?.gamma ?? 0,
    theta: r.greeks?.theta ?? 0,
    vega: r.greeks?.vega ?? 0,
    vwap: r.day?.vwap ?? 0,
    high: r.day?.high ?? 0,
    low: r.day?.low ?? 0,
    ticker: r.details?.ticker ?? '',
  };
}

/* ─── Mock generators (fallbacks) ─── */
function mockChain(symbol: string): ChainResponse {
  const basePrices: Record<string, number> = { SPY: 595, QQQ: 520, NVDA: 140, AAPL: 198, TSLA: 340, META: 580, AMZN: 200 };
  const basePrice = basePrices[symbol] || 150;
  const today = new Date().toISOString().split('T')[0];

  const makeContract = (strike: number, isCall: boolean): OptionContract => {
    const diff = isCall ? basePrice - strike : strike - basePrice;
    const vol = Math.floor(Math.random() * 50000) + 1000;
    return {
      strike,
      last: Math.max(0.01, +(diff + (Math.random() - 0.5) * 2).toFixed(2)),
      change: +((Math.random() - 0.5) * 2).toFixed(2),
      changePercent: +((Math.random() - 0.5) * 10).toFixed(2),
      volume: vol,
      openInterest: Math.floor(Math.random() * 100000) + 5000,
      impliedVolatility: +(0.15 + Math.random() * 0.3).toFixed(4),
      delta: isCall ? +Math.max(0, Math.min(1, 0.5 - (strike - basePrice) * 0.03)).toFixed(3)
        : +(-Math.max(0, Math.min(1, 0.5 + (strike - basePrice) * 0.03))).toFixed(3),
      gamma: +(0.005 + Math.random() * 0.03).toFixed(4),
      theta: +(-0.02 - Math.random() * 0.15).toFixed(4),
      vega: +(0.05 + Math.random() * 0.2).toFixed(4),
      vwap: Math.max(0.01, +(diff + Math.random()).toFixed(2)),
      high: Math.max(0.01, +(diff + 1 + Math.random()).toFixed(2)),
      low: Math.max(0.01, +(diff - 1 + Math.random()).toFixed(2)),
      ticker: `O:${symbol}mock`,
    };
  };

  const step = basePrice > 200 ? 2 : 1;
  const startStrike = Math.round(basePrice / step) * step - 15 * step;

  return {
    symbol,
    expDate: today,
    currentPrice: basePrice,
    calls: Array.from({ length: 30 }, (_, i) => makeContract(startStrike + i * step, true)),
    puts: Array.from({ length: 30 }, (_, i) => makeContract(startStrike + i * step, false)),
    expirations: [today],
  };
}

function mockZeroDTE(): ZeroDTEContract[] {
  const today = new Date().toISOString().split('T')[0];
  const tickers = [
    { sym: 'SPY', base: 595 },
    { sym: 'QQQ', base: 520 },
    { sym: 'NVDA', base: 140 },
  ];
  const contracts: ZeroDTEContract[] = [];

  for (const { sym, base } of tickers) {
    for (let i = 0; i < 10; i++) {
      const strike = base + (i - 5) * (sym === 'NVDA' ? 1 : 2);
      const type: 'CALL' | 'PUT' = i % 2 === 0 ? 'CALL' : 'PUT';
      const vol = Math.floor(Math.random() * 80000) + 2000;
      contracts.push({
        symbol: sym,
        strike,
        type,
        expiry: today,
        last: Math.max(0.01, +(Math.abs(base - strike) + (Math.random() - 0.5) * 2).toFixed(2)),
        change: +((Math.random() - 0.5) * 2).toFixed(2),
        changePercent: +((Math.random() - 0.5) * 20).toFixed(2),
        volume: vol,
        openInterest: Math.floor(Math.random() * 40000) + 500,
        impliedVolatility: +(0.18 + Math.random() * 0.25).toFixed(4),
        vwap: Math.max(0.01, +(Math.abs(base - strike) + Math.random()).toFixed(2)),
        ticker: `O:${sym}mock`,
      });
    }
  }

  return contracts.sort((a, b) => b.volume - a.volume).slice(0, 20);
}

/* ─── Handler functions for each type ─── */

async function handleChain(symbol: string, expDateParam?: string): Promise<ChainResponse> {
  const today = new Date().toISOString().split('T')[0];

  // Fetch options with expiration >= today
  const params: Record<string, string> = {
    limit: '250',
  };
  if (expDateParam) {
    params['expiration_date'] = expDateParam;
  } else {
    params['expiration_date.gte'] = today;
  }

  const data = await fetchMassiveOptions(symbol, params);
  if (!data?.results?.length) return mockChain(symbol);

  // Collect unique expiration dates
  const expSet = new Set<string>();
  for (const r of data.results) {
    if (r.details?.expiration_date) expSet.add(r.details.expiration_date);
  }
  const expirations = Array.from(expSet).sort();

  // Use first expiration if no specific one requested
  const targetExp = expDateParam || expirations[0] || today;

  // Filter to target expiration
  const filtered = data.results.filter(r => r.details?.expiration_date === targetExp);

  // Separate calls and puts
  const calls = filtered
    .filter(r => r.details?.contract_type === 'call')
    .map(mapToContract)
    .sort((a, b) => a.strike - b.strike);
  const puts = filtered
    .filter(r => r.details?.contract_type === 'put')
    .map(mapToContract)
    .sort((a, b) => a.strike - b.strike);

  // Estimate current price from ATM options (midpoint of nearest call/put with similar strikes)
  let currentPrice = 0;
  if (calls.length && puts.length) {
    // Find strike where call and put prices are closest
    const allStrikes = [...new Set([...calls.map(c => c.strike), ...puts.map(p => p.strike)])].sort((a, b) => a - b);
    let minDiff = Infinity;
    for (const strike of allStrikes) {
      const call = calls.find(c => c.strike === strike);
      const put = puts.find(p => p.strike === strike);
      if (call && put && call.last > 0 && put.last > 0) {
        const diff = Math.abs(call.last - put.last);
        if (diff < minDiff) {
          minDiff = diff;
          currentPrice = strike;
        }
      }
    }
    // Fallback: use middle strike
    if (!currentPrice && allStrikes.length) {
      currentPrice = allStrikes[Math.floor(allStrikes.length / 2)];
    }
  }

  // Try Yahoo for current price
  if (!currentPrice || currentPrice === 0) {
    const yahoo = await fetchYahooQuotes([symbol]);
    if (yahoo[symbol]) currentPrice = yahoo[symbol].price;
  }

  // Filter to 15 strikes above/below ATM
  const filterNearATM = (contracts: OptionContract[]): OptionContract[] => {
    if (!currentPrice || contracts.length <= 30) return contracts;
    const sorted = [...contracts].sort((a, b) => a.strike - b.strike);
    const atmIdx = sorted.findIndex(o => o.strike >= currentPrice);
    if (atmIdx === -1) return sorted.slice(-30);
    const start = Math.max(0, atmIdx - 15);
    const end = Math.min(sorted.length, atmIdx + 15);
    return sorted.slice(start, end);
  };

  return {
    symbol,
    expDate: targetExp,
    currentPrice,
    calls: filterNearATM(calls),
    puts: filterNearATM(puts),
    expirations,
  };
}

async function handleZeroDTE(symbolsParam?: string): Promise<ZeroDTEContract[]> {
  const today = new Date().toISOString().split('T')[0];
  const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.trim().toUpperCase()) : ['SPY', 'QQQ', 'NVDA'];
  const allContracts: ZeroDTEContract[] = [];

  // Sequential fetching (rate limit)
  for (const symbol of symbols) {
    const data = await fetchMassiveOptions(symbol, {
      expiration_date: today,
      limit: '250',
    });
    if (!data?.results?.length) continue;

    for (const r of data.results) {
      allContracts.push({
        symbol,
        strike: r.details?.strike_price ?? 0,
        type: r.details?.contract_type === 'call' ? 'CALL' : 'PUT',
        expiry: r.details?.expiration_date ?? today,
        last: r.day?.close ?? 0,
        change: r.day?.change ?? 0,
        changePercent: r.day?.change_percent ?? 0,
        volume: r.day?.volume ?? 0,
        openInterest: r.open_interest ?? 0,
        impliedVolatility: r.implied_volatility ?? 0,
        vwap: r.day?.vwap ?? 0,
        ticker: r.details?.ticker ?? '',
      });
    }
  }

  if (allContracts.length === 0) return mockZeroDTE();
  return allContracts.sort((a, b) => b.volume - a.volume).slice(0, 20);
}

async function handleUnusual(symbolsParam?: string): Promise<UnusualContract[]> {
  const today = new Date().toISOString().split('T')[0];
  const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.trim().toUpperCase()) : ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA'];
  const allContracts: UnusualContract[] = [];

  for (const symbol of symbols) {
    const data = await fetchMassiveOptions(symbol, {
      'expiration_date.gte': today,
      limit: '250',
    });
    if (!data?.results?.length) continue;

    for (const r of data.results) {
      const vol = r.day?.volume ?? 0;
      const oi = r.open_interest ?? 0;
      // Filter: volume > 2x OI AND volume > 500
      if (vol > 500 && oi > 0 && vol > 2 * oi) {
        allContracts.push({
          symbol,
          strike: r.details?.strike_price ?? 0,
          type: r.details?.contract_type === 'call' ? 'CALL' : 'PUT',
          expiry: r.details?.expiration_date ?? today,
          last: r.day?.close ?? 0,
          change: r.day?.change ?? 0,
          changePercent: r.day?.change_percent ?? 0,
          volume: vol,
          openInterest: oi,
          impliedVolatility: r.implied_volatility ?? 0,
          vwap: r.day?.vwap ?? 0,
          ticker: r.details?.ticker ?? '',
          volOiRatio: +(vol / oi).toFixed(2),
        });
      }
    }
  }

  // Sort by Vol/OI ratio descending
  return allContracts
    .sort((a, b) => b.volOiRatio - a.volOiRatio)
    .slice(0, 20);
}

async function handleSnapshot(symbolsParam: string): Promise<Record<string, {
  price: number; change: number; changePercent: number; volume: number;
  name: string; high: number; low: number;
}>> {
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
  return fetchYahooQuotes(symbols);
}

async function handleSparkline(symbol: string): Promise<{ timestamps: number[]; closes: number[] } | null> {
  return fetchYahooSparkline(symbol);
}

async function handlePCR(): Promise<{ pcr: number; totalPuts: number; totalCalls: number; sentiment: string }> {
  const today = new Date().toISOString().split('T')[0];
  const data = await fetchMassiveOptions('SPY', {
    expiration_date: today,
    limit: '250',
  });

  if (!data?.results?.length) {
    return { pcr: 0.85, totalPuts: 0, totalCalls: 0, sentiment: 'Neutral' };
  }

  let totalCallVol = 0;
  let totalPutVol = 0;
  for (const r of data.results) {
    const vol = r.day?.volume ?? 0;
    if (r.details?.contract_type === 'call') totalCallVol += vol;
    else if (r.details?.contract_type === 'put') totalPutVol += vol;
  }

  const pcr = totalCallVol > 0 ? +(totalPutVol / totalCallVol).toFixed(3) : 0;
  const sentiment = pcr < 0.7 ? 'Bullish' : pcr > 1.0 ? 'Bearish' : 'Neutral';

  return { pcr, totalPuts: totalPutVol, totalCalls: totalCallVol, sentiment };
}

/* ─── Main Handler ─── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'chain';
    const symbol = (searchParams.get('symbol') || 'SPY').toUpperCase();
    const symbols = searchParams.get('symbols') || '';
    const expDate = searchParams.get('expDate') || undefined;

    if (type === 'chain') {
      const chain = await handleChain(symbol, expDate);
      return NextResponse.json({ ...chain, timestamp: new Date().toISOString() });
    }

    if (type === '0dte') {
      const contracts = await handleZeroDTE(symbols || undefined);
      return NextResponse.json({ contracts, timestamp: new Date().toISOString() });
    }

    if (type === 'unusual') {
      const contracts = await handleUnusual(symbols || undefined);
      return NextResponse.json({ contracts, timestamp: new Date().toISOString() });
    }

    if (type === 'snapshot') {
      const data = await handleSnapshot(symbols || symbol);
      return NextResponse.json({ quotes: data, timestamp: new Date().toISOString() });
    }

    if (type === 'sparkline') {
      const data = await handleSparkline(symbol);
      return NextResponse.json({ data, timestamp: new Date().toISOString() });
    }

    if (type === 'pcr') {
      const data = await handlePCR();
      return NextResponse.json({ ...data, timestamp: new Date().toISOString() });
    }

    return NextResponse.json(
      { error: 'Invalid type. Use: chain, 0dte, unusual, snapshot, sparkline, pcr' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Options data route error:', error);
    return NextResponse.json({
      contracts: mockZeroDTE(),
      timestamp: new Date().toISOString(),
      error: 'Fallback data',
    });
  }
}
