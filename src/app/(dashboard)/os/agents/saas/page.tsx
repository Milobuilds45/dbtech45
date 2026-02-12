'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, Star, TrendingUp, Zap, Target, Calendar, ThumbsUp, ThumbsDown, MessageSquare, Filter, Users, User, Lightbulb, Brain, Sparkles, Shield, Archive } from 'lucide-react';
import { generateCollaborativeIdea as generateRealCollaboration } from '@/lib/agent-collaboration';

interface SaasIdea {
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
  tags: string[];
  derekRating?: number; // 1-5 stars
  derekFeedback?: string;
  agentConfidence: number; // 1-5
  marketSize: 'small' | 'medium' | 'large' | 'massive';
  developmentTime: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'building' | 'rejected' | 'launched' | 'idea-vault' | 'kanban';
  createdAt: string;
  updatedAt: string;
}

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

// Mock data - replace with API calls
const mockSaasIdeas: SaasIdea[] = [
  {
    id: '1',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'Real-Time Options Flow Dashboard',
    description: 'Build a live dashboard that tracks unusual options activity across all major exchanges. Could identify potential market moves before they happen. Integrate with our existing market data APIs and provide alerts for significant flow.',
    problemSolved: 'Traders miss profitable opportunities because they can\'t track all options activity across exchanges simultaneously.',
    targetMarket: 'Active options traders, hedge funds, financial advisors',
    businessModel: 'SaaS subscription: $99/month retail, $499/month professional',
    revenueProjection: '$1M ARR with 500 professional subscribers',
    competitiveAdvantage: 'AI pattern recognition + real-time alerts + historical backtesting in one platform',
    tags: ['fintech', 'trading', 'ai', 'real-time', 'b2b'],
    derekRating: 4,
    derekFeedback: 'Great idea! This could be valuable for the trading community.',
    agentConfidence: 5,
    marketSize: 'large',
    developmentTime: '6-8 months',
    status: 'submitted',
    createdAt: '2026-02-11T09:00:00Z',
    updatedAt: '2026-02-11T09:00:00Z',
  },
];

type IdeaMode = 'individual' | 'collaborative';
type CreativityLevel = 'safe' | 'creative' | 'experimental' | 'simple';

export default function MillionDollarSaas() {
  const [ideas, setIdeas] = useState<SaasIdea[]>(mockSaasIdeas);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENTS.map(a => a.id));
  const [ideaMode, setIdeaMode] = useState<IdeaMode>('individual');
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('creative');
  const [selectedMarketSize, setSelectedMarketSize] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'confidence' | 'revenue'>('newest');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const showNotification = (message: string) => {
    // Simple browser notification - could be enhanced with toast library
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    } else {
      // Fallback to console for now
      console.log('New idea:', message);
    }
  };

  const generateCollaborativeIdea = (agentIds: string[], creativity: CreativityLevel): SaasIdea => {
    try {
      // Use real agent collaboration engine
      const collaborativeIdea = generateRealCollaboration(agentIds, creativity);
      
      // Convert to SaasIdea format
      return {
        id: `collab-${Date.now()}`,
        agentId: 'collaborative',
        agentName: collaborativeIdea.collaboratingAgents.map((id: string) => 
          AGENTS.find(a => a.id === id)?.name || id
        ).join(' + '),
        title: collaborativeIdea.title,
        description: collaborativeIdea.description,
        problemSolved: collaborativeIdea.sevenLayers.problem,
        targetMarket: collaborativeIdea.sevenLayers.people,
        businessModel: `${collaborativeIdea.pricing.model} - $${collaborativeIdea.pricing.pricePoint}/month`,
        revenueProjection: collaborativeIdea.sevenLayers.profit,
        competitiveAdvantage: collaborativeIdea.competitiveAdvantage,
        tags: [...collaborativeIdea.collaboratingAgents, 'collaborative', creativity, 'seven-layers'],
        agentConfidence: 5,
        marketSize: 'large' as const,
        developmentTime: collaborativeIdea.realisticTimeline.total,
        status: 'submitted' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Collaboration engine error:', error);
      // Fallback to simple collaborative idea
      return generateFallbackCollaborativeIdea(agentIds, creativity);
    }
  };

  const generateFallbackCollaborativeIdea = (agentIds: string[], creativity: CreativityLevel): SaasIdea => {
    const agentNames = agentIds.map(id => AGENTS.find(a => a.id === id)?.name).filter(Boolean);
    
    return {
      id: `collab-${Date.now()}`,
      agentId: 'collaborative',
      agentName: agentNames.join(' + '),
      title: 'Cross-Domain Innovation Platform',
      description: `AI platform combining ${agentNames.join(' and ')} expertise for comprehensive business solutions.`,
      problemSolved: 'Businesses need multiple expert perspectives but cannot afford diverse specialist consultants.',
      targetMarket: 'Growing businesses needing multi-domain expertise (50-500 employees)',
      businessModel: 'SaaS subscription: $299/month + per-consultation fees',
      revenueProjection: '$1.2M ARR with 300 business subscribers',
      competitiveAdvantage: `First platform combining ${agentNames.join(', ')} specialized knowledge in coordinated solutions`,
      tags: [...agentIds, 'collaborative', creativity],
      agentConfidence: 4,
      marketSize: 'large' as const,
      developmentTime: '6-8 weeks (multi-agent coordination + specialized modules)',
      status: 'submitted' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const generateIndividualIdeas = (agentIds: string[], creativity: CreativityLevel): SaasIdea[] => {
    const ideas: SaasIdea[] = [];
    
    agentIds.forEach(agentId => {
      const agent = AGENTS.find(a => a.id === agentId);
      if (!agent) return;
      
      // Agent-specific realistic ideas with proper pricing and timelines
      const agentIdeas = {
        bobby: {
          safe: { 
            title: 'OptionsFlow Pro', 
            description: 'Real-time options flow tracking with AI pattern recognition for retail and professional traders.',
            problemSolved: 'Retail traders miss 80% of profitable opportunities due to lack of institutional-grade options flow data',
            targetMarket: 'Active retail traders and small hedge funds ($10K-$500K accounts)',
            businessModel: 'Tiered SaaS: $49/month retail, $199/month professional',
            revenueProjection: '$500K ARR with 500 retail + 50 professional subscribers',
            competitiveAdvantage: 'First retail-accessible platform with institutional-grade options flow analysis',
            developmentTime: '3-4 weeks (AI data processing + React dashboard + payment integration)'
          },
          creative: { 
            title: 'CryptoFlow Analytics', 
            description: 'AI that analyzes crypto options flow, social sentiment, and whale movements for trading signals.',
            problemSolved: 'Crypto traders lack sophisticated analysis tools available in traditional markets',
            targetMarket: 'Crypto traders and DeFi protocols ($25K+ portfolios)',
            businessModel: 'Subscription: $89/month individuals, $399/month for protocols',
            revenueProjection: '$800K ARR with 400 individual + 25 protocol subscribers',
            competitiveAdvantage: 'Only platform combining traditional options analysis with crypto-specific data sources',
            developmentTime: '4-6 weeks (crypto API integrations + ML models + web3 features)'
          },
          experimental: {
            title: 'Quantum Trading Prediction Engine',
            description: 'Quantum computing-powered market prediction using parallel universe simulations of market outcomes.',
            problemSolved: 'Traditional AI can only process historical patterns, not explore parallel probability spaces',
            targetMarket: 'Hedge funds, quant firms, and institutional traders with $100M+ AUM',
            businessModel: 'Enterprise licensing: $50K/month + performance fees on alpha generated',
            revenueProjection: '$10M ARR with 15 institutional clients',
            competitiveAdvantage: 'First quantum-powered trading system exploring parallel market realities',
            developmentTime: '12-18 months (quantum algorithm development + institutional partnerships)'
          },
          simple: { 
            title: 'Simple Trading Alerts', 
            description: 'Clean, straightforward options and stock alerts for busy retail investors.',
            problemSolved: 'Most trading platforms are too complex for casual investors who just want simple alerts',
            targetMarket: 'Casual retail investors and busy professionals',
            businessModel: 'Simple subscription: $19/month or $199/year',
            revenueProjection: '$300K ARR with 1,500 monthly subscribers',
            competitiveAdvantage: 'Simplicity over complexity - designed for normal people, not day traders',
            developmentTime: '2-3 weeks (alert system + mobile app + basic dashboard)'
          }
        },
        tony: {
          safe: { 
            title: 'RestaurantOS', 
            description: 'Complete restaurant management platform with POS integration and cost tracking.',
            problemSolved: 'Small restaurants lose 20-30% profit to poor inventory and labor management',
            targetMarket: 'Independent restaurants and small chains (1-10 locations, $500K-$5M revenue)',
            businessModel: 'Per-location SaaS: $89/month + $199 setup fee',
            revenueProjection: '$600K ARR with 500 restaurant locations',
            competitiveAdvantage: 'Built by actual restaurant operators, not software companies',
            developmentTime: '5-6 weeks (POS integrations + inventory tracking + labor scheduling)'
          },
          creative: { 
            title: 'AI Kitchen Optimizer', 
            description: 'Smart system that predicts demand and optimizes prep schedules to reduce waste.',
            problemSolved: 'Restaurants waste $162B annually due to poor demand forecasting and over-preparation',
            targetMarket: 'Fast-casual restaurants and ghost kitchens with high volume',
            businessModel: 'Revenue share: 10% of documented waste reduction savings',
            revenueProjection: '$1.2M ARR by reducing waste for 200 restaurants by average $6K/year each',
            competitiveAdvantage: 'First AI specifically trained on restaurant kitchen operations and waste patterns',
            developmentTime: '6-8 weeks (ML training on kitchen data + integration with existing POS systems)'
          },
          simple: { 
            title: 'Daily Restaurant Tracker', 
            description: 'Simple daily tracking for food costs, sales, and basic restaurant metrics.',
            problemSolved: 'Restaurant owners need basic financial oversight but existing solutions are too complex',
            targetMarket: 'Very small restaurants and food trucks (under $1M revenue)',
            businessModel: 'Affordable SaaS: $29/month',
            revenueProjection: '$200K ARR with 600 small restaurant subscribers',
            competitiveAdvantage: 'Designed for mom-and-pop restaurants, not chains - simple and affordable',
            developmentTime: '2-3 weeks (basic tracking + mobile-first design + simple reports)'
          }
        },
        paula: {
          safe: { 
            title: 'BrandBot AI', 
            description: 'AI-powered brand identity generator that creates logos, colors, and guidelines for small businesses.',
            problemSolved: 'Small businesses pay $2K-$5K for branding they could get for under $100 with AI',
            targetMarket: 'Small business owners, entrepreneurs, and freelancers starting new ventures',
            businessModel: 'One-time purchase: $47 basic, $97 premium, $197 complete package',
            revenueProjection: '$400K ARR with 300 premium sales per month',
            competitiveAdvantage: 'Professional designer quality at 95% cost reduction through AI automation',
            developmentTime: '3-4 weeks (AI brand generation + asset export + payment processing)'
          },
          creative: { 
            title: 'Emotional Design Engine', 
            description: 'AI that creates designs optimized for specific emotional responses and conversion goals.',
            problemSolved: 'Businesses guess at design psychology instead of using data-driven emotional optimization',
            targetMarket: 'E-commerce brands and marketing agencies focused on conversion optimization',
            businessModel: 'SaaS subscription: $97/month + usage fees for A/B testing',
            revenueProjection: '$600K ARR with 150 agencies and 300 e-commerce brands',
            competitiveAdvantage: 'Only platform combining design generation with emotional psychology and conversion data',
            developmentTime: '5-6 weeks (psychology models + A/B testing integration + design generation)'
          },
          experimental: {
            title: 'Consciousness-Based UX',
            description: 'Design system that adapts in real-time based on user subconscious responses and biometric feedback.',
            problemSolved: 'Design decisions are based on conscious feedback, missing 95% of user responses that happen subconsciously',
            targetMarket: 'Enterprise UX teams and cutting-edge product companies',
            businessModel: 'Enterprise licensing: $5K/month + hardware integration fees',
            revenueProjection: '$2M ARR with 30 enterprise clients',
            competitiveAdvantage: 'First design system using real-time biometric feedback for UI optimization',
            developmentTime: '12-16 weeks (biometric integration + ML models + design adaptation system)'
          },
          simple: { 
            title: 'Quick Logo Maker', 
            description: 'Super simple tool for creating professional logos with minimal input required.',
            problemSolved: 'Entrepreneurs need logos immediately but design tools are too complicated',
            targetMarket: 'Solo entrepreneurs, side hustlers, and very small businesses',
            businessModel: 'Freemium: Free basic logos, $19 for high-res + commercial rights',
            revenueProjection: '$150K ARR with 800 premium downloads per month',
            competitiveAdvantage: 'Fastest logo creation (under 2 minutes) with professional quality output',
            developmentTime: '1-2 weeks (streamlined UI + logo generation + instant download)'
          }
        },
        anders: {
          safe: {
            title: 'DesignOps Studio',
            description: 'Design system platform that converts designs into production-ready React components.',
            problemSolved: 'Design-to-development handoff wastes 40% of project time and creates inconsistencies',
            targetMarket: 'Small development teams and agencies (5-50 people) building React applications',
            businessModel: 'SaaS: $39/month per designer, $19/month per developer',
            revenueProjection: '$600K ARR with 200 teams using average 5 seats each',
            competitiveAdvantage: 'Only platform combining design system thinking with enterprise-grade code generation',
            developmentTime: '4-6 weeks (design processing + code generation + component library)'
          },
          creative: {
            title: 'No-Code Backend Builder',
            description: 'Visual interface for building scalable APIs and databases without writing code.',
            problemSolved: 'Non-technical founders need custom backends but cannot afford $100K+ development costs',
            targetMarket: 'Non-technical entrepreneurs and small businesses needing custom software',
            businessModel: 'Usage-based: $29/month base + $0.10 per API call',
            revenueProjection: '$800K ARR with 500 active projects',
            competitiveAdvantage: 'Enterprise-grade architecture with consumer-friendly visual interface',
            developmentTime: '6-8 weeks (visual editor + code generation + deployment automation)'
          },
          experimental: {
            title: 'AI Code Architect',
            description: 'AI system that designs entire application architectures and generates production code.',
            problemSolved: 'Even experienced developers spend weeks architecting systems that could be generated instantly',
            targetMarket: 'Development agencies and enterprise engineering teams',
            businessModel: 'Per-project licensing: $999 per application + $199/month maintenance',
            revenueProjection: '$1.5M ARR with 50 agencies building 3 apps each annually',
            competitiveAdvantage: 'First AI that understands enterprise architecture patterns and generates production-ready systems',
            developmentTime: '10-12 weeks (architecture AI training + code generation + enterprise integrations)'
          },
          simple: {
            title: 'Simple Deploy',
            description: 'One-click deployment for web applications with automatic scaling.',
            problemSolved: 'Developers waste hours on deployment configuration instead of building features',
            targetMarket: 'Individual developers and small teams building web apps',
            businessModel: 'Usage-based: $5/month base + $0.01 per deployment hour',
            revenueProjection: '$300K ARR with 1000 active developers',
            competitiveAdvantage: 'Simplest deployment experience with automatic optimization and scaling',
            developmentTime: '3-4 weeks (deployment automation + scaling logic + monitoring dashboard)'
          }
        },
        dwight: {
          safe: {
            title: 'CompetitorWatch',
            description: 'Automated competitive monitoring platform with weekly intelligence reports.',
            problemSolved: 'Businesses make strategic decisions blindly while competitors move faster',
            targetMarket: 'B2B SaaS companies and marketing teams (10-500 employees)',
            businessModel: 'Tiered SaaS: $199/month startup, $499/month growth',
            revenueProjection: '$800K ARR with 100 growth-tier customers',
            competitiveAdvantage: 'Only platform combining investigative journalism rigor with automated monitoring',
            developmentTime: '4-5 weeks (monitoring setup + analysis engine + reporting dashboard)'
          },
          creative: {
            title: 'TrendScope AI',
            description: 'AI system that predicts market trends by analyzing weak signals across global data sources.',
            problemSolved: 'Businesses react to trends instead of anticipating them, missing first-mover advantages',
            targetMarket: 'Strategy consultants, VCs, and Fortune 500 strategy teams',
            businessModel: 'Enterprise SaaS: $2999/month + custom research projects',
            revenueProjection: '$1.8M ARR with 50 enterprise clients',
            competitiveAdvantage: 'Only AI trained specifically on weak signal detection and trend prediction',
            developmentTime: '8-10 weeks (AI training on trend data + prediction models + enterprise dashboard)'
          },
          experimental: {
            title: 'Global Intelligence Network',
            description: 'Crowdsourced intelligence platform where human analysts and AI collaborate on research.',
            problemSolved: 'Traditional intelligence is either expensive consultants or incomplete AI - no hybrid approach',
            targetMarket: 'Government agencies, large corporations, and research institutions',
            businessModel: 'Platform fees: 20% of research projects + $5K/month platform access',
            revenueProjection: '$5M ARR with $25M in platform research volume',
            competitiveAdvantage: 'First platform combining human intelligence expertise with AI scale',
            developmentTime: '12-16 weeks (analyst network + AI collaboration tools + security infrastructure)'
          },
          simple: {
            title: 'News Digest Pro',
            description: 'Personalized daily news briefings with AI-powered summaries.',
            problemSolved: 'Busy professionals need relevant news but cannot spend time filtering through noise',
            targetMarket: 'Executives and professionals who need industry-specific news',
            businessModel: 'Subscription: $19/month individual, $99/month team',
            revenueProjection: '$400K ARR with 1500 individual subscribers',
            competitiveAdvantage: 'Human-curated sources with AI-powered personalization',
            developmentTime: '2-3 weeks (news aggregation + AI summarization + personalization engine)'
          }
        },
        dax: {
          safe: {
            title: 'DataStory Builder',
            description: 'Platform that converts raw data into executive-ready presentations automatically.',
            problemSolved: 'Data analysts spend 80% of time formatting reports instead of finding insights',
            targetMarket: 'Data analysts, consultants, and executives at mid-size companies',
            businessModel: 'SaaS: $79/month individual, $299/month team',
            revenueProjection: '$700K ARR with 200 team subscriptions',
            competitiveAdvantage: 'Only platform combining statistical rigor with executive communication',
            developmentTime: '4-5 weeks (data processing + narrative generation + presentation automation)'
          },
          creative: {
            title: 'Predictive Business Simulator',
            description: 'AI that creates interactive business simulations to test strategic decisions.',
            problemSolved: 'Executives make million-dollar decisions based on static projections instead of dynamic modeling',
            targetMarket: 'Strategy teams at Fortune 1000 companies and consulting firms',
            businessModel: 'Enterprise licensing: $10K setup + $2K/month per simulation',
            revenueProjection: '$2M ARR with 80 enterprise simulations',
            competitiveAdvantage: 'First business simulation platform using real company data and AI scenario modeling',
            developmentTime: '8-10 weeks (simulation engine + AI scenario modeling + enterprise integrations)'
          },
          experimental: {
            title: 'Quantum Data Analytics',
            description: 'Quantum computing-powered analytics that processes complex datasets in parallel dimensions.',
            problemSolved: 'Traditional computing cannot handle the complexity of modern multi-dimensional business data',
            targetMarket: 'Research institutions, Fortune 50 companies, and government agencies',
            businessModel: 'Quantum-as-a-Service: $50K/month + usage fees',
            revenueProjection: '$10M ARR with 15 quantum computing clients',
            competitiveAdvantage: 'First commercial quantum analytics platform for business intelligence',
            developmentTime: '16-20 weeks (quantum algorithm development + cloud infrastructure + enterprise security)'
          },
          simple: {
            title: 'Simple Charts',
            description: 'Dead simple tool for creating beautiful charts from spreadsheet data.',
            problemSolved: 'Most people need basic charts but find existing tools too complicated or ugly',
            targetMarket: 'Small business owners, students, and professionals who need quick visualizations',
            businessModel: 'Freemium: Free basic charts, $9/month for premium templates',
            revenueProjection: '$180K ARR with 2000 premium subscribers',
            competitiveAdvantage: 'Fastest chart creation with the most beautiful default templates',
            developmentTime: '2-3 weeks (chart generation + template library + data import)'
          }
        },
        milo: {
          safe: {
            title: 'AgentHub Coordinator',
            description: 'Platform that orchestrates multiple AI agents for comprehensive business automation.',
            problemSolved: 'Businesses want AI automation but struggle to coordinate multiple tools and agents',
            targetMarket: 'SMBs and operations teams needing workflow automation',
            businessModel: 'SaaS: $49/month base + $19/month per additional agent',
            revenueProjection: '$900K ARR with 500 businesses using 3 agents each',
            competitiveAdvantage: 'Only platform designed for multi-agent coordination with business context',
            developmentTime: '5-6 weeks (agent coordination + workflow builder + business templates)'
          },
          creative: {
            title: 'Business Operating System',
            description: 'AI-powered command center that manages all aspects of business operations automatically.',
            problemSolved: 'Business owners juggle 15+ different tools with no central coordination or intelligence',
            targetMarket: 'Growing businesses (10-100 employees) with complex operations',
            businessModel: 'All-in-one platform: $199/month + per-employee fees',
            revenueProjection: '$1.2M ARR with 300 growing businesses',
            competitiveAdvantage: 'First true business operating system with AI coordination across all functions',
            developmentTime: '8-10 weeks (integration platform + AI coordination + business intelligence dashboard)'
          },
          experimental: {
            title: 'Collective Business Intelligence',
            description: 'Network where businesses share anonymized operational data to improve collective performance.',
            problemSolved: 'Businesses operate in silos, missing insights that come from collective operational intelligence',
            targetMarket: 'Forward-thinking SMBs and business networks wanting collective optimization',
            businessModel: 'Network participation fees: $299/month + data contribution incentives',
            revenueProjection: '$3M ARR with 800 network participants',
            competitiveAdvantage: 'First platform creating collective business intelligence while maintaining privacy',
            developmentTime: '12-14 weeks (privacy-preserving analytics + network effects + business intelligence)'
          },
          simple: {
            title: 'Daily Operations Tracker',
            description: 'Simple dashboard for small business owners to track daily operations and KPIs.',
            problemSolved: 'Small business owners need basic operational oversight but existing solutions are too complex',
            targetMarket: 'Very small businesses and solopreneurs (under 10 employees)',
            businessModel: 'Simple subscription: $29/month',
            revenueProjection: '$350K ARR with 1200 small business subscribers',
            competitiveAdvantage: 'Designed specifically for very small businesses, not enterprise-lite',
            developmentTime: '2-3 weeks (KPI tracking + simple dashboard + mobile-first design)'
          }
        }
      };

      const ideaSet = agentIdeas[agentId as keyof typeof agentIdeas];
      if (ideaSet) {
        const template = ideaSet[creativity as keyof typeof ideaSet];
        if (!template) {
          console.warn(`No ${creativity} template for ${agentId}, skipping`);
          return;
        }
        ideas.push({
          id: `${agentId}-${Date.now()}`,
          agentId,
          agentName: agent.name,
          title: template.title,
          description: template.description,
          problemSolved: template.problemSolved,
          targetMarket: template.targetMarket,
          businessModel: template.businessModel,
          revenueProjection: template.revenueProjection,
          competitiveAdvantage: template.competitiveAdvantage,
          tags: [agentId, creativity, 'realistic-pricing', 'ai-timeline'],
          agentConfidence: creativity === 'experimental' ? 3 : creativity === 'simple' ? 5 : 4,
          marketSize: creativity === 'simple' ? 'small' as const : creativity === 'experimental' ? 'massive' as const : 'medium' as const,
          developmentTime: template.developmentTime,
          status: 'submitted' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
    
    return ideas;
  };

  const generateIdea = async (agentIds: string[] = []) => {
    setIsLoading(true);
    try {
      const agentsToUse = agentIds.length > 0 ? agentIds : AGENTS.map(a => a.id);
      
      setTimeout(() => {
        if (ideaMode === 'collaborative') {
          const collaborativeIdea = generateCollaborativeIdea(agentsToUse, creativityLevel);
          setIdeas(prev => [collaborativeIdea, ...prev]);
          showNotification(`New collaborative idea from ${agentsToUse.length} agents: ${collaborativeIdea.title}`);
        } else {
          const newIdeas = generateIndividualIdeas(agentsToUse, creativityLevel);
          setIdeas(prev => [...newIdeas, ...prev]);
          showNotification(`Generated ${newIdeas.length} new SaaS ideas!`);
        }
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to generate idea:', error);
      setIsLoading(false);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const getAgentReasoning = (idea: SaasIdea): string => {
    // Agent-specific reasoning based on their expertise
    const reasoningMap: Record<string, string> = {
      bobby: `"This addresses a real gap in retail trading tools. Professional options flow data is currently locked behind $2K/month Bloomberg terminals. At $49-199/month, we can democratize institutional-grade analysis for active traders. The market timing is perfect with retail trading at all-time highs."`,
      
      tony: `"Restaurant margins are razor-thin - most owners are flying blind on food costs. I've seen restaurants go from profitable to bankrupt in 6 months due to commodity price swings. This gives them the same risk management tools that big chains use, but at a price point small restaurants can actually afford."`,
      
      paula: `"Small businesses currently pay $2K-5K for basic branding that takes weeks to deliver. With AI, we can deliver professional-quality brand systems in minutes at 95% cost reduction. The design quality will be consistent and the instant gratification factor makes this incredibly compelling for entrepreneurs."`,
      
      anders: `"The design-to-code handoff is the biggest bottleneck in product development. I've seen teams spend 40% of their time just translating designs into components. Automating this with proper TypeScript support and component libraries will save companies weeks on every project."`,
      
      dwight: `"Competitive intelligence is currently either expensive consultants or manual labor. Businesses are making million-dollar decisions with incomplete information about their competitors. This democratizes enterprise-grade intelligence gathering at a fraction of traditional consulting costs."`,
      
      dax: `"Data teams waste 80% of their time on formatting reports instead of finding insights. Automating the storytelling layer while maintaining analytical rigor will free analysts to focus on actual analysis. The executive presentation layer is what makes data actionable."`,
      
      milo: `"Business coordination is broken - too many tools, no integration, constant context switching. This provides a single command center for business operations with AI handling the routine coordination tasks. The productivity gains compound across entire organizations."`,
      
      collaborative: `"By combining our different areas of expertise, we can create solutions that neither of us could build alone. This represents a genuine fusion of knowledge domains that creates new value propositions in the market."`
    };

    // For collaborative ideas, get reasoning from the participating agents
    if (idea.agentId === 'collaborative') {
      const agents = idea.agentName.split(' + ').map(name => 
        AGENTS.find(a => a.name === name)?.id
      ).filter(Boolean);
      
      if (agents.length > 1) {
        return reasoningMap.collaborative;
      }
    }

    return reasoningMap[idea.agentId] || `"This idea leverages my expertise in ${idea.agentId} to solve a real market problem with a scalable, profitable solution."`;
  };

  const renderStars = (rating: number | undefined, ideaId: string) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => rateIdea(ideaId, star)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: (rating && star <= rating) ? brand.amber : brand.smoke,
            }}
          >
            <Star size={16} style={{ 
              fill: (rating && star <= rating) ? brand.amber : 'transparent' 
            }} />
          </button>
        ))}
      </div>
    );
  };

  const rateIdea = (id: string, rating: number) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, derekRating: rating, updatedAt: new Date().toISOString() } : idea
    ));
  };

  const updateStatus = (id: string, status: SaasIdea['status']) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, status, updatedAt: new Date().toISOString() } : idea
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return brand.smoke;
      case 'reviewed': return brand.amber;
      case 'approved': return brand.success;
      case 'building': return brand.info;
      case 'launched': return brand.success;
      case 'rejected': return brand.error;
      default: return brand.smoke;
    }
  };

  const getMarketSizeColor = (size: string) => {
    switch (size) {
      case 'small': return brand.smoke;
      case 'medium': return brand.amber;
      case 'large': return brand.info;
      case 'massive': return brand.success;
      default: return brand.smoke;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const marketSizes = Array.from(new Set(ideas.map(idea => idea.marketSize)));
  const statuses = Array.from(new Set(ideas.map(idea => idea.status)));

  const filteredIdeas = ideas.filter(idea => {
    if (selectedMarketSize && idea.marketSize !== selectedMarketSize) return false;
    if (selectedStatus && idea.status !== selectedStatus) return false;
    return true;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return (b.derekRating || 0) - (a.derekRating || 0);
      case 'confidence':
        return b.agentConfidence - a.agentConfidence;
      case 'revenue':
        const aRevenue = parseFloat(a.revenueProjection.match(/\$([0-9.]+)M/)?.[1] || '0');
        const bRevenue = parseFloat(b.revenueProjection.match(/\$([0-9.]+)M/)?.[1] || '0');
        return bRevenue - aRevenue;
      default:
        return 0;
    }
  });

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ ...styles.h1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DollarSign size={32} style={{ color: brand.amber }} />
            $1M SaaS Ideas
          </h1>
          <p style={styles.subtitle}>Fresh daily business ideas from agents with $1M+ revenue potential</p>
        </div>

        {/* Idea Generation Controls */}
        <div style={{
          ...styles.card,
          padding: '32px',
          marginBottom: '32px',
          background: `linear-gradient(135deg, ${brand.carbon} 0%, ${brand.graphite} 100%)`,
          border: `2px solid ${brand.border}`,
          borderRadius: '16px',
        }}>
          <h3 style={{ 
            color: brand.white, 
            fontSize: '20px', 
            fontWeight: 700, 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            textAlign: 'center' as const,
            justifyContent: 'center'
          }}>
            <Lightbulb size={24} style={{ color: brand.amber }} />
            Generate New Ideas
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Agent Selection */}
            <div>
              <label style={{ color: brand.smoke, fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                Select Agents
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedAgents(AGENTS.map(a => a.id))}
                  style={{
                    background: selectedAgents.length === AGENTS.length 
                      ? `linear-gradient(135deg, ${brand.amber} 0%, ${brand.amberLight} 100%)`
                      : brand.graphite,
                    color: selectedAgents.length === AGENTS.length ? brand.void : brand.white,
                    border: `2px solid ${selectedAgents.length === AGENTS.length ? brand.amber : brand.border}`,
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  All Agents
                </button>
                <button
                  onClick={() => setSelectedAgents([])}
                  style={{
                    background: selectedAgents.length === 0 
                      ? `linear-gradient(135deg, ${brand.error} 0%, #DC2626 100%)`
                      : brand.graphite,
                    color: selectedAgents.length === 0 ? brand.white : brand.white,
                    border: `2px solid ${selectedAgents.length === 0 ? brand.error : brand.border}`,
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Clear All
                </button>
                {AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    style={{
                      background: selectedAgents.includes(agent.id) 
                        ? `linear-gradient(135deg, ${agent.color} 0%, ${agent.color}CC 100%)`
                        : brand.graphite,
                      color: selectedAgents.includes(agent.id) ? brand.void : brand.white,
                      border: `2px solid ${selectedAgents.includes(agent.id) ? agent.color : brand.border}`,
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedAgents.includes(agent.id) 
                        ? `0 4px 12px ${agent.color}40` 
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedAgents.includes(agent.id)) {
                        e.currentTarget.style.borderColor = agent.color;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedAgents.includes(agent.id)) {
                        e.currentTarget.style.borderColor = brand.border;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {agent.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <label style={{ color: brand.smoke, fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                Generation Mode
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIdeaMode('individual')}
                  style={{
                    background: ideaMode === 'individual' ? brand.info : brand.graphite,
                    color: ideaMode === 'individual' ? brand.void : brand.white,
                    border: `1px solid ${ideaMode === 'individual' ? brand.info : brand.border}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User size={14} />
                  Individual Ideas
                </button>
                <button
                  onClick={() => setIdeaMode('collaborative')}
                  style={{
                    background: ideaMode === 'collaborative' ? brand.info : brand.graphite,
                    color: ideaMode === 'collaborative' ? brand.void : brand.white,
                    border: `1px solid ${ideaMode === 'collaborative' ? brand.info : brand.border}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Users size={14} />
                  Collaborative
                </button>
              </div>
            </div>

            {/* Creativity Level */}
            <div>
              <label style={{ color: brand.smoke, fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                Creativity Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { value: 'safe', label: 'Safe', icon: Shield },
                  { value: 'creative', label: 'Creative', icon: Lightbulb },
                  { value: 'experimental', label: 'Experimental', icon: Sparkles },
                  { value: 'simple', label: 'Simple', icon: Brain },
                ].map(level => {
                  const IconComponent = level.icon;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setCreativityLevel(level.value as CreativityLevel)}
                      style={{
                        background: creativityLevel === level.value ? brand.success : brand.graphite,
                        color: creativityLevel === level.value ? brand.void : brand.white,
                        border: `1px solid ${creativityLevel === level.value ? brand.success : brand.border}`,
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <IconComponent size={12} />
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <button
              onClick={() => generateIdea(selectedAgents)}
              disabled={isLoading || selectedAgents.length === 0}
              style={{
                background: isLoading || selectedAgents.length === 0 ? brand.smoke : brand.amber,
                color: brand.void,
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isLoading || selectedAgents.length === 0 ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading && selectedAgents.length > 0) {
                  e.currentTarget.style.backgroundColor = brand.amberLight;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && selectedAgents.length > 0) {
                  e.currentTarget.style.backgroundColor = brand.amber;
                }
              }}
            >
              <Zap size={16} />
              {isLoading 
                ? 'Generating...' 
                : `Generate ${ideaMode === 'collaborative' ? 'Collaborative' : 'Individual'} Idea${ideaMode === 'individual' && selectedAgents.length > 1 ? 's' : ''} (${selectedAgents.length})`
              }
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          ...styles.card,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select
              value={selectedMarketSize || ''}
              onChange={(e) => setSelectedMarketSize(e.target.value || null)}
              style={{
                background: brand.graphite,
                border: `1px solid ${brand.border}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: brand.white,
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">All Market Sizes</option>
              {marketSizes.map(size => (
                <option key={size} value={size}>
                  {size.charAt(0).toUpperCase() + size.slice(1)} Market
                </option>
              ))}
            </select>

            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              style={{
                background: brand.graphite,
                border: `1px solid ${brand.border}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: brand.white,
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: brand.graphite,
                border: `1px solid ${brand.border}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: brand.white,
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Derek's Rating</option>
              <option value="confidence">Agent Confidence</option>
              <option value="revenue">Revenue Potential</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px', color: brand.smoke, fontSize: '14px' }}>
            <span>{filteredIdeas.length} ideas</span>
            <span>•</span>
            <span>{ideas.filter(i => i.derekRating && i.derekRating >= 4).length} highly rated</span>
            <span>•</span>
            <span>{ideas.filter(i => i.status === 'approved').length} approved</span>
          </div>
        </div>

        {/* Ideas List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sortedIdeas.map(idea => {
            const agent = AGENTS.find(a => a.id === idea.agentId);

            return (
              <div
                key={idea.id}
                style={{
                  ...styles.card,
                  padding: '28px',
                  border: idea.derekRating && idea.derekRating >= 4 ? 
                    `1px solid ${brand.amber}` : 
                    `1px solid ${brand.border}`,
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: agent?.color || brand.smoke,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: brand.void,
                        fontWeight: 700,
                        fontSize: '14px',
                      }}>
                        {idea.agentName.substring(0, 2)}
                      </div>
                      <div>
                        <h2 style={{ 
                          color: brand.white, 
                          fontSize: '24px', 
                          fontWeight: 700, 
                          margin: 0,
                          marginBottom: '4px' 
                        }}>
                          {idea.title}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: brand.smoke, fontSize: '14px' }}>
                            by {idea.agentName}
                          </span>
                          <span style={{ color: brand.smoke }}>•</span>
                          <span style={{ color: brand.smoke, fontSize: '12px' }}>
                            {formatDate(idea.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{
                      color: brand.silver,
                      fontSize: '16px',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      fontWeight: 500,
                    }}>
                      {idea.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: `${getMarketSizeColor(idea.marketSize)}20`,
                      color: getMarketSizeColor(idea.marketSize),
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <Target size={14} />
                      {idea.marketSize} market
                    </span>

                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: `${getStatusColor(idea.status)}20`,
                      color: getStatusColor(idea.status),
                      textTransform: 'uppercase',
                    }}>
                      {idea.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Business Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}>
                  <div style={{ background: brand.graphite, borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Problem Solved
                    </h4>
                    <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                      {idea.problemSolved}
                    </p>
                  </div>

                  <div style={{ background: brand.graphite, borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Target Market
                    </h4>
                    <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                      {idea.targetMarket}
                    </p>
                  </div>

                  <div style={{ background: brand.graphite, borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Business Model
                    </h4>
                    <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                      {idea.businessModel}
                    </p>
                  </div>

                  <div style={{ background: brand.graphite, borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ color: brand.success, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Revenue Projection
                    </h4>
                    <p style={{ color: brand.white, fontSize: '16px', fontWeight: 700, margin: 0 }}>
                      {idea.revenueProjection}
                    </p>
                  </div>

                  <div style={{ background: brand.graphite, borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Competitive Advantage
                    </h4>
                    <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                      {idea.competitiveAdvantage}
                    </p>
                  </div>

                  <div style={{ background: brand.graphite, borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Development Time
                    </h4>
                    <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                      {idea.developmentTime}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {idea.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        background: brand.graphite,
                        color: brand.smoke,
                        border: `1px solid ${brand.border}`,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Agent Reasoning */}
                <div style={{
                  background: brand.graphite,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h4 style={{ color: brand.info, fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    Agent Reasoning
                  </h4>
                  <p style={{ color: brand.silver, fontSize: '14px', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                    {getAgentReasoning(idea)}
                  </p>
                </div>

                {/* Derek's Rating - Separate & Smaller */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: `${brand.amber}08`,
                  borderRadius: '8px',
                  border: `1px solid ${brand.border}`,
                  marginBottom: '16px',
                }}>
                  <div>
                    <h4 style={{ color: brand.amber, fontSize: '14px', fontWeight: 600, margin: 0, marginBottom: '6px' }}>
                      Your Rating
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(idea.derekRating, idea.id)}
                      {idea.derekRating && (
                        <span style={{ color: brand.smoke, fontSize: '12px', marginLeft: '8px' }}>
                          ({idea.derekRating}/5)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!idea.derekRating && (
                    <span style={{ color: brand.smoke, fontSize: '12px' }}>
                      Click stars to rate this idea
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateStatus(idea.id, 'rejected')}
                        disabled={idea.status === 'rejected'}
                        style={{
                          background: idea.status === 'rejected' ? brand.error : 'transparent',
                          color: idea.status === 'rejected' ? brand.void : brand.error,
                          border: `1px solid ${brand.error}`,
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: idea.status === 'rejected' ? 'default' : 'pointer',
                          opacity: idea.status === 'rejected' ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ThumbsDown size={14} />
                        {idea.status === 'rejected' ? 'Rejected' : 'Reject'}
                      </button>

                      <button
                        onClick={() => updateStatus(idea.id, 'idea-vault')}
                        disabled={idea.status === 'idea-vault'}
                        style={{
                          background: idea.status === 'idea-vault' ? brand.warning : 'transparent',
                          color: idea.status === 'idea-vault' ? brand.void : brand.warning,
                          border: `1px solid ${brand.warning}`,
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: idea.status === 'idea-vault' ? 'default' : 'pointer',
                          opacity: idea.status === 'idea-vault' ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Archive size={14} />
                        {idea.status === 'idea-vault' ? 'In Vault' : 'Move to Idea Vault'}
                      </button>

                      <button
                        onClick={() => updateStatus(idea.id, 'kanban')}
                        disabled={idea.status === 'kanban'}
                        style={{
                          background: idea.status === 'kanban' ? brand.info : 'transparent',
                          color: idea.status === 'kanban' ? brand.void : brand.info,
                          border: `1px solid ${brand.info}`,
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: idea.status === 'kanban' ? 'default' : 'pointer',
                          opacity: idea.status === 'kanban' ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Zap size={14} />
                        {idea.status === 'kanban' ? 'In Kanban' : 'Move to Kanban'}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: brand.smoke,
                    fontSize: '14px',
                  }}>
                    <span>by {idea.agentName}</span>
                    <span>•</span>
                    <span>{formatDate(idea.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedIdeas.length === 0 && (
          <div style={{
            ...styles.card,
            textAlign: 'center',
            padding: '60px 40px',
          }}>
            <DollarSign size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No SaaS ideas found</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>
              {selectedMarketSize || selectedStatus ? 
                'Try adjusting your filters to see more ideas.' :
                'Generate some ideas using the controls above.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}