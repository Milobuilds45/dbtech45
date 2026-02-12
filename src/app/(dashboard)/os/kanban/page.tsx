'use client';
import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { brand, styles } from "@/lib/brand";

type ColumnId = 'backlog' | 'in_progress' | 'review' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  status: ColumnId;
  priority: Priority;
  assignee: string | null;
  project?: string;
}

const columns: { id: ColumnId; title: string; color: string }[] = [
  { id: 'backlog', title: 'To Do', color: brand.error },
  { id: 'in_progress', title: 'In Progress', color: brand.amber },
  { id: 'review', title: 'Review', color: brand.info },
  { id: 'done', title: 'Done', color: brand.success },
];

const AGENTS = ['Anders', 'Paula', 'Bobby', 'Milo', 'Remy', 'Tony', 'Dax', 'Webb', 'Dwight', 'Wendy', 'Derek'];

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Sunday Squares payment integration', status: 'backlog', priority: 'high', assignee: 'Anders', project: 'Sunday Squares' },
  { id: '2', title: 'Soul Solace mood tracking UI', status: 'backlog', priority: 'high', assignee: 'Paula', project: 'Soul Solace' },
  { id: '3', title: 'Signal & Noise newsletter draft', status: 'backlog', priority: 'medium', assignee: 'Remy' },
  { id: '4', title: 'tickR signal generation testing', status: 'in_progress', priority: 'high', assignee: 'Bobby', project: 'tickR' },
  { id: '5', title: 'Boundless itinerary AI training', status: 'in_progress', priority: 'medium', assignee: 'Webb', project: 'Boundless' },
  { id: '6', title: 'Restaurant cost tracker design', status: 'review', priority: 'medium', assignee: 'Paula' },
  { id: '7', title: 'dbtech45.com navigation links', status: 'done', priority: 'high', assignee: 'Anders', project: 'dbtech45' },
  { id: '8', title: 'Model Counsel API restoration', status: 'done', priority: 'high', assignee: 'Anders' },
];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export default function KanbanPage() {
  return (
    <Suspense fallback={<div style={styles.page}><p style={{ color: '#888' }}>Loading...</p></div>}>
      <Kanban />
    </Suspense>
  );
}

function Kanban() {
  const searchParams = useSearchParams();
  const [todos, setTodos] = useState<Task[]>(DEFAULT_TASKS);
  const [newTask, setNewTask] = useState('');

  // Accept incoming task from SaaS page or Ideas Vault via query params
  useEffect(() => {
    const title = searchParams.get('add_title');
    if (title) {
      const exists = todos.some(t => t.title === title);
      if (!exists) {
        setTodos(prev => [{
          id: genId(),
          title,
          status: 'backlog' as ColumnId,
          priority: 'high' as Priority,
          assignee: null,
          project: searchParams.get('add_project') || undefined,
        }, ...prev]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);

  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: genId(),
      title: newTask.trim(),
      status: 'backlog',
      priority: newPriority,
      assignee: newAssignee || null,
    };
    setTodos(prev => [task, ...prev]);
    setNewTask('');
    setNewPriority('medium');
    setNewAssignee('');
  }, [newTask, newPriority, newAssignee]);

  const moveTask = useCallback((taskId: string, newStatus: ColumnId) => {
    setTodos(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }, []);

  const updatePriority = useCallback((taskId: string, priority: Priority) => {
    setTodos(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
  }, []);

  const updateAssignee = useCallback((taskId: string, assignee: string) => {
    setTodos(prev => prev.map(t => t.id === taskId ? { ...t, assignee: assignee || null } : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTodos(prev => prev.filter(t => t.id !== taskId));
    if (editingId === taskId) setEditingId(null);
  }, [editingId]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  };

  const handleDragLeave = () => { setDragOverCol(null); };

  const handleDrop = (e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    if (draggedId) moveTask(draggedId, col);
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleTouchMove = useCallback((col: ColumnId) => {
    if (draggedId) moveTask(draggedId, col);
    setDraggedId(null);
  }, [draggedId, moveTask]);

  const priorityColor = (p: string) => p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.success;
  const getColumnTasks = (col: ColumnId) => todos.filter(t => t.status === col);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Kanban Board</h1>
        <p style={styles.subtitle}>
          Drag cards between columns. Click a card to edit priority and assignee.
          {` ${todos.filter(t => t.status !== 'done').length} active tasks.`}
        </p>

        {/* Flow info */}
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
            <input type="text" placeholder="What needs to be done?" value={newTask} onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()} style={{ ...styles.input, flex: 1, minWidth: '200px' }} />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
              <option value="">Unassigned</option>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={addTask} style={styles.button}>Add Task</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {columns.map(col => {
            const colTasks = getColumnTasks(col.id);
            const isOver = dragOverCol === col.id;
            return (
              <div key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  backgroundColor: isOver ? 'rgba(245,158,11,0.05)' : brand.carbon,
                  borderRadius: '12px', padding: '1rem',
                  border: `1px solid ${isOver ? brand.amber : brand.border}`,
                  minHeight: '400px',
                  transition: 'background-color 0.2s, border-color 0.2s',
                }}>
                <h3 style={{ color: col.color, marginBottom: '1rem', borderBottom: `2px solid ${col.color}`, paddingBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>
                  {col.title} ({colTasks.length})
                </h3>

                {draggedId && (
                  <button onClick={() => handleTouchMove(col.id)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'rgba(245,158,11,0.1)', border: `1px dashed ${brand.amber}`, borderRadius: '6px', color: brand.amber, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    Drop here
                  </button>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colTasks.map((task) => {
                    const isEditing = editingId === task.id;
                    return (
                      <div key={task.id} draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        style={{
                          backgroundColor: isEditing ? '#1a1a2e' : brand.graphite,
                          padding: '1rem', borderRadius: '8px',
                          border: `1px solid ${isEditing ? brand.amber : brand.border}`,
                          cursor: 'grab',
                          transition: 'border-color 0.2s, opacity 0.2s',
                          opacity: draggedId === task.id ? 0.5 : 1,
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 600, color: brand.white, fontSize: '14px', flex: 1 }}>{task.title}</div>
                          <button onClick={() => deleteTask(task.id)}
                            style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px', opacity: 0.4, flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}>x</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.silver, alignItems: 'center' }}>
                          <span onClick={() => setEditingId(isEditing ? null : task.id)}
                            style={{ cursor: 'pointer', borderBottom: `1px dashed ${brand.border}`, paddingBottom: '1px' }}
                            title="Click to edit">
                            {task.assignee || 'Unassigned'}
                          </span>
                          <span onClick={() => setEditingId(isEditing ? null : task.id)}
                            style={{ ...styles.badge(priorityColor(task.priority)), cursor: 'pointer' }}
                            title="Click to edit">
                            {task.priority}
                          </span>
                        </div>

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
                                    style={{
                                      padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                      cursor: 'pointer', textTransform: 'capitalize',
                                      border: task.priority === p ? 'none' : `1px solid ${brand.border}`,
                                      background: task.priority === p ? priorityColor(p) : 'transparent',
                                      color: task.priority === p ? brand.void : brand.smoke,
                                      transition: 'all 0.15s',
                                    }}>{p}</button>
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
                            <button onClick={() => setEditingId(null)}
                              style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: brand.amber, color: brand.void, border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>Done</button>
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

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
