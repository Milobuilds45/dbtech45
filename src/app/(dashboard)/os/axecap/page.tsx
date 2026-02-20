'use client';
import { useState, useCallback } from 'react';
import { brand, styles } from '@/lib/brand';
import OvernightFlowMatrix from '@/components/axecap/OvernightFlowMatrix';
import InversionTripwires from '@/components/axecap/InversionTripwires';
import TrailingFloorMonitor from '@/components/axecap/TrailingFloorMonitor';
import DeadCatLock from '@/components/axecap/DeadCatLock';
import MasterPlaybook from '@/components/axecap/MasterPlaybook';

const M = "'JetBrains Mono','Fira Code',monospace";

export default function AxeCapPage() {
  const [propFirmMode, setPropFirmMode] = useState(false);
  const [deadCatLocked, setDeadCatLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'playbook'>('terminal');
  // Track scenario for Dead Cat detection — this would come from OvernightFlowMatrix
  const [scenarioNumber, setScenarioNumber] = useState(0);

  const handleLockChange = useCallback((locked: boolean) => {
    setDeadCatLocked(locked);
  }, []);

  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, maxWidth: 1400 }}>
        {/* Dead Cat Full-Screen Lock */}
        <DeadCatLock scenarioNumber={scenarioNumber} onLockChange={handleLockChange} />

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>⚡</span> AxeCap Command Terminal
            </h1>
            <p style={{ color: brand.smoke, fontSize: 12, margin: 0, fontFamily: M }}>
              Overnight Flow Algorithm v1.1 — Global Plumbing Decision Matrix
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Prop Firm Mode Toggle */}
            <div
              onClick={() => setPropFirmMode(!propFirmMode)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
                borderRadius: 8, cursor: 'pointer',
                background: propFirmMode ? 'rgba(139,92,246,0.15)' : 'rgba(113,113,122,0.1)',
                border: propFirmMode ? '1px solid rgba(139,92,246,0.4)' : '1px solid #333',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Toggle switch */}
              <div style={{
                width: 36, height: 20, borderRadius: 10, position: 'relative',
                background: propFirmMode ? '#8B5CF6' : '#333',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  left: propFirmMode ? 18 : 2,
                }} />
              </div>
              <span style={{ fontFamily: M, fontSize: 11, fontWeight: 700, color: propFirmMode ? '#8B5CF6' : '#737373' }}>
                PROP FIRM MODE
              </span>
              {propFirmMode && <span style={{ fontFamily: M, fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}>APEX $50K</span>}
            </div>

            {/* Navigation tabs */}
            <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #333' }}>
              {(['terminal', 'playbook'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 16px', background: activeTab === tab ? 'rgba(245,158,11,0.15)' : 'transparent',
                  border: 'none', color: activeTab === tab ? '#F59E0B' : '#737373',
                  fontFamily: M, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  borderRight: tab === 'terminal' ? '1px solid #333' : 'none',
                }}>
                  {tab === 'terminal' ? '📡 TERMINAL' : '📖 PLAYBOOK'}
                </button>
              ))}
            </div>

            {/* Back to markets */}
            <a href="/os/markets" style={{
              fontFamily: M, fontSize: 11, color: brand.smoke, textDecoration: 'none',
              padding: '6px 12px', borderRadius: 6, border: '1px solid #333',
              transition: 'all 0.2s',
            }}>
              ← MARKETS
            </a>
          </div>
        </div>

        {activeTab === 'terminal' ? (
          <>
            {/* 1. OVERNIGHT FLOW MATRIX — 5 tickers + confidence score + scenario detection */}
            <OvernightFlowMatrix />

            {/* 2. INVERSION TRIPWIRES — 9:30 AM opening prints for US10Y & DXY */}
            <InversionTripwires />

            {/* 3 & 4. TRAILING FLOOR MONITOR (Apex only) */}
            <TrailingFloorMonitor propFirmMode={propFirmMode} />

            {/* Quick Reference: Today's Rules */}
            <div style={{
              background: '#111', border: '1px solid #222', borderRadius: 12,
              padding: '16px 20px', marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 13, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '0.05em' }}>QUICK RULES</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'TIME WINDOW', value: '9:45 AM — 11:30 AM', icon: '🕐', color: '#F59E0B' },
                  { label: 'MAX RISK', value: propFirmMode ? '$250 / trade' : 'Defined by position', icon: '🎯', color: '#EF4444' },
                  { label: 'INVERSION', value: 'Exit at market. No hope.', icon: '⚠', color: '#EF4444' },
                  { label: 'NEWS LOCKOUT', value: '2 min before CPI/FOMC/NFP', icon: '📰', color: '#EAB308' },
                ].map(r => (
                  <div key={r.label} style={{ padding: '10px 12px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #222' }}>
                    <div style={{ fontSize: 9, color: r.color, fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 4 }}>
                      {r.icon} {r.label}
                    </div>
                    <div style={{ fontFamily: M, fontSize: 11, color: '#A3A3A3' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Debug: Scenario Trigger (for testing Dead Cat Lock) */}
            <div style={{ padding: '10px 16px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #222', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: M, fontSize: 10, color: '#737373' }}>SCENARIO TEST:</span>
              {[1, 2, 3, 4, 5, 6, 0].map(n => (
                <button key={n} onClick={() => setScenarioNumber(n)} style={{
                  padding: '4px 10px', borderRadius: 4, fontFamily: M, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  background: scenarioNumber === n ? (n === 6 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)') : 'transparent',
                  border: `1px solid ${n === 6 ? '#EF4444' : '#333'}`,
                  color: scenarioNumber === n ? (n === 6 ? '#EF4444' : '#F59E0B') : '#737373',
                }}>
                  {n === 0 ? 'CLEAR' : `S${n}`}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* 6. MASTER PLAYBOOK TAB */
          <MasterPlaybook />
        )}

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 0', borderTop: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#000', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E' }}>B</span>
            </div>
            <span style={{ fontFamily: M, fontSize: 11, color: brand.smoke }}>
              Powered by <span style={{ color: '#22C55E', fontWeight: 600 }}>Bobby</span> + <span style={{ color: '#E91E8C', fontWeight: 600 }}>Paula</span> // AxeCap Algo v1.1
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: M, fontSize: 10, color: brand.smoke }}>AXECAP COMMAND TERMINAL v1.0</span>
            {propFirmMode && <span style={{ fontFamily: M, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>APEX MODE</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
