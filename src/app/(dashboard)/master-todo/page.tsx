'use client';
import { useState } from "react";
import { brand, styles } from "@/lib/brand";

interface TodoItem { id: string; title: string; assignee: string; due: string; }

export default function MasterTodo() {
  const [newTask, setNewTask] = useState('');
  const groups = [
    { label: 'Critical — Today', color: brand.error, items: [
      { id: '1', title: 'Sunday Squares payment integration', assignee: 'Anders', due: 'EOD' },
      { id: '2', title: 'Model Counsel API restoration', assignee: 'Anders', due: 'EOD' },
      { id: '3', title: 'Fix dbtech45.com navigation links', assignee: 'Anders', due: 'Now' },
    ]},
    { label: 'High — This Week', color: brand.amber, items: [
      { id: '4', title: 'Soul Solace mood tracking UI', assignee: 'Paula & Anders', due: 'Wed' },
      { id: '5', title: 'Signal & Noise newsletter draft', assignee: 'Grant', due: 'Fri' },
      { id: '6', title: 'tickR signal generation testing', assignee: 'Bobby', due: 'Thu' },
    ]},
    { label: 'Medium — Next Week', color: brand.success, items: [
      { id: '7', title: 'Boundless itinerary AI training', assignee: 'Webb', due: 'Feb 17' },
      { id: '8', title: 'Restaurant cost tracker design', assignee: 'Paula', due: 'Feb 18' },
      { id: '9', title: 'Family calendar AI testing', assignee: 'Tony', due: 'Feb 20' },
    ]},
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Master Todo</h1>
        <p style={styles.subtitle}>Central task management across all projects and operations.</p>

        <div style={styles.grid}>
          {groups.map((g, i) => (
            <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${g.color}` }}>
              <h3 style={{ color: g.color, marginBottom: '1rem', fontSize: '14px', fontWeight: 600 }}>{g.label}</h3>
              {g.items.map((item: TodoItem) => (
                <div key={item.id} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${brand.border}` }}>
                  <div style={{ fontWeight: 600, color: brand.white, fontSize: '14px', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: brand.smoke }}>{item.assignee} — Due: {item.due}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, marginTop: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>Add Task</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="text" placeholder="Task description..." value={newTask} onChange={(e) => setNewTask(e.target.value)}
              style={{ ...styles.input, flex: 1 }} />
            <button style={styles.button}>Add</button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
