import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Pricing (per 1M tokens) ─────────────────────────────────────────────────
const PRICING: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-sonnet-4-6':        { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75 },
  'claude-sonnet-4-5-20250929': { input: 3,  output: 15,   cacheRead: 0.30,  cacheWrite: 3.75 },
  'claude-opus-4-6':          { input: 15,   output: 75,   cacheRead: 1.50,  cacheWrite: 18.75 },
  'gemini-3-flash-preview':   { input: 0.10, output: 0.40, cacheRead: 0.025, cacheWrite: 0.10 },
  'gemini-3-pro-preview':     { input: 1.25, output: 5.00, cacheRead: 0.31,  cacheWrite: 1.25 },
  'gemini-3.1-pro-preview':   { input: 1.25, output: 5.00, cacheRead: 0.31,  cacheWrite: 1.25 },
  'gemini-2.0-flash':         { input: 0.10, output: 0.40, cacheRead: 0.025, cacheWrite: 0.10 },
  'gpt-4o':                   { input: 2.50, output: 10.0, cacheRead: 1.25,  cacheWrite: 2.50 },
  'gpt-4o-mini':              { input: 0.15, output: 0.60, cacheRead: 0.075, cacheWrite: 0.15 },
  'gpt-5.2-codex':            { input: 2.50, output: 10.0, cacheRead: 1.25,  cacheWrite: 2.50 },
  'gemma3:1b':                { input: 0,    output: 0,    cacheRead: 0,     cacheWrite: 0 }, // local
};

// Normalize model IDs (strip provider prefix)
function normalizeModel(model: string): string {
  return model.replace(/^(anthropic\/|google\/|openai\/)/, '');
}

function getPrice(model: string) {
  const norm = normalizeModel(model);
  return PRICING[norm] || { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1 };
}

function calcCost(model: string, input: number, output: number, cacheRead: number, cacheWrite: number): number {
  const p = getPrice(model);
  return (
    (input / 1_000_000) * p.input +
    (output / 1_000_000) * p.output +
    (cacheRead / 1_000_000) * p.cacheRead +
    (cacheWrite / 1_000_000) * p.cacheWrite
  );
}

// ─── Model family grouping ───────────────────────────────────────────────────
function getModelFamily(model: string): string {
  const m = normalizeModel(model);
  if (m.includes('sonnet')) return 'Claude Sonnet';
  if (m.includes('opus')) return 'Claude Opus';
  if (m.includes('gemini-3') || m.includes('gemini-2')) return 'Gemini';
  if (m.includes('gpt')) return 'GPT';
  if (m.includes('gemma')) return 'Local (Ollama)';
  return 'Other';
}

// ─── Types ───────────────────────────────────────────────────────────────────
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
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  cost: number;
  sessions: number;
  models: Record<string, { tokens: number; cost: number }>;
}

interface ModelUsage {
  model: string;
  family: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  cost: number;
}

interface UsageResponse {
  timestamp: string;
  agents: AgentUsage[];
  models: ModelUsage[];
  totals: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    cacheRead: number;
    cacheWrite: number;
    totalCost: number;
    claudeCost: number;
    geminiCost: number;
    gptCost: number;
  };
  claude: {
    sessionTokens: number;
    sessionCost: number;
    weeklyTokens: number;
    weeklyCost: number;
    contextUsed: number;
    contextMax: number;
  };
}

export async function GET() {
  try {
    const openclawDir = path.join(os.homedir(), '.openclaw', 'agents');
    const agentDirs = fs.readdirSync(openclawDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'main')
      .map(d => d.name);

    const agentUsages: AgentUsage[] = [];
    const modelMap: Record<string, ModelUsage> = {};
    let grandTotalTokens = 0;
    let grandInputTokens = 0;
    let grandOutputTokens = 0;
    let grandCacheRead = 0;
    let grandCacheWrite = 0;
    let grandCost = 0;
    let claudeCost = 0;
    let geminiCost = 0;
    let gptCost = 0;

    // Claude-specific tracking for sidebar gauges
    let claudeSessionTokens = 0;
    let claudeSessionCost = 0;
    let claudeContextUsed = 0;
    let claudeContextMax = 200000;

    for (const agentId of agentDirs) {
      const sessFile = path.join(openclawDir, agentId, 'sessions', 'sessions.json');
      if (!fs.existsSync(sessFile)) continue;

      let sessData: Record<string, SessionData>;
      try {
        sessData = JSON.parse(fs.readFileSync(sessFile, 'utf-8'));
      } catch {
        continue;
      }

      const agentUsage: AgentUsage = {
        agentId,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheRead: 0,
        cacheWrite: 0,
        cost: 0,
        sessions: 0,
        models: {},
      };

      for (const [sessKey, sess] of Object.entries(sessData)) {
        if (!sess.model || !sess.totalTokens || sess.totalTokens === 0) continue;

        const input = sess.inputTokens || 0;
        const output = sess.outputTokens || 0;
        const cr = sess.cacheRead || 0;
        const cw = sess.cacheWrite || 0;
        const total = sess.totalTokens || 0;
        const cost = calcCost(sess.model, input, output, cr, cw);

        // Agent totals
        agentUsage.totalTokens += total;
        agentUsage.inputTokens += input;
        agentUsage.outputTokens += output;
        agentUsage.cacheRead += cr;
        agentUsage.cacheWrite += cw;
        agentUsage.cost += cost;
        agentUsage.sessions += 1;

        // Per-model within agent
        const family = getModelFamily(sess.model);
        if (!agentUsage.models[family]) {
          agentUsage.models[family] = { tokens: 0, cost: 0 };
        }
        agentUsage.models[family].tokens += total;
        agentUsage.models[family].cost += cost;

        // Global model totals
        const normModel = normalizeModel(sess.model);
        if (!modelMap[normModel]) {
          modelMap[normModel] = {
            model: normModel,
            family,
            totalTokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            cacheRead: 0,
            cacheWrite: 0,
            cost: 0,
          };
        }
        modelMap[normModel].totalTokens += total;
        modelMap[normModel].inputTokens += input;
        modelMap[normModel].outputTokens += output;
        modelMap[normModel].cacheRead += cr;
        modelMap[normModel].cacheWrite += cw;
        modelMap[normModel].cost += cost;

        // Grand totals
        grandTotalTokens += total;
        grandInputTokens += input;
        grandOutputTokens += output;
        grandCacheRead += cr;
        grandCacheWrite += cw;
        grandCost += cost;

        // Cost by provider
        if (family.startsWith('Claude')) claudeCost += cost;
        else if (family === 'Gemini') geminiCost += cost;
        else if (family === 'GPT') gptCost += cost;

        // Claude sidebar: main session only
        if (sessKey === `agent:${agentId}:main` && family.startsWith('Claude')) {
          claudeSessionTokens += total;
          claudeSessionCost += cost;
          claudeContextUsed = sess.contextTokens || sess.totalTokens || 0;
          claudeContextMax = 200000;
        }
      }

      if (agentUsage.sessions > 0) {
        agentUsages.push(agentUsage);
      }
    }

    // Sort agents by cost descending
    agentUsages.sort((a, b) => b.cost - a.cost);

    const response: UsageResponse = {
      timestamp: new Date().toISOString(),
      agents: agentUsages,
      models: Object.values(modelMap).sort((a, b) => b.cost - a.cost),
      totals: {
        totalTokens: grandTotalTokens,
        inputTokens: grandInputTokens,
        outputTokens: grandOutputTokens,
        cacheRead: grandCacheRead,
        cacheWrite: grandCacheWrite,
        totalCost: grandCost,
        claudeCost,
        geminiCost,
        gptCost,
      },
      claude: {
        sessionTokens: claudeSessionTokens,
        sessionCost: claudeSessionCost,
        weeklyTokens: grandTotalTokens, // All tokens this period
        weeklyCost: grandCost,
        contextUsed: claudeContextUsed,
        contextMax: claudeContextMax,
      },
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Usage API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
