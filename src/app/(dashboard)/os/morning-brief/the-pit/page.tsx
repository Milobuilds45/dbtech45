'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// THE PIT — Full Markets Section
// Design by Paula · Built by Anders
// ═══════════════════════════════════════════════════════════════════════════

interface MarketData {
  ticker: Array<{ symbol: string; price: number; change: number; changePct: number }>;
  headline: { title: string; deck: string };
  quick_stats: { vix: string; yield_10y: string; dxy: string; fear_greed: string };
  calendar: Array<{ time: string; event: string; note: string }>;
  stories: Array<{ title: string; excerpt: string; section: string }>;
}

interface MarketRow {
  symbol: string;
  price: string;
  change: string;
  changePct: string;
  direction: 'up' | 'down';
  note: string;
}

export default function ThePitPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/morning-brief');
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Pit data fetch failed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-pulse">LOADING MARKET DATA...</div>;
  if (!data) return <div className="loading-pulse">MARKET DATA UNAVAILABLE</div>;

  // Build market rows from ticker data
  const buildRows = (items: typeof data.ticker): MarketRow[] => {
    return items.map(t => ({
      symbol: t.symbol,
      price: t.price > 1000
        ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : t.price.toFixed(2),
      change: `${t.change >= 0 ? '+' : ''}${t.change.toFixed(2)}`,
      changePct: `${t.changePct >= 0 ? '+' : ''}${t.changePct.toFixed(2)}%`,
      direction: t.changePct >= 0 ? 'up' : 'down',
      note: '',
    }));
  };

  const indices = data.ticker.filter(t => ['ES', 'NQ', 'RTY'].includes(t.symbol));
  const commodities = data.ticker.filter(t => ['CL', 'GC'].includes(t.symbol));
  const crypto = data.ticker.filter(t => ['BTC'].includes(t.symbol));
  const vixItem = data.ticker.find(t => t.symbol === 'VIX');

  return (
    <main className="section-page">
      <header className="section-header">
        <h1 className="section-title">The Pit</h1>
        <p className="section-subtitle">Markets, futures, options flow, and everything that moves.</p>
      </header>

      {/* Market Headline */}
      <section className="lead-story" style={{ marginBottom: 32 }}>
        <div className="section-flag">Market Update</div>
        <h2 className="lead-headline">{data.headline.title}</h2>
        <p className="lead-deck">{data.headline.deck}</p>
        <div className="lead-meta">
          <span className="meta-time">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET</span>
        </div>
      </section>

      <div className="tech-layout">
        <div className="tech-river">
          {/* Indices & Futures */}
          <section style={{ marginBottom: 32 }}>
            <h3 className="section-table-header">Indices & Futures</h3>
            <table className="market-table">
              <thead>
                <tr><th>Symbol</th><th>Last</th><th>Change</th><th>% Change</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {buildRows(indices).map((r, i) => (
                  <tr key={i}>
                    <td className="symbol">{r.symbol === 'ES' ? 'S&P 500 (ES)' : r.symbol === 'NQ' ? 'Nasdaq (NQ)' : 'Russell 2000 (RTY)'}</td>
                    <td className="price">{r.price}</td>
                    <td className={`change ${r.direction}`}>{r.change}</td>
                    <td className={`change ${r.direction}`}>{r.changePct}</td>
                    <td className="note">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Commodities & Rates */}
          <section style={{ marginBottom: 32 }}>
            <h3 className="section-table-header">Commodities & Rates</h3>
            <table className="market-table">
              <thead>
                <tr><th>Symbol</th><th>Last</th><th>Change</th><th>% Change</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {buildRows(commodities).map((r, i) => (
                  <tr key={i}>
                    <td className="symbol">{r.symbol === 'CL' ? 'Crude Oil (CL)' : 'Gold (GC)'}</td>
                    <td className="price">${r.price}</td>
                    <td className={`change ${r.direction}`}>{r.change}</td>
                    <td className={`change ${r.direction}`}>{r.changePct}</td>
                    <td className="note">{r.note}</td>
                  </tr>
                ))}
                {data.quick_stats.yield_10y !== '--' && (
                  <tr>
                    <td className="symbol">10Y Treasury</td>
                    <td className="price">{data.quick_stats.yield_10y}</td>
                    <td className="change">—</td>
                    <td className="change">—</td>
                    <td className="note">FRED</td>
                  </tr>
                )}
                {data.quick_stats.dxy !== '--' && (
                  <tr>
                    <td className="symbol">Dollar Index (DXY)</td>
                    <td className="price">{data.quick_stats.dxy}</td>
                    <td className="change">—</td>
                    <td className="change">—</td>
                    <td className="note">Dollar strength</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Crypto */}
          <section style={{ marginBottom: 32 }}>
            <h3 className="section-table-header">Crypto</h3>
            <table className="market-table">
              <thead>
                <tr><th>Symbol</th><th>Last</th><th>Change</th><th>% Change</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {buildRows(crypto).map((r, i) => (
                  <tr key={i}>
                    <td className="symbol">Bitcoin (BTC)</td>
                    <td className="price">${r.price}</td>
                    <td className={`change ${r.direction}`}>{r.change}</td>
                    <td className={`change ${r.direction}`}>{r.changePct}</td>
                    <td className="note">24h change</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="tech-sidebar">
          {/* By the Numbers */}
          <div className="sidebar-box">
            <h4>By the Numbers</h4>
            <div style={{ fontSize: 12 }}>
              {[
                { label: 'VIX', value: data.quick_stats.vix, color: 'var(--amber)' },
                { label: 'Fear/Greed', value: data.quick_stats.fear_greed, color: 'var(--green)' },
                { label: '10Y Yield', value: data.quick_stats.yield_10y, color: 'var(--text-primary)' },
                { label: 'DXY', value: data.quick_stats.dxy, color: 'var(--text-primary)' },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stat.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Economic Calendar */}
          <div className="sidebar-box">
            <h4>Economic Calendar</h4>
            <div style={{ fontSize: 12 }}>
              {data.calendar.map((c, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < data.calendar.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ color: 'var(--amber)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{c.time}</div>
                  <div style={{ fontWeight: 600, margin: '4px 0' }}>{c.event}</div>
                  {c.note && <div style={{ color: 'var(--text-muted)' }}>{c.note}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Trading Notes */}
          <div className="sidebar-box">
            <h4>Trading Notes</h4>
            <ul style={{ fontSize: 12, lineHeight: 1.6, listStyle: 'none' }}>
              {vixItem && (
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--amber)' }}>VIX:</strong> {vixItem.price < 15 ? 'Low vol environment — premium sellers active' : vixItem.price > 25 ? 'Elevated vol — hedging heavy' : 'Normal range — selective activity'}
                </li>
              )}
              <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--amber)' }}>ES:</strong> Watch key support and resistance levels
              </li>
              <li style={{ padding: '8px 0' }}>
                <strong style={{ color: 'var(--amber)' }}>Flow:</strong> Monitor options activity for directional signals
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
