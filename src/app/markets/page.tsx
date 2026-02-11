export default function Markets() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>market --status</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>📈 The Pit</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Futures, macro, conviction trades. Where the edge lives.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>ES</div>
            <div style={{ color: '#00ff00', fontSize: '18px', fontWeight: 'bold' }}>5,487.25</div>
            <div style={{ color: '#00ff00', fontSize: '12px' }}>+0.82%</div>
          </div>
          <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>NQ</div>
            <div style={{ color: '#00ff00', fontSize: '18px', fontWeight: 'bold' }}>19,812.50</div>
            <div style={{ color: '#00ff00', fontSize: '12px' }}>+1.14%</div>
          </div>
          <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>SPY</div>
            <div style={{ color: '#00ff00', fontSize: '18px', fontWeight: 'bold' }}>547.32</div>
            <div style={{ color: '#00ff00', fontSize: '12px' }}>+0.76%</div>
          </div>
          <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>VIX</div>
            <div style={{ color: '#ff6666', fontSize: '18px', fontWeight: 'bold' }}>14.28</div>
            <div style={{ color: '#ff6666', fontSize: '12px' }}>-3.12%</div>
          </div>
          <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>BTC</div>
            <div style={{ color: '#00ff00', fontSize: '18px', fontWeight: 'bold' }}>67,842</div>
            <div style={{ color: '#00ff00', fontSize: '12px' }}>+2.41%</div>
          </div>
          <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>10Y</div>
            <div style={{ color: '#ff6666', fontSize: '18px', fontWeight: 'bold' }}>4.287</div>
            <div style={{ color: '#ff6666', fontSize: '12px' }}>-0.58%</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>📡 Live Signals</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>09:34 ET</span>
            <span style={{ color: '#00ff00', marginLeft: '1rem' }}>INFO</span>
            <span style={{ color: '#999', marginLeft: '1rem' }}>ES breaking above 5,480 resistance — watching for retest and hold</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>08:15 ET</span>
            <span style={{ color: '#ffff00', marginLeft: '1rem' }}>WARN</span>
            <span style={{ color: '#999', marginLeft: '1rem' }}>VIX compression to 14-handle — complacency zone, hedges cheap here</span>
          </div>
          <div>
            <span style={{ color: '#666' }}>07:02 ET</span>
            <span style={{ color: '#ff9900', marginLeft: '1rem' }}>HOT</span>
            <span style={{ color: '#999', marginLeft: '1rem' }}>BTC reclaiming 67K with volume — momentum flip confirmed on 4H</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>🤖 Powered by Bobby AI</h3>
          <p style={{ color: '#999' }}>
            Trading advisor AI processing market data 24/7. Risk management, signal generation, 
            and macro analysis powered by 15 years of trading experience.
          </p>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}