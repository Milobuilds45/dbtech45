'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────
interface AgentStatus {
  name: string; role: string; status: 'active' | 'idle' | 'offline';
  lastSeen: string; tasksToday: number; health: 'healthy' | 'warning' | 'critical';
  currentTask?: string; sessionStart?: string;
}
interface ActivityEntry {
  id: string; agent: string; action: string;
  timestamp: string; type: 'task' | 'cron' | 'system' | 'message';
}

// ─── Brand colors ────────────────────────────────────────────────────────
const B = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
  border: '#222222',
};

const AC: Record<string, string> = {
  Milo: '#A855F7', Anders: '#F97316', Paula: '#EC4899', Bobby: '#22C55E',
  Dwight: '#6366F1', Tony: '#EAB308', Dax: '#06B6D4', Remy: '#EF4444',
  Wendy: '#8B5CF6', System: '#737373',
};

// ─── Helpers ─────────────────────────────────────────────────────────────
function sc(s: string) {
  if (['online', 'active', 'success', 'healthy'].includes(s)) return B.success;
  if (['warning', 'idle', 'pending'].includes(s)) return B.warning;
  if (['offline', 'failure', 'critical', 'timeout'].includes(s)) return B.error;
  return B.smoke;
}
function sd(s: string) { return ['warning', 'idle', 'pending'].includes(s) ? '\u25D0' : '\u25CF'; }
function rt(ts: string | null): string {
  if (!ts) return 'Never';
  const d = Date.now() - new Date(ts).getTime();
  if (d < 0) {
    const m = Math.floor(Math.abs(d) / 60000);
    const h = Math.floor(m / 60);
    return h > 0 ? 'in ' + h + 'h' : 'in ' + m + 'm';
  }
  const m = Math.floor(d / 60000);
  const h = Math.floor(m / 60);
  const dy = Math.floor(h / 24);
  if (dy > 0) return dy + 'd ago';
  if (h > 0) return h + 'h ago';
  if (m > 0) return m + 'm ago';
  return 'Just now';
}
function fd(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? h + 'h ' + (m % 60) + 'm' : m + 'm';
}

function Av({ name, size = 32 }: { name: string; size?: number }) {
  const color = AC[name] || B.smoke;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: B.void, border: '2px solid ' + color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color, flexShrink: 0,
    }}>
      {name[0]}
    </div>
  );
}

// ─── Mock data generators ────────────────────────────────────────────────
function generateAgents(): AgentStatus[] {
  const now = new Date();
  const n = now.getTime();
  return [
    { name: 'Milo', role: 'Chief of Staff', status: 'active', lastSeen: now.toISOString(), tasksToday: 3, health: 'healthy', currentTask: 'Coordinating nightly builds', sessionStart: new Date(n - 2 * 3600000).toISOString() },
    { name: 'Anders', role: 'Full Stack Architect', status: 'active', lastSeen: now.toISOString(), tasksToday: 1, health: 'healthy', currentTask: 'Building Mission Control expansion', sessionStart: new Date(n - 45 * 60000).toISOString() },
    { name: 'Bobby', role: 'Trading Advisor', status: 'offline', lastSeen: new Date(n - 8 * 3600000).toISOString(), tasksToday: 2, health: 'warning' },
    { name: 'Paula', role: 'Creative Director', status: 'idle', lastSeen: new Date(n - 3 * 3600000).toISOString(), tasksToday: 1, health: 'healthy', sessionStart: new Date(n - 5 * 3600000).toISOString() },
    { name: 'Dwight', role: 'Weather & News', status: 'idle', lastSeen: new Date(n - 1 * 3600000).toISOString(), tasksToday: 1, health: 'healthy', sessionStart: new Date(n - 7 * 3600000).toISOString() },
    { name: 'Tony', role: 'Tech Guru', status: 'offline', lastSeen: new Date(n - 12 * 3600000).toISOString(), tasksToday: 0, health: 'healthy' },
    { name: 'Dax', role: 'Data Analyst', status: 'idle', lastSeen: new Date(n - 4 * 3600000).toISOString(), tasksToday: 0, health: 'healthy', sessionStart: new Date(n - 6 * 3600000).toISOString() },
    { name: 'Remy', role: 'Chef & Lifestyle', status: 'offline', lastSeen: new Date(n - 24 * 3600000).toISOString(), tasksToday: 0, health: 'warning' },
    { name: 'Wendy', role: 'Wellness Coach', status: 'idle', lastSeen: new Date(n - 2 * 3600000).toISOString(), tasksToday: 0, health: 'healthy', sessionStart: new Date(n - 3 * 3600000).toISOString() },
  ];
}

function generateActivityLog(): ActivityEntry[] {
  const n = Date.now();
  return [
    { id: 'l1', agent: 'Milo', action: 'Kicked off nightly build pipeline', timestamp: new Date(n - 2 * 60000).toISOString(), type: 'cron' },
    { id: 'l2', agent: 'Anders', action: 'Committed Mission Control expansion', timestamp: new Date(n - 5 * 60000).toISOString(), type: 'task' },
    { id: 'l3', agent: 'Dwight', action: 'Delivered morning weather brief', timestamp: new Date(n - 60 * 60000).toISOString(), type: 'cron' },
    { id: 'l4', agent: 'Bobby', action: 'Sent BTC morning analysis', timestamp: new Date(n - 5 * 3600000).toISOString(), type: 'cron' },
    { id: 'l5', agent: 'Paula', action: 'Reviewed thumbnail concepts', timestamp: new Date(n - 3 * 3600000).toISOString(), type: 'task' },
    { id: 'l6', agent: 'Milo', action: 'Compacted memory files, pushed to GitHub', timestamp: new Date(n - 4 * 3600000).toISOString(), type: 'system' },
    { id: 'l7', agent: 'Wendy', action: 'Sent midday wellness reminder', timestamp: new Date(n - 2 * 3600000).toISOString(), type: 'message' },
    { id: 'l8', agent: 'Dax', action: 'Generated analytics report', timestamp: new Date(n - 4 * 3600000).toISOString(), type: 'task' },
    { id: 'l9', agent: 'System', action: 'Gateway auto-start failed', timestamp: new Date(n - 8 * 3600000).toISOString(), type: 'system' },
    { id: 'l10', agent: 'Milo', action: 'Heartbeat check \u2014 all agents reported', timestamp: new Date(n - 30 * 60000).toISOString(), type: 'system' },
  ];
}

// ═══ MAIN COMPONENT ═══
export default function ActiveSessionsView() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [alog, setAlog] = useState<ActivityEntry[]>([]);

  const refresh = useCallback(() => {
    setAgents(generateAgents());
    setAlog(generateActivityLog());
  }, []);

  useEffect(() => { refresh(); const i = setInterval(refresh, 30000); return () => clearInterval(i); }, [refresh]);

  const crd: React.CSSProperties = { background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '20px' };

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Agent Session Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {agents.map(a => (
          <div key={a.name} style={{ ...crd, borderLeft: '3px solid ' + (AC[a.name] || B.smoke) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Av name={a.name} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{a.name}</span>
                  <span style={{ color: sc(a.status), fontSize: '11px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{sd(a.status)} {a.status.toUpperCase()}</span>
                </div>
                <div style={{ color: B.smoke, fontSize: '12px' }}>{a.role}</div>
              </div>
            </div>
            {a.currentTask && <div style={{ fontSize: '13px', color: B.silver, marginBottom: '8px', padding: '8px', background: B.void, borderRadius: '6px', border: '1px solid ' + B.border }}>{a.currentTask}</div>}
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: B.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
              <span>Last: {rt(a.lastSeen)}</span>
              {a.sessionStart && <span>Session: {fd(a.sessionStart)}</span>}
              <span>{a.tasksToday} tasks today</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      <div style={crd}>
        <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', marginBottom: '16px' }}>Activity Log</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {alog.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid ' + B.border }}>
              <Av name={e.agent} size={24} />
              <div style={{ flex: 1 }}>
                <span style={{ color: AC[e.agent] || B.smoke, fontWeight: 600, fontSize: '13px' }}>{e.agent}</span>
                <span style={{ color: B.silver, fontSize: '13px' }}> {e.action}</span>
              </div>
              <span style={{ color: B.smoke, fontSize: '11px', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>{rt(e.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
