'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

const WEEKLY_QUESTIONS = [
  { id: 'q1', label: 'What did you avoid this week that you know you should have done?' },
  { id: 'q2', label: 'Where did you spend energy that drained instead of built?' },
  { id: 'q3', label: 'What moment this week felt most like the real you?' },
];

const SAMPLE_PATTERNS = [
  {
    theme: 'Avoidance Loop',
    description: 'You consistently name the same task week over week without completing it. Pattern suggests not an execution problem — it\'s a fear problem.',
    frequency: 5,
    color: brand.error,
    week: 'Weeks 1–5',
  },
  {
    theme: 'Energy Drain: Obligations',
    description: 'Restaurant-related energy drain shows up in ~80% of check-ins. You give energy to things that don\'t give back.',
    frequency: 4,
    color: brand.warning,
    week: 'Weeks 2–5',
  },
  {
    theme: 'Peak Self: Builder Mode',
    description: 'Your "most real" moments are 100% tied to AI, building, or trading. No exceptions. The data is not subtle.',
    frequency: 5,
    color: brand.success,
    week: 'Weeks 1–5',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const HEAT_DATA = [
  [3, 2, 4, 2, 3, 1],
  [4, 3, 4, 3, 4, 2],
  [2, 1, 3, 2, 2, 1],
];

export default function PatternMirrorPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'checkin' | 'patterns' | 'history'>('patterns');

  const handleSubmit = () => {
    if (Object.values(answers).some(a => a.trim())) {
      setSubmitted(true);
    }
  };

  const heatColor = (val: number) => {
    const colors = [brand.border, '#2D2000', '#5C3D00', '#8A5C00', '#B87A00', brand.amber];
    return colors[Math.min(val, colors.length - 1)];
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={styles.h1}>The Pattern Mirror</h1>
            <p style={styles.subtitle}>3 questions. Weekly. Your blind spots, reflected back to you.</p>
          </div>
          <div style={{ ...styles.card, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Check-ins</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: brand.amber, lineHeight: 1 }}>5</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: brand.carbon, padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {(['patterns', 'checkin', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.25rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                background: activeTab === tab ? brand.amber : 'transparent',
                color: activeTab === tab ? brand.void : brand.silver,
                transition: 'all 0.2s',
                fontFamily: "'Inter', sans-serif",
                textTransform: 'capitalize',
              }}
            >
              {tab === 'checkin' ? 'This Week' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab: Patterns */}
        {activeTab === 'patterns' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {SAMPLE_PATTERNS.map((p, i) => (
                <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${p.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: brand.white }}>{p.theme}</div>
                    <span style={{ ...styles.badge(p.color), fontSize: '10px', textTransform: 'uppercase' }}>
                      {p.frequency}× spotted
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                  <div style={{ marginTop: '0.75rem', fontSize: '11px', color: brand.smoke }}>{p.week}</div>
                </div>
              ))}
            </div>

            {/* Mirror Report */}
            <div style={{ ...styles.card, borderTop: `2px solid ${brand.amber}` }}>
              <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>Monthly Mirror — What The Data Says</div>
              <div style={{ fontSize: '14px', color: brand.silver, lineHeight: 1.8, fontStyle: 'italic' }}>
                "Your recurring avoidance pattern and your recurring peak state are naming the same thing from opposite angles.
                You already know what needs to happen. The mirror just makes it impossible to pretend otherwise."
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '12px', padding: '0.4rem 0.85rem', background: `${brand.amber}15`, border: `1px solid ${brand.amber}40`, borderRadius: '8px', color: brand.amber }}>
                  Pattern: Stop → Avoidance = Fear
                </div>
                <div style={{ fontSize: '12px', padding: '0.4rem 0.85rem', background: `${brand.success}15`, border: `1px solid ${brand.success}40`, borderRadius: '8px', color: brand.success }}>
                  Pattern: Peak = Builder Mode
                </div>
                <div style={{ fontSize: '12px', padding: '0.4rem 0.85rem', background: `${brand.error}15`, border: `1px solid ${brand.error}40`, borderRadius: '8px', color: brand.error }}>
                  Pattern: Drain = Inherited Obligations
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Check-in */}
        {activeTab === 'checkin' && (
          <div style={styles.card}>
            {!submitted ? (
              <>
                <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>This Week's Check-In — 3 Questions, ~90 Seconds</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {WEEKLY_QUESTIONS.map((q, i) => (
                    <div key={q.id}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: brand.amber, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', minWidth: '18px', paddingTop: '1px' }}>
                          {i + 1}.
                        </span>
                        <span style={{ fontSize: '14px', color: brand.white }}>{q.label}</span>
                      </div>
                      <textarea
                        placeholder="Be honest. No one's grading this."
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        style={{ ...styles.input, minHeight: '72px', resize: 'vertical', fontSize: '13px', lineHeight: 1.5 }}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleSubmit} style={{ ...styles.button, marginTop: '1.5rem' }}>
                  Submit Check-In
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🪞</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: brand.amber, marginBottom: '0.5rem' }}>
                  Check-In Logged
                </div>
                <div style={{ color: brand.silver, fontSize: '14px', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Come back next week. After a few entries, the patterns start to speak for themselves.
                </div>
                <button
                  onClick={() => { setSubmitted(false); setAnswers({}); }}
                  style={{ ...styles.button, background: 'transparent', color: brand.amber, border: `1px solid ${brand.amber}` }}
                >
                  New Entry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: History heatmap */}
        {activeTab === 'history' && (
          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Check-In Frequency — Last 6 Months</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {WEEKLY_QUESTIONS.map((q, qi) => (
                <div key={q.id}>
                  <div style={{ fontSize: '12px', color: brand.silver, marginBottom: '0.4rem', paddingLeft: '2px' }}>
                    Q{qi + 1}: {q.label.substring(0, 50)}...
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {MONTHS.map((month, mi) => (
                      <div key={mi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            background: heatColor(HEAT_DATA[qi][mi]),
                            border: `1px solid ${brand.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: brand.silver,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {HEAT_DATA[qi][mi]}
                        </div>
                        <div style={{ fontSize: '10px', color: brand.smoke }}>{month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.25rem', fontSize: '12px', color: brand.smoke }}>
              Scale: entries per month per question. Darker = more consistent.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
