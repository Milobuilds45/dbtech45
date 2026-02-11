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

const MODEL_ICONS: Record<string, string> = {
  'claude-opus': '🟠',
  'claude-sonnet': '🔶',
  'gemini-pro': '🔵',
  'gemini-flash': '⚡',
  'gpt-4o': '🟢',
  'grok': '🟣',
};

const MODEL_DESCRIPTIONS: Record<string, string> = {
  'claude-opus': 'Deep reasoning & analysis',
  'claude-sonnet': 'Balanced speed & capability',
  'gemini-pro': 'Advanced reasoning, huge context',
  'gemini-flash': 'Fast responses, good quality',
  'gpt-4o': 'Strong at code & structured output',
  'grok': 'Real-time knowledge, unfiltered',
};

export default function ModelCounselPage() {
  const [models, setModels] = useState<Record<string, ModelInfo>>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/model-counsel')
      .then(r => r.json())
      .then(data => {
        setModels(data.models);
        setSelectedModels(Object.keys(data.models));
      })
      .catch(console.error);
  }, []);

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    );
  };

  const selectAll = () => setSelectedModels(Object.keys(models));
  const selectNone = () => setSelectedModels([]);

  const askModels = async () => {
    if (!question.trim() || selectedModels.length === 0) return;
    setLoading(true);
    setResponses([]);
    try {
      const res = await fetch('/api/model-counsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), models: selectedModels })
      });
      const data = await res.json();
      if (data.success) setResponses(data.responses);
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      askModels();
    }
  };

  const totalTokens = responses.reduce((sum, r) => sum + (r.tokens?.input || 0) + (r.tokens?.output || 0), 0);

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10, 10, 11, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--amber), #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 700
            }}>⚖️</div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Model Counsel</h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>Ask one question. Get every perspective.</p>
            </div>
          </div>
          {responses.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
              <span>🪙 {totalTokens.toLocaleString()} tokens</span>
              <span>✅ {responses.filter(r => r.content).length}/{responses.length}</span>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Model Selector */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ color: 'var(--green)', marginRight: '6px' }}>$</span>select --models
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={selectAll} style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '6px 14px',
                borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.3s'
              }}>All</button>
              <button onClick={selectNone} style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '6px 14px',
                borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.3s'
              }}>None</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
            {Object.entries(models).map(([id, info]) => {
              const selected = selectedModels.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleModel(id)}
                  style={{
                    position: 'relative',
                    padding: '18px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${selected ? info.color : 'var(--border)'}`,
                    background: selected ? 'var(--bg-card)' : 'var(--bg-primary)',
                    opacity: selected ? 1 : 0.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    boxShadow: selected ? `0 0 20px ${info.color}20` : 'none'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{MODEL_ICONS[id] || '🤖'}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{info.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{MODEL_DESCRIPTIONS[id]}</div>
                  {selected && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: info.color, boxShadow: `0 0 8px ${info.color}`
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your question... (Ctrl+Enter to send)"
              rows={4}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '18px 130px 18px 18px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                lineHeight: '1.6',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--amber)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={askModels}
              disabled={loading || !question.trim() || selectedModels.length === 0}
              style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: loading || !question.trim() || selectedModels.length === 0 ? 'not-allowed' : 'pointer',
                background: loading || !question.trim() || selectedModels.length === 0
                  ? 'var(--bg-elevated)'
                  : 'var(--amber)',
                color: loading || !question.trim() || selectedModels.length === 0
                  ? 'var(--text-dim)'
                  : '#000',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(245, 158, 11, 0.3)'
              }}
            >
              {loading ? '⏳ Thinking...' : '⚡ Ask All'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
            <span>{selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected</span>
            <span>Ctrl+Enter to send</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {selectedModels.map(id => (
              <div key={id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: models[id]?.color || '#666',
                    animation: 'breathe 1.5s ease-in-out infinite'
                  }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' }}>{models[id]?.name || id}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>thinking...</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[100, 85, 60].map((w, i) => (
                    <div key={i} style={{ height: '10px', background: 'var(--bg-elevated)', borderRadius: '4px', width: `${w}%`, animation: 'shimmer 2s linear infinite' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && responses.length > 0 && (
          <div>
            {/* Latency bar */}
            <div style={{ display: 'flex', gap: '4px', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--bg-card)', marginBottom: '20px' }}>
              {responses
                .filter(r => r.latencyMs > 0)
                .sort((a, b) => a.latencyMs - b.latencyMs)
                .map(r => (
                  <div
                    key={r.modelId}
                    style={{
                      height: '100%', borderRadius: '3px',
                      background: r.color,
                      flex: r.latencyMs,
                      opacity: r.error ? 0.3 : 1
                    }}
                    title={`${r.name}: ${(r.latencyMs / 1000).toFixed(1)}s`}
                  />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {responses
                .sort((a, b) => (a.latencyMs || 99999) - (b.latencyMs || 99999))
                .map((r, i) => (
                  <div
                    key={r.modelId}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${r.error ? 'var(--red)' : r.color + '40'}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                  >
                    {/* Top accent line */}
                    <div style={{ height: '3px', background: r.error ? 'var(--red)' : r.color }} />
                    
                    {/* Header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color, boxShadow: `0 0 8px ${r.color}60` }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' }}>{r.name}</span>
                        {i === 0 && !r.error && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
                            background: 'var(--amber-glow)', color: 'var(--amber)',
                            padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase'
                          }}>⚡ Fastest</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                        {r.latencyMs > 0 && <span>{(r.latencyMs / 1000).toFixed(1)}s</span>}
                        {(r.tokens?.input > 0 || r.tokens?.output > 0) && <span>{r.tokens.input + r.tokens.output} tok</span>}
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div style={{ padding: '18px', maxHeight: '400px', overflowY: 'auto' }}>
                      {r.error ? (
                        <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          <strong>Error:</strong> {r.error}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '14px', color: 'var(--text-secondary)',
                          lineHeight: '1.7', whiteSpace: 'pre-wrap',
                          fontFamily: 'var(--font-body)'
                        }}>
                          {r.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && responses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚖️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>Your AI Advisory Board</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 40px', fontSize: '16px', lineHeight: '1.7' }}>
              Ask one question and get parallel responses from the world&apos;s best AI models.
              Compare reasoning, speed, and perspective side by side.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', maxWidth: '750px', margin: '0 auto' }}>
              {[
                { q: 'Explain quantum computing to a 10-year-old', label: 'Test simplification' },
                { q: 'Write a Python function to detect palindromes', label: 'Compare code styles' },
                { q: 'What are the biggest risks to AI safety?', label: 'Compare perspectives' },
              ].map(({ q, label }) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    color: 'inherit'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 500 }}>&quot;{q}&quot;</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
