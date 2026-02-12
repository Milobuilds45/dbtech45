'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, Star, TrendingUp, Zap, Target, Calendar, ThumbsUp, ThumbsDown, MessageSquare, Filter, Users, User, Lightbulb, Brain, Sparkles, Shield } from 'lucide-react';
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
  status: 'submitted' | 'reviewed' | 'approved' | 'building' | 'rejected' | 'launched';
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
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
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
        }
      };

      const ideaSet = agentIdeas[agentId as keyof typeof agentIdeas];
      if (ideaSet) {
        const template = ideaSet[creativity] || ideaSet['creative'] || ideaSet['safe'];
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
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h3 style={{ color: brand.white, fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={20} style={{ color: brand.amber }} />
            Generate New Ideas
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Agent Selection */}
            <div>
              <label style={{ color: brand.smoke, fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                Select Agents
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedAgents(AGENTS.map(a => a.id))}
                  style={{
                    background: selectedAgents.length === AGENTS.length ? brand.amber : brand.graphite,
                    color: selectedAgents.length === AGENTS.length ? brand.void : brand.white,
                    border: `1px solid ${selectedAgents.length === AGENTS.length ? brand.amber : brand.border}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  All Agents
                </button>
                {AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    style={{
                      background: selectedAgents.includes(agent.id) ? agent.color : brand.graphite,
                      color: selectedAgents.includes(agent.id) ? brand.void : brand.white,
                      border: `1px solid ${selectedAgents.includes(agent.id) ? agent.color : brand.border}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                fontWeight: 700,
                cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: isLoading || selectedAgents.length === 0 ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={18} />
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

        {/* Ideas List (simplified for now) */}
        <div style={{ color: brand.silver, textAlign: 'center', padding: '40px' }}>
          <p>Ideas list component would go here...</p>
        </div>
      </div>
    </div>
  );
}