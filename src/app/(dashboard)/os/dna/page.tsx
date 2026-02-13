'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import OpsGuard from '@/components/OpsGuard';

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

const tagColor = {
  Core:        { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Operational: { bg: 'rgba(59,130,246,0.15)',  text: '#3B82F6' },
  Cultural:    { bg: 'rgba(168,85,247,0.15)',  text: '#A855F7' },
} as const;

type TagType = keyof typeof tagColor;

/* ───────────────── Principle Data ───────────────── */
interface Principle {
  id: string;
  number: number;
  title: string;
  tag: TagType;
  quote: string;
  details: string;
  implementation: string[];
  examples: string[];
  metrics: string[];
}

interface Category {
  name: string;
  icon: string;
  color: string;
  principles: Principle[];
}

const CATEGORIES: Category[] = [
  {
    name: 'Execution',
    icon: '⚡',
    color: T.amber,
    principles: [
      {
        id: 'ship-daily',
        number: 1,
        title: 'Ship It or Kill It',
        tag: 'Core',
        quote: 'Projects either ship or get archived. No zombie projects consuming mental cycles.',
        details: 'Half-built projects are mental debt. Either commit fully or kill cleanly. Regular project reviews. Clear go/no-go decisions.',
        implementation: [
          'Monthly project audits to identify stalled work',
          'Every project gets a hard ship date or sunset date',
          'Archive with documentation, never abandon silently',
          'Regular go/no-go checkpoints at each milestone',
        ],
        examples: ['Monthly project audits', 'Sunset dates for experiments', 'Clear MVP definitions', 'Archive vs delete decisions'],
        metrics: ['Zero zombie projects', 'Ship rate > 80%', 'Average time-to-ship under 2 weeks', 'Clean archive ratio'],
      },
      {
        id: 'default-to-action',
        number: 2,
        title: 'Default to Action',
        tag: 'Core',
        quote: 'Move with velocity, then refine with feedback loops. Bias toward shipping.',
        details: 'Analysis paralysis kills momentum. Perfect is the enemy of good. Get early feedback from real users. Course-correct based on data, not opinions.',
        implementation: [
          'Ship MVP within 48 hours of starting',
          'Weekly iteration cycles with user feedback',
          'A/B test assumptions rather than debating them',
          'Course-correct based on data, not opinions',
        ],
        examples: ['Ship MVP in 48 hours', 'Weekly iteration cycles', 'User feedback loops', 'A/B test everything'],
        metrics: ['Time from idea to first deploy', 'Iteration velocity', 'Feedback response time'],
      },
      {
        id: 'automate-boring',
        number: 3,
        title: 'Automate the Boring Stuff',
        tag: 'Operational',
        quote: "If you do it twice, automate it. Free up human creativity for complex problems.",
        details: 'Repetitive tasks are automation opportunities. Scripts beat manual processes. Humans for strategy, computers for execution.',
        implementation: [
          'Track repetitive tasks for one week before automating',
          'Build automation with clear documentation',
          'Monitor automation health, don\'t set and forget',
          'Humans for strategy, computers for execution',
        ],
        examples: ['Deployment automation', 'Report generation', 'Data backups', 'Social media scheduling'],
        metrics: ['Hours saved per week', 'Automation reliability %', 'Manual task reduction rate'],
      },
      {
        id: 'own-the-stack',
        number: 4,
        title: 'Own the Whole Stack',
        tag: 'Operational',
        quote: 'End-to-end ownership from idea to customer success. No silos or handoffs.',
        details: 'Full-stack thinking prevents optimization sub-problems. Understand the entire customer journey. Take responsibility for outcomes, not just outputs.',
        implementation: [
          'Every feature owner tracks from idea to customer impact',
          'No handoff without context transfer',
          'Measure outcomes, not just outputs',
          'Cross-functional understanding is mandatory',
        ],
        examples: ['Full-stack development', 'Customer support', 'Marketing to fulfillment', 'Feedback integration'],
        metrics: ['End-to-end feature ownership %', 'Customer outcome correlation', 'Handoff error rate'],
      },
    ],
  },
  {
    name: 'Decision-Making',
    icon: '⧉',
    color: '#EF4444',
    principles: [
      {
        id: 'does-it-compound',
        number: 5,
        title: 'Does It Compound?',
        tag: 'Core',
        quote: 'Will this create leverage or reduce future friction? Exponential beats linear.',
        details: 'Look for exponential returns. Invest in capabilities that multiply. Choose paths that get easier over time. Compound knowledge and assets.',
        implementation: [
          'Apply compound test to every major decision',
          'Invest in reusable assets over one-off solutions',
          'Choose paths that get easier over time',
          'Compound knowledge, not just code',
        ],
        examples: ['Learning new frameworks', 'Building reusable components', 'Creating content libraries', 'Network effects'],
        metrics: ['Reuse rate of components/assets', 'Diminishing effort per feature', 'Knowledge leverage ratio'],
      },
      {
        id: 'protect-the-brand',
        number: 6,
        title: 'Does It Protect the Brand?',
        tag: 'Core',
        quote: 'Everything ships with the DB Tech standard. Quality is non-negotiable.',
        details: 'Brand reputation takes years to build, seconds to destroy. Every customer interaction matters. Consistency across all touchpoints.',
        implementation: [
          'Quality gates before any public release',
          'Brand consistency checklist for all outputs',
          'Customer interaction standards documented and trained',
          'Regular brand audits across touchpoints',
        ],
        examples: ['Code quality standards', 'Customer service protocols', 'Visual design consistency', 'Communication tone'],
        metrics: ['Brand consistency score', 'Customer trust rating', 'Quality gate pass rate'],
      },
      {
        id: 'measure-twice',
        number: 7,
        title: 'Measure Twice, Cut Once',
        tag: 'Operational',
        quote: "Derek's motto. Verification before action. Quality gates at every step.",
        details: 'Test assumptions before building. Validate ideas before investing. Check work before shipping. Prevention beats fixing.',
        implementation: [
          'User interviews before committing to features',
          'Staging environments for all deploys',
          'Mandatory code reviews before merge',
          'QA processes with clear pass/fail criteria',
        ],
        examples: ['User interviews before features', 'Staging environments', 'Code reviews', 'QA processes'],
        metrics: ['Rollback rate', 'Pre-launch issue catch rate', 'Post-ship bug density'],
      },
      {
        id: 'no-analysis-paralysis',
        number: 8,
        title: 'No Analysis Paralysis',
        tag: 'Operational',
        quote: "Data informs decisions, it doesn't make them. Perfect information doesn't exist.",
        details: 'Good decisions with imperfect information beat perfect analysis too late. Set decision deadlines.',
        implementation: [
          'Set decision deadlines before research starts',
          '80/20 rule: 80% confidence is enough to act',
          'Bias toward reversible decisions',
          'Document rationale for future learning',
        ],
        examples: ['80/20 research rule', 'Decision deadlines', 'Bias toward action', 'Reversible decisions'],
        metrics: ['Decision cycle time', 'Reversal rate', 'Opportunity cost of delay'],
      },
      {
        id: 'is-it-defensible',
        number: 9,
        title: 'Is It Defensible?',
        tag: 'Core',
        quote: "Can competitors easily copy this? Build moats, not features.",
        details: 'Network effects, switching costs, and unique data create sustainable advantages. Features are commodities, ecosystems are defensible.',
        implementation: [
          'Identify moat potential in every major initiative',
          'Prioritize data accumulation and network effects',
          'Build ecosystems, not just products',
          'Create switching costs through deep integration',
        ],
        examples: ['User data advantages', 'Integration complexity', 'Community building', 'Proprietary technology'],
        metrics: ['Competitive differentiation score', 'Switching cost index', 'Network effect multiplier'],
      },
    ],
  },
  {
    name: 'Communication',
    icon: '◈',
    color: '#3B82F6',
    principles: [
      {
        id: 'clarity-beats-speed',
        number: 10,
        title: 'Clarity Beats Speed',
        tag: 'Core',
        quote: 'Make the plan simple enough to execute under pressure and delegation.',
        details: "Complex plans fail under stress. Simple, clear objectives survive contact with reality. If you can't explain it simply, you don't understand it well enough.",
        implementation: [
          'One-page project briefs for every initiative',
          'Clear success metrics defined upfront',
          'Simple communication channels, not tool sprawl',
          'Documented decision criteria for recurring choices',
        ],
        examples: ['One-page project briefs', 'Clear success metrics', 'Simple communication channels', 'Documented decision criteria'],
        metrics: ['Brief clarity score', 'Misunderstanding rate', 'Delegation success rate'],
      },
      {
        id: 'signal-over-noise',
        number: 11,
        title: 'Signal Over Noise',
        tag: 'Operational',
        quote: 'Protect focus. Say no to shiny distractions. Quality attention beats quantity hours.',
        details: 'Information overload kills productivity. Filter aggressively. Batch communication. Guard deep work time. Attention is your scarcest resource.',
        implementation: [
          'Batch email and messages to 2-3 windows per day',
          'Notification management with aggressive filtering',
          'Dedicated focus time blocks on calendar',
          'Single-tasking by default, multitasking by exception',
        ],
        examples: ['Email batching', 'Notification management', 'Focus time blocks', 'Single-tasking'],
        metrics: ['Deep work hours per day', 'Interruption frequency', 'Focus session completion rate'],
      },
      {
        id: 'no-meetings-for-meetings',
        number: 12,
        title: "No Meeting for Meeting's Sake",
        tag: 'Operational',
        quote: 'Meetings are expensive. Default to async. Meet only to make decisions.',
        details: "Every meeting should have clear outcomes. Status updates don't need meetings. Document decisions.",
        implementation: [
          'Agenda required for every meeting or it gets cancelled',
          'Decision-focused meetings only, no status updates',
          'Async status updates via documented channels',
          'Meeting recordings for anyone who missed it',
        ],
        examples: ['Agenda required', 'Decision-focused meetings', 'Async status updates', 'Meeting recordings'],
        metrics: ['Meeting hours per week', 'Decisions per meeting', 'Async resolution rate'],
      },
    ],
  },
  {
    name: 'Sustainability',
    icon: '⊘',
    color: '#22C55E',
    principles: [
      {
        id: 'no-vanity-metrics',
        number: 13,
        title: 'No Vanity Metrics',
        tag: 'Core',
        quote: "If it doesn't move revenue or retention, skip it. Measure what matters.",
        details: "Metrics that make you feel good but don't drive business outcomes are dangerous. Focus on leading indicators of customer value.",
        implementation: [
          'Define north star metric for every project',
          'Audit dashboards quarterly for vanity metric creep',
          'Revenue and retention as ultimate filters',
          'Leading indicators of customer value only',
        ],
        examples: ['Revenue per customer', 'Retention rates', 'Customer satisfaction', 'Feature usage depth'],
        metrics: ['Revenue growth', 'Customer retention rate', 'Feature adoption depth'],
      },
      {
        id: 'no-premature-optimization',
        number: 14,
        title: 'No Premature Optimization',
        tag: 'Operational',
        quote: 'Ship it, validate it, then polish it. Perfect is the enemy of shipped.',
        details: 'Optimize based on real usage data, not assumptions. Performance problems are good problems to have. Scalability follows validation.',
        implementation: [
          'MVP before any optimization work',
          'User feedback before feature additions',
          'Metrics before optimization decisions',
          'Revenue validation before perfection investment',
        ],
        examples: ['MVP before scale', 'User feedback before features', 'Metrics before optimization', 'Revenue before perfection'],
        metrics: ['Time to validation', 'Optimization ROI', 'Pre-optimization ship rate'],
      },
      {
        id: 'no-spof',
        number: 15,
        title: 'No Single Points of Failure',
        tag: 'Core',
        quote: 'Systems > heroes. Document everything. Bus factor > 1.',
        details: "Knowledge locked in people's heads is organizational risk. Critical processes need backup coverage. Documentation prevents disasters.",
        implementation: [
          'Document all critical processes with runbooks',
          'Cross-train on every critical system',
          'Backup coverage for every key responsibility',
          'Bus factor review during retrospectives',
        ],
        examples: ['Code documentation', 'Process documentation', 'Cross-training', 'Backup systems'],
        metrics: ['Bus factor per system', 'Documentation coverage %', 'Cross-training completion rate'],
      },
      {
        id: 'no-scope-creep',
        number: 16,
        title: 'No Scope Creep',
        tag: 'Operational',
        quote: 'Feature creep kills focus and timelines. Scope boundaries are sacred.',
        details: 'New ideas during execution are scope creep in disguise. Capture them for next iteration. Finish what you started.',
        implementation: [
          'Fixed scope sprints with documented boundaries',
          'Change request process for mid-sprint additions',
          'Feature parking lot for future iterations',
          'MVP definitions locked before sprint starts',
        ],
        examples: ['Fixed scope sprints', 'Change request process', 'Feature parking lot', 'MVP definitions'],
        metrics: ['Scope change rate per sprint', 'On-time delivery %', 'Parking lot conversion rate'],
      },
      {
        id: 'no-tech-debt-interest',
        number: 17,
        title: 'No Technical Debt Interest Payments',
        tag: 'Operational',
        quote: 'Technical debt is like financial debt — the interest kills you. Pay it down regularly.',
        details: 'Quick hacks become permanent problems. Refactor while the code is fresh. Prevention beats archaeology.',
        implementation: [
          'Allocate 20% of sprint to debt reduction',
          'Refactor while code is still fresh in mind',
          'Architecture reviews before major features',
          'Track tech debt in a visible backlog',
        ],
        examples: ['Regular refactoring', 'Code quality metrics', 'Architecture reviews', 'Technical debt tracking'],
        metrics: ['Tech debt backlog trend', 'Refactoring velocity', 'Code quality score trend'],
      },
    ],
  },
  {
    name: 'Growth',
    icon: '⎈',
    color: '#A855F7',
    principles: [
      {
        id: 'build-foundations-first',
        number: 18,
        title: 'Build Foundations First',
        tag: 'Core',
        quote: 'Prioritize systems, compounding leverage, and long-term resiliency over quick wins.',
        details: 'Infrastructure investments pay dividends forever. Choose boring technology that works. Focus on systems that scale naturally. Build once, benefit repeatedly.',
        implementation: [
          'Invest in infrastructure before features',
          'Choose boring technology that works reliably',
          'Focus on systems that scale naturally',
          'Build once, benefit repeatedly across projects',
        ],
        examples: ['Git workflows for all projects', 'Standardized deployment pipelines', 'Documentation-first development', 'Automated testing and monitoring'],
        metrics: ['Infrastructure uptime', 'Reuse across projects', 'Foundation ROI over time'],
      },
      {
        id: 'integrity-in-every-rep',
        number: 19,
        title: 'Integrity in Every Rep',
        tag: 'Cultural',
        quote: 'Win the moment without sacrificing the mission. Character compounds.',
        details: "Small compromises become big problems. Do what you say you'll do. Choose the hard right over the easy wrong. Your reputation is your most valuable asset.",
        implementation: [
          'Honest progress reports, even when behind',
          'Admit mistakes quickly and publicly',
          'Deliver on commitments or renegotiate early',
          'Transparent communication as default',
        ],
        examples: ['Honest progress reports', 'Admitting mistakes quickly', 'Delivering on commitments', 'Transparent communication'],
        metrics: ['Commitment delivery rate', 'Trust score', 'Transparency index'],
      },
      {
        id: 'caffeine-and-chaos',
        number: 20,
        title: 'Caffeine and Chaos',
        tag: 'Cultural',
        quote: 'Embrace the controlled chaos of building while parenting 7 kids. Energy management over time management.',
        details: 'Life is inherently chaotic. Build systems that work in 15-minute chunks. Batch similar tasks. Use dead time productively. Momentum beats perfection.',
        implementation: [
          'Design workflows for 15-minute chunks',
          'Batch similar tasks for flow state',
          'Use dead time (commutes, waits) productively',
          'Momentum beats perfection — keep moving',
        ],
        examples: ['Morning coffee rituals', 'Mobile-first workflows', 'Voice notes for ideas', 'Async collaboration'],
        metrics: ['Productive output per energy unit', 'Flow state frequency', 'Chaos resilience score'],
      },
      {
        id: 'design-for-repeatability',
        number: 21,
        title: 'Design for Repeatability',
        tag: 'Operational',
        quote: 'Every workflow should be teachable and scalable. Systems over heroics.',
        details: 'Document processes as you build them. Create templates and checklists. Enable others to replicate success. Reduce dependency on specific people.',
        implementation: [
          'Document processes as they are built',
          'Create templates and checklists for recurring work',
          'Enable others to replicate success independently',
          'Reduce dependency on any single person',
        ],
        examples: ['Process documentation', 'Code templates', 'Deployment checklists', 'Training materials'],
        metrics: ['Template usage rate', 'Process documentation coverage', 'Self-service completion rate'],
      },
      {
        id: 'energize-the-team',
        number: 22,
        title: 'Does It Energize the Team?',
        tag: 'Cultural',
        quote: 'Momentum matters more than perfection. Choose paths that build excitement.',
        details: 'Energy is contagious. Exciting projects attract better talent. Momentum solves many problems. Dead energy kills productivity.',
        implementation: [
          'Factor team energy into project selection',
          'Celebrate wins visibly and frequently',
          'Rotate challenging and creative work',
          'Kill projects that drain energy without returns',
        ],
        examples: ['Challenging technical problems', 'Visible customer impact', 'Learning opportunities', 'Creative freedom'],
        metrics: ['Team energy pulse score', 'Voluntary contribution rate', 'Project enthusiasm index'],
      },
      {
        id: 'serve-the-customer',
        number: 23,
        title: 'Does It Serve the Customer?',
        tag: 'Core',
        quote: 'Customer value is the ultimate filter. Everything else is cost.',
        details: 'Customer success drives business success. Internal efficiency matters only if it improves customer outcomes. Outside-in thinking.',
        implementation: [
          'Customer interview insights drive roadmap',
          'Usage data analysis for every feature decision',
          'Support ticket trends inform priorities',
          'Revenue metrics as ultimate validation',
        ],
        examples: ['Customer interview insights', 'Usage data analysis', 'Support ticket trends', 'Revenue metrics'],
        metrics: ['Customer satisfaction score', 'Feature adoption rate', 'Support resolution time'],
      },
      {
        id: 'can-it-be-systematized',
        number: 24,
        title: 'Can It Be Systematized?',
        tag: 'Operational',
        quote: "If it can't be systematized, it can't scale. Process thinking beats heroic effort.",
        details: 'Scalable solutions work without constant human intervention. Document the playbook. Enable others to execute.',
        implementation: [
          'Every successful workflow becomes a documented system',
          'Automated workflows replace manual processes',
          'Training programs for all critical systems',
          'Performance metrics for system health',
        ],
        examples: ['Standard operating procedures', 'Automated workflows', 'Training programs', 'Performance metrics'],
        metrics: ['System automation %', 'Process compliance rate', 'Scale readiness index'],
      },
    ],
  },
];

/* ───────────────── Animated n8n-Style Workflow ───────────────── */
function WorkflowVisualization() {
  const branches = [
    { label: 'Core Values', color: T.amber, icon: '⎈', items: ['Ship or Kill', 'Default to Action', 'Integrity', 'Serve Customer'] },
    { label: 'Operating Principles', color: '#3B82F6', icon: '◈', items: ['Automate Boring', 'Own the Stack', 'Systematize', 'Repeatability'] },
    { label: 'Decision Filters', color: '#EF4444', icon: '◇', items: ['Energize Team?', 'Scalable?', 'Data-Driven?', 'Sustainable?'] },
    { label: 'Anti-Patterns', color: '#22C55E', icon: '⚠', items: ['Zombie Projects', 'Heroic Effort', 'Gut Decisions', 'Burnout Culture'] },
  ];

  return (
    <div style={{ position: 'relative', marginBottom: 48, padding: '0 16px' }}>
      {/* n8n animated flow CSS */}
      <style>{`
        @keyframes flowDown {
          0% { transform: translateY(-8px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        @keyframes flowToBranch {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(245,158,11,0.3); }
          50% { box-shadow: 0 0 20px rgba(245,158,11,0.6), 0 0 40px rgba(245,158,11,0.2); }
        }
        @keyframes nodeAppear {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes particleFlow0 {
          0% { left: 50%; top: 200px; opacity: 0; }
          10% { opacity: 1; }
          50% { left: 12.5%; top: 280px; opacity: 1; }
          90% { opacity: 1; }
          100% { left: 12.5%; top: 340px; opacity: 0; }
        }
        @keyframes particleFlow1 {
          0% { left: 50%; top: 200px; opacity: 0; }
          10% { opacity: 1; }
          50% { left: 37.5%; top: 280px; opacity: 1; }
          90% { opacity: 1; }
          100% { left: 37.5%; top: 340px; opacity: 0; }
        }
        @keyframes particleFlow2 {
          0% { left: 50%; top: 200px; opacity: 0; }
          10% { opacity: 1; }
          50% { left: 62.5%; top: 280px; opacity: 1; }
          90% { opacity: 1; }
          100% { left: 62.5%; top: 340px; opacity: 0; }
        }
        @keyframes particleFlow3 {
          0% { left: 50%; top: 200px; opacity: 0; }
          10% { opacity: 1; }
          50% { left: 87.5%; top: 280px; opacity: 1; }
          90% { opacity: 1; }
          100% { left: 87.5%; top: 340px; opacity: 0; }
        }
        .n8n-particle { position: absolute; width: 6px; height: 6px; border-radius: 50%; pointer-events: none; }
        .dna-branches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 768px) { .dna-branches { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .dna-branches { grid-template-columns: 1fr; } }
      `}</style>

      {/* Derek Avatar Node */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
          border: `3px solid ${T.amber}`, background: T.card,
          animation: 'pulseGlow 3s ease-in-out infinite',
        }}>
          <Image src="/derek-avatar.png" alt="Derek" width={80} height={80} style={{ objectFit: 'cover' }} />
        </div>
      </div>

      {/* Animated vertical flow line */}
      <div style={{ position: 'relative', height: 40, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 2, height: '100%', background: `linear-gradient(to bottom, ${T.amber}, ${T.amber}40)` }} />
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            width: 5, height: 5, borderRadius: '50%', background: T.amber,
            boxShadow: `0 0 6px ${T.amber}`,
            animation: `flowDown 1.5s ease-in-out ${i * 0.5}s infinite`,
          }} />
        ))}
      </div>

      {/* DB TECH Central Node */}
      <div style={{
        maxWidth: 400, margin: '0 auto', textAlign: 'center', position: 'relative',
        background: T.card, border: `2px solid ${T.amber}`, borderRadius: 12, padding: '16px 20px',
        boxShadow: '0 0 30px rgba(245,158,11,0.15)',
        animation: 'nodeAppear 0.6s ease-out',
      }}>
        {/* n8n-style port dots */}
        <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: T.amber, border: `2px solid ${T.bg}` }} />
        <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: T.amber, border: `2px solid ${T.bg}` }} />
        <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: T.amber, border: `2px solid ${T.bg}` }} />
        <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: T.amber, border: `2px solid ${T.bg}` }} />

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: T.amber, letterSpacing: '0.05em' }}>DB TECH</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Fueled by Caffeine and Chaos</div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          {['Builder', 'Dad of 7', 'Trader'].map(b => (
            <span key={b} style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.15)',
              color: T.amber, fontWeight: 500,
            }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Animated flow lines from center to branches */}
      <div style={{ position: 'relative', height: 60 }}>
        {/* SVG connector lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
          {branches.map((b, i) => {
            const startX = 50;
            const endX = 12.5 + i * 25;
            return (
              <g key={i}>
                <path
                  d={`M ${startX}% 0 C ${startX}% 60%, ${endX}% 40%, ${endX}% 100%`}
                  fill="none" stroke={b.color} strokeWidth="2" strokeOpacity="0.4"
                />
                <path
                  d={`M ${startX}% 0 C ${startX}% 60%, ${endX}% 40%, ${endX}% 100%`}
                  fill="none" stroke={b.color} strokeWidth="2" strokeOpacity="0.8"
                  strokeDasharray="6 8" strokeDashoffset="0"
                >
                  <animate attributeName="stroke-dashoffset" values="0;-14" dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" />
                </path>
              </g>
            );
          })}
        </svg>
        {/* Flowing particles */}
        {branches.map((b, i) => (
          [0, 1].map(p => (
            <div key={`${i}-${p}`} className="n8n-particle" style={{
              background: b.color, boxShadow: `0 0 8px ${b.color}`,
              animation: `particleFlow${i} ${2 + i * 0.3}s ease-in-out ${p * 1.2}s infinite`,
            }} />
          ))
        ))}
      </div>

      {/* Branch Nodes - n8n style cards */}
      <div className="dna-branches">
        {branches.map((b, i) => (
          <div key={i} style={{
            background: T.card, border: `1px solid ${T.border}`, borderTop: `3px solid ${b.color}`,
            borderRadius: 10, padding: 16, position: 'relative',
            animation: `nodeAppear 0.5s ease-out ${0.3 + i * 0.1}s both`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = b.color; e.currentTarget.style.boxShadow = `0 0 15px ${b.color}33`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Input port dot */}
            <div style={{
              position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
              width: 10, height: 10, borderRadius: '50%', background: b.color,
              border: `2px solid ${T.bg}`, boxShadow: `0 0 6px ${b.color}66`,
            }} />
            {/* Output port dot */}
            <div style={{
              position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
              width: 8, height: 8, borderRadius: '50%', background: T.border,
              border: `2px solid ${T.bg}`,
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{b.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: b.color, fontFamily: "'JetBrains Mono', monospace" }}>{b.label}</span>
            </div>
            {b.items.map((item, j) => (
              <div key={j} style={{
                fontSize: 12, color: T.secondary, padding: '5px 0',
                borderBottom: j < b.items.length - 1 ? `1px solid ${T.border}` : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Tag Badge ───────────────── */
function TagBadge({ tag }: { tag: TagType }) {
  const c = tagColor[tag];
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      padding: '2px 10px', borderRadius: 4, background: c.bg, color: c.text,
    }}>{tag}</span>
  );
}

/* ───────────────── Principle Card ───────────────── */
function PrincipleCard({ p, expanded, onToggle }: { p: Principle; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      id={p.id}
      style={{
        background: T.card, borderRadius: 8, overflow: 'hidden',
        border: `1px solid ${expanded ? T.amber : T.border}`,
        borderLeft: expanded ? `3px solid ${T.amber}` : `1px solid ${T.border}`,
        transition: 'border-color 0.25s ease',
      }}
      onMouseEnter={e => { if (!expanded) (e.currentTarget.style.borderColor = T.amber); }}
      onMouseLeave={e => { if (!expanded) (e.currentTarget.style.borderColor = T.border); }}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', color: T.text,
        }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: T.amber,
        }}>{String(p.number).padStart(2, '0')}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Inter', sans-serif" }}>{p.title}</span>
        <TagBadge tag={p.tag} />
        <span style={{ fontSize: 14, color: T.muted, flexShrink: 0, marginLeft: 4 }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* One-line quote always shown under collapsed header */}
      {!expanded && (
        <div style={{
          padding: '0 16px 12px 56px', fontSize: 12, color: T.secondary, lineHeight: 1.4,
          fontStyle: 'italic',
        }}>{p.quote}</div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 20px 16px' }}>
          {/* Quote */}
          <div style={{
            padding: '12px 16px', margin: '0 0 16px', background: T.elevated, borderRadius: 6,
            borderLeft: `3px solid ${T.amber}`, fontSize: 13, color: T.text, fontStyle: 'italic', lineHeight: 1.5,
          }}>
            &ldquo;{p.quote}&rdquo;
          </div>

          {/* Details */}
          <p style={{ fontSize: 12, color: T.secondary, lineHeight: 1.6, margin: '0 0 16px' }}>{p.details}</p>

          {/* Implementation */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>IMPLEMENTATION</div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'none' }}>
              {p.implementation.map((item, i) => (
                <li key={i} style={{ fontSize: 12, color: T.secondary, lineHeight: 1.6, marginBottom: 4, position: 'relative', paddingLeft: 12 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.amber }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>EXAMPLES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.examples.map((ex, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 4,
                  background: T.elevated, color: T.secondary, border: `1px solid ${T.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{ex}</span>
              ))}
            </div>
          </div>

          {/* Success Metrics */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>SUCCESS METRICS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.metrics.map((m, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 4,
                  background: 'rgba(34,197,94,0.1)', color: '#EF4444', border: '1px solid rgba(34,197,94,0.2)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */
export default function DNA() {
  const [expandedPrinciples, setExpandedPrinciples] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Handle deep links on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setExpandedPrinciples(prev => ({ ...prev, [hash]: true }));
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  const togglePrinciple = (id: string) => setExpandedPrinciples(p => ({ ...p, [id]: !p[id] }));
  const toggleCategory = (name: string) => setCollapsedCategories(p => ({ ...p, [name]: !p[name] }));

  const allPrincipleIds = CATEGORIES.flatMap(c => c.principles.map(p => p.id));
  const allExpanded = allPrincipleIds.every(id => expandedPrinciples[id]);

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    allPrincipleIds.forEach(id => (map[id] = true));
    setExpandedPrinciples(map);
    setCollapsedCategories({});
  };
  const collapseAll = () => {
    setExpandedPrinciples({});
  };

  return (
    <OpsGuard>
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: T.amber, margin: '0 0 6px' }}>DNA</h1>
          <p style={{ color: T.secondary, margin: 0, fontSize: 14 }}>Core principles · Decision filters · Operating system · {allPrincipleIds.length} principles</p>
        </div>

        {/* Workflow Visualization */}
        <WorkflowVisualization />

        {/* Expand / Collapse All */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <button
            onClick={expandAll}
            disabled={allExpanded}
            style={{
              padding: '8px 20px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace", cursor: allExpanded ? 'default' : 'pointer',
              border: `1px solid ${T.border}`, color: allExpanded ? T.muted : T.amber,
              background: allExpanded ? T.elevated : 'rgba(245,158,11,0.1)',
              transition: 'all 0.2s',
            }}
          >Expand All</button>
          <button
            onClick={collapseAll}
            style={{
              padding: '8px 20px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
              border: `1px solid ${T.border}`, color: T.secondary, background: T.elevated,
              transition: 'all 0.2s',
            }}
          >Collapse All</button>
        </div>

        {/* Category Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CATEGORIES.map(cat => {
            const isCollapsed = !!collapsedCategories[cat.name];
            return (
              <div key={cat.name}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.name)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: isCollapsed ? 8 : '8px 8px 0 0', cursor: 'pointer', color: T.text,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = cat.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: cat.color,
                  }}>{cat.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: cat.color }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>
                    {cat.principles.length} principles
                  </span>
                  <span style={{ fontSize: 14, color: T.muted }}>{isCollapsed ? '▼' : '▲'}</span>
                </button>

                {/* Principle cards */}
                {!isCollapsed && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 8,
                    padding: 12, background: T.elevated, borderRadius: '0 0 8px 8px',
                    border: `1px solid ${T.border}`, borderTop: 'none',
                  }}>
                    {cat.principles.map(p => (
                      <PrincipleCard
                        key={p.id}
                        p={p}
                        expanded={!!expandedPrinciples[p.id]}
                        onToggle={() => togglePrinciple(p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Core Philosophy */}
        <div style={{ marginTop: 48 }}>
          <div style={{
            background: T.card, borderRadius: 8, padding: 24, border: `1px solid ${T.border}`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16, marginTop: 0 }}>Core Philosophy</h3>
            <div style={{ fontSize: 13, color: T.secondary, lineHeight: 1.6, marginBottom: 16 }}>
              DB Tech operates on the principle that <strong style={{ color: T.amber }}>systems compound, people scale, and quality endures</strong>.
              We build for the long term while shipping fast, maintain high standards while embracing imperfection,
              and prioritize sustainable growth over quick wins.
            </div>
            <div style={{ fontSize: 13, color: T.secondary, lineHeight: 1.6, marginBottom: 16 }}>
              Every decision is viewed through the lens of <strong style={{ color: '#3B82F6' }}>leverage and durability</strong>.
              We ask: &ldquo;Will this still matter in 5 years?&rdquo; and &ldquo;Does this make the next decision easier?&rdquo;
              This framework guides everything from technical architecture to business strategy.
            </div>
            <div style={{ fontSize: 13, color: T.secondary, lineHeight: 1.6 }}>
              The goal is not just to build successful products, but to create
              <strong style={{ color: '#EF4444' }}> sustainable systems that can adapt and evolve</strong> while maintaining
              their core identity. This DNA document serves as both compass and constraint —
              guiding decisions while preventing drift from fundamental principles.
            </div>
          </div>

          <div style={{
            marginTop: 16, padding: 20, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.card} 0%, rgba(245,158,11,0.05) 100%)`,
            border: `1px solid rgba(245,158,11,0.3)`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 24 }}>⚠️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.amber, marginBottom: 4 }}>Living Document</div>
              <div style={{ fontSize: 12, color: T.secondary, lineHeight: 1.4 }}>
                This DNA evolves as we learn. Regular reviews ensure principles stay relevant while maintaining core identity.
                Last updated: February 2026. Next review: Quarterly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </OpsGuard>
  );
}