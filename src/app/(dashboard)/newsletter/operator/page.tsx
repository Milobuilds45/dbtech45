export default function Operator() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>subscribe --newsletter operator</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>⚙️ The Operator</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Business building, productivity systems, and the art of execution.</p>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ color: '#00ff00', marginBottom: '1rem' }}>What You Get Weekly</h2>
          <div style={{ color: '#999' }}>
            <p style={{ marginBottom: '0.5rem' }}>✅ Restaurant operation insights</p>
            <p style={{ marginBottom: '0.5rem' }}>✅ Software building lessons</p>
            <p style={{ marginBottom: '0.5rem' }}>✅ AI agent management tactics</p>
            <p style={{ marginBottom: '0.5rem' }}>✅ Productivity systems that scale</p>
            <p>✅ Real case studies from the trenches</p>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Subscribe</h3>
          <input 
            type="email" 
            placeholder="your.email@domain.com"
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
          <button style={{ 
            backgroundColor: '#00ff00', 
            color: '#000', 
            padding: '0.75rem 2rem', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace',
            width: '100%'
          }}>
            Join The Operator →
          </button>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to dbtech45.com</a>
        </div>
      </div>
    </div>
  );
}