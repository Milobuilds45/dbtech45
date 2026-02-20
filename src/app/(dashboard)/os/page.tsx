'use client';

import { useEffect, useState } from 'react';
import { supabase, type Goal, type Todo, type Activity } from '@/lib/supabase';

const voidColors = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#22C55E', info: '#3B82F6', warning: '#EAB308',
  border: '#222222',
};

const cyberColors = {
  void: '#050e07', carbon: '#07120a', graphite: '#0a1a0e',
  amber: '#10ca78', amberLight: '#39ff7e', amberDark: '#0a9e5a',
  white: '#f0f0f0', silver: '#A3A3A3', smoke: '#737373',
  success: '#39ff7e', error: '#22C55E', info: '#3B82F6', warning: '#10ca78',
  border: 'rgba(16, 202, 120, 0.2)',
};

export default function OSPage() {
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbtech-color-mode');
      if (stored === 'cyber') setColorMode('cyber');
    } catch {}
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('dbtech-color-mode');
        setColorMode(stored === 'cyber' ? 'cyber' : 'void');
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    // Also poll for same-tab changes from sidebar toggle
    const interval = setInterval(handleStorage, 500);
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, []);

  const b = colorMode === 'cyber' ? cyberColors : voidColors;

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
        <div style={{ fontSize: '28px', fontWeight: 700, color: b.white, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>Derek OS</div>
        <div style={{ color: b.smoke, marginTop: '4px' }}>Operating system for Derek's AI agent ecosystem -- {goals.length} goals, {todos.length} todos tracked</div>
      </div>

      {/* MILO Mission Control - NEW! */}
      <div style={{ background: `linear-gradient(135deg, ${b.carbon}, ${b.graphite})`, border: `2px solid ${b.amber}`, borderRadius: '16px', padding: '32px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: b.amber, marginBottom: '12px', fontSize: '24px', fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
              MILO MISSION CONTROL
              <span style={{ 
                fontSize: '10px', 
                background: b.success, 
                color: b.void,
                padding: '3px 6px', 
                borderRadius: '3px', 
                fontWeight: 600 
              }}>
                NEW!
              </span>
            </h2>
            <p style={{ color: b.silver, marginBottom: '20px', fontSize: '16px' }}>
              Real-time gateway health, agent status, cron monitoring, and system alerts
            </p>
            <p style={{ color: b.smoke, fontSize: '14px' }}>
              Built by Milo during overnight ops • Live system diagnostics • Auto-refresh monitoring
            </p>
          </div>
          <div style={{ fontSize: '48px', color: b.amber, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, opacity: 0.15 }}>MC</div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button 
            style={{ 
              background: b.amber, 
              color: b.void, 
              border: 'none', 
              padding: '14px 28px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '16px',
              boxShadow: `0 4px 12px ${b.amber}33`
            }}
            onClick={() => window.location.href = '/os/mission-control'}
          >
            Launch Mission Control
          </button>
          <button 
            style={{ 
              background: 'none', 
              color: b.amber, 
              border: `2px solid ${b.amber}`, 
              padding: '12px 24px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 600, 
              fontSize: '14px' 
            }}
            onClick={() => alert('Features: Gateway health, Agent heartbeats, Cron monitoring, System alerts, Real-time diagnostics')}
          >
            View Features
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* Goals */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Live Goals Progress</h3>
          {goals.length === 0 && <div style={{ color: b.smoke, fontSize: '14px' }}>No active goals</div>}
          {goals.map((g) => {
            const pct = g.target_value ? Math.round((g.current_value / g.target_value) * 100) : 0;
            return (
              <div key={g.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                  <span style={{ color: b.silver }}>{g.title}</span>
                  <span style={{ color: progressColor(pct), fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                </div>
                <div style={{ background: b.graphite, height: '4px', borderRadius: '2px' }}>
                  <div style={{ background: progressColor(pct), width: `${pct}%`, height: '100%', borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
                {g.deadline && (
                  <div style={{ fontSize: '11px', color: b.smoke, marginTop: '2px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>Due: {new Date(g.deadline).toLocaleDateString()}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Todos */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Active Todos</h3>
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
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Agent Status</h3>
          {agents.map((a, i) => (
            <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: b.silver }}>{a.name}</span>
              <span style={{ color: b.success, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{a.status}</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', fontSize: '12px', color: b.smoke }}>All agents responding to heartbeat</div>
        </div>

        {/* Activity Feed */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Recent Activity</h3>
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
