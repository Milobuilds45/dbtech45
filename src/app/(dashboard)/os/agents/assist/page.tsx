'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import { Package, ExternalLink, Star, Filter, Search, Plus, Tag, Bookmark, Github, Globe, Database, Terminal, Code, Cpu, Users, User, Lightbulb, Brain, Sparkles, Shield, Zap, Trash2, CheckCircle, X, RotateCcw } from 'lucide-react';

interface AgentResource {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  plainEnglish: string; // Simple explanation anyone can understand
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
  { id: 'bobby', name: 'Bobby', color: '#22C55E' },
  { id: 'dwight', name: 'Dwight', color: '#3B82F6' },
  { id: 'tony', name: 'Tony', color: '#EAB308' },
  { id: 'dax', name: 'Dax', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#EF4444' },
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
    plainEnglish: 'Lets Bobby pull stock prices, charts, and market history automatically instead of looking things up manually. Think of it like giving him a direct line to Yahoo Finance.',
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
    plainEnglish: 'Makes buttons slide, pages fade in, and things move smoothly on websites. Without it, everything just pops in like a PowerPoint. With it, the site feels alive.',
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
    plainEnglish: 'Like giving Dwight his own Google that also reads and summarizes the results for him. He asks a question, gets an answer with sources — not just a list of links.',
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
    plainEnglish: 'The place where all our app data lives — user accounts, saved info, everything. It is like a spreadsheet on steroids that apps can read and write to instantly.',
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
    plainEnglish: 'Takes a big pile of data and instantly tells you what is in it — what is missing, what looks weird, what the averages are. Like a health check-up but for data instead of people.',
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
    plainEnglish: 'The toolkit for building AI agents that can do multi-step tasks. Instead of just answering questions, agents built with this can search, think, and take actions on their own.',
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
type BudgetTier = 'open-source' | 'free-tier' | 'budget-30' | 'budget-50' | 'budget-100' | 'any';

const BUDGET_OPTIONS: { value: BudgetTier; label: string; description: string }[] = [
  { value: 'open-source', label: 'Open Source Only', description: 'Free forever, no strings' },
  { value: 'free-tier', label: 'Free Tier / Trial', description: 'Free to start, may have limits' },
  { value: 'budget-30', label: 'Up to $30/mo', description: 'Light subscription budget' },
  { value: 'budget-50', label: 'Up to $50/mo', description: 'Medium subscription budget' },
  { value: 'budget-100', label: 'Up to $100/mo', description: 'Premium tools budget' },
  { value: 'any', label: 'Any Price', description: 'Show me the best, price no object' },
];

export default function AgentAssist() {
  const [resources, setResources] = useState<AgentResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('individual');
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('creative');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('any');

  const STORAGE_KEY = 'dbtech-assist-resources';
  const DELETED_KEY = 'dbtech-assist-deleted';
  const VERIFIED_KEY = 'dbtech-assist-verified';

  // Load from localStorage (primary), seed with mock data if empty
  useEffect(() => {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
      const verifiedIds: string[] = JSON.parse(localStorage.getItem(VERIFIED_KEY) || '[]');
      const removedIds = new Set([...deletedIds, ...verifiedIds]);

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AgentResource[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setResources(parsed.filter(r => !removedIds.has(r.id)));
          return;
        }
      }
      // First load - seed with mock data
      const seeded = mockResources.filter(r => !removedIds.has(r.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockResources));
      setResources(seeded);
    } catch {
      setResources(mockResources);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (resources.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(resources)); } catch {}
    }
  }, [resources]);

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
      const existingTitles = resources.map(r => r.title);
      
      const res = await fetch('/api/agent-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: agentsToUse,
          existingTitles,
          creativity: creativityLevel,
          budget: budgetTier,
        }),
      });
      
      if (!res.ok) throw new Error('API failed');
      
      const data = await res.json();
      const newResources: AgentResource[] = data.resources || [];
      
      setResources(prev => [...newResources, ...prev]);
      setIsLoading(false);
      
      if (newResources.length === 1) {
        showNotification(`New resource from ${newResources[0].agentName}: ${newResources[0].title}`);
      } else if (newResources.length > 1) {
        showNotification(`Generated ${newResources.length} new resource recommendations!`);
      }
    } catch (error) {
      console.error('Failed to generate resource:', error);
      setIsLoading(false);
    }
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    try {
      const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
      deleted.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    } catch {}
  };

  const verifyResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    try {
      const verified = JSON.parse(localStorage.getItem(VERIFIED_KEY) || '[]');
      verified.push(id);
      localStorage.setItem(VERIFIED_KEY, JSON.stringify(verified));
    } catch {}
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

        {/* Generate Resources */}
        <div style={{
          background: '#0A0A0A',
          border: `1px solid ${brand.border}`,
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '20px',
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} style={{ color: brand.amber }} />
              <span style={{ color: brand.white, fontSize: '16px', fontWeight: 700 }}>Generate Resources</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => { setSelectedAgents([]); setBudgetTier('any'); }}
                style={{
                  background: 'transparent',
                  color: brand.smoke,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                <RotateCcw size={13} />
                Clear
              </button>
              <button
                onClick={() => setSelectedAgents(AGENTS.map(a => a.id))}
                style={{
                  background: selectedAgents.length === AGENTS.length ? `${brand.amber}15` : 'transparent',
                  color: selectedAgents.length === AGENTS.length ? brand.amber : brand.smoke,
                  border: `1px solid ${selectedAgents.length === AGENTS.length ? brand.amber : brand.border}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Select All
              </button>
            </div>
          </div>

          {/* Agent Selection */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {AGENTS.map(agent => {
              const isOn = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent.id)}
                  style={{
                    background: isOn ? `${agent.color}15` : '#111',
                    color: isOn ? brand.white : brand.smoke,
                    border: isOn ? `2px solid ${agent.color}` : `1px solid ${brand.border}`,
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isOn ? 1 : 0.5,
                    boxShadow: isOn ? `0 0 12px ${agent.color}20` : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isOn ? agent.color : brand.smoke,
                    transition: 'all 0.2s',
                  }} />
                  {agent.name}
                </button>
              );
            })}
          </div>

          {/* Budget + Generate Row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
                <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Budget</span>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBudgetTier(opt.value)}
                    title={opt.description}
                    style={{
                      background: budgetTier === opt.value ? `${brand.amber}15` : '#111',
                      color: budgetTier === opt.value ? brand.amber : brand.smoke,
                      border: budgetTier === opt.value ? `2px solid ${brand.amber}` : `1px solid ${brand.border}`,
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: budgetTier === opt.value ? 1 : 0.6,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateResource(selectedAgents)}
              disabled={isLoading || selectedAgents.length === 0}
              style={{
                background: isLoading || selectedAgents.length === 0 ? brand.smoke : brand.amber,
                color: brand.void,
                border: 'none',
                borderRadius: '10px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isLoading || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isLoading || selectedAgents.length === 0 ? 0.5 : 1,
                boxShadow: isLoading || selectedAgents.length === 0 ? 'none' : `0 0 20px ${brand.amber}40`,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Zap size={16} />
              {isLoading ? 'Generating...' : `Generate (${selectedAgents.length})`}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{
          ...styles.card,
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: brand.smoke,
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
                borderRadius: '8px',
                padding: '9px 12px 9px 36px',
                color: brand.white,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            style={{
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '9px 12px',
              color: brand.white,
              fontSize: '13px',
              outline: 'none',
              minWidth: '140px',
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value || null)}
            style={{
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '9px 12px',
              color: brand.white,
              fontSize: '13px',
              outline: 'none',
              minWidth: '130px',
            }}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '9px 12px',
              color: brand.white,
              fontSize: '13px',
              outline: 'none',
              minWidth: '140px',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="stars">Most GitHub Stars</option>
          </select>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', color: brand.smoke, fontSize: '12px', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            <span>{filteredResources.length} resources</span>
            <span style={{ color: brand.border }}>|</span>
            <span>{resources.filter(r => r.type === 'open-source').length} open source</span>
            <span style={{ color: brand.border }}>|</span>
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

                    {/* Clickable URL */}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: brand.amber,
                          fontSize: '13px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '10px',
                          padding: '4px 10px',
                          background: `${brand.amber}08`,
                          border: `1px solid ${brand.amber}20`,
                          borderRadius: '6px',
                          transition: 'all 0.15s',
                          maxWidth: '100%',
                          overflow: 'hidden',
                        }}
                      >
                        <ExternalLink size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resource.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: '#000000',
                        border: `2px solid ${agent?.color || brand.smoke}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: agent?.color || brand.smoke,
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

                    {resource.plainEnglish && (
                      <div style={{
                        background: 'rgba(245,158,11,0.06)',
                        border: `1px solid rgba(245,158,11,0.15)`,
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginBottom: '12px',
                      }}>
                        <div style={{ color: brand.amber, fontSize: '11px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          In Plain English
                        </div>
                        <div style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.6' }}>
                          {resource.plainEnglish}
                        </div>
                      </div>
                    )}

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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                      <button
                        onClick={(e) => { e.stopPropagation(); verifyResource(resource.id); }}
                        title="We have this — remove"
                        style={{
                          background: 'transparent',
                          border: `1px solid ${brand.border}`,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: brand.smoke,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = brand.success; e.currentTarget.style.borderColor = brand.success; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = brand.smoke; e.currentTarget.style.borderColor = brand.border; }}
                      >
                        <CheckCircle size={13} /> Have it
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResource(resource.id); }}
                        title="Delete resource"
                        style={{
                          background: 'transparent',
                          border: `1px solid ${brand.border}`,
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: brand.smoke,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = brand.error; e.currentTarget.style.borderColor = brand.error; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = brand.smoke; e.currentTarget.style.borderColor = brand.border; }}
                      >
                        <Trash2 size={14} />
                      </button>
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