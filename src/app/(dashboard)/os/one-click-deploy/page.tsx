'use client';

import { brand } from '@/lib/brand';

export default function OneClickDeployPage() {
  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: brand.void,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: brand.amber,
          marginBottom: '12px',
        }}>
          One-Click Agent Deploy
        </h1>
        <p style={{ fontSize: '16px', color: '#737373', marginBottom: '24px', lineHeight: 1.6 }}>
          Single button creates a new agent — Telegram bot, OpenClaw workspace, SOUL.md, config files — live in under 60 seconds.
        </p>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: "'JetBrains Mono', monospace",
          color: brand.amber,
        }}>
          ASSIGNED TO: ANDERS — BUILD IN PROGRESS
        </div>
      </div>
    </div>
  );
}
