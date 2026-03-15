'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { brand, styles } from '@/lib/brand';

type EventType = 'decision' | 'build' | 'deploy' | 'conversation' | 'milestone';

interface TimelineEntry {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD for filtering
  agent: string;
  project: string;
  type: EventType;
  summary: string;
  detail: string;
}

const EVENT_CONFIG: Record<EventType, { label: string; color: string; icon: string }> = {
  decision: { label: 'Decision',     color: brand.amber,   icon: '◆' },
  build:    { label: 'Build',        color: brand.info,    icon: '⬡' },
  deploy:   { label: 'Deploy',       color: brand.success, icon: '▲' },
  conversation: { label: 'Convo',   color: '#A78BFA',     icon: '◉' },
  milestone: { label: 'Milestone',  color: '#F472B6',     icon: '★' },
};

const AGENTS = ['All', 'Milo', 'Anders', 'Paula', 'Bobby', 'Ted', 'Wendy', 'Remy', 'Dwight', 'Dax', 'Jim'];
const PROJECTS = ['All', 'MenuSparks', 'The Pour Plan', 'Meet the Feed', 'dbtech45', "Bobola's", 'Trading'];
const TYPES: Array<EventType | 'All'> = ['All', 'decision', 'build', 'deploy', 'conversation', 'milestone'];

const MOCK_DATA: TimelineEntry[] = [
  {
    id: '1',
    timestamp: 'Jan 3, 2026 · 9:14 AM',
    date: '2026-01-03',
    agent: 'Milo',
    project: 'dbtech45',
    type: 'conversation',
    summary: 'Kickoff session: defined the OS vision and agent roster',
    detail: 'Milo and Derek spent 90 minutes mapping the full system architecture. Core outcome: dbtech45 OS would be the single pane of glass for all business intelligence. Agent roster drafted — 9 specialists assigned to domains. Decided on amber/void design system.',
  },
  {
    id: '2',
    timestamp: 'Jan 5, 2026 · 11:02 AM',
    date: '2026-01-05',
    agent: 'Paula',
    project: 'dbtech45',
    type: 'build',
    summary: 'Brand spec completed — amber/void/carbon token system locked in',
    detail: 'Paula delivered the full brand.ts token file with 18 design tokens. Established Electric Amber #F59E0B as the primary accent, void black as page background. Space Grotesk for headings, JetBrains Mono for data. All future pages built against this spec.',
  },
  {
    id: '3',
    timestamp: 'Jan 7, 2026 · 2:45 PM',
    date: '2026-01-07',
    agent: 'Anders',
    project: 'MenuSparks',
    type: 'decision',
    summary: 'Decided to target independent restaurant owners, not chains',
    detail: 'After analyzing the competitive landscape — Toast, Square, Sysco — Anders recommended going upmarket with independents who have budget flexibility and pain around margin. Chains are locked into enterprise contracts. Decision locked: ICP is owner-operated restaurants with 1-3 locations, $1M–$5M revenue.',
  },
  {
    id: '4',
    timestamp: 'Jan 9, 2026 · 10:30 AM',
    date: '2026-01-09',
    agent: 'Bobby',
    project: 'MenuSparks',
    type: 'build',
    summary: 'Menu Autopilot v1 feature spec finalized',
    detail: 'Bobby drafted the complete feature spec for Menu Autopilot: real-time cost tracking against USDA commodity prices, automated margin alerts when items fall below 65% margin threshold, and one-click price adjustment suggestions. Spec approved by Derek.',
  },
  {
    id: '5',
    timestamp: 'Jan 12, 2026 · 3:18 PM',
    date: '2026-01-12',
    agent: 'Jim',
    project: "Bobola's",
    type: 'conversation',
    summary: 'Restaurant financial review — Q4 margins tighter than expected',
    detail: "Jim pulled Q4 2025 numbers from Bobola's POS. Food cost crept to 34.2% vs target of 28%. Primary culprits: chicken (+18% YoY), eggs (+31%), and prime beef (+12%). Jim recommended running a February prix-fixe to improve margins while testing price sensitivity.",
  },
  {
    id: '6',
    timestamp: 'Jan 15, 2026 · 8:00 AM',
    date: '2026-01-15',
    agent: 'Milo',
    project: 'dbtech45',
    type: 'milestone',
    summary: 'OS dashboard goes live — first 10 pages deployed',
    detail: 'The dbtech45 OS shipped its first production release. Pages live: Mission Control, Agents, Org Chart, Kanban, Calendar, Markets, Morning Brief, Research, Docs, and Skills Inventory. Total build time: 12 days from first commit to prod.',
  },
  {
    id: '7',
    timestamp: 'Jan 17, 2026 · 1:22 PM',
    date: '2026-01-17',
    agent: 'Ted',
    project: 'Trading',
    type: 'decision',
    summary: 'Shifted futures strategy to ES micro contracts only',
    detail: 'Ted reviewed 60 days of paper trading results. Conclusion: full ES contracts too much overnight risk for current capital base. Micro contracts (MES) allow same strategy with 1/10th the exposure. Drawdown limit set at $500/day. Win rate target: 55%+ over 30-day rolling window.',
  },
  {
    id: '8',
    timestamp: 'Jan 20, 2026 · 4:05 PM',
    date: '2026-01-20',
    agent: 'Wendy',
    project: 'Meet the Feed',
    type: 'build',
    summary: 'Content calendar system designed — 90-day publishing framework',
    detail: "Wendy built the content architecture for Meet the Feed. Three content pillars: market insights (40%), restaurant industry stories (35%), and Derek's personal journey (25%). Posting cadence: Twitter 3x/day, LinkedIn 1x/day, Instagram 5x/week. Templates created for each format.",
  },
  {
    id: '9',
    timestamp: 'Jan 23, 2026 · 9:45 AM',
    date: '2026-01-23',
    agent: 'Remy',
    project: "Bobola's",
    type: 'decision',
    summary: 'Slow Night SOS protocol approved — Tuesday/Wednesday incentive system',
    detail: 'Remy analyzed cover data from 2024-2025. Tuesday and Wednesday average 34% of Friday capacity. Approved: dynamic discount triggers at 5PM when projected covers <40. Offers: $8 apps before 6PM, $3 draft beers all night. Estimated revenue impact: +$2,400/month.',
  },
  {
    id: '10',
    timestamp: 'Jan 26, 2026 · 11:00 AM',
    date: '2026-01-26',
    agent: 'Dwight',
    project: 'dbtech45',
    type: 'deploy',
    summary: 'Activity Dashboard + Agent Health pages deployed to Vercel',
    detail: 'Dwight pushed the Activity Dashboard and Agent Health pages. Both passed Vercel build checks. Activity Dashboard now shows real-time agent event stream. Agent Health tracks uptime, session counts, and response latency per agent. Zero downtime deployment.',
  },
  {
    id: '11',
    timestamp: 'Jan 29, 2026 · 2:10 PM',
    date: '2026-01-29',
    agent: 'Dax',
    project: 'MenuSparks',
    type: 'conversation',
    summary: 'Competitor analysis session — Toast, Owner.com, Popmenu reviewed',
    detail: 'Dax ran a deep competitive audit. Toast: strong POS integration, weak on AI-driven menu optimization. Owner.com: good website builder, no commodity cost tracking. Popmenu: strong digital menus, high price point. Gap identified: none offer real-time commodity-to-margin alerts. MenuSparks owns this.',
  },
  {
    id: '12',
    timestamp: 'Feb 1, 2026 · 9:00 AM',
    date: '2026-02-01',
    agent: 'Anders',
    project: 'The Pour Plan',
    type: 'milestone',
    summary: 'The Pour Plan concept validated — first 3 bar owner interviews complete',
    detail: 'Anders ran discovery calls with 3 bar owners in Nashua, Manchester, and Concord NH. All three confirmed: they price cocktails by gut, not margin math. Average poured cost is 28-35% vs ideal 18-22%. Validated pain. All three would pay $99/month for automated pour cost tracking with cocktail optimization.',
  },
  {
    id: '13',
    timestamp: 'Feb 4, 2026 · 3:30 PM',
    date: '2026-02-04',
    agent: 'Paula',
    project: 'dbtech45',
    type: 'build',
    summary: 'Brand Kit page launched — full design system exported as living doc',
    detail: "Paula shipped the Brand Kit page as a living component library. Every token, color, font, and pattern documented with copy-paste code snippets. Added: Figma token export, CSS variable sheet, and 'copy hex' click interaction. Used by all agents building new OS pages.",
  },
  {
    id: '14',
    timestamp: 'Feb 7, 2026 · 10:15 AM',
    date: '2026-02-07',
    agent: 'Milo',
    project: 'Trading',
    type: 'conversation',
    summary: 'Reviewed Ghost Trades model — 6-week backtest results analyzed',
    detail: 'Milo and Derek analyzed the Ghost Trades backtesting session. Results over 6 weeks: 61.3% win rate on MES, average R:R 1.4:1, max drawdown -$1,847. Sharpe ratio: 1.18. Decision: move to live trading with $5K capital, hard stop at -$500/day.',
  },
  {
    id: '15',
    timestamp: 'Feb 10, 2026 · 8:45 AM',
    date: '2026-02-10',
    agent: 'Ted',
    project: 'dbtech45',
    type: 'deploy',
    summary: 'Flow Radar + Ghost Trades pages deployed',
    detail: 'Ted deployed Flow Radar (options flow visualization) and Ghost Trades (futures backtesting) to production. Both pages load with mock data until live broker API is connected. Vercel deploy time: 41 seconds. No build errors.',
  },
  {
    id: '16',
    timestamp: 'Feb 12, 2026 · 1:00 PM',
    date: '2026-02-12',
    agent: 'Jim',
    project: "Bobola's",
    type: 'decision',
    summary: 'LOI accepted for Bobola\'s — transition timeline begins Q2 2026',
    detail: "Derek accepted the Letter of Intent from the prospective buyer. Bobola's sale timeline: 90-day due diligence, closing target June 1, 2026. Jim is managing the financial documentation package: 3 years P&L, tax returns, equipment list, and lease transfer paperwork.",
  },
  {
    id: '17',
    timestamp: 'Feb 14, 2026 · 11:30 AM',
    date: '2026-02-14',
    agent: 'Wendy',
    project: 'Meet the Feed',
    type: 'build',
    summary: 'X Thread Clipper tool shipped — auto-formats threads from raw text',
    detail: "Wendy built the X Thread Clipper tool on the OS. Input: raw long-form text. Output: formatted Twitter thread with character counts, hook optimization, and CTA suggestions. Validated on 3 real drafts. Derek's engagement rate on test threads: +34% vs manual formatting.",
  },
  {
    id: '18',
    timestamp: 'Feb 17, 2026 · 4:20 PM',
    date: '2026-02-17',
    agent: 'Remy',
    project: 'MenuSparks',
    type: 'milestone',
    summary: 'MenuSparks.com first paying customer signed — $199/month',
    detail: 'First paying MenuSparks customer: Casa Fiesta in Manchester NH. 2-location Mexican restaurant, 68 menu items. Signed $199/month annual plan. Onboarding complete in 47 minutes. First menu optimization alert fired within 24 hours (avocado price spike, recommend $1.50 guac surcharge).',
  },
  {
    id: '19',
    timestamp: 'Feb 19, 2026 · 9:00 AM',
    date: '2026-02-19',
    agent: 'Dwight',
    project: 'dbtech45',
    type: 'build',
    summary: 'Second Brain + Ideas Vault pages built and merged',
    detail: 'Dwight shipped two knowledge management pages. Second Brain: persistent note capture with AI tagging and cross-linking. Ideas Vault: capture-rate/reject-with-reasoning system. Both use localStorage for persistence with planned Supabase sync. 847 lines of new code.',
  },
  {
    id: '20',
    timestamp: 'Feb 21, 2026 · 3:00 PM',
    date: '2026-02-21',
    agent: 'Dax',
    project: 'The Pour Plan',
    type: 'build',
    summary: 'Pour Plan MVP scope locked — 5 core features defined',
    detail: 'Dax and Derek finalized the MVP feature set: (1) recipe cost calculator, (2) pour cost % tracker by SKU, (3) menu price optimizer, (4) weekly variance report, (5) competitor price benchmarking. Tech stack: Next.js + Supabase + Stripe. Target launch: April 15, 2026.',
  },
  {
    id: '21',
    timestamp: 'Feb 24, 2026 · 10:45 AM',
    date: '2026-02-24',
    agent: 'Bobby',
    project: 'Trading',
    type: 'conversation',
    summary: 'Options flow strategy review — earnings season positioning',
    detail: 'Bobby walked through the Q1 earnings calendar. High-conviction trades identified: NVDA (pre-earnings IV crush play), TSLA (post-earnings directional), and SPY (macro hedge for March FOMC). Bobby flagged: implied volatility on all three running 15-20% above 30-day average. Defined risk: $800 max per trade.',
  },
  {
    id: '22',
    timestamp: 'Feb 26, 2026 · 2:30 PM',
    date: '2026-02-26',
    agent: 'Milo',
    project: 'dbtech45',
    type: 'deploy',
    summary: 'OS v2.0 deployed — org chart, roundtable, model counsel live',
    detail: 'Major OS update shipped. New pages: Org Chart (interactive n8n-style with animated connections), Roundtable (multi-agent debate interface), Model Counsel (GPT-4/Claude comparison). Total page count: 38. Vercel build: 2m 14s. Lighthouse score: 94.',
  },
  {
    id: '23',
    timestamp: 'Feb 28, 2026 · 8:30 AM',
    date: '2026-02-28',
    agent: 'Paula',
    project: 'MenuSparks',
    type: 'decision',
    summary: 'Pricing strategy revised — tiered model replaces flat rate',
    detail: 'Paula analyzed churn risk at $199/month for single-location operators. Recommendation: 3-tier pricing. Starter: $79/mo (1 location, basic alerts). Growth: $179/mo (3 locations, full analytics). Scale: $399/mo (unlimited, API access). Projected 40% increase in qualified leads from lowered entry barrier.',
  },
  {
    id: '24',
    timestamp: 'Mar 3, 2026 · 11:00 AM',
    date: '2026-03-03',
    agent: 'Anders',
    project: 'dbtech45',
    type: 'build',
    summary: 'Design DNA Scanner + Brand Chameleon tools shipped',
    detail: 'Anders delivered two AI-powered design tools. Design DNA Scanner: upload a screenshot, extract full design system (colors, fonts, spacing, components). Brand Chameleon: input a target brand, generate matched variations of any UI. Both tools use Gemini Vision API. First real AI-native OS tools.',
  },
  {
    id: '25',
    timestamp: 'Mar 5, 2026 · 9:15 AM',
    date: '2026-03-05',
    agent: 'Jim',
    project: "Bobola's",
    type: 'conversation',
    summary: 'Due diligence package submitted to buyer\'s attorney',
    detail: "Complete financial package delivered: 3-year audited P&L, 2023-2025 tax returns, equipment appraisal ($47K), lease assignment terms confirmed (landlord approved), and staff retention plan. Buyer's attorney has 30 days to respond. Closing target unchanged: June 1, 2026.",
  },
  {
    id: '26',
    timestamp: 'Mar 7, 2026 · 2:00 PM',
    date: '2026-03-07',
    agent: 'Ted',
    project: 'Trading',
    type: 'milestone',
    summary: 'First profitable live trading month — +$2,847 net on MES',
    detail: "March 1-7 live trading results: 23 trades, 65.2% win rate, average winner $187, average loser $94. Net P&L: +$2,847 after commissions. Best trade: March 4 ES breakdown — $612 in 22 minutes. Worst trade: March 6 false breakout — -$312. Ted's assessment: system is working. Scale to $10K next month.",
  },
  {
    id: '27',
    timestamp: 'Mar 9, 2026 · 10:30 AM',
    date: '2026-03-09',
    agent: 'Wendy',
    project: 'Meet the Feed',
    type: 'decision',
    summary: 'Decided to launch newsletter before social — email list first',
    detail: 'Wendy made the case: newsletter has 10x higher ROI than social for B2B audience. Restaurant operators check email, not Twitter. Decision: launch "The Margin Report" newsletter as primary channel. Target: 500 subscribers by April 30. Distribution: Beehiiv. Monetization: sponsor slots at 1,000 subscribers.',
  },
  {
    id: '28',
    timestamp: 'Mar 11, 2026 · 3:45 PM',
    date: '2026-03-11',
    agent: 'Remy',
    project: 'dbtech45',
    type: 'build',
    summary: 'Restaurant tools suite complete — Menu Autopilot, Slow Night SOS, Competitor Radar',
    detail: 'Remy delivered the full restaurant intelligence suite. Menu Autopilot: commodity-to-menu cost mapping with automated alerts. Slow Night SOS: cover forecasting with dynamic incentive triggers. Competitor Radar: scrapes and tracks competitor menu prices weekly. All three integrated into the OS sidebar.',
  },
  {
    id: '29',
    timestamp: 'Mar 13, 2026 · 8:00 AM',
    date: '2026-03-13',
    agent: 'Milo',
    project: 'dbtech45',
    type: 'deploy',
    summary: '20-Year Clock, Pattern Mirror, Decision Audit deployed',
    detail: 'Three new OS tools shipped. 20-Year Clock: 10-year compounding visualizer with net worth projections. Pattern Mirror: recurring behavior tracker with streak analysis. Decision Audit: 5-question framework that separates fear from intuition. All three pages follow brand spec exactly.',
  },
  {
    id: '30',
    timestamp: 'Mar 15, 2026 · 9:00 AM',
    date: '2026-03-15',
    agent: 'Dax',
    project: 'dbtech45',
    type: 'milestone',
    summary: 'OS reaches 45 pages — Time Machine goes live',
    detail: "Today's build: Time Machine — a searchable, filterable reconstruction of every decision, deploy, and conversation since January. Marks a milestone: the OS is now self-documenting. Every future build logs itself to the timeline. The system has memory. This is what an AI-native OS looks like.",
  },
];

const DATE_RANGES = [
  { label: 'All Time', value: 'all' },
  { label: 'Jan 2026', value: '2026-01' },
  { label: 'Feb 2026', value: '2026-02' },
  { label: 'Mar 2026', value: '2026-03' },
];

export default function TimeMachinePage() {
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<EventType | 'All'>('All');
  const [dateRange, setDateRange] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_DATA.filter(entry => {
      if (agentFilter !== 'All' && entry.agent !== agentFilter) return false;
      if (projectFilter !== 'All' && entry.project !== projectFilter) return false;
      if (typeFilter !== 'All' && entry.type !== typeFilter) return false;
      if (dateRange !== 'all' && !entry.date.startsWith(dateRange)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !entry.summary.toLowerCase().includes(q) &&
          !entry.detail.toLowerCase().includes(q) &&
          !entry.agent.toLowerCase().includes(q) &&
          !entry.project.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    }).reverse(); // newest first
  }, [search, agentFilter, projectFilter, typeFilter, dateRange]);

  const filterPillBase: React.CSSProperties = {
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${brand.border}`,
    background: 'transparent',
    color: brand.silver,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  };

  const filterPillActive: React.CSSProperties = {
    ...filterPillBase,
    background: brand.amber,
    color: brand.void,
    border: `1px solid ${brand.amber}`,
  };

  const selectStyle: React.CSSProperties = {
    ...styles.input,
    width: 'auto',
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23737373' strokeWidth='1.5' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '28px',
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Back link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/os" style={styles.backLink}>
            ← Back to OS
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={styles.h1}>Time Machine</h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: brand.amber,
              background: `${brand.amber}15`,
              border: `1px solid ${brand.amber}40`,
              padding: '3px 10px',
              borderRadius: '20px',
              letterSpacing: '0.08em',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              textTransform: 'uppercase',
            }}>
              {MOCK_DATA.length} entries
            </span>
          </div>
          <p style={styles.subtitle}>
            Rewind any moment. Every decision, deploy, and conversation — reconstructed.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: brand.smoke,
            fontSize: '15px',
            pointerEvents: 'none',
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search decisions, deploys, conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...styles.input, paddingLeft: '38px', fontSize: '14px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: brand.smoke,
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
              }}
            >×</button>
          )}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Date range pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                style={dateRange === r.value ? filterPillActive : filterPillBase}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '28px', background: brand.border, flexShrink: 0 }} />

          {/* Type pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {TYPES.map(t => {
              const cfg = t !== 'All' ? EVENT_CONFIG[t] : null;
              const isActive = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    ...filterPillBase,
                    ...(isActive ? {
                      background: cfg ? `${cfg.color}20` : `${brand.amber}20`,
                      color: cfg ? cfg.color : brand.amber,
                      border: `1px solid ${cfg ? cfg.color : brand.amber}60`,
                    } : {}),
                  }}
                >
                  {cfg ? `${cfg.icon} ${cfg.label}` : 'All Types'}
                </button>
              );
            })}
          </div>

          <div style={{ width: '1px', height: '28px', background: brand.border, flexShrink: 0 }} />

          {/* Agent & Project selects */}
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            style={selectStyle}
          >
            {AGENTS.map(a => <option key={a} value={a}>{a === 'All' ? 'All Agents' : a}</option>)}
          </select>

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            style={selectStyle}
          >
            {PROJECTS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Projects' : p}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div style={{ fontSize: '12px', color: brand.smoke, marginBottom: '1.5rem', fontFamily: "'JetBrains Mono', monospace" }}>
          {filtered.length === MOCK_DATA.length
            ? `Showing all ${filtered.length} entries`
            : `${filtered.length} of ${MOCK_DATA.length} entries match`}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '3rem', color: brand.smoke }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>◌</div>
            <div style={{ fontSize: '14px' }}>No entries match your filters.</div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: '23px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: `linear-gradient(to bottom, ${brand.amber}60, ${brand.border} 80%)`,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {filtered.map((entry, idx) => {
                const cfg = EVENT_CONFIG[entry.type];
                const isExpanded = expandedId === entry.id;
                const isLast = idx === filtered.length - 1;

                return (
                  <div key={entry.id} style={{ display: 'flex', gap: '1.25rem', paddingBottom: isLast ? 0 : '1rem' }}>
                    {/* Dot */}
                    <div style={{ flexShrink: 0, width: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: cfg.color,
                        border: `2px solid ${brand.void}`,
                        boxShadow: `0 0 0 2px ${cfg.color}50`,
                        marginTop: '6px',
                        flexShrink: 0,
                        zIndex: 1,
                        position: 'relative',
                      }} />
                    </div>

                    {/* Card */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      style={{
                        flex: 1,
                        ...styles.card,
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        borderColor: isExpanded ? cfg.color : brand.border,
                        borderLeft: `3px solid ${isExpanded ? cfg.color : 'transparent'}`,
                        transition: 'all 0.2s ease',
                        marginBottom: 0,
                      }}
                      onMouseEnter={e => {
                        if (!isExpanded) (e.currentTarget as HTMLDivElement).style.borderColor = brand.borderHover;
                      }}
                      onMouseLeave={e => {
                        if (!isExpanded) (e.currentTarget as HTMLDivElement).style.borderColor = brand.border;
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Type badge */}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: cfg.color,
                            background: `${cfg.color}15`,
                            border: `1px solid ${cfg.color}40`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontFamily: "'Space Grotesk', system-ui, sans-serif",
                          }}>
                            {cfg.icon} {cfg.label}
                          </span>

                          {/* Agent */}
                          <span style={{
                            fontSize: '12px',
                            color: brand.amber,
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {entry.agent}
                          </span>

                          {/* Project */}
                          <span style={{
                            fontSize: '11px',
                            color: brand.smoke,
                            background: `${brand.smoke}15`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}>
                            {entry.project}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <span style={{
                          fontSize: '11px',
                          color: brand.smoke,
                          fontFamily: "'JetBrains Mono', monospace",
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {entry.timestamp}
                        </span>
                      </div>

                      {/* Summary */}
                      <div style={{
                        fontSize: '14px',
                        color: brand.white,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}>
                        {entry.summary}
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: `1px solid ${brand.border}`,
                          fontSize: '13px',
                          color: brand.silver,
                          lineHeight: 1.7,
                          animation: 'fadeIn 0.2s ease',
                        }}>
                          {entry.detail}
                          <div style={{
                            marginTop: '0.75rem',
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                          }}>
                            <span style={{ fontSize: '11px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                              Entry #{entry.id} · {entry.agent} · {entry.project}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Expand hint */}
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '11px',
                        color: brand.smoke,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                          ▾
                        </span>
                        <span>{isExpanded ? 'Collapse' : 'Expand for full detail'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${brand.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '12px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
            time-machine · {MOCK_DATA.length} reconstructed events · Jan–Mar 2026
          </span>
          <span style={{ fontSize: '12px', color: brand.smoke }}>
            Sources: agent memory · git history · session logs
          </span>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        select option {
          background: #111111;
          color: #FFFFFF;
        }
      `}</style>
    </div>
  );
}
