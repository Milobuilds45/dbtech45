'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Zap, RefreshCw, Bookmark, Plus, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

// Design tokens
const T = {
  bg: '#0A0A0A',
  card: '#111111',
  elevated: '#18181B',
  amber: '#F59E0B',
  text: '#FAFAFA',
  secondary: '#A1A1AA',
  muted: '#71717A',
  border: '#27272A',
  blue: '#3B82F6',
  green: '#22C55E',
  purple: '#8B5CF6',
};

interface ResearchResult {
  id: string;
  source: 'reddit' | 'x' | 'youtube' | 'web';
  title: string;
  snippet: string;
  url: string;
  score?: number;
  timestamp: string;
  author?: string;
}

interface ResearchSession {
  id: string;
  query: string;
  status: 'running' | 'complete' | 'error';
  summary?: string;
  keyThemes?: string[];
  results: ResearchResult[];
  createdAt: string;
  duration?: number;
}

interface WatchlistItem {
  id: string;
  topic: string;
  frequency: string;
  lastRun?: string;
  nextRun?: string;
  findings: number;
}

const SOURCE_ICONS: Record<string, { icon: string; color: string }> = {
  reddit: { icon: '📱', color: '#FF4500' },
  x: { icon: '𝕏', color: '#1DA1F2' },
  youtube: { icon: '▶️', color: '#FF0000' },
  web: { icon: '🌐', color: '#22C55E' },
};

const TRENDING_TOPICS = [
  'AI video generation',
  'Claude Code techniques',
  'Remotion animations',
  'Nano Banana Pro prompts',
  'Suno music prompts',
  'MCP servers',
  'OpenClaw skills',
  'Vibe coding',
];

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'watchlist' | 'history'>('search');
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: '1', topic: 'AI video tools', frequency: 'weekly', lastRun: '2026-02-15', findings: 47 },
    { id: '2', topic: 'Claude Code tips', frequency: 'daily', lastRun: '2026-02-18', findings: 23 },
    { id: '3', topic: 'Options trading strategies', frequency: 'weekly', lastRun: '2026-02-17', findings: 31 },
  ]);
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setCurrentSession({
      id: Date.now().toString(),
      query: query.trim(),
      status: 'running',
      results: [],
      createdAt: new Date().toISOString(),
    });

    // Simulate research (would connect to /api/research endpoint)
    setTimeout(() => {
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'complete',
        duration: 127,
        summary: `Found 34 relevant discussions about "${query}" from the last 30 days. The community is actively discussing new techniques and best practices, with several high-engagement posts offering practical tips.`,
        keyThemes: [
          'Prompt engineering techniques',
          'Tool-specific optimizations',
          'Community best practices',
          'Recent updates and changes',
        ],
        results: [
          {
            id: '1',
            source: 'reddit',
            title: `Best ${query} techniques that actually work in 2026`,
            snippet: 'After trying dozens of approaches, these are the ones that consistently produce great results...',
            url: 'https://reddit.com/r/example',
            score: 847,
            timestamp: '2 days ago',
            author: 'u/expert_user',
          },
          {
            id: '2',
            source: 'x',
            title: `Thread: My ${query} workflow`,
            snippet: 'Here\'s my complete workflow for getting the best results. A thread 🧵...',
            url: 'https://x.com/example',
            score: 2341,
            timestamp: '5 days ago',
            author: '@ai_builder',
          },
          {
            id: '3',
            source: 'youtube',
            title: `${query} Tutorial - Everything You Need to Know`,
            snippet: 'In this comprehensive guide, I cover all the latest techniques and tips...',
            url: 'https://youtube.com/watch?v=example',
            score: 45000,
            timestamp: '1 week ago',
            author: 'TechChannel',
          },
        ],
      } : null);
      setIsSearching(false);
    }, 3000);
  };

  const toggleTheme = (theme: string) => {
    setExpandedThemes(prev => {
      const next = new Set(prev);
      if (next.has(theme)) next.delete(theme);
      else next.add(theme);
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Search size={28} style={{ color: T.blue }} />
            <h1 style={{ 
              fontFamily: "'Space Grotesk', system-ui, sans-serif", 
              fontSize: 28, 
              fontWeight: 700, 
              color: T.text,
              margin: 0,
            }}>Research</h1>
          </div>
          <p style={{ fontSize: 14, color: T.secondary, margin: 0 }}>
            Trending topics and audience insights — all in one place
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: T.card, borderRadius: 8, padding: 4, border: `1px solid ${T.border}` }}>
          {[
            { key: 'search', label: 'Search', icon: Search },
            { key: 'watchlist', label: 'Watchlist', icon: Bookmark },
            { key: 'history', label: 'History', icon: Clock },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: activeTab === tab.key ? T.amber : 'transparent',
                color: activeTab === tab.key ? T.bg : T.secondary,
                transition: 'all 0.2s',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Input */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                display: 'flex', 
                gap: 12,
                background: T.card,
                borderRadius: 12,
                padding: 4,
                border: `1px solid ${T.border}`,
              }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="What do you want to research?"
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: T.text,
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  style={{
                    padding: '12px 24px',
                    background: query.trim() ? T.blue : T.elevated,
                    color: query.trim() ? T.text : T.muted,
                    border: 'none',
                    borderRadius: 8,
                    cursor: query.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  {isSearching ? 'Researching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Trending Topics */}
            {!currentSession && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <TrendingUp size={16} style={{ color: T.amber }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.amber, textTransform: 'uppercase', letterSpacing: 1 }}>Trending</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TRENDING_TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => { setQuery(topic); }}
                      style={{
                        padding: '8px 14px',
                        background: T.card,
                        border: `1px solid ${T.border}`,
                        borderRadius: 20,
                        color: T.secondary,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = T.amber;
                        e.currentTarget.style.color = T.text;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = T.border;
                        e.currentTarget.style.color = T.secondary;
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Research Results */}
            {currentSession && (
              <div>
                {/* Status */}
                {currentSession.status === 'running' && (
                  <div style={{ 
                    padding: 24, 
                    background: T.card, 
                    borderRadius: 12, 
                    border: `1px solid ${T.border}`,
                    textAlign: 'center',
                    marginBottom: 24,
                  }}>
                    <RefreshCw size={32} style={{ color: T.blue, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Researching "{currentSession.query}"</div>
                    <div style={{ fontSize: 13, color: T.muted }}>Scanning Reddit, X, YouTube, and the web...</div>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {currentSession.status === 'complete' && (
                  <>
                    {/* Summary */}
                    <div style={{ 
                      padding: 20, 
                      background: T.card, 
                      borderRadius: 12, 
                      border: `1px solid ${T.border}`,
                      marginBottom: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.blue }}>Summary</span>
                        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                          {currentSession.duration}s • {currentSession.results.length} results
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: T.secondary, lineHeight: 1.6, margin: 0 }}>
                        {currentSession.summary}
                      </p>
                    </div>

                    {/* Key Themes */}
                    {currentSession.keyThemes && (
                      <div style={{ 
                        padding: 20, 
                        background: T.card, 
                        borderRadius: 12, 
                        border: `1px solid ${T.border}`,
                        marginBottom: 16,
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.purple, display: 'block', marginBottom: 12 }}>Key Themes</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {currentSession.keyThemes.map((theme, i) => (
                            <div 
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                background: T.elevated,
                                borderRadius: 8,
                                cursor: 'pointer',
                              }}
                              onClick={() => toggleTheme(theme)}
                            >
                              {expandedThemes.has(theme) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <span style={{ fontSize: 13, color: T.text }}>{theme}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {currentSession.results.map(result => {
                        const source = SOURCE_ICONS[result.source];
                        return (
                          <a
                            key={result.id}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 16,
                              background: T.card,
                              borderRadius: 12,
                              border: `1px solid ${T.border}`,
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: T.elevated,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                flexShrink: 0,
                              }}>
                                {source.icon}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{result.title}</span>
                                  <ExternalLink size={12} style={{ color: T.muted }} />
                                </div>
                                <p style={{ fontSize: 13, color: T.secondary, margin: '0 0 8px', lineHeight: 1.5 }}>
                                  {result.snippet}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: T.muted }}>
                                  <span style={{ color: source.color }}>{result.source}</span>
                                  <span>•</span>
                                  <span>{result.author}</span>
                                  <span>•</span>
                                  <span>{result.timestamp}</span>
                                  {result.score && (
                                    <>
                                      <span>•</span>
                                      <span style={{ color: T.green }}>⬆ {result.score.toLocaleString()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    {/* New Search */}
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                      <button
                        onClick={() => { setCurrentSession(null); setQuery(''); }}
                        style={{
                          padding: '10px 20px',
                          background: 'transparent',
                          border: `1px solid ${T.border}`,
                          borderRadius: 8,
                          color: T.secondary,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        ← New Search
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.amber }}>Tracked Topics</span>
              <button style={{
                padding: '8px 14px',
                background: T.amber,
                color: T.bg,
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <Plus size={14} /> Add Topic
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {watchlist.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    background: T.card,
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>{item.topic}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>
                        Runs {item.frequency} • Last: {item.lastRun} • {item.findings} findings
                      </div>
                    </div>
                    <button style={{
                      padding: '6px 12px',
                      background: T.elevated,
                      border: `1px solid ${T.border}`,
                      borderRadius: 6,
                      color: T.secondary,
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <RefreshCw size={12} /> Run Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ textAlign: 'center', padding: 40, color: T.muted }}>
            <Clock size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <div style={{ fontSize: 14 }}>Research history will appear here</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Your past searches and findings</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            Powered by /last30days • Reddit + X + YouTube + Web
          </p>
          <a href="/os" style={{ color: T.amber, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            ← Back to Mission Control
          </a>
        </div>
      </div>
    </div>
  );
}
