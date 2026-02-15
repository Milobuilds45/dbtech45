'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';

interface ImpliedMoveData {
  symbol: string;
  currentPrice: number;
  earningsDate: string | null;
  daysToEarnings: number | null;
  atmStraddle: {
    callStrike: number;
    callPrice: number;
    putStrike: number;
    putPrice: number;
    totalPremium: number;
    impliedMove: number;
    impliedMovePercent: number;
    expiration: string | null;
  } | null;
  historicalMoves: {
    date: string;
    quarter: string;
    actualMove: number;
    actualMovePercent: number;
    direction: 'up' | 'down';
  }[];
  avgHistoricalMove: number;
  avgHistoricalMovePercent: number;
  edge: 'cheap' | 'fair' | 'expensive';
  edgePercent: number;
  error?: string;
}

const M = "'JetBrains Mono','Fira Code',monospace";

export default function ImpliedMoveCard({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ImpliedMoveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/yfinance-data?type=implied-move&symbol=${encodeURIComponent(symbol)}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d: ImpliedMoveData = await r.json();
      if (d.error && !d.atmStraddle) { setData(null); return; }
      setData(d);
    } catch (e) {
      setError('Failed to load implied move data');
      console.error(e);
    } finally { setLoading(false); }
  }, [symbol]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div style={{ padding: '16px', borderBottom: `1px solid ${brand.border}` }}>
      <div style={{ fontSize: 10, color: brand.smoke, fontFamily: M, letterSpacing: '0.05em' }}>
        <span style={{ opacity: 0.5, animation: 'axp 1.5s ease-in-out infinite' }}>LOADING IMPLIED MOVE...</span>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, background: 'rgba(239,68,68,0.06)' }}>
      <span style={{ color: '#EF4444', fontSize: 11 }}>⚠ {error}</span>
      <button onClick={fetchData} style={{ marginLeft: 8, fontSize: 10, color: brand.amber, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
    </div>
  );

  if (!data || !data.atmStraddle || !data.daysToEarnings || data.daysToEarnings > 14 || data.daysToEarnings < 0) return null;

  const edgeColors = {
    cheap: { bg: 'rgba(34,197,94,0.12)', text: '#22C55E', border: '#22C55E', icon: '🔥' },
    fair: { bg: 'rgba(234,179,8,0.12)', text: '#EAB308', border: '#EAB308', icon: '➖' },
    expensive: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', border: '#EF4444', icon: '⚠' },
  };
  const ec = edgeColors[data.edge];

  return (
    <div style={{ padding: '16px', borderBottom: `1px solid ${brand.border}`, borderLeft: `3px solid ${ec.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span style={{ fontSize: 10, color: brand.amber, fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', textTransform: 'uppercase' }}>IMPLIED MOVE</span>
        </div>
        <span style={{ fontSize: 10, color: brand.smoke, fontFamily: M }}>⏱ {data.daysToEarnings}d to earnings</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, marginBottom: 14 }}>
        {/* Expected Move */}
        <div>
          <div style={{ fontSize: 9, color: brand.smoke, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXPECTED MOVE</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: brand.amber, fontFamily: M }}>±${data.atmStraddle.impliedMove.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: brand.amber, fontFamily: M, opacity: 0.8 }}>({`±${data.atmStraddle.impliedMovePercent.toFixed(1)}%`})</div>
          <div style={{ fontSize: 9, color: brand.smoke, marginTop: 2 }}>from ATM straddle</div>
        </div>

        {/* Historical Avg */}
        <div>
          <div style={{ fontSize: 9, color: brand.smoke, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>HISTORICAL AVG</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA', fontFamily: M }}>±{data.avgHistoricalMovePercent.toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: brand.smoke, fontFamily: M }}>last {data.historicalMoves.length} events</div>
        </div>

        {/* Edge Badge */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: ec.bg,
          border: `1px solid ${ec.border}33`,
          textAlign: 'center',
          alignSelf: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ec.text, fontFamily: M, textTransform: 'uppercase' }}>
            {data.edge.toUpperCase()} {ec.icon}
          </div>
          <div style={{ fontSize: 10, color: ec.text, fontFamily: M, marginTop: 2 }}>
            {data.edgePercent > 0 ? '+' : ''}{data.edgePercent.toFixed(1)}% gap
          </div>
        </div>
      </div>

      {/* Historical Earnings Bars */}
      {data.historicalMoves.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: brand.smoke, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            HISTORICAL EARNINGS MOVES
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.historicalMoves.slice(0, 6).map((m, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: m.direction === 'up' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${m.direction === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                minWidth: 64,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: M, color: m.direction === 'up' ? '#22C55E' : '#EF4444' }}>
                  {m.direction === 'up' ? '+' : '-'}{m.actualMovePercent.toFixed(1)}%
                </div>
                <div style={{ fontSize: 9, color: brand.smoke, fontFamily: M, marginTop: 2 }}>{m.quarter}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
