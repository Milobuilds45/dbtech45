export default function QuickLinks() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '700px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>cat ~/.bookmarks</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>🔗 Quick Links</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Essential tools and resources for daily operations.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>🚀 Development</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://vercel.com/dashboard" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Vercel Dashboard
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://github.com/7LayerLabs" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → GitHub Repos
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://supabase.com/dashboard" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Supabase Console
              </a>
            </div>
            <div>
              <a href="https://console.anthropic.com" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Claude Console
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>📈 Trading</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://thinkorswim.tdameritrade.com" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → ThinkOrSwim
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://tradingview.com" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → TradingView
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://finviz.com" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → FinViz Screener
              </a>
            </div>
            <div>
              <a href="https://fred.stlouisfed.org" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → FRED Economic Data
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>🍽️ Restaurant</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="#" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → POS System
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="#" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Inventory Manager
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="#" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Staff Scheduling
              </a>
            </div>
            <div>
              <a href="#" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Cost Tracker
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>🤖 AI Tools</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="/model-counsel" style={{ color: '#999', textDecoration: 'none' }}>
                → Model Counsel
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://claude.ai" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Claude.ai
              </a>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <a href="https://chat.openai.com" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → ChatGPT
              </a>
            </div>
            <div>
              <a href="https://gemini.google.com" target="_blank" style={{ color: '#999', textDecoration: 'none' }}>
                → Gemini
              </a>
            </div>
          </div>

        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button style={{ 
              backgroundColor: '#333', 
              color: '#00ff00', 
              padding: '0.5rem 1rem', 
              border: '1px solid #00ff00', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              New Deployment
            </button>
            <button style={{ 
              backgroundColor: '#333', 
              color: '#3b82f6', 
              padding: '0.5rem 1rem', 
              border: '1px solid #3b82f6', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              Check Markets
            </button>
            <button style={{ 
              backgroundColor: '#333', 
              color: '#ffaa00', 
              padding: '0.5rem 1rem', 
              border: '1px solid #ffaa00', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              Add Todo
            </button>
            <button style={{ 
              backgroundColor: '#333', 
              color: '#22c55e', 
              padding: '0.5rem 1rem', 
              border: '1px solid #22c55e', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              New Idea
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}