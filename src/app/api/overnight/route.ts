import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// GitHub token for commit data
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const AGENT_ID_MAP: Record<string, string> = {
  'dwight': 'Dwight', 'paula': 'Paula', 'dax': 'Dax', 'tony': 'Tony',
  'bobby': 'Bobby', 'milo': 'Milo', 'anders': 'Anders', 'remy': 'Remy', 'wendy': 'Wendy',
  'milobuilds45': 'Milo', 'dbtech45': 'Derek',
};

const AGENT_COLORS: Record<string, string> = {
  'Dwight': '#3B82F6', 'Paula': '#EC4899', 'Dax': '#06B6D4', 'Tony': '#EAB308',
  'Bobby': '#22C55E', 'Milo': '#A855F7', 'Anders': '#F97316', 'Remy': '#EF4444',
  'Wendy': '#8B5CF6', 'Derek': '#F59E0B', 'System': '#737373',
};

interface OvernightRow {
  id: string;
  date: string;
  agent: string;
  agent_color: string;
  type: string;
  title: string;
  summary: string | null;
  details: string[];
  tags: string[];
  priority: string;
  timestamp: string | null;
  icon: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  cron_name: string | null;
  cron_id: string | null;
  source: string;
  created_at: string;
}

interface OvernightItem {
  id?: string;
  agent: string;
  agentColor: string;
  type: string;
  title: string;
  summary: string;
  details: string[];
  tags: string[];
  priority: string;
  timestamp: string;
  icon: string;
  status: string;
  durationMs?: number;
}

interface OvernightBrief {
  date: string;
  label: string;
  headline: string;
  items: OvernightItem[];
}

// Fetch overnight commits from GitHub (midnight to 7am EST)
async function fetchOvernightCommits(dateStr: string): Promise<OvernightItem[]> {
  const items: OvernightItem[] = [];
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'dbtech45-overnight',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  const dayStart = new Date(`${dateStr}T05:00:00Z`); // midnight EST
  const dayEnd = new Date(`${dateStr}T12:00:00Z`);   // 7am EST

  const repos = [
    'Milobuilds45/dbtech45', '7LayerLabs/clawd-milo', '7LayerLabs/milo-hq',
    '7LayerLabs/clawd-bobby', '7LayerLabs/clawd-anders', '7LayerLabs/clawd-paula',
    '7LayerLabs/clawd-tony', '7LayerLabs/clawd-dax', '7LayerLabs/clawd-remy',
    '7LayerLabs/clawd-wendy', '7LayerLabs/clawd-dwight',
  ];

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

        items.push({
          agent: agentName,
          agentColor: AGENT_COLORS[agentName] || '#F97316',
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

// Convert Supabase row to OvernightItem
function rowToItem(row: OvernightRow): OvernightItem {
  return {
    id: row.id,
    agent: row.agent,
    agentColor: row.agent_color,
    type: row.type,
    title: row.title,
    summary: row.summary || '',
    details: Array.isArray(row.details) ? row.details : [],
    tags: row.tags || [],
    priority: row.priority,
    timestamp: row.timestamp || '',
    icon: row.icon,
    status: row.status,
    durationMs: row.duration_ms || undefined,
  };
}

// Cache
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 min

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // Get last 7 dates
    const dates: string[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }));
    }

    const briefs: OvernightBrief[] = [];

    // Fetch from Supabase
    let supabaseItems: Map<string, OvernightItem[]> = new Map();
    if (supabase) {
      const { data: rows } = await supabase
        .from('overnight_results')
        .select('*')
        .gte('date', dates[dates.length - 1])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (rows && rows.length > 0) {
        for (const row of rows as OvernightRow[]) {
          const dateStr = row.date;
          if (!supabaseItems.has(dateStr)) supabaseItems.set(dateStr, []);
          supabaseItems.get(dateStr)!.push(rowToItem(row));
        }
      }
    }

    // Build briefs for each date
    for (const dateStr of dates) {
      const dbItems = supabaseItems.get(dateStr) || [];
      const commitItems = await fetchOvernightCommits(dateStr);

      // Merge, deduplicate by title
      const seenTitles = new Set(dbItems.map(i => i.title));
      const newCommits = commitItems.filter(c => !seenTitles.has(c.title));
      const allItems = [...dbItems, ...newCommits].sort((a, b) => {
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
      const label = isToday ? 'Last Night'
        : isYesterday ? 'Yesterday'
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });

      briefs.push({
        date: dateStr,
        label,
        headline: `${totalAgents} agents · ${successCount} successful${errorCount > 0 ? ` · ${errorCount} errors` : ' · all clear'}`,
        items: allItems,
      });
    }

    const result = {
      briefs,
      stats: {
        totalBriefs: briefs.length,
        totalItems: briefs.reduce((sum, b) => sum + b.items.length, 0),
        successRate: briefs.length > 0 && briefs[0].items.length > 0
          ? Math.round((briefs[0].items.filter(i => i.status === 'success').length / briefs[0].items.length) * 100)
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

// POST: Write overnight results (called by cron agents or gateway)
export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Accept single item or array
    const items = Array.isArray(body) ? body : [body];

    const rows = items.map((item: Record<string, unknown>) => ({
      date: item.date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }),
      agent: item.agent || 'System',
      agent_color: item.agentColor || item.agent_color || AGENT_COLORS[item.agent as string] || '#737373',
      type: item.type || 'analysis',
      title: item.title || 'Untitled',
      summary: item.summary || null,
      details: item.details || [],
      tags: item.tags || [],
      priority: item.priority || 'medium',
      timestamp: item.timestamp || new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
      }),
      icon: item.icon || '◈',
      status: item.status || 'success',
      duration_ms: item.durationMs || item.duration_ms || null,
      error_message: item.errorMessage || item.error_message || null,
      cron_name: item.cronName || item.cron_name || null,
      cron_id: item.cronId || item.cron_id || null,
      source: item.source || 'cron',
    }));

    const { data, error } = await supabase
      .from('overnight_results')
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache
    cache = null;

    return NextResponse.json({ ok: true, inserted: data?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH: Update status on existing overnight items (approve/reject)
export async function PATCH(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const allowedStatuses = ['approved', 'rejected', 'pending', 'success', 'error', 'completed', 'skipped'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('overnight_results')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache
    cache = null;

    return NextResponse.json({ ok: true, updated: data?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
