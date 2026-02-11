'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from "@/lib/brand";

const TICKER_DATA = [
  { symbol: 'ES', name: 'E-Mini S&P 500', price: 6048.25, change: 12.50, pctChange: 0.21, high: 6055.00, low: 6038.75 },
  { symbol: 'NQ', name: 'E-Mini Nasdaq', price: 21534.75, change: 89.25, pctChange: 0.42, high: 21588.00, low: 21428.50 },
  { symbol: 'SPY', name: 'SPDR S&P 500', price: 604.52, change: 1.23, pctChange: 0.20, high: 605.80, low: 602.10 },
  { symbol: 'VIX', name: 'CBOE Volatility', price: 15.42, change: -0.38, pctChange: -2.40, high: 16.10, low: 15.20 },
  { symbol: 'BTC', name: 'Bitcoin USD', price: 97284.50, change: 1842.30, pctChange: 1.93, high: 98100.00, low: 95200.00 },
  { symbol: '10Y', name: '10Y Treasury', price: 4.485, change: -0.012, pctChange: -0.27, high: 4.510, low: 4.470 },
];

const WATCHLIST_DEFAULT = ['AAPL', 'NVDA', 'TSLA', 'META', 'AMZN'];

const WATCHLIST_DATA: Record<string, { name: string; price: number; change: number; pctChange: number }> = {
  AAPL: { name: 'Apple Inc', price: 234.56, change: -0.75, pctChange: -0.32 },
  NVDA: { name: 'NVIDIA Corp', price: 138.25, change: 3.25, pctChange: 2.41 },
  TSLA: { name: 'Tesla Inc', price: 352.80, change: 8.45, pctChange: 2.45 },
  META: { name: 'Meta Platforms', price: 612.30, change: 4.80, pctChange: 0.79 },
  AMZN: { name: 'Amazon.com', price: 225.40, change: -1.20, pctChange: -0.53 },
};

const NEWS = [
  { time: '09:45 ET', date: 'Feb 11', src: 'Bloomberg', tag: 'ES', text: 'S&P 500 futures push higher as tech sector leads pre-market gains' },
  { time: '09:32 ET', date: 'Feb 11', src: 'Reuters', tag: 'NVDA', text: 'NVIDIA announces next-gen Blackwell Ultra GPU architecture at GTC keynote' },
  { time: '09:18 ET', date: 'Feb 11', src: 'CoinDesk', tag: 'BTC', text: 'Bitcoin breaks through $97K resistance level on institutional buying pressure' },
  { time: '09:05 ET', date: 'Feb 11', src: 'CNBC', tag: 'FED', text: 'Fed officials signal patience on rate cuts amid sticky inflation data' },
  { time: '08:45 ET', date: 'Feb 11', src: 'WSJ', tag: 'TSLA', text: 'Tesla expands Full Self-Driving beta to 15 new markets in Q1 push' },
];

export default function Markets() {
  const [watchlist, setWatchlist] = useState<string[]>(WATCHLIST_DEFAULT);
  const [newSymbol, setNewSymbol] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('axecap-watchlist');
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {}
  }, []);

  const addSymbol = useCallback(() => {
    const sym = newSymbol.trim().toUpperCase();
    if (sym && !watchlist.includes(sym)) {
      const next = [...watchlist, sym];
      setWatchlist(next);
      localStorage.setItem('axecap-watchlist', JSON.stringify(next));
      setNewSymbol('');
    }
  }, [newSymbol, watchlist]);

  const removeSymbol = useCallback((sym: string) => {
    const next = watchlist.filter(s => s !== sym);
    setWatchlist(next);
    localStorage.setItem('axecap-watchlist', JSON.stringify(next));
  }, [watchlist]);

  const refresh = () => setLastRefresh(new Date());

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: '1.5rem', letterSpacing: '0.05em' }}>AxeCap Terminal</h1>
            <p style={{ color: brand.smoke, fontSize: 12 }}>Real-time market intelligence</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{formatTime(lastRefresh)}</span>
            <button onClick={refresh} style={{ ...styles.button, padding: '6px 14px', fontSize: 12 }}>↻ Refresh</button>
          </div>
        </div>

        <div style={{ ...styles.card, padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${brand.border}`, background: brand.graphite }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>AXECAP TERMINAL</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: brand.warning }}>● SIMULATED</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0 }}>
            {TICKER_DATA.map((t, i) => (
              <div key={i} style={{ padding: '16px', borderRight: i < 5 ? `1px solid ${brand.border}` : 'none', borderBottom: `1px solid ${brand.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.pctChange >= 0 ? brand.success : brand.error, marginBottom: 2 }}>{t.symbol}</div>
                <div style={{ fontSize: 10, color: brand.smoke, marginBottom: 8 }}>{t.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: brand.white, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>${typeof t.price === 'number' && t.price > 1000 ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : t.price}</div>
                <div style={{ fontSize: 11, color: t.pctChange >= 0 ? brand.success : brand.error }}>
                  {t.pctChange >= 0 ? '▲' : '▼'} {t.change > 0 ? '+' : ''}{t.change} ({t.pctChange > 0 ? '+' : ''}{t.pctChange}%)
                </div>
                <div style={{ marginTop: 8, fontSize: 9, color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>L: ${t.low} &nbsp; H: ${t.high}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: brand.amber, fontSize: 13, fontWeight: 600 }}>◎ WATCHLIST</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSymbol()} placeholder="Symbol" style={{ ...styles.input, width: 100, padding: '6px 10px', fontSize: 12 }} />
              <button onClick={addSymbol} style={{ ...styles.button, padding: '6px 12px', fontSize: 12 }}>+ ADD</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 120px 40px', gap: 0, fontSize: 11, color: brand.smoke, borderBottom: `1px solid ${brand.border}`, paddingBottom: 8, marginBottom: 4 }}>
            <span>SYMBOL</span><span>NAME</span><span>PRICE</span><span>CHANGE</span><span></span>
          </div>
          {watchlist.map(sym => {
            const data = WATCHLIST_DATA[sym] || { name: sym, price: parseFloat((Math.random() * 500 + 50).toFixed(2)), change: 0, pctChange: 0 };
            return (
              <div key={sym} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 120px 40px', gap: 0, padding: '10px 0', borderBottom: `1px solid ${brand.border}`, alignItems: 'center' }}>
                <span style={{ color: brand.amber, fontWeight: 600, fontSize: 13 }}>{sym}</span>
                <span style={{ color: brand.silver, fontSize: 12 }}>{data.name}</span>
                <span style={{ color: brand.white, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>${data.price.toFixed(2)}</span>
                <span style={{ color: data.pctChange >= 0 ? brand.success : brand.error, fontSize: 12 }}>
                  {data.pctChange >= 0 ? '▲' : '▼'} {data.change > 0 ? '+' : ''}{data.change} ({data.pctChange > 0 ? '+' : ''}{data.pctChange}%)
                </span>
                <button onClick={() => removeSymbol(sym)} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            );
          })}
        </div>

        <div style={styles.card}>
          <div style={{ color: brand.amber, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>◎ MARKET BRIEFING</div>
          {NEWS.map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < NEWS.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 70 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{n.time}</span>
                <span style={{ fontSize: 9, color: brand.smoke }}>{n.date}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber }}>{n.tag}</span>
                  <span style={{ fontSize: 10, color: brand.smoke }}>{n.src}</span>
                </div>
                <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>{n.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
