export default function IdeasVault() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>vault --list --ideas</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>💡 Ideas Vault</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Capture, organize, and develop ideas. From spark to execution.</p>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Add New Idea</h3>
          <input 
            type="text" 
            placeholder="What's the idea?"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: '#222', 
              border: '1px solid #333', 
              borderRadius: '4px', 
              color: '#00ff00',
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}
          />
          <textarea 
            placeholder="Expand on it..."
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: '#222', 
              border: '1px solid #333', 
              borderRadius: '4px', 
              color: '#00ff00',
              fontFamily: 'monospace',
              height: '80px',
              resize: 'none',
              marginBottom: '1rem'
            }}
          />
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
            Vault It →
          </button>
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#00ff00', margin: 0 }}>Voice Trading Journal</h4>
            <span style={{ color: '#ffff00', fontSize: '12px' }}>● Hot</span>
          </div>
          <p style={{ color: '#999', marginBottom: '0.5rem' }}>
            AI voice assistant that listens to trades and automatically journals them. 
            Just speak your entries/exits and it logs everything.
          </p>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Added: Feb 8 • Priority: High • Status: Spark
          </div>
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#00ff00', margin: 0 }}>Family Task Coordinator</h4>
            <span style={{ color: '#00ff00', fontSize: '12px' }}>● Building</span>
          </div>
          <p style={{ color: '#999', marginBottom: '0.5rem' }}>
            AI that automatically assigns and tracks household tasks across 9 family members. 
            Smart scheduling based on availability and preferences.
          </p>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Added: Feb 5 • Priority: High • Status: Prototype
          </div>
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#00ff00', margin: 0 }}>Receipt Text Extractor</h4>
            <span style={{ color: '#666', fontSize: '12px' }}>● Archived</span>
          </div>
          <p style={{ color: '#999', marginBottom: '0.5rem' }}>
            Snap photo of receipt, automatically extract line items and categorize expenses. 
            Perfect for restaurant cost tracking.
          </p>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Added: Jan 28 • Priority: Medium • Status: Complete
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}