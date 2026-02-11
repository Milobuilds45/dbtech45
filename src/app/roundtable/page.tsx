'use client';

import { useState, useEffect, useRef } from 'react';

interface AgentInfo {
  name: string;
  emoji: string;
  role: string;
  color: string;
}

interface RoundMessage {
  agentId: string;
  round: number;
  content: string;
  latencyMs: number;
}

export default function RoundtablePage() {
  const [agents, setAgents] = useState<Record<string, AgentInfo>>({});
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [rounds, setRounds] = useState(2);
  const [messages, setMessages] = useState<RoundMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/roundtable')
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents);
        setSelectedAgents(Object.keys(data.agents));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleAgent = (id: string) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const startRoundtable = async () => {
    if (!topic.trim() || selectedAgents.length < 2) return;
    setLoading(true);
    setMessages([]);
    setCurrentRound(1);

    try {
      const res = await fetch('/api/roundtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), agents: selectedAgents, rounds })
      });
      const data = await res.json();
      if (data.success) {
        // Animate messages in with delays
        const allMsgs = data.messages;
        for (let i = 0; i < allMsgs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 150));
          setMessages(prev => [...prev, allMsgs[i]]);
          setCurrentRound(allMsgs[i].round);
        }
      }
    } catch (err) {
      console.error('Roundtable failed:', err);
    } finally {
      setLoading(false);
      setCurrentRound(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      startRoundtable();
    }
  };

  const uniqueRounds = [...new Set(messages.map(m => m.round))].sort();

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10, 10, 11, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50, padding: '16px 0'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
            }}>🎙️</div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>The Roundtable</h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>Your agents debate. You decide.</p>
            </div>
          </div>
          {loading && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--amber)' }}>
              🔴 LIVE — Round {currentRound}
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Agent Selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ color: 'var(--green)', marginRight: '6px' }}>$</span>select --panelists
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
              {selectedAgents.length} selected (min 2)
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(agents).map(([id, agent]) => {
              const selected = selectedAgents.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleAgent(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '20px',
                    border: `2px solid ${selected ? agent.color : 'var(--border)'}`,
                    background: selected ? agent.color + '15' : 'var(--bg-primary)',
                    cursor: 'pointer', transition: 'all 0.3s',
                    opacity: selected ? 1 : 0.5
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{agent.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: selected ? agent.color : 'var(--text-secondary)' }}>{agent.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>{agent.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Input + Rounds */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Drop a topic for debate... (Ctrl+Enter to start)"
                rows={3}
                style={{
                  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '16px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: '1.6',
                  resize: 'none', outline: 'none', transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>Rounds:</span>
                {[2, 3, 4].map(r => (
                  <button
                    key={r}
                    onClick={() => setRounds(r)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: `1px solid ${rounds === r ? 'var(--amber)' : 'var(--border)'}`,
                      background: rounds === r ? 'var(--amber-glow)' : 'var(--bg-elevated)',
                      color: rounds === r ? 'var(--amber)' : 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >{r}</button>
                ))}
              </div>
              <button
                onClick={startRoundtable}
                disabled={loading || !topic.trim() || selectedAgents.length < 2}
                style={{
                  padding: '12px 24px', borderRadius: '8px',
                  fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '14px',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading || !topic.trim() || selectedAgents.length < 2 ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #EF4444, #8B5CF6)',
                  color: loading ? 'var(--text-dim)' : '#fff',
                  transition: 'all 0.3s',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(139, 92, 246, 0.3)'
                }}
              >
                {loading ? '🔴 Debating...' : '🎙️ Start Debate'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat / Debate View */}
        {(messages.length > 0 || loading) && (
          <div
            ref={chatRef}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px', overflow: 'hidden'
            }}
          >
            {/* Topic Banner */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-elevated)'
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📌 Topic
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{topic}</div>
            </div>

            {/* Messages */}
            <div style={{ padding: '8px 0', maxHeight: '600px', overflowY: 'auto' }}>
              {uniqueRounds.map(round => (
                <div key={round}>
                  {/* Round Divider */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 24px', margin: '8px 0'
                  }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                      color: round === 1 ? 'var(--green)' : round === uniqueRounds[uniqueRounds.length - 1] ? 'var(--amber)' : 'var(--text-dim)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {round === 1 ? '🟢 Opening Takes' : round === uniqueRounds[uniqueRounds.length - 1] ? '🏁 Final Round' : `⚡ Round ${round} — Rebuttals`}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  </div>

                  {/* Agent Messages for this round */}
                  {messages
                    .filter(m => m.round === round)
                    .map((msg, i) => {
                      const agent = agents[msg.agentId];
                      if (!agent) return null;
                      return (
                        <div
                          key={`${msg.agentId}-${round}-${i}`}
                          style={{
                            padding: '16px 24px',
                            borderLeft: `3px solid ${agent.color}`,
                            margin: '4px 16px',
                            borderRadius: '0 8px 8px 0',
                            background: 'transparent',
                            transition: 'background 0.3s',
                            animation: 'fade-in-up 0.4s ease-out'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = agent.color + '08'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '18px' }}>{agent.emoji}</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: agent.color }}>{agent.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', padding: '2px 8px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>{agent.role}</span>
                            {msg.latencyMs > 0 && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', marginLeft: 'auto' }}>{(msg.latencyMs / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '28px' }}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

              {/* Loading indicators */}
              {loading && (
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--amber)', animation: 'breathe 1.5s ease-in-out infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
                    Agents are {currentRound === 1 ? 'forming their takes...' : 'debating...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎙️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>The Roundtable</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 40px', fontSize: '16px', lineHeight: '1.7' }}>
              Drop a topic and watch your AI agents debate it live. They&apos;ll challenge each other, build on ideas, and give you every angle.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', maxWidth: '750px', margin: '0 auto' }}>
              {[
                { q: 'Should we raise prices at Bobola\'s by 15%?', label: 'Business strategy' },
                { q: 'Is Bitcoin going to $200K this year?', label: 'Market debate' },
                { q: 'What\'s the biggest waste of time for a solo founder?', label: 'Entrepreneur hot take' },
              ].map(({ q, label }) => (
                <button
                  key={q}
                  onClick={() => setTopic(q)}
                  style={{
                    padding: '18px', borderRadius: '12px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.3s', color: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
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
