import { NextResponse } from 'next/server';

// Default tickers for AxeCap Terminal
const DEFAULT_TICKERS = ['ES=F', 'NQ=F', 'SPY', '^VIX', 'BTC-USD', '^TNX'];

// Fallback data (realistic recent prices — updated manually or via cron)
const FALLBACK_DATA: Record<string, { name: string; price: number; change: number; pct: number; high: number; low: number }> = {
  'ES=F':    { name: 'E-Mini S&P 500',  price: 6048.25, change: 12.50,   pct: 0.21,  high: 6055.00,  low: 6038.75 },
  'NQ=F':    { name: 'E-Mini Nasdaq',    price: 21534.75, change: 89.25,  pct: 0.42,  high: 21588.00, low: 21428.50 },
  'SPY':     { name: 'SPDR S&P 500',     price: 604.52,  change: 1.23,    pct: 0.20,  high: 605.80,   low: 602.10 },
  '^VIX':    { name: 'CBOE Volatility',  price: 15.42,   change: -0.38,   pct: -2.40, high: 16.10,    low: 15.20 },
  'VIX':     { name: 'CBOE Volatility',  price: 15.42,   change: -0.38,   pct: -2.40, high: 16.10,    low: 15.20 },
  'BTC-USD': { name: 'Bitcoin USD',      price: 97284.50, change: 1842.30, pct: 1.93,  high: 98100.00, low: 95200.00 },
  '^TNX':    { name: '10Y Treasury',     price: 4.485,   change: -0.012,  pct: -0.27, high: 4.510,    low: 4.470 },
  'AAPL':    { name: 'Apple Inc',        price: 234.56,  change: -0.75,   pct: -0.32, high: 236.10,   low: 233.80 },
  'NVDA':    { name: 'NVIDIA Corp',      price: 138.25,  change: 3.25,    pct: 2.41,  high: 139.50,   low: 135.00 },
  'TSLA':    { name: 'Tesla Inc',        price: 352.80,  change: 8.45,    pct: 2.45,  high: 355.20,   low: 344.30 },
  'META':    { name: 'Meta Platforms',   price: 612.30,  change: 4.80,    pct: 0.79,  high: 615.00,   low: 607.50 },
  'AMZN':    { name: 'Amazon.com',       price: 225.40,  change: -1.20,   pct: -0.53, high: 227.80,   low: 224.10 },
  'PLTR':    { name: 'Palantir',         price: 84.50,   change: 2.15,    pct: 2.61,  high: 85.30,    low: 82.10 },
  'HIMS':    { name: 'Hims & Hers',     price: 56.20,   change: 1.80,    pct: 3.31,  high: 57.00,    low: 54.40 },
};

// News items (static for now — can be replaced with RSS/API)
const STATIC_NEWS = [
  { id: '1', title: 'S&P 500 futures push higher as tech sector leads pre-market gains', publisher: 'Bloomberg', relatedSymbol: 'ES', publishedAt: new Date().toISOString() },
  { id: '2', title: 'NVIDIA announces next-gen Blackwell Ultra GPU architecture at GTC keynote', publisher: 'Reuters', relatedSymbol: 'NVDA', publishedAt: new Date().toISOString() },
  { id: '3', title: 'Bitcoin breaks through $97K resistance on institutional buying pressure', publisher: 'CoinDesk', relatedSymbol: 'BTC', publishedAt: new Date().toISOString() },
  { id: '4', title: 'Fed officials signal patience on rate cuts amid sticky inflation data', publisher: 'CNBC', relatedSymbol: 'FED', publishedAt: new Date().toISOString() },
  { id: '5', title: 'Tesla expands Full Self-Driving beta to 15 new markets in Q1 push', publisher: 'WSJ', relatedSymbol: 'TSLA', publishedAt: new Date().toISOString() },
];

// Try Yahoo Finance v8 chart endpoint (still works without auth)
async function fetchYahooChart(symbol: string): Promise<{ price: number; change: number; pct: number; high: number; low: number; name: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const pct = prevClose ? (change / prevClose) * 100 : 0;
    const indicators = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    const highs = indicators?.high?.filter((v: number | null) => v !== null) ?? [];
    const lows = indicators?.low?.filter((v: number | null) => v !== null) ?? [];

    return {
      price,
      change,
      pct,
      high: highs.length ? Math.max(...highs) : price,
      low: lows.length ? Math.min(...lows) : price,
      name: meta.shortName || meta.symbol || symbol,
    };
  } catch {
    return null;
  }
}

function buildQuote(symbol: string, live: { price: number; change: number; pct: number; high: number; low: number; name: string } | null) {
  const fb = FALLBACK_DATA[symbol];
  if (live) {
    return {
      symbol,
      name: live.name,
      price: live.price,
      change: live.change,
      changePercent: live.pct,
      high: live.high,
      low: live.low,
      marketState: 'REGULAR',
    };
  }
  if (fb) {
    return {
      symbol,
      name: fb.name,
      price: fb.price,
      change: fb.change,
      changePercent: fb.pct,
      high: fb.high,
      low: fb.low,
      marketState: 'FALLBACK',
    };
  }
  return {
    symbol,
    name: symbol,
    price: 0,
    change: 0,
    changePercent: 0,
    high: 0,
    low: 0,
    marketState: 'UNKNOWN',
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customSymbols = searchParams.get('symbols')?.split(',').filter(Boolean) ?? [];
    const includeNews = searchParams.get('news') !== 'false';

    const allSymbols = [...new Set([...DEFAULT_TICKERS, ...customSymbols])];

    // Fetch all symbols in parallel with individual timeouts
    const liveResults = await Promise.allSettled(
      allSymbols.map(s => fetchYahooChart(s))
    );

    const quotes = allSymbols.map((sym, i) => {
      const result = liveResults[i];
      const live = result.status === 'fulfilled' ? result.value : null;
      return buildQuote(sym, live);
    });

    const anyLive = quotes.some(q => q.marketState === 'REGULAR');

    const resp = NextResponse.json({
      quotes,
      news: includeNews ? STATIC_NEWS : [],
      timestamp: new Date().toISOString(),
      source: anyLive ? 'yahoo-finance' : 'fallback',
      live: anyLive,
    });

    resp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return resp;
  } catch (error) {
    console.error('Market data route error:', error);

    // Always return something
    const quotes = DEFAULT_TICKERS.map(sym => buildQuote(sym, null));

    return NextResponse.json({
      quotes,
      news: STATIC_NEWS,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      live: false,
    });
  }
}
