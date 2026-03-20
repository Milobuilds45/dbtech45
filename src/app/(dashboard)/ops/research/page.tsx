'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, RefreshCw, ExternalLink, X as XIcon } from 'lucide-react';

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
};

interface ResearchResult {
  id: string;
  source: 'reddit' | 'x' | 'youtube' | 'web' | 'hn';
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
  results: ResearchResult[];
  createdAt: string;
  duration?: number;
}

const SOURCE_COLORS: Record<string, string> = {
  reddit: '#FF4500',
  x: '#1DA1F2',
  youtube: '#FF0000',
  web: '#22C55E',
  hn: '#FF6600',
};

export default function ResearchPage() {
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [useScrapeCreators, setUseScrapeCreators] = useState(false);
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  useEffect(() => {
    // Load trending topics
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => {
        if (data.topics && data.topics.length > 0) {
          setTrendingTopics(data.topics);
        }
      })
      .catch(() => {});

    // Load research history from database
    fetch('/api/research-history')
      .then(r => r.json())
      .then(data => {
        if (data.history && data.history.length > 0) {
          const loaded = data.history.map((item: any) => ({
            id: item.id,
            query: item.query,
            status: 'complete' as const,
            summary: item.summary,
            results: JSON.parse(item.results || '[]'),
            createdAt: item.created_at,
            duration: item.duration,
          }));
          setHistory(loaded);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    const newSession: ResearchSession = {
      id: Date.now().toString(),
      query: query.trim(),
      status: 'running',
      results: [],
      createdAt: new Date().toISOString(),
    };
    setCurrentSession(newSession);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          useScrapeCreators,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCurrentSession(prev => prev ? {
          ...prev,
          status: 'error',
          summary: `Research failed: ${data.error || 'Unknown error'}`,
          results: [],
        } : null);
        setIsSearching(false);
        return;
      }

      const completedSession: ResearchSession = {
        ...newSession,
        status: 'complete',
        duration: data.duration || 180,
        summary: data.summary || `Research complete for "${query}"`,
        results: data.results || [],
      };
      setCurrentSession(completedSession);
      setHistory(prev => [completedSession, ...prev].slice(0, 50));

      // Save to database
      fetch('/api/research-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: completedSession.query,
          summary: completedSession.summary,
          results: completedSession.results,
          duration: completedSession.duration,
          usedCredits: useScrapeCreators,
        }),
      }).catch(err => console.error('Failed to save research:', err));
    } catch (err) {
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'error',
        summary: 'Connection error - please try again',
        results: [],
      } : null);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setCurrentSession(null);
    setQuery('');
  };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger the search
    
    try {
      await fetch(`/api/research-history?id=${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: T.bg, 
      color: T.text,
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Research</h1>
          <p style={{ fontSize: 15, color: T.secondary }}>
            Deep research across Reddit, X, YouTube, Hacker News, and more • Powered by <span style={{ color: T.amber }}>last30days</span> skill
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 32 }}>
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
              onKeyDown={e => e.key === 'Enter' && !isSearching && handleSearch()}
              placeholder="What do you want to research?"
              disabled={isSearching}
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
                background: query.trim() && !isSearching ? T.blue : T.elevated,
                color: query.trim() && !isSearching ? T.text : T.muted,
                border: 'none',
                borderRadius: 8,
                cursor: query.trim() && !isSearching ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {isSearching ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Optional Reddit/TikTok/Instagram Toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
            cursor: 'pointer',
            fontSize: 13,
            color: T.secondary,
          }}>
            <input
              type="checkbox"
              checked={useScrapeCreators}
              onChange={e => setUseScrapeCreators(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Include Reddit, TikTok & Instagram</span>
            <span style={{ 
              fontSize: 11, 
              color: T.muted,
              padding: '2px 6px',
              background: T.elevated,
              borderRadius: 4,
            }}>
              uses credits
            </span>
          </label>
        </div>

        {/* Trending Topics */}
        {!currentSession && trendingTopics.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={16} style={{ color: T.amber }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.amber, textTransform: 'uppercase', letterSpacing: 1 }}>
                Trending Topics
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {trendingTopics.map(topic => (
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
            {/* Clear button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Results for "{currentSession.query}"</h2>
              <button
                onClick={clearResults}
                style={{
                  padding: '6px 12px',
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.secondary,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <XIcon size={14} />
                Clear
              </button>
            </div>

            {/* Running status */}
            {currentSession.status === 'running' && (
              <div style={{ 
                padding: 32, 
                background: T.card, 
                borderRadius: 12, 
                border: `1px solid ${T.border}`,
                textAlign: 'center',
              }}>
                <RefreshCw size={32} style={{ color: T.blue, marginBottom: 12 }} className="animate-spin" />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  Researching "{currentSession.query}"
                </div>
                <div style={{ fontSize: 13, color: T.muted }}>
                  This may take 1-3 minutes...
                </div>
              </div>
            )}

            {/* Error */}
            {currentSession.status === 'error' && (
              <div style={{ 
                padding: 24, 
                background: T.card, 
                borderRadius: 12, 
                border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 14, color: '#EF4444' }}>{currentSession.summary}</div>
              </div>
            )}

            {/* Complete */}
            {currentSession.status === 'complete' && (
              <>
                {/* Stats bar */}
                <div style={{ 
                  padding: 16, 
                  background: T.card, 
                  borderRadius: 12, 
                  border: `1px solid ${T.border}`,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 14, color: T.secondary }}>
                    Found <strong style={{ color: T.text }}>{currentSession.results.length}</strong> results in <strong style={{ color: T.text }}>{currentSession.duration}s</strong>
                  </div>
                  
                  {/* Source filters */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setSourceFilter(null)}
                      style={{
                        padding: '4px 10px',
                        background: !sourceFilter ? T.blue : T.elevated,
                        border: 'none',
                        borderRadius: 6,
                        color: T.text,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      All
                    </button>
                    {['youtube', 'hn', 'x', 'reddit'].map(source => {
                      const count = currentSession.results.filter(r => r.source === source).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={source}
                          onClick={() => setSourceFilter(source)}
                          style={{
                            padding: '4px 10px',
                            background: sourceFilter === source ? SOURCE_COLORS[source] : T.elevated,
                            border: 'none',
                            borderRadius: 6,
                            color: T.text,
                            fontSize: 12,
                            cursor: 'pointer',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                          }}
                        >
                          {source} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentSession.results.length === 0 ? (
                    <div style={{ 
                      padding: 32, 
                      background: T.card, 
                      borderRadius: 12, 
                      border: `1px solid ${T.border}`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 14, color: T.muted }}>No results found</div>
                    </div>
                  ) : (
                    currentSession.results
                      .filter(r => !sourceFilter || r.source === sourceFilter)
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map(result => {
                      const sourceColor = SOURCE_COLORS[result.source] || T.blue;
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
                            display: 'block',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                                  {result.title}
                                </span>
                                <ExternalLink size={12} style={{ color: T.muted, flexShrink: 0 }} />
                              </div>
                              {result.snippet && (
                                <p style={{ fontSize: 13, color: T.secondary, margin: '0 0 8px', lineHeight: 1.5 }}>
                                  {result.snippet}
                                </p>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: T.muted }}>
                                <span style={{ color: sourceColor, fontWeight: 600, textTransform: 'uppercase' }}>
                                  {result.source}
                                </span>
                                {result.author && (
                                  <>
                                    <span>•</span>
                                    <span>{result.author}</span>
                                  </>
                                )}
                                {result.score && (
                                  <>
                                    <span>•</span>
                                    <span>{result.score} score</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{result.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Recent History */}
        {!currentSession && history.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: T.secondary }}>
              Recent Searches
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 5).map(session => (
                <div
                  key={session.id}
                  style={{
                    padding: 12,
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <button
                    onClick={() => setQuery(session.query)}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      color: T.text,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                    }}
                  >
                    {session.query}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: T.muted }}>
                      {session.results.length} results
                    </span>
                    <button
                      onClick={(e) => deleteHistory(session.id, e)}
                      style={{
                        padding: '4px 8px',
                        background: 'none',
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        color: T.muted,
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#EF4444';
                        e.currentTarget.style.color = '#EF4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = T.border;
                        e.currentTarget.style.color = T.muted;
                      }}
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
