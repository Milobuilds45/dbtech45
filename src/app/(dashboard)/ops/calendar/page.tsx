'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';

/* ═══════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════ */

type Priority = 'low' | 'medium' | 'high';
type ViewMode = 'weekly' | 'monthly';

interface CalTask {
  id: string;
  title: string;
  day: string;
  theme: string;
  assignee: string;
  priority: Priority;
  done: boolean;
  date?: string; // YYYY-MM-DD for monthly view
}

const AGENTS = ['Derek', 'Milo', 'Paula', 'Bobby', 'Anders', 'Dwight', 'Jim', 'Remy', 'Wendy'];

const DAY_THEMES: { day: string; label: string; emoji: string; color: string; description: string }[] = [
  { day: 'monday', label: '🔧 Fix & Build', emoji: '🔧', color: '#F97316', description: 'Infrastructure, bug fixes, broken things' },
  { day: 'tuesday', label: '🚀 App Dev', emoji: '🚀', color: '#3B82F6', description: 'Build out apps — Boundless, Soul Solace, tickR' },
  { day: 'wednesday', label: '⚡ OpenClaw', emoji: '⚡', color: '#A855F7', description: 'Agent improvements, skills, OS dashboard' },
  { day: 'thursday', label: '📝 Content & Growth', emoji: '📝', color: '#22C55E', description: 'X/Twitter, content creation, marketing' },
  { day: 'friday', label: '💡 Ideas & Research', emoji: '💡', color: '#EAB308', description: 'New ideas, prototyping, exploration' },
  { day: 'saturday', label: '🏗️ Project Sprint', emoji: '🏗️', color: '#EC4899', description: 'Deep work on priority projects' },
  { day: 'sunday', label: '📊 Review & Plan', emoji: '📊', color: '#06B6D4', description: 'Weekly review, plan next week, organize' },
];

const SUPABASE_TABLE = 'calendar_tasks';
const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getThemeForDay(dayName: string) {
  return DAY_THEMES.find(d => d.day === dayName) || DAY_THEMES[0];
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function priorityColor(p: string) {
  return p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.success;
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function CalendarPage() {
  const [tasks, setTasks] = useState<CalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);
  const [view, setView] = useState<ViewMode>('weekly');
  const [newTask, setNewTask] = useState('');
  const [newDay, setNewDay] = useState('monday');
  const [newDate, setNewDate] = useState(formatDate(new Date()));
  const [newAssignee, setNewAssignee] = useState('Derek');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingThemes, setEditingThemes] = useState(false);
  const [customThemes, setCustomThemes] = useState<Record<string, string>>({});
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month

  const today = new Date();
  const todayStr = getDayName(today);
  const todayDate = formatDate(today);

  // Month navigation
  const viewMonth = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return d;
  }, [monthOffset, today]);

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Calendar load error:', error.message);
        setDbAvailable(false);
        const local = localStorage.getItem('calendar_tasks');
        if (local) setTasks(JSON.parse(local));
      } else {
        setTasks(data || []);
        setDbAvailable(true);
      }
    } catch {
      setDbAvailable(false);
      const local = localStorage.getItem('calendar_tasks');
      if (local) setTasks(JSON.parse(local));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    const saved = localStorage.getItem('calendar_day_themes');
    if (saved) setCustomThemes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('calendar_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // CRUD
  const addTask = async () => {
    if (!newTask.trim()) return;
    const day = view === 'weekly' ? newDay : getDayName(new Date(newDate + 'T12:00:00'));
    const theme = getThemeForDay(day).day;
    const task: CalTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: newTask.trim(),
      day,
      theme,
      assignee: newAssignee,
      priority: newPriority,
      done: false,
      date: view === 'monthly' ? newDate : undefined,
    };
    if (dbAvailable) {
      await supabase.from(SUPABASE_TABLE).insert(task);
      loadTasks();
    } else {
      setTasks(prev => [task, ...prev]);
    }
    setNewTask('');
    setNewPriority('medium');
  };

  const toggleDone = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (dbAvailable) {
      await supabase.from(SUPABASE_TABLE).update({ done: !task.done }).eq('id', taskId);
      loadTasks();
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    }
  };

  const moveTask = async (taskId: string, newDay: string, newDateStr?: string) => {
    const theme = getThemeForDay(newDay).day;
    const update: Partial<CalTask> = { day: newDay, theme };
    if (newDateStr) update.date = newDateStr;
    if (dbAvailable) {
      await supabase.from(SUPABASE_TABLE).update(update).eq('id', taskId);
      loadTasks();
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...update } : t));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (dbAvailable) {
      await supabase.from(SUPABASE_TABLE).delete().eq('id', taskId);
      loadTasks();
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const saveTheme = (day: string, desc: string) => {
    const updated = { ...customThemes, [day]: desc };
    setCustomThemes(updated);
    localStorage.setItem('calendar_day_themes', JSON.stringify(updated));
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.done).length;
  const todayTasks = tasks.filter(t => t.day === todayStr && !t.done).length;

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ ...styles.h1, marginBottom: '4px' }}>📅 Calendar</h1>
            <p style={{ ...styles.subtitle, margin: 0 }}>
              Plan your week. Stay accountable. {!loading && `${totalTasks - completedTasks} active, ${completedTasks} done.`}
            </p>
          </div>
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0', border: `1px solid ${brand.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            {(['weekly', 'monthly'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '8px 18px', fontSize: '12px', fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: view === v ? brand.amber : brand.graphite,
                  color: view === v ? brand.void : brand.smoke,
                  border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}>
                {v === 'weekly' ? '📋 Weekly' : '📅 Monthly'}
              </button>
            ))}
          </div>
        </div>

        {!dbAvailable && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '12px', color: '#F87171' }}>
            ⚠️ Supabase unavailable — using local storage.
          </div>
        )}

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Today', value: todayTasks, color: brand.amber, sub: todayStr },
            { label: 'Active', value: totalTasks - completedTasks, color: brand.info, sub: 'remaining' },
            { label: 'Done', value: completedTasks, color: brand.success, sub: 'completed' },
          ].map(s => (
            <div key={s.label} style={{
              background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '10px',
              padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: brand.silver }}>{s.label}</div>
                <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'capitalize' }}>{s.sub}</div>
              </div>
            </div>
          ))}
          {view === 'weekly' && (
            <button onClick={() => setEditingThemes(!editingThemes)}
              style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${brand.border}`, background: editingThemes ? `${brand.amber}22` : brand.graphite, color: editingThemes ? brand.amber : brand.smoke, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              {editingThemes ? '✓ Save Themes' : '⚙️ Edit Themes'}
            </button>
          )}
        </div>

        {/* Add Task */}
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="Add a task..." value={newTask} onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              style={{ ...styles.input, flex: 1, minWidth: '200px' }} />
            {view === 'weekly' ? (
              <select value={newDay} onChange={e => setNewDay(e.target.value)}
                style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
                {DAY_THEMES.map(d => <option key={d.day} value={d.day}>{d.emoji} {d.day.charAt(0).toUpperCase() + d.day.slice(1)}</option>)}
              </select>
            ) : (
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none', colorScheme: 'dark' }} />
            )}
            <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 12px', color: brand.silver, fontSize: '13px', outline: 'none' }}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <button onClick={addTask} style={styles.button}>Add</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: brand.smoke, padding: '40px' }}>Loading...</div>
        ) : view === 'weekly' ? (
          <WeeklyView
            tasks={tasks} todayStr={todayStr} draggedId={draggedId}
            setDraggedId={setDraggedId} moveTask={moveTask} toggleDone={toggleDone}
            deleteTask={deleteTask} editingThemes={editingThemes}
            customThemes={customThemes} saveTheme={saveTheme}
          />
        ) : (
          <MonthlyView
            tasks={tasks} viewMonth={viewMonth} monthOffset={monthOffset}
            setMonthOffset={setMonthOffset} draggedId={draggedId}
            setDraggedId={setDraggedId} moveTask={moveTask} toggleDone={toggleDone}
            deleteTask={deleteTask} todayDate={todayDate}
          />
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TASK CARD (shared)
   ═══════════════════════════════════════════════ */

function TaskCard({ task, onToggle, onDelete, onDragStart, compact }: {
  task: CalTask; onToggle: () => void; onDelete: () => void; onDragStart: () => void; compact?: boolean;
}) {
  return (
    <div draggable onDragStart={onDragStart}
      style={{
        background: task.done ? `${brand.success}08` : brand.graphite,
        border: `1px solid ${task.done ? `${brand.success}30` : brand.border}`,
        borderRadius: '6px', padding: compact ? '6px 8px' : '8px 10px',
        cursor: 'grab', opacity: task.done ? 0.6 : 1, transition: 'all 0.15s',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
        <button onClick={onToggle}
          style={{
            width: compact ? '14px' : '16px', height: compact ? '14px' : '16px',
            borderRadius: '4px', flexShrink: 0, marginTop: '1px',
            border: `2px solid ${task.done ? brand.success : brand.border}`,
            background: task.done ? brand.success : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '9px',
          }}>
          {task.done ? '✓' : ''}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: compact ? '11px' : '12px', fontWeight: 600,
            color: task.done ? brand.smoke : brand.white,
            textDecoration: task.done ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', color: brand.smoke }}>{task.assignee}</span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: priorityColor(task.priority), display: 'inline-block' }} />
          </div>
        </div>
        <button onClick={onDelete}
          style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '10px', opacity: 0.3, flexShrink: 0, padding: '0 2px' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}>×</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WEEKLY VIEW
   ═══════════════════════════════════════════════ */

function WeeklyView({ tasks, todayStr, draggedId, setDraggedId, moveTask, toggleDone, deleteTask, editingThemes, customThemes, saveTheme }: {
  tasks: CalTask[]; todayStr: string; draggedId: string | null;
  setDraggedId: (id: string | null) => void;
  moveTask: (id: string, day: string) => void;
  toggleDone: (id: string) => void; deleteTask: (id: string) => void;
  editingThemes: boolean; customThemes: Record<string, string>; saveTheme: (day: string, desc: string) => void;
}) {
  const handleDrop = (day: string) => {
    if (!draggedId) return;
    moveTask(draggedId, day);
    setDraggedId(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
      {DAY_THEMES.map(dayTheme => {
        const dayTasks = tasks.filter(t => t.day === dayTheme.day);
        const isToday = dayTheme.day === todayStr;
        const doneCount = dayTasks.filter(t => t.done).length;
        const activeCount = dayTasks.length - doneCount;
        const desc = customThemes[dayTheme.day] || dayTheme.description;

        return (
          <div key={dayTheme.day}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(dayTheme.day)}
            style={{
              background: brand.carbon, border: `1px solid ${isToday ? dayTheme.color : brand.border}`,
              borderTop: `3px solid ${dayTheme.color}`, borderRadius: '10px',
              padding: '14px', minHeight: '350px',
              boxShadow: isToday ? `0 0 20px ${dayTheme.color}15` : 'none',
            }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isToday ? dayTheme.color : brand.white, textTransform: 'capitalize' }}>
                  {dayTheme.day}
                </span>
                {isToday && (
                  <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: `${dayTheme.color}22`, color: dayTheme.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TODAY</span>
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: dayTheme.color, marginBottom: '4px' }}>{dayTheme.label}</div>
              {editingThemes ? (
                <input value={desc} onChange={e => saveTheme(dayTheme.day, e.target.value)}
                  style={{ width: '100%', background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '4px', padding: '4px 6px', color: brand.smoke, fontSize: '10px', outline: 'none' }} />
              ) : (
                <div style={{ fontSize: '10px', color: brand.smoke, lineHeight: 1.4 }}>{desc}</div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                {activeCount > 0 && <span style={{ color: brand.silver }}>{activeCount} active</span>}
                {doneCount > 0 && <span style={{ color: brand.success }}>✓ {doneCount}</span>}
              </div>
            </div>
            <div style={{ height: '1px', background: brand.border, marginBottom: '10px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dayTasks.map(task => (
                <TaskCard key={task.id} task={task}
                  onToggle={() => toggleDone(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onDragStart={() => setDraggedId(task.id)}
                />
              ))}
            </div>
            {dayTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 8px', color: brand.smoke, fontSize: '11px', opacity: 0.5 }}>Drop tasks here</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MONTHLY VIEW
   ═══════════════════════════════════════════════ */

function MonthlyView({ tasks, viewMonth, monthOffset, setMonthOffset, draggedId, setDraggedId, moveTask, toggleDone, deleteTask, todayDate }: {
  tasks: CalTask[]; viewMonth: Date; monthOffset: number;
  setMonthOffset: (o: number) => void;
  draggedId: string | null; setDraggedId: (id: string | null) => void;
  moveTask: (id: string, day: string, date?: string) => void;
  toggleDone: (id: string) => void; deleteTask: (id: string) => void;
  todayDate: string;
}) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  // Build calendar grid (6 weeks max)
  const cells: (Date | null)[] = [];
  // Pad start (Sun=0 based, we want Mon start)
  const mondayStart = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < mondayStart; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDrop = (date: Date) => {
    if (!draggedId) return;
    const dayName = getDayName(date);
    moveTask(draggedId, dayName, formatDate(date));
    setDraggedId(null);
  };

  return (
    <div>
      {/* Month Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => setMonthOffset(monthOffset - 1)}
          style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 16px', color: brand.silver, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          ← Prev
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: brand.white, fontFamily: "'Space Grotesk', sans-serif" }}>
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={() => setMonthOffset(monthOffset + 1)}
          style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 16px', color: brand.silver, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          Next →
        </button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
          const theme = DAY_THEMES[i];
          return (
            <div key={d} style={{
              textAlign: 'center', fontSize: '11px', fontWeight: 700,
              color: theme.color, padding: '8px 0',
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.5px',
            }}>
              {d} <span style={{ fontSize: '9px', opacity: 0.7 }}>{theme.emoji}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {cells.map((date, i) => {
          if (!date) {
            return <div key={i} style={{ background: brand.carbon, borderRadius: '8px', minHeight: '120px', opacity: 0.3 }} />;
          }

          const dateStr = formatDate(date);
          const dayName = getDayName(date);
          const theme = getThemeForDay(dayName);
          const isToday = dateStr === todayDate;
          const dayTasks = tasks.filter(t => {
            if (t.date) return t.date === dateStr;
            return t.day === dayName;
          });

          return (
            <div key={i}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(date)}
              style={{
                background: brand.carbon,
                border: `1px solid ${isToday ? theme.color : brand.border}`,
                borderRadius: '8px', padding: '8px', minHeight: '120px',
                boxShadow: isToday ? `0 0 12px ${theme.color}20` : 'none',
              }}>
              {/* Date Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '14px', fontWeight: 700,
                  color: isToday ? theme.color : brand.silver,
                  width: '24px', height: '24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  background: isToday ? `${theme.color}22` : 'transparent',
                }}>
                  {date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span style={{ fontSize: '9px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                    {dayTasks.filter(t => !t.done).length}/{dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayTasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} compact
                    onToggle={() => toggleDone(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onDragStart={() => setDraggedId(task.id)}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: '10px', color: brand.smoke, textAlign: 'center', padding: '2px' }}>
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>

              {dayTasks.length === 0 && (
                <div style={{ fontSize: '9px', color: brand.smoke, opacity: 0.3, textAlign: 'center', padding: '8px 0' }}>
                  {theme.emoji}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Theme Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {DAY_THEMES.map(t => (
          <div key={t.day} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
            <span style={{ color: brand.smoke }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
