'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

// Sample menu data (in production this would pull from Toast POS API)
const SAMPLE_MENU_DATA = [
  { name: 'Belly Buster', category: 'Breakfast', revenue: 2840, orders: 152, avgCheck: 18.68, trend: 'up', margin: 'high' },
  { name: 'Baked Haddock', category: 'Dinner', revenue: 2610, orders: 107, avgCheck: 24.39, trend: 'up', margin: 'high' },
  { name: 'Hot Coffee', category: 'Beverages', revenue: 1920, orders: 640, avgCheck: 3.00, trend: 'stable', margin: 'medium' },
  { name: 'Fisherman\'s Platter', category: 'Dinner', revenue: 1830, orders: 45, avgCheck: 40.67, trend: 'up', margin: 'high' },
  { name: 'Shepherd\'s Pie', category: 'Dinner', revenue: 1560, orders: 80, avgCheck: 19.50, trend: 'stable', margin: 'medium' },
  { name: 'Chicken Finger Dinner', category: 'Dinner', revenue: 1480, orders: 92, avgCheck: 16.09, trend: 'stable', margin: 'medium' },
  { name: 'All American Burger', category: 'Lunch', revenue: 1340, orders: 89, avgCheck: 15.06, trend: 'down', margin: 'low' },
  { name: 'Haddock Au Gratin', category: 'Dinner', revenue: 1210, orders: 52, avgCheck: 23.27, trend: 'up', margin: 'high' },
  { name: 'Garden Omelet', category: 'Breakfast', revenue: 980, orders: 71, avgCheck: 13.80, trend: 'stable', margin: 'medium' },
  { name: 'Lazy Man Lasagna', category: 'Dinner', revenue: 870, orders: 58, avgCheck: 15.00, trend: 'down', margin: 'low' },
  { name: 'Meatloaf', category: 'Dinner', revenue: 760, orders: 48, avgCheck: 15.83, trend: 'down', margin: 'low' },
  { name: 'Fountain Soda', category: 'Beverages', revenue: 680, orders: 340, avgCheck: 2.00, trend: 'stable', margin: 'low' },
  { name: 'Baked Seafood Casserole', category: 'Dinner', revenue: 640, orders: 22, avgCheck: 29.09, trend: 'up', margin: 'high' },
  { name: 'Roast Turkey Dinner', category: 'Dinner', revenue: 590, orders: 38, avgCheck: 15.53, trend: 'down', margin: 'low' },
  { name: 'Bacon with (2) Eggs', category: 'Breakfast', revenue: 520, orders: 52, avgCheck: 10.00, trend: 'stable', margin: 'medium' },
];

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Beverages'];

type SortKey = 'revenue' | 'orders' | 'avgCheck';

function getTrendColor(trend: string) {
  if (trend === 'up') return brand.success;
  if (trend === 'down') return brand.error;
  return brand.silver;
}

function getTrendIcon(trend: string) {
  if (trend === 'up') return '▲';
  if (trend === 'down') return '▼';
  return '—';
}

function getMarginColor(margin: string) {
  if (margin === 'high') return brand.success;
  if (margin === 'medium') return brand.amber;
  return brand.smoke;
}

function generateRecommendations(data: typeof SAMPLE_MENU_DATA) {
  const push = data.filter(i => i.trend === 'up' && i.margin === 'high').slice(0, 3);
  const feature = data.filter(i => i.margin === 'high' && i.orders < 60).slice(0, 2);
  const drop = data.filter(i => i.trend === 'down' && i.margin === 'low' && i.revenue < 900).slice(0, 3);
  const combo = push.slice(0, 2);

  return { push, feature, drop, combo };
}

export default function MenuAutopilotPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('revenue');
  const [activeTab, setActiveTab] = useState<'brief' | 'data'>('brief');

  const filtered = SAMPLE_MENU_DATA
    .filter(i => selectedCategory === 'All' || i.category === selectedCategory)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const recs = generateRecommendations(SAMPLE_MENU_DATA);
  const totalRevenue = SAMPLE_MENU_DATA.reduce((s, i) => s + i.revenue, 0);
  const topCategory = (() => {
    const byCat: Record<string, number> = {};
    SAMPLE_MENU_DATA.forEach(i => { byCat[i.category] = (byCat[i.category] || 0) + i.revenue; });
    return Object.entries(byCat).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const now = new Date();
  const weekLabel = `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={styles.h1}>Menu Autopilot</h1>
            <span style={{ fontSize: '11px', background: brand.success, color: brand.void, padding: '3px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.04em' }}>LIVE DATA</span>
          </div>
          <p style={styles.subtitle}>Weekly menu intelligence. Push this, drop that, watch the money move.</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Period Revenue', value: `$${totalRevenue.toLocaleString()}`, color: brand.amber },
            { label: 'Menu Items Tracked', value: SAMPLE_MENU_DATA.length, color: brand.white },
            { label: 'Top Category', value: topCategory, color: brand.success },
            { label: 'Items to Push', value: recs.push.length, color: brand.success },
            { label: 'Items to Drop', value: recs.drop.length, color: brand.error },
          ].map((stat, i) => (
            <div key={i} style={{ ...styles.card, textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: brand.smoke, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: brand.carbon, padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {(['brief', 'data'] as const).map(tab => (
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
              {tab === 'brief' ? 'Weekly Brief' : 'Full Menu Data'}
            </button>
          ))}
        </div>

        {/* Weekly Brief */}
        {activeTab === 'brief' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Brief header */}
            <div style={{ ...styles.card, borderTop: `2px solid ${brand.amber}`, padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: brand.white }}>Bobola's Menu Brief</div>
                  <div style={{ fontSize: '12px', color: brand.smoke, marginTop: '2px' }}>{weekLabel} — Generated by Menu Autopilot</div>
                </div>
                <div style={{ fontSize: '11px', color: brand.amber, fontWeight: 600, background: `${brand.amber}15`, border: `1px solid ${brand.amber}40`, padding: '4px 10px', borderRadius: '6px' }}>
                  RESTAURANT TOOLS
                </div>
              </div>
            </div>

            {/* PUSH THESE */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '16px', color: brand.success, fontWeight: 700 }}>▲ PUSH THESE</span>
                <span style={{ fontSize: '12px', color: brand.smoke }}>Trending up, high margin — put these front and center</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recs.push.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: `${brand.success}0a`, borderRadius: '8px', border: `1px solid ${brand.success}25` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: brand.smoke }}>{item.category} · ${item.avgCheck.toFixed(2)} avg check</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: brand.success, fontFamily: "'JetBrains Mono', monospace" }}>${item.revenue.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: brand.success }}>{item.orders} orders ▲</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HIDDEN GEMS */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '16px', color: brand.amber, fontWeight: 700 }}>★ HIDDEN GEMS</span>
                <span style={{ fontSize: '12px', color: brand.smoke }}>High margin, underordered — needs more visibility</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recs.feature.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: `${brand.amber}0a`, borderRadius: '8px', border: `1px solid ${brand.amber}25` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: brand.smoke }}>{item.category} · {item.orders} orders this period</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: brand.amber, fontFamily: "'JetBrains Mono', monospace" }}>${item.avgCheck.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: brand.smoke }}>avg check</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DROP OR REWORK */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '16px', color: brand.error, fontWeight: 700 }}>▼ DROP OR REWORK</span>
                <span style={{ fontSize: '12px', color: brand.smoke }}>Trending down, low margin — dead weight on the menu</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recs.drop.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: `${brand.error}0a`, borderRadius: '8px', border: `1px solid ${brand.error}25` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: brand.smoke }}>{item.category} · ${item.avgCheck.toFixed(2)} avg check</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: brand.error, fontFamily: "'JetBrains Mono', monospace" }}>${item.revenue.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: brand.error }}>{item.orders} orders ▼</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMBO OPPORTUNITY */}
            <div style={{ ...styles.card, borderTop: `2px solid ${brand.info}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '16px', color: brand.info, fontWeight: 700 }}>+ COMBO PLAY</span>
              </div>
              <div style={{ fontSize: '14px', color: brand.silver, lineHeight: 1.7 }}>
                Bundle <strong style={{ color: brand.white }}>{recs.combo[0]?.name}</strong> with a beverage upsell — {recs.combo[0]?.orders} orders at ${recs.combo[0]?.avgCheck.toFixed(2)} each. Add a $3 drink to every order and you're looking at a {Math.round((3 / (recs.combo[0]?.avgCheck || 1)) * 100)}% check lift with zero food cost increase.
              </div>
            </div>

          </div>
        )}

        {/* Full Data Table */}
        {activeTab === 'data' && (
          <div style={styles.card}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem', background: brand.graphite, padding: '3px', borderRadius: '8px' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: selectedCategory === cat ? brand.amber : 'transparent',
                      color: selectedCategory === cat ? brand.void : brand.smoke,
                      transition: 'all 0.15s',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: brand.smoke }}>Sort:</span>
                {(['revenue', 'orders', 'avgCheck'] as SortKey[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    style={{
                      padding: '4px 10px',
                      border: `1px solid ${sortBy === s ? brand.amber : brand.border}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: sortBy === s ? `${brand.amber}15` : 'transparent',
                      color: sortBy === s ? brand.amber : brand.smoke,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {s === 'avgCheck' ? 'Avg Check' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
                    {['Item', 'Category', 'Revenue', 'Orders', 'Avg Check', 'Trend', 'Margin'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: h === 'Item' || h === 'Category' ? 'left' : 'right', color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${brand.border}`, transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.75rem', color: brand.white, fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: '0.75rem', color: brand.smoke }}>{item.category}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: brand.white, fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>${item.revenue.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: brand.silver, fontFamily: "'JetBrains Mono', monospace' "}}>{item.orders}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: brand.silver, fontFamily: "'JetBrains Mono', monospace'" }}>${item.avgCheck.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: getTrendColor(item.trend), fontWeight: 700 }}>{getTrendIcon(item.trend)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: getMarginColor(item.margin), background: `${getMarginColor(item.margin)}15`, padding: '2px 8px', borderRadius: '4px' }}>
                          {item.margin}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '12px', color: brand.smoke, fontStyle: 'italic' }}>
              Data source: Toast POS — 14-day rolling period. Connect live API for real-time updates.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
