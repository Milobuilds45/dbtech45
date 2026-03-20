'use client';

import React, { useState, useEffect } from 'react';
import { UsageGauge } from './UsageGauge';

interface OAuthData {
  daily: { limit: number; remaining: number; reset: string };
  weekly: { limit: number; remaining: number; reset: string };
  monthly: { limit: number; spent: number; total: number; reset: string };
}

interface UsageResponse {
  oauth: OAuthData | null;
  oauthError: string | null;
  totals: { totalCost: number; claudeCost: number };
}

function formatReset(reset: string): string {
  if (!reset) return '';
  try {
    const d = new Date(reset);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    if (diffMs < 0) return 'now';
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 24) {
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  } catch {
    return reset;
  }
}

export function SidebarUsage() {
  const [data, setData] = useState<UsageResponse | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage', { cache: 'no-store' });
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1A1A1D' }}>
        <div style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Loading usage...
        </div>
      </div>
    );
  }

  const oauth = data.oauth;

  // Calculate percentages
  const sessionPct = oauth ? Math.round(((oauth.daily.limit - oauth.daily.remaining) / oauth.daily.limit) * 100) : 0;
  const weeklyPct = oauth ? Math.round(((oauth.weekly.limit - oauth.weekly.remaining) / oauth.weekly.limit) * 100) : 0;
  const extraPct = oauth ? Math.round((oauth.monthly.spent / oauth.monthly.total) * 100) : 0;

  return (
    <div style={{
      padding: '12px 8px 8px',
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
        marginBottom: '2px',
      }}>
        Claude Usage
      </div>

      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        <UsageGauge
          label="Session"
          value={sessionPct}
          max={100}
          size={100}
          color="#F59E0B"
          formatValue={(v) => `${Math.round(v)}%`}
          subLabel={oauth?.daily.reset ? `Resets ${formatReset(oauth.daily.reset)}` : ''}
        />
        <UsageGauge
          label="Weekly"
          value={weeklyPct}
          max={100}
          size={100}
          color="#3B82F6"
          formatValue={(v) => `${Math.round(v)}%`}
          subLabel={oauth?.weekly.reset ? `Resets ${formatReset(oauth.weekly.reset)}` : ''}
        />
      </div>

      {/* Extra usage bar */}
      {oauth && oauth.monthly.spent > 0 && (
        <div style={{ width: '100%', padding: '4px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#52525b', marginBottom: '3px' }}>
            <span>Extra: ${oauth.monthly.spent.toFixed(2)} / ${oauth.monthly.total.toFixed(2)}</span>
            <span>{extraPct}%</span>
          </div>
          <div style={{ height: '3px', background: '#1A1A1D', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(extraPct, 100)}%`,
              background: extraPct > 80 ? '#EF4444' : '#F59E0B',
              borderRadius: '2px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {data.oauthError && !oauth && (
        <div style={{ fontSize: '9px', color: '#52525b', textAlign: 'center', padding: '0 8px' }}>
          {data.oauthError}
        </div>
      )}
    </div>
  );
}
