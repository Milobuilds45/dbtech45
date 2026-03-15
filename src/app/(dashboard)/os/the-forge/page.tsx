'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brand, styles } from '@/lib/brand';

const STAGES = [
  { id: 'SPARK',   label: 'SPARK',   icon: '✦', hint: 'Idea submitted'   },
  { id: 'SPEC',    label: 'SPEC',    icon: '◈', hint: 'Requirements'      },
  { id: 'BUILD',   label: 'BUILD',   icon: '⚙', hint: 'Agents working'   },
  { id: 'REVIEW',  label: 'REVIEW',  icon: '◉', hint: 'Derek review'      },
  { id: 'SHIPPED', label: 'SHIPPED', icon: '⬡', hint: 'Live & verified'   },
] as const;

type Stage = typeof STAGES[number]['id'];

const STAGE_INDEX: Record<Stage, number> = {
  SPARK: 0, SPEC: 1, BUILD: 2, REVIEW: 3, SHIPPED: 4,
};

const AGENT_DISPLAY: Record<string, { color: string; initials: string }> = {
  Milo:   { color: '#A855F7', initials: 'MI' },
  Paula:  { color: '#EC4899', initials: 'PA' },
  Bobby:  { color: '#22C55E', initials: 'BO' },
  Anders: { color: '#F97316', initials: 'AN' },
  Dwight: { color: '#6366F1', initials: 'DW' },
  Jim:    { color: '#06B6D4', initials: 'JM' },
  Remy:   { color: '#EAB308', initials: 'RM' },
  Wendy:  { color: '#8B5CF6', initials: 'WN' },
};

interface Project {
  id: string;
  name: string;
  stage: Stage;
  progress: number;
  agents: string[];
  timeInStage: string;
  description: string;
  techStack: string[];
  nextAction: string;
}

const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Soul Solace Prayer App',
    stage: 'REVIEW',
    progress: 90,
    agents: ['Milo', 'Paula', 'Dwight'],
    timeInStage: '18h',
    description: 'AI-powered personal prayer companion with daily devotionals, scripture guidance, and reflective journaling.',
    techStack: ['Next.js', 'Claude API', 'Supabase'],
    nextAction: 'Derek approval pending — UI polish complete, backend stable. One tap from launch.',
  },
  {
    id: 'p2',
    name: 'tickR Kids Investing',
    stage: 'SPEC',
    progress: 40,
    agents: ['Anders', 'Jim'],
    timeInStage: '6h',
    description: 'Gamified stock market education for kids ages 8–14 with fake-money portfolios and parent dashboards.',
    techStack: ['React Native', 'Alpaca API', 'Firebase'],
    nextAction: 'Spec document 70% complete. Awaiting Alpaca API pricing confirmation before continuing.',
  },
  {
    id: 'p3',
    name: 'Boundless Journal',
    stage: 'BUILD',
    progress: 65,
    agents: ['Bobby', 'Wendy', 'Remy'],
    timeInStage: '2d',
    description: 'AI journaling companion that identifies patterns, surfaces insights, and builds a personal knowledge graph over time.',
    techStack: ['Next.js', 'OpenAI', 'PostgreSQL', 'Vercel'],
    nextAction: 'Bobby finishing sentiment engine. Wendy building timeline UI. Remy on onboarding flow.',
  },
  {
    id: 'p4',
    name: 'Business DNA Scanner',
    stage: 'SHIPPED',
    progress: 100,
    agents: ['Milo', 'Paula'],
    timeInStage: '3d since launch',
    description: 'AI tool that extracts and codifies your business personality, values, competitive advantages, and growth DNA from a conversation.',
    techStack: ['Next.js', 'Claude API', 'Vercel'],
    nextAction: 'Live at /os/design-dna. Monitoring engagement. Paula tracking user feedback for v2.',
  },
  {
    id: 'p5',
    name: 'Sunday Squares Pool Game',
    stage: 'SPARK',
    progress: 10,
    agents: ['Dwight'],
    timeInStage: '1h',
    description: 'Digital version of the classic football squares game with automated payouts, group invites, and live score tracking.',
    techStack: ['TBD'],
    nextAction: 'Dwight running market fit analysis and scoping the MVP feature set.',
  },
  {
    id: 'p6',
    name: 'Restaurant Analytics Dashboard',
    stage: 'BUILD',
    progress: 55,
    agents: ['Anders', 'Jim', 'Bobby'],
    timeInStage: '3d',
    description: "Real-time POS analytics for Bobola's covering revenue, waste, table turns, server performance, and menu velocity.",
    techStack: ['Next.js', 'Toast POS API', 'Chart.js', 'Supabase'],
    nextAction: 'POS API integration in progress. Revenue + cover charts complete. Waste tracking next.',
  },
];

const stageColor = (stage: Stage): string => {
  if (stage === 'SHIPPED') return brand.success;
  if (stage === 'REVIEW') return '#EC4899';
  if (stage === 'BUILD')   return brand.amber;
  if (stage === 'SPEC')    return brand.info;
  return brand.smoke;
};

const heatGradient = (pct: number): string => {
  if (pct >= 80) return `linear-gradient(90deg, ${brand.amberDark}, #EA580C, #DC2626)`;
  if (pct >= 50) return `linear-gradient(90deg, ${brand.amber}, #EA580C)`;
  if (pct >= 20) return `linear-gradient(90deg, ${brand.amberDark}, ${brand.amber})`;
  return `linear-gradient(90deg, #78350F, ${brand.amberDark})`;
};

const stageNodeGradient = (i: number): string => {
  if (i === 4) return 'linear-gradient(135deg, #065f46, #10B981)';
  if (i === 3) return 'linear-gradient(135deg, #831843, #EC4899)';
  if (i === 2) return `linear-gradient(135deg, ${brand.amberDark}, ${brand.amber})`;
  if (i === 1) return 'linear-gradient(135deg, #1d4ed8, #3B82F6)';
  return 'linear-gradient(135deg, #292524, #737373)';
};

export default function TheForgePage() {
  const [idea, setIdea] = useState('');
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [igniting, setIgniting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dbtech-color-mode');
    if (stored === 'cyber' || stored === 'void') setColorMode(stored);
  }, []);

  const isCyber  = colorMode === 'cyber';
  const bg       = isCyber ? '#050a15'  : brand.void;
  const cardBg   = isCyber ? '#0a1628'  : brand.carbon;
  const cardBorder = isCyber ? '#0d2244' : brand.border;
  const innerBg  = isCyber ? '#0d1f3c'  : brand.graphite;

  const handleIgnite = () => {
    if (!idea.trim()) return;
    setIgniting(true);
    setTimeout(() => setIgniting(false), 1800);
  };

  return (
    <div style={{ ...styles.page, backgroundColor: bg }}>
      <style>{`
        @keyframes ember-pulse {
          0%,100% { box-shadow: 0 0 12px rgba(245,158,11,0.35), 0 0 24px rgba(245,158,11,0.15); }
          50%      { box-shadow: 0 0 22px rgba(245,158,11,0.6),  0 0 44px rgba(245,158,11,0.28); }
        }
        @keyframes ignite-burst {
          0%   { box-shadow: 0 0 0px rgba(245,158,11,0); }
          40%  { box-shadow: 0 0 48px rgba(245,158,11,0.9), 0 0 90px rgba(234,88,12,0.55); }
          100% { box-shadow: 0 0 0px rgba(245,158,11,0); }
        }
        @keyframes heat-shimmer {
          0%,100% { opacity:1; }
          50%     { opacity:0.82; }
        }
        @keyframes dot-flow {
          0%   { transform: translateX(-6px); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: translateX(6px);  opacity: 0; }
        }
        .forge-row { cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .forge-row:hover { border-color: ${brand.amberDark} !important; box-shadow: 0 0 0 1px ${brand.amberDark}40, 0 4px 16px rgba(245,158,11,0.08) !important; }
        .ignite-btn:disabled { opacity: 0.45; cursor: not-allowed !important; }
        .ignite-btn:not(:disabled):hover {
          background: linear-gradient(135deg, ${brand.amberLight}, #F97316) !important;
          box-shadow: 0 0 28px rgba(245,158,11,0.55), 0 4px 16px rgba(234,88,12,0.45) !important;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Back link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/os" style={styles.backLink}>← Back to OS</Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.2rem' }}>
              <h1 style={{ ...styles.h1, marginBottom: 0, fontSize: '2.6rem', letterSpacing: '-0.04em' }}>
                THE FORGE
              </h1>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: brand.amber,
                animation: 'ember-pulse 2.4s ease-in-out infinite',
              }} />
            </div>
            <p style={{ ...styles.subtitle, marginBottom: 0, fontSize: '15px' }}>
              From spark to shipped. Ideas enter, products leave.
            </p>
          </div>
          {/* Summary pills */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {[
              { label: 'In Pipeline', value: PROJECTS.filter(p => p.stage !== 'SHIPPED').length, color: brand.amber },
              { label: 'Shipped',     value: PROJECTS.filter(p => p.stage === 'SHIPPED').length,  color: brand.success },
              { label: 'Avg %',       value: `${Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length)}%`, color: brand.amberLight },
            ].map(s => (
              <div key={s.label} style={{
                backgroundColor: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: '10px', padding: '0.55rem 1rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{s.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', system-ui, sans-serif", lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Idea input ── */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          transition: 'box-shadow 0.3s ease',
          animation: igniting ? 'ignite-burst 1.6s ease-out' : undefined,
        }}>
          <div style={{ ...styles.sectionLabel, color: brand.amber, marginBottom: '0.75rem' }}>
            DROP YOUR RAW IDEA
          </div>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Describe your idea… What problem does it solve? Who's it for? What's the revenue model?"
            rows={4}
            style={{
              ...styles.input,
              backgroundColor: innerBg,
              borderColor: cardBorder,
              lineHeight: '1.65',
              fontSize: '14px',
              marginBottom: '1rem',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '12px', color: brand.smoke }}>
              Agents will spec it out, assign owners, and track it to launch.
            </div>
            <button
              className="ignite-btn"
              onClick={handleIgnite}
              disabled={!idea.trim()}
              style={{
                background: `linear-gradient(135deg, ${brand.amber}, #EA580C)`,
                color: brand.void,
                padding: '0.75rem 2.5rem',
                border: 'none',
                borderRadius: '7px',
                fontWeight: 900,
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: '14px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                transition: 'all 0.2s ease',
                boxShadow: `0 0 20px rgba(245,158,11,0.35), 0 4px 12px rgba(234,88,12,0.4)`,
              }}
            >
              {igniting ? '🔥 IGNITING…' : '⚡ IGNITE'}
            </button>
          </div>
        </div>

        {/* ── Pipeline visualization ── */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ ...styles.sectionLabel, marginBottom: '1.5rem' }}>PIPELINE STAGES</div>

          {/* Stage nodes + connectors */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STAGES.map((stage, i) => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : undefined }}>
                {/* Node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '80px' }}>
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '12px',
                    background: stageNodeGradient(i),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: i === 2 ? `0 0 18px rgba(245,158,11,0.45)` :
                               i === 3 ? `0 0 14px rgba(236,72,153,0.35)` :
                               i === 4 ? `0 0 14px rgba(16,185,129,0.35)` : 'none',
                  }}>
                    {stage.icon}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: brand.white, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: '10px', color: brand.smoke, textAlign: 'center' as const, lineHeight: 1.3 }}>
                    {stage.hint}
                  </div>
                  {/* Count bubble */}
                  {(() => {
                    const count = PROJECTS.filter(p => p.stage === stage.id).length;
                    return count > 0 ? (
                      <div style={{
                        fontSize: '11px', fontWeight: 800,
                        color: stageColor(stage.id as Stage),
                        background: `${stageColor(stage.id as Stage)}18`,
                        border: `1px solid ${stageColor(stage.id as Stage)}35`,
                        borderRadius: '20px', padding: '1px 8px',
                      }}>
                        {count}
                      </div>
                    ) : (
                      <div style={{ height: '20px' }} />
                    );
                  })()}
                </div>

                {/* Connector line */}
                {i < STAGES.length - 1 && (
                  <div style={{
                    flex: 1, height: '3px',
                    borderRadius: '2px',
                    background: i < 2
                      ? `linear-gradient(90deg, ${brand.amberDark}, ${brand.amber})`
                      : cardBorder,
                    margin: '0 6px',
                    marginBottom: '38px',
                    position: 'relative' as const,
                    overflow: 'visible',
                  }}>
                    {/* Moving dot on active connectors */}
                    {i < 2 && (
                      <div style={{
                        position: 'absolute' as const,
                        top: '-4px', left: '50%',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: brand.amber,
                        boxShadow: `0 0 10px ${brand.amber}`,
                        animation: 'dot-flow 2s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Project cards ── */}
        <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>
          ACTIVE PROJECTS — {PROJECTS.length} IN PIPELINE
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {PROJECTS.map(project => {
            const expanded = expandedId === project.id;
            const sc       = stageColor(project.stage);
            const stageIdx = STAGE_INDEX[project.stage];

            return (
              <div
                key={project.id}
                className="forge-row"
                onClick={() => setExpandedId(expanded ? null : project.id)}
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${expanded ? brand.amberDark : cardBorder}`,
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: expanded
                    ? `0 0 0 1px ${brand.amberDark}40, 0 6px 24px rgba(245,158,11,0.1)`
                    : 'none',
                }}
              >
                {/* ── Main row ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

                  {/* Stage badge */}
                  <div style={{
                    padding: '4px 11px', borderRadius: '6px',
                    background: `${sc}18`,
                    border: `1px solid ${sc}40`,
                    fontSize: '11px', fontWeight: 700, color: sc,
                    textTransform: 'uppercase' as const, letterSpacing: '0.07em',
                    minWidth: '72px', textAlign: 'center' as const, flexShrink: 0,
                  }}>
                    {project.stage}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: brand.white }}>{project.name}</div>
                  </div>

                  {/* Progress */}
                  <div style={{ width: '175px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Progress</span>
                      <span style={{
                        fontSize: '12px', fontWeight: 800,
                        color: project.progress === 100 ? brand.success : brand.amber,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {project.progress}%
                      </span>
                    </div>
                    <div style={{ background: brand.border, borderRadius: '4px', height: '7px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${project.progress}%`,
                        height: '100%',
                        background: project.progress === 100
                          ? 'linear-gradient(90deg, #065f46, #10B981)'
                          : heatGradient(project.progress),
                        borderRadius: '4px',
                        transition: 'width 0.4s ease',
                        animation: project.progress > 0 && project.progress < 100
                          ? 'heat-shimmer 3.5s ease-in-out infinite'
                          : undefined,
                      }} />
                    </div>
                  </div>

                  {/* Agents */}
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {project.agents.map((agent, ai) => {
                      const a = AGENT_DISPLAY[agent] || { color: brand.silver, initials: '??' };
                      return (
                        <div
                          key={agent}
                          title={agent}
                          style={{
                            width: '30px', height: '30px',
                            borderRadius: '8px',
                            background: brand.void,
                            border: `2px solid ${a.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: a.color, fontSize: '9px', fontWeight: 900,
                            marginLeft: ai > 0 ? '-7px' : 0,
                            zIndex: project.agents.length - ai,
                            position: 'relative' as const,
                            boxShadow: `0 0 8px ${a.color}35`,
                          }}
                        >
                          {a.initials}
                        </div>
                      );
                    })}
                  </div>

                  {/* Time in stage */}
                  <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                    <div style={{ fontSize: '10px', color: brand.smoke }}>In stage</div>
                    <div style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: brand.silver }}>
                      {project.timeInStage}
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <div style={{
                    color: brand.smoke, fontSize: '11px',
                    transition: 'transform 0.25s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}>
                    ▼
                  </div>
                </div>

                {/* ── Mini pipeline progress strip ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '0.9rem' }}>
                  {STAGES.map((stage, i) => {
                    const isPast   = i < stageIdx;
                    const isActive = stage.id === project.stage;
                    return (
                      <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          flex: 1, height: '3px', borderRadius: '2px',
                          background: isPast
                            ? `linear-gradient(90deg, ${brand.amberDark}, ${brand.amber})`
                            : isActive ? sc : cardBorder,
                          boxShadow: isActive ? `0 0 7px ${sc}80` : 'none',
                        }} />
                        {i < STAGES.length - 1 && (
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                            background: isPast ? brand.amber : isActive ? sc : cardBorder,
                            margin: '0 1px',
                          }} />
                        )}
                      </div>
                    );
                  })}
                  <span style={{ fontSize: '10px', color: sc, marginLeft: '7px', fontWeight: 700, whiteSpace: 'nowrap' as const }}>
                    {STAGES[stageIdx].label}
                  </span>
                </div>

                {/* ── Expanded details ── */}
                {expanded && (
                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '1.25rem',
                    borderTop: `1px solid ${cardBorder}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.25rem',
                  }}>
                    <div>
                      <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Description</div>
                      <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.65 }}>{project.description}</div>
                    </div>
                    <div>
                      <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Tech Stack</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {project.techStack.map(t => (
                          <span key={t} style={{
                            fontSize: '11px', padding: '3px 9px', borderRadius: '6px',
                            background: `${brand.amber}14`,
                            border: `1px solid ${brand.amber}30`,
                            color: brand.amber,
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>Next Action</div>
                      <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.65 }}>{project.nextAction}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
