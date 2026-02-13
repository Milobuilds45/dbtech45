import { NextResponse } from 'next/server';

// GitHub token from environment or fallback
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_ORG = '7LayerLabs';
const GITHUB_USER = 'Milobuilds45';

// Agent mapping based on committer names/emails
const AGENT_MAP: Record<string, string> = {
  'anders': 'Anders',
  'milo': 'Milo',
  'paula': 'Paula',
  'bobby': 'Bobby',
  'grant': 'Grant',
  'remy': 'Remy',
  'wendy': 'Wendy',
  'dax': 'Dax',
  'tony': 'Tony',
  'dwight': 'Dwight',
  'derek': 'Derek',
  'dbtech45': 'Derek',
  'milobuilds45': 'Milo',
};

function resolveAgent(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, agent] of Object.entries(AGENT_MAP)) {
    if (lower.includes(key)) return agent;
  }
  return name || 'System';
}

// Color map for agents
const AGENT_COLORS: Record<string, string> = {
  'Anders': '#F59E0B',
  'Milo': '#A855F7',
  'Paula': '#EC4899',
  'Bobby': '#EF4444',
  'Grant': '#3B82F6',
  'Remy': '#10B981',
  'Derek': '#F59E0B',
  'System': '#737373',
  'Wendy': '#06B6D4',
  'Dax': '#8B5CF6',
  'Tony': '#F97316',
  'Dwight': '#84CC16',
};

// Type icons
const TYPE_ICONS: Record<string, string> = {
  commit: '◆',
  deploy: '▲',
  session: '✦',
  cron: '⏰',
  system: '⚙',
};

interface ActivityItem {
  time: string;
  timestamp: number;
  type: string;
  agent: string;
  msg: string;
  color: string;
  icon: string;
  repo?: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author?: {
    login: string;
  };
}

interface GitHubRepo {
  name: string;
  full_name: string;
  pushed_at: string;
  private: boolean;
}

interface VercelDeployment {
  uid: string;
  name: string;
  state: string;
  created: number;
  creator?: {
    username: string;
  };
  meta?: {
    githubCommitMessage?: string;
    githubCommitAuthorLogin?: string;
  };
}

// Repos to track
const TRACKED_REPOS = [
  'Milobuilds45/dbtech45',
  '7LayerLabs/clawd-anders',
  '7LayerLabs/clawd-milo',
  '7LayerLabs/clawd-bobby',
  '7LayerLabs/clawd-paula',
  '7LayerLabs/clawd-wendy',
  '7LayerLabs/clawd-dax',
  '7LayerLabs/clawd-tony',
  '7LayerLabs/clawd-dwight',
  '7LayerLabs/clawd-remy',
  '7LayerLabs/milo-hq',
];

async function fetchGitHubCommits(): Promise<ActivityItem[]> {
  const items: ActivityItem[] = [];
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'dbtech45-activity-dashboard',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  for (const repo of TRACKED_REPOS) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/commits?since=${since}&per_page=20`,
        { headers, next: { revalidate: 3600 } }
      );
      
      if (!res.ok) continue;
      
      const commits: GitHubCommit[] = await res.json();
      
      for (const commit of commits) {
        const date = new Date(commit.commit.author.date);
        const agent = resolveAgent(
          commit.author?.login || commit.commit.author.name
        );
        const repoName = repo.split('/')[1];
        
        items.push({
          time: date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/New_York'
          }),
          timestamp: date.getTime(),
          type: 'commit',
          agent,
          msg: `${commit.commit.message.split('\n')[0]} [${repoName}]`,
          color: AGENT_COLORS[agent] || '#F59E0B',
          icon: TYPE_ICONS.commit,
          repo: repoName,
        });
      }
    } catch {
      // Skip failed repos silently
    }
  }
  
  return items;
}

async function fetchVercelDeploys(): Promise<ActivityItem[]> {
  const items: ActivityItem[] = [];
  const vercelToken = process.env.VERCEL_TOKEN;
  
  if (!vercelToken) return items;
  
  try {
    const res = await fetch(
      'https://api.vercel.com/v6/deployments?limit=20&state=READY',
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
        },
        next: { revalidate: 3600 },
      }
    );
    
    if (!res.ok) return items;
    
    const data = await res.json();
    const deployments: VercelDeployment[] = data.deployments || [];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    for (const deploy of deployments) {
      if (deploy.created < sevenDaysAgo) continue;
      
      const date = new Date(deploy.created);
      const agent = resolveAgent(
        deploy.meta?.githubCommitAuthorLogin || 
        deploy.creator?.username || 
        'System'
      );
      
      items.push({
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/New_York',
        }),
        timestamp: deploy.created,
        type: 'deploy',
        agent,
        msg: `${deploy.name} deployed to production${deploy.meta?.githubCommitMessage ? ` — ${deploy.meta.githubCommitMessage.split('\n')[0]}` : ''}`,
        color: '#10B981',
        icon: TYPE_ICONS.deploy,
      });
    }
  } catch {
    // Silent fail
  }
  
  return items;
}

function computeStats(items: ActivityItem[]) {
  const commits = items.filter(i => i.type === 'commit').length;
  const deploys = items.filter(i => i.type === 'deploy').length;
  
  // Count unique agents from activity
  const agents = new Set(items.map(i => i.agent));
  
  // Count unique repos
  const repos = new Set(items.filter(i => i.repo).map(i => i.repo));
  
  return {
    activeAgents: Math.max(agents.size, 6), // minimum 6 since we know we have agents
    projects: Math.max(repos.size, 10), // minimum from known project count
    commits7d: commits,
    deploys7d: deploys,
  };
}

// Simple in-memory cache
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }
  
  try {
    const [commits, deploys] = await Promise.all([
      fetchGitHubCommits(),
      fetchVercelDeploys(),
    ]);
    
    // Combine and sort by timestamp (newest first)
    const allActivity = [...commits, ...deploys]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 30); // Top 30 items
    
    const stats = computeStats(allActivity);
    
    const result = {
      stats: [
        { value: String(stats.activeAgents), label: 'ACTIVE AGENTS', color: '#F59E0B' },
        { value: String(stats.projects), label: 'REPOS ACTIVE', color: '#10B981' },
        { value: String(stats.commits7d), label: 'COMMITS (7D)', color: '#3B82F6' },
        { value: String(stats.deploys7d), label: 'DEPLOYS (7D)', color: '#8B5CF6' },
      ],
      activity: allActivity.map(({ timestamp, repo, ...rest }) => rest),
      lastUpdated: new Date().toISOString(),
    };
    
    // Update cache
    cache = { data: result, timestamp: Date.now() };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Activity API error:', error);
    
    // Return fallback static data on error
    return NextResponse.json({
      stats: [
        { value: '9', label: 'ACTIVE AGENTS', color: '#F59E0B' },
        { value: '28', label: 'PROJECTS', color: '#10B981' },
        { value: '--', label: 'COMMITS (7D)', color: '#3B82F6' },
        { value: '--', label: 'DEPLOYS (7D)', color: '#8B5CF6' },
      ],
      activity: [],
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch live data',
    });
  }
}
