'use client';

import { useEffect, useState } from 'react';
import styles from '../morning-brief.module.css';

interface AIStory {
  title: string;
  url: string;
  source: string;
  description: string;
  thumbnail: string | null;
  timeAgo: string;
  category: string;
}

const AI_CATEGORIES = [
  { key: 'Foundation Models', icon: '\uD83E\uDDE0', badge: 'CORE INTELLIGENCE', tierA: ['OpenAI', 'Anthropic', 'DeepMind', 'Meta AI'], tierB: ['xAI', 'Mistral', 'Cohere', 'DeepSeek', 'Qwen'] },
  { key: 'Vibe Coding', icon: '\uD83D\uDCBB', badge: 'DEV TOOLS', tierA: ['Cursor', 'Copilot', 'Claude Code'], tierB: ['Windsurf', 'Codeium', 'Replit'] },
  { key: 'AI Search', icon: '\uD83D\uDD0E', badge: 'KNOWLEDGE', tierA: ['Perplexity', 'Google AI'], tierB: ['You.com', 'Brave Search'] },
  { key: 'Generative Video', icon: '\uD83C\uDFA5', badge: 'VIDEO AI', tierA: ['Sora', 'Veo', 'Seedance'], tierB: ['Runway', 'Kling'] },
  { key: 'Image Generation', icon: '\uD83D\uDDBC', badge: 'IMAGE AI', tierA: ['Midjourney', 'DALL-E'], tierB: ['Stability', 'Firefly', 'Flux'] },
  { key: 'Infrastructure', icon: '\u2699\uFE0F', badge: 'INFRA', tierA: ['NVIDIA', 'Azure AI'], tierB: ['AWS', 'Groq', 'Together', 'Fireworks'] },
  { key: 'Open Models', icon: '\uD83E\uDDEC', badge: 'OPEN SOURCE', tierA: ['Meta (Llama)', 'HuggingFace'], tierB: ['DeepSeek', 'Mistral', 'Qwen'] },
];

const POWER_PLAYERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'NVIDIA'];

export default function AITodayPage() {
  const [stories, setStories] = useState<AIStory[]>([]);
  const [topStories, setTopStories] = useState<AIStory[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, AIStory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/morning-brief/ai-news')
      .then(r => r.json())
      .then(data => {
        setStories(data.stories || []);
        setTopStories(data.topStories || []);
        setByCategory(data.byCategory || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fallback: if no stories for a category from API, check all stories
  function getCategoryStories(key: string): AIStory[] {
    if (byCategory[key] && byCategory[key].length > 0) return byCategory[key].slice(0, 4);
    return [];
  }

  return (
    <main className={styles.sectionPage}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>AI Today</h1>
        <p className={styles.sectionSubtitle}>The AI landscape: models, tools, infrastructure, and the companies that matter.</p>
      </header>

      {/* TOP 5 HEADLINE CARDS */}
      <div className={styles.aiHeadlines}>
        {(topStories.length > 0 ? topStories : stories.slice(0, 5)).map((story, i) => (
          <a key={i} href={story.url} target="_blank" rel="noopener noreferrer" className={styles.aiHeadlineCard}>
            {story.thumbnail && (
              <div style={{
                width: '100%',
                height: 100,
                marginBottom: 10,
                borderRadius: 4,
                overflow: 'hidden',
                background: '#181818',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.thumbnail}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className={styles.aiHeadlineCompany}>{story.source}</div>
            <h3 className={styles.aiHeadlineTitle}>{story.title}</h3>
            <div className={styles.aiHeadlineMeta}>{story.timeAgo}</div>
          </a>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <span className={styles.loadingDot}>{'\u25CF'}</span> Loading AI news...
        </div>
      ) : (
        <div className={styles.techLayout}>
          {/* MAIN CONTENT - Category Sections */}
          <div className={styles.techRiver}>
            {AI_CATEGORIES.map((cat, catIdx) => {
              const catStories = getCategoryStories(cat.key);
              const isLast = catIdx === AI_CATEGORIES.length - 1;

              return (
                <section key={catIdx} className={isLast ? styles.categorySectionLast : styles.categorySection}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryHeaderTitle}>{cat.icon} {cat.key}</h3>
                    <span className={styles.tierBadge}>{cat.badge}</span>
                  </div>

                  <div className={styles.categoryStories}>
                    {catStories.length > 0 ? (
                      catStories.map((story, i) => (
                        <article key={i} className={styles.categoryStory} style={{ display: 'flex', gap: 14 }}>
                          {story.thumbnail && (
                            <div style={{
                              width: 80,
                              minWidth: 80,
                              height: 60,
                              borderRadius: 4,
                              overflow: 'hidden',
                              background: '#181818',
                              flexShrink: 0,
                            }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={story.thumbnail}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div className={styles.categoryStorySource}>{story.source}</div>
                            <h4 className={styles.categoryStoryTitle}>
                              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
                            </h4>
                            <p className={styles.categoryStoryDesc}>{story.description}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <article className={styles.categoryStory}>
                        <div className={styles.categoryStorySource}>Landscape</div>
                        <h4 className={styles.categoryStoryTitle}>
                          Key players: {cat.tierA.join(', ')}
                        </h4>
                        <p className={styles.categoryStoryDesc}>
                          Also watching: {cat.tierB.join(', ')}
                        </p>
                      </article>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* SIDEBAR - Landscape */}
          <aside className={styles.techSidebar}>
            {/* Power Concentration */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>Power Concentration</h4>
              <p style={{ fontSize: 11, color: '#525252', marginBottom: 12 }}>The 5 that matter most:</p>
              <div className={styles.playerGrid}>
                {POWER_PLAYERS.map(p => (
                  <span key={p} className={styles.playerTagTierA}>{p}</span>
                ))}
              </div>
            </div>

            {/* Category landscapes */}
            {AI_CATEGORIES.slice(0, 5).map((cat, i) => (
              <div key={i} className={styles.sidebarBox}>
                <h4 className={styles.sidebarBoxTitle}>{cat.key}</h4>
                <p style={{ fontSize: 10, color: '#F59E0B', marginBottom: 8 }}>TIER A</p>
                <div className={styles.playerGrid}>
                  {cat.tierA.map(p => (
                    <span key={p} className={styles.playerTagTierA}>{p}</span>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: '#525252', margin: '12px 0 8px' }}>TIER B</p>
                <div className={styles.playerGrid}>
                  {cat.tierB.map(p => (
                    <span key={p} className={styles.playerTag}>{p}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Prompt Tip */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>Prompt Tip of the Day</h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                {'\u201C'}Chain-of-thought prompting improves reasoning by 20-40% on complex tasks. Simply add {'\u201C'}Let{'\u2019'}s think step by step{'\u201D'} or ask the model to show its work.{'\u201D'}
              </p>
              <p style={{ fontSize: 11, color: '#525252' }}>
                {'\u2014'} <span style={{ color: '#F59E0B' }}>@karpathy</span>
              </p>
            </div>

            {/* Papers */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>Papers Worth Reading</h4>
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <a href="https://arxiv.org/abs/2001.08361" target="_blank" rel="noopener noreferrer" style={{ color: '#FAFAFA', lineHeight: 1.4, display: 'block' }}>
                    Scaling Laws for Neural Language Models
                  </a>
                  <span style={{ color: '#525252', fontSize: 11 }}>arXiv {'\u2022'} Kaplan et al.</span>
                </div>
                <div>
                  <a href="https://arxiv.org/abs/2212.08073" target="_blank" rel="noopener noreferrer" style={{ color: '#FAFAFA', lineHeight: 1.4, display: 'block' }}>
                    Constitutional AI: Harmlessness from AI Feedback
                  </a>
                  <span style={{ color: '#525252', fontSize: 11 }}>arXiv {'\u2022'} Anthropic</span>
                </div>
                <div>
                  <a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener noreferrer" style={{ color: '#FAFAFA', lineHeight: 1.4, display: 'block' }}>
                    ReAct: Reasoning and Acting in Language Models
                  </a>
                  <span style={{ color: '#525252', fontSize: 11 }}>arXiv {'\u2022'} Yao et al.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
