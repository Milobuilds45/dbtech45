'use client';
import { useState, useEffect } from "react";
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

export default function Kanban() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadTodos = async () => {
    const { data } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
    if (data) setTodos(data);
    setLoading(false);
  };

  useEffect(() => { loadTodos(); }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    await supabase.from('todos').insert({
      title: newTask.trim(),
      status: 'backlog',
      priority: newPriority,
      assignee: newAssignee || null,
    });
    setNewTask('');
    setNewPriority('medium');
    setNewAssignee('');
    loadTodos();
  };

  const moveTask = async (taskId: string, newStatus: ColumnId) => {
    await supabase.from('todos').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', taskId);
    loadTodos();
  };

  const updatePriority = async (taskId: string, priority: Priority) => {
    await supabase.from('todos').update({ priority, updated_at: new Date().toISOString() }).eq('id', taskId);
    loadTodos();
  };

  const updateAssignee = async (taskId: string, assignee: string) => {
    await supabase.from('todos').update({ assignee: assignee || null, updated_at: new Date().toISOString() }).eq('id', taskId);
    loadTodos();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('todos').delete().eq('id', taskId);
    loadTodos();
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDrop = (col: ColumnId) => {
    if (!draggedId) return;
    moveTask(draggedId, col);
    setDraggedId(null);
  };

  const priorityColor = (p: string) => p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.success;
  const getColumnTasks = (col: ColumnId) => todos.filter(t => t.status === col);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Kanban Board</h1>
        <p style={styles.subtitle}>
          Drag cards between columns. Click a card to edit priority and assignee.
          {!loading && ` ${todos.filter(t => t.status !== 'done').length} active tasks.`}
        </p>

        {/* Flow info */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: brand.smoke, fontSize: '12px', fontWeight: 600 }}>FLOW:</span>
          <span style={{ color: brand.smoke, fontSize: '12px' }}>Ideas Vault &rarr;</span>
          {columns.map((c, i) => (
            <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              <span style={{ color: brand.silver, fontSize: '12px' }}>{c.title}</span>
              {i < columns.length - 1 && <span style={{ color: brand.smoke, fontSize: '12px' }}>&rarr;</span>}
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

        {loading ? (
          <div style={{ textAlign: 'center', color: brand.smoke, padding: '40px' }}>Loading from Supabase...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {columns.map(col => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(col.id)}
                  style={{ backgroundColor: brand.carbon, borderRadius: '12px', padding: '1rem', border: `1px solid ${brand.border}`, minHeight: '400px' }}>
                  <h3 style={{ color: col.color, marginBottom: '1rem', borderBottom: `2px solid ${col.color}`, paddingBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>
                    {col.title} ({colTasks.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {colTasks.map((task) => {
                      const isEditing = editingId === task.id;
                      return (
                        <div key={task.id} draggable onDragStart={() => handleDragStart(task.id)}
                          style={{
                            backgroundColor: isEditing ? '#1a1a2e' : brand.graphite,
                            padding: '1rem', borderRadius: '8px',
                            border: `1px solid ${isEditing ? brand.amber : brand.border}`,
                            cursor: 'grab',
                            transition: 'border-color 0.2s',
                          }}>
                          {/* Title + delete */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: brand.white, fontSize: '14px', flex: 1 }}>{task.title}</div>
                            <button onClick={() => deleteTask(task.id)}
                              style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px', opacity: 0.4, flexShrink: 0 }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}>x</button>
                          </div>

                          {/* Assignee + Priority display (clickable to edit) */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.silver, alignItems: 'center' }}>
                            <span
                              onClick={() => setEditingId(isEditing ? null : task.id)}
                              style={{ cursor: 'pointer', borderBottom: `1px dashed ${brand.border}`, paddingBottom: '1px' }}
                              title="Click to edit">
                              {task.assignee || 'Unassigned'}
                            </span>
                            <span
                              onClick={() => setEditingId(isEditing ? null : task.id)}
                              style={{
                                ...styles.badge(priorityColor(task.priority)),
                                cursor: 'pointer',
                              }}
                              title="Click to edit">
                              {task.priority}
                            </span>
                          </div>

                          {/* Edit panel */}
                          {isEditing && (
                            <div style={{
                              marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${brand.border}`,
                              display: 'flex', flexDirection: 'column', gap: '8px',
                            }}>
                              {/* Priority buttons */}
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
                              {/* Assignee select */}
                              <div>
                                <div style={{ fontSize: '11px', color: brand.smoke, marginBottom: '4px', fontWeight: 600 }}>ASSIGNEE</div>
                                <select
                                  value={task.assignee || ''}
                                  onChange={e => updateAssignee(task.id, e.target.value)}
                                  style={{
                                    width: '100%', background: brand.carbon, border: `1px solid ${brand.border}`,
                                    borderRadius: '6px', padding: '6px 8px', color: brand.silver, fontSize: '12px', outline: 'none',
                                  }}>
                                  <option value="">Unassigned</option>
                                  {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </div>
                              <button onClick={() => setEditingId(null)}
                                style={{
                                  padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                  background: brand.amber, color: brand.void, border: 'none', cursor: 'pointer',
                                  alignSelf: 'flex-end',
                                }}>Done</button>
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
