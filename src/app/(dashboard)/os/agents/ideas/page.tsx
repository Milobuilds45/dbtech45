'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { brand, styles } from '@/lib/brand';
import { Star, Zap, Target, ThumbsDown, Archive, Users, User, Lightbulb, Brain, Sparkles, Shield } from 'lucide-react';
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
  tags: string[];
  derekRating?: number;
  agentConfidence: number;
  marketSize: 'small' | 'medium' | 'large' | 'massive';
  status: 'submitted' | 'reviewed' | 'approved' | 'building' | 'rejected' | 'launched';
  createdAt: string;
  updatedAt: string;
}

type IdeaMode = 'individual' | 'collaborative';
type CreativityLevel = 'safe' | 'creative' | 'experimental' | 'simple';

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
  wendy: '"Customer support is the #1 complaint for growing businesses. AI can handle 80% of tickets instantly while maintaining quality."',
  collaborative: '"By combining our different areas of expertise, we create solutions neither of us could build alone. This is genuine cross-domain innovation."',
};

interface IdeaTemplate { title: string; description: string; problemSolved: string; targetMarket: string; businessModel: string; revenueProjection: string; competitiveAdvantage: string; developmentTime: string; }

const T: Record<string, Record<CreativityLevel, IdeaTemplate>> = {
  bobby: {
    safe: { title: 'OptionsFlow Pro', description: 'Real-time options flow tracking with AI pattern recognition for retail and professional traders.', problemSolved: 'Retail traders miss 80% of profitable opportunities due to lack of institutional-grade options flow data', targetMarket: 'Active retail traders and small hedge funds ($10K-$500K accounts)', businessModel: 'Tiered SaaS: $49/month retail, $199/month professional', revenueProjection: '$500K ARR with 500 retail + 50 professional subscribers', competitiveAdvantage: 'First retail-accessible platform with institutional-grade options flow analysis', developmentTime: '3-4 weeks (AI data processing + React dashboard + payment integration)' },
    creative: { title: 'CryptoFlow Analytics', description: 'AI that analyzes crypto options flow, social sentiment, and whale movements for trading signals.', problemSolved: 'Crypto traders lack sophisticated analysis tools available in traditional markets', targetMarket: 'Crypto traders and DeFi protocols ($25K+ portfolios)', businessModel: 'Subscription: $89/month individuals, $399/month for protocols', revenueProjection: '$800K ARR with 400 individual + 25 protocol subscribers', competitiveAdvantage: 'Only platform combining traditional options analysis with crypto-specific data sources', developmentTime: '4-6 weeks (crypto API integrations + ML models + web3 features)' },
    experimental: { title: 'Quantum Trading Prediction Engine', description: 'Quantum computing-powered market prediction using parallel universe simulations of market outcomes.', problemSolved: 'Traditional AI can only process historical patterns, not explore parallel probability spaces', targetMarket: 'Hedge funds, quant firms, and institutional traders with $100M+ AUM', businessModel: 'Enterprise licensing: $50K/month + performance fees on alpha generated', revenueProjection: '$10M ARR with 15 institutional clients', competitiveAdvantage: 'First quantum-powered trading system exploring parallel market realities', developmentTime: '12-18 weeks (quantum algorithm development + institutional partnerships)' },
    simple: { title: 'Simple Trading Alerts', description: 'Clean, straightforward options and stock alerts for busy retail investors.', problemSolved: 'Most trading platforms are too complex for casual investors who just want simple alerts', targetMarket: 'Casual retail investors and busy professionals', businessModel: 'Simple subscription: $19/month or $199/year', revenueProjection: '$300K ARR with 1,500 monthly subscribers', competitiveAdvantage: 'Simplicity over complexity - designed for normal people, not day traders', developmentTime: '2-3 weeks (alert system + mobile app + basic dashboard)' },
  },
  tony: {
    safe: { title: 'RestaurantOS', description: 'Complete restaurant management platform with POS integration and cost tracking.', problemSolved: 'Small restaurants lose 20-30% profit to poor inventory and labor management', targetMarket: 'Independent restaurants and small chains (1-10 locations, $500K-$5M revenue)', businessModel: 'Per-location SaaS: $89/month + $199 setup fee', revenueProjection: '$600K ARR with 500 restaurant locations', competitiveAdvantage: 'Built by actual restaurant operators, not software companies', developmentTime: '5-6 weeks (POS integrations + inventory tracking + labor scheduling)' },
    creative: { title: 'AI Kitchen Optimizer', description: 'Smart system that predicts demand and optimizes prep schedules to reduce waste.', problemSolved: 'Restaurants waste $162B annually due to poor demand forecasting and over-preparation', targetMarket: 'Fast-casual restaurants and ghost kitchens with high volume', businessModel: 'Revenue share: 10% of documented waste reduction savings', revenueProjection: '$1.2M ARR by reducing waste for 200 restaurants by average $6K/year each', competitiveAdvantage: 'First AI specifically trained on restaurant kitchen operations and waste patterns', developmentTime: '6-8 weeks (ML training on kitchen data + POS integration)' },
    experimental: { title: 'Ghost Kitchen Network AI', description: 'AI that dynamically matches ghost kitchen capacity with real-time delivery demand across a metro area.', problemSolved: 'Ghost kitchens operate at 40% utilization while delivery demand fluctuates wildly', targetMarket: 'Ghost kitchen operators and restaurant chains expanding delivery', businessModel: 'Platform fee: 5% of matched orders + $499/month per kitchen node', revenueProjection: '$3M ARR with 200 kitchen nodes processing $60M in orders', competitiveAdvantage: 'First network-level optimization for ghost kitchen capacity matching', developmentTime: '8-10 weeks (demand prediction + kitchen matching + logistics)' },
    simple: { title: 'Daily Restaurant Tracker', description: 'Simple daily tracking for food costs, sales, and basic restaurant metrics.', problemSolved: 'Restaurant owners need basic financial oversight but existing solutions are too complex', targetMarket: 'Very small restaurants and food trucks (under $1M revenue)', businessModel: 'Affordable SaaS: $29/month', revenueProjection: '$200K ARR with 600 small restaurant subscribers', competitiveAdvantage: 'Designed for mom-and-pop restaurants, not chains', developmentTime: '2-3 weeks (basic tracking + mobile-first design + simple reports)' },
  },
  paula: {
    safe: { title: 'BrandBot AI', description: 'AI-powered brand identity generator that creates logos, colors, and guidelines for small businesses.', problemSolved: 'Small businesses pay $2K-$5K for branding they could get for under $100 with AI', targetMarket: 'Small business owners, entrepreneurs, and freelancers starting new ventures', businessModel: 'One-time purchase: $47 basic, $97 premium, $197 complete package', revenueProjection: '$400K ARR with 300 premium sales per month', competitiveAdvantage: 'Professional designer quality at 95% cost reduction through AI automation', developmentTime: '3-4 weeks (AI brand generation + asset export + payment processing)' },
    creative: { title: 'Emotional Design Engine', description: 'AI that creates designs optimized for specific emotional responses and conversion goals.', problemSolved: 'Businesses guess at design psychology instead of using data-driven emotional optimization', targetMarket: 'E-commerce brands and marketing agencies focused on conversion optimization', businessModel: 'SaaS subscription: $97/month + usage fees for A/B testing', revenueProjection: '$600K ARR with 150 agencies and 300 e-commerce brands', competitiveAdvantage: 'Only platform combining design generation with emotional psychology and conversion data', developmentTime: '5-6 weeks (psychology models + A/B testing + design generation)' },
    experimental: { title: 'Consciousness-Based UX', description: 'Design system that adapts in real-time based on user subconscious responses and biometric feedback.', problemSolved: 'Design decisions miss 95% of user responses that happen subconsciously', targetMarket: 'Enterprise UX teams and cutting-edge product companies', businessModel: 'Enterprise licensing: $5K/month + hardware integration fees', revenueProjection: '$2M ARR with 30 enterprise clients', competitiveAdvantage: 'First design system using real-time biometric feedback for UI optimization', developmentTime: '12-16 weeks (biometric integration + ML models + design adaptation)' },
    simple: { title: 'Quick Logo Maker', description: 'Super simple tool for creating professional logos with minimal input required.', problemSolved: 'Entrepreneurs need logos immediately but design tools are too complicated', targetMarket: 'Solo entrepreneurs, side hustlers, and very small businesses', businessModel: 'Freemium: Free basic logos, $19 for high-res + commercial rights', revenueProjection: '$150K ARR with 800 premium downloads per month', competitiveAdvantage: 'Fastest logo creation (under 2 minutes) with professional quality', developmentTime: '1-2 weeks (streamlined UI + logo generation + instant download)' },
  },
  anders: {
    safe: { title: 'DesignOps Studio', description: 'Design system platform that converts designs into production-ready React components.', problemSolved: 'Design-to-development handoff wastes 40% of project time and creates inconsistencies', targetMarket: 'Small development teams and agencies (5-50 people) building React apps', businessModel: 'SaaS: $39/month per designer, $19/month per developer', revenueProjection: '$600K ARR with 200 teams using average 5 seats each', competitiveAdvantage: 'Only platform combining design system thinking with enterprise-grade code generation', developmentTime: '4-6 weeks (design processing + code generation + component library)' },
    creative: { title: 'No-Code Backend Builder', description: 'Visual interface for building scalable APIs and databases without writing code.', problemSolved: 'Non-technical founders need custom backends but cannot afford $100K+ development costs', targetMarket: 'Non-technical entrepreneurs and small businesses needing custom software', businessModel: 'Usage-based: $29/month base + $0.10 per API call', revenueProjection: '$800K ARR with 500 active projects', competitiveAdvantage: 'Enterprise-grade architecture with consumer-friendly visual interface', developmentTime: '6-8 weeks (visual editor + code generation + deployment automation)' },
    experimental: { title: 'AI Code Architect', description: 'AI system that designs entire application architectures and generates production code.', problemSolved: 'Even experienced developers spend weeks architecting systems that could be generated instantly', targetMarket: 'Development agencies and enterprise engineering teams', businessModel: 'Per-project licensing: $999 per application + $199/month maintenance', revenueProjection: '$1.5M ARR with 50 agencies building 3 apps each annually', competitiveAdvantage: 'First AI that understands enterprise architecture patterns and generates production-ready systems', developmentTime: '10-12 weeks (architecture AI training + code generation + enterprise integrations)' },
    simple: { title: 'Simple Deploy', description: 'One-click deployment for web applications with automatic scaling.', problemSolved: 'Developers waste hours on deployment configuration instead of building features', targetMarket: 'Individual developers and small teams building web apps', businessModel: 'Usage-based: $5/month base + $0.01 per deployment hour', revenueProjection: '$300K ARR with 1000 active developers', competitiveAdvantage: 'Simplest deployment experience with automatic optimization and scaling', developmentTime: '3-4 weeks (deployment automation + scaling logic + monitoring dashboard)' },
  },
  dwight: {
    safe: { title: 'CompetitorWatch', description: 'Automated competitive monitoring platform with weekly intelligence reports.', problemSolved: 'Businesses make strategic decisions blindly while competitors move faster', targetMarket: 'B2B SaaS companies and marketing teams (10-500 employees)', businessModel: 'Tiered SaaS: $199/month startup, $499/month growth', revenueProjection: '$800K ARR with 100 growth-tier customers', competitiveAdvantage: 'Only platform combining investigative journalism rigor with automated monitoring', developmentTime: '4-5 weeks (monitoring setup + analysis engine + reporting dashboard)' },
    creative: { title: 'TrendScope AI', description: 'AI system that predicts market trends by analyzing weak signals across global data sources.', problemSolved: 'Businesses react to trends instead of anticipating them, missing first-mover advantages', targetMarket: 'Strategy consultants, VCs, and Fortune 500 strategy teams', businessModel: 'Enterprise SaaS: $2999/month + custom research projects', revenueProjection: '$1.8M ARR with 50 enterprise clients', competitiveAdvantage: 'Only AI trained specifically on weak signal detection and trend prediction', developmentTime: '8-10 weeks (AI training on trend data + prediction models + enterprise dashboard)' },
    experimental: { title: 'Global Intelligence Network', description: 'Crowdsourced intelligence platform where human analysts and AI collaborate on research.', problemSolved: 'Traditional intelligence is either expensive consultants or incomplete AI', targetMarket: 'Government agencies, large corporations, and research institutions', businessModel: 'Platform fees: 20% of research projects + $5K/month platform access', revenueProjection: '$5M ARR with $25M in platform research volume', competitiveAdvantage: 'First platform combining human intelligence expertise with AI scale', developmentTime: '12-16 weeks (analyst network + AI collaboration tools + security infrastructure)' },
    simple: { title: 'News Digest Pro', description: 'Personalized daily news briefings with AI-powered summaries.', problemSolved: 'Busy professionals need relevant news but cannot spend time filtering through noise', targetMarket: 'Executives and professionals who need industry-specific news', businessModel: 'Subscription: $19/month individual, $99/month team', revenueProjection: '$400K ARR with 1500 individual subscribers', competitiveAdvantage: 'Human-curated sources with AI-powered personalization', developmentTime: '2-3 weeks (news aggregation + AI summarization + personalization engine)' },
  },
  dax: {
    safe: { title: 'DataStory Builder', description: 'Platform that converts raw data into executive-ready presentations automatically.', problemSolved: 'Data analysts spend 80% of time formatting reports instead of finding insights', targetMarket: 'Data analysts, consultants, and executives at mid-size companies', businessModel: 'SaaS: $79/month individual, $299/month team', revenueProjection: '$700K ARR with 200 team subscriptions', competitiveAdvantage: 'Only platform combining statistical rigor with executive communication', developmentTime: '4-5 weeks (data processing + narrative generation + presentation automation)' },
    creative: { title: 'Predictive Business Simulator', description: 'AI that creates interactive business simulations to test strategic decisions.', problemSolved: 'Executives make million-dollar decisions based on static projections instead of dynamic modeling', targetMarket: 'Strategy teams at Fortune 1000 companies and consulting firms', businessModel: 'Enterprise licensing: $10K setup + $2K/month per simulation', revenueProjection: '$2M ARR with 80 enterprise simulations', competitiveAdvantage: 'First business simulation platform using real company data and AI scenario modeling', developmentTime: '8-10 weeks (simulation engine + AI scenario modeling + enterprise integrations)' },
    experimental: { title: 'Quantum Data Analytics', description: 'Quantum computing-powered analytics that processes complex datasets in parallel dimensions.', problemSolved: 'Traditional computing cannot handle the complexity of modern multi-dimensional business data', targetMarket: 'Research institutions, Fortune 50 companies, and government agencies', businessModel: 'Quantum-as-a-Service: $50K/month + usage fees', revenueProjection: '$10M ARR with 15 quantum computing clients', competitiveAdvantage: 'First commercial quantum analytics platform for business intelligence', developmentTime: '16-20 weeks (quantum algorithm development + cloud infrastructure + enterprise security)' },
    simple: { title: 'Simple Charts', description: 'Dead simple tool for creating beautiful charts from spreadsheet data.', problemSolved: 'Most people need basic charts but find existing tools too complicated or ugly', targetMarket: 'Small business owners, students, and professionals who need quick visualizations', businessModel: 'Freemium: Free basic charts, $9/month for premium templates', revenueProjection: '$180K ARR with 2000 premium subscribers', competitiveAdvantage: 'Fastest chart creation with the most beautiful default templates', developmentTime: '2-3 weeks (chart generation + template library + data import)' },
  },
  milo: {
    safe: { title: 'AgentHub Coordinator', description: 'Platform that orchestrates multiple AI agents for comprehensive business automation.', problemSolved: 'Businesses want AI automation but struggle to coordinate multiple tools and agents', targetMarket: 'SMBs and operations teams needing workflow automation', businessModel: 'SaaS: $49/month base + $19/month per additional agent', revenueProjection: '$900K ARR with 500 businesses using 3 agents each', competitiveAdvantage: 'Only platform designed for multi-agent coordination with business context', developmentTime: '5-6 weeks (agent coordination + workflow builder + business templates)' },
    creative: { title: 'Business Operating System', description: 'AI-powered command center that manages all aspects of business operations automatically.', problemSolved: 'Business owners juggle 15+ different tools with no central coordination or intelligence', targetMarket: 'Growing businesses (10-100 employees) with complex operations', businessModel: 'All-in-one platform: $199/month + per-employee fees', revenueProjection: '$1.2M ARR with 300 growing businesses', competitiveAdvantage: 'First true business operating system with AI coordination across all functions', developmentTime: '8-10 weeks (integration platform + AI coordination + business intelligence dashboard)' },
    experimental: { title: 'Collective Business Intelligence', description: 'Network where businesses share anonymized operational data to improve collective performance.', problemSolved: 'Businesses operate in silos, missing insights from collective operational intelligence', targetMarket: 'Forward-thinking SMBs and business networks wanting collective optimization', businessModel: 'Network participation fees: $299/month + data contribution incentives', revenueProjection: '$3M ARR with 800 network participants', competitiveAdvantage: 'First platform creating collective business intelligence while maintaining privacy', developmentTime: '12-14 weeks (privacy-preserving analytics + network effects + business intelligence)' },
    simple: { title: 'Daily Operations Tracker', description: 'Simple dashboard for small business owners to track daily operations and KPIs.', problemSolved: 'Small business owners need basic operational oversight but existing solutions are too complex', targetMarket: 'Very small businesses and solopreneurs (under 10 employees)', businessModel: 'Simple subscription: $29/month', revenueProjection: '$350K ARR with 1200 small business subscribers', competitiveAdvantage: 'Designed specifically for very small businesses, not enterprise-lite', developmentTime: '2-3 weeks (KPI tracking + simple dashboard + mobile-first design)' },
  },
  remy: {
    safe: { title: 'ContentForge AI', description: 'AI content creation platform tailored for small business marketing across all channels.', problemSolved: 'Small businesses spend $3K-$8K/month on content agencies for mediocre output', targetMarket: 'Small businesses and solopreneurs doing their own marketing', businessModel: 'SaaS: $49/month starter, $129/month growth, $299/month agency', revenueProjection: '$700K ARR with 400 growth-tier + 50 agency subscribers', competitiveAdvantage: 'Purpose-built for small business voice and multi-channel consistency', developmentTime: '3-4 weeks (content generation + brand voice training + channel adapters)' },
    creative: { title: 'Viral Content Predictor', description: 'AI that scores content virality potential before publishing and suggests optimizations.', problemSolved: 'Businesses publish blindly hoping content resonates instead of predicting engagement', targetMarket: 'Social media managers, influencers, and marketing teams', businessModel: 'Per-scan pricing: $0.50/scan or $79/month unlimited', revenueProjection: '$500K ARR with 500 unlimited subscribers + pay-per-scan revenue', competitiveAdvantage: 'Trained on 10M+ viral posts to identify patterns humans cannot see', developmentTime: '5-6 weeks (ML training on viral data + scoring API + optimization engine)' },
    experimental: { title: 'AI Content Studio Network', description: 'Decentralized network of specialized AI content creators that collaborate on campaigns.', problemSolved: 'Content agencies are expensive and slow; single AI tools lack creative depth', targetMarket: 'Mid-market brands and agencies managing multiple campaigns simultaneously', businessModel: 'Campaign-based: $2K-$10K per campaign + $499/month platform fee', revenueProjection: '$2.5M ARR with 100 brands running average 2 campaigns/month', competitiveAdvantage: 'First multi-AI creative network that mimics agency team dynamics', developmentTime: '10-12 weeks (multi-agent content system + campaign orchestration + brand safety)' },
    simple: { title: 'Quick Social Posts', description: 'Generate a week of social media posts in under 5 minutes from a single topic.', problemSolved: 'Business owners know they need to post but cannot spend hours creating content', targetMarket: 'Solo business owners and freelancers active on social media', businessModel: 'Simple subscription: $19/month or $179/year', revenueProjection: '$250K ARR with 1200 monthly subscribers', competitiveAdvantage: 'Fastest time-to-content with brand-consistent output every time', developmentTime: '1-2 weeks (post generation + scheduling integration + brand templates)' },
  },
  wendy: {
    safe: { title: 'SupportBot Pro', description: 'AI customer support agent that handles 80% of tickets without human intervention.', problemSolved: 'Growing businesses cannot scale support staff fast enough and quality drops', targetMarket: 'E-commerce and SaaS companies with 100-10K support tickets/month', businessModel: 'Per-resolution pricing: $0.25/ticket or $199/month unlimited', revenueProjection: '$800K ARR with 300 unlimited subscribers', competitiveAdvantage: 'Trains on actual company data in hours, not weeks like competitors', developmentTime: '4-5 weeks (NLP engine + ticket system integrations + training pipeline)' },
    creative: { title: 'Empathy Engine', description: 'AI that detects customer emotion in real-time and adapts support tone accordingly.', problemSolved: 'Generic bot responses frustrate already-upset customers and increase churn', targetMarket: 'Premium brands and subscription services where retention is critical', businessModel: 'SaaS: $399/month + $0.10 per emotion-adapted interaction', revenueProjection: '$1M ARR with 150 premium brand subscribers', competitiveAdvantage: 'Only AI support tool with real-time emotional intelligence calibration', developmentTime: '6-8 weeks (emotion detection models + response adaptation + analytics dashboard)' },
    experimental: { title: 'Predictive Customer Success', description: 'AI that predicts customer churn before it happens and automatically intervenes.', problemSolved: 'Companies lose customers silently because they only react to complaints, never predict them', targetMarket: 'SaaS companies and subscription businesses with 1K+ customers', businessModel: 'Revenue share: 10% of prevented churn value or $999/month flat', revenueProjection: '$3M ARR with 200 SaaS companies preventing average $15K/year in churn each', competitiveAdvantage: 'First platform combining usage analytics, sentiment, and behavioral prediction for churn prevention', developmentTime: '10-14 weeks (churn prediction models + intervention automation + CRM integrations)' },
    simple: { title: 'FAQ Bot Builder', description: 'Build a smart FAQ chatbot for your website in 10 minutes with zero code.', problemSolved: 'Small businesses answer the same 20 questions hundreds of times per month', targetMarket: 'Small businesses and freelancers with basic customer support needs', businessModel: 'Freemium: Free for 50 chats/month, $29/month unlimited', revenueProjection: '$200K ARR with 700 paid subscribers', competitiveAdvantage: 'Fastest setup time with the smartest default responses from training data', developmentTime: '1-2 weeks (FAQ ingestion + chat widget + basic analytics)' },
  },
};

const DEFAULT_IDEA: AgentIdea = {
  id: 'default-bobby-1', agentId: 'bobby', agentName: 'Bobby',
  title: 'OptionsFlow Pro', description: 'Real-time options flow tracking with AI pattern recognition for retail and professional traders.',
  problemSolved: 'Retail traders miss 80% of profitable opportunities due to lack of institutional-grade options flow data',
  targetMarket: 'Active retail traders and small hedge funds ($10K-$500K accounts)',
  businessModel: 'Tiered SaaS: $49/month retail, $199/month professional',
  revenueProjection: '$500K ARR with 500 retail + 50 professional subscribers',
  competitiveAdvantage: 'First retail-accessible platform with institutional-grade options flow analysis',
  developmentTime: '3-4 weeks (AI data processing + React dashboard + payment integration)',
  tags: ['bobby', 'safe', 'fintech', 'trading', 'ai'], derekRating: 4, agentConfidence: 5, marketSize: 'large',
  status: 'submitted', createdAt: '2026-02-11T09:00:00Z', updatedAt: '2026-02-11T09:00:00Z',
};

function genIndividual(agentIds: string[], creativity: CreativityLevel): AgentIdea[] {
  const out: AgentIdea[] = [];
  agentIds.forEach(agentId => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) return;
    const set = T[agentId]; if (!set) return;
    const tmpl = set[creativity]; if (!tmpl) return;
    out.push({ id: `${agentId}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, agentId, agentName: agent.name, ...tmpl,
      tags: [agentId, creativity, 'ai-timeline'], agentConfidence: creativity === 'experimental' ? 3 : creativity === 'simple' ? 5 : 4,
      marketSize: creativity === 'simple' ? 'small' : creativity === 'experimental' ? 'massive' : 'medium',
      status: 'submitted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });
  return out;
}

function genCollab(agentIds: string[], creativity: CreativityLevel): AgentIdea {
  try {
    const c = generateRealCollaboration(agentIds, creativity);
    return { id: `collab-${Date.now()}`, agentId: 'collaborative',
      agentName: c.collaboratingAgents.map((cid: string) => AGENTS.find(a => a.id === cid)?.name || cid).join(' + '),
      title: c.title, description: c.description, problemSolved: c.sevenLayers.problem, targetMarket: c.sevenLayers.people,
      businessModel: `${c.pricing.model} - $${c.pricing.pricePoint}/month`, revenueProjection: c.sevenLayers.profit,
      competitiveAdvantage: c.competitiveAdvantage, developmentTime: c.realisticTimeline.total,
      tags: [...c.collaboratingAgents, 'collaborative', creativity], agentConfidence: 5, marketSize: 'large',
      status: 'submitted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  } catch {
    const names = agentIds.map(id => AGENTS.find(a => a.id === id)?.name).filter(Boolean);
    return { id: `collab-${Date.now()}`, agentId: 'collaborative', agentName: names.join(' + '),
      title: 'Cross-Domain Innovation Platform', description: `AI platform combining ${names.join(' and ')} expertise for comprehensive business solutions.`,
      problemSolved: 'Businesses need multiple expert perspectives but cannot afford diverse specialist consultants.',
      targetMarket: 'Growing businesses needing multi-domain expertise (50-500 employees)',
      businessModel: 'SaaS subscription: $299/month + per-consultation fees', revenueProjection: '$1.2M ARR with 300 business subscribers',
      competitiveAdvantage: `First platform combining ${names.join(', ')} specialized knowledge in coordinated solutions`,
      developmentTime: '6-8 weeks (multi-agent coordination + specialized modules)',
      tags: [...agentIds, 'collaborative', creativity], agentConfidence: 4, marketSize: 'large',
      status: 'submitted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
}

function statusColor(s: string) { return s === 'approved' || s === 'launched' ? brand.success : s === 'reviewed' ? brand.amber : s === 'building' ? brand.info : s === 'rejected' ? brand.error : brand.smoke; }
function mktColor(s: string) { return s === 'massive' ? brand.success : s === 'large' ? brand.info : s === 'medium' ? brand.amber : brand.smoke; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function getReasoning(idea: AgentIdea) { return idea.agentId === 'collaborative' ? AGENT_REASONING.collaborative : AGENT_REASONING[idea.agentId] || '"This leverages my domain expertise to solve a real market need."'; }

export default function AgentIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<AgentIdea[]>([DEFAULT_IDEA]);
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

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Agent Ideas</h1>
        <p style={styles.subtitle}>Business ideas from your agents. Generate, rate, and move the best ones to Kanban.</p>

        {/* Generator */}
        <div style={{ ...styles.card, padding: '28px', marginBottom: '28px', border: `2px solid ${brand.border}`, borderRadius: '16px' }}>
          {/* Select Agents */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: brand.smoke, fontSize: '14px', fontWeight: 600, alignSelf: 'center' }}>Select Agents</span>
              <button onClick={() => setSelectedAgents(AGENTS.map(a => a.id))} style={{ background: brand.void, color: allSelected ? brand.amber : brand.white, border: allSelected ? `2px solid ${brand.amber}` : `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: allSelected ? 1 : 0.6 }}>All</button>
              <button onClick={() => setSelectedAgents([])} style={{ background: brand.graphite, color: brand.smoke, border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Clear</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {AGENTS.map(agent => {
                const on = selectedAgents.includes(agent.id);
                return (
                  <button key={agent.id} onClick={() => toggle(agent.id)} style={{
                    background: brand.void, color: brand.white, border: on ? `2px solid ${agent.color}` : `1px solid ${brand.border}`,
                    borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: on ? 1 : 0.5,
                    boxShadow: on ? `0 0 12px ${agent.color}30` : 'none', transition: 'all 0.2s',
                  }}>{agent.name}</button>
                );
              })}
            </div>
          </div>

          {/* Mode + Creativity */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: brand.smoke, marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([['individual', 'Individual', User] as const, ['collaborative', 'Collaborative', Users] as const]).map(([val, label, Icon]) => (
                  <button key={val} onClick={() => setIdeaMode(val)} style={{
                    background: brand.void, color: ideaMode === val ? brand.info : brand.white, border: ideaMode === val ? `2px solid ${brand.info}` : `1px solid ${brand.border}`,
                    borderRadius: '6px', padding: '8px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: ideaMode === val ? 1 : 0.6,
                  }}><Icon size={14} />{label}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: brand.smoke, marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Creativity Level</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {([['safe', 'Safe', Shield, brand.smoke] as const, ['creative', 'Creative', Lightbulb, brand.amber] as const, ['experimental', 'Experimental', Sparkles, '#A855F7'] as const, ['simple', 'Simple', Brain, brand.info] as const]).map(([val, label, Icon, color]) => (
                  <button key={val} onClick={() => setCreativityLevel(val)} style={{
                    background: brand.void, color: creativityLevel === val ? color : brand.white, border: creativityLevel === val ? `2px solid ${color}` : `1px solid ${brand.border}`,
                    borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: creativityLevel === val ? 1 : 0.6,
                  }}><Icon size={12} />{label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={generate} disabled={isLoading || selectedAgents.length === 0} style={{
              background: isLoading || selectedAgents.length === 0 ? brand.smoke : brand.amber, color: brand.void, border: 'none', borderRadius: '8px',
              padding: '14px 28px', fontSize: '16px', fontWeight: 600, cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: isLoading || selectedAgents.length === 0 ? 0.7 : 1,
            }}><Zap size={16} />{isLoading ? 'Generating...' : `Generate ${ideaMode === 'collaborative' ? 'Collaborative' : 'Individual'} Ideas (${selectedAgents.length})`}</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selectedMarketSize || ''} onChange={e => setSelectedMarketSize(e.target.value || null)} style={sel}><option value="">All Markets</option>{Array.from(new Set(ideas.map(i => i.marketSize))).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select>
            <select value={selectedStatus || ''} onChange={e => setSelectedStatus(e.target.value || null)} style={sel}><option value="">All Status</option>{Array.from(new Set(ideas.map(i => i.status))).map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}</select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={sel}><option value="newest">Newest</option><option value="rating">Rating</option><option value="confidence">Confidence</option><option value="revenue">Revenue</option></select>
          </div>
          <div style={{ display: 'flex', gap: '12px', color: brand.smoke, fontSize: '14px' }}>
            <span>{filtered.length} ideas</span><span>|</span><span>{ideas.filter(i => i.derekRating && i.derekRating >= 4).length} highly rated</span><span>|</span><span>{ideas.filter(i => i.status === 'approved').length} approved</span>
          </div>
        </div>

        {/* Ideas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sorted.map(idea => {
            const agent = AGENTS.find(a => a.id === idea.agentId);
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
                      background: 'transparent', color: brand.warning, border: `1px solid ${brand.warning}`, borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}><Archive size={14} />Move to Idea Vault</button>
                    <button onClick={() => router.push(`/os/kanban?add_title=${encodeURIComponent(idea.title)}&add_project=${encodeURIComponent(idea.agentName)}`)} style={{
                      background: 'transparent', color: brand.info, border: `1px solid ${brand.info}`, borderRadius: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}><Zap size={14} />Move to Kanban</button>
                  </div>
                  <span style={{ color: brand.smoke, fontSize: '14px' }}>by {idea.agentName} | {fmtDate(idea.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '60px 40px' }}>
            <Lightbulb size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No ideas found</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>Generate some ideas using the controls above or adjust your filters.</p>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}