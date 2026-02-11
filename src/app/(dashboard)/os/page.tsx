'use client';

import { useEffect, useState } from 'react';
import { supabase, type Goal, type Todo, type Activity } from '@/lib/supabase';

export default function OSPage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
    border: '#222222',
  };

  const [goals, setGoals] = useState<Goal[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [goalsRes, todosRes, activitiesRes] = await Promise.all([
        supabase.from('goals').select('*').eq('status', 'active').order('priority', { ascending: false }),
        supabase.from('todos').select('*').neq('status', 'done').order('priority', { ascending: false }).limit(6),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
      ]);
      if (goalsRes.data) setGoals(goalsRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const agents = [
    { name: 'Anders (Full Stack)', status: 'Online' },
    { name: 'Paula (Design)', status: 'Online' },
    { name: 'Bobby (Trading)', status: 'Online' },
    { name: 'Milo (Operations)', status: 'Online' },
  ];

  const card: React.CSSProperties = {
    background: b.carbon,
    border: `1px solid ${b.border}`,
    borderRadius: '12px',
    padding: '20px',
  };

  const priorityColor = (p: string) => p === 'high' ? b.error : p === 'medium' ? b.amber : b.smoke;
  const progressColor = (pct: number) => pct >= 80 ? b.success : pct >= 50 ? b.amber : b.info;

  if (loading) {
    return (
      <div style={{ padding: '60px 30px', textAlign: 'center', color: b.smoke }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: b.amber }}>Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 30px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: b.white }}>Mission Control</div>
        <div style={{ color: b.smoke, marginTop: '4px' }}>Real-time data from Supabase -- {goals.length} goals, {todos.length} todos tracked</div>
      </div>

      {/* Brand Assets */}
      <div style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '16px', padding: '32px', marginBottom: '30px' }}>
        <h2 style={{ color: b.amber, marginBottom: '16px', fontSize: '20px', fontWeight: 700 }}>Brand Assets by Paula</h2>
        <p style={{ color: b.silver, marginBottom: '20px', fontSize: '14px' }}>Complete DBTECH45 brand system</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button style={{ background: b.amber, color: b.void, border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', '_blank')}>
            Brand Kit (Print Ready)
          </button>
          <button style={{ background: b.graphite, color: b.amber, border: `1px solid ${b.amber}`, padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', '_blank')}>
            Design System Spec
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* Goals */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Live Goals Progress</h3>
          {goals.length === 0 && <div style={{ color: b.smoke, fontSize: '14px' }}>No active goals</div>}
          {goals.map((g) => {
            const pct = g.target_value ? Math.round((g.current_value / g.target_value) * 100) : 0;
            return (
              <div key={g.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                  <span style={{ color: b.silver }}>{g.title}</span>
                  <span style={{ color: progressColor(pct) }}>{pct}%</span>
                </div>
                <div style={{ background: b.graphite, height: '4px', borderRadius: '2px' }}>
                  <div style={{ background: progressColor(pct), width: `${pct}%`, height: '100%', borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
                {g.deadline && (
                  <div style={{ fontSize: '11px', color: b.smoke, marginTop: '2px' }}>Due: {new Date(g.deadline).toLocaleDateString()}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Todos */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Active Todos</h3>
          {todos.length === 0 && <div style={{ color: b.smoke, fontSize: '14px' }}>All clear</div>}
          {todos.map((t) => (
            <div key={t.id} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${b.border}` }}>
              <div style={{ fontWeight: 600, color: b.white, fontSize: '14px' }}>{t.title}</div>
              <div style={{ fontSize: '12px', color: b.smoke }}>
                {t.assignee && <span>{t.assignee}</span>}
                {t.priority && <span style={{ color: priorityColor(t.priority), marginLeft: t.assignee ? '8px' : 0 }}>{t.priority}</span>}
                {t.due_date && <span style={{ marginLeft: '8px' }}>Due: {new Date(t.due_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Agent Status */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Agent Status</h3>
          {agents.map((a, i) => (
            <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: b.silver }}>{a.name}</span>
              <span style={{ color: b.success }}>{a.status}</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', fontSize: '12px', color: b.smoke }}>All agents responding to heartbeat</div>
        </div>

        {/* Activity Feed */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Recent Activity</h3>
          {activities.length === 0 && <div style={{ color: b.smoke, fontSize: '14px' }}>No activity yet</div>}
          {activities.map((a) => (
            <div key={a.id} style={{ marginBottom: '10px', display: 'flex', gap: '12px', fontSize: '14px' }}>
              <div style={{ color: b.smoke, minWidth: '60px', fontSize: '12px' }}>
                {new Date(a.created_at).toLocaleDateString()}
              </div>
              <div>
                <span style={{ color: b.white, fontWeight: 500 }}>{a.title}</span>
                {a.agent && <span style={{ color: b.amber, marginLeft: '8px', fontSize: '12px' }}>{a.agent}</span>}
                {a.description && <div style={{ color: b.smoke, fontSize: '12px', marginTop: '2px' }}>{a.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: b.smoke, fontSize: '14px' }}>
        <p><strong style={{ color: b.silver }}>Derek OS V4</strong> -- Powered by Supabase</p>
        <p>Built by Anders -- Feb 11, 2026</p>
      </div>
    </div>
  );
}
