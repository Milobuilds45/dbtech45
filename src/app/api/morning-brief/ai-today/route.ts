import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// AI TODAY API — AI news by category via Brave Search + HackerNews
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

// ─── Brave Search for AI Category ───────────────────────────────────────
async function searchAICategory(query: string, count: number = 5): Promise<AIStory[]> {
  const key = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&freshness=pw`,
      {
        headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': key },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.web?.results ?? []).slice(0, count).map((r: { title: string; url: string; description: string }) => ({
      title: r.title,
      url: r.url,
      source: new URL(r.url).hostname.replace('www.', ''),
      description: r.description || '',
    }));
  } catch (e) {
    console.error(`Brave AI search failed for: ${query}`, e);
    return [];
  }
}

// ─── HN AI Stories ──────────────────────────────────────────────────────
async function getHNAIStories(): Promise<AIStory[]> {
  try {
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search?query=AI+artificial+intelligence+LLM&tags=story&hitsPerPage=10',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits ?? []).map((h: { title: string; url: string; story_text: string; objectID: string }) => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: h.url ? new URL(h.url).hostname.replace('www.', '') : 'news.ycombinator.com',
      description: '',
    }));
  } catch (e) {
    console.error('HN AI search failed:', e);
    return [];
  }
}

export async function GET() {
  // Search for each AI category in parallel
  const [
    foundationModels,
    vibeCoding,
    aiSearch,
    genVideo,
    imageGen,
    infrastructure,
    openModels,
    hnAI,
  ] = await Promise.all([
    searchAICategory('AI foundation models GPT Claude Gemini news', 4),
    searchAICategory('AI coding tools Cursor Copilot developer', 4),
    searchAICategory('AI search Perplexity Google AI Overviews', 4),
    searchAICategory('AI video generation Sora Runway Seedance', 4),
    searchAICategory('AI image generation Midjourney DALL-E Stable Diffusion', 4),
    searchAICategory('AI infrastructure GPU Nvidia cloud computing', 4),
    searchAICategory('open source AI models Llama Mistral Hugging Face', 4),
    getHNAIStories(),
  ]);

  const categories: AICategory[] = [
    {
      name: '🧠 Frontier Foundation Models',
      emoji: '🧠',
      badge: 'CORE INTELLIGENCE',
      stories: foundationModels.slice(0, 2),
      links: foundationModels.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
    {
      name: '💻 Vibe Coding / Developer Flow',
      emoji: '💻',
      badge: 'DEV TOOLS',
      stories: vibeCoding.slice(0, 2),
      links: vibeCoding.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
    {
      name: '🔎 AI Search / Knowledge Engines',
      emoji: '🔎',
      badge: 'KNOWLEDGE',
      stories: aiSearch.slice(0, 2),
      links: aiSearch.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
    {
      name: '🎥 Generative Video',
      emoji: '🎥',
      badge: 'VIDEO AI',
      stories: genVideo.slice(0, 2),
      links: genVideo.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
    {
      name: '🖼 Image Generation',
      emoji: '🖼',
      badge: 'IMAGE AI',
      stories: imageGen.slice(0, 2),
      links: imageGen.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
    {
      name: '⚙️ Infrastructure / GPU Layer',
      emoji: '⚙️',
      badge: 'INFRA',
      stories: infrastructure.slice(0, 2),
      links: infrastructure.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
    {
      name: '🧬 Open Model Ecosystem',
      emoji: '🧬',
      badge: 'OPEN SOURCE',
      stories: openModels.slice(0, 2),
      links: openModels.slice(2).map(s => ({ title: s.title, source: s.source, url: s.url })),
    },
  ];

  // Top 5 headlines from all categories
  const topHeadlines = [
    ...foundationModels.slice(0, 1),
    ...vibeCoding.slice(0, 1),
    ...aiSearch.slice(0, 1),
    ...genVideo.slice(0, 1),
    ...infrastructure.slice(0, 1),
  ];

  return NextResponse.json({
    categories,
    top_headlines: topHeadlines,
    hn_ai: hnAI.slice(0, 6),
    generated_at: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60' },
  });
}
