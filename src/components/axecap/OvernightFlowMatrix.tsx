'use client';
import { useState, useEffect, useCallback } from 'react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface FlowTicker {
  symbol: string;
  label: string;
  role: string;
  price: number;
  change: number;
  changePercent: number;
  direction: 'UP' | 'DOWN' | 'FLAT';
}

interface ScenarioResult {
  name: string;
  number: number;
  action: string;
  color: string;
  confidence: string;
  signalCount: number;
}

function detectScenario(tickers: FlowTicker[]): ScenarioResult {
  const twii = tickers.find(t => t.symbol === 'TWII');
  const hsi = tickers.find(t => t.symbol === 'HSI');
  const dax = tickers.find(t => t.symbol === 'DAX');
  const us10y = tickers.find(t => t.symbol === 'US10Y');
  const dxy = tickers.find(t => t.symbol === 'DXY');

  if (!twii || !hsi || !dax || !us10y || !dxy) {
    return { name: 'LOADING', number: 0, action: 'Waiting for data...', color: '#737373', confidence: '0/4', signalCount: 0 };
  }

  const asiaUp = twii.changePercent > 0 && hsi.changePercent > 0;
  const asiaDown = twii.changePercent < 0 || hsi.changePercent < 0;
  const daxUp = dax.changePercent > 0;
  const daxDown = dax.changePercent < 0;
  const daxFlat = Math.abs(dax.changePercent) <= 0.25;
  const yieldsDown = us10y.change < 0;
  const yieldsUp = us10y.change > 0;
  const yieldsSpiking = us10y.changePercent > 1;
  const dxyDown = dxy.changePercent < 0;
  const dxyUp = dxy.changePercent > 0;
  const twiiStrong = twii.changePercent > 1;

  // Scenario 6: Dead Cat (Stagflation) — check first (most dangerous)
  if (asiaDown && yieldsUp && dxyUp && (daxFlat || daxDown)) {
    const signals = [asiaDown, yieldsUp, dxyUp, daxFlat || daxDown].filter(Boolean).length;
    return {
      name: 'THE DEAD CAT',
      number: 6,
      action: 'ZERO TRADES. Cash is a position. Preserve capital.',
      color: '#EF4444',
      confidence: `${signals}/4`,
      signalCount: signals,
    };
  }

  // Scenario 1: Green Light (Pure Risk-On)
  if (asiaUp && daxUp && yieldsDown && dxyDown) {
    return {
      name: 'THE GREEN LIGHT',
      number: 1,
      action: 'Buy high-beta tech calls. Wait for 15-min ORB pullback. DO NOT CHASE gap-ups.',
      color: '#22C55E',
      confidence: '4/4',
      signalCount: 4,
    };
  }

  // Scenario 2: Tech Divergence
  if (twiiStrong && yieldsDown) {
    const signals = [twiiStrong, yieldsDown, !daxUp || !asiaUp].filter(Boolean).length;
    return {
      name: 'TECH DIVERGENCE',
      number: 2,
      action: 'Target NVDA/AMD/SMCI exclusively. Ignore broad market chop.',
      color: '#8B5CF6',
      confidence: `${Math.min(signals, 3)}/4`,
      signalCount: Math.min(signals, 3),
    };
  }

  // Scenario 3: Flight to Safety
  if (asiaDown && daxDown && yieldsDown && dxyUp) {
    return {
      name: 'FLIGHT TO SAFETY',
      number: 3,
      action: 'Buy SPY/NQ Puts. NO VIX CALLS off the open (IV crush). Do not catch falling knives.',
      color: '#F97316',
      confidence: '4/4',
      signalCount: 4,
    };
  }

  // Scenario 4: Yield Choke
  if (yieldsSpiking && dxyUp && Math.abs(dax.changePercent) <= 0.25) {
    const signals = [yieldsSpiking, dxyUp, Math.abs(dax.changePercent) <= 0.25].filter(Boolean).length;
    return {
      name: 'THE YIELD CHOKE',
      number: 4,
      action: 'Short NQ at the open. Hard stop at pre-market high + 0.15% buffer.',
      color: '#EAB308',
      confidence: `${signals}/4`,
      signalCount: signals,
    };
  }

  // Scenario 5: The Ceiling
  if (asiaUp && daxUp && yieldsUp) {
    const signals = [asiaUp, daxUp, yieldsUp].filter(Boolean).length;
    return {
      name: 'THE CEILING',
      number: 5,
      action: 'Risk-on but CAPPED. Sell 50% at 1R or 10:15 AM EST. Zero holds through 11:30 AM.',
      color: '#D97706',
      confidence: `${signals}/4`,
      signalCount: signals,
    };
  }

  // Mixed / Chop
  let bullSignals = 0;
  if (asiaUp) bullSignals++;
  if (daxUp) bullSignals++;
  if (yieldsDown) bullSignals++;
  if (dxyDown) bullSignals++;

  return {
    name: 'MIXED / CHOP',
    number: 0,
    action: 'Cash is a position. No trade. Wait for cleaner setup.',
    color: '#737373',
    confidence: `${bullSignals}/4`,
    signalCount: bullSignals,
  };
}

export default function OvernightFlowMatrix() {
  const [tickers, setTickers] = useState<FlowTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchFlows = useCallback(async () => {
    try {
      // Use the existing axecap API with the global flow symbols
      const symbols = ['^TWII', 'HSI', '^GDAXI', '^TNX', 'DX-Y.NYB'];
      const displayMap: Record<string, { symbol: string; label: string; role: string }> = {
        '^TWII': { symbol: 'TWII', label: 'Taiwan Weighted', role: 'Tech Supply Chain' },
        'HSI': { symbol: 'HSI', label: 'Hang Seng', role: 'Asian Liquidity' },
        '^GDAXI': { symbol: 'DAX', label: 'Germany 40', role: 'European Growth' },
        '^TNX': { symbol: 'US10Y', label: '10-Year Yield', role: 'Cost of Capital' },
        'DX-Y.NYB': { symbol: 'DXY', label: 'US Dollar Index', role: 'Currency Strength' },
      };

      const res = await fetch(`/api/axecap?symbols=${symbols.join(',')}&news=false`, {
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const flows: FlowTicker[] = [];
      for (const q of data.quotes || []) {
        const info = displayMap[q.symbol];
        if (info) {
          const dir: 'UP' | 'DOWN' | 'FLAT' =
            q.changePercent > 0.1 ? 'UP' : q.changePercent < -0.1 ? 'DOWN' : 'FLAT';
          flows.push({
            ...info,
            price: q.price ?? 0,
            change: q.change ?? 0,
            changePercent: q.changePercent ?? 0,
            direction: dir,
          });
        }
      }
      setTickers(flows);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('OvernightFlowMatrix fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
    const interval = setInterval(fetchFlows, 30000);
    return () => clearInterval(interval);
  }, [fetchFlows]);

  const scenario = detectScenario(tickers);
  const dirColor = (d: string) => d === 'UP' ? '#22C55E' : d === 'DOWN' ? '#EF4444' : '#737373';
  const dirArrow = (d: string) => d === 'UP' ? '▲' : d === 'DOWN' ? '▼' : '—';

  return (
    <div style={{ background: '#111111', border: '1px solid #222', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222', background: '#1A1A1A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🌏</span>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '0.05em' }}>OVERNIGHT FLOW MATRIX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: M, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${scenario.color}22`, color: scenario.color, border: `1px solid ${scenario.color}44` }}>
            {scenario.confidence} SIGNALS
          </span>
          {lastRefresh && <span style={{ fontFamily: M, fontSize: 10, color: '#737373' }}>{lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
        </div>
      </div>

      {/* Ticker Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
        {loading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ padding: '16px', borderRight: i < 4 ? '1px solid #222' : 'none' }}>
                <div style={{ color: '#737373', fontSize: 12, fontFamily: M }}>Loading...</div>
              </div>
            ))
          : tickers.map((t, i) => (
              <div key={t.symbol} style={{ padding: '14px 16px', borderRight: i < tickers.length - 1 ? '1px solid #222' : 'none', borderBottom: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: M, fontSize: 13, fontWeight: 700, color: dirColor(t.direction) }}>{t.symbol}</span>
                  <span style={{ fontSize: 16, color: dirColor(t.direction) }}>{dirArrow(t.direction)}</span>
                </div>
                <div style={{ fontSize: 9, color: '#737373', marginBottom: 6, letterSpacing: '0.03em' }}>{t.role}</div>
                <div style={{ fontFamily: M, fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  {t.symbol === 'US10Y' ? `${t.price.toFixed(3)}%` : t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontFamily: M, fontSize: 11, color: dirColor(t.direction) }}>
                  {t.changePercent >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                </div>
              </div>
            ))}
      </div>

      {/* Scenario Detection */}
      <div style={{
        padding: '16px 20px',
        background: scenario.number === 6 ? 'rgba(239,68,68,0.12)' : scenario.number === 1 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.06)',
        borderTop: `2px solid ${scenario.color}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: M, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${scenario.color}33`, color: scenario.color }}>
                SCENARIO {scenario.number || '—'}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 16, fontWeight: 700, color: scenario.color }}>
                {scenario.name}
              </span>
            </div>
            <div style={{ fontFamily: M, fontSize: 12, color: '#A3A3A3', lineHeight: 1.6 }}>
              {scenario.action}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontFamily: M, fontSize: 36, fontWeight: 700, color: scenario.color, lineHeight: 1 }}>
              {scenario.confidence}
            </div>
            <div style={{ fontSize: 10, color: '#737373', marginTop: 4 }}>CONFIDENCE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
