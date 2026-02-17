import { NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════════════════
   AxeCap Terminal — Unified API Route
   Proxies market-data + market-news into a single endpoint for the terminal
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_TICKERS = ['ES=F', 'NQ=F', 'SPY', '^VIX', 'BTC-USD', '^TNX'];

const DISPLAY_MAP: Record<string, string> = {
  'ES=F': 'ES',
  'NQ=F': 'NQ',
  '^VIX': 'VIX',
  'BTC-USD': 'BTC',
  '^TNX': '10Y',
};

const FALLBACK_DATA: Record<string, { name: string; price: number; change: number; pct: number; high: number; low: number }> = {
  'ES=F':    { name: 'E-Mini S&P 500',  price: 6048.25, change: 12.50,   pct: 0.21,  high: 6055.00,  low: 6038.75 },
  'NQ=F':    { name: 'E-Mini Nasdaq',    price: 21534.75, change: 89.25,  pct: 0.42,  high: 21588.00, low: 21428.50 },
  'SPY':     { name: 'SPDR S&P 500',     price: 604.52,  change: 1.23,    pct: 0.20,  high: 605.80,   low: 602.10 },
  '^VIX':    { name: 'CBOE Volatility',  price: 15.42,   change: -0.38,   pct: -2.40, high: 16.10,    low: 15.20 },
  'BTC-USD': { name: 'Bitcoin USD',      price: 97284.50, change: 1842.30, pct: 1.93,  high: 98100.00, low: 95200.00 },
  '^TNX':    { name: '10Y Treasury',     price: 4.485,   change: -0.012,  pct: -0.27, high: 4.510,    low: 4.470 },
};

async function fetchYahooChart(symbol: string): Promise<{
  price: number; change: number; pct: number; high: number; low: number; name: string;
} | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=2m&range=1d`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const indicators = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    const closes = (indicators?.close ?? []).filter((v: number | null) => v !== null);
    const highs = (indicators?.high ?? []).filter((v: number | null) => v !== null);
    const lows = (indicators?.low ?? []).filter((v: number | null) => v !== null);

    const lastClose = closes.length ? closes[closes.length - 1] : 0;
    const metaPrice = meta.regularMarketPrice ?? 0;
    const price = lastClose || metaPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const pct = prevClose ? (change / prevClose) * 100 : 0;

    return {
      price,
      change,
      pct,
      high: highs.length ? Math.max(...highs) : (meta.regularMarketDayHigh ?? price),
      low: lows.length ? Math.min(...lows) : (meta.regularMarketDayLow ?? price),
      name: meta.shortName || meta.symbol || symbol,
    };
  } catch {
    return null;
  }
}

async function fetchNews(symbols: string[]): Promise<Array<{
  id: string; title: string; publisher: string; link?: string; publishedAt: string; relatedSymbol: string;
}>> {
  const allNews: Array<{
    id: string; title: string; publisher: string; link?: string; publishedAt: string; relatedSymbol: string;
  }> = [];

  for (const symbol of symbols.slice(0, 3)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&newsCount=4`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store',
        }
      );
      clearTimeout(timeout);
      if (!res.ok) continue;

      const data = await res.json();
      for (const item of data.news || []) {
        allNews.push({
          id: item.uuid || `${symbol}-${allNews.length}`,
          title: item.title,
          publisher: item.publisher || 'Unknown',
          link: item.link,
          publishedAt: item.providerPublishTime
            ? new Date(item.providerPublishTime * 1000).toISOString()
            : new Date().toISOString(),
          relatedSymbol: DISPLAY_MAP[symbol] || symbol,
        });
      }
    } catch {
      // skip
    }
  }

  // Dedupe by title
  const seen = new Set<string>();
  const deduped = allNews.filter(n => {
    if (seen.has(n.title)) return false;
    seen.add(n.title);
    return true;
  });

  // Sort newest first
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return deduped.slice(0, 10);
}

// Static fallback news
const STATIC_NEWS = [
  { id: '1', title: 'S&P 500 futures push higher as tech sector leads pre-market gains', publisher: 'Bloomberg', relatedSymbol: 'ES', publishedAt: new Date().toISOString() },
  { id: '2', title: 'NVIDIA announces next-gen Blackwell Ultra GPU architecture at GTC keynote', publisher: 'Reuters', relatedSymbol: 'NVDA', publishedAt: new Date().toISOString() },
  { id: '3', title: 'Bitcoin breaks through $97K resistance on institutional buying pressure', publisher: 'CoinDesk', relatedSymbol: 'BTC', publishedAt: new Date().toISOString() },
  { id: '4', title: 'Fed officials signal patience on rate cuts amid sticky inflation data', publisher: 'CNBC', relatedSymbol: 'FED', publishedAt: new Date().toISOString() },
  { id: '5', title: 'Tesla expands Full Self-Driving beta to 15 new markets in Q1 push', publisher: 'WSJ', relatedSymbol: 'TSLA', publishedAt: new Date().toISOString() },
  { id: '6', title: 'Treasury yields dip as bond market digests latest economic indicators', publisher: 'Bloomberg', relatedSymbol: '10Y', publishedAt: new Date().toISOString() },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customSymbols = searchParams.get('symbols')?.split(',').filter(Boolean) ?? [];
    const includeNews = searchParams.get('news') !== 'false';

    const allSymbols = [...new Set([...DEFAULT_TICKERS, ...customSymbols])];

    // Fetch all quotes in parallel
    const liveResults = await Promise.allSettled(
      allSymbols.map(s => fetchYahooChart(s))
    );

    const quotes = allSymbols.map((sym, i) => {
      const result = liveResults[i];
      const live = result.status === 'fulfilled' ? result.value : null;
      const fb = FALLBACK_DATA[sym];

      if (live) {
        return {
          symbol: sym,
          displaySymbol: DISPLAY_MAP[sym] || sym,
          name: live.name,
          price: live.price,
          change: live.change,
          changePercent: live.pct,
          high: live.high,
          low: live.low,
          marketState: 'LIVE',
        };
      }
      if (fb) {
        return {
          symbol: sym,
          displaySymbol: DISPLAY_MAP[sym] || sym,
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
        symbol: sym,
        displaySymbol: DISPLAY_MAP[sym] || sym,
        name: sym,
        price: 0,
        change: 0,
        changePercent: 0,
        high: 0,
        low: 0,
        marketState: 'UNKNOWN',
      };
    });

    const anyLive = quotes.some(q => q.marketState === 'LIVE');

    // Fetch news (live or fallback)
    let news = STATIC_NEWS;
    if (includeNews) {
      const liveNews = await fetchNews(['SPY', 'BTC-USD', 'NVDA']);
      if (liveNews.length > 0) news = liveNews;
    }

    const resp = NextResponse.json({
      quotes,
      news,
      timestamp: new Date().toISOString(),
      source: anyLive ? 'yahoo-finance' : 'fallback',
      live: anyLive,
    });
    resp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return resp;
  } catch (error) {
    console.error('AxeCap API error:', error);

    const quotes = DEFAULT_TICKERS.map(sym => {
      const fb = FALLBACK_DATA[sym];
      return {
        symbol: sym,
        displaySymbol: DISPLAY_MAP[sym] || sym,
        name: fb?.name || sym,
        price: fb?.price || 0,
        change: fb?.change || 0,
        changePercent: fb?.pct || 0,
        high: fb?.high || 0,
        low: fb?.low || 0,
        marketState: 'FALLBACK',
      };
    });

    return NextResponse.json({
      quotes,
      news: STATIC_NEWS,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      live: false,
    });
  }
}
