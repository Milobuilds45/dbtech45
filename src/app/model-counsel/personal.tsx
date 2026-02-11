'use client';

import { useState } from 'react';

// Derek's personal API keys (pre-configured)
const DEREK_API_KEYS = {
  anthropic: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || 'sk-ant-api03-derek-key-here',
  openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'sk-proj-derek-key-here',
  google: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 'derek-google-key-here',
  groq: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'gsk_derek-groq-key-here'
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  responseTime?: number;
}

const MODELS = [
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'anthropic', description: 'Most capable. Deep reasoning and analysis.' },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', description: 'Balanced speed and capability.' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'Strong at code and structured reasoning.' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', description: 'Advanced reasoning with huge context.' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', description: 'Fast responses with good quality.' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'groq', description: 'Open source via Groq. Very fast.' }
];

export default function PersonalModelCounsel() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      // Call the appropriate API based on selected model
      const response = await fetch('/api/personal-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          provider: selectedModel.provider,
          message: input.trim(),
          apiKey: DEREK_API_KEYS[selectedModel.provider as keyof typeof DEREK_API_KEYS]
        })
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          model: selectedModel.name,
          responseTime
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        model: selectedModel.name,
        responseTime: Date.now() - startTime
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      background: '#0f0f17',
      color: '#e2e8f0',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', padding: '40px 0' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>
            Derek's Model Counsel
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>
            Personal AI testing interface - Different models for different reasoning
          </p>
        </div>

        {/* Model Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>Select Model for Testing:</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {MODELS.map(model => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model)}
                style={{
                  background: selectedModel.id === model.id ? '#1f2937' : '#16172a',
                  border: selectedModel.id === model.id ? '2px solid #22c55e' : '1px solid #2a2d3a',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{model.name}</div>
                  {selectedModel.id === model.id && (
                    <div style={{ 
                      background: '#22c55e', 
                      color: 'white',
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Selected
                    </div>
                  )}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>{model.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div style={{
          background: '#1a1b26',
          border: '1px solid #2a2d3a',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #2a2d3a'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#22c55e' }}>
                Testing: {selectedModel.name}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {selectedModel.description}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            marginBottom: '20px',
            padding: '16px',
            background: '#16172a',
            borderRadius: '8px',
            border: '1px solid #2a2d3a'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                Ready to test {selectedModel.name}. Ask a question to compare reasoning approaches.
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  marginLeft: message.role === 'user' ? 'auto' : '0',
                  background: message.role === 'user' ? '#3b82f6' : '#22c55e',
                  color: 'white'
                }}>
                  <div>{message.content}</div>
                  {message.model && message.responseTime && (
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.8, 
                      marginTop: '8px' 
                    }}>
                      {message.model} • {message.responseTime}ms
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#22c55e',
                color: 'white',
                opacity: 0.7
              }}>
                {selectedModel.name} is thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Test ${selectedModel.name} reasoning...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#16172a',
                border: '1px solid #2a2d3a',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                resize: 'none',
                minHeight: '60px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                background: input.trim() && !isLoading ? '#3b82f6' : '#374151',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
            >
              {isLoading ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px', 
          color: '#64748b', 
          fontSize: '14px' 
        }}>
          Personal Model Counsel • API keys pre-configured • Compare reasoning approaches
        </div>
      </div>
    </div>
  );
}