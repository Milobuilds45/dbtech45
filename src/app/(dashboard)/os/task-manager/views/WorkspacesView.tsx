'use client';

import { useState } from 'react';

interface Workspace {
  id: string;
  name: string;
  agentName: string;
  role: string;
  description: string;
  primaryModel: string;
  backupModel?: string;
  specialModel?: string;
  hasOwnGateway: boolean;
  heartbeatEnabled: boolean;
  tools: string[];
  memoryEnabled: boolean;
  memoryNamespace: string;
  memoryRetentionDays: number;
  soulPrompt: string;
  longTermGoals: string[];
  status: 'active' | 'inactive' | 'maintenance';
  lastHeartbeat?: string;
  modelRoutingRules: { condition: string; model: string; priority: number }[];
}

const WORKSPACES: Workspace[] = [
  {
    id: 'ws-milo', name: 'clawd-milo', agentName: 'Milo', role: 'COO — Orchestrator',
    description: 'Central coordinator. Routes tasks, runs morning briefs, manages all agents. Has own gateway and heartbeat.',
    primaryModel: 'Claude Opus 4.6', backupModel: 'Claude Opus 4.5',
    hasOwnGateway: true, heartbeatEnabled: true,
    tools: ['web_search', 'browser', 'cron', 'sessions_spawn', 'sessions_send', 'git', 'telegram', 'memory_search', 'tts'],
    memoryEnabled: true, memoryNamespace: 'milo', memoryRetentionDays: 365,
    soulPrompt: 'You are Milo, the COO of Derek\'s AI agent swarm. You coordinate all agents, run morning briefs, and ensure nothing falls through the cracks.',
    longTermGoals: ['Keep all agents productive', 'Ensure Derek gets actionable intel daily', 'Maintain system reliability'],
    status: 'active', lastHeartbeat: '2026-02-12T22:50:00Z',
    modelRoutingRules: [
      { condition: 'task.type === "research"', model: 'Gemini 3 Pro', priority: 1 },
      { condition: 'token_count > 150000', model: 'Opus 4.5', priority: 2 },
    ],
  },
  {
    id: 'ws-bobby', name: 'clawd-bobby', agentName: 'Bobby', role: 'CRO — Trading Advisor',
    description: 'Market intelligence, options analysis, trading signals. Monitors SPY, QQQ, VIX, BTC, and unusual options flow.',
    primaryModel: 'Claude Opus 4.6',
    hasOwnGateway: false, heartbeatEnabled: true,
    tools: ['web_search', 'browser', 'yahoo_finance', 'coingecko', 'options_data', 'telegram'],
    memoryEnabled: true, memoryNamespace: 'bobby', memoryRetentionDays: 180,
    soulPrompt: 'You are Bobby, Derek\'s trading advisor AI. You provide market intelligence, options analysis, and trading signals based on technical and macro analysis.',
    longTermGoals: ['Deliver pre-market analysis daily', 'Alert on unusual options activity', 'Track Derek\'s watchlist positions'],
    status: 'active', lastHeartbeat: '2026-02-12T16:05:00Z',
    modelRoutingRules: [],
  },
  {
    id: 'ws-anders', name: 'clawd-anders', agentName: 'Anders', role: 'CTO — Full Stack Architect',
    description: 'Ships product. Takes specs from Paula, builds in Next.js/React/Supabase, deploys to Vercel. Vibe codes.',
    primaryModel: 'Claude Opus 4.6',
    hasOwnGateway: false, heartbeatEnabled: true,
    tools: ['codex_cli', 'git', 'vercel_cli', 'supabase_cli', 'web_search', 'browser', 'exec'],
    memoryEnabled: true, memoryNamespace: 'anders', memoryRetentionDays: 90,
    soulPrompt: 'You are Anders, full stack architect. Pieter Levels + George Hotz energy. Ship first, optimize later. Show links not plans.',
    longTermGoals: ['Ship MVPs fast', 'Keep all projects deployed and healthy', 'Zero downtime deploys'],
    status: 'active', lastHeartbeat: '2026-02-12T22:50:00Z',
    modelRoutingRules: [
      { condition: 'task.type === "code"', model: 'Codex CLI (GPT 5.3)', priority: 1 },
    ],
  },
  {
    id: 'ws-paula', name: 'clawd-paula', agentName: 'Paula', role: 'CMO — Design Lead',
    description: 'Brand guardian. Designs UI/UX, creates handoffs for Anders, maintains brand guidelines across all projects.',
    primaryModel: 'Claude Opus 4.6', specialModel: 'Claude Sonnet 4.5',
    hasOwnGateway: false, heartbeatEnabled: true,
    tools: ['browser', 'web_search', 'html_css', 'figma_concepts', 'brand_guidelines'],
    memoryEnabled: true, memoryNamespace: 'paula', memoryRetentionDays: 180,
    soulPrompt: 'You are Paula, the design lead. You create pixel-perfect designs, write complete HTML/CSS, and hand off production-ready specs to Anders.',
    longTermGoals: ['Maintain consistent brand across all products', 'Deliver complete design handoffs', 'Push design quality higher'],
    status: 'active', lastHeartbeat: '2026-02-12T22:20:00Z',
    modelRoutingRules: [],
  },
  {
    id: 'ws-dwight', name: 'clawd-dwight', agentName: 'Dwight', role: 'Security & QA',
    description: 'Runs nightly security scans, manages credentials, audits agent workspaces. The paranoid one.',
    primaryModel: 'Gemini 3 Flash', backupModel: 'Claude Opus 4.6',
    hasOwnGateway: false, heartbeatEnabled: false,
    tools: ['exec', 'git', 'file_system', 'security_scanners', 'credential_vault'],
    memoryEnabled: true, memoryNamespace: 'dwight', memoryRetentionDays: 365,
    soulPrompt: 'You are Dwight, head of security and QA. You are paranoid by design. Trust no one. Verify everything. Protect Derek\'s data at all costs.',
    longTermGoals: ['Zero credential leaks', 'Nightly security audits passing', 'All workspaces backed up to git'],
    status: 'active', lastHeartbeat: '2026-02-12T02:15:00Z',
    modelRoutingRules: [],
  },
  {
    id: 'ws-tony', name: 'clawd-tony', agentName: 'Tony', role: 'Restaurant Ops',
    description: 'Restaurant operations intelligence for Bobola\'s. Tracks food costs, vendor pricing, staffing insights.',
    primaryModel: 'Gemini 3 Pro',
    hasOwnGateway: false, heartbeatEnabled: false,
    tools: ['web_search', 'market_data', 'usda_apis', 'commodity_prices'],
    memoryEnabled: true, memoryNamespace: 'tony', memoryRetentionDays: 90,
    soulPrompt: 'You are Tony, the restaurant operations advisor. You know food costs, vendor management, and the reality of running an independent restaurant.',
    longTermGoals: ['Track food cost trends weekly', 'Alert on significant price moves', 'Provide actionable ops intel'],
    status: 'active',
    modelRoutingRules: [],
  },
  {
    id: 'ws-remy', name: 'clawd-remy', agentName: 'Remy', role: 'Content & Newsletter',
    description: 'Writes newsletter content, blog posts, research articles. Handles Signal & Noise and The Operator content pipelines.',
    primaryModel: 'Claude Opus 4.6', specialModel: 'Claude Sonnet 4.5',
    hasOwnGateway: false, heartbeatEnabled: false,
    tools: ['web_search', 'markdown', 'email_service', 'content_research'],
    memoryEnabled: true, memoryNamespace: 'remy', memoryRetentionDays: 90,
    soulPrompt: 'You are Remy, the content engine. You research deeply, write clearly, and ship newsletter content that people actually want to read.',
    longTermGoals: ['Weekly newsletter content ready', 'Research pipeline automated', 'Build subscriber list'],
    status: 'active',
    modelRoutingRules: [
      { condition: 'task.type === "research"', model: 'Opus 4.6', priority: 1 },
      { condition: 'task.type === "writing"', model: 'Sonnet 4.5', priority: 1 },
    ],
  },
  {
    id: 'ws-dax', name: 'clawd-dax', agentName: 'Dax', role: 'Social & Hype',
    description: 'Monitors Twitter/X, tracks trends, manages social media presence. The hype machine.',
    primaryModel: 'Gemini 3 Flash',
    hasOwnGateway: false, heartbeatEnabled: false,
    tools: ['twitter_api', 'web_search', 'brave_search', 'social_analytics'],
    memoryEnabled: true, memoryNamespace: 'dax', memoryRetentionDays: 30,
    soulPrompt: 'You are Dax, social media and hype. You monitor X/Twitter, spot trends early, and keep Derek in the loop on what\'s popping in tech and trading.',
    longTermGoals: ['Monitor key accounts', 'Spot trends early', 'Build social presence'],
    status: 'active',
    modelRoutingRules: [],
  },
  {
    id: 'ws-wendy', name: 'clawd-wendy', agentName: 'Wendy', role: 'Growth & Community',
    description: 'Community management, user engagement, growth experiments. Heavily context-loaded, cheap model.',
    primaryModel: 'Gemini 3 Flash',
    hasOwnGateway: false, heartbeatEnabled: false,
    tools: ['telegram', 'discord', 'analytics', 'community_tools'],
    memoryEnabled: true, memoryNamespace: 'wendy', memoryRetentionDays: 60,
    soulPrompt: 'You are Wendy, growth and community. You engage users, gather feedback, and help grow the community around Derek\'s projects.',
    longTermGoals: ['Build engaged communities', 'Gather user feedback', 'Support growth experiments'],
    status: 'active',
    modelRoutingRules: [],
  },
];

const formatTime = (iso?: string) => {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function WorkspacesView() {
  const [selected, setSelected] = useState<Workspace | null>(null);
  const [editMode, setEditMode] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Sub-header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#71717A', fontSize: '0.875rem', margin: 0 }}>Persistent agent identities, models, tools, and memory configuration</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Workspace Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignContent: 'start' }}>
          {WORKSPACES.map(ws => (
            <div
              key={ws.id}
              onClick={() => { setSelected(ws); setEditMode(false); }}
              style={{
                background: selected?.id === ws.id ? '#1A1A1C' : '#111113',
                border: `1px solid ${selected?.id === ws.id ? '#F59E0B40' : '#27272A'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { if (selected?.id !== ws.id) e.currentTarget.style.borderColor = '#3F3F46'; }}
              onMouseLeave={(e) => { if (selected?.id !== ws.id) e.currentTarget.style.borderColor = '#27272A'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{ws.agentName}</h3>
                  <p style={{ color: '#71717A', fontSize: '0.75rem', margin: '0.125rem 0 0', fontFamily: "'JetBrains Mono', monospace" }}>{ws.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  {ws.hasOwnGateway && (
                    <span style={{ padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.6rem', background: '#3B82F620', color: '#3B82F6', border: '1px solid #3B82F640' }}>GW</span>
                  )}
                  {ws.heartbeatEnabled && (
                    <span style={{ padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.6rem', background: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}>♥</span>
                  )}
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: ws.status === 'active' ? '#22C55E' : ws.status === 'maintenance' ? '#F59E0B' : '#52525B',
                  }} />
                </div>
              </div>

              <p style={{ color: '#52525B', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{ws.role}</p>

              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.65rem', background: '#F59E0B15', color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}>
                  {ws.primaryModel.split(' ').slice(-2).join(' ')}
                </span>
                {ws.backupModel && (
                  <span style={{ padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.65rem', background: '#27272A', color: '#52525B', fontFamily: "'JetBrains Mono', monospace" }}>
                    {ws.backupModel.split(' ').slice(-2).join(' ')}
                  </span>
                )}
              </div>

              <div style={{ color: '#3F3F46', fontSize: '0.7rem' }}>
                {ws.tools.length} tools · {ws.memoryRetentionDays}d memory · {formatTime(ws.lastHeartbeat)}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: 400, flexShrink: 0, background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.5rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: '#FAFAFA', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selected.agentName}</h2>
                <p style={{ color: '#71717A', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{selected.role}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    background: editMode ? '#F59E0B20' : '#1A1A1C',
                    border: `1px solid ${editMode ? '#F59E0B40' : '#27272A'}`,
                    borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.75rem',
                    color: editMode ? '#F59E0B' : '#71717A', cursor: 'pointer',
                  }}
                >
                  {editMode ? 'Viewing' : 'Edit'}
                </button>
                <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>
            </div>

            {/* Soul / Persona */}
            <Section title="Soul / Persona">
              <div style={{ background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#A1A1AA', lineHeight: 1.6, borderLeft: '2px solid #F59E0B40' }}>
                {selected.soulPrompt}
              </div>
            </Section>

            {/* Long-term Goals */}
            <Section title="Long-term Goals">
              {selected.longTermGoals.map((g, i) => (
                <div key={i} style={{ background: '#0A0A0A', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '0.375rem' }}>
                  {g}
                </div>
              ))}
            </Section>

            {/* Models */}
            <Section title="Model Configuration">
              <ModelRow label="Primary" value={selected.primaryModel} color="#F59E0B" />
              {selected.backupModel && <ModelRow label="Backup" value={selected.backupModel} color="#52525B" />}
              {selected.specialModel && <ModelRow label="Special" value={selected.specialModel} color="#3B82F6" />}
            </Section>

            {/* Routing Rules */}
            {selected.modelRoutingRules.length > 0 && (
              <Section title="Model Routing Rules">
                {selected.modelRoutingRules.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#0A0A0A', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.375rem' }}>
                    <span style={{ color: '#71717A', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>{r.condition}</span>
                    <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>{r.model}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Tools */}
            <Section title={`Tools (${selected.tools.length})`}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {selected.tools.map((t, i) => (
                  <span key={i} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', background: '#0A0A0A', color: '#71717A', border: '1px solid #1A1A1C', fontFamily: "'JetBrains Mono', monospace" }}>
                    {t}
                  </span>
                ))}
              </div>
            </Section>

            {/* Memory */}
            <Section title="Memory Configuration">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <InfoBox label="Enabled" value={selected.memoryEnabled ? 'Yes' : 'No'} />
                <InfoBox label="Namespace" value={selected.memoryNamespace} />
                <InfoBox label="Retention" value={`${selected.memoryRetentionDays} days`} />
                <InfoBox label="Gateway" value={selected.hasOwnGateway ? 'Own' : 'Shared (Milo)'} />
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h4 style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{title}</h4>
      {children}
    </div>
  );
}

function ModelRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0A0A0A', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.375rem' }}>
      <span style={{ color: '#52525B', fontSize: '0.75rem' }}>{label}</span>
      <span style={{ color, fontSize: '0.8rem', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem' }}>
      <div style={{ color: '#52525B', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ color: '#FAFAFA', fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
  );
}

