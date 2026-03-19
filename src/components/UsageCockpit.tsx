'use client';

import React, { useState, useEffect } from 'react';
import { UsageGauge } from './UsageGauge';
import { Separator } from '@/components/ui/separator';

// ─── Types ───────────────────────────────────────────────────────────────────
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
  cost: number;
}

interface UsageData {
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
  };
}

// ─── Agent colors (match the OS agent registry) ──────────────────────────────
const agentColors: Record<string, string> = {
  ted: '#F59E0B',
  milo: '#6366F1',
  paula: '#EC4899',
  anders: '#3B82F6',
  bobby: '#00A000',
  remy: '#E53935',
  wendy: '#F4A03F',
  dwight: '#7B68EE',
  jim: '#00FFFF',
};

const modelColors: Record<string, string> = {
  'Claude Sonnet': '#F59E0B',
  'Claude Opus': '#EF4444',
  'Gemini': '#4285F4',
  'GPT': '#10B981',
  'Local (Ollama)': '#71717a',
};

// ─── Format helpers ──────────────────────────────────────────────────────────
function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function fmtCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function UsageCockpit() {
  const [data, setData] = useState<UsageData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '24px', color: '#52525b' }}>Loading usage data...</div>
    );
  }

  // Find max agent tokens for gauge scaling
  const maxAgentTokens = Math.max(...data.agents.map(a => a.totalTokens), 1);

  // Group models by family
  const familyTotals: Record<string, { tokens: number; cost: number }> = {};
  data.models.forEach(m => {
    if (!familyTotals[m.family]) familyTotals[m.family] = { tokens: 0, cost: 0 };
    familyTotals[m.family].tokens += m.totalTokens;
    familyTotals[m.family].cost += m.cost;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Usage Cockpit</h2>
          <span style={{ fontSize: '12px', color: '#52525b' }}>Real-time token consumption &amp; cost tracking</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e',
            boxShadow: '0 0 6px #22c55e60',
          }} />
          <span style={{ fontSize: '11px', color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>
            LIVE · {lastUpdate}
          </span>
        </div>
      </div>

      {/* TOP ROW: Provider cost gauges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {/* Total Cost */}
        <div style={{
          background: '#111113',
          border: '1px solid #1A1A1D',
          borderRadius: '12px',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <UsageGauge
            label="Total Spend"
            value={data.totals.totalCost}
            max={50} // $50 budget cap
            size={140}
            color="#F59E0B"
            unit="$"
            formatValue={(v) => v.toFixed(2)}
            subLabel={`${fmtTokens(data.totals.totalTokens)} tokens`}
          />
        </div>

        {/* Claude Cost */}
        <div style={{
          background: '#111113',
          border: '1px solid #1A1A1D',
          borderRadius: '12px',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <UsageGauge
            label="Claude"
            value={data.totals.claudeCost}
            max={30}
            size={140}
            color="#EF4444"
            unit="$"
            formatValue={(v) => v.toFixed(2)}
            subLabel={`Sonnet + Opus`}
          />
        </div>

        {/* Gemini Cost */}
        <div style={{
          background: '#111113',
          border: '1px solid #1A1A1D',
          borderRadius: '12px',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <UsageGauge
            label="Gemini"
            value={data.totals.geminiCost}
            max={15}
            size={140}
            color="#4285F4"
            unit="$"
            formatValue={(v) => v.toFixed(2)}
            subLabel={`Flash + Pro`}
          />
        </div>

        {/* GPT Cost */}
        <div style={{
          background: '#111113',
          border: '1px solid #1A1A1D',
          borderRadius: '12px',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <UsageGauge
            label="GPT"
            value={data.totals.gptCost}
            max={10}
            size={140}
            color="#10B981"
            unit="$"
            formatValue={(v) => v.toFixed(2)}
            subLabel={`4o + Codex`}
          />
        </div>
      </div>

      <Separator className="bg-[#1A1A1D]" />

      {/* AGENT GAUGES */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Agent Consumption
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {data.agents.map(agent => (
            <div key={agent.agentId} style={{
              background: '#111113',
              border: '1px solid #1A1A1D',
              borderRadius: '10px',
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <UsageGauge
                label={agent.agentId.charAt(0).toUpperCase() + agent.agentId.slice(1)}
                value={agent.totalTokens}
                max={maxAgentTokens * 1.2}
                size={120}
                color={agentColors[agent.agentId] || '#F59E0B'}
                subLabel={fmtCost(agent.cost)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-[#1A1A1D]" />

      {/* MODEL BREAKDOWN TABLE */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Model Breakdown
        </h3>
        <div style={{
          background: '#111113',
          border: '1px solid #1A1A1D',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            padding: '10px 16px',
            borderBottom: '1px solid #1A1A1D',
            fontSize: '10px',
            fontWeight: 700,
            color: '#52525b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            <span>Model</span>
            <span style={{ textAlign: 'right' }}>Input</span>
            <span style={{ textAlign: 'right' }}>Output</span>
            <span style={{ textAlign: 'right' }}>Total</span>
            <span style={{ textAlign: 'right' }}>Cost</span>
          </div>

          {/* Rows */}
          {data.models.map(m => (
            <div key={m.model} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '10px 16px',
              borderBottom: '1px solid #0d0d0f',
              fontSize: '13px',
              alignItems: 'center',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: modelColors[m.family] || '#71717a',
                }} />
                <span style={{ color: '#e4e4e7', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{m.model}</span>
              </span>
              <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                {fmtTokens(m.totalTokens)}
              </span>
              <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                {fmtTokens(m.cost > 0 ? m.totalTokens : 0)}
              </span>
              <span style={{ textAlign: 'right', color: '#e4e4e7', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                {fmtTokens(m.totalTokens)}
              </span>
              <span style={{ textAlign: 'right', color: m.cost > 1 ? '#F59E0B' : '#a1a1aa', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                {fmtCost(m.cost)}
              </span>
            </div>
          ))}

          {/* Total row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            padding: '12px 16px',
            background: '#0d0d0f',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            <span style={{ color: '#fff' }}>TOTAL</span>
            <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              {fmtTokens(data.totals.inputTokens)}
            </span>
            <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              {fmtTokens(data.totals.outputTokens)}
            </span>
            <span style={{ textAlign: 'right', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              {fmtTokens(data.totals.totalTokens)}
            </span>
            <span style={{ textAlign: 'right', color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              {fmtCost(data.totals.totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* AGENT DETAIL TABLE */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Per-Agent Detail
        </h3>
        <div style={{
          background: '#111113',
          border: '1px solid #1A1A1D',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 0.8fr',
            padding: '10px 16px',
            borderBottom: '1px solid #1A1A1D',
            fontSize: '10px',
            fontWeight: 700,
            color: '#52525b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            <span>Agent</span>
            <span style={{ textAlign: 'right' }}>Tokens</span>
            <span style={{ textAlign: 'right' }}>Cache Read</span>
            <span style={{ textAlign: 'right' }}>Cache Write</span>
            <span style={{ textAlign: 'right' }}>Cost</span>
            <span style={{ textAlign: 'right' }}>Sessions</span>
          </div>

          {data.agents.map(a => (
            <div key={a.agentId} style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 0.8fr',
              padding: '10px 16px',
              borderBottom: '1px solid #0d0d0f',
              fontSize: '12px',
              alignItems: 'center',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: agentColors[a.agentId] || '#71717a',
                }} />
                <span style={{ color: '#e4e4e7', fontWeight: 500 }}>
                  {a.agentId.charAt(0).toUpperCase() + a.agentId.slice(1)}
                </span>
              </span>
              <span style={{ textAlign: 'right', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>{fmtTokens(a.totalTokens)}</span>
              <span style={{ textAlign: 'right', color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>{fmtTokens(a.cacheRead)}</span>
              <span style={{ textAlign: 'right', color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>{fmtTokens(a.cacheWrite)}</span>
              <span style={{ textAlign: 'right', color: a.cost > 1 ? '#F59E0B' : '#a1a1aa', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{fmtCost(a.cost)}</span>
              <span style={{ textAlign: 'right', color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>{a.sessions}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
