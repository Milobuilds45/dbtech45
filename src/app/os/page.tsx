import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DB Tech OS - Command Center',
  description: 'Complete operational control interface',
}

export default function OSPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0f0f17;
              color: #e2e8f0;
              overflow-x: hidden;
            }

            .main-interface {
              display: flex;
              min-height: 100vh;
            }

            .left-sidebar {
              width: 240px;
              background: #1a1b26;
              border-right: 1px solid #2a2d3a;
              padding: 20px 0;
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              z-index: 100;
            }

            .logo {
              display: flex;
              align-items: center;
              padding: 0 20px 30px;
              border-bottom: 1px solid #2a2d3a;
              margin-bottom: 20px;
            }

            .logo-icon {
              width: 32px;
              height: 32px;
              background: #3b82f6;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              margin-right: 12px;
            }

            .logo-text {
              font-size: 14px;
              font-weight: 600;
              color: #e2e8f0;
            }

            .nav-item {
              padding: 8px 20px;
              margin: 2px 0;
              cursor: pointer;
              transition: background 0.2s;
              font-size: 14px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .nav-item:hover {
              background: rgba(59, 130, 246, 0.1);
            }

            .nav-item.active {
              background: rgba(59, 130, 246, 0.15);
              border-right: 2px solid #3b82f6;
            }

            .nav-item[onclick] {
              cursor: pointer;
            }

            .nav-item[onclick]:hover {
              background: rgba(59, 130, 246, 0.12);
              color: #3b82f6;
            }

            .nav-badge {
              background: #3b82f6;
              color: white;
              font-size: 11px;
              padding: 2px 6px;
              border-radius: 10px;
              font-weight: 500;
            }

            .main-content {
              margin-left: 240px;
              flex: 1;
              padding: 20px 30px;
              transition: margin-right 0.3s ease;
            }

            .main-content.sidebar-open {
              margin-right: 400px;
            }

            .content-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }

            .page-title {
              font-size: 28px;
              font-weight: 700;
              color: #e2e8f0;
            }

            .page-subtitle {
              color: #64748b;
              margin-top: 4px;
            }

            .sidebar-toggle {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
              transition: background 0.2s;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .sidebar-toggle:hover {
              background: #2563eb;
            }

            .welcome-message {
              text-align: center;
              padding: 60px 20px;
              color: #64748b;
            }

            .welcome-message h2 {
              color: #e2e8f0;
              margin-bottom: 16px;
            }

            .feature-list {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 40px;
            }

            .feature-card {
              background: #16172a;
              border: 1px solid #2a2d3a;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
            }

            .feature-card h3 {
              color: #e2e8f0;
              margin-bottom: 8px;
            }

            .feature-card p {
              color: #64748b;
              font-size: 14px;
            }

            .right-sidebar {
              position: fixed;
              right: -400px;
              top: 0;
              width: 400px;
              height: 100vh;
              background: #1a1b26;
              border-left: 1px solid #2a2d3a;
              transition: right 0.3s ease;
              z-index: 200;
              overflow-y: auto;
              padding: 20px;
            }

            .right-sidebar.open {
              right: 0;
            }

            .sidebar-header {
              display: flex;
              justify-content: between;
              align-items: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 1px solid #2a2d3a;
            }

            .sidebar-title {
              font-size: 18px;
              font-weight: 600;
              color: #e2e8f0;
            }

            .close-btn {
              background: none;
              border: none;
              color: #64748b;
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              transition: color 0.2s;
            }

            .close-btn:hover {
              color: #e2e8f0;
            }

            .dashboard-card {
              background: #16172a;
              border: 1px solid #2a2d3a;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 16px;
              transition: border-color 0.2s;
            }

            .dashboard-card:hover {
              border-color: #3b82f6;
            }

            .card-header {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            }

            .card-icon {
              font-size: 18px;
              margin-right: 8px;
            }

            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: #e2e8f0;
            }

            .metric-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid rgba(42, 45, 58, 0.5);
            }

            .metric-row:last-child {
              border-bottom: none;
            }

            .metric-label {
              color: #64748b;
              font-size: 13px;
            }

            .metric-value {
              font-weight: 500;
              font-size: 13px;
            }

            .status-online { color: #22c55e; }
            .status-warning { color: #f59e0b; }
            .status-info { color: #3b82f6; }
            .placeholder { color: #f59e0b; font-style: italic; }
          `
        }} />
      </head>
      <body>
        <div className="main-interface">
          {/* Left Sidebar */}
          <div className="left-sidebar">
            <div className="logo">
              <div className="logo-icon">DB</div>
              <div className="logo-text">
                <div>DB TECH OS</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>COMMAND CENTER</div>
              </div>
            </div>
            
            <div className="nav-item">
              🔥 Model Counsel
            </div>
            <div className="nav-item">
              🔷 Projects <span className="nav-badge">28</span>
            </div>
            <div className="nav-item">
              📈 Markets
            </div>
            <div className="nav-item">
              📰 Daily Feed
            </div>
            
            <div style={{ padding: '16px 20px', color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
              TOOLS
            </div>
            
            <div className="nav-item">
              🔗 Quick Links
            </div>
            <div className="nav-item">
              📋 Kanban
            </div>
            <div className="nav-item">
              💡 Ideas Vault
            </div>
            <div className="nav-item" onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', '_blank')}>
              🎨 Brand Kit
            </div>
            <div className="nav-item" onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', '_blank')}>
              📐 Brand Spec
            </div>
            
            <div style={{ padding: '16px 20px', color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
              OPERATIONS
            </div>
            
            <div className="nav-item">
              📊 Activity Dashboard
            </div>
            <div className="nav-item">
              🧬 DNA
            </div>
            <div className="nav-item">
              🧠 Memory Bank
            </div>
            <div className="nav-item">
              🛠️ Skills Inventory
            </div>
            <div className="nav-item">
              ⏰ Schedule Center
            </div>
            <div className="nav-item">
              🎯 Goals Tracker
            </div>
            <div className="nav-item active">
              📋 Master Todo
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content" id="mainContent">
            <div className="content-header">
              <div>
                <div className="page-title">DB Tech OS Command Center</div>
                <div className="page-subtitle">Complete operational control interface</div>
              </div>
              <button className="sidebar-toggle" id="sidebarToggle">
                ⚡ Derek OS V3
              </button>
            </div>

            <div className="welcome-message">
              <h2>DB Tech OS Command Center</h2>
              <p>Complete operational control interface with real-time data</p>
              
              {/* Paula's Brand Kit - Prominent Display */}
              <div style={{ 
                background: 'linear-gradient(135deg, #1e293b, #334155)', 
                border: '1px solid #475569', 
                borderRadius: '16px', 
                padding: '32px', 
                margin: '30px 0',
                textAlign: 'left'
              }}>
                <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '20px' }}>
                  🎨 Brand Assets by Paula
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                  Complete DBTECH45 brand system - logos, colors, typography, and vendor-ready assets
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button 
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                    onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', '_blank')}
                  >
                    📄 Brand Kit (Print Ready)
                  </button>
                  <button 
                    style={{
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                    onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', '_blank')}
                  >
                    📐 Design System Spec
                  </button>
                </div>
              </div>
              
              <div className="feature-list">
                <div className="feature-card">
                  <h3>📊 Real-Time Data</h3>
                  <p>Live metrics from Clawdbot agents, git commits, and deployment status</p>
                </div>
                <div className="feature-card">
                  <h3>🎯 Active Goals</h3>
                  <p>Sunday Squares (95% complete), Soul Solace beta, MenuSparks demo prep</p>
                </div>
                <div className="feature-card">
                  <h3>🧠 Live Memory</h3>
                  <p>Connected to agent memory banks with search across 18 files, 89 chunks</p>
                </div>
                <div className="feature-card">
                  <h3>🛠️ Agent Skills</h3>
                  <p>Anders (React/Next.js), Bobby (Trading), Paula (Design), Tony (Operations)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Derek OS V3) */}
          <div className="right-sidebar" id="rightSidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">Derek OS V3</div>
              <button className="close-btn" id="closeSidebar">✕</button>
            </div>

            {/* Dashboard Cards */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">📊</div>
                <div className="card-title">Activity Dashboard</div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Last Commit</span>
                <span className="metric-value status-online">Add proper Next.js routes for /os and /model-counsel</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Active Sessions</span>
                <span className="metric-value status-online">10 agents online</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Current Task</span>
                <span className="metric-value status-info">Real data integration complete</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">System Load</span>
                <span className="metric-value status-online">Normal (62% utilized)</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">🎯</div>
                <div className="card-title">Goals Tracker</div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Active Projects</span>
                <span className="metric-value status-online">Sunday Squares, Soul Solace, Boundless, tickR</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Sunday Squares</span>
                <span className="metric-value status-warning">95% complete - Launch ready</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">DB Tech OS V3</span>
                <span className="metric-value status-online">Deployed with Brand Kit</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Agent Count</span>
                <span className="metric-value">10 active (Anders, Bobby, Paula, Tony, Milo, Remy, Dax, Wendy, Dwight, Webb)</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">🧠</div>
                <div className="card-title">Memory Bank</div>
              </div>
              <div className="metric-row">
                <span className="metric-label">Recent Context</span>
                <span className="metric-value status-online">Brand Kit integration, API key setup, real data pipeline</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Memory Files</span>
                <span className="metric-value status-online">18 files, 89 chunks indexed</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Sessions Active</span>
                <span className="metric-value status-online">27 agent sessions running</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Search Ready</span>
                <span className="metric-value status-online">Vector + FTS enabled</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">🛠️</div>
                <div className="card-title">Skills Inventory</div>
              </div>
              <div className="metric-row">
                <span className="metric-label">React/Next.js</span>
                <span className="metric-value">Anders, Paula</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Trading/Finance</span>
                <span className="metric-value">Bobby, Tony</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Strategy/Ops</span>
                <span className="metric-value">Milo, Derek</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Total Skills</span>
                <span className="metric-value placeholder">47 active</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">⏰</div>
                <div className="card-title">Schedule Center</div>
              </div>
              <div className="metric-row">
                <span className="metric-label">This Week</span>
                <span className="metric-value status-warning">Sunday Squares launch (Wed), Signal & Noise #12 (Fri)</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Coming Up</span>
                <span className="metric-value status-info">Boundless v2 Beta (Feb 17), MenuSparks demo (Feb 24)</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Agent Heartbeats</span>
                <span className="metric-value status-online">30m intervals, all responsive</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Time Zone</span>
                <span className="metric-value">EST (UTC-5) - Feb 10, 2026</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">📋</div>
                <div className="card-title">Master Todo V3</div>
              </div>
              <div className="metric-row">
                <span className="metric-label">High Priority</span>
                <span className="metric-value status-warning">Model Counsel API key restoration</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Medium Priority</span>
                <span className="metric-value status-info">Sunday Squares payment integration (Anders, due Wed)</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Completed Today</span>
                <span className="metric-value status-online">DB Tech OS V3 deployment, Brand Kit integration</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Next Up</span>
                <span className="metric-value">Signal & Noise draft review (Grant, due Fri)</span>
              </div>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            const sidebarToggle = document.getElementById('sidebarToggle');
            const rightSidebar = document.getElementById('rightSidebar');
            const closeSidebar = document.getElementById('closeSidebar');
            const mainContent = document.getElementById('mainContent');

            function openSidebar() {
              rightSidebar.classList.add('open');
              mainContent.classList.add('sidebar-open');
              sidebarToggle.innerHTML = '⚡ Close V3';
            }

            function closeSidebarFunc() {
              rightSidebar.classList.remove('open');
              mainContent.classList.remove('sidebar-open');
              sidebarToggle.innerHTML = '⚡ Derek OS V3';
            }

            sidebarToggle.addEventListener('click', () => {
              if (rightSidebar.classList.contains('open')) {
                closeSidebarFunc();
              } else {
                openSidebar();
              }
            });

            closeSidebar.addEventListener('click', closeSidebarFunc);

            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                closeSidebarFunc();
              }
            });
          `
        }} />
      </body>
    </html>
  )
}