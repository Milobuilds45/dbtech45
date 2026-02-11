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

// Agent display config (no emojis, solid colors, logo-ready boxes)
const AGENT_DISPLAY: Record<string, { initials: string; label: string; role: string; color: string }> = {
  bobby: { initials: 'AX', label: 'Bobby', role: 'Trading', color: '#EF4444' },
  wendy: { initials: 'WR', label: 'Wendy', role: 'Psychology', color: '#8B5CF6' },
  dwight: { initials: 'DW', label: 'Dwight', role: 'Intel', color: '#3B82F6' },
  dax: { initials: 'DX', label: 'Dax', role: 'Data', color: '#06B6D4' },
  tony: { initials: 'TN', label: 'Tony', role: 'Operations', color: '#EAB308' },
  paula: { initials: 'PA', label: 'Paula', role: 'Creative', color: '#EC4899' },
  remy: { initials: 'RM', label: 'Remy', role: 'Marketing', color: '#22C55E' },
  anders: { initials: 'AN', label: 'Anders', role: 'Engineering', color: '#F97316' },
  milo: { initials: 'MI', label: 'Milo', role: 'Chief of Staff', color: '#A855F7' },
};

export default function RoundtablePage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#EF4444', info: '#3B82F6',
    border: '#222222',
  };

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
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const toggleAgent = (id: string) => {
    setSelectedAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
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
        const allMsgs = data.messages;
        for (let i = 0; i < allMsgs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 120));
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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); startRoundtable(); }
  };

  const navItems = [
    { label: 'Model Counsel', href: '/model-counsel' },
    { label: 'Roundtable', href: '/roundtable', active: true },
    { label: 'Projects', href: '/projects', badge: '28' },
    { label: 'Markets', href: '/markets' },
    { label: 'Daily Feed', href: '/daily-feed' },
  ];

  const toolItems = [
    { label: 'Quick Links', href: '/quick-links' },
    { label: 'Kanban', href: '/kanban' },
    { label: 'Ideas Vault', href: '/ideas-vault' },
    { label: 'Brand Kit', href: 'https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', external: true },
    { label: 'Brand Spec', href: 'https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', external: true },
  ];

  const opsItems = [
    { label: 'Activity Dashboard', href: '/activity-dashboard' },
    { label: 'DNA', href: '/dna' },
    { label: 'Memory Bank', href: '/memory-bank' },
    { label: 'Skills Inventory', href: '/skills-inventory' },
    { label: 'Schedule Center', href: '/schedule-center' },
    { label: 'Goals Tracker', href: '/goals-tracker' },
    { label: 'Master Todo', href: '/master-todo' },
  ];

  const navStyle = (active?: boolean): React.CSSProperties => ({
    padding: '8px 20px', margin: '2px 0', fontSize: '14px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'background 0.2s', color: b.silver,
    background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
    borderRight: active ? `2px solid ${b.amber}` : 'none',
  });

  const sectionLabel: React.CSSProperties = {
    padding: '16px 20px', color: b.smoke, fontSize: '11px', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  const uniqueRounds = [...new Set(messages.map(m => m.round))].sort();

  return (
    <div style={{ background: b.void, color: b.white, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <div style={{ width: '240px', background: b.carbon, borderRight: `1px solid ${b.border}`, padding: '20px 0', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 30px', borderBottom: `1px solid ${b.border}`, marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: b.amber, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.void, fontWeight: 700, marginRight: '12px', fontSize: '12px' }}>DB</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              <div style={{ color: b.white }}>DB TECH OS</div>
              <div style={{ fontSize: '11px', color: b.smoke }}>MISSION CONTROL</div>
            </div>
          </div>
          {navItems.map((item, i) => (
            <div key={i} style={navStyle(item.active)} onClick={() => window.location.href = item.href}>
              {item.label}
              {item.badge && <span style={{ background: b.amber, color: b.void, fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>{item.badge}</span>}
            </div>
          ))}
          <div style={sectionLabel}>Tools</div>
          {toolItems.map((item, i) => (
            <div key={i} style={navStyle()} onClick={() => item.external ? window.open(item.href, '_blank') : window.location.href = item.href}>
              {item.label}
            </div>
          ))}
          <div style={sectionLabel}>Operations</div>
          {opsItems.map((item, i) => (
            <div key={i} style={navStyle()} onClick={() => window.location.href = item.href}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ marginLeft: '240px', flex: 1, padding: '20px 30px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: b.white }}>The Roundtable</div>
              <div style={{ color: b.smoke, marginTop: '4px', fontSize: '14px' }}>Your agents debate. You decide.</div>
            </div>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.error }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: b.error, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live — Round {currentRound}</span>
              </div>
            )}
          </div>

          {/* Agent Grid - Square Boxes */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: b.smoke, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Panelists</span>
              <span style={{ fontSize: '11px', color: b.smoke }}>{selectedAgents.length} selected (min 2)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {Object.keys(AGENT_DISPLAY).map(id => {
                const agent = AGENT_DISPLAY[id];
                const selected = selectedAgents.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleAgent(id)}
                    style={{
                      aspectRatio: '1', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '6px',
                      borderRadius: '12px', cursor: 'pointer',
                      border: selected ? `2px solid ${agent.color}` : `1px solid ${b.border}`,
                      background: selected ? b.carbon : b.void,
                      opacity: selected ? 1 : 0.4,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Logo placeholder — square with initials */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: selected ? agent.color : b.graphite,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: selected ? b.void : b.smoke,
                      fontSize: '13px', fontWeight: 700,
                    }}>{agent.initials}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: selected ? b.white : b.smoke }}>{agent.label}</div>
                    <div style={{ fontSize: '10px', color: b.smoke }}>{agent.role}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Input + Controls */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Drop a topic for debate... (Ctrl+Enter to start)"
                rows={3}
                style={{
                  width: '100%', background: b.carbon, border: `1px solid ${b.border}`,
                  borderRadius: '10px', padding: '14px', color: b.white,
                  fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.6',
                  resize: 'none', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = b.amber}
                onBlur={e => e.target.style.borderColor = b.border}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: b.smoke }}>
                <span>{selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected</span>
                <span>Ctrl+Enter to start</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: b.smoke }}>Rounds:</span>
                {[2, 3, 4].map(r => (
                  <button
                    key={r}
                    onClick={() => setRounds(r)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '6px',
                      border: `1px solid ${rounds === r ? b.amber : b.border}`,
                      background: rounds === r ? 'rgba(245, 158, 11, 0.1)' : b.carbon,
                      color: rounds === r ? b.amber : b.smoke,
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    }}
                  >{r}</button>
                ))}
              </div>
              <button
                onClick={startRoundtable}
                disabled={loading || !topic.trim() || selectedAgents.length < 2}
                style={{
                  padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading || !topic.trim() || selectedAgents.length < 2 ? b.graphite : b.amber,
                  color: loading || !topic.trim() || selectedAgents.length < 2 ? b.smoke : b.void,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Debating...' : 'Start Debate'}
              </button>
            </div>
          </div>

          {/* Debate Feed */}
          {(messages.length > 0 || loading) && (
            <div ref={chatRef} style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              {/* Topic Bar */}
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${b.border}`, background: b.graphite }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: b.amber, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Topic</div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{topic}</div>
              </div>

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {uniqueRounds.map(round => (
                  <div key={round}>
                    {/* Round Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
                      <div style={{ flex: 1, height: '1px', background: b.border }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: round === 1 ? b.success : round === uniqueRounds[uniqueRounds.length - 1] ? b.amber : b.smoke, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {round === 1 ? 'Opening Takes' : round === uniqueRounds[uniqueRounds.length - 1] ? 'Final Round' : `Round ${round} — Rebuttals`}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: b.border }} />
                    </div>

                    {messages.filter(m => m.round === round).map((msg, i) => {
                      const display = AGENT_DISPLAY[msg.agentId] || { initials: '??', label: msg.agentId, role: '', color: b.smoke };
                      return (
                        <div key={`${msg.agentId}-${round}-${i}`} style={{ padding: '14px 20px', borderLeft: `3px solid ${display.color}`, margin: '4px 12px', borderRadius: '0 8px 8px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: display.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.void, fontSize: '10px', fontWeight: 700 }}>{display.initials}</div>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: display.color }}>{display.label}</span>
                            <span style={{ fontSize: '10px', color: b.smoke, background: b.graphite, padding: '2px 8px', borderRadius: '4px' }}>{display.role}</span>
                            {msg.latencyMs > 0 && <span style={{ fontSize: '10px', color: b.smoke, marginLeft: 'auto' }}>{(msg.latencyMs / 1000).toFixed(1)}s</span>}
                          </div>
                          <div style={{ fontSize: '13px', color: b.silver, lineHeight: '1.7', paddingLeft: '38px' }}>{msg.content}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {loading && (
                  <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.amber, animation: 'breathe 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: '12px', color: b.smoke }}>{currentRound === 1 ? 'Agents forming their takes...' : 'Agents debating...'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>The Roundtable</div>
              <p style={{ color: b.smoke, maxWidth: '460px', margin: '0 auto 32px', fontSize: '14px', lineHeight: '1.7' }}>
                Drop a topic and watch your AI agents debate it live. They challenge each other, build on ideas, and give you every angle.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', maxWidth: '680px', margin: '0 auto' }}>
                {[
                  { q: "Should we raise prices at Bobola's by 15%?", label: 'Business strategy' },
                  { q: 'Is Bitcoin going to $200K this year?', label: 'Market debate' },
                  { q: "What's the biggest waste of time for a solo founder?", label: 'Hot take' },
                ].map(({ q, label }) => (
                  <button
                    key={q}
                    onClick={() => setTopic(q)}
                    style={{
                      padding: '16px', borderRadius: '10px', background: b.carbon,
                      border: `1px solid ${b.border}`, cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.2s', color: 'inherit',
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
      </div>
    </div>
  );
}
