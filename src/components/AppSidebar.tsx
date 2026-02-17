'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Hammer,
  Users,
  Terminal,
  Lightbulb,
  Newspaper,
  FolderKanban,
  TrendingUp,
  LayoutDashboard,
  Sparkles,
  Activity,
  Dna,
  Brain,
  Wrench,
  Moon,
  Palette,
  Ruler,
  Link2,
  Home,
} from 'lucide-react';

// ─── Colors ─────────────────────────────────────────────────────────────
const colors = {
  void: '#06070b',
  carbon: '#0a0a0f',
  border: 'rgba(245, 158, 11, 0.15)',
  borderHover: 'rgba(245, 158, 11, 0.3)',
  amber: '#f59e0b',
  amberDim: 'rgba(245, 158, 11, 0.7)',
  white: '#f5f5f5',
  smoke: 'rgba(255, 255, 255, 0.5)',
  dimText: 'rgba(255, 255, 255, 0.35)',
  success: '#22c55e',
};

// ─── Icon size ──────────────────────────────────────────────────────────
const ICON_SIZE = 14;

// ─── Section icon map ───────────────────────────────────────────────────
const NAV_ICONS: Record<string, ReactNode> = {
  'Home':          <Home size={ICON_SIZE} />,
  'Morning Brief': <Newspaper size={ICON_SIZE} />,
  'Model Counsel': <Hammer size={ICON_SIZE} />,
  'Roundtable':    <Users size={ICON_SIZE} />,
  'Agent Assist':  <Terminal size={ICON_SIZE} />,
  'Agent Ideas':   <Lightbulb size={ICON_SIZE} />,
  'Projects':      <FolderKanban size={ICON_SIZE} />,
  'Markets':       <TrendingUp size={ICON_SIZE} />,
  'Polymarket':    <TrendingUp size={ICON_SIZE} />,
  'Daily Feed':    <Newspaper size={ICON_SIZE} />,
  'Task Manager':  <LayoutDashboard size={ICON_SIZE} />,
  'Kanban':        <LayoutDashboard size={ICON_SIZE} />,
  'Ideas Vault':   <Sparkles size={ICON_SIZE} />,
  'Activity Dashboard': <Activity size={ICON_SIZE} />,
  'DNA Scanner':   <Dna size={ICON_SIZE} />,
  'Overnight':     <Moon size={ICON_SIZE} />,
  'Memory Bank':   <Brain size={ICON_SIZE} />,
  'Second Brain':  <Brain size={ICON_SIZE} />,
  'DNA':           <Dna size={ICON_SIZE} />,
  'Skills Inventory': <Wrench size={ICON_SIZE} />,
  'Brand Kit':     <Palette size={ICON_SIZE} />,
  'Brand Spec':    <Ruler size={ICON_SIZE} />,
  'Quick Links':   <Link2 size={ICON_SIZE} />,
};

// ─── Nav data ───────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const commandItems: NavItem[] = [
  { label: 'Home', href: '/os' },
];

const dashboardItems: NavItem[] = [
  { label: 'Morning Brief', href: '/os/morning-brief' },
  { label: 'Projects', href: '/os/projects', badge: '32' },
  { label: 'Markets', href: '/os/markets' },
  { label: 'Polymarket', href: '/os/polymarket' },
];

const agentItems: NavItem[] = [
  { label: 'Model Counsel', href: '/os/model-counsel' },
  { label: 'Roundtable', href: '/os/roundtable' },
  { label: 'Agent Assist', href: '/os/agents/assist' },
  { label: 'Agent Ideas', href: '/os/agents/ideas' },
];

const opsItems: NavItem[] = [
  { label: 'Kanban', href: '/os/kanban' },
  { label: 'Ideas Vault', href: '/os/ideas-vault' },
  { label: 'Activity Dashboard', href: '/os/activity-dashboard' },
  { label: 'DNA Scanner', href: '/tools/dna-scanner' },
  { label: 'Overnight', href: '/os/agents/overnight' },
];

const intelItems: NavItem[] = [
  { label: 'Daily Feed', href: '/os/daily-feed' },
  { label: 'Task Manager', href: '/os/task-manager' },
  { label: 'Memory Bank', href: '/os/memory-bank' },
  { label: 'Second Brain', href: '/os/second-brain' },
  { label: 'DNA', href: '/os/dna' },
  { label: 'Skills Inventory', href: '/os/skills-inventory' },
];

const systemItems: NavItem[] = [
  { label: 'Brand Kit', href: '/os/brand-kit' },
  { label: 'Brand Spec', href: '/os/brand-spec' },
  { label: 'Quick Links', href: '/os/quick-links' },
];

// ─── Section config ─────────────────────────────────────────────────────
interface SectionConfig {
  key: string;
  number: string;
  title: string;
  items: NavItem[];
  badge?: string;
}

const sections: SectionConfig[] = [
  { key: 'command', number: '01', title: 'COMMAND CENTER', items: commandItems },
  { key: 'dashboard', number: '02', title: 'DASHBOARD', items: dashboardItems },
  { key: 'agents', number: '03', title: 'AGENTS', items: agentItems, badge: '[ 9 ]' },
  { key: 'operations', number: '04', title: 'OPERATIONS', items: opsItems },
  { key: 'intel', number: '05', title: 'INTEL', items: intelItems },
  { key: 'system', number: '06', title: 'SYSTEM CONFIG', items: systemItems },
];

// ─── Constants ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'dbtech-sidebar-collapsed';
const SECTIONS_KEY = 'dbtech-sidebar-sections-v2';
const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 60;

type SectionState = Record<string, boolean>;
const DEFAULT_SECTIONS: SectionState = { command: true, dashboard: true, agents: true, operations: false, intel: false, system: false };

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openSections, setOpenSections] = useState<SectionState>(DEFAULT_SECTIONS);
  const [cpuMetric, setCpuMetric] = useState('12%');
  const [memMetric, setMemMetric] = useState('44%');
  const [diskMetric, setDiskMetric] = useState('88%');

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setCollapsed(true);
      const storedSections = localStorage.getItem(SECTIONS_KEY);
      if (storedSections) setOpenSections(JSON.parse(storedSections));
    } catch {}
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setCpuMetric(`${Math.floor(Math.random() * 25) + 8}%`);
      setMemMetric(`${Math.floor(Math.random() * 30) + 35}%`);
      setDiskMetric(`${Math.floor(Math.random() * 10) + 82}%`);
    };
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const toggleSection = useCallback((sectionKey: string) => {
    setOpenSections(prev => {
      const next = { ...prev, [sectionKey]: !prev[sectionKey] };
      try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const showSidebar = isMobile ? mobileOpen : true;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // ─── Render nav item ──────────────────────────────────────────────────
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const icon = NAV_ICONS[item.label] || <span style={{ fontWeight: 600 }}>{item.label.charAt(0)}</span>;

    return (
      <Link key={item.label} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed && !isMobile ? '8px 0' : '8px 20px 8px 48px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: active ? colors.carbon : colors.smoke,
            background: active ? colors.amber : 'transparent',
            fontSize: '12px',
            fontWeight: 500,
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', opacity: active ? 1 : 0.7 }}>{icon}</span>
          {!(collapsed && !isMobile) && (
            <>
              <span style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: active ? 'rgba(10, 10, 15, 0.3)' : 'rgba(245, 158, 11, 0.2)',
                  color: active ? colors.carbon : colors.amber,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{item.badge}</span>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  // ─── Render section ───────────────────────────────────────────────────
  const renderSection = (config: SectionConfig) => {
    const isOpen = openSections[config.key] ?? true;

    return (
      <div key={config.key} style={{ borderBottom: `1px solid ${colors.border}` }}>
        {/* Section header */}
        <div
          onClick={() => toggleSection(config.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: collapsed && !isMobile ? '12px 0' : '12px 20px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            background: isOpen ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          }}
        >
          {!(collapsed && !isMobile) && (
            <>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                fontWeight: 500,
                color: colors.dimText,
                width: '24px',
                flexShrink: 0,
              }}>{config.number}</span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                color: colors.white,
                letterSpacing: '0.5px',
                flex: 1,
              }}>{config.title}</span>
              {config.badge && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: colors.dimText,
                  marginRight: '12px',
                }}>{config.badge}</span>
              )}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: isOpen ? colors.amber : colors.dimText,
                width: '20px',
                textAlign: 'center',
              }}>{isOpen ? '−' : '+'}</span>
            </>
          )}
          {collapsed && !isMobile && (
            <span style={{ fontSize: '10px', color: colors.dimText }}>{config.number}</span>
          )}
        </div>
        {/* Section items */}
        <div style={{
          maxHeight: isOpen ? `${config.items.length * 38}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
          background: 'rgba(0, 0, 0, 0.2)',
        }}>
          {config.items.map(renderNavItem)}
        </div>
      </div>
    );
  };

  // ─── Sidebar content ──────────────────────────────────────────────────
  const sidebarContent = (
    <div
      style={{
        width: `${sidebarWidth}px`,
        minWidth: `${sidebarWidth}px`,
        background: colors.carbon,
        borderRight: `1px solid ${colors.border}`,
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
      {/* Header */}
      <div style={{
        padding: collapsed && !isMobile ? '16px 8px' : '16px 20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `2px solid ${colors.amber}`,
            flexShrink: 0,
          }}>
            <Image
              src="/derek-avatar.png"
              alt="Derek"
              width={36}
              height={36}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.25)' }}
            />
          </div>
          {!(collapsed && !isMobile) && (
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '1px', color: colors.white }}>DB TECH OS</div>
              <div style={{ fontSize: '9px', fontWeight: 500, color: colors.amberDim, textTransform: 'uppercase', letterSpacing: '1.5px' }}>MISSION CONTROL // V.2.4</div>
            </div>
          )}
        </Link>
      </div>

      {/* System Status Bar */}
      {!(collapsed && !isMobile) && (
        <div style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${colors.border}`,
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 500, color: colors.dimText, textTransform: 'uppercase', letterSpacing: '1px' }}>System Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, color: colors.success, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.success, animation: 'pulse 2s ease-in-out infinite' }} />
              OPERATIONAL
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: colors.dimText }}>CPU: <span style={{ color: colors.smoke }}>{cpuMetric}</span></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: colors.dimText }}>MEM: <span style={{ color: colors.smoke }}>{memMetric}</span></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: colors.dimText }}>DISK: <span style={{ color: colors.smoke }}>{diskMetric}</span></span>
          </div>
        </div>
      )}

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map(renderSection)}
      </div>

      {/* Collapse toggle */}
      {!isMobile && (
        <div
          onClick={toggleCollapsed}
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            cursor: 'pointer',
            borderTop: `1px solid ${colors.border}`,
            color: colors.dimText,
            fontSize: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span>Collapse</span>}
        </div>
      )}
    </div>
  );

  // ─── Mobile ───────────────────────────────────────────────────────────
  const mobileOverlay = isMobile && mobileOpen ? (
    <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150 }} />
  ) : null;

  const mobileToggle = isMobile ? (
    <button
      onClick={() => setMobileOpen(prev => !prev)}
      style={{
        position: 'fixed', top: '12px', left: '12px', zIndex: 250,
        background: colors.carbon, border: `1px solid ${colors.border}`,
        borderRadius: '8px', padding: '8px', cursor: 'pointer', color: colors.smoke,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {mobileOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  ) : null;

  // ─── Layout ───────────────────────────────────────────────────────────
  return (
    <div style={{ background: colors.void, color: colors.white, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      {mobileToggle}
      {mobileOverlay}
      {showSidebar && sidebarContent}
      <div style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px`, transition: 'margin-left 0.2s ease', minHeight: '100vh', paddingTop: isMobile ? '56px' : 0 }}>
        {children}
      </div>
    </div>
  );
}
