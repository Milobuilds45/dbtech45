'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  name: string;
  impact: 'high' | 'medium' | 'low';
  previous: string | null;
  forecast: string | null;
  actual: string | null;
  surprise: 'beat' | 'miss' | 'inline' | null;
}

const M = "'JetBrains Mono','Fira Code',monospace";
const impactIcon: Record<string, string> = { high: '🔴', medium: '🟡', low: '🟢' };
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCal = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/economic-calendar', { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setEvents(d.events || []);
    } catch {
      setError('Failed to load economic calendar');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCal(); }, [fetchCal]);

  // Group events by day
  const grouped = events.reduce<Record<string, EconomicEvent[]>>((acc, ev) => {
    const key = ev.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  const today = new Date().toISOString().split('T')[0];

  // Build weekday columns
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekDays: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekDays.push(d.toISOString().split('T')[0]);
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        background: brand.carbon,
        border: `1px solid ${brand.border}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px', borderBottom: collapsed ? 'none' : `1px solid ${brand.border}`,
            background: brand.graphite, cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📆</span>
            <span style={{
              color: brand.amber, fontWeight: 700, fontSize: 13,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>ECONOMIC CALENDAR</span>
            <span style={{
              fontSize: 10, fontFamily: M, padding: '1px 8px', borderRadius: 3,
              background: 'rgba(245,158,11,0.1)', color: brand.amber,
            }}>This Week</span>
          </div>
          <span style={{ color: brand.smoke, fontSize: 12, transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
        </div>

        {/* Body */}
        {!collapsed && (
          <div style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: M }}>
                <span style={{ animation: 'axp 1.5s ease-in-out infinite' }}>Loading calendar...</span>
              </div>
            ) : error ? (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.06)' }}>
                <span style={{ color: '#EF4444', fontSize: 11 }}>⚠ {error}</span>
                <button onClick={fetchCal} style={{ marginLeft: 8, fontSize: 10, color: brand.amber, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, minHeight: 80 }}>
                {weekDays.map((day) => {
                  const dayEvents = grouped[day] || [];
                  const d = new Date(day + 'T12:00:00');
                  const isToday = day === today;
                  const dayNum = d.getDate();
                  const dayName = dayNames[d.getDay()];

                  return (
                    <div key={day} style={{
                      borderRight: `1px solid ${brand.border}`,
                      borderBottom: isToday ? `2px solid ${brand.amber}` : 'none',
                      background: isToday ? 'rgba(245,158,11,0.04)' : 'transparent',
                      padding: '8px',
                      minWidth: 0,
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, fontFamily: M,
                        color: isToday ? brand.amber : brand.smoke,
                        marginBottom: 6, letterSpacing: '0.05em',
                      }}>
                        {dayName} {dayNum}
                      </div>
                      {dayEvents.length === 0 ? (
                        <div style={{ fontSize: 10, color: brand.smoke, fontFamily: M, opacity: 0.5 }}>—</div>
                      ) : (
                        dayEvents.map((ev) => (
                          <div key={ev.id} style={{
                            padding: '4px 6px', marginBottom: 4, borderRadius: 4,
                            background: ev.impact === 'high' ? 'rgba(239,68,68,0.06)' : 'transparent',
                            border: ev.impact === 'high' ? '1px solid rgba(239,68,68,0.15)' : '1px solid transparent',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                              <span style={{ fontSize: 8 }}>{impactIcon[ev.impact]}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, color: brand.white, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.name}
                              </span>
                            </div>
                            <div style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>{ev.time}</div>
                            {(ev.forecast || ev.previous) && (
                              <div style={{ fontSize: 9, color: brand.smoke, fontFamily: M, marginTop: 1 }}>
                                {ev.forecast && <span>Est: {ev.forecast} </span>}
                                {ev.previous && <span>Prev: {ev.previous}</span>}
                              </div>
                            )}
                            {ev.actual != null && (
                              <div style={{
                                fontSize: 9, fontFamily: M, fontWeight: 700, marginTop: 1,
                                color: ev.surprise === 'beat' ? '#22C55E' : ev.surprise === 'miss' ? '#EF4444' : brand.smoke,
                              }}>
                                Act: {ev.actual} {ev.surprise === 'beat' ? '▲' : ev.surprise === 'miss' ? '▼' : ''}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
