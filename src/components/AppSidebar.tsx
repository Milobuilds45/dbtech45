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
  Sun,
  Palette,
  Ruler,
  Link2,
  Home,
  Search,
  Building2,
  Youtube,
} from 'lucide-react';

// â”€â”€â”€ Colors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const voidTheme = {
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

// CYBER MODE — terminal green phosphor CRT aesthetic
const cyberTheme = {
  void: '#050e07',          // very dark green-black bg
  carbon: '#07120a',        // sidebar bg — just a hint darker
  border: 'rgba(16, 202, 120, 0.2)',
  borderHover: 'rgba(16, 202, 120, 0.5)',
  amber: '#10ca78',         // terminal green — accents, active states, icons
  amberDim: 'rgba(16, 202, 120, 0.6)',
  white: '#f0f0f0',         // content text stays CLEAN WHITE — readable
  smoke: 'rgba(240, 240, 240, 0.55)',
  dimText: 'rgba(200, 220, 200, 0.4)',
  success: '#39ff7e',
};

// PAPER MODE — institutional white, Bloomberg-meets-boardroom
const paperTheme = {
  void: '#FAFAFA',            // off-white page bg
  carbon: '#FFFFFF',          // sidebar — pure white
  border: '#E5E5E5',         // subtle grey borders
  borderHover: '#D4D4D4',
  amber: '#D97706',          // deeper amber on white — better contrast than #F59E0B
  amberDim: 'rgba(217, 119, 6, 0.7)',
  white: '#1A1A1A',          // INVERTED — text is near-black
  smoke: '#737373',          // mid-grey for secondary text
  dimText: '#A3A3A3',        // light grey for tertiary
  success: '#16A34A',        // darker green for white bg contrast
};

const colors = voidTheme;

// â”€â”€â”€ Icon size â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ICON_SIZE = 14;

// â”€â”€â”€ Section icon map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NAV_ICONS: Record<string, ReactNode> = {
  'Home':          <Home size={ICON_SIZE} />,
  'Morning Brief': <Newspaper size={ICON_SIZE} />,
  'Model Counsel': <Hammer size={ICON_SIZE} />,
  'Roundtable':    <Users size={ICON_SIZE} />,
  'Agent Assist':  <Terminal size={ICON_SIZE} />,
  'Agent Ideas':   <Lightbulb size={ICON_SIZE} />,
  'Projects':      <FolderKanban size={ICON_SIZE} />,
  'Markets':       <TrendingUp size={ICON_SIZE} />,
  'AxeCap Terminal': <Activity size={ICON_SIZE} />,
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
  'Research':      <Search size={ICON_SIZE} />,
  'D.U.N.D.E.R.':  <Building2 size={ICON_SIZE} />,
  'YT Transcript': <Youtube size={ICON_SIZE} />,
};

// â”€â”€â”€ Nav data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  { label: 'AxeCap Terminal', href: '/os/axecap' },
  { label: 'Polymarket', href: '/os/polymarket' },
  { label: 'D.U.N.D.E.R.', href: '/os/dunder' },
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
  { label: 'Research', href: '/os/research' },
  { label: 'YT Transcript', href: '/os/youtube-transcript' },
  { label: 'DNA Scanner', href: '/tools/dna-scanner' },
];

const intelItems: NavItem[] = [
  { label: 'Daily Feed', href: '/os/daily-feed' },
  { label: 'Activity Dashboard', href: '/os/activity-dashboard' },
  { label: 'Overnight', href: '/os/agents/overnight' },
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

// â”€â”€â”€ Section config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STORAGE_KEY = 'dbtech-sidebar-collapsed';
const SECTIONS_KEY = 'dbtech-sidebar-sections-v2';
const MODE_KEY = 'dbtech-color-mode';
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
  const [colorMode, setColorMode] = useState<'void' | 'cyber' | 'paper'>('void');
  
  // Theme colors based on mode
  const theme = colorMode === 'cyber' ? cyberTheme : colorMode === 'paper' ? paperTheme : voidTheme;

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setCollapsed(true);
      const storedSections = localStorage.getItem(SECTIONS_KEY);
      if (storedSections) setOpenSections(JSON.parse(storedSections));
      const storedMode = localStorage.getItem(MODE_KEY);
      if (storedMode === 'cyber') setColorMode('cyber');
      else if (storedMode === 'paper') setColorMode('paper');
    } catch {}
  }, []);

  // THEME RECOLOR: Override inline styles for cyber and paper modes
  useEffect(() => {
    if (colorMode === 'void') return;

    // === CYBER MODE MAPS ===
    const cyberColorMap: Record<string, string> = {
      'rgb(245, 158, 11)': 'rgb(16, 202, 120)',   // #F59E0B → #10ca78
      'rgb(251, 191, 36)': 'rgb(57, 255, 126)',   // #FBBF24 → #39ff7e
      'rgb(217, 119, 6)': 'rgb(10, 158, 90)',     // #D97706 → #0a9e5a
      'rgb(234, 179, 8)': 'rgb(16, 202, 120)',    // #EAB308 → #10ca78
    };
    const cyberBgMap: Record<string, string> = {
      'rgb(0, 0, 0)': 'rgb(5, 14, 7)',            // #000 → #050e07
      'rgb(17, 17, 17)': 'rgb(7, 18, 10)',        // #111 → #07120a
      'rgb(26, 26, 26)': 'rgb(10, 26, 14)',       // #1A1A1A → #0a1a0e
    };
    const cyberBorderMap: Record<string, string> = {
      'rgb(34, 34, 34)': 'rgba(16, 202, 120, 0.2)',
    };

    // === PAPER MODE MAPS ===
    const paperColorMap: Record<string, string> = {
      // Amber accent stays but deepens for white bg contrast
      'rgb(245, 158, 11)': 'rgb(180, 83, 9)',     // #F59E0B → #B45309
      'rgb(251, 191, 36)': 'rgb(217, 119, 6)',    // #FBBF24 → #D97706
      'rgb(217, 119, 6)': 'rgb(146, 64, 14)',     // #D97706 → #92400E
      'rgb(234, 179, 8)': 'rgb(180, 83, 9)',      // #EAB308 → #B45309
      // Light text → dark text
      'rgb(255, 255, 255)': 'rgb(26, 26, 26)',    // white → near-black
      'rgb(245, 245, 245)': 'rgb(26, 26, 26)',    // #f5f5f5 → dark
      'rgb(240, 240, 240)': 'rgb(38, 38, 38)',    // #f0f0f0 → dark
      'rgb(163, 163, 163)': 'rgb(115, 115, 115)', // #A3A3A3 → #737373
      'rgb(115, 115, 115)': 'rgb(163, 163, 163)', // #737373 → lighter grey
    };
    const paperBgMap: Record<string, string> = {
      'rgb(0, 0, 0)': 'rgb(250, 250, 250)',       // #000 → #FAFAFA
      'rgb(17, 17, 17)': 'rgb(255, 255, 255)',    // #111 → #FFFFFF
      'rgb(26, 26, 26)': 'rgb(245, 245, 245)',    // #1A1A1A → #F5F5F5
      'rgb(5, 14, 7)': 'rgb(250, 250, 250)',      // cyber void → paper
      'rgb(7, 18, 10)': 'rgb(255, 255, 255)',     // cyber carbon → paper
      'rgb(10, 26, 14)': 'rgb(245, 245, 245)',    // cyber graphite → paper
    };
    const paperBorderMap: Record<string, string> = {
      'rgb(34, 34, 34)': 'rgb(229, 229, 229)',    // #222 → #E5E5E5
    };

    const colorMap = colorMode === 'cyber' ? cyberColorMap : paperColorMap;
    const bgMap = colorMode === 'cyber' ? cyberBgMap : paperBgMap;
    const borderMap = colorMode === 'cyber' ? cyberBorderMap : paperBorderMap;

    function recolorElement(el: HTMLElement) {
      const s = el.style;
      // Text color
      if (s.color && colorMap[s.color]) s.color = colorMap[s.color];
      // Background color
      if (s.backgroundColor && colorMap[s.backgroundColor]) s.backgroundColor = colorMap[s.backgroundColor];
      if (s.backgroundColor && bgMap[s.backgroundColor]) s.backgroundColor = bgMap[s.backgroundColor];
      // Background shorthand
      if (s.background && colorMap[s.background]) s.background = colorMap[s.background];
      if (s.background && bgMap[s.background]) s.background = bgMap[s.background];
      // Border color
      if (s.borderColor && colorMap[s.borderColor]) s.borderColor = colorMap[s.borderColor];
      if (s.borderColor && borderMap[s.borderColor]) s.borderColor = borderMap[s.borderColor];
    }

    function recolorAll() {
      document.querySelectorAll<HTMLElement>('[style]').forEach(recolorElement);
    }

    // Run immediately and on DOM changes
    recolorAll();
    const observer = new MutationObserver(() => requestAnimationFrame(recolorAll));
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    const interval = setInterval(recolorAll, 800);
    return () => { observer.disconnect(); clearInterval(interval); };
  }, [colorMode]);

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

  const toggleColorMode = useCallback(() => {
    setColorMode(prev => {
      const next = prev === 'void' ? 'cyber' : prev === 'cyber' ? 'paper' : 'void';
      try { localStorage.setItem(MODE_KEY, next); } catch {}
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
  // Exact match for /os (home) - prevents it highlighting on all child pages
  const isActive = (href: string) => {
    if (href === '/os') return pathname === '/os';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // â”€â”€â”€ Render nav item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            color: active ? theme.carbon : theme.smoke,
            background: active ? theme.amber : 'transparent',
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
                  color: active ? theme.carbon : theme.amber,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{item.badge}</span>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  // â”€â”€â”€ Render section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderSection = (config: SectionConfig) => {
    const isOpen = openSections[config.key] ?? true;

    return (
      <div key={config.key} style={{ borderBottom: `1px solid ${theme.border}` }}>
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
                color: theme.dimText,
                width: '24px',
                flexShrink: 0,
              }}>{config.number}</span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                color: theme.white,
                letterSpacing: '0.5px',
                flex: 1,
              }}>{config.title}</span>
              {config.badge && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: theme.dimText,
                  marginRight: '12px',
                }}>{config.badge}</span>
              )}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: isOpen ? theme.amber : theme.dimText,
                width: '20px',
                textAlign: 'center',
              }}>{isOpen ? '-' : '+'}</span>
            </>
          )}
          {collapsed && !isMobile && (
            <span style={{ fontSize: '10px', color: theme.dimText }}>{config.number}</span>
          )}
        </div>
        {/* Section items */}
        <div style={{
          maxHeight: isOpen ? `${(config.items.length + (config.key === 'system' ? 1 : 0)) * 38}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
          background: 'rgba(0, 0, 0, 0.2)',
        }}>
          {config.items.map(renderNavItem)}
          {/* Mode toggle for System Config section */}
          {config.key === 'system' && !(collapsed && !isMobile) && (
            <div
              onClick={toggleColorMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 20px 8px 48px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: theme.smoke,
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                {colorMode === 'void' ? <Moon size={14} /> : colorMode === 'cyber' ? <Terminal size={14} /> : <Sun size={14} />}
              </span>
              <span style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {colorMode === 'void' ? 'NULL MODE' : colorMode === 'cyber' ? 'CYBER MODE' : 'PAPER MODE'}
              </span>
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: colorMode === 'cyber' ? 'rgba(16, 202, 120, 0.12)' : colorMode === 'paper' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                color: colorMode === 'cyber' ? '#10ca78' : colorMode === 'paper' ? '#D97706' : theme.smoke,
                fontFamily: "'JetBrains Mono', monospace",
                border: colorMode === 'cyber' ? '1px solid rgba(16, 202, 120, 0.35)' : colorMode === 'paper' ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid transparent',
                boxShadow: colorMode === 'cyber' ? '0 0 6px rgba(16, 202, 120, 0.25)' : 'none',
              }}>
                {colorMode === 'void' ? '1/3' : colorMode === 'cyber' ? '2/3' : '3/3'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // â”€â”€â”€ Sidebar content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sidebarContent = (
    <div
      style={{
        width: `${sidebarWidth}px`,
        minWidth: `${sidebarWidth}px`,
        background: theme.carbon,
        borderRight: `1px solid ${theme.border}`,
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
        borderBottom: `1px solid ${theme.border}`,
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
            border: `2px solid ${theme.amber}`,
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
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '1px', color: theme.white }}>DB TECH OS</div>
              <div style={{ fontSize: '9px', fontWeight: 500, color: theme.amberDim, textTransform: 'uppercase', letterSpacing: '1.5px' }}>MISSION CONTROL // V.2.4</div>
            </div>
          )}
        </Link>
      </div>

      {/* System Status Bar */}
      {!(collapsed && !isMobile) && (
        <div style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${theme.border}`,
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 500, color: theme.dimText, textTransform: 'uppercase', letterSpacing: '1px' }}>System Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, color: theme.success, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.success, animation: 'pulse 2s ease-in-out infinite' }} />
              OPERATIONAL
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: theme.dimText }}>CPU: <span style={{ color: theme.smoke }}>{cpuMetric}</span></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: theme.dimText }}>MEM: <span style={{ color: theme.smoke }}>{memMetric}</span></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: theme.dimText }}>DISK: <span style={{ color: theme.smoke }}>{diskMetric}</span></span>
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
            borderTop: `1px solid ${theme.border}`,
            color: theme.dimText,
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

  // â”€â”€â”€ Mobile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const mobileOverlay = isMobile && mobileOpen ? (
    <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150 }} />
  ) : null;

  const mobileToggle = isMobile ? (
    <button
      onClick={() => setMobileOpen(prev => !prev)}
      style={{
        position: 'fixed', top: '12px', left: '12px', zIndex: 250,
        background: theme.carbon, border: `1px solid ${theme.border}`,
        borderRadius: '8px', padding: '8px', cursor: 'pointer', color: theme.smoke,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {mobileOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  ) : null;

  // â”€â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className={colorMode === 'cyber' ? 'cyber-body' : colorMode === 'paper' ? 'paper-body' : ''} style={{ background: theme.void, color: colorMode === 'paper' ? '#1A1A1A' : '#f0f0f0', minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.85; }
          94% { opacity: 1; }
          97% { opacity: 0.9; }
          98% { opacity: 1; }
        }
        @keyframes cyberGlow {
          0%, 100% { text-shadow: 0 0 4px rgba(16, 202, 120, 0.8), 0 0 12px rgba(16, 202, 120, 0.4); }
          50% { text-shadow: 0 0 8px rgba(16, 202, 120, 1), 0 0 20px rgba(16, 202, 120, 0.6), 0 0 40px rgba(16, 202, 120, 0.2); }
        }
        ${colorMode === 'cyber' ? `
          .cyber-glow { animation: cyberGlow 3s ease-in-out infinite !important; }
          ::-webkit-scrollbar { width: 4px; background: #050e07; }
          ::-webkit-scrollbar-thumb { background: rgba(16, 202, 120, 0.3); border-radius: 2px; }
          ::selection { background: rgba(16, 202, 120, 0.3); color: #f0f0f0; }
          .cyber-body { animation: flicker 12s infinite; }
          .cyber-accent { color: #10ca78 !important; }
        ` : ''}
        ${colorMode === 'paper' ? `
          .paper-body { background: #FAFAFA !important; }
          ::-webkit-scrollbar { width: 6px; background: #F5F5F5; }
          ::-webkit-scrollbar-thumb { background: #D4D4D4; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #A3A3A3; }
          ::selection { background: rgba(180, 83, 9, 0.2); color: #1A1A1A; }
          h1, h2, h3, h4, h5, h6 { color: #1A1A1A !important; }
          a { color: #B45309; }
        ` : ''}
      `}</style>

      {/* CRT overlay — only in cyber mode */}
      {colorMode === 'cyber' && (
        <>
          {/* Scanlines */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
          }} />
          {/* Moving scanline beam */}
          <div style={{
            position: 'fixed', left: 0, right: 0, height: '3px', zIndex: 9999, pointerEvents: 'none',
            background: 'linear-gradient(transparent, rgba(16, 202, 120, 0.06), transparent)',
            animation: 'scanline 6s linear infinite',
          }} />
          {/* Vignette */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9997, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
          }} />
          {/* Noise grain */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9996, pointerEvents: 'none', opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }} />
        </>
      )}

      {mobileToggle}
      {mobileOverlay}
      {showSidebar && sidebarContent}
      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        transition: 'margin-left 0.2s ease',
        minHeight: '100vh',
        paddingTop: isMobile ? '56px' : 0,
        color: colorMode === 'paper' ? '#1A1A1A' : '#f0f0f0',
        background: colorMode === 'paper' ? '#FAFAFA' : 'transparent',
      }}>
        {children}
      </div>
    </div>
  );
}
