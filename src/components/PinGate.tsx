'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';

const OPS_PIN = '0256';
const STORAGE_KEY = 'ops-pin-verified';

/** Routes that require Operations PIN */
export const OPS_ROUTES = [
  '/os/activity-dashboard',
  '/os/dna',
  '/os/second-brain',
  '/os/skills-inventory',
  '/os/brand-kit',
  '/os/brand-spec',
];

export function isOpsPinVerified(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}

export function setOpsPinVerified(): void {
  sessionStorage.setItem(STORAGE_KEY, 'true');
}

export function requiresOpsPin(href: string): boolean {
  return OPS_ROUTES.some(route => href === route || href.startsWith(route + '/'));
}

interface PinModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinModal({ open, onSuccess, onCancel }: PinModalProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      setDigits(['', '', '', '']);
      setError(false);
      setShake(false);
      setTimeout(() => refs[0].current?.focus(), 50);
    }
  }, [open]);

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }

    // Check if all digits entered
    if (newDigits.every(d => d !== '')) {
      const entered = newDigits.join('');
      if (entered === OPS_PIN) {
        setOpsPinVerified();
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setDigits(['', '', '', '']);
          refs[0].current?.focus();
        }, 600);
      }
    }
  }, [digits, onSuccess]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [digits, onCancel]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      if (pasted === OPS_PIN) {
        setOpsPinVerified();
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setDigits(['', '', '', '']);
          refs[0].current?.focus();
        }, 600);
      }
    }
  }, [onSuccess]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pinFadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111111',
          border: `1px solid ${error ? '#EF4444' : '#222222'}`,
          borderRadius: '16px',
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: '380px',
          width: '90%',
          boxShadow: error
            ? '0 0 40px rgba(239, 68, 68, 0.2)'
            : '0 0 60px rgba(245, 158, 11, 0.1)',
          transform: shake ? 'translateX(0)' : undefined,
          animation: shake ? 'pinShake 0.5s ease-in-out' : 'pinSlideUp 0.3s ease-out',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Lock icon */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `2px solid ${error ? '#EF4444' : brand.amber}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '24px',
          transition: 'all 0.3s',
        }}>
          {error ? '✕' : '🔒'}
        </div>

        <h2 style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '16px',
          fontWeight: 700,
          color: brand.white,
          margin: '0 0 6px',
          letterSpacing: '0.02em',
        }}>
          Operations Access
        </h2>
        <p style={{
          fontSize: '13px',
          color: '#737373',
          margin: '0 0 28px',
        }}>
          {error ? 'Incorrect PIN. Try again.' : 'Enter 4-digit PIN to continue'}
        </p>

        {/* PIN input boxes */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: '52px',
                height: '60px',
                textAlign: 'center',
                fontSize: '24px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                background: '#1A1A1A',
                border: `2px solid ${error ? '#EF4444' : digit ? brand.amber : '#333333'}`,
                borderRadius: '10px',
                color: brand.white,
                outline: 'none',
                caretColor: brand.amber,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                if (!error) e.currentTarget.style.borderColor = brand.amber;
                e.currentTarget.style.boxShadow = `0 0 12px ${error ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`;
              }}
              onBlur={e => {
                if (!digit && !error) e.currentTarget.style.borderColor = '#333333';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#737373',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            padding: '6px 16px',
            borderRadius: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = brand.silver)}
          onMouseLeave={e => (e.currentTarget.style.color = '#737373')}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes pinFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pinSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-8px); }
          30%, 70% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
