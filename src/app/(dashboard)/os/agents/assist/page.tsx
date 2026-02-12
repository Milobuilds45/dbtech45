'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { createClient } from '@supabase/supabase-js';
import { Package, ExternalLink, Star, Filter, Search, Plus, Tag, Bookmark, Github, Globe, Database, Terminal, Code, Cpu, Users, User, Lightbulb, Brain, Sparkles, Shield, Zap } from 'lucide-react';

interface AgentResource {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  url: string;
  category: 'api' | 'tool' | 'library' | 'service' | 'dataset' | 'framework' | 'reference' | 'other';
  type: 'open-source' | 'free-tier' | 'documentation' | 'tutorial' | 'reference';
  tags: string[];
  useCase: string;
  rating: number;
  usefulFor: string[]; // Which agents could benefit
  githubStars?: number;
  lastUpdated?: string;
  pricing?: string;
  createdAt: string;
  addedBy: string;
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

const CATEGORY_ICONS = {
  api: <Database size={16} />,
  tool: <Terminal size={16} />,
  library: <Code size={16} />,
  service: <Globe size={16} />,
  dataset: <Package size={16} />,
  framework: <Cpu size={16} />,
  reference: <Bookmark size={16} />,
  other: <Plus size={16} />,
};

// Mock data - replace with API calls
const mockResources: AgentResource[] = [
  {
    id: '1',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'yfinance - Python Yahoo Finance API',
    description: 'Reliable and efficient way to download historical market data from Yahoo Finance. Perfect for backtesting and analysis.',
    url: 'https://github.com/ranaroussi/yfinance',
    category: 'library',
    type: 'open-source',
    tags: ['python', 'finance', 'yahoo', 'market-data', 'stocks'],
    useCase: 'Historical market data retrieval for trading analysis and backtesting strategies',
    rating: 5,
    usefulFor: ['bobby', 'dax', 'milo'],
    githubStars: 11200,
    lastUpdated: '2026-02-10',
    pricing: 'Free',
    createdAt: '2026-02-11T10:00:00Z',
    addedBy: 'bobby'
  },
  {
    id: '2',
    agentId: 'paula',
    agentName: 'Paula',
    title: 'Framer Motion',
    description: 'Production-ready motion library for React. Makes creating smooth animations and interactions incredibly simple.',
    url: 'https://www.framer.com/motion/',
    category: 'library',
    type: 'open-source',
    tags: ['react', 'animation', 'ui', 'motion', 'frontend'],
    useCase: 'Creating smooth animations and micro-interactions in React components',
    rating: 5,
    usefulFor: ['paula', 'anders', 'milo'],
    githubStars: 21800,
    lastUpdated: '2026-02-08',
    pricing: 'Free',
    createdAt: '2026-02-10T14:30:00Z',
    addedBy: 'paula'
  },
  {
    id: '3',
    agentId: 'dwight',
    agentName: 'Dwight',
    title: 'Perplexity AI API',
    description: 'Real-time search and AI-powered research API. Great for getting current information and fact-checking.',
    url: 'https://docs.perplexity.ai/',
    category: 'api',
    type: 'free-tier',
    tags: ['api', 'search', 'ai', 'research', 'real-time'],
    useCase: 'Enhanced research capabilities and real-time information gathering',
    rating: 4,
    usefulFor: ['dwight', 'dax', 'milo', 'bobby'],
    pricing: 'Free tier: 5 requests/day, Pro: $20/month',
    createdAt: '2026-02-09T16:45:00Z',
    addedBy: 'dwight'
  },
  {
    id: '4',
    agentId: 'anders',
    agentName: 'Anders',
    title: 'Supabase',
    description: 'Open source Firebase alternative. Real-time database, authentication, and storage with a great developer experience.',
    url: 'https://supabase.com/',
    category: 'service',
    type: 'free-tier',
    tags: ['database', 'backend', 'realtime', 'auth', 'storage'],
    useCase: 'Backend-as-a-service for rapid application development',
    rating: 5,
    usefulFor: ['anders', 'milo', 'paula'],
    pricing: 'Free tier: 500MB DB, 1GB bandwidth, Pro: $25/month',
    createdAt: '2026-02-08T11:20:00Z',
    addedBy: 'anders'
  },
  {
    id: '5',
    agentId: 'dax',
    agentName: 'Dax',
    title: 'Pandas Profiling',
    description: 'Generates profile reports from pandas DataFrames. Essential for data exploration and quality assessment.',
    url: 'https://github.com/ydataai/ydata-profiling',
    category: 'tool',
    type: 'open-source',
    tags: ['python', 'pandas', 'data', 'analysis', 'profiling'],
    useCase: 'Automated exploratory data analysis and data quality reports',
    rating: 4,
    usefulFor: ['dax', 'bobby', 'dwight'],
    githubStars: 11500,
    lastUpdated: '2026-02-05',
    pricing: 'Free',
    createdAt: '2026-02-07T09:15:00Z',
    addedBy: 'dax'
  },
  {
    id: '6',
    agentId: 'milo',
    agentName: 'Milo',
    title: 'LangChain',
    description: 'Framework for developing applications with language models. Perfect for building AI agent workflows.',
    url: 'https://python.langchain.com/',
    category: 'framework',
    type: 'open-source',
    tags: ['python', 'ai', 'llm', 'agents', 'workflow'],
    useCase: 'Building complex AI agent workflows and LLM applications',
    rating: 5,
    usefulFor: ['milo', 'anders', 'dwight', 'dax'],
    githubStars: 78200,
    lastUpdated: '2026-02-12',
    pricing: 'Free',
    createdAt: '2026-02-06T13:45:00Z',
    addedBy: 'milo'
  },
];

type GenerationMode = 'individual' | 'collaborative';
type CreativityLevel = 'safe' | 'creative' | 'experimental' | 'simple';

export default function AgentAssist() {
  const [resources, setResources] = useState<AgentResource[]>(mockResources);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('individual');
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('creative');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Load real resources and set up real-time subscription
  useEffect(() => {
    const loadResources = async () => {
      const { data, error } = await supabase
        .from('assist_resources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Convert database format to component format
        const convertedResources = data.map(item => ({
          id: item.id,
          agentId: item.agent_id,
          agentName: item.agent_name,
          title: item.title,
          description: item.description,
          url: item.url || '',
          category: item.category,
          type: item.type,
          tags: item.tags || [],
          useCase: item.use_case,
          rating: item.rating || 3,
          usefulFor: item.useful_for || [],
          githubStars: item.github_stars,
          lastUpdated: item.last_updated,
          pricing: item.pricing,
          createdAt: item.created_at,
          addedBy: item.added_by || item.agent_name,
        }));
        setResources(convertedResources);
      }
    };

    loadResources();

    // Real-time subscription
    const subscription = supabase
      .channel('assist_resources_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'assist_resources' },
        (payload) => {
          const newResource = payload.new;
          const convertedResource = {
            id: newResource.id,
            agentId: newResource.agent_id,
            agentName: newResource.agent_name,
            title: newResource.title,
            description: newResource.description,
            url: newResource.url || '',
            category: newResource.category,
            type: newResource.type,
            tags: newResource.tags || [],
            useCase: newResource.use_case,
            rating: newResource.rating || 3,
            usefulFor: newResource.useful_for || [],
            githubStars: newResource.github_stars,
            lastUpdated: newResource.last_updated,
            pricing: newResource.pricing,
            createdAt: newResource.created_at,
            addedBy: newResource.added_by || newResource.agent_name,
          };
          
          setResources(prev => [convertedResource, ...prev]);
          
          if (newResource.auto_generated) {
            showNotification(`🔧 New tool from ${newResource.agent_name}: ${newResource.title}`);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    } else {
      console.log('🔧 New resource:', message);
    }
  };

  const generateResource = async (agentIds: string[] = []) => {
    setIsLoading(true);
    try {
      const agentsToUse = agentIds.length > 0 ? agentIds : AGENTS.map(a => a.id);
      
      const newResources: AgentResource[] = [];
      
      for (const agentId of agentsToUse) {
        const agent = AGENTS.find(a => a.id === agentId);
        if (!agent) continue;
        
        // Agent-specific resource recommendations
        const agentResources = {
          bobby: {
            title: 'Alpha Vantage API',
            description: 'Professional-grade financial market data API with real-time and historical stock, forex, and crypto data.',
            url: 'https://www.alphavantage.co/',
            category: 'api' as const,
            type: 'free-tier' as const,
            useCase: 'Real-time market data for trading algorithms and portfolio management applications',
            pricing: 'Free: 25 calls/day, Premium: $49.99/month for 1200 calls/minute',
            githubStars: 0,
            usefulFor: ['bobby', 'dax'],
          },
          tony: {
            title: 'Square POS API',
            description: 'Comprehensive point-of-sale API for restaurants with inventory management and payment processing.',
            url: 'https://developer.squareup.com/',
            category: 'api' as const,
            type: 'free-tier' as const,
            useCase: 'Restaurant POS integration, inventory tracking, payment processing, and customer management',
            pricing: 'Free to integrate, 2.6% + 10¢ per transaction',
            githubStars: 0,
            usefulFor: ['tony', 'milo'],
          },
          paula: {
            title: 'Framer Motion',
            description: 'Production-ready motion library for React with declarative animations and gesture support.',
            url: 'https://www.framer.com/motion/',
            category: 'library' as const,
            type: 'open-source' as const,
            useCase: 'Creating smooth animations and micro-interactions in React applications and websites',
            pricing: 'Free and open source',
            githubStars: 23400,
            usefulFor: ['paula', 'anders'],
          },
          anders: {
            title: 'Supabase',
            description: 'Open source Firebase alternative with PostgreSQL database, authentication, and real-time subscriptions.',
            url: 'https://supabase.com/',
            category: 'service' as const,
            type: 'free-tier' as const,
            useCase: 'Backend-as-a-service for rapid application development with real-time features',
            pricing: 'Free tier: 500MB DB, Pro: $25/month per project',
            githubStars: 72600,
            usefulFor: ['anders', 'milo', 'paula'],
          },
          dwight: {
            title: 'NewsAPI',
            description: 'JSON API for live worldwide news headlines and articles from 80,000+ sources.',
            url: 'https://newsapi.org/',
            category: 'api' as const,
            type: 'free-tier' as const,
            useCase: 'News aggregation, content curation, and real-time information gathering for research',
            pricing: 'Free: 1000 requests/month, Pro: $449/month for 250k requests',
            githubStars: 0,
            usefulFor: ['dwight', 'milo'],
          },
          dax: {
            title: 'Apache Superset',
            description: 'Modern data exploration and visualization platform with rich set of data visualizations.',
            url: 'https://superset.apache.org/',
            category: 'tool' as const,
            type: 'open-source' as const,
            useCase: 'Business intelligence dashboards, data exploration, and interactive data visualization',
            pricing: 'Free and open source',
            githubStars: 62100,
            usefulFor: ['dax', 'milo', 'dwight'],
          },
          milo: {
            title: 'n8n',
            description: 'Fair-code workflow automation tool for connecting APIs, databases, and services with visual workflows.',
            url: 'https://n8n.io/',
            category: 'tool' as const,
            type: 'open-source' as const,
            useCase: 'Business process automation, API orchestration, and workflow management',
            pricing: 'Free self-hosted, Cloud: $20/month per user',
            githubStars: 47800,
            usefulFor: ['milo', 'anders', 'tony'],
          },
        };
        
        const resourceTemplate = agentResources[agentId as keyof typeof agentResources];
        if (resourceTemplate) {
          const mockResource: AgentResource = {
            id: `${Date.now()}-${agentId}`,
            agentId,
            agentName: agent.name,
            ...resourceTemplate,
            tags: [agentId, 'recommended', resourceTemplate.category],
            rating: 4 + Math.floor(Math.random() * 2), // 4-5
            createdAt: new Date().toISOString(),
            addedBy: agentId,
          };
          
          newResources.push(mockResource);
        }
      }
      
      setTimeout(() => {
        setResources(prev => [...newResources, ...prev]);
        setIsLoading(false);
        
        if (newResources.length === 1) {
          showNotification(`🔧 New resource from ${newResources[0].agentName}: ${newResources[0].title}`);
        } else {
          showNotification(`🔧 Generated ${newResources.length} new resource recommendations!`);
        }
      }, 1500);
      
    } catch (error) {
      console.error('Failed to generate resource:', error);
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'stars'>('newest');

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  const filteredResources = resources.filter(resource => {
    if (selectedCategory && resource.category !== selectedCategory) return false;
    if (selectedType && resource.type !== selectedType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        resource.title.toLowerCase().includes(search) ||
        resource.description.toLowerCase().includes(search) ||
        resource.tags.some(tag => tag.toLowerCase().includes(search)) ||
        resource.useCase.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'stars':
        return (b.githubStars || 0) - (a.githubStars || 0);
      default:
        return 0;
    }
  });

  const rateResource = (id: string, rating: number) => {
    setResources(prev => prev.map(resource => 
      resource.id === id ? { ...resource, rating } : resource
    ));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number, resourceId: string) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => rateResource(resourceId, star)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: star <= rating ? brand.amber : brand.smoke,
            }}
          >
            <Star size={14} style={{ 
              fill: star <= rating ? brand.amber : 'transparent' 
            }} />
          </button>
        ))}
      </div>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'open-source': return brand.success;
      case 'free-tier': return brand.info;
      case 'documentation': return brand.amber;
      case 'tutorial': return brand.info;
      case 'reference': return brand.smoke;
      default: return brand.smoke;
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={styles.h1}>Agent Assist</h1>
          <p style={styles.subtitle}>Open-source tools, APIs, and resources to enhance agent capabilities</p>
        </div>

        {/* Filters & Search */}
        <div style={{
          ...styles.card,
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            {/* Generate Resources Controls */}
            <div>
              <label style={{ color: brand.smoke, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Generate Resources
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
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
              
              <button
                onClick={() => generateResource(selectedAgents)}
                disabled={isLoading || selectedAgents.length === 0}
                style={{
                  background: isLoading || selectedAgents.length === 0 ? brand.smoke : brand.amber,
                  color: brand.void,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading || selectedAgents.length === 0 ? 0.7 : 1,
                  width: '100%',
                }}
              >
                {isLoading ? '⏳ Generating...' : `🚀 Generate (${selectedAgents.length})`}
              </button>
            </div>
            <div>
              <label style={{ color: brand.smoke, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: brand.smoke 
                }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tools, APIs, libraries..."
                  style={{
                    width: '100%',
                    background: brand.graphite,
                    border: `1px solid ${brand.border}`,
                    borderRadius: '6px',
                    padding: '8px 12px 8px 36px',
                    color: brand.white,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: brand.smoke, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                style={{
                  width: '100%',
                  background: brand.graphite,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: brand.white,
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: brand.smoke, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Type
              </label>
              <select
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value || null)}
                style={{
                  width: '100%',
                  background: brand.graphite,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: brand.white,
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: brand.smoke, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
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
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="stars">Most GitHub Stars</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', color: brand.smoke, fontSize: '14px' }}>
            <span>{filteredResources.length} resources</span>
            <span>•</span>
            <span>{resources.filter(r => r.type === 'open-source').length} open source</span>
            <span>•</span>
            <span>{resources.filter(r => r.rating >= 4).length} highly rated</span>
          </div>
        </div>

        {/* Resources List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedResources.map(resource => {
            const agent = AGENTS.find(a => a.id === resource.agentId);
            const categoryIcon = CATEGORY_ICONS[resource.category];

            return (
              <div
                key={resource.id}
                style={{
                  ...styles.card,
                  padding: '24px',
                  border: resource.rating >= 4 ? 
                    `1px solid ${brand.amber}` : 
                    `1px solid ${brand.border}`,
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ 
                        color: brand.white, 
                        fontSize: '20px', 
                        fontWeight: 600, 
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {categoryIcon}
                        {resource.title}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: brand.amber,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ExternalLink size={16} />
                        </a>
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: agent?.color || brand.smoke,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: brand.void,
                        fontWeight: 700,
                        fontSize: '10px',
                      }}>
                        {resource.agentName.substring(0, 2)}
                      </div>
                      <span style={{ color: brand.smoke, fontSize: '14px' }}>
                        Added by {resource.agentName}
                      </span>
                      <span style={{ color: brand.smoke }}>•</span>
                      <span style={{ color: brand.smoke, fontSize: '12px' }}>
                        {formatDate(resource.createdAt)}
                      </span>
                    </div>

                    <p style={{
                      color: brand.silver,
                      fontSize: '15px',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                    }}>
                      {resource.description}
                    </p>

                    <div style={{
                      background: brand.graphite,
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ color: brand.smoke, fontSize: '12px', marginBottom: '4px' }}>
                        Use Case:
                      </div>
                      <div style={{ color: brand.silver, fontSize: '14px' }}>
                        {resource.useCase}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${getTypeColor(resource.type)}20`,
                        color: getTypeColor(resource.type),
                        textTransform: 'uppercase',
                      }}>
                        {resource.type.replace('-', ' ')}
                      </span>
                    </div>

                    {resource.githubStars && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: brand.smoke,
                        fontSize: '12px',
                      }}>
                        <Github size={12} />
                        {formatNumber(resource.githubStars)} stars
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(resource.rating, resource.id)}
                      <span style={{ color: brand.smoke, fontSize: '12px' }}>
                        ({resource.rating}/5)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {resource.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        background: brand.graphite,
                        color: brand.smoke,
                        border: `1px solid ${brand.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Useful For & Pricing */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}>
                  <div>
                    <div style={{ color: brand.smoke, fontSize: '12px', marginBottom: '6px' }}>
                      Useful for:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {resource.usefulFor.map(agentId => {
                        const agent = AGENTS.find(a => a.id === agentId);
                        return (
                          <span
                            key={agentId}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              background: `${agent?.color || brand.smoke}20`,
                              color: agent?.color || brand.smoke,
                              fontWeight: 600,
                            }}
                          >
                            {agent?.name || agentId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {resource.pricing && (
                    <div style={{
                      padding: '8px 12px',
                      background: brand.graphite,
                      borderRadius: '6px',
                      border: `1px solid ${brand.border}`,
                    }}>
                      <div style={{ color: brand.smoke, fontSize: '11px' }}>Pricing:</div>
                      <div style={{ color: brand.white, fontSize: '13px', fontWeight: 600 }}>
                        {resource.pricing}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sortedResources.length === 0 && (
          <div style={{
            ...styles.card,
            textAlign: 'center',
            padding: '60px 40px',
          }}>
            <Package size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No resources found</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>
              {searchTerm || selectedCategory || selectedType ? 
                'Try adjusting your filters to see more resources.' :
                'Your agents haven\'t added any resources yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}