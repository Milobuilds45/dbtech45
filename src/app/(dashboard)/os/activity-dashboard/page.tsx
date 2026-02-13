'use client';
import { brand, styles } from "@/lib/brand";
import { useState, useEffect, useCallback } from "react";
import OpsGuard from '@/components/OpsGuard';

interface StatItem {
  value: string;
  label: string;
  color: string;
}

interface ActivityItem {
  time: string;
  type: string;
  agent: string;
  msg: string;
  color: string;
  icon: string;
}

interface ActivityData {
  stats: StatItem[];
  activity: ActivityItem[];
  lastUpdated: string;
  error?: string;
}

// Data interfaces for JSON files
interface ActivityDataFile {
  activity: {
    type: string;
    timestamp: string;
    details: any;
  }[];
  stats: {
    gitCommits: {
      last7Days: number;
      repositories: string[];
    };
    cronRuns: {
      last7Days: number;
      successful: number;
    };
  };
}

interface OpsStatusFile {
  agents: {
    total: number;
    active: number;
    sessions: any[];
  };
  crons: {
    total: number;
    active: number;
  };
  system: any;
}

export default function ActivityDashboard() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const fetchActivity = useCallback(async () => {
    try {
      // Fetch from both JSON files
      const [activityResponse, opsResponse] = await Promise.all([
        fetch('/data/activity.json', { cache: 'no-store' }),
        fetch('/data/ops-status.json', { cache: 'no-store' })
      ]);

      if (!activityResponse.ok || !opsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const activityData: ActivityDataFile = await activityResponse.json();
      const opsData: OpsStatusFile = await opsResponse.json();

      // Build stats from real data
      const stats: StatItem[] = [
        { 
          value: opsData.agents.active.toString(), 
          label: 'ACTIVE AGENTS', 
          color: brand.amber 
        },
        { 
          value: activityData.stats.gitCommits.repositories.length.toString(), 
          label: 'REPOS ACTIVE', 
          color: brand.success 
        },
        { 
          value: activityData.stats.gitCommits.last7Days.toString(), 
          label: 'COMMITS (7D)', 
          color: brand.info 
        },
        { 
          value: activityData.stats.cronRuns.last7Days.toString(), 
          label: 'CRON RUNS (7D)', 
          color: '#8B5CF6' 
        }
      ];

      // Convert activity data
      const activity: ActivityItem[] = activityData.activity.map((item, index) => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        type: item.type,
        agent: item.details.agent || 'System',
        msg: item.details.message || item.details.summary || 'Activity recorded',
        color: item.type === 'commit' ? brand.success : item.type === 'cron' ? '#8B5CF6' : brand.amber,
        icon: item.type === 'commit' ? '📝' : item.type === 'cron' ? '⚡' : '🔄'
      })).slice(0, 20); // Show latest 20 items

      const result: ActivityData = {
        stats,
        activity,
        lastUpdated: new Date().toISOString()
      };

      setData(result);
      setLastRefresh(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      }));
    } catch (err) {
      console.error('Activity fetch error:', err);
      // Set empty data rather than using fallback
      setData({
        stats: [
          { value: '0', label: 'ACTIVE AGENTS', color: brand.amber },
          { value: '0', label: 'REPOS ACTIVE', color: brand.success },
          { value: '0', label: 'COMMITS (7D)', color: brand.info },
          { value: '0', label: 'CRON RUNS (7D)', color: '#8B5CF6' }
        ],
        activity: [],
        lastUpdated: new Date().toISOString(),
        error: 'Failed to load data'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity(); // Initial load

    // Auto-refresh every hour
    const interval = setInterval(fetchActivity, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  const stats = data?.stats || [];
  const activity = data?.activity || [];

  return (
    <OpsGuard>
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.h1}>Activity Dashboard</h1>
            <p style={styles.subtitle}>
              Live system telemetry · Agent activity · Deploy status
              {lastRefresh && (
                <span style={{ marginLeft: '12px', fontSize: '12px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                  Updated {lastRefresh}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { setLoading(true); fetchActivity(); }}
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: `1px solid ${brand.border}`,
                borderRadius: '6px',
                padding: '4px 10px',
                color: brand.amber,
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = brand.amber)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = brand.border)}
            >
              {loading ? '↻ Loading...' : '↻ Refresh'}
            </button>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: 'rgba(245,158,11,0.1)',
              border: `1px solid ${brand.border}`,
              fontSize: '12px',
              color: brand.success,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: brand.success,
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }} /> Live
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              ...styles.card,
              textAlign: 'center',
              padding: '20px',
              background: `radial-gradient(circle at top, rgba(245,158,11,0.02), ${brand.carbon})`,
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '28px',
                fontWeight: 700,
                color: s.color,
                transition: 'all 0.3s ease',
              }}>
                {loading && !data ? '...' : s.value}
              </div>
              <div style={{
                fontSize: '10px',
                color: brand.smoke,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: '4px',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Activity Stream */}
        <div style={{ ...styles.card, background: brand.carbon }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${brand.border}`,
          }}>
            <span style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(16,185,129,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: brand.success,
            }}>◎</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>Activity Stream</div>
              <div style={{ fontSize: 11, color: brand.smoke }}>Last 7 days · Auto-refreshes hourly</div>
            </div>
            {data?.error && (
              <span style={{
                fontSize: 10,
                color: brand.warning,
                fontFamily: "'JetBrains Mono', monospace",
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(234,179,8,0.1)',
              }}>
                ⚠ Using cached data
              </span>
            )}
          </div>

          {loading && !data ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: brand.smoke }}>
              <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                Fetching live data from GitHub + Vercel...
              </div>
            </div>
          ) : activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: brand.smoke }}>
              <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                No activity data available. Check API configuration.
              </div>
            </div>
          ) : (
            activity.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 0',
                borderBottom: i < activity.length - 1 ? `1px solid ${brand.border}` : 'none',
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: `${item.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  color: item.color,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.agent}</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: 'rgba(245,158,11,0.1)',
                      color: brand.amber,
                    }}>
                      {item.type}
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: brand.smoke,
                      marginLeft: 'auto',
                    }}>
                      {item.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>{item.msg}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '11px',
          color: brand.smoke,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Auto-refreshes every hour · Data from GitHub API + Vercel
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
    </OpsGuard>
  );
}
