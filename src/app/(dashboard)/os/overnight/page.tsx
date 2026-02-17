'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from "@/lib/brand";

/* ── Types ─────────────────────────────────────────────────────────── */

interface OvernightItem {
  id?: string;
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
  status?: 'success' | 'error' | 'pending' | 'approved' | 'rejected';
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

/* ── Agent colors ──────────────────────────────────────────────────── */

const AGENT_COLORS: Record<string, string> = {
  Milo: '#A855F7', Anders: '#F97316', Paula: '#EC4899', Bobby: '#22C55E',
  Dwight: '#6366F1', Tony: '#EAB308', Dax: '#06B6D4', Remy: '#EF4444',
  Wendy: '#8B5CF6', Derek: '#F59E0B',
};

const AGENT_NAMES = Object.keys(AGENT_COLORS);

/* ── Type styling ──────────────────────────────────────────────────── */

const TYPE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  analysis: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', icon: '◈' },
  idea:     { bg: 'rgba(168,85,247,0.1)', color: '#A855F7', icon: '✦' },
  research: { bg: 'rgba(6,182,212,0.1)',  color: '#06B6D4', icon: '⌕' },
  alert:    { bg: 'rgba(239,68,68,0.1)',  color: '#22C55E', icon: '⚡' },
  build:    { bg: 'rgba(16,185,129,0.1)', color: '#10B981', icon: '▲' },
  planning: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', icon: '◈' },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: brand.error,
  medium: brand.warning,
  low: brand.smoke,
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  success:  { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'OK' },
  error:    { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', label: 'ERR' },
  pending:  { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'PENDING' },
  approved: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'APPROVED' },
  rejected: { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', label: 'REJECTED' },
};

/* ── Component ─────────────────────────────────────────────────────── */

export default function OvernightCommandCenter() {
  const [data, setData] = useState<OvernightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [expandedBrief, setExpandedBrief] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<{ agent: string; title: string; summary: string; priority: 'high' | 'medium' | 'low' }>({ agent: 'Milo', title: '', summary: '', priority: 'medium' });
  const [addingTask, setAddingTask] = useState(false);

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
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /* ── Planning actions ─────────────────────────────────────────── */

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/overnight', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const approveAll = async (items: OvernightItem[]) => {
    for (const item of items) {
      if (item.id && item.status === 'pending') {
        await updateStatus(item.id, 'approved');
      }
    }
  };

  const addCustomTask = async () => {
    if (!newTask.title.trim()) return;
    setAddingTask(true);
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
      const res = await fetch('/api/overnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          agent: newTask.agent,
          agent_color: AGENT_COLORS[newTask.agent] || '#737373',
          type: 'planning',
          title: newTask.title,
          summary: newTask.summary || newTask.title,
          details: [],
          tags: ['planning', 'overnight', 'custom'],
          priority: newTask.priority,
          icon: '◈',
          status: 'pending',
          source: 'manual',
        }),
      });
      if (res.ok) {
        setNewTask({ agent: 'Milo', title: '', summary: '', priority: 'medium' });
        setShowAddTask(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Add task error:', err);
    } finally {
      setAddingTask(false);
    }
  };

  /* ── Derived data ─────────────────────────────────────────────── */

  const briefs = data?.briefs || [];
  const agents = Array.from(new Set(briefs.flatMap(b => b.items.map(i => i.agent))));
  const types = Array.from(new Set(briefs.flatMap(b => b.items.map(i => i.type))));

  // Extract planning items (type=planning, status=pending/approved/rejected) from today's data
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const planningItems = briefs
    .flatMap(b => b.items)
    .filter(i => i.type === 'planning' && (i.status === 'pending' || i.status === 'approved' || i.status === 'rejected'));

  // Filter results briefs: exclude planning items from the results view
  const resultsBriefs = briefs.map(b => ({
    ...b,
    items: b.items.filter(i => i.type !== 'planning'),
  })).filter(b => b.items.length > 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ── Header ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={styles.h1}>Overnight Command Center</h1>
            <p style={styles.subtitle}>
              Planning + Execution + Results
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
              {data?.stats?.totalBriefs || 0} nights
            </span>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────── */}
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

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── TONIGHT'S PLAN SECTION ──────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div style={{
          ...styles.card,
          marginBottom: '24px',
          border: `1px solid rgba(245,158,11,0.3)`,
          background: `linear-gradient(135deg, rgba(245,158,11,0.03), ${brand.carbon})`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                🎯
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: brand.amber }}>Tonight&apos;s Plan</div>
                <div style={{ fontSize: 11, color: brand.smoke }}>{today} · {planningItems.filter(i => i.status === 'pending').length} pending tasks</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {planningItems.filter(i => i.status === 'pending').length > 0 && (
                <button
                  onClick={() => approveAll(planningItems)}
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: `1px solid rgba(16,185,129,0.3)`,
                    borderRadius: 6, padding: '4px 12px',
                    color: '#10B981', fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  ✓ Approve All
                </button>
              )}
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: `1px solid rgba(245,158,11,0.3)`,
                  borderRadius: 6, padding: '4px 12px',
                  color: brand.amber, fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                + Add Custom Task
              </button>
            </div>
          </div>

          {/* Add Custom Task Form */}
          {showAddTask && (
            <div style={{
              background: brand.graphite, borderRadius: 8,
              padding: '16px', marginBottom: '16px',
              border: `1px solid ${brand.border}`,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Agent</label>
                  <select
                    value={newTask.agent}
                    onChange={e => setNewTask(prev => ({ ...prev, agent: e.target.value }))}
                    style={{ width: '100%', background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '8px', color: brand.white, fontSize: 13 }}
                  >
                    {AGENT_NAMES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                    style={{ width: '100%', background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '8px', color: brand.white, fontSize: 13 }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Task Title</label>
                <input
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Analyze overnight market data..."
                  style={{ ...styles.input, fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Description (optional)</label>
                <input
                  value={newTask.summary}
                  onChange={e => setNewTask(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="What should the agent do?"
                  style={{ ...styles.input, fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddTask(false)}
                  style={{
                    background: 'transparent', border: `1px solid ${brand.border}`,
                    borderRadius: 6, padding: '6px 16px', color: brand.smoke,
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomTask}
                  disabled={addingTask || !newTask.title.trim()}
                  style={{
                    background: brand.amber, border: 'none',
                    borderRadius: 6, padding: '6px 16px', color: brand.void,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    opacity: addingTask || !newTask.title.trim() ? 0.5 : 1,
                  }}
                >
                  {addingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </div>
          )}

          {/* Planning Items */}
          {planningItems.length === 0 ? (
            <div style={{
              padding: '24px', textAlign: 'center', color: brand.smoke,
              fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              borderRadius: 8, background: 'rgba(0,0,0,0.2)',
            }}>
              No planned tasks for tonight yet. Tasks appear here from the noon planning cron or add one manually.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {planningItems.map((item, idx) => {
                const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.planning;
                const statusStyle = STATUS_STYLES[item.status || 'pending'];
                const isPending = item.status === 'pending';
                const isUpdating = updatingId === item.id;

                return (
                  <div key={item.id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 8,
                    background: item.status === 'approved' ? 'rgba(16,185,129,0.05)' :
                                item.status === 'rejected' ? 'rgba(239,68,68,0.05)' :
                                'rgba(0,0,0,0.2)',
                    border: `1px solid ${item.status === 'approved' ? 'rgba(16,185,129,0.2)' :
                                          item.status === 'rejected' ? 'rgba(239,68,68,0.2)' :
                                          brand.border}`,
                    transition: 'all 0.15s',
                  }}>
                    {/* Agent icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${item.agentColor}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: item.agentColor, fontWeight: 700,
                    }}>
                      {item.icon || typeStyle.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: item.agentColor }}>{item.agent}</span>
                        {item.priority && (
                          <span style={{
                            fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                            textTransform: 'uppercase', padding: '1px 6px', borderRadius: 3,
                            background: `${PRIORITY_COLORS[item.priority]}15`,
                            color: PRIORITY_COLORS[item.priority],
                          }}>
                            {item.priority === 'high' ? '●' : '○'} {item.priority}
                          </span>
                        )}
                        <span style={{
                          fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                          padding: '1px 6px', borderRadius: 3,
                          background: statusStyle.bg, color: statusStyle.color,
                        }}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: brand.white, lineHeight: 1.3 }}>{item.title}</div>
                      {item.summary && item.summary !== item.title && (
                        <div style={{ fontSize: 11, color: brand.silver, marginTop: 2, lineHeight: 1.5 }}>{item.summary}</div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isPending && item.id && (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => updateStatus(item.id!, 'approved')}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(16,185,129,0.15)', border: `1px solid rgba(16,185,129,0.3)`,
                            borderRadius: 6, padding: '5px 12px', color: '#10B981',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace",
                            opacity: isUpdating ? 0.5 : 1,
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id!, 'rejected')}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.2)`,
                            borderRadius: 6, padding: '5px 12px', color: '#EF4444',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace",
                            opacity: isUpdating ? 0.5 : 1,
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── RESULTS SECTION (existing UI preserved) ─────────────── */}
        {/* ══════════════════════════════════════════════════════════ */}

        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '16px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(168,85,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            🌙
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#A855F7' }}>Overnight Results</div>
            <div style={{ fontSize: 11, color: brand.smoke }}>Nightly intelligence briefs · Agent results · Live status</div>
          </div>
        </div>

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
            {types.filter(t => t !== 'planning').map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
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
        {!loading && resultsBriefs.length === 0 && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '48px 24px', background: brand.carbon }}>
            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>
              No overnight session results available yet. Overnight crons run at 2:00 AM EST.
            </div>
          </div>
        )}

        {/* Briefs */}
        {resultsBriefs.map((brief, bi) => {
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