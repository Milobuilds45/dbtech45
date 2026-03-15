'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

// Historical baselines by day (avg sales by 3pm)
const DAY_BASELINES: Record<string, { by3pm: number; dayTotal: number; label: string }> = {
  Monday: { by3pm: 0, dayTotal: 0, label: 'Closed' },
  Tuesday: { by3pm: 680, dayTotal: 1445, label: 'Slowest day' },
  Wednesday: { by3pm: 810, dayTotal: 1691, label: 'Slow start' },
  Thursday: { by3pm: 1020, dayTotal: 2113, label: 'Picking up' },
  Friday: { by3pm: 1380, dayTotal: 2931, label: 'Strong day' },
  Saturday: { by3pm: 1640, dayTotal: 3479, label: 'Best day' },
  Sunday: { by3pm: 1320, dayTotal: 2802, label: 'Solid day' },
};

const OFFER_TEMPLATES = [
  {
    id: 'bogo',
    label: 'BOGO Appetizer',
    message: 'Tonight only at Bobola\'s: buy any entree, get a free appetizer. Dine-in only. Ends 8pm.',
    discount: 'Low cost, high perceived value',
  },
  {
    id: 'early',
    label: 'Early Bird Special',
    message: '20% off your entire bill tonight if you\'re seated by 6pm at Bobola\'s. Show this message.',
    discount: '20% off bill',
  },
  {
    id: 'haddock',
    label: 'Haddock Night',
    message: 'Fresh haddock special tonight at Bobola\'s. $2 off the Baked Haddock or Fisherman\'s Platter. Tonight only.',
    discount: '$2 off signature item',
  },
  {
    id: 'dessert',
    label: 'Free Dessert',
    message: 'Come in tonight — free dessert with any entree at Bobola\'s. Dine-in, tonight only. First 20 tables.',
    discount: 'Free dessert (limited)',
  },
];

const RECENT_ALERTS = [
  { day: 'Tuesday', date: 'Mar 11', paceAt3pm: 410, baseline: 680, pct: 60, offerSent: 'Early Bird Special', result: '+14 covers vs typical Tuesday' },
  { day: 'Wednesday', date: 'Mar 5', paceAt3pm: 520, baseline: 810, pct: 64, offerSent: 'BOGO Appetizer', result: '+9 covers, +$340 vs baseline' },
  { day: 'Thursday', date: 'Feb 27', paceAt3pm: 590, baseline: 1020, pct: 58, offerSent: 'Haddock Night', result: 'Recovered to 91% of baseline' },
];

function getPaceStatus(pct: number) {
  if (pct >= 90) return { label: 'On Track', color: brand.success };
  if (pct >= 70) return { label: 'Watch It', color: brand.warning };
  return { label: 'SOS TRIGGERED', color: brand.error };
}

export default function SlowNightSOSPage() {
  const days = Object.keys(DAY_BASELINES).filter(d => d !== 'Monday');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const defaultDay = days.includes(today) ? today : 'Tuesday';

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [currentSales, setCurrentSales] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(OFFER_TEMPLATES[0].id);
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');
  const [alertSent, setAlertSent] = useState(false);

  const baseline = DAY_BASELINES[selectedDay];
  const current = parseFloat(currentSales) || 0;
  const pct = baseline.by3pm > 0 ? Math.round((current / baseline.by3pm) * 100) : 0;
  const status = currentSales ? getPaceStatus(pct) : null;
  const deficit = baseline.by3pm > 0 ? Math.max(0, baseline.by3pm - current) : 0;
  const projectedTotal = baseline.dayTotal > 0 && current > 0
    ? Math.round((current / baseline.by3pm) * baseline.dayTotal)
    : 0;

  const offer = OFFER_TEMPLATES.find(o => o.id === selectedOffer)!;

  const handleSendAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={styles.h1}>Slow Night SOS</h1>
            <span style={{ fontSize: '11px', background: brand.warning, color: brand.void, padding: '3px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>REAL-TIME</span>
          </div>
          <p style={styles.subtitle}>Know you're having a slow night by 3pm. Fire an offer before it's too late.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: brand.carbon, padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {(['monitor', 'history'] as const).map(tab => (
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
              {tab === 'monitor' ? 'Live Monitor' : 'Alert History'}
            </button>
          ))}
        </div>

        {activeTab === 'monitor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Day selector */}
            <div style={styles.card}>
              <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>What day is it?</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => { setSelectedDay(day); setCurrentSales(''); setAlertSent(false); }}
                    style={{
                      padding: '6px 14px',
                      border: `1px solid ${selectedDay === day ? brand.amber : brand.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: selectedDay === day ? `${brand.amber}15` : 'transparent',
                      color: selectedDay === day ? brand.amber : brand.smoke,
                      transition: 'all 0.15s',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '12px', color: brand.smoke }}>
                {selectedDay}: <span style={{ color: brand.silver }}>{baseline.label}</span> — baseline ${baseline.by3pm.toLocaleString()} by 3pm, ${baseline.dayTotal.toLocaleString()} full day
              </div>
            </div>

            {/* Sales input */}
            <div style={styles.card}>
              <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>Sales as of 3pm today ($)</div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder={`Baseline is $${baseline.by3pm.toLocaleString()}`}
                  value={currentSales}
                  onChange={e => { setCurrentSales(e.target.value); setAlertSent(false); }}
                  style={{ ...styles.input, width: '220px' }}
                />
                {currentSales && status && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: status.color, padding: '4px 12px', background: `${status.color}15`, borderRadius: '6px', border: `1px solid ${status.color}40` }}>
                      {status.label}
                    </span>
                    <span style={{ fontSize: '13px', color: brand.smoke }}>— {pct}% of baseline</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pace dashboard */}
            {currentSales && status && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Current Sales', value: `$${current.toLocaleString()}`, color: brand.white },
                  { label: 'Baseline at 3pm', value: `$${baseline.by3pm.toLocaleString()}`, color: brand.silver },
                  { label: 'Deficit', value: deficit > 0 ? `-$${deficit.toLocaleString()}` : 'On pace', color: deficit > 0 ? brand.error : brand.success },
                  { label: 'Projected Day Total', value: projectedTotal > 0 ? `$${projectedTotal.toLocaleString()}` : '—', color: projectedTotal < baseline.dayTotal ? brand.warning : brand.success },
                ].map((stat, i) => (
                  <div key={i} style={{ ...styles.card, textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: brand.smoke, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* SOS Offer section — only show when under 70% */}
            {currentSales && pct < 70 && (
              <div style={{ ...styles.card, borderTop: `2px solid ${brand.error}` }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: brand.error }}>SOS TRIGGERED</span>
                  <span style={{ fontSize: '13px', color: brand.smoke }}>You're {100 - pct}% below pace — pick an offer and fire it now</span>
                </div>

                {/* Offer picker */}
                <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Select offer</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {OFFER_TEMPLATES.map(o => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOffer(o.id)}
                      style={{
                        padding: '0.75rem',
                        border: `1px solid ${selectedOffer === o.id ? brand.amber : brand.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedOffer === o.id ? `${brand.amber}0a` : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: selectedOffer === o.id ? brand.amber : brand.white }}>{o.label}</span>
                        <span style={{ fontSize: '11px', color: brand.smoke }}>{o.discount}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: brand.silver, lineHeight: 1.5, fontStyle: 'italic' }}>"{o.message}"</div>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>SMS/Email Preview</div>
                  <div style={{ fontSize: '14px', color: brand.white, lineHeight: 1.6 }}>{offer.message}</div>
                </div>

                <button
                  onClick={handleSendAlert}
                  style={{
                    ...styles.button,
                    background: alertSent ? brand.success : brand.error,
                    transition: 'background 0.3s',
                  }}
                >
                  {alertSent ? 'Alert Queued for Delivery' : 'Fire Offer Now'}
                </button>
                {alertSent && (
                  <div style={{ marginTop: '0.5rem', fontSize: '13px', color: brand.success }}>
                    Offer staged. Connect Meta Business API or SMS provider to deliver to your customer list.
                  </div>
                )}
              </div>
            )}

            {/* All good state */}
            {currentSales && pct >= 90 && (
              <div style={{ ...styles.card, borderTop: `2px solid ${brand.success}`, textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: brand.success, marginBottom: '0.5rem' }}>You're on pace</div>
                <div style={{ fontSize: '14px', color: brand.smoke }}>No SOS needed today. {selectedDay} is running at {pct}% of baseline.</div>
              </div>
            )}

            {/* Watch zone */}
            {currentSales && pct >= 70 && pct < 90 && (
              <div style={{ ...styles.card, borderTop: `2px solid ${brand.warning}`, padding: '1.25rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: brand.warning, marginBottom: '0.5rem' }}>Watch Zone</div>
                <div style={{ fontSize: '14px', color: brand.silver }}>
                  You're at {pct}% of baseline. Not a crisis yet — check again at 4pm. If you drop below 70%, the SOS offer will activate.
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {RECENT_ALERTS.map((a, i) => (
                <div key={i} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{a.day}</span>
                      <span style={{ fontSize: '11px', color: brand.smoke }}>{a.date}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: brand.error, background: `${brand.error}15`, padding: '2px 7px', borderRadius: '4px' }}>SOS at {a.pct}% pace</span>
                    </div>
                    <div style={{ fontSize: '12px', color: brand.silver }}>Offer: {a.offerSent}</div>
                    <div style={{ fontSize: '12px', color: brand.smoke }}>Sales at 3pm: ${a.paceAt3pm} vs baseline ${a.baseline}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: brand.success }}>{a.result}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '12px', color: brand.smoke, fontStyle: 'italic', textAlign: 'center' }}>
              Sample history. Connect live POS data for actual results tracking.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
