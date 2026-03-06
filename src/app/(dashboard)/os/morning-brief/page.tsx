'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ─── Volume Counter ─────────────────────────────────────────
// Launch date: March 6, 2026 — Volume increments daily
const LAUNCH_DATE = new Date('2026-03-06T00:00:00-05:00');
function getVolume(): string {
  const now = new Date();
  const diff = now.getTime() - LAUNCH_DATE.getTime();
  const days = Math.max(1, Math.floor(diff / 86400000) + 1);
  return `#${String(days).padStart(4, '0')}`;
}

// ─── Types ──────────────────────────────────────────────────
interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
}

interface MarketIndex {
  name: string;
  price: string;
  change: string;
  changePct: string;
  direction: string;
}

interface MarketData {
  ticker: TickerItem[];
  indices: MarketIndex[];
  commodities: MarketIndex[];
  crypto: MarketIndex[];
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

interface WeatherData {
  current: { temp: number; condition: string; emoji: string };
  forecast: { day: string; high: number; low: number; emoji: string }[];
}

// ─── Styles ─────────────────────────────────────────────────
const s = {
  page: { padding: 0, background: '#0a0a0f', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: '#f5f5f5' },

  // Ticker
  ticker: { display: 'flex', gap: '28px', padding: '10px 24px', background: '#06070b', borderBottom: '1px solid rgba(245,158,11,0.15)', overflowX: 'auto' as const, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', whiteSpace: 'nowrap' as const },
  tickerItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  tickerSymbol: { color: '#737373', fontWeight: 600 },
  tickerPrice: { color: '#f5f5f5' },
  tickerUp: { color: '#22c55e', fontSize: '11px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(34,197,94,0.12)' },
  tickerDown: { color: '#ef4444', fontSize: '11px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(239,68,68,0.12)' },

  // Masthead
  masthead: { textAlign: 'center' as const, padding: '28px 32px 24px', borderBottom: '3px double #f59e0b' },
  mastheadTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  mastheadDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#525252', letterSpacing: '1px', textTransform: 'uppercase' as const },
  mastheadVolume: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#f59e0b', letterSpacing: '1.5px', fontWeight: 600 },
  mastheadTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1, marginBottom: '8px' },
  mastheadAccent: { color: '#f59e0b' },
  mastheadTagline: { fontSize: '11px', color: '#525252', letterSpacing: '3px', textTransform: 'uppercase' as const },

  // Section Nav
  sectionNav: { display: 'flex', justifyContent: 'center', gap: 0, background: '#111', borderBottom: '1px solid #262626', overflowX: 'auto' as const },
  navItem: { padding: '12px 24px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase' as const, letterSpacing: '0.5px', textDecoration: 'none', borderBottom: '2px solid transparent', whiteSpace: 'nowrap' as const },
  navItemActive: { color: '#f59e0b', borderBottom: '2px solid #f59e0b' },

  // Content
  content: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },

  // Lead Story
  lead: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' },
  leadMain: { padding: '32px', background: '#111', border: '1px solid #262626', borderLeft: '4px solid #f59e0b' },
  leadFlag: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' as const, letterSpacing: '2px', marginBottom: '12px' },
  leadHeadline: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: 700, lineHeight: 1.2, marginBottom: '12px' },
  leadDeck: { fontSize: '15px', color: '#a3a3a3', lineHeight: 1.6, marginBottom: '16px' },
  leadMeta: { fontSize: '11px', color: '#525252', display: 'flex', gap: '16px' },
  leadMetaSection: { color: '#f59e0b', fontWeight: 600 },
  leadMarkets: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
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

  // Story card (with optional thumbnail)
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
export default function MorningBriefPage() {
  const [markets, setMarkets] = useState<MarketData | null>(null);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [sports, setSports] = useState<SportsGame[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [volume] = useState(getVolume());
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' });

  useEffect(() => {
    fetch('/api/morning-brief/markets').then(r => r.json()).then(setMarkets).catch(() => {});
    fetch('/api/morning-brief/headlines').then(r => r.json()).then(d => setHeadlines(d.stories || [])).catch(() => {});
    fetch('/api/morning-brief/sports').then(r => r.json()).then(d => setSports(d.allGames || [])).catch(() => {});
    fetch('/api/morning-brief/weather').then(r => r.json()).then(setWeather).catch(() => {});
  }, []);

  const ticker = markets?.ticker || [];
  const topHeadlines = headlines.filter(h => h.category === 'NATIONAL' || h.category === 'MARKETS').slice(0, 5);
  const techHeadlines = headlines.filter(h => h.category === 'TECH' || h.category === 'AI').slice(0, 5);
  const marketHeadlines = headlines.filter(h => h.category === 'MARKETS').slice(0, 3);
  const bostonGames = sports.filter(g => g.isBoston);
  const recentResults = bostonGames.filter(g => g.status === 'final').slice(0, 3);
  const upcoming = bostonGames.filter(g => g.status === 'scheduled').slice(0, 3);
  const topIndex = markets?.indices?.[0];

  return (
    <div style={s.page}>
      {/* ── LIVE TICKER ── */}
      {ticker.length > 0 && (
        <div style={s.ticker}>
          {ticker.map((t, i) => (
            <div key={i} style={s.tickerItem}>
              <span style={s.tickerSymbol}>{t.symbol}</span>
              <span style={s.tickerPrice}>{t.price}</span>
              <span style={t.direction === 'up' ? s.tickerUp : s.tickerDown}>{t.change}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── MASTHEAD ── */}
      <div style={s.masthead}>
        <div style={s.mastheadTop}>
          <span style={s.mastheadDate}>{dateStr}</span>
          <span style={s.mastheadVolume}>VOL {volume}</span>
        </div>
        <h1 style={s.mastheadTitle}>
          THE <span style={s.mastheadAccent}>MORNING</span> BRIEF
        </h1>
        <div style={s.mastheadTagline}>DBTECH45 · IMAGINATION → IMPLEMENTATION</div>
      </div>

      {/* ── SECTION NAV ── */}
      <nav style={s.sectionNav}>
        <Link href="/os/morning-brief" style={{ ...s.navItem, ...s.navItemActive }}>Front Page</Link>
        <Link href="/os/morning-brief/the-pit" style={s.navItem}>The Pit</Link>
        <Link href="/os/morning-brief/sports" style={s.navItem}>Sports</Link>
        <Link href="/os/morning-brief/tech" style={s.navItem}>Tech</Link>
        <Link href="/os/morning-brief/ai-today" style={s.navItem}>AI Today</Link>
        <Link href="/os/morning-brief/local" style={s.navItem}>Local</Link>
      </nav>

      <div style={s.content}>
        {/* ── LEAD: Headline + Market Cards ── */}
        <div style={{ ...s.lead, '@media (max-width: 900px)': { gridTemplateColumns: '1fr' } } as React.CSSProperties}>
          <div style={s.leadMain}>
            <div style={s.leadFlag}>Markets Today</div>
            <h2 style={s.leadHeadline}>
              {topIndex
                ? `${topIndex.name} ${topIndex.direction === 'up' ? '▲' : '▼'} ${topIndex.changePct} — ${topIndex.price}`
                : 'Markets Update — Loading...'}
            </h2>
            <p style={s.leadDeck}>
              {marketHeadlines[0]?.title || (topIndex
                ? `Futures are ${topIndex.direction === 'up' ? 'green' : 'red'} heading into the open. Full breakdown inside The Pit.`
                : 'Loading market data...')}
            </p>
            <div style={s.leadMeta}>
              <span style={s.leadMetaSection}>THE PIT</span>
              <span>{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET</span>
            </div>
          </div>
          <div style={s.leadMarkets}>
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

          {/* Sports */}
          <div style={s.column}>
            <Link href="/os/morning-brief/sports" style={s.colHeader}>
              <h3 style={s.colTitle}>Sports</h3>
              <span style={s.seeAll}>Full Section →</span>
            </Link>
            {recentResults.length > 0 ? recentResults.map((g, i) => (
              <div key={i} style={s.storyCard}>
                <div style={s.storyText}>
                  <div style={{ ...s.scoreTeam, fontWeight: 600 }}>
                    <span>{g.awayTeam}</span>
                    <span style={s.scoreVal}>{g.awayScore}</span>
                  </div>
                  <div style={s.scoreTeam}>
                    <span>{g.homeTeam}</span>
                    <span style={s.scoreVal}>{g.homeScore}</span>
                  </div>
                  <div style={s.storyMeta}>
                    <span style={s.storyTag('#f59e0b')}>{g.league}</span>
                    <span>{g.detail}</span>
                  </div>
                </div>
              </div>
            )) : upcoming.length > 0 ? upcoming.map((g, i) => (
              <div key={i} style={s.storyCard}>
                <div style={s.storyText}>
                  <div style={s.storyTitle}>{g.awayTeam} @ {g.homeTeam}</div>
                  <div style={s.storyMeta}>
                    <span style={s.storyTag('#f59e0b')}>{g.league}</span>
                    <span>{g.startTime}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', color: '#525252', fontSize: '13px' }}>Loading scores...</div>
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
    </div>
  );
}
