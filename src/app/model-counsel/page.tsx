'use client';

export default function ModelCounselPage() {
  return (
    <div style={{ 
      background: '#0f0f17', 
      color: '#e2e8f0', 
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '20px' }}>
          Model Counsel
        </h1>
        <div style={{ 
          background: '#f59e0b', 
          color: '#000', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2>🚧 Under Construction</h2>
          <p>Derek's personal AI testing interface - API keys being configured</p>
        </div>
        <div style={{ 
          background: '#1a1b26', 
          border: '1px solid #2a2d3a', 
          borderRadius: '12px', 
          padding: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#22c55e', marginBottom: '16px' }}>Coming Soon:</h3>
          <ul style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            <li>✅ Claude Opus 4.6 - Deep reasoning and analysis</li>
            <li>✅ Claude Sonnet 4.5 - Balanced speed and capability</li>
            <li>✅ GPT-4 Turbo - Strong at code and structured reasoning</li>
            <li>✅ Gemini 2.5 Pro - Advanced reasoning with huge context</li>
            <li>✅ Gemini 2.5 Flash - Fast responses with good quality</li>
            <li>✅ Llama 3.3 70B - Open source via Groq (very fast)</li>
          </ul>
          <p style={{ color: '#64748b', marginTop: '20px', fontSize: '14px' }}>
            Personal testing interface for comparing different AI models and reasoning approaches
          </p>
        </div>
      </div>
    </div>
  );
}