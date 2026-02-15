'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskColumn = 'backlog' | 'in-progress' | 'review' | 'done';
type CollabType = 'solo' | 'sequential' | 'parallel';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  column: TaskColumn;
  assignedAgents: string[];
  collaborationType: CollabType;
  estimatedHours: number;
  agentNotes: string;
  createdAt: string;
  updatedAt: string;
}

type AgentStatus = 'idle' | 'working' | 'scheduled';

interface AgentInfo {
  id: string;
  name: string;
  color: string;
  status: AgentStatus;
  currentTask: string | null;
  taskCount: number;
}

// ─── Brand colors ────────────────────────────────────────────────────────
const B = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
  border: '#222222',
};

const AGENT_COLORS: Record<string, string> = {
  milo: '#A855F7', anders: '#F97316', paula: '#EC4899', bobby: '#22C55E',
  dwight: '#6366F1', tony: '#EAB308', dax: '#06B6D4', remy: '#EF4444',
  wendy: '#8B5CF6',
};

const AGENTS = [
  { id: 'milo', name: 'Milo', emoji: '🤖' },
  { id: 'anders', name: 'Anders', emoji: '⚡' },
  { id: 'paula', name: 'Paula', emoji: '🎨' },
  { id: 'bobby', name: 'Bobby', emoji: '📊' },
  { id: 'dwight', name: 'Dwight', emoji: '📺' },
  { id: 'tony', name: 'Tony', emoji: '🍕' },
  { id: 'dax', name: 'Dax', emoji: '📈' },
  { id: 'remy', name: 'Remy', emoji: '🎯' },
  { id: 'wendy', name: 'Wendy', emoji: '💝' },
];

const AGENT_KEYWORDS: Record<string, string[]> = {
  bobby: ['trading', 'market', 'stocks', 'analysis', 'financial', 'options', 'portfolio'],
  paula: ['design', 'ui', 'visual', 'branding', 'creative', 'css', 'layout'],
  anders: ['code', 'build', 'deploy', 'technical', 'development', 'api', 'bug', 'fix'],
  tony: ['restaurant', 'menu', 'operations', 'food', 'kitchen', 'inventory'],
  dax: ['data', 'research', 'analytics', 'social', 'metrics', 'report'],
  dwight: ['intelligence', 'news', 'brief', 'weather', 'security', 'monitor'],
  remy: ['marketing', 'social media', 'content', 'seo', 'campaign', 'email'],
  wendy: ['personal', 'family', 'wellness', 'calendar', 'reminder', 'health'],
  milo: ['coordinate', 'plan', 'sprint', 'manage', 'organize', 'priority'],
};

const COLS: { id: TaskColumn; label: string; icon: string }[] = [
  { id: 'backlog', label: 'Backlog', icon: '📋' },
  { id: 'in-progress', label: 'In Progress', icon: '⚙️' },
  { id: 'review', label: 'Review', icon: '🔍' },
  { id: 'done', label: 'Done', icon: '✅' },
];

const COLLAB_ICONS: Record<CollabType, string> = { solo: '👤', sequential: '🔗', parallel: '⚡' };

const LABEL_STYLE: React.CSSProperties = {
  display: 'block', color: '#737373', fontSize: '10px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px',
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
};

// ─── Helpers ─────────────────────────────────────────────────────────────
function pc(p: TaskPriority): string {
  return { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#6B7280' }[p];
}
function getAgentColor(id: string): string { return AGENT_COLORS[id.toLowerCase()] || '#737373'; }
function getAgentName(id: string): string { return AGENTS.find(a => a.id === id.toLowerCase())?.name || id; }

function getSuggestedAgents(text: string): string[] {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [agentId, keywords] of Object.entries(AGENT_KEYWORDS)) {
    for (const kw of keywords) { if (lower.includes(kw)) scores[agentId] = (scores[agentId] || 0) + 1; }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function deriveAgentStatuses(tasks: Task[]): AgentInfo[] {
  return AGENTS.map(agent => {
    const at = tasks.filter(t => t.assignedAgents.includes(agent.id));
    const ip = at.find(t => t.column === 'in-progress');
    const hb = at.some(t => t.column === 'backlog');
    const status: AgentStatus = ip ? 'working' : hb ? 'scheduled' : 'idle';
    return { id: agent.id, name: agent.name, color: AGENT_COLORS[agent.id], status, currentTask: ip?.title || null, taskCount: at.filter(t => t.column !== 'done').length };
  });
}

function statusColor(s: AgentStatus): string { return { working: '#22C55E', scheduled: '#3B82F6', idle: '#6B7280' }[s]; }
function statusLabel(s: AgentStatus): string { return { working: 'WORKING', scheduled: 'SCHEDULED', idle: 'IDLE' }[s]; }

// ═══ MAIN COMPONENT ═══
export default function TaskBoardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskColumn | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, column: 'backlog' as TaskColumn, assignedAgents: [] as string[], collaborationType: 'solo' as CollabType, estimatedHours: 1, agentNotes: '' });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/task-board');
      if (res.ok) { const d = await res.json(); setTasks(d.tasks || []); }
    } catch (e) { console.error('Fetch tasks error:', e); }
    finally { setLoading(false); }
  }, []);

  const createTask = async () => {
    if (!form.title.trim()) return;
    try {
      const res = await fetch('/api/task-board', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { const d = await res.json(); setTasks(p => [...p, d.task]); setForm({ title: '', description: '', priority: 'medium', column: 'backlog', assignedAgents: [], collaborationType: 'solo', estimatedHours: 1, agentNotes: '' }); setModal(false); }
    } catch (e) { console.error('Create task error:', e); }
  };

  const apiUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch('/api/task-board', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
      if (res.ok) { const d = await res.json(); setTasks(p => p.map(t => t.id === id ? d.task : t)); if (selectedTask?.id === id) setSelectedTask(d.task); }
    } catch (e) { console.error('Update task error:', e); }
  };

  const apiDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/task-board?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setTasks(p => p.filter(t => t.id !== id)); if (selectedTask?.id === id) setSelectedTask(null); }
    } catch (e) { console.error('Delete task error:', e); }
  };

  useEffect(() => { fetchTasks(); pollRef.current = setInterval(fetchTasks, 30000); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, [fetchTasks]);

  const agents = deriveAgentStatuses(tasks);
  const fTasks = tasks.filter(t => (filterAgent === 'all' || t.assignedAgents.includes(filterAgent)) && (filterPriority === 'all' || t.priority === filterPriority));
  const suggestedAgents = getSuggestedAgents(form.title + ' ' + form.description);

  const inp: React.CSSProperties = { background: B.graphite, color: B.white, border: '1px solid ' + B.border, borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: "'Inter', system-ui, sans-serif" };
  const sel: React.CSSProperties = { ...inp, cursor: 'pointer' };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: B.smoke, fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>Loading mission control...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '0', overflow: 'hidden' }}>
      {/* ── COL 1: AGENT SIDEBAR ── */}
      <AgentSidebar agents={agents} filterAgent={filterAgent} setFilterAgent={setFilterAgent} />

      {/* ── COL 2: KANBAN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', alignItems: 'center', borderBottom: '1px solid ' + B.border, background: B.carbon, flexWrap: 'wrap' }}>
          <button onClick={() => setModal(true)} style={{ background: B.amber, color: B.void, border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>+ Add Task</button>
          <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} style={{ ...sel, width: 'auto', fontSize: '12px', padding: '6px 10px' }}><option value="all">All Agents</option>{AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...sel, width: 'auto', fontSize: '12px', padding: '6px 10px' }}><option value="all">All Priorities</option>{(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select>
          <span style={{ color: B.smoke, fontSize: '11px', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{fTasks.length} task{fTasks.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Kanban Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', overflow: 'hidden' }}>
          {COLS.map(col => {
            const ct = fTasks.filter(t => t.column === col.id);
            const isOver = dragOverCol === col.id;
            return (
              <div key={col.id} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(col.id); }} onDragLeave={() => setDragOverCol(null)} onDrop={e => { e.preventDefault(); if (dragId) { apiUpdate(dragId, { column: col.id }); setDragId(null); } setDragOverCol(null); }} style={{ borderRight: col.id !== 'done' ? '1px solid ' + B.border : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: isOver ? B.graphite + '88' : 'transparent', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid ' + B.border }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{col.icon}</span>
                    <h4 style={{ color: B.amber, fontSize: '11px', fontWeight: 700, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{col.label}</h4>
                  </div>
                  <span style={{ color: B.smoke, fontSize: '11px', background: B.graphite, padding: '1px 7px', borderRadius: '10px', fontFamily: "'JetBrains Mono', monospace" }}>{ct.length}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ct.length === 0 && <div style={{ textAlign: 'center', padding: '20px 8px', color: B.smoke, fontSize: '12px', border: '1px dashed ' + B.border, borderRadius: '8px', margin: '4px' }}>Drop tasks here</div>}
                  {ct.map(t => <TaskCard key={t.id} task={t} isSelected={selectedTask?.id === t.id} onSelect={() => setSelectedTask(t)} onDragStart={() => setDragId(t.id)} onDragEnd={() => { setDragId(null); setDragOverCol(null); }} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COL 3: DETAIL PANEL ── */}
      {selectedTask && <DetailPanel task={selectedTask} onUpdate={apiUpdate} onDelete={apiDelete} onClose={() => setSelectedTask(null)} />}

      {/* ── ADD TASK MODAL ── */}
      {modal && <AddModal form={form} setForm={setForm} suggested={suggestedAgents} onSubmit={createTask} onClose={() => setModal(false)} />}
    </div>
  );
}

// ═══ AGENT SIDEBAR ═══
function AgentSidebar({ agents, filterAgent, setFilterAgent }: { agents: AgentInfo[]; filterAgent: string; setFilterAgent: (v: string) => void }) {
  return (
    <div style={{ width: '280px', minWidth: '280px', background: B.carbon, borderRight: '1px solid ' + B.border, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid ' + B.border }}>
        <h3 style={{ color: B.amber, fontSize: '12px', fontWeight: 700, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>Agent Status</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {agents.map(agent => {
          const ad = AGENTS.find(a => a.id === agent.id);
          const active = filterAgent === agent.id;
          return (
            <div key={agent.id} onClick={() => setFilterAgent(active ? 'all' : agent.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? B.graphite : 'transparent', border: active ? '1px solid ' + agent.color + '44' : '1px solid transparent', transition: 'all 0.15s' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: agent.color, flexShrink: 0, boxShadow: agent.status === 'working' ? '0 0 8px ' + agent.color + '88' : 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px' }}>{ad?.emoji}</span>
                  <span style={{ color: B.white, fontSize: '13px', fontWeight: 600 }}>{agent.name}</span>
                </div>
                {agent.currentTask && <div style={{ color: B.smoke, fontSize: '11px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.currentTask}</div>}
              </div>
              <div style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', flexShrink: 0, background: statusColor(agent.status) + '22', color: statusColor(agent.status), border: '1px solid ' + statusColor(agent.status) + '44', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{statusLabel(agent.status)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: '1px solid ' + B.border, padding: '12px 16px' }}>
        <h4 style={{ color: B.smoke, fontSize: '10px', fontWeight: 700, margin: '0 0 10px 0', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>Workload</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {agents.filter(a => a.taskCount > 0).sort((a, b) => b.taskCount - a.taskCount).map(agent => (
            <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: agent.color, flexShrink: 0 }} />
              <span style={{ color: B.silver, fontSize: '11px', flex: 1 }}>{agent.name}</span>
              <span style={{ color: B.smoke, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{agent.taskCount}</span>
              <div style={{ width: '40px', height: '4px', background: B.graphite, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: Math.min((agent.taskCount / 4) * 100, 100) + '%', height: '100%', background: agent.color, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
          {agents.filter(a => a.taskCount > 0).length === 0 && <span style={{ color: B.smoke, fontSize: '11px' }}>No active tasks</span>}
        </div>
      </div>
    </div>
  );
}

// ═══ TASK CARD ═══
function TaskCard({ task: t, isSelected, onSelect, onDragStart, onDragEnd }: { task: Task; isSelected: boolean; onSelect: () => void; onDragStart: () => void; onDragEnd: () => void }) {
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onSelect} style={{ background: isSelected ? B.graphite : B.carbon, border: isSelected ? '1px solid ' + B.amber + '44' : '1px solid ' + B.border, borderRadius: '8px', padding: '10px 12px', cursor: 'grab', transition: 'border-color 0.15s' }}>
      <div style={{ color: B.white, fontWeight: 600, fontSize: '12px', marginBottom: '4px', lineHeight: 1.3 }}>{t.title}</div>
      {t.description && <div style={{ color: B.smoke, fontSize: '11px', marginBottom: '8px', lineHeight: 1.4, overflow: 'hidden' }}>{t.description.length > 80 ? t.description.slice(0, 80) + '...' : t.description}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, background: pc(t.priority) + '22', color: pc(t.priority), border: '1px solid ' + pc(t.priority) + '44', fontFamily: "'JetBrains Mono', monospace" }}>{t.priority.toUpperCase()}</span>
        <span style={{ fontSize: '10px' }} title={t.collaborationType}>{COLLAB_ICONS[t.collaborationType]}</span>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {t.assignedAgents.slice(0, 4).map(aid => <div key={aid} title={getAgentName(aid)} style={{ width: '8px', height: '8px', borderRadius: '50%', background: getAgentColor(aid), border: '1px solid ' + B.void }} />)}
          {t.assignedAgents.length > 4 && <span style={{ color: B.smoke, fontSize: '9px', fontFamily: "'JetBrains Mono', monospace" }}>+{t.assignedAgents.length - 4}</span>}
        </div>
        <span style={{ color: B.smoke, fontSize: '10px', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{t.estimatedHours}h</span>
      </div>
    </div>
  );
}

// ═══ DETAIL PANEL ═══
function DetailPanel({ task, onUpdate, onDelete, onClose }: { task: Task; onUpdate: (id: string, u: Partial<Task>) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [notes, setNotes] = useState(task.agentNotes);
  const [hours, setHours] = useState(task.estimatedHours);
  const prevId = useRef(task.id);

  useEffect(() => {
    if (prevId.current !== task.id) { setTitle(task.title); setDesc(task.description); setNotes(task.agentNotes); setHours(task.estimatedHours); prevId.current = task.id; }
  }, [task]);

  const save = (f: string, v: unknown) => onUpdate(task.id, { [f]: v } as Partial<Task>);
  const toggle = (aid: string) => { const c = task.assignedAgents; onUpdate(task.id, { assignedAgents: c.includes(aid) ? c.filter(a => a !== aid) : [...c, aid] }); };

  const inp: React.CSSProperties = { background: B.graphite, color: B.white, border: '1px solid ' + B.border, borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: "'Inter', system-ui, sans-serif" };

  return (
    <div style={{ width: '320px', minWidth: '320px', background: B.carbon, borderLeft: '1px solid ' + B.border, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid ' + B.border }}>
        <h3 style={{ color: B.amber, fontSize: '12px', fontWeight: 700, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>Task Details</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: B.smoke, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ marginBottom: '14px' }}><label style={LABEL_STYLE}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => { if (title !== task.title) save('title', title); }} style={inp} /></div>
        <div style={{ marginBottom: '14px' }}><label style={LABEL_STYLE}>Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => { if (desc !== task.description) save('description', desc); }} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div><label style={LABEL_STYLE}>Priority</label><select value={task.priority} onChange={e => save('priority', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select></div>
          <div><label style={LABEL_STYLE}>Column</label><select value={task.column} onChange={e => save('column', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: '14px' }}><label style={LABEL_STYLE}>Estimated Hours</label><input type="number" min={0.5} step={0.5} value={hours} onChange={e => setHours(parseFloat(e.target.value) || 1)} onBlur={() => { if (hours !== task.estimatedHours) save('estimatedHours', hours); }} style={{ ...inp, fontFamily: "'JetBrains Mono', monospace" }} /></div>
        <div style={{ marginBottom: '14px' }}>
          <label style={LABEL_STYLE}>Collaboration</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['solo', 'sequential', 'parallel'] as CollabType[]).map(ct => (
              <button key={ct} onClick={() => save('collaborationType', ct)} style={{ flex: 1, padding: '6px 4px', borderRadius: '6px', border: '1px solid ' + (task.collaborationType === ct ? B.amber + '66' : B.border), background: task.collaborationType === ct ? B.amber + '18' : B.graphite, color: task.collaborationType === ct ? B.amber : B.silver, cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'capitalize' as const }}>{COLLAB_ICONS[ct]} {ct}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={LABEL_STYLE}>Assigned Agents</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {AGENTS.map(a => {
              const on = task.assignedAgents.includes(a.id);
              return <button key={a.id} onClick={() => toggle(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', border: '1px solid ' + (on ? AGENT_COLORS[a.id] + '66' : B.border), background: on ? AGENT_COLORS[a.id] + '22' : B.graphite, color: on ? AGENT_COLORS[a.id] : B.smoke, cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.15s' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: on ? AGENT_COLORS[a.id] : B.smoke }} />{a.name}</button>;
            })}
          </div>
        </div>
        {task.collaborationType === 'sequential' && task.assignedAgents.length > 1 && (
          <div style={{ marginBottom: '14px' }}>
            <label style={LABEL_STYLE}>Handoff Chain</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {task.assignedAgents.map((aid, i) => (
                <div key={aid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: getAgentColor(aid) + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: getAgentColor(aid), fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
                  <span style={{ color: B.silver, fontSize: '12px' }}>{getAgentName(aid)}</span>
                  {i < task.assignedAgents.length - 1 && <span style={{ color: B.smoke, fontSize: '10px' }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom: '14px' }}><label style={LABEL_STYLE}>Agent Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => { if (notes !== task.agentNotes) save('agentNotes', notes); }} rows={4} style={{ ...inp, resize: 'vertical' as const, fontSize: '12px' }} placeholder="Notes for agents working this task..." /></div>
        <div style={{ fontSize: '11px', color: B.smoke, fontFamily: "'JetBrains Mono', monospace", marginBottom: '14px' }}>
          <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
          <div>Updated: {new Date(task.updatedAt).toLocaleDateString()}</div>
        </div>
        <button onClick={() => { if (confirm('Delete this task?')) onDelete(task.id); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid ' + B.error + '44', background: B.error + '11', color: B.error, cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>Delete Task</button>
      </div>
    </div>
  );
}

// ═══ ADD TASK MODAL ═══
function AddModal({ form, setForm, suggested, onSubmit, onClose }: { form: { title: string; description: string; priority: TaskPriority; column: TaskColumn; assignedAgents: string[]; collaborationType: CollabType; estimatedHours: number; agentNotes: string }; setForm: (f: typeof form) => void; suggested: string[]; onSubmit: () => void; onClose: () => void }) {
  const inp: React.CSSProperties = { background: B.graphite, color: B.white, border: '1px solid ' + B.border, borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontFamily: "'Inter', system-ui, sans-serif" };
  const toggleAgent = (aid: string) => {
    const c = form.assignedAgents;
    setForm({ ...form, assignedAgents: c.includes(aid) ? c.filter(a => a !== aid) : [...c, aid] });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ color: B.amber, fontSize: '18px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: '0 0 20px 0' }}>New Task</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div><label style={LABEL_STYLE}>Title</label><input placeholder="Task title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} /></div>
          <div><label style={LABEL_STYLE}>Description</label><textarea placeholder="What needs to be done..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={LABEL_STYLE}>Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })} style={{ ...inp, cursor: 'pointer' }}>{(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select></div>
            <div><label style={LABEL_STYLE}>Est. Hours</label><input type="number" min={0.5} step={0.5} value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || 1 })} style={{ ...inp, fontFamily: "'JetBrains Mono', monospace" }} /></div>
          </div>
          <div>
            <label style={LABEL_STYLE}>Collaboration Type</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['solo', 'sequential', 'parallel'] as CollabType[]).map(ct => (
                <button key={ct} onClick={() => setForm({ ...form, collaborationType: ct })} style={{ flex: 1, padding: '7px 4px', borderRadius: '6px', border: '1px solid ' + (form.collaborationType === ct ? B.amber + '66' : B.border), background: form.collaborationType === ct ? B.amber + '18' : B.graphite, color: form.collaborationType === ct ? B.amber : B.silver, cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'capitalize' as const }}>{COLLAB_ICONS[ct]} {ct}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={LABEL_STYLE}>Assign Agents</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {AGENTS.map(a => {
                const on = form.assignedAgents.includes(a.id);
                const isSuggested = suggested.includes(a.id) && !on;
                return (
                  <button key={a.id} onClick={() => toggleAgent(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', border: '1px solid ' + (on ? AGENT_COLORS[a.id] + '66' : isSuggested ? B.amber + '44' : B.border), background: on ? AGENT_COLORS[a.id] + '22' : B.graphite, color: on ? AGENT_COLORS[a.id] : isSuggested ? B.amber : B.smoke, cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.15s', position: 'relative' as const }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: on ? AGENT_COLORS[a.id] : isSuggested ? B.amber : B.smoke }} />
                    {a.name}
                    {isSuggested && <span style={{ fontSize: '8px', background: B.amber + '33', color: B.amber, padding: '1px 4px', borderRadius: '3px', fontFamily: "'JetBrains Mono', monospace" }}>AI</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div><label style={LABEL_STYLE}>Agent Notes</label><textarea placeholder="Instructions for assigned agents..." value={form.agentNotes} onChange={e => setForm({ ...form, agentNotes: e.target.value })} rows={2} style={{ ...inp, resize: 'vertical' as const, fontSize: '13px' }} /></div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid ' + B.border, color: B.silver, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
            <button onClick={onSubmit} style={{ background: B.amber, color: B.void, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>Create Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}