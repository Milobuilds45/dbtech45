'use client';

import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';

interface Habit {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

const DEFAULT_HABITS = [
  { name: 'Trading Journal', icon: '📊' },
  { name: 'Build Time', icon: '💻' },
  { name: 'Read with Kids', icon: '📖' },
  { name: 'Exercise', icon: '🏋️' },
  { name: 'No Alcohol', icon: '🚫' },
];

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getStreak(logs: HabitLog[], habitId: string): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.habit_id === habitId && l.date === dateStr && l.completed);
    if (log) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupDone, setSetupDone] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const last7 = getLastNDays(7);

  const loadData = useCallback(async () => {
    try {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (habitsData && habitsData.length > 0) {
        setHabits(habitsData);
        setSetupDone(true);
      } else if (!setupDone) {
        // Try setup
        try {
          await fetch('/api/habits/setup', { method: 'POST' });
          const { data: retry } = await supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: true });
          if (retry) setHabits(retry);
          setSetupDone(true);
        } catch {
          // Tables might not exist yet — use defaults visually
          setSetupDone(true);
        }
      }

      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('date', last7[0])
        .lte('date', today);

      if (logsData) setLogs(logsData);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [today, last7, setupDone]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleHabit = async (habitId: string, date: string) => {
    const existing = logs.find(l => l.habit_id === habitId && l.date === date);

    if (existing) {
      if (existing.completed) {
        await supabase.from('habit_logs').delete().eq('id', existing.id);
        setLogs(prev => prev.filter(l => l.id !== existing.id));
      } else {
        await supabase.from('habit_logs').update({ completed: true }).eq('id', existing.id);
        setLogs(prev => prev.map(l => l.id === existing.id ? { ...l, completed: true } : l));
      }
    } else {
      const newLog = { habit_id: habitId, date, completed: true };
      const { data } = await supabase.from('habit_logs').insert(newLog).select().single();
      if (data) setLogs(prev => [...prev, data]);
      else setLogs(prev => [...prev, { id: crypto.randomUUID(), ...newLog }]);
    }
  };

  const isCompleted = (habitId: string, date: string) => {
    return logs.some(l => l.habit_id === habitId && l.date === date && l.completed);
  };

  // Use default habits if DB hasn't loaded any
  const displayHabits = habits.length > 0
    ? habits
    : DEFAULT_HABITS.map((h, i) => ({ id: `default-${i}`, name: h.name, icon: h.icon, created_at: '' }));

  const completedToday = displayHabits.filter(h => isCompleted(h.id, today)).length;
  const totalToday = displayHabits.length;
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={styles.h1}>DAILY HABITS</h1>
          <p style={{ color: brand.silver, fontSize: '14px', marginBottom: '1.5rem' }}>
            Consistency compounds. Track the non-negotiables.
          </p>

          {/* Today's progress */}
          <div style={{
            ...styles.card,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: `3px solid ${pct === 100 ? brand.success : brand.amber}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 700, color: pct === 100 ? brand.success : brand.amber,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {pct}%
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: brand.white }}>
                {completedToday}/{totalToday} completed today
              </div>
              <div style={{ color: brand.silver, fontSize: '13px', marginTop: 4 }}>
                {pct === 100 ? 'Perfect day. Keep stacking.' : pct >= 60 ? 'Solid progress. Finish strong.' : 'Get after it.'}
              </div>
            </div>
          </div>
        </div>

        {/* Habit Grid */}
        {loading ? (
          <p style={{ color: brand.smoke }}>Loading habits...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {displayHabits.map((habit) => {
              const streak = getStreak(logs, habit.id);
              const done = isCompleted(habit.id, today);
              const icon = DEFAULT_HABITS.find(d => d.name === habit.name)?.icon || '✅';

              return (
                <div
                  key={habit.id}
                  style={{
                    ...styles.card,
                    borderColor: done ? brand.success : brand.border,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, transform 0.1s',
                  }}
                  onClick={() => toggleHabit(habit.id, today)}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '24px' }}>{icon}</span>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: done ? brand.success : brand.white,
                        fontFamily: "'Space Grotesk', system-ui",
                      }}>
                        {habit.name}
                      </span>
                    </div>
                    {/* Toggle */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      backgroundColor: done ? brand.success : 'transparent',
                      border: `2px solid ${done ? brand.success : brand.smoke}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {done && <span style={{ color: '#000', fontSize: '14px', fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>

                  {/* Streak */}
                  {streak > 0 && (
                    <div style={{
                      fontSize: '12px',
                      color: brand.amber,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: '0.75rem',
                    }}>
                      🔥 {streak} day streak
                    </div>
                  )}

                  {/* Week dots */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {last7.map((date) => {
                      const dayCompleted = isCompleted(habit.id, date);
                      const dayOfWeek = new Date(date + 'T12:00:00').getDay();
                      return (
                        <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: '9px', color: brand.smoke, fontFamily: "'JetBrains Mono'" }}>
                            {DAY_LABELS[dayOfWeek]}
                          </span>
                          <div
                            style={{
                              width: 12, height: 12, borderRadius: '50%',
                              backgroundColor: dayCompleted ? brand.success : 'rgba(255,255,255,0.1)',
                              transition: 'background-color 0.2s',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHabit(habit.id, date);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
