#!/usr/bin/env node
/**
 * sync-all-data.js
 * Master sync script - reads ALL live Clawdbot data from disk and writes
 * JSON files for every dashboard page to consume.
 * 
 * Outputs:
 *   public/data/ops-status.json     (system health, agents, sessions, crons)
 *   public/data/skills.json         (real skill inventory from disk)
 *   public/data/agent-configs.json  (agent models, workspaces, org chart)
 *   public/data/activity.json       (git commits, cron runs, recent work)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAWDBOT_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.clawdbot');
const PROJECT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_DIR, 'public', 'data');

const AGENT_META = {
  milo:   { name: 'Milo',   role: 'Chief of Staff',        color: '#A855F7', defaultModel: 'claude-sonnet-4' },
  anders: { name: 'Anders', role: 'Full Stack Architect',   color: '#F97316', defaultModel: 'claude-opus-4-6' },
  bobby:  { name: 'Bobby',  role: 'Trading Advisor',        color: '#22C55E', defaultModel: 'claude-opus-4-6' },
  paula:  { name: 'Paula',  role: 'Creative Director',      color: '#EC4899', defaultModel: 'claude-opus-4-5' },
  dwight: { name: 'Dwight', role: 'Weather & News',         color: '#6366F1', defaultModel: 'gemini-3-flash' },
  tony:   { name: 'Tony',   role: 'Tech Guru',              color: '#EAB308', defaultModel: 'gemini-3-flash' },
  dax:    { name: 'Dax',    role: 'Social Strategist',      color: '#06B6D4', defaultModel: 'gemini-3-flash' },
  remy:   { name: 'Remy',   role: 'Restaurant Marketing',   color: '#EF4444', defaultModel: 'gemini-3-flash' },
  wendy:  { name: 'Wendy',  role: 'Wellness Coach',         color: '#8B5CF6', defaultModel: 'claude-opus-4-5' },
};

function readJSON(filepath) {
  try { return JSON.parse(fs.readFileSync(filepath, 'utf8')); } catch { return null; }
}

function writeJSON(filename, data) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, filename);
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  return out;
}

// ═══ SKILLS ═══
function buildSkills() {
  const localDir = path.join(CLAWDBOT_DIR, 'skills');
  const globalDir = path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'clawdbot', 'skills');
  const skills = [];

  [{dir: localDir, source: 'local'}, {dir: globalDir, source: 'global'}].forEach(({dir, source}) => {
    try {
      fs.readdirSync(dir).forEach(name => {
        const mdPath = path.join(dir, name, 'SKILL.md');
        if (!fs.existsSync(mdPath)) return;
        const content = fs.readFileSync(mdPath, 'utf8');
        const lines = content.split('\n');

        // Extract description from first meaningful paragraph
        let desc = '';
        for (const line of lines) {
          if (line.startsWith('#') || line.trim() === '' || line.startsWith('---')) continue;
          desc = line.trim().substring(0, 200);
          break;
        }

        // Detect category from content
        let category = 'utility';
        const lc = content.toLowerCase();
        if (lc.includes('voice') || lc.includes('speech') || lc.includes('tts') || lc.includes('audio')) category = 'voice-audio';
        else if (lc.includes('twitter') || lc.includes('social') || lc.includes('x/twitter')) category = 'social';
        else if (lc.includes('design') || lc.includes('ui') || lc.includes('frontend') || lc.includes('canvas')) category = 'design';
        else if (lc.includes('coding') || lc.includes('github') || lc.includes('git ') || lc.includes('commit')) category = 'development';
        else if (lc.includes('research') || lc.includes('news') || lc.includes('search')) category = 'research';
        else if (lc.includes('market') || lc.includes('trading') || lc.includes('stock') || lc.includes('option')) category = 'finance';
        else if (lc.includes('notion') || lc.includes('slack') || lc.includes('mcp')) category = 'integration';
        else if (lc.includes('memory') || lc.includes('context')) category = 'memory';
        else if (lc.includes('music') || lc.includes('video') || lc.includes('remotion')) category = 'media';

        const stat = fs.statSync(mdPath);
        skills.push({
          name,
          source,
          category,
          description: desc,
          lastModified: stat.mtime.toISOString(),
          sizeBytes: stat.size,
        });
      });
    } catch {}
  });

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

// ═══ AGENT CONFIGS (for org chart, workspaces) ═══
function buildAgentConfigs() {
  const config = readJSON(path.join(CLAWDBOT_DIR, 'clawdbot.json'));
  const agentList = config?.agents?.list || [];
  const agents = [];

  for (const [agentId, meta] of Object.entries(AGENT_META)) {
    const cfgEntry = agentList.find(a => a.id === agentId) || {};
    const modelsFile = path.join(CLAWDBOT_DIR, 'agents', agentId, 'agent', 'models.json');
    const modelsData = readJSON(modelsFile);
    
    // Read workspace files
    const workspaceDir = path.join(
      agentId === 'milo' 
        ? 'C:/Users/derek/OneDrive/Desktop/MILO' 
        : 'C:/Users/derek/clawd-' + agentId
    );
    let hasSoul = false, hasMemory = false, hasTools = false;
    let soulExcerpt = '';
    try {
      const soulPath = path.join(workspaceDir, 'SOUL.md');
      if (fs.existsSync(soulPath)) {
        hasSoul = true;
        const soul = fs.readFileSync(soulPath, 'utf8');
        soulExcerpt = soul.substring(0, 300);
      }
      hasMemory = fs.existsSync(path.join(workspaceDir, 'MEMORY.md'));
      hasTools = fs.existsSync(path.join(workspaceDir, 'TOOLS.md'));
    } catch {}

    // Parse models
    const availableModels = [];
    if (modelsData?.providers) {
      for (const [provider, pData] of Object.entries(modelsData.providers)) {
        for (const model of (pData.models || [])) {
          availableModels.push({
            id: model.id,
            name: model.name,
            provider,
            contextWindow: model.contextWindow,
          });
        }
      }
    }

    const primaryModel = cfgEntry.model?.primary || meta.defaultModel;
    const fallbacks = cfgEntry.model?.fallbacks || [];

    agents.push({
      id: agentId,
      name: meta.name,
      role: meta.role,
      color: meta.color,
      primaryModel,
      fallbacks,
      availableModels,
      workspace: {
        path: workspaceDir,
        hasSoul,
        hasMemory,
        hasTools,
        soulExcerpt,
      },
      // Org chart
      reportsTo: agentId === 'milo' ? 'derek' : 'milo',
      department: getDepartment(agentId),
    });
  }

  return agents;
}

function getDepartment(agentId) {
  const depts = {
    milo: 'Executive', anders: 'Engineering', paula: 'Creative',
    bobby: 'Finance', dwight: 'Intelligence', tony: 'Operations',
    dax: 'Analytics', remy: 'Marketing', wendy: 'Wellness',
  };
  return depts[agentId] || 'General';
}

// ═══ ACTIVITY ═══
function buildActivity() {
  const activity = [];
  const projectDir = 'C:/Users/derek/OneDrive/Desktop/MILO/projects/dbtech45';

  // Git commits (last 7 days)
  try {
    const log = execSync(
      'git log --oneline --format="%H|%an|%ai|%s" --since="7 days ago" -50',
      { cwd: projectDir, encoding: 'utf8', timeout: 10000 }
    ).trim();
    
    log.split('\n').filter(Boolean).forEach(line => {
      const [hash, author, date, ...msgParts] = line.split('|');
      activity.push({
        type: 'commit',
        id: hash?.substring(0, 8),
        author: author?.trim(),
        timestamp: date?.trim(),
        message: msgParts.join('|').trim(),
      });
    });
  } catch {}

  // Cron runs (last 24h)
  const runsDir = path.join(CLAWDBOT_DIR, 'cron', 'runs');
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  try {
    fs.readdirSync(runsDir)
      .filter(f => f.endsWith('.jsonl'))
      .forEach(f => {
        const stat = fs.statSync(path.join(runsDir, f));
        if (stat.mtimeMs < oneDayAgo) return;
        try {
          const content = fs.readFileSync(path.join(runsDir, f), 'utf8');
          const firstLine = content.split('\n')[0];
          const data = JSON.parse(firstLine);
          activity.push({
            type: 'cron_run',
            id: f.replace('.jsonl', '').substring(0, 8),
            timestamp: stat.mtime.toISOString(),
            message: data.status ? 'Cron run: ' + (data.status || 'completed') : 'Cron execution',
            jobId: f.replace('.jsonl', ''),
          });
        } catch {}
      });
  } catch {}

  return activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
}

// ═══ REUSE OPS STATUS ═══
function buildOpsStatus() {
  // Import and run the existing sync
  const opsScript = path.join(__dirname, 'sync-ops-status.js');
  try {
    execSync('node ' + JSON.stringify(opsScript), { encoding: 'utf8', timeout: 15000 });
  } catch (e) {
    console.error('  [warn] ops-status sync error:', e.message?.substring(0, 100));
  }
}

// ═══ MAIN ═══
function main() {
  console.log('[sync-all-data] Starting full sync...');
  const t0 = Date.now();

  // 1. Ops status (delegates to existing script)
  console.log('  [1/4] Ops status...');
  buildOpsStatus();

  // 2. Skills
  console.log('  [2/4] Skills inventory...');
  const skills = buildSkills();
  writeJSON('skills.json', { skills, total: skills.length, generatedAt: new Date().toISOString() });
  console.log('    ' + skills.length + ' skills (' + skills.filter(s=>s.source==='local').length + ' local, ' + skills.filter(s=>s.source==='global').length + ' global)');

  // 3. Agent configs
  console.log('  [3/4] Agent configs...');
  const agentConfigs = buildAgentConfigs();
  writeJSON('agent-configs.json', { agents: agentConfigs, generatedAt: new Date().toISOString() });
  console.log('    ' + agentConfigs.length + ' agents configured');

  // 4. Activity
  console.log('  [4/4] Activity feed...');
  const activity = buildActivity();
  writeJSON('activity.json', { activity, generatedAt: new Date().toISOString() });
  console.log('    ' + activity.length + ' activity entries');

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('[sync-all-data] Done in ' + elapsed + 's');
}

main();
