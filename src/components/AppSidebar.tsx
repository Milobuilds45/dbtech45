'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { brand } from '@/lib/brand';
import { PinModal, isOpsPinVerified, requiresOpsPin } from './PinGate';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Zap,
  MessageCircle,
  FolderKanban,
  TrendingUp,
  Newspaper,
  Link2,
  LayoutDashboard,
  Lightbulb,
  Palette,
  Ruler,
  Activity,
  Dna,
  Brain,
  Wrench,
  Moon,
  Bot,
  Calendar,
  Sparkles,
  Package,
  ListTodo,
  Network,
  HardDrive,
  FileText,
} from 'lucide-react';

// ─── Icon size for nav items ────────────────────────────────────────────
const ICON_SIZE = 18;

// ─── Section icon map using Lucide components ───────────────────────────

const NAV_ICONS: Record<string, ReactNode> = {
  'Morning Brief': <Newspaper size={ICON_SIZE} />,
  'Model Counsel': <Zap size={ICON_SIZE} />,
  'Roundtable':    <MessageCircle size={ICON_SIZE} />,
  'Projects':      <FolderKanban size={ICON_SIZE} />,
  'Markets':       <TrendingUp size={ICON_SIZE} />,
  'Daily Feed':    <Newspaper size={ICON_SIZE} />,
  'Quick Links':   <Link2 size={ICON_SIZE} />,
  'Direct Chat':   <Bot size={ICON_SIZE} />,
  'Overnight':     <Moon size={ICON_SIZE} />,
  'Agent Ideas':   <Lightbulb size={ICON_SIZE} />,
  'Agent Assist':  <Package size={ICON_SIZE} />,
  'Kanban':        <LayoutDashboard size={ICON_SIZE} />,
  'Ideas Vault':   <Sparkles size={ICON_SIZE} />,
  'DNA Scanner':   <Dna size={ICON_SIZE} />,
  'Brand Kit':     <Palette size={ICON_SIZE} />,
  'Brand Spec':    <Ruler size={ICON_SIZE} />,
  'Activity Dashboard': <Activity size={ICON_SIZE} />,
  'DNA':           <Dna size={ICON_SIZE} />,
  'Second Brain':  <Brain size={ICON_SIZE} />,
  'Skills Inventory': <Wrench size={ICON_SIZE} />,
  'Overnight Sessions': <Calendar size={ICON_SIZE} />,
  'Task Manager':  <ListTodo size={ICON_SIZE} />,
  'Org Chart':     <Network size={ICON_SIZE} />,
  'Workspaces':    <HardDrive size={ICON_SIZE} />,
  'Docs':          <FileText size={ICON_SIZE} />,
};

// ─── Nav data ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Task Manager', href: '/os/task-manager' },
  { label: 'Morning Brief', href: '/os/morning-brief' },
  { label: 'Projects', href: '/os/projects', badge: '28' },
  { label: 'Markets', href: '/os/markets' },
  { label: 'Polymarket', href: '/os/polymarket' },
  { label: 'Daily Feed', href: '/os/daily-feed' },
];

const agentItems: NavItem[] = [
  { label: 'Model Counsel', href: '/os/model-counsel' },
  { label: 'Roundtable', href: '/os/roundtable' },
  { label: 'Overnight', href: '/os/agents/overnight' },
  { label: 'Agent Ideas', href: '/os/agents/ideas' },
  { label: 'Agent Assist', href: '/os/agents/assist' },
];

const toolItems: NavItem[] = [
  { label: 'DNA Scanner', href: '/tools/dna-scanner' },
  { label: 'Ideas Vault', href: '/os/ideas-vault' },
  { label: 'Kanban', href: '/os/kanban' },
];

const opsItems: NavItem[] = [
  { label: 'Activity Dashboard', href: '/os/activity-dashboard' },
  { label: 'Skills Inventory', href: '/os/skills-inventory' },
  { label: 'DNA', href: '/os/dna' },
  { label: 'Second Brain', href: '/os/second-brain' },
  { label: 'Brand Kit', href: '/os/brand-kit' },
  { label: 'Brand Spec', href: '/os/brand-spec' },
];

const quickLinksItems: NavItem[] = [
  { label: 'Quick Links', href: '/os/quick-links' },
];

// ─── Sidebar component ──────────────────────────────────────────────────

const STORAGE_KEY = 'dbtech-sidebar-collapsed';
const SECTIONS_KEY = 'dbtech-sidebar-sections';
const SIDEBAR_WIDTH = 240;
const COLLAPSED_WIDTH = 60;

interface SectionState {
  command: boolean;
  agents: boolean;
  tools: boolean;
  operations: boolean;
  quicklinks: boolean;
}

const DEFAULT_SECTIONS: SectionState = { command: true, agents: true, tools: true, operations: true, quicklinks: true };

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sections, setSections] = useState<SectionState>(DEFAULT_SECTIONS);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Hydrate collapsed state + section states from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setCollapsed(true);
      const storedSections = localStorage.getItem(SECTIONS_KEY);
      if (storedSections) setSections(JSON.parse(storedSections));
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

  // Toggle section expand/collapse
  const toggleSection = useCallback((section: keyof SectionState) => {
    setSections(prev => {
      const next = { ...prev, [section]: !prev[section] };
      try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(next)); } catch {}
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
    const icon = NAV_ICONS[item.label] || <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.label.charAt(0)}</span>;

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
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>{icon}</span>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', opacity: 0.7 }}>{icon}</span>
              <span>{item.label}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {item.badge && (
                <span style={{
                  background: brand.amber, color: brand.void,
                  fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600,
                }}>{item.badge}</span>
              )}
              {item.external && !item.href.startsWith('/os') && <ExternalLink size={10} />}
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

    // PIN gate intercept for Operations routes
    if (requiresOpsPin(item.href)) {
      return (
        <div
          key={item.label}
          onClick={(e) => {
            e.preventDefault();
            if (isOpsPinVerified()) {
              router.push(item.href);
            } else {
              setPendingHref(item.href);
              setPinModalOpen(true);
            }
          }}
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          {inner}
        </div>
      );
    }

    return (
      <Link key={item.label} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  };

  // ─── Section header (collapsible) ───────────────────────────────────

  const renderSectionHeader = (label: string, sectionKey: keyof SectionState) => {
    const isOpen = sections[sectionKey];
    
    if (collapsed && !isMobile) {
      return (
        <div 
          onClick={() => toggleSection(sectionKey)}
          style={{
            padding: '12px 0 4px',
            borderTop: `1px solid ${brand.border}`,
            margin: '8px 12px 0',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            opacity: isOpen ? 1 : 0.4,
          }}
          title={`${isOpen ? 'Collapse' : 'Expand'} ${label}`}
        >
          <ChevronDown size={12} style={{ 
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', 
            transition: 'transform 0.2s',
            color: brand.smoke,
          }} />
        </div>
      );
    }
    return (
      <div 
        onClick={() => toggleSection(sectionKey)}
        style={{
          padding: '16px 20px 8px',
          color: brand.smoke,
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          transition: 'color 0.2s',
        }}
      >
        <span>{label}</span>
        <ChevronDown size={12} style={{ 
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', 
          transition: 'transform 0.2s',
        }} />
      </div>
    );
  };

  // ─── Render section items with collapse animation ─────────────────────

  const renderSection = (items: NavItem[], sectionKey: keyof SectionState) => {
    const isOpen = sections[sectionKey];
    return (
      <div style={{
        maxHeight: isOpen ? `${items.length * 42}px` : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.25s ease',
      }}>
        {items.map(renderNavItem)}
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
            width: collapsed && !isMobile ? '36px' : '48px',
            height: collapsed && !isMobile ? '36px' : '48px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: `2px solid ${brand.amber}`,
            flexShrink: 0,
          }}>
            <Image
              src="/derek-avatar.png"
              alt="Derek"
              width={48}
              height={48}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.25)' }}
            />
          </div>
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
        {renderSectionHeader('Command Center', 'command')}
        {renderSection(navItems, 'command')}
        {renderSectionHeader('Agents', 'agents')}
        {renderSection(agentItems, 'agents')}
        {renderSectionHeader('Tools', 'tools')}
        {renderSection(toolItems, 'tools')}
        {renderSectionHeader('Operations', 'operations')}
        {renderSection(opsItems, 'operations')}
        {renderSectionHeader('Quick Links', 'quicklinks')}
        {renderSection(quickLinksItems, 'quicklinks')}
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
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
      {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
      <PinModal
        open={pinModalOpen}
        onSuccess={() => {
          setPinModalOpen(false);
          if (pendingHref) {
            router.push(pendingHref);
            setPendingHref(null);
          }
        }}
        onCancel={() => {
          setPinModalOpen(false);
          setPendingHref(null);
        }}
      />
    </div>
  );
}


