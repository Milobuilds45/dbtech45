'use client';
import { useMemo } from 'react';
import { brand } from '@/lib/brand';

interface OptionContract {
  strike: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  change: number;
  changePercent: number;
  vwap: number;
  high: number;
  low: number;
  ticker: string;
}

interface FlowBar {
  strike: number;
  callVolume: number;
  putVolume: number;
  callOI: number;
  putOI: number;
  callPremium: number;
  putPremium: number;
  isSweep: boolean;
}

interface Props {
  symbol: string;
  expDate: string;
  currentPrice: number;
  calls: OptionContract[];
  puts: OptionContract[];
}

const M = "'JetBrains Mono','Fira Code',monospace";
const fv = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`;

export default function OptionsFlow({ symbol, expDate, currentPrice, calls, puts }: Props) {
  const flowData = useMemo(() => {
    const strikeMap = new Map<number, FlowBar>();

    for (const c of calls) {
      const bar = strikeMap.get(c.strike) || {
        strike: c.strike, callVolume: 0, putVolume: 0, callOI: 0, putOI: 0, callPremium: 0, putPremium: 0, isSweep: false
      };
      bar.callVolume += c.volume || 0;
      bar.callOI += c.openInterest || 0;
      bar.callPremium += (c.volume || 0) * (c.last || 0) * 100;
      if (c.openInterest > 0 && c.volume > 2 * c.openInterest) bar.isSweep = true;
      strikeMap.set(c.strike, bar);
    }

    for (const p of puts) {
      const bar = strikeMap.get(p.strike) || {
        strike: p.strike, callVolume: 0, putVolume: 0, callOI: 0, putOI: 0, callPremium: 0, putPremium: 0, isSweep: false
      };
      bar.putVolume += p.volume || 0;
      bar.putOI += p.openInterest || 0;
      bar.putPremium += (p.volume || 0) * (p.last || 0) * 100;
      if (p.openInterest > 0 && p.volume > 2 * p.openInterest) bar.isSweep = true;
      strikeMap.set(p.strike, bar);
    }

    // Sort by strike, keep top 20 around current price
    const all = Array.from(strikeMap.values()).sort((a, b) => a.strike - b.strike);
    if (all.length === 0) return { bars: [], netPremium: 0, maxVol: 1 };

    // Find ATM index
    let atmIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < all.length; i++) {
      const d = Math.abs(all[i].strike - currentPrice);
      if (d < minDist) { minDist = d; atmIdx = i; }
    }

    const start = Math.max(0, atmIdx - 10);
    const end = Math.min(all.length, atmIdx + 11);
    const bars = all.slice(start, end);

    const netPremium = bars.reduce((s, b) => s + b.callPremium - b.putPremium, 0);
    const maxVol = Math.max(1, ...bars.map(b => Math.max(b.callVolume, b.putVolume)));

    return { bars, netPremium, maxVol };
  }, [calls, puts, currentPrice]);

  if (flowData.bars.length === 0) return null;

  const barHeight = 40;
  const netColor = flowData.netPremium >= 0 ? '#22C55E' : '#EF4444';

  return (
    <div style={{ padding: '12px 16px', borderTop: `1px solid ${brand.border}` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🌊</span>
          <span style={{ fontSize: 10, color: brand.amber, fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            OPTIONS FLOW · {symbol} · {expDate} exp
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: brand.smoke, fontFamily: M }}>Net Premium:</span>
          <span style={{ fontSize: 11, fontFamily: M, fontWeight: 700, color: netColor }}>
            {flowData.netPremium >= 0 ? '+' : ''}{fv(Math.abs(flowData.netPremium))}
          </span>
          <span style={{ fontSize: 10 }}>{flowData.netPremium >= 0 ? '📈' : '📉'}</span>
        </div>
      </div>

      {/* Flow Visualization */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {flowData.bars.map((bar) => {
          const callPct = (bar.callVolume / flowData.maxVol) * 100;
          const putPct = (bar.putVolume / flowData.maxVol) * 100;
          const isATM = Math.abs(bar.strike - currentPrice) <= currentPrice * 0.005;

          return (
            <div key={bar.strike} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 1px 1fr',
              gap: 0, marginBottom: 2, alignItems: 'center',
              background: isATM ? 'rgba(245,158,11,0.08)' : 'transparent',
              borderRadius: 3, padding: '2px 4px',
            }}>
              {/* Strike label */}
              <div style={{
                fontSize: 10, fontFamily: M, fontWeight: isATM ? 700 : 400,
                color: isATM ? brand.amber : brand.smoke, textAlign: 'right', paddingRight: 8,
              }}>
                {bar.strike.toFixed(0)}
                {isATM && <span style={{ fontSize: 8, marginLeft: 2 }}>●</span>}
              </div>

              {/* Call bar (right-aligned, grows left) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: barHeight / 2, gap: 4 }}>
                {bar.callVolume > 0 && (
                  <span style={{ fontSize: 9, fontFamily: M, color: '#22C55E', opacity: 0.7 }}>{(bar.callVolume / 1000).toFixed(0)}K</span>
                )}
                <div style={{
                  height: '70%',
                  width: `${callPct}%`,
                  minWidth: bar.callVolume > 0 ? 2 : 0,
                  background: bar.isSweep ? 'rgba(34,197,94,0.8)' : `rgba(34,197,94,${0.3 + (callPct / 100) * 0.5})`,
                  borderRadius: 2,
                  boxShadow: bar.isSweep ? '0 0 6px rgba(34,197,94,0.4)' : 'none',
                  transition: 'width 0.3s',
                }} />
              </div>

              {/* Center line */}
              <div style={{ width: 1, height: barHeight / 2, background: brand.border }} />

              {/* Put bar (left-aligned, grows right) */}
              <div style={{ display: 'flex', alignItems: 'center', height: barHeight / 2, gap: 4 }}>
                <div style={{
                  height: '70%',
                  width: `${putPct}%`,
                  minWidth: bar.putVolume > 0 ? 2 : 0,
                  background: bar.isSweep ? 'rgba(239,68,68,0.8)' : `rgba(239,68,68,${0.3 + (putPct / 100) * 0.5})`,
                  borderRadius: 2,
                  boxShadow: bar.isSweep ? '0 0 6px rgba(239,68,68,0.4)' : 'none',
                  transition: 'width 0.3s',
                }} />
                {bar.putVolume > 0 && (
                  <span style={{ fontSize: 9, fontFamily: M, color: '#EF4444', opacity: 0.7 }}>{(bar.putVolume / 1000).toFixed(0)}K</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${brand.border}` }}>
        <span style={{ fontSize: 9, fontFamily: M, color: '#22C55E' }}>■ Calls</span>
        <span style={{ fontSize: 9, fontFamily: M, color: '#EF4444' }}>■ Puts</span>
        <span style={{ fontSize: 9, fontFamily: M, color: brand.smoke }}>⚡ Sweep (Vol {'>'} 2x OI)</span>
      </div>
    </div>
  );
}
