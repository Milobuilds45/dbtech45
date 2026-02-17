'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL — Nashua, NH News + Weather
// Design by Paula · Built by Anders
// ═══════════════════════════════════════════════════════════════════════════

interface LocalStory {
  title: string;
  url: string;
  source: string;
  description: string;
  time: string;
}

interface LocalData {
  stories: LocalStory[];
  weather: {
    current: { temp: number; condition: string };
    forecast: Array<{ day: string; high: number; low: number; emoji?: string }>;
  };
}

export default function LocalPage() {
  const [data, setData] = useState<LocalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/morning-brief/local');
        if (!res.ok) throw new Error(`${res.status}`);
        setData(await res.json());
      } catch (e) {
        console.error('Local data fetch failed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading-pulse">LOADING LOCAL NEWS...</div>;
  if (!data) return <div className="loading-pulse">LOCAL DATA UNAVAILABLE</div>;

  return (
    <main className="section-page">
      <header className="section-header">
        <h1 className="section-title">Local</h1>
        <p className="section-subtitle">News from Nashua, NH and the greater Southern New Hampshire region.</p>
      </header>

      <div className="tech-layout">
        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="tech-river">
          {data.stories.map((story, i) => (
            <article key={i} className="story-cluster">
              <div className="cluster-main">
                {story.time && <div className="cluster-time">{story.time}</div>}
                <h2 className="cluster-headline">
                  <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
                </h2>
                <span className="cluster-source">{story.source}</span>
                {story.description && (
                  <p className="cluster-deck">{story.description}</p>
                )}
              </div>
            </article>
          ))}
          {data.stories.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No local news available at this time.
            </div>
          )}
        </div>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="tech-sidebar">
          {/* Weather Detail */}
          <div className="sidebar-box">
            <h4>Weather — Nashua</h4>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700 }}>
                {data.weather.current.temp}°
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                {data.weather.current.condition}
              </div>
            </div>
            <div style={{ fontSize: 12 }}>
              {data.weather.forecast.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.weather.forecast.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span>{f.day}</span>
                  <span>{f.high}° / {f.low}°{f.emoji || ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic */}
          <div className="sidebar-box">
            <h4>Traffic & Commute</h4>
            <div style={{ fontSize: 12 }}>
              {[
                { route: 'Route 3 South', status: '⚠️ Check for delays', color: 'var(--amber)' },
                { route: 'Everett Turnpike', status: '✓ Clear', color: 'var(--green)' },
                { route: 'Route 101A', status: '✓ Clear', color: 'var(--green)' },
                { route: 'I-93 to Boston', status: '⚠️ Check conditions', color: 'var(--amber)' },
              ].map((r, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontWeight: 600 }}>{r.route}</div>
                  <div style={{ color: r.color }}>{r.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Links */}
          <div className="sidebar-box">
            <h4>Local Links</h4>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="https://www.nashuatelegraph.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Nashua Telegraph →</a>
              <a href="https://www.unionleader.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Union Leader →</a>
              <a href="https://www.wmur.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>WMUR News →</a>
              <a href="https://www.nashuanh.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>City of Nashua →</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
