export default function Kanban() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>kanban --init</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>📋 Kanban</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Project management board - Coming soon</p>
        
        <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#ffaa00', fontSize: '48px', marginBottom: '1rem' }}>🚧</div>
          <h3 style={{ color: '#ffaa00', marginBottom: '1rem' }}>Under Construction</h3>
          <p style={{ color: '#999' }}>This feature is being built. Check back soon!</p>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}