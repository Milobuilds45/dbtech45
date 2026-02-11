'use client';

export default function OSPage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
    border: '#222222',
  };

  const goals = [
    { name: 'Sunday Squares Launch', pct: 95, color: b.success },
    { name: 'Soul Solace Beta', pct: 60, color: b.amber },
    { name: 'Boundless v2', pct: 40, color: b.amber },
  ];

  const todos = [
    { title: 'Model Counsel API restoration', meta: 'Anders — High priority — Due today' },
    { title: 'Sunday Squares payment integration', meta: 'Anders — High priority — Due Wed' },
    { title: 'Signal & Noise draft review', meta: 'Grant — High priority — Due Fri' },
  ];

  const agents = [
    { name: 'Anders (Full Stack)', status: 'Online' },
    { name: 'Paula (Design)', status: 'Online' },
    { name: 'Bobby (Trading)', status: 'Online' },
    { name: 'Milo (Operations)', status: 'Online' },
  ];

  const card: React.CSSProperties = {
    background: b.carbon,
    border: `1px solid ${b.border}`,
    borderRadius: '12px',
    padding: '20px',
  };

  return (
    <div style={{ padding: '20px 30px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: b.white }}>Mission Control</div>
        <div style={{ color: b.smoke, marginTop: '4px' }}>Complete operational control interface with real-time data</div>
      </div>

      {/* Brand Assets */}
      <div style={{ background: b.carbon, border: `1px solid ${b.border}`, borderRadius: '16px', padding: '32px', marginBottom: '30px' }}>
        <h2 style={{ color: b.amber, marginBottom: '16px', fontSize: '20px', fontWeight: 700 }}>Brand Assets by Paula</h2>
        <p style={{ color: b.silver, marginBottom: '20px', fontSize: '14px' }}>Complete DBTECH45 brand system — logos, colors, typography, and vendor-ready assets</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button style={{ background: b.amber, color: b.void, border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', '_blank')}>
            Brand Kit (Print Ready)
          </button>
          <button style={{ background: b.graphite, color: b.amber, border: `1px solid ${b.amber}`, padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            onClick={() => window.open('https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', '_blank')}>
            Design System Spec
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Live Goals Progress</h3>
          {goals.map((g, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                <span style={{ color: b.silver }}>{g.name}</span>
                <span style={{ color: g.color }}>{g.pct}%</span>
              </div>
              <div style={{ background: b.graphite, height: '4px', borderRadius: '2px' }}>
                <div style={{ background: g.color, width: `${g.pct}%`, height: '100%', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Active Todos</h3>
          {todos.map((t, i) => (
            <div key={i} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${b.border}` }}>
              <div style={{ fontWeight: 600, color: b.white, fontSize: '14px' }}>{t.title}</div>
              <div style={{ fontSize: '12px', color: b.smoke }}>{t.meta}</div>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Agent Status</h3>
          {agents.map((a, i) => (
            <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: b.silver }}>{a.name}</span>
              <span style={{ color: b.success }}>{a.status}</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', fontSize: '12px', color: b.smoke }}>All agents responding to heartbeat</div>
        </div>

      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: b.smoke, fontSize: '14px' }}>
        <p><strong style={{ color: b.silver }}>Derek OS V3</strong> — Real operational data</p>
        <p>Built by Anders — Feb 10, 2026</p>
      </div>
    </div>
  );
}
