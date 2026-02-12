'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, Star, TrendingUp, Zap, Target, Calendar, ThumbsUp, ThumbsDown, MessageSquare, Filter } from 'lucide-react';

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
    title: 'OptionsFlow Pro',
    description: 'Real-time options flow tracking with AI-powered pattern recognition. Identify unusual activity before big moves happen.',
    problemSolved: 'Traders miss profitable opportunities because they can\'t track all options activity across exchanges simultaneously.',
    targetMarket: 'Active options traders, hedge funds, financial advisors',
    businessModel: 'SaaS subscription: $99/month retail, $499/month professional',
    revenueProjection: '$1M ARR with 500 professional subscribers',
    competitiveAdvantage: 'AI pattern recognition + real-time alerts + historical backtesting in one platform',
    tags: ['fintech', 'trading', 'ai', 'real-time', 'b2b'],
    derekRating: 5,
    derekFeedback: 'This is exactly what professional traders need. High-value problem with clear monetization.',
    agentConfidence: 5,
    marketSize: 'large',
    developmentTime: '6-8 months',
    status: 'approved',
    createdAt: '2026-02-11T09:00:00Z',
    updatedAt: '2026-02-11T09:00:00Z',
  },
  {
    id: '2',
    agentId: 'paula',
    agentName: 'Paula',
    title: 'BrandBot',
    description: 'AI-powered brand identity generator for small businesses. Input your business description, get a complete brand package in minutes.',
    problemSolved: 'Small businesses can\'t afford $5K+ for professional branding but need consistent brand identity to compete.',
    targetMarket: 'Small businesses, entrepreneurs, freelancers, startups',
    businessModel: 'One-time purchases: $97 basic, $197 premium, $497 enterprise package',
    revenueProjection: '$1.2M ARR with 500 premium sales per month',
    competitiveAdvantage: 'AI quality at 1/10th the cost of traditional designers + instant delivery',
    tags: ['ai', 'design', 'automation', 'smb', 'b2c'],
    derekRating: 4,
    derekFeedback: 'Great market fit. Could be part of the Biz-in-a-Box offering.',
    agentConfidence: 4,
    marketSize: 'massive',
    developmentTime: '4-6 months',
    status: 'building',
    createdAt: '2026-02-10T14:30:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: '3',
    agentId: 'anders',
    agentName: 'Anders',
    title: 'AgentHub',
    description: 'Marketplace for AI agents. Developers publish agents, businesses discover and integrate them via simple APIs.',
    problemSolved: 'Businesses want AI automation but don\'t know how to build or integrate AI agents.',
    targetMarket: 'SMB owners, developers, enterprises looking for AI solutions',
    businessModel: 'Marketplace: 30% commission on agent sales + $50/month hosting per agent',
    revenueProjection: '$2M ARR with 200 active agents and 1000 business users',
    competitiveAdvantage: 'First-to-market agent marketplace + standardized integration layer',
    tags: ['marketplace', 'ai', 'agents', 'integration', 'b2b'],
    agentConfidence: 4,
    marketSize: 'massive',
    developmentTime: '8-12 months',
    status: 'submitted',
    createdAt: '2026-02-09T11:15:00Z',
    updatedAt: '2026-02-09T11:15:00Z',
  },
  {
    id: '4',
    agentId: 'remy',
    agentName: 'Remy',
    title: 'RestaurantAI',
    description: 'AI-powered restaurant operations suite. Menu optimization, inventory prediction, staff scheduling, and customer analytics.',
    problemSolved: 'Restaurants lose 20-30% profit to inefficient operations, poor inventory management, and suboptimal pricing.',
    targetMarket: 'Independent restaurants, small restaurant chains (5-50 locations)',
    businessModel: 'SaaS: $197/month per location + setup fee',
    revenueProjection: '$1.5M ARR with 500 restaurant locations',
    competitiveAdvantage: 'End-to-end solution specifically for restaurants + AI-powered insights',
    tags: ['restaurant', 'ai', 'operations', 'saas', 'b2b'],
    derekRating: 3,
    derekFeedback: 'Good idea but very competitive market. Need strong differentiator.',
    agentConfidence: 3,
    marketSize: 'large',
    developmentTime: '10-12 months',
    status: 'reviewed',
    createdAt: '2026-02-08T16:45:00Z',
    updatedAt: '2026-02-08T16:45:00Z',
  },
  {
    id: '5',
    agentId: 'dwight',
    agentName: 'Dwight',
    title: 'CompetitorLens',
    description: 'Automated competitive intelligence platform. Track competitors\' pricing, features, marketing, hiring, and strategic moves.',
    problemSolved: 'Companies make strategic decisions without knowing what competitors are doing. Manual tracking is time-consuming and incomplete.',
    targetMarket: 'B2B SaaS companies, marketing teams, strategy consultants',
    businessModel: 'Tiered SaaS: $299/month startup, $999/month growth, $2999/month enterprise',
    revenueProjection: '$1.8M ARR with 150 growth-tier customers',
    competitiveAdvantage: 'AI-powered analysis + automated data collection + actionable insights dashboard',
    tags: ['intelligence', 'automation', 'saas', 'b2b', 'analytics'],
    agentConfidence: 4,
    marketSize: 'medium',
    developmentTime: '6-9 months',
    status: 'submitted',
    createdAt: '2026-02-07T10:20:00Z',
    updatedAt: '2026-02-07T10:20:00Z',
  },
];

export default function MillionDollarSaas() {
  const [ideas, setIdeas] = useState<SaasIdea[]>(mockSaasIdeas);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Load real ideas from database and set up real-time subscription
  useEffect(() => {
    const loadIdeas = async () => {
      const { data, error } = await supabase
        .from('saas_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Convert database format to component format
        const convertedIdeas = data.map(item => ({
          id: item.id,
          agentId: item.agent_id,
          agentName: item.agent_name,
          title: item.title,
          description: item.description,
          problemSolved: item.problem_solved || '',
          targetMarket: item.target_market || '',
          businessModel: item.business_model || '',
          revenueProjection: item.revenue_projection || '',
          competitiveAdvantage: item.competitive_advantage || '',
          tags: item.tags || [],
          derekRating: item.derek_rating,
          derekFeedback: item.derek_feedback,
          agentConfidence: item.agent_confidence || 3,
          marketSize: item.market_size || 'medium',
          developmentTime: item.development_time || '',
          status: item.status || 'submitted',
          createdAt: item.created_at,
          updatedAt: item.updated_at || item.created_at,
        }));
        setIdeas(convertedIdeas);
      }
    };

    loadIdeas();

    // Set up real-time subscription for new ideas
    const subscription = supabase
      .channel('saas_ideas_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'saas_ideas' },
        (payload) => {
          const newIdea = payload.new;
          const convertedIdea = {
            id: newIdea.id,
            agentId: newIdea.agent_id,
            agentName: newIdea.agent_name,
            title: newIdea.title,
            description: newIdea.description,
            problemSolved: newIdea.problem_solved || '',
            targetMarket: newIdea.target_market || '',
            businessModel: newIdea.business_model || '',
            revenueProjection: newIdea.revenue_projection || '',
            competitiveAdvantage: newIdea.competitive_advantage || '',
            tags: newIdea.tags || [],
            derekRating: newIdea.derek_rating,
            derekFeedback: newIdea.derek_feedback,
            agentConfidence: newIdea.agent_confidence || 3,
            marketSize: newIdea.market_size || 'medium',
            developmentTime: newIdea.development_time || '',
            status: newIdea.status || 'submitted',
            createdAt: newIdea.created_at,
            updatedAt: newIdea.updated_at || newIdea.created_at,
          };
          
          setIdeas(prev => [convertedIdea, ...prev]);
          
          // Show notification
          if (newIdea.auto_generated) {
            showNotification(`💡 New SaaS idea from ${newIdea.agent_name}: ${newIdea.title}`);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  const [selectedMarketSize, setSelectedMarketSize] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'confidence' | 'revenue'>('newest');

  const showNotification = (message: string) => {
    // Simple browser notification - could be enhanced with toast library
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    } else {
      // Fallback to console for now
      console.log('💡 New idea:', message);
    }
  };

  const generateIdea = async (agentIds: string[] = []) => {
    setIsLoading(true);
    try {
      const agentsToUse = agentIds.length > 0 ? agentIds : AGENTS.map(a => a.id);
      
      // Generate agent-specific ideas
      const newIdeas: SaasIdea[] = [];
      
      for (const agentId of agentsToUse) {
        const agent = AGENTS.find(a => a.id === agentId);
        if (!agent) continue;
        
        // Agent-specific SaaS ideas
        const agentIdeas = {
          bobby: {
            title: 'OptionsFlow Pro',
            description: 'Real-time options flow tracking with AI pattern recognition for institutional-grade trading insights.',
            problemSolved: 'Traders miss profitable opportunities due to fragmented options data across exchanges.',
            targetMarket: 'Active options traders, hedge funds, prop trading firms',
            businessModel: 'Tiered SaaS: $99/month retail, $499/month professional, $1999/month institutional',
            revenueProjection: '$2.5M ARR with 200 professional and 50 institutional subscribers',
            competitiveAdvantage: 'AI pattern recognition + real-time cross-exchange data + predictive analytics',
            tags: ['fintech', 'trading', 'options', 'ai', 'real-time'],
          },
          tony: {
            title: 'RestaurantOS',
            description: 'Complete restaurant management platform with AI-powered inventory prediction and staff optimization.',
            problemSolved: 'Restaurants lose 25% profit to inefficient operations, overstaffing, and food waste.',
            targetMarket: 'Independent restaurants and small chains (5-50 locations)',
            businessModel: 'SaaS: $197/month per location + $500 setup fee',
            revenueProjection: '$1.8M ARR with 500 restaurant locations',
            competitiveAdvantage: 'AI-powered predictions + integrated POS + labor optimization + waste tracking',
            tags: ['restaurant', 'ai', 'operations', 'inventory', 'saas'],
          },
          paula: {
            title: 'BrandBot AI',
            description: 'Instant brand identity generator that creates logos, color schemes, and brand guidelines using AI.',
            problemSolved: 'Small businesses pay $5K+ for branding or use generic templates that hurt credibility.',
            targetMarket: 'Small businesses, entrepreneurs, agencies, freelancers',
            businessModel: 'One-time purchases: $97 basic brand, $197 premium pack, $497 complete identity',
            revenueProjection: '$1.5M ARR with 600 premium sales monthly',
            competitiveAdvantage: 'AI quality at 1/10th designer cost + instant delivery + commercial licensing',
            tags: ['ai', 'design', 'branding', 'automation', 'smb'],
          },
          anders: {
            title: 'DevStack Deploy',
            description: 'One-click deployment platform for full-stack applications with automatic scaling and monitoring.',
            problemSolved: 'Developers spend 40% of time on DevOps instead of building features.',
            targetMarket: 'Independent developers, small dev teams, agencies',
            businessModel: 'Usage-based: $0.05 per deployment hour + $29/month base fee',
            revenueProjection: '$1.2M ARR with 1000 active developers',
            competitiveAdvantage: 'Simplified deployment + auto-scaling + integrated monitoring + fair pricing',
            tags: ['devops', 'deployment', 'saas', 'automation', 'scaling'],
          },
          dwight: {
            title: 'IntelliWatch',
            description: 'Automated competitive intelligence platform that monitors competitors across all digital channels.',
            problemSolved: 'Companies make strategic decisions blindly while competitors move faster.',
            targetMarket: 'B2B SaaS companies, marketing teams, strategy consultants',
            businessModel: 'Tiered SaaS: $299/month startup, $999/month growth, $2999/month enterprise',
            revenueProjection: '$1.6M ARR with 100 growth-tier customers',
            competitiveAdvantage: 'AI-powered analysis + automated data collection + actionable insights + alerts',
            tags: ['intelligence', 'monitoring', 'competitive', 'ai', 'b2b'],
          },
          dax: {
            title: 'DataStory',
            description: 'Automated data storytelling platform that converts raw data into executive-ready presentations.',
            problemSolved: 'Analysts spend 80% of time formatting reports instead of finding insights.',
            targetMarket: 'Data analysts, consultants, executives, marketing teams',
            businessModel: 'SaaS: $79/month individual, $299/month team, $999/month enterprise',
            revenueProjection: '$1.4M ARR with 300 team subscriptions',
            competitiveAdvantage: 'AI narrative generation + automated visualizations + executive templates',
            tags: ['data', 'analytics', 'visualization', 'ai', 'reporting'],
          },
          milo: {
            title: 'AgentHub Pro',
            description: 'Business automation platform that orchestrates AI agents for end-to-end workflow management.',
            problemSolved: 'Businesses want AI automation but lack technical expertise to implement and coordinate agents.',
            targetMarket: 'SMBs, operations teams, consultants, agencies',
            businessModel: 'SaaS: $197/month per business + $50/month per additional agent',
            revenueProjection: '$2.1M ARR with 500 businesses using 3 agents each',
            competitiveAdvantage: 'No-code agent coordination + business templates + performance analytics',
            tags: ['automation', 'ai', 'agents', 'workflow', 'business'],
          },
        };
        
        const ideaTemplate = agentIdeas[agentId as keyof typeof agentIdeas];
        if (ideaTemplate) {
          const mockIdea: SaasIdea = {
            id: `${Date.now()}-${agentId}`,
            agentId,
            agentName: agent.name,
            ...ideaTemplate,
            agentConfidence: 4 + Math.floor(Math.random() * 2), // 4-5
            marketSize: ['medium', 'large', 'massive'][Math.floor(Math.random() * 3)] as any,
            developmentTime: ['4-6 months', '6-8 months', '8-12 months'][Math.floor(Math.random() * 3)],
            status: 'submitted' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          newIdeas.push(mockIdea);
        }
      }
      
      // Add all new ideas at once
      setTimeout(() => {
        setIdeas(prev => [...newIdeas, ...prev]);
        setIsLoading(false);
        
        if (newIdeas.length === 1) {
          showNotification(`💡 New SaaS idea from ${newIdeas[0].agentName}: ${newIdeas[0].title}`);
        } else {
          showNotification(`💡 Generated ${newIdeas.length} new SaaS ideas!`);
        }
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

  const renderStars = (rating: number | undefined, ideaId: string, interactive = true) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && rateIdea(ideaId, star)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              padding: '2px',
              color: (rating && star <= rating) ? brand.amber : brand.smoke,
            }}
            disabled={!interactive}
          >
            <Star size={14} style={{ 
              fill: (rating && star <= rating) ? brand.amber : 'transparent' 
            }} />
          </button>
        ))}
      </div>
    );
  };

  const renderConfidenceStars = (confidence: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={12} 
            style={{ 
              color: star <= confidence ? brand.info : brand.smoke,
              fill: star <= confidence ? brand.info : 'transparent'
            }} 
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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

        {/* Stats & Filters */}
        <div style={{
          ...styles.card,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Generate Ideas Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: brand.smoke, fontSize: '12px' }}>Select Agents:</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedAgents(AGENTS.map(a => a.id))}
                    style={{
                      background: selectedAgents.length === AGENTS.length ? brand.amber : 'transparent',
                      color: selectedAgents.length === AGENTS.length ? brand.void : brand.amber,
                      border: `1px solid ${brand.amber}`,
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    All
                  </button>
                  {AGENTS.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent.id)}
                      style={{
                        background: selectedAgents.includes(agent.id) ? agent.color : 'transparent',
                        color: selectedAgents.includes(agent.id) ? brand.void : agent.color,
                        border: `1px solid ${agent.color}`,
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => generateIdea(selectedAgents)}
                disabled={isLoading || selectedAgents.length === 0}
                style={{
                  background: isLoading || selectedAgents.length === 0 ? brand.smoke : brand.amber,
                  color: brand.void,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isLoading || selectedAgents.length === 0 ? 0.7 : 1,
                  alignSelf: 'flex-end',
                }}
              >
                {isLoading ? '⏳ Generating...' : `🚀 Generate Ideas (${selectedAgents.length})`}
              </button>
            </div>
            <select
              value={selectedMarketSize || ''}
              onChange={(e) => setSelectedMarketSize(e.target.value || null)}
              style={{
                background: brand.graphite,
                border: `1px solid ${brand.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
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
                padding: '6px 12px',
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
                padding: '6px 12px',
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
                          <span style={{ color: brand.smoke }}>•</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: brand.smoke, fontSize: '12px' }}>Agent Confidence:</span>
                            {renderConfidenceStars(idea.agentConfidence)}
                          </div>
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

                {/* Derek's Rating & Feedback */}
                {idea.derekRating && (
                  <div style={{
                    background: `${brand.amber}10`,
                    border: `1px solid ${brand.amber}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: brand.amber, fontWeight: 600, fontSize: '16px' }}>
                        Derek's Rating:
                      </span>
                      {renderStars(idea.derekRating, idea.id, true)}
                      <span style={{ color: brand.amber, fontSize: '14px', fontWeight: 600 }}>
                        ({idea.derekRating}/5)
                      </span>
                    </div>
                    {idea.derekFeedback && (
                      <p style={{ color: brand.silver, fontSize: '15px', margin: 0, fontStyle: 'italic' }}>
                        "{idea.derekFeedback}"
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!idea.derekRating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: brand.smoke, fontSize: '14px' }}>Rate this idea:</span>
                        {renderStars(undefined, idea.id, true)}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateStatus(idea.id, 'approved')}
                        disabled={idea.status === 'approved'}
                        style={{
                          background: idea.status === 'approved' ? brand.success : 'transparent',
                          color: idea.status === 'approved' ? brand.void : brand.success,
                          border: `1px solid ${brand.success}`,
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: idea.status === 'approved' ? 'default' : 'pointer',
                          opacity: idea.status === 'approved' ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ThumbsUp size={14} />
                        {idea.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>

                      <button
                        onClick={() => updateStatus(idea.id, 'building')}
                        disabled={idea.status === 'building'}
                        style={{
                          background: idea.status === 'building' ? brand.info : 'transparent',
                          color: idea.status === 'building' ? brand.void : brand.info,
                          border: `1px solid ${brand.info}`,
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: idea.status === 'building' ? 'default' : 'pointer',
                          opacity: idea.status === 'building' ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Zap size={14} />
                        {idea.status === 'building' ? 'Building' : 'Start Building'}
                      </button>

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
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: brand.smoke,
                    fontSize: '14px',
                  }}>
                    <Calendar size={16} />
                    <span>Added {formatDate(idea.createdAt)}</span>
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
                'Your agents haven\'t submitted any SaaS ideas yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}