'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from "@/lib/brand";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  marketState?: string;
}

interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  link?: string;
  publishedAt: string;
  relatedSymbol: string;
}

const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'TSLA', 'META', 'AMZN'];

export default function Markets() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [watchlistQuotes, setWatchlistQuotes] = useState<Record<string, Quote>>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [refreshFlash, setRefreshFlash] = useState(false);

  const fetchData = useCallback(async (wl: string[]) => {
    try {
      setError(null);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`/api/market-data?symbols=${wl.join(',')}&news=true`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Split quotes: first 6 are tickers, rest are watchlist
      const defaultSyms = ['ES=F', 'NQ=F', 'SPY', 'VIX', 'BTC-USD', '^TNX'];
      const tickers: Quote[] = [];
      const wlMap: Record<string, Quote> = {};

      for (const q of data.quotes || []) {
        if (defaultSyms.includes(q.symbol)) {
          tickers.push(q);
        } else {
          wlMap[q.symbol] = q;
        }
      }

      setQuotes(tickers);
      setWatchlistQuotes(wlMap);
      setNews(data.news || []);
      setIsLive(data.live ?? false);
      setLastRefresh(new Date());
      setCountdown(30);
      setRefreshFlash(true);
      setTimeout(() => setRefreshFlash(false), 600);
    } catch (err) {
      console.error('Market fetch error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Market data timeout - retrying...');
      } else {
        setError('Market data unavailable');
      }
    }
  }, []);

  // Load watchlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('axecap-watchlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        setWatchlist(parsed);
        fetchData(parsed);
        return;
      }
    } catch {}
    fetchData(DEFAULT_WATCHLIST);
  }, [fetchData]);

  // Auto-refresh every 30s + countdown
  useEffect(() => {
    const refresh = setInterval(() => { fetchData(watchlist); }, 30000);
    const tick = setInterval(() => { setCountdown(c => c <= 1 ? 30 : c - 1); }, 1000);
    return () => { clearInterval(refresh); clearInterval(tick); };
  }, [fetchData, watchlist]);

  const addSymbol = useCallback(() => {
    const sym = newSymbol.trim().toUpperCase();
    if (sym && !watchlist.includes(sym)) {
      const next = [...watchlist, sym];
      setWatchlist(next);
      localStorage.setItem('axecap-watchlist', JSON.stringify(next));
      setNewSymbol('');
      fetchData(next);
    }
  }, [newSymbol, watchlist, fetchData]);

  const removeSymbol = useCallback((sym: string) => {
    const next = watchlist.filter(s => s !== sym);
    setWatchlist(next);
    localStorage.setItem('axecap-watchlist', JSON.stringify(next));
  }, [watchlist]);

  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtPrice = (p: number) => !p ? '--' : p > 1000 ? `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(p < 10 ? 3 : 2)}`;

  const dispSym: Record<string, string> = { 'ES=F': 'ES', 'NQ=F': 'NQ', '^TNX': '10Y', 'BTC-USD': 'BTC', '^VIX': 'VIX' };
  const getSym = (s: string) => dispSym[s] || s;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: '1.5rem', letterSpacing: '0.05em' }}>AxeCap Terminal</h1>
            <p style={{ color: brand.smoke, fontSize: 12 }}>Real-time market intelligence</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastRefresh && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{fmt(lastRefresh)}</span>}
            <button onClick={() => { fetchData(watchlist); setCountdown(30); }} style={{ ...styles.button, padding: '6px 14px', fontSize: 12 }}>↻ Refresh</button>
          </div>
        </div>

        {error && (
          <div style={{ ...styles.card, background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.3)`, marginBottom: '1rem', padding: '10px 14px' }}>
            <span style={{ color: brand.error, fontSize: 12 }}>⚠ {error}</span>
          </div>
        )}

        {/* Ticker Board */}
        <div style={{ ...styles.card, padding: 0, marginBottom: '1.5rem', overflow: 'hidden', transition: 'border-color 0.3s', borderColor: refreshFlash ? 'rgba(245,158,11,0.5)' : brand.border }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${brand.border}`, background: refreshFlash ? 'rgba(245,158,11,0.05)' : brand.graphite, transition: 'background 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>AXECAP TERMINAL</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: isLive ? brand.success : brand.amber }}>
                ● {isLive ? 'LIVE' : 'CACHED'}
              </span>
            </div>
            <span style={{ fontSize: 10, color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
              Next refresh: <span style={{ color: countdown <= 5 ? brand.amber : brand.smoke }}>{countdown}s</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(quotes.length || 6, 6)}, 1fr)`, gap: 0 }}>
            {(quotes.length ? quotes : []).map((q, i) => (
              <div key={q.symbol} style={{ padding: '16px', borderRight: i < quotes.length - 1 ? `1px solid ${brand.border}` : 'none', borderBottom: `1px solid ${brand.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: q.changePercent >= 0 ? brand.success : brand.error, marginBottom: 2 }}>{getSym(q.symbol)}</div>
                <div style={{ fontSize: 10, color: brand.smoke, marginBottom: 8 }}>{q.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: brand.white, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{fmtPrice(q.price)}</div>
                <div style={{ fontSize: 11, color: q.changePercent >= 0 ? brand.success : brand.error }}>
                  {q.changePercent >= 0 ? '▲' : '▼'} {q.change > 0 ? '+' : ''}{q.change.toFixed(2)} ({q.changePercent > 0 ? '+' : ''}{q.changePercent.toFixed(2)}%)
                </div>
                {q.high > 0 && q.low > 0 && (
                  <div style={{ marginTop: 8, fontSize: 9, color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                    L: {fmtPrice(q.low)} &nbsp; H: {fmtPrice(q.high)}
                  </div>
                )}
              </div>
            ))}
            {quotes.length === 0 && Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ padding: '16px', borderRight: i < 5 ? `1px solid ${brand.border}` : 'none' }}>
                <div style={{ color: brand.smoke, fontSize: 12 }}>Loading...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: brand.amber, fontSize: 13, fontWeight: 600 }}>◎ WATCHLIST</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSymbol()} placeholder="Symbol" style={{ ...styles.input, width: 100, padding: '6px 10px', fontSize: 12 }} />
              <button onClick={addSymbol} style={{ ...styles.button, padding: '6px 12px', fontSize: 12 }}>+ ADD</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 140px 32px', gap: 0, fontSize: 11, color: brand.smoke, borderBottom: `1px solid ${brand.border}`, paddingBottom: 8, marginBottom: 4 }}>
            <span>SYMBOL</span><span>NAME</span><span>PRICE</span><span>CHANGE</span><span></span>
          </div>
          {watchlist.map(sym => {
            const q = watchlistQuotes[sym];
            return (
              <div key={sym} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 140px 32px', gap: 0, padding: '10px 0', borderBottom: `1px solid ${brand.border}`, alignItems: 'center' }}>
                <span style={{ color: brand.amber, fontWeight: 600, fontSize: 13 }}>{sym}</span>
                <span style={{ color: brand.silver, fontSize: 12 }}>{q?.name || sym}</span>
                <span style={{ color: brand.white, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{q ? fmtPrice(q.price) : '--'}</span>
                <span style={{ color: q ? (q.changePercent >= 0 ? brand.success : brand.error) : brand.smoke, fontSize: 12 }}>
                  {q ? `${q.changePercent >= 0 ? '▲' : '▼'} ${q.change > 0 ? '+' : ''}${q.change.toFixed(2)} (${q.changePercent > 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)` : '--'}
                </span>
                <button onClick={() => removeSymbol(sym)} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: 16, padding: 0 }}>×</button>
              </div>
            );
          })}
        </div>

        {/* Market Briefing */}
        <div style={styles.card}>
          <div style={{ color: brand.amber, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>◎ MARKET BRIEFING</div>
          {news.length > 0 ? news.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < news.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
              <div style={{ flexShrink: 0, minWidth: 65, textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>
                  {new Date(n.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 9, color: brand.smoke }}>{n.publisher}</div>
              </div>
              <div style={{ flex: 1 }}>
                {n.relatedSymbol && (
                  <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber, marginBottom: 4 }}>{n.relatedSymbol}</span>
                )}
                <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>{n.title}</div>
              </div>
            </div>
          )) : (
            <div style={{ color: brand.smoke, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Loading market briefing...</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '8px 0', borderTop: `1px solid ${brand.border}` }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke }}>AXECAP TERMINAL v2.0</span>
          <span style={{ fontSize: 10, color: brand.smoke }}>
            {isLive ? '● Live data via Yahoo Finance' : '● Cached/fallback data'}
            {lastRefresh && ` · Last: ${fmt(lastRefresh)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
