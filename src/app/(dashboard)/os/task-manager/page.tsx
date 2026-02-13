'use client';

import { useState, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load sub-views
const SessionsView = dynamic(() => import('./views/SessionsView'), { ssr: false });
const OrgChartView = dynamic(() => import('./views/OrgChartView'), { ssr: false });
const WorkspacesView = dynamic(() => import('./views/WorkspacesView'), { ssr: false });
const StandupsView = dynamic(() => import('./views/StandupsView'), { ssr: false });
const DocsView = dynamic(() => import('./views/DocsView'), { ssr: false });

type TabKey = 'sessions' | 'org-chart' | 'workspaces' | 'standups' | 'docs';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'sessions', label: 'Sessions & Jobs', icon: '◉' },
  { key: 'org-chart', label: 'Org Chart', icon: '◎' },
  { key: 'workspaces', label: 'Workspaces', icon: '▣' },
  { key: 'standups', label: 'Standups', icon: '◈' },
  { key: 'docs', label: 'Docs', icon: '☰' },
];

function Loading() {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#52525B' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Loading...</div>
    </div>
  );
}

export default function TaskManagerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('sessions');

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '2rem 2rem 0', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}>&gt; ops --task-manager</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FAFAFA', margin: 0 }}>Task Manager</h1>
            <p style={{ color: '#71717A', fontSize: '0.875rem', marginTop: '0.25rem' }}>Sessions, org chart, workspaces, standups, and docs</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#1A1A1C', border: '1px solid #27272A', borderRadius: '8px',
              padding: '0.5rem 1rem', color: '#A1A1AA', fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272A'; e.currentTarget.style.color = '#A1A1AA'; }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Top-level Tab Bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #27272A' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #F59E0B' : '2px solid transparent',
                color: activeTab === tab.key ? '#F59E0B' : '#71717A',
                padding: '0.75rem 1.25rem', fontSize: '0.85rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.key) e.currentTarget.style.color = '#A1A1AA'; }}
              onMouseLeave={(e) => { if (activeTab !== tab.key) e.currentTarget.style.color = '#71717A'; }}
            >
              <span style={{ fontSize: '0.9rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <Suspense fallback={<Loading />}>
        {activeTab === 'sessions' && <SessionsView />}
        {activeTab === 'org-chart' && <OrgChartView />}
        {activeTab === 'workspaces' && <WorkspacesView />}
        {activeTab === 'standups' && <StandupsView />}
        {activeTab === 'docs' && <DocsView />}
      </Suspense>
    </div>
  );
}
