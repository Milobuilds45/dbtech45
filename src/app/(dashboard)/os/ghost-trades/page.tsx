'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { brand, styles } from '@/lib/brand';

const M = "'JetBrains Mono','Fira Code',monospace";
const INITIAL_CASH = 100_000;
const STORAGE_KEY = 'ghost_trades_v1';

interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
}

interface Trade {
  id: string;
  date: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  pnl: number | null;
  totalCost: number;
}

interface Portfolio {
  cash: number;
  positions: Position[];
  trades: Trade[];
  peakValue: number;
}

function defaultPortfolio(): Portfolio {
  return { cash: INITIAL_CASH, positions: [], trades: [], peakValue: INITIAL_CASH };
}

function loadPortfolio(): Portfolio {
  if (typeof window === 'undefined') return defaultPortfolio();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPortfolio(), ...JSON.parse(raw) };
  } catch {}
  return defaultPortfolio();
}

function extractPrice(snap: unknown): number | null {
  if (!snap || typeof snap !== 'object') return null;
  const s = snap as Record<string, unknown>;
  const results = s.results as Record<string, unknown> | undefined;
  if (results) {
    const session = results.session as Record<string, unknown> | undefined;
    if (typeof session?.close === 'number' && session.close > 0) return session.close;
    const day = results.day as Record<string, unknown> | undefined;
    if (typeof day?.c === 'number' && day.c > 0) return day.c;
    const lastTrade = results.lastTrade as Record<string, unknown> | undefined;
    if (typeof lastTrade?.p === 'number' && lastTrade.p > 0) return lastTrade.p;
  }
  const ticker = s.ticker as Record<string, unknown> | undefined;
  if (ticker) {
    const day = ticker.day as Record<string, unknown> | undefined;
    if (typeof day?.c === 'number' && day.c > 0) return day.c;
  }
  return null;
}

const fp = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fpc = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const fdate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function GhostTrades() {
  const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState('');
  const [tradeError, setTradeError] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => { setPortfolio(loadPortfolio()); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    }
  }, [portfolio]);

  const fetchPrices = useCallback(async (tickers: string[]) => {
    if (tickers.length === 0) return;
    setPricesLoading(true);
    try {
      const res = await fetch(`/api/market-data?action=snapshots&tickers=${tickers.join(',')}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return;
      const data = await res.json() as { snapshots: Record<string, unknown> };
      const updated: Record<string, number> = {};
      for (const t of tickers) {
        const p = extractPrice(data.snapshots?.[t]);
        if (p) updated[t] = p;
      }
      setPrices(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Price fetch:', e);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    const tickers = portfolio.positions.map(p => p.ticker);
    if (tickers.length > 0) fetchPrices(tickers);
    const iv = setInterval(() => {
      if (portfolio.positions.length > 0) fetchPrices(portfolio.positions.map(p => p.ticker));
    }, 30000);
    return () => clearInterval(iv);
  }, [portfolio.positions, fetchPrices]);

  // Derived stats
  const totalPosValue = portfolio.positions.reduce(
    (sum, pos) => sum + pos.shares * (prices[pos.ticker] ?? pos.avgCost), 0
  );
  const totalValue = portfolio.cash + totalPosValue;
  const totalReturn = ((totalValue - INITIAL_CASH) / INITIAL_CASH) * 100;
  const unrealizedPnl = portfolio.positions.reduce(
    (sum, pos) => sum + pos.shares * ((prices[pos.ticker] ?? pos.avgCost) - pos.avgCost), 0
  );
  const closedTrades = portfolio.trades.filter(t => t.pnl !== null);
  const wins = closedTrades.filter(t => (t.pnl ?? 0) > 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const bestTrade = closedTrades.reduce<Trade | null>((b, t) => !b || (t.pnl ?? 0) > (b.pnl ?? 0) ? t : b, null);
  const worstTrade = closedTrades.reduce<Trade | null>((w, t) => !w || (t.pnl ?? 0) < (w.pnl ?? 0) ? t : w, null);
  const maxDD = totalValue < INITIAL_CASH ? ((INITIAL_CASH - totalValue) / INITIAL_CASH) * 100 : 0;

  async function handleTrade() {
    const t = ticker.toUpperCase().trim();
    const s = parseInt(shares, 10);
    if (!t || isNaN(s) || s <= 0) { setTradeError('Enter a valid ticker and share count'); return; }
    setTradeError('');
    setTradeLoading(true);

    let price = prices[t];
    if (!price) {
      try {
        const res = await fetch(`/api/market-data?action=snapshots&tickers=${t}`, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = await res.json() as { snapshots: Record<string, unknown> };
          const p = extractPrice(data.snapshots?.[t]);
          if (p) { price = p; setPrices(prev => ({ ...prev, [t]: p })); }
        }
      } catch {}
    }

    if (!price || price <= 0) {
      setTradeError(`Could not fetch price for ${t}. Try again.`);
      setTradeLoading(false);
      return;
    }

    const totalCost = price * s;
    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (action === 'BUY') {
      if (portfolio.cash < totalCost) {
        setTradeError(`Insufficient cash. Need ${fp(totalCost)}, have ${fp(portfolio.cash)}`);
        setTradeLoading(false);
        return;
      }
      const existingIdx = portfolio.positions.findIndex(p => p.ticker === t);
      let newPositions: Position[];
      if (existingIdx >= 0) {
        const ex = portfolio.positions[existingIdx];
        const newShares = ex.shares + s;
        const newAvg = (ex.shares * ex.avgCost + s * price) / newShares;
        newPositions = portfolio.positions.map((p, i) => i === existingIdx ? { ...p, shares: newShares, avgCost: newAvg } : p);
      } else {
        newPositions = [...portfolio.positions, { ticker: t, shares: s, avgCost: price }];
      }
      const newTrade: Trade = { id, date: now, ticker: t, action: 'BUY', shares: s, price, pnl: null, totalCost };
      setPortfolio(prev => ({ ...prev, cash: prev.cash - totalCost, positions: newPositions, trades: [newTrade, ...prev.trades] }));
    } else {
      const existingIdx = portfolio.positions.findIndex(p => p.ticker === t);
      if (existingIdx < 0) { setTradeError(`No position in ${t}`); setTradeLoading(false); return; }
      const ex = portfolio.positions[existingIdx];
      if (ex.shares < s) { setTradeError(`Only ${ex.shares} shares of ${t} held`); setTradeLoading(false); return; }
      const pnl = (price - ex.avgCost) * s;
      const newPositions = ex.shares === s
        ? portfolio.positions.filter((_, i) => i !== existingIdx)
        : portfolio.positions.map((p, i) => i === existingIdx ? { ...p, shares: p.shares - s } : p);
      const newTrade: Trade = { id, date: now, ticker: t, action: 'SELL', shares: s, price, pnl, totalCost };
      setPortfolio(prev => ({ ...prev, cash: prev.cash + totalCost, positions: newPositions, trades: [newTrade, ...prev.trades] }));
    }

    setTicker('');
    setShares('');
    setTradeLoading(false);
  }

  function handleReset() {
    setPortfolio(defaultPortfolio());
    setPrices({});
    setShowReset(false);
  }

  const statCard = (label: string, value: string, color: string) => (
    <div key={label} style={{ ...styles.card, textAlign: 'center' as const, padding: '1rem' }}>
      <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ color, fontSize: '1.1rem', fontWeight: 700, fontFamily: M }}>{value}</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/os" style={styles.backLink}>← Back to OS</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
          <div>
            <h1 style={styles.h1}>Ghost Trades</h1>
            <p style={styles.subtitle}>Paper trading simulator — $100K virtual capital, zero risk</p>
          </div>
          <button
            onClick={() => setShowReset(true)}
            style={{ ...styles.button, backgroundColor: 'transparent', color: brand.error, border: `1px solid ${brand.error}` }}
          >
            Reset Portfolio
          </button>
        </div>

        {showReset && (
          <div style={{ ...styles.card, border: `1px solid ${brand.error}`, marginBottom: '2rem' }}>
            <p style={{ color: brand.white, marginBottom: '1rem' }}>Reset portfolio to $100,000 cash? All trades and positions will be lost.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleReset} style={{ ...styles.button, backgroundColor: brand.error }}>Confirm Reset</button>
              <button onClick={() => setShowReset(false)} style={{ ...styles.button, backgroundColor: brand.graphite, color: brand.white }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statCard('Total Value', fp(totalValue), brand.white)}
          {statCard('Cash', fp(portfolio.cash), brand.silver)}
          {statCard('Unrealized P&L', `${unrealizedPnl >= 0 ? '+' : ''}${fp(unrealizedPnl)}`, unrealizedPnl >= 0 ? brand.success : brand.error)}
          {statCard('Total Return', fpc(totalReturn), totalReturn >= 0 ? brand.success : brand.error)}
          {statCard('Win Rate', closedTrades.length > 0 ? `${winRate.toFixed(1)}%` : '—', brand.amber)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>
            {/* Trade form */}
            <div style={styles.card}>
              <h2 style={{ color: brand.amber, marginBottom: '1rem', fontFamily: "'Space Grotesk', system-ui", fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                Place Trade
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {(['BUY', 'SELL'] as const).map(a => (
                  <button key={a} onClick={() => setAction(a)} style={{
                    ...styles.button,
                    flex: 1,
                    backgroundColor: action === a ? (a === 'BUY' ? brand.success : brand.error) : brand.graphite,
                    color: action === a ? '#000' : brand.silver,
                    padding: '0.6rem',
                  }}>{a}</button>
                ))}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>Ticker Symbol</div>
                <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="AAPL" style={styles.input} onKeyDown={e => e.key === 'Enter' && handleTrade()} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>Shares</div>
                <input type="number" value={shares} onChange={e => setShares(e.target.value)} placeholder="100" min="1" style={styles.input} onKeyDown={e => e.key === 'Enter' && handleTrade()} />
              </div>
              {tradeError && <div style={{ color: brand.error, fontSize: '13px', marginBottom: '0.75rem', fontFamily: M }}>{tradeError}</div>}
              <button onClick={handleTrade} disabled={tradeLoading} style={{ ...styles.button, width: '100%', opacity: tradeLoading ? 0.6 : 1 }}>
                {tradeLoading ? 'Fetching price...' : `Execute ${action}`}
              </button>
            </div>

            {/* Performance card */}
            <div style={styles.card}>
              <h2 style={{ color: brand.amber, marginBottom: '1rem', fontFamily: "'Space Grotesk', system-ui", fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                Performance
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Best Trade', value: bestTrade ? `${bestTrade.ticker} +${fp(bestTrade.pnl ?? 0)}` : '—', color: brand.success },
                  { label: 'Worst Trade', value: worstTrade ? `${worstTrade.ticker} ${fp(worstTrade.pnl ?? 0)}` : '—', color: brand.error },
                  { label: 'Closed Trades', value: String(closedTrades.length), color: brand.white },
                  { label: 'Max Drawdown', value: `${maxDD.toFixed(2)}%`, color: brand.error },
                  { label: 'Total P&L', value: fp(closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)), color: brand.amber },
                  { label: 'Open Positions', value: String(portfolio.positions.length), color: brand.silver },
                ].map(row => (
                  <div key={row.label}>
                    <div style={styles.sectionLabel}>{row.label}</div>
                    <div style={{ color: row.color, fontFamily: M, fontSize: '13px', marginTop: '0.2rem' }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div style={styles.card}>
              <h2 style={{ color: brand.amber, marginBottom: '1rem', fontFamily: "'Space Grotesk', system-ui", fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                Leaderboard
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.amber}` }}>
                <div style={{ color: brand.amber, fontSize: '1.2rem', fontWeight: 700, fontFamily: M, minWidth: '2rem' }}>#1</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>You</div>
                  <div style={{ color: brand.smoke, fontSize: '11px', marginTop: '0.1rem' }}>{closedTrades.length} trades · {winRate.toFixed(0)}% win rate</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ color: totalReturn >= 0 ? brand.success : brand.error, fontFamily: M, fontWeight: 700, fontSize: '14px' }}>{fpc(totalReturn)}</div>
                  <div style={{ color: brand.silver, fontFamily: M, fontSize: '12px' }}>{fp(totalValue)}</div>
                </div>
              </div>
              <p style={{ color: brand.smoke, fontSize: '11px', marginTop: '0.75rem' }}>Multiplayer leaderboard coming soon.</p>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>
            {/* Positions */}
            <div style={styles.card}>
              <h2 style={{ color: brand.amber, marginBottom: '1rem', fontFamily: "'Space Grotesk', system-ui", fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                Open Positions {pricesLoading && <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 400 }}>· refreshing prices...</span>}
              </h2>
              {portfolio.positions.length === 0 ? (
                <p style={{ color: brand.smoke, fontSize: '14px' }}>No open positions. Place a trade to get started.</p>
              ) : (
                <div style={{ overflowX: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                    <thead>
                      <tr>
                        {['Ticker', 'Shares', 'Avg Cost', 'Current Price', 'P&L', 'P&L %', 'Market Value'].map(h => (
                          <th key={h} style={{ ...styles.sectionLabel, textAlign: 'left' as const, padding: '0 0.75rem 0.5rem 0', borderBottom: `1px solid ${brand.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map(pos => {
                        const cur = prices[pos.ticker] ?? pos.avgCost;
                        const pnl = (cur - pos.avgCost) * pos.shares;
                        const pct = ((cur - pos.avgCost) / pos.avgCost) * 100;
                        const mv = cur * pos.shares;
                        return (
                          <tr key={pos.ticker}>
                            <td style={{ color: brand.amber, fontFamily: M, fontSize: '14px', fontWeight: 700, padding: '0.6rem 0.75rem 0.6rem 0' }}>{pos.ticker}</td>
                            <td style={{ color: brand.white, fontFamily: M, fontSize: '14px', padding: '0.6rem 0.75rem 0.6rem 0' }}>{pos.shares.toLocaleString()}</td>
                            <td style={{ color: brand.silver, fontFamily: M, fontSize: '14px', padding: '0.6rem 0.75rem 0.6rem 0' }}>${pos.avgCost.toFixed(2)}</td>
                            <td style={{ color: brand.white, fontFamily: M, fontSize: '14px', padding: '0.6rem 0.75rem 0.6rem 0' }}>${cur.toFixed(2)}</td>
                            <td style={{ color: pnl >= 0 ? brand.success : brand.error, fontFamily: M, fontSize: '14px', padding: '0.6rem 0.75rem 0.6rem 0' }}>
                              {pnl >= 0 ? '+' : ''}{fp(pnl)}
                            </td>
                            <td style={{ color: pct >= 0 ? brand.success : brand.error, fontFamily: M, fontSize: '14px', padding: '0.6rem 0.75rem 0.6rem 0' }}>
                              {fpc(pct)}
                            </td>
                            <td style={{ color: brand.silver, fontFamily: M, fontSize: '14px', padding: '0.6rem 0' }}>{fp(mv)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Trade log */}
            <div style={styles.card}>
              <h2 style={{ color: brand.amber, marginBottom: '1rem', fontFamily: "'Space Grotesk', system-ui", fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                Trade History ({portfolio.trades.length})
              </h2>
              {portfolio.trades.length === 0 ? (
                <p style={{ color: brand.smoke, fontSize: '14px' }}>No trades yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' as const, maxHeight: '400px', overflowY: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                    <thead>
                      <tr>
                        {['Date', 'Ticker', 'Action', 'Shares', 'Price', 'Total', 'P&L'].map(h => (
                          <th key={h} style={{ ...styles.sectionLabel, textAlign: 'left' as const, padding: '0 1rem 0.5rem 0', borderBottom: `1px solid ${brand.border}`, position: 'sticky' as const, top: 0, backgroundColor: brand.carbon }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.trades.map(trade => (
                        <tr key={trade.id} style={{ borderBottom: `1px solid ${brand.border}` }}>
                          <td style={{ color: brand.smoke, fontFamily: M, fontSize: '12px', padding: '0.5rem 1rem 0.5rem 0' }}>{fdate(trade.date)}</td>
                          <td style={{ color: brand.amber, fontFamily: M, fontSize: '14px', fontWeight: 600, padding: '0.5rem 1rem 0.5rem 0' }}>{trade.ticker}</td>
                          <td style={{ color: trade.action === 'BUY' ? brand.success : brand.error, fontFamily: M, fontSize: '13px', fontWeight: 700, padding: '0.5rem 1rem 0.5rem 0' }}>{trade.action}</td>
                          <td style={{ color: brand.white, fontFamily: M, fontSize: '13px', padding: '0.5rem 1rem 0.5rem 0' }}>{trade.shares.toLocaleString()}</td>
                          <td style={{ color: brand.white, fontFamily: M, fontSize: '13px', padding: '0.5rem 1rem 0.5rem 0' }}>${trade.price.toFixed(2)}</td>
                          <td style={{ color: brand.silver, fontFamily: M, fontSize: '13px', padding: '0.5rem 1rem 0.5rem 0' }}>{fp(trade.totalCost)}</td>
                          <td style={{ color: trade.pnl === null ? brand.smoke : trade.pnl >= 0 ? brand.success : brand.error, fontFamily: M, fontSize: '13px', fontWeight: trade.pnl !== null ? 600 : 400, padding: '0.5rem 0' }}>
                            {trade.pnl === null ? 'OPEN' : `${trade.pnl >= 0 ? '+' : ''}${fp(trade.pnl)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
