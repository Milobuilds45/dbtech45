// DNA Scanner v2 — helpers, data structures, scoring, PDF generation

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

export interface CheckboxOption {
  id: string;
  label: string;
}

export interface LayerQuestion {
  id: string;
  question: string;
  description: string;
  checkboxes: CheckboxOption[];
}

export interface LayerDef {
  id: number;
  name: string;
  shortName: string;
  iconName: string;
  questions: LayerQuestion[];
}

export type Answers = Record<string, number>;
export type CheckboxSelections = Record<string, Record<string, boolean>>;

export interface BusinessContext {
  description?: string;
  referenceUrl?: string;
  type?: string;
  stage?: string;
  teamSize?: string;
  goal?: string;
}

export const BUSINESS_TYPES = [
  'SaaS', 'E-commerce', 'Restaurant', 'Service',
  'Marketplace', 'Content/Media', 'Hardware', 'Other',
] as const;

export const BUSINESS_STAGES = [
  'Idea', 'Pre-revenue', 'Early Revenue', 'Growing', 'Scaling', 'Mature',
] as const;

export const TEAM_SIZES = [
  'Solo', '2-5', '6-20', '21-50', '50+',
] as const;

export const PRIMARY_GOALS = [
  'Find PMF', 'Get First Customers', 'Scale Revenue',
  'Reduce Churn', 'Raise Funding', 'Exit/Sell',
] as const;

/* ═══════════════════════════════════════════════════════
   Layer Definitions — 7 layers x 4 questions each
   with checkbox self-assessment options
   ═══════════════════════════════════════════════════════ */

export const LAYERS: LayerDef[] = [
  {
    id: 1,
    name: 'Problem/Solution Fit',
    shortName: 'Problem',
    iconName: 'Target',
    questions: [
      {
        id: 'l1q1',
        question: 'How clearly defined is the specific problem your business solves?',
        description: 'A well-defined problem is the foundation of every successful business.',
        checkboxes: [
          { id: 'l1q1_a', label: 'I can describe the problem in one sentence' },
          { id: 'l1q1_b', label: 'I\'ve interviewed 10+ potential customers about this problem' },
          { id: 'l1q1_c', label: 'I have data showing the cost/impact of this problem' },
          { id: 'l1q1_d', label: 'Customers have told me this is a top-3 pain point' },
        ],
      },
      {
        id: 'l1q2',
        question: 'How urgent is this problem for your target customers?',
        description: 'Urgency determines willingness to pay and speed of adoption.',
        checkboxes: [
          { id: 'l1q2_a', label: 'Customers are actively searching for solutions right now' },
          { id: 'l1q2_b', label: 'The problem costs them money or time every week' },
          { id: 'l1q2_c', label: 'They have budget allocated to solve this' },
          { id: 'l1q2_d', label: 'They\'ve tried other solutions and are still unsatisfied' },
        ],
      },
      {
        id: 'l1q3',
        question: 'How significant is the cost of NOT solving this problem?',
        description: 'Higher cost of inaction = stronger business case.',
        checkboxes: [
          { id: 'l1q3_a', label: 'I can quantify the dollar cost of the problem' },
          { id: 'l1q3_b', label: 'The problem gets worse over time if unsolved' },
          { id: 'l1q3_c', label: 'There are regulatory or compliance consequences' },
        ],
      },
      {
        id: 'l1q4',
        question: 'How well do you understand current alternatives customers use?',
        description: 'Knowing the competitive landscape reveals your opportunity.',
        checkboxes: [
          { id: 'l1q4_a', label: 'I\'ve personally used 3+ competitor products' },
          { id: 'l1q4_b', label: 'I know why customers leave competitors' },
          { id: 'l1q4_c', label: 'I can articulate my differentiation clearly' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Market Opportunity',
    shortName: 'Market',
    iconName: 'TrendingUp',
    questions: [
      {
        id: 'l2q1',
        question: 'How large is your total addressable market?',
        description: 'Market size determines your growth ceiling.',
        checkboxes: [
          { id: 'l2q1_a', label: 'I have a researched TAM/SAM/SOM breakdown' },
          { id: 'l2q1_b', label: 'My SAM is at least $100M annually' },
          { id: 'l2q1_c', label: 'I\'ve validated market size with third-party data' },
        ],
      },
      {
        id: 'l2q2',
        question: 'How fast is your target market growing?',
        description: 'Growing markets lift all boats.',
        checkboxes: [
          { id: 'l2q2_a', label: 'My market is growing 10%+ year over year' },
          { id: 'l2q2_b', label: 'New customer segments are emerging' },
          { id: 'l2q2_c', label: 'Industry analysts project continued growth' },
          { id: 'l2q2_d', label: 'Regulatory or tech tailwinds are accelerating the market' },
        ],
      },
      {
        id: 'l2q3',
        question: 'How well do you understand your competitive landscape?',
        description: 'Know thy enemy and thy opportunity.',
        checkboxes: [
          { id: 'l2q3_a', label: 'I track at least 5 direct competitors regularly' },
          { id: 'l2q3_b', label: 'I know their pricing, features, and positioning' },
          { id: 'l2q3_c', label: 'I\'ve mapped indirect competitors and substitutes' },
        ],
      },
      {
        id: 'l2q4',
        question: 'How strong is your competitive advantage or moat?',
        description: 'A defensible position separates businesses from hobbies.',
        checkboxes: [
          { id: 'l2q4_a', label: 'I have network effects, proprietary data, or patents' },
          { id: 'l2q4_b', label: 'Switching costs make it hard for customers to leave' },
          { id: 'l2q4_c', label: 'I have brand recognition in my niche' },
          { id: 'l2q4_d', label: 'My moat gets stronger as I grow' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Business Model',
    shortName: 'Model',
    iconName: 'DollarSign',
    questions: [
      {
        id: 'l3q1',
        question: 'How clear and proven is your revenue model?',
        description: 'How you make money should be crystal clear.',
        checkboxes: [
          { id: 'l3q1_a', label: 'I have paying customers right now' },
          { id: 'l3q1_b', label: 'My pricing has been tested and optimized' },
          { id: 'l3q1_c', label: 'I have multiple revenue streams identified' },
          { id: 'l3q1_d', label: 'Revenue is recurring or predictable' },
        ],
      },
      {
        id: 'l3q2',
        question: 'How healthy are your unit economics?',
        description: 'Every sale should be profitable at the unit level.',
        checkboxes: [
          { id: 'l3q2_a', label: 'I know my gross margin per sale' },
          { id: 'l3q2_b', label: 'My margins are above industry average' },
          { id: 'l3q2_c', label: 'Each additional sale is profitable after variable costs' },
        ],
      },
      {
        id: 'l3q3',
        question: 'How well do you know your customer acquisition cost (CAC)?',
        description: 'If you don\'t know CAC, you\'re flying blind.',
        checkboxes: [
          { id: 'l3q3_a', label: 'I track CAC by channel monthly' },
          { id: 'l3q3_b', label: 'My CAC has been decreasing over time' },
          { id: 'l3q3_c', label: 'I know my blended CAC across all channels' },
        ],
      },
      {
        id: 'l3q4',
        question: 'How strong is your customer lifetime value (LTV)?',
        description: 'LTV > CAC is the formula for sustainable growth.',
        checkboxes: [
          { id: 'l3q4_a', label: 'My LTV:CAC ratio is 3:1 or better' },
          { id: 'l3q4_b', label: 'I have upsell/cross-sell strategies in place' },
          { id: 'l3q4_c', label: 'My average customer stays 12+ months' },
          { id: 'l3q4_d', label: 'Retention rate is above 80%' },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Go-to-Market Strategy',
    shortName: 'GTM',
    iconName: 'Megaphone',
    questions: [
      {
        id: 'l4q1',
        question: 'How clearly defined are your customer acquisition channels?',
        description: 'Know exactly where your customers are and how to reach them.',
        checkboxes: [
          { id: 'l4q1_a', label: 'I have 1-2 channels that reliably bring customers' },
          { id: 'l4q1_b', label: 'I know my conversion rates at each funnel stage' },
          { id: 'l4q1_c', label: 'I\'ve tested at least 3 different channels' },
        ],
      },
      {
        id: 'l4q2',
        question: 'How effective is your current marketing strategy?',
        description: 'Marketing should generate predictable, measurable results.',
        checkboxes: [
          { id: 'l4q2_a', label: 'I track marketing ROI for every campaign' },
          { id: 'l4q2_b', label: 'My content/ads generate qualified leads consistently' },
          { id: 'l4q2_c', label: 'I have a documented marketing playbook' },
          { id: 'l4q2_d', label: 'Organic traffic or referrals are a significant source' },
        ],
      },
      {
        id: 'l4q3',
        question: 'How diversified are your distribution channels?',
        description: 'Multiple channels reduce risk and increase reach.',
        checkboxes: [
          { id: 'l4q3_a', label: 'No single channel accounts for more than 50% of revenue' },
          { id: 'l4q3_b', label: 'I have both paid and organic channels working' },
          { id: 'l4q3_c', label: 'I\'ve built partnerships or affiliate relationships' },
        ],
      },
      {
        id: 'l4q4',
        question: 'How scalable is your customer acquisition process?',
        description: 'Can you 10x without breaking?',
        checkboxes: [
          { id: 'l4q4_a', label: 'Increasing ad spend proportionally increases customers' },
          { id: 'l4q4_b', label: 'My sales process doesn\'t rely solely on the founder' },
          { id: 'l4q4_c', label: 'I have automation for lead nurturing and follow-up' },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Operations & Execution',
    shortName: 'Ops',
    iconName: 'Settings',
    questions: [
      {
        id: 'l5q1',
        question: 'How well-documented are your key operational processes?',
        description: 'Systems > hustle. Document everything.',
        checkboxes: [
          { id: 'l5q1_a', label: 'Core workflows are documented and repeatable' },
          { id: 'l5q1_b', label: 'A new hire could follow the docs to do key tasks' },
          { id: 'l5q1_c', label: 'I review and update processes quarterly' },
        ],
      },
      {
        id: 'l5q2',
        question: 'How capable is your current team for the next growth phase?',
        description: 'The team that got you here may not get you there.',
        checkboxes: [
          { id: 'l5q2_a', label: 'Key roles are filled with competent people' },
          { id: 'l5q2_b', label: 'I have a hiring plan for the next 6-12 months' },
          { id: 'l5q2_c', label: 'Team members have clear roles and accountability' },
          { id: 'l5q2_d', label: 'I invest in training and team development' },
        ],
      },
      {
        id: 'l5q3',
        question: 'How robust are your systems, tools, and technology stack?',
        description: 'The right tools multiply your team\'s output.',
        checkboxes: [
          { id: 'l5q3_a', label: 'My tech stack can handle 10x current load' },
          { id: 'l5q3_b', label: 'Key tools are integrated, not siloed' },
          { id: 'l5q3_c', label: 'I have monitoring and alerting in place' },
        ],
      },
      {
        id: 'l5q4',
        question: 'How clearly defined are your success metrics and KPIs?',
        description: 'What gets measured gets managed.',
        checkboxes: [
          { id: 'l5q4_a', label: 'I have a dashboard with my top 5 KPIs' },
          { id: 'l5q4_b', label: 'The team reviews metrics weekly' },
          { id: 'l5q4_c', label: 'Every team member knows their individual targets' },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Financial Health',
    shortName: 'Finance',
    iconName: 'BarChart3',
    questions: [
      {
        id: 'l6q1',
        question: 'How realistic and data-driven are your revenue projections?',
        description: 'Hope is not a strategy. Use real numbers.',
        checkboxes: [
          { id: 'l6q1_a', label: 'Projections are based on historical data and trends' },
          { id: 'l6q1_b', label: 'I model best-case, base-case, and worst-case scenarios' },
          { id: 'l6q1_c', label: 'I update projections monthly with actuals' },
        ],
      },
      {
        id: 'l6q2',
        question: 'How well do you understand your funding requirements?',
        description: 'Know exactly what you need and when you need it.',
        checkboxes: [
          { id: 'l6q2_a', label: 'I know my exact monthly burn rate' },
          { id: 'l6q2_b', label: 'I know how many months of runway I have' },
          { id: 'l6q2_c', label: 'I have a plan for next round of capital (or profitability)' },
          { id: 'l6q2_d', label: 'I understand dilution implications of raising' },
        ],
      },
      {
        id: 'l6q3',
        question: 'How clear is your path to profitability?',
        description: 'Every dollar should have a plan.',
        checkboxes: [
          { id: 'l6q3_a', label: 'I can calculate my break-even point' },
          { id: 'l6q3_b', label: 'I have a timeline to reach profitability' },
          { id: 'l6q3_c', label: 'I\'ve identified the key levers to pull' },
        ],
      },
      {
        id: 'l6q4',
        question: 'How well do you track your key financial metrics?',
        description: 'Cash flow, margins, burn rate. Know your numbers.',
        checkboxes: [
          { id: 'l6q4_a', label: 'I review P&L and cash flow statements monthly' },
          { id: 'l6q4_b', label: 'I have accounting software set up properly' },
          { id: 'l6q4_c', label: 'I understand my tax obligations and plan for them' },
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Risk Management',
    shortName: 'Risk',
    iconName: 'Shield',
    questions: [
      {
        id: 'l7q1',
        question: 'How well have you identified your biggest business risks?',
        description: 'You can\'t manage what you haven\'t identified.',
        checkboxes: [
          { id: 'l7q1_a', label: 'I\'ve documented my top 5 business risks' },
          { id: 'l7q1_b', label: 'I\'ve assessed probability and impact of each risk' },
          { id: 'l7q1_c', label: 'I revisit the risk register quarterly' },
        ],
      },
      {
        id: 'l7q2',
        question: 'How strong are your risk mitigation strategies?',
        description: 'Plans are useless. Planning is everything.',
        checkboxes: [
          { id: 'l7q2_a', label: 'Each key risk has a documented mitigation plan' },
          { id: 'l7q2_b', label: 'I have insurance coverage for major liabilities' },
          { id: 'l7q2_c', label: 'My contracts protect against key vendor/partner risks' },
        ],
      },
      {
        id: 'l7q3',
        question: 'How prepared is your contingency planning?',
        description: 'When Plan A fails, Plan B should be ready.',
        checkboxes: [
          { id: 'l7q3_a', label: 'I have a business continuity plan' },
          { id: 'l7q3_b', label: 'Critical data is backed up and recoverable' },
          { id: 'l7q3_c', label: 'I can operate if a key team member leaves' },
          { id: 'l7q3_d', label: 'I\'ve stress-tested my plan with real scenarios' },
        ],
      },
      {
        id: 'l7q4',
        question: 'How adaptable is your business to market changes?',
        description: 'Adapt or die. The market doesn\'t wait.',
        checkboxes: [
          { id: 'l7q4_a', label: 'I can pivot my offering within 30 days' },
          { id: 'l7q4_b', label: 'My cost structure is mostly variable, not fixed' },
          { id: 'l7q4_c', label: 'I monitor market trends and act on signals early' },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   Scoring Functions
   ═══════════════════════════════════════════════════════ */

/** Calculate a suggested score from checkboxes: maps ratio of checked to a 1-10 range */
export function scoreFromCheckboxes(questionId: string, checks: CheckboxSelections): number {
  const qChecks = checks[questionId];
  if (!qChecks) return 0;
  const layer = LAYERS.find(l => l.questions.some(q => q.id === questionId));
  if (!layer) return 0;
  const question = layer.questions.find(q => q.id === questionId);
  if (!question) return 0;
  const total = question.checkboxes.length;
  if (total === 0) return 0;
  const checked = Object.values(qChecks).filter(Boolean).length;
  if (checked === 0) return 2;
  // Map: 1 checked=4, 2=6, 3=8, all=10 (roughly)
  const score = Math.round(2 + (checked / total) * 8);
  return Math.min(10, Math.max(1, score));
}

export function layerScore(id: number, a: Answers): number {
  const l = LAYERS.find(x => x.id === id)!;
  const v = l.questions.map(q => a[q.id] || 0).filter(x => x > 0);
  return v.length ? Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 10) / 10 : 0;
}

export function layerDone(id: number, a: Answers): boolean {
  return LAYERS.find(x => x.id === id)!.questions.every(q => (a[q.id] || 0) > 0);
}

export function overallScore(a: Answers): number {
  const s = LAYERS.map(l => layerScore(l.id, a)).filter(x => x > 0);
  return s.length ? Math.round((s.reduce((t, x) => t + x, 0) / s.length) * 10) / 10 : 0;
}

export function overallPct(a: Answers): number {
  return Math.round((overallScore(a) / 10) * 100);
}

export function scoreColor(s: number): string {
  return s < 4 ? '#22C55E' : s <= 6 ? '#EAB308' : '#10B981';
}

export function scoreLabel(s: number): string {
  return s < 4 ? 'Needs Work' : s <= 6 ? 'Developing' : s <= 8 ? 'Strong' : 'Excellent';
}

/** Descriptive overall label */
export function overallLabel(pct: number): string {
  if (pct < 30) return 'Critical Foundation Gaps';
  if (pct < 45) return 'Promising but Fragile';
  if (pct < 60) return 'Developing Foundation';
  if (pct < 75) return 'Strong Foundation';
  if (pct < 90) return 'Ready to Scale';
  return 'Elite Execution';
}

/* ═══════════════════════════════════════════════════════
   Recommendations per layer
   ═══════════════════════════════════════════════════════ */

export function layerRec(id: number, s: number): string {
  const m: Record<number, [string, string, string]> = {
    1: [
      'Conduct 20+ customer interviews this month. Validate the pain point and quantify its cost before investing further.',
      'Good foundation. Dig deeper into customer urgency and map the full journey around this problem.',
      'Strong problem/solution fit. Keep validating as you scale and watch for market shifts.',
    ],
    2: [
      'Size your TAM/SAM/SOM with real data. Identify growth trends and deeply analyze 3-5 competitors this quarter.',
      'You have a sense of the market but need harder data. Commission research or build your own data moat.',
      'Excellent market understanding. Focus on defending and expanding your competitive advantage.',
    ],
    3: [
      'Get crystal clear on revenue streams, pricing, and unit economics. Validate with 10 paying customers before scaling.',
      'Business model is taking shape. Focus on improving unit economics: reduce CAC, increase LTV.',
      'Solid business model. Optimize for efficiency and explore adjacent revenue streams.',
    ],
    4: [
      'Start with ONE channel, prove it works with data, then expand. Document every experiment and its results.',
      'GTM is functional but not yet scalable. Invest in automation and begin testing new channels systematically.',
      'Strong GTM engine. Focus on scale, efficiency, and building brand moats.',
    ],
    5: [
      'Document your top 5 core processes this week. Invest in team development and implement a tracking dashboard.',
      'Good operational foundation. Systemize for the next growth phase and fill critical team gaps.',
      'Operations running well. Focus on optimization and building a culture of continuous improvement.',
    ],
    6: [
      'Build a proper financial model this month. Track key metrics weekly. Know your runway to the day.',
      'Financial awareness is growing. Sharpen projections with real data and build scenario planning.',
      'Strong financial discipline. Continue optimizing and prepare for scale-up capital needs.',
    ],
    7: [
      'Conduct a formal risk assessment. Document your top 5 risks and build contingency plans for each one.',
      'You\'re aware of risks but need stronger mitigation. Build adaptability into your business model.',
      'Solid risk management. Continue stress-testing and building organizational resilience.',
    ],
  };
  const i = s < 4 ? 0 : s <= 6 ? 1 : 2;
  return m[id]?.[i] || '';
}

/** Get action-oriented recommendation for a specific layer */
export function layerAction(id: number, s: number): string {
  const actions: Record<number, [string, string, string]> = {
    1: [
      'Schedule 5 customer discovery calls this week',
      'Quantify the dollar cost of the problem for 3 customer segments',
      'Build a competitive comparison matrix to sharpen positioning',
    ],
    2: [
      'Research and document TAM/SAM/SOM with 3 data sources',
      'Create a competitor tracking dashboard and update it monthly',
      'Identify and test 2 adjacent market segments',
    ],
    3: [
      'Run a pricing experiment with your next 10 customers',
      'Calculate and track CAC by channel for the next 30 days',
      'Implement an upsell flow to increase LTV by 20%',
    ],
    4: [
      'Pick your #1 channel and invest 80% of marketing budget there',
      'Build and document a repeatable sales playbook',
      'Launch a referral program to diversify acquisition',
    ],
    5: [
      'Document your top 3 workflows in a shared wiki this week',
      'Define and assign KPIs to every team member',
      'Audit your tool stack and eliminate redundancies',
    ],
    6: [
      'Build a 12-month financial model with 3 scenarios',
      'Set up weekly financial review meetings',
      'Identify and optimize your top 3 cost centers',
    ],
    7: [
      'Write down your top 5 risks and a mitigation plan for each',
      'Stress-test your business plan against 2 worst-case scenarios',
      'Build a 90-day contingency reserve fund',
    ],
  };
  const i = s < 4 ? 0 : s <= 6 ? 1 : 2;
  return actions[id]?.[i] || '';
}

/* ═══════════════════════════════════════════════════════
   Strong/Weak points from checkboxes
   ═══════════════════════════════════════════════════════ */

export interface StrengthWeakness {
  strong: string[];
  weak: string[];
}

export function getLayerStrengthsWeaknesses(
  layerId: number,
  checks: CheckboxSelections,
): StrengthWeakness {
  const layer = LAYERS.find(l => l.id === layerId);
  if (!layer) return { strong: [], weak: [] };
  const strong: string[] = [];
  const weak: string[] = [];
  for (const q of layer.questions) {
    const qChecks = checks[q.id] || {};
    for (const cb of q.checkboxes) {
      if (qChecks[cb.id]) {
        strong.push(cb.label);
      } else {
        weak.push(cb.label);
      }
    }
  }
  return { strong, weak };
}

/* ═══════════════════════════════════════════════════════
   Priority Actions — top 3 by lowest score
   ═══════════════════════════════════════════════════════ */

export interface PriorityAction {
  layerName: string;
  score: number;
  action: string;
}

export function getPriorityActions(a: Answers): PriorityAction[] {
  return LAYERS
    .map(l => ({
      layerName: l.name,
      score: layerScore(l.id, a),
      action: layerAction(l.id, layerScore(l.id, a)),
    }))
    .sort((x, y) => x.score - y.score)
    .slice(0, 3);
}

/* ═══════════════════════════════════════════════════════
   PDF Generation
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   Intelligence Feed — V3 Auditor Logic
   ═══════════════════════════════════════════════════════ */

const LAYER_NAMES: Record<number, string> = {
  1: 'Problem/Solution Fit',
  2: 'Market Opportunity',
  3: 'Business Model',
  4: 'Go-to-Market Strategy',
  5: 'Operations & Execution',
  6: 'Financial Health',
  7: 'Risk Management',
};

/** Market Pulse: one-line reality check per layer based on score */
export function getMarketPulseNote(layerId: number, score: number): string {
  const notes: Record<number, [string, string, string]> = {
    1: [
      '72% of startups fail because they build something nobody wants.',
      'You see the problem — but have you quantified the urgency from the buyer\'s side?',
      'Strong conviction. The real test: would customers pay 2x your price?',
    ],
    2: [
      'Without validated market data, you\'re guessing your ceiling.',
      'Market awareness is developing. Most founders overestimate their SAM by 5-10x.',
      'Deep market knowledge is rare. But markets shift — stay paranoid.',
    ],
    3: [
      'Revenue clarity is survival. 60% of failed startups had unclear monetization.',
      'Model is forming. Watch your LTV:CAC — it lies to optimists.',
      'Solid economics on paper. Stress-test: what breaks at 10x volume?',
    ],
    4: [
      'No channels = no business. You need at least one repeatable acquisition path.',
      'Channels exist but aren\'t predictable yet. That\'s normal — but track religiously.',
      'Strong GTM. Most companies plateau here — don\'t coast.',
    ],
    5: [
      'Chaos is not a growth strategy. Even lean teams need documented playbooks.',
      'Operational basics in place. The next hire will expose every undocumented process.',
      'Clean operations are a moat most founders ignore. You\'re ahead.',
    ],
    6: [
      'If you don\'t know your runway to the day, you\'re already in danger.',
      'Financial awareness growing. Common trap: confusing revenue with profit.',
      'Financial discipline this early is exceptional. Don\'t let growth spending erode it.',
    ],
    7: [
      'Hope is not a risk strategy. Identify your single-point-of-failure today.',
      'Some risk awareness. Ask: what\'s the one thing that kills us in 90 days?',
      'Resilient thinking. Keep stress-testing — the risks you can\'t see are the dangerous ones.',
    ],
  };
  const i = score < 4 ? 0 : score <= 6 ? 1 : 2;
  return notes[layerId]?.[i] || '';
}

/** Strategic Auditor: context-aware commentary based on stage and team size */
export function getStrategicAudit(layerId: number, score: number, stage: string, teamSize: string): string {
  const layerName = LAYER_NAMES[layerId] || `Layer ${layerId}`;
  const isSolo = teamSize === 'Solo' || teamSize === '2-5';
  const isEarly = stage === 'Idea' || stage === 'Pre-revenue';
  const isGrowing = stage === 'Growing' || stage === 'Scaling';

  // Low scores (1-3): encouraging context
  if (score <= 3) {
    if (isEarly) {
      return `A ${score}/10 in ${layerName} is expected at ${stage} stage. Focus on validating one thing at a time — this improves fast with deliberate effort.`;
    }
    if (isSolo) {
      return `${score}/10 as a ${teamSize} team is a red flag in ${layerName}. Consider outsourcing or automating your weakest link here before it compounds.`;
    }
    return `${score}/10 in ${layerName} at ${stage} stage needs immediate attention. This is likely costing you more than you realize.`;
  }

  // Medium scores (4-6): actionable nudges
  if (score <= 6) {
    if (isEarly) {
      return `${score}/10 — decent for ${stage}. The gap between a 5 and an 8 in ${layerName} is usually one focused sprint and a better framework.`;
    }
    if (isGrowing) {
      return `${score}/10 at ${stage} stage means ${layerName} is becoming a bottleneck. What got you here won't get you to the next level.`;
    }
    return `${score}/10 in ${layerName}. Solid but not defensible. One targeted improvement this quarter moves the needle significantly.`;
  }

  // High scores (7-10): tough love
  if (score >= 9) {
    return `${score}/10 is elite-level confidence. Verify this isn't optimism bias — have an outsider audit your ${layerName.toLowerCase()} assumptions.`;
  }
  return `${score}/10 is strong. The question isn't where you are — it's whether this holds under 3x growth pressure.`;
}

/** Tough Questions for high scorers (8+) */
export function getToughQuestion(layerId: number, score: number): string {
  if (score < 8) return '';
  const questions: Record<number, string[]> = {
    1: [
      'If your problem is so clear, why haven\'t incumbents solved it already?',
      'What happens to your thesis if the problem severity drops 50% next year?',
    ],
    2: [
      'If the market is this good, where are the 20 other startups racing you?',
      'How do you defend against a clone with 10x your budget entering tomorrow?',
    ],
    3: [
      'Your unit economics look great — but do they hold with paid acquisition at scale?',
      'What happens to your model if your biggest customer churns next month?',
    ],
    4: [
      'If your GTM is this strong, why aren\'t you growing 3x faster?',
      'What\'s your plan when your primary channel costs double in 12 months?',
    ],
    5: [
      'If ops are this solid, could you onboard 5 new hires next week without chaos?',
      'What\'s the single process that, if it breaks, takes down everything?',
    ],
    6: [
      'Your financials look strong on paper. When was the last time you stress-tested a 40% revenue drop?',
      'Are you tracking leading indicators or just lagging ones?',
    ],
    7: [
      'If your risk management is elite, what\'s your blind spot? Everyone has one.',
      'Could your business survive losing its #1 customer and #1 employee in the same week?',
    ],
  };
  const opts = questions[layerId] || ['What makes you confident this score is accurate?'];
  return opts[score >= 9 ? 0 : 1] || opts[0];
}

/** Bleed Meter: calculates founder inefficiency tax from Ops and Finance gaps */
export function calculateBleedMeter(a: Answers): { monthlyBleed: number; opsGap: number; financeGap: number } {
  const opsScore = layerScore(5, a);
  const finScore = layerScore(6, a);
  const opsGap = Math.max(0, 10 - opsScore);
  const financeGap = Math.max(0, 10 - finScore);
  // 16 hours/month per gap point * $100/hr
  const monthlyBleed = Math.round((opsGap + financeGap) * 16 * 100);
  return { monthlyBleed, opsGap, financeGap };
}

/* ═══════════════════════════════════════════════════════
   PDF Generation
   ═══════════════════════════════════════════════════════ */

export async function generatePDF(
  answers: Answers,
  email: string,
  chartCanvas: HTMLCanvasElement | null,
  ctx?: BusinessContext,
  checks?: CheckboxSelections,
) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  let y = 20;
  const os = overallScore(answers);
  const op = overallPct(answers);

  // Header
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, W, 50, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 50, W, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(245, 158, 11);
  doc.text('BUSINESS DNA REPORT', 20, 25);
  doc.setFontSize(11);
  doc.setTextColor(161, 161, 170);
  doc.text('Generated for: ' + email, 20, 34);
  doc.text(
    'Date: ' +
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    20,
    41,
  );
  y = 62;

  // Business context
  if (ctx && (ctx.description || ctx.type)) {
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    doc.text('Business Profile', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(161, 161, 170);
    if (ctx.description) {
      const descLines = doc.splitTextToSize(ctx.description, W - 40);
      doc.text(descLines, 20, y);
      y += descLines.length * 5 + 4;
    }
    const meta: string[] = [];
    if (ctx.type) meta.push('Type: ' + ctx.type);
    if (ctx.stage) meta.push('Stage: ' + ctx.stage);
    if (ctx.teamSize) meta.push('Team: ' + ctx.teamSize);
    if (ctx.goal) meta.push('Goal: ' + ctx.goal);
    if (meta.length) {
      doc.text(meta.join('  |  '), 20, y);
      y += 8;
    }
    y += 4;
  }

  // Executive summary
  doc.setFontSize(16);
  doc.setTextColor(250, 250, 250);
  doc.text('Executive Summary', 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(161, 161, 170);
  const sum =
    'Your business scored ' +
    os +
    '/10 overall (' +
    op +
    '% — ' +
    overallLabel(op) +
    '). ' +
    (op >= 70
      ? 'Strong fundamentals across most dimensions. Focus on optimizing weaker areas to achieve excellence.'
      : op >= 50
        ? 'Solid foundation with room for growth. Address lower-scoring areas to unlock your next level.'
        : 'Significant opportunities for improvement. Start with your lowest-scoring layers for the biggest impact.');
  const sl = doc.splitTextToSize(sum, W - 40);
  doc.text(sl, 20, y);
  y += sl.length * 6 + 8;

  // Radar chart
  if (chartCanvas) {
    try {
      const img = chartCanvas.toDataURL('image/png');
      doc.addImage(img, 'PNG', (W - 100) / 2, y, 100, 100);
      y += 108;
    } catch {
      y += 5;
    }
  }

  // Layer breakdown
  LAYERS.forEach((layer) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    const sc = layerScore(layer.id, answers);
    const rgb = sc < 4 ? [239, 68, 68] : sc <= 6 ? [234, 179, 8] : [16, 185, 129];
    doc.setFillColor(24, 24, 27);
    doc.roundedRect(15, y - 4, W - 30, 8, 2, 2, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(250, 250, 250);
    doc.text('Layer ' + layer.id + ': ' + layer.name, 20, y + 2);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(sc + '/10 — ' + scoreLabel(sc), W - 20, y + 2, { align: 'right' });
    y += 12;

    // Strengths and weaknesses from checkboxes
    if (checks) {
      const sw = getLayerStrengthsWeaknesses(layer.id, checks);
      doc.setFontSize(9);
      if (sw.strong.length > 0) {
        doc.setTextColor(16, 185, 129);
        const strongText = sw.strong.slice(0, 3).map((s) => '+ ' + s).join('\n');
        const stLines = doc.splitTextToSize(strongText, W - 40);
        doc.text(stLines, 22, y);
        y += stLines.length * 4 + 2;
      }
      if (sw.weak.length > 0) {
        doc.setTextColor(239, 68, 68);
        const weakText = sw.weak.slice(0, 3).map((w) => '- ' + w).join('\n');
        const wkLines = doc.splitTextToSize(weakText, W - 40);
        doc.text(wkLines, 22, y);
        y += wkLines.length * 4 + 2;
      }
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(161, 161, 170);
    const rec = layerRec(layer.id, sc);
    const sr = doc.splitTextToSize(rec, W - 40);
    doc.text(sr, 20, y);
    y += sr.length * 5 + 10;
  });

  // Priority actions
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(245, 158, 11);
  doc.rect(15, y, W - 30, 1, 'F');
  y += 8;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('Priority Actions', 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 161, 170);
  const actions = getPriorityActions(answers);
  actions.forEach((a, i) => {
    const line = (i + 1) + '. ' + a.layerName + ' (' + a.score + '/10): ' + a.action;
    const sp = doc.splitTextToSize(line, W - 40);
    doc.text(sp, 20, y);
    y += sp.length * 5 + 4;
  });

  y += 6;
  const extras = [
    '4. Re-assess: Take this assessment again in 90 days to measure progress',
    op < 50
      ? '5. Consider: Book a strategy consultation for expert guidance'
      : '5. Scale: Your fundamentals are solid — focus on growth acceleration',
  ];
  extras.forEach((st) => {
    const sp = doc.splitTextToSize(st, W - 40);
    doc.text(sp, 20, y);
    y += sp.length * 5 + 4;
  });

  // Footer
  y += 10;
  if (y > 280) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(245, 158, 11);
  doc.rect(15, y, W - 30, 0.5, 'F');
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122);
  doc.text('Business DNA Scanner — dbtech45.com', W / 2, y, { align: 'center' });
  doc.text('© 2025 DB Tech. All rights reserved.', W / 2, y + 5, { align: 'center' });
  doc.save('Business-DNA-Report.pdf');
}