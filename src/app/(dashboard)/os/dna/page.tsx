'use client';
import { brand, styles } from "@/lib/brand";

const BRANCHES = [
  { title: 'Core Values', icon: '⎈', color: brand.amber, items: [
    { name: 'Build foundations first', desc: 'Prioritize systems, compounding leverage, and long-term resiliency.' },
    { name: 'Clarity beats speed', desc: 'Make the plan simple enough to execute under pressure.' },
    { name: 'Integrity in every rep', desc: 'Win the moment without sacrificing the mission.' },
  ]},
  { title: 'Operating Principles', icon: '◈', color: brand.info, items: [
    { name: 'Default to action', desc: 'Move with velocity, then refine with feedback loops.' },
    { name: 'Design for repeatability', desc: 'Every workflow should be teachable and scalable.' },
    { name: 'Signal over noise', desc: 'Protect focus. Say no to shiny distractions.' },
  ]},
  { title: 'Decision Filters', icon: '⧉', color: brand.success, items: [
    { name: 'Does it compound?', desc: 'Will this create leverage or reduce future friction?' },
    { name: 'Does it protect the brand?', desc: 'Everything ships with the DB Tech standard.' },
    { name: 'Does it energize the team?', desc: 'Momentum matters more than perfection.' },
  ]},
  { title: 'Anti-Patterns', icon: '⊘', color: brand.error, items: [
    { name: 'No vanity metrics', desc: "If it doesn't move revenue or retention, skip it." },
    { name: 'No premature optimization', desc: 'Ship it, validate it, then polish it.' },
    { name: 'No single points of failure', desc: 'Systems > heroes. Document everything.' },
  ]},
];

export default function DNA() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>DNA</h1>
        <p style={styles.subtitle}>Core principles · Decision filters · Operating system</p>

        <div style={{ ...styles.card, maxWidth: 420, margin: '0 auto 32px', textAlign: 'center', borderColor: 'rgba(245,158,11,0.3)', position: 'relative', background: `radial-gradient(circle at center, rgba(245,158,11,0.03), ${brand.carbon})` }}>
          <div style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: brand.amber, boxShadow: '0 0 6px rgba(245,158,11,0.4)' }} />
          <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: brand.amber, boxShadow: '0 0 6px rgba(245,158,11,0.4)' }} />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: brand.amber, letterSpacing: '0.05em' }}>DB TECH</div>
          <div style={{ fontSize: 13, color: brand.smoke, marginTop: 4 }}>Fueled by Caffeine and Chaos</div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
            {['Builder', 'Dad of 7', 'Trader'].map(b => (
              <span key={b} style={{ display: 'inline-flex', padding: '2px 10px', borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber }}>{b}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {BRANCHES.map((branch, i) => (
            <div key={i} style={{ ...styles.card, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: branch.color, boxShadow: `0 0 6px ${branch.color}66` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${branch.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: branch.color }}>{branch.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>{branch.title}</div>
              </div>
              {branch.items.map((item, j) => (
                <div key={j} style={{ padding: '10px 0', borderBottom: j < branch.items.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: brand.white, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: brand.smoke, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
