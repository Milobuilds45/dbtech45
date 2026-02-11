export default function DadStack() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>subscribe --newsletter dad-stack</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦 Dad Stack</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Parenting seven kids while building companies. Real talk about balance and priorities.</p>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ color: '#00ff00', marginBottom: '1rem' }}>What You Get Weekly</h2>
          <div style={{ color: '#999' }}>
            <p style={{ marginBottom: '0.5rem' }}>✅ Time management with 7 kids</p>
            <p style={{ marginBottom: '0.5rem' }}>✅ Building while parenting</p>
            <p style={{ marginBottom: '0.5rem' }}>✅ Family systems that scale</p>
            <p style={{ marginBottom: '0.5rem' }}>✅ Teaching kids about entrepreneurship</p>
            <p>✅ What actually matters in life</p>
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
            Join Dad Stack →
          </button>
        </div>
        
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>The Reality</h3>
          <p style={{ color: '#999' }}>
            No Instagram-perfect parenting here. Just honest insights from someone juggling 
            seven kids, four restaurants, and multiple software projects. The messy truth about 
            what works and what doesn't.
          </p>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to dbtech45.com</a>
        </div>
      </div>
    </div>
  );
}