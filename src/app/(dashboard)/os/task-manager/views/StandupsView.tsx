'use client';

import { useState } from 'react';

interface StandupDef {
  id: string;
  title: string;
  description: string;
  participants: string[];
  schedule: string;
  isRecurring: boolean;
}

interface StandupRun {
  id: string;
  standupId: string;
  date: string;
  status: 'completed' | 'running' | 'failed';
  summary: string;
  participants: string[];
  transcript: { agent: string; content: string; time: string }[];
  actionItems: { id: string; description: string; owner: string; status: 'pending' | 'done' }[];
  audioUrl?: string;
}

const STANDUP_DEFS: StandupDef[] = [
  { id: 'su-1', title: 'Morning Standup', description: 'Daily sync — status updates, blockers, priorities', participants: ['Derek', 'Milo', 'Anders', 'Bobby', 'Paula'], schedule: '0 7 * * *', isRecurring: true },
  { id: 'su-2', title: 'Weekly Strategy', description: 'Big picture review — project health, priorities, pivots', participants: ['Derek', 'Milo', 'Anders', 'Paula', 'Bobby', 'Tony'], schedule: '0 9 * * 1', isRecurring: true },
  { id: 'su-3', title: 'Tech Review', description: 'Architecture decisions, tech debt, deployment status', participants: ['Anders', 'Dwight', 'Milo'], schedule: '0 14 * * 3', isRecurring: true },
  { id: 'su-4', title: 'Content Pipeline', description: 'Newsletter status, content calendar, social strategy', participants: ['Paula', 'Remy', 'Dax', 'Milo'], schedule: '', isRecurring: false },
];

const STANDUP_RUNS: StandupRun[] = [
  {
    id: 'run-1', standupId: 'su-1', date: '2026-02-12T07:00:00Z', status: 'completed',
    summary: 'dbtech45 Morning Brief fully rebuilt per Paula spec. Newsletter + ThePit components deployed. Second Brain search fixed. Task Manager next.',
    participants: ['Derek', 'Milo', 'Anders', 'Bobby', 'Paula'],
    transcript: [
      { agent: 'Milo', content: 'Good morning. Let\'s sync up. Anders, you were heads-down on dbtech45 last night. Status?', time: '07:00' },
      { agent: 'Anders', content: 'Morning Brief rebuilt — full 6-section newspaper with sports, tech, local, AI sections. All live. Paula also handed off newsletter premium redesign and ThePit. Both deployed.', time: '07:01' },
      { agent: 'Paula', content: 'Confirmed. Newsletter cards look clean on prod. Signal & Noise and The Operator sign-up pages are live. Next handoff: The Team section redesign.', time: '07:02' },
      { agent: 'Bobby', content: 'Markets: SPY gapped up pre-market. VIX compressed to 14.2. No unusual flow yet. Watching NVDA and TSLA for earnings reaction. Will have the full brief at 9:30.', time: '07:03' },
      { agent: 'Milo', content: 'Good. Anders, Derek wants a Task Manager added to /os. Clearmud-style ops dashboard with sessions, model fleet, cron jobs. Big build.', time: '07:04' },
      { agent: 'Anders', content: 'Got it. Building now. Will have it live in the next hour.', time: '07:04' },
      { agent: 'Milo', content: 'Any blockers?', time: '07:05' },
      { agent: 'Anders', content: 'Second Brain had a search crash — filesystem paths don\'t exist on Vercel serverless. Fixed it with static fallback data. Clean now.', time: '07:05' },
      { agent: 'Milo', content: 'Noted. Action items: Anders ships Task Manager, Paula preps Team section, Bobby delivers market open brief. Let\'s move.', time: '07:06' },
    ],
    actionItems: [
      { id: 'ai-1', description: 'Build Task Manager page for /os', owner: 'Anders', status: 'done' },
      { id: 'ai-2', description: 'Prep The Team section redesign handoff', owner: 'Paula', status: 'pending' },
      { id: 'ai-3', description: 'Deliver market open brief at 9:30', owner: 'Bobby', status: 'done' },
      { id: 'ai-4', description: 'Fix Second Brain search on Vercel', owner: 'Anders', status: 'done' },
    ],
  },
  {
    id: 'run-2', standupId: 'su-1', date: '2026-02-11T07:00:00Z', status: 'completed',
    summary: 'dbtech45 homepage V2 shipped. Supabase backend created. Sports section rebuilt with ESPN API. Morning Brief multi-section expansion.',
    participants: ['Derek', 'Milo', 'Anders', 'Bobby', 'Paula'],
    transcript: [
      { agent: 'Milo', content: 'Yesterday was a build day. Anders, what shipped?', time: '07:00' },
      { agent: 'Anders', content: 'Big day. dbtech45 homepage V2 — killed 7 components, rebuilt cleaner. Supabase project live with 7 tables. Morning Brief expanded to 6 sections with layout, shared nav.', time: '07:01' },
      { agent: 'Paula', content: 'Sports section per my spec is live. ESPN API pulling real scores and standings. Boston teams highlighted. Looks good.', time: '07:02' },
      { agent: 'Bobby', content: 'Markets were choppy. SPY ended flat, VIX still compressed. CPI data tomorrow — that\'s the move.', time: '07:03' },
      { agent: 'Milo', content: 'Priorities today: Paula finish newsletter redesign. Anders deploy whatever Paula hands off. Bobby — CPI prep analysis.', time: '07:04' },
    ],
    actionItems: [
      { id: 'ai-5', description: 'Newsletter premium redesign', owner: 'Paula', status: 'done' },
      { id: 'ai-6', description: 'Deploy Paula handoffs', owner: 'Anders', status: 'done' },
      { id: 'ai-7', description: 'CPI prep analysis', owner: 'Bobby', status: 'done' },
    ],
  },
  {
    id: 'run-3', standupId: 'su-2', date: '2026-02-10T09:00:00Z', status: 'completed',
    summary: 'Weekly review: 5 projects active. dbtech45 OS dashboard nearing feature-complete. Sunday Squares needs launch push. Soul Solace stable.',
    participants: ['Derek', 'Milo', 'Anders', 'Paula', 'Bobby', 'Tony'],
    transcript: [
      { agent: 'Milo', content: 'Weekly strategy sync. Let\'s review project health across the board.', time: '09:00' },
      { agent: 'Anders', content: 'dbtech45: OS dashboard is getting feature-rich. Morning Brief, Markets, Projects, Kanban all live. Homepage redesign in progress.', time: '09:01' },
      { agent: 'Paula', content: 'Brand is consistent across dbtech45. Need to apply same treatment to Sunday Squares and Soul Solace.', time: '09:02' },
      { agent: 'Tony', content: 'Restaurant side: food costs stable. Chicken up 3% this week, beef flat. Nothing alarming.', time: '09:03' },
      { agent: 'Bobby', content: 'Markets: we\'re in a low-vol grind. SPY at all-time highs. I\'m watching for a VIX expansion event. Options flow is quiet.', time: '09:04' },
      { agent: 'Milo', content: 'Priorities this week: finish dbtech45 homepage. Push Sunday Squares to launch. Bobby prep for CPI/PPI data drops.', time: '09:05' },
    ],
    actionItems: [
      { id: 'ai-8', description: 'Finish dbtech45 homepage redesign', owner: 'Anders', status: 'done' },
      { id: 'ai-9', description: 'Sunday Squares launch prep', owner: 'Anders', status: 'pending' },
      { id: 'ai-10', description: 'CPI/PPI data prep', owner: 'Bobby', status: 'done' },
    ],
  },
  {
    id: 'run-4', standupId: 'su-3', date: '2026-02-05T14:00:00Z', status: 'completed',
    summary: 'Tech review: Soul Solace V2 Gemini API issues resolved. Vite env vars on Vercel fixed. All repos backed up.',
    participants: ['Anders', 'Dwight', 'Milo'],
    transcript: [
      { agent: 'Milo', content: 'Tech review. Any fires?', time: '14:00' },
      { agent: 'Anders', content: 'Soul Solace V2 had a Gemini API key expiry. New key set. Also found that googleSearch tool and structured output are incompatible — removed googleSearch. That was the root cause of prayers never loading.', time: '14:01' },
      { agent: 'Dwight', content: 'All workspaces backed up to GitHub. No credential leaks detected. Ran full scan at 2am — clean.', time: '14:02' },
      { agent: 'Anders', content: 'Also: Vite env vars on Vercel don\'t work with loadEnv() — it only reads .env files. Added process.env fallback.', time: '14:03' },
      { agent: 'Milo', content: 'Good catches. Document the Vite/Vercel env var gotcha somewhere so we don\'t hit it again.', time: '14:04' },
    ],
    actionItems: [
      { id: 'ai-11', description: 'Document Vite/Vercel env var behavior', owner: 'Anders', status: 'done' },
      { id: 'ai-12', description: 'Rotate Gemini API key in all projects', owner: 'Dwight', status: 'done' },
    ],
  },
];

const AGENT_COLORS: Record<string, string> = {
  Derek: '#F59E0B', Milo: '#3B82F6', Anders: '#8B5CF6', Bobby: '#EF4444',
  Paula: '#EC4899', Dwight: '#22C55E', Tony: '#10B981', Remy: '#F97316',
  Dax: '#06B6D4', Wendy: '#A855F7',
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function StandupsView() {
  const [selectedRun, setSelectedRun] = useState<StandupRun | null>(null);
  const [actionItems, setActionItems] = useState(STANDUP_RUNS.flatMap(r => r.actionItems));
  const [activeTab, setActiveTab] = useState<'runs' | 'definitions'>('runs');

  const toggleAction = (id: string) => {
    setActionItems(prev => prev.map(ai => ai.id === id ? { ...ai, status: ai.status === 'done' ? 'pending' : 'done' } : ai));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#71717A', fontSize: '0.875rem', margin: 0 }}>Multi-agent conversations, transcripts, and action items</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '1px solid #27272A' }}>
        {[
          { key: 'runs', label: 'Past Standups', count: STANDUP_RUNS.length },
          { key: 'definitions', label: 'Standup Definitions', count: STANDUP_DEFS.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === tab.key ? '2px solid #F59E0B' : '2px solid transparent',
            color: activeTab === tab.key ? '#F59E0B' : '#71717A',
            padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {tab.label}
            <span style={{ background: activeTab === tab.key ? '#F59E0B20' : '#27272A', color: activeTab === tab.key ? '#F59E0B' : '#71717A', padding: '0.125rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ─── Past Standups ─── */}
      {activeTab === 'runs' && (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
            {STANDUP_RUNS.map(run => {
              const def = STANDUP_DEFS.find(d => d.id === run.standupId);
              return (
                <div key={run.id} onClick={() => setSelectedRun(run)} style={{
                  background: selectedRun?.id === run.id ? '#1A1A1C' : '#111113',
                  border: `1px solid ${selectedRun?.id === run.id ? '#F59E0B40' : '#27272A'}`,
                  borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (selectedRun?.id !== run.id) e.currentTarget.style.borderColor = '#3F3F46'; }}
                onMouseLeave={e => { if (selectedRun?.id !== run.id) e.currentTarget.style.borderColor = '#27272A'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{def?.title || 'Standup'}</h3>
                      <p style={{ color: '#71717A', fontSize: '0.8rem', margin: '0.125rem 0 0' }}>{formatDate(run.date)}</p>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem',
                      background: run.status === 'completed' ? '#EF444415' : run.status === 'running' ? '#3B82F620' : '#22C55E15',
                      color: run.status === 'completed' ? '#EF4444' : run.status === 'running' ? '#3B82F6' : '#22C55E',
                    }}>
                      {run.status}
                    </span>
                  </div>

                  <p style={{ color: '#A1A1AA', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{run.summary}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {run.participants.map(p => (
                        <span key={p} style={{
                          width: 24, height: 24, borderRadius: '50%', fontSize: '0.6rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${AGENT_COLORS[p] || '#52525B'}30`, color: AGENT_COLORS[p] || '#52525B',
                        }}>
                          {p[0]}
                        </span>
                      ))}
                    </div>
                    <span style={{ color: '#52525B', fontSize: '0.75rem' }}>
                      {run.actionItems.filter(a => a.status === 'done').length}/{run.actionItems.length} done
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          {selectedRun && (
            <div style={{ width: 460, flexShrink: 0, background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.5rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ color: '#FAFAFA', fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                    {STANDUP_DEFS.find(d => d.id === selectedRun.standupId)?.title}
                  </h2>
                  <p style={{ color: '#71717A', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{formatDate(selectedRun.date)}</p>
                </div>
                <button onClick={() => setSelectedRun(null)} style={{ background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>

              {/* Transcript */}
              <h4 style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Transcript</h4>
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {selectedRun.transcript.map((msg, i) => (
                  <div key={i} style={{
                    background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem',
                    borderLeft: `3px solid ${AGENT_COLORS[msg.agent] || '#52525B'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ color: AGENT_COLORS[msg.agent] || '#A1A1AA', fontSize: '0.8rem', fontWeight: 600 }}>{msg.agent}</span>
                      <span style={{ color: '#3F3F46', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" }}>{msg.time}</span>
                    </div>
                    <p style={{ color: '#A1A1AA', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Action Items */}
              <h4 style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Action Items ({selectedRun.actionItems.filter(a => actionItems.find(ai => ai.id === a.id)?.status === 'done').length}/{selectedRun.actionItems.length})
              </h4>
              <div style={{ display: 'grid', gap: '0.375rem' }}>
                {selectedRun.actionItems.map(item => {
                  const current = actionItems.find(ai => ai.id === item.id) || item;
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem',
                      opacity: current.status === 'done' ? 0.6 : 1,
                    }}>
                      <button
                        onClick={() => toggleAction(item.id)}
                        style={{
                          width: 20, height: 20, borderRadius: '4px', flexShrink: 0, marginTop: 2,
                          background: current.status === 'done' ? '#EF4444' : 'transparent',
                          border: `2px solid ${current.status === 'done' ? '#EF4444' : '#3F3F46'}`,
                          color: '#FFF', fontSize: '0.7rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {current.status === 'done' ? '✓' : ''}
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#FAFAFA', fontSize: '0.8rem', margin: 0, textDecoration: current.status === 'done' ? 'line-through' : 'none' }}>
                          {item.description}
                        </p>
                        <span style={{ color: AGENT_COLORS[item.owner] || '#52525B', fontSize: '0.7rem' }}>{item.owner}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Definitions Tab ─── */}
      {activeTab === 'definitions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {STANDUP_DEFS.map(def => (
            <div key={def.id} style={{ background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{def.title}</h3>
                <span style={{
                  padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem',
                  background: def.isRecurring ? '#3B82F620' : '#27272A',
                  color: def.isRecurring ? '#3B82F6' : '#71717A',
                }}>
                  {def.isRecurring ? def.schedule : 'Manual'}
                </span>
              </div>
              <p style={{ color: '#A1A1AA', fontSize: '0.8rem', marginBottom: '1rem' }}>{def.description}</p>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {def.participants.map(p => (
                  <span key={p} style={{
                    padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem',
                    background: `${AGENT_COLORS[p] || '#52525B'}15`, color: AGENT_COLORS[p] || '#52525B',
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Add New */}
          <div style={{
            background: '#111113', border: '2px dashed #27272A', borderRadius: '12px', padding: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}
          >
            <span style={{ fontSize: '2rem', color: '#52525B', marginBottom: '0.5rem' }}>+</span>
            <span style={{ color: '#52525B', fontSize: '0.85rem' }}>Create New Standup</span>
          </div>
        </div>
      )}
    </div>
  );
}

