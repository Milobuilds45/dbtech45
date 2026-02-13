'use client';

import { useState } from 'react';

interface Agent {
  name: string;
  initials: string;
  color: string;
  role: string;
  description: string;
  handles: string[];
  motto: string;
}

const AGENTS: Agent[] = [
  { name: 'Anders', initials: 'AN', color: '#F97316', role: 'Full Stack Dev', description: 'Turns designs into deployed, production-grade code. Ships fast, breaks nothing.', handles: ['Architecture decisions', 'Code reviews', 'Deployments', 'Performance'], motto: 'Ship it.' },
  { name: 'Paula', initials: 'PA', color: '#EC4899', role: 'Design Director', description: 'Brand identity, UI/UX, visual systems. Makes chaos look intentional.', handles: ['Brand guidelines', 'UI design', 'Design systems', 'Visual QA'], motto: 'Less, but better.' },
  { name: 'Bobby', initials: 'BO', color: '#EF4444', role: 'Trading Systems', description: 'Market analysis, signal generation, risk management. Always watching the tape.', handles: ['Trade signals', 'Risk alerts', 'Market research', 'Portfolio tracking'], motto: 'The market is always right.' },
  { name: 'Remy', initials: 'RE', color: '#22C55E', role: 'Marketing', description: 'Growth strategy, audience building, campaign execution.', handles: ['Content distribution', 'Social strategy', 'Analytics', 'Campaigns'], motto: 'Growth is a process.' },
  { name: 'Tony', initials: 'TO', color: '#EAB308', role: 'Operations', description: 'Systems, infrastructure, workflows. The invisible hand that keeps it running.', handles: ['Process automation', 'Infrastructure', 'Scheduling', 'Logistics'], motto: 'Systems over effort.' },
  { name: 'Dax', initials: 'DA', color: '#06B6D4', role: 'Content', description: 'Newsletters, storytelling, data narratives. Turns ideas into words that land.', handles: ['Newsletter writing', 'Content strategy', 'Data storytelling', 'Copy'], motto: 'Words that work.' },
  { name: 'Webb', initials: 'WE', color: '#3B82F6', role: 'Research', description: 'Deep dives, competitive analysis, data synthesis.', handles: ['Market research', 'Competitive intel', 'Trend analysis', 'Reports'], motto: 'Data before decisions.' },
  { name: 'Dwight', initials: 'DW', color: '#6366F1', role: 'Intel', description: 'Real-time news monitoring, event detection, macro awareness.', handles: ['News scanning', 'Event alerts', 'Macro trends', 'Intel briefs'], motto: 'First to know.' },
  { name: 'Wendy', initials: 'WN', color: '#8B5CF6', role: 'Psychology', description: 'Habits, focus, energy management. The coach who never quits on you.', handles: ['Habit tracking', 'Focus sessions', 'Energy management', 'Motivation'], motto: 'Small wins compound.' },
];

const STATS = [
  { value: '24/7', label: 'Uptime' },
  { value: '10', label: 'Agents' },
  { value: '\u221E', label: 'Tasks/Day' },
  { value: '0', label: 'Sick Days' },
];

function AgentCard({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
      style={{
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '8px',
        padding: expanded ? '16px 20px 24px' : '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = agent.color; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#222222'; }}
      onFocus={(e) => { e.currentTarget.style.borderColor = agent.color; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#222222'; }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Initial Badge */}
        <div style={{
          width: 40, height: 40, borderRadius: '10px',
          background: '#000000', border: `2px solid ${agent.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: agent.color,
          fontFamily: "'Inter', sans-serif", flexShrink: 0,
        }}>
          {agent.initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>{agent.name}</div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: agent.color, fontFamily: "'Inter', sans-serif" }}>{agent.role}</div>
        </div>

        {/* Chevron */}
        <svg
          aria-hidden="true"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.2s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded Content */}
      <div style={{
        maxHeight: expanded ? '400px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.2s ease',
        opacity: expanded ? 1 : 0,
      }}>
        <p style={{ fontSize: '14px', color: '#A3A3A3', lineHeight: 1.6, marginTop: '16px', marginBottom: 0, fontFamily: "'Inter', sans-serif" }}>
          {agent.description}
        </p>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#737373', letterSpacing: '0.05em', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>
            What I handle
          </div>
          {agent.handles.map((h, i) => (
            <div key={i} style={{ fontSize: '13px', color: '#A3A3A3', lineHeight: 1.8, fontFamily: "'Inter', sans-serif", paddingLeft: '12px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#737373' }}>&bull;</span>
              {h}
            </div>
          ))}
        </div>

        <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#737373', marginTop: '12px', marginBottom: 0, fontFamily: "'Inter', sans-serif" }}>
          &ldquo;{agent.motto}&rdquo;
        </p>
      </div>
    </div>
  );
}

export default function TheTeam() {
  return (
    <section id="swarm" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: '#F59E0B', marginBottom: '12px' }}>
          &gt; the-swarm
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FAFAFA', margin: '0 0 12px', fontFamily: "'Inter', sans-serif" }}>
          The Swarm
        </h2>
        <p style={{ fontSize: '16px', color: '#A3A3A3', margin: 0, fontFamily: "'Inter', sans-serif" }}>
          I don&apos;t have a team of 50. I have 10 AI agents who never sleep.
        </p>
      </div>

      {/* Milo Hero Card */}
      <div style={{
        background: '#111111',
        border: '1px solid #222222',
        borderLeft: '3px solid #A855F7',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Milo Badge */}
        <div style={{
          width: 60, height: 60, borderRadius: '14px',
          background: '#000000', border: '2px solid #A855F7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, color: '#A855F7',
          fontFamily: "'Inter', sans-serif", flexShrink: 0,
        }}>
          MI
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>Milo</span>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#A855F7', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>
              Head of Staff
            </span>
          </div>
          <p style={{ fontSize: '15px', color: '#A3A3A3', margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Routes every task, manages priorities, orchestrates the swarm. The brain that never sleeps.
          </p>
        </div>

        {/* Status Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div className="swarm-pulse" style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#10B981',
          }} />
          <span style={{ fontSize: '12px', color: '#737373', fontFamily: "'Inter', sans-serif" }}>Online</span>
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }} className="swarm-grid">
        {AGENTS.map(agent => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '8px',
        padding: '24px 32px',
        marginTop: '48px',
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {STATS.map((stat, i) => (
          <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#F59E0B', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#737373', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>
                {stat.label}
              </div>
            </div>
            {i < STATS.length - 1 && (
              <div className="swarm-divider" style={{ width: '1px', height: '40px', background: '#222222' }} />
            )}
          </div>
        ))}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #10B981; }
          50% { opacity: 0.6; box-shadow: 0 0 16px #10B981; }
        }
        .swarm-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @media (max-width: 1024px) {
          .swarm-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .swarm-grid { grid-template-columns: 1fr !important; }
          .swarm-divider { display: none !important; }
        }
      `}</style>
    </section>
  );
}
