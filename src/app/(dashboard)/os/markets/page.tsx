'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { brand, styles } from "@/lib/brand";

/* --- Types --- */
interface Quote { symbol: string; name: string; price: number; change: number; changePercent: number; high: number; low: number; marketState?: string; }
interface NewsItem { id: string; title: string; publisher: string; link?: string; publishedAt: string; relatedSymbol: string; }
interface OptionContract { strike: number; last: number; change: number; changePercent: number; volume: number; openInterest: number; impliedVolatility: number; delta: number; gamma: number; theta: number; vega: number; vwap: number; high: number; low: number; ticker: string; }
interface ChainData { symbol: string; expDate: string; currentPrice: number; calls: OptionContract[]; puts: OptionContract[]; expirations: string[]; }
interface ZeroDTEContract { symbol: string; strike: number; type: 'CALL' | 'PUT'; expiry: string; last: number; change: number; changePercent: number; volume: number; openInterest: number; impliedVolatility: number; vwap: number; ticker: string; }
interface UnusualContract extends ZeroDTEContract { volOiRatio: number; }
interface SectorQuote { price: number; change: number; changePercent: number; volume: number; name: string; high: number; low: number; }
interface SparklineData { timestamps: number[]; closes: number[]; }
interface PCRData { pcr: number; totalPuts: number; totalCalls: number; sentiment: string; }

const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'TSLA', 'META', 'AMZN'];
const MONO = "'JetBrains Mono', monospace";
const SECTOR_MAP: Record<string, string> = { XLK: 'Tech', XLF: 'Finance', XLE: 'Energy', XLV: 'Health', XLI: 'Industrial', XLC: 'Comms', XLY: 'Cons Disc', XLP: 'Cons Stap', XLB: 'Materials', XLRE: 'Real Est', XLU: 'Utilities', SMH: 'Semis' };
const SECTOR_TICKERS = Object.keys(SECTOR_MAP);

const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtPrice = (p: number) => !p ? '--' : p > 1000 ? `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(p < 10 ? 3 : 2)}`;
const fmtVol = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v);
const fmtIV = (iv: number) => iv > 1 ? `${iv.toFixed(1)}%` : `${(iv * 100).toFixed(1)}%`;
const fmtDelta = (d: number) => d ? d.toFixed(3) : '--';
const fmtPrice2 = (p: number) => p ? p.toFixed(2) : '--';
const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;
const dispSym: Record<string, string> = { 'ES=F': 'ES', 'NQ=F': 'NQ', '^TNX': '10Y', 'BTC-USD': 'BTC', '^VIX': 'VIX' };
const getSym = (s: string) => dispSym[s] || s;

function Sparkline({ data, width = 60, height = 24 }: { data: number[]; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0]; const color = isUp ? '#22c55e' : '#ef4444';
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
  return (<svg width={width} height={height} style={{ display: 'inline-block', verticalAlign: 'middle' }}><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>);
}

function DayRangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  if (!low || !high || high <= low) return <span style={{ color: brand.smoke, fontSize: 10 }}>--</span>;
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (<div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 80 }}>
    <span style={{ fontSize: 9, color: brand.smoke, fontFamily: MONO }}>{low.toFixed(0)}</span>
    <div style={{ flex: 1, height: 4, background: brand.border, borderRadius: 2, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #ef4444, #eab308, #22c55e)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: -2, left: `${pct}%`, transform: 'translateX(-50%)', width: 4, height: 8, background: brand.white, borderRadius: 1 }} />
    </div>
    <span style={{ fontSize: 9, color: brand.smoke, fontFamily: MONO }}>{high.toFixed(0)}</span>
  </div>);
}
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
  const [chainSymbol, setChainSymbol] = useState<string | null>(null);
  const [chainData, setChainData] = useState<ChainData | null>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [chainTab, setChainTab] = useState<'calls' | 'puts'>('calls');
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [zeroDTE, setZeroDTE] = useState<ZeroDTEContract[]>([]);
  const [zeroDTELoading, setZeroDTELoading] = useState(true);
  const [unusual, setUnusual] = useState<UnusualContract[]>([]);
  const [unusualLoading, setUnusualLoading] = useState(true);
  const [sectors, setSectors] = useState<Record<string, SectorQuote>>({});
  const [pcrData, setPcrData] = useState<PCRData | null>(null);
  const [sparklines, setSparklines] = useState<Record<string, SparklineData>>({});

  const fetchData = useCallback(async (wl: string[]) => {
    try {
      setError(null);
      const res = await fetch(`/api/market-data?symbols=${wl.join(',')}&news=true`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const defaultSyms = ['ES=F', 'NQ=F', 'SPY', 'VIX', 'BTC-USD', '^TNX'];
      const tickers: Quote[] = []; const wlMap: Record<string, Quote> = {};
      for (const q of data.quotes || []) { if (defaultSyms.includes(q.symbol)) tickers.push(q); else wlMap[q.symbol] = q; }
      setQuotes(tickers); setWatchlistQuotes(wlMap); setNews(data.news || []);
      setIsLive(data.live ?? false); setLastRefresh(new Date()); setCountdown(30);
      setRefreshFlash(true); setTimeout(() => setRefreshFlash(false), 600);
    } catch (err) { console.error('Market fetch error:', err); setError('Market data unavailable'); }
  }, []);

  const fetchZeroDTE = useCallback(async () => {
    try { const res = await fetch('/api/options-data?type=0dte&symbols=SPY,QQQ,NVDA', { signal: AbortSignal.timeout(10000) }); if (!res.ok) throw new Error(`HTTP ${res.status}`); const data = await res.json(); setZeroDTE(data.contracts || []); } catch (err) { console.error('0DTE fetch error:', err); } finally { setZeroDTELoading(false); }
  }, []);

  const fetchUnusual = useCallback(async () => {
    try { const res = await fetch('/api/options-data?type=unusual&symbols=SPY,QQQ,NVDA,AAPL,TSLA', { signal: AbortSignal.timeout(12000) }); if (!res.ok) throw new Error(`HTTP ${res.status}`); const data = await res.json(); setUnusual(data.contracts || []); } catch (err) { console.error('Unusual fetch error:', err); } finally { setUnusualLoading(false); }
  }, []);

  const fetchSectors = useCallback(async () => {
    try {
      const res = await fetch(`/api/market-data?symbols=${SECTOR_TICKERS.join(',')}&news=false`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return;
      const data = await res.json();
      const sectorMap: Record<string, SectorQuote> = {};
      for (const q of data.quotes || []) { sectorMap[q.symbol] = { price: q.price ?? 0, change: q.change ?? 0, changePercent: q.changePercent ?? 0, volume: q.volume ?? 0, name: q.name ?? q.symbol, high: q.high ?? 0, low: q.low ?? 0 }; }
      setSectors(sectorMap);
    } catch (err) { console.error('Sector fetch error:', err); }
  }, []);

  const fetchPCR = useCallback(async () => {
    try { const res = await fetch('/api/options-data?type=pcr', { signal: AbortSignal.timeout(10000) }); if (!res.ok) return; setPcrData(await res.json()); } catch (err) { console.error('PCR fetch error:', err); }
  }, []);

  const fetchSparklines = useCallback(async (wl: string[]) => {
    const result: Record<string, SparklineData> = {};
    for (const sym of wl.slice(0, 5)) { try { const res = await fetch(`/api/options-data?type=sparkline&symbol=${sym}`, { signal: AbortSignal.timeout(5000) }); if (!res.ok) continue; const json = await res.json(); if (json.data?.closes?.length) result[sym] = json.data; } catch { /* skip */ } }
    setSparklines(prev => ({ ...prev, ...result }));
  }, []);

  const fetchChain = useCallback(async (symbol: string, expDate?: string) => {
    setChainLoading(true); setChainData(null); setChainTab('calls');
    try { let url = `/api/options-data?type=chain&symbol=${encodeURIComponent(symbol)}`; if (expDate) url += `&expDate=${encodeURIComponent(expDate)}`; const res = await fetch(url, { signal: AbortSignal.timeout(10000) }); if (!res.ok) throw new Error(`HTTP ${res.status}`); const data: ChainData = await res.json(); setChainData(data); if (data.expirations?.length && !expDate) setSelectedExpiry(data.expDate || data.expirations[0]); } catch (err) { console.error('Chain fetch error:', err); } finally { setChainLoading(false); }
  }, []);

  const handleTickerClick = useCallback((symbol: string) => {
    if (chainSymbol === symbol) { setChainSymbol(null); setChainData(null); return; }
    setChainSymbol(symbol); setSelectedExpiry(''); fetchChain(symbol);
  }, [chainSymbol, fetchChain]);

  const handleExpiryChange = useCallback((expiry: string) => { setSelectedExpiry(expiry); if (chainSymbol) fetchChain(chainSymbol, expiry); }, [chainSymbol, fetchChain]);

  useEffect(() => {
    let wl = DEFAULT_WATCHLIST;
    try { const stored = localStorage.getItem('axecap-watchlist'); if (stored) { wl = JSON.parse(stored); setWatchlist(wl); } } catch { /* ignore */ }
    fetchData(wl); fetchZeroDTE(); fetchUnusual(); fetchSectors(); fetchPCR(); fetchSparklines(wl);
  }, [fetchData, fetchZeroDTE, fetchUnusual, fetchSectors, fetchPCR, fetchSparklines]);

  useEffect(() => {
    const refresh = setInterval(() => { fetchData(watchlist); fetchZeroDTE(); fetchUnusual(); fetchSectors(); fetchPCR(); }, 30000);
    const sparkRefresh = setInterval(() => fetchSparklines(watchlist), 60000);
    const tick = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => { clearInterval(refresh); clearInterval(sparkRefresh); clearInterval(tick); };
  }, [fetchData, fetchZeroDTE, fetchUnusual, fetchSectors, fetchPCR, fetchSparklines, watchlist]);

  const addSymbol = useCallback(() => {
    const sym = newSymbol.trim().toUpperCase();
    if (sym && !watchlist.includes(sym)) { const next = [...watchlist, sym]; setWatchlist(next); localStorage.setItem('axecap-watchlist', JSON.stringify(next)); setNewSymbol(''); fetchData(next); fetchSparklines([sym]); }
  }, [newSymbol, watchlist, fetchData, fetchSparklines]);

  const removeSymbol = useCallback((sym: string) => { const next = watchlist.filter(s => s !== sym); setWatchlist(next); localStorage.setItem('axecap-watchlist', JSON.stringify(next)); }, [watchlist]);

  const sectorEntries = useMemo(() => SECTOR_TICKERS.map(ticker => ({ ticker, name: SECTOR_MAP[ticker], data: sectors[ticker] as SectorQuote | undefined })), [sectors]);

  const thS: React.CSSProperties = { textAlign: 'right', fontSize: 10, color: brand.smoke, fontFamily: MONO, padding: '6px 8px', borderBottom: `1px solid ${brand.border}`, fontWeight: 600, letterSpacing: '0.04em' };
  const thL: React.CSSProperties = { ...thS, textAlign: 'left' };
  const tdS: React.CSSProperties = { textAlign: 'right', fontSize: 12, color: brand.silver, fontFamily: MONO, padding: '6px 8px', borderBottom: `1px solid ${brand.border}` };
  const tdL: React.CSSProperties = { ...tdS, textAlign: 'left' };
  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, maxWidth: 1400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: '1.5rem', letterSpacing: '0.05em' }}>AxeCap Terminal</h1>
            <p style={{ color: brand.smoke, fontSize: 12 }}>Real-time market intelligence | Options | Flow</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastRefresh && <span style={{ fontFamily: MONO, fontSize: 11, color: brand.smoke }}>{fmt(lastRefresh)}</span>}
            <button onClick={() => { fetchData(watchlist); fetchZeroDTE(); fetchUnusual(); fetchSectors(); fetchPCR(); setCountdown(30); }} style={{ ...styles.button, padding: '6px 14px', fontSize: 12 }}>Refresh</button>
          </div>
        </div>

        {error && (<div style={{ ...styles.card, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '1rem', padding: '10px 14px' }}><span style={{ color: brand.error, fontSize: 12 }}>{error}</span></div>)}

        {/* TICKER BOARD */}
        <div style={{ ...styles.card, padding: 0, marginBottom: '1rem', overflow: 'hidden', transition: 'border-color 0.3s', borderColor: refreshFlash ? 'rgba(245,158,11,0.5)' : brand.border }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${brand.border}`, background: refreshFlash ? 'rgba(245,158,11,0.05)' : brand.graphite }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: MONO, letterSpacing: '0.05em' }}>AXECAP TERMINAL</span>
              <span style={{ fontSize: 10, color: isLive ? brand.success : brand.amber }}>{isLive ? 'LIVE' : 'CACHED'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {pcrData && (<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: brand.smoke, fontFamily: MONO }}>P/C:</span>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: pcrData.pcr < 0.7 ? '#22c55e' : pcrData.pcr > 1.0 ? '#ef4444' : '#eab308' }}>{pcrData.pcr.toFixed(2)}</span>
                <span style={{ fontSize: 9, fontFamily: MONO, fontWeight: 600, padding: '1px 6px', borderRadius: 3, color: pcrData.sentiment === 'Bullish' ? '#22c55e' : pcrData.sentiment === 'Bearish' ? '#ef4444' : '#eab308', background: pcrData.sentiment === 'Bullish' ? 'rgba(34,197,94,0.1)' : pcrData.sentiment === 'Bearish' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)' }}>{pcrData.sentiment}</span>
              </div>)}
              <span style={{ fontSize: 10, color: brand.smoke, fontFamily: MONO }}>Next: <span style={{ color: countdown <= 5 ? brand.amber : brand.smoke }}>{countdown}s</span></span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(quotes.length || 6, 6)}, 1fr)`, gap: 0 }}>
            {quotes.map((q, i) => (
              <div key={q.symbol} onClick={() => handleTickerClick(q.symbol)} style={{ cursor: 'pointer', padding: '14px 16px', borderRight: i < quotes.length - 1 ? `1px solid ${brand.border}` : 'none', borderBottom: `1px solid ${brand.border}`, background: chainSymbol === q.symbol ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: q.changePercent >= 0 ? brand.success : brand.error, marginBottom: 2 }}>{getSym(q.symbol)}</div>
                <div style={{ fontSize: 10, color: brand.smoke, marginBottom: 6 }}>{q.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: brand.white, fontFamily: MONO, marginBottom: 4 }}>{fmtPrice(q.price)}</div>
                <div style={{ fontSize: 11, color: q.changePercent >= 0 ? brand.success : brand.error }}>{q.change > 0 ? '+' : ''}{q.change.toFixed(2)} ({q.changePercent > 0 ? '+' : ''}{q.changePercent.toFixed(2)}%)</div>
                {q.high > 0 && q.low > 0 && <div style={{ marginTop: 6, fontSize: 9, color: brand.smoke, fontFamily: MONO }}>L: {fmtPrice(q.low)} H: {fmtPrice(q.high)}</div>}
              </div>
            ))}
            {quotes.length === 0 && Array(6).fill(0).map((_, i) => (<div key={i} style={{ padding: '16px', borderRight: i < 5 ? `1px solid ${brand.border}` : 'none' }}><div style={{ color: brand.smoke, fontSize: 12 }}>Loading...</div></div>))}
          </div>
        </div>

        {/* SECTOR HEATMAP */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {sectorEntries.map(({ ticker, name, data }) => {
              const pct = data?.changePercent ?? 0; const isPos = pct >= 0;
              const intensity = Math.min(1, Math.abs(pct) / 3);
              const bg = isPos ? `rgba(34,197,94,${0.1 + intensity * 0.4})` : `rgba(239,68,68,${0.1 + intensity * 0.4})`;
              return (<div key={ticker} onClick={() => handleTickerClick(ticker)} style={{ flex: '1 1 0', minWidth: 70, padding: '8px 6px', background: bg, borderRadius: 6, textAlign: 'center', border: `1px solid ${isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, cursor: 'pointer' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: brand.white, fontFamily: MONO, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: isPos ? '#22c55e' : '#ef4444', fontFamily: MONO }}>{data ? fmtPct(pct) : '--'}</div>
              </div>);
            })}
          </div>
        </div>

        {/* WATCHLIST */}
        <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: brand.amber, fontSize: 13, fontWeight: 600 }}>WATCHLIST</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSymbol()} placeholder="Symbol" style={{ ...styles.input, width: 100, padding: '6px 10px', fontSize: 12 }} />
              <button onClick={addSymbol} style={{ ...styles.button, padding: '6px 12px', fontSize: 12 }}>+ ADD</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thL}>SYMBOL</th><th style={thL}>NAME</th><th style={thS}>PRICE</th><th style={thS}>CHANGE</th><th style={thS}>DAY RANGE</th><th style={{ ...thS, textAlign: 'center' }}>SPARK</th><th style={{ ...thS, width: 32 }}></th></tr></thead>
              <tbody>
                {watchlist.map(sym => { const q = watchlistQuotes[sym]; const spark = sparklines[sym]; return (
                  <tr key={sym}>
                    <td onClick={() => handleTickerClick(sym)} style={{ ...tdL, color: brand.amber, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{sym}</td>
                    <td style={{ ...tdL, color: brand.silver, fontSize: 12 }}>{q?.name || sym}</td>
                    <td style={{ ...tdS, color: brand.white, fontSize: 13 }}>{q ? fmtPrice(q.price) : '--'}</td>
                    <td style={{ ...tdS, color: q ? (q.changePercent >= 0 ? brand.success : brand.error) : brand.smoke, fontSize: 12 }}>{q ? fmtPct(q.changePercent) : '--'}</td>
                    <td style={{ ...tdS, padding: '6px 8px' }}>{q?.high && q?.low ? <DayRangeBar low={q.low} high={q.high} current={q.price} /> : <span style={{ color: brand.smoke }}>--</span>}</td>
                    <td style={{ ...tdS, textAlign: 'center', padding: '4px 8px' }}>{spark ? <Sparkline data={spark.closes} /> : <span style={{ color: brand.smoke, fontSize: 10 }}>--</span>}</td>
                    <td style={tdS}><button onClick={() => removeSymbol(sym)} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: 16, padding: 0 }}>x</button></td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>
        {/* OPTIONS CHAIN */}
        {chainSymbol && (<div style={{ ...styles.card, marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, background: brand.graphite }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: MONO }}>OPTIONS CHAIN | {chainSymbol}</span>
              {chainData && (<><span style={{ fontSize: 10, color: brand.smoke, fontFamily: MONO }}>Spot: <span style={{ color: brand.white }}>{fmtPrice2(chainData.currentPrice)}</span></span>
                {chainData.expirations?.length > 1 && (<select value={selectedExpiry} onChange={e => handleExpiryChange(e.target.value)} style={{ background: brand.graphite, color: brand.amber, border: `1px solid ${brand.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: MONO, cursor: 'pointer' }}>{chainData.expirations.map(exp => <option key={exp} value={exp}>{exp}</option>)}</select>)}</>)}
            </div>
            <button onClick={() => { setChainSymbol(null); setChainData(null); }} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>X</button>
          </div>
          <div style={{ display: 'flex', borderBottom: `1px solid ${brand.border}` }}>
            {(['calls', 'puts'] as const).map(tab => (<button key={tab} onClick={() => setChainTab(tab)} style={{ flex: 1, padding: '10px 0', background: chainTab === tab ? 'rgba(245,158,11,0.08)' : 'transparent', border: 'none', borderBottom: chainTab === tab ? `2px solid ${brand.amber}` : '2px solid transparent', color: chainTab === tab ? (tab === 'calls' ? brand.success : brand.error) : brand.smoke, fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{tab.toUpperCase()} {chainData && <span style={{ fontSize: 10, opacity: 0.7 }}>({(tab === 'calls' ? chainData.calls : chainData.puts).length})</span>}</button>))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            {chainLoading ? (<div style={{ padding: '32px', textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: MONO }}>Loading options chain...</div>
            ) : chainData ? (<table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thL}>Strike</th><th style={thS}>Last</th><th style={thS}>Chg</th><th style={thS}>Chg%</th><th style={thS}>Vol</th><th style={thS}>OI</th><th style={thS}>IV</th><th style={thS}>Delta</th><th style={thS}>Gamma</th><th style={thS}>Theta</th><th style={thS}>Vega</th></tr></thead>
              <tbody>{(chainTab === 'calls' ? chainData.calls : chainData.puts).map((opt, idx) => {
                const isITM = chainTab === 'calls' ? opt.strike < chainData.currentPrice : opt.strike > chainData.currentPrice;
                const isATM = chainData.currentPrice > 0 && Math.abs(opt.strike - chainData.currentPrice) <= (chainData.currentPrice * 0.005);
                const highVol = opt.volume > 10000;
                return (<tr key={`${opt.strike}-${idx}`} style={{ background: isATM ? 'rgba(245,158,11,0.10)' : isITM ? `rgba(${chainTab === 'calls' ? '34,197,94' : '239,68,68'},0.05)` : 'transparent' }}>
                  <td style={{ ...tdL, color: isATM ? brand.amber : brand.white, fontWeight: isATM ? 700 : 600 }}>{fmtPrice2(opt.strike)}{isATM && <span style={{ marginLeft: 6, fontSize: 9, color: brand.amber }}>ATM</span>}</td>
                  <td style={{ ...tdS, color: brand.white }}>{fmtPrice2(opt.last)}</td>
                  <td style={{ ...tdS, color: (opt.change ?? 0) >= 0 ? brand.success : brand.error }}>{opt.change ? (opt.change > 0 ? '+' : '') + opt.change.toFixed(2) : '--'}</td>
                  <td style={{ ...tdS, color: (opt.changePercent ?? 0) >= 0 ? brand.success : brand.error }}>{opt.changePercent ? fmtPct(opt.changePercent) : '--'}</td>
                  <td style={{ ...tdS, fontWeight: highVol ? 700 : 400, color: highVol ? brand.white : brand.silver }}>{fmtVol(opt.volume)}</td>
                  <td style={tdS}>{fmtVol(opt.openInterest)}</td>
                  <td style={tdS}>{fmtIV(opt.impliedVolatility)}</td>
                  <td style={{ ...tdS, color: chainTab === 'calls' ? brand.success : brand.error }}>{fmtDelta(opt.delta)}</td>
                  <td style={tdS}>{opt.gamma ? opt.gamma.toFixed(4) : '--'}</td>
                  <td style={tdS}>{opt.theta ? opt.theta.toFixed(4) : '--'}</td>
                  <td style={tdS}>{opt.vega ? opt.vega.toFixed(4) : '--'}</td>
                </tr>);
              })}</tbody></table>
            ) : (<div style={{ padding: '32px', textAlign: 'center', color: brand.smoke, fontSize: 12 }}>No chain data available</div>)}
          </div>
        </div>)}

        {/* 0DTE SCANNER */}
        <div style={{ ...styles.card, marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, background: brand.graphite }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: MONO }}>0DTE SCANNER</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: MONO, background: 'rgba(245,158,11,0.1)', color: brand.amber }}>SPY | QQQ | NVDA</span>
            </div>
            <span style={{ fontSize: 10, color: brand.smoke, fontFamily: MONO }}>Top 15 by volume</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {zeroDTELoading ? (<div style={{ padding: '32px', textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: MONO }}>Scanning 0DTE contracts...</div>
            ) : zeroDTE.length > 0 ? (<table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thL}>Ticker</th><th style={thS}>Strike</th><th style={thL}>C/P</th><th style={thS}>Last</th><th style={thS}>Chg%</th><th style={thS}>Vol</th><th style={thS}>OI</th><th style={thS}>VWAP</th></tr></thead>
              <tbody>{zeroDTE.slice(0, 15).map((c, idx) => {
                const volOi = c.openInterest > 0 ? c.volume / c.openInterest : 0;
                return (<tr key={`z-${c.symbol}-${c.strike}-${c.type}-${idx}`} style={{ background: volOi > 5 ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                  <td onClick={() => handleTickerClick(c.symbol)} style={{ ...tdL, color: brand.amber, fontWeight: 600, cursor: 'pointer' }}>{c.symbol}</td>
                  <td style={{ ...tdS, color: brand.white }}>{fmtPrice2(c.strike)}</td>
                  <td style={{ ...tdL, color: c.type === 'CALL' ? brand.success : brand.error, fontWeight: 700, fontSize: 11 }}>{c.type}</td>
                  <td style={{ ...tdS, color: brand.white }}>{fmtPrice2(c.last)}</td>
                  <td style={{ ...tdS, color: (c.changePercent ?? 0) >= 0 ? brand.success : brand.error }}>{c.changePercent ? fmtPct(c.changePercent) : '--'}</td>
                  <td style={{ ...tdS, fontWeight: c.volume > 10000 ? 700 : 400, color: c.volume > 10000 ? brand.white : brand.silver }}>{fmtVol(c.volume)}{volOi > 5 ? ' *' : ''}</td>
                  <td style={tdS}>{fmtVol(c.openInterest)}</td>
                  <td style={tdS}>{c.vwap ? fmtPrice2(c.vwap) : '--'}</td>
                </tr>);
              })}</tbody></table>
            ) : (<div style={{ padding: '32px', textAlign: 'center', color: brand.smoke, fontSize: 12 }}>No 0DTE contracts found</div>)}
          </div>
        </div>
        {/* UNUSUAL ACTIVITY */}
        <div style={{ ...styles.card, marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, background: brand.graphite }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: 13, fontFamily: MONO }}>UNUSUAL ACTIVITY</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: MONO, background: 'rgba(239,68,68,0.1)', color: brand.error }}>{'Vol > 2x OI'}</span>
            </div>
            <span style={{ fontSize: 10, color: brand.smoke, fontFamily: MONO }}>Top 20 by Vol/OI</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {unusualLoading ? (<div style={{ padding: '32px', textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: MONO }}>Scanning unusual activity...</div>
            ) : unusual.length > 0 ? (<table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thL}>Ticker</th><th style={thS}>Strike</th><th style={thL}>C/P</th><th style={thS}>Expiry</th><th style={thS}>Last</th><th style={thS}>Vol</th><th style={thS}>OI</th><th style={thS}>Vol/OI</th><th style={thS}>IV</th></tr></thead>
              <tbody>{unusual.slice(0, 20).map((c, idx) => (<tr key={`u-${c.symbol}-${c.strike}-${c.type}-${idx}`} style={{ background: c.volOiRatio > 5 ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                <td onClick={() => handleTickerClick(c.symbol)} style={{ ...tdL, color: brand.amber, fontWeight: 600, cursor: 'pointer' }}>{c.symbol}</td>
                <td style={{ ...tdS, color: brand.white }}>{fmtPrice2(c.strike)}</td>
                <td style={tdL}><span style={{ padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: MONO, color: c.type === 'CALL' ? '#22c55e' : '#ef4444', background: c.type === 'CALL' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>{c.type}</span></td>
                <td style={{ ...tdS, fontSize: 10 }}>{c.expiry}</td>
                <td style={{ ...tdS, color: brand.white }}>{fmtPrice2(c.last)}</td>
                <td style={{ ...tdS, fontWeight: 700, color: brand.white }}>{fmtVol(c.volume)}</td>
                <td style={tdS}>{fmtVol(c.openInterest)}</td>
                <td style={{ ...tdS, fontWeight: 700, color: brand.amber }}>{c.volOiRatio.toFixed(1)}x{c.volOiRatio > 5 ? ' *' : ''}</td>
                <td style={tdS}>{fmtIV(c.impliedVolatility)}</td>
              </tr>))}</tbody></table>
            ) : (<div style={{ padding: '32px', textAlign: 'center', color: brand.smoke, fontSize: 12 }}>No unusual activity detected</div>)}
          </div>
        </div>

        {/* MARKET BRIEFING */}
        <div style={styles.card}>
          <div style={{ color: brand.amber, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>MARKET BRIEFING</div>
          {news.length > 0 ? news.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < news.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
              <div style={{ flexShrink: 0, minWidth: 65, textAlign: 'right' }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: brand.smoke }}>{new Date(n.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ fontSize: 9, color: brand.smoke }}>{n.publisher}</div>
              </div>
              <div style={{ flex: 1 }}>
                {n.relatedSymbol && <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontFamily: MONO, background: 'rgba(245,158,11,0.1)', color: brand.amber, marginBottom: 4 }}>{n.relatedSymbol}</span>}
                <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>{n.title}</div>
              </div>
            </div>
          )) : (<div style={{ color: brand.smoke, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Loading market briefing...</div>)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '8px 0', borderTop: `1px solid ${brand.border}` }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: brand.smoke }}>AXECAP TERMINAL v3.0</span>
          <span style={{ fontSize: 10, color: brand.smoke }}>{isLive ? 'Live data via Massive + Yahoo' : 'Cached/fallback data'}{lastRefresh && ` | Last: ${fmt(lastRefresh)}`}</span>
        </div>
      </div>
    </div>
  );
}