'use client';
import { brand, styles } from "@/lib/brand";
import Image from 'next/image';

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

        {/* n8n-style workflow visualization */}
        <div style={{ position: 'relative', marginBottom: '48px' }}>
          
          {/* Avatar/Logo at top */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ 
              position: 'relative',
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              border: `3px solid ${brand.amber}`,
              boxShadow: `0 0 20px rgba(245,158,11,0.3)`,
              overflow: 'hidden',
              background: brand.carbon
            }}>
              <Image 
                src="/derek-avatar.png" 
                alt="Derek" 
                width={80} 
                height={80}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Vertical connector from avatar to DB TECH box */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 80,
            width: 2,
            height: 24,
            background: `linear-gradient(to bottom, ${brand.amber}, ${brand.amber}50)`,
            transform: 'translateX(-50%)'
          }} />

          {/* DB TECH Node */}
          <div style={{ 
            maxWidth: 420, 
            margin: '0 auto 32px', 
            textAlign: 'center', 
            position: 'relative',
            background: brand.carbon,
            border: `2px solid ${brand.amber}`,
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: `0 0 30px rgba(245,158,11,0.15)`
          }}>
            {/* Connector dots on sides */}
            <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: brand.amber, border: `2px solid ${brand.carbon}`, boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
            <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: brand.amber, border: `2px solid ${brand.carbon}`, boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
            
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: brand.amber, letterSpacing: '0.05em' }}>DB TECH</div>
            <div style={{ fontSize: 13, color: brand.smoke, marginTop: 4 }}>Fueled by Caffeine and Chaos</div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {['Builder', 'Dad of 7', 'Trader'].map(b => (
                <span key={b} style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.15)', color: brand.amber, fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Vertical connector from DB TECH to branches */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: -24,
            width: 2,
            height: 32,
            background: `linear-gradient(to bottom, ${brand.amber}, transparent)`,
            transform: 'translateX(-50%)'
          }} />
        </div>

        {/* Horizontal connector line */}
        <div style={{ 
          position: 'relative', 
          height: 2, 
          background: `linear-gradient(to right, transparent, ${brand.border} 10%, ${brand.border} 90%, transparent)`,
          marginBottom: 24,
          marginTop: 8
        }}>
          {/* Branch points */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute',
              left: `${12.5 + (i * 25)}%`,
              top: -4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: BRANCHES[i].color,
              border: `2px solid ${brand.carbon}`,
              boxShadow: `0 0 8px ${BRANCHES[i].color}66`
            }} />
          ))}
        </div>

        {/* Branch cards with connectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {BRANCHES.map((branch, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* Vertical connector to card */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: -24,
                width: 2,
                height: 24,
                background: branch.color,
                transform: 'translateX(-50%)',
                opacity: 0.6
              }} />
              
              <div style={{ 
                ...styles.card, 
                position: 'relative',
                borderColor: `${branch.color}40`,
                background: `linear-gradient(135deg, ${brand.carbon} 0%, rgba(${branch.color === brand.amber ? '245,158,11' : branch.color === brand.info ? '59,130,246' : branch.color === brand.success ? '16,185,129' : '239,68,68'},0.02) 100%)`
              }}>
                {/* Connector dot at top */}
                <div style={{ 
                  position: 'absolute', 
                  left: '50%', 
                  top: -5, 
                  transform: 'translateX(-50%)',
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  background: branch.color, 
                  border: `2px solid ${brand.carbon}`,
                  boxShadow: `0 0 6px ${branch.color}66` 
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${branch.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: branch.color }}>{branch.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: brand.white }}>{branch.title}</div>
                </div>
                {branch.items.map((item, j) => (
                  <div key={j} style={{ padding: '10px 0', borderBottom: j < branch.items.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: brand.white, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: brand.smoke, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
