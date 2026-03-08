'use client';

import { useState, useEffect, useRef } from 'react';

interface AgentMessage {
  agent: string;
  text: string;
}

export default function IdeasVaultPage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#22C55E', info: '#3B82F6',
    border: '#222222',
  };

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);

  // Agent colors and initials mapping
  const AGENT_DISPLAY: Record<string, { color: string; initials: string }> = {
    'Milo': { color: '#A855F7', initials: 'MI' },
    'Paula': { color: '#EC4899', initials: 'PA' },
    'Bobby': { color: '#22C55E', initials: 'BO' },
    'Anders': { color: '#F97316', initials: 'AN' },
    'Dwight': { color: '#6366F1', initials: 'DW' },
    'Jim': { color: '#06B6D4', initials: 'JM' },
    'Remy': { color: '#EAB308', initials: 'RM' },
    'Wendy': { color: '#8B5CF6', initials: 'WN' },
  };

  useEffect(() => {
    const loadMessages = () => {
      fetch('/data/ideas-conversation.json', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(console.error);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 30000);

    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, []);

  const playConversation = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentMessageIndex(-1);
      return;
    }

    if (messages.length === 0) return;

    setIsPlaying(true);
    let index = 0;

    const playNext = () => {
      if (index >= messages.length) {
        setIsPlaying(false);
        setCurrentMessageIndex(-1);
        return;
      }

      setCurrentMessageIndex(index);
      const msg = messages[index];
      const utterance = new SpeechSynthesisUtterance(msg.text);

      // Load available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Attempt to assign consistent but distinct voices based on agent name
      // This is a simple hash-based voice selection to ensure variety
      if (voices.length > 0) {
        let voiceIndex = 0;
        if (msg.agent === 'Paula' || msg.agent === 'Wendy') {
          // Try to find a female voice
          const femaleVoices = voices.filter(v => v.name.includes('Female') || v.name.includes('Zira'));
          voiceIndex = femaleVoices.length > 0 ? voices.indexOf(femaleVoices[0]) : 0;
        } else if (msg.agent === 'Milo') {
          // Try to find a UK voice for Milo
          const ukVoices = voices.filter(v => v.lang.includes('GB') && (v.name.includes('Male') || v.name.includes('George')));
          voiceIndex = ukVoices.length > 0 ? voices.indexOf(ukVoices[0]) : 0;
        } else {
          // Simple hash for other male voices
          const maleVoices = voices.filter(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark'));
          if (maleVoices.length > 0) {
             const hash = msg.agent.charCodeAt(0) % maleVoices.length;
             voiceIndex = voices.indexOf(maleVoices[hash]);
          } else {
             voiceIndex = msg.agent.charCodeAt(0) % voices.length;
          }
        }
        utterance.voice = voices[voiceIndex];
      }

      // Adjust pitch/rate slightly for personality
      if (msg.agent === 'Bobby') utterance.pitch = 0.8;
      if (msg.agent === 'Dwight') { utterance.pitch = 1.1; utterance.rate = 1.1; }
      if (msg.agent === 'Paula') utterance.pitch = 1.2;

      utterance.onend = () => {
        index++;
        playNext();
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentMessageIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Chrome needs a small delay to load voices sometimes
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = playNext;
    } else {
      playNext();
    }
  };

  return (
    <div style={{ padding: '20px 30px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: b.amber, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>Ideas Vault & Morning Briefing</div>
          <div style={{ color: b.smoke, marginTop: '4px', fontSize: '14px' }}>Agent-generated site improvements and business models.</div>
        </div>
        <button
          onClick={playConversation}
          style={{
            background: isPlaying ? 'rgba(239, 68, 68, 0.15)' : b.amber,
            border: `1px solid ${isPlaying ? '#EF4444' : b.amber}`,
            borderRadius: '6px', padding: '10px 20px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, color: isPlaying ? '#EF4444' : b.void,
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
          }}
        >
          {isPlaying ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop Audio</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play Audio Briefing</>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Left Col: Conversation Feed */}
        <div style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: b.smoke, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${b.border}`, paddingBottom: '10px', marginBottom: '8px' }}>
            Live Audio Transcript
          </div>
          
          {messages.map((msg, idx) => {
            const display = AGENT_DISPLAY[msg.agent] || { color: b.silver, initials: '?' };
            const isActive = currentMessageIndex === idx;
            
            return (
              <div key={idx} style={{ 
                display: 'flex', gap: '12px', 
                opacity: (isPlaying && !isActive && currentMessageIndex !== -1) ? 0.4 : 1,
                transition: 'opacity 0.3s'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  background: '#000', border: `2px solid ${display.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: display.color, fontSize: '12px', fontWeight: 700,
                  boxShadow: isActive ? `0 0 12px ${display.color}40` : 'none',
                }}>
                  {display.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: display.color }}>{msg.agent}</span>
                    {isActive && (
                      <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                        <div style={{ width: '4px', height: '4px', background: display.color, borderRadius: '50%', animation: 'breathe 1s infinite' }} />
                        <div style={{ width: '4px', height: '4px', background: display.color, borderRadius: '50%', animation: 'breathe 1s infinite 0.2s' }} />
                        <div style={{ width: '4px', height: '4px', background: display.color, borderRadius: '50%', animation: 'breathe 1s infinite 0.4s' }} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: isActive ? b.white : b.silver, lineHeight: '1.6' }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Extracted Ideas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: b.amber, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              3 New Site Features
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: b.white }}>1. Agent Roundtable Live</div>
                <div style={{ fontSize: '12px', color: b.smoke, marginTop: '4px', lineHeight: '1.5' }}>Make the roundtable public for users to watch the agents debate in a Bloomberg-terminal style UI.</div>
              </div>
              <div style={{ height: '1px', background: b.border }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: b.white }}>2. The Pit Dashboard</div>
                <div style={{ fontSize: '12px', color: b.smoke, marginTop: '4px', lineHeight: '1.5' }}>Live options flow tracking integrated onto the site. Charge $49/mo for premium access.</div>
              </div>
              <div style={{ height: '1px', background: b.border }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: b.white }}>3. X/Twitter Content Clipper</div>
                <div style={{ fontSize: '12px', color: b.smoke, marginTop: '4px', lineHeight: '1.5' }}>Automatically clip winning trades and OS updates to draft daily high-engagement X posts.</div>
              </div>
            </div>
          </div>

          <div style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              2 Pure Business Ideas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: b.white }}>1. Restaurant AI Setup Box</div>
                <div style={{ fontSize: '12px', color: b.smoke, marginTop: '4px', lineHeight: '1.5' }}>Pre-configured Mac Mini with Tony/Remy for local restaurants. $500/mo hardware + AI lease for mom and pop diners.</div>
              </div>
              <div style={{ height: '1px', background: b.border }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: b.white }}>2. Vibe Coder Accelerator</div>
                <div style={{ fontSize: '12px', color: b.smoke, marginTop: '4px', lineHeight: '1.5' }}>A paid cohort-based community teaching non-coders how to build $10K MRR apps using AI tools and the 7 Layer Framework.</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

