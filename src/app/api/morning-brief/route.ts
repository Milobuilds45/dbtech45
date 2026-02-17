import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// THE MORNING BRIEF — Main API Route (v2 Multi-Section)
// Markets + Sports + Weather + Calendar + Front Page previews
// ═══════════════════════════════════════════════════════════════════════════

// ─── Cache control ──────────────────────────────────────────────────────
function getCacheSeconds(): number {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hour = et.getHours();
  const min = et.getMinutes();
  const t = hour * 100 + min;
  if (t >= 930 && t <= 1600) return 300;
  return 1800;
}

// ─── Daily quotes ───────────────────────────────────────────────────────
const QUOTES = [
  { text: 'The market can stay irrational longer than you can stay solvent.', author: 'John Maynard Keynes' },
  { text: 'In investing, what is comfortable is rarely profitable.', author: 'Robert Arnott' },
  { text: 'The stock market is a device for transferring money from the impatient to the patient.', author: 'Warren Buffett' },
  { text: 'Risk comes from not knowing what you are doing.', author: 'Warren Buffett' },
  { text: 'The four most dangerous words in investing are: This time it\'s different.', author: 'Sir John Templeton' },
  { text: 'Be fearful when others are greedy and greedy when others are fearful.', author: 'Warren Buffett' },
  { text: 'The individual investor should act consistently as an investor and not as a speculator.', author: 'Benjamin Graham' },
  { text: 'It\'s not whether you\'re right or wrong that\'s important, but how much money you make when you\'re right.', author: 'George Soros' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'The trend is your friend until the end when it bends.', author: 'Ed Seykota' },
  { text: 'Price is what you pay. Value is what you get.', author: 'Warren Buffett' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Cut your losses short, let your profits run.', author: 'David Ricardo' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MARKET DATA
// ═══════════════════════════════════════════════════════════════════════════

interface YahooQuote {
  price: number;
  change: number;
  changePct: number;
  prevClose: number;
}

async function getYahooQuote(symbol: string): Promise<YahooQuote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
      { next: { revalidate: 300 }, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!res.ok) throw new Error(`Yahoo ${symbol} ${res.status}`);
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    return { price, change, changePct, prevClose };
  } catch (e) {
    console.error(`Yahoo ${symbol} failed:`, e);
    return null;
  }
}

async function getCrypto() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return {
      btc: { price: data.bitcoin?.usd ?? 0, changePct: data.bitcoin?.usd_24h_change ?? 0 },
      eth: { price: data.ethereum?.usd ?? 0, changePct: data.ethereum?.usd_24h_change ?? 0 },
      sol: { price: data.solana?.usd ?? 0, changePct: data.solana?.usd_24h_change ?? 0 },
    };
  } catch (e) {
    console.error('CoinGecko failed:', e);
    return null;
  }
}

async function getMarketData() {
  const symbols = ['SPY', 'QQQ', 'IWM', 'DIA', 'GLD', 'USO', '^VIX', 'DX-Y.NYB'] as const;
  const results = await Promise.all(symbols.map(s => getYahooQuote(s)));
  const [spy, qqq, iwm, dia, gld, uso, vix, dxy] = results;

  const fmtTicker = (sym: string, q: YahooQuote | null) => {
    if (!q) return { symbol: sym, price: 0, change: 0, changePct: 0 };
    return { symbol: sym, price: q.price, change: q.change, changePct: q.changePct };
  };

  return {
    ticker: [
      fmtTicker('ES', spy),
      fmtTicker('NQ', qqq),
      fmtTicker('RTY', iwm),
      fmtTicker('CL', uso),
      fmtTicker('GC', gld),
      fmtTicker('VIX', vix),
    ],
    raw: { spy, qqq, iwm, dia, gld, uso, vix, dxy },
  };
}

// ─── Weather ────────────────────────────────────────────────────────────
async function getWeather() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=42.7654&longitude=-71.4676&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America/New_York&forecast_days=5',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();
    const wmo: Record<number, string> = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
      80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers', 95: 'Thunderstorm',
    };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = (data.daily?.time ?? []).slice(0, 5).map((t: string, i: number) => {
      const d = new Date(t + 'T12:00:00');
      const label = i === 0 ? 'Today' : days[d.getDay()];
      const high = Math.round(data.daily?.temperature_2m_max?.[i] ?? 0);
      const low = Math.round(data.daily?.temperature_2m_min?.[i] ?? 0);
      return { label, range: `${high}°/${low}°` };
    });
    return {
      temp: Math.round(data.current?.temperature_2m ?? 0),
      high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
      low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
      condition: wmo[data.current?.weather_code] ?? 'Unknown',
      location: 'Nashua, NH',
      forecast,
    };
  } catch (e) {
    console.error('Open-Meteo failed:', e);
    return { temp: 0, high: 0, low: 0, condition: 'Unavailable', location: 'Nashua, NH', forecast: [] };
  }
}

// ─── ESPN Scores ────────────────────────────────────────────────────────
interface SportGame {
  league: string;
  away: string;
  home: string;
  score: string;
  time: string;
  status: string;
  broadcast: string;
  spread: string;
}

async function getESPNScores(sport: string, league: string): Promise<SportGame[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = data.events ?? [];
    const games: SportGame[] = [];
    for (const event of events) {
      const competition = event.competitions?.[0];
      if (!competition) continue;
      const competitors = competition.competitors ?? [];
      const away = competitors.find((c: { homeAway: string }) => c.homeAway === 'away');
      const home = competitors.find((c: { homeAway: string }) => c.homeAway === 'home');
      if (!away || !home) continue;
      const awayAbbr = away.team?.abbreviation ?? '???';
      const homeAbbr = home.team?.abbreviation ?? '???';
      const awayScore = away.score ?? '0';
      const homeScore = home.score ?? '0';
      const statusState = competition.status?.type?.state ?? event.status?.type?.state ?? '';
      const statusDetail = competition.status?.type?.description ?? event.status?.type?.description ?? '';
      const broadcasts = competition.broadcasts ?? [];
      let broadcast = '';
      if (broadcasts.length > 0 && broadcasts[0].names?.length > 0) broadcast = broadcasts[0].names[0];
      const gameDate = new Date(event.date ?? competition.date);
      const timeStr = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
      let status = ''; let score = '';
      if (statusState === 'post') { status = 'Final'; score = `${awayScore}-${homeScore}`; }
      else if (statusState === 'in') { status = statusDetail || 'In Progress'; score = `${awayScore}-${homeScore}`; }
      else { status = 'Scheduled'; score = timeStr; }
      const odds = competition.odds?.[0];
      const spread = odds?.details ?? '';
      games.push({ league: league.toUpperCase(), away: awayAbbr, home: homeAbbr, score, time: timeStr, status, broadcast, spread });
    }
    return games;
  } catch (e) { console.error(`ESPN ${league} failed:`, e); return []; }
}

async function getAllSports() {
  const [nba, nhl, nfl] = await Promise.all([
    getESPNScores('basketball', 'nba'),
    getESPNScores('hockey', 'nhl'),
    getESPNScores('football', 'nfl'),
  ]);
  const allGames = [...nba, ...nhl, ...nfl];
  return {
    scores: allGames.filter(g => g.status === 'Final' || g.status.includes('Progress')),
    today: allGames.filter(g => g.status === 'Scheduled'),
  };
}

// ─── Fear & Greed ───────────────────────────────────────────────────────
async function getFearGreed(): Promise<string> {
  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`F&G ${res.status}`);
    const data = await res.json();
    const score = data.fear_and_greed?.score;
    return score ? `${Math.round(score)}` : '--';
  } catch { return '--'; }
}

// ─── 10Y Yield ──────────────────────────────────────────────────────────
async function get10YYield(): Promise<{ value: string; change: string; direction: string } | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${key}&file_type=json&sort_order=desc&limit=2`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const obs = data.observations;
    if (!obs?.length) return null;
    const latest = obs[0].value;
    const prev = obs[1]?.value;
    let change = ''; let direction = 'flat';
    if (prev && latest !== '.' && prev !== '.') {
      const diff = (parseFloat(latest) - parseFloat(prev)) * 100;
      change = `${diff >= 0 ? '+' : ''}${diff.toFixed(0)} bps`;
      direction = diff >= 0 ? 'up' : 'down';
    }
    return { value: `${latest}%`, change, direction };
  } catch { return null; }
}

// ─── Edition ────────────────────────────────────────────────────────────
function getEdition(): string {
  const start = new Date('2026-02-01T00:00:00-05:00');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const num = Math.max(1, diffDays + 1);
  return `Vol. I, No. ${String(num).padStart(3, '0')}`;
}

// ─── Headline Generator ────────────────────────────────────────────────
function generateHeadline(
  spy: YahooQuote | null,
  vix: YahooQuote | null,
  crypto: { btc: { price: number; changePct: number } } | null,
): { title: string; deck: string; meta: string[] } {
  const spyPct = spy?.changePct ?? 0;
  const vixVal = vix?.price ?? 0;
  const btcPct = crypto?.btc?.changePct ?? 0;
  let title = 'Markets in Motion: Daily Briefing';
  let deck = 'Review today\'s market conditions, key levels, and upcoming catalysts.';
  const meta: string[] = [];
  if (Math.abs(spyPct) > 1.5) {
    if (spyPct > 0) { title = 'Markets Surge: S&P 500 Rallies on Broad Strength'; deck = `Equities jumping ${spyPct.toFixed(1)}% as buyers step in across sectors.`; }
    else { title = 'Sell-Off Deepens: S&P 500 Under Pressure'; deck = `Markets sliding ${Math.abs(spyPct).toFixed(1)}% amid risk-off sentiment.`; }
  } else if (vixVal > 25) {
    title = 'Volatility Spikes: VIX Flashes Caution';
    deck = `Fear gauge at ${vixVal.toFixed(1)} — elevated uncertainty weighing on sentiment.`;
  } else if (Math.abs(btcPct) > 5) {
    if (btcPct > 0) { title = `Bitcoin Rips ${btcPct.toFixed(0)}%: Crypto Markets on Fire`; deck = `BTC at $${(crypto?.btc?.price ?? 0).toLocaleString()}.`; }
    else { title = `Bitcoin Drops ${Math.abs(btcPct).toFixed(0)}%: Crypto Sells Off`; deck = `BTC at $${(crypto?.btc?.price ?? 0).toLocaleString()}.`; }
  } else if (spyPct >= 0) {
    title = 'Steady Advance: Markets Grind Higher';
    deck = 'Equities edging up in measured trade. Low volatility environment favors trend-following.';
  } else {
    title = 'Markets Pause: Modest Pullback in Equities';
    deck = 'Slight weakness across indices as traders digest recent gains.';
  }
  if (spy) meta.push(`SPY ${spy.changePct >= 0 ? '+' : ''}${spy.changePct.toFixed(2)}%`);
  if (vix) meta.push(`VIX ${vix.price.toFixed(2)}`);
  if (crypto) meta.push(`BTC $${crypto.btc.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
  return { title, deck, meta };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════
export async function GET() {
  const cacheSeconds = getCacheSeconds();

  const [crypto, market, yield10y, weather, sports, fearGreed] = await Promise.all([
    getCrypto(),
    getMarketData(),
    get10YYield(),
    getWeather(),
    getAllSports(),
    getFearGreed(),
  ]);

  // Build ticker
  const ticker = [...market.ticker];
  const vixIdx = ticker.findIndex(t => t.symbol === 'VIX');
  if (crypto) {
    const btcTicker = { symbol: 'BTC', price: crypto.btc.price, change: 0, changePct: crypto.btc.changePct };
    if (vixIdx >= 0) ticker.splice(vixIdx, 0, btcTicker);
    else ticker.push(btcTicker);
  }

  // Headline
  const headline = generateHeadline(market.raw.spy, market.raw.vix, crypto);

  // Stories for pit preview
  const stories = [
    { title: 'Earnings Reports in Focus', excerpt: 'Check today\'s pre-market and after-close reports.', section: 'Earnings Watch' },
    { title: 'Tracking Unusual Activity', excerpt: `VIX at ${market.raw.vix?.price?.toFixed(2) ?? '--'}.`, section: 'Options Flow' },
    { title: 'Key Levels & Catalysts', excerpt: `SPY at $${market.raw.spy?.price?.toFixed(2) ?? '--'}, watching for follow-through.`, section: 'Market Intel' },
  ];

  // Quick stats
  const quick_stats = {
    vix: market.raw.vix ? market.raw.vix.price.toFixed(2) : '--',
    yield_10y: yield10y?.value ?? '--',
    dxy: market.raw.dxy ? market.raw.dxy.price.toFixed(2) : '--',
    fear_greed: fearGreed !== '--' ? fearGreed : '--',
  };

  // Calendar
  const calendar = [
    { time: '9:30 AM', event: 'Market Open', note: 'Regular session begins' },
    { time: '4:00 PM', event: 'Market Close', note: 'Regular session ends' },
  ];

  // Quote
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const brief = {
    generated_at: new Date().toISOString(),
    edition: getEdition(),
    ticker,
    headline,
    stories,
    sports,
    weather,
    calendar,
    quick_stats,
    quote,
  };

  return NextResponse.json(brief, {
    headers: { 'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=60` },
  });
}
