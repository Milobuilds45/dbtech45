'use client';
import { useState, useEffect, useCallback } from 'react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface TripwireState {
  symbol: string;
  label: string;
  openingPrint: number | null;
  currentPrice: number | null;
  thesis: 'LONG' | 'SHORT' | null;
  inverted: boolean;
  delta: number | null;
  lastUpdate: Date | null;
}

export default function InversionTripwires() {
  const [us10y, setUs10y] = useState<TripwireState>({
    symbol: 'US10Y', label: '10-Year Yield', openingPrint: null, currentPrice: null,
    thesis: null, inverted: false, delta: null, lastUpdate: null,
  });
  const [dxy, setDxy] = useState<TripwireState>({
    symbol: 'DXY', label: 'US Dollar Index', openingPrint: null, currentPrice: null,
    thesis: null, inverted: false, delta: null, lastUpdate: null,
  });
  const [locked, setLocked] = useState(false);
  const [flashInversion, setFlashInversion] = useState(false);

  const lockOpeningPrints = useCallback(async () => {
    try {
      const res = await fetch('/api/axecap?symbols=^TNX,DX-Y.NYB&news=false', { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return;
      const data = await res.json();
      for (const q of data.quotes || []) {
        if (q.symbol === '^TNX') {
          setUs10y(prev => ({ ...prev, openingPrint: q.price, currentPrice: q.price, lastUpdate: new Date() }));
        }
        if (q.symbol === 'DX-Y.NYB') {
          setDxy(prev => ({ ...prev, openingPrint: q.price, currentPrice: q.price, lastUpdate: new Date() }));
        }
      }
      setLocked(true);
    } catch (e) { console.error('Lock opening prints error:', e); }
  }, []);

  const refreshPrices = useCallback(async () => {
    if (!locked) return;
    try {
      const res = await fetch('/api/axecap?symbols=^TNX,DX-Y.NYB&news=false', { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return;
      const data = await res.json();
      for (const q of data.quotes || []) {
        if (q.symbol === '^TNX') {
          setUs10y(prev => {
            if (!prev.openingPrint) return prev;
            const delta = q.price - prev.openingPrint;
            // If thesis expects yields DOWN but yields cross ABOVE opening = inversion
            // If thesis expects yields UP but yields cross BELOW opening = inversion
            const inverted = prev.thesis === 'LONG' ? q.price > prev.openingPrint : prev.thesis === 'SHORT' ? q.price < prev.openingPrint : false;
            return { ...prev, currentPrice: q.price, delta, inverted, lastUpdate: new Date() };
          });
        }
        if (q.symbol === 'DX-Y.NYB') {
          setDxy(prev => {
            if (!prev.openingPrint) return prev;
            const delta = q.price - prev.openingPrint;
            const inverted = prev.thesis === 'LONG' ? q.price > prev.openingPrint : prev.thesis === 'SHORT' ? q.price < prev.openingPrint : false;
            return { ...prev, currentPrice: q.price, delta, inverted, lastUpdate: new Date() };
          });
        }
      }
    } catch (e) { console.error('Refresh prices error:', e); }
  }, [locked]);

  useEffect(() => {
    if (us10y.inverted || dxy.inverted) {
      setFlashInversion(true);
      const timer = setInterval(() => setFlashInversion(prev => !prev), 500);
      return () => clearInterval(timer);
    } else {
      setFlashInversion(false);
    }
  }, [us10y.inverted, dxy.inverted]);

  useEffect(() => {
    if (locked) {
      const interval = setInterval(refreshPrices, 15000);
      return () => clearInterval(interval);
    }
  }, [locked, refreshPrices]);

  const setThesis = (direction: 'LONG' | 'SHORT') => {
    setUs10y(prev => ({ ...prev, thesis: direction === 'LONG' ? 'SHORT' : 'LONG' })); // Long thesis = yields should go down
    setDxy(prev => ({ ...prev, thesis: direction === 'LONG' ? 'SHORT' : 'LONG' })); // Long thesis = DXY should go down
  };

  const anyInverted = us10y.inverted || dxy.inverted;

  const renderTripwire = (tw: TripwireState) => {
    const barWidth = 300;
    const range = tw.openingPrint ? tw.openingPrint * 0.005 : 1; // 0.5% range
    const pos = tw.delta ? Math.max(-1, Math.min(1, tw.delta / range)) : 0;
    const barPos = ((pos + 1) / 2) * barWidth;

    return (
      <div key={tw.symbol} style={{
        padding: '16px 20px',
        borderBottom: '1px solid #222',
        background: tw.inverted ? 'rgba(239,68,68,0.08)' : 'transparent',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <span style={{ fontFamily: M, fontSize: 14, fontWeight: 700, color: tw.inverted ? '#EF4444' : '#F59E0B' }}>{tw.symbol}</span>
            <span style={{ fontSize: 11, color: '#737373', marginLeft: 8 }}>{tw.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {tw.thesis && <span style={{ fontFamily: M, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: tw.thesis === 'LONG' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: tw.thesis === 'LONG' ? '#EF4444' : '#22C55E' }}>
              Expect {tw.thesis === 'LONG' ? 'UP' : 'DOWN'}
            </span>}
            {tw.inverted && <span style={{ fontFamily: M, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: flashInversion ? '#EF4444' : '#7f1d1d', color: '#fff', animation: 'none' }}>⚠ INVERTED</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Opening Print */}
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 9, color: '#737373', marginBottom: 2 }}>9:30 PRINT</div>
            <div style={{ fontFamily: M, fontSize: 16, fontWeight: 700, color: '#F59E0B' }}>
              {tw.openingPrint?.toFixed(tw.symbol === 'US10Y' ? 3 : 2) ?? '—'}
            </div>
          </div>

          {/* Visual bar */}
          <div style={{ flex: 1, position: 'relative', height: 32 }}>
            {/* Background bar */}
            <div style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 4, background: '#333', borderRadius: 2 }} />
            {/* Opening print line */}
            <div style={{ position: 'absolute', top: 6, left: '50%', width: 2, height: 20, background: '#F59E0B', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: '#F59E0B', fontFamily: M }}>OPEN</div>
            {/* Current price dot */}
            {tw.currentPrice && (
              <div style={{
                position: 'absolute',
                top: 10,
                left: `${(barPos / barWidth) * 100}%`,
                width: 12, height: 12, borderRadius: '50%',
                background: tw.inverted ? '#EF4444' : '#22C55E',
                border: '2px solid #fff',
                transform: 'translateX(-50%)',
                transition: 'left 0.5s ease',
                boxShadow: tw.inverted ? '0 0 12px rgba(239,68,68,0.6)' : '0 0 8px rgba(34,197,94,0.4)',
              }} />
            )}
          </div>

          {/* Current Price */}
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 9, color: '#737373', marginBottom: 2 }}>CURRENT</div>
            <div style={{ fontFamily: M, fontSize: 16, fontWeight: 700, color: tw.inverted ? '#EF4444' : '#fff' }}>
              {tw.currentPrice?.toFixed(tw.symbol === 'US10Y' ? 3 : 2) ?? '—'}
            </div>
          </div>

          {/* Delta */}
          <div style={{ textAlign: 'center', minWidth: 60 }}>
            <div style={{ fontSize: 9, color: '#737373', marginBottom: 2 }}>DELTA</div>
            <div style={{ fontFamily: M, fontSize: 14, fontWeight: 700, color: tw.delta && tw.delta > 0 ? '#22C55E' : tw.delta && tw.delta < 0 ? '#EF4444' : '#737373' }}>
              {tw.delta ? `${tw.delta > 0 ? '+' : ''}${tw.delta.toFixed(3)}` : '—'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: '#111111',
      border: anyInverted ? '2px solid #EF4444' : '1px solid #222',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: '1.5rem',
      boxShadow: anyInverted ? '0 0 30px rgba(239,68,68,0.3)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* INVERSION WARNING BANNER */}
      {anyInverted && (
        <div style={{
          padding: '16px 20px',
          background: flashInversion ? '#EF4444' : '#7f1d1d',
          textAlign: 'center',
          transition: 'background 0.3s ease',
        }}>
          <div style={{ fontFamily: M, fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
            ⚠ INVERSION — EXIT TRADE ⚠
          </div>
          <div style={{ fontFamily: M, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            THE THESIS IS DEAD. Kill the position immediately at market. Do not wait for your stop. Do not hope. Cut the cord.
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222', background: '#1A1A1A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '0.05em' }}>INVERSION TRIPWIRES</span>
          <span style={{ fontFamily: M, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: locked ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: locked ? '#22C55E' : '#F59E0B' }}>
            {locked ? '● LOCKED' : '○ UNLOCKED'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!locked && (
            <button onClick={lockOpeningPrints} style={{
              background: '#F59E0B', color: '#000', border: 'none', borderRadius: 6,
              padding: '6px 14px', fontFamily: M, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>
              LOCK 9:30 PRINTS
            </button>
          )}
          {locked && !us10y.thesis && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setThesis('LONG')} style={{
                background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 6, padding: '6px 12px', fontFamily: M, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>
                LONG THESIS
              </button>
              <button onClick={() => setThesis('SHORT')} style={{
                background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6, padding: '6px 12px', fontFamily: M, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>
                SHORT THESIS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tripwire Bars */}
      {renderTripwire(us10y)}
      {renderTripwire(dxy)}
    </div>
  );
}
