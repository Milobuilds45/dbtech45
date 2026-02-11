'use client';
import { brand, styles } from "@/lib/brand";

const AGENTS = [
  { name: 'Milo', role: 'Chief of Staff', color: '#A855F7', icon: '⚡', skills: ['Coordination', 'Strategy', 'Task Routing', 'Sprint Planning', 'Daily Briefings'] },
  { name: 'Anders', role: 'Full Stack Architect', color: '#F97316', icon: 'AN', skills: ['React/Next.js', 'Node.js/APIs', 'Supabase', 'Vercel Deploy', 'Python'] },
  { name: 'Paula', role: 'Creative Director', color: '#EC4899', icon: '✦', skills: ['UI/UX Design', 'Brand Identity', 'Figma', 'Design Systems', 'Color Theory'] },
  { name: 'Bobby', role: 'Trading Analyst', color: '#EF4444', icon: 'AX', skills: ['Market Analysis', 'Options Flow', 'Technical Charts', 'Risk Assessment', 'Trade Journaling'] },
  { name: 'Dwight', role: 'Intelligence Officer', color: '#3B82F6', icon: 'DW', skills: ['Model Evaluation', 'Resource Allocation', 'Benchmarking', 'Performance Testing', 'Cost Analysis'] },
  { name: 'Dax', role: 'Data Scientist', color: '#06B6D4', icon: 'DX', skills: ['Data Analysis', 'Visualization', 'Newsletter Writing', 'Signal Processing', 'Trend Detection'] },
  { name: 'Tony', role: 'Restaurant Ops', color: '#EAB308', icon: 'TN', skills: ['Menu Optimization', 'Inventory', 'Scheduling', 'Cost Control', 'Vendor Management'] },
  { name: 'Remy', role: 'Marketing', color: '#22C55E', icon: 'RM', skills: ['Social Media', 'Content Strategy', 'Copywriting', 'Campaign Management', 'Analytics'] },
  { name: 'Wendy', role: 'Psychology', color: '#8B5CF6', icon: 'WR', skills: ['Behavioral Analysis', 'User Research', 'Habit Design', 'Wellness Content', 'Mindfulness'] },
];

export default function SkillsInventory() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.h1}>Skills Inventory</h1>
            <p style={styles.subtitle}>Agent capability matrix · Interconnected skill web</p>
          </div>
          <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber, border: `1px solid ${brand.border}` }}>9 agents</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {AGENTS.map((agent, i) => (
            <div key={i} style={{ ...styles.card, position: 'relative' }}>
              <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: agent.color, boxShadow: `0 0 6px ${agent.color}66` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${brand.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: agent.color, flexShrink: 0 }}>{agent.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: brand.white }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: brand.smoke }}>{agent.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.skills.map(s => (
                  <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: `${agent.color}10`, color: agent.color, border: `1px solid ${agent.color}20` }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
