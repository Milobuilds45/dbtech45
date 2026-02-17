'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// AI TODAY — AI Landscape by Category
// Design by Paula · Built by Anders
// ═══════════════════════════════════════════════════════════════════════════

interface AIStory {
  title: string;
  url: string;
  source: string;
  description: string;
}

interface AICategory {
  name: string;
  emoji: string;
  badge: string;
  stories: AIStory[];
  links: Array<{ title: string; source: string; url: string }>;
}

interface AIData {
  categories: AICategory[];
  top_headlines: AIStory[];
  hn_ai: AIStory[];
}

export default function AITodayPage() {
  const [data, setData] = useState<AIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/morning-brief/ai-today');
        if (!res.ok) throw new Error(`${res.status}`);
        setData(await res.json());
      } catch (e) {
        console.error('AI data fetch failed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading-pulse">LOADING AI LANDSCAPE...</div>;
  if (!data) return <div className="loading-pulse">AI DATA UNAVAILABLE</div>;

  // Landscape sidebar data (static — matches Paula's design)
  const landscape = {
    power: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'NVIDIA'],
    foundation: { a: ['OpenAI', 'Anthropic', 'DeepMind', 'Meta AI'], b: ['xAI', 'Mistral', 'Cohere', 'DeepSeek', 'Qwen'] },
    vibeCoding: { a: ['Cursor', 'Copilot', 'Claude'], b: ['Windsurf', 'Codeium', 'Replit'] },
    video: { a: ['Sora', 'Veo', 'Seedance'], b: ['Runway', 'Kling'] },
    image: { a: ['Midjourney', 'DALL-E'], b: ['Stability', 'Firefly'] },
    infra: { a: ['NVIDIA'], b: ['Azure AI', 'AWS', 'Groq', 'Together', 'Fireworks'] },
  };

  return (
    <main className="section-page">
      <header className="section-header">
        <h1 className="section-title">AI Today</h1>
        <p className="section-subtitle">The AI landscape: models, tools, infrastructure, and the companies that matter.</p>
      </header>

      {/* ══════════ TOP 5 HEADLINE CARDS ══════════ */}
      <div className="ai-headlines">
        {data.top_headlines.map((h, i) => (
          <div key={i} className="ai-headline-card">
            <div className="company">{h.source.split('.')[0].toUpperCase()}</div>
            <h3><a href={h.url} target="_blank" rel="noopener noreferrer">{h.title}</a></h3>
            <div className="meta">{h.source}</div>
          </div>
        ))}
      </div>

      <div className="tech-layout">
        {/* ══════════ MAIN CONTENT — CATEGORIES ══════════ */}
        <div className="tech-river">
          {data.categories.map((cat, i) => (
            <section key={i} className="category-section" style={i === data.categories.length - 1 ? { borderBottom: 'none', paddingBottom: 0 } : {}}>
              <div className="category-header">
                <h3>{cat.name}</h3>
                <span className="tier-badge">{cat.badge}</span>
              </div>
              <div className="category-stories">
                {cat.stories.map((story, j) => (
                  <article key={j} className="category-story">
                    <div className="source">{story.source}</div>
                    <h4><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a></h4>
                    {story.description && <p>{story.description}</p>}
                  </article>
                ))}
              </div>
              {cat.links.length > 0 && (
                <div className="category-links">
                  {cat.links.map((link, k) => (
                    <a key={k} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title} <span className="link-source">— {link.source}</span>
                    </a>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* ══════════ SIDEBAR — LANDSCAPE ══════════ */}
        <aside className="tech-sidebar">
          {/* Power Concentration */}
          <div className="sidebar-box">
            <h4>Power Concentration</h4>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>The 5 that matter most:</p>
            <div className="player-grid">
              {landscape.power.map((p, i) => (
                <span key={i} className="player-tag tier-a">{p}</span>
              ))}
            </div>
          </div>

          {/* Foundation Models */}
          <div className="sidebar-box">
            <h4>Foundation Models</h4>
            <p style={{ fontSize: 10, color: 'var(--amber)', marginBottom: 8 }}>TIER A</p>
            <div className="player-grid">
              {landscape.foundation.a.map((p, i) => <span key={i} className="player-tag">{p}</span>)}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '12px 0 8px' }}>TIER B</p>
            <div className="player-grid">
              {landscape.foundation.b.map((p, i) => <span key={i} className="player-tag">{p}</span>)}
            </div>
          </div>

          {/* Vibe Coding */}
          <div className="sidebar-box">
            <h4>Vibe Coding</h4>
            <div className="player-grid">
              {[...landscape.vibeCoding.a.map(p => ({ name: p, tier: true })), ...landscape.vibeCoding.b.map(p => ({ name: p, tier: false }))].map((p, i) => (
                <span key={i} className={`player-tag ${p.tier ? 'tier-a' : ''}`}>{p.name}</span>
              ))}
            </div>
          </div>

          {/* Video AI */}
          <div className="sidebar-box">
            <h4>Video AI</h4>
            <div className="player-grid">
              {[...landscape.video.a.map(p => ({ name: p, tier: true })), ...landscape.video.b.map(p => ({ name: p, tier: false }))].map((p, i) => (
                <span key={i} className={`player-tag ${p.tier ? 'tier-a' : ''}`}>{p.name}</span>
              ))}
            </div>
          </div>

          {/* Image AI */}
          <div className="sidebar-box">
            <h4>Image AI</h4>
            <div className="player-grid">
              {[...landscape.image.a.map(p => ({ name: p, tier: true })), ...landscape.image.b.map(p => ({ name: p, tier: false }))].map((p, i) => (
                <span key={i} className={`player-tag ${p.tier ? 'tier-a' : ''}`}>{p.name}</span>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div className="sidebar-box">
            <h4>Infrastructure</h4>
            <div className="player-grid">
              {[...landscape.infra.a.map(p => ({ name: p, tier: true })), ...landscape.infra.b.map(p => ({ name: p, tier: false }))].map((p, i) => (
                <span key={i} className={`player-tag ${p.tier ? 'tier-a' : ''}`}>{p.name}</span>
              ))}
            </div>
          </div>

          {/* HN AI Stories */}
          {data.hn_ai.length > 0 && (
            <div className="sidebar-box">
              <h4>AI on HN</h4>
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.hn_ai.map((story, i) => (
                  <div key={i}>
                    <a href={story.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', lineHeight: 1.4, display: 'block' }}>
                      {story.title}
                    </a>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{story.source}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Tip */}
          <div className="sidebar-box">
            <h4>Prompt Tip of the Day</h4>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              &ldquo;Chain-of-thought prompting improves reasoning by 20-40% on complex tasks. Simply add &apos;Let&apos;s think step by step&apos; or ask the model to show its work.&rdquo;
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              — <span style={{ color: 'var(--amber)' }}>@karpathy</span>
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
