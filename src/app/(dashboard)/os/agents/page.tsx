'use client';
import { useState, useRef, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { Bot, Send, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  from: 'user' | 'agent';
  agent?: string;
  message: string;
  timestamp: Date;
}

const AGENTS = [
  { id: 'milo', name: 'Milo', role: 'Chief of Staff', color: '#A855F7', initials: 'MI' },
  { id: 'anders', name: 'Anders', role: 'Full Stack Architect', color: '#F97316', initials: 'AN' },
  { id: 'paula', name: 'Paula', role: 'Creative Director', color: '#EC4899', initials: 'PA' },
  { id: 'bobby', name: 'Bobby', role: 'Trading Advisor', color: '#22C55E', initials: 'AX' },
  { id: 'dwight', name: 'Dwight', role: 'Intelligence', color: '#6366F1', initials: 'DW' },
  { id: 'tony', name: 'Tony', role: 'Operations', color: '#EAB308', initials: 'TN' },
  { id: 'dax', name: 'Dax', role: 'Data Analyst', color: '#06B6D4', initials: 'DX' },
  { id: 'remy', name: 'Remy', role: 'Marketing', color: '#EF4444', initials: 'RM' },
  { id: 'wendy', name: 'Wendy', role: 'Personal Assistant', color: '#8B5CF6', initials: 'WR' },
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
      // TODO: Replace with actual API call to agent
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'agent',
        agent: selectedAgent.id,
        message: `Hi Derek! This is ${selectedAgent.name}. I received your message: "${currentMessage}". This is a prototype - actual agent integration coming soon!`,
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
        message: 'Sorry, I encountered an error. Please try again.',
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
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: msg.from === 'user' ? '#000000' : '#000000',
                    border: `2px solid ${msg.from === 'user' ? brand.amber : selectedAgent.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: msg.from === 'user' ? brand.amber : selectedAgent.color,
                    flexShrink: 0,
                  }}>
                    {msg.from === 'user' ? (
                      <User size={16} />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: '10px' }}>
                        {selectedAgent.initials}
                      </span>
                    )}
                  </div>

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