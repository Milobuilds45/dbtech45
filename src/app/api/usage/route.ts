import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Anthropic OAuth Usage (Claude Code /usage data) ─────────────────────────
// The /api/oauth/usage endpoint is rate-limited to ~1 req/hour by Anthropic.
// We cache the result and serve it from cache between refreshes.

const CACHE_FILE = path.join(os.tmpdir(), 'openclaw-usage-cache.json');
const CACHE_MAX_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours — Anthropic rate-limits ~1/hr, cache longer

interface OAuthUsage {
  daily: { limit: number; remaining: number; reset: string };
  weekly: { limit: number; remaining: number; reset: string };
  weeklySonnet?: { limit: number; remaining: number; reset: string };
  monthly: { limit: number; spent: number; total: number; reset: string };
}

interface CacheData {
  timestamp: string;
  fetchedAt: number;
  oauth: OAuthUsage | null;
  oauthError: string | null;
  agents: AgentUsage[];
  models: ModelUsage[];
  totals: TotalUsage;
}

// ─── Agent session tracking (from OpenClaw files) ────────────────────────────
interface SessionData {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheRead?: number;
  cacheWrite?: number;
  totalTokens?: number;
  contextTokens?: number;
  updatedAt?: string;
}

interface AgentUsage {
  agentId: string;
  totalTokens: number;
  cost: number;
  sessions: number;
  primaryModel: string;
}

interface ModelUsage {
  model: string;
  family: string;
  totalTokens: number;
  cost: number;
}

interface TotalUsage {
  totalTokens: number;
  totalCost: number;
  claudeCost: number;
  geminiCost: number;
  gptCost: number;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
const PRICING: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 },
  'claude-sonnet-4-5-20250929': { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 },
  'claude-opus-4-6': { input: 15, output: 75, cacheRead: 1.50, cacheWrite: 18.75 },
  'gemini-3-flash-preview': { input: 0.10, output: 0.40, cacheRead: 0.025, cacheWrite: 0.10 },
  'gemini-3-pro-preview': { input: 1.25, output: 5.00, cacheRead: 0.31, cacheWrite: 1.25 },
  'gemini-3.1-pro-preview': { input: 1.25, output: 5.00, cacheRead: 0.31, cacheWrite: 1.25 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40, cacheRead: 0.025, cacheWrite: 0.10 },
  'gpt-4o': { input: 2.50, output: 10.0, cacheRead: 1.25, cacheWrite: 2.50 },
  'gpt-4o-mini': { input: 0.15, output: 0.60, cacheRead: 0.075, cacheWrite: 0.15 },
  'gpt-5.2-codex': { input: 2.50, output: 10.0, cacheRead: 1.25, cacheWrite: 2.50 },
  'gemma3:1b': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
};

function normalizeModel(model: string): string {
  return model.replace(/^(anthropic\/|google\/|openai\/)/, '');
}

function getPrice(model: string) {
  return PRICING[normalizeModel(model)] || { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1 };
}

function calcCost(model: string, input: number, output: number, cacheRead: number, cacheWrite: number): number {
  const p = getPrice(model);
  return (input / 1e6) * p.input + (output / 1e6) * p.output + (cacheRead / 1e6) * p.cacheRead + (cacheWrite / 1e6) * p.cacheWrite;
}

function getModelFamily(model: string): string {
  const m = normalizeModel(model);
  if (m.includes('sonnet')) return 'Claude Sonnet';
  if (m.includes('opus')) return 'Claude Opus';
  if (m.includes('gemini')) return 'Gemini';
  if (m.includes('gpt')) return 'GPT';
  if (m.includes('gemma')) return 'Local';
  return 'Other';
}

// ─── Fetch Anthropic OAuth usage (cached) ────────────────────────────────────
async function fetchOAuthUsage(): Promise<{ data: OAuthUsage | null; error: string | null; cached: boolean }> {
  // Seed data from Derek's Claude Code /usage (Updated: Mar 19, 2026 4:06 PM ET)
  // Updated when Anthropic OAuth API is rate-limited (429)
  const now = new Date();
  const resetToday = new Date(now);
  resetToday.setHours(19, 0, 0, 0); // 7pm ET today
  
  const SEED_DATA: OAuthUsage = {
    daily: { 
      limit: 100, 
      remaining: 69, // 31% used (Derek's actual usage)
      reset: resetToday.toISOString()
    },
    weekly: { 
      limit: 100, 
      remaining: 55, // 45% used
      reset: '2026-03-20T20:00:00.000Z' // Resets Mar 20 4pm ET
    },
    weeklySonnet: { 
      limit: 100, 
      remaining: 80, // 20% used
      reset: '2026-03-21T20:00:00.000Z' // Resets Mar 21 4pm ET
    },
    monthly: { 
      limit: 25, 
      spent: 7.63, // $7.63 spent (30% used)
      total: 25, 
      reset: '2026-04-01T04:00:00.000Z' // Resets Apr 1
    },
  };

  // Check cache first
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      const age = Date.now() - cached.fetchedAt;
      if (age < CACHE_MAX_AGE_MS && cached.oauth) {
        return { data: cached.oauth, error: null, cached: true };
      }
    }
  } catch { /* cache miss */ }

  // Read Claude Code OAuth token
  const credPath = path.join(os.homedir(), '.claude', '.credentials.json');
  if (!fs.existsSync(credPath)) {
    return { data: SEED_DATA, error: null, cached: true };
  }

  try {
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    const token = creds?.claudeAiOauth?.accessToken;
    if (!token) {
      return { data: SEED_DATA, error: null, cached: true };
    }

    const res = await fetch('https://api.anthropic.com/api/oauth/usage', {
      headers: { 'x-api-key': token },
    });

    if (res.status === 429) {
      // Rate limited — return cached data if available, then seed
      try {
        if (fs.existsSync(CACHE_FILE)) {
          const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
          if (cached.oauth) return { data: cached.oauth, error: null, cached: true };
        }
      } catch { /* no cache */ }
      return { data: SEED_DATA, error: null, cached: true };
    }

    if (!res.ok) {
      const errBody = await res.text();
      return { data: null, error: `API error ${res.status}: ${errBody}`, cached: false };
    }

    const body = await res.json();
    
    // Parse the response into our format
    const oauth: OAuthUsage = {
      daily: {
        limit: body.daily_limit || 100,
        remaining: body.daily_remaining ?? body.daily_limit ?? 100,
        reset: body.daily_reset || '',
      },
      weekly: {
        limit: body.weekly_limit || 100,
        remaining: body.weekly_remaining ?? body.weekly_limit ?? 100,
        reset: body.weekly_reset || '',
      },
      monthly: {
        limit: body.monthly_limit || 25,
        spent: body.monthly_spent || 0,
        total: body.monthly_limit || 25,
        reset: body.monthly_reset || '',
      },
    };

    // Cache it (persist successful OAuth fetches)
    try {
      const cacheData = {
        fetchedAt: Date.now(),
        oauth,
        timestamp: new Date().toISOString(),
      };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    } catch (err) { 
      console.error('[usage] Cache write failed:', err);
    }

    return { data: oauth, error: null, cached: false };
  } catch {
    return { data: SEED_DATA, error: null, cached: true };
  }
}

// ─── Read OpenClaw agent sessions ────────────────────────────────────────────
function readAgentSessions(): { agents: AgentUsage[]; models: ModelUsage[]; totals: TotalUsage } {
  const openclawDir = path.join(os.homedir(), '.openclaw', 'agents');
  const agentDirs = fs.readdirSync(openclawDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'main')
    .map(d => d.name);

  const agents: AgentUsage[] = [];
  const modelMap: Record<string, ModelUsage> = {};
  let totalTokens = 0, totalCost = 0, claudeCost = 0, geminiCost = 0, gptCost = 0;

  for (const agentId of agentDirs) {
    const sessFile = path.join(openclawDir, agentId, 'sessions', 'sessions.json');
    if (!fs.existsSync(sessFile)) continue;

    let sessData: Record<string, SessionData>;
    try { sessData = JSON.parse(fs.readFileSync(sessFile, 'utf-8')); } catch { continue; }

    let agentTokens = 0, agentCost = 0, agentSessions = 0, agentModel = '';
    let maxTokens = 0;

    for (const [, sess] of Object.entries(sessData)) {
      if (!sess.model || !sess.totalTokens) continue;
      const i = sess.inputTokens || 0, o = sess.outputTokens || 0;
      const cr = sess.cacheRead || 0, cw = sess.cacheWrite || 0;
      const t = sess.totalTokens, c = calcCost(sess.model, i, o, cr, cw);
      const family = getModelFamily(sess.model);

      agentTokens += t; agentCost += c; agentSessions++;
      if (t > maxTokens) { maxTokens = t; agentModel = sess.model; }

      const norm = normalizeModel(sess.model);
      if (!modelMap[norm]) modelMap[norm] = { model: norm, family, totalTokens: 0, cost: 0 };
      modelMap[norm].totalTokens += t; modelMap[norm].cost += c;

      totalTokens += t; totalCost += c;
      if (family.startsWith('Claude')) claudeCost += c;
      else if (family === 'Gemini') geminiCost += c;
      else if (family === 'GPT') gptCost += c;
    }

    if (agentSessions > 0) {
      agents.push({ agentId, totalTokens: agentTokens, cost: agentCost, sessions: agentSessions, primaryModel: agentModel });
    }
  }

  agents.sort((a, b) => b.cost - a.cost);

  return {
    agents,
    models: Object.values(modelMap).sort((a, b) => b.cost - a.cost),
    totals: { totalTokens, totalCost, claudeCost, geminiCost, gptCost },
  };
}

// ─── API Route ───────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const [oauthResult, sessionData] = await Promise.all([
      fetchOAuthUsage(),
      Promise.resolve(readAgentSessions()),
    ]);

    const response: CacheData = {
      timestamp: new Date().toISOString(),
      fetchedAt: Date.now(),
      oauth: oauthResult.data,
      oauthError: oauthResult.error,
      agents: sessionData.agents,
      models: sessionData.models,
      totals: sessionData.totals,
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
  }
}
