'use client';
import { useState } from 'react';
import { brand, styles } from "@/lib/brand";

/* ── Types ─────────────────────────────────────────────────────────── */

interface OvernightItem {
  agent: string;
  agentColor: string;
  type: 'analysis' | 'idea' | 'research' | 'alert' | 'build';
  title: string;
  summary: string;
  details?: string[];
  tags: string[];
  priority?: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface OvernightBrief {
  date: string;
  label: string;
  headline: string;
  items: OvernightItem[];
}

/* ── Type styling ──────────────────────────────────────────────────── */

const TYPE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  analysis: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', icon: '◈' },
  idea:     { bg: 'rgba(168,85,247,0.1)', color: '#A855F7', icon: '✦' },
  research: { bg: 'rgba(6,182,212,0.1)',  color: '#06B6D4', icon: '⌕' },
  alert:    { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', icon: '⚡' },
  build:    { bg: 'rgba(16,185,129,0.1)', color: '#10B981', icon: '▲' },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: brand.error,
  medium: brand.warning,
  low: brand.smoke,
};

/* ── Mock data (replace with Supabase/API later) ───────────────────── */

const BRIEFS: OvernightBrief[] = [
  {
    date: '2026-02-12',
    label: 'Last Night',
    headline: '6 agents deployed · 4 successful deliveries · 2 quota errors',
    items: [
      {
        agent: 'Dwight', agentColor: '#3B82F6', type: 'research', priority: 'high',
        title: 'Comprehensive intelligence brief + content strategy delivered',
        summary: 'World-class intelligence brief covering tech news, weather, calendar + 5 high-value blog post outlines for dbtech45.com + creative money-making ideas + Family Calendar implementation plan.',
        details: [
          '✅ Intelligence brief with tech news & weather analysis',
          '✅ 5 blog post outlines for dbtech45.com content strategy',
          '✅ Creative business ideas (news/intel services, content monetization)',
          '✅ Family Calendar implementation plan for 7-kid logistics',
          '✅ Open-source toolkit recommendations (news aggregation, RSS processors)',
          'Duration: 111.4 seconds (under 2 minutes)',
        ],
        tags: ['intelligence', 'content', 'family-calendar', 'delivered'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Paula', agentColor: '#EC4899', type: 'build', priority: 'high',
        title: 'Design assets + dbtech45.com/os optimization completed',
        summary: 'Portfolio-quality design package including Biz-in-a-Box brand materials, Sole Provider visual system, and dbtech45.com/os improvements delivered.',
        details: [
          '✅ Design marketing assets for top revenue opportunities',
          '✅ Biz-in-a-Box brand & marketing materials (Personal/Business tiers)',
          '✅ Sole Provider case study design (visual funnel, marketing automation)',
          '✅ UI/UX optimization ideas for dbtech45.com rebuild',
          '✅ Open-source design toolkit recommendations',
          'Duration: 500.5 seconds (8.3 minutes of intensive creative work)',
        ],
        tags: ['design', 'biz-in-a-box', 'marketing', 'delivered'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Dax', agentColor: '#06B6D4', type: 'analysis', priority: 'medium',
        title: 'Skill audit fixes + market research analysis completed',
        summary: 'Critical skills updated with routing logic fixes. Biz-in-a-Box market research completed including competitive analysis and customer profiles.',
        details: [
          '✅ Top 10 critical skills audited and fixed (routing logic, negative examples)',
          '✅ Biz-in-a-Box market research (AI assistant services demand)',
          '✅ Sole Provider market analysis (side hustle market size, ROI data)',
          '✅ Competitive intelligence on key market opportunities',
          '✅ Open-source analytical toolkit recommendations',
          'Duration: 92.1 seconds (under 2 minutes)',
        ],
        tags: ['skills', 'market-research', 'analysis', 'delivered'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Tony', agentColor: '#EAB308', type: 'alert', priority: 'low',
        title: 'Restaurant ops mission failed - Gemini quota exceeded',
        summary: 'Attempted Bobola\'s operational data integration but hit Gemini API quota limits. Restaurant analysis and Biz-in-a-Box service delivery specs incomplete.',
        details: [
          '❌ Gemini API quota exceeded (1M tokens/minute limit)',
          '❌ Restaurant management tools research incomplete',
          '❌ Biz-in-a-Box service delivery system partial',
          'Error: 429 - Resource exhausted after 616.4 seconds',
          'Retry recommended: Manual quota reset or wait period',
        ],
        tags: ['restaurant', 'error', 'quota-exceeded'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Bobby', agentColor: '#EF4444', type: 'alert', priority: 'low',
        title: 'Trading intelligence mission failed - auth cooldown',
        summary: 'Deep market analysis blocked by Anthropic auth profile cooldown. Biz-in-a-Box pricing models and Sole Provider financial analysis incomplete.',
        details: [
          '❌ No available auth profile for Anthropic (all in cooldown)',
          '❌ Market analysis + options flow research blocked',
          '❌ Biz-in-a-Box affordable pricing models incomplete',
          '❌ Sole Provider financial ROI analysis missing',
          'Duration: 1.1 seconds (immediate auth failure)',
        ],
        tags: ['trading', 'error', 'auth-cooldown'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Milo', agentColor: '#A855F7', type: 'analysis',
        title: 'Overnight swarm coordination successful',
        summary: 'Successfully deployed 6-agent overnight mission. 4 of 6 agents delivered world-class work. Infrastructure improvements and business model development advanced significantly.',
        details: [
          'Success rate: 66.7% (4/6 agents completed)',
          'Total value delivered: Intelligence + Design + Analysis',
          'Business advancement: Biz-in-a-Box + Sole Provider models progressed',
          'Family Calendar: Full implementation plan ready',
          'Content strategy: 5 blog outlines + monetization ideas ready',
        ],
        tags: ['coordination', 'overnight', 'success'],
        timestamp: '02:00 AM',
      },
    ],
  },
  {
    date: '2026-02-11',
    label: 'Feb 11',
    headline: '7 agents active · 12 items delivered · 3 high-priority alerts',
    items: [
      {
        agent: 'Bobby', agentColor: '#EF4444', type: 'analysis', priority: 'high',
        title: 'ES overnight session: Key levels for Feb 11',
        summary: 'ES held 6035 support on overnight retest. If we break above 6060 in the first 30 min, momentum targets 6085. Below 6030 and we revisit 6010.',
        details: [
          'Support: 6035, 6010, 5985',
          'Resistance: 6060, 6085, 6100',
          'VIX compressed to 15.2 — hedges are cheap',
          'NVDA earnings run-up could pull NQ higher',
        ],
        tags: ['futures', 'ES', 'levels'],
        timestamp: '04:30 AM',
      },
      {
        agent: 'Bobby', agentColor: '#EF4444', type: 'alert', priority: 'high',
        title: 'Unusual options flow detected in NVDA',
        summary: '$2.4M in NVDA 150C weeklies swept at the ask. Smart money positioning ahead of earnings catalyst.',
        tags: ['options', 'NVDA', 'flow'],
        timestamp: '03:15 AM',
      },
      {
        agent: 'Milo', agentColor: '#A855F7', type: 'analysis',
        title: 'Sprint priorities recalculated for Feb 11',
        summary: 'Rebalanced task queue based on yesterday\'s velocity. Sunday Squares payment integration moved to P0. Overnight Sessions page queued for Anders.',
        details: [
          'P0: Sunday Squares Stripe integration',
          'P0: Overnight Sessions page (this page)',
          'P1: Boundless onboarding flow v2',
          'P1: Signal & Noise newsletter draft',
          'P2: Soul Solace guided reflections',
        ],
        tags: ['sprint', 'priorities', 'coordination'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Dax', agentColor: '#06B6D4', type: 'research',
        title: 'Signal & Noise draft: Week of Feb 10',
        summary: 'Compiled market signals for the weekly newsletter. Key theme: tech earnings divergence. NVDA/META strong, AAPL/GOOGL lagging.',
        details: [
          'Macro: CPI print Thursday could move bonds',
          'Sector rotation into semis accelerating',
          'Retail sentiment extremely bullish — contrarian flag',
        ],
        tags: ['newsletter', 'research', 'markets'],
        timestamp: '01:45 AM',
      },
      {
        agent: 'Paula', agentColor: '#EC4899', type: 'idea',
        title: 'Overnight Sessions page concept',
        summary: 'Intelligence brief format — dark, classified feel. Each night\'s work as a "brief" with collapsible agent cards. Priority badges. Searchable archive.',
        tags: ['design', 'concept', 'ui'],
        timestamp: '01:30 AM',
      },
      {
        agent: 'Anders', agentColor: '#F97316', type: 'build',
        title: 'AxeCap Terminal + Operations overhaul deployed',
        summary: 'Shipped 5 new Next.js pages (Activity Dashboard, DNA, Memory Bank, Skills Inventory, Markets/AxeCap). Removed dead routes. Zero build errors.',
        details: [
          'Commit: cefda70 — AxeCap Terminal + sidebar fix',
          'Commit: 128c403 — backup all changes',
          'Commit: 9e24654 — remove dead Operations routes',
          '5 pages created, 0 TypeScript errors',
        ],
        tags: ['shipped', 'dbtech-os', 'deploy'],
        timestamp: '12:30 AM',
      },
      {
        agent: 'Wendy', agentColor: '#8B5CF6', type: 'idea',
        title: 'Weekly reflection prompt: "What did I protect this week?"',
        summary: 'New Soul Solace prompt focused on boundaries and intentional no\'s. Designed to surface what Derek chose NOT to do — often more revealing than what he did.',
        tags: ['wellness', 'soul-solace', 'prompt'],
        timestamp: '12:15 AM',
      },
      {
        agent: 'Tony', agentColor: '#EAB308', type: 'analysis',
        title: 'Bobola\'s: Weekend sales analysis',
        summary: 'Saturday revenue up 12% vs last week. New menu items (smoked wings, loaded fries) driving higher average ticket. Sunday dip likely weather-related.',
        details: [
          'Avg ticket: $18.40 (up from $16.20)',
          'Top seller: Smoked wings combo ($14.99)',
          'Food cost: 28.3% (target: 30%)',
          'Recommendation: Double down on combo pricing',
        ],
        tags: ['restaurant', 'bobolas', 'revenue'],
        timestamp: '11:45 PM',
      },
      {
        agent: 'Remy', agentColor: '#22C55E', type: 'research',
        title: 'Sunday Squares launch content plan',
        summary: 'Drafted 7 launch posts for X/Twitter, 3 for Instagram. Focus on "game day made simple" angle. Targeting football community hashtags.',
        tags: ['marketing', 'sunday-squares', 'launch'],
        timestamp: '11:30 PM',
      },
      {
        agent: 'Dwight', agentColor: '#3B82F6', type: 'analysis', priority: 'medium',
        title: 'Model cost analysis: Jan 28 — Feb 10',
        summary: 'Total API spend: $47.82 across all agents. Claude Opus accounts for 68%. Recommendation: shift routine tasks to Sonnet, keep Opus for complex reasoning.',
        details: [
          'Claude Opus: $32.52 (68%)',
          'Claude Sonnet: $8.30 (17%)',
          'Gemini Flash: $4.20 (9%)',
          'Other: $2.80 (6%)',
          'Cost per agent per day: ~$3.41',
        ],
        tags: ['costs', 'models', 'optimization'],
        timestamp: '11:00 PM',
      },
      {
        agent: 'Bobby', agentColor: '#EF4444', type: 'alert', priority: 'high',
        title: 'BTC breaking $97K — momentum shift',
        summary: 'Bitcoin broke above $97K resistance with strong volume. Institutional flows detected via Coinbase premium. Next target: $100K psychological level.',
        tags: ['crypto', 'BTC', 'breakout'],
        timestamp: '10:30 PM',
      },
      {
        agent: 'Milo', agentColor: '#A855F7', type: 'research',
        title: 'Agent fleet health check',
        summary: 'All 9 agents operational. Response times healthy. Wendy\'s voice model reconfigured. Bobby\'s market cron running on schedule.',
        tags: ['ops', 'health', 'agents'],
        timestamp: '10:00 PM',
      },
    ],
  },
  {
    date: '2026-02-10',
    label: 'Feb 10',
    headline: '6 agents active · 8 items delivered · 1 high-priority alert',
    items: [
      {
        agent: 'Bobby', agentColor: '#EF4444', type: 'analysis', priority: 'high',
        title: 'Weekly market outlook: Feb 10-14',
        summary: 'CPI print on Thursday is the main event. ES likely range-bound until then. VIX compression suggests a big move is loading.',
        tags: ['futures', 'weekly', 'outlook'],
        timestamp: '04:00 AM',
      },
      {
        agent: 'Anders', agentColor: '#F97316', type: 'build',
        title: 'DB Tech OS V3 sidebar expansion',
        summary: 'Deployed 7 new sections to the static OS page. Activity Dashboard, DNA, Memory Bank, Skills Inventory, Schedule Center, Goals Tracker, Master Todo.',
        tags: ['shipped', 'dbtech-os'],
        timestamp: '02:00 AM',
      },
      {
        agent: 'Dax', agentColor: '#06B6D4', type: 'research',
        title: 'Content calendar: Feb 10-16',
        summary: 'Signal & Noise on Tuesday, Dad Stack on Thursday. Both drafts in progress. Coordinating with Bobby on market data for S&N.',
        tags: ['newsletter', 'calendar'],
        timestamp: '01:00 AM',
      },
      {
        agent: 'Paula', agentColor: '#EC4899', type: 'idea',
        title: 'Brand Kit exploration: AxeCap Terminal wireframes',
        summary: 'Bloomberg Terminal meets dark mode dashboard. 6-cell ticker grid, watchlist panel, news briefing. Amber on black. Monospace data.',
        tags: ['design', 'axecap', 'wireframe'],
        timestamp: '12:00 AM',
      },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────────────── */

export default function OvernightSessions() {
  const [expandedBrief, setExpandedBrief] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const agents = Array.from(new Set(BRIEFS.flatMap(b => b.items.map(i => i.agent))));
  const types = Array.from(new Set(BRIEFS.flatMap(b => b.items.map(i => i.type))));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={styles.h1}>Overnight Sessions</h1>
            <p style={styles.subtitle}>Nightly intelligence briefs · Agent results · Ideas & analysis</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, background: 'rgba(168,85,247,0.1)', border: `1px solid ${brand.border}`, fontSize: 12, color: '#A855F7', fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A855F7', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
              {BRIEFS.length} briefs
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '6px 10px', color: brand.white, fontSize: 12, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
          >
            <option value="all">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '6px 10px', color: brand.white, fontSize: 12, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        {/* Briefs */}
        {BRIEFS.map((brief, bi) => {
          const isOpen = expandedBrief === bi;
          const filteredItems = brief.items.filter(item =>
            (filterAgent === 'all' || item.agent === filterAgent) &&
            (filterType === 'all' || item.type === filterType)
          );

          return (
            <div key={bi} style={{ marginBottom: 16 }}>
              {/* Brief header */}
              <div
                onClick={() => setExpandedBrief(isOpen ? -1 : bi)}
                style={{
                  ...styles.card,
                  cursor: 'pointer',
                  borderColor: isOpen ? 'rgba(168,85,247,0.3)' : brand.border,
                  background: isOpen ? `linear-gradient(135deg, rgba(168,85,247,0.03), ${brand.carbon})` : brand.carbon,
                  marginBottom: isOpen ? 0 : 0,
                  borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      🌙
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: brand.white }}>{brief.label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{brief.date}</span>
                      </div>
                      <div style={{ fontSize: 12, color: brand.silver, marginTop: 2 }}>{brief.headline}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>{filteredItems.length} items</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.smoke} strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Brief items */}
              {isOpen && (
                <div style={{
                  border: `1px solid rgba(168,85,247,0.3)`,
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  background: brand.carbon,
                  padding: '8px',
                }}>
                  {filteredItems.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: brand.smoke, fontSize: 13 }}>
                      No items match current filters.
                    </div>
                  ) : filteredItems.map((item, ii) => {
                    const itemKey = `${bi}-${ii}`;
                    const isItemOpen = expandedItems.has(itemKey);
                    const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.analysis;

                    return (
                      <div
                        key={ii}
                        onClick={() => item.details && toggleItem(itemKey)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 8,
                          marginBottom: ii < filteredItems.length - 1 ? 4 : 0,
                          background: isItemOpen ? brand.graphite : 'transparent',
                          cursor: item.details ? 'pointer' : 'default',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Item header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          {/* Agent icon */}
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: `${item.agentColor}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: item.agentColor, flexShrink: 0, marginTop: 2,
                          }}>
                            {typeStyle.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Meta row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: item.agentColor }}>{item.agent}</span>
                              <span style={{
                                display: 'inline-flex', padding: '1px 6px', borderRadius: 3,
                                fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                background: typeStyle.bg, color: typeStyle.color,
                              }}>
                                {item.type}
                              </span>
                              {item.priority && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 3,
                                  padding: '1px 6px', borderRadius: 3,
                                  fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                                  textTransform: 'uppercase',
                                  background: `${PRIORITY_COLORS[item.priority]}15`,
                                  color: PRIORITY_COLORS[item.priority],
                                }}>
                                  {item.priority === 'high' ? '●' : '○'} {item.priority}
                                </span>
                              )}
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke, marginLeft: 'auto' }}>{item.timestamp}</span>
                            </div>

                            {/* Title + summary */}
                            <div style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 3, lineHeight: 1.3 }}>{item.title}</div>
                            <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.6 }}>{item.summary}</div>

                            {/* Tags */}
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                              {item.tags.map(t => (
                                <span key={t} style={{
                                  padding: '1px 6px', borderRadius: 3, fontSize: 9,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  background: 'rgba(245,158,11,0.08)', color: brand.amber,
                                }}>
                                  {t}
                                </span>
                              ))}
                            </div>

                            {/* Expandable details */}
                            {item.details && isItemOpen && (
                              <div style={{
                                marginTop: 12, paddingTop: 10,
                                borderTop: `1px solid ${brand.border}`,
                              }}>
                                {item.details.map((d, di) => (
                                  <div key={di} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                    padding: '4px 0', fontSize: 12, color: brand.silver, lineHeight: 1.5,
                                  }}>
                                    <span style={{ color: brand.amber, fontSize: 8, marginTop: 5, flexShrink: 0 }}>▸</span>
                                    <span>{d}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Expand hint */}
                            {item.details && !isItemOpen && (
                              <div style={{ fontSize: 10, color: brand.smoke, marginTop: 6, fontStyle: 'italic' }}>
                                Click to expand details
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
