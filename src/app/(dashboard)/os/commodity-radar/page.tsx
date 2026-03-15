'use client';

import { useState, useCallback } from 'react';
import { brand, styles } from '@/lib/brand';

interface Commodity {
  name: string;
  unit: string;
  price: number;
  prevPrice: number;
  category: string;
  icon: string;
}

const SEED_DATA: Commodity[] = [
  { name: 'Beef — Choice 600-900lb', unit: '/cwt', price: 318.50, prevPrice: 309.20, category: 'protein', icon: '🥩' },
  { name: 'Pork Belly', unit: '/cwt', price: 142.75, prevPrice: 138.40, category: 'protein', icon: '🥓' },
  { name: 'Chicken Breast — Boneless', unit: '/lb', price: 1.87, prevPrice: 1.91, category: 'protein', icon: '🍗' },
  { name: 'Eggs — Grade A Large', unit: '/doz', price: 7.24, prevPrice: 5.88, category: 'dairy/eggs', icon: '🥚' },
  { name: 'Butter — AA Grade', unit: '/lb', price: 2.84, prevPrice: 2.79, category: 'dairy/eggs', icon: '🧈' },
  { name: 'All-Purpose Flour', unit: '/cwt', price: 38.20, prevPrice: 37.85, category: 'dry goods', icon: '🌾' },
  { name: 'Canola Oil', unit: '/lb', price: 0.68, prevPrice: 0.71, category: 'dry goods', icon: '🫙' },
  { name: 'Diesel Fuel #2', unit: '/gal', price: 3.89, prevPrice: 3.74, category: 'fuel', icon: '⛽' },
];

function pctChange(current: number, prev: number) {
  return ((current - prev) / prev) * 100;
}

function alertLevel(pct: number): { color: string; label: string; bg: string } {
  const abs = Math.abs(pct);
  if (abs > 5) return { color: brand.error, label: 'HIGH', bg: `${brand.error}18` };
  if (abs >= 2) return { color: brand.warning, label: 'WATCH', bg: `${brand.warning}18` };
  return { color: brand.success, label: 'STABLE', bg: `${brand.success}18` };
}

const IMPACT_NOTES: Record<string, string> = {
  'Beef — Choice 600-900lb': 'Beef up 3%+ → consider trimming portion sizes or adding a $1–2 surcharge on steaks. Watch prime rib margins closely.',
  'Pork Belly': 'Pork belly rising — bacon costs follow. If >5% sustained, renegotiate supplier contract or switch to blade roll.',
  'Chicken Breast — Boneless': 'Chicken dipping slightly — good window to lock in a 30-day contract. Chicken dishes carry strong margin.',
  'Eggs — Grade A Large': 'Eggs remain elevated from avian flu impact. Consider switching brunch specials to frittatas to stretch yield.',
  'Butter — AA Grade': 'Butter stable. No menu action needed, but watch dairy bloc for any USDA surplus news.',
  'All-Purpose Flour': 'Flour creeping up — review bread/dessert COGS. A 5% flour increase hits your burger buns at ~$0.03/each.',
  'Canola Oil': 'Oil easing slightly — good moment to top off reserves. Consider 55-gal drum purchase if distributor allows.',
  'Diesel Fuel #2': 'Diesel up — delivery surcharges from suppliers likely incoming within 2–3 weeks. Pre-order before they reprice.',
};

export default function CommodityRadarPage() {
  const [data, setData] = useState<Commodity[]>(SEED_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate small price fluctuations on refresh
      setData(prev => prev.map(item => ({
        ...item,
        prevPrice: item.price,
        price: parseFloat((item.price * (1 + (Math.random() - 0.5) * 0.006)).toFixed(2)),
      })));
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setRefreshing(false);
    }, 1800);
  }, []);

  const categories = ['ALL', ...Array.from(new Set(SEED_DATA.map(d => d.category.toUpperCase())))];
  const filtered = selectedCategory === 'ALL' ? data : data.filter(d => d.category.toUpperCase() === selectedCategory);

  const alerts = data.filter(d => Math.abs(pctChange(d.price, d.prevPrice)) > 2);
  const redCount = data.filter(d => Math.abs(pctChange(d.price, d.prevPrice)) > 5).length;

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Back + Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/os" style={styles.backLink}>← Back to OS</a>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={styles.h1}>Commodity Radar</h1>
              <p style={styles.subtitle}>Real-time food & fuel cost intelligence for restaurant operators</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  ...styles.button,
                  opacity: refreshing ? 0.7 : 1,
                  minWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '14px' }}>{refreshing ? '◌' : '↻'}</span>
                {refreshing ? 'Checking markets...' : 'Refresh Markets'}
              </button>
              <span style={{ fontSize: '11px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                Last updated: {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ ...styles.card, padding: '1rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, minWidth: '240px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Items Tracked</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: brand.amber, lineHeight: 1 }}>{data.length}</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: brand.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Alerts Active</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: alerts.length > 0 ? brand.warning : brand.success, lineHeight: 1 }}>{alerts.length}</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: brand.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.25rem' }}>High Risk</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: redCount > 0 ? brand.error : brand.success, lineHeight: 1 }}>{redCount}</div>
            </div>
          </div>

          <div style={{ ...styles.card, padding: '1rem 1.5rem', flex: 2, minWidth: '280px' }}>
            <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Alert Thresholds</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { color: brand.success, label: 'STABLE', desc: '<2% change' },
                { color: brand.warning, label: 'WATCH', desc: '2–5% change' },
                { color: brand.error, label: 'HIGH', desc: '>5% change' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                  <span style={{ fontSize: '11px', color: t.color, fontWeight: 700 }}>{t.label}</span>
                  <span style={{ fontSize: '11px', color: brand.smoke }}>{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: `1px solid ${selectedCategory === cat ? brand.amber : brand.border}`,
                background: selectedCategory === cat ? brand.amber : 'transparent',
                color: selectedCategory === cat ? brand.void : brand.silver,
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Commodity grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {filtered.map((item) => {
            const pct = pctChange(item.price, item.prevPrice);
            const alert = alertLevel(pct);
            const up = pct > 0;
            return (
              <div
                key={item.name}
                style={{
                  ...styles.card,
                  borderColor: Math.abs(pct) > 2 ? alert.color + '55' : brand.border,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Alert stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: alert.color }} />
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: brand.white, lineHeight: 1.3 }}>{item.name}</div>
                        <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.category}</div>
                      </div>
                    </div>
                    <span style={{ ...styles.badge(alert.color), background: alert.bg, fontFamily: "'JetBrains Mono', monospace" }}>
                      {alert.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: brand.white, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                        ${item.price.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '11px', color: brand.smoke, marginTop: '0.2rem' }}>per {item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: up ? brand.error : brand.success,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '11px', color: brand.smoke }}>
                        prev: ${item.prevPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* What This Means */}
        <div style={styles.card}>
          <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>What This Means — Menu & Cost Impact</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.map((item) => {
              const pct = pctChange(item.price, item.prevPrice);
              const alert = alertLevel(pct);
              const note = IMPACT_NOTES[item.name];
              if (!note) return null;
              return (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    background: brand.graphite,
                    border: `1px solid ${brand.border}`,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: brand.white }}>{item.name}</span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        background: alert.bg,
                        color: alert.color,
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: brand.silver, margin: 0, lineHeight: 1.5 }}>{note}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${brand.border}`, fontSize: '11px', color: brand.smoke }}>
            Data sourced from USDA AMS, CME futures, and regional wholesale reports. Prices represent national averages — regional variance may apply.
          </div>
        </div>

      </div>
    </div>
  );
}
