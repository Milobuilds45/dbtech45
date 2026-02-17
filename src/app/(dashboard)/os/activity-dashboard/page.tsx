'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from "@/lib/brand";
import { RefreshCw } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  type: 'commit' | 'deploy' | 'cron' | 'session';
  agent: string;
  msg: string;
  url?: string;
  sha?: string;
  target?: string;
}

interface Stats {
  activeAgents: number;
  commits7d: number;
  deploys7d: number;
  totalToday: number;
}

const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  deploy: { color: '#10B981', icon: '▲' },
  commit: { color: '#F59E0B', icon: '◆' },
  cron: { color: '#3B82F6', icon: '⏰' },
  session: { color: '#A855F7', icon: '⚡' },
};

const AGENT_COLORS: Record<string, string> = {
  Anders: '#F97316',
  Milo: '#A855F7',
  Paula: '#EC4899',
  Bobby: '#EF4444',
  Dwight: '#6366F1',
  Tony: '#EAB308',
  Dax: '#06B6D4',
  Remy: '#22C55E',
  Wendy: '#8B5CF6',
  Derek: '#F59E0B',
  System: '#737373',
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({ activeAgents: 0, commits7d: 0, deploys7d: 0, totalToday: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/activity/all', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivities(data.activities || []);
      setStats(data.stats || { activeAgents: 0, commits7d: 0, deploys7d: 0, totalToday: 0 });
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120_000);
    return () => clearInterval(interval);
  }, []);

  const STAT_CARDS = [
    { value: String(stats.activeAgents), label: 'ACTIVE AGENTS', color: brand.amber },
    { value: String(stats.totalToday), label: 'TODAY', color: brand.success },
    { value: String(stats.commits7d), label: 'COMMITS (7D)', color: brand.info },
    { value: String(stats.deploys7d), label: 'DEPLOYS (7D)', color: '#8B5CF6' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.h1}>Activity Dashboard</h1>
            <p style={styles.subtitle}>Live system telemetry from GitHub + Vercel</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={fetchData} disabled={loading} style={{
              background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: '6px',
              padding: '6px 10px', color: brand.smoke, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
              fontFamily: "'Inter', sans-serif",
            }}>
              <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px',
              borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: `1px solid ${brand.border}`,
              fontSize: '12px', color: brand.success, fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: brand.success, display: 'inline-block' }} /> Live
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {STAT_CARDS.map((s, i) => (
            <div key={i} style={{ ...styles.card, textAlign: 'center', padding: '20px', background: `radial-gradient(circle at top, rgba(245,158,11,0.02), ${brand.carbon})` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: 700, color: s.color }}>
                {loading && !activities.length ? '-' : s.value}
              </div>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div style={{ ...styles.card, background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, marginBottom: '16px', padding: '12px 16px' }}>
            <div style={{ color: brand.error, fontSize: '13px' }}>Failed to load: {error}</div>
          </div>
        )}

        {/* Activity Stream */}
        <div style={{ ...styles.card, background: brand.carbon }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${brand.border}` }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: brand.success }}>◎</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>Activity Stream</div>
              <div style={{ fontSize: 11, color: brand.smoke }}>
                {lastUpdated ? `Updated ${fmtRelative(lastUpdated)}` : 'Loading...'}
              </div>
            </div>
          </div>

          {loading && !activities.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: brand.smoke, fontSize: '14px' }}>
              Loading real activity data...
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: brand.smoke, fontSize: '14px' }}>
              No activity found.
            </div>
          ) : (
            activities.map((item, i) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.session;
              const agentColor = AGENT_COLORS[item.agent] || brand.smoke;

              return (
                <div key={item.id || i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0',
                  borderBottom: i < activities.length - 1 ? `1px solid ${brand.border}` : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `${cfg.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, flexShrink: 0, color: cfg.color,
                  }}>{cfg.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: agentColor }}>{item.agent}</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                        borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                        background: 'rgba(245,158,11,0.1)', color: brand.amber,
                      }}>{item.type}</span>
                      {item.sha && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke }}>
                          {item.sha}
                        </span>
                      )}
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke, marginLeft: 'auto',
                        whiteSpace: 'nowrap',
                      }}>
                        {fmtTime(item.time)} · {fmtRelative(item.time)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: brand.silver, textDecoration: 'none' }}>
                          {item.msg}
                        </a>
                      ) : item.msg}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
