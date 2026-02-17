'use client';
import { useMemo } from 'react';
import { brand } from '@/lib/brand';

interface OptionContract {
  strike: number;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  vwap: number;
  high: number;
  low: number;
  ticker: string;
}

interface GexLevel {
  strike: number;
  gex: number;
  type: 'support' | 'resistance' | 'flip';
}

interface Props {
  symbol: string;
  currentPrice: number;
  calls: OptionContract[];
  puts: OptionContract[];
}

const M = "'JetBrains Mono','Fira Code',monospace";

export default function GexLevels({ symbol, currentPrice, calls, puts }: Props) {
  const gexData = useMemo(() => {
    if (!calls.length || !puts.length || !currentPrice) return null;

    // Only show for SPY, QQQ
    if (!['SPY', 'QQQ'].includes(symbol)) return null;

    // Calculate GEX per strike
    // GEX_call = strike_OI * gamma * 100 * spotPrice (positive — dealers are long gamma)
    // GEX_put = strike_OI * gamma * 100 * spotPrice * -1 (negative — dealers are short gamma)
    const gexByStrike = new Map<number, number>();

    for (const c of calls) {
      if (!c.gamma || !c.openInterest) continue;
      const gex = c.openInterest * (c.gamma || 0) * 100 * currentPrice;
      gexByStrike.set(c.strike, (gexByStrike.get(c.strike) || 0) + gex);
    }

    for (const p of puts) {
      if (!p.gamma || !p.openInterest) continue;
      const gex = p.openInterest * (p.gamma || 0) * 100 * currentPrice * -1;
      gexByStrike.set(p.strike, (gexByStrike.get(p.strike) || 0) + gex);
    }

    if (gexByStrike.size === 0) return null;

    // Total GEX
    let totalGex = 0;
    for (const g of gexByStrike.values()) totalGex += g;

    // Find key levels (top 5 by absolute GEX)
    const allLevels = Array.from(gexByStrike.entries())
      .map(([strike, gex]) => ({ strike, gex }))
      .filter(l => Math.abs(l.strike - currentPrice) < currentPrice * 0.1) // within 10% of price
      .sort((a, b) => Math.abs(b.gex) - Math.abs(a.gex));

    // Find flip level (where GEX changes sign)
    const sorted = Array.from(gexByStrike.entries())
      .sort((a, b) => a[0] - b[0]);
    let flipLevel = currentPrice;
    for (let i = 1; i < sorted.length; i++) {
      if ((sorted[i - 1][1] >= 0 && sorted[i][1] < 0) || (sorted[i - 1][1] < 0 && sorted[i][1] >= 0)) {
        flipLevel = sorted[i][0];
        break;
      }
    }

    // Classify levels
    const keyLevels: GexLevel[] = allLevels.slice(0, 6).map(l => ({
      strike: l.strike,
      gex: l.gex,
      type: Math.abs(l.strike - flipLevel) < currentPrice * 0.005 ? 'flip'
        : l.gex > 0 ? 'resistance' : 'support',
    }));

    // Ensure flip level is included
    if (!keyLevels.find(l => l.type === 'flip') && flipLevel !== currentPrice) {
      keyLevels.push({ strike: flipLevel, gex: 0, type: 'flip' });
    }

    keyLevels.sort((a, b) => a.strike - b.strike);

    const regime = totalGex > 0 ? 'pinned' as const : 'volatile' as const;

    return { totalGex, flipLevel, currentPrice, regime, keyLevels };
  }, [symbol, currentPrice, calls, puts]);

  if (!gexData) return null;

  const totalGexB = gexData.totalGex / 1e9;
  const gexColor = totalGexB >= 0 ? '#22C55E' : '#EF4444';
  const regimeIcon = gexData.regime === 'pinned' ? '📌' : '⚡';

  // Build visual strip
  const allStrikes = gexData.keyLevels.map(l => l.strike);
  allStrikes.push(gexData.currentPrice);
  const minStrike = Math.min(...allStrikes);
  const maxStrike = Math.max(...allStrikes);
  const range = maxStrike - minStrike || 1;
  const getPos = (strike: number) => ((strike - minStrike) / range) * 100;

  return (
    <div style={{
      marginBottom: '1rem',
      background: brand.carbon,
      border: `1px solid ${brand.border}`,
      borderRadius: 8,
      padding: '10px 16px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12 }}>🧲</span>
          <span style={{ fontSize: 10, color: brand.amber, fontWeight: 700, fontFamily: M, letterSpacing: '0.05em' }}>GEX</span>
          <span style={{ fontSize: 13, fontFamily: M, fontWeight: 700, color: gexColor }}>
            {totalGexB >= 0 ? '+' : ''}{totalGexB.toFixed(1)}B
          </span>
          <span style={{ fontSize: 10, color: brand.smoke, fontFamily: M }}>({symbol})</span>
        </div>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: M, fontWeight: 700,
          background: gexData.regime === 'pinned' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: gexData.regime === 'pinned' ? '#22C55E' : '#EF4444',
        }}>
          {gexData.regime.toUpperCase()} {regimeIcon}
        </span>
      </div>

      {/* Visual Strip */}
      <div style={{ position: 'relative', height: 40, background: `linear-gradient(90deg, rgba(239,68,68,0.06), rgba(34,197,94,0.06))`, borderRadius: 4, margin: '0 4px' }}>
        {/* Track line */}
        <div style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 2, background: brand.border, transform: 'translateY(-50%)' }} />

        {/* Key levels */}
        {gexData.keyLevels.map((level) => {
          const left = getPos(level.strike);
          const isWall = Math.abs(level.gex) > Math.abs(gexData.totalGex) * 0.3;

          return (
            <div key={level.strike} style={{
              position: 'absolute',
              left: `${Math.max(2, Math.min(98, left))}%`,
              top: 0, bottom: 0,
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Strike label */}
              <div style={{
                fontSize: 8, fontFamily: M, fontWeight: 600,
                color: level.type === 'flip' ? '#EAB308' : level.gex > 0 ? '#22C55E' : '#EF4444',
                position: 'absolute', top: 1,
              }}>
                {level.strike.toFixed(0)}
              </div>
              {/* Marker */}
              <div style={{
                width: level.type === 'flip' ? 2 : isWall ? 4 : 2,
                height: level.type === 'flip' ? 20 : isWall ? 16 : 10,
                background: level.type === 'flip' ? '#EAB308' : level.gex > 0 ? '#22C55E' : '#EF4444',
                borderRadius: 1,
                boxShadow: isWall ? `0 0 6px ${level.gex > 0 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.3)'}` : 'none',
              }} />
              {/* Type label */}
              <div style={{
                fontSize: 7, fontFamily: M, fontWeight: 700,
                color: level.type === 'flip' ? '#EAB308' : brand.smoke,
                position: 'absolute', bottom: 1,
                textTransform: 'uppercase',
              }}>
                {level.type === 'flip' ? 'FLIP' : isWall ? 'WALL' : ''}
              </div>
            </div>
          );
        })}

        {/* Current price marker */}
        <div style={{
          position: 'absolute',
          left: `${Math.max(2, Math.min(98, getPos(gexData.currentPrice)))}%`,
          top: '50%', transform: 'translate(-50%, -50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: brand.amber, border: `2px solid ${brand.white}`,
          boxShadow: '0 0 8px rgba(245,158,11,0.5)',
          zIndex: 10,
        }} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, fontSize: 8, fontFamily: M, color: brand.smoke }}>
        <span>● Current Price</span>
        <span style={{ color: '#22C55E' }}>┃ Gamma Wall</span>
        <span style={{ color: '#EAB308' }}>╎ GEX Flip</span>
      </div>
    </div>
  );
}
