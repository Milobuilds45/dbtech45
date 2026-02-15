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
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ARCHIVED_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load archived resources:', e);
  }
  return [];
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
