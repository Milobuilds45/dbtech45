'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'health' | 'crons' | 'tasks' | 'sessions';

interface SystemStatus {
  gatewayStatus: 'online' | 'offline' | 'timeout' | 'unknown';
  lastHeartbeat: string | null;
  uptime: number;
  cronJobs: CronJob[];
  agents: AgentStatus[];
  alerts: Alert[];
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  humanSchedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'success' | 'failure' | 'pending' | 'unknown';
  agent: string;
  duration?: string;
  description?: string;
}

interface AgentStatus {
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen: string;
  tasksToday: number;
  health: 'healthy' | 'warning' | 'critical';
  currentTask?: string;
  sessionStart?: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskColumn = 'backlog' | 'in-progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  agent: string;
  dueDate: string;
  column: TaskColumn;
  createdAt: string;
}

interface ActivityEntry {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
  type: 'task' | 'cron' | 'system' | 'message';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const B = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
  border: '#222222', darkRed: '#7F1D1D', darkGreen: '#064E3B',
} as const;

const AGENT_COLORS: Record<string, string> = {
  Milo: '#A855F7', Anders: '#F97316', Paula: '#EC4899', Bobby: '#22C55E',
  Dwight: '#6366F1', Tony: '#EAB308', Dax: '#06B6D4', Remy: '#EF4444',
  Wendy: '#8B5CF6', System: '#737373',
};

const AGENT_ROSTER: { name: string; role: string }[] = [
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
  { id: 'health', label: 'System Health', icon: '💊' },
  { id: 'crons', label: 'Cron Monitor', icon: '⏰' },
  { id: 'tasks', label: 'Task Board', icon: '📋' },
  { id: 'sessions', label: 'Active Sessions', icon: '📡' },
];

const COLUMNS: { id: TaskColumn; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'online': case 'active': case 'success': case 'healthy': return B.success;
    case 'warning': case 'idle': case 'pending': return B.warning;
    case 'offline': case 'failure': case 'critical': case 'timeout': return B.error;
    default: return B.smoke;
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'online': case 'active': case 'success': case 'healthy': return '●';
    case 'warning': case 'idle': case 'pending': return '◐';
    case 'offline': case 'failure': case 'critical': case 'timeout': return '●';
    default: return '○';
  }
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    const m = Math.floor(absDiff / 60000);
    const h = Math.floor(m / 60);
    if (h > 0) return `in ${h}h ${m % 60}m`;
    if (m > 0) return `in ${m}m`;
    return 'Now';
  }
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatDuration(startIso: string): string {
  const diff = Date.now() - new Date(startIso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function priorityColor(p: TaskPriority): string {
  switch (p) {
    case 'critical': return '#EF4444';
    case 'high': return '#F97316';
    case 'medium': return '#EAB308';
    case 'low': return '#6B7280';
  }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Local Storage helpers ───────────────────────────────────────────────────

const TASKS_KEY = 'milo-mc-tasks';

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: B.carbon,
  border: `1px solid ${B.border}`,
  borderRadius: '12px',
  padding: '20px',
};

const badgeBase: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  // State
  const [activeTab, setActiveTab] = useState<TabId>('health');
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    gatewayStatus: 'unknown', lastHeartbeat: null, uptime: 0,
    cronJobs: [], agents: [], alerts: [],
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [cronFilterAgent, setCronFilterAgent] = useState('all');
  const [cronFilterStatus, setCronFilterStatus] = useState('all');
  const [taskFilterAgent, setTaskFilterAgent] = useState('all');
  const [taskFilterPriority, setTaskFilterPriority] = useState('all');
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Task modal form state
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium' as TaskPriority,
    agent: 'Milo', dueDate: '', column: 'backlog' as TaskColumn,
  });

  // ─── Data generators ───────────────────────────────────────────────────────

  const initializeSystemStatus = useCallback(() => {
    const now = new Date();
    const gatewayStatus: 'online' | 'offline' | 'timeout' = Math.random() > 0.8 ? 'online' : 'timeout';

    const cronJobs: CronJob[] = [
      {
        id: 'c1', name: 'Morning Brief', schedule: '0 7 * * *',
        humanSchedule: 'Every day at 7:00 AM',
        lastRun: new Date(now.getTime() - 7 * 3600000).toISOString(),
        nextRun: new Date(now.getTime() + 4 * 3600000).toISOString(),
        status: 'success', agent: 'Dwight', duration: '12s',
        description: 'Weather, news headlines, and calendar summary for Derek',
      },
      {
        id: 'c2', name: 'Bobby Morning Brief', schedule: '10 9 * * 1-5',
        humanSchedule: 'Weekdays at 9:10 AM',
        lastRun: new Date(now.getTime() - 5 * 3600000).toISOString(),
        nextRun: new Date(now.getTime() + 6 * 3600000).toISOString(),
        status: 'success', agent: 'Bobby', duration: '8s',
        description: 'BTC and market analysis sent to Telegram',
      },
      {
        id: 'c3', name: 'Gateway Auto-Start Check', schedule: '@reboot',
        humanSchedule: 'At system startup',
        lastRun: null, nextRun: null,
        status: 'failure', agent: 'System', duration: '—',
        description: 'Ensures gateway daemon starts on boot. Currently misconfigured.',
      },
      {
        id: 'c4', name: 'Nightly Build', schedule: '0 3 * * *',
        humanSchedule: 'Every day at 3:00 AM',
        lastRun: now.toISOString(),
        nextRun: new Date(now.getTime() + 21 * 3600000).toISOString(),
        status: 'pending', agent: 'Milo', duration: '~45s',
        description: 'Runs project builds, deploys, and health checks',
      },
      {
        id: 'c5', name: 'Memory Cleanup', schedule: '0 4 * * 0',
        humanSchedule: 'Sundays at 4:00 AM',
        lastRun: new Date(now.getTime() - 3 * 86400000).toISOString(),
        nextRun: new Date(now.getTime() + 4 * 86400000).toISOString(),
        status: 'success', agent: 'Milo', duration: '22s',
        description: 'Archives old memory files and compacts MEMORY.md',
      },
      {
        id: 'c6', name: 'Portfolio Snapshot', schedule: '0 16 * * 1-5',
        humanSchedule: 'Weekdays at 4:00 PM',
        lastRun: new Date(now.getTime() - 12 * 3600000).toISOString(),
        nextRun: new Date(now.getTime() + 8 * 3600000).toISOString(),
        status: 'success', agent: 'Bobby', duration: '6s',
        description: 'End-of-day portfolio value and P&L summary',
      },
      {
        id: 'c7', name: 'Wellness Check-in', schedule: '0 12 * * *',
        humanSchedule: 'Every day at 12:00 PM',
        lastRun: new Date(now.getTime() - 2 * 3600000).toISOString(),
        nextRun: new Date(now.getTime() + 22 * 3600000).toISOString(),
        status: 'unknown', agent: 'Wendy', duration: '—',
        description: 'Midday wellness prompt and hydration reminder',
      },
    ];

    const agents: AgentStatus[] = [
      { name: 'Milo', role: 'Chief of Staff', status: 'active', lastSeen: now.toISOString(), tasksToday: 3, health: 'healthy', currentTask: 'Coordinating nightly builds', sessionStart: new Date(now.getTime() - 2 * 3600000).toISOString() },
      { name: 'Anders', role: 'Full Stack Architect', status: 'active', lastSeen: now.toISOString(), tasksToday: 1, health: 'healthy', currentTask: 'Building Mission Control expansion', sessionStart: new Date(now.getTime() - 45 * 60000).toISOString() },
      { name: 'Bobby', role: 'Trading Advisor', status: 'offline', lastSeen: new Date(now.getTime() - 8 * 3600000).toISOString(), tasksToday: 2, health: 'warning', currentTask: undefined, sessionStart: undefined },
      { name: 'Paula', role: 'Creative Director', status: 'idle', lastSeen: new Date(now.getTime() - 3 * 3600000).toISOString(), tasksToday: 1, health: 'healthy', currentTask: undefined, sessionStart: new Date(now.getTime() - 5 * 3600000).toISOString() },
      { name: 'Dwight', role: 'Weather & News', status: 'idle', lastSeen: new Date(now.getTime() - 1 * 3600000).toISOString(), tasksToday: 1, health: 'healthy', currentTask: undefined, sessionStart: new Date(now.getTime() - 7 * 3600000).toISOString() },
      { name: 'Tony', role: 'Tech Guru', status: 'offline', lastSeen: new Date(now.getTime() - 12 * 3600000).toISOString(), tasksToday: 0, health: 'healthy', currentTask: undefined, sessionStart: undefined },
      { name: 'Dax', role: 'Data Analyst', status: 'idle', lastSeen: new Date(now.getTime() - 4 * 3600000).toISOString(), tasksToday: 0, health: 'healthy', currentTask: undefined, sessionStart: new Date(now.getTime() - 6 * 3600000).toISOString() },
      { name: 'Remy', role: 'Chef & Lifestyle', status: 'offline', lastSeen: new Date(now.getTime() - 24 * 3600000).toISOString(), tasksToday: 0, health: 'warning', currentTask: undefined, sessionStart: undefined },
      { name: 'Wendy', role: 'Wellness Coach', status: 'idle', lastSeen: new Date(now.getTime() - 2 * 3600000).toISOString(), tasksToday: 0, health: 'healthy', currentTask: undefined, sessionStart: new Date(now.getTime() - 3 * 3600000).toISOString() },
    ];

    const alerts: Alert[] = [
      { id: 'a1', type: 'error', message: 'Gateway timeout — ws://127.0.0.1:18789 connection failed', timestamp: now.toISOString(), resolved: false },
      { id: 'a2', type: 'warning', message: 'Bobby agent offline for >6 hours', timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), resolved: false },
      { id: 'a3', type: 'warning', message: 'Gateway Auto-Start task misconfigured ("at logon" vs "at startup")', timestamp: new Date(now.getTime() - 3600000).toISOString(), resolved: false },
    ];

    setSystemStatus({ gatewayStatus, lastHeartbeat: gatewayStatus === 'online' ? now.toISOString() : null, uptime: gatewayStatus === 'online' ? 14400 : 0, cronJobs, agents, alerts });
  }, []);

  const generateActivityLog = useCallback((): ActivityEntry[] => {
    const now = Date.now();
    return [
      { id: 'l1', agent: 'Milo', action: 'Kicked off nightly build pipeline', timestamp: new Date(now - 2 * 60000).toISOString(), type: 'cron' },
      { id: 'l2', agent: 'Anders', action: 'Committed Mission Control expansion to master', timestamp: new Date(now - 5 * 60000).toISOString(), type: 'task' },
      { id: 'l3', agent: 'Dwight', action: 'Delivered morning weather brief to Telegram', timestamp: new Date(now - 60 * 60000).toISOString(), type: 'cron' },
      { id: 'l4', agent: 'Bobby', action: 'Sent BTC morning analysis — market neutral', timestamp: new Date(now - 5 * 3600000).toISOString(), type: 'cron' },
      { id: 'l5', agent: 'Paula', action: 'Reviewed thumbnail concepts for YouTube', timestamp: new Date(now - 3 * 3600000).toISOString(), type: 'task' },
      { id: 'l6', agent: 'Milo', action: 'Compacted memory files and pushed to GitHub', timestamp: new Date(now - 4 * 3600000).toISOString(), type: 'system' },
      { id: 'l7', agent: 'Wendy', action: 'Sent midday wellness reminder', timestamp: new Date(now - 2 * 3600000).toISOString(), type: 'message' },
      { id: 'l8', agent: 'Dax', action: 'Generated analytics report for dbtech.fyi', timestamp: new Date(now - 4 * 3600000).toISOString(), type: 'task' },
      { id: 'l9', agent: 'System', action: 'Gateway auto-start failed — task misconfigured', timestamp: new Date(now - 8 * 3600000).toISOString(), type: 'system' },
      { id: 'l10', agent: 'Milo', action: 'Heartbeat check — all agents reported', timestamp: new Date(now - 30 * 60000).toISOString(), type: 'system' },
    ];
  }, []);

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    initializeSystemStatus();
    setTasks(loadTasks());
    setActivityLog(generateActivityLog());
    setLoading(false);
    const interval = setInterval(() => {
      initializeSystemStatus();
      setActivityLog(generateActivityLog());
    }, 30000);
    return () => clearInterval(interval);
  }, [initializeSystemStatus, generateActivityLog]);

  // Persist tasks on change
  useEffect(() => { if (!loading) saveTasks(tasks); }, [tasks, loading]);

  // ─── Task handlers ─────────────────────────────────────────────────────────

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = { ...newTask, id: uid(), createdAt: new Date().toISOString() };
    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', description: '', priority: 'medium', agent: 'Milo', dueDate: '', column: 'backlog' });
    setShowTaskModal(false);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = (id: string, to: TaskColumn) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
  };

  // ─── Drag and Drop ─────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Needed for Firefox
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, column: TaskColumn) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, column);
      setDraggedTaskId(null);
    }
  };

  // ─── Filtered data ─────────────────────────────────────────────────────────

  const filteredCrons = systemStatus.cronJobs.filter(c => {
    if (cronFilterAgent !== 'all' && c.agent !== cronFilterAgent) return false;
    if (cronFilterStatus !== 'all' && c.status !== cronFilterStatus) return false;
    return true;
  });

  const filteredTasks = tasks.filter(t => {
    if (taskFilterAgent !== 'all' && t.agent !== taskFilterAgent) return false;
    if (taskFilterPriority !== 'all' && t.priority !== taskFilterPriority) return false;
    return true;
  });

  // ─── Agent avatar ───────────────────────────────────────────────────────────

  const AgentAvatar = ({ name, size = 32 }: { name: string; size?: number }) => {
    const color = AGENT_COLORS[name] || B.smoke;
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: B.void, border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: 700, color,
        flexShrink: 0,
      }}>
        {name[0]}
      </div>
    );
  };

  // ─── Select component ──────────────────────────────────────────────────────

  const selectStyle: React.CSSProperties = {
    background: B.graphite, color: B.silver, border: `1px solid ${B.border}`,
    borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    background: B.graphite, color: B.white, border: `1px solid ${B.border}`,
    borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '60px 30px', textAlign: 'center', color: B.smoke }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: B.amber }}>🚀 Initializing Mission Control...</div>
      </div>
    );
  }

  // ─── Render Tabs ────────────────────────────────────────────────────────────

  const renderSystemHealth = () => (
    <>
      {/* Alerts Bar */}
      {systemStatus.alerts.filter(a => !a.resolved).length > 0 && (
        <div style={{ background: `linear-gradient(to right, ${B.darkRed}, ${B.carbon})`, border: `1px solid ${B.error}`, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ color: B.error, fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
            🚨 {systemStatus.alerts.filter(a => !a.resolved).length} Active Alert(s)
          </div>
          {systemStatus.alerts.filter(a => !a.resolved).slice(0, 3).map(alert => (
            <div key={alert.id} style={{ color: B.silver, fontSize: '13px', marginBottom: '4px' }}>• {alert.message}</div>
          ))}
        </div>
      )}

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Gateway */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: B.amber, fontSize: '16px', fontWeight: 600, margin: 0 }}>Gateway Health</h3>
            <span style={{ fontSize: '20px', color: getStatusColor(systemStatus.gatewayStatus) }}>{getStatusIcon(systemStatus.gatewayStatus)}</span>
          </div>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Status:</span>
              <span style={{ color: getStatusColor(systemStatus.gatewayStatus), fontWeight: 600 }}>{systemStatus.gatewayStatus.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Last Heartbeat:</span>
              <span style={{ color: B.silver }}>{formatRelativeTime(systemStatus.lastHeartbeat)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Uptime:</span>
              <span style={{ color: B.silver }}>{formatUptime(systemStatus.uptime)}</span>
            </div>
          </div>
          {systemStatus.gatewayStatus === 'timeout' && (
            <div style={{ marginTop: '12px', padding: '8px', background: B.darkRed, borderRadius: '4px', fontSize: '12px', color: B.silver }}>
              💡 Check Task Scheduler — ensure auto-start is "at startup" not "at logon"
            </div>
          )}
        </div>

        {/* Agent Fleet */}
        <div style={cardStyle}>
          <h3 style={{ color: B.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600, margin: 0, marginBlockEnd: '16px' }}>Agent Fleet</h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            {(['active', 'idle', 'offline'] as const).map(s => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: B.smoke }}>{s.charAt(0).toUpperCase() + s.slice(1)}:</span>
                <span style={{ color: getStatusColor(s), fontWeight: 600 }}>{systemStatus.agents.filter(a => a.status === s).length}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Tasks Today:</span>
              <span style={{ color: B.silver, fontWeight: 600 }}>{systemStatus.agents.reduce((s, a) => s + a.tasksToday, 0)}</span>
            </div>
          </div>
        </div>

        {/* Cron Summary */}
        <div style={cardStyle}>
          <h3 style={{ color: B.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600, margin: 0, marginBlockEnd: '16px' }}>Cron Jobs</h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Scheduled:</span>
              <span style={{ color: B.silver, fontWeight: 600 }}>{systemStatus.cronJobs.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Running:</span>
              <span style={{ color: B.warning, fontWeight: 600 }}>{systemStatus.cronJobs.filter(c => c.status === 'pending').length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: B.smoke }}>Failed:</span>
              <span style={{ color: B.error, fontWeight: 600 }}>{systemStatus.cronJobs.filter(c => c.status === 'failure').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent + Cron Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Agent Details */}
        <div style={cardStyle}>
          <h3 style={{ color: B.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>🤖 Agent Status</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {systemStatus.agents.map(agent => (
              <div key={agent.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: B.graphite, borderRadius: '8px', border: `1px solid ${B.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AgentAvatar name={agent.name} />
                  <div>
                    <div style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{agent.name}</div>
                    <div style={{ color: B.smoke, fontSize: '12px' }}>{agent.role} • {agent.tasksToday} tasks</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: getStatusColor(agent.status), fontSize: '12px', fontWeight: 600 }}>{getStatusIcon(agent.status)} {agent.status.toUpperCase()}</div>
                  <div style={{ color: B.smoke, fontSize: '11px' }}>{formatRelativeTime(agent.lastSeen)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cron Details */}
        <div style={cardStyle}>
          <h3 style={{ color: B.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>⏰ Scheduled Jobs</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {systemStatus.cronJobs.map(job => (
              <div key={job.id} style={{ padding: '12px', background: B.graphite, borderRadius: '8px', border: `1px solid ${B.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ color: B.white, fontWeight: 600, fontSize: '14px' }}>{job.name}</div>
                  <span style={{ color: getStatusColor(job.status), fontSize: '12px', fontWeight: 600 }}>{getStatusIcon(job.status)} {job.status.toUpperCase()}</span>
                </div>
                <div style={{ color: B.smoke, fontSize: '12px', marginBottom: '4px' }}>{job.agent && `Agent: ${job.agent} • `}Schedule: {job.schedule}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: B.smoke }}>
                  <span>Last: {formatRelativeTime(job.lastRun)}</span>
                  <span>Next: {job.nextRun && !job.nextRun.includes('Manual') ? formatRelativeTime(job.nextRun) : (job.nextRun || 'N/A')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={cardStyle}>
        <h3 style={{ color: B.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>🚨 Active Alerts & Issues</h3>
        {systemStatus.alerts.filter(a => !a.resolved).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: B.smoke, fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>All systems normal
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {systemStatus.alerts.filter(a => !a.resolved).map(alert => (
              <div key={alert.id} style={{ padding: '12px', background: alert.type === 'error' ? B.darkRed : B.graphite, borderRadius: '8px', border: `1px solid ${alert.type === 'error' ? B.error : B.warning}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ color: alert.type === 'error' ? B.error : B.warning, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {alert.type === 'error' ? '🔴' : '⚠️'} {alert.message}
                  </div>
                  <div style={{ color: B.smoke, fontSize: '12px' }}>{formatRelativeTime(alert.timestamp)}</div>
                </div>
                <button onClick={() => setSystemStatus(prev => ({ ...prev, alerts: prev.alerts.map(a => a.id === alert.id ? { ...a, resolved: true } : a) }))} style={{ background: 'none', border: `1px solid ${B.border}`, color: B.silver, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ─── Cron Monitor Tab ───────────────────────────────────────────────────────

  const renderCronMonitor = () => (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: B.smoke, fontSize: '13px' }}>Filter:</span>
        <select value={cronFilterAgent} onChange={e => setCronFilterAgent(e.target.value)} style={selectStyle}>
          <option value="all">All Agents</option>
          {AGENT_ROSTER.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          <option value="System">System</option>
        </select>
        <select value={cronFilterStatus} onChange={e => setCronFilterStatus(e.target.value)} style={selectStyle}>
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="pending">Pending</option>
          <option value