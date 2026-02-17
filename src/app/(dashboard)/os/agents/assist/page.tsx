'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import { Package, ExternalLink, Star, Filter, Search, Plus, Tag, Bookmark, Github, Globe, Database, Terminal, Code, Cpu, Users, User, Lightbulb, Brain, Sparkles, Shield, Zap, Trash2, CheckCircle, X, RotateCcw, Archive, ChevronDown, ChevronRight, Undo2, AlertCircle, Loader2, Check } from 'lucide-react';

interface AgentResource {
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
  skillCategory?: string;
}

const AGENTS = [
  { id: 'milo', name: 'Milo', color: '#A855F7' },
  { id: 'anders', name: 'Anders', color: '#F97316' },
  { id: 'paula', name: 'Paula', color: '#EC4899' },
  { id: 'bobby', name: 'Bobby', color: '#22C55E' },
  { id: 'dwight', name: 'Dwight', color: '#3B82F6' },
  { id: 'dax', name: 'Dax', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#EAB308' },
  { id: 'wendy', name: 'Wendy', color: '#8B5CF6' },
];

const CATEGORY_ICONS = {
  api: <Database size={16} />,
  tool: <Terminal size={16} />,
  library: <Code size={16} />,
  service: <Globe size={16} />,
  dataset: <Package size={16} />,
  framework: <Cpu size={16} />,
  reference: <Bookmark size={16} />,
  other: <Plus size={16} />,
};

const mockResources: AgentResource[] = [
  {
    id: '1',
    agentId: 'bobby',
    agentName: 'Bobby',
    title: 'yfinance - Python Yahoo Finance API',
    description: 'Reliable and efficient way to download historical market data from Yahoo Finance. Perfect for backtesting and analysis.',
    plainEnglish: 'Lets Bobby pull stock prices, charts, and market history automatically instead of looking things up manually. Think of it like giving him a direct line to Yahoo Finance.',
    url: 'https://github.com/ranaroussi/yfinance',
    category: 'library',
    type: 'open-source',
    tags: ['python', 'finance', 'yahoo', 'market-data', 'stocks'],
    useCase: 'Historical market data retrieval for trading analysis and backtesting strategies',
    rating: 5,
    usefulFor: ['bobby', 'dax', 'milo'],
    githubStars: 11200,
    lastUpdated: '2026-02-10',
    pricing: 'Free',
    createdAt: '2026-02-11T10:00:00Z',
    addedBy: 'bobby'
  },
  {
    id: '2',
    agentId: 'paula',
    agentName: 'Paula',
    title: 'Framer Motion',
    description: 'Production-ready motion library for React. Makes creating smooth animations and interactions incredibly simple.',
    plainEnglish: 'Makes buttons slide, pages fade in, and things move smoothly on websites. Without it, everything just pops in like a PowerPoint. With it, the site feels alive.',
    url: 'https://www.framer.com/motion/',
    category: 'library',
    type: 'open-source',
    tags: ['react', 'animation', 'ui', 'motion', 'frontend'],
    useCase: 'Creating smooth animations and micro-interactions in React components',
    rating: 5,
    usefulFor: ['paula', 'anders', 'milo'],
    githubStars: 21800,
    lastUpdated: '2026-02-08',
    pricing: 'Free',
    createdAt: '2026-02-10T14:30:00Z',
    addedBy: 'paula'
  },
  {
    id: '3',
    agentId: 'dwight',
    agentName: 'Dwight',
    title: 'Perplexity AI API',
    description: 'Real-time search and AI-powered research API. Great for getting current information and fact-checking.',
    plainEnglish: 'Like giving Dwight his own Google that also reads and summarizes the results for him. He asks a question, gets an answer with sources — not just a list of links.',
    url: 'https://docs.perplexity.ai/',
    category: 'api',
    type: 'free-tier',
    tags: ['api', 'search', 'ai', 'research', 'real-time'],
    useCase: 'Enhanced research capabilities and real-time information gathering',
    rating: 4,
    usefulFor: ['dwight', 'dax', 'milo', 'bobby'],
    pricing: 'Free tier: 5 requests/day, Pro: $20/month',
    createdAt: '2026-02-09T16:45:00Z',
    addedBy: 'dwight'
  },
  {
    id: '4',
    agentId: 'anders',
    agentName: 'Anders',
    title: 'Supabase',
    description: 'Open source Firebase alternative. Real-time database, authentication, and storage with a great developer experience.',
    plainEnglish: 'The place where all our app data lives — user accounts, saved info, everything. It is like a spreadsheet on steroids that apps can read and write to instantly.',
    url: 'https://supabase.com/',
    category: 'service',
    type: 'free-tier',
    tags: ['database', 'backend', 'realtime', 'auth', 'storage'],
    useCase: 'Backend-as-a-service for rapid application development',
    rating: 5,
    usefulFor: ['anders', 'milo', 'paula'],
    pricing: 'Free tier: 500MB DB, 1GB bandwidth, Pro: $25/month',
    createdAt: '2026-02-08T11:20:00Z',
    addedBy: 'anders'
  },
  {
    id: '5',
    agentId: 'dax',
    agentName: 'Dax',
    title: 'Pandas Profiling',
    description: 'Generates profile reports from pandas DataFrames. Essential for data exploration and quality assessment.',
    plainEnglish: 'Takes a big pile of data and instantly tells you what is in it — what is missing, what looks weird, what the averages are. Like a health check-up but for data instead of people.',
    url: 'https://github.com/ydataai/ydata-profiling',
    category: 'tool',
    type: 'open-source',
    tags: ['python', 'pandas', 'data', 'analysis', 'profiling'],
    useCase: 'Automated exploratory data analysis and data quality reports',
    rating: 4,
    usefulFor: ['dax', 'bobby', 'dwight'],
    githubStars: 11500,
    lastUpdated: '2026-02-05',
    pricing: 'Free',
    createdAt: '2026-02-07T09:15:00Z',
    addedBy: 'dax'
  },
  {
    id: '6',
    agentId: 'milo',
    agentName: 'Milo',
    title: 'LangChain',
    description: 'Framework for developing applications with language models. Perfect for building AI agent workflows.',
    plainEnglish: 'The toolkit for building AI agents that can do multi-step tasks. Instead of just answering questions, agents built with this can search, think, and take actions on their own.',
    url: 'https://python.langchain.com/',
    category: 'framework',
    type: 'open-source',
    tags: ['python', 'ai', 'llm', 'agents', 'workflow'],
    useCase: 'Building complex AI agent workflows and LLM applications',
    rating: 5,
    usefulFor: ['milo', 'anders', 'dwight', 'dax'],
    githubStars: 78200,
    lastUpdated: '2026-02-12',
    pricing: 'Free',
    createdAt: '2026-02-06T13:45:00Z',
    addedBy: 'milo'
  },
];

type GenerationMode = 'individual' | 'collaborative';
type CreativityLevel = 'safe' | 'creative' | 'experimental' | 'simple';
type BudgetTier = 'open-source' | 'free-tier' | 'budget-30' | 'budget-50' | 'budget-100' | 'any';
type SkillCategory = 'technical' | 'business' | 'core' | 'autonomy' | 'awareness';

const SKILL_CATEGORIES: { value: SkillCategory; label: string; color: string; description: string }[] = [
  { value: 'technical', label: 'Technical', color: '#3B82F6', description: 'Tools, code, APIs, implementation' },
  { value: 'business', label: 'Business', color: '#EF4444', description: 'ROI, strategy, P&L, stakeholders' },
  { value: 'core', label: 'Core', color: '#F59E0B', description: 'Primary job function mastery' },
  { value: 'autonomy', label: 'Autonomy', color: '#8B5CF6', description: 'Self-direction, problem-solving' },
  { value: 'awareness', label: 'Awareness', color: '#06B6D4', description: 'Trends, research, staying informed' },
];

interface AgentSkillData {
  name: string;
  ratings: {
    technical: number;
    business: number;
    core: number;
    autonomy: number;
    awareness: number;
  };
}

const BUDGET_OPTIONS: { value: BudgetTier; label: string; description: string }[] = [
  { value: 'open-source', label: 'Open Source Only', description: 'Free forever, no strings' },
  { value: 'free-tier', label: 'Free Tier / Trial', description: 'Free to start, may have limits' },
  { value: 'budget-30', label: 'Up to $30/mo', description: 'Light subscription budget' },
  { value: 'budget-50', label: 'Up to $50/mo', description: 'Medium subscription budget' },
  { value: 'budget-100', label: 'Up to $100/mo', description: 'Premium tools budget' },
  { value: 'any', label: 'Any Price', description: 'Show me the best, price no object' },
];

// ──────────────────────────────────────────
// Toast notification component
// ──────────────────────────────────────────
interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

function Toast({ message, onDismiss }: { message: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = message.type === 'success' ? '#22C55E' : message.type === 'error' ? '#EF4444' : '#3B82F6';
  const Icon = message.type === 'success' ? Check : message.type === 'error' ? AlertCircle : CheckCircle;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#1A1A1A',
        border: `1px solid ${bgColor}50`,
        borderLeft: `3px solid ${bgColor}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#E5E5E5',
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 15px ${bgColor}15`,
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '380px',
      }}
    >
      <Icon size={16} style={{ color: bgColor, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message.text}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ToastContainer({ messages, onDismiss }: { messages: ToastMessage[]; onDismiss: (id: number) => void }) {
  if (messages.length === 0) return null;
  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => (
          <Toast key={msg.id} message={msg} onDismiss={() => onDismiss(msg.id)} />
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────
// Main component
// ──────────────────────────────────────────
export default function AgentAssist() {
  const [resources, setResources] = useState<AgentResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('individual');
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('creative');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('any');
  
  // Skill Development state
  const [skillDevCategory, setSkillDevCategory] = useState<SkillCategory | null>(null);
  const [agentSkillsData, setAgentSkillsData] = useState<Record<string, AgentSkillData>>({});
  const [isSkillLoading, setIsSkillLoading] = useState(false);

  // Archive state
  const [archivedResources, setArchivedResources] = useState<AgentResource[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = { current: 0 };

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-4), { id, text, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load agent skills data
  useEffect(() => {
    const loadSkillsData = async () => {
      try {
        const res = await fetch('/data/agent-skills.json');
        if (res.ok) {
          const data = await res.json();
          const skillsMap: Record<string, AgentSkillData> = {};
          Object.entries(data.agents).forEach(([id, agent]: [string, any]) => {
            skillsMap[id] = {
              name: agent.name,
              ratings: agent.ratings,
            };
          });
          setAgentSkillsData(skillsMap);
        }
      } catch (error) {
        console.error('Failed to load skills data:', error);
      }
    };
    loadSkillsData();
  }, []);

  // Helper: map DB row to AgentResource
  const dbToResource = (row: Record<string, unknown>): AgentResource => ({
    id: row.id as string,
    agentId: row.agent_id as string,
    agentName: row.agent_name as string,
    title: row.title as string,
    description: (row.description as string) || '',
    plainEnglish: (row.plain_english as string) || '',
    url: (row.url as string) || '',
    category: (row.category as AgentResource['category']) || 'other',
    type: (row.type as AgentResource['type']) || 'open-source',
    tags: (row.tags as string[]) || [],
    useCase: (row.use_case as string) || '',
    rating: (row.rating as number) || 3,
    usefulFor: (row.useful_for as string[]) || [],
    githubStars: row.github_stars as number | undefined,
    lastUpdated: row.last_updated as string | undefined,
    pricing: row.pricing as string | undefined,
    createdAt: row.created_at as string,
    addedBy: (row.added_by as string) || '',
    skillCategory: row.skill_category as string | undefined,
  });

  // Helper: map AgentResource to DB row
  const resourceToDb = (r: AgentResource, status: string = 'active') => ({
    id: r.id,
    agent_id: r.agentId,
    agent_name: r.agentName,
    title: r.title,
    description: r.description,
    plain_english: r.plainEnglish,
    url: r.url,
    category: r.category,
    type: r.type,
    tags: r.tags,
    use_case: r.useCase,
    rating: r.rating,
    useful_for: r.usefulFor,
    github_stars: r.githubStars || null,
    last_updated: r.lastUpdated || null,
    pricing: r.pricing || null,
    added_by: r.addedBy,
    skill_category: r.skillCategory || null,
    status,
  });

  // Load from Supabase, seed mock data only if table is truly empty
  useEffect(() => {
    const loadFromDb = async () => {
      setIsInitialLoad(true);
      setDbError(null);

      try {
        // First, check if Supabase is actually reachable by doing a count query
        const { count, error: countError } = await supabase
          .from('agent_resources')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('[AgentAssist] Supabase connection error:', countError.message, countError.details);
          setDbError(`Database connection failed: ${countError.message}`);
          setResources(mockResources);
          setDbReady(true);
          setIsInitialLoad(false);
          return;
        }

        // If the table is truly empty (count === 0), seed once
        if (count === 0) {
          console.log('[AgentAssist] Empty table — seeding mock data');
          const rows = mockResources.map(r => resourceToDb(r, 'active'));
          const { error: seedError } = await supabase.from('agent_resources').upsert(rows);
          if (seedError) {
            console.error('[AgentAssist] Seed failed:', seedError.message);
            setDbError(`Failed to seed initial data: ${seedError.message}`);
          }
          setResources(mockResources);
          setArchivedResources([]);
        } else {
          // Load all rows
          const { data, error: loadError } = await supabase
            .from('agent_resources')
            .select('*')
            .order('created_at', { ascending: false });

          if (loadError) {
            console.error('[AgentAssist] Load error:', loadError.message);
            setDbError(`Failed to load resources: ${loadError.message}`);
            setResources(mockResources);
            setDbReady(true);
            setIsInitialLoad(false);
            return;
          }

          const rows = data || [];
          const active = rows.filter((r: Record<string, unknown>) => r.status === 'active').map(dbToResource);
          const archived = rows.filter((r: Record<string, unknown>) => r.status === 'archived').map(dbToResource);
          setResources(active);
          setArchivedResources(archived);
          console.log(`[AgentAssist] Loaded ${active.length} active, ${archived.length} archived from Supabase`);
        }
      } catch (err: any) {
        console.error('[AgentAssist] Unexpected error during load:', err);
        setDbError(`Unexpected error: ${err?.message || 'Unknown'}`);
        setResources(mockResources);
      }

      setDbReady(true);
      setIsInitialLoad(false);
    };
    loadFromDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    } else {
      console.log('🔧 New resource:', message);
    }
  };

  const generateResource = async (agentIds: string[] = []) => {
    setIsLoading(true);
    try {
      const agentsToUse = agentIds.length > 0 ? agentIds : AGENTS.map(a => a.id);
      const existingTitles = resources.map(r => r.title);
      
      const res = await fetch('/api/agent-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: agentsToUse,
          existingTitles,
          creativity: creativityLevel,
          budget: budgetTier,
        }),
      });
      
      if (!res.ok) throw new Error('API failed');
      
      const data = await res.json();
      const newResources: AgentResource[] = data.resources || [];
      
      setResources(prev => [...newResources, ...prev]);
      setIsLoading(false);
      
      // Persist to Supabase with error handling
      if (newResources.length > 0) {
        const rows = newResources.map(r => resourceToDb(r, 'active'));
        const { error } = await supabase.from('agent_resources').upsert(rows);
        if (error) {
          console.error('[AgentAssist] Failed to persist generated resources:', error.message);
          addToast('Generated resources but failed to save to database — they may not persist', 'error');
        } else {
          addToast(`Generated ${newResources.length} new resource${newResources.length > 1 ? 's' : ''}`, 'success');
        }
      }
      
      if (newResources.length === 1) {
        showNotification(`New resource from ${newResources[0].agentName}: ${newResources[0].title}`);
      } else if (newResources.length > 1) {
        showNotification(`Generated ${newResources.length} new resource recommendations!`);
      }
    } catch (error: any) {
      console.error('Failed to generate resource:', error);
      addToast('Failed to generate resources — try again', 'error');
      setIsLoading(false);
    }
  };

  const generateSkillResource = async () => {
    if (selectedAgents.length !== 1 || !skillDevCategory) return;
    
    const agentId = selectedAgents[0];
    setIsSkillLoading(true);
    try {
      const agentData = agentSkillsData[agentId];
      const currentRating = agentData?.ratings[skillDevCategory] || 5;
      const existingTitles = resources.map(r => r.title);
      
      const res = await fetch('/api/agent-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: [agentId],
          existingTitles,
          creativity: 'creative',
          budget: budgetTier,
          skillFocus: {
            category: skillDevCategory,
            currentRating,
            targetRating: Math.min(currentRating + 1, 10),
          },
        }),
      });
      
      if (!res.ok) throw new Error('API failed');
      
      const data = await res.json();
      const newResources: AgentResource[] = data.resources || [];
      
      setResources(prev => [...newResources, ...prev]);
      setIsSkillLoading(false);
      
      // Persist to Supabase with error handling
      if (newResources.length > 0) {
        const rows = newResources.map(r => resourceToDb(r, 'active'));
        const { error } = await supabase.from('agent_resources').upsert(rows);
        if (error) {
          console.error('[AgentAssist] Failed to persist skill resources:', error.message);
          addToast('Generated but failed to save — may not persist across devices', 'error');
        } else {
          addToast(`Generated ${newResources.length} ${skillDevCategory} improvement${newResources.length > 1 ? 's' : ''}`, 'success');
        }
      }
      
      if (newResources.length > 0) {
        showNotification(`Generated ${newResources.length} ${skillDevCategory} improvement suggestions for ${agentSkillsData[agentId]?.name}`);
      }
    } catch (error: any) {
      console.error('Failed to generate skill resource:', error);
      addToast('Failed to generate skill resources — try again', 'error');
      setIsSkillLoading(false);
    }
  };

  const deleteResource = async (id: string) => {
    // Save previous state for rollback
    const prevResources = resources;
    setResources(prev => prev.filter(r => r.id !== id));

    const { error } = await supabase.from('agent_resources').update({ status: 'deleted' }).eq('id', id);
    if (error) {
      console.error('[AgentAssist] Delete failed:', error.message);
      setResources(prevResources); // rollback
      addToast('Failed to delete — try again', 'error');
    }
  };

  const unarchiveResource = async (id: string) => {
    const resource = archivedResources.find(r => r.id === id);
    if (!resource) return;
    
    // Save previous state for rollback
    const prevArchived = archivedResources;
    const prevResources = resources;

    setArchivedResources(prev => prev.filter(r => r.id !== id));
    setResources(prev => [resource, ...prev]);
    
    const { error } = await supabase.from('agent_resources').update({ status: 'active' }).eq('id', id);
    if (error) {
      console.error('[AgentAssist] Unarchive failed:', error.message);
      setArchivedResources(prevArchived); // rollback
      setResources(prevResources);
      addToast('Failed to restore — try again', 'error');
    } else {
      addToast('Restored to suggestions', 'info');
    }
  };

  const deleteArchivedResource = async (id: string) => {
    const prevArchived = archivedResources;
    setArchivedResources(prev => prev.filter(r => r.id !== id));

    const { error } = await supabase.from('agent_resources').update({ status: 'deleted' }).eq('id', id);
    if (error) {
      console.error('[AgentAssist] Delete archived failed:', error.message);
      setArchivedResources(prevArchived); // rollback
      addToast('Failed to delete — try again', 'error');
    }
  };

  const verifyResource = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;
    
    // Save previous state for rollback
    const prevResources = resources;
    const prevArchived = archivedResources;

    // Optimistic update
    setResources(prev => prev.filter(r => r.id !== id));
    setArchivedResources(prev => [resource, ...prev]);
    
    // Persist to Supabase
    const { error } = await supabase.from('agent_resources').update({ status: 'archived' }).eq('id', id);
    if (error) {
      console.error('[AgentAssist] Archive failed:', error.message);
      // Rollback
      setResources(prevResources);
      setArchivedResources(prevArchived);
      addToast('Failed to save to stack — try again', 'error');
      return; // Don't proceed with skill update if archive failed
    }

    addToast(`"${resource.title}" saved to your stack`, 'success');

    // If this resource was generated for a specific skill, bump the skill rating
    if (resource?.skillCategory && resource?.agentId) {
      try {
        const res = await fetch('/api/agent-skills', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: resource.agentId,
            category: resource.skillCategory,
            delta: 0.5,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.previousRating !== result.newRating) {
            console.log(`Skill updated: ${resource.agentName} ${resource.skillCategory} ${result.previousRating} → ${result.newRating}`);
          }
        }
      } catch (e) {
        console.error('Failed to update skill rating:', e);
      }
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'stars'>('newest');

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  const filteredResources = resources.filter(resource => {
    if (selectedCategory && resource.category !== selectedCategory) return false;
    if (selectedType && resource.type !== selectedType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        resource.title.toLowerCase().includes(search) ||
        resource.description.toLowerCase().includes(search) ||
        resource.tags.some(tag => tag.toLowerCase().includes(search)) ||
        resource.useCase.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'stars':
        return (b.githubStars || 0) - (a.githubStars || 0);
      default:
        return 0;
    }
  });

  const rateResource = async (id: string, rating: number) => {
    const prevResources = resources;
    setResources(prev => prev.map(resource => 
      resource.id === id ? { ...resource, rating } : resource
    ));
    // Persist to Supabase with error handling
    const { error } = await supabase.from('agent_resources').update({ rating }).eq('id', id);
    if (error) {
      console.error('[AgentAssist] Rating update failed:', error.message);
      setResources(prevResources);
      addToast('Failed to update rating', 'error');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number, resourceId: string) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => rateResource(resourceId, star)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: star <= rating ? brand.amber : brand.smoke,
            }}
          >
            <Star size={14} style={{ 
              fill: star <= rating ? brand.amber : 'transparent' 
            }} />
          </button>
        ))}
      </div>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'open-source': return brand.success;
      case 'free-tier': return brand.info;
      case 'documentation': return brand.amber;
      case 'tutorial': return brand.info;
      case 'reference': return brand.smoke;
      default: return brand.smoke;
    }
  };

  // ──────────────────────────────────────────
  // Loading state
  // ──────────────────────────────────────────
  if (isInitialLoad) {
    return (
      <div style={styles.page}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={styles.h1}>Agent Assist</h1>
            <p style={styles.subtitle}>Open-source tools, APIs, and resources to enhance agent capabilities</p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 40px',
            gap: '16px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${brand.border}`,
              borderTopColor: brand.amber,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>Loading your stack from the cloud...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <ToastContainer messages={toasts} onDismiss={dismissToast} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={styles.h1}>Agent Assist</h1>
          <p style={styles.subtitle}>Open-source tools, APIs, and resources to enhance agent capabilities</p>
        </div>

        {/* Database error banner */}
        {dbError && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
                Sync Issue
              </div>
              <div style={{ color: '#F87171', fontSize: '12px' }}>
                {dbError}. Showing local data — changes may not persist across devices.
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#F87171',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Generate Resources */}
        <div style={{
          background: '#0A0A0A',
          border: `1px solid ${brand.border}`,
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '20px',
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} style={{ color: brand.amber }} />
              <span style={{ color: brand.white, fontSize: '16px', fontWeight: 700 }}>Generate Resources</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => { setSelectedAgents([]); setBudgetTier('any'); setSkillDevCategory(null); }}
                style={{
                  background: 'transparent',
                  color: brand.smoke,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                <RotateCcw size={13} />
                Clear
              </button>
              <button
                onClick={() => setSelectedAgents(AGENTS.map(a => a.id))}
                style={{
                  background: selectedAgents.length === AGENTS.length ? `${brand.amber}15` : 'transparent',
                  color: selectedAgents.length === AGENTS.length ? brand.amber : brand.smoke,
                  border: `1px solid ${selectedAgents.length === AGENTS.length ? brand.amber : brand.border}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Select All
              </button>
            </div>
          </div>

          {/* Agent Selection */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {AGENTS.map(agent => {
              const isOn = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent.id)}
                  style={{
                    background: isOn ? `${agent.color}15` : '#111',
                    color: isOn ? brand.white : brand.smoke,
                    border: isOn ? `2px solid ${agent.color}` : `1px solid ${brand.border}`,
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isOn ? 1 : 0.5,
                    boxShadow: isOn ? `0 0 12px ${agent.color}20` : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isOn ? agent.color : brand.smoke,
                    transition: 'all 0.2s',
                  }} />
                  {agent.name}
                </button>
              );
            })}
          </div>

          {/* Skill + Budget + Current Rating Row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {/* Skill to Improve Dropdown */}
            <div style={{ minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Brain size={14} style={{ color: '#8B5CF6' }} />
                <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Skill to Improve</span>
              </div>
              <select
                value={skillDevCategory || ''}
                onChange={(e) => setSkillDevCategory(e.target.value as SkillCategory || null)}
                style={{
                  width: '100%',
                  background: skillDevCategory ? `${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color}15` : '#111',
                  border: skillDevCategory ? `2px solid ${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color}` : `1px solid ${brand.border}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: skillDevCategory ? brand.white : brand.smoke,
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <option value="">Any / General</option>
                {SKILL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
                <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Budget</span>
                <div style={{ flex: 1, height: '1px', background: brand.border }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBudgetTier(opt.value)}
                    title={opt.description}
                    style={{
                      background: budgetTier === opt.value ? `${brand.amber}15` : '#111',
                      color: budgetTier === opt.value ? brand.amber : brand.smoke,
                      border: budgetTier === opt.value ? `2px solid ${brand.amber}` : `1px solid ${brand.border}`,
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: budgetTier === opt.value ? 1 : 0.6,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Rating Display */}
            {selectedAgents.length === 1 && skillDevCategory && agentSkillsData[selectedAgents[0]] && (
              <div style={{
                background: brand.graphite,
                borderRadius: '10px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: `1px solid ${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color}40`,
                flexShrink: 0,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: brand.smoke, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                    Current
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: agentSkillsData[selectedAgents[0]].ratings[skillDevCategory] <= 3 ? '#EF4444' :
                             agentSkillsData[selectedAgents[0]].ratings[skillDevCategory] <= 6 ? brand.amber : '#22C55E',
                    }}>
                      {agentSkillsData[selectedAgents[0]].ratings[skillDevCategory]}
                    </span>
                    <span style={{ color: brand.smoke, fontSize: '12px' }}>/10</span>
                  </div>
                </div>
                <div style={{ 
                  color: SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color, 
                  fontSize: '11px', 
                  fontWeight: 600,
                  padding: '4px 8px',
                  background: `${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color}15`,
                  borderRadius: '6px',
                }}>
                  {agentSkillsData[selectedAgents[0]].name}&apos;s {SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.label}
                </div>
              </div>
            )}
          </div>

          {/* Skill Category Info Banner */}
          {skillDevCategory && (
            <div style={{
              marginBottom: '20px',
              padding: '10px 14px',
              background: `${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color}08`,
              border: `1px solid ${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color}25`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Lightbulb size={14} style={{ color: SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color, flexShrink: 0 }} />
              <span style={{ color: SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.color, fontWeight: 600, fontSize: '13px' }}>
                {SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.label}:
              </span>
              <span style={{ color: brand.silver, fontSize: '13px' }}>
                {SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.description}
              </span>
            </div>
          )}

          {/* Generate Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                if (skillDevCategory && selectedAgents.length === 1) {
                  generateSkillResource();
                } else {
                  generateResource(selectedAgents);
                }
              }}
              disabled={(isLoading || isSkillLoading) || selectedAgents.length === 0}
              style={{
                background: (isLoading || isSkillLoading) || selectedAgents.length === 0 ? brand.smoke : 
                           (skillDevCategory && selectedAgents.length === 1) ? '#8B5CF6' : brand.amber,
                color: (skillDevCategory && selectedAgents.length === 1) ? brand.white : brand.void,
                border: 'none',
                borderRadius: '10px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: (isLoading || isSkillLoading) || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: (isLoading || isSkillLoading) || selectedAgents.length === 0 ? 0.5 : 1,
                boxShadow: (isLoading || isSkillLoading) || selectedAgents.length === 0 ? 'none' : 
                          (skillDevCategory && selectedAgents.length === 1) ? '0 0 20px rgba(139,92,246,0.4)' : `0 0 20px ${brand.amber}40`,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {(skillDevCategory && selectedAgents.length === 1) ? <Lightbulb size={16} /> : <Zap size={16} />}
              {(isLoading || isSkillLoading) ? 'Generating...' : 
               (skillDevCategory && selectedAgents.length === 1) ? `Improve ${SKILL_CATEGORIES.find(c => c.value === skillDevCategory)?.label}` :
               `Generate (${selectedAgents.length})`}
            </button>
          </div>
        </div>

        {/* In Your Stack (Archive) */}
        {archivedResources.length > 0 && (
          <div style={{
            background: '#0A0A0A',
            border: `1px solid ${brand.border}`,
            borderRadius: '16px',
            marginBottom: '20px',
            overflow: 'hidden',
          }}>
            {/* Header - Clickable to expand/collapse */}
            <button
              onClick={() => setShowArchive(!showArchive)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {showArchive ? <ChevronDown size={18} style={{ color: brand.success }} /> : <ChevronRight size={18} style={{ color: brand.success }} />}
              <Archive size={18} style={{ color: brand.success }} />
              <span style={{ color: brand.white, fontSize: '15px', fontWeight: 700 }}>In Your Stack</span>
              <span style={{
                background: `${brand.success}20`,
                color: brand.success,
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {archivedResources.length}
              </span>
              <span style={{ color: brand.smoke, fontSize: '13px', marginLeft: 'auto' }}>
                {showArchive ? 'Click to collapse' : 'Click to expand'}
              </span>
            </button>

            {/* Archived Resources List */}
            {showArchive && (
              <div style={{ padding: '0 24px 24px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {archivedResources.map(resource => {
                    const agent = AGENTS.find(a => a.id === resource.agentId);
                    return (
                      <div
                        key={resource.id}
                        style={{
                          background: brand.graphite,
                          border: `1px solid ${brand.border}`,
                          borderRadius: '12px',
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                        }}
                      >
                        {/* Category Icon */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: `${agent?.color || brand.smoke}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: agent?.color || brand.smoke,
                          flexShrink: 0,
                        }}>
                          {CATEGORY_ICONS[resource.category]}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ color: brand.white, fontSize: '14px', fontWeight: 600 }}>{resource.title}</span>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: brand.amber, display: 'flex' }}
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: agent?.color || brand.smoke, fontSize: '12px', fontWeight: 600 }}>
                              {resource.agentName}
                            </span>
                            <span style={{ color: brand.smoke, fontSize: '11px' }}>•</span>
                            <span style={{
                              color: getTypeColor(resource.type),
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}>
                              {resource.type.replace('-', ' ')}
                            </span>
                            {resource.pricing && (
                              <>
                                <span style={{ color: brand.smoke, fontSize: '11px' }}>•</span>
                                <span style={{ color: brand.smoke, fontSize: '11px' }}>{resource.pricing}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => unarchiveResource(resource.id)}
                            title="Move back to suggestions"
                            style={{
                              background: 'transparent',
                              border: `1px solid ${brand.border}`,
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              color: brand.smoke,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = brand.amber; e.currentTarget.style.borderColor = brand.amber; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = brand.smoke; e.currentTarget.style.borderColor = brand.border; }}
                          >
                            <Undo2 size={12} /> Restore
                          </button>
                          <button
                            onClick={() => deleteArchivedResource(resource.id)}
                            title="Remove from archive"
                            style={{
                              background: 'transparent',
                              border: `1px solid ${brand.border}`,
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: brand.smoke,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = brand.error; e.currentTarget.style.borderColor = brand.error; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = brand.smoke; e.currentTarget.style.borderColor = brand.border; }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search & Filters */}
        <div style={{
          ...styles.card,
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: brand.smoke,
            }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools, APIs, libraries..."
              style={{
                width: '100%',
                background: brand.graphite,
                border: `1px solid ${brand.border}`,
                borderRadius: '8px',
                padding: '9px 12px 9px 36px',
                color: brand.white,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            style={{
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '9px 12px',
              color: brand.white,
              fontSize: '13px',
              outline: 'none',
              minWidth: '140px',
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value || null)}
            style={{
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '9px 12px',
              color: brand.white,
              fontSize: '13px',
              outline: 'none',
              minWidth: '130px',
            }}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '9px 12px',
              color: brand.white,
              fontSize: '13px',
              outline: 'none',
              minWidth: '140px',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="stars">Most GitHub Stars</option>
          </select>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', color: brand.smoke, fontSize: '12px', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            <span>{filteredResources.length} resources</span>
            <span style={{ color: brand.border }}>|</span>
            <span>{resources.filter(r => r.type === 'open-source').length} open source</span>
            <span style={{ color: brand.border }}>|</span>
            <span>{resources.filter(r => r.rating >= 4).length} highly rated</span>
          </div>
        </div>

        {/* Resources List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedResources.map(resource => {
            const agent = AGENTS.find(a => a.id === resource.agentId);
            const categoryIcon = CATEGORY_ICONS[resource.category];

            return (
              <div
                key={resource.id}
                style={{
                  ...styles.card,
                  padding: '24px',
                  border: resource.rating >= 4 ? 
                    `1px solid ${brand.amber}` : 
                    `1px solid ${brand.border}`,
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ 
                        color: brand.white, 
                        fontSize: '20px', 
                        fontWeight: 600, 
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {categoryIcon}
                        {resource.title}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: brand.amber,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ExternalLink size={16} />
                        </a>
                      </h3>
                    </div>

                    {/* Clickable URL */}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: brand.amber,
                          fontSize: '13px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '10px',
                          padding: '4px 10px',
                          background: `${brand.amber}08`,
                          border: `1px solid ${brand.amber}20`,
                          borderRadius: '6px',
                          transition: 'all 0.15s',
                          maxWidth: '100%',
                          overflow: 'hidden',
                        }}
                      >
                        <ExternalLink size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resource.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: '#000000',
                        border: `2px solid ${agent?.color || brand.smoke}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: agent?.color || brand.smoke,
                        fontWeight: 700,
                        fontSize: '10px',
                      }}>
                        {resource.agentName.substring(0, 2)}
                      </div>
                      <span style={{ color: brand.smoke, fontSize: '14px' }}>
                        Added by {resource.agentName}
                      </span>
                      <span style={{ color: brand.smoke }}>•</span>
                      <span style={{ color: brand.smoke, fontSize: '12px' }}>
                        {formatDate(resource.createdAt)}
                      </span>
                    </div>

                    <p style={{
                      color: brand.silver,
                      fontSize: '15px',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                    }}>
                      {resource.description}
                    </p>

                    {resource.plainEnglish && (
                      <div style={{
                        background: 'rgba(245,158,11,0.06)',
                        border: `1px solid rgba(245,158,11,0.15)`,
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginBottom: '12px',
                      }}>
                        <div style={{ color: brand.amber, fontSize: '11px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          In Plain English
                        </div>
                        <div style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.6' }}>
                          {resource.plainEnglish}
                        </div>
                      </div>
                    )}

                    <div style={{
                      background: brand.graphite,
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ color: brand.smoke, fontSize: '12px', marginBottom: '4px' }}>
                        Use Case:
                      </div>
                      <div style={{ color: brand.silver, fontSize: '14px' }}>
                        {resource.useCase}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${getTypeColor(resource.type)}20`,
                        color: getTypeColor(resource.type),
                        textTransform: 'uppercase',
                      }}>
                        {resource.type.replace('-', ' ')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); verifyResource(resource.id); }}
                        title="We have this — remove"
                        style={{
                          background: 'transparent',
                          border: `1px solid ${brand.border}`,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: brand.smoke,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = brand.success; e.currentTarget.style.borderColor = brand.success; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = brand.smoke; e.currentTarget.style.borderColor = brand.border; }}
                      >
                        <CheckCircle size={13} /> Have it
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResource(resource.id); }}
                        title="Delete resource"
                        style={{
                          background: 'transparent',
                          border: `1px solid ${brand.border}`,
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: brand.smoke,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = brand.error; e.currentTarget.style.borderColor = brand.error; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = brand.smoke; e.currentTarget.style.borderColor = brand.border; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {resource.githubStars && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: brand.smoke,
                        fontSize: '12px',
                      }}>
                        <Github size={12} />
                        {formatNumber(resource.githubStars)} stars
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(resource.rating, resource.id)}
                      <span style={{ color: brand.smoke, fontSize: '12px' }}>
                        ({resource.rating}/5)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {resource.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        background: brand.graphite,
                        color: brand.smoke,
                        border: `1px solid ${brand.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Useful For & Pricing */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}>
                  <div>
                    <div style={{ color: brand.smoke, fontSize: '12px', marginBottom: '6px' }}>
                      Useful for:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {resource.usefulFor.map(agentId => {
                        const usefulAgent = AGENTS.find(a => a.id === agentId);
                        return (
                          <span
                            key={agentId}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              background: `${usefulAgent?.color || brand.smoke}20`,
                              color: usefulAgent?.color || brand.smoke,
                              fontWeight: 600,
                            }}
                          >
                            {usefulAgent?.name || agentId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {resource.pricing && (
                    <div style={{
                      padding: '8px 12px',
                      background: brand.graphite,
                      borderRadius: '6px',
                      border: `1px solid ${brand.border}`,
                    }}>
                      <div style={{ color: brand.smoke, fontSize: '11px' }}>Pricing:</div>
                      <div style={{ color: brand.white, fontSize: '13px', fontWeight: 600 }}>
                        {resource.pricing}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sortedResources.length === 0 && (
          <div style={{
            ...styles.card,
            textAlign: 'center',
            padding: '60px 40px',
          }}>
            <Package size={48} style={{ color: brand.smoke, opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No resources found</h3>
            <p style={{ color: brand.smoke, fontSize: '14px' }}>
              {searchTerm || selectedCategory || selectedType ? 
                'Try adjusting your filters to see more resources.' :
                'Your agents haven\'t added any resources yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}