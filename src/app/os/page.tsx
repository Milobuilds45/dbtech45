'use client';

export default function OSPage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
    border: '#222222',
  };

  const navItems = [
    { label: 'Model Counsel', href: '/model-counsel' },
    { label: 'Projects', href: '/projects', badge: '28' },
    { label: 'Markets', href: '/markets' },
    { label: 'Daily Feed', href: '/daily-feed' },
  ];

  const toolItems = [
    { label: 'Quick Links', href: '/quick-links' },
    { label: 'Kanban', href: '/kanban' },
    { label: 'Ideas Vault', href: '/ideas-vault' },
    { label: 'Brand Kit', href: 'https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', external: true },
    { label: 'Brand Spec', href: 'https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', external: true },
  ];

  const opsItems = [
    { label: 'Activity Dashboard', href: '/activity-dashboard' },
    { label: 'DNA', href: '/dna' },
    { label: 'Memory Bank', href: '/memory-bank' },
    { label: 'Skills Inventory', href: '/skills-inventory' },
    { label: 'Schedule Center', href: '/schedule-center' },
    { label: 'Goals Tracker', href: '/goals-tracker' },
    { label: 'Master Todo', href: '/master-todo', active: true },
  ];

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

  const navStyle = (active?: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    margin: '2px 0',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background 0.2s',
    color: b.silver,
    background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
    borderRight: active ? `2px solid ${b.amber}` : 'none',
  });

  const sectionLabel: React.CSSProperties = {
    padding: '16px 20px',
    color: b.smoke,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const card: React.CSSProperties = {
    background: b.carbon,
    border: `1px solid ${b.border}`,
    borderRadius: '12px',
    padding: '20px',
  };

  return (
    <div style={{ background: b.void, color: b.white, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <div style={{ width: '240px', background: b.carbon, borderRight: `1px solid ${b.border}`, padding: '20px 0', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 30px', borderBottom: `1px solid ${b.border}`, marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: b.amber, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.void, fontWeight: 700, marginRight: '12px', fontSize: '12px' }}>DB</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              <div style={{ color: b.white }}>DB TECH OS</div>
              <div style={{ fontSize: '11px', color: b.smoke }}>MISSION CONTROL</div>
            </div>
          </div>

          {navItems.map((item, i) => (
            <div key={i} style={navStyle()} onClick={() => item.href.startsWith('http') ? window.open(item.href, '_blank') : window.location.href = item.href}>
              {item.label}
              {item.badge && <span style={{ background: b.amber, color: b.void, fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>{item.badge}</span>}
            </div>
          ))}

          <div style={sectionLabel}>Tools</div>
          {toolItems.map((item, i) => (
            <div key={i} style={navStyle()} onClick={() => item.external ? window.open(item.href, '_blank') : window.location.href = item.href}>
              {item.label}
            </div>
          ))}

          <div style={sectionLabel}>Operations</div>
          {opsItems.map((item, i) => (
            <div key={i} style={navStyle(item.active)} onClick={() => window.location.href = item.href}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ marginLeft: '240px', flex: 1, padding: '20px 30px' }}>
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
      </div>
    </div>
  );
}
