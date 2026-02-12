'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { brand, styles } from '@/lib/brand';
import { Star, Zap, Target, ThumbsDown, Archive, Users, User, Lightbulb, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { generateCollaborativeIdea as generateRealCollaboration } from '@/lib/agent-collaboration';

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
}

type IdeaMode = 'individual' | 'collaborative';
type CreativityLevel = 'simple' | 'creative' | 'experimental';

const AGENTS = [
  { id: 'milo', name: 'Milo', color: '#A855F7' },
  { id: 'anders', name: 'Anders', color: '#F97316' },
  { id: 'paula', name: 'Paula', color: '#EC4899' },
  { id: 'bobby', name: 'Bobby', color: '#EF4444' },
  { id: 'dwight', name: 'Dwight', color: '#6366F1' },
  { id: 'tony', name: 'Tony', color: '#EAB308' },
  { id: 'dax', name: 'Dax', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#22C55E' },
  { id: 'wendy', name: 'Wendy', color: '#8B5CF6' },
];

const AGENT_REASONING: Record<string, string> = {
  bobby: '"This addresses a real gap in retail trading tools. Professional options flow data is locked behind $2K/month terminals. We can democratize it."',
  tony: '"Restaurant margins are razor-thin. Most owners are flying blind on food costs. This gives them institutional-grade tools at a price they can afford."',
  paula: '"Small businesses currently pay $2K-5K for basic branding that takes weeks. With AI, we deliver professional quality in minutes at 95% cost reduction."',
  anders: '"The design-to-code handoff is the biggest bottleneck in product development. Automating this saves teams weeks on every project."',
  dwight: '"Competitive intelligence is currently either expensive consultants or manual labor. This democratizes enterprise-grade intelligence gathering."',
  dax: '"Data teams waste 80% of their time on formatting reports instead of finding insights. Automating the storytelling layer frees analysts to do actual analysis."',
  milo: '"Business coordination is broken. Too many tools, no integration, constant context switching. A single command center with AI changes everything."',
  remy: '"Content creation for businesses is a massive pain point. They spend thousands on agencies for mediocre output when AI can do it better and faster."',
  wendy: '"Performance coaching is the most underleveraged growth tool. Habits compound. Small daily improvements create massive long-term results."',
  collaborative: '"By combining our different areas of expertise, we create solutions neither of us could build alone. This is genuine cross-domain innovation."',
};

interface IdeaTemplate {
  title: string;
  description: string;
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
      title: 'Simple Trading Alerts',
      description: 'Clean, straightforward options and stock alerts for busy retail investors who want signals without complexity.',
      problemSolved: 'Most trading platforms are too complex for casual investors who just want simple alerts',
      targetMarket: 'Casual retail investors and busy professionals',
      businessModel: 'Simple subscription: $19/month or $199/year',
      revenueProjection: '$300K ARR with 1,500 monthly subscribers',
      competitiveAdvantage: 'Simplicity over complexity - designed for normal people, not day traders',
      developmentTime: '2-3 weeks (alert system + mobile app + basic dashboard)',
      riskAssessment: 'Low risk. Alert services are a proven model. The differentiation is simplicity. Main risk is standing out in a crowded market of alert services.',
    },
    creative: {
      title: 'OptionsFlow Pro',
      description: 'Real-time options flow tracking with AI pattern recognition. Institutional-grade data made accessible for retail traders.',
      problemSolved: 'Retail traders miss 80% of profitable opportunities due to lack of institutional-grade options flow data',
      targetMarket: 'Active retail traders and small hedge funds ($10K-$500K accounts)',
      businessModel: 'Tiered SaaS: $49/month retail, $199/month professional',
      revenueProjection: '$500K ARR with 500 retail + 50 professional subscribers',
      competitiveAdvantage: 'First retail-accessible platform with institutional-grade options flow analysis',
      developmentTime: '3-4 weeks (AI data processing + React dashboard + payment integration)',
      riskAssessment: 'Moderate risk. Options flow data providers charge high fees for API access. Accuracy of AI pattern recognition needs real-world validation. Retail traders may not understand flow data even when simplified.',
    },
    experimental: {
      title: 'Sentiment-Driven Auto-Hedging',
      description: 'AI system that reads market sentiment across social media, news, and options flow, then automatically hedges your portfolio in real-time.',
      problemSolved: 'Traders get caught in sentiment-driven crashes because manual hedging is too slow',
      targetMarket: 'Hedge funds and professional traders with $500K+ portfolios',
      businessModel: 'Enterprise licensing: $2K/month + performance fees on protected losses',
      revenueProjection: '$2M ARR with 50 institutional clients',
      competitiveAdvantage: 'First autonomous hedging system driven by real-time multi-source sentiment analysis',
      developmentTime: '10-14 weeks (sentiment ML pipeline + brokerage API integration + risk engine)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Sentiment analysis accuracy is notoriously unreliable, (2) Autonomous trading decisions carry enormous liability, (3) Regulatory compliance for automated trading is complex, (4) If the AI hedges wrong, it amplifies losses instead of preventing them. Needs extensive backtesting before any live deployment.',
    },
  },
  tony: {
    simple: {
      title: 'Daily Restaurant Tracker',
      description: 'Simple daily tracking for food costs, sales, and basic restaurant metrics. No complexity, just the numbers that matter.',
      problemSolved: 'Restaurant owners need basic financial oversight but existing solutions are too complex',
      targetMarket: 'Very small restaurants and food trucks (under $1M revenue)',
      businessModel: 'Affordable SaaS: $29/month',
      revenueProjection: '$200K ARR with 600 small restaurant subscribers',
      competitiveAdvantage: 'Designed for mom-and-pop restaurants, not chains. 5-minute daily input.',
      developmentTime: '2-3 weeks (basic tracking + mobile-first design + simple reports)',
      riskAssessment: 'Low risk. Daily tracking is a proven need. The challenge is user adoption - restaurant owners are busy and may not maintain the habit. Keep it dead simple.',
    },
    creative: {
      title: 'AI Kitchen Optimizer',
      description: 'Smart system that predicts demand and optimizes prep schedules to eliminate food waste and reduce labor costs.',
      problemSolved: 'Restaurants waste $162B annually due to poor demand forecasting and over-preparation',
      targetMarket: 'Fast-casual restaurants and ghost kitchens with high volume',
      businessModel: 'Revenue share: 10% of documented waste reduction savings',
      revenueProjection: '$1.2M ARR by reducing waste for 200 restaurants by average $6K/year each',
      competitiveAdvantage: 'First AI specifically trained on restaurant kitchen operations and waste patterns',
      developmentTime: '6-8 weeks (ML training on kitchen data + POS integration)',
      riskAssessment: 'Moderate risk. Demand prediction in restaurants is hard - weather, local events, and random factors create variance. Revenue share model means we only make money if it actually works. POS integration complexity varies wildly.',
    },
    experimental: {
      title: 'Ghost Kitchen Network AI',
      description: 'AI that dynamically matches ghost kitchen capacity with real-time delivery demand across a metro area. Essentially an Uber-style matching engine for kitchen capacity.',
      problemSolved: 'Ghost kitchens operate at 40% utilization while delivery demand fluctuates wildly',
      targetMarket: 'Ghost kitchen operators and restaurant chains expanding delivery',
      businessModel: 'Platform fee: 5% of matched orders + $499/month per kitchen node',
      revenueProjection: '$3M ARR with 200 kitchen nodes processing $60M in orders',
      competitiveAdvantage: 'First network-level optimization for ghost kitchen capacity matching',
      developmentTime: '8-10 weeks (demand prediction + kitchen matching + logistics)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Ghost kitchen market is cooling after post-COVID hype, (2) Requires critical mass in each metro area (chicken-and-egg), (3) Kitchen capacity is not fungible - a pizza kitchen cant make sushi, (4) Delivery logistics add massive complexity. The ghost kitchen model itself is still unproven at scale.',
    },
  },
  paula: {
    simple: {
      title: 'Quick Logo Maker',
      description: 'Super simple tool for creating professional logos with minimal input. Business name in, logo out, under 2 minutes.',
      problemSolved: 'Entrepreneurs need logos immediately but design tools are too complicated',
      targetMarket: 'Solo entrepreneurs, side hustlers, and very small businesses',
      businessModel: 'Freemium: Free basic logos, $19 for high-res + commercial rights',
      revenueProjection: '$150K ARR with 800 premium downloads per month',
      competitiveAdvantage: 'Fastest logo creation (under 2 minutes) with professional quality',
      developmentTime: '1-2 weeks (streamlined UI + logo generation + instant download)',
      riskAssessment: 'Low risk. Logo generators are proven. Canva exists. Differentiation through speed and simplicity is viable but the moat is thin.',
    },
    creative: {
      title: 'BrandBot AI',
      description: 'AI-powered brand identity generator that creates complete brand systems - logos, colors, typography, guidelines, and social templates.',
      problemSolved: 'Small businesses pay $2K-$5K for branding they could get for under $100 with AI',
      targetMarket: 'Small business owners, entrepreneurs, and freelancers starting new ventures',
      businessModel: 'One-time purchase: $47 basic, $97 premium, $197 complete package',
      revenueProjection: '$400K ARR with 300 premium sales per month',
      competitiveAdvantage: 'Professional designer quality at 95% cost reduction through AI automation',
      developmentTime: '3-4 weeks (AI brand generation + asset export + payment processing)',
      riskAssessment: 'Moderate risk. AI-generated brands can feel generic without careful prompt engineering and design rules. Competition from Looka, Brandmark is real. The "complete brand system" promise is the differentiator but also the hardest part to deliver.',
    },
    experimental: {
      title: 'Emotion-Responsive Design System',
      description: 'Design system that adapts visual elements in real-time based on user emotional state and behavioral signals. The UI literally changes mood with the user.',
      problemSolved: 'Static designs ignore that users interact differently based on emotional state - frustrated users need simpler layouts, engaged users can handle complexity',
      targetMarket: 'Enterprise UX teams and cutting-edge product companies',
      businessModel: 'Enterprise SDK: $3K/month + integration consulting',
      revenueProjection: '$1.5M ARR with 40 enterprise clients',
      competitiveAdvantage: 'First design system using behavioral signals for real-time UI adaptation',
      developmentTime: '12-16 weeks (behavioral signal processing + design adaptation engine + SDK)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Detecting user emotional state from behavior alone is unreliable, (2) Constantly changing UI could be disorienting, not helpful, (3) Enterprise adoption of "experimental UI" is a very hard sell, (4) No research validates that emotion-responsive design actually improves outcomes. This is a genuine R&D bet.',
    },
  },
  anders: {
    simple: {
      title: 'Simple Deploy',
      description: 'One-click deployment for web applications. Connect repo, click deploy, get a live URL. No config files, no CI/CD setup.',
      problemSolved: 'Developers waste hours on deployment configuration instead of building features',
      targetMarket: 'Individual developers and small teams building web apps',
      businessModel: 'Usage-based: $5/month base + $0.01 per deployment hour',
      revenueProjection: '$300K ARR with 1000 active developers',
      competitiveAdvantage: 'Simpler than Vercel. Zero config. It just works.',
      developmentTime: '3-4 weeks (deployment automation + scaling logic + monitoring dashboard)',
      riskAssessment: 'Low risk. Deployment tools are a proven market. Competing with Vercel/Netlify on simplicity is viable for the long tail of developers who find even those too complex.',
    },
    creative: {
      title: 'No-Code Backend Builder',
      description: 'Visual interface for building scalable APIs and databases without writing code. Drag, connect, deploy.',
      problemSolved: 'Non-technical founders need custom backends but cannot afford $100K+ development costs',
      targetMarket: 'Non-technical entrepreneurs and small businesses needing custom software',
      businessModel: 'Usage-based: $29/month base + $0.10 per API call',
      revenueProjection: '$800K ARR with 500 active projects',
      competitiveAdvantage: 'Enterprise-grade architecture with consumer-friendly visual interface',
      developmentTime: '6-8 weeks (visual editor + code generation + deployment automation)',
      riskAssessment: 'Moderate risk. No-code backend is a crowded space (Supabase, Firebase, Xano). The visual builder needs to be genuinely better, not just different. Non-technical users may still struggle with data modeling concepts.',
    },
    experimental: {
      title: 'AI Code Architect',
      description: 'AI system that designs entire application architectures from a plain English description and generates production-ready, deployable code.',
      problemSolved: 'Even experienced developers spend weeks architecting systems that could be generated instantly',
      targetMarket: 'Development agencies and enterprise engineering teams',
      businessModel: 'Per-project licensing: $999 per application + $199/month maintenance',
      revenueProjection: '$1.5M ARR with 50 agencies building 3 apps each annually',
      competitiveAdvantage: 'First AI that understands enterprise architecture patterns and generates complete, production-ready systems',
      developmentTime: '10-12 weeks (architecture AI training + code generation + enterprise integrations)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) AI-generated architecture quality is inconsistent - one bad decision cascades into unmaintainable code, (2) Every real app has edge cases that break generated patterns, (3) Developers are skeptical of AI-generated code for production use, (4) Cursor/Copilot are moving fast in this space with massive resources. Timing and differentiation are critical.',
    },
  },
  dwight: {
    simple: {
      title: 'News Digest Pro',
      description: 'Personalized daily news briefings with AI-powered summaries. Your industry, your topics, your inbox, every morning.',
      problemSolved: 'Busy professionals need relevant news but cannot spend time filtering through noise',
      targetMarket: 'Executives and professionals who need industry-specific news',
      businessModel: 'Subscription: $19/month individual, $99/month team',
      revenueProjection: '$400K ARR with 1500 individual subscribers',
      competitiveAdvantage: 'Human-curated sources with AI-powered personalization and summary quality',
      developmentTime: '2-3 weeks (news aggregation + AI summarization + personalization engine)',
      riskAssessment: 'Low risk. Newsletter/digest is a proven format. AI summarization is mature. Main risk is differentiation from Morning Brew, TLDR, and dozens of similar products.',
    },
    creative: {
      title: 'TrendScope AI',
      description: 'AI system that detects weak signals across global data sources and predicts market trends before they hit mainstream awareness.',
      problemSolved: 'Businesses react to trends instead of anticipating them, missing first-mover advantages',
      targetMarket: 'Strategy consultants, VCs, and Fortune 500 strategy teams',
      businessModel: 'Enterprise SaaS: $2999/month + custom research projects',
      revenueProjection: '$1.8M ARR with 50 enterprise clients',
      competitiveAdvantage: 'Only AI trained specifically on weak signal detection and trend prediction',
      developmentTime: '8-10 weeks (AI training on trend data + prediction models + enterprise dashboard)',
      riskAssessment: 'Moderate risk. "Predicting trends" is an extraordinary claim. The AI needs to demonstrate accuracy that beats human analysts consistently. Enterprise sales cycle is 3-6 months. False predictions destroy credibility fast.',
    },
    experimental: {
      title: 'Global Intelligence Network',
      description: 'Crowdsourced intelligence platform where human analysts and AI collaborate on research. A Mechanical Turk for strategic intelligence.',
      problemSolved: 'Traditional intelligence is either expensive consultants or incomplete AI - neither is good enough alone',
      targetMarket: 'Large corporations and research institutions needing deep intelligence',
      businessModel: 'Platform fees: 20% of research projects + $5K/month platform access',
      revenueProjection: '$5M ARR with $25M in platform research volume',
      competitiveAdvantage: 'First platform combining human intelligence expertise with AI scale',
      developmentTime: '12-16 weeks (analyst network + AI collaboration tools + security infrastructure)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Building a network of qualified analysts is the hardest cold-start problem, (2) Quality control on crowdsourced intelligence is extremely difficult, (3) Security and confidentiality concerns will limit enterprise adoption, (4) The marketplace model requires simultaneous supply and demand growth. This is essentially building a two-sided market from scratch.',
    },
  },
  dax: {
    simple: {
      title: 'Simple Charts',
      description: 'Dead simple tool for creating beautiful charts from spreadsheet data. Paste data, pick style, download chart.',
      problemSolved: 'Most people need basic charts but find existing tools too complicated or ugly',
      targetMarket: 'Small business owners, students, and professionals who need quick visualizations',
      businessModel: 'Freemium: Free basic charts, $9/month for premium templates',
      revenueProjection: '$180K ARR with 2000 premium subscribers',
      competitiveAdvantage: 'Fastest chart creation with the most beautiful default templates',
      developmentTime: '2-3 weeks (chart generation + template library + data import)',
      riskAssessment: 'Low risk. Chart tools are proven. Google Sheets does charts. The bet is that "beautiful by default" is enough differentiation. Thin moat.',
    },
    creative: {
      title: 'DataStory Builder',
      description: 'Platform that converts raw data into executive-ready presentations with narrative, not just charts. Data goes in, a story comes out.',
      problemSolved: 'Data analysts spend 80% of time formatting reports instead of finding insights',
      targetMarket: 'Data analysts, consultants, and executives at mid-size companies',
      businessModel: 'SaaS: $79/month individual, $299/month team',
      revenueProjection: '$700K ARR with 200 team subscriptions',
      competitiveAdvantage: 'Only platform combining statistical rigor with executive communication and narrative generation',
      developmentTime: '4-5 weeks (data processing + narrative generation + presentation automation)',
      riskAssessment: 'Moderate risk. The "narrative from data" part is the hard technical challenge. AI-generated insights need to be accurate and non-obvious to be valuable. If the narratives are generic, its just another charting tool.',
    },
    experimental: {
      title: 'Predictive Business Simulator',
      description: 'AI that creates interactive business simulations from real company data. Test "what if" scenarios before betting real resources.',
      problemSolved: 'Executives make million-dollar decisions based on static spreadsheets instead of dynamic modeling',
      targetMarket: 'Strategy teams at Fortune 1000 companies and consulting firms',
      businessModel: 'Enterprise licensing: $10K setup + $2K/month per simulation',
      revenueProjection: '$2M ARR with 80 enterprise simulations',
      competitiveAdvantage: 'First business simulation platform using real company data and AI scenario modeling',
      developmentTime: '8-10 weeks (simulation engine + AI scenario modeling + enterprise integrations)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Business simulation accuracy depends entirely on data quality, which is usually terrible, (2) Executives who need this most are least likely to trust AI models over their gut, (3) Building simulations that are accurate enough to be useful but simple enough to be usable is an unsolved UX problem, (4) Enterprise sales at $10K+ setup requires a proven track record we dont have yet.',
    },
  },
  milo: {
    simple: {
      title: 'Daily Ops Tracker',
      description: 'Simple dashboard for small business owners to track daily operations and KPIs. 5 minutes a day, full visibility.',
      problemSolved: 'Small business owners need basic operational oversight but existing solutions are too complex',
      targetMarket: 'Very small businesses and solopreneurs (under 10 employees)',
      businessModel: 'Simple subscription: $29/month',
      revenueProjection: '$350K ARR with 1200 small business subscribers',
      competitiveAdvantage: 'Designed specifically for very small businesses, not enterprise-lite features',
      developmentTime: '2-3 weeks (KPI tracking + simple dashboard + mobile-first design)',
      riskAssessment: 'Low risk. Operations tracking is a proven need. The simplicity angle works for solopreneurs. Main risk is churn - small businesses are price-sensitive and may not see daily value.',
    },
    creative: {
      title: 'AgentHub Coordinator',
      description: 'Platform that orchestrates multiple AI agents for comprehensive business automation. One command center, all your AI tools.',
      problemSolved: 'Businesses want AI automation but struggle to coordinate multiple tools and agents',
      targetMarket: 'SMBs and operations teams needing workflow automation',
      businessModel: 'SaaS: $49/month base + $19/month per additional agent',
      revenueProjection: '$900K ARR with 500 businesses using 3 agents each',
      competitiveAdvantage: 'Only platform designed for multi-agent coordination with business context',
      developmentTime: '5-6 weeks (agent coordination + workflow builder + business templates)',
      riskAssessment: 'Moderate risk. Multi-agent coordination is hot right now but the market is moving fast. LangChain, CrewAI, and others are building similar abstractions. Need to differentiate through business-specific templates rather than generic orchestration.',
    },
    experimental: {
      title: 'Collective Business Intelligence',
      description: 'Network where businesses share anonymized operational data to improve collective performance. A Bloomberg Terminal for SMBs, powered by collective data.',
      problemSolved: 'Small businesses operate in silos, missing insights from collective operational intelligence',
      targetMarket: 'Forward-thinking SMBs and business networks wanting collective optimization',
      businessModel: 'Network participation fees: $299/month + data contribution incentives',
      revenueProjection: '$3M ARR with 800 network participants',
      competitiveAdvantage: 'First platform creating collective business intelligence while maintaining privacy',
      developmentTime: '12-14 weeks (privacy-preserving analytics + network effects + business intelligence)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Businesses are paranoid about sharing data, even anonymized, (2) Network effects require critical mass - the product is useless with 10 participants, (3) Privacy-preserving analytics that are actually useful is an active research problem, (4) The value proposition is abstract until the network is large enough to generate meaningful benchmarks.',
    },
  },
  remy: {
    simple: {
      title: 'Quick Social Posts',
      description: 'Generate a week of social media posts in under 5 minutes from a single topic. Just describe your business, get a content calendar.',
      problemSolved: 'Business owners know they need to post but cannot spend hours creating content',
      targetMarket: 'Solo business owners and freelancers active on social media',
      businessModel: 'Simple subscription: $19/month or $179/year',
      revenueProjection: '$250K ARR with 1200 monthly subscribers',
      competitiveAdvantage: 'Fastest time-to-content with brand-consistent output every time',
      developmentTime: '1-2 weeks (post generation + scheduling integration + brand templates)',
      riskAssessment: 'Low risk. Social media scheduling with AI content is proven (Buffer, Hootsuite adding AI). The bet is on simplicity and speed. Low barrier to entry but also low moat.',
    },
    creative: {
      title: 'Viral Content Predictor',
      description: 'AI that scores content virality potential before you publish and suggests specific optimizations to increase reach.',
      problemSolved: 'Businesses publish blindly hoping content resonates instead of predicting engagement',
      targetMarket: 'Social media managers, influencers, and marketing teams',
      businessModel: 'Per-scan pricing: $0.50/scan or $79/month unlimited',
      revenueProjection: '$500K ARR with 500 unlimited subscribers + pay-per-scan revenue',
      competitiveAdvantage: 'Trained on engagement patterns to identify what humans cannot see before posting',
      developmentTime: '5-6 weeks (ML training on viral data + scoring API + optimization engine)',
      riskAssessment: 'Moderate risk. Virality prediction is inherently unreliable - if it were predictable, everyone would go viral. The tool needs to show measurable improvement in average engagement, not promise guaranteed virality. Managing expectations is key.',
    },
    experimental: {
      title: 'AI Content Studio Network',
      description: 'Decentralized network of specialized AI content creators that collaborate on campaigns - a virtual creative agency that operates autonomously.',
      problemSolved: 'Content agencies are expensive and slow; single AI tools lack creative depth and multi-format capability',
      targetMarket: 'Mid-market brands and agencies managing multiple campaigns simultaneously',
      businessModel: 'Campaign-based: $2K-$10K per campaign + $499/month platform fee',
      revenueProjection: '$2.5M ARR with 100 brands running average 2 campaigns/month',
      competitiveAdvantage: 'First multi-AI creative network that mimics agency team dynamics',
      developmentTime: '10-12 weeks (multi-agent content system + campaign orchestration + brand safety)',
      riskAssessment: 'HIGH RISK. This might not work because: (1) Multi-agent coordination for creative work produces inconsistent output, (2) Brand safety with autonomous AI content is a liability minefield, (3) Campaign pricing at $2K+ requires demonstrably better results than a human freelancer, (4) The "virtual agency" positioning competes with actual agencies who have relationships and trust. High upside but could produce expensive mediocre content.',
    },
  },
  wendy: {
    simple: {
      title: 'Habit Tracker Pro',
      description: 'Clean, simple daily habit tracker with streak tracking and gentle accountability nudges.',
      problemSolved: 'People start habits but quit within 2 weeks because existing trackers are either too complex or too boring',
      targetMarket: 'Individuals wanting to build better daily habits (health, productivity, learning)',
      businessModel: 'Freemium: Free 3 habits, $9/month unlimited + coaching insights',
      revenueProjection: '$200K ARR with 2000 premium subscribers',
      competitiveAdvantage: 'Psychology-backed nudge system that actually helps habits stick, not just tracks them',
      developmentTime: '2-3 weeks (habit tracking + streak system + notification engine)',
      riskAssessment: 'Low risk. Habit trackers are a proven category. Streaks work. The challenge is standing out from Habitica, Streaks, and dozens of others. The coaching angle is the differentiator.',
    },
    creative: {
      title: 'Performance Coach AI',
      description: 'AI coaching platform that combines productivity tracking, energy management, and behavioral psychology to help professionals perform at their peak.',
      problemSolved: 'High performers plateau because generic productivity advice ignores individual patterns and energy cycles',
      targetMarket: 'Professionals and entrepreneurs who want to optimize their performance ($75K+ income)',
      businessModel: 'SaaS: $49/month individual, $199/month team with manager dashboards',
      revenueProjection: '$600K ARR with 800 individual + 50 team subscribers',
      competitiveAdvantage: 'Only coaching tool that adapts to individual energy patterns and behavioral data',
      developmentTime: '5-6 weeks (behavioral tracking + coaching engine + energy optimization)',
      riskAssessment: 'Moderate risk. Performance coaching is subjective - hard to prove ROI quantitatively. User engagement drops after the novelty period. The AI coaching needs to feel genuinely personalized, not generic "drink more water" advice.',
    },
    experimental: {
      title: 'Predictive Burnout Prevention',
      description: 'AI system that detects burnout signals weeks before the person realizes it and automatically adjusts their workload, schedule, and habits.',
      problemSolved: 'Burnout costs $300B+ annually and people dont recognize it until its too late to prevent',
      targetMarket: 'Companies with knowledge workers who want to prevent burnout-driven turnover',
      businessModel: 'Enterprise: $15/employee/month with anonymous wellness dashboards for management',
      revenueProjection: '$2M ARR with 50 companies averaging 250 employees each',
      competitiveAdvantage: 'First system that predicts burnout from digital behavior patterns before self-reporting',
      developmentTime: '10-14 weeks (behavioral signal collection + burnout prediction models + intervention system)',
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
    };
  }
}

function statusColor(s: string) { return s === 'approved' || s === 'launched' ? brand.success : s === 'reviewed' ? brand.amber : s === 'building' ? brand.info : s === 'rejected' ? brand.error : brand.smoke; }
function mktColor(s: string) { return s === 'massive' ? brand.success : s === 'large' ? brand.info : s === 'medium' ? brand.amber : brand.smoke; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function getReasoning(idea: AgentIdea) { return idea.agentId === 'collaborative' ? AGENT_REASONING.collaborative : AGENT_REASONING[idea.agentId] || '"This leverages my domain expertise to solve a real market need."'; }
function riskColor(level: CreativityLevel) { return level === 'experimental' ? '#EF4444' : level === 'creative' ? brand.amber : brand.smoke; }

export default function AgentIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<AgentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENTS.map(a => a.id));
  const [ideaMode, setIdeaMode] = useState<IdeaMode>('individual');
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('creative');
  const [selectedMarketSize, setSelectedMarketSize] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'confidence' | 'revenue'>('newest');

  const toggle = (id: string) => setSelectedAgents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const rate = (id: string, r: number) => setIdeas(p => p.map(i => i.id === id ? { ...i, derekRating: r } : i));
  const reject = (id: string) => setIdeas(p => p.map(i => i.id === id ? { ...i, status: 'rejected' as const } : i));

  const generate = () => {
    if (selectedAgents.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      if (ideaMode === 'collaborative') setIdeas(p => [genCollab(selectedAgents, creativityLevel), ...p]);
      else setIdeas(p => [...genIndividual(selectedAgents, creativityLevel), ...p]);
      setIsLoading(false);
    }, 1200);
  };

  const filtered = ideas.filter(i => {
    if (selectedMarketSize && i.marketSize !== selectedMarketSize) return false;
    if (selectedStatus && i.status !== selectedStatus) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'rating') return (b.derekRating || 0) - (a.derekRating || 0);
    if (sortBy === 'confidence') return b.agentConfidence - a.agentConfidence;
    const aR = parseFloat(a.revenueProjection.match(/\$([0-9.]+)M/)?.[1] || a.revenueProjection.match(/\$([0-9.]+)K/)?.[1]?.replace(/K/, '') || '0');
    const bR = parseFloat(b.revenueProjection.match(/\$([0-9.]+)M/)?.[1] || b.revenueProjection.match(/\$([0-9.]+)K/)?.[1]?.replace(/K/, '') || '0');
    return bR - aR;
  });

  const allSelected = selectedAgents.length === AGENTS.length;
  const sel = { background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '8px 12px', color: brand.white, fontSize: '14px', outline: 'none' } as React.CSSProperties;
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

        {/* ── Filters ── */}
        {ideas.length > 0 && (
          <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={selectedMarketSize || ''} onChange={e => setSelectedMarketSize(e.target.value || null)} style={sel}><option value="">All Markets</option>{Array.from(new Set(ideas.map(i => i.marketSize))).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select>
              <select value={selectedStatus || ''} onChange={e => setSelectedStatus(e.target.value || null)} style={sel}><option value="">All Status</option>{Array.from(new Set(ideas.map(i => i.status))).map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}</select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={sel}><option value="newest">Newest</option><option value="rating">Rating</option><option value="confidence">Confidence</option><option value="revenue">Revenue</option></select>
            </div>
            <div style={{ display: 'flex', gap: '12px', color: brand.smoke, fontSize: '14px' }}>
              <span>{filtered.length} ideas</span><span>|</span><span>{ideas.filter(i => i.derekRating && i.derekRating >= 4).length} highly rated</span>
            </div>
          </div>
        )}

        {/* ── Idea Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sorted.map(idea => {
            const agent = AGENTS.find(a => a.id === idea.agentId);
            const ideaCreativity = idea.tags.find(t => ['simple', 'creative', 'experimental'].includes(t)) as CreativityLevel || 'creative';
            return (
              <div key={idea.id} style={{ ...styles.card, padding: '28px', border: idea.derekRating && idea.derekRating >= 4 ? `1px solid ${brand.amber}` : `1px solid ${brand.border}` }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: agent?.color || brand.smoke, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.void, fontWeight: 700, fontSize: '14px' }}>{idea.agentName.substring(0, 2)}</div>
                    <div>
                      <h2 style={{ color: brand.white, fontSize: '22px', fontWeight: 700, margin: 0, marginBottom: '4px' }}>{idea.title}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: brand.smoke, fontSize: '14px' }}>by {idea.agentName}</span>
                        <span style={{ color: brand.smoke }}>|</span>
                        <span style={{ color: brand.smoke, fontSize: '12px' }}>{fmtDate(idea.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${mktColor(idea.marketSize)}20`, color: mktColor(idea.marketSize), textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={14} />{idea.marketSize} market</span>
                    <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${statusColor(idea.status)}20`, color: statusColor(idea.status), textTransform: 'uppercase' }}>{idea.status.replace('-', ' ')}</span>
                  </div>
                </div>

                <p style={{ color: brand.silver, fontSize: '16px', lineHeight: '1.6', marginBottom: '16px', fontWeight: 500 }}>{idea.description}</p>

                {/* Business Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={sec}><h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Problem Solved</h4><p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{idea.problemSolved}</p></div>
                  <div style={sec}><h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Target Market</h4><p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{idea.targetMarket}</p></div>
                  <div style={sec}><h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Business Model</h4><p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{idea.businessModel}</p></div>
                  <div style={sec}><h4 style={{ color: brand.success, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Revenue Projection</h4><p style={{ color: brand.white, fontSize: '16px', fontWeight: 700, margin: 0 }}>{idea.revenueProjection}</p></div>
                  <div style={sec}><h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Competitive Advantage</h4><p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{idea.competitiveAdvantage}</p></div>
                  <div style={sec}><h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Development Time</h4><p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{idea.developmentTime}</p></div>
                </div>

                {/* Risk Assessment */}
                {idea.riskAssessment && (
                  <div style={{ ...sec, marginBottom: '16px', border: `1px solid ${riskColor(ideaCreativity)}30`, background: `${riskColor(ideaCreativity)}08` }}>
                    <h4 style={{ color: riskColor(ideaCreativity), fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} />Risk Assessment
                    </h4>
                    <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.5' }}>{idea.riskAssessment}</p>
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {idea.tags.map(tag => <span key={tag} style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', background: brand.graphite, color: brand.smoke, border: `1px solid ${brand.border}` }}>#{tag}</span>)}
                </div>

                {/* Agent Reasoning */}
                <div style={{ ...sec, marginBottom: '16px' }}>
                  <h4 style={{ color: brand.info, fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} />Agent Reasoning</h4>
                  <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>{getReasoning(idea)}</p>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: `${brand.amber}08`, borderRadius: '8px', border: `1px solid ${brand.border}`, marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, margin: 0, marginBottom: '6px' }}>My Rating</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {stars(idea.derekRating, idea.id)}
                      {idea.derekRating && <span style={{ color: brand.smoke, fontSize: '12px', marginLeft: '8px' }}>({idea.derekRating}/5)</span>}
                    </div>
                  </div>
                  {!idea.derekRating && <span style={{ color: brand.smoke, fontSize: '12px' }}>Click stars to rate</span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => reject(idea.id)} disabled={idea.status === 'rejected'} style={{
                      background: idea.status === 'rejected' ? brand.error : 'transparent', color: idea.status === 'rejected' ? brand.void : brand.error,
                      border: `1px solid ${brand.error}`, borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: 600,
                      cursor: idea.status === 'rejected' ? 'default' : 'pointer', opacity: idea.status === 'rejected' ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px',
                    }}><ThumbsDown size={14} />{idea.status === 'rejected' ? 'Rejected' : 'Reject'}</button>
                    <button onClick={() => router.push(`/os/ideas-vault?add_title=${encodeURIComponent(idea.title)}&add_desc=${encodeURIComponent(idea.description)}`)} style={{
                      background: 'transparent', color: brand.warning || brand.amber, border: `1px solid ${brand.warning || brand.amber}`, borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}><Archive size={14} />Move to Idea Vault</button>
                    <button onClick={() => router.push(`/os/kanban?add_title=${encodeURIComponent(idea.title)}&add_project=${encodeURIComponent(idea.agentName)}`)} style={{
                      background: 'transparent', color: brand.info, border: `1px solid ${brand.info}`, borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}><Zap size={14} />Move to Kanban</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '60px 40px' }}>
            <Lightbulb size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No ideas yet</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>Select your agents and hit generate.</p>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}