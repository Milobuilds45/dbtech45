export default function SundaySquares() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>./squares --generate</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>🏈 Sunday Squares</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Digital football squares for your game day pool. Auto-scoring, payout tracking, and shareable boards.</p>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ color: '#00ff00', marginBottom: '1rem' }}>🚀 95% Complete - Launch Ready!</h2>
          <div style={{ color: '#999', marginBottom: '1rem' }}>
            <p>✅ Grid generation with random number assignment</p>
            <p>✅ Auto-scoring from live game data</p>
            <p>✅ Payout tracking and calculations</p>
            <p>✅ Shareable game boards</p>
            <p>🔧 Payment integration (Stripe) - In progress</p>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <button style={{ 
              backgroundColor: '#00ff00', 
              color: '#000', 
              padding: '0.75rem 2rem', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
              marginRight: '1rem'
            }}>
              Demo Game Board →
            </button>
            
            <button style={{ 
              backgroundColor: '#333', 
              color: '#00ff00', 
              padding: '0.75rem 2rem', 
              border: '1px solid #00ff00', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}>
              Join Beta List →
            </button>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>How It Works</h3>
          <div style={{ color: '#999' }}>
            <p style={{ marginBottom: '0.5rem' }}>1. <span style={{ color: '#00ff00' }}>Create Game</span> - Set up your squares pool</p>
            <p style={{ marginBottom: '0.5rem' }}>2. <span style={{ color: '#00ff00' }}>Share Link</span> - Friends join and buy squares</p>
            <p style={{ marginBottom: '0.5rem' }}>3. <span style={{ color: '#00ff00' }}>Auto-Score</span> - Live game data calculates winners</p>
            <p>4. <span style={{ color: '#00ff00' }}>Get Paid</span> - Automatic payouts via Venmo/PayPal</p>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Launch Timeline</h3>
          <div style={{ color: '#999' }}>
            <p><span style={{ color: '#ffff00' }}>Feb 12</span> - Payment integration complete</p>
            <p><span style={{ color: '#ffff00' }}>Feb 13</span> - Beta testing with friends</p>
            <p><span style={{ color: '#00ff00' }}>Feb 16</span> - Public launch for playoff games</p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to dbtech45.com</a>
        </div>
      </div>
    </div>
  );
}