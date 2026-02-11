'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { brand } from '@/lib/brand';

// ─── Icons (inline SVG for zero-dependency) ────────────────────────────

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const ExternalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

// ─── Section icon map (first letter as fallback, real icons per section) ─

const NAV_ICONS: Record<string, string> = {
  'Model Counsel': '⚡',
  'Roundtable':    '🔄',
  'Projects':      '📁',
  'Markets':       '📊',
  'Daily Feed':    '📰',
  'Quick Links':   '🔗',
  'Kanban':        '📋',
  'Ideas Vault':   '💡',
  'Brand Kit':     '🎨',
  'Brand Spec':    '📐',
  'Activity Dashboard': '📈',
  'DNA':           '🧬',
  'Memory Bank':   '🧠',
  'Skills Inventory': '🛠',
  'Schedule Center': '📅',
  'Goals Tracker': '🎯',
  'Master Todo':   '✅',
};

// ─── Nav data ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Model Counsel', href: '/model-counsel' },
  { label: 'Roundtable', href: '/roundtable' },
  { label: 'Projects', href: '/projects', badge: '28' },
  { label: 'Markets', href: '/markets' },
  { label: 'Daily Feed', href: '/daily-feed' },
];

const toolItems: NavItem[] = [
  { label: 'Quick Links', href: '/quick-links' },
  { label: 'Kanban', href: '/kanban' },
  { label: 'Ideas Vault', href: '/ideas-vault' },
  { label: 'Brand Kit', href: 'https://7layerlabs.github.io/dbtech45-agent-icons-v3/DBTECH45-BRAND-KIT.html', external: true },
  { label: 'Brand Spec', href: 'https://7layerlabs.github.io/dbtech45-agent-icons-v3/brand-spec.html', external: true },
];

const opsItems: NavItem[] = [
  { label: 'Activity Dashboard', href: '/activity-dashboard' },
  { label: 'DNA', href: '/dna' },
  { label: 'Memory Bank', href: '/memory-bank' },
  { label: 'Skills Inventory', href: '/skills-inventory' },
  { label: 'Schedule Center', href: '/schedule-center' },
  { label: 'Goals Tracker', href: '/goals-tracker' },
  { label: 'Master Todo', href: '/master-todo' },
];

// ─── Sidebar component ──────────────────────────────────────────────────

const STORAGE_KEY = 'dbtech-sidebar-collapsed';
const SIDEBAR_WIDTH = 240;
const COLLAPSED_WIDTH = 60;

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setCollapsed(true);
    } catch {}
  }, []);

  // Persist collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile overlay on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const showSidebar = isMobile ? mobileOpen : true;

  const isActive = (href: string) => pathname === href;

  // ─── Render a single nav item ─────────────────────────────────────────

  const renderNavItem = (item: NavItem) => {
    const active = !item.external && isActive(item.href);
    const icon = NAV_ICONS[item.label] || item.label.charAt(0);

    const inner = (
      <div
        style={{
          padding: collapsed && !isMobile ? '10px 0' : '8px 20px',
          margin: '1px 0',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          gap: collapsed && !isMobile ? '0' : '8px',
          transition: 'background 0.2s',
          color: active ? brand.amber : brand.silver,
          background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
          borderRight: active ? `2px solid ${brand.amber}` : '2px solid transparent',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        title={collapsed && !isMobile ? item.label : undefined}
      >
        {collapsed && !isMobile ? (
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{icon}</span>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{icon}</span>
              <span>{item.label}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {item.badge && (
                <span style={{
                  background: brand.amber, color: brand.void,
                  fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600,
                }}>{item.badge}</span>
              )}
              {item.external && <ExternalIcon />}
            </span>
          </>
        )}
      </div>
    );

    if (item.external) {
      return (
        <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
          {inner}
        </a>
      );
    }

    return (
      <Link key={item.label} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  };

  // ─── Section label ────────────────────────────────────────────────────

  const renderSectionLabel = (label: string) => {
    if (collapsed && !isMobile) {
      return (
        <div style={{
          padding: '12px 0 4px',
          borderTop: `1px solid ${brand.border}`,
          margin: '8px 12px 0',
        }} />
      );
    }
    return (
      <div style={{
        padding: '16px 20px 8px',
        color: brand.smoke,
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </div>
    );
  };

  // ─── The actual sidebar panel ─────────────────────────────────────────

  const sidebarContent = (
    <div
      style={{
        width: `${sidebarWidth}px`,
        minWidth: `${sidebarWidth}px`,
        background: brand.carbon,
        borderRight: `1px solid ${brand.border}`,
        padding: '20px 0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 200,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: collapsed && !isMobile ? '0 0 20px' : '0 20px 20px',
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        borderBottom: `1px solid ${brand.border}`,
        marginBottom: '12px',
        flexShrink: 0,
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px', height: '32px', background: brand.amber, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: brand.void, fontWeight: 700, fontSize: '12px', flexShrink: 0,
          }}>DB</div>
          {!(collapsed && !isMobile) && (
            <div style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 600 }}>
              <div style={{ color: brand.white }}>DB TECH OS</div>
              <div style={{ fontSize: '11px', color: brand.smoke }}>MISSION CONTROL</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {navItems.map(renderNavItem)}
        {renderSectionLabel('Tools')}
        {toolItems.map(renderNavItem)}
        {renderSectionLabel('Operations')}
        {opsItems.map(renderNavItem)}
      </div>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <div
          onClick={toggleCollapsed}
          style={{
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderTop: `1px solid ${brand.border}`,
            color: brand.smoke,
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          {!collapsed && <span style={{ marginLeft: '8px', fontSize: '12px' }}>Collapse</span>}
        </div>
      )}
    </div>
  );

  // ─── Mobile overlay ───────────────────────────────────────────────────

  const mobileOverlay = isMobile && mobileOpen ? (
    <div
      onClick={() => setMobileOpen(false)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 150, transition: 'opacity 0.2s',
      }}
    />
  ) : null;

  // ─── Mobile hamburger button ──────────────────────────────────────────

  const mobileToggle = isMobile ? (
    <button
      onClick={() => setMobileOpen(prev => !prev)}
      style={{
        position: 'fixed', top: '12px', left: '12px', zIndex: 250,
        background: brand.carbon, border: `1px solid ${brand.border}`,
        borderRadius: '8px', padding: '8px', cursor: 'pointer',
        color: brand.silver, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      aria-label="Toggle navigation"
    >
      {mobileOpen ? <XIcon /> : <MenuIcon />}
    </button>
  ) : null;

  // ─── Layout ───────────────────────────────────────────────────────────

  return (
    <div style={{ background: brand.void, color: brand.white, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {mobileToggle}
      {mobileOverlay}
      {showSidebar && sidebarContent}
      <div
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
          paddingTop: isMobile ? '56px' : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
