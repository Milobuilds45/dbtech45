'use client';
import { useState, useEffect } from "react";
import { brand, styles } from "@/lib/brand";
import { supabase, type Todo } from "@/lib/supabase";

export default function MasterTodo() {
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const agents = ['Anders', 'Paula', 'Bobby', 'Milo', 'Remy', 'Tony', 'Dax', 'Webb', 'Dwight', 'Wendy'];

  const loadTodos = async () => {
    const { data } = await supabase.from('todos').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
    if (data) setTodos(data);
    setLoading(false);
  };

  useEffect(() => { loadTodos(); }, []);

  const addTodo = async () => {
    if (!newTask.trim()) return;
    await supabase.from('todos').insert({
      title: newTask.trim(),
      assignee: newAssignee || null,
      priority: newPriority,
      status: 'backlog',
    });
    setNewTask('');
    setNewAssignee('');
    setNewPriority('medium');
    loadTodos();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('todos').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    loadTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id);
    loadTodos();
  };

  const priorityColor = (p: string) => p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.success;
  const statusLabel: Record<string, string> = { backlog: 'Backlog', in_progress: 'In Progress', review: 'Review', done: 'Done' };

  const grouped = {
    critical: todos.filter(t => t.priority === 'high' && t.status !== 'done'),
    active: todos.filter(t => t.priority === 'medium' && t.status !== 'done'),
    low: todos.filter(t => t.priority === 'low' && t.status !== 'done'),
    done: todos.filter(t => t.status === 'done'),
  };

  const groups = [
    { label: 'Critical', color: brand.error, items: grouped.critical },
    { label: 'Active', color: brand.amber, items: grouped.active },
    { label: 'Low Priority', color: brand.success, items: grouped.low },
    { label: 'Done', color: brand.smoke, items: grouped.done.slice(0, 5) },
  ];

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', color: brand.smoke, padding: '60px' }}>Loading todos from Supabase...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Master Todo</h1>
        <p style={styles.subtitle}>Central task management. {todos.filter(t => t.status !== 'done').length} active, {grouped.done.length} completed.</p>

        <div style={styles.grid}>
          {groups.map((g, i) => (
            <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${g.color}` }}>
              <h3 style={{ color: g.color, marginBottom: '1rem', fontSize: '14px', fontWeight: 600 }}>
                {g.label} ({g.items.length})
              </h3>
              {g.items.length === 0 && <div style={{ color: brand.smoke, fontSize: '13px' }}>Nothing here</div>}
              {g.items.map((item) => (
                <div key={item.id} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${brand.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, color: item.status === 'done' ? brand.smoke : brand.white, fontSize: '14px', marginBottom: '0.25rem', textDecoration: item.status === 'done' ? 'line-through' : 'none' }}>
                      {item.title}
                    </div>
                    <button onClick={() => deleteTodo(item.id)}
                      style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px', opacity: 0.4, flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}>x</button>
                  </div>
                  <div style={{ fontSize: '12px', color: brand.smoke, marginBottom: '6px' }}>
                    {item.assignee && <span>{item.assignee}</span>}
                    {item.due_date && <span style={{ marginLeft: item.assignee ? '8px' : 0 }}>Due: {new Date(item.due_date).toLocaleDateString()}</span>}
                    {item.project && <span style={{ marginLeft: '8px', color: brand.amber }}>{item.project}</span>}
                  </div>
                  {item.status !== 'done' && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['backlog', 'in_progress', 'review', 'done'].map(s => (
                        <button key={s} onClick={() => updateStatus(item.id, s)}
                          style={{
                            padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                            border: item.status === s ? 'none' : `1px solid ${brand.border}`,
                            background: item.status === s ? priorityColor(item.priority) : 'transparent',
                            color: item.status === s ? brand.void : brand.smoke,
                          }}>{statusLabel[s] || s}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, marginTop: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>Add Task</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Task description..." value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              style={{ ...styles.input, flex: 1, minWidth: '200px' }} />
            <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px' }}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px' }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button style={styles.button} onClick={addTodo}>Add</button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
