'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { brand, styles } from '@/lib/brand';
import { Bot, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  from: 'user' | 'agent';
  agent?: string;
  message: string;
  timestamp: Date;
}

const AGENTS = [
  { id: 'milo', name: 'Milo', role: 'Chief of Staff', color: '#A855F7', initials: 'MI', image: '/os/agents/milo.png' },
  { id: 'anders', name: 'Anders', role: 'Full Stack Architect', color: '#FF8C00', initials: 'AN', image: '/os/agents/anders.png' },
  { id: 'paula', name: 'Paula', role: 'Creative Director', color: '#E91E8C', initials: 'PA', image: '/os/agents/paula.png' },
  { id: 'bobby', name: 'Bobby', role: 'Trading Advisor', color: '#00A000', initials: 'BO', image: '/os/agents/bobby.png' },
  { id: 'dwight', name: 'Dwight', role: 'Intelligence', color: '#7B68EE', initials: 'DW', image: '/os/agents/dwight.png' },
  { id: 'tony', name: 'Tony', role: 'Operations', color: '#F4D03F', initials: 'TN', image: '/os/agents/tony.png' },
  { id: 'dax', name: 'Dax', role: 'Content Writer', color: '#00FFFF', initials: 'DX', image: '/os/agents/dax.png' },
  { id: 'remy', name: 'Remy', role: 'Marketing', color: '#E53935', initials: 'RM', image: '/os/agents/remy.png' },
  { id: 'webb', name: 'Webb', role: 'Deep Research', color: '#2979FF', initials: 'WB', image: '/os/agents/webb.png' },
  { id: 'wendy', name: 'Wendy', role: 'Personal Assistant', color: '#8B5CF6', initials: 'WN', image: '/os/agents/wendy.png' },
];

export default function AgentsDirectChat() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      message: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');
    setLoading(true);

    try {
      // Send message to OpenClaw Gateway API
      const response = await fetch('/api/gateway/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: currentMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'agent',
        agent: selectedAgent.id,
        message: data.response || `Response received from ${selectedAgent.name}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'agent',
        agent: selectedAgent.id,
        message: 'Sorry, I encountered an error connecting to the agent. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 40px)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={styles.h1}>Direct Agent Chat</h1>
          <p style={styles.subtitle}>Talk directly with any agent in real-time</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '280px 1fr', 
          gap: '20px', 
          height: 'calc(100vh - 160px)'
        }}>
          
          {/* Agent Selector */}
          <div style={styles.card}>
            <h3 style={{ 
              color: brand.amber, 
              fontSize: '16px', 
              fontWeight: 600, 
              marginBottom: '16px' 
            }}>
              Select Agent
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {AGENTS.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedAgent.id === agent.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                    border: selectedAgent.id === agent.id ? `1px solid ${brand.amber}` : `1px solid transparent`,
                    transition: 'all 0.2s',
                  }}
                >
                  {agent.image ? (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#000000',
                    }}>
                      <Image src={agent.image} alt={agent.name} width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#000000',
                      border: `2px solid ${agent.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: agent.color,
                      fontWeight: 700,
                      fontSize: '12px',
                    }}>
                      {agent.initials}
                    </div>
                  )}
                  <div>
                    <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>
                      {agent.name}
                    </div>
                    <div style={{ color: brand.smoke, fontSize: '12px' }}>
                      {agent.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{
            ...styles.card,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
          }}>
            
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${brand.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: brand.graphite,
            }}>
              {selectedAgent.image ? (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: '#000000',
                }}>
                  <Image src={selectedAgent.image} alt={selectedAgent.name} width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#000000',
                  border: `2px solid ${selectedAgent.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedAgent.color,
                  fontWeight: 700,
                  fontSize: '12px',
                }}>
                  {selectedAgent.initials}
                </div>
              )}
              <div>
                <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>
                  {selectedAgent.name}
                </div>
                <div style={{ color: brand.smoke, fontSize: '12px' }}>
                  {selectedAgent.role}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {messages.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: brand.smoke,
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <Bot size={48} style={{ opacity: 0.3 }} />
                  <p>Start a conversation with {selectedAgent.name}</p>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  {msg.from === 'user' ? (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: `2px solid ${brand.amber}`,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <Image src="/derek-avatar.png" alt="Derek" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.25)' }} />
                    </div>
                  ) : selectedAgent.image ? (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#000000',
                      flexShrink: 0,
                    }}>
                      <Image src={selectedAgent.image} alt={selectedAgent.name} width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#000000',
                      border: `2px solid ${selectedAgent.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedAgent.color,
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: '10px',
                    }}>
                      {selectedAgent.initials}
                    </div>
                  )}

                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.from === 'user' ? 'rgba(245,158,11,0.1)' : brand.graphite,
                    border: msg.from === 'user' ? `1px solid ${brand.amber}` : `1px solid ${brand.border}`,
                  }}>
                    <div style={{
                      color: brand.white,
                      fontSize: '14px',
                      lineHeight: '1.5',
                      marginBottom: '4px',
                    }}>
                      {msg.message}
                    </div>
                    <div style={{
                      color: brand.smoke,
                      fontSize: '11px',
                      textAlign: msg.from === 'user' ? 'right' : 'left',
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  {selectedAgent.image ? (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#000000',
                    }}>
                      <Image src={selectedAgent.image} alt={selectedAgent.name} width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#000000',
                      border: `2px solid ${selectedAgent.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedAgent.color,
                      fontWeight: 700,
                      fontSize: '10px',
                    }}>
                      {selectedAgent.initials}
                    </div>
                  )}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: brand.graphite,
                    border: `1px solid ${brand.border}`,
                    color: brand.smoke,
                    fontSize: '14px',
                  }}>
                    <span style={{ opacity: 0.6 }}>typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '16px 20px',
              borderTop: `1px solid ${brand.border}`,
              background: brand.graphite,
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Message ${selectedAgent.name}...`}
                  style={{
                    flex: 1,
                    background: brand.carbon,
                    border: `1px solid ${brand.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                    color: brand.white,
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    minHeight: '44px',
                    maxHeight: '120px',
                    fontFamily: 'inherit',
                  }}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || loading}
                  style={{
                    background: message.trim() ? brand.amber : brand.graphite,
                    color: message.trim() ? brand.void : brand.smoke,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: message.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}