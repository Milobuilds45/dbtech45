'use client';

import { useMemo, useState } from 'react';
import { brand, styles } from '@/lib/brand';

const DEFAULT_DRAFT = `# DB TECH OS — The Signal

**Date:** Feb 23, 2026
**Subject:** The AI operating system playbook is consolidating

## Top Signals

- **Agents are now platforms.** Teams want orchestration, memory, and guardrails in one place.
- **Creator funnels keep compressing.** Shorter cycles, tighter feedback, faster iteration.
- **AI infra has a new KPI:** time-to-decision, not just tokens.

## This Week’s Moves

1. Ship the onboarding sequence (goal: 10% lift in activation).
2. Freeze the investor deck until Q1 metrics land.
3. Kill the podcast syndication experiment — not enough pull.

## Operator Notes

> Clarity is a feature. The roadmap wins when it says no loudly.

## Next Experiments

- New landing page hero variants
- Sniper queue cadence for X replies
- Newsletter automation runbook

---

**CTA:** Reply with the highest-leverage ship you’re pushing this week.`;

const renderMarkdown = (md: string) => {
  const lines = md.split('\n');
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} style={{ color: brand.white, fontSize: '1.6rem', fontWeight: 700, margin: '0 0 1rem' }}>
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{ color: brand.amber, fontSize: '1.1rem', fontWeight: 600, margin: '1.25rem 0 0.75rem' }}>
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <div key={i} style={{ borderLeft: `3px solid ${brand.amber}`, paddingLeft: '0.75rem', color: brand.silver, fontStyle: 'italic', margin: '0.5rem 0' }}>
          {line.slice(2)}
        </div>
      );
      continue;
    }

    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.5rem', color: brand.silver, fontSize: '0.9rem', margin: '0.25rem 0' }}>
          <span style={{ color: brand.amber }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong style="color:#FFFFFF">$1</strong>') }} />
        </div>
      );
      continue;
    }

    if (line.match(/^\d+\. /)) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.5rem', color: brand.silver, fontSize: '0.9rem', margin: '0.25rem 0' }}>
          <span style={{ color: brand.amber }}>{line.split('.')[0]}.</span>
          <span>{line.replace(/^\d+\. /, '')}</span>
        </div>
      );
      continue;
    }

    if (line.startsWith('---')) {
      elements.push(<div key={i} style={{ borderTop: `1px solid ${brand.border}`, margin: '1.25rem 0' }} />);
      continue;
    }

    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '0.5rem' }} />);
      continue;
    }

    elements.push(
      <p key={i} style={{ color: brand.silver, fontSize: '0.92rem', lineHeight: 1.6, margin: '0.2rem 0' }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#FFFFFF">$1</strong>').replace(/`(.+?)`/g, '<code style="background:#1A1A1A;padding:0.15rem 0.4rem;border-radius:4px;font-family:JetBrains Mono,monospace;color:#F59E0B">$1</code>') }} />
    );
  }

  return elements;
};

export default function NewsletterPage() {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const updatedAt = useMemo(() => new Date(), []);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={styles.h1}>Automated Newsletter</h1>
            <p style={styles.subtitle}>Live draft editor for the weekly Signal & Noise drop.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ ...styles.button, padding: '0.6rem 1.4rem' }}>Save Draft</button>
            <button style={{ background: 'transparent', border: `1px solid ${brand.border}`, color: brand.silver, borderRadius: '6px', padding: '0.6rem 1.4rem', fontWeight: 600, cursor: 'pointer' }}>Preview</button>
            <button style={{ background: 'transparent', border: `1px solid ${brand.border}`, color: brand.smoke, borderRadius: '6px', padding: '0.6rem 1.4rem', fontWeight: 600, cursor: 'not-allowed' }} disabled>
              Send Test
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div style={{ ...styles.card, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase' }}>Markdown Draft</div>
              <div style={{ fontSize: '11px', color: brand.silver }}>Last updated {updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              style={{ width: '100%', minHeight: '420px', background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '1rem', color: brand.white, fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", resize: 'vertical' }}
            />

            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Live Preview</div>
              <div style={{ background: '#0B0B0B', border: `1px solid ${brand.border}`, borderRadius: '10px', padding: '1rem', maxHeight: '460px', overflowY: 'auto' }}>
                {renderMarkdown(draft)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...styles.card }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Automation Status</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: brand.success }}>Ready to Send</div>
              <div style={{ fontSize: '12px', color: brand.silver, marginTop: '0.25rem' }}>Next send: Wed 9:00 AM ET</div>
            </div>

            <div style={{ ...styles.card }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Audience</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: brand.amber }}>12,480</div>
              <div style={{ fontSize: '12px', color: brand.silver }}>Open rate: 41% · CTR: 6.4%</div>
            </div>

            <div style={{ ...styles.card }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Checklist</div>
              {['Links verified', 'UTM tagged', 'Subject line locked', 'Preview sent to Remy'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: brand.silver, marginBottom: '0.4rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: brand.success }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
