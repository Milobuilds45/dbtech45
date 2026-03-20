'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Moon,
  Sun,
  Users,
  Scale,
  MessageSquare,
  Rocket,
  Headphones,
} from 'lucide-react';

const voidTheme = {
  void: '#06070b',
  carbon: '#0a0a0f',
  border: 'rgba(245, 158, 11, 0.15)',
  borderHover: 'rgba(245, 158, 11, 0.3)',
  amber: '#f59e0b',
  white: '#f5f5f5',
  smoke: 'rgba(255, 255, 255, 0.5)',
};

const cyberTheme = {
  void: '#050e07',
  carbon: '#07120a',
  border: 'rgba(16, 202, 120, 0.2)',
  borderHover: 'rgba(16, 202, 120, 0.5)',
  amber: '#10ca78',
  white: '#f0f0f0',
  smoke: 'rgba(240, 240, 240, 0.55)',
};

const navItems = [
  { label: 'Agents Home', href: '/agents', icon: Home },
  { label: 'Model Counsel', href: '/agents/model-counsel', icon: Scale },
  { label: 'Roundtable', href: '/agents/roundtable', icon: MessageSquare },
  { label: 'Agent Initiatives', href: '/agents/agent-initiatives', icon: Rocket },
  { label: 'Agent Assist', href: '/agents/assist', icon: Headphones },
];

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbtech-color-mode');
      if (stored === 'cyber') setColorMode('cyber');
    } catch {}
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === 'void' ? 'cyber' : 'void';
    setColorMode(newMode);
    try {
      localStorage.setItem('dbtech-color-mode', newMode);
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const theme = colorMode === 'cyber' ? cyberTheme : voidTheme;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.void,
      color: theme.white,
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: theme.carbon,
        borderRight: `1px solid ${theme.border}`,
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <Link href="/agents" style={{
            fontSize: '20px',
            fontWeight: 700,
            color: theme.amber,
            textDecoration: 'none',
            fontFamily: "'Space Grotesk', monospace",
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>
            AGENTS
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                margin: '4px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? theme.amber : theme.smoke,
                background: isActive ? `${theme.amber}10` : 'transparent',
                border: `1px solid ${isActive ? theme.borderHover : 'transparent'}`,
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = `${theme.amber}05`;
                  e.currentTarget.style.borderColor = theme.border;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}>
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <button onClick={toggleColorMode} style={{
            width: '100%',
            padding: '10px 16px',
            background: `${theme.amber}10`,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            color: theme.amber,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${theme.amber}20`;
            e.currentTarget.style.borderColor = theme.borderHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${theme.amber}10`;
            e.currentTarget.style.borderColor = theme.border;
          }}>
            {colorMode === 'void' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{colorMode === 'void' ? 'Void' : 'Cyber'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: '240px',
        flex: 1,
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}
