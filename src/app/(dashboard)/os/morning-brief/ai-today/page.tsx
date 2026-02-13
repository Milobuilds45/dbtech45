'use client';

import { useEffect, useState } from 'react';
import styles from '../morning-brief.module.css';

interface TechStory {
  id: number;
  title: string;
  url: string;
  score: number;
  domain: string;
  descendants: number;
  timeAgo: string;
  hnUrl: string;
}

// AI categories with landscape data
const AI_CATEGORIES = [
  {
    icon: '\uD83E\uDDE0',
    title: 'Frontier Foundation Models',
    badge: 'CORE INTELLIGENCE',
    keywords: ['gpt', 'claude', 'gemini', 'llama', 'model', 'llm', 'language model', 'foundation', 'openai', 'anthropic', 'deepmind'],
    landscape: {
      tierA: ['OpenAI', 'Anthropic', 'DeepMind', 'Meta AI'],
      tierB: ['xAI', 'Mistral', 'Cohere', 'DeepSeek', 'Qwen'],
    },
  },
  {
    icon: '\uD83D\uDCBB',
    title: 'Vibe Coding / Developer Flow',
    badge: 'DEV TOOLS',
    keywords: ['cursor', 'copilot', 'coding', 'developer', 'ide', 'code', 'programming', 'windsurf', 'codeium', 'replit'],
    landscape: {
      tierA: ['Cursor', 'Copilot', 'Claude Code'],
      tierB: ['Windsurf', 'Codeium', 'Replit'],
    },
  },
  {
    icon: '\uD83D\uDD0E',
    title: 'AI Search / Knowledge Engines',
    badge: 'KNOWLEDGE',
    keywords: ['search', 'perplexity', 'rag', 'retrieval', 'knowledge', 'google ai'],
    landscape: {
      tierA: ['Perplexity', 'Google AI'],
      tierB: ['You.com', 'Brave Search'],
    },
  },
  {
    icon: '\uD83C\uDFA5',
    title: 'Generative Video',
    badge: 'VIDEO AI',
    keywords: ['sora', 'video', 'runway', 'veo', 'kling', 'seedance'],
    landscape: {
      tierA: ['Sora', 'Veo', 'Seedance'],
      tierB: ['Runway', 'Kling'],
    },
  },
  {
    icon: '\uD83D\uDDBC',
    title: 'Image Generation',
    badge: 'IMAGE AI',
    keywords: ['midjourney', 'dall-e', 'image', 'stable diffusion', 'flux', 'firefly'],
    landscape: {
      tierA: ['Midjourney', 'DALL-E'],
      tierB: ['Stability', 'Firefly', 'Flux'],
    },
  },
  {
    icon: '\u2699\uFE0F',
    title: 'Infrastructure / GPU Layer',
    badge: 'INFRA',
    keywords: ['nvidia', 'gpu', 'inference', 'groq', 'chip', 'hardware', 'datacenter', 'compute', 'tpu'],
    landscape: {
      tierA: ['NVIDIA', 'Azure AI'],
      tierB: ['AWS', 'Groq', 'Together', 'Fireworks'],
    },
  },
  {
    icon: '\uD83E\uDDEC',
    title: 'Open Model Ecosystem',
    badge: 'OPEN SOURCE',
    keywords: ['open source', 'open-source', 'hugging face', 'weights', 'fine-tune', 'ollama', 'local'],
    landscape: {
      tierA: ['Meta (Llama)', 'HuggingFace'],
      tierB: ['DeepSeek', 'Mistral', 'Qwen'],
    },
  },
];

const POWER_PLAYERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'NVIDIA'];

export default function AITodayPage() {
  const [stories, setStories] = useState<TechStory[]>([]);

  useEffect(() => {
    fetch('/api/morning-brief/tech')
      .then(r => r.json())
      .then(data => setStories(data.stories || []))
      .catch(() => {});
  }, []);

  // Categorize stories
  function getStoriesForCategory(keywords: string[]): TechStory[] {
    return stories.filter(s => 
      keywords.some(kw => s.title.toLowerCase().includes(kw.toLowerCase()))
    ).slice(0, 2);
  }

  // AI-related stories
  const aiStories = stories.filter(s => {
    const t = s.title.toLowerCase();
    return t.includes('ai') || t.includes('llm') || t.includes('gpt') || t.includes('model') || 
           t.includes('neural') || t.includes('machine learning') || t.includes('deep learning') ||
           t.includes('openai') || t.includes('anthropic') || t.includes('gemini') || t.includes('claude');
  });

  // Top 5 headline cards
  const topAIStories = aiStories.length >= 5 ? aiStories.slice(0, 5) : stories.slice(0, 5);

  return (
    <main className={styles.sectionPage}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>AI Today</h1>
        <p className={styles.sectionSubtitle}>The AI landscape: models, tools, infrastructure, and the companies that matter.</p>
      </header>

      {/* TOP 5 HEADLINE CARDS */}
      <div className={styles.aiHeadlines}>
        {topAIStories.map(story => (
          <a key={story.id} href={story.url} target="_blank" rel="noopener noreferrer" className={styles.aiHeadlineCard}>
            <div className={styles.aiHeadlineCompany}>{story.domain || 'HN'}</div>
            <h3 className={styles.aiHeadlineTitle}>{story.title}</h3>
            <div className={styles.aiHeadlineMeta}>{story.score} pts \u2022 {story.timeAgo}</div>
          </a>
        ))}
      </div>

      {stories.length === 0 ? (
        <div className={styles.loading}>
          <span className={styles.loadingDot}>{'\u25CF'}</span> Loading AI news...
        </div>
      ) : (
        <div className={styles.techLayout}>
          {/* MAIN CONTENT - Category Sections */}
          <div className={styles.techRiver}>
            {AI_CATEGORIES.map((cat, catIdx) => {
              const catStories = getStoriesForCategory(cat.keywords);
              const isLast = catIdx === AI_CATEGORIES.length - 1;

              return (
                <section key={catIdx} className={isLast ? styles.categorySectionLast : styles.categorySection}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryHeaderTitle}>{cat.icon} {cat.title}</h3>
                    <span className={styles.tierBadge}>{cat.badge}</span>
                  </div>

                  {catStories.length > 0 ? (
                    <div className={styles.categoryStories}>
                      {catStories.map(story => (
                        <article key={story.id} className={styles.categoryStory}>
                          <div className={styles.categoryStorySource}>{story.domain || 'HN'}</div>
                          <h4 className={styles.categoryStoryTitle}>
                            <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
                          </h4>
                          <p className={styles.categoryStoryDesc}>
                            {story.score} points \u2022 {story.descendants} comments \u2022 {story.timeAgo}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.categoryStories}>
                      <article className={styles.categoryStory}>
                        <div className={styles.categoryStorySource}>Landscape</div>
                        <h4 className={styles.categoryStoryTitle}>
                          Key players: {cat.landscape.tierA.join(', ')}
                        </h4>
                        <p className={styles.categoryStoryDesc}>
                          Also watching: {cat.landscape.tierB.join(', ')}
                        </p>
                      </article>
                    </div>
                  )}
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
                <h4 className={styles.sidebarBoxTitle}>{cat.title.split('/')[0].trim()}</h4>
                <p style={{ fontSize: 10, color: '#F59E0B', marginBottom: 8 }}>TIER A</p>
                <div className={styles.playerGrid}>
                  {cat.landscape.tierA.map(p => (
                    <span key={p} className={styles.playerTagTierA}>{p}</span>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: '#525252', margin: '12px 0 8px' }}>TIER B</p>
                <div className={styles.playerGrid}>
                  {cat.landscape.tierB.map(p => (
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
                  <span style={{ color: '#525252', fontSize: 11 }}>arXiv \u2022 Kaplan et al.</span>
                </div>
                <div>
                  <a href="https://arxiv.org/abs/2212.08073" target="_blank" rel="noopener noreferrer" style={{ color: '#FAFAFA', lineHeight: 1.4, display: 'block' }}>
                    Constitutional AI: Harmlessness from AI Feedback
                  </a>
                  <span style={{ color: '#525252', fontSize: 11 }}>arXiv \u2022 Anthropic</span>
                </div>
                <div>
                  <a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener noreferrer" style={{ color: '#FAFAFA', lineHeight: 1.4, display: 'block' }}>
                    ReAct: Reasoning and Acting in Language Models
                  </a>
                  <span style={{ color: '#525252', fontSize: 11 }}>arXiv \u2022 Yao et al.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
