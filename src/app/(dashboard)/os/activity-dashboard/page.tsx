'use client';
import { brand, styles } from "@/lib/brand";

const STATS = [
  { value: '9', label: 'ACTIVE AGENTS', color: brand.amber },
  { value: '28', label: 'PROJECTS', color: brand.success },
  { value: '147', label: 'COMMITS (7D)', color: brand.info },
  { value: '23', label: 'DEPLOYS (7D)', color: '#8B5CF6' },
];

const ACTIVITY = [
  { time: '5:02 PM', type: 'deploy', agent: 'Anders', msg: 'AxeCap Terminal deployed to production', color: brand.success, icon: '▲' },
  { time: '4:45 PM', type: 'commit', agent: 'Anders', msg: 'feat: port projects enhancements to static OS page', color: brand.amber, icon: '◆' },
  { time: '4:30 PM', type: 'commit', agent: 'Anders', msg: 'feat: sidebar avatar + roundtable collapse/expand', color: brand.amber, icon: '◆' },
  { time: '3:15 PM', type: 'session', agent: 'Paula', msg: 'Brand Kit explorations — AxeCap Terminal wireframes', color: '#EC4899', icon: '✦' },
  { time: '2:00 PM', type: 'deploy', agent: 'Anders', msg: 'Model Counsel collapse/expand deployed', color: brand.success, icon: '▲' },
  { time: '12:30 PM', type: 'session', agent: 'Milo', msg: 'Sprint coordination — prioritized Operations overhaul', color: '#A855F7', icon: '⚡' },
  { time: '11:00 AM', type: 'commit', agent: 'Anders', msg: 'fix: Brand Kit + Brand Spec as native pages', color: brand.amber, icon: '◆' },
  { time: '9:30 AM', type: 'session', agent: 'Bobby', msg: 'Morning market brief — ES holding above 6040 support', color: brand.error, icon: '📊' },
  { time: '8:00 AM', type: 'cron', agent: 'Milo', msg: 'Daily briefing delivered to Derek via Telegram', color: brand.info, icon: '⏰' },
  { time: '7:00 AM', type: 'cron', agent: 'System', msg: 'All 6 cron jobs executed successfully', color: brand.smoke, icon: '⚙' },
];

export default function ActivityDashboard() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.h1}>Activity Dashboard</h1>
            <p style={styles.subtitle}>Live system telemetry · Agent activity · Deploy status</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: `1px solid ${brand.border}`, fontSize: '12px', color: brand.success, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: brand.success, display: 'inline-block' }} /> Live
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ ...styles.card, textAlign: 'center', padding: '20px', background: `radial-gradient(circle at top, rgba(245,158,11,0.02), ${brand.carbon})` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, background: brand.carbon }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${brand.border}` }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: brand.success }}>◎</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>Activity Stream</div>
              <div style={{ fontSize: 11, color: brand.smoke }}>Last 24 hours</div>
            </div>
          </div>
          {ACTIVITY.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, color: item.color }}>{item.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.agent}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber }}>{item.type}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke, marginLeft: 'auto' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5 }}>{item.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
