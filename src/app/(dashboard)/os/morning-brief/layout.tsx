'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ═══════════════════════════════════════════════════════════════════════════
// THE MORNING BRIEF — Shared Layout (v2)
// Multi-section newspaper with shared masthead, nav, ticker, footer
// Design by Paula · Built by Anders · 2026-02-12
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────
interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

interface WeatherData {
  temp: number;
  high: number;
  low: number;
  condition: string;
  location: string;
}

interface BriefLayoutData {
  ticker: TickerItem[];
  weather: WeatherData;
  edition: string;
  quote: { text: string; author: string };
}

// ─── Day Navigation Context ─────────────────────────────────────────────
interface DayContextType {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  isToday: boolean;
  isFuture: boolean;
  goBack: () => void;
  goForward: () => void;
  goToday: () => void;
  formatDateLabel: (key: string) => string;
  getDateForDisplay: (key: string) => string;
}

const DayContext = createContext<DayContextType | null>(null);
export function useDayContext() {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error('useDayContext must be used within MorningBriefLayout');
  return ctx;
}

// ─── Helpers ────────────────────────────────────────────────────────────
function toDateKey(d: Date): string {
  return d.toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
}
function todayKey(): string { return toDateKey(new Date()); }
function shiftDate(dateKey: string, days: number): string {
  const parts = dateKey.split('/');
  const d = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}
function formatDateLabelFn(dateKey: string): string {
  const parts = dateKey.split('/');
  const d = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(d); target.setHours(0,0,0,0);
  if (target.getTime() === today.getTime()) return 'Today';
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function getDateForDisplayFn(dateKey: string): string {
  const parts = dateKey.split('/');
  const d = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function fmtPrice(price: number, symbol: string): string {
  if (symbol === 'BTC' || symbol === 'ETH') return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

// ─── Section Navigation Config ──────────────────────────────────────────
const SECTIONS = [
  { label: 'Front Page', href: '/os/morning-brief' },
  { label: 'The Pit', href: '/os/morning-brief/the-pit' },
  { label: 'Sports', href: '/os/morning-brief/sports' },
  { label: 'Tech', href: '/os/morning-brief/tech' },
  { label: 'Local', href: '/os/morning-brief/local' },
  { label: 'AI Today', href: '/os/morning-brief/ai-today' },
];

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function MorningBriefLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [layoutData, setLayoutData] = useState<BriefLayoutData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(todayKey());

  const isToday = selectedDay === todayKey();
  const isFuture = (() => {
    const parts = selectedDay.split('/');
    const sel = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    sel.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    return sel > now;
  })();

  const goBack = useCallback(() => setSelectedDay(prev => shiftDate(prev, -1)), []);
  const goForward = useCallback(() => setSelectedDay(prev => shiftDate(prev, 1)), []);
  const goToday = useCallback(() => setSelectedDay(todayKey()), []);

  // Fetch layout data (ticker + weather + edition)
  useEffect(() => {
    async function fetchLayout() {
      try {
        const res = await fetch('/api/morning-brief');
        if (!res.ok) return;
        const data = await res.json();
        setLayoutData({
          ticker: data.ticker ?? [],
          weather: data.weather ?? { temp: 0, condition: 'Unknown', location: 'Nashua, NH', high: 0, low: 0 },
          edition: data.edition ?? '',
          quote: data.quote ?? { text: '', author: '' },
        });
      } catch (e) {
        console.error('Layout data fetch failed:', e);
      }
    }
    fetchLayout();
    const interval = setInterval(fetchLayout, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const dayCtx: DayContextType = {
    selectedDay,
    setSelectedDay,
    isToday,
    isFuture,
    goBack,
    goForward,
    goToday,
    formatDateLabel: formatDateLabelFn,
    getDateForDisplay: getDateForDisplayFn,
  };

  return (
    <DayContext.Provider value={dayCtx}>
      <style>{MORNING_BRIEF_CSS}</style>
      <div className="newspaper">
        {/* ══════════ MASTHEAD ══════════ */}
        <header className="masthead">
          <div className="masthead-top">
            {/* Day Navigation */}
            <div className="mb-day-nav">
              <button onClick={goBack} className="mb-day-btn" title="Previous day">&#8592;</button>
              <div className="mb-day-label">
                <div className="mb-day-relative">{formatDateLabelFn(selectedDay)}</div>
                <div className="masthead-date">{getDateForDisplayFn(selectedDay)}</div>
              </div>
              <button onClick={goForward} className="mb-day-btn" title="Next day">&#8594;</button>
              {!isToday && (
                <button onClick={goToday} className="mb-today-btn">Today</button>
              )}
            </div>
            <div className="masthead-weather">
              {layoutData?.weather ? (
                <>
                  <span className="weather-temp">{layoutData.weather.temp}°F</span>
                  <span className="weather-cond">{layoutData.weather.condition}</span>
                  <span className="weather-loc">{layoutData.weather.location}</span>
                </>
              ) : (
                <span className="weather-loc">Loading...</span>
              )}
            </div>
          </div>
          <h1 className="masthead-title">THE MORNING <span>BRIEF</span></h1>
          <p className="masthead-tagline">Trade by day. Build by night. Dad of 7 always.</p>
          {layoutData?.edition && (
            <div className="masthead-edition">{layoutData.edition}</div>
          )}
        </header>

        {/* ══════════ SECTION NAV ══════════ */}
        <nav className="section-nav">
          {SECTIONS.map(s => {
            const isActive = pathname === s.href || 
              (s.href !== '/os/morning-brief' && pathname?.startsWith(s.href));
            const isFrontActive = s.href === '/os/morning-brief' && pathname === '/os/morning-brief';
            return (
              <a
                key={s.href}
                href={s.href}
                className={`nav-item ${isActive || isFrontActive ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); router.push(s.href); }}
              >
                {s.label}
              </a>
            );
          })}
        </nav>

        {/* ══════════ TICKER BAR ══════════ */}
        <div className="ticker-bar">
          {layoutData?.ticker?.map((t) => (
            <div key={t.symbol} className="ticker-item">
              <span className="ticker-symbol">{t.symbol}</span>
              <span className="ticker-price">{fmtPrice(t.price, t.symbol)}</span>
              <span className={`ticker-change ${t.changePct >= 0 ? 'up' : 'down'}`}>
                {t.changePct >= 0 ? '+' : ''}{t.changePct.toFixed(2)}%
              </span>
            </div>
          )) ?? (
            <div className="ticker-item">
              <span className="ticker-symbol" style={{ color: '#525252' }}>Loading market data...</span>
            </div>
          )}
        </div>

        {/* ══════════ PAGE CONTENT ══════════ */}
        {children}

        {/* ══════════ FOOTER ══════════ */}
        <footer className="footer">
          {layoutData?.quote?.text ? (
            <>
              <p className="footer-quote">&ldquo;{layoutData.quote.text}&rdquo;</p>
              <p className="footer-attr">— {layoutData.quote.author}</p>
            </>
          ) : null}
          <div className="footer-tagline">Imagination → Implementation</div>
        </footer>
      </div>
    </DayContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS — Paula's Design System + Layout additions
// ═══════════════════════════════════════════════════════════════════════════
const MORNING_BRIEF_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* CSS Variables */
:root {
  --amber: #F59E0B;
  --amber-light: #FCD34D;
  --amber-dark: #D97706;
  --bg-dark: #0A0A0A;
  --bg-card: #111111;
  --bg-elevated: #181818;
  --bg-hover: #1F1F1F;
  --text-primary: #FAFAFA;
  --text-secondary: #A3A3A3;
  --text-muted: #525252;
  --border: #262626;
  --border-light: #333333;
  --green: #22C55E;
  --red: #EF4444;
  --blue: #3B82F6;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Reset within newspaper */
.newspaper * { box-sizing: border-box; }
.newspaper { 
  max-width: 1400px; 
  margin: 0 auto; 
  background: var(--bg-card); 
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-primary);
  line-height: 1.5;
}
.newspaper a { color: inherit; text-decoration: none; }

/* ═══════════ MASTHEAD ═══════════ */
.masthead {
  text-align: center;
  padding: 24px 32px 20px;
  border-bottom: 3px double var(--amber);
  position: relative;
}
.masthead-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.masthead-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.masthead-weather {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
}
.weather-temp { color: var(--text-primary); font-weight: 600; }
.weather-cond { color: var(--text-secondary); }
.weather-loc { color: var(--text-muted); }
.masthead-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1;
  margin-bottom: 8px;
}
.masthead-title span { color: var(--amber); }
.masthead-tagline {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 3px;
  text-transform: uppercase;
}
.masthead-edition {
  font-family: 'Playfair Display', serif;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* Day Navigation */
.mb-day-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mb-day-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 10px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  line-height: 1;
}
.mb-day-btn:hover { border-color: var(--amber); color: var(--amber); }
.mb-day-label { text-align: center; min-width: 180px; }
.mb-day-relative {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.mb-today-btn {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 4px;
  padding: 4px 12px;
  color: var(--amber);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.mb-today-btn:hover { background: rgba(245, 158, 11, 0.25); }

/* ═══════════ NAVIGATION ═══════════ */
.section-nav {
  display: flex;
  justify-content: center;
  gap: 0;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}
.nav-item {
  padding: 14px 24px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
}
.nav-item:hover { color: var(--text-primary); background: var(--bg-hover); }
.nav-item.active { color: var(--amber); border-bottom-color: var(--amber); }

/* ═══════════ TICKER BAR ═══════════ */
.ticker-bar {
  display: flex;
  gap: 32px;
  padding: 10px 24px;
  background: var(--bg-dark);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.ticker-item { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.ticker-symbol { color: var(--text-muted); font-weight: 500; }
.ticker-price { color: var(--text-primary); }
.ticker-change { font-size: 11px; padding: 2px 6px; border-radius: 3px; }
.ticker-change.up { background: rgba(34, 197, 94, 0.15); color: var(--green); }
.ticker-change.down { background: rgba(239, 68, 68, 0.15); color: var(--red); }

/* ═══════════ FOOTER ═══════════ */
.footer {
  text-align: center;
  padding: 32px;
  border-top: 3px double var(--amber);
  background: var(--bg-elevated);
}
.footer-quote {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.footer-attr { font-size: 12px; color: var(--text-muted); }
.footer-tagline {
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--amber);
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* ═══════════ FRONT PAGE ═══════════ */
.front-page { padding: 24px; }

/* Lead Story */
.lead-story {
  padding: 32px;
  margin-bottom: 24px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left: 4px solid var(--amber);
}
.section-flag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  color: var(--amber);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}
.lead-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 12px;
}
.lead-deck {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  max-width: 800px;
}
.lead-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 16px;
}
.meta-section { color: var(--amber); font-weight: 600; }

/* Three Column Grid */
.front-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}
@media (max-width: 1024px) { .front-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .front-grid { grid-template-columns: 1fr; } }

.front-column {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 20px;
}
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--amber);
  cursor: pointer;
}
.column-header h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
}
.column-header:hover h3 { color: var(--amber); }
.see-all { font-size: 11px; color: var(--text-muted); transition: color 0.2s; }
.column-header:hover .see-all { color: var(--amber); }

.front-story { padding: 12px 0; border-bottom: 1px solid var(--border); }
.front-story:last-of-type { border-bottom: none; }
.front-story h4 { font-size: 14px; font-weight: 600; line-height: 1.4; margin-bottom: 4px; }
.front-story p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

/* Quick Stats */
.quick-stats { display: flex; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.stat { flex: 1; text-align: center; padding: 12px; background: var(--bg-card); border-radius: 4px; }
.stat-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; display: block; }
.stat-value.up { color: var(--green); }
.stat-value.down { color: var(--red); }
.stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* Games Today */
.games-today { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.game { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 12px; border-bottom: 1px solid var(--border); }
.game:last-child { border-bottom: none; }
.game .teams { font-weight: 600; }
.game .time { color: var(--text-secondary); }
.game .line { font-family: 'JetBrains Mono', monospace; color: var(--amber); font-size: 11px; }

/* Trending Topics */
.trending-topics { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; flex-wrap: wrap; }
.topic { font-size: 11px; padding: 4px 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; color: var(--text-secondary); }

/* Bottom Row */
.front-bottom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 900px) { .front-bottom { grid-template-columns: 1fr 1fr; } .front-bottom > section:last-child { grid-column: span 2; } }
@media (max-width: 640px) { .front-bottom { grid-template-columns: 1fr; } .front-bottom > section:last-child { grid-column: span 1; } }

.bottom-section {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 20px;
}
.bottom-section h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--amber);
}
.local-story { padding: 8px 0; border-bottom: 1px solid var(--border); }
.local-story:last-child { border-bottom: none; }
.local-story h4 { font-size: 13px; font-weight: 500; line-height: 1.4; }

/* Calendar Items */
.calendar-list { display: flex; flex-direction: column; gap: 0; }
.calendar-item-front {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.calendar-item-front:last-child { border-bottom: none; }
.cal-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--amber); min-width: 65px; }
.cal-event { flex: 1; font-weight: 500; }
.cal-type { font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
.cal-type.econ { background: rgba(59, 130, 246, 0.15); color: var(--blue); }
.cal-type.earn { background: rgba(34, 197, 94, 0.15); color: var(--green); }

/* Headlines */
.headline-list { display: flex; flex-direction: column; gap: 0; }
.headline-item { padding: 10px 0; border-bottom: 1px solid var(--border); }
.headline-item:last-child { border-bottom: none; }
.headline-item h4 { font-size: 13px; font-weight: 500; line-height: 1.4; }
.headline-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: inline-block; }
.headline-tag.national { background: rgba(168, 85, 247, 0.15); color: #A855F7; }
.headline-tag.sports { background: rgba(245, 158, 11, 0.15); color: var(--amber); }

/* Weather Bar */
.weather-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 16px 24px; margin-top: 24px;
  background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 4px; font-size: 13px;
}
.weather-bar-location { font-weight: 600; color: var(--amber); }
.weather-bar-now { display: flex; align-items: center; gap: 12px; }
.weather-bar-temp { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; }
.weather-bar-cond { color: var(--text-secondary); }
.weather-bar-forecast { display: flex; gap: 16px; color: var(--text-muted); font-size: 12px; }
@media (max-width: 768px) {
  .weather-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
  .weather-bar-forecast { flex-wrap: wrap; gap: 8px 16px; }
}

/* ═══════════ SECTION PAGE LAYOUTS ═══════════ */
.section-page { padding: 24px; }
.section-header { margin-bottom: 24px; }
.section-title { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 900; margin-bottom: 8px; }
.section-subtitle { font-size: 14px; color: var(--text-secondary); }

/* ═══════════ TECH LAYOUT ═══════════ */
.tech-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
@media (max-width: 900px) { .tech-layout { grid-template-columns: 1fr; } }
.tech-river { display: flex; flex-direction: column; gap: 0; }

/* Story Cluster */
.story-cluster { padding: 20px 0; border-bottom: 1px solid var(--border); }
.cluster-main { margin-bottom: 12px; }
.cluster-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted); margin-bottom: 6px; }
.cluster-headline { font-size: 17px; font-weight: 600; line-height: 1.4; margin-bottom: 6px; }
.cluster-headline a:hover { color: var(--amber); }
.cluster-source { font-size: 12px; color: var(--amber); }
.cluster-deck { font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-top: 8px; }

.cluster-related { padding-left: 16px; border-left: 2px solid var(--border); margin-top: 12px; }
.related-item { display: flex; gap: 8px; padding: 6px 0; font-size: 13px; }
.related-source { color: var(--amber); min-width: 80px; }
.related-title { color: var(--text-secondary); }
.related-title:hover { color: var(--text-primary); }

.cluster-discussion { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 12px; color: var(--text-muted); }
.cluster-discussion a { color: var(--text-secondary); margin-right: 12px; }
.cluster-discussion a:hover { color: var(--amber); }

/* Tech Sidebar */
.tech-sidebar { display: flex; flex-direction: column; gap: 24px; }
.sidebar-box { background: var(--bg-elevated); border: 1px solid var(--border); padding: 16px; }
.sidebar-box h4 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 14px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--amber);
}

.leaderboard-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; border-bottom: 1px solid var(--border); }
.leaderboard-item:last-child { border-bottom: none; }
.leaderboard-rank { color: var(--text-muted); width: 20px; }
.leaderboard-name { flex: 1; }
.leaderboard-count { color: var(--amber); font-family: 'JetBrains Mono', monospace; }

/* ═══════════ MARKET TABLE ═══════════ */
.market-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.market-table th {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px; text-align: left; padding: 12px 8px;
  border-bottom: 2px solid var(--amber);
}
.market-table td { padding: 12px 8px; border-bottom: 1px solid var(--border); }
.market-table tr:hover { background: var(--bg-hover); }
.market-table .symbol { font-weight: 600; }
.market-table .price { font-family: 'JetBrains Mono', monospace; }
.market-table .change { font-family: 'JetBrains Mono', monospace; }
.market-table .change.up { color: var(--green); }
.market-table .change.down { color: var(--red); }
.market-table .note { color: var(--text-muted); font-size: 12px; }

/* ═══════════ SPORTS SCOREBOARD ═══════════ */
.scoreboard { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
.score-card { background: var(--bg-elevated); border: 1px solid var(--border); padding: 16px; border-radius: 4px; }
.score-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 11px; color: var(--text-muted); }
.score-card-league { font-weight: 600; color: var(--amber); }
.score-card-teams { display: flex; flex-direction: column; gap: 8px; }
.score-team { display: flex; justify-content: space-between; align-items: center; }
.team-name { font-weight: 600; font-size: 15px; }
.team-name.winner { color: var(--amber); }
.team-score { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; }
.score-card-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 11px; color: var(--text-muted); }

/* ═══════════ AI TODAY ═══════════ */
.ai-headlines { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
@media (max-width: 1024px) { .ai-headlines { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) { .ai-headlines { grid-template-columns: 1fr 1fr; } }
.ai-headline-card { background: var(--bg-elevated); border: 1px solid var(--border); padding: 16px; border-top: 3px solid var(--amber); }
.ai-headline-card .company { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--amber); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.ai-headline-card h3 { font-size: 14px; font-weight: 600; line-height: 1.4; margin-bottom: 8px; }
.ai-headline-card .meta { font-size: 11px; color: var(--text-muted); }

.category-section { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid var(--border); }
.category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--amber); }
.category-header h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; }
.category-header .tier-badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 4px 8px; background: rgba(245, 158, 11, 0.15); color: var(--amber); border-radius: 3px; }

.category-stories { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
@media (max-width: 768px) { .category-stories { grid-template-columns: 1fr; } }
.category-story { padding: 16px; background: var(--bg-elevated); border: 1px solid var(--border); }
.category-story .source { font-size: 11px; color: var(--amber); margin-bottom: 6px; }
.category-story h4 { font-size: 14px; font-weight: 600; line-height: 1.4; margin-bottom: 6px; }
.category-story p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

.category-links { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 12px; }
.category-links a { color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
.category-links a:hover { color: var(--amber); }
.category-links .link-source { color: var(--text-muted); }

.player-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; margin-top: 12px; }
.player-tag { font-size: 11px; padding: 6px 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; text-align: center; }
.player-tag.tier-a { border-color: var(--amber); color: var(--amber); }

/* ═══════════ SECTION TABLE HEADER ═══════════ */
.section-table-header {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--amber);
}

/* Boston game highlight */
.market-table tr.boston-game { background: rgba(245, 158, 11, 0.1); }

/* ═══════════ UTILITIES ═══════════ */
.up { color: var(--green); }
.down { color: var(--red); }
.text-muted { color: var(--text-muted); }
.text-secondary { color: var(--text-secondary); }
.text-amber { color: var(--amber); }

/* Loading State */
.loading-pulse {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 3px;
  animation: pulse 2s ease-in-out infinite;
  text-align: center;
  padding: 48px;
}
`;