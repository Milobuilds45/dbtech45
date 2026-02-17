'use client';

import { useState, useEffect } from 'react';
import { brand } from "@/lib/brand";
import { supabase, type DailyNote, type Activity } from "@/lib/supabase";

interface FeedEntry {
  time: string;
  tag: string;
  color: string;
  text: string;
  project?: string;
  noteId?: string;
}

const TAG_COLORS: Record<string, string> = {
  DEPLOY: brand.success,
  BUILD: brand.info,
  NOTE: brand.amber,
  IDEA: '#A855F7',
  SYSTEM: brand.smoke,
  DESIGN: '#EC4899',
  INFRASTRUCTURE: '#6366F1',
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${month} ${day} · ${time}`;
}

function formatDateShort(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - target.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function DailyFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [noteProject, setNoteProject] = useState('');
  const [noteAgent, setNoteAgent] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadFeed = async (date: Date) => {
    setLoading(true);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [notesRes, activitiesRes] = await Promise.all([
      supabase.from('daily_notes').select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false }),
      supabase.from('activities').select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false }),
    ]);

    const noteEntries: FeedEntry[] = (notesRes.data || []).map((n: DailyNote) => ({
      time: n.created_at,
      tag: 'NOTE',
      color: TAG_COLORS.NOTE,
      text: n.text + (n.project ? ` [${n.project}]` : '') + (n.agent ? ` @${n.agent}` : ''),
      project: n.project || undefined,
      noteId: n.id,
    }));

    const activityEntries: FeedEntry[] = (activitiesRes.data || []).map((a: Activity) => {
      const tagKey = a.category === 'deployment' ? 'DEPLOY' : a.category === 'development' ? 'BUILD' : a.category.toUpperCase();
      return {
        time: a.created_at,
        tag: tagKey,
        color: TAG_COLORS[tagKey] || brand.smoke,
        text: a.title + (a.description ? ` -- ${a.description}` : '') + (a.agent ? ` @${a.agent}` : ''),
        project: a.project || undefined,
      };
    });

    const all = [...noteEntries, ...activityEntries].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    setEntries(all);
    setLoading(false);
  };

  useEffect(() => { loadFeed(selectedDate); }, [selectedDate]);

  const navigateDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    if (newDate <= new Date()) setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const { error } = await supabase.from('daily_notes').insert({
      text: noteText.trim(),
      project: noteProject || null,
      agent: noteAgent || null,
    });
    if (!error) {
      setNoteText('');
      setNoteProject('');
      setNoteAgent('');
      loadFeed(selectedDate);
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from('daily_notes').delete().eq('id', id);
    loadFeed(selectedDate);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addNote(); }
  };

  const filtered = filter === 'all' ? entries : entries.filter(e => e.tag === filter);
  const tags = ['all', ...new Set(entries.map(e => e.tag))];
  const agents = ['Anders', 'Paula', 'Bobby', 'Milo', 'Remy', 'Tony', 'Dax', 'Webb', 'Dwight', 'Wendy'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: brand.void, color: brand.white, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: brand.amber, fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>Daily Feed</h1>
        <p style={{ color: brand.silver, marginBottom: '1rem' }}>
          Live updates from Supabase. Notes, deploys, activity.
        </p>

        {/* Date Navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
          background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '10px', padding: '10px 16px',
        }}>
          <button onClick={() => navigateDay(-1)}
            style={{ background: 'none', border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '6px 12px', color: brand.silver, cursor: 'pointer', fontSize: '14px' }}>
            &larr; Prev
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ color: brand.white, fontWeight: 600, fontSize: '16px' }}>
              {formatDateShort(selectedDate)}
            </span>
            <span style={{ color: brand.smoke, marginLeft: '8px', fontSize: '13px' }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            {!loading && <span style={{ color: brand.smoke, marginLeft: '8px', fontSize: '12px' }}>({entries.length} entries)</span>}
          </div>
          <button onClick={() => navigateDay(1)} disabled={isToday()}
            style={{
              background: 'none', border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '6px 12px',
              color: isToday() ? brand.smoke : brand.silver, cursor: isToday() ? 'not-allowed' : 'pointer', fontSize: '14px',
              opacity: isToday() ? 0.4 : 1,
            }}>
            Next &rarr;
          </button>
          {!isToday() && (
            <button onClick={goToToday}
              style={{ background: brand.amber, border: 'none', borderRadius: '6px', padding: '6px 12px', color: brand.void, cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
              Today
            </button>
          )}
        </div>

        {/* Quick Note Input */}
        <div style={{
          background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px',
          padding: '16px', marginBottom: '20px',
        }}>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Quick note, idea, or thought... (Ctrl+Enter to save)"
            rows={2}
            style={{
              width: '100%', background: brand.graphite, border: `1px solid ${brand.border}`,
              borderRadius: '8px', padding: '10px 12px', color: brand.white,
              fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.5',
              resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '10px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={noteProject} onChange={e => setNoteProject(e.target.value)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '6px 10px', color: brand.silver, fontSize: '12px', outline: 'none' }}>
              <option value="">No project</option>
              <option value="dbtech45">dbtech45</option>
              <option value="Sunday Squares">Sunday Squares</option>
              <option value="Soul Solace">Soul Solace</option>
              <option value="Boundless">Boundless</option>
              <option value="tickR">tickR</option>
              <option value="MenuSparks">MenuSparks</option>
            </select>
            <select value={noteAgent} onChange={e => setNoteAgent(e.target.value)}
              style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '6px 10px', color: brand.silver, fontSize: '12px', outline: 'none' }}>
              <option value="">No agent</option>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: '11px', color: brand.smoke }}>Ctrl+Enter</span>
            <button onClick={addNote} disabled={!noteText.trim()}
              style={{
                padding: '6px 18px', borderRadius: '6px', fontWeight: 600, fontSize: '13px',
                border: 'none', cursor: noteText.trim() ? 'pointer' : 'not-allowed',
                background: noteText.trim() ? brand.amber : brand.graphite,
                color: noteText.trim() ? brand.void : brand.smoke,
              }}>Save Note</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tags.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{
                padding: '4px 14px', borderRadius: '16px', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                border: `1px solid ${filter === t ? brand.amber : brand.border}`,
                background: filter === t ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                color: filter === t ? brand.amber : brand.smoke,
              }}>{t}</button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ color: brand.smoke }}>Loading from Supabase...</div>
          </div>
        ) : (
          <div style={{ background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: brand.smoke }}>
                No entries for {formatDateShort(selectedDate)}. {!isToday() && 'Try navigating to another day.'}
              </div>
            ) : filtered.map((e, i) => (
              <div key={`${e.time}-${i}`}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${brand.border}` : 'none',
                }}
                onMouseEnter={ev => ev.currentTarget.style.background = brand.graphite}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: brand.smoke, fontSize: '12px', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", minWidth: '120px', paddingTop: '2px' }}>
                  {formatDateTime(e.time)}
                </span>
                <span style={{
                  color: e.color, fontSize: '11px', fontWeight: 700, minWidth: '70px',
                  fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '4px',
                  background: `${e.color}15`, textAlign: 'center',
                }}>{e.tag}</span>
                <span style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.5', flex: 1 }}>{e.text}</span>
                {e.noteId && (
                  <button onClick={() => deleteNote(e.noteId!)}
                    style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '14px', padding: '2px 6px', opacity: 0.4 }}
                    onMouseEnter={ev => ev.currentTarget.style.opacity = '1'}
                    onMouseLeave={ev => ev.currentTarget.style.opacity = '0.4'}
                    title="Delete note">x</button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: brand.smoke, textDecoration: 'none', fontSize: '14px' }}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
