'use client';

import { brand, styles } from '@/lib/brand';

const COLORS = [
  { name: 'Void', hex: '#000000', desc: 'Primary background' },
  { name: 'Carbon', hex: '#111111', desc: 'Card backgrounds' },
  { name: 'Graphite', hex: '#1A1A1A', desc: 'Input fields, secondary bg' },
  { name: 'Electric Amber', hex: '#F59E0B', desc: 'Primary accent, CTAs, headings' },
  { name: 'Amber Light', hex: '#FBBF24', desc: 'Hover states, highlights' },
  { name: 'Amber Dark', hex: '#D97706', desc: 'Active states, pressed' },
  { name: 'White', hex: '#FFFFFF', desc: 'Primary text' },
  { name: 'Silver', hex: '#A3A3A3', desc: 'Body text, descriptions' },
  { name: 'Smoke', hex: '#737373', desc: 'Muted text, timestamps' },
  { name: 'Success', hex: '#10B981', desc: 'Shipped, online, positive' },
  { name: 'Error', hex: '#EF4444', desc: 'Critical, high priority' },
  { name: 'Info', hex: '#3B82F6', desc: 'Links, informational' },
  { name: 'Warning', hex: '#EAB308', desc: 'In progress, caution' },
  { name: 'Border', hex: '#222222', desc: 'Card borders, dividers' },
];

const TYPOGRAPHY = [
  { name: 'Inter', usage: 'All UI text, body copy, buttons', weight: '400, 500, 600, 700', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'JetBrains Mono', usage: 'Code, terminal, timestamps, hashes', weight: '400, 600', sample: '$ git commit -m "shipped"' },
];

const LOGOS = [
  { name: 'Derek Avatar', desc: 'Personal brand mark with gold trims', isImage: true, imagePath: '/derek-avatar.png', rounded: true },
  { name: 'Wordmark Bold Condensed', desc: 'Headers, dark backgrounds', isImage: true, imagePath: '/brand/db45-wordmark-bold.png', rounded: false },
  { name: 'Wordmark Bold Inverse', desc: 'Light backgrounds, accent sections', isImage: true, imagePath: '/brand/db45-wordmark-bold-inverse.png', rounded: false, lightBg: true },
  { name: 'Wordmark Italic', desc: 'Sports/dynamic content', isImage: false, element: 'DBTECH45', fontStyle: 'italic' },
  { name: 'Wordmark Italic Inverse', desc: 'Light backgrounds', isImage: true, imagePath: '/brand/db45-italic-inverse.png', rounded: false, lightBg: true },
  { name: 'Cap Brandmark', desc: 'Favicon, icons, small contexts', isImage: true, imagePath: '/brand/dbtech-logo-cap.png', rounded: true },
] as const;

const BRAND_ASSETS = [
  { filename: 'derek-avatar.png', path: '/derek-avatar.png', useCase: 'Profile images, about sections, personal branding' },
  { filename: 'db45-wordmark-bold.png', path: '/brand/db45-wordmark-bold.png', useCase: 'Headers, navigation, dark backgrounds' },
  { filename: 'db45-wordmark-bold-inverse.png', path: '/brand/db45-wordmark-bold-inverse.png', useCase: 'Light backgrounds, accent sections, print' },
  { filename: 'db45-italic-inverse.png', path: '/brand/db45-italic-inverse.png', useCase: 'Light backgrounds, sports/dynamic content' },
  { filename: 'dbtech-logo-cap.png', path: '/brand/dbtech-logo-cap.png', useCase: 'Favicon, app icons, small contexts, social avatars' },
];

const AGENTS = [
  { name: 'Anders', role: 'Full Stack Architect', initials: 'AN', color: '#F97316' },
  { name: 'Paula', role: 'Design Director', initials: 'PA', color: '#EC4899' },
  { name: 'Milo', role: 'Chief of Staff', initials: 'MI', color: '#A855F7' },
  { name: 'Bobby', role: 'Trading Systems', initials: 'AX', color: '#EF4444' },
  { name: 'Remy', role: 'Marketing', initials: 'RM', color: '#22C55E' },
  { name: 'Tony', role: 'Operations', initials: 'TN', color: '#EAB308' },
  { name: 'Dax', role: 'Content / Data', initials: 'DX', color: '#06B6D4' },
  { name: 'Webb', role: 'Research', initials: 'WB', color: '#3B82F6' },
  { name: 'Dwight', role: 'Intel', initials: 'DW', color: '#6366F1' },
  { name: 'Wendy', role: 'Psychology', initials: 'WR', color: '#8B5CF6' },
];

export default function BrandKitPage() {
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Brand Kit</h1>
        <p style={styles.subtitle}>Complete DBTECH45 brand system. Colors, typography, logos, and agent identities.</p>

        {/* Logo Marks */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Logo Marks</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {LOGOS.map((l: any) => (
              <div key={l.name} style={{ ...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '2rem' }}>
                {l.isImage ? (
                  <div style={{ 
                    width: l.rounded ? '120px' : '240px', 
                    height: '120px', 
                    borderRadius: l.rounded ? '16px' : '12px', 
                    overflow: 'hidden',
                    border: `2px solid ${brand.amber}`,
                    background: l.lightBg ? '#F5F5F5' : brand.graphite,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: l.rounded ? '0' : '16px',
                  }}>
                    <img 
                      src={l.imagePath} 
                      alt={l.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: l.rounded ? 'cover' : 'contain',
                        objectPosition: 'center',
                        width: l.rounded ? '100%' : 'auto',
                        height: l.rounded ? '100%' : 'auto',
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '240px',
                    height: '120px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `2px solid ${brand.amber}`,
                    background: brand.graphite,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{
                      color: brand.amber,
                      fontWeight: 700,
                      fontSize: '28px',
                      fontStyle: l.fontStyle || 'normal',
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.08em',
                    }}>
                      {l.element}
                    </span>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>{l.name}</div>
                  <div style={{ color: brand.smoke, fontSize: '12px', marginTop: '4px' }}>{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Assets */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Brand Assets</h2>
          <div style={styles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: brand.amber, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: brand.amber, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filename</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: brand.amber, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  {BRAND_ASSETS.map((a, i) => (
                    <tr key={a.filename} style={{ borderBottom: i < BRAND_ASSETS.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${brand.border}`, background: brand.graphite, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={a.path} alt={a.filename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: brand.white, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{a.filename}</td>
                      <td style={{ padding: '10px 12px', color: brand.silver }}>{a.useCase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Color Palette</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {COLORS.map(c => (
              <div key={c.name} style={{ ...styles.card, padding: '0', overflow: 'hidden' }}>
                <div style={{ background: c.hex, height: '60px', borderBottom: `1px solid ${brand.border}` }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: brand.white, fontWeight: 600, fontSize: '13px' }}>{c.name}</span>
                    <span style={{ color: brand.smoke, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{c.hex}</span>
                  </div>
                  <div style={{ color: brand.smoke, fontSize: '11px', marginTop: '4px' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Typography</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {TYPOGRAPHY.map(t => (
              <div key={t.name} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: brand.white, fontSize: '16px', fontWeight: 600, margin: 0 }}>{t.name}</h3>
                  <span style={{ color: brand.smoke, fontSize: '12px' }}>Weights: {t.weight}</span>
                </div>
                <p style={{ color: brand.silver, fontSize: '13px', marginBottom: '12px' }}>Usage: {t.usage}</p>
                <div style={{
                  background: brand.graphite, borderRadius: '8px', padding: '16px',
                  fontFamily: t.name === 'JetBrains Mono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                  color: brand.white, fontSize: '16px',
                }}>{t.sample}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Agent Identities */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Agent Identities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {AGENTS.map(a => (
              <div key={a.name} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', background: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: brand.void, fontWeight: 700, fontSize: '13px', flexShrink: 0,
                }}>{a.initials}</div>
                <div>
                  <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>{a.name}</div>
                  <div style={{ color: brand.smoke, fontSize: '11px' }}>{a.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Rules */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: brand.amber, fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Usage Rules</h2>
          <div style={styles.card}>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                'Amber is the primary accent. Use it for CTAs, headings, active states, and key UI elements.',
                'Dark backgrounds only. Void (#000) for pages, Carbon (#111) for cards, Graphite (#1A1A1A) for inputs.',
                'No emojis in agent UI. Use colored initial badges instead.',
                'Inter for all UI text. JetBrains Mono for code, terminal, and technical displays.',
                'Borders are subtle (#222). Amber border on hover/active states only.',
                'Status colors: Green = shipped/success, Amber = building/warning, Red = critical/error, Blue = info.',
                'No gradients. No shadows. Clean flat design with border definition.',
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                  <span style={{ color: brand.amber, fontWeight: 700, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: brand.silver, lineHeight: '1.5' }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={{ textAlign: 'center' }}>
          <a href="/brand-spec" style={{ color: brand.amber, textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginRight: '20px' }}>Design System Spec &rarr;</a>
          <a href="/os" style={{ color: brand.smoke, textDecoration: 'none', fontSize: '14px' }}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
