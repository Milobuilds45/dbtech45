/**
 * Backfill historical overnight data to production Supabase via API.
 * Run with: npx tsx scripts/backfill-overnight.ts
 */

const API_URL = 'https://dbtech45.com/api/overnight';

const feb5Data = [
  {
    date: '2026-02-05',
    agent: 'Milo',
    agent_color: '#A855F7',
    type: 'idea',
    title: '5 Ideas to 10X Revenue',
    summary: "Bobby's Edge newsletter ($9.99/mo), SwarmKit guide ($49), MenuIQ tool ($29/mo), Daily 7 newsletter, Ship Week system",
    details: [
      "Bobby's Edge: 1000 subs = $10K MRR",
      'SwarmKit: $49 x 200 = $9.8K',
      'MenuIQ: 350 restaurants = $10K MRR',
      'Daily 7: Sponsorships at 5K subs',
      'Ship Week: Focus system for finishing projects',
    ],
    tags: ['ideas', 'revenue', 'strategy'],
    priority: 'high',
    icon: '✦',
    status: 'success',
    source: 'backfill',
  },
  {
    date: '2026-02-05',
    agent: 'Milo',
    agent_color: '#A855F7',
    type: 'build',
    title: 'TradeScope Daily — Live Landing Page',
    summary: "Built and deployed Bobby's premium market brief as a paid newsletter with Stripe checkout ($9.99/mo or $99/year)",
    details: [
      'Live at tradescope-daily.vercel.app',
      'Stripe checkout integrated',
      "3 sample newsletter issues from Bobby's real analysis",
      'Email capture for free tier',
    ],
    tags: ['build', 'deployed', 'revenue'],
    priority: 'high',
    icon: '▲',
    status: 'success',
    source: 'backfill',
  },
  {
    date: '2026-02-05',
    agent: 'Paula',
    agent_color: '#EC4899',
    type: 'research',
    title: 'SharpEdge Design Spec',
    summary: 'Complete design specification for the SharpEdge project',
    details: ['Full brand spec', 'UI mockups', 'Design system defined'],
    tags: ['design', 'spec'],
    priority: 'medium',
    icon: '◈',
    status: 'success',
    source: 'backfill',
  },
  {
    date: '2026-02-05',
    agent: 'Paula',
    agent_color: '#EC4899',
    type: 'research',
    title: 'PickSix Design Spec',
    summary: 'Complete design specification for the PickSix project',
    details: ['Full brand spec', 'UI mockups', 'Design system defined'],
    tags: ['design', 'spec'],
    priority: 'medium',
    icon: '◈',
    status: 'success',
    source: 'backfill',
  },
];

const feb6Data = [
  {
    date: '2026-02-06',
    agent: 'Bobby',
    agent_color: '#22C55E',
    type: 'analysis',
    title: 'Portfolio Analysis & Risk Assessment',
    summary: 'Comprehensive overnight portfolio analysis with risk models and position sizing recommendations',
    details: [
      'Pre-market futures analysis',
      'Options flow review',
      'Risk model updates',
      'Position sizing recommendations',
    ],
    tags: ['trading', 'analysis', 'portfolio'],
    priority: 'high',
    icon: '◈',
    status: 'success',
    source: 'backfill',
  },
  {
    date: '2026-02-06',
    agent: 'Dax',
    agent_color: '#06B6D4',
    type: 'research',
    title: 'Game-Changers: AI Outbound Sales + Creator Monetization',
    summary: 'Two researched high-leverage strategies: automated B2B outbound sales engine for MenuSparks using Apollo+Clay+Smartlead, and creator monetization playbook',
    details: [
      'Apollo.io for 210M+ contacts at $49/mo',
      'Clay AI for personalized outreach at $149/mo',
      'Smartlead for email sequencing',
      '700K+ US restaurants as target market',
      'All claims source-verified with URLs',
    ],
    tags: ['research', 'sales', 'strategy', 'verified'],
    priority: 'high',
    icon: '⌕',
    status: 'success',
    source: 'backfill',
  },
];

async function backfill() {
  const allItems = [...feb5Data, ...feb6Data];
  console.log(`Backfilling ${allItems.length} items to ${API_URL}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allItems),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Success! Inserted ${result.inserted} items.`);
    } else {
      console.error(`❌ API error:`, result);
    }
  } catch (error) {
    console.error(`❌ Network error:`, error);
  }
}

backfill();
