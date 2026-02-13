'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────
interface SystemStatus {
  gatewayStatus: 'online' | 'offline' | 'timeout' | 'unknown';
  lastHeartbeat: string | null;
  uptime: number;
  cronJobs: CronJob[];
  agents: AgentStatus[];
  alerts: Alert[];
}
interface CronJob {
  id: string; name: string; schedule: string; humanSchedule: string;
  lastRun: string | null; nextRun: string | null;
  status: 'success' | 'failure' | 'pending' | 'unknown';
  agent: string; duration?: string; description?: string;
}
interface AgentStatus {
  name: string; role: string; status: 'active' | 'idle' | 'offline';
  lastSeen: string; tasksToday: number; health: 'healthy' | 'warning' | 'critical';
  currentTask?: string; sessionStart?: string;
}
interface Alert {
  id: string; type: 'error' | 'warning' | 'info';
  message: string; timestamp: string; resolved: boolean;
}

// ─── Brand colors ────────────────────────────────────────────────────────
const B = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
  border: '#222222', darkRed: '#7F1D1D', darkGreen: '#064E3B',
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
function fu(s: number) { return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm'; }

// ─── Sub-components ──────────────────────────────────────────────────────
function Row({ l, v, c, bold }: { l: string; v: string; c?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
      <span style={{ color: B.smoke, fontFamily: "'JetBrains Mono', monospace" }}>{l}:</span>
      <span style={{ color: c || B.silver, fontWeight: bold ? 600 : 400, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
    </div>
  );
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

// ─── Data fetcher ────────────────────────────────────────────────────────
async function fetchOpsData(): Promise<SystemStatus> {
  try {
    const response = await fetch('/data/ops-status.json');
    const data = await response.json();
    
    // Map the JSON data to the existing state interfaces
    const mappedAgents: AgentStatus[] = data.agents.map((agent: any) => ({
      name: agent.name,
      role: agent.role,
      status: agent.status,
      lastSeen: new Date().toISOString(), // Use current time since we don't have lastSeen in JSON
      tasksToday: agent.tasksToday,
      health: agent.health,
      currentTask: undefined, // Not provided in JSON
      sessionStart: undefined // Not provided in JSON
    }));

    const mappedCrons: CronJob[] = data.crons.map((cron: any) => ({
      id: cron.id,
      name: cron.name,
      schedule: cron.schedule,
      humanSchedule: cron.humanSchedule,
      lastRun: cron.lastRun,
      nextRun: cron.nextRun,
      status: cron.lastStatus,
      agent: cron.agent,
      duration: cron.duration,
      description: cron.description
    }));

    return {
      gatewayStatus: data.system.gatewayStatus,
      lastHeartbeat: data.system.lastHeartbeat,
      uptime: data.system.uptime,
      cronJobs: mappedCrons,
      agents: mappedAgents,
      alerts: data.system.alerts
    };
  } catch (error) {
    console.error('Failed to fetch ops status:', error);
    // Fallback to empty state on error
    return { gatewayStatus: 'unknown', lastHeartbeat: null, uptime: 0, cronJobs: [], agents: [], alerts: [] };
  }
}

// ═══ MAIN COMPONENT ═══
export default function SystemHealthView() {
  const [loading, setLoading] = useState(true);
  const [sys, setSys] = useState<SystemStatus>({ gatewayStatus: 'unknown', lastHeartbeat: null, uptime: 0, cronJobs: [], agents: [], alerts: [] });
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/data/ops-status.json');
      const data = await response.json();
      const systemData = await fetchOpsData();
      setSys(systemData);
      setGeneratedAt(data.generatedAt);
    } catch (error) {
      console.error('Failed to refresh system data:', error);
      const fallbackData = await fetchOpsData();
      setSys(fallbackData);
      setGeneratedAt(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
    const i = setInterval(refresh, 30000);
    return () => clearInterval(i);
  }, [refresh]);

  const crd: React.CSSProperties = { background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '20px' };
  const unresolved = sys.alerts.filter(a => !a.resolved);

  if (loading) return (
    <div style={{ padding: '60px 30px', textAlign: 'center', color: B.smoke }}>
      <div style={{ fontSize: '18px', fontWeight: 600, color: B.amber }}>Loading System Health...</div>
    </div>
  );

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Alerts Banner */}
      {unresolved.length > 0 && (
        <div style={{ background: 'linear-gradient(to right, ' + B.darkRed + ', ' + B.carbon + ')', border: '1px solid ' + B.error, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ color: B.error, fontWeight: 600, marginBottom: '8px', fontSize: '14px', fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>{unresolved.length} Active Alert(s)</div>
          {unresolved.slice(0, 3).map(a => <div key={a.id} style={{ color: B.silver, fontSize: '13px', marginBottom: '4px' }}>{'\u2022'} {a.message}</div>)}
        </div>
      )}

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Gateway Health */}
        <div style={crd}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: 0 }}>Gateway Health</h3>
            <span style={{ fontSize: '20px', color: sc(sys.gatewayStatus) }}>{sd(sys.gatewayStatus)}</span>
          </div>
          <Row l="Status" v={sys.gatewayStatus.toUpperCase()} c={sc(sys.gatewayStatus)} bold />
          <Row l="Heartbeat" v={rt(sys.lastHeartbeat)} />
          <Row l="Uptime" v={fu(sys.uptime)} />
          {sys.gatewayStatus === 'timeout' && <div style={{ marginTop: '12px', padding: '8px', background: B.darkRed, borderRadius: '4px', fontSize: '12px', color: B.silver, fontFamily: "'JetBrains Mono', monospace" }}>Check Task Scheduler</div>}
        </div>

        {/* Agent Fleet */}
        <div style={crd}>
          <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: 0, marginBottom: '16px' }}>Agent Fleet</h3>
          {(['active', 'idle', 'offline'] as const).map(s => <Row key={s} l={s[0].toUpperCase() + s.slice(1)} v={String(sys.agents.filter(a => a.status === s).length)} c={sc(s)} bold />)}
          <Row l="Tasks Today" v={String(sys.agents.reduce((s, a) => s + a.tasksToday, 0))} />
        </div>

        {/* Cron Jobs */}
        <div style={crd}>
          <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: 0, marginBottom: '16px' }}>Cron Jobs</h3>
          <Row l="Scheduled" v={String(sys.cronJobs.length)} />
          <Row l="Running" v={String(sys.cronJobs.filter(c => c.status === 'pending').length)} c={B.warning} bold />
          <Row l="Failed" v={String(sys.cronJobs.filter(c => c.status === 'failure').length)} c={B.error} bold />
        </div>
      </div>

      {/* Agent Status + Scheduled Jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={crd}>
          <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', marginBottom: '16px' }}>Agent Status</h3>
          {sys.agents.map(a => (
            <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: B.graphite, borderRadius: '8px', border: '1px solid ' + B.border, marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Av name={a.name} />
                <div>
                  <div style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{a.name}</div>
                  <div style={{ color: B.smoke, fontSize: '12px' }}>{a.role} {'\u2022'} {a.tasksToday} tasks</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: sc(a.status), fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{sd(a.status)} {a.status.toUpperCase()}</div>
                <div style={{ color: B.smoke, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{rt(a.lastSeen)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={crd}>
          <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', marginBottom: '16px' }}>Scheduled Jobs</h3>
          {sys.cronJobs.map(j => (
            <div key={j.id} style={{ padding: '12px', background: B.graphite, borderRadius: '8px', border: '1px solid ' + B.border, marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{j.name}</span>
                <span style={{ color: sc(j.status), fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{sd(j.status)} {j.status.toUpperCase()}</span>
              </div>
              <div style={{ color: B.smoke, fontSize: '12px' }}>{j.agent} {'\u2022'} {j.schedule}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: B.smoke, marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                <span>Last: {rt(j.lastRun)}</span><span>Next: {j.nextRun ? rt(j.nextRun) : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts & Issues */}
      <div style={crd}>
        <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', marginBottom: '16px' }}>Alerts & Issues</h3>
        {unresolved.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: B.smoke }}>All systems normal</div> :
          unresolved.map(a => (
            <div key={a.id} style={{ padding: '12px', background: a.type === 'error' ? B.darkRed : B.graphite, borderRadius: '8px', border: '1px solid ' + (a.type === 'error' ? B.error : B.warning), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div>
                <div style={{ color: a.type === 'error' ? B.error : B.warning, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{a.message}</div>
                <div style={{ color: B.smoke, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{rt(a.timestamp)}</div>
              </div>
              <button onClick={() => setSys(p => ({ ...p, alerts: p.alerts.map(x => x.id === a.id ? { ...x, resolved: true } : x) }))} style={{ background: 'none', border: '1px solid ' + B.border, color: B.silver, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Resolve</button>
            </div>
          ))
        }
      </div>

      {/* Footer with data freshness */}
      {generatedAt && (
        <div style={{ 
          marginTop: '40px', 
          padding: '12px 20px', 
          borderTop: '1px solid ' + B.border,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span style={{ 
            color: B.smoke, 
            fontSize: '12px', 
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            Data generated at: {new Date(generatedAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
