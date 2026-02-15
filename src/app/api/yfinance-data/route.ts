import { NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════════════════
   yFinance Intelligence API — Fundamentals, Earnings, Dividends, History
   Powered by Yahoo Finance v7 Quote + v8 Chart APIs
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Cache ─── */
interface CacheEntry { data: unknown; ts: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60_000; // 60s for fundamentals (don't need tick-level freshness)

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) { if (now - v.ts > CACHE_TTL * 3) cache.delete(k); }
  }
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

/* ─── Yahoo v7 Quote (extended fields) ─── */
async function fetchExtendedQuote(symbols: string[]): Promise<Record<string, Record<string, unknown>>> {
  const key = `yf7:${symbols.join(',')}`;
  const cached = getCached(key);
  if (cached) return cached as Record<string, Record<string, unknown>>;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}&fields=symbol,shortName,longName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,trailingPE,forwardPE,priceToBook,epsTrailingTwelveMonths,epsForward,epsCurrentYear,bookValue,fiftyDayAverage,twoHundredDayAverage,fiftyTwoWeekHigh,fiftyTwoWeekLow,fiftyTwoWeekChange,dividendRate,dividendYield,trailingAnnualDividendRate,trailingAnnualDividendYield,exDividendDate,dividendDate,earningsTimestamp,earningsTimestampStart,earningsTimestampEnd,earningsCallTimestampStart,revenue,totalRevenue,revenuePerShare,returnOnEquity,profitMargins,operatingMargins,grossMargins,averageAnalystRating,targetMeanPrice,numberOfAnalystOpinions,sharesOutstanding,floatShares,shortRatio,shortPercentOfFloat,heldPercentInsiders,heldPercentInstitutions,beta,enterpriseValue,enterpriseToRevenue,enterpriseToEbitda,pegRatio,priceToSalesTrailing12Months,averageDailyVolume3Month,averageDailyVolume10Day`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': UA },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return {};

    const data = await res.json();
    const result: Record<string, Record<string, unknown>> = {};
    for (const q of data?.quoteResponse?.result || []) {
      result[q.symbol] = q;
    }
    setCache(key, result);
    return result;
  } catch {
    return {};
  }
}

/* ─── Yahoo v8 Chart (for historical data around earnings) ─── */
async function fetchChart(symbol: string, range: string = '1y', interval: string = '1d'): Promise<{
  timestamps: number[];
  closes: number[];
  highs: number[];
  lows: number[];
  volumes: number[];
} | null> {
  const key = `yf8:${symbol}:${range}:${interval}`;
  const cached = getCached(key);
  if (cached) return cached as { timestamps: number[]; closes: number[]; highs: number[]; lows: number[]; volumes: number[] };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': UA },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    const chart = data?.chart?.result?.[0];
    if (!chart) return null;

    const q = chart.indicators?.quote?.[0] || {};
    const result = {
      timestamps: (chart.timestamp || []) as number[],
      closes: ((q.close || []) as (number | null)[]).map((v: number | null) => v ?? 0),
      highs: ((q.high || []) as (number | null)[]).map((v: number | null) => v ?? 0),
      lows: ((q.low || []) as (number | null)[]).map((v: number | null) => v ?? 0),
      volumes: ((q.volume || []) as (number | null)[]).map((v: number | null) => v ?? 0),
    };
    setCache(key, result);
    return result;
  } catch {
    return null;
  }
}

/* ─── Fundamentals ─── */
async function handleFundamentals(symbol: string) {
  const quotes = await fetchExtendedQuote([symbol]);
  const q = quotes[symbol];
  if (!q) return { symbol, error: 'No data available' };

  const fmt = (v: unknown) => v !== undefined && v !== null ? v : null;
  const fmtPct = (v: unknown) => typeof v === 'number' ? +(v * 100).toFixed(2) : null;
  const fmtB = (v: unknown) => typeof v === 'number' ? (v >= 1e12 ? `$${(v/1e12).toFixed(2)}T` : v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(0)}M` : `$${v.toLocaleString()}`) : null;

  return {
    symbol,
    name: fmt(q.shortName) || fmt(q.longName) || symbol,
    price: fmt(q.regularMarketPrice),
    change: fmt(q.regularMarketChange),
    changePercent: fmt(q.regularMarketChangePercent),
    volume: fmt(q.regularMarketVolume),

    // Valuation
    marketCap: fmtB(q.marketCap as number),
    marketCapRaw: fmt(q.marketCap),
    trailingPE: fmt(q.trailingPE),
    forwardPE: fmt(q.forwardPE),
    pegRatio: fmt(q.pegRatio),
    priceToBook: fmt(q.priceToBook),
    priceToSales: fmt(q.priceToSalesTrailing12Months),
    enterpriseValue: fmtB(q.enterpriseValue as number),
    evToRevenue: fmt(q.enterpriseToRevenue),
    evToEbitda: fmt(q.enterpriseToEbitda),

    // Earnings
    epsTrailing: fmt(q.epsTrailingTwelveMonths),
    epsForward: fmt(q.epsForward),
    epsCurrent: fmt(q.epsCurrentYear),

    // Profitability
    profitMargin: fmtPct(q.profitMargins as number),
    operatingMargin: fmtPct(q.operatingMargins as number),
    grossMargin: fmtPct(q.grossMargins as number),
    returnOnEquity: fmtPct(q.returnOnEquity as number),

    // Technicals
    fiftyDayAvg: fmt(q.fiftyDayAverage),
    twoHundredDayAvg: fmt(q.twoHundredDayAverage),
    fiftyTwoWeekHigh: fmt(q.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: fmt(q.fiftyTwoWeekLow),
    fiftyTwoWeekChange: fmtPct(q.fiftyTwoWeekChange as number),
    beta: fmt(q.beta),

    // Ownership
    insiderHeld: fmtPct(q.heldPercentInsiders as number),
    institutionHeld: fmtPct(q.heldPercentInstitutions as number),
    shortRatio: fmt(q.shortRatio),
    shortFloat: fmtPct(q.shortPercentOfFloat as number),
    sharesOutstanding: fmt(q.sharesOutstanding),
    floatShares: fmt(q.floatShares),

    // Analyst
    analystRating: fmt(q.averageAnalystRating),
    targetPrice: fmt(q.targetMeanPrice),
    analystCount: fmt(q.numberOfAnalystOpinions),

    // Dividends
    dividendRate: fmt(q.dividendRate),
    dividendYield: fmtPct(q.dividendYield as number),
    exDividendDate: q.exDividendDate ? new Date((q.exDividendDate as number) * 1000).toISOString().split('T')[0] : null,

    // Earnings date
    earningsDate: q.earningsTimestamp ? new Date((q.earningsTimestamp as number) * 1000).toISOString().split('T')[0] : null,
    earningsDateStart: q.earningsTimestampStart ? new Date((q.earningsTimestampStart as number) * 1000).toISOString().split('T')[0] : null,
    earningsDateEnd: q.earningsTimestampEnd ? new Date((q.earningsTimestampEnd as number) * 1000).toISOString().split('T')[0] : null,

    // Volume
    avgVolume3M: fmt(q.averageDailyVolume3Month),
    avgVolume10D: fmt(q.averageDailyVolume10Day),
  };
}

/* ─── Earnings Calendar ─── */
async function handleEarningsCalendar(symbolsStr: string) {
  const symbols = symbolsStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!symbols.length) return { earnings: [] };

  const quotes = await fetchExtendedQuote(symbols);
  const earnings: Array<{
    symbol: string;
    name: string;
    earningsDate: string | null;
    earningsDateStart: string | null;
    earningsDateEnd: string | null;
    epsTrailing: number | null;
    epsForward: number | null;
    trailingPE: number | null;
    forwardPE: number | null;
    marketCap: string | null;
    price: number | null;
  }> = [];

  for (const symbol of symbols) {
    const q = quotes[symbol];
    if (!q) continue;

    const earningsDate = q.earningsTimestamp
      ? new Date((q.earningsTimestamp as number) * 1000).toISOString().split('T')[0]
      : q.earningsTimestampStart
        ? new Date((q.earningsTimestampStart as number) * 1000).toISOString().split('T')[0]
        : null;

    earnings.push({
      symbol,
      name: (q.shortName as string) || symbol,
      earningsDate,
      earningsDateStart: q.earningsTimestampStart ? new Date((q.earningsTimestampStart as number) * 1000).toISOString().split('T')[0] : null,
      earningsDateEnd: q.earningsTimestampEnd ? new Date((q.earningsTimestampEnd as number) * 1000).toISOString().split('T')[0] : null,
      epsTrailing: (q.epsTrailingTwelveMonths as number) ?? null,
      epsForward: (q.epsForward as number) ?? null,
      trailingPE: (q.trailingPE as number) ?? null,
      forwardPE: (q.forwardPE as number) ?? null,
      marketCap: typeof q.marketCap === 'number'
        ? (q.marketCap >= 1e12 ? `$${((q.marketCap as number)/1e12).toFixed(2)}T` : `$${((q.marketCap as number)/1e9).toFixed(1)}B`)
        : null,
      price: (q.regularMarketPrice as number) ?? null,
    });
  }

  // Sort by earnings date (soonest first), nulls last
  earnings.sort((a, b) => {
    if (!a.earningsDate && !b.earningsDate) return 0;
    if (!a.earningsDate) return 1;
    if (!b.earningsDate) return -1;
    return a.earningsDate.localeCompare(b.earningsDate);
  });

  return { earnings };
}

/* ─── Dividends ─── */
async function handleDividends(symbolsStr: string) {
  const symbols = symbolsStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!symbols.length) return { dividends: [] };

  const quotes = await fetchExtendedQuote(symbols);
  const dividends: Array<{
    symbol: string;
    name: string;
    price: number | null;
    dividendRate: number | null;
    dividendYield: number | null;
    dividendYieldPct: string | null;
    trailingDividendRate: number | null;
    trailingDividendYield: number | null;
    exDividendDate: string | null;
    payable: boolean;
  }> = [];

  for (const symbol of symbols) {
    const q = quotes[symbol];
    if (!q) continue;

    const divYield = q.dividendYield as number | undefined;
    const divRate = q.dividendRate as number | undefined;
    const trailingRate = q.trailingAnnualDividendRate as number | undefined;

    // Skip if no dividend data at all
    const hasDividend = (divRate && divRate > 0) || (trailingRate && trailingRate > 0);

    dividends.push({
      symbol,
      name: (q.shortName as string) || symbol,
      price: (q.regularMarketPrice as number) ?? null,
      dividendRate: divRate ?? null,
      dividendYield: divYield ?? null,
      dividendYieldPct: typeof divYield === 'number' ? `${(divYield * 100).toFixed(2)}%` : null,
      trailingDividendRate: trailingRate ?? null,
      trailingDividendYield: (q.trailingAnnualDividendYield as number) ?? null,
      exDividendDate: q.exDividendDate ? new Date((q.exDividendDate as number) * 1000).toISOString().split('T')[0] : null,
      payable: !!hasDividend,
    });
  }

  // Sort: dividend payers first (by yield desc), then non-payers
  dividends.sort((a, b) => {
    if (a.payable && !b.payable) return -1;
    if (!a.payable && b.payable) return 1;
    return (b.dividendYield ?? 0) - (a.dividendYield ?? 0);
  });

  return { dividends };
}

/* ─── Historical Earnings Performance ─── */
async function handleEarningsHistory(symbol: string) {
  // Get 2 years of daily data
  const chart = await fetchChart(symbol, '2y', '1d');
  if (!chart || !chart.timestamps.length) {
    return { symbol, events: [], error: 'No historical data' };
  }

  // Get earnings dates from quote
  const quotes = await fetchExtendedQuote([symbol]);
  const q = quotes[symbol];

  // We'll look at significant gap days (>3% move) as proxy for earnings
  // since v7 only gives next earnings date
  const events: Array<{
    date: string;
    priceBefore: number;
    priceAfter: number;
    change: number;
    changePercent: number;
    volumeSpike: number;
    type: 'gap-up' | 'gap-down';
  }> = [];

  const avgVolume = chart.volumes.reduce((a, b) => a + b, 0) / chart.volumes.length;

  for (let i = 1; i < chart.timestamps.length; i++) {
    const prev = chart.closes[i - 1];
    const curr = chart.closes[i];
    const vol = chart.volumes[i];

    if (!prev || !curr || prev === 0) continue;

    const changePct = ((curr - prev) / prev) * 100;
    const volSpike = avgVolume > 0 ? vol / avgVolume : 1;

    // Significant move (>3%) with volume spike (>1.5x avg) = likely earnings/catalyst
    if (Math.abs(changePct) > 3 && volSpike > 1.5) {
      const date = new Date(chart.timestamps[i] * 1000).toISOString().split('T')[0];
      events.push({
        date,
        priceBefore: +prev.toFixed(2),
        priceAfter: +curr.toFixed(2),
        change: +(curr - prev).toFixed(2),
        changePercent: +changePct.toFixed(2),
        volumeSpike: +volSpike.toFixed(1),
        type: changePct > 0 ? 'gap-up' : 'gap-down',
      });
    }
  }

  // Sort most recent first
  events.sort((a, b) => b.date.localeCompare(a.date));

  // Next earnings
  const nextEarnings = q?.earningsTimestamp
    ? new Date((q.earningsTimestamp as number) * 1000).toISOString().split('T')[0]
    : q?.earningsTimestampStart
      ? new Date((q.earningsTimestampStart as number) * 1000).toISOString().split('T')[0]
      : null;

  return {
    symbol,
    name: (q?.shortName as string) || symbol,
    nextEarnings,
    events: events.slice(0, 12), // Last 12 significant moves
    avgMove: events.length ? +(events.reduce((s, e) => s + Math.abs(e.changePercent), 0) / events.length).toFixed(2) : null,
    upMoves: events.filter(e => e.type === 'gap-up').length,
    downMoves: events.filter(e => e.type === 'gap-down').length,
  };
}

/* ─── Main Handler ─── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'fundamentals';
    const symbol = (searchParams.get('symbol') || 'SPY').toUpperCase();
    const symbols = searchParams.get('symbols') || '';

    switch (type) {
      case 'fundamentals': {
        const data = await handleFundamentals(symbol);
        return NextResponse.json({ ...data, timestamp: new Date().toISOString() });
      }
      case 'earnings': {
        const data = await handleEarningsCalendar(symbols || symbol);
        return NextResponse.json({ ...data, timestamp: new Date().toISOString() });
      }
      case 'dividends': {
        const data = await handleDividends(symbols || symbol);
        return NextResponse.json({ ...data, timestamp: new Date().toISOString() });
      }
      case 'earnings-history': {
        const data = await handleEarningsHistory(symbol);
        return NextResponse.json({ ...data, timestamp: new Date().toISOString() });
      }
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: fundamentals, earnings, dividends, earnings-history' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('yFinance data route error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
