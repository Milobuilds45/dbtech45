'use client';
import { useState } from "react";
import { brand, styles } from "@/lib/brand";

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: string;
}

type ColumnId = 'todo' | 'progress' | 'review' | 'done';

export default function Kanban() {
  const [tasks, setTasks] = useState<Record<ColumnId, Task[]>>({
    todo: [
      { id: '1', title: 'Sunday Squares payment integration', assignee: 'Anders', priority: 'High' },
      { id: '2', title: 'Soul Solace mood tracking UI', assignee: 'Paula', priority: 'High' },
      { id: '3', title: 'Signal & Noise newsletter draft', assignee: 'Grant', priority: 'Medium' }
    ],
    progress: [
      { id: '4', title: 'tickR signal generation testing', assignee: 'Bobby', priority: 'High' },
      { id: '5', title: 'Boundless itinerary AI training', assignee: 'Webb', priority: 'Medium' }
    ],
    review: [
      { id: '6', title: 'Restaurant cost tracker design', assignee: 'Paula', priority: 'Medium' }
    ],
    done: [
      { id: '7', title: 'dbtech45.com navigation links', assignee: 'Anders', priority: 'High' },
      { id: '8', title: 'Model Counsel API restoration', assignee: 'Anders', priority: 'Critical' }
    ]
  });

  const [newTask, setNewTask] = useState('');
  const [draggedTask, setDraggedTask] = useState<(Task & { sourceColumn: ColumnId }) | null>(null);

  const columns: { id: ColumnId; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: brand.error },
    { id: 'progress', title: 'In Progress', color: brand.amber },
    { id: 'review', title: 'Review', color: brand.info },
    { id: 'done', title: 'Done', color: brand.success }
  ];

  const addTask = () => {
    if (newTask.trim()) {
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, { id: Date.now().toString(), title: newTask, assignee: 'Unassigned', priority: 'Medium' }]
      }));
      setNewTask('');
    }
  };

  const handleDragStart = (task: Task, columnId: ColumnId) => {
    setDraggedTask({ ...task, sourceColumn: columnId });
  };

  const handleDrop = (targetColumn: ColumnId) => {
    if (!draggedTask) return;
    const src = draggedTask.sourceColumn;
    if (src === targetColumn) return;
    setTasks(prev => ({
      ...prev,
      [src]: prev[src].filter(t => t.id !== draggedTask.id),
      [targetColumn]: [...prev[targetColumn], { id: draggedTask.id, title: draggedTask.title, assignee: draggedTask.assignee, priority: draggedTask.priority }]
    }));
    setDraggedTask(null);
  };

  const priorityColor = (p: string) => p === 'Critical' ? brand.error : p === 'High' ? brand.amber : p === 'Medium' ? brand.warning : brand.success;

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Kanban Board</h1>
        <p style={styles.subtitle}>Drag and drop tasks between columns to update status.</p>

        <div style={{ ...styles.card, marginBottom: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>New Task</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="What needs to be done?" value={newTask} onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()} style={{ ...styles.input, flex: 1 }} />
            <button onClick={addTask} style={styles.button}>Add Task</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {columns.map(col => (
            <div key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
              style={{ backgroundColor: brand.carbon, borderRadius: '12px', padding: '1rem', border: `1px solid ${brand.border}`, minHeight: '400px' }}>
              <h3 style={{ color: col.color, marginBottom: '1rem', borderBottom: `2px solid ${col.color}`, paddingBottom: '0.5rem', fontSize: '14px', fontWeight: 600 }}>
                {col.title} ({(tasks[col.id] || []).length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(tasks[col.id] || []).map((task) => (
                  <div key={task.id} draggable onDragStart={() => handleDragStart(task, col.id)}
                    style={{ backgroundColor: brand.graphite, padding: '1rem', borderRadius: '8px', border: `1px solid ${brand.border}`, cursor: 'grab' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: brand.white, fontSize: '14px' }}>{task.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.silver }}>
                      <span>{task.assignee}</span>
                      <span style={styles.badge(priorityColor(task.priority))}>{task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
