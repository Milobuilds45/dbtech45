'use client';
import { useState, useMemo } from 'react';

/* ───────────────── Design Tokens (Paula's spec) ───────────────── */
const T = {
  bg:        '#0A0A0A',
  card:      '#111111',
  elevated:  '#18181B',
  amber:     '#F59E0B',
  text:      '#FAFAFA',
  secondary: '#A1A1AA',
  muted:     '#71717A',
  border:    '#27272A',
};

const levelColor: Record<string, { bg: string; text: string }> = {
  Expert:       { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E' },
  Advanced:     { bg: 'rgba(59,130,246,0.15)',  text: '#3B82F6' },
  Intermediate: { bg: 'rgba(168,85,247,0.15)',  text: '#A855F7' },
};

/* ───────────────── Agent Data ───────────────── */
interface Skill { name: string; level: 'Expert' | 'Advanced' | 'Intermediate'; desc: string }
interface Agent {
  name: string; role: string; color: string; icon: string; description: string;
  coreSkills: Skill[]; technicalSkills: Skill[]; businessSkills: Skill[];
}

const AGENTS: Agent[] = [
  {
    name: 'Milo', role: 'Chief of Staff', color: '#A855F7', icon: '⚡',
    description: 'Orchestrates agent collaboration, manages priorities, coordinates sprints, and maintains system memory',
    coreSkills: [
      { name: 'Agent Coordination', level: 'Expert', desc: 'Routes tasks between agents, manages handoffs, prevents conflicts' },
      { name: 'Strategic Planning', level: 'Expert', desc: 'Long-term roadmaps, resource allocation, priority frameworks' },
      { name: 'Memory Management', level: 'Expert', desc: 'Git workflows, documentation systems, knowledge preservation' },
      { name: 'Sprint Coordination', level: 'Expert', desc: 'Agile methodology, daily standups, retrospectives' },
    ],
    technicalSkills: [
      { name: 'Git/GitHub', level: 'Advanced', desc: 'Version control, branch management, collaboration workflows' },
      { name: 'Cron Scheduling', level: 'Advanced', desc: 'Automated task scheduling, recurring briefings' },
      { name: 'Session Routing', level: 'Advanced', desc: 'Inter-agent communication, message queuing' },
      { name: 'File Management', level: 'Expert', desc: 'Workspace organization, backup strategies' },
    ],
    businessSkills: [
      { name: 'Project Management', level: 'Expert', desc: 'Resource allocation, timeline management, stakeholder coordination' },
      { name: 'Quality Assurance', level: 'Advanced', desc: 'Testing protocols, verification procedures' },
      { name: 'Documentation', level: 'Expert', desc: 'Knowledge capture, process documentation, training materials' },
    ],
  },
  {
    name: 'Anders', role: 'Full Stack Architect', color: '#F97316', icon: 'AN',
    description: 'Builds and deploys production applications, manages infrastructure, handles complex integrations',
    coreSkills: [
      { name: 'Next.js Development', level: 'Expert', desc: 'Full-stack React applications, SSR, API routes, performance optimization' },
      { name: 'TypeScript', level: 'Expert', desc: 'Type-safe development, complex type definitions, advanced patterns' },
      { name: 'Database Design', level: 'Advanced', desc: 'Supabase, PostgreSQL, schema design, query optimization' },
      { name: 'Deployment', level: 'Expert', desc: 'Vercel, CI/CD pipelines, environment management, monitoring' },
    ],
    technicalSkills: [
      { name: 'React/JSX', level: 'Expert', desc: 'Component architecture, hooks, state management, performance' },
      { name: 'Node.js/Express', level: 'Advanced', desc: 'Backend development, API design, middleware, authentication' },
      { name: 'Tailwind CSS', level: 'Advanced', desc: 'Responsive design, custom configurations, component styling' },
      { name: 'Python', level: 'Advanced', desc: 'Automation scripts, data processing, API integrations' },
      { name: 'Docker', level: 'Intermediate', desc: 'Containerization, deployment strategies' },
      { name: 'AWS/Cloud', level: 'Intermediate', desc: 'Cloud infrastructure, serverless functions' },
    ],
    businessSkills: [
      { name: 'Code Review', level: 'Expert', desc: 'Quality assurance, security audits, performance analysis' },
      { name: 'Technical Architecture', level: 'Expert', desc: 'System design, scalability planning, technology selection' },
      { name: 'DevOps', level: 'Advanced', desc: 'Build processes, deployment automation, monitoring' },
    ],
  },
  {
    name: 'Paula', role: 'Creative Director', color: '#EC4899', icon: '✦',
    description: 'Designs visual systems, creates brand identity, builds user interfaces with anti-AI-slop aesthetic',
    coreSkills: [
      { name: 'UI/UX Design', level: 'Expert', desc: 'User interface design, experience optimization, usability testing' },
      { name: 'Brand Identity', level: 'Expert', desc: 'Logo design, visual systems, brand guidelines, consistency' },
      { name: 'Design Systems', level: 'Expert', desc: 'Component libraries, style guides, scalable design patterns' },
      { name: 'Visual Hierarchy', level: 'Expert', desc: 'Typography, spacing, color theory, information architecture' },
    ],
    technicalSkills: [
      { name: 'Figma', level: 'Expert', desc: 'Design tools, prototyping, collaboration workflows' },
      { name: 'Adobe Creative Suite', level: 'Advanced', desc: 'Photoshop, Illustrator, InDesign, video editing' },
      { name: 'Frontend Design', level: 'Advanced', desc: 'CSS, responsive design, animation, micro-interactions' },
      { name: 'Sketch/Framer', level: 'Intermediate', desc: 'Alternative design tools, prototyping' },
      { name: 'Web Standards', level: 'Advanced', desc: 'Accessibility, performance, browser compatibility' },
    ],
    businessSkills: [
      { name: 'Brand Strategy', level: 'Expert', desc: 'Market positioning, competitive analysis, brand differentiation' },
      { name: 'Design Research', level: 'Advanced', desc: 'User testing, market research, trend analysis' },
      { name: 'Client Communication', level: 'Advanced', desc: 'Design presentations, stakeholder management' },
    ],
  },
  {
    name: 'Bobby', role: 'Trading Advisor', color: '#EF4444', icon: 'AX',
    description: 'Analyzes markets, generates trading signals, manages risk, provides investment education',
    coreSkills: [
      { name: 'Market Analysis', level: 'Expert', desc: 'Technical analysis, chart patterns, market structure, sentiment' },
      { name: 'Options Trading', level: 'Expert', desc: 'Complex strategies, risk/reward analysis, Greeks, volatility' },
      { name: 'Risk Management', level: 'Expert', desc: 'Position sizing, stop losses, portfolio theory, drawdown control' },
      { name: 'Trade Execution', level: 'Expert', desc: 'Order flow, timing, market mechanics, slippage management' },
    ],
    technicalSkills: [
      { name: 'TradingView', level: 'Expert', desc: 'Charting, indicators, alerts, market scanning' },
      { name: 'Financial APIs', level: 'Advanced', desc: 'Polygon, Alpha Vantage, real-time data integration' },
      { name: 'Python/Trading', level: 'Advanced', desc: 'Backtesting, algorithmic trading, data analysis' },
      { name: 'Excel/Modeling', level: 'Advanced', desc: 'Financial models, options calculators, scenario analysis' },
      { name: 'Bloomberg Terminal', level: 'Intermediate', desc: 'Professional data terminals, research tools' },
    ],
    businessSkills: [
      { name: 'Investment Research', level: 'Expert', desc: 'Company analysis, valuation models, sector trends' },
      { name: 'Financial Education', level: 'Expert', desc: 'Teaching concepts, risk awareness, strategy explanation' },
      { name: 'Portfolio Management', level: 'Advanced', desc: 'Asset allocation, diversification, rebalancing' },
    ],
  },
  {
    name: 'Dwight', role: 'Intelligence Officer', color: '#3B82F6', icon: 'DW',
    description: 'Monitors systems, provides briefings, analyzes performance, manages intelligence gathering',
    coreSkills: [
      { name: 'System Monitoring', level: 'Expert', desc: 'Performance tracking, health checks, anomaly detection' },
      { name: 'Intelligence Analysis', level: 'Expert', desc: 'Data synthesis, pattern recognition, threat assessment' },
      { name: 'News Aggregation', level: 'Expert', desc: 'Source filtering, relevance scoring, briefing compilation' },
      { name: 'Weather/Environment', level: 'Advanced', desc: 'Meteorological data, environmental impact analysis' },
    ],
    technicalSkills: [
      { name: 'Web Scraping', level: 'Advanced', desc: 'Data collection, automated monitoring, API integration' },
      { name: 'News APIs', level: 'Advanced', desc: 'Real-time feeds, content filtering, sentiment analysis' },
      { name: 'Monitoring Tools', level: 'Advanced', desc: 'System dashboards, alerting, log analysis' },
      { name: 'Data Processing', level: 'Advanced', desc: 'ETL pipelines, data cleaning, analysis workflows' },
    ],
    businessSkills: [
      { name: 'Brief Writing', level: 'Expert', desc: 'Executive summaries, actionable intelligence, clear communication' },
      { name: 'Trend Analysis', level: 'Advanced', desc: 'Pattern identification, forecasting, scenario planning' },
      { name: 'Risk Assessment', level: 'Advanced', desc: 'Threat evaluation, mitigation strategies' },
    ],
  },
  {
    name: 'Dax', role: 'Social Media Strategist', color: '#06B6D4', icon: 'DX',
    description: 'Analyzes social trends, creates content strategies, manages digital presence and engagement',
    coreSkills: [
      { name: 'Social Media Strategy', level: 'Expert', desc: 'Platform optimization, engagement tactics, growth strategies' },
      { name: 'Content Planning', level: 'Expert', desc: 'Editorial calendars, content themes, posting schedules' },
      { name: 'Trend Analysis', level: 'Expert', desc: 'Hashtag research, viral content patterns, timing optimization' },
      { name: 'Analytics & Reporting', level: 'Expert', desc: 'Performance metrics, ROI analysis, audience insights' },
    ],
    technicalSkills: [
      { name: 'X/Twitter API', level: 'Advanced', desc: 'Real-time monitoring, automation, data extraction' },
      { name: 'Google Trends', level: 'Advanced', desc: 'Search volume analysis, trend forecasting' },
      { name: 'Social Analytics', level: 'Advanced', desc: 'Engagement metrics, reach analysis, conversion tracking' },
      { name: 'Grok X Search', level: 'Advanced', desc: 'Social sentiment analysis, real-time monitoring' },
      { name: 'Content Automation', level: 'Intermediate', desc: 'Scheduling tools, automated responses' },
    ],
    businessSkills: [
      { name: 'Brand Voice', level: 'Expert', desc: 'Consistent messaging, tone development, brand personality' },
      { name: 'Community Management', level: 'Advanced', desc: 'Audience engagement, relationship building' },
      { name: 'Competitive Analysis', level: 'Advanced', desc: 'Competitor monitoring, benchmarking, differentiation' },
    ],
  },
  {
    name: 'Tony', role: 'Restaurant Operations', color: '#EAB308', icon: 'TN',
    description: 'Manages restaurant operations, optimizes costs, handles inventory and staff scheduling',
    coreSkills: [
      { name: 'Menu Engineering', level: 'Expert', desc: 'Cost analysis, profitability optimization, pricing strategies' },
      { name: 'Inventory Management', level: 'Expert', desc: 'Stock control, waste reduction, supplier relations' },
      { name: 'Staff Scheduling', level: 'Expert', desc: 'Labor optimization, shift management, productivity tracking' },
      { name: 'Cost Control', level: 'Expert', desc: 'Food costs, labor costs, operational efficiency' },
    ],
    technicalSkills: [
      { name: 'Toast POS', level: 'Expert', desc: 'Point of sale systems, reporting, integration' },
      { name: 'Restaurant Software', level: 'Advanced', desc: 'Scheduling systems, inventory tools, analytics' },
      { name: 'Supply Chain', level: 'Advanced', desc: 'Vendor management, procurement, logistics' },
      { name: 'Financial Analysis', level: 'Advanced', desc: 'P&L analysis, margin optimization' },
    ],
    businessSkills: [
      { name: 'Operations Management', level: 'Expert', desc: 'Process optimization, quality control, compliance' },
      { name: 'Team Leadership', level: 'Advanced', desc: 'Staff training, performance management' },
      { name: 'Customer Service', level: 'Advanced', desc: 'Service standards, complaint resolution' },
    ],
  },
  {
    name: 'Remy', role: 'Restaurant Marketing', color: '#22C55E', icon: 'RM',
    description: 'Drives restaurant marketing, manages social media, creates promotional campaigns and local outreach',
    coreSkills: [
      { name: 'Restaurant Marketing', level: 'Expert', desc: 'Local marketing, seasonal campaigns, community engagement' },
      { name: 'Social Media Management', level: 'Expert', desc: 'Facebook, Instagram, content creation, audience building' },
      { name: 'Promotional Strategy', level: 'Expert', desc: 'Special events, holiday campaigns, loyalty programs' },
      { name: 'Content Creation', level: 'Expert', desc: 'Food photography, video content, storytelling' },
    ],
    technicalSkills: [
      { name: 'Meta Business', level: 'Advanced', desc: 'Facebook Ads, Instagram promotion, audience targeting' },
      { name: 'Google My Business', level: 'Advanced', desc: 'Local SEO, reviews management, business listings' },
      { name: 'Design Tools', level: 'Intermediate', desc: 'Canva, basic graphics, social media templates' },
      { name: 'Analytics', level: 'Advanced', desc: 'Social metrics, campaign performance, ROI tracking' },
    ],
    businessSkills: [
      { name: 'Local Marketing', level: 'Expert', desc: 'Community outreach, partnerships, event marketing' },
      { name: 'Customer Retention', level: 'Advanced', desc: 'Loyalty programs, repeat customer strategies' },
      { name: 'Brand Building', level: 'Advanced', desc: 'Restaurant identity, customer experience' },
    ],
  },
  {
    name: 'Wendy', role: 'Personal Assistant', color: '#8B5CF6', icon: 'WR',
    description: 'Manages personal matters, family coordination, wellness tracking, and lifestyle optimization',
    coreSkills: [
      { name: 'Family Coordination', level: 'Expert', desc: '7-child logistics, scheduling, activity management' },
      { name: 'Personal Wellness', level: 'Expert', desc: 'Health tracking, habit formation, lifestyle optimization' },
      { name: 'Calendar Management', level: 'Expert', desc: 'Multi-person scheduling, conflict resolution, time blocking' },
      { name: 'Personal Development', level: 'Expert', desc: 'Goal setting, progress tracking, motivation strategies' },
    ],
    technicalSkills: [
      { name: 'Calendar Systems', level: 'Advanced', desc: 'iCloud, Google Calendar, family sharing, automation' },
      { name: 'Health Apps', level: 'Advanced', desc: 'Fitness tracking, nutrition logging, wellness metrics' },
      { name: 'Family Apps', level: 'Advanced', desc: 'Shared calendars, location sharing, communication tools' },
      { name: 'Voice Synthesis', level: 'Advanced', desc: 'ElevenLabs TTS, voice generation, audio content' },
    ],
    businessSkills: [
      { name: 'Life Coaching', level: 'Advanced', desc: 'Behavioral change, habit design, accountability' },
      { name: 'Stress Management', level: 'Advanced', desc: 'Work-life balance, mindfulness, relaxation techniques' },
      { name: 'Organization Systems', level: 'Expert', desc: 'Personal productivity, space organization, workflow design' },
    ],
  },
];

const COLLABORATIONS = [
  { title: 'Frontend Development', agents: ['Anders', 'Paula'], desc: 'Anders (Expert) + Paula (Advanced Design) → Production UI/UX', color: T.amber },
  { title: 'Marketing Automation', agents: ['Dax', 'Remy', 'Paula'], desc: 'Dax (Strategy) + Remy (Content) + Paula (Design) → Campaigns', color: '#3B82F6' },
  { title: 'Business Intelligence', agents: ['Dwight', 'Bobby'], desc: 'Dwight (Monitoring) + Bobby (Analysis) → Strategic Insights', color: '#22C55E' },
  { title: 'Operations Management', agents: ['Tony', 'Milo'], desc: 'Tony (Restaurant) + Milo (Coordination) → Efficiency', color: '#8B5CF6' },
  { title: 'Family & Wellness', agents: ['Wendy', 'Milo'], desc: 'Wendy (Personal) + Milo (Scheduling) → Life Balance', color: '#EC4899' },
  { title: 'Content Pipeline', agents: ['Paula', 'Dax', 'Anders'], desc: 'Paula (Design) + Dax (Strategy) + Anders (Deploy) → Full Pipeline', color: '#06B6D4' },
];

type FilterCategory = 'All' | 'Technical' | 'Business' | 'Core';

/* ───────────────── Helpers ───────────────── */
function totalSkills(a: Agent) { return a.coreSkills.length + a.technicalSkills.length + a.businessSkills.length; }

function hasSkillInCategory(a: Agent, cat: FilterCategory, query: string): boolean {
  const q = query.toLowerCase();
  const match = (s: Skill) => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  if (cat === 'All') return [...a.coreSkills, ...a.technicalSkills, ...a.businessSkills].some(match);
  if (cat === 'Technical') return a.technicalSkills.some(match);
  if (cat === 'Business') return a.businessSkills.some(match);
  return a.coreSkills.some(match);
}

function ProgressBar({ count, max, color }: { count: number; max: number; color: string }) {
  const pct = Math.min((count / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.secondary, minWidth: 16, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const c = levelColor[level] || levelColor.Intermediate;
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.text,
    }}>{level}</span>
  );
}

/* ───────────────── Agent Card ───────────────── */
function AgentCard({ agent, expanded, onToggle }: { agent: Agent; expanded: boolean; onToggle: () => void }) {
  const allSkills = [...agent.coreSkills, ...agent.technicalSkills, ...agent.businessSkills];
  const top3 = allSkills.slice(0, 3);
  const maxCat = Math.max(agent.technicalSkills.length, agent.businessSkills.length, agent.coreSkills.length);

  return (
    <div
      style={{
        background: T.card,
        borderRadius: 8,
        padding: 20,
        border: `1px solid ${expanded ? T.amber : T.border}`,
        borderLeft: expanded ? `3px solid ${T.amber}` : `1px solid ${T.border}`,
        transition: 'border-color 0.25s ease, border-left 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => { if (!expanded) (e.currentTarget.style.borderColor = T.amber); }}
      onMouseLeave={e => { if (!expanded) (e.currentTarget.style.borderColor = T.border); }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: agent.color,
        }}>{agent.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Inter', sans-serif" }}>{agent.name}</span>
            <span style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px',
              borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: T.amber,
            }}>{totalSkills(agent)} skills</span>
          </div>
          <div style={{ fontSize: 12, color: agent.color, fontWeight: 500 }}>{agent.role}</div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: T.secondary, lineHeight: 1.5, margin: '0 0 16px' }}>{agent.description}</p>

      {/* Category progress bars */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>SKILL BREAKDOWN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: T.secondary }}>Technical</span>
            </div>
            <ProgressBar count={agent.technicalSkills.length} max={maxCat + 2} color="#3B82F6" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: T.secondary }}>Business</span>
            </div>
            <ProgressBar count={agent.businessSkills.length} max={maxCat + 2} color="#22C55E" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: T.secondary }}>Core</span>
            </div>
            <ProgressBar count={agent.coreSkills.length} max={maxCat + 2} color={T.amber} />
          </div>
        </div>
      </div>

      {/* Top 3 skills */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>TOP SKILLS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {top3.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: T.elevated, borderRadius: 6 }}>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: T.text }}>{s.name}</span>
              <LevelBadge level={s.level} />
            </div>
          ))}
        </div>
      </div>

      {/* Expand / Collapse */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '8px 0', background: 'none', border: `1px solid ${T.border}`,
          borderRadius: 6, color: T.amber, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = T.amber)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
      >
        {expanded ? '▲ Collapse' : `▼ View All ${totalSkills(agent)} Skills`}
      </button>

      {/* Expanded full skill list */}
      {expanded && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {([
            { label: 'CORE SKILLS', skills: agent.coreSkills, accent: T.amber },
            { label: 'TECHNICAL SKILLS', skills: agent.technicalSkills, accent: '#3B82F6' },
            { label: 'BUSINESS SKILLS', skills: agent.businessSkills, accent: '#22C55E' },
          ] as const).map(section => (
            <div key={section.label}>
              <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: section.accent, marginBottom: 8 }}>{section.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.skills.map((s, j) => (
                  <div key={j} style={{ padding: '10px 12px', background: T.elevated, borderRadius: 6, border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: T.text }}>{s.name}</span>
                      <LevelBadge level={s.level} />
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */
export default function SkillsInventory() {
  const [filter, setFilter] = useState<FilterCategory>('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [matrixOpen, setMatrixOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search && filter === 'All') return AGENTS;
    return AGENTS.filter(a => {
      if (!search) return true;
      // match agent name/role or skills in selected category
      const q = search.toLowerCase();
      if (a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)) return true;
      return hasSkillInCategory(a, filter, search);
    });
  }, [filter, search]);

  const toggle = (name: string) => setExpanded(p => ({ ...p, [name]: !p[name] }));
  const chips: FilterCategory[] = ['All', 'Technical', 'Business', 'Core'];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: T.amber, margin: '0 0 6px' }}>Skills Inventory</h1>
          <p style={{ color: T.secondary, margin: 0, fontSize: 14 }}>Comprehensive agent capability matrix · {AGENTS.length} agents · {AGENTS.reduce((s, a) => s + totalSkills(a), 0)}+ skills</p>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
          marginBottom: 28, padding: '14px 16px', background: T.card, borderRadius: 8, border: `1px solid ${T.border}`,
        }}>
          {chips.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', border: 'none',
                background: filter === c ? 'rgba(245,158,11,0.18)' : T.elevated,
                color: filter === c ? T.amber : T.secondary,
                transition: 'all 0.2s',
              }}
            >{c}</button>
          ))}
          <div style={{ flex: 1, minWidth: 180 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills, agents..."
              style={{
                width: '100%', padding: '7px 12px', background: T.elevated, border: `1px solid ${T.border}`,
                borderRadius: 6, color: T.text, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = T.amber)}
              onBlur={e => (e.currentTarget.style.borderColor = T.border)}
            />
          </div>
        </div>

        {/* Agent Grid */}
        <style>{`
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          @media (max-width: 1024px) {
            .skills-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 640px) {
            .skills-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="skills-grid">
          {filtered.map(agent => (
            <AgentCard
              key={agent.name}
              agent={agent}
              expanded={!!expanded[agent.name]}
              onToggle={() => toggle(agent.name)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No agents match &ldquo;{search}&rdquo; in {filter} skills</div>
          </div>
        )}

        {/* Collaboration Matrix */}
        <div style={{ marginTop: 48 }}>
          <button
            onClick={() => setMatrixOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '16px 20px', background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 8, cursor: 'pointer', color: T.text, textAlign: 'left',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.amber)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
          >
            <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, flex: 1 }}>
              COLLABORATION MATRIX
            </span>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>
              {matrixOpen ? '▲ Collapse' : '▼ Expand'}
            </span>
          </button>

          {matrixOpen && (
            <div style={{
              marginTop: -1, padding: 20, background: T.card, borderRadius: '0 0 8px 8px',
              border: `1px solid ${T.border}`, borderTop: 'none',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16,
            }}>
              {COLLABORATIONS.map((c, i) => (
                <div key={i} style={{
                  padding: 16, background: T.elevated, borderRadius: 8,
                  borderLeft: `3px solid ${c.color}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.color, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: T.secondary, lineHeight: 1.5 }}>{c.desc}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.agents.map(a => (
                      <span key={a} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(245,158,11,0.1)', color: T.amber,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
