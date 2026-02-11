export default function Projects() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>ls -la /projects/</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>🔷 Active Projects</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Real tools for real problems. Every project starts with friction and ends with a shipped product.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#00ff00', margin: 0 }}>📈 tickR</h3>
              <span style={{ color: '#ffff00', fontSize: '12px' }}>● Building</span>
            </div>
            <p style={{ color: '#999', marginBottom: '1rem' }}>Real-time trading dashboard with AI-powered signals, journaling, and performance analytics.</p>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Progress: </span>
              <span style={{ color: '#00ff00' }}>75%</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Due: </span>
              <span style={{ color: '#ffff00' }}>Feb 28</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#00ff00', margin: 0 }}>🏈 Sunday Squares</h3>
              <span style={{ color: '#00ff00', fontSize: '12px' }}>● Ready</span>
            </div>
            <p style={{ color: '#999', marginBottom: '1rem' }}>Football squares game app — digital pools for game day with auto-scoring and payouts.</p>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Progress: </span>
              <span style={{ color: '#00ff00' }}>95%</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Launch: </span>
              <span style={{ color: '#00ff00' }}>Feb 12</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#00ff00', margin: 0 }}>🧘 Soul Solace</h3>
              <span style={{ color: '#ffff00', fontSize: '12px' }}>● Building</span>
            </div>
            <p style={{ color: '#999', marginBottom: '1rem' }}>AI-powered mental wellness companion — daily reflections, mood tracking, guided support.</p>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Progress: </span>
              <span style={{ color: '#ffff00' }}>60%</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Due: </span>
              <span style={{ color: '#ffff00' }}>Mar 1</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#00ff00', margin: 0 }}>🌍 Boundless</h3>
              <span style={{ color: '#ffff00', fontSize: '12px' }}>● Shaping</span>
            </div>
            <p style={{ color: '#999', marginBottom: '1rem' }}>Travel planning tool with AI-curated itineraries, budget tracking, and local insights.</p>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Progress: </span>
              <span style={{ color: '#ff9900' }}>40%</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#999' }}>Due: </span>
              <span style={{ color: '#ff9900' }}>Feb 17</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}