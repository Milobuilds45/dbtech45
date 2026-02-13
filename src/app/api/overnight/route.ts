import { NextResponse } from 'next/server';

// GitHub token for commit data
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Known overnight cron agents and their configs
const OVERNIGHT_AGENTS: Record<string, { color: string; type: string; icon: string }> = {
  'Dwight': { color: '#3B82F6', type: 'research', icon: '⌕' },
  'Paula':  { color: '#EC4899', type: 'build', icon: '▲' },
  'Dax':    { color: '#06B6D4', type: 'analysis', icon: '◈' },
  'Tony':   { color: '#EAB308', type: 'analysis', icon: '◈' },
  'Bobby':  { color: '#EF4444', type: 'analysis', icon: '◈' },
  'Milo':   { color: '#A855F7', type: 'analysis', icon: '⚡' },
  'Anders': { color: '#F97316', type: 'build', icon: '▲' },
};

const AGENT_ID_MAP: Record<string, string> = {
  'dwight': 'Dwight',
  'paula': 'Paula',
  'dax': 'Dax',
  'tony': 'Tony',
  'bobby': 'Bobby',
  'milo': 'Milo',
  'anders': 'Anders',
  'remy': 'Remy',
  'wendy': 'Wendy',
};

interface CronJob {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr: string; tz?: string };
  payload: {
    kind: string;
    message: string;
    deliver?: boolean;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
    lastError?: string;
  };
}

interface OvernightItem {
  agent: string;
  agentColor: string;
  type: string;
  title: string;
  summary: string;
  details: string[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  icon: string;
  status: 'success' | 'error' | 'pending';
  durationMs?: number;
  errorMessage?: string;
}

interface OvernightBrief {
  date: string;
  label: string;
  headline: string;
  items: OvernightItem[];
}

function extractMissionTitle(message: string): string {
  // Try to extract a meaningful title from the cron message
  const lines = message.split('\n').filter(l => l.trim());
  
  // Look for numbered items that describe the main tasks
  const tasks: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\d+\)\s*\*?\*?(.+?)\*?\*?$/);
    if (match && tasks.length < 2) {
      tasks.push(match[1].trim().replace(/\*+/g, ''));
    }
  }
  
  if (tasks.length > 0) {
    return tasks[0].length > 80 ? tasks[0].substring(0, 77) + '...' : tasks[0];
  }
  
  // Fallback: use first meaningful line
  for (const line of lines) {
    const clean = line.replace(/[#*]/g, '').trim();
    if (clean.length > 10 && clean.length < 120) return clean;
  }
  
  return 'Overnight mission';
}

function extractTags(name: string, message: string): string[] {
  const tags: string[] = [];
  const lower = (name + ' ' + message).toLowerCase();
  
  if (lower.includes('intelligence') || lower.includes('intel')) tags.push('intelligence');
  if (lower.includes('content')) tags.push('content');
  if (lower.includes('design') || lower.includes('creative')) tags.push('creative');
  if (lower.includes('marketing')) tags.push('marketing');
  if (lower.includes('trading') || lower.includes('market analysis')) tags.push('trading');
  if (lower.includes('restaurant') || lower.includes('bobola')) tags.push('restaurant');
  if (lower.includes('skill')) tags.push('skills');
  if (lower.includes('research')) tags.push('research');
  if (lower.includes('biz-in-a-box')) tags.push('biz-in-a-box');
  if (lower.includes('nightly') || lower.includes('overnight')) tags.push('overnight');
  if (lower.includes('build')) tags.push('build');
  if (lower.includes('coordinator') || lower.includes('swarm')) tags.push('coordination');
  
  return tags.length > 0 ? tags : ['overnight'];
}

function extractDetails(message: string): string[] {
  const details: string[] = [];
  const lines = message.split('\n');
  
  for (const line of lines) {
    // Match numbered items like "1) ..." or "- ..."
    const match = line.match(/^\s*(?:\d+\)|[-*])\s*\*?\*?(.+?)\*?\*?\s*$/);
    if (match) {
      const clean = match[1].replace(/\*+/g, '').trim();
      if (clean.length > 5 && clean.length < 200) {
        details.push(clean);
      }
    }
  }
  
  return details.slice(0, 10); // Max 10 detail items
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = Math.floor(secs % 60);
  return `${mins}m ${remainSecs}s`;
}

function groupCronsByDate(crons: CronJob[]): Map<string, CronJob[]> {
  const grouped = new Map<string, CronJob[]>();
  
  for (const cron of crons) {
    if (!cron.state?.lastRunAtMs) continue;
    
    const date = new Date(cron.state.lastRunAtMs);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); // YYYY-MM-DD
    
    if (!grouped.has(dateStr)) grouped.set(dateStr, []);
    grouped.get(dateStr)!.push(cron);
  }
  
  return grouped;
}

function cronToOvernightItem(cron: CronJob): OvernightItem {
  const agentName = AGENT_ID_MAP[cron.agentId] || cron.agentId;
  const agentConfig = OVERNIGHT_AGENTS[agentName] || { color: '#737373', type: 'analysis', icon: '◈' };
  const isError = cron.state?.lastStatus === 'error';
  
  const timestamp = cron.state?.lastRunAtMs
    ? new Date(cron.state.lastRunAtMs).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      })
    : 'Pending';

  const details = extractDetails(cron.payload.message);
  
  // Add status details
  if (cron.state?.lastDurationMs) {
    details.push(`Duration: ${formatDuration(cron.state.lastDurationMs)}`);
  }
  if (isError && cron.state?.lastError) {
    // Extract the key error message
    const errorLines = cron.state.lastError.split('\n');
    const shortError = errorLines[0].substring(0, 150);
    details.push(`Error: ${shortError}`);
  }
  if (!isError && cron.state?.lastStatus === 'ok') {
    details.unshift('✅ Mission completed successfully');
  }

  return {
    agent: agentName,
    agentColor: agentConfig.color,
    type: isError ? 'alert' : agentConfig.type,
    title: extractMissionTitle(cron.payload.message),
    summary: isError
      ? `Mission failed: ${cron.state?.lastError?.split('\n')[0]?.substring(0, 120) || 'Unknown error'}`
      : `${cron.name.replace(/-/g, ' ')} completed in ${cron.state?.lastDurationMs ? formatDuration(cron.state.lastDurationMs) : 'unknown time'}`,
    details,
    tags: [
      ...extractTags(cron.name, cron.payload.message),
      isError ? 'error' : 'delivered',
    ],
    priority: isError ? 'low' : 'high',
    timestamp,
    icon: isError ? '⚡' : agentConfig.icon,
    status: isError ? 'error' : 'success',
    durationMs: cron.state?.lastDurationMs,
    errorMessage: isError ? cron.state?.lastError : undefined,
  };
}

// Also pull overnight commits (midnight to 7am)
async function fetchOvernightCommits(dateStr: string): Promise<OvernightItem[]> {
  const items: OvernightItem[] = [];
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'dbtech45-overnight',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  // Parse date and create overnight window (midnight to 7am EST)
  const dayStart = new Date(`${dateStr}T05:00:00Z`); // midnight EST = 5am UTC
  const dayEnd = new Date(`${dateStr}T12:00:00Z`);   // 7am EST = 12pm UTC

  const repos = ['Milobuilds45/dbtech45', '7LayerLabs/clawd-milo', '7LayerLabs/milo-hq'];

  for (const repo of repos) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/commits?since=${dayStart.toISOString()}&until=${dayEnd.toISOString()}&per_page=10`,
        { headers, next: { revalidate: 3600 } }
      );
      if (!res.ok) continue;

      interface GitHubCommit {
        sha: string;
        commit: { message: string; author: { name: string; date: string } };
        author?: { login: string };
      }

      const commits: GitHubCommit[] = await res.json();
      for (const commit of commits) {
        const date = new Date(commit.commit.author.date);
        const repoName = repo.split('/')[1];
        const authorName = commit.author?.login || commit.commit.author.name;
        const agentName = AGENT_ID_MAP[authorName.toLowerCase()] || authorName;
        const agentConfig = OVERNIGHT_AGENTS[agentName] || { color: '#F97316', type: 'build', icon: '▲' };

        items.push({
          agent: agentName,
          agentColor: agentConfig.color,
          type: 'build',
          title: commit.commit.message.split('\n')[0],
          summary: `Committed to ${repoName} during overnight session`,
          details: [`Repo: ${repoName}`, `SHA: ${commit.sha.substring(0, 7)}`],
          tags: ['build', 'commit', repoName],
          priority: 'medium',
          timestamp: date.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
          }),
          icon: '▲',
          status: 'success',
        });
      }
    } catch {
      // Skip
    }
  }

  return items;
}

// Cache
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // Fetch cron list from gateway
    // We'll read the cron data from the gateway's internal API
    // For now, use static cron knowledge + GitHub commits

    // Known overnight cron names (from our cron system)
    const overnightCronNames = [
      'milo-nightly-builder',
      'overnight-intelligence-content-creative',
      'overnight-design-marketing-creative',
      'overnight-analysis-skills-creative',
      'overnight-restaurant-ops-creative',
      'overnight-trading-intelligence-creative',
      '730am-overnight-results-coordinator',
    ];

    // We'll fetch the cron list via internal gateway API
    let cronJobs: CronJob[] = [];
    try {
      // Try to read cron data from gateway
      const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:4443';
      const gatewayToken = process.env.GATEWAY_TOKEN || '';
      
      const cronRes = await fetch(`${gatewayUrl}/api/crons`, {
        headers: gatewayToken ? { 'Authorization': `Bearer ${gatewayToken}` } : {},
        signal: AbortSignal.timeout(5000),
      });
      
      if (cronRes.ok) {
        const cronData = await cronRes.json();
        cronJobs = (cronData.jobs || []).filter((j: CronJob) => 
          overnightCronNames.includes(j.name) || 
          j.name.includes('overnight') || 
          j.name.includes('nightly')
        );
      }
    } catch {
      // Gateway not reachable from Vercel - use what we can get from GitHub
    }

    // Get today's date and recent dates
    const now = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }));
    }

    // Group cron results by date
    const cronsByDate = groupCronsByDate(cronJobs);

    // Build briefs for each date
    const briefs: OvernightBrief[] = [];

    for (const dateStr of dates) {
      const cronItems = (cronsByDate.get(dateStr) || []).map(cronToOvernightItem);
      const commitItems = await fetchOvernightCommits(dateStr);
      const allItems = [...cronItems, ...commitItems].sort((a, b) => {
        // Errors last, then by priority
        if (a.status === 'error' && b.status !== 'error') return 1;
        if (a.status !== 'error' && b.status === 'error') return -1;
        return 0;
      });

      if (allItems.length === 0) continue;

      const successCount = allItems.filter(i => i.status === 'success').length;
      const errorCount = allItems.filter(i => i.status === 'error').length;
      const totalAgents = new Set(allItems.map(i => i.agent)).size;

      const date = new Date(dateStr + 'T12:00:00Z');
      const isToday = dateStr === dates[0];
      const isYesterday = dateStr === dates[1];
      const label = isToday ? 'Last Night' : isYesterday ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });

      briefs.push({
        date: dateStr,
        label,
        headline: `${totalAgents} agents deployed · ${successCount} successful · ${errorCount > 0 ? `${errorCount} errors` : 'all clear'}`,
        items: allItems,
      });
    }

    const result = {
      briefs,
      stats: {
        totalBriefs: briefs.length,
        totalItems: briefs.reduce((sum, b) => sum + b.items.length, 0),
        successRate: briefs.length > 0
          ? Math.round(
              (briefs[0].items.filter(i => i.status === 'success').length /
                Math.max(briefs[0].items.length, 1)) * 100
            )
          : 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    cache = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Overnight API error:', error);
    return NextResponse.json({
      briefs: [],
      stats: { totalBriefs: 0, totalItems: 0, successRate: 0 },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch overnight data',
    });
  }
}
