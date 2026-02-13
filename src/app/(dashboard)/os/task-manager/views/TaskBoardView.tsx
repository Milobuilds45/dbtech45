'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskColumn = 'backlog' | 'in-progress' | 'review' | 'done';

interface Task {
  id: string; title: string; description: string; priority: TaskPriority;
  agent: string; dueDate: string; column: TaskColumn; createdAt: string;
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

const AR = [
  { name: 'Milo' }, { name: 'Anders' }, { name: 'Paula' }, { name: 'Bobby' },
  { name: 'Dwight' }, { name: 'Tony' }, { name: 'Dax' }, { name: 'Remy' }, { name: 'Wendy' },
];

const COLS: { id: TaskColumn; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function pc(p: TaskPriority) {
  return { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#6B7280' }[p];
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const TK = 'milo-mc-tasks';
function loadT(): Task[] {
  try { const r = typeof window !== 'undefined' ? localStorage.getItem(TK) : null; return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveT(t: Task[]) { if (typeof window !== 'undefined') localStorage.setItem(TK, JSON.stringify(t)); }

// ═══ MAIN COMPONENT ═══
export default function TaskBoardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [taskFA, setTaskFA] = useState('all');
  const [taskFP, setTaskFP] = useState('all');
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, agent: 'Milo', dueDate: '', column: 'backlog' as TaskColumn });

  useEffect(() => { setTasks(loadT()); setLoading(false); }, []);
  useEffect(() => { if (!loading) saveT(tasks); }, [tasks, loading]);

  const sel: React.CSSProperties = { background: B.graphite, color: B.silver, border: '1px solid ' + B.border, borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' };
  const inp: React.CSSProperties = { background: B.graphite, color: B.white, border: '1px solid ' + B.border, borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const };

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks(p => [...p, { ...form, id: uid(), createdAt: new Date().toISOString() }]);
    setForm({ title: '', description: '', priority: 'medium', agent: 'Milo', dueDate: '', column: 'backlog' });
    setModal(false);
  };
  const deleteTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));
  const moveTask = (id: string, col: TaskColumn) => setTasks(p => p.map(t => t.id === id ? { ...t, column: col } : t));

  const fTasks = tasks.filter(t => (taskFA === 'all' || t.agent === taskFA) && (taskFP === 'all' || t.priority === taskFP));

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setModal(true)} style={{ background: B.amber, color: B.void, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>+ Add Task</button>
        <select value={taskFA} onChange={e => setTaskFA(e.target.value)} style={sel}><option value="all">All Agents</option>{AR.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}</select>
        <select value={taskFP} onChange={e => setTaskFP(e.target.value)} style={sel}><option value="all">All Priorities</option>{(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select>
        <span style={{ color: B.smoke, fontSize: '12px', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{fTasks.length} task{fTasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {COLS.map(col => {
          const ct = fTasks.filter(t => t.column === col.id);
          return (
            <div key={col.id}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={e => { e.preventDefault(); if (dragId) { moveTask(dragId, col.id); setDragId(null); } }}
              style={{ background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '16px', minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ color: B.amber, fontSize: '14px', fontWeight: 700, margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{col.label}</h4>
                <span style={{ color: B.smoke, fontSize: '12px', background: B.graphite, padding: '2px 8px', borderRadius: '10px', fontFamily: "'JetBrains Mono', monospace" }}>{ct.length}</span>
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
                    {t.dueDate && <span style={{ color: B.smoke, fontSize: '11px', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{t.dueDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ color: B.amber, fontSize: '18px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: 0, marginBottom: '20px' }}>New Task</h3>
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
    </div>
  );
}
