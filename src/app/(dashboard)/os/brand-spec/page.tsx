'use client';

import { brand, styles } from '@/lib/brand';
import OpsGuard from '@/components/OpsGuard';

const SPACING = [
  { name: 'xs', value: '4px', use: 'Tight gaps, icon margins' },
  { name: 'sm', value: '8px', use: 'Inline spacing, small gaps' },
  { name: 'md', value: '16px', use: 'Card padding, section gaps' },
  { name: 'lg', value: '24px', use: 'Section padding, major gaps' },
  { name: 'xl', value: '32px', use: 'Page padding, section margins' },
  { name: '2xl', value: '48px', use: 'Hero spacing, major sections' },
];

const RADII = [
  { name: 'sm', value: '4px', use: 'Badges, small buttons' },
  { name: 'md', value: '8px', use: 'Buttons, inputs, tags' },
  { name: 'lg', value: '12px', use: 'Cards, panels' },
  { name: 'xl', value: '16px', use: 'Featured cards, modals' },
  { name: 'full', value: '9999px', use: 'Pills, avatars' },
];

const COMPONENTS = [
  {
    name: 'Card',
    desc: 'Primary container for grouped content',
    specs: ['Background: Carbon (#111)', 'Border: 1px solid #222', 'Border radius: 12px', 'Padding: 24px', 'Hover: border-color amber'],
  },
  {
    name: 'Button (Primary)',
    desc: 'Main call-to-action',
    specs: ['Background: Amber (#F59E0B)', 'Text: Void (#000)', 'Padding: 12px 32px', 'Border radius: 6px', 'Font weight: 600'],
  },
  {
    name: 'Button (Ghost)',
    desc: 'Secondary actions',
    specs: ['Background: transparent', 'Border: 1px solid #222', 'Text: Silver (#A3A3A3)', 'Hover: border amber, text amber'],
  },
  {
    name: 'Input',
    desc: 'Text inputs and textareas',
    specs: ['Background: Graphite (#1A1A1A)', 'Border: 1px solid #222', 'Border radius: 6px', 'Font: JetBrains Mono 14px', 'Focus: border amber'],
  },
  {
    name: 'Badge',
    desc: 'Status and priority indicators',
    specs: ['Background: rgba(255,255,255,0.08)', 'Text: contextual color', 'Padding: 3px 10px', 'Border radius: 10px', 'Font: 12px weight 500'],
  },
  {
    name: 'Navigation Item',
    desc: 'Sidebar navigation links',
    specs: ['Padding: 8px 20px', 'Active: amber text + amber border-right + amber bg 10%', 'Inactive: silver text', 'Icon: 18px with 10px gap'],
  },
];

const TEXT_SIZES = [
  { name: 'Page Title', size: '2rem (32px)', weight: '700', color: 'Amber', font: 'Inter' },
  { name: 'Section Title', size: '18-20px', weight: '600-700', color: 'Amber', font: 'Inter' },
  { name: 'Card Title', size: '16px', weight: '600', color: 'White', font: 'Inter' },
  { name: 'Body', size: '14px', weight: '400', color: 'Silver', font: 'Inter' },
  { name: 'Small / Meta', size: '12px', weight: '400-600', color: 'Smoke', font: 'Inter' },
  { name: 'Tiny / Labels', size: '11px', weight: '600', color: 'Smoke', font: 'Inter' },
  { name: 'Code / Terminal', size: '14px', weight: '400', color: 'White', font: 'JetBrains Mono' },
  { name: 'Timestamp', size: '12px', weight: '400', color: 'Smoke', font: 'JetBrains Mono' },
];

export default function BrandSpecPage() {
  return (
    <OpsGuard>
    <div style={styles.page}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Design System Spec</h1>
        <p style={styles.subtitle}>Component specs, spacing, typography scale, and layout rules for DBTECH45.</p>

        {/* Text Scale */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Text Scale</h2>
          <div style={{ ...styles.card, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
                  {['Role', 'Size', 'Weight', 'Color', 'Font'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEXT_SIZES.map((t, i) => (
                  <tr key={t.name} style={{ borderBottom: i < TEXT_SIZES.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                    <td style={{ padding: '10px 14px', color: brand.white, fontSize: '13px', fontWeight: 500 }}>{t.name}</td>
                    <td style={{ padding: '10px 14px', color: brand.silver, fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>{t.size}</td>
                    <td style={{ padding: '10px 14px', color: brand.silver, fontSize: '13px' }}>{t.weight}</td>
                    <td style={{ padding: '10px 14px', color: brand.silver, fontSize: '13px' }}>{t.color}</td>
                    <td style={{ padding: '10px 14px', color: brand.smoke, fontSize: '13px' }}>{t.font}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Spacing */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Spacing Scale</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {SPACING.map(s => (
              <div key={s.name} style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ background: brand.amber, height: '12px', width: s.value, borderRadius: '2px', minWidth: '4px' }} />
                  <span style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>{s.name}</span>
                  <span style={{ color: brand.smoke, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                </div>
                <div style={{ color: brand.smoke, fontSize: '11px' }}>{s.use}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Border Radius</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {RADII.map(r => (
              <div key={r.name} style={{ ...styles.card, textAlign: 'center', width: '120px' }}>
                <div style={{
                  width: '48px', height: '48px', border: `2px solid ${brand.amber}`,
                  borderRadius: r.value, margin: '0 auto 10px',
                }} />
                <div style={{ color: brand.white, fontWeight: 600, fontSize: '13px' }}>{r.name}</div>
                <div style={{ color: brand.smoke, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{r.value}</div>
                <div style={{ color: brand.smoke, fontSize: '10px', marginTop: '4px' }}>{r.use}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Components */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Component Specs</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {COMPONENTS.map(c => (
              <div key={c.name} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ color: brand.white, fontSize: '15px', fontWeight: 600, margin: 0 }}>{c.name}</h3>
                  <span style={{ color: brand.smoke, fontSize: '12px' }}>{c.desc}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {c.specs.map((spec, i) => (
                    <span key={i} style={{
                      background: brand.graphite, padding: '4px 10px', borderRadius: '4px',
                      fontSize: '12px', color: brand.silver, fontFamily: "'JetBrains Mono', monospace",
                    }}>{spec}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Layout Rules */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Layout Rules</h2>
          <div style={styles.card}>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                'Max content width: 1200px (1400px for Kanban)',
                'Grid: auto-fit, minmax(300px, 1fr) for card grids',
                'Sidebar: 240px expanded, 60px collapsed',
                'Page padding: 2rem (32px)',
                'Card gap: 1.5rem (24px)',
                'Section gap: 3rem (48px)',
                'Mobile breakpoint: 768px (sidebar becomes overlay)',
                'All transitions: 0.2s ease',
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                  <span style={{ color: brand.amber, fontWeight: 700, flexShrink: 0 }}>&bull;</span>
                  <span style={{ color: brand.silver }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={{ textAlign: 'center' }}>
          <a href="/brand-kit" style={{ color: brand.amber, textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginRight: '20px' }}>&larr; Brand Kit</a>
          <a href="/os" style={{ color: brand.smoke, textDecoration: 'none', fontSize: '14px' }}>Back to Mission Control</a>
        </div>
      </div>
    </div>
    </OpsGuard>
  );
}
