'use client';

import { brand, styles } from '@/lib/brand';

interface WorkItem {
  id: string;
  title: string;
  owner: string;
  stage: 'active' | 'frozen' | 'kill';
  impact: 'Low' | 'Medium' | 'High';
  lastTouched: string;
  reason: string;
}

const ITEMS: WorkItem[] = [
  {
    id: 'sk-1',
    title: 'Ship new onboarding sequence',
    owner: 'Remy',
    stage: 'active',
    impact: 'High',
    lastTouched: '2h',
    reason: 'A/B test copy + CTA placement',
  },
  {
    id: 'sk-2',
    title: 'Launch AxeCap weekly recap',
    owner: 'Paula',
    stage: 'active',
    impact: 'Medium',
    lastTouched: '1d',
    reason: 'Finalize template + assets',
  },
  {
    id: 'sk-3',
    title: 'Rebuild investor deck v3',
    owner: 'Anders',
    stage: 'frozen',
    impact: 'High',
    lastTouched: '6d',
    reason: 'Awaiting updated metrics',
  },
  {
    id: 'sk-4',
    title: 'Redesign agent profile cards',
    owner: 'Paula',
    stage: 'frozen',
    impact: 'Low',
    lastTouched: '12d',
    reason: 'Need new visual direction',
  },
  {
    id: 'sk-5',
    title: 'Podcast syndication experiment',
    owner: 'Dax',
    stage: 'kill',
    impact: 'Low',
    lastTouched: '18d',
    reason: 'No traction after 3 weeks',
  },
  {
    id: 'sk-6',
    title: 'Discord automation bot',
    owner: 'Dwight',
    stage: 'kill',
    impact: 'Medium',
    lastTouched: '21d',
    reason: 'Too much upkeep vs ROI',
  },
];

const columns = [
  { id: 'active', title: 'Active', hint: 'Max 2', color: brand.success },
  { id: 'frozen', title: 'Frozen', hint: 'Paused', color: brand.warning },
  { id: 'kill', title: 'Kill Pile', hint: 'Archive', color: brand.error },
] as const;

const impactColor = (impact: WorkItem['impact']) => {
  if (impact === 'High') return brand.error;
  if (impact === 'Medium') return brand.amber;
  return brand.success;
};

export default function ShipOrKillPage() {
  const activeItems = ITEMS.filter(item => item.stage === 'active');
  const activeSlots = `${activeItems.length}/2`;

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={styles.h1}>Ship or Kill Board</h1>
            <p style={styles.subtitle}>Focus only on the two most critical ships. Everything else freezes or dies.</p>
          </div>
          <div style={{ ...styles.card, padding: '0.75rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase' }}>Active Slots</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: brand.amber }}>{activeSlots}</div>
            </div>
            <div style={{ width: 1, height: 32, background: brand.border }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase' }}>Freeze Depth</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: brand.warning }}>
                {ITEMS.filter(item => item.stage === 'frozen').length}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {columns.map(column => {
            const items = ITEMS.filter(item => item.stage === column.id);
            return (
              <div key={column.id} style={{ ...styles.card, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: column.color, textTransform: 'uppercase' }}>
                      {column.title}
                    </div>
                    <div style={{ fontSize: '11px', color: brand.smoke }}>{column.hint}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: brand.silver, fontFamily: "'JetBrains Mono', monospace" }}>
                    {items.length} items
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '10px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                        <span style={{ ...styles.badge(impactColor(item.impact)), textTransform: 'uppercase', fontSize: '10px' }}>{item.impact}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: brand.silver, marginBottom: '0.4rem' }}>
                        <span>Owner: {item.owner}</span>
                        <span>Last touched: {item.lastTouched}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: brand.smoke }}>
                        Reason: {item.reason}
                      </div>
                    </div>
                  ))}
                </div>

                {column.id === 'active' && items.length < 2 && (
                  <div style={{ marginTop: '0.75rem', fontSize: '11px', color: brand.smoke }}>
                    Open slot available. Promote from Frozen or pull in a new bet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
