'use client';
import { useState } from 'react';

const M = "'JetBrains Mono','Fira Code',monospace";

const SCENARIOS = [
  {
    number: 1,
    name: 'THE GREEN LIGHT',
    subtitle: 'Pure Risk-On',
    color: '#22C55E',
    trigger: 'Asia UP + DAX UP + US10Y DOWN + DXY DOWN',
    state: 'Capital is cheap, liquidity is flowing.',
    execution: 'Buy high-beta tech calls. DO NOT CHASE the gap up. Wait for a 15-min ORB (Opening Range Breakout) pullback for entry.',
    apex: 'Max 2 MNQ. First target at 1R. Move stop to breakeven on remainder.',
    vehicle: 'Long NQ / QQQ Calls',
  },
  {
    number: 2,
    name: 'TECH DIVERGENCE',
    subtitle: 'Semiconductor Run',
    color: '#8B5CF6',
    trigger: 'TWII UP >1% + US10Y Flat/Down + Broad Indices (DAX/HSI) Mixed',
    state: 'Institutions are piling into chips regardless of macro.',
    execution: 'Target NVDA/AMD/SMCI exclusively. Ignore broad market chop (SPY).',
    apex: '1 MNQ only (3/4 signal by nature — broad indices not confirming).',
    vehicle: 'Long NQ / NVDA Calls',
  },
  {
    number: 3,
    name: 'FLIGHT TO SAFETY',
    subtitle: 'Institutional Panic',
    color: '#F97316',
    trigger: 'Asia DOWN + DAX DOWN + US10Y DOWN + DXY UP',
    state: 'Treasuries and Dollar caught a massive bid. Equities being liquidated.',
    execution: 'Buy SPY/NQ Puts. NO VIX CALLS off the open (avoid IV crush at peak fear). Do not catch falling knives.',
    apex: '2 MES at 4/4. Hard stop above pre-market high. First target 1R then breakeven stop.',
    vehicle: 'Short ES / SPY Puts',
  },
  {
    number: 4,
    name: 'THE YIELD CHOKE',
    subtitle: 'Gravity Wins',
    color: '#EAB308',
    trigger: 'US10Y SPIKING >1% + DXY UP + Equities FLAT (+/- 0.25%)',
    state: 'Bond market is front-running a massive equity drop.',
    execution: 'Short NQ at the open. Hard stop placed at pre-market high + 0.15% buffer to survive low-volume algorithmic liquidity sweeps.',
    apex: '1 MNQ only. Patience trade — NQ catching down to bonds takes time. Do not overtrade.',
    vehicle: 'Short NQ',
  },
  {
    number: 5,
    name: 'THE CEILING',
    subtitle: 'Hawkish Growth',
    color: '#D97706',
    trigger: 'Asia UP + DAX UP + US10Y UP',
    state: 'Global growth is strong, but hawkish yields put a hard ceiling on tech multiples.',
    execution: 'Risk-on but mechanically capped. Sell 50% at first 1R profit or by 10:15 AM EST. Move stop to breakeven. Zero holds through European close (11:30 AM).',
    apex: '1 MES only. Most ambiguous timeline.',
    vehicle: 'Long ES (not NQ)',
  },
  {
    number: 6,
    name: 'THE DEAD CAT',
    subtitle: 'Stagflation',
    color: '#EF4444',
    trigger: 'Asia DOWN + US10Y UP + DXY UP + DAX Flat/Down',
    state: 'Toxic. Bonds and stocks are both getting sold. Nowhere to hide.',
    execution: 'ZERO TRADES. Cash is a position. Preserve capital.',
    apex: 'Dashboard locks trading mode for the session. Not a suggestion.',
    vehicle: 'CASH',
  },
];

const UNIVERSAL_RULES = [
  {
    title: 'TIME WINDOW: 9:45 AM — 11:30 AM EST',
    rule: 'No entries before 9:45. No holds past 11:30.',
    why: "At 9:30, it's a gap-chasing casino. We wait 15 minutes for the ORB. By 11:30 (European Close), overnight flow is fully priced in. The edge is dead.",
  },
  {
    title: 'THE INVERSION OVERRIDE',
    rule: 'If US10Y or DXY crosses the 9:30 AM opening print opposite to your thesis, EXIT AT MARKET.',
    why: "Most systems have stops for price. This is an exit for thesis failure. If the macro flips, your trade is a zombie. Do not hope. Cut the cord.",
  },
  {
    title: 'NO VIX CALLS ON PANIC DAYS',
    rule: 'On Scenario 3 (Flight to Safety), buy SPY/NQ Puts. Never VIX Calls.',
    why: "IV Crush. Buying VIX at 9:35 AM during panic = buying peak IV. Market drops more but VIX contracts. You lose on a correct thesis.",
  },
  {
    title: 'THE 10% RULE (APEX)',
    rule: 'Never risk more than 10% of trailing drawdown on a single trade.',
    why: '$2,500 drawdown x 10% = $250 max risk per trade. 1 MNQ, 25-point stop = $250 risk. Fits exactly.',
  },
  {
    title: 'NEWS LOCKOUT (APEX)',
    rule: 'No trades within 2 minutes of CPI, FOMC, NFP, or PPI.',
    why: "These events can gap through your stop and breach the trailing drawdown in one candle.",
  },
];

export default function MasterPlaybook() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'rules' | 'sizing'>('scenarios');

  return (
    <div style={{ background: '#111111', border: '1px solid #222', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222', background: '#1A1A1A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>📖</span>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '0.05em' }}>THE MASTER PLAYBOOK</span>
        </div>
        <span style={{ fontFamily: M, fontSize: 10, color: '#737373' }}>The Official Rules of Engagement</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
        {(['scenarios', 'rules', 'sizing'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px 0', background: activeTab === tab ? 'rgba(245,158,11,0.08)' : 'transparent',
            border: 'none', borderBottom: activeTab === tab ? '2px solid #F59E0B' : '2px solid transparent',
            color: activeTab === tab ? '#F59E0B' : '#737373', fontFamily: M, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            textTransform: 'uppercase',
          }}>
            {tab === 'scenarios' ? '6 Scenarios' : tab === 'rules' ? 'Universal Rules' : 'Position Sizing'}
          </button>
        ))}
      </div>

      {/* SCENARIOS TAB */}
      {activeTab === 'scenarios' && (
        <div>
          {SCENARIOS.map(s => (
            <div key={s.number} style={{ borderBottom: '1px solid #222' }}>
              <div
                onClick={() => setActiveScenario(activeScenario === s.number ? null : s.number)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer',
                  background: activeScenario === s.number ? 'rgba(245,158,11,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  fontFamily: M, fontSize: 16, fontWeight: 700, color: s.color,
                  minWidth: 28, textAlign: 'center',
                }}>{s.number}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: s.color }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: '#737373', marginLeft: 8 }}>{s.subtitle}</span>
                </div>
                <span style={{
                  fontFamily: M, fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: s.number === 6 ? 'rgba(239,68,68,0.15)' : `${s.color}22`, color: s.color,
                }}>{s.vehicle}</span>
                <span style={{ color: '#737373', fontSize: 14, transform: activeScenario === s.number ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
              </div>

              {activeScenario === s.number && (
                <div style={{ padding: '0 20px 16px 60px', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 4 }}>TRIGGER</div>
                    <div style={{ fontFamily: M, fontSize: 12, color: '#fff', padding: '6px 10px', background: '#1A1A1A', borderRadius: 6, border: '1px solid #333' }}>{s.trigger}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 4 }}>MARKET STATE</div>
                    <div style={{ fontSize: 12, color: '#A3A3A3', lineHeight: 1.6 }}>{s.state}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 4 }}>EXECUTION</div>
                    <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.6, fontWeight: 500 }}>{s.execution}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 4 }}>APEX RULE</div>
                    <div style={{ fontSize: 12, color: '#A3A3A3', lineHeight: 1.6 }}>{s.apex}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UNIVERSAL RULES TAB */}
      {activeTab === 'rules' && (
        <div style={{ padding: '16px 20px' }}>
          {UNIVERSAL_RULES.map((r, i) => (
            <div key={i} style={{ marginBottom: 20, padding: '14px 16px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #222' }}>
              <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>{r.title}</div>
              <div style={{ fontFamily: M, fontSize: 12, color: '#fff', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>{r.rule}</div>
              <div style={{ fontSize: 11, color: '#737373', lineHeight: 1.6, fontStyle: 'italic' }}>Why: {r.why}</div>
            </div>
          ))}

          {/* Core Philosophy */}
          <div style={{ padding: '16px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>CORE PHILOSOPHY</div>
            <div style={{ fontFamily: M, fontSize: 12, color: '#A3A3A3', lineHeight: 1.8 }}>
              We do not trade retail chart astrology. We trade the physical plumbing of global liquidity. We strip the emotion out of the first 30 minutes of the morning chop and execute like a machine.
            </div>
          </div>
        </div>
      )}

      {/* POSITION SIZING TAB */}
      {activeTab === 'sizing' && (
        <div style={{ padding: '16px 20px' }}>
          {/* Confidence Matrix */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 10 }}>CONFIDENCE MATRIX (POSITION SIZING)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { signal: '4/4', size: 'FULL SIZE', contracts: '2 MNQ / 2 MES', color: '#22C55E', action: 'Press the edge' },
                { signal: '3/4', size: 'HALF SIZE', contracts: '1 MNQ / 1 MES', color: '#EAB308', action: 'Cautious entry' },
                { signal: '<3/4', size: 'NO TRADE', contracts: 'FLAT', color: '#EF4444', action: 'Cash is a position' },
              ].map(c => (
                <div key={c.signal} style={{ padding: '14px', background: '#1A1A1A', borderRadius: 8, border: `1px solid ${c.color}33`, textAlign: 'center' }}>
                  <div style={{ fontFamily: M, fontSize: 28, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.signal}</div>
                  <div style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{c.size}</div>
                  <div style={{ fontFamily: M, fontSize: 11, color: c.color }}>{c.contracts}</div>
                  <div style={{ fontSize: 10, color: '#737373', marginTop: 4 }}>{c.action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Math */}
          <div style={{ padding: '14px 16px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #222' }}>
            <div style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 10 }}>APEX $50K RISK MATH</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <div style={{ fontFamily: M, fontSize: 11, color: '#F59E0B', marginBottom: 6 }}>NQ SIZING AT $250 MAX RISK:</div>
                <div style={{ fontFamily: M, fontSize: 11, color: '#A3A3A3', lineHeight: 1.8 }}>
                  1 MNQ, 25-pt stop = $250 risk (fits exactly)<br />
                  1 NQ, 3-pt stop = too tight (avoid in eval)
                </div>
              </div>
              <div>
                <div style={{ fontFamily: M, fontSize: 11, color: '#F59E0B', marginBottom: 6 }}>ES SIZING AT $250 MAX RISK:</div>
                <div style={{ fontFamily: M, fontSize: 11, color: '#A3A3A3', lineHeight: 1.8 }}>
                  1 MES, 50-pt stop = $250 risk<br />
                  1 ES, 5-pt stop = too tight (avoid in eval)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid #222', background: '#1A1A1A', textAlign: 'center' }}>
        <span style={{ fontFamily: M, fontSize: 10, color: '#737373', fontStyle: 'italic' }}>
          {'"There\'s a small group who can do the math. An even smaller group who can explain it. Those who can do both become billionaires." — Axe'}
        </span>
      </div>
    </div>
  );
}
