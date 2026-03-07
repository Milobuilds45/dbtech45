'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────
interface MarketIndex {
  name: string;
  price: string;
  change: string;
  changePct: string;
  direction: string;
}

interface MarketData {
  ticker: { symbol: string; price: string; change: string; direction: 'up' | 'down' }[];
  indices: MarketIndex[];
  commodities: MarketIndex[];
  crypto: MarketIndex[];
  updatedAt?: string;
}

interface Headline {
  title: string;
  url: string;
  source: string;
  description: string;
  thumbnail: string | null;
  age: string;
  category: string;
}

interface SportsGame {
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  detail: string;
  startTime: string;
  isBoston: boolean;
}

interface SportsHeadline {
  title: string;
  description: string;
  url: string;
  source: string;
  image: string | null;
  league: string;
  published: string;
}

interface WeatherData {
  current: { temp: number; condition: string; emoji: string };
  forecast: { day: string; high: number; low: number; emoji: string }[];
}

// ─── Market Sentiment Images (Unsplash – free, no attribution required) ──
// High-res curated images keyed by sentiment. 1200w for crisp display on 2x screens.
const MARKET_IMAGES = {
  // Big sell-off — red charts, bear market vibes
  crashDown: [
    'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=1200&h=680&fit=crop&crop=center&q=90', // red candlestick chart
    'https://images.unsplash.com/photo-1639754390580-2e7437267698?w=1200&h=680&fit=crop&crop=center&q=90', // bear market red chart
  ],
  // Mild red day
  down: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=680&fit=crop&crop=center&q=90', // trading screens
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&h=680&fit=crop&crop=center&q=90', // stock chart
  ],
  // Flat / sideways
  flat: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=680&fit=crop&crop=center&q=90', // NYSE trading floor
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=680&fit=crop&crop=center&q=90', // wall street sign
  ],
  // Mild green day
  up: [
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=680&fit=crop&crop=center&q=90', // green chart upward
    'https://images.unsplash.com/photo-1620266757065-5814239881fd?w=1200&h=680&fit=crop&crop=center&q=90', // bull statue
  ],
  // Big rally — bull market vibes
  rallyUp: [
    'https://images.unsplash.com/photo-1620266757065-5814239881fd?w=1200&h=680&fit=crop&crop=center&q=90', // charging bull
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=680&fit=crop&crop=center&q=90', // green rally chart
  ],
};

function pickImage(pool: string[]): string {
  // Rotate by day so it's not random on every render but changes daily
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return pool[dayOfYear % pool.length];
}

// ─── Dynamic Headline Generator ─────────────────────────────
function getMarketHeadline(topIndex: MarketIndex | undefined): { flag: string; headline: string; deck: string; icon: string; image: string } {
  if (!topIndex) {
    return { flag: 'Markets Today', headline: 'Markets Update — Loading...', deck: 'Loading market data...', icon: '📊', image: pickImage(MARKET_IMAGES.flat) };
  }

  const pctStr = topIndex.changePct.replace('%', '').replace('+', '');
  const pct = parseFloat(pctStr);
  const isUp = topIndex.direction === 'up';
  const absPct = Math.abs(pct);

  // Time-aware deck text
  const now = new Date();
  const etHour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/New_York' }));
  const etMin = parseInt(now.toLocaleString('en-US', { minute: 'numeric', timeZone: 'America/New_York' }));
  const totalMinutes = etHour * 60 + etMin;

  let timeContext: string;
  if (totalMinutes < 570) { // Before 9:30 AM
    timeContext = `Pre-market futures are ${isUp ? 'green' : 'red'} heading into the open. Full breakdown inside The Pit.`;
  } else if (totalMinutes < 960) { // 9:30 AM - 4:00 PM
    if (absPct > 1.5) {
      timeContext = isUp
        ? `Markets are rallying hard in today\'s session. Momentum is strong across the board.`
        : `Markets are selling off sharply in today\'s session. Risk-off sentiment in play.`;
    } else {
      timeContext = isUp
        ? `Markets are grinding higher in today\'s session. Buyers are in control.`
        : `Markets are trading lower in today\'s session. Sellers have the edge.`;
    }
  } else { // After 4:00 PM
    timeContext = `Markets closed ${isUp ? 'up' : 'down'} ${topIndex.changePct} today. ${isUp ? 'Bulls held the line.' : 'Bears won the session.'}`;
  }

  let headline: string;
  let icon: string;
  let flag: string;

  let image: string;

  if (absPct > 2) {
    if (isUp) {
      headline = `Rally Mode — S&P Surges ${topIndex.changePct}`;
      icon = '🚀';
      flag = 'Breaking';
      image = pickImage(MARKET_IMAGES.rallyUp);
    } else {
      headline = `Markets Sell Off Hard — S&P Drops ${absPct.toFixed(1)}%`;
      icon = '🔻';
      flag = 'Breaking';
      image = pickImage(MARKET_IMAGES.crashDown);
    }
  } else if (absPct > 0.5) {
    if (isUp) {
      headline = `Bulls Take Charge — ES Climbs to ${topIndex.price}`;
      icon = '📈';
      flag = 'Markets Today';
      image = pickImage(MARKET_IMAGES.up);
    } else {
      headline = `Red Day on Wall Street — ES Down ${absPct.toFixed(2)}%`;
      icon = '📉';
      flag = 'Markets Today';
      image = pickImage(MARKET_IMAGES.down);
    }
  } else {
    headline = `Markets Drift Sideways — S&P Holds ${topIndex.price}`;
    icon = '➡️';
    flag = 'Markets Today';
    image = pickImage(MARKET_IMAGES.flat);
  }

  return { flag, headline, deck: timeContext, icon, image };
}

function formatUpdatedAt(isoString: string | undefined): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET';
  } catch {
    return '';
  }
}

// ─── Styles ─────────────────────────────────────────────────
const s = {
  // Content wrapper (no page background — layout handles that)
  content: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },

  // Lead Story
  lead: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' },
  leadMain: { padding: '24px', background: '#111', border: '1px solid #262626', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' },
  leadFlag: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' as const, letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  leadFlagBreaking: { color: '#ef4444' },
  leadIcon: { fontSize: '16px' },
  leadHeadline: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700, lineHeight: 1.2, marginBottom: '10px' },
  leadDeck: { fontSize: '14px', color: '#a3a3a3', lineHeight: 1.5, marginBottom: '12px' },
  leadMeta: { fontSize: '11px', color: '#525252', display: 'flex', gap: '16px' },
  leadMetaSection: { color: '#f59e0b', fontWeight: 600 },

  // Market cards column
  leadMarkets: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  marketsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  marketsTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 600, color: '#737373', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  marketsUpdated: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#525252' },
  marketCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#111', border: '1px solid #262626' },
  marketName: { fontSize: '13px', fontWeight: 600 },
  marketPrice: { fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600 },
  marketChange: (dir: string) => ({ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: dir === 'up' ? '#22c55e' : '#ef4444' }),

  // Three Column Grid
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' },
  column: { background: '#111', border: '1px solid #262626', padding: '20px' },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginBottom: '14px', borderBottom: '2px solid #f59e0b', textDecoration: 'none', color: 'inherit' },
  colTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600 },
  seeAll: { fontSize: '11px', color: '#525252' },

  // Story card
  storyCard: { padding: '12px 0', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '12px' },
  storyText: { flex: 1 },
  storyTitle: { fontSize: '13px', fontWeight: 600, lineHeight: 1.4, marginBottom: '4px' },
  storyDesc: { fontSize: '12px', color: '#a3a3a3', lineHeight: 1.4 },
  storyMeta: { fontSize: '10px', color: '#525252', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' },
  storyTag: (color: string) => ({ fontSize: '9px', padding: '1px 6px', borderRadius: '3px', background: `${color}20`, color, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.5px' }),
  storyThumb: { width: '80px', height: '60px', borderRadius: '4px', objectFit: 'cover' as const, background: '#1a1a1a', flexShrink: 0 },

  // Weather bar
  weatherBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', padding: '14px 20px', background: '#111', border: '1px solid #262626', borderRadius: '4px', fontSize: '13px' },
  weatherLoc: { fontWeight: 600, color: '#f59e0b' },
  weatherNow: { display: 'flex', alignItems: 'center', gap: '12px' },
  weatherTemp: { fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700 },
  weatherCond: { color: '#a3a3a3' },
  weatherForecast: { display: 'flex', gap: '16px', color: '#525252', fontSize: '12px' },

  // Score card
  scoreTeam: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' },
  scoreVal: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 },
} as const;

// ─── Component ──────────────────────────────────────────────
export default function DailyBriefPage() {
  const [markets, setMarkets] = useState<MarketData | null>(null);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [sportsHeadlines, setSportsHeadlines] = useState<SportsHeadline[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const now = new Date();

  useEffect(() => {
    fetch('/api/morning-brief/markets').then(r => r.json()).then(setMarkets).catch(() => {});
    fetch('/api/morning-brief/headlines').then(r => r.json()).then(d => setHeadlines(d.stories || [])).catch(() => {});
    fetch('/api/morning-brief/sports').then(r => r.json()).then(d => setSportsHeadlines(d.headlines || [])).catch(() => {});
    fetch('/api/morning-brief/weather').then(r => r.json()).then(setWeather).catch(() => {});

    // Auto-refresh market data every 5 minutes
    const interval = setInterval(() => {
      fetch('/api/morning-brief/markets').then(r => r.json()).then(setMarkets).catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const topHeadlines = headlines.filter(h => h.category === 'NATIONAL' || h.category === 'MARKETS').slice(0, 5);
  const techHeadlines = headlines.filter(h => h.category === 'TECH' || h.category === 'AI').slice(0, 5);
  const topIndex = markets?.indices?.[0];
  const { flag, headline, deck, icon, image } = getMarketHeadline(topIndex);
  const updatedTime = formatUpdatedAt(markets?.updatedAt);

  return (
    <div style={s.content}>
      {/* ── LEAD: Headline + Market Cards ── */}
      <div style={s.lead}>
        <div style={s.leadMain}>
          <div style={{ ...s.leadFlag, ...(flag === 'Breaking' ? s.leadFlagBreaking : {}) }}>
            <span style={s.leadIcon}>{icon}</span>
            <span>{flag}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Market sentiment"
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '6px',
              marginBottom: '14px',
              background: '#1a1a1a',
              display: 'block',
            }}
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h2 style={s.leadHeadline}>{headline}</h2>
          <p style={s.leadDeck}>{deck}</p>
          <div style={s.leadMeta}>
            <span style={s.leadMetaSection}>THE PIT</span>
            <span>{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET</span>
          </div>
        </div>
        <div style={s.leadMarkets}>
          <div style={s.marketsHeader}>
            <span style={s.marketsTitle}>Market Snapshot</span>
            {updatedTime && <span style={s.marketsUpdated}>Updated {updatedTime}</span>}
          </div>
          {(markets?.indices || []).slice(0, 4).map((idx, i) => (
            <div key={i} style={s.marketCard}>
              <span style={s.marketName}>{idx.name}</span>
              <span style={s.marketPrice}>{idx.price}</span>
              <span style={s.marketChange(idx.direction)}>{idx.changePct}</span>
            </div>
          ))}
          {(markets?.crypto || []).slice(0, 2).map((c, i) => (
            <div key={`c${i}`} style={s.marketCard}>
              <span style={s.marketName}>{c.name}</span>
              <span style={s.marketPrice}>{c.price}</span>
              <span style={s.marketChange(c.direction)}>{c.changePct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── THREE COLUMNS: Headlines, Sports, Tech ── */}
      <div style={s.grid3}>
        {/* Headlines */}
        <div style={s.column}>
          <div style={s.colHeader}>
            <h3 style={s.colTitle}>Headlines</h3>
          </div>
          {topHeadlines.length > 0 ? topHeadlines.map((h, i) => (
            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={s.storyCard}>
                {h.thumbnail && <img src={h.thumbnail} alt="" style={s.storyThumb} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <div style={s.storyText}>
                  <div style={s.storyTitle}>{h.title}</div>
                  <div style={s.storyMeta}>
                    <span style={s.storyTag('#a855f7')}>{h.category}</span>
                    <span>{h.source}</span>
                    {h.age && <span>{h.age}</span>}
                  </div>
                </div>
              </div>
            </a>
          )) : (
            <div style={{ padding: '20px', color: '#525252', fontSize: '13px' }}>Loading headlines...</div>
          )}
        </div>

        {/* Sports — NFL, NBA, Red Sox headlines */}
        <div style={s.column}>
          <Link href="/os/morning-brief/sports" style={s.colHeader}>
            <h3 style={s.colTitle}>Sports</h3>
            <span style={s.seeAll}>Full Section →</span>
          </Link>
          {sportsHeadlines.length > 0 ? sportsHeadlines.slice(0, 5).map((h, i) => (
            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={s.storyCard}>
                {h.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.image} alt="" style={s.storyThumb} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div style={s.storyText}>
                  <div style={s.storyTitle}>{h.title}</div>
                  <div style={s.storyMeta}>
                    <span style={s.storyTag(h.league === 'RED SOX' ? '#c53030' : '#f59e0b')}>{h.league}</span>
                    <span>{h.source}</span>
                  </div>
                </div>
              </div>
            </a>
          )) : (
            <div style={{ padding: '20px', color: '#525252', fontSize: '13px' }}>Loading sports headlines...</div>
          )}
        </div>

        {/* Tech + AI */}
        <div style={s.column}>
          <Link href="/os/morning-brief/tech" style={s.colHeader}>
            <h3 style={s.colTitle}>Tech & AI</h3>
            <span style={s.seeAll}>Full Section →</span>
          </Link>
          {techHeadlines.length > 0 ? techHeadlines.map((h, i) => (
            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={s.storyCard}>
                {h.thumbnail && <img src={h.thumbnail} alt="" style={s.storyThumb} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <div style={s.storyText}>
                  <div style={s.storyTitle}>{h.title}</div>
                  <div style={s.storyMeta}>
                    <span style={s.storyTag('#3b82f6')}>{h.category}</span>
                    <span>{h.source}</span>
                    {h.age && <span>{h.age}</span>}
                  </div>
                </div>
              </div>
            </a>
          )) : (
            <div style={{ padding: '20px', color: '#525252', fontSize: '13px' }}>Loading tech news...</div>
          )}
        </div>
      </div>

      {/* ── WEATHER BAR ── */}
      {weather && (
        <div style={s.weatherBar}>
          <span style={s.weatherLoc}>Nashua, NH</span>
          <div style={s.weatherNow}>
            <span style={s.weatherTemp}>{Math.round(weather.current.temp)}°F</span>
            <span style={s.weatherCond}>{weather.current.emoji} {weather.current.condition}</span>
          </div>
          <div style={s.weatherForecast}>
            {weather.forecast?.slice(0, 4).map((f, i) => (
              <span key={i}>{f.day}: {f.high}°/{f.low}° {f.emoji}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
