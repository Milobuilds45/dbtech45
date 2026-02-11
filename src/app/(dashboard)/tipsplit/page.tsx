export default function TipSplit() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>./tipsplit --help</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>💰 TipSplit Pro</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Professional tip calculator built for restaurant workers.</p>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ color: '#00ff00', marginBottom: '1rem' }}>Quick Calculate</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999' }}>Bill Total ($)</label>
            <input 
              type="number" 
              placeholder="125.00"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                backgroundColor: '#222', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999' }}>Tip Percentage (%)</label>
            <input 
              type="number" 
              placeholder="20"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                backgroundColor: '#222', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#999' }}>Split Between People</label>
            <input 
              type="number" 
              placeholder="4"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                backgroundColor: '#222', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}
            />
          </div>
          
          <button style={{ 
            backgroundColor: '#00ff00', 
            color: '#000', 
            padding: '0.75rem 2rem', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}>
            Calculate Split →
          </button>
        </div>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Results</h3>
          <div style={{ color: '#999' }}>
            <p>Tip Amount: <span style={{ color: '#00ff00' }}>$--</span></p>
            <p>Total with Tip: <span style={{ color: '#00ff00' }}>$--</span></p>
            <p>Per Person: <span style={{ color: '#00ff00' }}>$--</span></p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to dbtech45.com</a>
        </div>
      </div>
    </div>
  );
}