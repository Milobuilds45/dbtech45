'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import OpsGuard from '@/components/OpsGuard';
import { supabase } from '@/lib/supabase';
import { Package, ExternalLink, Zap, ArrowRight, Layers, Users, BarChart3, Wrench } from 'lucide-react';

/* ───────────── Design Tokens (OS Theme) ───────────── */
const T = {
  bg:        '#0A0A0A',
  card:      '#111111',
  elevated:  '#18181B',
  amber:     '#F59E0B',
  text:      '#FAFAFA',
  secondary: '#A1A1AA',
  muted:     '#71717A',
  border:    '#27272A',
  green:     '#22C55E',
  red:       '#EF4444',
  blue:      '#3B82F6',
  purple:    '#8B5CF6',
  cyan:      '#06B6D4',
  pink:      '#EC4899',
};

/* ───────────── Agent Roster ───────────── */
const AGENTS = [
  { id: 'milo', name: 'Milo', role: 'Chief of Staff', color: '#A855F7', icon: '⚡' },
  { id: 'paula', name: 'Paula', role: 'Creative + Full Stack', color: '#EC4899', icon: '✦' },
  { id: 'bobby', name: 'Bobby', role: 'Trading Advisor', color: '#22C55E', icon: '📈' },
  { id: 'anders', name: 'Anders', role: 'IT Director', color: '#F97316', icon: '🔐' },
  { id: 'dwight', name: 'Dwight', role: 'Intel & Weather', color: '#6366F1', icon: '📋' },
  { id: 'jim', name: 'Jim', role: 'Social Media', color: '#06B6D4', icon: '📱' },
  { id: 'remy', name: 'Remy', role: 'Restaurant Ops', color: '#EAB308', icon: '🍽️' },
  { id: 'wendy', name: 'Wendy', role: 'Personal Assistant', color: '#8B5CF6', icon: '💜' },
];

const SKILL_CATEGORIES: { key: string; label: string; color: string }[] = [
  { key: 'technical', label: 'Technical', color: T.blue },
  { key: 'business', label: 'Business', color: T.red },
  { key: 'core', label: 'Core', color: T.amber },
  { key: 'autonomy', label: 'Autonomy', color: T.purple },
  { key: 'awareness', label: 'Awareness', color: T.cyan },
];

const CATEGORY_ICONS: Record<string, string> = {
  api: '🔌', tool: '🔧', library: '📚', service: '☁️',
  dataset: '📊', framework: '🏗️', reference: '📖', other: '📦',
};

/* ───────────── Types ───────────── */
interface AgentResource {
  id: string;
  agent_id: string;
  agent_name: string;
  title: string;
  url: string;
  category: string;
  type: string;
  skill_category: string | null;
  status: string;
  rating: number;
  pricing: string | null;
  created_at: string;
}

interface AgentStats {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;
  totalAdopted: number;
  totalSuggested: number;
  recentTools: AgentResource[];
  byCategory: Record<string, number>;
  bySkill: Record<string, number>;
}

/* ───────────── Main Component ───────────── */
export default function SkillsInventory() {
  const [resources, setResources] = useState<AgentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_resources')
          .select('id, agent_id, agent_name, title, url, category, type, skill_category, status, rating, pricing, created_at')
          .in('status', ['active', 'archived'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[SkillsInventory] Supabase error:', error.message);
          setDbError(error.message);
        } else {
          setResources(data || []);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[SkillsInventory] Load error:', msg);
        setDbError(msg);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Compute agent stats
  const agentStats: AgentStats[] = useMemo(() => {
    return AGENTS.map(agent => {
      const agentResources = resources.filter(r => r.agent_id === agent.id);
      const adopted = agentResources.filter(r => r.status === 'archived');
      const suggested = agentResources.filter(r => r.status === 'active');

      // Count by resource category (api, tool, library, etc.)
      const byCategory: Record<string, number> = {};
      adopted.forEach(r => {
        byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      });

      // Count by skill category (technical, business, core, etc.)
      const bySkill: Record<string, number> = {};
      adopted.forEach(r => {
        const sk = r.skill_category || 'general';
        bySkill[sk] = (bySkill[sk] || 0) + 1;
      });

      return {
        ...agent,
        totalAdopted: adopted.length,
        totalSuggested: suggested.length,
        recentTools: adopted.slice(0, 3),
        byCategory,
        bySkill,
      };
    }).sort((a, b) => b.totalAdopted - a.totalAdopted);
  }, [resources]);

  // Overall stats
  const totalAdopted = agentStats.reduce((s, a) => s + a.totalAdopted, 0);
  const totalSuggested = agentStats.reduce((s, a) => s + a.totalSuggested, 0);
  const mostActive = agentStats[0];
  const categoriesCovered = new Set(resources.filter(r => r.status === 'archived').map(r => r.category)).size;
  const skillsCovered = new Set(resources.filter(r => r.status === 'archived' && r.skill_category).map(r => r.skill_category)).size;

  if (loading) {
    return (
      <OpsGuard>
        <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚙️</div>
            <div style={{ fontSize: 16, color: T.secondary }}>Loading skills data...</div>
          </div>
        </div>
      </OpsGuard>
    );
  }

  return (
    <OpsGuard>
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 28, fontWeight: 700, color: T.amber,
              textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 6px',
            }}>
              Skills Inventory
            </h1>
            <p style={{ fontSize: 13, color: T.secondary, margin: 0 }}>
              Real tools and resources adopted by each agent — powered by{' '}
              <Link href="/os/agents/assist" style={{ color: T.amber, textDecoration: 'none', fontWeight: 600 }}>
                Agent Assist
              </Link>
            </p>
          </div>

          {/* ── DB Error Banner ── */}
          {dbError && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '14px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#F87171',
            }}>
              <span>⚠️</span>
              <span>Database connection issue: {dbError}. Showing cached data.</span>
            </div>
          )}

          {/* ── Stats Bar ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28,
          }}>
            {[
              { icon: <Package size={18} />, label: 'Tools Adopted', value: totalAdopted, color: T.green },
              { icon: <Zap size={18} />, label: 'Suggestions Pending', value: totalSuggested, color: T.amber },
              { icon: <Layers size={18} />, label: 'Categories Covered', value: `${categoriesCovered} types, ${skillsCovered} skills`, color: T.blue },
              { icon: <Users size={18} />, label: 'Most Equipped', value: mostActive?.name || '—', color: mostActive?.color || T.muted },
            ].map((stat, i) => (
              <div key={i} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${stat.color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: stat.color,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Agent Cards Grid ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 20,
          }}>
            {agentStats.map(agent => (
              <div key={agent.id} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                overflow: 'hidden', transition: 'border-color 0.2s',
              }}>
                {/* Agent Header */}
                <div style={{
                  padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: `${agent.color}18`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, border: `2px solid ${agent.color}40`,
                  }}>
                    {agent.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{agent.name}</span>
                      <span style={{
                        fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                        padding: '2px 8px', borderRadius: 6,
                        background: agent.totalAdopted > 0 ? `${T.green}15` : `${T.muted}15`,
                        color: agent.totalAdopted > 0 ? T.green : T.muted,
                      }}>
                        {agent.totalAdopted} tool{agent.totalAdopted !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: agent.color, fontWeight: 500 }}>{agent.role}</div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                  {agent.totalAdopted > 0 ? (
                    <>
                      {/* Skill Breakdown */}
                      {Object.keys(agent.bySkill).length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '1px', color: T.muted, marginBottom: 8,
                          }}>
                            Skill Coverage
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {SKILL_CATEGORIES.map(cat => {
                              const count = agent.bySkill[cat.key] || 0;
                              if (count === 0) return null;
                              return (
                                <div key={cat.key} style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  padding: '4px 10px', borderRadius: 6,
                                  background: `${cat.color}12`, border: `1px solid ${cat.color}30`,
                                }}>
                                  <div style={{
                                    width: 6, height: 6, borderRadius: '50%', background: cat.color,
                                  }} />
                                  <span style={{
                                    fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                                    color: cat.color, fontWeight: 600,
                                  }}>
                                    {cat.label}: {count}
                                  </span>
                                </div>
                              );
                            })}
                            {agent.bySkill['general'] > 0 && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 6,
                                background: `${T.muted}12`, border: `1px solid ${T.muted}30`,
                              }}>
                                <span style={{
                                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                                  color: T.muted, fontWeight: 600,
                                }}>
                                  General: {agent.bySkill['general']}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tool Types */}
                      {Object.keys(agent.byCategory).length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '1px', color: T.muted, marginBottom: 8,
                          }}>
                            Tool Types
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {Object.entries(agent.byCategory).map(([cat, count]) => (
                              <span key={cat} style={{
                                fontSize: 11, padding: '3px 8px', borderRadius: 4,
                                background: T.elevated, color: T.secondary,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}>
                                {CATEGORY_ICONS[cat] || '📦'} {cat} ({count})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Acquisitions */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{
                          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '1px', color: T.muted, marginBottom: 8,
                        }}>
                          Recent Acquisitions
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {agent.recentTools.map(tool => (
                            <a
                              key={tool.id}
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 10px', background: T.elevated, borderRadius: 6,
                                textDecoration: 'none', border: `1px solid ${T.border}`,
                                transition: 'border-color 0.15s',
                              }}
                            >
                              <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[tool.category] || '📦'}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                                  color: T.text, fontWeight: 500,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  {tool.title}
                                </div>
                                <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>
                                  {tool.type?.replace('-', ' ')} {tool.pricing ? `· ${tool.pricing}` : ''}
                                </div>
                              </div>
                              <ExternalLink size={12} style={{ color: T.muted, flexShrink: 0 }} />
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Pending Suggestions */}
                      {agent.totalSuggested > 0 && (
                        <div style={{
                          fontSize: 11, color: T.amber, padding: '6px 10px',
                          background: `${T.amber}08`, borderRadius: 6,
                          border: `1px solid ${T.amber}20`, marginBottom: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          ⚡ {agent.totalSuggested} suggestion{agent.totalSuggested !== 1 ? 's' : ''} pending review
                        </div>
                      )}
                    </>
                  ) : (
                    /* Empty State */
                    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                      <Wrench size={28} style={{ color: T.muted, opacity: 0.4, marginBottom: 10 }} />
                      <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>
                        No tools adopted yet
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, opacity: 0.7 }}>
                        Use Agent Assist to find resources for {agent.name}
                      </div>
                      {agent.totalSuggested > 0 && (
                        <div style={{
                          fontSize: 11, color: T.amber, marginTop: 10,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {agent.totalSuggested} suggestion{agent.totalSuggested !== 1 ? 's' : ''} waiting
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href="/os/agents/assist"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px 0', borderRadius: 8, textDecoration: 'none',
                      background: `${agent.color}12`, border: `1px solid ${agent.color}30`,
                      color: agent.color, fontSize: 12, fontWeight: 600,
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    <BarChart3 size={14} />
                    Find Resources
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div style={{
            marginTop: 40, textAlign: 'center', paddingTop: 20,
            borderTop: `1px solid ${T.border}`,
          }}>
            <p style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              Data source: Supabase agent_resources • Updated in real-time from Agent Assist
            </p>
            <Link href="/os" style={{ color: T.amber, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              ← Back to Mission Control
            </Link>
          </div>
        </div>
      </div>
    </OpsGuard>
  );
}
