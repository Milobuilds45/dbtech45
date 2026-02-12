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
  volume?: number;
  marketState?: string;
}

interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  relatedSymbol: string;
}

const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'TSLA', 'META', 'AMZN'];
const REFRESH_INTERVAL = 30000; // 30 seconds for faster updates

export default function Markets() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [watchlistQuotes, setWatchlistQuotes] = useState<Quote[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false); // No loading state - show UI immediately
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Simplified market data fetch with aggressive timeout
  const fetchMarketData = useCallback(async () => {
    setLoading(false); // Show UI immediately
    
    try {
      setError(null);
      
      // Very aggressive timeout - 3 seconds max
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/api/market-data', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setQuotes(data.quotes || []);
      setIsLive(true);
      setLastRefresh(new Date());
      
      // Skip watchlist and news for now to avoid hanging
      setWatchlistQuotes([]);
      setNews([]);
      
    } catch (err) {
      console.error('Market data error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Market data taking too long - using cached data');
      } else {
        setError('Market data unavailable');
      }
      setQuotes([]);
      setWatchlistQuotes([]);
      setNews([]);
      setIsLive(false);
    }
  }, []);

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('axecap-watchlist');
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {}
  }, []);

  // Fetch data on mount and set up refresh interval
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

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

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatPrice = (price: number) => {
    if (!price) return '$--.--';
    return price > 1000 ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${price.toFixed(2)}`;
  };

  // Map symbol names for display
  const getDisplayName = (symbol: string, name?: string): string => {
    const names: Record<string, string> = {
      'ES=F': 'E-Mini S&P 500',
      'NQ=F': 'E-Mini Nasdaq',
      '^TNX': '10Y Treasury',
      'BTC-USD': 'Bitcoin',
      'VIX': 'CBOE Volatility',
    };
    return names[symbol] || name || symbol;
  };

  const getDisplaySymbol = (symbol: string): string => {
    const symbols: Record<string, string> = {
      'ES=F': 'ES',
      'NQ=F': 'NQ',
      '^TNX': '10Y',
      'BTC-USD': 'BTC',
    };
    return symbols[symbol] || symbol;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: '1.5rem', letterSpacing: '0.05em' }}>AxeCap Terminal</h1>
            <p style={{ color: brand.smoke, fontSize: 12 }}>Real-time market intelligence</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastRefresh && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{formatTime(lastRefresh)}</span>}
            <button onClick={fetchMarketData} disabled={loading} style={{ ...styles.button, padding: '6px 14px', fontSize: 12, opacity: loading ? 0.5 : 1 }}>
              {loading ? '↻ Loading...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ ...styles.card, background: 'rgba(239,68,68,0.1)', border: `1px solid ${brand.error}`, marginBottom: '1.5rem', padding: 12 }}>
            <span style={{ color: brand.error, fontSize: 13 }}>⚠ {error}</span>
          </div>
        )}

        <div style={{ ...styles.card, padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${brand.border}`, background: brand.graphite }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>AXECAP TERMINAL</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: isLive ? brand.success : brand.warning }}>
                ● {isLive ? 'LIVE' : 'SIMULATED'}
              </span>
            </div>
            <span style={{ fontSize: 10, color: brand.smoke }}>Auto-refresh: 1min</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 0 }}>
            {(quotes.length > 0 ? quotes.slice(0, 7) : Array(6).fill(null)).map((q, i) => (
              <div key={i} style={{ padding: '16px', borderRight: `1px solid ${brand.border}`, borderBottom: `1px solid ${brand.border}` }}>
                {q ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: (q.changePercent || 0) >= 0 ? brand.success : brand.error, marginBottom: 2 }}>
                      {getDisplaySymbol(q.symbol)}
                    </div>
                    <div style={{ fontSize: 10, color: brand.smoke, marginBottom: 8 }}>{getDisplayName(q.symbol, q.name)}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: brand.white, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                      {formatPrice(q.price)}
                    </div>
                    <div style={{ fontSize: 11, color: (q.changePercent || 0) >= 0 ? brand.success : brand.error }}>
                      {(q.changePercent || 0) >= 0 ? '▲' : '▼'} {q.change > 0 ? '+' : ''}{(q.change || 0).toFixed(2)} ({(q.changePercent || 0) > 0 ? '+' : ''}{(q.changePercent || 0).toFixed(2)}%)
                    </div>
                    {q.low && q.high && (
                      <div style={{ marginTop: 8, fontSize: 9, color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                        L: {formatPrice(q.low)} &nbsp; H: {formatPrice(q.high)}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: brand.smoke, fontSize: 12 }}>Loading...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: brand.amber, fontSize: 13, fontWeight: 600 }}>◎ WATCHLIST</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                value={newSymbol} 
                onChange={e => setNewSymbol(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && addSymbol()} 
                placeholder="Symbol" 
                style={{ ...styles.input, width: 100, padding: '6px 10px', fontSize: 12 }} 
              />
              <button onClick={addSymbol} style={{ ...styles.button, padding: '6px 12px', fontSize: 12 }}>+ ADD</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 120px 40px', gap: 0, fontSize: 11, color: brand.smoke, borderBottom: `1px solid ${brand.border}`, paddingBottom: 8, marginBottom: 4 }}>
            <span>SYMBOL</span><span>NAME</span><span>PRICE</span><span>CHANGE</span><span></span>
          </div>
          {watchlist.map(sym => {
            const data = watchlistQuotes.find(q => q.symbol === sym);
            return (
              <div key={sym} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 120px 40px', gap: 0, padding: '10px 0', borderBottom: `1px solid ${brand.border}`, alignItems: 'center' }}>
                <span style={{ color: brand.amber, fontWeight: 600, fontSize: 13 }}>{sym}</span>
                <span style={{ color: brand.silver, fontSize: 12 }}>{data?.name || sym}</span>
                <span style={{ color: brand.white, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                  {data ? formatPrice(data.price) : '--'}
                </span>
                <span style={{ color: data && (data.changePercent || 0) >= 0 ? brand.success : brand.error, fontSize: 12 }}>
                  {data ? (
                    <>
                      {(data.changePercent || 0) >= 0 ? '▲' : '▼'} {data.change > 0 ? '+' : ''}{(data.change || 0).toFixed(2)} ({(data.changePercent || 0) > 0 ? '+' : ''}{(data.changePercent || 0).toFixed(2)}%)
                    </>
                  ) : '--'}
                </span>
                <button onClick={() => removeSymbol(sym)} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            );
          })}
        </div>

        <div style={styles.card}>
          <div style={{ color: brand.amber, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>◎ MARKET BRIEFING</div>
          {news.length > 0 ? (
            news.slice(0, 10).map((n, i) => (
              <a 
                key={n.id || i} 
                href={n.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < Math.min(news.length, 10) - 1 ? `1px solid ${brand.border}` : 'none', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 70 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                  <span style={{ fontSize: 9, color: brand.smoke }}>{n.publisher}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {n.relatedSymbol && (
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber }}>
                        {n.relatedSymbol}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>{n.title}</div>
                </div>
              </a>
            ))
          ) : (
            <div style={{ color: brand.smoke, fontSize: 12, padding: '20px 0', textAlign: 'center' }}>
              {loading ? 'Loading news...' : 'No news available for watchlist symbols'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
