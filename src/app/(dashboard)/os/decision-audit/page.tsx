'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

const AUDIT_QUESTIONS = [
  {
    id: 'fear',
    label: 'What are you actually afraid of if you make this decision?',
    hint: 'Not the surface reason. The real one underneath.',
  },
  {
    id: 'best',
    label: 'What would the best version of you do right now?',
    hint: 'The version that isn\'t scared. The one who trusts themselves.',
  },
  {
    id: 'friend',
    label: 'What would you tell a close friend in this exact situation?',
    hint: 'You always know the answer when it\'s not about you.',
  },
  {
    id: 'regret',
    label: 'In 5 years, what will you regret more — doing it or not doing it?',
    hint: 'Regret of inaction compounds faster than regret of action.',
  },
  {
    id: 'cost',
    label: 'What is the real cost of not deciding right now?',
    hint: 'Indecision is a choice. What are you actually choosing by waiting?',
  },
];

const PAST_DECISIONS = [
  {
    label: 'Accept restaurant LOI',
    date: 'Feb 2026',
    fear: 'Walking away from something Dad and I built together',
    outcome: 'Pending',
    verdict: 'Do it',
    verdictColor: brand.success,
  },
  {
    label: 'Allocate $25K to trading/building',
    date: 'Feb 2026',
    fear: 'Burning the money and proving everyone right',
    outcome: 'In progress',
    verdict: 'Do it',
    verdictColor: brand.success,
  },
  {
    label: 'Sell the house',
    date: 'Mar 2026',
    fear: 'Disrupting stability for the kids',
    outcome: 'On market',
    verdict: 'Do it',
    verdictColor: brand.success,
  },
];

export default function DecisionAuditPage() {
  const [decision, setDecision] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'log'>('new');

  const filledCount = Object.values(answers).filter(a => a.trim().length > 0).length;
  const canRun = decision.trim().length > 0 && filledCount >= 3;

  const handleRun = () => {
    if (canRun) setShowOutput(true);
  };

  const reset = () => {
    setDecision('');
    setAnswers({});
    setShowOutput(false);
  };

  const getVerdict = () => {
    const fearText = answers['fear'] || '';
    const bestText = answers['best'] || '';
    const regretText = answers['regret'] || '';

    const leansDo = bestText.toLowerCase().includes('do') || regretText.toLowerCase().includes('not doing');
    const leansDont = fearText.toLowerCase().includes('risk') || fearText.toLowerCase().includes('lose');

    if (leansDo && !leansDont) return { text: 'The data leans: Do it.', color: brand.success };
    if (leansDont && !leansDo) return { text: 'The data leans: Slow down.', color: brand.warning };
    return { text: 'The data is split. The real blocker is the fear in Q1.', color: brand.amber };
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={styles.h1}>The Decision Audit</h1>
          <p style={styles.subtitle}>5 questions that separate fear from intuition. Stop confusing them.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: brand.carbon, padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {(['new', 'log'] as const).map(tab => (
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
              }}
            >
              {tab === 'new' ? 'New Audit' : 'Decision Log'}
            </button>
          ))}
        </div>

        {/* New Audit */}
        {activeTab === 'new' && (
          <>
            {!showOutput ? (
              <div style={styles.card}>
                {/* The Decision */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>What decision are you wrestling with?</div>
                  <textarea
                    placeholder="State it plainly. No hedging."
                    value={decision}
                    onChange={e => setDecision(e.target.value)}
                    style={{ ...styles.input, minHeight: '60px', resize: 'none', fontSize: '14px', fontWeight: 500 }}
                  />
                </div>

                <div style={{ height: '1px', background: brand.border, marginBottom: '1.5rem' }} />

                {/* Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  {AUDIT_QUESTIONS.map((q, i) => (
                    <div key={q.id}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: brand.amber, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', minWidth: '22px' }}>
                          {i + 1}.
                        </span>
                        <div>
                          <div style={{ fontSize: '14px', color: brand.white, marginBottom: '0.2rem' }}>{q.label}</div>
                          <div style={{ fontSize: '12px', color: brand.smoke, fontStyle: 'italic' }}>{q.hint}</div>
                        </div>
                      </div>
                      <textarea
                        placeholder="Answer honestly..."
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        style={{ ...styles.input, minHeight: '68px', resize: 'vertical', fontSize: '13px', lineHeight: 1.5, marginLeft: '28px', width: 'calc(100% - 28px)' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Progress + Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: brand.smoke }}>
                    {filledCount}/5 answered
                    {filledCount < 3 && ' — answer at least 3 to run audit'}
                  </div>
                  <button
                    onClick={handleRun}
                    disabled={!canRun}
                    style={{ ...styles.button, opacity: canRun ? 1 : 0.4, cursor: canRun ? 'pointer' : 'not-allowed' }}
                  >
                    Run Audit →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Output header */}
                <div style={{ ...styles.card, marginBottom: '1rem', borderTop: `2px solid ${brand.amber}`, padding: '1.25rem 1.5rem' }}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.35rem' }}>Decision Under Review</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: brand.white }}>{decision}</div>
                </div>

                {/* Verdict */}
                <div style={{ ...styles.card, marginBottom: '1rem', borderTop: `2px solid ${getVerdict().color}` }}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Audit Output</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: getVerdict().color, marginBottom: '1rem' }}>
                    {getVerdict().text}
                  </div>
                  <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.7, fontStyle: 'italic' }}>
                    This is not a recommendation. This is a mirror. The right answer is the one you couldn't admit before you answered Q1.
                  </div>
                </div>

                {/* Answers summary */}
                <div style={styles.card}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Your Answers</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {AUDIT_QUESTIONS.map((q, i) => (
                      <div key={q.id} style={{ display: answers[q.id]?.trim() ? 'block' : 'none' }}>
                        <div style={{ fontSize: '11px', color: brand.amber, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                          Q{i + 1} — {q.label.split(' ').slice(0, 5).join(' ')}...
                        </div>
                        <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.6, padding: '0.75rem', background: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.border}` }}>
                          {answers[q.id]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={reset} style={{ ...styles.button, marginTop: '1.5rem', background: 'transparent', color: brand.amber, border: `1px solid ${brand.amber}` }}>
                    New Decision
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Decision Log */}
        {activeTab === 'log' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PAST_DECISIONS.map((d, i) => (
                <div key={i} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{d.label}</span>
                      <span style={{ fontSize: '11px', color: brand.smoke }}>{d.date}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: brand.silver, fontStyle: 'italic' }}>
                      Fear: "{d.fear}"
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ ...styles.badge(brand.smoke), fontSize: '11px' }}>{d.outcome}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: d.verdictColor, padding: '3px 10px', background: `${d.verdictColor}15`, borderRadius: '8px', border: `1px solid ${d.verdictColor}40` }}>
                      {d.verdict}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.25rem', fontSize: '13px', color: brand.smoke, fontStyle: 'italic', textAlign: 'center' }}>
              Decisions you've run through the audit. Patterns emerge over time.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
