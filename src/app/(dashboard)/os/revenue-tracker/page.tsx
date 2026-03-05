'use client';

import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const MRR_GOAL = 10000;

interface RevenueStream {
  id: string;
  name: string;
  monthly_amount: number;
  type: 'saas' | 'consulting' | 'other';
  created_at: string;
}

interface RevenueSnapshot {
  id: string;
  month: string;
  total_mrr: number;
}

function getMotivation(pct: number): string {
  if (pct >= 100) return 'FREEDOM. You did it.';
  if (pct >= 75) return 'Almost there. Don\'t stop now.';
  if (pct >= 50) return 'Halfway there, keep shipping.';
  if (pct >= 25) return 'Momentum is building. Stack the wins.';
  if (pct >= 10) return 'The flywheel is turning. Keep pushing.';
  return 'The journey starts now.';
}

const TYPE_COLORS: Record<string, string> = {
  saas: brand.success,
  consulting: brand.info,
  other: brand.amber,
};

export default function RevenueTrackerPage() {
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [snapshots, setSnapshots] = useState<RevenueSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'saas' | 'consulting' | 'other'>('saas');

  const loadData = useCallback(async () => {
    try {
      const { data: streamsData } = await supabase
        .from('revenue_streams')
        .select('*')
        .order('created_at', { ascending: true });

      if (streamsData) setStreams(streamsData);

      const { data: snapshotsData } = await supabase
        .from('revenue_snapshots')
        .select('*')
        .order('month', { ascending: true })
        .limit(6);

      if (snapshotsData) setSnapshots(snapshotsData);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const currentMRR = streams.reduce((sum, s) => sum + s.monthly_amount, 0);
  const pct = Math.min(Math.round((currentMRR / MRR_GOAL) * 100), 100);

  const handleSave = async () => {
    if (!formName.trim() || !formAmount) return;
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingId) {
      await supabase.from('revenue_streams').update({
        name: formName.trim(), monthly_amount: amount, type: formType,
      }).eq('id', editingId);
    } else {
      await supabase.from('revenue_streams').insert({
        name: formName.trim(), monthly_amount: amount, type: formType,
      });
    }

    setFormName('');
    setFormAmount('');
    setFormType('saas');
    setShowForm(false);
    setEditingId(null);
    loadData();
  };

  const handleEdit = (stream: RevenueStream) => {
    setEditingId(stream.id);
    setFormName(stream.name);
    setFormAmount(stream.monthly_amount.toString());
    setFormType(stream.type);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('revenue_streams').delete().eq('id', id);
    loadData();
  };

  // Chart data: combine snapshots + current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const chartData = [
    ...snapshots.filter(s => s.month !== currentMonth).map(s => ({
      month: s.month,
      mrr: s.total_mrr,
    })),
    { month: currentMonth, mrr: currentMRR },
  ].slice(-6);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <h1 style={styles.h1}>REVENUE TRACKER</h1>
        <p style={{ color: brand.silver, fontSize: '14px', marginBottom: '2rem' }}>
          Track MRR. Ship to $10K.
        </p>

        {loading ? (
          <p style={{ color: brand.smoke }}>Loading...</p>
        ) : (
          <>
            {/* Big MRR Number */}
            <div style={{
              ...styles.card,
              textAlign: 'center' as const,
              marginBottom: '2rem',
              padding: '2.5rem',
            }}>
              <div style={{
                fontSize: '14px',
                color: brand.smoke,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
                fontFamily: "'Space Grotesk', system-ui",
              }}>
                Current MRR
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: 800,
                color: pct >= 100 ? brand.success : brand.amber,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
                marginBottom: '1rem',
              }}>
                ${currentMRR.toLocaleString()}
              </div>
              <div style={{
                fontSize: '14px',
                color: brand.smoke,
                marginBottom: '1.5rem',
              }}>
                of ${MRR_GOAL.toLocaleString()} goal
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
                height: 8,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: pct >= 100 ? brand.success : brand.amber,
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: brand.amber }}>
                {pct}%
              </div>

              {/* Motivation */}
              <div style={{
                marginTop: '1.5rem',
                fontSize: '16px',
                fontWeight: 600,
                color: pct >= 100 ? brand.success : brand.white,
                fontFamily: "'Space Grotesk', system-ui",
              }}>
                {getMotivation(pct)}
              </div>
            </div>

            {/* Chart + Streams Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Chart */}
              <div style={styles.card}>
                <div style={{
                  fontSize: '13px', color: brand.smoke, marginBottom: '1rem',
                  fontFamily: "'Space Grotesk', system-ui", textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  Monthly MRR
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="month"
                        tick={{ fill: brand.smoke, fontSize: 11 }}
                        axisLine={{ stroke: brand.border }}
                        tickLine={false}
                        tickFormatter={(v: string) => {
                          const [, m] = v.split('-');
                          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                          return months[parseInt(m) - 1] || v;
                        }}
                      />
                      <YAxis
                        tick={{ fill: brand.smoke, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: brand.carbon,
                          border: `1px solid ${brand.border}`,
                          borderRadius: 8,
                          color: brand.white,
                          fontSize: 13,
                        }}
                        formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'MRR']}
                      />
                      <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={i === chartData.length - 1 ? brand.amber : 'rgba(245,158,11,0.4)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.smoke }}>
                    No data yet
                  </div>
                )}
              </div>

              {/* Revenue Streams */}
              <div style={styles.card}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem',
                }}>
                  <div style={{
                    fontSize: '13px', color: brand.smoke,
                    fontFamily: "'Space Grotesk', system-ui", textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    Revenue Streams
                  </div>
                  <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormName(''); setFormAmount(''); setFormType('saas'); }}
                    style={{
                      background: 'none', border: `1px solid ${brand.amber}`, color: brand.amber,
                      padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    + Add
                  </button>
                </div>

                {/* Form */}
                {showForm && (
                  <div style={{
                    backgroundColor: brand.graphite, borderRadius: 8, padding: '1rem', marginBottom: '1rem',
                    border: `1px solid ${brand.border}`,
                  }}>
                    <input
                      placeholder="Stream name"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      style={{ ...styles.input, marginBottom: '0.5rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Monthly amount ($)"
                      value={formAmount}
                      onChange={e => setFormAmount(e.target.value)}
                      style={{ ...styles.input, marginBottom: '0.5rem' }}
                    />
                    <select
                      value={formType}
                      onChange={e => setFormType(e.target.value as 'saas' | 'consulting' | 'other')}
                      style={{ ...styles.input, marginBottom: '0.75rem' }}
                    >
                      <option value="saas">SaaS</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleSave} style={{ ...styles.button, padding: '0.5rem 1rem', fontSize: '13px' }}>
                        {editingId ? 'Update' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setShowForm(false); setEditingId(null); }}
                        style={{ ...styles.button, padding: '0.5rem 1rem', fontSize: '13px', backgroundColor: brand.graphite, color: brand.white, border: `1px solid ${brand.border}` }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Stream list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {streams.length === 0 ? (
                    <div style={{ color: brand.smoke, fontSize: '13px', padding: '1rem 0', textAlign: 'center' as const }}>
                      No streams yet. Add your first revenue source.
                    </div>
                  ) : streams.map(stream => (
                    <div
                      key={stream.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8,
                        border: `1px solid rgba(255,255,255,0.05)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: TYPE_COLORS[stream.type] || brand.amber,
                        }} />
                        <div>
                          <div style={{ fontSize: '14px', color: brand.white, fontWeight: 500 }}>{stream.name}</div>
                          <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase' as const }}>{stream.type}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          fontSize: '15px', fontWeight: 700, color: brand.amber,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          ${stream.monthly_amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleEdit(stream)}
                          style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px' }}
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDelete(stream.id)}
                          style={{ background: 'none', border: 'none', color: brand.error, cursor: 'pointer', fontSize: '12px' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
