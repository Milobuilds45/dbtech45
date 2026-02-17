'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDayContext } from './layout';

// ═══════════════════════════════════════════════════════════════════════════
// THE MORNING BRIEF — Front Page
// Design by Paula · Built by Anders · 2026-02-12
// ═══════════════════════════════════════════════════════════════════════════

interface FrontPageData {
  headline: { title: string; deck: string; section: string; time: string };
  pit_preview: Array<{ title: string; excerpt: string }>;
  sports_preview: Array<{ title: string; excerpt: string }>;
  tech_preview: Array<{ title: string; excerpt: string }>;
  pit_stats: { spFutures: string; spDir: string; fearGreed: string };
  games_today: Array<{ teams: string; time: string; line: string }>;
  trending_topics: string[];
  calendar: Array<{ time: string; event: string; type: 'econ' | 'earn' }>;
  local_stories: Array<{ title: string }>;
  headlines: Array<{ tag: string; tagClass: string; title: string }>;
  weather: { temp: number; condition: string; location: string; forecast: Array<{ label: string; range: string }> };
}

const BRIEF_STORAGE_KEY = 'dbtech-morning-briefs-v2';

function saveBrief(dateKey: string, data: FrontPageData) {
  try {
    const stored = JSON.parse(localStorage.getItem(BRIEF_STORAGE_KEY) || '{}');
    stored[dateKey] = data;
    const keys = Object.keys(stored).sort();
    while (keys.length > 14) { delete stored[keys.shift()!]; }
    localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(stored));
  } catch { /* ignore */ }
}

function loadBrief(dateKey: string): FrontPageData | null {
  try {
    const stored = JSON.parse(localStorage.getItem(BRIEF_STORAGE_KEY) || '{}');
    return stored[dateKey] || null;
  } catch { return null; }
}

export default function FrontPage() {
  const router = useRouter();
  const { selectedDay, isToday, isFuture, formatDateLabel, goBack, goForward, goToday } = useDayContext();
  const [data, setData] = useState<FrontPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (isFuture) { setData(null); setLoading(false); setError(null); return; }
    if (!isToday) {
      const cached = loadBrief(selectedDay);
      if (cached) { setData(cached); setLoading(false); setError(null); return; }
      setData(null); setLoading(false); setError(null); return;
    }
    try {
      const res = await fetch('/api/morning-brief');
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      
      // Transform existing API data to front page format
      const fpData: FrontPageData = {
        headline: {
          title: json.headline?.title ?? 'Markets in Motion',
          deck: json.headline?.deck ?? '',
          section: json.headline?.meta?.[0] ?? 'THE PIT',
          time: `Updated ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })}`,
        },
        pit_preview: (json.stories ?? []).slice(0, 3).map((s: { title: string; excerpt: string }) => ({ title: s.title, excerpt: s.excerpt })),
        sports_preview: (json.sports?.scores ?? []).slice(0, 3).map((g: { away: string; home: string; score: string; league: string }) => ({
          title: `${g.away} ${g.score?.includes('-') ? g.score.split('-')[0] : ''} at ${g.home} ${g.score?.includes('-') ? g.score.split('-')[1] : ''} (${g.league})`,
          excerpt: g.score ? `Score: ${g.score}` : 'Upcoming',
        })),
        tech_preview: json.tech_preview ?? [
          { title: 'Latest Tech Headlines', excerpt: 'Visit the Tech section for full coverage.' },
        ],
        pit_stats: {
          spFutures: json.ticker?.[0] ? `${json.ticker[0].changePct >= 0 ? '+' : ''}${json.ticker[0].changePct.toFixed(2)}%` : '--',
          spDir: json.ticker?.[0] ? (json.ticker[0].changePct >= 0 ? 'up' : 'down') : '',
          fearGreed: json.quick_stats?.fear_greed ?? '--',
        },
        games_today: (json.sports?.today ?? []).slice(0, 3).map((g: { away: string; home: string; score: string; spread: string }) => ({
          teams: `${g.away} @ ${g.home}`,
          time: g.score || '--',
          line: g.spread || '--',
        })),
        trending_topics: ['#AI', '#Crypto', '#Markets'],
        calendar: (json.calendar ?? []).slice(0, 5).map((c: { time: string; event: string; note?: string }) => ({
          time: c.time,
          event: c.event,
          type: (c.note?.toLowerCase().includes('earn') ? 'earn' : 'econ') as 'econ' | 'earn',
        })),
        local_stories: json.local_preview ?? [
          { title: 'Visit the Local section for Nashua, NH news' },
        ],
        headlines: json.national_headlines ?? [
          { tag: 'MARKETS', tagClass: 'sports', title: 'Check each section for full coverage' },
        ],
        weather: {
          temp: json.weather?.temp ?? 0,
          condition: json.weather?.condition ?? 'Unknown',
          location: json.weather?.location ?? 'Nashua, NH',
          forecast: json.weather?.forecast ?? [],
        },
      };
      
      setData(fpData);
      saveBrief(selectedDay, fpData);
      setError(null);
    } catch (e) {
      console.error('Front page fetch failed:', e);
      setError('Failed to load briefing data');
    } finally {
      setLoading(false);
    }
  }, [selectedDay, isToday, isFuture]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    if (isToday) {
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, isToday]);

  // Loading
  if (loading && !data) {
    return <div className="loading-pulse">LOADING BRIEFING DATA...</div>;
  }

  // Future / empty
  if (!data && !loading && !error) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{isFuture ? '📰' : '📭'}</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#A3A3A3', marginBottom: 12 }}>
          {isFuture ? 'Edition Not Yet Published' : 'No Briefing Available'}
        </div>
        <div style={{ fontSize: 14, color: '#525252', marginBottom: 24 }}>
          {isFuture ? `The ${formatDateLabel(selectedDay).toLowerCase()} edition will be available when it generates.` : 'No cached briefing found for this date.'}
        </div>
      </div>
    );
  }

  // Error
  if (error && !data) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 24, color: '#EF4444', marginBottom: 12 }}>Briefing Unavailable</div>
        <div style={{ color: '#A3A3A3', marginBottom: 24 }}>{error}</div>
        <button onClick={fetchData} style={{ background: '#F59E0B', color: '#0A0A0A', border: 'none', padding: '10px 24px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="front-page">
      {/* ══════════ LEAD STORY ══════════ */}
      <section className="lead-story">
        <div className="section-flag">Top Story</div>
        <h2 className="lead-headline">{data.headline.title}</h2>
        <p className="lead-deck">{data.headline.deck}</p>
        <div className="lead-meta">
          <span className="meta-section">{data.headline.section}</span>
          <span className="meta-time">{data.headline.time}</span>
        </div>
      </section>

      {/* ══════════ THREE COLUMN GRID ══════════ */}
      <div className="front-grid">
        {/* THE PIT PREVIEW */}
        <section className="front-column">
          <div className="column-header" onClick={() => router.push('/os/morning-brief/the-pit')}>
            <h3>The Pit</h3>
            <span className="see-all">Full Section →</span>
          </div>
          {data.pit_preview.map((s, i) => (
            <article key={i} className="front-story">
              <h4>{s.title}</h4>
              <p>{s.excerpt}</p>
            </article>
          ))}
          <div className="quick-stats">
            <div className="stat">
              <span className={`stat-value ${data.pit_stats.spDir}`}>{data.pit_stats.spFutures}</span>
              <span className="stat-label">S&P Futures</span>
            </div>
            <div className="stat">
              <span className="stat-value">{data.pit_stats.fearGreed}</span>
              <span className="stat-label">Fear/Greed</span>
            </div>
          </div>
        </section>

        {/* SPORTS PREVIEW */}
        <section className="front-column">
          <div className="column-header" onClick={() => router.push('/os/morning-brief/sports')}>
            <h3>Sports</h3>
            <span className="see-all">Full Section →</span>
          </div>
          {data.sports_preview.map((s, i) => (
            <article key={i} className="front-story">
              <h4>{s.title}</h4>
              <p>{s.excerpt}</p>
            </article>
          ))}
          {data.games_today.length > 0 && (
            <div className="games-today">
              {data.games_today.map((g, i) => (
                <div key={i} className="game">
                  <span className="teams">{g.teams}</span>
                  <span className="time">{g.time}</span>
                  <span className="line">{g.line}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TECH PREVIEW */}
        <section className="front-column">
          <div className="column-header" onClick={() => router.push('/os/morning-brief/tech')}>
            <h3>Tech</h3>
            <span className="see-all">Full Section →</span>
          </div>
          {data.tech_preview.map((s, i) => (
            <article key={i} className="front-story">
              <h4>{s.title}</h4>
              <p>{s.excerpt}</p>
            </article>
          ))}
          <div className="trending-topics">
            {data.trending_topics.map((t, i) => (
              <span key={i} className="topic">{t}</span>
            ))}
          </div>
        </section>
      </div>

      {/* ══════════ BOTTOM ROW ══════════ */}
      <div className="front-bottom">
        {/* TODAY'S CALENDAR */}
        <section className="bottom-section">
          <h3>Today&apos;s Calendar</h3>
          <div className="calendar-list">
            {data.calendar.map((c, i) => (
              <div key={i} className="calendar-item-front">
                <span className="cal-time">{c.time}</span>
                <span className="cal-event">{c.event}</span>
                <span className={`cal-type ${c.type}`}>{c.type.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* NASHUA NEWS */}
        <section className="bottom-section">
          <div className="column-header" onClick={() => router.push('/os/morning-brief/local')}>
            <h3>Nashua News</h3>
            <span className="see-all">More →</span>
          </div>
          <div className="local-stories">
            {data.local_stories.map((s, i) => (
              <article key={i} className="local-story">
                <h4>{s.title}</h4>
              </article>
            ))}
          </div>
        </section>

        {/* HEADLINES */}
        <section className="bottom-section">
          <h3>Headlines</h3>
          <div className="headline-list">
            {data.headlines.map((h, i) => (
              <article key={i} className="headline-item">
                <span className={`headline-tag ${h.tagClass}`}>{h.tag}</span>
                <h4>{h.title}</h4>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ══════════ WEATHER BAR ══════════ */}
      <div className="weather-bar">
        <div className="weather-bar-location">{data.weather.location}</div>
        <div className="weather-bar-now">
          <span className="weather-bar-temp">{data.weather.temp}°F</span>
          <span className="weather-bar-cond">{data.weather.condition}</span>
        </div>
        <div className="weather-bar-forecast">
          {data.weather.forecast.map((f, i) => (
            <span key={i}>{f.label}: {f.range}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
