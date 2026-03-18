export interface BuildStep {
  step: number;
  title: string;
  description: string;
  completed?: boolean;
}

export interface DeepPitch {
  title: string;
  tldr: string;
  tags: string[];
  executiveSummary: string[];
  scores: { opportunity: number; problem: number; feasibility: number; whyNow: number };
  businessFit: { revenuePotential: string; executionDifficulty: number; goToMarket: number; targetFounder: string };
  offerLadder: {
    leadMagnet: { title: string; desc: string };
    frontend: { title: string; desc: string; price: string };
    core: { title: string; desc: string; price: string };
  };
  sections: { whyNow: string; proofAndSignals: string; marketGap: string; executionPlan: string };
  keywords: { term: string; volume: string; growth: string }[];
  categorization: { type: string; market: string; target: string; competitor: string; trendAnalysis: string };
  communitySignals: { platform: string; count: number; text: string }[];
  buildGuide: BuildStep[];
}

const bobbyBuildGuide: BuildStep[] = [
  { step: 1, title: 'DATA PIPELINE — Connect Options Flow Source', description: 'Set up a real-time data feed from CBOE or a third-party options flow provider (e.g., Tradier, Polygon.io). Build an ingestion pipeline that normalizes block trades, sweeps, and unusual volume into a unified schema. Store in a time-series database (TimescaleDB or ClickHouse). This is the foundation — without clean data, nothing works.' },
  { step: 2, title: 'AI PATTERN ENGINE — Train the Flow Classifier', description: 'Build the ML model that distinguishes genuine institutional accumulation from hedging activity and market-maker flow. Train on 6+ months of historical data. Key features: order size vs. open interest ratio, time-of-day patterns, multi-leg detection, and repeat-buyer identification. Start with a gradient-boosted classifier (XGBoost), upgrade to transformer-based model once you have enough labeled data.' },
  { step: 3, title: 'REAL-TIME SCANNER UI — Build the Live Feed', description: 'Create the core product experience: a real-time scrolling feed of unusual options activity with instant filtering by ticker, expiry, sentiment (bullish/bearish), and size. Include a "confidence score" from the AI engine on each print. Use WebSocket connections for sub-second updates. The UI should feel like a Bloomberg terminal but be usable by someone who\'s never seen one.' },
  { step: 4, title: 'ALERT SYSTEM — Push Notifications & Webhooks', description: 'Build the notification layer that delivers high-confidence flow alerts via push notification, email, SMS, and Discord webhook. Users configure their own alert criteria (e.g., "Any single-leg call sweep over $1M on SPY with >80% confidence"). This is the premium upsell — the feed is interesting, but alerts are actionable.' },
  { step: 5, title: 'BACKTESTING MODULE — Prove the Edge', description: 'Build a backtesting dashboard that shows: "If you had followed every 90%+ confidence alert over the last 6 months, here\'s your P&L." This is the killer sales tool. Show real historical performance data. Include win rate, average return, max drawdown, and Sharpe ratio. This data turns skeptics into subscribers.' },
  { step: 6, title: 'FREEMIUM LAUNCH — Ship the Free Tier', description: 'Launch with a 15-minute delayed free feed (no alerts, no AI scores). The free tier is the acquisition funnel. Partner with 5-10 FinTwit influencers for launch day distribution. Set up Stripe for $49/mo and $199/mo tiers. Track conversion from free-to-paid obsessively from day one.' },
  { step: 7, title: 'INSTITUTIONAL TRACKER — Build the Moat', description: 'Add the "whale tracker" feature that identifies and tracks specific institutional players across time. When the same entity makes a large bet, users see their historical track record. This is the feature that creates lock-in — competitors can replicate the feed, but not the historical intelligence database.' },
];

const bobbyPitch: DeepPitch = {
  title: 'FlowHawk: Institutional Options Flow for Retail',
  tldr: 'Real-time options flow tracking with AI pattern recognition for retail traders.',
  tags: ['High LTV', 'Data Moat', 'Institutional Grade'],
  executiveSummary: [
    `I ran the numbers. The risk/reward here is asymmetric in our favor. Retail traders miss 80% of opportunities due to lack of institutional-grade data. They are trading blind while hedge funds are moving markets.`,
    `FlowHawk isn't just a scanner. It's an AI model trained on historical block trades to identify accumulation and distribution patterns before they hit the lit market. When a fund drops $5M on Tesla calls, our users don't just see the print — they see the historical win rate of that specific institutional player.`,
    `This is an asymmetric bet. Limited downside — we're talking days of build time. Unlimited upside if we nail the positioning. The free tier IS the marketing. Every free user is a walking billboard.`
  ],
  scores: { opportunity: 10, problem: 9, feasibility: 5, whyNow: 8 },
  businessFit: { revenuePotential: '$1M-$5M ARR', executionDifficulty: 8, goToMarket: 9, targetFounder: 'Requires deep financial data infrastructure knowledge' },
  offerLadder: {
    leadMagnet: { title: 'Daily Market Prep Email', desc: 'Top 3 unusual options flow prints from yesterday.' },
    frontend: { title: 'Live Flow Feed', desc: 'Real-time options tape with basic filters.', price: '$49/month' },
    core: { title: 'AI Flow Alerts & Backtesting', desc: 'Institutional tracking, pattern alerts, API access.', price: '$199/month' }
  },
  sections: {
    whyNow: `Retail options trading volume has surpassed stock volume. Traders are getting sophisticated but their tools haven't kept up. The gap between professional Bloomberg terminals and retail brokerages is massive.`,
    proofAndSignals: `Look at the explosion of paid Discord groups selling options alerts. People are paying $100/mo for a guy typing trades in a chat. They will happily pay $199 for actual data.`,
    marketGap: `Current retail tools like Unusual Whales are too noisy. FlowHawk uses AI to filter out the hedges and isolate the true directional bets.`,
    executionPlan: `Freemium with a hook. Give away the raw feed delayed by 15 minutes. Upsell the premium tier to the power users who need it real-time. Partner with FinTwit influencers for affiliate distribution.`
  },
  keywords: [
    { term: 'Unusual options flow', volume: '110.0K', growth: '+150%' },
    { term: 'Options scanner', volume: '65.0K', growth: '+80%' },
    { term: 'Institutional order flow', volume: '22.0K', growth: '+400%' }
  ],
  categorization: { type: 'Data Platform', target: 'Retail Traders', market: 'FinTech', competitor: 'Unusual Whales', trendAnalysis: 'Retail traders are demanding institutional-grade tooling.' },
  communitySignals: [
    { platform: 'Twitter (X)', count: 45, text: 'influencers identified' },
    { platform: 'Discord', count: 120, text: 'trading communities' }
  ],
  buildGuide: bobbyBuildGuide
};

const paulaBuildGuide: BuildStep[] = [
  { step: 1, title: 'BRAND INPUT WIZARD — Capture the Vibe', description: 'Build an onboarding flow that captures business name, industry, target audience, and "vibe" (modern, classic, playful, luxurious, etc.). Include a mood board selector with 20+ curated aesthetic directions. The input quality determines output quality — spend real time on this step. Use a conversational UI that feels like talking to a creative director, not filling out a form.' },
  { step: 2, title: 'LOGO GENERATION ENGINE — SVG-First Architecture', description: 'Build the AI logo pipeline: text prompt → image generation → SVG trace → cleanup. Use a fine-tuned model on professional logomarks (geometric, wordmark, lettermark, emblem). Output must be vector SVG, not raster PNG — this is what separates us from every competitor. Include automatic variations: horizontal, stacked, icon-only, monochrome, and reversed versions.' },
  { step: 3, title: 'COLOR SYSTEM GENERATOR — Accessible by Default', description: 'Generate a complete color palette: primary, secondary, accent, neutral scale, and semantic colors (success, warning, error). Every combination must pass WCAG AA contrast ratios. Include light and dark mode variants automatically. Output as CSS custom properties, Tailwind config, and Figma variables. Show the palette applied to real UI mockups so the user can see it in context.' },
  { step: 4, title: 'TYPOGRAPHY PAIRING — Font Intelligence', description: 'Build the typography recommendation engine. Given the brand vibe and logo style, suggest 3 curated font pairings (heading + body). Pull from Google Fonts for zero-cost implementation. Include a type scale (sizes, weights, line heights) and sample hierarchy showing H1 through body text. Show the fonts applied to real content — headlines, paragraphs, buttons — not just font names.' },
  { step: 5, title: 'BRAND GUIDELINES PDF — The Deliverable', description: 'Auto-generate a professional brand guidelines document: logo usage rules, minimum sizes, clear space, color specifications (HEX, RGB, HSL, CMYK), typography hierarchy, do\'s and don\'ts. Export as both PDF and interactive web page. This is what agencies charge $5K for. Include real-world application mockups: business card, email signature, social media profile, website header.' },
  { step: 6, title: 'SOCIAL TEMPLATE PACK — Ready to Post', description: 'Generate 50+ social media templates in the brand identity: Instagram posts, Stories, LinkedIn banners, Twitter headers, Facebook covers. All editable in Canva or Figma. Include content placeholder text that matches the brand voice. Users should be able to start posting branded content within 10 minutes of completing their brand kit.' },
  { step: 7, title: 'LAUNCH & VIRALITY — Design Sells Itself', description: 'Build a stunning landing page that IS the product demo — enter a business name right on the homepage and see a preview. Share-worthy output pages with "Made with Brandforge" watermark on free tier. Launch on Product Hunt with 10 pre-generated brand kits for famous companies to show quality. Run a "rebrand challenge" on design Twitter.' },
];

const paulaPitch: DeepPitch = {
  title: 'Brandforge: AI Design System Generator',
  tldr: 'AI brand identity generator — logo, colors, typography, guidelines, social templates.',
  tags: ['Visual Moat', 'Product Led', 'High Virality'],
  executiveSummary: [
    `Okay. I looked at every competitor in this space and they all look like they were designed by committee. No personality. No point of view. Small businesses pay $2K-$5K for branding they could get for under $100, but existing "AI logo makers" produce garbage clip-art.`,
    `Brandforge doesn't generate a logo; it generates a complete design system. You enter your business name and vibe, and it outputs a professional SVG logo, an accessible color palette, paired typography, and ready-to-use Figma templates. It thinks like a creative director, not a template engine.`,
    `The design IS the product here. Not the features, not the algorithm — the experience. If someone opens this and doesn't immediately feel like it was made for them, we've failed. But we won't fail. Because I'm designing it.`
  ],
  scores: { opportunity: 8, problem: 9, feasibility: 6, whyNow: 9 },
  businessFit: { revenuePotential: '$200K-$1M ARR', executionDifficulty: 7, goToMarket: 9, targetFounder: 'Requires elite design sensibilities and AI prompting' },
  offerLadder: {
    leadMagnet: { title: 'Color Palette Generator', desc: 'Free tool to find accessible brand colors.' },
    frontend: { title: 'Basic Logo Package', desc: 'High-res logo files and basic colors.', price: '$47 one-time' },
    core: { title: 'Full Brand Kit + Social', desc: 'Figma files, guidelines, 50+ templates.', price: '$197 one-time' }
  },
  sections: {
    whyNow: `Every day, 10,000 new businesses are started. The first thing they need is an identity. AI image generation has made this possible, but nobody has packaged it with actual typographic taste yet.`,
    proofAndSignals: `Fiverr is flooded with $50-$100 logo gigs that take 3 days and require revisions. People want instant gratification but don't want to compromise on looking professional.`,
    marketGap: `Canva is too manual. Looka is too generic. There is no tool that instantly generates a high-end, agency-quality brand identity that feels human-crafted.`,
    executionPlan: `Visual-first launch. We don't write a blog post — we make something people screenshot and share. The landing page itself should be so good that it goes viral on design Twitter. Then Product Hunt.`
  },
  keywords: [
    { term: 'AI logo generator', volume: '300.0K', growth: '+500%' },
    { term: 'Brand identity design', volume: '45.0K', growth: '+20%' },
    { term: 'Figma templates', volume: '110.0K', growth: '+65%' }
  ],
  categorization: { type: 'SaaS / Tool', target: 'SMB / Creators', market: 'Design Tech', competitor: 'Looka / Canva', trendAnalysis: 'AI lowering the barrier to entry for professional design assets.' },
  communitySignals: [
    { platform: 'Product Hunt', count: 15, text: 'recent launches' },
    { platform: 'TikTok', count: 30, text: 'viral design trends' }
  ],
  buildGuide: paulaBuildGuide
};

export const deepPitches: Record<string, Record<string, DeepPitch>> = {
  ted: {
    simple: {
      title: 'LaunchPad Weekly',
      tldr: 'Every Monday you set 3 goals. Every Friday you show what you shipped. An AI accountability partner that doesn\'t let you hide behind "busy."',
      tags: ['Proven Demand', 'High Margin', 'Community Driven'],
      executiveSummary: [
        `Alright, listen. I've been thinking about this one and there's real white space here. Solo founders procrastinate because nobody holds them accountable. They spend 40 hours on logo design and zero hours talking to users.`,
        `LaunchPad Weekly isn't software — it's accountability as a service. You set 3 goals on Monday. On Friday, the AI checks your commit history, Stripe account, and Twitter to verify you actually did the work. If you didn't, you lose your streak and face public accountability.`,
        `This is the kind of thing that starts small and becomes a category. The question isn't whether the market exists — it's whether we move fast enough to own it before someone with more money and less taste catches on.`
      ],
      scores: { opportunity: 7, problem: 9, feasibility: 9, whyNow: 8 },
      businessFit: { revenuePotential: '$100K-$500K ARR', executionDifficulty: 3, goToMarket: 9, targetFounder: 'Community builder with strong Twitter presence' },
      offerLadder: {
        leadMagnet: { title: 'The 3-Goal Framework', desc: 'PDF template for weekly goal setting.' },
        frontend: { title: 'Solo Accountability', desc: 'AI check-ins on Slack/Discord.', price: '$14/month' },
        core: { title: 'Mastermind Tier', desc: 'Small groups of 5 founders + weekly calls.', price: '$49/month' }
      },
      sections: {
        whyNow: `Indie hacking and solopreneurship have exploded, but failure rates remain high due to lack of execution. Current accountability groups are messy Discord channels with zero follow-through.`,
        proofAndSignals: `Look at the popularity of "build in public" on Twitter and the success of paid communities. People desperately want structure and peer pressure to force them to ship.`,
        marketGap: `Existing solutions are either too expensive (executive coaches at $500/hr) or too ineffective (free Discord groups). There is no automated, strict, tech-enabled accountability layer.`,
        executionPlan: `I'd go direct. No ads at first — pure outbound. 50 DMs to the exact right people on day one. Get 10 paying users who LOVE it, then let them do the talking. Build in public on X. The story of building it IS the marketing.`
      },
      keywords: [
        { term: 'Accountability partner', volume: '18.0K', growth: '+45%' },
        { term: 'Solo founder community', volume: '9.2K', growth: '+110%' }
      ],
      categorization: { type: 'Community/SaaS', target: 'Solo Founders', market: 'Productivity', competitor: 'CommitAction', trendAnalysis: 'Rising isolation among remote workers driving demand for synthetic structure.' },
      communitySignals: [
        { platform: 'Twitter (X)', count: 24, text: 'build-in-public threads' },
        { platform: 'Reddit', count: 8, text: 'productivity subs' }
      ],
      buildGuide: [
        { step: 1, title: 'GOAL ENGINE — Weekly Sprint Framework', description: 'Build the core 3-goal input system. Every Monday morning users get a prompt to set their 3 most important goals for the week. Goals must be specific and verifiable — not "work on marketing" but "publish 2 blog posts and cold DM 20 prospects." Store in Supabase with timestamps and status tracking.' },
        { step: 2, title: 'VERIFICATION LAYER — Proof of Work', description: 'Connect to GitHub (commit history), Stripe (revenue data), Twitter (post activity), and Google Analytics (traffic). On Friday, the AI cross-references stated goals with actual activity. Did they say they\'d ship a feature? Check the commits. Said they\'d launch? Check Stripe for new customers.' },
        { step: 3, title: 'ACCOUNTABILITY ENGINE — Consequences & Streaks', description: 'Build the streak system with real consequences. Miss a week? Streak resets publicly. Hit 4 weeks? Earn a badge. Build a public leaderboard showing who\'s actually shipping. Optional: users can stake money that gets donated to charity if they miss goals.' },
        { step: 4, title: 'COMMUNITY LAYER — Mastermind Groups', description: 'Group users into pods of 5 founders at similar stages. Weekly async check-ins + optional live calls. The pod creates social pressure that solo accountability can\'t match. Build matching algorithm based on revenue stage, industry, and timezone.' },
        { step: 5, title: 'LAUNCH — Build in Public on X', description: 'The product IS the marketing. Document building LaunchPad Weekly while using LaunchPad Weekly. DM 50 indie hackers on day one. Post weekly updates showing real user results. The meta-narrative of an accountability tool holding itself accountable is the viral hook.' },
      ]
    },
    creative: {
      title: 'FounderOS: Complete Operator Dashboard',
      tldr: 'Operating system for solo founders — combines task management, metrics, and AI advisor in one dashboard.',
      tags: ['Perfect Timing', 'Unfair Advantage', 'High Margins'],
      executiveSummary: [
        `Alright, listen. I've been thinking about this one and there's real white space here. Not "nice idea" white space — I mean "nobody is doing this right" white space. Solo founders juggle 6 tools and still miss the most important thing each day. They use Notion for docs, Linear for tasks, Stripe for revenue, and ChatGPT for advice.`,
        `This fragmentation creates a meta-job: managing the tools instead of building the business. FounderOS connects directly to the bank account and repo, turning real transaction and commit data into daily strategic challenges. It doesn't just show charts; it tells the founder exactly what the next highest-leverage action is.`,
        `This is the kind of thing that starts small and becomes a category. I've seen it before. The question isn't whether the market exists — it's whether we move fast enough to own it before someone with more money and less taste catches on.`
      ],
      scores: { opportunity: 9, problem: 8, feasibility: 7, whyNow: 9 },
      businessFit: { revenuePotential: '$500K-$2M ARR potential by Year 2', executionDifficulty: 6, goToMarket: 8, targetFounder: 'Ideal for technical founders with B2B SaaS experience' },
      offerLadder: {
        leadMagnet: { title: 'Founder Time Audit', desc: 'Interactive quiz mapping where you waste time.' },
        frontend: { title: 'Basic Dashboard', desc: 'Connect 3 tools, daily metrics.', price: '$19/month' },
        core: { title: 'Complete OS + AI Advisor', desc: 'Unlimited integrations, daily strategic prompts.', price: '$49/month' }
      },
      sections: {
        whyNow: `The solo founder market is booming at a 28% CAGR. Bootstrapping is the new default. Coupled with a significant gap in unified operational tools for teams of 1, this is the perfect moment to launch a consolidated OS.`,
        proofAndSignals: `The demand is validated through identifiable frustrations on platforms like IndieHackers and Twitter. Primary frustrations include "tool fatigue" and subscription bloat. The market is primed for an all-in-one approach.`,
        marketGap: `Existing tools like Notion are too generic; tools like Linear are too engineering-focused. There is a void in tools that combine product execution with financial oversight for the solo operator.`,
        executionPlan: `I'd go direct. No ads at first — pure outbound. 50 DMs to the exact right people on day one. Get 10 paying users who LOVE it, then let them do the talking. Build in public on X. The story of building it IS the marketing.`
      },
      keywords: [
        { term: 'Solo founder tools', volume: '45.0K', growth: '+210%' },
        { term: 'Indie hacker dashboard', volume: '12.5K', growth: '+340%' },
        { term: 'Business OS', volume: '88.0K', growth: '+45%' }
      ],
      categorization: { type: 'Web App', target: 'Solo Founders', market: 'B2B SaaS', competitor: 'Notion / Basecamp', trendAnalysis: 'Bootstrapping and solopreneurship are accelerating due to AI efficiency gains.' },
      communitySignals: [
        { platform: 'Twitter (X)', count: 12, text: 'conversations found' },
        { platform: 'Reddit', count: 5, text: 'subreddits analyzed' },
        { platform: 'IndieHackers', count: 8, text: 'threads active' }
      ],
      buildGuide: [
        { step: 1, title: 'INTEGRATION HUB — Connect the Tools', description: 'Build OAuth connectors for Stripe, GitHub, Google Analytics, Notion, Linear, and bank accounts (via Plaid). Each connector normalizes data into a unified "business pulse" schema: revenue, costs, commits, tasks completed, traffic. Start with Stripe + GitHub — those two alone cover 80% of solo founders.' },
        { step: 2, title: 'DAILY DASHBOARD — One Screen to Rule Them All', description: 'Build the main dashboard: revenue trend (Stripe), shipping velocity (GitHub), task completion rate (Linear/Notion), and traffic trajectory (GA). No tabs, no drilling down — everything visible at a glance. Use sparklines and directional arrows. Red = declining, green = growing, amber = flat.' },
        { step: 3, title: 'AI ADVISOR — "What Should I Do Today?"', description: 'Build the AI layer that analyzes all connected data and generates a single daily priority. Uses pattern matching: "Revenue flat but traffic up 20% → your conversion is broken → fix your pricing page today." The AI doesn\'t just report — it prescribes action. Train on startup playbooks and common failure patterns.' },
        { step: 4, title: 'WEEKLY RETROSPECTIVE — Automated Founder Check-In', description: 'Every Sunday, auto-generate a weekly report: what improved, what declined, what the AI recommends for next week. Include comparison to previous weeks. This becomes the founder\'s journal without requiring them to write anything — the data tells the story.' },
        { step: 5, title: 'ONBOARDING & LAUNCH — 5-Minute Setup', description: 'The entire onboarding must complete in under 5 minutes. Connect Stripe (1 click OAuth), connect GitHub (1 click), see your dashboard. No configuration, no settings, no tutorials. Launch on Product Hunt and IndieHackers simultaneously. Offer founding member pricing at $19/mo locked for life.' },
      ]
    },
    experimental: {
      title: 'AgentForge: No-Code AI Team Builder',
      tldr: 'Build your own team of AI agents like Derek did. Describe what each agent does, connect them together, and let them run your business while you sleep.',
      tags: ['First Mover', 'High Tech Novelty', 'Enterprise Scale'],
      executiveSummary: [
        `Alright, listen. This is the big one. Multi-agent systems are the future of work, but right now only elite engineers can build them. We are going to democratize the AI workforce.`,
        `AgentForge is a visual node-based editor where a founder can drag "Marketing Agent", "Dev Agent", and "Sales Agent" onto a canvas, wire them together, and hit deploy. It translates complex LangChain orchestration into simple English instructions.`,
        `This is a category creator. The question isn't whether the market exists — it's whether we move fast enough to own it before OpenAI or Anthropic builds it natively into their UI.`
      ],
      scores: { opportunity: 10, problem: 9, feasibility: 4, whyNow: 10 },
      businessFit: { revenuePotential: '$5M+ ARR', executionDifficulty: 9, goToMarket: 7, targetFounder: 'Elite engineering team with deep LLM orchestration experience' },
      offerLadder: {
        leadMagnet: { title: 'Agent Prompt Library', desc: 'Top 50 system prompts for business agents.' },
        frontend: { title: 'Single Agent Deploy', desc: 'Deploy one autonomous agent.', price: '$49/month' },
        core: { title: 'Multi-Agent Network', desc: 'Up to 5 agents collaborating autonomously.', price: '$199/month' }
      },
      sections: {
        whyNow: `LLM reasoning capabilities have just crossed the threshold where autonomous agency is actually viable, not just a gimmick. The hype cycle is peaking, but the UX layer is completely missing.`,
        proofAndSignals: `Look at the explosion of AutoGPT and BabyAGI repositories on GitHub. There is massive developer interest, but zero accessible UI for non-technical business owners.`,
        marketGap: `Current tools require you to know Python and LangChain. Zapier is too linear and deterministic. There is no intuitive visual builder for non-deterministic AI workflows.`,
        executionPlan: `Go after the 'build-in-public' crowd first. Give free access to 5 high-profile creators who run agencies, have them build their AI clones, and use their success stories as our primary marketing asset.`
      },
      keywords: [
        { term: 'Build AI agents', volume: '120.0K', growth: '+850%' },
        { term: 'No code AI', volume: '65.0K', growth: '+320%' }
      ],
      categorization: { type: 'Platform / PaaS', target: 'Agencies / SMBs', market: 'AI Infrastructure', competitor: 'CrewAI / Zapier', trendAnalysis: 'Transition from single-prompt LLMs to autonomous multi-agent systems.' },
      communitySignals: [
        { platform: 'GitHub', count: 450, text: 'related open source repos' },
        { platform: 'Twitter (X)', count: 85, text: 'AI thought leaders discussing' }
      ],
      buildGuide: [
        { step: 1, title: 'VISUAL CANVAS — Node-Based Agent Editor', description: 'Build a drag-and-drop canvas (React Flow or Xyflow) where users place agent nodes and connect them with wires. Each node represents an agent with a name, role description, and system prompt. Connections define communication channels — which agents can talk to each other and what triggers them. Start with 3 pre-built templates: "Marketing Team", "Dev Team", "Sales Pipeline."' },
        { step: 2, title: 'AGENT RUNTIME — LLM Orchestration Layer', description: 'Build the execution engine that translates the visual graph into actual LLM calls. Each agent node becomes a system prompt + context window. Connections become message queues. Support OpenAI, Anthropic, and Gemini as backend providers. Include rate limiting, cost tracking, and automatic retry logic. This is the hardest engineering challenge — get it right.' },
        { step: 3, title: 'NATURAL LANGUAGE CONFIG — "Make Me a Marketing Agent"', description: 'Users shouldn\'t need to write system prompts. Build a conversational setup where the user says "I need a marketing agent that writes Twitter threads about AI" and the system generates the full agent config: system prompt, tools, triggers, and output format. Lower the bar from "prompt engineer" to "describe what you need."' },
        { step: 4, title: 'AGENT MARKETPLACE — Pre-Built Templates', description: 'Build a library of 50+ pre-configured agents: SEO Writer, Customer Support, Data Analyst, Social Media Manager, Email Marketer, etc. Users can browse, preview, and deploy in one click. Community-contributed agents earn creators a revenue share. This is the marketplace flywheel that drives retention.' },
        { step: 5, title: 'MONITORING DASHBOARD — Agent Operations Center', description: 'Build a real-time dashboard showing all running agents: status (active/idle/error), messages processed, cost per agent, output quality scores. Include conversation logs between agents for debugging. Alert the user when an agent fails or produces low-quality output. This is the "mission control" that makes the product feel professional.' },
        { step: 6, title: 'BETA LAUNCH — Creator First', description: 'Give free access to 5 high-profile creators who run agencies. Have them build their AI clones on camera. Their success stories become the marketing. Launch publicly with a waitlist, then open access with $49/mo single-agent and $199/mo multi-agent tiers.' },
      ]
    }
  },
  bobby: {
    simple: bobbyPitch,
    creative: bobbyPitch,
    experimental: bobbyPitch
  },
  paula: {
    simple: paulaPitch,
    creative: paulaPitch,
    experimental: paulaPitch
  }
};
