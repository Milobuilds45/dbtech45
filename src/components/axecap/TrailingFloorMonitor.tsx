'use client';
import { useState, useEffect } from 'react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface TrailingFloorProps {
  propFirmMode: boolean;
}

export default function TrailingFloorMonitor({ propFirmMode }: TrailingFloorProps) {
  const [balance, setBalance] = useState(50000);
  const [highWaterMark, setHighWaterMark] = useState(50000);
  const [maxDrawdown] = useState(2500);
  const [manualInput, setManualInput] = useState('');
  const [locked, setLocked] = useState(false);
  const [flashWarning, setFlashWarning] = useState(false);

  // Calculate trailing floor
  const trailingFloor = highWaterMark - maxDrawdown;
  const distanceToFloor = balance - trailingFloor;
  const distancePercent = (distanceToFloor / maxDrawdown) * 100;
  const isNearFloor = distanceToFloor <= 500;
  const isLocked = distanceToFloor <= 500;

  // Flash warning when near floor
  useEffect(() => {
    if (isNearFloor) {
      const timer = setInterval(() => setFlashWarning(prev => !prev), 600);
      return () => clearInterval(timer);
    }
  }, [isNearFloor]);

  // Update high water mark when balance increases
  useEffect(() => {
    if (balance > highWaterMark) {
      setHighWaterMark(balance);
    }
  }, [balance, highWaterMark]);

  const updateBalance = () => {
    const val = parseFloat(manualInput);
    if (!isNaN(val) && val > 0) {
      setBalance(val);
      setManualInput('');
    }
  };

  if (!propFirmMode) return null;

  const barColor = distancePercent > 60 ? '#22C55E' : distancePercent > 30 ? '#EAB308' : '#EF4444';

  return (
    <div style={{
      background: isLocked ? '#1a0505' : '#111111',
      border: isLocked ? '2px solid #EF4444' : '1px solid #222',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: '1.5rem',
      boxShadow: isLocked ? '0 0 40px rgba(239,68,68,0.3)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* LOCKDOWN BANNER */}
      {isLocked && (
        <div style={{
          padding: '20px',
          background: flashWarning ? '#EF4444' : '#7f1d1d',
          textAlign: 'center',
          transition: 'background 0.3s',
        }}>
          <div style={{ fontFamily: M, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
            🔒 TERMINAL LOCKED — $500 FROM FLOOR 🔒
          </div>
          <div style={{ fontFamily: M, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            Trading is DISABLED for this session. One more bad trade ends the evaluation. Walk away.
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222', background: '#1A1A1A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>📊</span>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '0.05em' }}>TRAILING FLOOR MONITOR</span>
          <span style={{ fontFamily: M, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>APEX $50K</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && updateBalance()}
            placeholder="Balance..."
            style={{
              background: '#1A1A1A', border: '1px solid #333', borderRadius: 4, padding: '4px 10px',
              color: '#fff', fontFamily: M, fontSize: 11, width: 100,
            }}
          />
          <button onClick={updateBalance} style={{
            background: '#F59E0B', color: '#000', border: 'none', borderRadius: 4,
            padding: '5px 10px', fontFamily: M, fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            UPDATE
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderBottom: '1px solid #222' }}>
        {[
          { label: 'BALANCE', value: `$${balance.toLocaleString()}`, color: '#fff' },
          { label: 'HIGH WATER', value: `$${highWaterMark.toLocaleString()}`, color: '#22C55E' },
          { label: 'TRAILING FLOOR', value: `$${trailingFloor.toLocaleString()}`, color: '#EF4444' },
          { label: 'DISTANCE', value: `$${distanceToFloor.toLocaleString()}`, color: isNearFloor ? '#EF4444' : '#F59E0B' },
          { label: 'MAX RISK/TRADE', value: '$250', color: '#8B5CF6' },
        ].map((stat, i) => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRight: i < 4 ? '1px solid #222' : 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#737373', marginBottom: 4, letterSpacing: '0.05em' }}>{stat.label}</div>
            <div style={{ fontFamily: M, fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: M, fontSize: 10, color: '#EF4444' }}>FLOOR: ${trailingFloor.toLocaleString()}</span>
          <span style={{ fontFamily: M, fontSize: 10, color: '#737373' }}>{distancePercent.toFixed(0)}% buffer remaining</span>
          <span style={{ fontFamily: M, fontSize: 10, color: '#22C55E' }}>HWM: ${highWaterMark.toLocaleString()}</span>
        </div>

        {/* Bar */}
        <div style={{ position: 'relative', height: 24, background: '#1A1A1A', borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${Math.max(0, Math.min(100, distancePercent))}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            borderRadius: 12,
            transition: 'width 0.5s ease, background 0.5s ease',
          }} />

          {/* $500 danger zone marker */}
          <div style={{
            position: 'absolute',
            top: 0, left: '20%', width: 2, height: '100%',
            background: '#EF4444',
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute', top: 2, left: '20%', transform: 'translateX(4px)',
            fontSize: 8, color: '#EF4444', fontFamily: M,
          }}>
            $500 LOCKOUT
          </div>
        </div>

        {/* Contract Sizing Reference */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, padding: '10px 12px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #222' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#F59E0B', fontWeight: 700, fontFamily: M, marginBottom: 4 }}>4/4 SIGNALS</div>
            <div style={{ fontFamily: M, fontSize: 11, color: '#fff' }}>2 MNQ / 2 MES</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#EAB308', fontWeight: 700, fontFamily: M, marginBottom: 4 }}>3/4 SIGNALS</div>
            <div style={{ fontFamily: M, fontSize: 11, color: '#fff' }}>1 MNQ / 1 MES</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#737373', fontWeight: 700, fontFamily: M, marginBottom: 4 }}>{'<3/4 SIGNALS'}</div>
            <div style={{ fontFamily: M, fontSize: 11, color: '#737373' }}>FLAT — No Trade</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#22C55E', fontWeight: 700, fontFamily: M, marginBottom: 4 }}>DAILY TARGET</div>
            <div style={{ fontFamily: M, fontSize: 11, color: '#22C55E' }}>$300/day avg</div>
          </div>
        </div>
      </div>
    </div>
  );
}
