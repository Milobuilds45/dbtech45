'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

type Status = 'done' | 'pending' | 'failed';

interface AgentAction {
  id: string;
  agent: string;
  action: string;
  detail: string;
  timestamp: string; // ISO string
  status: Status;
  category: string;
}

const NOW = new Date('2026-03-15T14:22:00');
function ago(ms: number) {
  return new Date(NOW.getTime() - ms).toISOString();
}

const SEED_ACTIONS: AgentAction[] = [
  { id: 'a01', agent: 'Milo', action: 'Deployed site to Vercel', detail: 'feat: Ghost Trades, Earnings Whisper Wall, Flow Radar — 3 new trading features', timestamp: ago(8 * 60000), status: 'done', category: 'deploy' },
  { id: 'a02', agent: 'Paula', action: 'Brand spec updated', detail: 'Revised amber palette tokens in brand.ts — added amberLight, amberDark variants', timestamp: ago(22 * 60000), status: 'done', category: 'design' },
  { id: 'a03', agent: 'Anders', action: 'Market brief delivered', detail: 'Commodity Radar seed prices updated: Eggs +23.1%, Diesel +4.0% vs prior week', timestamp: ago(35 * 60000), status: 'done', category: 'research' },
  { id: 'a04', agent: 'Bobby', action: 'SEO audit — dbtech45.com', detail: 'Scanned 48 pages. Found 3 missing meta descriptions. Filed fix tickets #88, #89, #90.', timestamp: ago(58 * 60000), status: 'done', category: 'audit' },
  { id: 'a05', agent: 'Wendy', action: 'Newsletter draft generated', detail: '"Why Egg Prices Are Wrecking NH Restaurant Margins" — 620 words, 3 subject lines ready', timestamp: ago(72 * 60000), status: 'done', category: 'content' },
  { id: 'a06', agent: 'Dax', action: 'GitHub commit pushed', detail: 'Add restaurant tools: Menu Autopilot, Slow Night SOS, Competitor Radar — 847 lines', timestamp: ago(90 * 60000), status: 'done', category: 'dev' },
  { id: 'a07', agent: 'Tony', action: 'Competitor menu scraped', detail: 'Pulled current pricing from 4 Nashua competitors. Uploaded to /os/competitor-radar.', timestamp: ago(2.5 * 3600000), status: 'done', category: 'research' },
  { id: 'a08', agent: 'Remy', action: 'Inventory cost analysis', detail: 'Cross-referenced Sysco invoice vs commodity index. Found $312 savings opportunity in canola oil timing.', timestamp: ago(3.2 * 3600000), status: 'done', category: 'finance' },
  { id: 'a09', agent: 'Dwight', action: 'Security scan running', detail: 'Scanning 12 API routes for injection vulnerabilities. ETA 4 min.', timestamp: ago(3 * 60000), status: 'pending', category: 'security' },
  { id: 'a10', agent: 'Milo', action: 'Build: commodity-radar page', detail: 'Scaffolded /os/commodity-radar — static seed data + USDA AMS integration stub', timestamp: ago(4 * 60000), status: 'done', category: 'dev' },
  { id: 'a11', agent: 'Anders', action: 'NH weather alert check', detail: 'Queried api.weather.gov/alerts — 0 active alerts for NH as of 14:22 ET', timestamp: ago(18 * 60000), status: 'done', category: 'research' },
  { id: 'a12', agent: 'Bobby', action: 'Vercel deployment verify', detail: 'Smoke-tested 6 new /os routes post-deploy. All returning 200 OK.', timestamp: ago(10 * 60000), status: 'done', category: 'deploy' },
  { id: 'a13', agent: 'Paula', action: 'Image generation — market infographic', detail: 'Generated 3 beef price trend images via Gemini Imagen. Saved to generated-images/', timestamp: ago(47 * 60000), status: 'done', category: 'design' },
  { id: 'a14', agent: 'Wendy', action: 'Social media schedule', detail: 'Queued 5 posts for Meet the Feed platform — Mon–Fri, 9AM ET auto-publish', timestamp: ago(85 * 60000), status: 'done', category: 'content' },
  { id: 'a15', agent: 'Dax', action: 'API rate limit breach', detail: 'USDA AMS endpoint returned 429 on batch scrape. Backoff retry failed. Manual check needed.', timestamp: ago(5.1 * 3600000), status: 'failed', category: 'dev' },
];

const AGENTS = ['Milo', 'Paula', 'Anders', 'Bobby', 'Wendy', 'Dax', 'Tony', 'Remy', 'Dwight'];

const STATUS_CONFIG: Record<Status, { symbol: string; color: string; label: string }> = {
  done: { symbol: '✓', color: brand.success, label: 'DONE' },
  pending: { symbol: '⏳', color: brand.warning, label: 'PENDING' },
  failed: { symbol: '✗', color: brand.error, label: 'FAILED' },
};

const CATEGORY_COLORS: Record<string, string> = {
  deploy: brand.info,
  dev: brand.amber,
  design: '#A78BFA',
  research: brand.success,
  content: '#34D399',
  audit: brand.warning,
  finance: '#F472B6',
  security: brand.error,
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function timeAgo(iso: string) {
  const diff = NOW.getTime() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  return d.toDateString() === NOW.toDateString();
}

type FilterTab = 'ALL' | 'TODAY' | string; // string = agent name

export default function AgentAuditLogPage() {
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = SEED_ACTIONS.filter(a => {
    const tabMatch =
      filter === 'ALL' ? true :
      filter === 'TODAY' ? isToday(a.timestamp) :
      a.agent === filter;
    const statusMatch = statusFilter === 'ALL' ? true : a.status === statusFilter;
    return tabMatch && statusMatch;
  });

  const totalDone = SEED_ACTIONS.filter(a => a.status === 'done').length;
  const totalPending = SEED_ACTIONS.filter(a => a.status === 'pending').length;
  const totalFailed = SEED_ACTIONS.filter(a => a.status === 'failed').length;

  const TABS: FilterTab[] = ['ALL', 'TODAY', ...AGENTS];

  return (
    <div style={{ ...styles.page, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/os" style={{ ...styles.backLink, fontFamily: "'Inter', sans-serif" }}>← Back to OS</a>
          <div style={{ marginTop: '1rem' }}>
            <h1 style={{ ...styles.h1, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>Agent Audit Log</h1>
            <p style={{ ...styles.subtitle, fontFamily: "'Inter', sans-serif" }}>
              Live proof-of-work — DBTech AI agent team activity feed
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Tasks', value: SEED_ACTIONS.length, color: brand.amber },
            { label: 'Completed', value: totalDone, color: brand.success },
            { label: 'Pending', value: totalPending, color: brand.warning },
            { label: 'Failed', value: totalFailed, color: brand.error },
            { label: 'Agents Active', value: AGENTS.length, color: brand.info },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, padding: '0.85rem 1.25rem', textAlign: 'center', flex: 1, minWidth: '120px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs — agents */}
        <div style={{ marginBottom: '0.75rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.25rem', minWidth: 'max-content' }}>
            {TABS.map(tab => {
              const isAgent = AGENTS.includes(tab);
              const active = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    border: `1px solid ${active ? brand.amber : brand.border}`,
                    background: active ? brand.amber : 'transparent',
                    color: active ? brand.void : (isAgent ? brand.silver : brand.smoke),
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.04em',
                    transition: 'all 0.2s',
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {(['ALL', 'done', 'pending', 'failed'] as const).map(s => {
            const active = statusFilter === s;
            const cfg = s !== 'ALL' ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '12px',
                  border: `1px solid ${active ? (cfg?.color || brand.amber) : brand.border}`,
                  background: active ? `${cfg?.color || brand.amber}18` : 'transparent',
                  color: active ? (cfg?.color || brand.amber) : brand.smoke,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                }}
              >
                {s === 'ALL' ? 'All Status' : `${cfg?.symbol} ${cfg?.label}`}
              </button>
            );
          })}
          <span style={{ fontSize: '11px', color: brand.smoke, alignSelf: 'center', marginLeft: 'auto', fontFamily: "'Inter', sans-serif" }}>
            {filtered.length} of {SEED_ACTIONS.length} entries
          </span>
        </div>

        {/* Terminal-style log feed */}
        <div style={{
          backgroundColor: '#0A0A0A',
          border: `1px solid ${brand.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Terminal title bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: brand.graphite,
            borderBottom: `1px solid ${brand.border}`,
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: brand.error }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: brand.warning }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: brand.success }} />
            <span style={{ fontSize: '11px', color: brand.smoke, marginLeft: '0.5rem', fontFamily: "'JetBrains Mono', monospace" }}>
              dbtech45-agents :: audit-log :: {new Date(NOW).toISOString().slice(0, 10)}
            </span>
            <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: brand.success, boxShadow: `0 0 6px ${brand.success}` }} />
            <span style={{ fontSize: '10px', color: brand.success }}>LIVE</span>
          </div>

          {/* Log entries */}
          <div style={{ padding: '0.5rem 0' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: brand.smoke, fontSize: '13px' }}>
                No entries match current filters
              </div>
            ) : (
              filtered.map((entry, idx) => {
                const cfg = STATUS_CONFIG[entry.status];
                const catColor = CATEGORY_COLORS[entry.category] || brand.silver;
                const isOpen = expanded === entry.id;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderBottom: idx < filtered.length - 1 ? `1px solid ${brand.border}33` : 'none',
                      cursor: 'pointer',
                      background: isOpen ? brand.graphite : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Status symbol */}
                      <span style={{ color: cfg.color, fontSize: '13px', minWidth: '14px', fontWeight: 900, lineHeight: '20px' }}>
                        {cfg.symbol}
                      </span>

                      {/* Timestamp */}
                      <span style={{ fontSize: '11px', color: brand.smoke, whiteSpace: 'nowrap', lineHeight: '20px', minWidth: '155px' }}>
                        {formatTimestamp(entry.timestamp)}
                      </span>

                      {/* Agent badge */}
                      <span style={{
                        fontSize: '11px',
                        padding: '1px 7px',
                        borderRadius: '8px',
                        background: `${brand.amber}18`,
                        color: brand.amber,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        lineHeight: '18px',
                      }}>
                        {entry.agent.toUpperCase()}
                      </span>

                      {/* Category badge */}
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: `${catColor}18`,
                        color: catColor,
                        fontWeight: 600,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        lineHeight: '18px',
                      }}>
                        {entry.category}
                      </span>

                      {/* Action */}
                      <span style={{ fontSize: '13px', color: brand.white, flex: 1, lineHeight: '20px', minWidth: '180px' }}>
                        {entry.action}
                      </span>

                      {/* Time ago */}
                      <span style={{ fontSize: '10px', color: brand.smoke, whiteSpace: 'nowrap', lineHeight: '20px' }}>
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{
                        marginTop: '0.5rem',
                        marginLeft: '1.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: brand.carbon,
                        border: `1px solid ${brand.border}`,
                        fontSize: '12px',
                        color: brand.silver,
                        lineHeight: '1.5',
                      }}>
                        <span style={{ color: brand.smoke }}>detail: </span>{entry.detail}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Terminal footer */}
          <div style={{
            padding: '0.6rem 1.25rem',
            background: brand.graphite,
            borderTop: `1px solid ${brand.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '10px', color: brand.smoke }}>
              $ agent-log --watch --format=compact
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: brand.success }} />
              <span style={{ fontSize: '10px', color: brand.smoke }}>9 agents | {totalDone} tasks completed | refreshed {new Date(NOW).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '11px', color: brand.smoke, fontFamily: "'Inter', sans-serif" }}>
          Click any entry to expand detail. Filter by agent tab or status to narrow the feed.
        </div>

      </div>
    </div>
  );
}
