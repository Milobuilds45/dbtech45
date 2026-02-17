'use client';

import { useState, useRef, useEffect } from 'react';

interface ModelInfo {
  name: string;
  provider: string;
  model: string;
  color: string;
}

interface ModelResponse {
  modelId: string;
  name: string;
  color: string;
  content: string | null;
  error?: string;
  tokens: { input: number; output: number };
  latencyMs: number;
}

const MODEL_DISPLAY: Record<string, { initials: string; desc: string }> = {
  'claude-opus': { initials: 'OP', desc: 'Deep reasoning and analysis' },
  'claude-sonnet': { initials: 'SN', desc: 'Balanced speed and capability' },
  'gemini-pro': { initials: 'GP', desc: 'Advanced reasoning, huge context' },
  'gemini-flash': { initials: 'GF', desc: 'Fast responses, good quality' },
  'gpt-4o': { initials: '4o', desc: 'Strong at code and structure' },
  'grok': { initials: 'GK', desc: 'Real-time knowledge, unfiltered' },
  'llama': { initials: 'LL', desc: 'Open source via Groq, very fast' },
};

export default function ModelCounselPage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#22C55E', info: '#3B82F6',
    border: '#222222',
  };

  const [models, setModels] = useState<Record<string, ModelInfo>>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/model-counsel')
      .then(r => r.json())
      .then(data => { setModels(data.models); setSelectedModels(Object.keys(data.models)); })
      .catch(console.error);
  }, []);

  const toggleModel = (id: string) => {
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };
  const selectAll = () => setSelectedModels(Object.keys(models));
  const selectNone = () => setSelectedModels([]);

  const askModels = async () => {
    if (!question.trim() || selectedModels.length === 0) return;
    setLoading(true); setResponses([]);
    try {
      const res = await fetch('/api/model-counsel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), models: selectedModels })
      });
      const data = await res.json();
      if (data.success) setResponses(data.responses);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); askModels(); }
  };

  const totalTokens = responses.reduce((sum, r) => sum + (r.tokens?.input || 0) + (r.tokens?.output || 0), 0);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [collapsedModels, setCollapsedModels] = useState<Set<string>>(new Set());

  const toggleCollapse = (modelId: string) => {
    setCollapsedModels(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId); else next.add(modelId);
      return next;
    });
  };
  const collapseAll = () => setCollapsedModels(new Set(responses.map(r => r.modelId)));
  const expandAll = () => setCollapsedModels(new Set());

  const formatResponse = (r: ModelResponse) => [
    `Model: ${r.name}`,
    `Latency: ${r.latencyMs > 0 ? (r.latencyMs / 1000).toFixed(1) + 's' : 'N/A'}`,
    `Tokens: ${(r.tokens?.input || 0) + (r.tokens?.output || 0)} (in: ${r.tokens?.input || 0}, out: ${r.tokens?.output || 0})`,
    ``,
    r.error ? `Error: ${r.error}` : r.content || '',
  ].join('\n');

  const copyResponse = (r: ModelResponse) => {
    navigator.clipboard.writeText(formatResponse(r));
    setCopiedId(r.modelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllResponses = () => {
    const sorted = [...responses].sort((a, a2) => (a.latencyMs || 99999) - (a2.latencyMs || 99999));
    const text = [
      `Question: ${question}`,
      `Models: ${sorted.length} | Total Tokens: ${totalTokens.toLocaleString()}`,
      `${'='.repeat(60)}`,
      '',
      ...sorted.map((r, i) => [
        `${'-'.repeat(40)}`,
        `${i + 1}. ${r.name}${i === 0 && !r.error ? ' Fastest' : ''}`,
        `${'-'.repeat(40)}`,
        formatResponse(r),
        '',
      ].join('\n')),
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div style={{ padding: '20px 30px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: b.amber, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>Model Counsel</div>
          <div style={{ color: b.smoke, marginTop: '4px', fontSize: '14px' }}>Ask one question. Get every perspective.</div>
        </div>
        {responses.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: b.smoke }}>
            <span>{totalTokens.toLocaleString()} tokens</span>
            <span>{responses.filter(r => r.content).length}/{responses.length} succeeded</span>
            <button
              onClick={expandAll}
              style={{
                background: b.graphite, border: `1px solid ${b.border}`, borderRadius: '6px',
                padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: b.silver,
              }}
              title="Expand all responses"
            >Expand All</button>
            <button
              onClick={collapseAll}
              style={{
                background: b.graphite, border: `1px solid ${b.border}`, borderRadius: '6px',
                padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: b.silver,
              }}
              title="Collapse all responses"
            >Collapse All</button>
            <button
              onClick={copyAllResponses}
              style={{
                background: copiedAll ? 'rgba(16, 185, 129, 0.15)' : b.graphite,
                border: `1px solid ${copiedAll ? b.success : b.border}`,
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                color: copiedAll ? b.success : b.silver,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copiedAll ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied All</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy All</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Model Selector - Centered Grid */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: b.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>Select Models</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={selectAll} style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', background: b.graphite, border: `1px solid ${b.border}`, color: b.silver, cursor: 'pointer' }}>All</button>
            <button onClick={selectNone} style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '4px', background: b.graphite, border: `1px solid ${b.border}`, color: b.silver, cursor: 'pointer' }}>None</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {Object.entries(models).map(([id, info]) => {
            const selected = selectedModels.includes(id);
            const display = MODEL_DISPLAY[id] || { initials: '??', desc: info.provider };
            return (
              <button
                key={id}
                onClick={() => toggleModel(id)}
                style={{
                  width: '120px', height: '120px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                  borderRadius: '12px', cursor: 'pointer',
                  border: selected ? `2px solid ${info.color}` : `1px solid ${b.border}`,
                  background: selected ? b.carbon : b.void,
                  opacity: selected ? 1 : 0.4, transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: selected ? info.color : b.graphite,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: selected ? b.void : b.smoke, fontSize: '13px', fontWeight: 700,
                }}>{display.initials}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: selected ? b.white : b.smoke }}>{info.name}</div>
                <div style={{ fontSize: '9px', color: b.smoke, textAlign: 'center', padding: '0 4px' }}>{display.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question... (Ctrl+Enter to send)"
            rows={3}
            style={{
              width: '100%', background: b.carbon, border: `1px solid ${b.border}`,
              borderRadius: '10px', padding: '14px 120px 14px 14px', color: b.white,
              fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.6',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = b.amber}
            onBlur={e => e.target.style.borderColor = b.border}
          />
          <button
            onClick={askModels}
            disabled={loading || !question.trim() || selectedModels.length === 0}
            style={{
              position: 'absolute', bottom: '12px', right: '12px',
              padding: '10px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '13px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading || !question.trim() || selectedModels.length === 0 ? b.graphite : b.amber,
              color: loading ? b.smoke : b.void, transition: 'all 0.2s',
            }}
          >{loading ? 'Thinking...' : 'Ask All'}</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: b.smoke }}>
          <span>{selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected</span>
          <span>Ctrl+Enter to send</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {selectedModels.map(id => (
            <div key={id} style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: models[id]?.color || b.smoke, animation: 'breathe 1.5s ease-in-out infinite' }} />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{models[id]?.name || id}</span>
                <span style={{ fontSize: '11px', color: b.smoke }}>thinking...</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[100, 80, 55].map((w, i) => (
                  <div key={i} style={{ height: '8px', background: b.graphite, borderRadius: '3px', width: `${w}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && responses.length > 0 && (
        <div>
          <div style={{ display: 'flex', gap: '3px', height: '4px', borderRadius: '2px', overflow: 'hidden', background: b.carbon, marginBottom: '16px' }}>
            {responses.filter(r => r.latencyMs > 0).sort((a, b2) => a.latencyMs - b2.latencyMs).map(r => (
              <div key={r.modelId} style={{ height: '100%', borderRadius: '2px', background: r.color, flex: r.latencyMs, opacity: r.error ? 0.3 : 1 }} title={`${r.name}: ${(r.latencyMs / 1000).toFixed(1)}s`} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {responses.sort((a, a2) => (a.latencyMs || 99999) - (a2.latencyMs || 99999)).map((r, i) => (
              <div key={r.modelId} style={{ background: b.carbon, border: `1px solid ${r.error ? b.error : b.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: r.error ? b.error : r.color }} />
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: collapsedModels.has(r.modelId) ? 'none' : `1px solid ${b.border}`, cursor: 'pointer' }}
                  onClick={() => toggleCollapse(r.modelId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={b.smoke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: collapsedModels.has(r.modelId) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.name}</span>
                    {i === 0 && !r.error && <span style={{ fontSize: '10px', fontWeight: 600, color: b.amber, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Fastest</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: b.smoke }}>
                    {r.latencyMs > 0 && <span>{(r.latencyMs / 1000).toFixed(1)}s</span>}
                    {(r.tokens?.input > 0 || r.tokens?.output > 0) && <span>{r.tokens.input + r.tokens.output} tok</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); copyResponse(r); }}
                      style={{
                        background: copiedId === r.modelId ? 'rgba(16, 185, 129, 0.15)' : b.graphite,
                        border: `1px solid ${copiedId === r.modelId ? b.success : b.border}`,
                        borderRadius: '4px', padding: '3px 8px', cursor: 'pointer',
                        fontSize: '11px', color: copiedId === r.modelId ? b.success : b.silver,
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                      title="Copy model, time, tokens, and response"
                    >
                      {copiedId === r.modelId ? (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
                      )}
                    </button>
                  </div>
                </div>
                <div style={{
                  maxHeight: collapsedModels.has(r.modelId) ? '0px' : '350px',
                  overflow: collapsedModels.has(r.modelId) ? 'hidden' : 'auto',
                  padding: collapsedModels.has(r.modelId) ? '0 16px' : '14px 16px',
                  transition: 'max-height 0.25s ease, padding 0.25s ease',
                }}>
                  {r.error
                    ? <div style={{ color: b.error, fontSize: '12px' }}>Error: {r.error}</div>
                    : <div style={{ fontSize: '13px', color: b.silver, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{r.content}</div>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && responses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Your AI Advisory Board</div>
          <p style={{ color: b.smoke, maxWidth: '460px', margin: '0 auto 32px', fontSize: '14px', lineHeight: '1.7' }}>
            Ask one question and get parallel responses from the world&apos;s best AI models. Compare reasoning, speed, and perspective side by side.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', maxWidth: '680px', margin: '0 auto' }}>
            {[
              { q: 'Explain quantum computing to a 10-year-old', label: 'Test simplification' },
              { q: 'Write a Python function to detect palindromes', label: 'Compare code styles' },
              { q: 'What are the biggest risks to AI safety?', label: 'Compare perspectives' },
            ].map(({ q, label }) => (
              <button key={q} onClick={() => setQuestion(q)} style={{
                padding: '16px', borderRadius: '10px', background: b.carbon,
                border: `1px solid ${b.border}`, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s', color: 'inherit',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = b.amber}
                onMouseLeave={e => e.currentTarget.style.borderColor = b.border}
              >
                <div style={{ fontSize: '13px', color: b.white, marginBottom: '4px', fontWeight: 500 }}>&quot;{q}&quot;</div>
                <div style={{ fontSize: '11px', color: b.smoke }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
