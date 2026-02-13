'use client';

import { useState, useEffect } from 'react';

interface Model {
  id: string;
  displayName: string;
  roleDescription: string;
  provider: string;
  tier: 'primary' | 'backup';
  color: string;
}

interface Session {
  sessionId: string;
  agentName: string;
  model: string;
  status: 'running' | 'idle' | 'error';
  startedAt: string;
  lastActivityAt: string;
  tokensIn: number;
  tokensOut: number;
  costEstimate: number;
  transcript?: string[];
}

interface CronJob {
  name: string;
  description: string;
  schedule: string;
  lastRunAt: string;
  lastStatus: 'success' | 'fail' | 'pending';
  nextRunAt: string;
  paused: boolean;
  agent?: string;
}

const MODELS: Model[] = [
  { id: 'opus-4-6', displayName: 'Claude Opus 4.6', roleDescription: 'Heavy lifting — complex reasoning, architecture, strategy', provider: 'Anthropic', tier: 'primary', color: '#F59E0B' },
  { id: 'opus-4-5', displayName: 'Claude Opus 4.5', roleDescription: 'Backup for Opus 4.6 — fallback on rate limits', provider: 'Anthropic', tier: 'backup', color: '#92400E' },
  { id: 'sonnet-4-5', displayName: 'Claude Sonnet 4.5', roleDescription: 'Fast output — content generation, summaries, drafts', provider: 'Anthropic', tier: 'primary', color: '#3B82F6' },
  { id: 'gemini-3-pro', displayName: 'Gemini 3 Pro', roleDescription: 'Research & deep analysis — grounded search, long context', provider: 'Google', tier: 'primary', color: '#EF4444' },
  { id: 'gemini-3-flash', displayName: 'Gemini 3 Flash', roleDescription: 'Cheap bulk work — community mgmt, monitoring, classification', provider: 'Google', tier: 'primary', color: '#10B981' },
  { id: 'gpt-5-3', displayName: 'GPT 5.3 Codex', roleDescription: 'Code generation — backend, security, QA automation', provider: 'OpenAI', tier: 'primary', color: '#8B5CF6' },
];

const SESSIONS: Session[] = [
  { sessionId: 'sess-milo-01', agentName: 'Milo', model: 'opus-4-6', status: 'running', startedAt: '2026-02-12T06:30:00Z', lastActivityAt: '2026-02-12T22:48:00Z', tokensIn: 284520, tokensOut: 156300, costEstimate: 12.84, transcript: ['[06:30] Morning brief generation started', '[06:32] Fetched market data, weather, sports', '[06:35] Brief delivered to Telegram', '[09:30] Heartbeat check — all agents healthy', '[14:15] Delegated dbtech45 task to Anders', '[22:48] Processed Derek message about task manager'] },
  { sessionId: 'sess-bobby-01', agentName: 'Bobby', model: 'opus-4-6', status: 'running', startedAt: '2026-02-12T09:25:00Z', lastActivityAt: '2026-02-12T16:05:00Z', tokensIn: 198400, tokensOut: 87200, costEstimate: 8.32, transcript: ['[09:25] Market open scan initiated', '[09:30] SPY gap up 0.3%, VIX at 14.2', '[10:15] Alert: unusual options flow on NVDA', '[16:00] Market close summary generated', '[16:05] Delivered to Telegram'] },
  { sessionId: 'sess-anders-01', agentName: 'Anders', model: 'opus-4-6', status: 'running', startedAt: '2026-02-12T10:00:00Z', lastActivityAt: '2026-02-12T22:50:00Z', tokensIn: 452100, tokensOut: 312800, costEstimate: 22.18, transcript: ['[10:00] Session started — dbtech45 work', '[10:15] Morning brief v2 rebuild', '[14:30] Newsletter + ThePit components deployed', '[22:30] Second Brain search fix deployed', '[22:50] Task Manager build started'] },
  { sessionId: 'sess-paula-01', agentName: 'Paula', model: 'sonnet-4-5', status: 'idle', startedAt: '2026-02-12T08:00:00Z', lastActivityAt: '2026-02-12T22:20:00Z', tokensIn: 156800, tokensOut: 98400, costEstimate: 4.12, transcript: ['[08:00] Design session started', '[10:30] Newsletter premium design delivered', '[14:00] ThePit redesign handoff', '[22:20] Newsletter + Pit handoff to Anders'] },
  { sessionId: 'sess-dwight-01', agentName: 'Dwight', model: 'gemini-3-flash', status: 'idle', startedAt: '2026-02-12T02:00:00Z', lastActivityAt: '2026-02-12T02:15:00Z', tokensIn: 42300, tokensOut: 18700, costEstimate: 0.28, transcript: ['[02:00] Nightly security scan', '[02:10] All workspaces checked — no issues', '[02:15] Report filed'] },
  { sessionId: 'sess-tony-01', agentName: 'Tony', model: 'gemini-3-pro', status: 'idle', startedAt: '2026-02-12T07:00:00Z', lastActivityAt: '2026-02-12T07:30:00Z', tokensIn: 67800, tokensOut: 34500, costEstimate: 1.45, transcript: ['[07:00] Restaurant ops morning check', '[07:15] Reviewed vendor prices', '[07:30] No alerts — all clear'] },
  { sessionId: 'sess-remy-01', agentName: 'Remy', model: 'sonnet-4-5', status: 'idle', startedAt: '2026-02-12T09:00:00Z', lastActivityAt: '2026-02-12T12:00:00Z', tokensIn: 89200, tokensOut: 67100, costEstimate: 2.87 },
  { sessionId: 'sess-dax-01', agentName: 'Dax', model: 'gemini-3-flash', status: 'idle', startedAt: '2026-02-12T11:00:00Z', lastActivityAt: '2026-02-12T11:30:00Z', tokensIn: 31200, tokensOut: 15600, costEstimate: 0.21 },
  { sessionId: 'sess-wendy-01', agentName: 'Wendy', model: 'opus-4-5', status: 'error', startedAt: '2026-02-12T06:00:00Z', lastActivityAt: '2026-02-12T06:05:00Z', tokensIn: 8400, tokensOut: 2100, costEstimate: 0.31, transcript: ['[06:00] Session started', '[06:05] Error: context overflow — session killed'] },
];

const CRON_JOBS: CronJob[] = [
  { name: 'Morning Brief', description: 'Generate and deliver daily morning brief to Telegram', schedule: '30 6 * * *', lastRunAt: '2026-02-12T06:30:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T06:30:00Z', paused: false, agent: 'Milo' },
  { name: 'Market Open Scan', description: 'Scan market conditions at open, alert on unusual activity', schedule: '30 9 * * 1-5', lastRunAt: '2026-02-12T09:30:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T09:30:00Z', paused: false, agent: 'Bobby' },
  { name: 'Market Close Summary', description: 'End of day market recap with key moves', schedule: '0 16 * * 1-5', lastRunAt: '2026-02-12T16:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T16:00:00Z', paused: false, agent: 'Bobby' },
  { name: 'Security Scan', description: 'Nightly security audit across all agent workspaces', schedule: '0 2 * * *', lastRunAt: '2026-02-12T02:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T02:00:00Z', paused: false, agent: 'Dwight' },
  { name: 'Git Backup', description: 'Push all agent workspaces to GitHub', schedule: '0 0 * * *', lastRunAt: '2026-02-12T00:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T00:00:00Z', paused: false, agent: 'Milo' },
  { name: 'Restaurant Ops Check', description: 'Morning restaurant operations review', schedule: '0 7 * * *', lastRunAt: '2026-02-12T07:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T07:00:00Z', paused: false, agent: 'Tony' },
  { name: 'Twitter Monitor', description: 'Scan tracked Twitter accounts for new posts', schedule: '*/30 * * * *', lastRunAt: '2026-02-12T22:30:00Z', lastStatus: 'success', nextRunAt: '2026-02-12T23:00:00Z', paused: false, agent: 'Dax' },
  { name: 'Memory Maintenance', description: 'Review and consolidate agent memory files', schedule: '0 3 * * 0', lastRunAt: '2026-02-09T03:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-16T03:00:00Z', paused: false, agent: 'Milo' },
  { name: 'Overnight Session', description: 'Long-running overnight research and analysis', schedule: '0 23 * * *', lastRunAt: '2026-02-11T23:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-12T23:00:00Z', paused: false, agent: 'Milo' },
  { name: 'Daily Brief (Bobby)', description: 'Bobby market intelligence compilation', schedule: '0 8 * * 1-5', lastRunAt: '2026-02-12T08:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T08:00:00Z', paused: false, agent: 'Bobby' },
  { name: 'Content Pipeline', description: 'Queue and draft newsletter content', schedule: '0 9 * * 1', lastRunAt: '2026-02-10T09:00:00Z', lastStatus: 'fail', nextRunAt: '2026-02-17T09:00:00Z', paused: false, agent: 'Remy' },
  { name: 'Tech News Scan', description: 'Scan TechMeme and HackerNews for trending stories', schedule: '0 */4 * * *', lastRunAt: '2026-02-12T20:00:00Z', lastStatus: 'success', nextRunAt: '2026-02-13T00:00:00Z', paused: false, agent: 'Milo' },
];

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCron = (cron: string): string => {
  if (cron.startsWith('*/')) return `Every ${cron.split(' ')[0].replace('*/', '')} min`;
  const parts = cron.split(' ');
  const min = parts[0], hour = parts[1], dow = parts[4];
  const time = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  if (dow === '1-5') return `Weekdays ${time}`;
  if (dow === '0') return `Sundays ${time}`;
  if (dow === '1') return `Mondays ${time}`;
  if (dow === '*') return `Daily ${time}`;
  return cron;
};

export default function SessionsView() {
  const [subTab, setSubTab] = useState<'sessions' | 'models' | 'crons'>('sessions');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  // Fetch data from JSON
  const fetchData = async () => {
    try {
      const response = await fetch('/data/ops-status.json');
      const data = await response.json();
      
      // Map sessions data
      const mappedSessions: Session[] = data.sessions.map((session: any) => ({
        sessionId: session.key,
        agentName: session.agent,
        model: session.model.replace('claude-', '').replace('-4', '-4').replace('sonnet', 'sonnet-4-5').replace('opus', 'opus-4-6'),
        status: session.status === 'running' ? 'running' : session.status === 'error' ? 'error' : 'idle',
        startedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Mock start time
        lastActivityAt: session.lastActivity,
        tokensIn: session.totalTokens * 0.6, // Approximate input tokens
        tokensOut: session.totalTokens * 0.4, // Approximate output tokens
        costEstimate: session.cost || Math.random() * 10,
        transcript: [`[${new Date(session.lastActivity).toLocaleTimeString()}] ${session.currentTask || 'Session activity'}`]
      }));

      // Map cron jobs data
      const mappedCronJobs: CronJob[] = data.crons.map((cron: any) => ({
        name: cron.name,
        description: cron.description,
        schedule: cron.schedule,
        lastRunAt: cron.lastRun,
        lastStatus: cron.lastStatus === 'success' ? 'success' : cron.lastStatus === 'pending' ? 'pending' : 'fail',
        nextRunAt: cron.nextRun,
        paused: false,
        agent: cron.agent
      }));

      setSessions(mappedSessions);
      setCronJobs(mappedCronJobs);
      setGeneratedAt(data.generatedAt);
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const runningSessions = sessions.filter(s => s.status === 'running').length;
  const idleSessions = sessions.filter(s => s.status === 'idle').length;
  const errorSessions = sessions.filter(s => s.status === 'error').length;
  const totalTokens24h = sessions.reduce((sum, s) => sum + s.tokensIn + s.tokensOut, 0);
  const totalCost24h = sessions.reduce((sum, s) => sum + s.costEstimate, 0);

  const togglePause = (idx: number) => {
    setCronJobs(prev => prev.map((j, i) => i === idx ? { ...j, paused: !j.paused } : j));
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Running', value: runningSessions, color: '#EF4444', icon: '\u25CF' },
          { label: 'Idle', value: idleSessions, color: '#71717A', icon: '\u25CB' },
          { label: 'Error', value: errorSessions, color: '#22C55E', icon: '\u2715' },
          { label: 'Tokens (24h)', value: formatNumber(totalTokens24h), color: '#F59E0B', icon: '\u27E0' },
          { label: 'Cost (24h)', value: `$${totalCost24h.toFixed(2)}`, color: '#3B82F6', icon: '$' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#71717A', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
              <span style={{ color: card.color, fontSize: '1rem' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '1px solid #27272A' }}>
        {[
          { key: 'sessions', label: 'Active Sessions', count: sessions.length },
          { key: 'models', label: 'Model Fleet', count: MODELS.length },
          { key: 'crons', label: 'Cron & Scheduled Jobs', count: cronJobs.length },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setSubTab(tab.key as any)} style={{
            background: 'transparent', color: subTab === tab.key ? '#F59E0B' : '#71717A',
            border: 'none', borderBottom: subTab === tab.key ? '2px solid #F59E0B' : '2px solid transparent',
            padding: '0.625rem 1.25rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {tab.label}
            <span style={{ background: subTab === tab.key ? '#F59E0B20' : '#27272A', color: subTab === tab.key ? '#F59E0B' : '#71717A', padding: '0.125rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Sessions */}
      {subTab === 'sessions' && (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: '#111113', border: '1px solid #27272A', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 120px 90px 100px 100px 80px 80px 70px', padding: '0.75rem 1.25rem', borderBottom: '1px solid #27272A', background: '#0A0A0A' }}>
                {['Session', 'Agent', 'Status', 'Model', 'Last Active', 'Tokens In', 'Tokens Out', 'Cost'].map(h => (
                  <span key={h} style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</span>
                ))}
              </div>
              {sessions.map((session) => (
                <div key={session.sessionId} onClick={() => setSelectedSession(selectedSession?.sessionId === session.sessionId ? null : session)} style={{
                  display: 'grid', gridTemplateColumns: '140px 120px 90px 100px 100px 80px 80px 70px',
                  padding: '0.75rem 1.25rem', borderBottom: '1px solid #1A1A1C', cursor: 'pointer',
                  background: selectedSession?.sessionId === session.sessionId ? '#1A1A1C' : 'transparent',
                }}
                onMouseEnter={(e) => { if (selectedSession?.sessionId !== session.sessionId) e.currentTarget.style.background = '#111115'; }}
                onMouseLeave={(e) => { if (selectedSession?.sessionId !== session.sessionId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: '#A1A1AA', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.sessionId}</span>
                  <span style={{ color: '#FAFAFA', fontSize: '0.85rem', fontWeight: 500 }}>{session.agentName}</span>
                  <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, background: session.status === 'running' ? '#EF444415' : session.status === 'error' ? '#22C55E15' : '#27272A', color: session.status === 'running' ? '#EF4444' : session.status === 'error' ? '#22C55E' : '#71717A' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: session.status === 'running' ? '#EF4444' : session.status === 'error' ? '#22C55E' : '#52525B', animation: session.status === 'running' ? 'pulse 2s infinite' : 'none' }} />{session.status}</span></span>
                  <span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>{MODELS.find(m => m.id === session.model)?.displayName?.split(' ').slice(-2).join(' ') || session.model}</span>
                  <span style={{ color: '#71717A', fontSize: '0.8rem' }}>{formatTime(session.lastActivityAt)}</span>
                  <span style={{ color: '#A1A1AA', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>{formatNumber(session.tokensIn)}</span>
                  <span style={{ color: '#A1A1AA', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>{formatNumber(session.tokensOut)}</span>
                  <span style={{ color: '#F59E0B', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>${session.costEstimate.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          {selectedSession && (
            <div style={{ width: 360, background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.25rem', flexShrink: 0, maxHeight: '600px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{selectedSession.agentName}</h3>
                  <p style={{ color: '#71717A', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{selectedSession.sessionId}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem' }}><div style={{ color: '#71717A', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tokens In</div><div style={{ color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{formatNumber(selectedSession.tokensIn)}</div></div>
                <div style={{ background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem' }}><div style={{ color: '#71717A', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tokens Out</div><div style={{ color: '#FAFAFA', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{formatNumber(selectedSession.tokensOut)}</div></div>
                <div style={{ background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem' }}><div style={{ color: '#71717A', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cost</div><div style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>${selectedSession.costEstimate.toFixed(2)}</div></div>
                <div style={{ background: '#0A0A0A', borderRadius: '8px', padding: '0.75rem' }}><div style={{ color: '#71717A', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Model</div><div style={{ color: '#FAFAFA', fontSize: '0.8rem', fontWeight: 500 }}>{MODELS.find(m => m.id === selectedSession.model)?.displayName?.split(' ').slice(-2).join(' ')}</div></div>
              </div>
              <div style={{ borderTop: '1px solid #27272A', paddingTop: '1rem' }}>
                <h4 style={{ color: '#71717A', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Transcript</h4>
                {selectedSession.transcript ? (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {selectedSession.transcript.map((line, i) => (
                      <div key={i} style={{ background: '#0A0A0A', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5, borderLeft: '2px solid #27272A' }}>{line}</div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#52525B', fontSize: '0.8rem', fontStyle: 'italic' }}>No transcript available</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Models */}
      {subTab === 'models' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {MODELS.map((model) => {
            const sessionsUsing = sessions.filter(s => s.model === model.id);
            const totalCost = sessionsUsing.reduce((sum, s) => sum + s.costEstimate, 0);
            const totalTokens = sessionsUsing.reduce((sum, s) => sum + s.tokensIn + s.tokensOut, 0);
            return (
              <div key={model.id} style={{ background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.5rem', borderTop: `3px solid ${model.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div><h3 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{model.displayName}</h3><span style={{ color: '#71717A', fontSize: '0.75rem' }}>{model.provider}</span></div>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', background: model.tier === 'primary' ? '#F59E0B20' : '#27272A', color: model.tier === 'primary' ? '#F59E0B' : '#71717A', border: `1px solid ${model.tier === 'primary' ? '#F59E0B40' : '#3F3F46'}` }}>{model.tier}</span>
                </div>
                <p style={{ color: '#A1A1AA', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>{model.roleDescription}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div><div style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sessions</div><div style={{ color: '#FAFAFA', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{sessionsUsing.length}</div></div>
                  <div><div style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tokens</div><div style={{ color: '#FAFAFA', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{formatNumber(totalTokens)}</div></div>
                  <div><div style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cost</div><div style={{ color: '#F59E0B', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>${totalCost.toFixed(2)}</div></div>
                </div>
                {sessionsUsing.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1A1A1C' }}>
                    <div style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Agents</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {sessionsUsing.map(s => (<span key={s.sessionId} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: s.status === 'running' ? '#EF444415' : s.status === 'error' ? '#22C55E15' : '#1A1A1C', color: s.status === 'running' ? '#EF4444' : s.status === 'error' ? '#22C55E' : '#71717A' }}>{s.agentName}</span>))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Crons */}
      {subTab === 'crons' && (
        <div style={{ background: '#111113', border: '1px solid #27272A', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 120px 100px 90px 100px 90px', padding: '0.75rem 1.25rem', borderBottom: '1px solid #27272A', background: '#0A0A0A' }}>
            {['Job Name', 'Description', 'Schedule', 'Agent', 'Status', 'Last Run', 'Actions'].map(h => (
              <span key={h} style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {cronJobs.map((job, idx) => (
            <div key={job.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 120px 100px 90px 100px 90px', padding: '0.75rem 1.25rem', borderBottom: '1px solid #1A1A1C', opacity: job.paused ? 0.5 : 1 }}>
              <span style={{ color: '#FAFAFA', fontSize: '0.85rem', fontWeight: 500 }}>{job.name}</span>
              <span style={{ color: '#A1A1AA', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>{job.description}</span>
              <span style={{ color: '#71717A', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>{formatCron(job.schedule)}</span>
              <span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>{job.agent || '--'}</span>
              <span><span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 500, background: job.paused ? '#71717A15' : job.lastStatus === 'success' ? '#EF444415' : '#22C55E15', color: job.paused ? '#71717A' : job.lastStatus === 'success' ? '#EF4444' : '#22C55E' }}>{job.paused ? 'paused' : job.lastStatus}</span></span>
              <span style={{ color: '#71717A', fontSize: '0.8rem' }}>{formatTime(job.lastRunAt)}</span>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button onClick={() => togglePause(idx)} style={{ background: '#1A1A1C', border: '1px solid #27272A', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: job.paused ? '#EF4444' : '#F59E0B', cursor: 'pointer' }}>{job.paused ? '\u25B6' : '\u23F8'}</button>
                <button style={{ background: '#1A1A1C', border: '1px solid #27272A', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: '#3B82F6', cursor: 'pointer' }}>\u21BB</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer with data freshness */}
      {generatedAt && (
        <div style={{ 
          marginTop: '40px', 
          padding: '12px 20px', 
          borderTop: '1px solid #27272A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span style={{ 
            color: '#71717A', 
            fontSize: '12px', 
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            Data generated at: {new Date(generatedAt).toLocaleString()}
          </span>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
