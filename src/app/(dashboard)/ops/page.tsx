'use client';

import { useEffect, useState } from 'react';
import { Youtube, Search, Twitter } from 'lucide-react';

const voidColors = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#22C55E', info: '#3B82F6', warning: '#EAB308',
  border: '#222222',
};

const cyberColors = {
  void: '#050e07', carbon: '#07120a', graphite: '#0a1a0e',
  amber: '#10ca78', amberLight: '#39ff7e', amberDark: '#0a9e5a',
  white: '#f0f0f0', silver: '#A3A3A3', smoke: '#737373',
  success: '#39ff7e', error: '#22C55E', info: '#3B82F6', warning: '#10ca78',
  border: 'rgba(16, 202, 120, 0.2)',
};

export default function OpsPage() {
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbtech-color-mode');
      if (stored === 'cyber') setColorMode('cyber');
    } catch {}
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('dbtech-color-mode');
        setColorMode(stored === 'cyber' ? 'cyber' : 'void');
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, []);

  const b = colorMode === 'cyber' ? cyberColors : voidColors;

  const tools = [
    {
      title: 'Clipd',
      desc: 'YouTube video archiver with AI summaries and chat',
      href: '/ops/clipd',
      icon: Youtube,
      status: 'LIVE',
      statusColor: b.success,
    },
    {
      title: 'Research',
      desc: 'Multi-platform research tool powered by last30days',
      href: '/ops/research',
      icon: Search,
      status: 'LIVE',
      statusColor: b.success,
    },
    {
      title: 'X Clipd',
      desc: 'Twitter thread archiver with Grok AI summaries',
      href: '/ops/x-clipd',
      icon: Twitter,
      status: 'COMING SOON',
      statusColor: b.warning,
    },
  ];

  const card: React.CSSProperties = {
    background: b.carbon,
    border: `1px solid ${b.border}`,
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: '20px 30px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: b.white, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>
          Derek OPS
        </div>
        <div style={{ color: b.smoke, marginTop: '4px' }}>
          Builds, tools, and idea generators — all your projects in one place
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <div
              key={i}
              onClick={() => tool.status === 'LIVE' && (window.location.href = tool.href)}
              style={{
                ...card,
                opacity: tool.status === 'LIVE' ? 1 : 0.6,
              }}
              onMouseEnter={e => tool.status === 'LIVE' && (e.currentTarget.style.borderColor = b.amber)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = b.border)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <Icon size={32} color={b.amber} />
                <div style={{ fontSize: '10px', fontWeight: 700, color: tool.statusColor, background: `${tool.statusColor}15`, border: `1px solid ${tool.statusColor}40`, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  {tool.status}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: b.white, marginBottom: '8px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                {tool.title}
              </div>
              <div style={{ fontSize: '14px', color: b.smoke, lineHeight: 1.5 }}>
                {tool.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: b.smoke, fontSize: '14px' }}>
        <p><strong style={{ color: b.silver }}>OPS</strong> — Your builds, tools & experiments</p>
        <p><strong style={{ color: b.silver }}>OS</strong> — System infrastructure & monitoring</p>
      </div>
    </div>
  );
}
