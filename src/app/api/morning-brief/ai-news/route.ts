import { NextResponse } from 'next/server';

interface AIStory {
  title: string;
  url: string;
  source: string;
  description: string;
  thumbnail: string | null;
  timeAgo: string;
  category: string;
}

// Category keyword mapping for classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Foundation Models': ['gpt', 'claude', 'gemini', 'llama', 'llm', 'language model', 'openai', 'anthropic', 'deepmind', 'foundation model', 'frontier model', 'reasoning', 'benchmark'],
  'Vibe Coding': ['cursor', 'copilot', 'coding assistant', 'code generation', 'ide', 'developer tool', 'windsurf', 'codeium', 'replit', 'codex', 'devin'],
  'AI Search': ['perplexity', 'ai search', 'rag', 'retrieval', 'knowledge engine', 'ai overview', 'search engine'],
  'Generative Video': ['sora', 'video generation', 'runway', 'veo', 'kling', 'seedance', 'text to video', 'ai video'],
  'Image Generation': ['midjourney', 'dall-e', 'stable diffusion', 'flux', 'firefly', 'image generation', 'text to image', 'ai art'],
  'Infrastructure': ['nvidia', 'gpu', 'inference', 'groq', 'chip', 'datacenter', 'compute', 'tpu', 'blackwell', 'h100', 'training cluster'],
  'Open Models': ['open source', 'open-source', 'hugging face', 'open weights', 'fine-tune', 'ollama', 'local model', 'gguf'],
};

function classifyStory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return category;
  }
  return 'General AI';
}

async function fetchBraveAINews(apiKey: string): Promise<AIStory[]> {
  const queries = [
    'artificial intelligence news today',
    'AI models LLM news today',
    'AI coding tools developer news',
    'generative AI video image news',
    'AI infrastructure GPU news',
  ];

  const allStories: AIStory[] = [];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&freshness=pd&text_decorations=false`,
        {
          headers: { 'X-Subscription-Token': apiKey, Accept: 'application/json' },
          next: { revalidate: 1800 }, // 30min
        }
      );
      if (!res.ok) continue;
      const data = await res.json();

      for (const result of data.web?.results || []) {
        let source = 'Web';
        try {
          const u = new URL(result.url);
          source = u.hostname.replace('www.', '');
        } catch { /* ignore */ }

        // Extract thumbnail from Brave's profile or meta images
        const thumbnail = result.thumbnail?.src || result.meta_url?.favicon || null;

        allStories.push({
          title: result.title,
          url: result.url,
          source,
          description: result.description || '',
          thumbnail,
          timeAgo: 'Today',
          category: classifyStory(result.title, result.description || ''),
        });
      }
    } catch (e) {
      console.error(`Brave AI search failed for query "${query}":`, e);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return allStories.filter(s => {
    const key = s.title.toLowerCase().substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchHNAIStories(): Promise<AIStory[]> {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const ids: number[] = await res.json();

    const aiKeywords = ['ai', 'llm', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'model', 'neural', 'machine learning', 'deep learning', 'transformer', 'diffusion', 'inference'];

    const storyPromises = ids.slice(0, 50).map(async (id) => {
      const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 900 },
      });
      if (!r.ok) return null;
      return r.json();
    });

    const rawStories = await Promise.all(storyPromises);
    const stories: AIStory[] = [];

    for (const s of rawStories) {
      if (!s || !s.title || s.type !== 'story') continue;
      const titleLower = s.title.toLowerCase();
      if (!aiKeywords.some(kw => titleLower.includes(kw))) continue;

      let domain = 'news.ycombinator.com';
      if (s.url) {
        try { domain = new URL(s.url).hostname.replace('www.', ''); } catch {}
      }

      const hours = Math.floor((Date.now() / 1000 - s.time) / 3600);
      const timeAgo = hours < 1 ? 'Just now' : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;

      stories.push({
        title: s.title,
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        source: domain,
        description: `${s.score} points \u2022 ${s.descendants || 0} comments`,
        thumbnail: null,
        timeAgo,
        category: classifyStory(s.title, ''),
      });
    }

    return stories;
  } catch {
    return [];
  }
}

export async function GET() {
  const braveKey = process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY;

  let braveStories: AIStory[] = [];
  let hnStories: AIStory[] = [];

  // Fetch both in parallel
  const [braveResult, hnResult] = await Promise.allSettled([
    braveKey ? fetchBraveAINews(braveKey) : Promise.resolve([]),
    fetchHNAIStories(),
  ]);

  if (braveResult.status === 'fulfilled') braveStories = braveResult.value;
  if (hnResult.status === 'fulfilled') hnStories = hnResult.value;

  // Merge: Brave stories first (have thumbnails + descriptions), then HN
  const seen = new Set<string>();
  const merged: AIStory[] = [];

  for (const s of [...braveStories, ...hnStories]) {
    const key = s.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(s);
  }

  // Group by category
  const byCategory: Record<string, AIStory[]> = {};
  for (const s of merged) {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  }

  return NextResponse.json({
    stories: merged.slice(0, 30),
    byCategory,
    topStories: merged.slice(0, 5),
    updatedAt: new Date().toISOString(),
    sources: { brave: braveStories.length, hn: hnStories.length },
  });
}
