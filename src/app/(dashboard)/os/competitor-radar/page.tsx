'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

// Sample competitor data for Nashua, NH restaurant market
const COMPETITORS = [
  {
    name: "Fody's Tavern",
    type: 'Bar & Grill',
    distance: '0.3 mi',
    googleRating: 4.2,
    reviewCount: 1847,
    priceRange: '$$',
    recentPromos: ['Wing Wednesday $0.50 wings', 'St. Patrick\'s Day all-weekend event', 'March Madness viewing parties'],
    customerComplaints: ['Slow service on weekends', 'Parking issues', 'Inconsistent food quality'],
    gaps: ['No breakfast', 'Limited seafood', 'No family-friendly Sunday option'],
    trend: 'stable',
    lastChecked: '2026-03-14',
  },
  {
    name: "Shorty\'s Mexican Roadhouse",
    type: 'Mexican',
    distance: '0.5 mi',
    googleRating: 4.0,
    reviewCount: 2103,
    priceRange: '$$',
    recentPromos: ['Taco Tuesday $2 tacos', 'Margarita Monday specials', 'Family combo meals'],
    customerComplaints: ['Long wait times', 'Portions getting smaller', 'Loud atmosphere'],
    gaps: ['No early bird', 'No New England comfort food', 'Closed for breakfast'],
    trend: 'stable',
    lastChecked: '2026-03-14',
  },
  {
    name: 'China Buffet',
    type: 'Chinese / Buffet',
    distance: '0.8 mi',
    googleRating: 3.7,
    reviewCount: 892,
    priceRange: '$',
    recentPromos: ['Lunch buffet $9.99', 'Senior discount'],
    customerComplaints: ['Food quality declining', 'Cleanliness issues', 'No atmosphere'],
    gaps: ['No local flavor', 'No social media presence', 'No seasonal menu'],
    trend: 'down',
    lastChecked: '2026-03-14',
  },
  {
    name: 'Red Arrow Diner',
    type: 'Diner',
    distance: '1.2 mi',
    googleRating: 4.4,
    reviewCount: 3241,
    priceRange: '$',
    recentPromos: ['24-hour diner badge', 'Classic diner branding', 'Tourist draw'],
    customerComplaints: ['Tiny portions', 'Tourist prices', 'Always packed, long waits'],
    gaps: ['No full dinner menu', 'Basic seafood only', 'High price for diner format'],
    trend: 'up',
    lastChecked: '2026-03-14',
  },
  {
    name: 'Italian Farmhouse',
    type: 'Italian',
    distance: '1.5 mi',
    googleRating: 4.3,
    reviewCount: 1456,
    priceRange: '$$$',
    recentPromos: ['Valentine\'s prix fixe (still promoting)', 'Date night specials', 'Private dining rooms'],
    customerComplaints: ['Expensive', 'Small parking lot', 'Reservation required on weekends'],
    gaps: ['No breakfast', 'No haddock', 'No casual walk-in option'],
    trend: 'stable',
    lastChecked: '2026-03-14',
  },
];

const OPPORTUNITY_GAPS = [
  { label: 'Breakfast dominance', detail: 'Only 1 of 5 competitors serves breakfast. Bobola\'s owns this daypart by default.', urgency: 'hold' },
  { label: 'Haddock monopoly', detail: '0 competitors feature fresh haddock prominently. This is Bobola\'s uncontested territory.', urgency: 'hold' },
  { label: 'St. Patrick\'s gap', detail: 'Fody\'s is running full weekend St. Patrick\'s events. Bobola\'s should counter with a corned beef & haddock special this week.', urgency: 'act' },
  { label: 'March Madness blind spot', detail: "Fody's is leaning into March Madness viewing parties. Bobola's could run a simple 'game night' takeout special.", urgency: 'act' },
  { label: 'Family Sunday positioning', detail: 'No competitor is explicitly targeting Sunday family dining. Bobola\'s Sunday revenue is strong — double down on this positioning.', urgency: 'opportunity' },
];

function getTrendBadge(trend: string) {
  if (trend === 'up') return { label: 'Gaining', color: brand.error };
  if (trend === 'down') return { label: 'Declining', color: brand.success };
  return { label: 'Stable', color: brand.silver };
}

function getUrgencyStyle(urgency: string): React.CSSProperties {
  if (urgency === 'act') return { color: brand.error, background: `${brand.error}15`, border: `1px solid ${brand.error}40` };
  if (urgency === 'opportunity') return { color: brand.amber, background: `${brand.amber}15`, border: `1px solid ${brand.amber}40` };
  return { color: brand.success, background: `${brand.success}15`, border: `1px solid ${brand.success}40` };
}

function getUrgencyLabel(urgency: string) {
  if (urgency === 'act') return 'ACT NOW';
  if (urgency === 'opportunity') return 'OPPORTUNITY';
  return 'HOLD POSITION';
}

export default function CompetitorRadarPage() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'brief' | 'deep'>('brief');

  const selected = COMPETITORS.find(c => c.name === selectedCompetitor);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={styles.h1}>Competitor Radar</h1>
            <span style={{ fontSize: '11px', background: brand.info, color: brand.void, padding: '3px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>NASHUA, NH</span>
          </div>
          <p style={styles.subtitle}>What every restaurant within 2 miles is promoting, what their customers hate, and where the gaps are.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: brand.carbon, padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {(['brief', 'deep'] as const).map(tab => (
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
              {tab === 'brief' ? 'Weekly Brief' : 'Deep Dive'}
            </button>
          ))}
        </div>

        {/* Weekly Brief */}
        {activeTab === 'brief' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Market overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Competitors Tracked', value: COMPETITORS.length, color: brand.amber },
                { label: 'Gaining on You', value: COMPETITORS.filter(c => c.trend === 'up').length, color: brand.error },
                { label: 'Declining', value: COMPETITORS.filter(c => c.trend === 'down').length, color: brand.success },
                { label: 'Action Items', value: OPPORTUNITY_GAPS.filter(g => g.urgency === 'act').length, color: brand.warning },
                { label: 'Your Moats', value: OPPORTUNITY_GAPS.filter(g => g.urgency === 'hold').length, color: brand.success },
              ].map((stat, i) => (
                <div key={i} style={{ ...styles.card, textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: brand.smoke, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Opportunity gaps */}
            <div style={styles.card}>
              <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Market Intelligence — This Week</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {OPPORTUNITY_GAPS.map((gap, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', background: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.border}` }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', marginTop: '1px', ...getUrgencyStyle(gap.urgency) }}>
                      {getUrgencyLabel(gap.urgency)}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: brand.white, marginBottom: '0.2rem' }}>{gap.label}</div>
                      <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.5 }}>{gap.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What they're promoting */}
            <div style={styles.card}>
              <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>What Your Competition is Promoting Right Now</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {COMPETITORS.map((c, i) => (
                  <div key={i} style={{ padding: '0.75rem', background: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{c.name}</span>
                        <span style={{ fontSize: '11px', color: brand.smoke }}>{c.distance}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', ...{ color: getTrendBadge(c.trend).color, background: `${getTrendBadge(c.trend).color}15` } }}>
                        {getTrendBadge(c.trend).label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {c.recentPromos.map((promo, j) => (
                        <span key={j} style={{ fontSize: '12px', color: brand.silver, background: `${brand.amber}0a`, border: `1px solid ${brand.amber}20`, padding: '2px 8px', borderRadius: '4px' }}>
                          {promo}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Deep Dive */}
        {activeTab === 'deep' && (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: '1rem' }}>

            {/* Competitor list */}
            <div>
              <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>Select Competitor</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {COMPETITORS.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCompetitor(selectedCompetitor === c.name ? null : c.name)}
                    style={{
                      ...styles.card,
                      cursor: 'pointer',
                      borderColor: selectedCompetitor === c.name ? brand.amber : brand.border,
                      background: selectedCompetitor === c.name ? `${brand.amber}08` : brand.carbon,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: brand.smoke, marginTop: '2px' }}>{c.type} · {c.distance} · {c.priceRange}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: brand.amber, fontFamily: "'JetBrains Mono', monospace" }}>{c.googleRating}</div>
                        <div style={{ fontSize: '11px', color: brand.smoke }}>{c.reviewCount.toLocaleString()} reviews</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor detail */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ ...styles.card, borderTop: `2px solid ${brand.amber}` }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: brand.white, marginBottom: '0.25rem' }}>{selected.name}</div>
                  <div style={{ fontSize: '13px', color: brand.smoke }}>{selected.type} · {selected.distance} · Google {selected.googleRating} ({selected.reviewCount.toLocaleString()} reviews)</div>
                </div>

                <div style={styles.card}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>What They're Promoting</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selected.recentPromos.map((promo, i) => (
                      <div key={i} style={{ fontSize: '13px', color: brand.silver, padding: '0.5rem 0.75rem', background: brand.graphite, borderRadius: '6px', borderLeft: `3px solid ${brand.amber}` }}>
                        {promo}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>What Customers Complain About</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selected.customerComplaints.map((c, i) => (
                      <div key={i} style={{ fontSize: '13px', color: brand.silver, padding: '0.5rem 0.75rem', background: brand.graphite, borderRadius: '6px', borderLeft: `3px solid ${brand.error}` }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>Gaps Bobola's Can Exploit</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selected.gaps.map((g, i) => (
                      <div key={i} style={{ fontSize: '13px', color: brand.silver, padding: '0.5rem 0.75rem', background: brand.graphite, borderRadius: '6px', borderLeft: `3px solid ${brand.success}` }}>
                        {g}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: brand.smoke, fontStyle: 'italic', textAlign: 'center' }}>
                  Last scanned: {new Date(selected.lastChecked).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
