'use client';

import React, { useState, useEffect } from 'react';
import { UsageGauge } from './UsageGauge';

interface ClaudeData {
  sessionTokens: number;
  sessionCost: number;
  weeklyTokens: number;
  weeklyCost: number;
  contextUsed: number;
  contextMax: number;
}

export function SidebarUsage() {
  const [data, setData] = useState<ClaudeData | null>(null);
  const [error, setError] = useState(false);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json.claude);
        setError(false);
      }
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (error || !data) {
    return (
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1A1A1D',
      }}>
        <div style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {error ? 'Usage unavailable' : 'Loading usage...'}
        </div>
      </div>
    );
  }

  // Session gauge: max = context window (200K)
  // Weekly gauge: max = budget cap (let's use 10M tokens as a reasonable weekly cap)
  const weeklyMax = 10_000_000;

  return (
    <div style={{
      padding: '12px 8px',
      borderBottom: '1px solid #1A1A1D',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        color: '#52525b',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '4px',
      }}>
        Claude Usage
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <UsageGauge
          label="Session"
          value={data.sessionTokens}
          max={data.contextMax}
          size={110}
          color="#F59E0B"
          subLabel={`$${data.sessionCost.toFixed(2)}`}
        />
        <UsageGauge
          label="Weekly"
          value={data.weeklyTokens}
          max={weeklyMax}
          size={110}
          color="#3B82F6"
          subLabel={`$${data.weeklyCost.toFixed(2)}`}
        />
      </div>
    </div>
  );
}
