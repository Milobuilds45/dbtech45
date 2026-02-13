'use client';
import { useEffect, useState, useCallback } from 'react';

type TabId = 'health' | 'crons' | 'tasks' | 'sessions';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskColumn = 'backlog' | 'in-progress' | 'review' | 'done';

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
interface Task {
  id: string; title: string; description: string; priority: TaskPriority;
  agent: string; dueDate: string; column: TaskColumn; createdAt: string;
}
interface ActivityEntry {
  id: string; agent: string; action: string;
  timestamp: string; type: 'task' | 'cron' | 'system' | 'message';
}

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

const AR = [
  { name: 'Milo', role: 'Chief of Staff' },
  { name: 'Anders', role: 'Full Stack Architect' },
  { name: 'Paula', role: 'Creative Director' },
  { name: 'Bobby', role: 'Trading Advisor' },
  { name: 'Dwight', role: 'Weather & News' },
  { name: 'Tony', role: 'Tech Guru' },
  { name: 'Dax', role: 'Data Analyst' },
  { name: 'Remy', role: 'Chef & Lifestyle' },
  { name: 'Wendy', role: 'Wellness Coach' },
];

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'health', label: 'System Health', icon: '\uD83D\uDC8A' },
  { id: 'crons', label: 'Cron Monitor', icon: '\u23F0' },
  { id: 'tasks', label: 'Task Board', icon: '\uD83D\uDCCB' },
  { id: 'sessions', label: 'Active Sessions', icon: '\uD83D\uDCE1' },
];

const COLS: { id: TaskColumn; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

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

function fd(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? h + 'h ' + (m % 60) + 'm' : m + 'm';
}

function pc(p: TaskPriority) {
  return { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#6B7280' }[p];
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const TK = 'milo-mc-tasks';
function loadT(): Task[] {
  try { const r = typeof window !== 'undefined' ? localStorage.getItem(TK) : null; return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveT(t: Task[]) { if (typeof window !== 'undefined') localStorage.setItem(TK, JSON.stringify(t)); }

function Row({ l, v, c, bold }: { l: string; v: string; c?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
      <span style={{ color: B.smoke }}>{l}:</span>
      <span style={{ color: c || B.silver, fontWeight: bold ? 600 : 400 }}>{v}</span>
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
      fontSize: size * 0.4, fontWeight: 700, color: color, flexShrink: 0,
    }}>
      {name[0]}
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function MissionControlPage() {
  const [tab, setTab] = useState<TabId>('health');
  const [loading, setLoading] = useState(true);
  const [sys, setSys] = useState<SystemStatus>({ gatewayStatus: 'unknown', lastHeartbeat: null, uptime: 0, cronJobs: [], agents: [], alerts: [] });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modal, setModal] = useState(false);
  const [cronFA, setCronFA] = useState('all');
  const [cronFS, setCronFS] = useState('all');
  const [taskFA, setTaskFA] = useState('all');
  const [taskFP, setTaskFP] = useState('all');
  const [alog, setAlog] = useState<ActivityEntry[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, agent: 'Milo', dueDate: '', column: 'backlog' as TaskColumn });
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const crd: React.CSSProperties = { background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '20px' };
  const sel: React.CSSProperties = { background: B.graphite, color: B.silver, border: '1px solid ' + B.border, borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' };
  const inp: React.CSSProperties = { background: B.graphite, color: B.white, border: '1px solid ' + B.border, borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };

  const refresh = useCallback(async () => {
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

      setSys({
        gatewayStatus: data.system.gatewayStatus,
        lastHeartbeat: data.system.lastHeartbeat,
        uptime: data.system.uptime,
        cronJobs: mappedCrons,
        agents: mappedAgents,
        alerts: data.system.alerts
      });
      
      // Generate activity log from recent sessions and cron activities
      const recentActivities: ActivityEntry[] = [
        ...data.sessions.slice(0, 3).map((session: any, i: number) => ({
          id: `s${i}`,
          agent: session.agent,
          action: session.currentTask || 'Session activity',
          timestamp: session.lastActivity,
          type: 'task' as const
        })),
        ...data.crons.filter((c: any) => c.lastRun).slice(0, 7).map((cron: any, i: number) => ({
          id: `c${i}`,
          agent: cron.agent,
          action: `${cron.name} completed`,
          timestamp: cron.lastRun,
          type: 'cron' as const
        }))
      ];
      
      setAlog(recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setGeneratedAt(data.generatedAt);
    } catch (error) {
      console.error('Failed to fetch ops status:', error);
      // Fallback to empty state on error
      setSys({ gatewayStatus: 'unknown', lastHeartbeat: null, uptime: 0, cronJobs: [], agents: [], alerts: [] });
      setAlog([]);
      setGeneratedAt(null);
    }
  }, []);

  useEffect(() => { refresh(); setTasks(loadT()); setLoading(false); const i = setInterval(refresh, 30000); return () => clearInterval(i); }, [refresh]);
  useEffect(() => { if (!loading) saveT(tasks); }, [tasks, loading]);

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks(p => [...p, { ...form, id: uid(), createdAt: new Date().toISOString() }]);
    setForm({ title: '', description: '', priority: 'medium', agent: 'Milo', dueDate: '', column: 'backlog' });
    setModal(false);
  };
  const deleteTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));
  const moveTask = (id: string, col: TaskColumn) => setTasks(p => p.map(t => t.id === id ? { ...t, column: col } : t));

  const fCrons = sys.cronJobs.filter(c => (cronFA === 'all' || c.agent === cronFA) && (cronFS === 'all' || c.status === cronFS));
  const fTasks = tasks.filter(t => (taskFA === 'all' || t.agent === taskFA) && (taskFP === 'all' || t.priority === taskFP));
  const unresolved = sys.alerts.filter(a => !a.resolved);

  if (loading) return (
    <div style={{ padding: '60px 30px', textAlign: 'center', color: B.smoke }}>
      <div style={{ fontSize: '18px', fontWeight: 600, color: B.amber }}>Initializing Mission Control...</div>
    </div>
  );

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: B.white, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            MILO MISSION CONTROL
            <span style={{ fontSize: '12px', background: sc(sys.gatewayStatus), color: sys.gatewayStatus === 'online' ? B.void : B.white, padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>{sys.gatewayStatus.toUpperCase()}</span>
          </div>
          <div style={{ color: B.smoke, marginTop: '4px', fontSize: '13px' }}>Real-time monitoring \u2022 Auto-refresh 30s \u2022 {new Date().toLocaleTimeString()}</div>
        </div>
        <button onClick={refresh} style={{ background: B.amber, color: B.void, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Refresh</button>
      </div>

      {/* TAB BAR */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid ' + B.border, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid ' + B.amber : '2px solid transparent',
            color: tab === t.id ? B.amber : B.smoke,
            padding: '12px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

{/* ═══ TAB: SYSTEM HEALTH ═══ */}
{tab === 'health' && (<>
  {unresolved.length > 0 && (
    <div style={{ background: 'linear-gradient(to right, ' + B.darkRed + ', ' + B.carbon + ')', border: '1px solid ' + B.error, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ color: B.error, fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>{unresolved.length} Active Alert(s)</div>
      {unresolved.slice(0, 3).map(a => <div key={a.id} style={{ color: B.silver, fontSize: '13px', marginBottom: '4px' }}>{'\u2022'} {a.message}</div>)}
    </div>
  )}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
    <div style={crd}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', margin: 0 }}>Gateway Health</h3>
        <span style={{ fontSize: '20px', color: sc(sys.gatewayStatus) }}>{sd(sys.gatewayStatus)}</span>
      </div>
      <Row l="Status" v={sys.gatewayStatus.toUpperCase()} c={sc(sys.gatewayStatus)} bold />
      <Row l="Heartbeat" v={rt(sys.lastHeartbeat)} />
      <Row l="Uptime" v={fu(sys.uptime)} />
      {sys.gatewayStatus === 'timeout' && <div style={{ marginTop: '12px', padding: '8px', background: B.darkRed, borderRadius: '4px', fontSize: '12px', color: B.silver }}>Check Task Scheduler</div>}
    </div>
    <div style={crd}>
      <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', margin: 0, marginBottom: '16px' }}>Agent Fleet</h3>
      {(['active', 'idle', 'offline'] as const).map(s => <Row key={s} l={s[0].toUpperCase() + s.slice(1)} v={String(sys.agents.filter(a => a.status === s).length)} c={sc(s)} bold />)}
      <Row l="Tasks Today" v={String(sys.agents.reduce((s, a) => s + a.tasksToday, 0))} />
    </div>
    <div style={crd}>
      <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', margin: 0, marginBottom: '16px' }}>Cron Jobs</h3>
      <Row l="Scheduled" v={String(sys.cronJobs.length)} />
      <Row l="Running" v={String(sys.cronJobs.filter(c => c.status === 'pending').length)} c={B.warning} bold />
      <Row l="Failed" v={String(sys.cronJobs.filter(c => c.status === 'failure').length)} c={B.error} bold />
    </div>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
    <div style={crd}>
      <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', marginBottom: '16px' }}>Agent Status</h3>
      {sys.agents.map(a => (
        <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: B.graphite, borderRadius: '8px', border: '1px solid ' + B.border, marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Av name={a.name} />
            <div><div style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{a.name}</div><div style={{ color: B.smoke, fontSize: '12px' }}>{a.role} {'\u2022'} {a.tasksToday} tasks</div></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: sc(a.status), fontSize: '12px', fontWeight: 600 }}>{sd(a.status)} {a.status.toUpperCase()}</div>
            <div style={{ color: B.smoke, fontSize: '11px' }}>{rt(a.lastSeen)}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={crd}>
      <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', marginBottom: '16px' }}>Scheduled Jobs</h3>
      {sys.cronJobs.map(j => (
        <div key={j.id} style={{ padding: '12px', background: B.graphite, borderRadius: '8px', border: '1px solid ' + B.border, marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{j.name}</span>
            <span style={{ color: sc(j.status), fontSize: '12px', fontWeight: 600 }}>{sd(j.status)} {j.status.toUpperCase()}</span>
          </div>
          <div style={{ color: B.smoke, fontSize: '12px' }}>{j.agent} {'\u2022'} {j.schedule}</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: B.smoke, marginTop: '4px' }}>
            <span>Last: {rt(j.lastRun)}</span><span>Next: {j.nextRun ? rt(j.nextRun) : 'N/A'}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
  <div style={crd}>
    <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', marginBottom: '16px' }}>Alerts & Issues</h3>
    {unresolved.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: B.smoke }}>All systems normal</div> :
      unresolved.map(a => (
        <div key={a.id} style={{ padding: '12px', background: a.type === 'error' ? B.darkRed : B.graphite, borderRadius: '8px', border: '1px solid ' + (a.type === 'error' ? B.error : B.warning), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <div>
            <div style={{ color: a.type === 'error' ? B.error : B.warning, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{a.message}</div>
            <div style={{ color: B.smoke, fontSize: '12px' }}>{rt(a.timestamp)}</div>
          </div>
          <button onClick={() => setSys(p => ({ ...p, alerts: p.alerts.map(x => x.id === a.id ? { ...x, resolved: true } : x) }))} style={{ background: 'none', border: '1px solid ' + B.border, color: B.silver, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Resolve</button>
        </div>
      ))
    }
  </div>
</>)}

{/* ═══ TAB: CRON MONITOR ═══ */}
{tab === 'crons' && (<>
  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
    <span style={{ color: B.smoke, fontSize: '13px', fontWeight: 600 }}>Filter:</span>
    <select value={cronFA} onChange={e => setCronFA(e.target.value)} style={sel}>
      <option value="all">All Agents</option>
      {[...AR.map(a => a.name), 'System'].map(n => <option key={n} value={n}>{n}</option>)}
    </select>
    <select value={cronFS} onChange={e => setCronFS(e.target.value)} style={sel}>
      <option value="all">All Statuses</option>
      {['success', 'failure', 'pending', 'unknown'].map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
    </select>
    <span style={{ color: B.smoke, fontSize: '12px', marginLeft: 'auto' }}>{fCrons.length} job{fCrons.length !== 1 ? 's' : ''}</span>
  </div>
  <div style={crd}>
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px 90px', gap: '8px', padding: '8px 12px', borderBottom: '1px solid ' + B.border, fontSize: '11px', fontWeight: 700, color: B.smoke, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Name</span><span>Schedule</span><span>Agent</span><span>Last Run</span><span>Next Run</span><span>Duration</span><span>Status</span>
        </div>
        {fCrons.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: B.smoke }}>No jobs match filters</div> :
          fCrons.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px 90px', gap: '8px', padding: '12px', borderBottom: '1px solid ' + B.border, alignItems: 'center', fontSize: '13px' }}>
              <div>
                <div style={{ color: B.white, fontWeight: 600 }}>{c.name}</div>
                {c.description && <div style={{ color: B.smoke, fontSize: '11px', marginTop: '2px' }}>{c.description}</div>}
              </div>
              <div>
                <div style={{ color: B.silver, fontFamily: 'monospace', fontSize: '12px' }}>{c.schedule}</div>
                <div style={{ color: B.smoke, fontSize: '11px' }}>{c.humanSchedule}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: AC[c.agent] || B.smoke }} />
                <span style={{ color: B.silver }}>{c.agent}</span>
              </div>
              <span style={{ color: B.silver }}>{rt(c.lastRun)}</span>
              <span style={{ color: B.silver }}>{c.nextRun ? rt(c.nextRun) : 'N/A'}</span>
              <span style={{ color: B.smoke }}>{c.duration || '\u2014'}</span>
              <span style={{ color: sc(c.status), fontWeight: 600, fontSize: '12px' }}>{sd(c.status)} {c.status.toUpperCase()}</span>
            </div>
          ))
        }
      </div>
    </div>
  </div>
</>)}

{/* ═══ TAB: TASK BOARD ═══ */}
{tab === 'tasks' && (<>
  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
    <button onClick={() => setModal(true)} style={{ background: B.amber, color: B.void, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>+ Add Task</button>
    <select value={taskFA} onChange={e => setTaskFA(e.target.value)} style={sel}><option value="all">All Agents</option>{AR.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}</select>
    <select value={taskFP} onChange={e => setTaskFP(e.target.value)} style={sel}><option value="all">All Priorities</option>{(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select>
    <span style={{ color: B.smoke, fontSize: '12px', marginLeft: 'auto' }}>{fTasks.length} task{fTasks.length !== 1 ? 's' : ''}</span>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
    {COLS.map(col => {
      const ct = fTasks.filter(t => t.column === col.id);
      return (
        <div key={col.id}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={e => { e.preventDefault(); if (dragId) { moveTask(dragId, col.id); setDragId(null); } }}
          style={{ background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '16px', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: B.amber, fontSize: '14px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.label}</h4>
            <span style={{ color: B.smoke, fontSize: '12px', background: B.graphite, padding: '2px 8px', borderRadius: '10px' }}>{ct.length}</span>
          </div>
          {ct.length === 0 && <div style={{ textAlign: 'center', padding: '24px 8px', color: B.smoke, fontSize: '13px', border: '1px dashed ' + B.border, borderRadius: '8px' }}>Drop tasks here</div>}
          {ct.map(t => (
            <div key={t.id} draggable onDragStart={() => setDragId(t.id)}
              style={{ background: B.graphite, border: '1px solid ' + B.border, borderRadius: '8px', padding: '12px', marginBottom: '8px', cursor: 'grab' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ color: B.white, fontWeight: 600, fontSize: '13px' }}>{t.title}</span>
                <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: B.smoke, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>&times;</button>
              </div>
              {t.description && <div style={{ color: B.smoke, fontSize: '12px', marginBottom: '8px', lineHeight: 1.4 }}>{t.description.length > 80 ? t.description.slice(0, 80) + '...' : t.description}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, background: pc(t.priority) + '22', color: pc(t.priority), border: '1px solid ' + pc(t.priority) }}>{t.priority.toUpperCase()}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: AC[t.agent] || B.smoke }} />
                  <span style={{ color: B.silver, fontSize: '11px' }}>{t.agent}</span>
                </div>
                {t.dueDate && <span style={{ color: B.smoke, fontSize: '11px', marginLeft: 'auto' }}>{t.dueDate}</span>}
              </div>
            </div>
          ))}
        </div>
      );
    })}
  </div>
</>)}

{/* ═══ TAB: ACTIVE SESSIONS ═══ */}
{tab === 'sessions' && (<>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
    {sys.agents.map(a => (
      <div key={a.name} style={{ ...crd, borderLeft: '3px solid ' + (AC[a.name] || B.smoke) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Av name={a.name} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{a.name}</span>
              <span style={{ color: sc(a.status), fontSize: '11px', fontWeight: 600 }}>{sd(a.status)} {a.status.toUpperCase()}</span>
            </div>
            <div style={{ color: B.smoke, fontSize: '12px' }}>{a.role}</div>
          </div>
        </div>
        {a.currentTask && <div style={{ fontSize: '13px', color: B.silver, marginBottom: '8px', padding: '8px', background: B.void, borderRadius: '6px', border: '1px solid ' + B.border }}>{a.currentTask}</div>}
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: B.smoke }}>
          <span>Last: {rt(a.lastSeen)}</span>
          {a.sessionStart && <span>Session: {fd(a.sessionStart)}</span>}
          <span>{a.tasksToday} tasks today</span>
        </div>
      </div>
    ))}
  </div>
  <div style={crd}>
    <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', marginBottom: '16px' }}>Activity Log</h3>
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {alog.map(e => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid ' + B.border }}>
          <Av name={e.agent} size={24} />
          <div style={{ flex: 1 }}>
            <span style={{ color: AC[e.agent] || B.smoke, fontWeight: 600, fontSize: '13px' }}>{e.agent}</span>
            <span style={{ color: B.silver, fontSize: '13px' }}> {e.action}</span>
          </div>
          <span style={{ color: B.smoke, fontSize: '11px', whiteSpace: 'nowrap' }}>{rt(e.timestamp)}</span>
        </div>
      ))}
    </div>
  </div>
</>)}

{/* ═══ MODAL: ADD TASK ═══ */}
{modal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setModal(false)}>
    <div onClick={e => e.stopPropagation()} style={{ background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px' }}>
      <h3 style={{ color: B.amber, fontSize: '18px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em', margin: 0, marginBottom: '20px' }}>New Task</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' as const }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })} style={{ ...inp, cursor: 'pointer' }}>
            {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select value={form.agent} onChange={e => setForm({ ...form, agent: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
            {AR.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inp} />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button onClick={() => setModal(false)} style={{ background: 'none', border: '1px solid ' + B.border, color: B.silver, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={addTask} style={{ background: B.amber, color: B.void, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>Create Task</button>
        </div>
      </div>
    </div>
  </div>
)}

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