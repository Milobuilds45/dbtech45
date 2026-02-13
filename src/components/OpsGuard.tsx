'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PinModal, isOpsPinVerified, requiresOpsPin } from './PinGate';
import { brand } from '@/lib/brand';

/**
 * Wraps ops page content. If the current route requires a PIN and it hasn't
 * been verified yet, shows a full-page lock screen with the PIN modal.
 */
export default function OpsGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [verified, setVerified] = useState(true); // default true to avoid flash
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (requiresOpsPin(pathname)) {
      const v = isOpsPinVerified();
      setVerified(v);
      if (!v) setShowModal(true);
    } else {
      setVerified(true);
    }
  }, [pathname]);

  // Before hydration, render nothing (avoid flash)
  if (!mounted) return null;

  if (!verified) {
    return (
      <>
        <div style={{
          minHeight: '100vh',
          background: brand.void,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: `2px solid ${brand.amber}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            🔒
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '16px',
            fontWeight: 600,
            color: brand.white,
          }}>
            Operations — Locked
          </div>
          <div style={{ fontSize: '13px', color: '#737373' }}>
            PIN required to access this section
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              marginTop: '8px',
              padding: '10px 28px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${brand.amber}`,
              borderRadius: '8px',
              color: brand.amber,
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
            }}
          >
            Enter PIN
          </button>
        </div>
        <PinModal
          open={showModal}
          onSuccess={() => {
            setShowModal(false);
            setVerified(true);
          }}
          onCancel={() => {
            setShowModal(false);
          }}
        />
      </>
    );
  }

  return <>{children}</>;
}
