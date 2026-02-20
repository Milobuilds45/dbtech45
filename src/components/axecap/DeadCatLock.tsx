'use client';
import { useState, useEffect } from 'react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface DeadCatLockProps {
  scenarioNumber: number;
  onLockChange: (locked: boolean) => void;
}

export default function DeadCatLock({ scenarioNumber, onLockChange }: DeadCatLockProps) {
  const [locked, setLocked] = useState(false);
  const [flash, setFlash] = useState(false);
  const [overrideCode, setOverrideCode] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    if (scenarioNumber === 6) {
      setLocked(true);
      onLockChange(true);
    }
  }, [scenarioNumber, onLockChange]);

  useEffect(() => {
    if (locked) {
      const timer = setInterval(() => setFlash(prev => !prev), 800);
      return () => clearInterval(timer);
    }
  }, [locked]);

  const attemptOverride = () => {
    // Emergency override — requires explicit action
    if (overrideCode === 'OVERRIDE-DEAD-CAT') {
      setLocked(false);
      onLockChange(false);
      setShowOverride(false);
      setOverrideCode('');
    }
  };

  if (!locked) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      background: flash ? 'rgba(127,29,29,0.95)' : 'rgba(20,0,0,0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.5s ease',
    }}>
      {/* Skull / Warning Icon */}
      <div style={{ fontSize: 80, marginBottom: 20, filter: flash ? 'brightness(1.5)' : 'brightness(0.8)', transition: 'filter 0.5s' }}>
        💀
      </div>

      <div style={{
        fontFamily: M,
        fontSize: 42,
        fontWeight: 700,
        color: '#EF4444',
        letterSpacing: '0.15em',
        textAlign: 'center',
        marginBottom: 12,
        textShadow: '0 0 30px rgba(239,68,68,0.5)',
      }}>
        DEAD CAT DETECTED
      </div>

      <div style={{
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: 20,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        SCENARIO 6: STAGFLATION TAPE
      </div>

      <div style={{
        fontFamily: M,
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        maxWidth: 600,
        lineHeight: 1.8,
        marginBottom: 32,
      }}>
        Asia DOWN + US10Y UP + DXY UP + DAX Flat/Down<br/>
        Bonds and stocks are both being sold. There is no safe haven.<br/>
        <span style={{ color: '#EF4444', fontWeight: 700 }}>ZERO TRADES. Cash is a position. Preserve capital.</span>
      </div>

      {/* Disabled buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div style={{
          padding: '12px 40px',
          background: '#333',
          borderRadius: 8,
          fontFamily: M,
          fontSize: 16,
          fontWeight: 700,
          color: '#666',
          cursor: 'not-allowed',
          opacity: 0.4,
          border: '2px solid #444',
        }}>
          BUY — DISABLED
        </div>
        <div style={{
          padding: '12px 40px',
          background: '#333',
          borderRadius: 8,
          fontFamily: M,
          fontSize: 16,
          fontWeight: 700,
          color: '#666',
          cursor: 'not-allowed',
          opacity: 0.4,
          border: '2px solid #444',
        }}>
          SELL — DISABLED
        </div>
      </div>

      <div style={{
        fontFamily: M,
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginBottom: 20,
      }}>
        One Dead Cat session where you force trades can end the evaluation.
      </div>

      {/* Emergency Override */}
      {!showOverride ? (
        <button
          onClick={() => setShowOverride(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '6px 16px',
            fontFamily: M,
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
          }}
        >
          Emergency Override
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={overrideCode}
            onChange={e => setOverrideCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && attemptOverride()}
            placeholder="Type OVERRIDE-DEAD-CAT"
            style={{
              background: '#1a0505',
              border: '1px solid #EF4444',
              borderRadius: 4,
              padding: '6px 12px',
              color: '#EF4444',
              fontFamily: M,
              fontSize: 11,
              width: 220,
            }}
          />
          <button onClick={attemptOverride} style={{
            background: '#EF4444',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '6px 14px',
            fontFamily: M,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            UNLOCK
          </button>
        </div>
      )}
    </div>
  );
}
