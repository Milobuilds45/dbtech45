'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

interface TimeBlock {
  label: string;
  hours: number;
  color: string;
  category: 'keep' | 'cut' | 'evaluate';
}

const DEFAULT_BLOCKS: TimeBlock[] = [
  { label: 'Restaurant operations', hours: 60, color: brand.error, category: 'cut' },
  { label: 'Sleep', hours: 49, color: brand.success, category: 'keep' },
  { label: 'Family / kids', hours: 21, color: brand.success, category: 'keep' },
  { label: 'Trading', hours: 10, color: brand.amber, category: 'keep' },
  { label: 'Building / AI', hours: 8, color: brand.amber, category: 'keep' },
  { label: 'Commute', hours: 7, color: brand.error, category: 'cut' },
  { label: 'Admin / errands', hours: 5, color: brand.warning, category: 'evaluate' },
  { label: 'Misc / wasted', hours: 8, color: brand.error, category: 'cut' },
];

const QUESTIONS = [
  "If you had 20 years left, what would you stop doing today?",
  "What are you doing right now that a stranger would call a waste of your life?",
  "Which obligation do you carry out of guilt, not purpose?",
  "What would you do with 10 recovered hours per week?",
  "Is your calendar aligned with what you'd tell your kids mattered?",
];

const categoryStyle = (cat: TimeBlock['category']) => {
  if (cat === 'keep') return { color: brand.success, label: 'KEEP' };
  if (cat === 'cut') return { color: brand.error, label: 'CUT' };
  return { color: brand.warning, label: 'EVALUATE' };
};

export default function TwentyYearClockPage() {
  const [age, setAge] = useState(46);
  const [lifeExpectancy, setLifeExpectancy] = useState(70);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  const yearsLeft = Math.max(0, lifeExpectancy - age);
  const weeksLeft = yearsLeft * 52;
  const hoursLeft = yearsLeft * 8760;
  const totalHours = DEFAULT_BLOCKS.reduce((sum, b) => sum + b.hours, 0);

  const cutHours = DEFAULT_BLOCKS.filter(b => b.category === 'cut').reduce((sum, b) => sum + b.hours, 0);
  const evaluateHours = DEFAULT_BLOCKS.filter(b => b.category === 'evaluate').reduce((sum, b) => sum + b.hours, 0);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={styles.h1}>The 20-Year Clock</h1>
            <p style={styles.subtitle}>If your time is finite, does your schedule reflect what actually matters?</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ ...styles.card, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Years Left</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: brand.amber, lineHeight: 1 }}>{yearsLeft}</div>
            </div>
            <div style={{ ...styles.card, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Weeks Left</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: brand.white, lineHeight: 1 }}>{weeksLeft.toLocaleString()}</div>
            </div>
            <div style={{ ...styles.card, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Recoverable Hrs/wk</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: brand.success, lineHeight: 1 }}>
                {Math.round((cutHours + evaluateHours * 0.5) / 52)}
              </div>
            </div>
          </div>
        </div>

        {/* Age inputs */}
        <div style={{ ...styles.card, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Current Age</div>
            <input
              type="range"
              min={20}
              max={80}
              value={age}
              onChange={e => setAge(Number(e.target.value))}
              style={{ width: '160px', accentColor: brand.amber }}
            />
            <span style={{ color: brand.amber, fontWeight: 700, marginLeft: '0.75rem' }}>{age}</span>
          </div>
          <div>
            <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Life Expectancy</div>
            <input
              type="range"
              min={50}
              max={100}
              value={lifeExpectancy}
              onChange={e => setLifeExpectancy(Number(e.target.value))}
              style={{ width: '160px', accentColor: brand.amber }}
            />
            <span style={{ color: brand.silver, fontWeight: 700, marginLeft: '0.75rem' }}>{lifeExpectancy}</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: brand.smoke }}>
            ≈ {(hoursLeft / 1000000).toFixed(1)}M hours left on earth
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Weekly hours breakdown */}
          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Your Weekly Hours — All 168</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {DEFAULT_BLOCKS.map((block, i) => {
                const pct = (block.hours / 168) * 100;
                const cat = categoryStyle(block.category);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '13px', color: brand.white }}>{block.label}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: cat.color, fontWeight: 700 }}>{cat.label}</span>
                        <span style={{ fontSize: '13px', color: brand.silver, fontFamily: "'JetBrains Mono', monospace" }}>
                          {block.hours}h
                        </span>
                      </div>
                    </div>
                    <div style={{ background: brand.border, borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: block.color, borderRadius: '4px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.smoke }}>
              <span>Total mapped: {totalHours}h / 168h week</span>
              <span style={{ color: brand.error }}>Cut candidate: {cutHours}h/wk</span>
            </div>
          </div>

          {/* Priority stack */}
          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Ruthless Priority Stack</div>
            <div style={{ marginBottom: '1rem', fontSize: '13px', color: brand.silver, fontStyle: 'italic', lineHeight: 1.6 }}>
              "If you had 20 years left, what would you stop doing today?"
            </div>

            {(['keep', 'evaluate', 'cut'] as const).map(cat => {
              const catStyle = categoryStyle(cat);
              const items = DEFAULT_BLOCKS.filter(b => b.category === cat);
              const totalH = items.reduce((s, b) => s + b.hours, 0);
              return (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: catStyle.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {catStyle.label}
                    </div>
                    <div style={{ fontSize: '11px', color: brand.smoke }}>{totalH}h/wk</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {items.map((b, i) => (
                      <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: `${catStyle.color}18`, color: catStyle.color, border: `1px solid ${catStyle.color}30` }}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: `1px solid ${brand.border}` }}>
              <div style={{ fontSize: '12px', color: brand.smoke }}>
                Reclaim scenario: cut 100% of red + 50% of yellow =&nbsp;
                <span style={{ color: brand.success, fontWeight: 700 }}>
                  {Math.round(cutHours + evaluateHours * 0.5)}h/wk
                </span>
                &nbsp;freed
              </div>
            </div>
          </div>
        </div>

        {/* The 5 Questions */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ ...styles.sectionLabel }}>The 5 Questions That Cut Through Everything</div>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              style={{ ...styles.button, padding: '0.4rem 0.85rem', fontSize: '12px' }}
            >
              {showAnswers ? 'Collapse' : 'Open Reflection'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {QUESTIONS.map((q, i) => (
              <div key={i}>
                <div style={{ fontSize: '13px', color: brand.white, marginBottom: '0.35rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: brand.amber, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', minWidth: '18px' }}>
                    {i + 1}.
                  </span>
                  {q}
                </div>
                {showAnswers && (
                  <textarea
                    placeholder="Your answer..."
                    value={answers[i] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    style={{
                      ...styles.input,
                      minHeight: '64px',
                      resize: 'vertical',
                      fontSize: '13px',
                      lineHeight: '1.5',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
