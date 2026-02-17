'use client';
import { brand, styles } from "@/lib/brand";
import { useState, useEffect, useCallback } from "react";
import OpsGuard from '@/components/OpsGuard';
import { getRecentlyArchived, ArchivedResource, CATEGORY_ICONS } from '@/lib/archived-resources';

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
    id?: string;
    author?: string;
    timestamp: string;
    message?: string;
    jobId?: string;
    details?: any;
  }[];
  generatedAt?: string;
}

interface OpsStatusFile {
  agents: {
    name: string;
    role: string;
    status: string;
    model: string;
    health: string;
    lastSeen: string;
  }[];
  sessions: {
    key: string;
    agent: string;
    status: string;
  }[];
  crons: {
    id: string;
    name: string;
    enabled: boolean;
    lastStatus?: string;
  }[];
  system: {
    totalAgents: number;
    activeSessions: number;
    totalCrons: number;
  };
  generatedAt?: string;
}

function RecentlyAcquiredSection() {
  const [resources, setResources] = useState<ArchivedResource[]>([]);

  useEffect(() => {
    const loadResources = () => setResources(getRecentlyArchived(5));
    loadResources();
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dbtech-assist-archived') loadResources();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (resources.length === 0) return null;

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div style={{ ...styles.card, background: brand.carbon, marginBottom: '16px' }}>
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
          background: 'rgba(34,197,94,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}>🔧</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>Recently Acquired</div>
          <div style={{ fontSize: 11, color: brand.smoke }}>Tools & resources added to the stack</div>
        </div>
        <a
          href="/os/agents/assist"
          style={{
            fontSize: 11,
            color: brand.amber,
            textDecoration: 'none',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          View All →
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {resources.map(r => (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              background: brand.graphite,
              borderRadius: '8px',
              textDecoration: 'none',
              border: `1px solid ${brand.border}`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = brand.success; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = brand.border; }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{CATEGORY_ICONS[r.category] || '📦'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: brand.white, fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: brand.smoke, marginTop: 2 }}>
                {r.agentName} • {r.category}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: 10,
                color: brand.success,
                fontFamily: "'JetBrains Mono', monospace",
                padding: '2px 6px',
                background: 'rgba(34,197,94,0.1)',
                borderRadius: 4,
              }}>
                ✓ ACQUIRED
              </div>
              <div style={{ fontSize: 10, color: brand.smoke, marginTop: 4 }}>
                {formatTimeAgo(r.archivedAt || r.createdAt)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
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

      // Compute stats from real data
      const activeAgents = Array.isArray(opsData.agents)
        ? opsData.agents.filter(a => a.status === 'running').length
        : opsData.system?.activeSessions || 0;

      const commits = activityData.activity.filter(a => a.type === 'commit');
      const cronRuns = activityData.activity.filter(a => a.type === 'cron_run' || a.type === 'cron');
      const uniqueRepos = new Set(commits.map(c => (c.message || '').split(':')[0])).size || 1;

      const stats: StatItem[] = [
        { value: activeAgents.toString(), label: 'ACTIVE AGENTS', color: brand.amber },
        { value: uniqueRepos.toString(), label: 'REPOS ACTIVE', color: brand.success },
        { value: commits.length.toString(), label: 'COMMITS (7D)', color: brand.info },
        { value: cronRuns.length.toString(), label: 'CRON RUNS (7D)', color: '#8B5CF6' },
      ];

      // Convert activity items - handle both flat and nested formats
      const activity: ActivityItem[] = activityData.activity.map((item) => {
        const agent = item.author || item.details?.agent || 'System';
        const msg = item.message || item.details?.message || item.details?.summary || 'Activity recorded';
        const isCommit = item.type === 'commit';
        const isCron = item.type === 'cron_run' || item.type === 'cron';
        return {
          time: new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          type: isCommit ? 'commit' : isCron ? 'cron' : item.type,
          agent,
          msg,
          color: isCommit ? brand.success : isCron ? '#8B5CF6' : brand.amber,
          icon: isCommit ? '📝' : isCron ? '⚡' : '🔄',
        };
      }).slice(0, 30);

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

        {/* Recently Acquired Resources */}
        <RecentlyAcquiredSection />

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
