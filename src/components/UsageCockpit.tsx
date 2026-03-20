'use client';

import React, { useState, useEffect } from 'react';
import { UsageGauge } from './UsageGauge';

// ─── Types ───────────────────────────────────────────────────────────────────
interface OAuthData {
  daily: { limit: number; remaining: number; reset: string };
  weekly: { limit: number; remaining: number; reset: string };
  weeklySonnet?: { limit: number; remaining: number; reset: string };
  monthly: { limit: number; spent: number; total: number; reset: string };
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

interface UsageData {
  timestamp: string;
  oauth: OAuthData | null;
  oauthError: string | null;
  agents: AgentUsage[];
  models: ModelUsage[];
  totals: { totalTokens: number; totalCost: number; claudeCost: number; geminiCost: number; gptCost: number };
}

const agentOrder = ['milo', 'ted', 'paula', 'anders', 'bobby', 'wendy', 'dwight', 'jim', 'remy'];

const agentColors: Record<string, string> = {
  ted: '#F59E0B', milo: '#6366F1', paula: '#EC4899', anders: '#3B82F6',
  bobby: '#00A000', remy: '#E53935', wendy: '#F4A03F', dwight: '#7B68EE', jim: '#06B6D4',
};

const modelColors: Record<string, string> = {
  'Claude Sonnet': '#F59E0B', 'Claude Opus': '#EF4444', 'Gemini': '#4285F4', 'GPT': '#10B981', 'Local': '#71717a',
};

function fmtTokens(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
}

function fmtCost(n: number): string { return `$${n.toFixed(2)}`; }

function formatReset(reset: string): string {
  if (!reset) return '';
  try {
    const d = new Date(reset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return reset; }
}

// ─── Component ───────────────────────────────────────────────────────────────
export function UsageCockpit() {
  const [data, setData] = useState<UsageData | null>(null);
  const [clock, setClock] = useState(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/usage', { cache: 'no-store' });
        if (res.ok) { setData(await res.json()); }
      } catch { /* silent */ }
    };
    fetchUsage();
    const dataInterval = setInterval(fetchUsage, 60000);
    const clockInterval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => { clearInterval(dataInterval); clearInterval(clockInterval); };
  }, []);

  if (!data) return <div style={{ padding: '24px', color: '#52525b' }}>Loading usage data...</div>;

  const oauth = data.oauth;
  const sessionPct = oauth ? Math.round(((oauth.daily.limit - oauth.daily.remaining) / oauth.daily.limit) * 100) : 0;
  const weeklyPct = oauth ? Math.round(((oauth.weekly.limit - oauth.weekly.remaining) / oauth.weekly.limit) * 100) : 0;
  const sonnetPct = oauth?.weeklySonnet ? Math.round(((oauth.weeklySonnet.limit - oauth.weeklySonnet.remaining) / oauth.weeklySonnet.limit) * 100) : 0;
  const extraPct = oauth ? Math.round((oauth.monthly.spent / oauth.monthly.total) * 100) : 0;
  const maxAgentTokens = Math.max(...data.agents.map(a => a.totalTokens), 1);

  // Card style helper
  const card = { background: '#111113', border: '1px solid #1A1A1D', borderRadius: '12px', padding: '20px 12px', display: 'flex' as const, flexDirection: 'column' as const, alignItems: 'center' as const };
  const sectionH3 = { fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' };
  const mono = "'JetBrains Mono', monospace";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Usage Cockpit</h2>
          <span style={{ fontSize: '12px', color: '#52525b' }}>Real-time Claude &amp; agent consumption</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e60' }} />
          <span style={{ fontSize: '11px', color: '#52525b', fontFamily: mono }}>LIVE · {clock}</span>
        </div>
      </div>

      {/* TOP ROW: Claude usage percentage gauges — matches /usage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={card}>
          <UsageGauge label="Current Session" value={sessionPct} max={100} size={140} color="#F59E0B" formatValue={(v) => `${Math.round(v)}%`} />
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#52525b', fontFamily: mono, textAlign: 'center' }}>
            {oauth?.daily.reset ? `Resets ${formatReset(oauth.daily.reset)}` : ''}
          </div>
        </div>
        <div style={card}>
          <UsageGauge label="Week (All Models)" value={weeklyPct} max={100} size={140} color="#3B82F6" formatValue={(v) => `${Math.round(v)}%`} />
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#52525b', fontFamily: mono, textAlign: 'center' }}>
            {oauth?.weekly.reset ? `Resets ${formatReset(oauth.weekly.reset)}` : ''}
          </div>
        </div>
        <div style={card}>
          <UsageGauge label="Week (Sonnet)" value={sonnetPct} max={100} size={140} color="#8B5CF6" formatValue={(v) => `${Math.round(v)}%`} />
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#52525b', fontFamily: mono, textAlign: 'center' }}>
            {oauth?.weeklySonnet?.reset ? `Resets ${formatReset(oauth.weeklySonnet.reset)}` : ''}
          </div>
        </div>
        <div style={card}>
          <UsageGauge label="Extra Usage" value={extraPct} max={100} size={140} color={extraPct > 80 ? '#EF4444' : '#10B981'} formatValue={(v) => `${Math.round(v)}%`} />
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#52525b', fontFamily: mono, textAlign: 'center' }}>
            {oauth ? `$${oauth.monthly.spent.toFixed(2)} / $${oauth.monthly.total.toFixed(2)} · Resets ${formatReset(oauth.monthly.reset)}` : ''}
          </div>
        </div>
      </div>

      {data.oauthError && (
        <div style={{ fontSize: '11px', color: '#52525b', fontStyle: 'italic', textAlign: 'center' }}>
          {data.oauthError}
        </div>
      )}

      {/* AGENT GAUGES */}
      <div>
        <h3 style={sectionH3}>Agent Consumption</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {agentOrder.map(id => {
            const agent = data.agents.find(a => a.agentId === id);
            if (!agent) return null;
            return (
              <div key={agent.agentId} style={{ ...card, padding: '16px 8px', borderRadius: '10px', width: '140px' }}>
                <UsageGauge
                  label={agent.agentId.charAt(0).toUpperCase() + agent.agentId.slice(1)}
                  value={agent.totalTokens}
                  max={maxAgentTokens * 1.2}
                  size={120}
                  color={agentColors[agent.agentId] || '#F59E0B'}
                  subLabel={fmtCost(agent.cost)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* MODEL BREAKDOWN TABLE */}
      <div>
        <h3 style={sectionH3}>Model Breakdown</h3>
        <div style={{ background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid #1A1A1D', fontSize: '10px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Model</span>
            <span style={{ textAlign: 'right' }}>Tokens</span>
            <span style={{ textAlign: 'right' }}>Cost</span>
          </div>
          {data.models.map(m => (
            <div key={m.model} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid #0d0d0f', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: modelColors[m.family] || '#71717a' }} />
                <span style={{ color: '#e4e4e7', fontFamily: mono, fontSize: '12px' }}>{m.model}</span>
              </span>
              <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: mono, fontSize: '12px' }}>{fmtTokens(m.totalTokens)}</span>
              <span style={{ textAlign: 'right', color: m.cost > 1 ? '#F59E0B' : '#a1a1aa', fontWeight: 600, fontFamily: mono, fontSize: '12px' }}>{fmtCost(m.cost)}</span>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 16px', background: '#0d0d0f', fontWeight: 700 }}>
            <span style={{ color: '#fff', fontSize: '12px' }}>TOTAL</span>
            <span style={{ textAlign: 'right', color: '#fff', fontFamily: mono, fontSize: '12px' }}>{fmtTokens(data.totals.totalTokens)}</span>
            <span style={{ textAlign: 'right', color: '#F59E0B', fontFamily: mono, fontSize: '12px' }}>{fmtCost(data.totals.totalCost)}</span>
          </div>
        </div>
      </div>

      {/* PER-AGENT TABLE */}
      <div>
        <h3 style={sectionH3}>Per-Agent Detail</h3>
        <div style={{ background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', padding: '10px 16px', borderBottom: '1px solid #1A1A1D', fontSize: '10px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Agent</span>
            <span style={{ textAlign: 'right' }}>Tokens</span>
            <span style={{ textAlign: 'right' }}>Cost</span>
            <span style={{ textAlign: 'right' }}>Sessions</span>
          </div>
          {data.agents.map(a => (
            <div key={a.agentId} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', padding: '10px 16px', borderBottom: '1px solid #0d0d0f', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: agentColors[a.agentId] || '#71717a' }} />
                <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{a.agentId.charAt(0).toUpperCase() + a.agentId.slice(1)}</span>
              </span>
              <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: mono }}>{fmtTokens(a.totalTokens)}</span>
              <span style={{ textAlign: 'right', color: a.cost > 1 ? '#F59E0B' : '#a1a1aa', fontWeight: 600, fontFamily: mono }}>{fmtCost(a.cost)}</span>
              <span style={{ textAlign: 'right', color: '#52525b', fontFamily: mono }}>{a.sessions}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
