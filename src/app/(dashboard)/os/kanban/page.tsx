'use client';
import { useState, useEffect, useCallback } from "react";
import { brand, styles } from "@/lib/brand";
import { supabase, type Todo } from "@/lib/supabase";

type ColumnId = 'backlog' | 'in_progress' | 'review' | 'done';
type Priority = 'low' | 'medium' | 'high';

const columns: { id: ColumnId; title: string; color: string }[] = [
  { id: 'backlog', title: 'To Do', color: brand.error },
  { id: 'in_progress', title: 'In Progress', color: brand.amber },
  { id: 'review', title: 'Review', color: brand.info },
  { id: 'done', title: 'Done', color: brand.success },
];

const AGENTS = ['Anders', 'Paula', 'Bobby', 'Milo', 'Remy', 'Tony', 'Dax', 'Webb', 'Dwight', 'Wendy', 'Derek'];
const CACHE_KEY = 'axecap-kanban-cache';

export default function Kanban() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);

  // Save to localStorage cache
  const cacheLocally = useCallback((data: Todo[]) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch { /* full */ }
  }, []);

  // Load from Supabase, fall back to localStorage
  const loadTodos = useCallback(async () => {
    try {
      const { data, error: dbErr } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(AbortSignal.timeout(6000));

      if (dbErr) throw dbErr;
      if (data) {
        setTodos(data);
        setDbConnected(true);
        cacheLocally(data);
        setError(null);
        return;
      }
    } catch (err) {
      console.error('Supabase load failed:', err);
      setDbConnected(false);
    }

    // Fallback: localStorage
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        if (Array.isArray(data)) { setTodos(data); setError('Offline mode - changes saved locally'); return; }
      }
      // Try old cache format
      const old = localStorage.getItem('kanban-cache');
      if (old) {
        const { data } = JSON.parse(old);
        if (Array.isArray(data)) { setTodos(data); setError('Offline mode - changes saved locally'); return; }
      }
    } catch { /* ignore */ }
    setError('Could not load tasks');
  }, [cacheLocally]);

  useEffect(() => { loadTodos().finally(() => setLoading(false)); }, [loadTodos]);

  const addTask = useCallback(async () => {
    if (!newTask.trim()) return;
    const task = { title: newTask.trim(), status: 'backlog' as ColumnId, priority: newPriority, assignee: newAssignee || null };

    if (dbConnected) {
      const { error: err } = await supabase.from('todos').insert(task);
      if (err) { console.error('Insert failed:', err); setError('Failed to add task'); return; }
    } else {
      // Local-only fallback
      const localTask: Todo = { ...task, id: crypto.randomUUID(), description: null, due_date: null, project: null, tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const next = [localTask, ...todos];
      setTodos(next);
      cacheLocally(next);
    }
    setNewTask(''); setNewPriority('medium'); setNewAssignee('');
    if (dbConnected) loadTodos();
  }, [newTask, newPriority, newAssignee, dbConnected, todos, cacheLocally, loadTodos]);

  const moveTask = useCallback(async (taskId: string, newStatus: ColumnId) => {
    // Optimistic update
    const updated = todos.map(t => t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t);
    setTodos(updated);
    cacheLocally(updated);

    if (dbConnected) {
      const { error: err } = await supabase.from('todos').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', taskId);
      if (err) { console.error('Move failed:', err); loadTodos(); }
    }
  }, [todos, dbConnected, cacheLocally, loadTodos]);

  const updatePriority = useCallback(async (taskId: string, priority: Priority) => {
    const updated = todos.map(t => t.id === taskId ? { ...t, priority, updated_at: new Date().toISOString() } : t);
    setTodos(updated);
    cacheLocally(updated);
    if (dbConnected) { await supabase.from('todos').update({ priority, updated_at: new Date().toISOString() }).eq('id', taskId); }
  }, [todos, dbConnected, cacheLocally]);

  const updateAssignee = useCallback(async (taskId: string, assignee: string) => {
    const updated = todos.map(t => t.id === taskId ? { ...t, assignee: assignee || null, updated_at: new Date().toISOString() } : t);
    setTodos(updated);
    cacheLocally(updated);
    if (dbConnected) { await supabase.from('todos').update({ assignee: assignee || null, updated_at: new Date().toISOString() }).eq('id', taskId); }
  }, [todos, dbConnected, cacheLocally]);

  const deleteTask = useCallback(async (taskId: string) => {
    const updated = todos.filter(t => t.id !== taskId);
    setTodos(updated);
    cacheLocally(updated);
    if (editingId === taskId) setEditingId(null);
    if (dbConnected) { await supabase.from('todos').delete().eq('id', taskId); }
  }, [todos, dbConnected, cacheLocally, editingId]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
  };
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    setDraggedId(null); setDragOverCol(null);
  };
  const handleDragOver = (e: React.DragEvent, col: ColumnId) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(col); };
  const handleDragLeave = () => setDragOverCol(null);
  const handleDrop = (e: React.DragEvent, col: ColumnId) => { e.preventDefault(); if (draggedId) moveTask(draggedId, col); setDraggedId(null); setDragOverCol(null); };

  const priorityColor = (p: string) => p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.success;
  const getColumnTasks = (col: ColumnId) => todos.filter(t => t.status === col);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Kanban Board</h1>
        <p style={styles.subtitle}>
          Drag cards between columns or use quick-move buttons.
          {!loading && ` ${todos.filter(t => t.status !== 'done').length} active tasks.`}
          <span style={{ marginLeft: 8, fontSize: 11, color: dbConnected ? brand.success : brand.amber }}>{dbConnected ? 'Synced' : 'Local'}</span>
        </p>

        {/* Flow */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: brand.smoke, fontSize: '12px', fontWeight: 600 }}>FLOW:</span>
          {columns.map((c, i) => (
            <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              <span style={{ color: brand.silver, fontSize: '12px' }}>{c.title}</span>
              {i < columns.length - 1 && <span style={{ color: brand.smoke, fontSize: '12px' }}>{'->'}</span>}
            </span>
          ))}
        </div>

        {/* Add Task */}
        <div style={{ ...styles.card, marginBottom: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>New Task</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="What needs to be done?" value={newTask} onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()} style={{ ...styles.input, flex: 1, minWidth: '200px' }} />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
            <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
              <option value="">Unassigned</option>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={addTask} style={styles.button}>Add Task</button>
          </div>
        </div>

        {error && (
          <div style={{ ...styles.card, background: 'rgba(245,158,11,0.08)', border: `1px solid ${brand.amber}`, textAlign: 'center', padding: '12px', marginBottom: '20px' }}>
            <span style={{ color: brand.amber, fontSize: '13px' }}>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {columns.map(col => (
              <div key={col.id} style={{ ...styles.card, borderTop: `3px solid ${col.color}`, minHeight: '400px' }}>
                <h3 style={{ color: brand.white, fontSize: '14px', fontWeight: 600, marginBottom: '1rem' }}>{col.title}</h3>
                {[1,2,3].map(i => (<div key={i} style={{ background: brand.graphite, borderRadius: '8px', height: '80px', opacity: 0.4, marginBottom: '12px' }} />))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {columns.map(col => {
              const colTasks = getColumnTasks(col.id);
              const isOver = dragOverCol === col.id;
              return (
                <div key={col.id}
                  onDragOver={e => handleDragOver(e, col.id)} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, col.id)}
                  style={{ backgroundColor: isOver ? 'rgba(245,158,11,0.05)' : brand.carbon, borderRadius: '12px', padding: '1rem', border: `1px solid ${isOver ? brand.amber : brand.border}`, minHeight: '400px', transition: 'all 0.2s' }}>
                  <h3 style={{ color: col.color, marginBottom: '1rem', borderBottom: `2px solid ${col.color}`, paddingBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>
                    {col.title} ({colTasks.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {colTasks.map(task => {
                      const isEditing = editingId === task.id;
                      return (
                        <div key={task.id} draggable onDragStart={e => handleDragStart(e, task.id)} onDragEnd={handleDragEnd}
                          style={{ backgroundColor: isEditing ? '#1a1a2e' : brand.graphite, padding: '1rem', borderRadius: '8px', border: `1px solid ${isEditing ? brand.amber : brand.border}`, cursor: 'grab', transition: 'all 0.2s', opacity: draggedId === task.id ? 0.5 : 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: brand.white, fontSize: '14px', flex: 1 }}>{task.title}</div>
                            <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px', opacity: 0.4 }}
                              onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}>x</button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.silver, alignItems: 'center' }}>
                            <span onClick={() => setEditingId(isEditing ? null : task.id)} style={{ cursor: 'pointer', borderBottom: `1px dashed ${brand.border}`, paddingBottom: '1px' }}>{task.assignee || 'Unassigned'}</span>
                            <span onClick={() => setEditingId(isEditing ? null : task.id)} style={{ ...styles.badge(priorityColor(task.priority)), cursor: 'pointer' }}>{task.priority}</span>
                          </div>

                          {/* Quick move buttons */}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                            {columns.filter(c => c.id !== task.status).map(c => (
                              <button key={c.id} onClick={() => moveTask(task.id, c.id)}
                                style={{ flex: 1, padding: '3px 0', borderRadius: '4px', fontSize: '9px', fontWeight: 600, cursor: 'pointer', background: 'transparent', border: `1px solid ${brand.border}`, color: brand.smoke, transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.color = c.color; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = brand.border; e.currentTarget.style.color = brand.smoke; }}>
                                {c.title}
                              </button>
                            ))}
                          </div>

                          {isEditing && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${brand.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: brand.smoke, marginBottom: '4px', fontWeight: 600 }}>PRIORITY</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {(['high', 'medium', 'low'] as Priority[]).map(p => (
                                    <button key={p} onClick={() => updatePriority(task.id, p)}
                                      style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', border: task.priority === p ? 'none' : `1px solid ${brand.border}`, background: task.priority === p ? priorityColor(p) : 'transparent', color: task.priority === p ? brand.void : brand.smoke }}>{p}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: brand.smoke, marginBottom: '4px', fontWeight: 600 }}>ASSIGNEE</div>
                                <select value={task.assignee || ''} onChange={e => updateAssignee(task.id, e.target.value)}
                                  style={{ width: '100%', background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '6px 8px', color: brand.silver, fontSize: '12px', outline: 'none' }}>
                                  <option value="">Unassigned</option>
                                  {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </div>
                              <button onClick={() => setEditingId(null)} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: brand.amber, color: brand.void, border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>Done</button>
                            </div>
                          )}
                          {task.project && <div style={{ fontSize: '11px', color: brand.amber, marginTop: '4px' }}>{task.project}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
