'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TECH — Techmeme-style River Layout
// Design by Paula · Built by Anders
// ═══════════════════════════════════════════════════════════════════════════

interface TechStory {
  title: string;
  url: string;
  source: string;
  time: string;
  description: string;
  comments?: number;
  points?: number;
}

interface TechData {
  stories: TechStory[];
  hn_sidebar: TechStory[];
  leaderboard: Array<{ name: string; count: number }>;
  topics: string[];
}

export default function TechPage() {
  const [data, setData] = useState<TechData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/morning-brief/tech');
        if (!res.ok) throw new Error(`${res.status}`);
        setData(await res.json());
      } catch (e) {
        console.error('Tech data fetch failed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-pulse">LOADING TECH NEWS...</div>;
  if (!data) return <div className="loading-pulse">TECH DATA UNAVAILABLE</div>;

  return (
    <main className="section-page">
      <header className="section-header">
        <h1 className="section-title">Tech</h1>
        <p className="section-subtitle">The tech news that matters, clustered by story. Techmeme-style.</p>
      </header>

      <div className="tech-layout">
        {/* ══════════ MAIN RIVER ══════════ */}
        <div className="tech-river">
          {data.stories.map((story, i) => (
            <article key={i} className="story-cluster">
              <div className="cluster-main">
                <div className="cluster-time">{story.time}</div>
                <h2 className="cluster-headline">
                  <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
                </h2>
                <span className="cluster-source">{story.source}</span>
                {story.description && (
                  <p className="cluster-deck">{story.description}</p>
                )}
              </div>
              {(story.comments !== undefined || story.points !== undefined) && (
                <div className="cluster-discussion">
                  {story.points !== undefined && <span>{story.points} points</span>}
                  {story.comments !== undefined && story.comments > 0 && (
                    <a href={story.url.includes('ycombinator') ? story.url : `https://news.ycombinator.com`} target="_blank" rel="noopener noreferrer">
                      {story.comments} comments on HN
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="tech-sidebar">
          {/* Source Leaderboard */}
          {data.leaderboard.length > 0 && (
            <div className="sidebar-box">
              <h4>Source Leaderboard</h4>
              {data.leaderboard.map((item, i) => (
                <div key={i} className="leaderboard-item">
                  <span className="leaderboard-rank">{i + 1}</span>
                  <span className="leaderboard-name">{item.name}</span>
                  <span className="leaderboard-count">{item.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Trending Topics */}
          {data.topics.length > 0 && (
            <div className="sidebar-box">
              <h4>Trending Topics</h4>
              <div className="trending-topics" style={{ paddingTop: 0, borderTop: 'none', marginTop: 0 }}>
                {data.topics.map((topic, i) => (
                  <span key={i} className="topic">{topic}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="sidebar-box">
            <h4>Quick Links</h4>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Hacker News →</a>
              <a href="https://techmeme.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Techmeme →</a>
              <a href="https://lobste.rs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Lobsters →</a>
              <a href="https://reddit.com/r/technology" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>r/technology →</a>
            </div>
          </div>

          {/* HN Front Page */}
          {data.hn_sidebar.length > 0 && (
            <div className="sidebar-box">
              <h4>HN Front Page</h4>
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.hn_sidebar.map((story, i) => (
                  <div key={i}>
                    <a href={story.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', lineHeight: 1.4, display: 'block' }}>
                      {story.title}
                    </a>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {story.points ?? 0} points • {story.comments ?? 0} comments
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
