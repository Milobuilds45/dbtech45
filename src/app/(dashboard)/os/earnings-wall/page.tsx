'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brand, styles } from '@/lib/brand';

const M = "'JetBrains Mono','Fira Code',monospace";
const STORAGE_KEY = 'earnings_wall_predictions_v1';
const TODAY = '2026-03-15';

interface EarningsItem {
  ticker: string;
  name: string;
  date: string;
  reportTime: 'Before Open' | 'After Close';
  sector: string;
  wsEps: number;
  wsRev: number; // billions
  actualEps: number | null;
  actualRev: number | null;
}

interface Prediction {
  ticker: string;
  eps: number;
  rev: number;
  vote: 'bull' | 'bear';
  submittedAt: string;
}

interface PredictionStore {
  [ticker: string]: Prediction;
}

const EARNINGS: EarningsItem[] = [
  { ticker: 'ORCL', name: 'Oracle Corp', date: '2026-03-10', reportTime: 'After Close', sector: 'Tech', wsEps: 1.47, wsRev: 14.8, actualEps: 1.52, actualRev: 15.1 },
  { ticker: 'COST', name: 'Costco Wholesale', date: '2026-03-06', reportTime: 'After Close', sector: 'Retail', wsEps: 4.05, wsRev: 63.5, actualEps: 3.97, actualRev: 62.1 },
  { ticker: 'MU', name: 'Micron Technology', date: '2026-03-19', reportTime: 'After Close', sector: 'Semis', wsEps: 1.78, wsRev: 8.9, actualEps: null, actualRev: null },
  { ticker: 'NKE', name: 'Nike Inc', date: '2026-03-20', reportTime: 'After Close', sector: 'Consumer', wsEps: 0.29, wsRev: 11.0, actualEps: null, actualRev: null },
  { ticker: 'FDX', name: 'FedEx Corp', date: '2026-03-19', reportTime: 'After Close', sector: 'Transport', wsEps: 3.72, wsRev: 21.8, actualEps: null, actualRev: null },
  { ticker: 'TSLA', name: 'Tesla Inc', date: '2026-04-22', reportTime: 'After Close', sector: 'Auto/Tech', wsEps: 0.52, wsRev: 25.1, actualEps: null, actualRev: null },
  { ticker: 'NVDA', name: 'NVIDIA Corp', date: '2026-05-20', reportTime: 'After Close', sector: 'Semis', wsEps: 0.98, wsRev: 43.8, actualEps: null, actualRev: null },
  { ticker: 'AAPL', name: 'Apple Inc', date: '2026-04-30', reportTime: 'After Close', sector: 'Tech', wsEps: 1.62, wsRev: 94.2, actualEps: null, actualRev: null },
  { ticker: 'META', name: 'Meta Platforms', date: '2026-04-29', reportTime: 'After Close', sector: 'Tech', wsEps: 6.44, wsRev: 42.7, actualEps: null, actualRev: null },
  { ticker: 'AMZN', name: 'Amazon.com', date: '2026-05-01', reportTime: 'After Close', sector: 'Tech/Retail', wsEps: 1.56, wsRev: 178.3, actualEps: null, actualRev: null },
  { ticker: 'GOOGL', name: 'Alphabet Inc', date: '2026-04-28', reportTime: 'After Close', sector: 'Tech', wsEps: 2.12, wsRev: 96.8, actualEps: null, actualRev: null },
  { ticker: 'MSFT', name: 'Microsoft Corp', date: '2026-04-29', reportTime: 'After Close', sector: 'Tech', wsEps: 3.18, wsRev: 72.4, actualEps: null, actualRev: null },
  { ticker: 'JPM', name: 'JPMorgan Chase', date: '2026-04-14', reportTime: 'Before Open', sector: 'Finance', wsEps: 4.63, wsRev: 43.1, actualEps: null, actualRev: null },
  { ticker: 'GS', name: 'Goldman Sachs', date: '2026-04-14', reportTime: 'Before Open', sector: 'Finance', wsEps: 12.44, wsRev: 14.9, actualEps: null, actualRev: null },
];

function loadPredictions(): PredictionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function savePredictions(store: PredictionStore) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

function isPast(date: string) { return date < TODAY; }
function daysUntil(date: string) {
  const diff = new Date(date).getTime() - new Date(TODAY).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getBeat(item: EarningsItem): boolean | null {
  if (item.actualEps === null) return null;
  return item.actualEps >= item.wsEps;
}

function getPredictionAccuracy(pred: Prediction, item: EarningsItem): number | null {
  if (item.actualEps === null) return null;
  const epsDiff = Math.abs(item.actualEps - pred.eps) / Math.abs(item.wsEps || 1);
  return Math.max(0, 100 - epsDiff * 100);
}

export default function EarningsWall() {
  const [predictions, setPredictions] = useState<PredictionStore>({});
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [formEps, setFormEps] = useState('');
  const [formRev, setFormRev] = useState('');
  const [formVote, setFormVote] = useState<'bull' | 'bear'>('bull');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'reported'>('all');
  const [formError, setFormError] = useState('');

  useEffect(() => { setPredictions(loadPredictions()); }, []);

  const filtered = EARNINGS
    .filter(e => {
      if (filter === 'upcoming') return !isPast(e.date);
      if (filter === 'reported') return isPast(e.date);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  function openForm(ticker: string) {
    const existing = predictions[ticker];
    setActiveTicker(ticker);
    setFormEps(existing ? String(existing.eps) : '');
    setFormRev(existing ? String(existing.rev) : '');
    setFormVote(existing?.vote ?? 'bull');
    setFormError('');
  }

  function submitPrediction() {
    if (!activeTicker) return;
    const eps = parseFloat(formEps);
    const rev = parseFloat(formRev);
    if (isNaN(eps) || isNaN(rev)) { setFormError('Enter valid EPS and Revenue values'); return; }
    const updated: PredictionStore = {
      ...predictions,
      [activeTicker]: { ticker: activeTicker, eps, rev, vote: formVote, submittedAt: new Date().toISOString() },
    };
    setPredictions(updated);
    savePredictions(updated);
    setActiveTicker(null);
  }

  // Accuracy stats
  const reportedItems = EARNINGS.filter(e => e.actualEps !== null);
  const predAccuracies = reportedItems
    .filter(e => predictions[e.ticker])
    .map(e => ({ item: e, score: getPredictionAccuracy(predictions[e.ticker], e) ?? 0, pred: predictions[e.ticker] }));
  const avgAccuracy = predAccuracies.length > 0 ? predAccuracies.reduce((s, a) => s + a.score, 0) / predAccuracies.length : null;
  const correctVotes = predAccuracies.filter(a => {
    const beat = getBeat(a.item);
    return (beat && a.pred.vote === 'bull') || (!beat && a.pred.vote === 'bear');
  }).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/os" style={styles.backLink}>← Back to OS</Link>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={styles.h1}>Earnings Whisper Wall</h1>
          <p style={styles.subtitle}>Submit your predictions before earnings — see how you stack up vs Wall Street</p>
        </div>

        {/* Accuracy tracker */}
        {predAccuracies.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Predictions Made', value: String(Object.keys(predictions).length), color: brand.white },
              { label: 'Reported', value: String(predAccuracies.length), color: brand.silver },
              { label: 'Avg EPS Accuracy', value: avgAccuracy !== null ? `${avgAccuracy.toFixed(1)}%` : '—', color: brand.amber },
              { label: 'Correct Bull/Bear', value: `${correctVotes}/${predAccuracies.length}`, color: brand.success },
            ].map(s => (
              <div key={s.label} style={{ ...styles.card, textAlign: 'center' as const, padding: '1rem' }}>
                <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>{s.label}</div>
                <div style={{ color: s.color, fontSize: '1.1rem', fontWeight: 700, fontFamily: M }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['all', 'upcoming', 'reported'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...styles.button,
              backgroundColor: filter === f ? brand.amber : brand.graphite,
              color: filter === f ? brand.void : brand.silver,
              padding: '0.5rem 1.25rem',
              textTransform: 'capitalize' as const,
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Earnings cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {filtered.map(item => {
            const beat = getBeat(item);
            const past = isPast(item.date);
            const pred = predictions[item.ticker];
            const days = daysUntil(item.date);
            const accuracy = pred && past ? getPredictionAccuracy(pred, item) : null;

            let borderColor: string = brand.border;
            if (!past) borderColor = brand.amber;
            if (past && beat === true) borderColor = brand.success;
            if (past && beat === false) borderColor = brand.error;

            return (
              <div key={item.ticker} style={{ ...styles.card, border: `1px solid ${borderColor}`, transition: 'border-color 0.2s' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: brand.amber, fontFamily: M, fontSize: '1.1rem', fontWeight: 700 }}>{item.ticker}</span>
                      <span style={{ ...styles.badge(brand.silver), fontSize: '11px' }}>{item.sector}</span>
                    </div>
                    <div style={{ color: brand.silver, fontSize: '13px' }}>{item.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ color: past ? brand.smoke : brand.amber, fontFamily: M, fontSize: '13px', fontWeight: 600 }}>
                      {formatDate(item.date)}
                    </div>
                    <div style={{ color: brand.smoke, fontSize: '11px', marginTop: '0.1rem' }}>
                      {past ? 'Reported' : days === 0 ? 'TODAY' : `in ${days}d`} · {item.reportTime}
                    </div>
                  </div>
                </div>

                {/* Wall St consensus */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: brand.graphite, borderRadius: '8px' }}>
                  <div>
                    <div style={styles.sectionLabel}>WS EPS Est.</div>
                    <div style={{ color: brand.white, fontFamily: M, fontSize: '14px', marginTop: '0.2rem' }}>${item.wsEps.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={styles.sectionLabel}>WS Rev Est.</div>
                    <div style={{ color: brand.white, fontFamily: M, fontSize: '14px', marginTop: '0.2rem' }}>${item.wsRev.toFixed(1)}B</div>
                  </div>
                </div>

                {/* Actual results (if reported) */}
                {past && item.actualEps !== null && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: beat ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '8px', border: `1px solid ${beat ? brand.success : brand.error}` }}>
                    <div>
                      <div style={styles.sectionLabel}>Actual EPS</div>
                      <div style={{ color: beat ? brand.success : brand.error, fontFamily: M, fontSize: '14px', fontWeight: 700, marginTop: '0.2rem' }}>
                        ${item.actualEps.toFixed(2)}
                        <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 400, marginLeft: '0.4rem' }}>
                          {item.actualEps >= item.wsEps ? '+' : ''}{((item.actualEps - item.wsEps) / Math.abs(item.wsEps) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {item.actualRev !== null && (
                      <div>
                        <div style={styles.sectionLabel}>Actual Rev</div>
                        <div style={{ color: item.actualRev >= item.wsRev ? brand.success : brand.error, fontFamily: M, fontSize: '14px', fontWeight: 700, marginTop: '0.2rem' }}>
                          ${item.actualRev.toFixed(1)}B
                        </div>
                      </div>
                    )}
                    <div style={{ gridColumn: '1/-1' }}>
                      <span style={{ ...styles.badge(beat ? brand.success : brand.error), fontWeight: 700 }}>
                        {beat ? '✓ EPS BEAT' : '✗ EPS MISS'}
                      </span>
                    </div>
                  </div>
                )}

                {/* User prediction */}
                {pred && (
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: '8px', border: `1px solid rgba(245,158,11,0.2)`, marginBottom: '0.75rem' }}>
                    <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>Your Prediction</div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                      <span style={{ color: brand.white, fontFamily: M, fontSize: '13px' }}>EPS: ${pred.eps.toFixed(2)}</span>
                      <span style={{ color: brand.white, fontFamily: M, fontSize: '13px' }}>Rev: ${pred.rev.toFixed(1)}B</span>
                      <span style={{ ...styles.badge(pred.vote === 'bull' ? brand.success : brand.error) }}>
                        {pred.vote === 'bull' ? '▲ BULL' : '▼ BEAR'}
                      </span>
                      {accuracy !== null && (
                        <span style={{ ...styles.badge(accuracy >= 80 ? brand.success : accuracy >= 60 ? brand.amber : brand.error) }}>
                          {accuracy.toFixed(0)}% accuracy
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                {!past ? (
                  <button
                    onClick={() => openForm(item.ticker)}
                    style={{ ...styles.button, width: '100%', backgroundColor: pred ? brand.graphite : brand.amber, color: pred ? brand.amber : brand.void, border: pred ? `1px solid ${brand.amber}` : 'none', padding: '0.6rem' }}
                  >
                    {pred ? 'Edit Prediction' : 'Submit Prediction'}
                  </button>
                ) : (
                  <div style={{ color: brand.smoke, fontSize: '12px', textAlign: 'center' as const }}>
                    {pred ? 'Prediction submitted' : 'No prediction submitted'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prediction form modal */}
        {activeTicker && (
          <div style={{ position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ ...styles.card, width: '100%', maxWidth: '420px', border: `1px solid ${brand.amber}` }}>
              {(() => {
                const item = EARNINGS.find(e => e.ticker === activeTicker)!;
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <h2 style={{ color: brand.amber, fontFamily: "'Space Grotesk', system-ui", fontSize: '1.2rem', fontWeight: 700 }}>{activeTicker}</h2>
                        <p style={{ color: brand.smoke, fontSize: '13px', marginTop: '0.2rem' }}>{item.name} · {formatDate(item.date)}</p>
                      </div>
                      <button onClick={() => setActiveTicker(null)} style={{ ...styles.button, backgroundColor: 'transparent', color: brand.smoke, padding: '0.25rem 0.5rem', fontSize: '1.2rem' }}>×</button>
                    </div>

                    <div style={{ padding: '0.75rem', backgroundColor: brand.graphite, borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <div style={{ color: brand.silver, fontSize: '12px' }}>Wall Street Consensus: EPS ${item.wsEps.toFixed(2)} · Rev ${item.wsRev.toFixed(1)}B</div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>Your EPS Estimate</div>
                      <input value={formEps} onChange={e => setFormEps(e.target.value)} placeholder={`e.g. ${item.wsEps.toFixed(2)}`} style={styles.input} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>Your Revenue Estimate (billions)</div>
                      <input value={formRev} onChange={e => setFormRev(e.target.value)} placeholder={`e.g. ${item.wsRev.toFixed(1)}`} style={styles.input} />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Sentiment</div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {(['bull', 'bear'] as const).map(v => (
                          <button key={v} onClick={() => setFormVote(v)} style={{
                            ...styles.button,
                            flex: 1,
                            backgroundColor: formVote === v ? (v === 'bull' ? brand.success : brand.error) : brand.graphite,
                            color: formVote === v ? '#000' : brand.silver,
                          }}>
                            {v === 'bull' ? '▲ Bullish' : '▼ Bearish'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formError && <div style={{ color: brand.error, fontSize: '13px', marginBottom: '0.75rem', fontFamily: M }}>{formError}</div>}
                    <button onClick={submitPrediction} style={{ ...styles.button, width: '100%' }}>Submit Prediction</button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
