// Shared archived resources utility
// Used across: Agent Assist, Skills Inventory, DNA, Activity Dashboard

export interface ArchivedResource {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  plainEnglish: string;
  url: string;
  category: 'api' | 'tool' | 'library' | 'service' | 'dataset' | 'framework' | 'reference' | 'other';
  type: 'open-source' | 'free-tier' | 'documentation' | 'tutorial' | 'reference';
  tags: string[];
  useCase: string;
  rating: number;
  usefulFor: string[];
  githubStars?: number;
  lastUpdated?: string;
  pricing?: string;
  createdAt: string;
  addedBy: string;
  archivedAt?: string;
  skillCategory?: string;
}

export const ARCHIVED_STORAGE_KEY = 'dbtech-assist-archived';

// Default acquired resources - these are tools we actually use
export const DEFAULT_ARCHIVED: ArchivedResource[] = [
  {
    id: 'framer-motion-001',
    agentId: 'paula',
    agentName: 'Paula',
    title: 'Framer Motion',
    description: 'Production-ready motion library for React. Makes creating smooth animations and interactions incredibly simple.',
    plainEnglish: 'Makes buttons slide, pages fade in, and things move smoothly on websites. Without it, everything just pops in like a PowerPoint. With it, the site feels alive.',
    url: 'https://www.framer.com/motion/',
    category: 'library',
    type: 'open-source',
    tags: ['react', 'animation', 'ui', 'motion', 'frontend', 'design'],
    useCase: 'Creating smooth animations and micro-interactions in React components',
    rating: 5,
    usefulFor: ['paula', 'anders', 'milo'],
    githubStars: 24500,
    lastUpdated: '2026-02-14',
    pricing: 'Free',
    createdAt: '2026-02-14T22:40:00Z',
    addedBy: 'paula',
    archivedAt: new Date().toISOString(),
  },
  {
    id: 'yfinance-001',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'yfinance',
    description: 'Download historical & real-time market data from Yahoo Finance. Stocks, options chains, fundamentals, earnings, dividends — all via Python.',
    plainEnglish: 'Pulls stock prices, options chains, company info, and historical data automatically. Free, no API key needed. The backbone of any trading analysis pipeline.',
    url: 'https://github.com/ranaroussi/yfinance',
    category: 'library',
    type: 'open-source',
    tags: ['python', 'finance', 'yahoo', 'market-data', 'stocks', 'options', 'trading'],
    useCase: 'Historical and real-time market data retrieval for trading analysis, backtesting, and options chain scanning',
    rating: 5,
    usefulFor: ['bobby', 'dax', 'milo', 'anders'],
    githubStars: 15200,
    lastUpdated: '2026-02-14',
    pricing: 'Free',
    createdAt: '2026-02-14T22:47:00Z',
    addedBy: 'bobby',
    archivedAt: new Date().toISOString(),
  },
  {
    id: 'massive-options-001',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'Massive Options API',
    description: 'Institutional-grade options market data from all 17 U.S. exchanges. Real-time snapshots, Greeks, open interest, volume, and historical data.',
    plainEnglish: 'The real options data feed. Shows every option contract trading across every exchange with live Greeks, volume, and open interest. What Bloomberg charges $24K/yr for, we get for $29/mo.',
    url: 'https://massive.com/docs/rest/options/overview',
    category: 'api',
    type: 'free-tier',
    tags: ['options', 'greeks', 'market-data', 'real-time', 'trading', 'finance', 'REST'],
    useCase: 'Live options chain data, Greeks, unusual activity detection, 0DTE scanning for AxeCap Terminal',
    rating: 5,
    usefulFor: ['bobby', 'anders', 'dax'],
    pricing: '$29/mo',
    createdAt: '2026-02-14T22:47:00Z',
    addedBy: 'bobby',
    archivedAt: new Date().toISOString(),
  },
  {
    id: 'massive-mcp-001',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'Massive MCP Server',
    description: 'Model Context Protocol server exposing all Massive.com API endpoints as MCP tools for LLM-friendly financial data access.',
    plainEnglish: 'Lets AI agents like me talk directly to the Massive market data API through a standardized protocol. Stock quotes, options data, crypto — all accessible as tool calls.',
    url: 'https://github.com/massive-com/mcp_massive',
    category: 'framework',
    type: 'open-source',
    tags: ['mcp', 'market-data', 'ai', 'llm', 'finance', 'options', 'python'],
    useCase: 'AI agent integration with financial market data via Model Context Protocol',
    rating: 4,
    usefulFor: ['bobby', 'anders', 'milo'],
    githubStars: 850,
    lastUpdated: '2026-02-14',
    pricing: 'Free (requires Massive API key)',
    createdAt: '2026-02-14T22:47:00Z',
    addedBy: 'bobby',
    archivedAt: new Date().toISOString(),
  },
];

export const CATEGORY_ICONS: Record<string, string> = {
  api: '🔌',
  tool: '🔧',
  library: '📚',
  service: '☁️',
  dataset: '📊',
  framework: '🏗️',
  reference: '📖',
  other: '📦',
};

export const TYPE_COLORS: Record<string, string> = {
  'open-source': '#22C55E',
  'free-tier': '#3B82F6',
  'documentation': '#F59E0B',
  'tutorial': '#8B5CF6',
  'reference': '#71717A',
};

export function getArchivedResources(): ArchivedResource[] {
  if (typeof window === 'undefined') return DEFAULT_ARCHIVED;
  try {
    const stored = localStorage.getItem(ARCHIVED_STORAGE_KEY);
    let resources: ArchivedResource[] = [];
    
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) resources = parsed;
    }
    
    // Merge in defaults that aren't already present
    const existingIds = new Set(resources.map(r => r.id));
    const newDefaults = DEFAULT_ARCHIVED.filter(d => !existingIds.has(d.id));
    
    if (newDefaults.length > 0) {
      resources = [...newDefaults, ...resources];
      // Persist the merged list
      try { localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(resources)); } catch {}
    }
    
    return resources;
  } catch (e) {
    console.error('Failed to load archived resources:', e);
  }
  return DEFAULT_ARCHIVED;
}

export function getArchivedByAgent(agentId: string): ArchivedResource[] {
  return getArchivedResources().filter(r => r.agentId === agentId || r.usefulFor?.includes(agentId));
}

export function getArchivedByCategory(category: string): ArchivedResource[] {
  return getArchivedResources().filter(r => r.category === category);
}

export function getRecentlyArchived(limit: number = 10): ArchivedResource[] {
  return getArchivedResources()
    .sort((a, b) => new Date(b.archivedAt || b.createdAt).getTime() - new Date(a.archivedAt || a.createdAt).getTime())
    .slice(0, limit);
}
