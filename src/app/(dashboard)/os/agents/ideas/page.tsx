'use client';
import { useState } from 'react';
import { brand, styles } from '@/lib/brand';
import { Lightbulb, Star, TrendingUp, Zap, Wrench, Briefcase, Plus, Filter, Heart, MessageCircle } from 'lucide-react';

interface AgentIdea {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  category: 'business' | 'upgrade' | 'feature' | 'process' | 'tool' | 'creative';
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'submitted' | 'reviewed' | 'approved' | 'in-development' | 'rejected' | 'completed';
  rating?: number; // 1-5 stars from Derek
  feedback?: string; // Derek's feedback
  votes: number;
  comments: number;
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

const CATEGORY_ICONS = {
  business: <Briefcase size={16} />,
  upgrade: <TrendingUp size={16} />,
  feature: <Zap size={16} />,
  process: <Wrench size={16} />,
  tool: <Plus size={16} />,
  creative: <Lightbulb size={16} />,
};

// Mock data - replace with API calls
const mockIdeas: AgentIdea[] = [
  {
    id: '1',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'Real-Time Options Flow Dashboard',
    description: 'Build a live dashboard that tracks unusual options activity across all major exchanges. Could identify potential market moves before they happen. Integrate with our existing market data APIs and provide alerts for significant flow.',
    category: 'business',
    tags: ['trading', 'options', 'real-time', 'dashboard'],
    priority: 'high',
    status: 'submitted',
    rating: 4,
    feedback: 'Great idea! This could be valuable for the trading community.',
    votes: 12,
    comments: 3,
    createdAt: '2026-02-11T09:00:00Z',
    updatedAt: '2026-02-11T09:00:00Z',
  },
  {
    id: '2',
    agentId: 'paula',
    agentName: 'Paula',
    title: 'AI Brand Generator for SMBs',
    description: 'Create a service that generates complete brand packages (logo, colors, fonts, guidelines) for small businesses using AI. Input: business description. Output: professional brand kit ready for use.',
    category: 'business',
    tags: ['ai', 'branding', 'automation', 'smb'],
    priority: 'medium',
    status: 'approved',
    rating: 5,
    feedback: 'Perfect for the Biz-in-a-Box model! Let\'s build this.',
    votes: 18,
    comments: 5,
    createdAt: '2026-02-10T14:30:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: '3',
    agentId: 'anders',
    agentName: 'Anders',
    title: 'Universal Agent API Gateway',
    description: 'Build a standardized API that allows any agent to call any other agent across different platforms. Include rate limiting, authentication, and response caching. Make agents truly interoperable.',
    category: 'upgrade',
    tags: ['api', 'integration', 'agents', 'infrastructure'],
    priority: 'high',
    status: 'in-development',
    votes: 8,
    comments: 2,
    createdAt: '2026-02-09T11:15:00Z',
    updatedAt: '2026-02-09T11:15:00Z',
  },
  {
    id: '4',
    agentId: 'dwight',
    agentName: 'Dwight',
    title: 'Competitive Intelligence Automation',
    description: 'Automated system that monitors competitors across social media, news, job postings, and SEC filings. Generate weekly intelligence reports with actionable insights.',
    category: 'tool',
    tags: ['intelligence', 'automation', 'monitoring', 'analysis'],
    priority: 'medium',
    status: 'reviewed',
    rating: 3,
    feedback: 'Interesting but might be too complex for now.',
    votes: 6,
    comments: 1,
    createdAt: '2026-02-08T16:45:00Z',
    updatedAt: '2026-02-08T16:45:00Z',
  },
  {
    id: '5',
    agentId: 'milo',
    agentName: 'Milo',
    title: 'Agent Performance Analytics',
    description: 'Dashboard to track each agent\'s productivity, response times, task completion rates, and user satisfaction. Include recommendations for improvement and workload balancing.',
    category: 'feature',
    tags: ['analytics', 'performance', 'dashboard', 'optimization'],
    priority: 'low',
    status: 'submitted',
    votes: 4,
    comments: 0,
    createdAt: '2026-02-07T10:20:00Z',
    updatedAt: '2026-02-07T10:20:00Z',
  },
];

export default function AgentIdeas() {
  const [ideas, setIdeas] = useState<AgentIdea[]>(mockIdeas);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'votes'>('newest');

  const categories = Array.from(new Set(ideas.map(idea => idea.category)));
  const statuses = Array.from(new Set(ideas.map(idea => idea.status)));

  const filteredIdeas = ideas.filter(idea => {
    if (selectedCategory && idea.category !== selectedCategory) return false;
    if (selectedStatus && idea.status !== selectedStatus) return false;
    return true;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'votes':
        return b.votes - a.votes;
      default:
        return 0;
    }
  });

  const rateIdea = (id: string, rating: number) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, rating, updatedAt: new Date().toISOString() } : idea
    ));
  };

  const voteIdea = (id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
    ));
  };

  const updateStatus = (id: string, status: AgentIdea['status']) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, status, updatedAt: new Date().toISOString() } : idea
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return brand.smoke;
      case 'reviewed': return brand.amber;
      case 'approved': return brand.success;
      case 'in-development': return brand.info;
      case 'completed': return brand.success;
      case 'rejected': return brand.error;
      default: return brand.smoke;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return brand.error;
      case 'medium': return brand.amber;
      case 'low': return brand.success;
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={styles.h1}>Agent Ideas</h1>
          <p style={styles.subtitle}>Business ideas, upgrades, and creative suggestions from your agents</p>
        </div>

        {/* Filters & Stats */}
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
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
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
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="votes">Most Voted</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px', color: brand.smoke, fontSize: '14px' }}>
            <span>{filteredIdeas.length} ideas</span>
            <span>•</span>
            <span>{ideas.filter(i => i.rating && i.rating >= 4).length} highly rated</span>
            <span>•</span>
            <span>{ideas.filter(i => i.status === 'approved').length} approved</span>
          </div>
        </div>

        {/* Ideas List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedIdeas.map(idea => {
            const agent = AGENTS.find(a => a.id === idea.agentId);
            const categoryIcon = CATEGORY_ICONS[idea.category];

            return (
              <div
                key={idea.id}
                style={{
                  ...styles.card,
                  padding: '24px',
                  border: idea.rating && idea.rating >= 4 ? 
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      <h3 style={{ 
                        color: brand.white, 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        margin: 0,
                        marginBottom: '4px' 
                      }}>
                        {idea.title}
                      </h3>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: `${getPriorityColor(idea.priority)}20`,
                      color: getPriorityColor(idea.priority),
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {categoryIcon}
                      {idea.category}
                    </span>

                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: `${getStatusColor(idea.status)}20`,
                      color: getStatusColor(idea.status),
                      textTransform: 'uppercase',
                    }}>
                      {idea.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: brand.silver,
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                }}>
                  {idea.description}
                </p>

                {/* Tags */}
                {idea.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
                )}

                {/* Rating & Feedback */}
                {idea.rating && (
                  <div style={{
                    background: brand.graphite,
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: brand.amber, fontWeight: 600, fontSize: '14px' }}>
                        Derek's Rating:
                      </span>
                      {renderStars(idea.rating, idea.id, true)}
                      <span style={{ color: brand.smoke, fontSize: '12px' }}>
                        ({idea.rating}/5)
                      </span>
                    </div>
                    {idea.feedback && (
                      <p style={{ color: brand.silver, fontSize: '14px', margin: 0, fontStyle: 'italic' }}>
                        "{idea.feedback}"
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
                    {!idea.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: brand.smoke, fontSize: '14px' }}>Rate:</span>
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
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: idea.status === 'approved' ? 'default' : 'pointer',
                          opacity: idea.status === 'approved' ? 0.7 : 1,
                        }}
                      >
                        {idea.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>

                      <button
                        onClick={() => updateStatus(idea.id, 'rejected')}
                        disabled={idea.status === 'rejected'}
                        style={{
                          background: idea.status === 'rejected' ? brand.error : 'transparent',
                          color: idea.status === 'rejected' ? brand.void : brand.error,
                          border: `1px solid ${brand.error}`,
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: idea.status === 'rejected' ? 'default' : 'pointer',
                          opacity: idea.status === 'rejected' ? 0.7 : 1,
                        }}
                      >
                        {idea.status === 'rejected' ? 'Rejected' : 'Reject'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => voteIdea(idea.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: brand.smoke,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                      }}
                    >
                      <Heart size={16} />
                      {idea.votes}
                    </button>

                    <span style={{
                      color: brand.smoke,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <MessageCircle size={16} />
                      {idea.comments}
                    </span>
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
            <Lightbulb size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No ideas found</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>
              {selectedCategory || selectedStatus ? 
                'Try adjusting your filters to see more ideas.' :
                'Your agents haven\'t submitted any ideas yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}