'use client';
import { useState } from 'react';
import { brand, styles } from "@/lib/brand";

const ENTRIES = [
  { date: '2026-02-10', title: 'DB Tech OS V3 Modules', tags: ['shipped', 'dbtech-os'], content: 'Deployed sidebar expansion with 7 new sections. Activity Dashboard, DNA, Memory Bank, Skills Inventory, Schedule Center, Goals Tracker, Master Todo.' },
  { date: '2026-02-07', title: 'Signal & Noise Voice Guide', tags: ['newsletter', 'brand'], content: 'Tight, decisive, data-first. No fluff. Close with actionable move. Bobby handles market intel, Dax handles data synthesis.' },
  { date: '2026-02-06', title: 'Agent Fleet Protocol Update', tags: ['ops', 'agents'], content: 'New QA checks for deploys, clearer escalation tags. Communication protocol established for agent-to-agent handoffs.' },
  { date: '2026-02-05', title: 'Boundless V2 Onboarding', tags: ['product', 'boundless'], content: 'Simplify to three screens. Lead with identity, then habit trigger. Paula delivering design by EOW.' },
  { date: '2026-02-04', title: 'SharpEdge AI Landing Page', tags: ['shipped', 'sharpedge'], content: 'Landing page deployed to Vercel. Next.js + Tailwind. Conversion-focused with clear CTAs.' },
  { date: '2026-02-03', title: 'X/Twitter Trends Monitor', tags: ['research', 'social'], content: 'Set up automated tech trends scanning. Tracking AI, coding tools, and developer ecosystem.' },
  { date: '2026-02-02', title: 'Sunday Squares Status', tags: ['product', 'sunday-squares'], content: 'Nearly done. Payment integration pending. Core game mechanics complete.' },
  { date: '2026-02-01', title: 'MenuSparks Client Feedback', tags: ['client', 'menusparks'], content: 'Focus on menu optimization dashboards, weekly snapshots, and SMS alerts. Clients want simpler UX.' },
  { date: '2026-01-31', title: 'Soul Solace Architecture', tags: ['product', 'soulsolace'], content: 'V2 spec finalized. Guided reflections, journaling, daily calm. InstantDB for real-time sync.' },
  { date: '2026-01-30', title: 'Pour Plan Concept', tags: ['spark', 'pourplan'], content: 'Drink recipe and bar management app. Basic scaffolding started.' },
  { date: '2026-01-29', title: 'Ticker App Research', tags: ['research', 'tickr'], content: 'Kids investing app concept. Teaching next generation about markets. Gamified learning approach.' },
  { date: '2026-01-28', title: 'Brand System Established', tags: ['brand', 'design'], content: 'Amber (#F59E0B) as primary accent. Dark theme standard. Space Grotesk + Inter + JetBrains Mono typography stack.' },
];

export default function MemoryBank() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  
  const filtered = search ? ENTRIES.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  ) : ENTRIES;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.h1}>Memory Bank</h1>
            <p style={styles.subtitle}>Knowledge graph · Decisions · Context</p>
          </div>
          <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber, border: `1px solid ${brand.border}` }}>{filtered.length} entries</span>
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: brand.smoke, fontSize: 14 }}>⌕</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories, decisions, context..."
            style={{ ...styles.input, paddingLeft: 38, width: '100%', background: brand.graphite, borderRadius: 10 }}
          />
        </div>

        <div>
          {filtered.map((entry, i) => (
            <div key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ ...styles.card, marginBottom: 10, cursor: 'pointer', position: 'relative', paddingLeft: 24, transition: 'border-color 0.2s', borderColor: expanded === i ? 'rgba(245,158,11,0.3)' : brand.border }}>
              <div style={{ position: 'absolute', left: -4, top: 20, width: 8, height: 8, borderRadius: '50%', background: brand.amber, boxShadow: '0 0 6px rgba(245,158,11,0.4)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: brand.amber }}>⬡</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>{entry.title}</div>
                    <div style={{ fontSize: 11, color: brand.smoke }}>{entry.date}</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.smoke} strokeWidth="2" style={{ transition: 'transform 0.2s', transform: expanded === i ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {expanded === i && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${brand.border}` }}>
                  <p style={{ fontSize: 13, color: brand.silver, lineHeight: 1.6, marginBottom: 10 }}>{entry.content}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {entry.tags.map(t => (
                      <span key={t} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
