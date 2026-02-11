'use client';

import { brand } from '@/lib/brand';

export default function BrandSpecPage() {
  return (
    <div style={{ padding: '20px 30px', minHeight: '100vh', backgroundColor: brand.void }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: brand.amber, fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Design System Spec</h1>
        <p style={{ color: brand.silver, marginBottom: '2rem' }}>DBTECH45 design system -- spacing, components, usage guidelines.</p>

        <div style={{
          background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px',
          overflow: 'hidden', marginBottom: '2rem',
        }}>
          <iframe
            src="https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html"
            style={{ width: '100%', height: '80vh', border: 'none' }}
            title="DBTECH45 Brand Spec"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <a href="https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
              background: brand.amber, color: brand.void, fontWeight: 600, fontSize: '14px',
              textDecoration: 'none',
            }}>Open Full Spec</a>
          <a href="/brand-kit"
            style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
              background: brand.graphite, color: brand.amber, fontWeight: 600, fontSize: '14px',
              textDecoration: 'none', border: `1px solid ${brand.amber}`,
            }}>Brand Kit</a>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/os" style={{ color: brand.smoke, textDecoration: 'none', fontSize: '14px' }}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
