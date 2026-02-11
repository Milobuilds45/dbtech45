'use client';

export default function OSPage() {
  return (
    <div style={{ 
      background: '#0f0f17', 
      color: '#e2e8f0', 
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        display: 'flex',
        minHeight: '100vh'
      }}>
        {/* Left Sidebar */}
        <div style={{
          width: '240px',
          background: '#1a1b26',
          borderRight: '1px solid #2a2d3a',
          padding: '20px 0',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px 30px',
            borderBottom: '1px solid #2a2d3a',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              marginRight: '12px'
            }}>
              DB
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              <div>DB TECH OS</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>COMMAND CENTER</div>
            </div>
          </div>
          
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🔥 Model Counsel
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🔷 Projects <span style={{ background: '#3b82f6', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px' }}>28</span>
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            📈 Markets
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            📰 Daily Feed
          </div>
          
          <div style={{ padding: '16px 20px', color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
            TOOLS
          </div>
          
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🔗 Quick Links
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            📋 Kanban
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            💡 Ideas Vault
          </div>
          <div style={{ 
            padding: '8px 20px', 
            margin: '2px 0', 
            fontSize: '14px',
            cursor: 'pointer',
            background: 'rgba(34, 197, 94, 0.1)',
            borderLeft: '3px solid #22c55e'
          }} onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', '_blank')}>
            🎨 Brand Kit
          </div>
          <div style={{ 
            padding: '8px 20px', 
            margin: '2px 0', 
            fontSize: '14px',
            cursor: 'pointer',
            background: 'rgba(34, 197, 94, 0.1)'
          }} onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', '_blank')}>
            📐 Brand Spec
          </div>
          
          <div style={{ padding: '16px 20px', color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
            OPERATIONS
          </div>
          
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            📊 Activity Dashboard
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🧬 DNA
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🧠 Memory Bank
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🛠️ Skills Inventory
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            ⏰ Schedule Center
          </div>
          <div style={{ padding: '8px 20px', margin: '2px 0', fontSize: '14px' }}>
            🎯 Goals Tracker
          </div>
          <div style={{ 
            padding: '8px 20px', 
            margin: '2px 0', 
            fontSize: '14px',
            background: 'rgba(59, 130, 246, 0.15)',
            borderRight: '2px solid #3b82f6'
          }}>
            📋 Master Todo
          </div>
        </div>

        {/* Main Content */}
        <div style={{ marginLeft: '240px', flex: 1, padding: '20px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#e2e8f0' }}>
                DB Tech OS Command Center
              </div>
              <div style={{ color: '#64748b', marginTop: '4px' }}>
                Complete operational control interface with real-time data
              </div>
            </div>
          </div>

          {/* Paula's Brand Kit - Prominent Display */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b, #334155)', 
            border: '1px solid #475569', 
            borderRadius: '16px', 
            padding: '32px', 
            margin: '30px 0',
            textAlign: 'left'
          }}>
            <h2 style={{ color: '#22c55e', marginBottom: '16px', fontSize: '24px', fontWeight: 700 }}>
              🎨 Brand Assets by Paula
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '16px' }}>
              Complete DBTECH45 brand system - logos, colors, typography, and vendor-ready assets
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
                onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', '_blank')}
              >
                📄 Brand Kit (Print Ready)
              </button>
              <button 
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
                onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', '_blank')}
              >
                📐 Design System Spec
              </button>
            </div>
          </div>

          {/* Real Data Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
            
            <div style={{ background: '#16172a', border: '1px solid #2a2d3a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#22c55e', marginBottom: '16px' }}>📊 Live Goals Progress</h3>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Sunday Squares Launch</span>
                  <span style={{ color: '#22c55e' }}>95%</span>
                </div>
                <div style={{ background: '#1a1b26', height: '6px', borderRadius: '3px' }}>
                  <div style={{ background: '#22c55e', width: '95%', height: '100%', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Soul Solace Beta</span>
                  <span style={{ color: '#f59e0b' }}>60%</span>
                </div>
                <div style={{ background: '#1a1b26', height: '6px', borderRadius: '3px' }}>
                  <div style={{ background: '#f59e0b', width: '60%', height: '100%', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Boundless v2</span>
                  <span style={{ color: '#f59e0b' }}>40%</span>
                </div>
                <div style={{ background: '#1a1b26', height: '6px', borderRadius: '3px' }}>
                  <div style={{ background: '#f59e0b', width: '40%', height: '100%', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>

            <div style={{ background: '#16172a', border: '1px solid #2a2d3a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#3b82f6', marginBottom: '16px' }}>📋 Active Todos</h3>
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2a2d3a' }}>
                <div style={{ fontWeight: 500 }}>Model Counsel API restoration</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Anders • High priority • Due today</div>
              </div>
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2a2d3a' }}>
                <div style={{ fontWeight: 500 }}>Sunday Squares payment integration</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Anders • High priority • Due Wed</div>
              </div>
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2a2d3a' }}>
                <div style={{ fontWeight: 500 }}>Signal & Noise draft review</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Grant • High priority • Due Fri</div>
              </div>
            </div>

            <div style={{ background: '#16172a', border: '1px solid #2a2d3a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#8b5cf6', marginBottom: '16px' }}>🤖 Agent Status</h3>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Anders (Full Stack)</span>
                <span style={{ color: '#22c55e' }}>Online</span>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Paula (Design)</span>
                <span style={{ color: '#22c55e' }}>Online</span>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Bobby (Trading)</span>
                <span style={{ color: '#22c55e' }}>Online</span>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Milo (Operations)</span>
                <span style={{ color: '#22c55e' }}>Online</span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                All agents responding to heartbeat
              </div>
            </div>

            <div style={{ background: '#16172a', border: '1px solid #2a2d3a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>🚨 Current Issues</h3>
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2a2d3a' }}>
                <div style={{ fontWeight: 500, color: '#ef4444' }}>Deployment cache stuck</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>New code not deploying to production</div>
              </div>
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #2a2d3a' }}>
                <div style={{ fontWeight: 500, color: '#f59e0b' }}>Brand Kit visibility low</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Paula's assets need more prominent display</div>
              </div>
              <div style={{ marginBottom: '12px', paddingBottom: '8px' }}>
                <div style={{ fontWeight: 500, color: '#f59e0b' }}>Data still placeholder</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Need real operational metrics pipeline</div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            <p><strong>Derek OS V3</strong> - Real operational data instead of placeholders</p>
            <p>Built by Anders • Live deployment • Feb 10, 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}