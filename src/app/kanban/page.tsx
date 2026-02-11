'use client';
import { useState } from "react";

export default function Kanban() {
  const [tasks, setTasks] = useState({
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
  const [draggedTask, setDraggedTask] = useState<any>(null);

  const columns = [
    { id: 'todo' as const, title: '📋 To Do', color: '#ef4444' },
    { id: 'progress' as const, title: '⚡ In Progress', color: '#f59e0b' },
    { id: 'review' as const, title: '👀 Review', color: '#8b5cf6' },
    { id: 'done' as const, title: '✅ Done', color: '#22c55e' }
  ];

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now().toString(),
        title: newTask,
        assignee: 'Unassigned',
        priority: 'Medium'
      };
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, task]
      }));
      setNewTask('');
    }
  };

  const handleDragStart = (e: any, task: any, columnId: string) => {
    setDraggedTask({ ...task, sourceColumn: columnId });
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = (e: any, targetColumn: keyof typeof tasks) => {
    e.preventDefault();
    if (!draggedTask) return;

    const sourceColumn = draggedTask.sourceColumn as keyof typeof tasks;
    if (sourceColumn === targetColumn) return;

    setTasks(prev => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter((t: any) => t.id !== draggedTask.id),
      [targetColumn]: [...prev[targetColumn], { ...draggedTask, sourceColumn: undefined }]
    }));
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return '#ff0000';
      case 'High': return '#ff6600';
      case 'Medium': return '#ffaa00';
      case 'Low': return '#00ff00';
      default: return '#999';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>kanban --board --all-projects</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>📋 Kanban Board</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Drag and drop tasks between columns to update status.</p>
        
        {/* Add New Task */}
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #333' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>+ Add New Task</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              style={{ 
                flex: 1,
                padding: '0.75rem', 
                backgroundColor: '#222', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}
            />
            <button 
              onClick={addTask}
              style={{ 
                backgroundColor: '#00ff00', 
                color: '#000', 
                padding: '0.75rem 2rem', 
                border: 'none', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Kanban Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {columns.map(column => (
            <div 
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              style={{ 
                backgroundColor: '#111', 
                borderRadius: '8px', 
                padding: '1rem',
                border: '1px solid #333',
                minHeight: '400px'
              }}
            >
              <h3 style={{ 
                color: column.color, 
                marginBottom: '1rem', 
                borderBottom: `2px solid ${column.color}`,
                paddingBottom: '0.5rem'
              }}>
                {column.title} ({(tasks[column.id] || []).length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(tasks[column.id] || []).map((task: any) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    style={{
                      backgroundColor: '#222',
                      padding: '1rem',
                      borderRadius: '6px',
                      border: '1px solid #333',
                      cursor: 'grab',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = column.color}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                  >
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#fff' }}>
                      {task.title}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      <span>{task.assignee}</span>
                      <span style={{ 
                        color: getPriorityColor(task.priority),
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}