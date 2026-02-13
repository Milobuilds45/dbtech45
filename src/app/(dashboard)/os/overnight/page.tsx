'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from "@/lib/brand";

/* ── Types ─────────────────────────────────────────────────────────── */

interface OvernightItem {
  agent: string;
  agentColor: string;
  type: string;
  title: string;
  summary: string;
  details?: string[];
  tags: string[];
  priority?: 'high' | 'medium' | 'low';
  timestamp: string;
  icon?: string;
  status?: 'success' | 'error' | 'pending';
  durationMs?: number;
}

interface OvernightBrief {
  date: string;
  label: string;
  headline: string;
  items: OvernightItem[];
}

interface OvernightData {
  briefs: OvernightBrief[];
  stats: {
    totalBriefs: number;
    totalItems: number;
    successRate: number;
  };
  lastUpdated: string;
  error?: string;
}

/* ── Type styling ──────────────────────────────────────────────────── */

const TYPE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  analysis: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', icon: '◈' },
  idea:     { bg: 'rgba(168,85,247,0.1)', color: '#A855F7', icon: '✦' },
  research: { bg: 'rgba(6,182,212,0.1)',  color: '#06B6D4', icon: '⌕' },
  alert:    { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', icon: '⚡' },
  build:    { bg: 'rgba(16,185,129,0.1)', color: '#10B981', icon: '▲' },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: brand.error,
  medium: brand.warning,
  low: brand.smoke,
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  success: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'OK' },
  error:   { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', label: 'ERR' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'PENDING' },
};

/* ── Component ─────────────────────────────────────────────────────── */

export default function OvernightSessions() {
  const [data, setData] = useState<OvernightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [expandedBrief, setExpandedBrief] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/overnight', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch');
      const result: OvernightData = await response.json();
      setData(result);
      setLastRefresh(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
      }));
    } catch (err) {
      console.error('Overnight fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000); // Hourly
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const briefs = data?.briefs || [];
  const agents = Array.from(new Set(briefs.flatMap(b => b.items.map(i => i.agent))));
  const types = Array.from(new Set(briefs.flatMap(b => b.items.map(i => i.type))));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={styles.h1}>Overnight Sessions</h1>
            <p style={styles.subtitle}>
              Nightly intelligence briefs · Agent results · Live status
              {lastRefresh && (
                <span style={{ marginLeft: '12px', fontSize: '12px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                  Updated {lastRefresh}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setLoading(true); fetchData(); }}
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
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
              borderRadius: 6, background: 'rgba(168,85,247,0.1)',
              border: `1px solid ${brand.border}`, fontSize: 12, color: '#A855F7',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A855F7', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
              {data?.stats?.totalBriefs || 0} briefs
            </span>
          </div>
        </div>

        {/* Stats row */}
        {data?.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ ...styles.card, textAlign: 'center', padding: '16px', background: `radial-gradient(circle at top, rgba(168,85,247,0.03), ${brand.carbon})` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 700, color: '#A855F7' }}>
                {data.stats.totalBriefs}
              </div>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>NIGHTS TRACKED</div>
            </div>
            <div style={{ ...styles.card, textAlign: 'center', padding: '16px', background: `radial-gradient(circle at top, rgba(16,185,129,0.03), ${brand.carbon})` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 700, color: brand.success }}>
                {data.stats.totalItems}
              </div>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>TOTAL ITEMS</div>
            </div>
            <div style={{ ...styles.card, textAlign: 'center', padding: '16px', background: `radial-gradient(circle at top, rgba(245,158,11,0.03), ${brand.carbon})` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 700, color: brand.amber }}>
                {data.stats.successRate}%
              </div>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>SUCCESS RATE</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '6px 10px', color: brand.white, fontSize: 12, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
          >
            <option value="all">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '6px 10px', color: brand.white, fontSize: 12, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        {/* Loading state */}
        {loading && !data && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px', background: brand.carbon }}>
            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>
              Fetching overnight session data from cron system + GitHub...
            </div>
          </div>
        )}

        {/* No data state */}
        {!loading && briefs.length === 0 && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px', background: brand.carbon }}>
            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>
              No overnight session data available yet. Overnight crons run at 2:00 AM EST.
            </div>
          </div>
        )}

        {/* Briefs */}
        {briefs.map((brief, bi) => {
          const isOpen = expandedBrief === bi;
          const filteredItems = brief.items.filter(item =>
            (filterAgent === 'all' || item.agent === filterAgent) &&
            (filterType === 'all' || item.type === filterType)
          );

          return (
            <div key={bi} style={{ marginBottom: 16 }}>
              {/* Brief header */}
              <div
                onClick={() => setExpandedBrief(isOpen ? -1 : bi)}
                style={{
                  ...styles.card,
                  cursor: 'pointer',
                  borderColor: isOpen ? 'rgba(168,85,247,0.3)' : brand.border,
                  background: isOpen ? `linear-gradient(135deg, rgba(168,85,247,0.03), ${brand.carbon})` : brand.carbon,
                  borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      🌙
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: brand.white }}>{brief.label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{brief.date}</span>
                      </div>
                      <div style={{ fontSize: 12, color: brand.silver, marginTop: 2 }}>{brief.headline}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{filteredItems.length} items</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.smoke} strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Brief items */}
              {isOpen && (
                <div style={{
                  border: `1px solid rgba(168,85,247,0.3)`,
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  background: brand.carbon,
                  padding: '8px',
                }}>
                  {filteredItems.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: brand.smoke, fontSize: 13 }}>
                      No items match current filters.
                    </div>
                  ) : filteredItems.map((item, ii) => {
                    const itemKey = `${bi}-${ii}`;
                    const isItemOpen = expandedItems.has(itemKey);
                    const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.analysis;
                    const statusStyle = STATUS_STYLES[item.status || 'pending'];

                    return (
                      <div
                        key={ii}
                        onClick={() => item.details && item.details.length > 0 && toggleItem(itemKey)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 8,
                          marginBottom: ii < filteredItems.length - 1 ? 4 : 0,
                          background: isItemOpen ? brand.graphite : 'transparent',
                          cursor: item.details && item.details.length > 0 ? 'pointer' : 'default',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: `${item.agentColor}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: item.agentColor, flexShrink: 0, marginTop: 2,
                          }}>
                            {item.icon || typeStyle.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: item.agentColor }}>{item.agent}</span>
                              <span style={{
                                display: 'inline-flex', padding: '1px 6px', borderRadius: 3,
                                fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                background: typeStyle.bg, color: typeStyle.color,
                              }}>
                                {item.type}
                              </span>
                              {/* Status badge */}
                              {item.status && (
                                <span style={{
                                  display: 'inline-flex', padding: '1px 6px', borderRadius: 3,
                                  fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                                  background: statusStyle.bg, color: statusStyle.color,
                                }}>
                                  {statusStyle.label}
                                </span>
                              )}
                              {item.priority && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 3,
                                  padding: '1px 6px', borderRadius: 3,
                                  fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                                  textTransform: 'uppercase',
                                  background: `${PRIORITY_COLORS[item.priority]}15`,
                                  color: PRIORITY_COLORS[item.priority],
                                }}>
                                  {item.priority === 'high' ? '●' : '○'} {item.priority}
                                </span>
                              )}
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke, marginLeft: 'auto' }}>{item.timestamp}</span>
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 3, lineHeight: 1.3 }}>{item.title}</div>
                            <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.6 }}>{item.summary}</div>

                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                              {item.tags.map(t => (
                                <span key={t} style={{
                                  padding: '1px 6px', borderRadius: 3, fontSize: 9,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  background: t === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
                                  color: t === 'error' ? brand.error : brand.amber,
                                }}>
                                  {t}
                                </span>
                              ))}
                            </div>

                            {item.details && item.details.length > 0 && isItemOpen && (
                              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${brand.border}` }}>
                                {item.details.map((d, di) => (
                                  <div key={di} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                    padding: '4px 0', fontSize: 12, color: brand.silver, lineHeight: 1.5,
                                  }}>
                                    <span style={{ color: d.startsWith('✅') ? brand.success : d.startsWith('❌') || d.startsWith('Error') ? brand.error : brand.amber, fontSize: 8, marginTop: 5, flexShrink: 0 }}>
                                      {d.startsWith('✅') || d.startsWith('❌') ? '' : '▸'}
                                    </span>
                                    <span>{d}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.details && item.details.length > 0 && !isItemOpen && (
                              <div style={{ fontSize: 10, color: brand.smoke, marginTop: 6, fontStyle: 'italic' }}>
                                Click to expand {item.details.length} details
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Auto-refresh indicator */}
        <div style={{
          textAlign: 'center', marginTop: '16px', fontSize: '11px',
          color: brand.smoke, fontFamily: "'JetBrains Mono', monospace",
        }}>
          Auto-refreshes every hour · Data from cron system + GitHub API
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
