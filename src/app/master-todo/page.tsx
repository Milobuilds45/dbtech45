export default function MasterTodo() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>todo --list --priority</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>📋 Master Todo</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Central task management across all projects and operations.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ff4444' }}>
            <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>🚨 Critical - Today</h3>
            
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Sunday Squares payment integration</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Anders • Due: EOD</div>
            </div>
            
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Model Counsel API restoration</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Anders • Due: EOD</div>
            </div>
            
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Fix dbtech45.com navigation links</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Anders • Due: Now</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ffaa00' }}>
            <h3 style={{ color: '#ffaa00', marginBottom: '1rem' }}>⚡ High - This Week</h3>
            
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Soul Solace mood tracking UI</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Paula & Anders • Due: Wed</div>
            </div>
            
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Signal & Noise newsletter draft</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Grant • Due: Fri</div>
            </div>
            
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>tickR signal generation testing</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Bobby • Due: Thu</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #00ff00' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>📅 Medium - Next Week</h3>
            
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Boundless itinerary AI training</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Webb • Due: Feb 17</div>
            </div>
            
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Restaurant cost tracker design</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Paula • Due: Feb 18</div>
            </div>
            
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Family calendar AI testing</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Tony • Due: Feb 20</div>
            </div>
          </div>
          
        </div>

        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>Add New Task</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Task description..."
              style={{ 
                padding: '0.75rem', 
                backgroundColor: '#222', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}
            />
            <select 
              style={{ 
                padding: '0.75rem', 
                backgroundColor: '#222', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}
            >
              <option>Select Priority</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <button style={{ 
            backgroundColor: '#00ff00', 
            color: '#000', 
            padding: '0.75rem 2rem', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace',
            marginTop: '1rem'
          }}>
            Add Task →
          </button>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}