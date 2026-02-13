#!/usr/bin/env node
/**
 * sync-ops-status.js
 * Reads live Clawdbot gateway data from disk and writes ops-status.json
 * for the dbtech45.com dashboard to consume.
 * 
 * Reads from:
 *   ~/.clawdbot/cron/jobs.json
 *   ~/.clawdbot/cron/runs/*.jsonl
 *   ~/.clawdbot/agents/(name)/sessions/
 *   ~/.clawdbot/clawdbot.json
 * 
 * Writes to:
 *   public/data/ops-status.json
 * 
 * Run: node scripts/sync-ops-status.js
 * Cron: every 5 minutes via Windows Task Scheduler or Clawdbot cron
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAWDBOT_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.clawdbot');
const PROJECT_DIR = path.resolve(__dirname, '..');
const OUTPUT = path.join(PROJECT_DIR, 'public', 'data', 'ops-status.json');

// Agent metadata (static - matches SOUL.md configs)
const AGENT_META = {
  milo:   { name: 'Milo',   role: 'Chief of Staff',        defaultModel: 'claude-sonnet-4' },
  anders: { name: 'Anders', role: 'Full Stack Architect',   defaultModel: 'claude-opus-4-6' },
  bobby:  { name: 'Bobby',  role: 'Trading Advisor',        defaultModel: 'claude-opus-4-6' },
  paula:  { name: 'Paula',  role: 'Creative Director',      defaultModel: 'claude-opus-4-5' },
  dwight: { name: 'Dwight', role: 'Weather & News',         defaultModel: 'gemini-3-flash' },
  tony:   { name: 'Tony',   role: 'Tech Guru',              defaultModel: 'gemini-3-flash' },
  dax:    { name: 'Dax',    role: 'Social Strategist',      defaultModel: 'gemini-3-flash' },
  remy:   { name: 'Remy',   role: 'Restaurant Marketing',   defaultModel: 'gemini-3-flash' },
  wendy:  { name: 'Wendy',  role: 'Wellness Coach',         defaultModel: 'claude-opus-4-5' },
};

function readJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch { return null; }
}

function getSessionFiles(agentId) {
  const dir = path.join(CLAWDBOT_DIR, 'agents', agentId, 'sessions');
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => {
        const stat = fs.statSync(path.join(dir, f));
        return { file: f, mtime: stat.mtimeMs, size: stat.size };
      })
      .sort((a, b) => b.mtime - a.mtime);
  } catch { return []; }
}

function parseLastSessionLine(agentId, filename) {
  const filepath = path.join(CLAWDBOT_DIR, 'agents', agentId, 'sessions', filename);
  try {
    const content = fs.readFileSync(filepath, 'utf8').trim();
    const lines = content.split('\n').filter(Boolean);
    // Read last few lines to find usage/model info
    const lastLines = lines.slice(-5);
    let totalTokens = 0;
    let cost = 0;
    let model = null;
    let lastTimestamp = null;

    for (const line of lastLines) {
      try {
        const entry = JSON.parse(line);
        if (entry.usage) {
          totalTokens += (entry.usage.totalTokens || 0);
          cost += (entry.usage.cost?.total || 0);
        }
        if (entry.model) model = entry.model;
        if (entry.timestamp) lastTimestamp = entry.timestamp;
      } catch {}
    }
    return { totalTokens, cost, model, lastTimestamp };
  } catch { return { totalTokens: 0, cost: 0, model: null, lastTimestamp: null }; }
}

function buildCronData() {
  const jobsFile = path.join(CLAWDBOT_DIR, 'cron', 'jobs.json');
  const raw = readJSON(jobsFile);
  if (!raw) return [];
  const jobs = raw.jobs || raw;
  if (!Array.isArray(jobs)) return [];

  return jobs.map(job => {
    const agentName = AGENT_META[job.agentId]?.name || job.agentId;
    const state = job.state || {};
    
    // Parse schedule to human readable
    let humanSchedule = job.schedule?.expr || '';
    
    // Calculate duration from state
    let duration = null;
    if (state.lastDurationMs) {
      duration = Math.round(state.lastDurationMs / 1000) + 's';
    }

    let lastStatus = 'pending';
    if (state.lastStatus === 'ok') lastStatus = 'success';
    else if (state.lastStatus === 'error') lastStatus = 'failure';
    else if (state.lastStatus) lastStatus = state.lastStatus;

    return {
      id: job.id,
      name: job.name || 'Unnamed',
      schedule: job.schedule?.expr || '',
      humanSchedule: humanSchedule,
      agent: agentName,
      description: (job.payload?.message || '').substring(0, 120).split('\n')[0],
      lastRun: state.lastRunAtMs ? new Date(state.lastRunAtMs).toISOString() : null,
      lastStatus,
      nextRun: state.nextRunAtMs ? new Date(state.nextRunAtMs).toISOString() : null,
      duration,
      enabled: job.enabled !== false,
      deleteAfterRun: job.deleteAfterRun || false,
      lastError: state.lastError ? state.lastError.substring(0, 200) : null,
    };
  }).filter(j => j.enabled && !j.deleteAfterRun); // Only show active recurring jobs
}

function buildSessionData() {
  const sessions = [];
  const agentDirs = path.join(CLAWDBOT_DIR, 'agents');
  
  for (const [agentId, meta] of Object.entries(AGENT_META)) {
    const files = getSessionFiles(agentId);
    if (files.length === 0) continue;

    // Get the most recent session
    const recent = files[0];
    const parsed = parseLastSessionLine(agentId, recent.file);
    
    const hoursSinceActive = (Date.now() - recent.mtime) / (1000 * 60 * 60);
    let status = 'offline';
    if (hoursSinceActive < 0.5) status = 'running';
    else if (hoursSinceActive < 4) status = 'idle';

    sessions.push({
      key: `agent:${agentId}:main`,
      agent: meta.name,
      model: parsed.model || meta.defaultModel,
      status,
      totalTokens: parsed.totalTokens,
      lastActivity: new Date(recent.mtime).toISOString(),
      role: meta.role,
      cost: Math.round(parsed.cost * 100) / 100,
      sessionCount: files.length,
    });
  }

  return sessions.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
}

function buildAgentFleet() {
  const sessions = buildSessionData();
  
  return Object.entries(AGENT_META).map(([agentId, meta]) => {
    const session = sessions.find(s => s.agent === meta.name);
    
    // Count today's cron runs
    const runsDir = path.join(CLAWDBOT_DIR, 'cron', 'runs');
    const today = new Date().toISOString().split('T')[0];
    let tasksToday = 0;
    try {
      const runFiles = fs.readdirSync(runsDir).filter(f => f.endsWith('.jsonl'));
      for (const rf of runFiles) {
        const stat = fs.statSync(path.join(runsDir, rf));
        if (stat.mtime.toISOString().startsWith(today)) {
          // Check if this run belongs to this agent by reading first line
          try {
            const firstLine = fs.readFileSync(path.join(runsDir, rf), 'utf8').split('\n')[0];
            if (firstLine.includes(agentId)) tasksToday++;
          } catch {}
        }
      }
    } catch {}

    return {
      name: meta.name,
      role: meta.role,
      status: session?.status || 'offline',
      model: session?.model || meta.defaultModel,
      health: session?.status === 'offline' && !session ? 'warning' : 'healthy',
      tasksToday,
      lastSeen: session?.lastActivity || null,
    };
  });
}

function buildSystemHealth() {
  // Check if gateway is running by checking if the port is in use
  let gatewayStatus = 'unknown';
  try {
    const result = execSync('netstat -an | findstr "18789"', { encoding: 'utf8', timeout: 5000 });
    gatewayStatus = result.includes('LISTENING') ? 'online' : 'offline';
  } catch {
    gatewayStatus = 'offline';
  }

  const crons = buildCronData();
  const sessions = buildSessionData();
  const agents = buildAgentFleet();

  // Build alerts
  const alerts = [];
  const offlineAgents = agents.filter(a => a.status === 'offline' && a.lastSeen);
  for (const agent of offlineAgents) {
    const hours = Math.round((Date.now() - new Date(agent.lastSeen).getTime()) / (1000 * 60 * 60));
    if (hours > 12) {
      alerts.push({
        id: `offline-${agent.name.toLowerCase()}`,
        type: 'warning',
        message: `${agent.name} agent offline for >${hours} hours`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }
  }

  // Check for recent cron failures
  const failedCrons = crons.filter(c => c.lastStatus === 'failure');
  for (const cron of failedCrons) {
    alerts.push({
      id: `cron-fail-${cron.id.substring(0, 8)}`,
      type: 'error',
      message: `Cron "${cron.name}" failed${cron.lastError ? ': ' + cron.lastError.substring(0, 80) : ''}`,
      timestamp: cron.lastRun || new Date().toISOString(),
      resolved: false,
    });
  }

  // Calculate uptime from gateway process
  let uptime = 0;
  try {
    const config = readJSON(path.join(CLAWDBOT_DIR, 'clawdbot.json'));
    // Approximate from last heartbeat
    uptime = 7200; // Default 2h, will be more accurate with process check
  } catch {}

  return {
    gatewayStatus,
    gatewayPort: 18789,
    bind: 'loopback',
    uptime,
    lastHeartbeat: new Date().toISOString(),
    totalCrons: crons.length,
    activeSessions: sessions.filter(s => s.status !== 'offline').length,
    totalAgents: Object.keys(AGENT_META).length,
    alerts,
  };
}

// ═══ MAIN ═══
function main() {
  console.log('[sync-ops-status] Starting...');
  
  const system = buildSystemHealth();
  const agents = buildAgentFleet();
  const sessions = buildSessionData();
  const crons = buildCronData();

  const output = {
    system,
    agents,
    sessions,
    crons,
    generatedAt: new Date().toISOString(),
    version: 2,
  };

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`[sync-ops-status] Written to ${OUTPUT}`);
  console.log(`  - ${crons.length} cron jobs`);
  console.log(`  - ${sessions.length} sessions`);
  console.log(`  - ${agents.length} agents`);
  console.log(`  - Gateway: ${system.gatewayStatus}`);
  console.log(`  - ${system.alerts.length} alerts`);
}

main();
