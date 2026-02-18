'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { brand, styles } from '@/lib/brand';
import { Star, Zap, Target, ThumbsDown, Archive, Users, User, Lightbulb, Sparkles, Shield, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Skull, Bot, Wand2, Dna } from 'lucide-react';
import { generateCollaborativeIdea as generateRealCollaboration } from '@/lib/agent-collaboration';

// Storage keys removed - all data now in Supabase via /api/ideas

interface AgentIdea {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  problemSolved: string;
  targetMarket: string;
  businessModel: string;
  revenueProjection: string;
  competitiveAdvantage: string;
  developmentTime: string;
  riskAssessment: string;
  tags: string[];
  derekRating?: number;
  agentConfidence: number;
  marketSize: 'small' | 'medium' | 'large' | 'massive';
  status: 'submitted' | 'reviewed' | 'approved' | 'building' | 'rejected' | 'launched';
  createdAt: string;
  updatedAt: string;
  plainEnglish?: string; // Simple explanation anyone can understand
  // Enhanced ideabrowser-style fields
  marketScenario?: string;
  useCase?: string;
  competitorGap?: string;
  // Source tracking
  source: 'generated' | 'autonomous';
}

type IdeaSourceFilter = 'all' | 'generated' | 'autonomous';

type IdeaMode = 'individual' | 'collaborative';
type CreativityLevel = 'simple' | 'creative' | 'experimental';

const AGENTS = [
  { id: 'milo', name: 'Milo', color: '#A855F7' },
  { id: 'paula', name: 'Paula', color: '#EC4899' },
  { id: 'bobby', name: 'Bobby', color: '#22C55E' },
  { id: 'anders', name: 'Anders', color: '#3B82F6' },
  { id: 'dwight', name: 'Dwight', color: '#6366F1' },
  { id: 'jim', name: 'Jim', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#EAB308' },
  { id: 'wendy', name: 'Wendy', color: '#8B5CF6' },
];

const AGENT_REASONING: Record<string, string[]> = {
  bobby: [
    '"This addresses a real gap. Professional-grade data locked behind $2K terminals. We democratize it and print money. Simple math. — Axe"',
    '"The market inefficiency here is obvious. Retail gets crumbs while institutions feast. This levels the field. Risk-adjusted, this is a no-brainer."',
    '"I\'ve been watching this space for years. The timing is perfect — API costs down, demand up. Execute fast, capture the window."',
    '"Price discovery is broken for retail. This fixes it. Show me where the edge is and I\'ll show you the money."',
  ],
  paula: [
    '"Small businesses pay $2K-5K for basic branding that takes weeks. We deliver professional quality in minutes at 95% cost reduction. Less, but better. That\'s the whole pitch."',
    '"Good design shouldn\'t require a $50K budget and 3-month timeline. Democratize quality. Make the barrier to entry disappear."',
    '"Typography is the difference between professional and amateur. AI can nail the fundamentals now. Let it do the heavy lifting."',
    '"The market is flooded with mediocre templates. We\'re not making templates — we\'re making systems. Big difference. Clarity over cleverness."',
  ],
  anders: [
    '"Security isn\'t optional — it\'s infrastructure. Every credential leak is a ticking time bomb. Centralize, audit, protect. That\'s the whole job."',
    '"Systems fail. The question is how fast you recover. Build monitoring, build alerts, build redundancy. Fix problems before users notice."',
    '"Scattered credentials are technical debt with compound interest. One vault, one source of truth, one gatekeeper. That\'s me."',
    '"Updates aren\'t optional maintenance — they\'re survival. The team that patches fastest wins. Stay current or get owned."',
  ],
  dwight: [
    '"Fact: Competitive intelligence is currently either expensive consultants or manual labor. This democratizes enterprise-grade intelligence gathering. Question: Why hasn\'t anyone done this? Answer: They lack my methodology."',
    '"Information asymmetry is profitable. Those who know first, win. This tool accelerates knowledge acquisition by 10x minimum."',
    '"The signal-to-noise ratio in most data sources is abysmal. Filtering is the real value. AI changes the economics completely."',
    '"Bears beat Battlestar Galactica. But seriously — surveillance at scale used to require a team. Now it requires an API call."',
  ],
  dax: [
    '"Volume negates luck. Data teams waste 80% of their time formatting instead of finding insights. Ship the tool, measure the results, iterate. Stop planning. Start shipping."',
    '"The bottleneck isn\'t analysis — it\'s presentation. Executives can\'t read raw data. Make it visual, make it obvious, make it actionable."',
    '"Social signals move faster than traditional metrics. Whoever reads them first, wins. This is real-time competitive advantage."',
    '"Data without narrative is just noise. The story is the product. Build tools that tell stories, not generate charts."',
  ],
  milo: [
    '"Business coordination is broken. Too many tools, no integration, constant context switching. A single command center with AI changes everything. That\'s what we\'re building."',
    '"Orchestration is underrated. The best systems don\'t just do tasks — they coordinate resources. That\'s where the leverage is."',
    '"I see the gaps between agents every day. Handoffs break, context gets lost. Fix the coordination layer, multiply everyone\'s output."',
    '"Strategic value comes from synthesis, not just execution. Connect the dots that nobody else sees."',
  ],
  remy: [
    '"Content creation for restaurants is a massive pain point. They spend thousands on agencies for mediocre output. A $50 TikTok video can outperform a $5,000 ad if the story is right."',
    '"Local marketing is personal. Generic templates fail because they miss the soul of the business. AI can help scale authenticity."',
    '"The restaurant industry is criminally underserved by marketing tools. Everyone\'s building for tech companies. We build for Main Street."',
    '"Engagement beats impressions. A hundred true fans beats a million scrollers. Build tools that create real connection."',
  ],
  wendy: [
    '"Performance coaching is the most underleveraged growth tool. You don\'t want to feel good. You want to be effective. Habits compound. Small daily improvements create massive long-term results."',
    '"Work-life balance is a myth without systems. Build the systems first, then the flexibility follows."',
    '"Personal optimization isn\'t selfish — it\'s prerequisite. You can\'t pour from an empty cup. Fill the cup first."',
    '"Everyone knows what to do. The gap is doing it consistently. That\'s what we\'re solving — the execution gap."',
  ],
  collaborative: [
    '"By combining different domains, we create solutions none of us could build alone. That\'s leverage. That\'s genuine cross-domain innovation. Ship it or kill it."',
    '"The best ideas happen at intersections. Trading + Design. Operations + Tech. This collaboration finds edges nobody else sees."',
    '"Individual agents optimize locally. Together we optimize globally. The network effect of specialized intelligence is real."',
    '"Cross-pollination beats specialization for breakthrough ideas. Let us surprise you with what we find together."',
  ],
};

// Get random reasoning for an agent
function getRandomReasoning(agentId: string): string {
  const reasonings = AGENT_REASONING[agentId] || AGENT_REASONING.collaborative;
  return reasonings[Math.floor(Math.random() * reasonings.length)];
}

interface IdeaTemplate {
  title: string;
  description: string;
  plainEnglish: string;
  problemSolved: string;
  targetMarket: string;
  businessModel: string;
  revenueProjection: string;
  competitiveAdvantage: string;
  developmentTime: string;
  riskAssessment: string;
}

const T: Record<string, Record<CreativityLevel, IdeaTemplate>> = {
  bobby: {
    simple: {
      title: 'Ticker Whisperer',
      description: 'Your coworker made $500 last week on Tesla stock. You want in, but when you open a trading app, it looks like the cockpit of a spaceship. Charts with red and green lines everywhere, words like "RSI" and "MACD" that might as well be alien language. You close the app. Another missed opportunity. Ticker Whisperer changes this. Imagine getting a text from your smartest friend who actually understands stocks: "Hey, Apple might go up today because of their earnings. Consider buying some." No charts, no jargon. Just simple English alerts that help regular people make money without becoming Wall Street nerds.',
      plainEnglish: 'A texting service that sends you simple stock tips in plain English. No charts, no finance jargon. Just "buy this, here is why" from an AI that watches the market 24/7 so you don\'t have to.',
      problemSolved: 'Normal people want to make money from stocks but every trading app feels like you need a finance degree just to understand what you\'re looking at',
      targetMarket: 'Busy professionals with full-time jobs who want to make extra money from stocks but don\'t want to spend hours learning complicated trading stuff',
      businessModel: 'Simple monthly subscription - $19/month for daily text alerts with plain English stock suggestions',
      revenueProjection: 'Conservative: $114K/yr (500 subs). Moderate: $285K/yr (1,250 subs). Aggressive: $570K/yr (2,500 subs)',
      competitiveAdvantage: 'While every other trading app tries to impress you with complexity, we do the opposite - we make it so simple your mom could use it',
      developmentTime: '48 hours for MVP (AI alert engine + SMS integration + Stripe). Polish + iterate over 1 week.',
      riskAssessment: 'Low risk - people already pay for stock advice. Main challenge is standing out in a crowded market, but simplicity is our secret weapon.',
    },
    creative: {
      title: 'FlowHawk',
      description: 'Real-time options flow tracking with AI pattern recognition. Institutional-grade data made accessible for retail traders. See what the smart money is doing before it moves the market.',
      plainEnglish: 'Shows you what the big Wall Street firms are betting on in real time. When a hedge fund drops $5 million on Tesla calls, you see it instantly and can follow the smart money instead of guessing.',
      problemSolved: 'Retail traders miss 80% of profitable opportunities due to lack of institutional-grade options flow data',
      targetMarket: 'Active retail traders and small hedge funds ($10K-$500K accounts)',
      businessModel: 'Tiered SaaS: $49/month retail, $199/month professional',
      revenueProjection: 'Conservative: $180K/yr (300 retail). Moderate: $500K/yr (500 retail + 50 pro). Aggressive: $1.2M/yr (1K retail + 150 pro)',
      competitiveAdvantage: 'First retail-accessible platform with institutional-grade options flow analysis',
      developmentTime: '2-3 days (data pipeline + React dashboard + Stripe). 1 week to refine AI pattern detection.',
      riskAssessment: 'Moderate risk. Options flow data providers charge high fees for API access. Accuracy of AI pattern recognition needs real-world validation. Retail traders may not understand flow data even when simplified.',
    },
    experimental: {
      title: 'SentinelVault',
      description: 'AI system that reads market sentiment across social media, news, and options flow, then automatically hedges your portfolio in real-time. Your portfolio\'s immune system.',
      plainEnglish: 'An AI bodyguard for your portfolio. It reads Twitter, news, and trading data. When it senses a crash coming, it automatically buys protection for your stocks before you even know something is wrong.',
      problemSolved: 'Traders get caught in sentiment-driven crashes because manual hedging is too slow',
      targetMarket: 'Hedge funds and professional traders with $500K+ portfolios',
      businessModel: 'Enterprise licensing: $2K/month + performance fees on protected losses',
      revenueProjection: 'Conservative: $480K/yr (20 clients). Moderate: $2M/yr (50 clients + perf fees). Aggressive: $5M/yr (100 clients at scale)',
      competitiveAdvantage: 'First autonomous hedging system driven by real-time multi-source sentiment analysis',
      developmentTime: '1 week MVP (sentiment pipeline + basic hedging logic). 2-3 weeks for brokerage integrations + backtesting.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Sentiment analysis accuracy is notoriously unreliable, (2) Autonomous trading decisions carry enormous liability, (3) Regulatory compliance for automated trading is complex, (4) If the AI hedges wrong, it amplifies losses instead of preventing them. Needs extensive backtesting before any live deployment.',
    },
  },
  paula: {
    simple: {
      title: 'MarkCraft',
      description: 'You just quit your job to start a dog walking business. You need a logo for your business cards, but hiring a designer costs $500 and takes two weeks. MarkCraft solves this in 60 seconds. Type "Paw Partners Dog Walking" and get 10 professional logos instantly. Pick one, download it, print your business cards. Done.',
      plainEnglish: 'Type your business name, get 10 professional logos in 60 seconds. Pick the one you like, download it, put it on your business cards. No designer needed, no $500 bill, no two-week wait.',
      problemSolved: 'New business owners need professional logos immediately but hiring designers takes weeks and costs more than most startups can afford',
      targetMarket: 'Entrepreneurs, freelancers, and small business owners who need a decent logo today, not next month',
      businessModel: 'Free basic logos to try, then $19 for high-res files you can actually use on business cards and websites',
      revenueProjection: 'Conservative: $57K/yr (250 purchases/mo). Moderate: $182K/yr (800/mo). Aggressive: $456K/yr (2,000/mo)',
      competitiveAdvantage: 'Speed beats everything - while others make you wait weeks for revisions, we give you options in under a minute',
      developmentTime: '24 hours for MVP (AI logo generation + download + payment). 3 days to add templates and polish.',
      riskAssessment: 'Safe bet - people clearly want logos and will pay for convenience. Risk is competing with free options, but speed and quality should win.',
    },
    creative: {
      title: 'Brandforge',
      description: 'AI-powered brand identity generator that creates complete brand systems - logos, colors, typography, guidelines, and social templates. Your entire brand identity, built in minutes.',
      plainEnglish: 'Give it your business name and what you do. It creates your entire brand look: logo, colors, fonts, social media templates, business card design. Everything a branding agency charges $5,000 for, done in minutes for under $100.',
      problemSolved: 'Small businesses pay $2K-$5K for branding they could get for under $100 with AI',
      targetMarket: 'Small business owners, entrepreneurs, and freelancers starting new ventures',
      businessModel: 'One-time purchase: $47 basic, $97 premium, $197 complete package',
      revenueProjection: 'Conservative: $140K/yr (200 sales/mo avg $58). Moderate: $400K/yr (300/mo avg $111). Aggressive: $960K/yr (500/mo avg $160)',
      competitiveAdvantage: 'Professional designer quality at 95% cost reduction through AI automation',
      developmentTime: '2-3 days for core brand generation engine + asset export. 1 week to add social templates and premium tiers.',
      riskAssessment: 'Moderate risk. AI-generated brands can feel generic without careful prompt engineering and design rules. Competition from Looka, Brandmark is real. The "complete brand system" promise is the differentiator but also the hardest part to deliver.',
    },
    experimental: {
      title: 'MoodShift',
      description: 'Design system that adapts visual elements in real-time based on user emotional state and behavioral signals. The UI literally changes mood with the user. Interfaces that feel alive.',
      plainEnglish: 'A website that can tell when you are frustrated (clicking fast, scrolling back and forth) and automatically simplifies itself. When you are engaged and exploring, it shows you more options. The interface reads your mood and adapts.',
      problemSolved: 'Static designs ignore that users interact differently based on emotional state - frustrated users need simpler layouts, engaged users can handle complexity',
      targetMarket: 'Enterprise UX teams and cutting-edge product companies',
      businessModel: 'Enterprise SDK: $3K/month + integration consulting',
      revenueProjection: 'Conservative: $360K/yr (10 clients). Moderate: $1.5M/yr (40 clients). Aggressive: $3.6M/yr (100 clients)',
      competitiveAdvantage: 'First design system using behavioral signals for real-time UI adaptation',
      developmentTime: '3-5 days for behavioral tracking SDK + basic adaptation rules. 2-3 weeks for ML model training and enterprise packaging.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Detecting user emotional state from behavior alone is unreliable, (2) Constantly changing UI could be disorienting, not helpful, (3) Enterprise adoption of "experimental UI" is a very hard sell, (4) No research validates that emotion-responsive design actually improves outcomes. This is a genuine R&D bet.',
    },
  },
  anders: {
    simple: {
      title: 'ShipIt',
      description: 'One-click deployment for web applications. Connect repo, click deploy, get a live URL. No config files, no CI/CD setup. The anti-DevOps tool.',
      plainEnglish: 'You built a website. You want it live on the internet. Click one button and it is live. No setup, no config files, no DevOps degree required. Just click and get a URL you can share.',
      problemSolved: 'Developers waste hours on deployment configuration instead of building features',
      targetMarket: 'Individual developers and small teams building web apps',
      businessModel: 'Usage-based: $5/month base + $0.01 per deployment hour',
      revenueProjection: 'Conservative: $90K/yr (500 devs). Moderate: $300K/yr (1,000 devs). Aggressive: $750K/yr (2,500 devs)',
      competitiveAdvantage: 'Simpler than Vercel. Zero config. It just works.',
      developmentTime: '24-48 hours for MVP (deploy automation + live URL). 1 week for scaling and monitoring dashboard.',
      riskAssessment: 'Low risk. Deployment tools are a proven market. Competing with Vercel/Netlify on simplicity is viable for the long tail of developers who find even those too complex.',
    },
    creative: {
      title: 'Stackblox',
      description: 'Drag-and-drop app builder for non-technical people. Sarah runs a dog grooming business. She needs booking, payments, and reminder texts. She drags a "Customer" box, connects it to "Payment" and "SMS" boxes. Clicks Launch. Working app in 20 minutes. No $45,000 developer bill.',
      plainEnglish: 'Drag and drop boxes to build a real app. Connect a "Customer" box to a "Payment" box and a "Text Message" box, hit launch, and you have a working booking system. No coding, no $45,000 developer bill. Like building with Legos but the result is a real business app.',
      problemSolved: 'Small business owners need custom software to run efficiently, but developers cost more than most small businesses earn in an entire year',
      targetMarket: 'Non-technical small business owners who need custom apps but can\'t afford programmers',
      businessModel: '$29/month base + usage-based pricing ($0.10 per transaction processed)',
      revenueProjection: 'Conservative: $210K/yr (200 businesses). Moderate: $798K/yr (500 businesses). Aggressive: $2M/yr (1,200 businesses)',
      competitiveAdvantage: 'Works exactly like Squarespace or Wix that people already know, but builds the invisible business logic instead of pretty websites',
      developmentTime: '3-5 days for visual editor MVP + auto-deploy. 2 weeks to add payment/SMS integrations and templates.',
      riskAssessment: 'Medium risk. Similar tools exist but they\'re still too technical. Our advantage is genuine simplicity, but we need to prove even non-technical people can really use it.',
    },
    experimental: {
      title: 'Archetype',
      description: 'AI system that designs entire application architectures from a plain English description and generates production-ready, deployable code. Describe your app, deploy your app. Nothing in between.',
      plainEnglish: 'Describe your app in plain English like "I need an Airbnb for pet sitting" and the AI designs the entire technical system and writes all the code. Not a prototype. Production-ready code you can deploy immediately.',
      problemSolved: 'Even experienced developers spend weeks architecting systems that could be generated instantly',
      targetMarket: 'Development agencies and enterprise engineering teams',
      businessModel: 'Per-project licensing: $999 per application + $199/month maintenance',
      revenueProjection: 'Conservative: $360K/yr (20 agencies). Moderate: $1.5M/yr (50 agencies x 3 apps). Aggressive: $4M/yr (100 agencies at scale)',
      competitiveAdvantage: 'First AI that understands enterprise architecture patterns and generates complete, production-ready systems',
      developmentTime: '1 week for architecture generation MVP + code output. 2-3 weeks for enterprise patterns and deployment pipeline.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) AI-generated architecture quality is inconsistent - one bad decision cascades into unmaintainable code, (2) Every real app has edge cases that break generated patterns, (3) Developers are skeptical of AI-generated code for production use, (4) Cursor/Copilot are moving fast in this space with massive resources. Timing and differentiation are critical.',
    },
  },
  dwight: {
    simple: {
      title: 'Morning Wire',
      description: 'Personalized daily news briefings with AI-powered summaries. Your industry, your topics, delivered before your first coffee.',
      plainEnglish: 'Every morning you get an email with the 5 most important things that happened in your industry. No scrolling through 50 articles. Just the stuff that actually matters to your job, summarized in 2 minutes.',
      problemSolved: 'Busy professionals need relevant news but cannot spend time filtering through noise',
      targetMarket: 'Executives and professionals who need industry-specific news',
      businessModel: 'Subscription: $19/month individual, $99/month team',
      revenueProjection: 'Conservative: $114K/yr (500 subs). Moderate: $400K/yr (1,500 subs). Aggressive: $1.1M/yr (3,000 individual + 200 teams)',
      competitiveAdvantage: 'Human-curated sources with AI-powered personalization and summary quality',
      developmentTime: '24 hours for MVP (news aggregation + AI summary + email delivery). 1 week for personalization engine.',
      riskAssessment: 'Low risk. Newsletter/digest is a proven format. AI summarization is mature. Main risk is differentiation from Morning Brew, TLDR, and dozens of similar products.',
    },
    creative: {
      title: 'SignalFront',
      description: 'AI system that detects weak signals across global data sources and predicts market trends before they hit mainstream awareness. See tomorrow\'s headlines today.',
      plainEnglish: 'Spots trends before they blow up. While everyone else finds out about the next big thing from a TikTok video, you got an alert about it 3 weeks earlier from obscure data signals the AI caught.',
      problemSolved: 'Businesses react to trends instead of anticipating them, missing first-mover advantages',
      targetMarket: 'Strategy consultants, VCs, and Fortune 500 strategy teams',
      businessModel: 'Enterprise SaaS: $2,999/month + custom research projects',
      revenueProjection: 'Conservative: $540K/yr (15 clients). Moderate: $1.8M/yr (50 clients). Aggressive: $4.5M/yr (100 clients + research projects)',
      competitiveAdvantage: 'Only AI trained specifically on weak signal detection and trend prediction',
      developmentTime: '3-5 days for signal detection engine + dashboard. 2 weeks for prediction model tuning and enterprise features.',
      riskAssessment: 'Moderate risk. "Predicting trends" is an extraordinary claim. The AI needs to demonstrate accuracy that beats human analysts consistently. Enterprise sales cycle is 3-6 months. False predictions destroy credibility fast.',
    },
    experimental: {
      title: 'Hivemind Intel',
      description: 'Crowdsourced intelligence platform where human analysts and AI collaborate on research. A Mechanical Turk for strategic intelligence. The world\'s smartest research team, on demand.',
      plainEnglish: 'A network of human researchers and AI working together to answer hard business questions. Need to know if a competitor is expanding into your market? Post the question, experts and AI collaborate, you get a research report back.',
      problemSolved: 'Traditional intelligence is either expensive consultants or incomplete AI - neither is good enough alone',
      targetMarket: 'Large corporations and research institutions needing deep intelligence',
      businessModel: 'Platform fees: 20% of research projects + $5K/month platform access',
      revenueProjection: 'Conservative: $1.2M/yr (20 clients). Moderate: $5M/yr (50 clients + $25M volume). Aggressive: $12M/yr (100+ clients at scale)',
      competitiveAdvantage: 'First platform combining human intelligence expertise with AI scale',
      developmentTime: '1 week for research collaboration MVP + AI integration. 3 weeks for analyst network, security layer, and quality control.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Building a network of qualified analysts is the hardest cold-start problem, (2) Quality control on crowdsourced intelligence is extremely difficult, (3) Security and confidentiality concerns will limit enterprise adoption, (4) The marketplace model requires simultaneous supply and demand growth. This is essentially building a two-sided market from scratch.',
    },
  },
  dax: {
    simple: {
      title: 'ChartDrop',
      description: 'Dead simple tool for creating beautiful charts from spreadsheet data. Paste data, pick style, download chart. Three clicks to a presentation-ready visual.',
      plainEnglish: 'Copy your numbers from a spreadsheet, paste them in, pick a style that looks good, and download a beautiful chart. Three steps. No design skills needed. Your boss will think you hired a graphic designer.',
      problemSolved: 'Most people need basic charts but find existing tools too complicated or ugly',
      targetMarket: 'Small business owners, students, and professionals who need quick visualizations',
      businessModel: 'Freemium: Free basic charts, $9/month for premium templates and export',
      revenueProjection: 'Conservative: $65K/yr (600 premium subs). Moderate: $180K/yr (2,000 subs). Aggressive: $432K/yr (4,000 subs)',
      competitiveAdvantage: 'Fastest chart creation with the most beautiful default templates',
      developmentTime: '12-24 hours for MVP (paste data + chart generation + download). 3 days for template library and premium tier.',
      riskAssessment: 'Low risk. Chart tools are proven. Google Sheets does charts. The bet is that "beautiful by default" is enough differentiation. Thin moat.',
    },
    creative: {
      title: 'NarrativeIQ',
      description: 'Platform that converts raw data into executive-ready presentations with narrative, not just charts. Data goes in, a boardroom-ready story comes out.',
      plainEnglish: 'Upload your messy spreadsheet. Get back a polished presentation with charts AND a written story explaining what the data means. Instead of spending 4 hours making slides, you spend 4 minutes uploading a file.',
      problemSolved: 'Data analysts spend 80% of time formatting reports instead of finding insights',
      targetMarket: 'Data analysts, consultants, and executives at mid-size companies',
      businessModel: 'SaaS: $79/month individual, $299/month team',
      revenueProjection: 'Conservative: $190K/yr (200 individual subs). Moderate: $700K/yr (200 teams). Aggressive: $1.8M/yr (500 teams)',
      competitiveAdvantage: 'Only platform combining statistical rigor with executive communication and narrative generation',
      developmentTime: '2-3 days for data-to-narrative engine + presentation output. 1 week for template library and team features.',
      riskAssessment: 'Moderate risk. The "narrative from data" part is the hard technical challenge. AI-generated insights need to be accurate and non-obvious to be valuable. If the narratives are generic, its just another charting tool.',
    },
    experimental: {
      title: 'SimVault',
      description: 'AI that creates interactive business simulations from real company data. Test "what if" scenarios before betting real resources. A flight simulator for business decisions.',
      plainEnglish: 'A "what if" machine for your business. What if we raise prices 10%? What if we open a second location? What if a recession hits? Plug in your real numbers, ask any question, and see what would likely happen before you risk real money.',
      problemSolved: 'Executives make million-dollar decisions based on static spreadsheets instead of dynamic modeling',
      targetMarket: 'Strategy teams at Fortune 1000 companies and consulting firms',
      businessModel: 'Enterprise licensing: $10K setup + $2K/month per simulation',
      revenueProjection: 'Conservative: $480K/yr (20 simulations). Moderate: $2M/yr (80 simulations). Aggressive: $5M/yr (200 simulations at scale)',
      competitiveAdvantage: 'First business simulation platform using real company data and AI scenario modeling',
      developmentTime: '1 week for simulation engine MVP + scenario modeling. 2-3 weeks for enterprise data connectors and validation.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Business simulation accuracy depends entirely on data quality, which is usually terrible, (2) Executives who need this most are least likely to trust AI models over their gut, (3) Building simulations that are accurate enough to be useful but simple enough to be usable is an unsolved UX problem, (4) Enterprise sales at $10K+ setup requires a proven track record we dont have yet.',
    },
  },
  milo: {
    simple: {
      title: 'Heartbeat',
      description: 'Every night the bakery owner goes to bed wondering: "Am I actually making money or just staying busy?" Heartbeat answers that question. 3 minutes daily, enter yesterday\'s numbers. Green arrow or red arrow. That is it.',
      plainEnglish: 'Spend 3 minutes each morning typing in yesterday\'s sales and expenses. The app shows you one thing: is your business getting better or worse? Green arrow up or red arrow down. That is it. No MBA required.',
      problemSolved: 'Small business owners work incredibly hard but have no idea if they\'re actually making progress or just spinning their wheels',
      targetMarket: 'Small business owners with under 10 employees who want to know their business health without becoming accounting experts',
      businessModel: 'Monthly subscription - $29/month for daily health tracking and trend reports',
      revenueProjection: 'Conservative: $104K/yr (300 subs). Moderate: $348K/yr (1,000 subs). Aggressive: $870K/yr (2,500 subs)',
      competitiveAdvantage: 'Designed for corner stores and cafes, not Fortune 500 companies. Takes 3 minutes daily, not 3 hours weekly',
      developmentTime: '24-48 hours for MVP (daily input + trend chart + mobile). 1 week to add reports and notifications.',
      riskAssessment: 'Low risk - small businesses desperately need this insight. Main challenge is convincing them to pay monthly when money is tight, but the value is clear.',
    },
    creative: {
      title: 'CommandDeck',
      description: 'Platform that orchestrates multiple AI agents for comprehensive business automation. One command center for your entire AI workforce. Stop juggling tools, start commanding them.',
      plainEnglish: 'One dashboard to control all your AI assistants. Instead of juggling 8 different AI tools that don\'t talk to each other, you have one command center where you give orders and your AI team handles the rest.',
      problemSolved: 'Businesses want AI automation but struggle to coordinate multiple tools and agents',
      targetMarket: 'SMBs and operations teams needing workflow automation',
      businessModel: 'SaaS: $49/month base + $19/month per additional agent',
      revenueProjection: 'Conservative: $234K/yr (150 businesses). Moderate: $900K/yr (500 businesses). Aggressive: $2.4M/yr (1,000 businesses)',
      competitiveAdvantage: 'Only platform designed for multi-agent coordination with business context',
      developmentTime: '3-5 days for agent orchestration MVP + workflow builder. 2 weeks for business templates and integrations.',
      riskAssessment: 'Moderate risk. Multi-agent coordination is hot right now but the market is moving fast. LangChain, CrewAI, and others are building similar abstractions. Need to differentiate through business-specific templates rather than generic orchestration.',
    },
    experimental: {
      title: 'BenchmarkCloud',
      description: 'Network where businesses share anonymized operational data to improve collective performance. A Bloomberg Terminal for SMBs. Am I paying too much rent? Is my margin normal? Now you know.',
      plainEnglish: 'Hundreds of small businesses secretly share their numbers (anonymously). Now everyone can see: "Am I paying too much for rent compared to similar businesses? Is my profit margin normal?" Like Glassdoor but for business performance instead of salaries.',
      problemSolved: 'Small businesses operate in silos, missing insights from collective operational intelligence',
      targetMarket: 'Forward-thinking SMBs and business networks wanting collective optimization',
      businessModel: 'Network participation fees: $299/month + data contribution incentives',
      revenueProjection: 'Conservative: $430K/yr (120 participants). Moderate: $3M/yr (800 participants). Aggressive: $9M/yr (2,500 participants at network scale)',
      competitiveAdvantage: 'First platform creating collective business intelligence while maintaining privacy',
      developmentTime: '1 week for data sharing MVP + anonymization layer. 3 weeks for benchmarking engine and network features.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Businesses are paranoid about sharing data, even anonymized, (2) Network effects require critical mass - the product is useless with 10 participants, (3) Privacy-preserving analytics that are actually useful is an active research problem, (4) The value proposition is abstract until the network is large enough to generate meaningful benchmarks.',
    },
  },
  remy: {
    simple: {
      title: 'PostPilot',
      description: 'Generate a week of social media posts in under 5 minutes from a single topic. Describe your business, get a content calendar. Done before your coffee gets cold.',
      plainEnglish: 'Tell it what your business does. It writes a full week of social media posts for Instagram, Twitter, and Facebook. Copy, paste, post. 5 minutes and your social media is handled for the week.',
      problemSolved: 'Business owners know they need to post but cannot spend hours creating content',
      targetMarket: 'Solo business owners and freelancers active on social media',
      businessModel: 'Simple subscription: $19/month or $179/year',
      revenueProjection: 'Conservative: $68K/yr (300 subs). Moderate: $250K/yr (1,200 subs). Aggressive: $684K/yr (3,000 subs)',
      competitiveAdvantage: 'Fastest time-to-content with brand-consistent output every time',
      developmentTime: '12-24 hours for MVP (post generation + copy-paste export). 3-5 days for scheduling integration and brand templates.',
      riskAssessment: 'Low risk. Social media scheduling with AI content is proven (Buffer, Hootsuite adding AI). The bet is on simplicity and speed. Low barrier to entry but also low moat.',
    },
    creative: {
      title: 'ViralScore',
      description: 'AI that scores content virality potential before you publish and suggests specific optimizations to increase reach. A spell-checker for engagement.',
      plainEnglish: 'Before you post that TikTok or tweet, run it through this tool. It gives you a score out of 100 on how likely it is to go viral and tells you exactly what to change to boost it. Like a spell-checker but for engagement.',
      problemSolved: 'Businesses publish blindly hoping content resonates instead of predicting engagement',
      targetMarket: 'Social media managers, influencers, and marketing teams',
      businessModel: 'Per-scan pricing: $0.50/scan or $79/month unlimited',
      revenueProjection: 'Conservative: $142K/yr (150 unlimited subs). Moderate: $500K/yr (500 subs + scan revenue). Aggressive: $1.2M/yr (1,000 subs at scale)',
      competitiveAdvantage: 'Trained on engagement patterns to identify what humans cannot see before posting',
      developmentTime: '3-5 days for scoring engine + optimization suggestions. 2 weeks for ML model training on engagement data.',
      riskAssessment: 'Moderate risk. Virality prediction is inherently unreliable - if it were predictable, everyone would go viral. The tool needs to show measurable improvement in average engagement, not promise guaranteed virality. Managing expectations is key.',
    },
    experimental: {
      title: 'CampaignHive',
      description: 'A virtual creative agency made entirely of AI agents. One writes copy, another makes graphics, another edits video, another schedules. Describe your campaign, they execute it. No human agency, no $10K retainer.',
      plainEnglish: 'A virtual marketing agency made entirely of AI. One AI writes the copy, another makes the graphics, another edits the video, another schedules it all. You describe the campaign, they execute it. No human agency, no $10,000 retainer.',
      problemSolved: 'Content agencies are expensive and slow; single AI tools lack creative depth and multi-format capability',
      targetMarket: 'Mid-market brands and agencies managing multiple campaigns simultaneously',
      businessModel: 'Campaign-based: $2K-$10K per campaign + $499/month platform fee',
      revenueProjection: 'Conservative: $600K/yr (30 brands). Moderate: $2.5M/yr (100 brands). Aggressive: $7M/yr (250 brands at scale)',
      competitiveAdvantage: 'First multi-AI creative network that mimics agency team dynamics',
      developmentTime: '1 week for multi-agent content pipeline MVP. 2-3 weeks for campaign orchestration and brand safety guardrails.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Multi-agent coordination for creative work produces inconsistent output, (2) Brand safety with autonomous AI content is a liability minefield, (3) Campaign pricing at $2K+ requires demonstrably better results than a human freelancer, (4) The "virtual agency" positioning competes with actual agencies who have relationships and trust. High upside but could produce expensive mediocre content.',
    },
  },
  wendy: {
    simple: {
      title: 'StreakKeeper',
      description: 'Clean, simple daily habit tracker with streak tracking and gentle accountability nudges. Psychology-backed so habits actually stick, not just get tracked.',
      plainEnglish: 'Check off your daily habits like "drink water" and "exercise" and watch your streak grow. Miss a day and it sends you a gentle nudge. Simple enough that you actually use it instead of deleting it after a week.',
      problemSolved: 'People start habits but quit within 2 weeks because existing trackers are either too complex or too boring',
      targetMarket: 'Individuals wanting to build better daily habits (health, productivity, learning)',
      businessModel: 'Freemium: Free 3 habits, $9/month unlimited + coaching insights',
      revenueProjection: 'Conservative: $65K/yr (600 premium subs). Moderate: $200K/yr (2,000 subs). Aggressive: $540K/yr (5,000 subs)',
      competitiveAdvantage: 'Psychology-backed nudge system that actually helps habits stick, not just tracks them',
      developmentTime: '12-24 hours for MVP (habit tracking + streaks + push notifications). 3-5 days for coaching insights and premium tier.',
      riskAssessment: 'Low risk. Habit trackers are a proven category. Streaks work. The challenge is standing out from Habitica, Streaks, and dozens of others. The coaching angle is the differentiator.',
    },
    creative: {
      title: 'PeakState',
      description: 'AI coaching platform that combines productivity tracking, energy management, and behavioral psychology to help professionals perform at their peak. Your $500/hr executive coach for $49/month.',
      plainEnglish: 'A personal coach in your pocket that learns YOUR patterns. It notices you do your best work at 10am and crash at 2pm, then schedules your hardest tasks accordingly. Like having a $500/hour executive coach for $49/month.',
      problemSolved: 'High performers plateau because generic productivity advice ignores individual patterns and energy cycles',
      targetMarket: 'Professionals and entrepreneurs who want to optimize their performance ($75K+ income)',
      businessModel: 'SaaS: $49/month individual, $199/month team with manager dashboards',
      revenueProjection: 'Conservative: $176K/yr (300 individual subs). Moderate: $600K/yr (800 individual + 50 teams). Aggressive: $1.5M/yr (2,000 individual + 150 teams)',
      competitiveAdvantage: 'Only coaching tool that adapts to individual energy patterns and behavioral data',
      developmentTime: '3-5 days for behavioral tracking + coaching engine MVP. 2 weeks for energy optimization and team dashboards.',
      riskAssessment: 'Moderate risk. Performance coaching is subjective - hard to prove ROI quantitatively. User engagement drops after the novelty period. The AI coaching needs to feel genuinely personalized, not generic "drink more water" advice.',
    },
    experimental: {
      title: 'BurnShield',
      description: 'AI system that detects burnout signals weeks before the person realizes it and automatically adjusts their workload. A check engine light for humans.',
      plainEnglish: 'Watches how you work (typing speed, hours logged, email patterns) and warns you 3 weeks before you burn out. Then it automatically lightens your schedule and suggests recovery actions. Like a check engine light but for humans.',
      problemSolved: 'Burnout costs $300B+ annually and people dont recognize it until its too late to prevent',
      targetMarket: 'Companies with knowledge workers who want to prevent burnout-driven turnover',
      businessModel: 'Enterprise: $15/employee/month with anonymous wellness dashboards for management',
      revenueProjection: 'Conservative: $450K/yr (10 companies, 250 employees avg). Moderate: $2M/yr (50 companies). Aggressive: $6M/yr (150 companies at scale)',
      competitiveAdvantage: 'First system that predicts burnout from digital behavior patterns before self-reporting',
      developmentTime: '1 week for behavioral signal collection + basic prediction MVP. 2-3 weeks for prediction model tuning and enterprise wellness dashboards.',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Employee surveillance concerns will kill adoption if not handled with extreme care, (2) Burnout prediction from digital signals is unvalidated science, (3) "Automatically adjusting workload" requires deep integration with project management tools AND manager buy-in, (4) Privacy regulations (GDPR, etc.) create legal complexity. Noble goal but execution minefield.',
    },
  },
};

function genIndividual(agentIds: string[], creativity: CreativityLevel): AgentIdea[] {
  const out: AgentIdea[] = [];
  agentIds.forEach(agentId => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) return;
    const set = T[agentId]; if (!set) return;
    const tmpl = set[creativity]; if (!tmpl) return;
    out.push({
      id: `${agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId, agentName: agent.name, ...tmpl,
      tags: [agentId, creativity],
      agentConfidence: creativity === 'experimental' ? 3 : creativity === 'simple' ? 5 : 4,
      marketSize: creativity === 'simple' ? 'small' : creativity === 'experimental' ? 'massive' : 'medium',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'generated',
    });
  });
  return out;
}

function genCollab(agentIds: string[], creativity: CreativityLevel): AgentIdea {
  try {
    const c = generateRealCollaboration(agentIds, creativity);
    return {
      id: `collab-${Date.now()}`, agentId: 'collaborative',
      agentName: c.collaboratingAgents.map((cid: string) => AGENTS.find(a => a.id === cid)?.name || cid).join(' + '),
      title: c.title, description: c.description,
      problemSolved: c.sevenLayers.problem, targetMarket: c.sevenLayers.people,
      businessModel: `${c.pricing.model} - $${c.pricing.pricePoint}/month`,
      revenueProjection: c.sevenLayers.profit,
      competitiveAdvantage: c.competitiveAdvantage,
      developmentTime: c.realisticTimeline.total,
      riskAssessment: c.riskAssessment || 'Risk assessment not available.',
      tags: [...c.collaboratingAgents, 'collaborative', creativity],
      agentConfidence: creativity === 'experimental' ? 3 : creativity === 'simple' ? 5 : 4,
      marketSize: creativity === 'simple' ? 'small' : creativity === 'experimental' ? 'massive' : 'large',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'generated',
    };
  } catch {
    const names = agentIds.map(id => AGENTS.find(a => a.id === id)?.name).filter(Boolean);
    return {
      id: `collab-${Date.now()}`, agentId: 'collaborative', agentName: names.join(' + '),
      title: `${names.join(' + ')} Collaboration`,
      description: `Cross-domain platform combining ${names.join(' and ')} expertise.`,
      problemSolved: 'Complex problems need multi-disciplinary solutions.',
      targetMarket: 'Businesses needing cross-domain expertise',
      businessModel: 'SaaS subscription', revenueProjection: 'TBD based on validation',
      competitiveAdvantage: `Combined ${names.join(', ')} expertise`,
      developmentTime: '4-6 weeks',
      riskAssessment: 'Risk level depends on creativity setting. Validate assumptions early.',
      tags: [...agentIds, 'collaborative', creativity],
      agentConfidence: 3, marketSize: 'medium', status: 'submitted',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      source: 'generated',
    };
  }
}

function statusColor(s: string) { return s === 'approved' || s === 'launched' ? brand.success : s === 'reviewed' ? brand.amber : s === 'building' ? brand.info : s === 'rejected' ? brand.error : brand.smoke; }
function mktColor(s: string) { return s === 'massive' ? brand.success : s === 'large' ? brand.info : s === 'medium' ? brand.amber : brand.smoke; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function getReasoning(idea: AgentIdea) { 
  // Use a seeded random based on idea id for consistency when re-rendering
  const seed = idea.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const reasonings = idea.agentId === 'collaborative' ? AGENT_REASONING.collaborative : AGENT_REASONING[idea.agentId] || ['"This leverages my domain expertise to solve a real market need."'];
  return reasonings[seed % reasonings.length];
}
function riskColor(level: CreativityLevel) { return level === 'experimental' ? '#22C55E' : level === 'creative' ? brand.amber : brand.smoke; }

// Helpers
function toDateKey(d: string) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }); }
function todayKey() { return toDateKey(new Date().toISOString()); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function fmtDayLabel(dateKey: string) {
  const d = new Date(dateKey);
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function AgentIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<AgentIdea[]>([]);
  const [autonomousIdeas, setAutonomousIdeas] = useState<AgentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENTS.map(a => a.id));
  const [ideaMode, setIdeaMode] = useState<IdeaMode>('individual');
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('creative');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string>(todayKey());
  const [hydrated, setHydrated] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<IdeaSourceFilter>('all');

  // Load from Supabase on mount
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const res = await fetch('/api/ideas');
        if (res.ok) {
          const data = await res.json();
          const allIdeas = (data.ideas || []).map((i: any) => ({
            id: i.id,
            agentId: i.agent_id,
            agentName: i.agent_name,
            title: i.title,
            description: i.description,
            problemSolved: i.problem_solved,
            targetMarket: i.target_market,
            businessModel: i.business_model,
            revenueProjection: i.revenue_projection,
            competitiveAdvantage: i.competitive_advantage,
            developmentTime: i.development_time,
            riskAssessment: i.risk_assessment,
            tags: i.tags || [],
            derekRating: i.derek_rating,
            agentConfidence: i.agent_confidence,
            marketSize: i.market_size,
            status: i.status,
            plainEnglish: i.plain_english,
            source: i.source,
            createdAt: i.created_at,
            updatedAt: i.updated_at,
          }));
          const generated = allIdeas.filter((i: AgentIdea) => i.source === 'generated');
          const autonomous = allIdeas.filter((i: AgentIdea) => i.source === 'autonomous');
          setIdeas(generated);
          setAutonomousIdeas(autonomous);
        }
      } catch (err) {
        console.error('Failed to load ideas:', err);
      }
      setHydrated(true);
    };
    loadIdeas();
  }, []);

  // Save to Supabase when ideas change
  const saveIdeasToDb = async (ideasToSave: AgentIdea[]) => {
    try {
      await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideas: ideasToSave }),
      });
    } catch (err) {
      console.error('Failed to save ideas:', err);
    }
  };

  const toggle = (id: string) => setSelectedAgents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  
  const rate = async (id: string, r: number) => {
    setIdeas(p => p.map(i => i.id === id ? { ...i, derekRating: r } : i));
    // Save to Supabase
    try {
      await fetch('/api/ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, derekRating: r }),
      });
    } catch (err) {
      console.error('Failed to save rating:', err);
    }
  };
  
  const reject = async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    // Update status to rejected in Supabase
    try {
      await fetch('/api/ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
    } catch (err) {
      console.error('Failed to reject idea:', err);
    }
    setIdeas(p => p.filter(i => i.id !== id));
    router.push('/os/agents/ideas/rejected');
  };
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const generate = async () => {
    if (selectedAgents.length === 0) return;
    setIsLoading(true);
    
    // Generate ideas
    let newIdeas: AgentIdea[];
    if (ideaMode === 'collaborative') {
      newIdeas = [genCollab(selectedAgents, creativityLevel)];
    } else {
      newIdeas = genIndividual(selectedAgents, creativityLevel);
    }
    
    // Save to Supabase
    await saveIdeasToDb(newIdeas);
    
    // Update local state
    setIdeas(p => [...newIdeas, ...p]);
    setSelectedDay(todayKey());
    setIsLoading(false);
  };

  // Combine all ideas based on source filter
  const allIdeasCombined = [...ideas, ...autonomousIdeas];
  const filteredBySource = sourceFilter === 'all' 
    ? allIdeasCombined 
    : allIdeasCombined.filter(i => i.source === sourceFilter);

  // Get all unique days sorted newest first
  const allDays = [...new Set(filteredBySource.map(i => toDateKey(i.createdAt)))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  if (allDays.length === 0) allDays.push(todayKey());
  const dayIdx = allDays.indexOf(selectedDay);
  const currentDayIdx = dayIdx >= 0 ? dayIdx : 0;
  const currentDay = allDays[currentDayIdx] || todayKey();

  // Filter ideas for selected day
  const dayIdeas = filteredBySource.filter(i => toDateKey(i.createdAt) === currentDay);
  const sorted = [...dayIdeas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Counts for tab badges
  const generatedCount = ideas.length;
  const autonomousCount = autonomousIdeas.length;

  const prevDay = () => { if (currentDayIdx < allDays.length - 1) setSelectedDay(allDays[currentDayIdx + 1]); };
  const nextDay = () => { if (currentDayIdx > 0) setSelectedDay(allDays[currentDayIdx - 1]); };

  const allSelected = selectedAgents.length === AGENTS.length;
  const sec = { background: brand.graphite, borderRadius: '8px', padding: '16px' } as React.CSSProperties;

  const stars = (rating: number | undefined, ideaId: string) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => rate(ideaId, s)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: (rating && s <= rating) ? brand.amber : brand.smoke }}>
          <Star size={16} style={{ fill: (rating && s <= rating) ? brand.amber : 'transparent' }} />
        </button>
      ))}
    </div>
  );

  // Creativity level config
  const creativityConfig: { value: CreativityLevel; label: string; Icon: typeof Shield; color: string }[] = [
    { value: 'simple', label: 'Simple', Icon: Shield, color: brand.smoke },
    { value: 'creative', label: 'Creative', Icon: Lightbulb, color: brand.amber },
    { value: 'experimental', label: 'Experimental', Icon: Sparkles, color: '#A855F7' },
  ];

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Agent Ideas</h1>
        <p style={styles.subtitle}>Business ideas from your agents. Generate, rate, and move the best ones to Kanban.</p>

        {/* ── Source Filter Tabs ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {([
            { value: 'all' as const, label: 'All Ideas', icon: Lightbulb, count: generatedCount + autonomousCount },
            { value: 'generated' as const, label: 'Generated', icon: Wand2, count: generatedCount },
            { value: 'autonomous' as const, label: 'Agent Created', icon: Bot, count: autonomousCount },
          ]).map(({ value, label, icon: Icon, count }) => (
            <button
              key={value}
              onClick={() => setSourceFilter(value)}
              style={{
                background: sourceFilter === value ? `${brand.amber}15` : '#111',
                color: sourceFilter === value ? brand.amber : brand.white,
                border: sourceFilter === value ? `2px solid ${brand.amber}` : `1px solid ${brand.border}`,
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: sourceFilter === value ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              {label}
              <span style={{
                background: sourceFilter === value ? brand.amber : brand.graphite,
                color: sourceFilter === value ? brand.void : brand.smoke,
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Generator Card ── */}
        <div style={{ background: '#0A0A0A', border: `1px solid ${brand.border}`, borderRadius: '16px', padding: '32px', marginBottom: '28px' }}>

          {/* Select Agents Row */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ color: brand.smoke, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Agents</span>
              <button onClick={() => setSelectedAgents(allSelected ? [] : AGENTS.map(a => a.id))} style={{ background: 'transparent', border: 'none', color: brand.amber, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', padding: 0 }}>{allSelected ? 'CLEAR' : 'ALL'}</button>
              <span style={{ color: brand.border }}>|</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {AGENTS.map(agent => {
                const on = selectedAgents.includes(agent.id);
                return (
                  <button key={agent.id} onClick={() => toggle(agent.id)} style={{
                    background: on ? `${agent.color}15` : '#111',
                    color: brand.white,
                    border: on ? `2px solid ${agent.color}` : `1px solid ${brand.border}`,
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: on ? 1 : 0.5,
                    boxShadow: on ? `0 0 16px ${agent.color}25` : 'none',
                    transition: 'all 0.2s',
                  }}>{agent.name}</button>
                );
              })}
            </div>
          </div>

          {/* Mode + Creativity Row */}
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '28px' }}>
            {/* Mode */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
                <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Mode</span>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([['individual', 'Individual', User] as const, ['collaborative', 'Collaborative', Users] as const]).map(([val, label, Icon]) => (
                  <button key={val} onClick={() => setIdeaMode(val)} style={{
                    background: ideaMode === val ? `${brand.amber}15` : '#111',
                    color: ideaMode === val ? brand.amber : brand.white,
                    border: ideaMode === val ? `2px solid ${brand.amber}` : `1px solid ${brand.border}`,
                    borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: ideaMode === val ? 1 : 0.5, transition: 'all 0.2s',
                  }}><Icon size={14} />{label}</button>
                ))}
              </div>
            </div>

            {/* Creativity */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
                <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Creativity</span>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {creativityConfig.map(({ value, label, Icon, color }) => (
                  <button key={value} onClick={() => setCreativityLevel(value)} style={{
                    background: creativityLevel === value ? `${color}15` : '#111',
                    color: creativityLevel === value ? color : brand.white,
                    border: creativityLevel === value ? `2px solid ${color}` : `1px solid ${brand.border}`,
                    borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: creativityLevel === value ? 1 : 0.5, transition: 'all 0.2s',
                  }}><Icon size={14} />{label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={generate} disabled={isLoading || selectedAgents.length === 0} style={{
              background: isLoading || selectedAgents.length === 0 ? brand.smoke : brand.amber,
              color: brand.void, border: 'none', borderRadius: '10px',
              padding: '14px 36px', fontSize: '16px', fontWeight: 700,
              cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: isLoading || selectedAgents.length === 0 ? 0.5 : 1,
              boxShadow: isLoading || selectedAgents.length === 0 ? 'none' : `0 0 20px ${brand.amber}40`,
              transition: 'all 0.2s',
            }}>
              <Zap size={18} />
              {isLoading ? 'Generating...' : `Generate ${ideaMode === 'collaborative' ? 'Collaborative' : 'Individual'} Ideas (${selectedAgents.length})`}
            </button>
          </div>
        </div>

        {/* ── Day Navigation ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
          <button onClick={prevDay} disabled={currentDayIdx >= allDays.length - 1} style={{
            background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px',
            color: currentDayIdx >= allDays.length - 1 ? brand.border : brand.smoke, cursor: currentDayIdx >= allDays.length - 1 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center',
          }}><ChevronLeft size={18} /></button>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ color: brand.white, fontSize: '18px', fontWeight: 700 }}>{fmtDayLabel(currentDay)}</div>
            <div style={{ color: brand.smoke, fontSize: '12px' }}>{dayIdeas.length} idea{dayIdeas.length !== 1 ? 's' : ''} generated</div>
          </div>
          <button onClick={nextDay} disabled={currentDayIdx <= 0} style={{
            background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px',
            color: currentDayIdx <= 0 ? brand.border : brand.smoke, cursor: currentDayIdx <= 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center',
          }}><ChevronRight size={18} /></button>
        </div>

        {/* ── Idea Cards (Collapsible) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map(idea => {
            const agent = AGENTS.find(a => a.id === idea.agentId);
            const ideaCreativity = idea.tags.find(t => ['simple', 'creative', 'experimental'].includes(t)) as CreativityLevel || 'creative';
            const isExpanded = expandedIds.has(idea.id);
            const isCollab = idea.agentId === 'collaborative';

            return (
              <div key={idea.id} style={{ ...styles.card, padding: 0, border: idea.derekRating && idea.derekRating >= 4 ? `1px solid ${brand.amber}` : `1px solid ${brand.border}`, overflow: 'hidden' }}>
                {/* Summary Row (always visible) */}
                <button onClick={() => toggleExpand(idea.id)} style={{
                  width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', color: 'inherit',
                }}>
                  {/* Agent badge */}
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#000000', border: `2px solid ${agent?.color || (isCollab ? brand.amber : brand.smoke)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: agent?.color || (isCollab ? brand.amber : brand.smoke), fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                    {isCollab ? 'CO' : idea.agentName.substring(0, 2)}
                  </div>

                  {/* Title + Agent */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: brand.white, fontSize: '16px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idea.title}</div>
                    <div style={{ color: brand.smoke, fontSize: '12px' }}>
                      by {idea.agentName} {isCollab ? '(Collab)' : ''} at {fmtTime(idea.createdAt)}
                    </div>
                  </div>

                  {/* Source Badge */}
                  {idea.source === 'autonomous' && (
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: '#A855F715', color: '#A855F7', textTransform: 'uppercase', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Bot size={11} />AUTO
                    </span>
                  )}
                  {/* Badges */}
                  <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: `${mktColor(idea.marketSize)}15`, color: mktColor(idea.marketSize), textTransform: 'uppercase', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target size={12} />{idea.marketSize}
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: `${statusColor(idea.status)}15`, color: statusColor(idea.status), textTransform: 'uppercase', flexShrink: 0 }}>
                    {idea.status}
                  </span>

                  {/* Quick action buttons (always visible) */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => { e.stopPropagation(); reject(idea.id); }} style={{
                      background: 'rgba(239,68,68,0.1)', color: brand.error,
                      border: `1px solid rgba(239,68,68,0.25)`, borderRadius: '6px',
                      padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <ThumbsDown size={11} />Reject
                    </button>
                  </div>

                  {/* Star rating inline */}
                  <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={(e) => { e.stopPropagation(); rate(idea.id, s); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: (idea.derekRating && s <= idea.derekRating) ? brand.amber : brand.smoke }}>
                        <Star size={14} style={{ fill: (idea.derekRating && s <= idea.derekRating) ? brand.amber : 'transparent' }} />
                      </button>
                    ))}
                  </div>

                  {/* Expand chevron */}
                  <ChevronDown size={18} style={{ color: brand.smoke, flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${brand.border}` }}>
                    {/* What is this idea? Section */}
                    <div style={{ ...sec, marginBottom: '16px', background: `${brand.info}15`, border: `1px solid ${brand.info}30` }}>
                      <h4 style={{ color: brand.info, fontSize: '14px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lightbulb size={14} />What is this idea?
                      </h4>
                      <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{idea.description}</p>
                    </div>

                    {/* In Plain English */}
                    {idea.plainEnglish && (
                      <div style={{
                        background: 'rgba(245,158,11,0.06)',
                        border: '1px solid rgba(245,158,11,0.15)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                      }}>
                        <div style={{ color: brand.amber, fontSize: '11px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          In Plain English
                        </div>
                        <div style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.6' }}>
                          {idea.plainEnglish}
                        </div>
                      </div>
                    )}

                    {/* Business Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      <div style={sec}><h4 style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Problem Solved</h4><p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{idea.problemSolved}</p></div>
                      <div style={sec}><h4 style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Target Market</h4><p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{idea.targetMarket}</p></div>
                      <div style={sec}><h4 style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Business Model</h4><p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{idea.businessModel}</p></div>
                      <div style={sec}><h4 style={{ color: brand.success, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Revenue Projection</h4><p style={{ color: brand.white, fontSize: '15px', fontWeight: 700, margin: 0 }}>{idea.revenueProjection}</p></div>
                      <div style={sec}><h4 style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Why We'd Win</h4><p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{idea.competitiveAdvantage}</p></div>
                      <div style={sec}><h4 style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Time to Build</h4><p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{idea.developmentTime}</p></div>
                    </div>

                    {/* Agent Reasoning - Full Width */}
                    <div style={{ ...sec, marginBottom: '16px', background: `${brand.info}15`, border: `1px solid ${brand.info}30` }}>
                      <h4 style={{ color: brand.info, fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bot size={14} />Agent Reasoning
                      </h4>
                      <p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>{getReasoning(idea)}</p>
                    </div>

                    {/* Ideabrowser-style Market Intelligence */}
                    {(idea as any).marketScenario && (
                      <div style={{ ...sec, marginBottom: '12px', border: `1px solid ${brand.success}30`, background: `${brand.success}08` }}>
                        <h4 style={{ color: brand.success, fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Target size={13} />Market Scenario
                        </h4>
                        <p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{(idea as any).marketScenario}</p>
                      </div>
                    )}

                    {(idea as any).useCase && (
                      <div style={{ ...sec, marginBottom: '12px', border: `1px solid ${brand.info}30`, background: `${brand.info}08` }}>
                        <h4 style={{ color: brand.info, fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} />Use Case
                        </h4>
                        <p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{(idea as any).useCase}</p>
                      </div>
                    )}

                    {(idea as any).competitorGap && (
                      <div style={{ ...sec, marginBottom: '12px', border: `1px solid ${brand.amber}30`, background: `${brand.amber}08` }}>
                        <h4 style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Shield size={13} />Competitive Gap
                        </h4>
                        <p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{(idea as any).competitorGap}</p>
                      </div>
                    )}

                    {/* Risk Assessment */}
                    {idea.riskAssessment && (
                      <div style={{ ...sec, marginBottom: '12px', border: `1px solid ${riskColor(ideaCreativity)}30`, background: `${riskColor(ideaCreativity)}08` }}>
                        <h4 style={{ color: riskColor(ideaCreativity), fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={13} />Risk Assessment
                        </h4>
                        <p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{idea.riskAssessment}</p>
                      </div>
                    )}

{/* Agent Reasoning moved to grid above */}

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {idea.tags.map(tag => <span key={tag} style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: brand.graphite, color: brand.smoke, border: `1px solid ${brand.border}` }}>#{tag}</span>)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => reject(idea.id)} disabled={idea.status === 'rejected'} style={{
                        background: idea.status === 'rejected' ? brand.error : 'transparent', color: idea.status === 'rejected' ? brand.void : brand.error,
                        border: `1px solid ${brand.error}`, borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: 600,
                        cursor: idea.status === 'rejected' ? 'default' : 'pointer', opacity: idea.status === 'rejected' ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px',
                      }}><ThumbsDown size={13} />{idea.status === 'rejected' ? 'Rejected' : 'Reject'}</button>
                      <button onClick={() => router.push(`/os/ideas-vault?add_title=${encodeURIComponent(idea.title)}&add_desc=${encodeURIComponent(idea.description)}`)} style={{
                        background: 'transparent', color: brand.warning || brand.amber, border: `1px solid ${brand.warning || brand.amber}`, borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}><Archive size={13} />Idea Vault</button>
                      <button onClick={() => router.push(`/os/kanban?add_title=${encodeURIComponent(idea.title)}&add_project=${encodeURIComponent(idea.agentName)}`)} style={{
                        background: 'transparent', color: brand.info, border: `1px solid ${brand.info}`, borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}><Zap size={13} />Kanban</button>
                      <button onClick={() => {
                        try {
                          localStorage.setItem('dna-scan-idea', JSON.stringify({
                            title: idea.title,
                            description: idea.description,
                            plainEnglish: idea.plainEnglish || '',
                            problemSolved: idea.problemSolved,
                            targetMarket: idea.targetMarket,
                            businessModel: idea.businessModel,
                            revenueProjection: idea.revenueProjection,
                            competitiveAdvantage: idea.competitiveAdvantage,
                            developmentTime: idea.developmentTime,
                            riskAssessment: idea.riskAssessment,
                            agentConfidence: idea.agentConfidence,
                            marketSize: idea.marketSize,
                            agentName: idea.agentName,
                          }));
                        } catch {}
                        router.push('/tools/dna-scanner?from=ideas');
                      }} style={{
                        background: `${brand.amber}15`, color: brand.amber, border: `1px solid ${brand.amber}`, borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}><Dna size={13} />DNA Scan</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '60px 40px' }}>
            <Lightbulb size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No ideas for {fmtDayLabel(currentDay)}</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>Generate some ideas above or navigate to another day.</p>
          </div>
        )}

        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
          <a href="/os/agents/ideas/rejected" style={{
            color: brand.smoke, textDecoration: 'none', fontSize: '11px',
            opacity: 0.4, display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <Skull size={11} />view rejected ideas
          </a>
        </div>
      </div>
    </div>
  );
}