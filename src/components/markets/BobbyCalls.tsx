'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';

interface BobbyCall {
  id: string;
  ticker: string;
  direction: string;
  entry: number;
  target: number | null;
  stop: number | null;
  conviction: number;
  status: string;
  entryDate: string;
  exitDate: string | null;
  exitPrice: number | null;
  pnlPercent: number | null;
  notes: string | null;
}

interface BobbyStats {
  totalWins: number;
  totalLosses: number;
  winRate: number;
  avgWinPercent: number;
  avgLossPercent: number;
  currentStreak: number;
  streakType: 'win' | 'loss';
}

const M = "'JetBrains Mono','Fira Code',monospace";

function daysAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return d === 0 ? 'today' : d === 1 ? '1 day' : `${d} days`;
}

export default function BobbyCalls() {
  const [active, setActive] = useState<BobbyCall[]>([]);
  const [recent, setRecent] = useState<BobbyCall[]>([]);
  const [stats, setStats] = useState<BobbyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/bobby-calls', { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setActive(d.active || []);
      setRecent(d.recent || []);
      setStats(d.stats || null);
    } catch {
      setError('Failed to load Bobby\'s calls');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const winRateColor = stats ? (stats.winRate >= 60 ? '#22C55E' : stats.winRate >= 50 ? '#EAB308' : '#EF4444') : brand.smoke;

  return (
    <div style={{ height: '100%' }}>
      {/* Header with win rate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ color: brand.amber, fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>BOBBY&apos;S CALLS</span>
        </div>
        {stats && stats.winRate > 0 && (
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: M, fontWeight: 700,
            background: `${winRateColor}15`, color: winRateColor,
          }}>{stats.winRate}% Win Rate</span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: M }}>
          <span style={{ animation: 'axp 1.5s ease-in-out infinite' }}>Loading calls...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '8px 0' }}>
          <span style={{ color: '#EF4444', fontSize: 11 }}>⚠ {error}</span>
          <button onClick={fetchCalls} style={{ marginLeft: 8, fontSize: 10, color: brand.amber, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      ) : (
        <>
          {/* Active Calls */}
          {active.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: brand.smoke, fontWeight: 700, fontFamily: M, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ACTIVE ({active.length})
              </div>
              {active.map(c => (
                <div key={c.id} style={{
                  padding: '10px 12px', marginBottom: 6, borderRadius: 6,
                  background: brand.graphite, borderLeft: `3px solid ${brand.amber}`,
                  border: `1px solid ${brand.border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: brand.amber, fontFamily: M }}>{c.ticker}</span>
                      <span style={{
                        padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: M,
                        color: c.direction === 'LONG' || c.direction === 'CALL' ? '#22C55E' : '#EF4444',
                        background: c.direction === 'LONG' || c.direction === 'CALL' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      }}>{c.direction}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: c.conviction }, (_, i) => <span key={i} style={{ fontSize: 10 }}>🔥</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: brand.smoke, fontFamily: M }}>
                    <span>Entry: <span style={{ color: brand.white }}>${c.entry.toFixed(2)}</span></span>
                    {c.target && <span>Target: <span style={{ color: '#22C55E' }}>${c.target.toFixed(2)}</span></span>}
                    {c.stop && <span>Stop: <span style={{ color: '#EF4444' }}>${c.stop.toFixed(2)}</span></span>}
                  </div>
                  <div style={{ fontSize: 9, color: brand.smoke, fontFamily: M, marginTop: 4 }}>
                    {daysAgo(c.entryDate)} open
                    {c.notes && <span> · {c.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Closed */}
          {recent.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: brand.smoke, fontWeight: 700, fontFamily: M, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                RECENT
              </div>
              {recent.slice(0, 8).map(c => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: `1px solid ${brand.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: c.status === 'won' ? '#22C55E' : '#EF4444' }}>
                      {c.status === 'won' ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: M, color: brand.white, fontWeight: 600 }}>{c.ticker}</span>
                    <span style={{ fontSize: 10, fontFamily: M, color: brand.smoke }}>{c.direction}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 11, fontFamily: M, fontWeight: 700,
                      color: c.pnlPercent != null && c.pnlPercent >= 0 ? '#22C55E' : '#EF4444',
                    }}>
                      {c.pnlPercent != null ? `${c.pnlPercent > 0 ? '+' : ''}${c.pnlPercent.toFixed(1)}%` : '--'}
                    </span>
                    <span style={{ fontSize: 9, fontFamily: M, color: brand.smoke }}>
                      {c.exitDate ? new Date(c.exitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No calls state */}
          {active.length === 0 && recent.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: M }}>
              No calls yet. Bobby&apos;s sizing up the market.
            </div>
          )}

          {/* Stats Bar */}
          {stats && (stats.totalWins > 0 || stats.totalLosses > 0) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0', borderTop: `1px solid ${brand.border}`,
              fontSize: 10, fontFamily: M, color: brand.smoke,
              flexWrap: 'wrap',
            }}>
              <span>{stats.totalWins}W / {stats.totalLosses}L</span>
              <span>Avg +{stats.avgWinPercent}%</span>
              {stats.currentStreak > 0 && (
                <span style={{ color: stats.streakType === 'win' ? '#22C55E' : '#EF4444' }}>
                  🔥{stats.currentStreak} {stats.streakType} streak
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
