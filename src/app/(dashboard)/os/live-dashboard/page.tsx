'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { brand, styles } from '@/lib/brand';

// ── Agent accent colors ────────────────────────────────────────────────────────
const AC: Record<string, string> = {
  Milo:   '#A855F7',
  Anders: '#F97316',
  Paula:  '#EC4899',
  Bobby:  '#22C55E',
  Ted:    '#EAB308',
  Wendy:  '#8B5CF6',
  Remy:   '#EF4444',
  Dwight: '#6366F1',
  Dax:    '#06B6D4',
  Jim:    '#737373',
};

type AgentStatus = 'active' | 'idle' | 'offline';
type EventType   = 'deploy' | 'message' | 'task' | 'system';

interface Agent {
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string;
  tokensToday: number;
  tokenLimit: number;
  lastMessage: string;
  lastActive: string;
  emoji: string;
}

interface FeedEvent {
  id: string;
  agent: string;
  action: string;
  ts: number;
  type: EventType;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const NOW = Date.now();
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const min = (n: number) => n * 60 * 1000;
const hr  = (n: number) => n * 3600 * 1000;

const AGENTS: Agent[] = [
  {
    name: 'Milo', role: 'Systems & Memory', status: 'active',
    currentTask: 'Syncing memory files across all agents',
    tokensToday: 48200, tokenLimit: 100000,
    lastMessage: 'Memory snapshot saved. 12 entries updated.',
    lastActive: ago(min(2)), emoji: '🧠',
  },
  {
    name: 'Anders', role: 'Full Stack Architect', status: 'active',
    currentTask: 'Deploying live-dashboard to Vercel',
    tokensToday: 72400, tokenLimit: 100000,
    lastMessage: 'Build successful. Deploy triggered.',
    lastActive: ago(45 * 1000), emoji: '⚡',
  },
  {
    name: 'Paula', role: 'Creative Director', status: 'active',
    currentTask: 'Generating brand kit assets for MenuSparks',
    tokensToday: 35800, tokenLimit: 100000,
    lastMessage: 'Logo variants exported. 4 color schemes ready.',
    lastActive: ago(min(5)), emoji: '🎨',
  },
  {
    name: 'Bobby', role: 'Trading Advisor', status: 'active',
    currentTask: 'Scanning ES futures for breakout setup',
    tokensToday: 29100, tokenLimit: 100000,
    lastMessage: 'RSI divergence detected on 15m chart. Watch $4820.',
    lastActive: ago(min(1) + 30000), emoji: '📈',
  },
  {
    name: 'Dax', role: 'Data Analyst', status: 'active',
    currentTask: "Running Bobola's weekly revenue report",
    tokensToday: 18600, tokenLimit: 100000,
    lastMessage: 'Tuesday down 12% vs last week. Investigating.',
    lastActive: ago(min(3)), emoji: '📊',
  },
  {
    name: 'Ted', role: 'President & COO', status: 'idle',
    currentTask: 'Standing by',
    tokensToday: 8400, tokenLimit: 100000,
    lastMessage: 'Weekly ops review scheduled for Friday.',
    lastActive: ago(min(22)), emoji: '🏛️',
  },
  {
    name: 'Wendy', role: 'Personal Assistant', status: 'idle',
    currentTask: 'Standing by',
    tokensToday: 12700, tokenLimit: 100000,
    lastMessage: 'Calendar synced. 3 tasks due today.',
    lastActive: ago(min(18)), emoji: '💼',
  },
  {
    name: 'Remy', role: 'Restaurant Marketing', status: 'idle',
    currentTask: 'Standing by',
    tokensToday: 9200, tokenLimit: 100000,
    lastMessage: 'Instagram post scheduled for 6 PM.',
    lastActive: ago(min(35)), emoji: '🍝',
  },
  {
    name: 'Dwight', role: 'Weather & News', status: 'offline',
    currentTask: 'Offline',
    tokensToday: 0, tokenLimit: 100000,
    lastMessage: 'Morning brief delivered at 7:02 AM.',
    lastActive: ago(hr(4)), emoji: '📰',
  },
  {
    name: 'Jim', role: 'Compliance & Risk', status: 'offline',
    currentTask: 'Offline',
    tokensToday: 0, tokenLimit: 100000,
    lastMessage: 'Risk assessment complete — all positions within limits.',
    lastActive: ago(hr(6)), emoji: '⚖️',
  },
];

const FEED: FeedEvent[] = [
  { id: '1',  agent: 'Anders', action: 'deployed dbtech45 to Vercel',             ts: NOW - 45000,      type: 'deploy'  },
  { id: '2',  agent: 'Bobby',  action: 'flagged ES futures breakout at $4820',     ts: NOW - min(1.5),   type: 'task'    },
  { id: '3',  agent: 'Milo',   action: 'saved memory snapshot — 12 entries',       ts: NOW - min(2),     type: 'system'  },
  { id: '4',  agent: 'Dax',    action: "completed Bobola's revenue report",         ts: NOW - min(4),     type: 'task'    },
  { id: '5',  agent: 'Paula',  action: 'exported brand kit for MenuSparks',         ts: NOW - min(6),     type: 'task'    },
  { id: '6',  agent: 'Milo',   action: 'updated agent-configs.json with new routes',ts: NOW - min(10),    type: 'system'  },
  { id: '7',  agent: 'Wendy',  action: 'synced calendar — 3 tasks due today',       ts: NOW - min(18),    type: 'message' },
  { id: '8',  agent: 'Ted',    action: 'scheduled weekly ops review (Friday)',       ts: NOW - min(22),    type: 'system'  },
  { id: '9',  agent: 'Remy',   action: 'scheduled Instagram post for 6 PM',         ts: NOW - min(35),    type: 'message' },
  { id: '10', agent: 'Anders', action: 'created org chart with animated nodes',      ts: NOW - hr(1.5),    type: 'deploy'  },
  { id: '11', agent: 'Bobby',  action: 'sent morning trade briefing to Derek',       ts: NOW - hr(3),      type: 'message' },
  { id: '12', agent: 'Dwight', action: 'delivered morning brief at 7:02 AM',         ts: NOW - hr(4),      type: 'message' },
  { id: '13', agent: 'Jim',    action: 'completed risk assessment — all clear',       ts: NOW - hr(6),      type: 'task'    },
  { id: '14', agent: 'Milo',   action: 'orchestrated overnight agent sync',           ts: NOW - hr(8),      type: 'system'  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeSince(tsMs: number): string {
  const diff = Date.now() - tsMs;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

function statusColor(s: AgentStatus): string {
  return s === 'active' ? brand.success : s === 'idle' ? brand.warning : brand.smoke;
}

const TYPE_ICON: Record<EventType, string> = {
  deploy: '🚀', message: '💬', task: '✅', system: '⚙️',
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function PulseDot({ status }: { status: AgentStatus }) {
  const c = statusColor(status);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: c,
        animation: status === 'active' ? 'ld-ping 1.6s ease-in-out infinite' : 'none',
        opacity: 0.4,
      }} />
      <span style={{
        width: 10, height: 10, borderRadius: '50%', background: c,
        boxShadow: status === 'active' ? `0 0 6px ${c}` : 'none',
        display: 'inline-block',
      }} />
    </span>
  );
}

function TokenBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const c   = pct > 80 ? brand.error : pct > 55 ? brand.warning : brand.success;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: brand.smoke, marginBottom: '4px' }}>
        <span>{(used / 1000).toFixed(1)}k tokens today</span>
        <span style={{ color: c }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: '3px', background: brand.border, borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: '2px' }} />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LiveDashboardPage() {
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');
  const [tick, setTick]           = useState(0); // forces re-render for time updates

  useEffect(() => {
    const stored = localStorage.getItem('dbtech-color-mode');
    if (stored === 'cyber' || stored === 'void') setColorMode(stored);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Theme tokens
  const bg      = colorMode === 'cyber' ? '#020818' : brand.void;
  const bgCard  = colorMode === 'cyber' ? '#080f1e' : brand.carbon;
  const bgDeep  = colorMode === 'cyber' ? '#050c18' : brand.graphite;
  const border  = colorMode === 'cyber' ? '#1a3455' : brand.border;

  const activeCount  = AGENTS.filter(a => a.status === 'active').length;
  const idleCount    = AGENTS.filter(a => a.status === 'idle').length;
  const offlineCount = AGENTS.filter(a => a.status === 'offline').length;
  const totalTokens  = AGENTS.reduce((s, a) => s + a.tokensToday, 0);

  return (
    <div style={{ ...styles.page, backgroundColor: bg, padding: '24px 28px' }}>
      <style>{`
        @keyframes ld-ping {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.4); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
        @keyframes ld-blink {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.3; }
        }
        .ld-card {
          transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          cursor: pointer;
        }
        .ld-card:hover {
          border-color: ${brand.amber} !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(245,158,11,0.10);
        }
        .ld-feed-scroll::-webkit-scrollbar { width: 4px; }
        .ld-feed-scroll::-webkit-scrollbar-track { background: transparent; }
        .ld-feed-scroll::-webkit-scrollbar-thumb { background: ${border}; border-radius: 2px; }

        /* Responsive: stack sidebar below cards on small screens */
        @media (max-width: 1024px) {
          .ld-main-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .ld-agent-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important; }
          .ld-stats-bar  { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .ld-stats-bar  { grid-template-columns: 1fr 1fr !important; }
          .ld-agent-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* ── Back link ── */}
        <div style={{ marginBottom: '18px' }}>
          <Link href="/os" style={styles.backLink}>← Back to OS</Link>
        </div>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={styles.h1}>LIVE DASHBOARD</h1>
            <p style={{ ...styles.subtitle, marginBottom: 0, fontSize: '14px' }}>
              Real-time visibility into every agent, task, and token — right now.
            </p>
          </div>

          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: bgCard, border: `1px solid ${border}`,
            borderRadius: '8px', padding: '8px 14px',
          }}>
            <PulseDot status="active" />
            <span style={{ color: brand.success, fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>LIVE</span>
            <span style={{ color: brand.smoke, fontSize: '11px' }}>· refreshes every 30s</span>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="ld-stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Agents Online',    value: `${activeCount} / ${AGENTS.length}`, color: brand.success },
            { label: 'Active Sessions',  value: activeCount,                          color: brand.amber   },
            { label: 'Tasks Today',      value: 24,                                   color: brand.info    },
            { label: 'Tokens Burned',    value: `${(totalTokens / 1000).toFixed(1)}k`, color: brand.warning },
          ].map(s => (
            <div key={s.label} style={{
              background: bgCard, border: `1px solid ${border}`,
              borderRadius: '10px', padding: '14px 18px',
            }}>
              <div style={{ color: brand.smoke, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                {s.label}
              </div>
              <div style={{ color: s.color, fontSize: '1.7rem', fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main layout: agent grid + feed ── */}
        <div className="ld-main-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '20px', alignItems: 'start' }}>

          {/* Agent grid */}
          <div className="ld-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {AGENTS.map(agent => {
              const sc  = statusColor(agent.status);
              const acc = AC[agent.name] || brand.smoke;
              const offline = agent.status === 'offline';
              return (
                <div
                  key={agent.name}
                  className="ld-card"
                  style={{
                    background: bgCard,
                    border: `1px solid ${offline ? border : sc + '55'}`,
                    borderLeft: `3px solid ${offline ? border : sc}`,
                    borderRadius: '12px',
                    padding: '16px',
                    opacity: offline ? 0.5 : 1,
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `${acc}1a`, border: `2px solid ${acc}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
                    }}>
                      {agent.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: brand.white, fontWeight: 700, fontSize: '13px' }}>{agent.name}</span>
                        <PulseDot status={agent.status} />
                      </div>
                      <div style={{ color: brand.smoke, fontSize: '10px', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {agent.role}
                      </div>
                    </div>
                    {/* Status badge */}
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                      textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0,
                      background: `${sc}18`, color: sc, border: `1px solid ${sc}40`,
                    }}>
                      {agent.status}
                    </span>
                  </div>

                  {/* Current task */}
                  <div style={{
                    background: bgDeep, borderRadius: '6px', padding: '7px 9px',
                    marginBottom: '10px', border: `1px solid ${border}`,
                  }}>
                    <div style={{ fontSize: '9px', color: brand.smoke, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      Current Task
                    </div>
                    <div style={{ fontSize: '11px', color: offline ? brand.smoke : brand.silver, lineHeight: 1.45 }}>
                      {agent.currentTask}
                    </div>
                  </div>

                  {/* Token bar */}
                  <TokenBar used={agent.tokensToday} limit={agent.tokenLimit} />

                  {/* Divider + last message + time */}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${border}` }}>
                    <div style={{ fontSize: '10px', color: brand.smoke, fontStyle: 'italic', lineHeight: 1.4, marginBottom: '4px' }}>
                      "{agent.lastMessage.length > 65 ? agent.lastMessage.slice(0, 65) + '…' : agent.lastMessage}"
                    </div>
                    <div style={{ fontSize: '10px', color: brand.smoke, opacity: 0.55 }}>
                      {timeSince(new Date(agent.lastActive).getTime())}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity feed */}
          <div style={{
            background: bgCard, border: `1px solid ${border}`,
            borderRadius: '12px', overflow: 'hidden',
            position: 'sticky', top: '24px',
          }}>
            {/* Feed header */}
            <div style={{
              padding: '13px 16px', borderBottom: `1px solid ${border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: bgDeep,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: brand.amber, display: 'inline-block',
                  animation: 'ld-blink 1.8s ease-in-out infinite',
                }} />
                <span style={{ color: brand.amber, fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Live Activity
                </span>
              </div>
              <span style={{ color: brand.smoke, fontSize: '10px' }}>{FEED.length} events</span>
            </div>

            {/* Feed list */}
            <div className="ld-feed-scroll" style={{ maxHeight: '620px', overflowY: 'auto' }}>
              {FEED.map((ev, i) => {
                const acc = AC[ev.agent] || brand.smoke;
                return (
                  <div key={ev.id} style={{
                    padding: '10px 16px',
                    borderBottom: i < FEED.length - 1 ? `1px solid ${border}` : 'none',
                    display: 'flex', gap: '9px', alignItems: 'flex-start',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = bgDeep)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{TYPE_ICON[ev.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: acc, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: acc, fontWeight: 700, fontSize: '11px' }}>{ev.agent}</span>
                      </div>
                      <div style={{ color: brand.silver, fontSize: '11px', lineHeight: 1.4 }}>{ev.action}</div>
                      <div style={{ color: brand.smoke, fontSize: '9px', marginTop: '3px', opacity: 0.7 }}>{timeSince(ev.ts)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: '32px', paddingTop: '16px', borderTop: `1px solid ${border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <span style={{ color: brand.smoke, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>
            DBTECH45 OS · Mission Control V2
          </span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: brand.smoke }}>
            <span style={{ color: brand.success }}>● {activeCount} active</span>
            <span style={{ color: brand.warning }}>◐ {idleCount} idle</span>
            <span>○ {offlineCount} offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
