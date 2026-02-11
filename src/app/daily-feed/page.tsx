export default function DailyFeed() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>tail -f /var/log/daily-feed.log</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>📰 Daily Feed</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Real-time updates from projects, markets, and team activity.</p>
        
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 20:58:00</span>
          <span style={{ color: '#00ff00', marginLeft: '1rem' }}>[DEPLOY]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            Anders fixed OS navigation links - all sidebar items now functional
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 20:45:00</span>
          <span style={{ color: '#3b82f6', marginLeft: '1rem' }}>[BUILD]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            dbtech45.com redesign deployed to production - terminal theme active
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 15:30:00</span>
          <span style={{ color: '#ffaa00', marginLeft: '1rem' }}>[MARKET]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            Bobby signals: ES breaking 5480 resistance, watching for retest and hold
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 14:15:00</span>
          <span style={{ color: '#8b5cf6', marginLeft: '1rem' }}>[TASK]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            Sunday Squares payment integration 95% complete - launching Feb 12
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 12:00:00</span>
          <span style={{ color: '#22c55e', marginLeft: '1rem' }}>[IDEA]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            New vault entry: Voice Trading Journal - AI assistant for trade logging
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 10:45:00</span>
          <span style={{ color: '#ef4444', marginLeft: '1rem' }}>[ALERT]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            VIX compression to 14-handle - complacency zone, hedges cheap
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 09:30:00</span>
          <span style={{ color: '#3b82f6', marginLeft: '1rem' }}>[BUILD]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            Soul Solace mood tracking UI mockups completed by Paula
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>2026-02-10 08:00:00</span>
          <span style={{ color: '#ffaa00', marginLeft: '1rem' }}>[MARKET]</span>
          <span style={{ color: '#999', marginLeft: '1rem' }}>
            Pre-market: BTC reclaiming 67K with volume - momentum flip confirmed
          </span>
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Feed Controls</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
              [DEPLOY] Filter
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
              [BUILD] Filter
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
              [MARKET] Filter
            </button>
            <button style={{ 
              backgroundColor: '#333', 
              color: '#999', 
              padding: '0.5rem 1rem', 
              border: '1px solid #999', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              Clear Filters
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