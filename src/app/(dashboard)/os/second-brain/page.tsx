'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import OpsGuard from '@/components/OpsGuard';

/* ───────────────── Design Tokens ───────────────── */
const T = {
  bg: '#0A0A0A',
  card: '#111111',
  elevated: '#18181B',
  amber: '#F59E0B',
  text: '#FAFAFA',
  secondary: '#A1A1AA',
  muted: '#71717A',
  border: '#27272A',
};

/* ───────────────── Memory Entry Type ───────────────── */
interface MemoryEntry {
  date: string;
  title: string;
  preview: string;
  content: string;
  tags: string[];
  category: 'decision' | 'note' | 'lesson' | 'event' | 'idea';
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  decision: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', icon: '⧉' },
  note:     { bg: 'rgba(59,130,246,0.15)',  text: '#3B82F6', icon: '◈' },
  lesson:   { bg: 'rgba(168,85,247,0.15)',  text: '#A855F7', icon: '⚡' },
  event:    { bg: 'rgba(34,197,94,0.15)',   text: '#22C55E', icon: '◉' },
  idea:     { bg: 'rgba(236,72,153,0.15)',  text: '#EC4899', icon: '✦' },
};

/* ───────────────── Memory Data ───────────────── */
const MEMORY_ENTRIES: MemoryEntry[] = [
  {
    date: '2026-02-11',
    title: 'Operations Overhaul Spec',
    preview: 'Paula delivered the Operations section redesign spec. N8N-inspired, node-based visualizations...',
    content: `# Operations Overhaul Spec\n\nPaula delivered the full spec for rebuilding the Operations section:\n\n## Key Changes\n- **Remove:** Schedule Center, Master Todo, Goals Tracker\n- **Build:** Memory Bank, Activity Dashboard, Skills Inventory, DNA\n- **Design Direction:** N8N workflow builder meets Linear meets Vercel\n- **Security:** 4-digit PIN gate on all Operations routes\n\n## Design Direction\n- Node-based visualizations\n- Connected data flows\n- Technical builder aesthetic\n- Dark base + amber (#F59E0B) accents`,
    tags: ['paula', 'operations', 'design', 'spec'],
    category: 'decision',
  },
  {
    date: '2026-02-10',
    title: 'Anders Workflow Rules Established',
    preview: 'New rules for Anders: smaller batches, done = deployed + verified, single source of truth...',
    content: `# Anders Workflow — New Rules\n\n## Background\nAnders has been saying "done" when code is written but not deployed.\n\n## Rules\n1. Smaller Batches — Max 2-3 items per batch\n2. "Done" = Deployed + Verified — Nothing is done until live on production\n3. Single Source of Truth — Pick ONE codebase\n4. Milo Verification Required — Hit the live URL, confirm features work\n5. Mandatory Handoff Checklist — Code committed, pushed, deployed, verified`,
    tags: ['anders', 'workflow', 'process', 'lesson'],
    category: 'lesson',
  },
  {
    date: '2026-02-09',
    title: 'Agent Skills Inventory Complete',
    preview: '82 total skills catalogued across 9 agents. 41 ready, 41 missing dependencies...',
    content: `# Skills Inventory Complete\n\n## Stats\n- **82** total skills catalogued\n- **9** agents profiled\n- **41** ready and operational\n- **41** missing dependencies\n\n## Key Finding\n50% readiness rate. Main blockers: macOS-only tools, missing CLI installations, API keys not configured.`,
    tags: ['skills', 'agents', 'inventory', 'milestone'],
    category: 'event',
  },
  {
    date: '2026-02-08',
    title: 'Brand Kit Finalized',
    preview: 'Paula finalized the DB Tech brand kit. Dark void base, electric amber accent, JetBrains Mono...',
    content: `# Brand Kit — Finalized\n\n## Colors\n- **Void:** #000000 (primary background)\n- **Carbon:** #111111 (card backgrounds)\n- **Graphite:** #1A1A1A (input fields)\n- **Electric Amber:** #F59E0B (primary accent)\n\n## Typography\n- **Headings:** JetBrains Mono\n- **Body:** Inter\n\n## Agent Colors\n- Milo: #A855F7 | Anders: #F97316 | Paula: #EC4899\n- Bobby: #22C55E | Dwight: #3B82F6 | Dax: #06B6D4\n- Tony: #EAB308 | Remy: #EF4444 | Wendy: #8B5CF6`,
    tags: ['brand', 'paula', 'design', 'colors'],
    category: 'decision',
  },
  {
    date: '2026-02-07',
    title: 'Git Backup Rule — Non-Negotiable',
    preview: 'Almost lost Wendy\'s session notes. Every agent workspace MUST be in git and pushed to GitHub...',
    content: `# Git Backup Rule — CRITICAL\n\n## What Happened\nAlmost lost Wendy's session notes with Derek's personal history.\n\n## Rule\nEvery agent workspace MUST be in git and pushed to GitHub.\n1. git add -A\n2. git commit -m "description"\n3. git push\n\nNo exceptions. If it's not in git, it doesn't exist.`,
    tags: ['git', 'backup', 'lesson', 'critical'],
    category: 'lesson',
  },
  {
    date: '2026-02-06',
    title: 'No Restarts Without Permission',
    preview: 'Learned lesson: never restart gateway or apply config changes without asking Derek first...',
    content: `# No Restarts Without Permission\n\n## Lesson Learned\nConfig changes can trigger gateway restarts. Gateway restarts kill Telegram connections briefly.\n\n## Rule\n- Always ask before restarting\n- Derek may prefer to wait until morning or a quiet time\n- Applies to: gateway restarts, config changes, updates`,
    tags: ['gateway', 'restart', 'lesson', 'permission'],
    category: 'lesson',
  },
  {
    date: '2026-02-05',
    title: 'DB Tech OS Architecture Decision',
    preview: 'Decided on Next.js 15 + Vercel for the DB Tech OS. Single-page app with sidebar navigation...',
    content: `# Architecture Decision: DB Tech OS\n\n## Stack\n- **Framework:** Next.js 15 (App Router)\n- **Hosting:** Vercel\n- **Styling:** Inline styles + brand tokens\n- **Data:** API routes hitting GitHub, Vercel, local files\n\n## Why\n- Fast iteration with SSR/SSG flexibility\n- Free tier on Vercel handles our traffic\n- Type-safe with TypeScript end-to-end`,
    tags: ['architecture', 'nextjs', 'vercel', 'decision'],
    category: 'decision',
  },
  {
    date: '2026-02-04',
    title: 'Cron Patterns Documentation',
    preview: 'Bobby\'s 5pm BTC bet cron fired but did nothing. Root cause: wrong cron pattern...',
    content: `# Cron Patterns — Fix\n\n## Problem\nBobby's 5pm BTC bet cron fired but did nothing. Used wrong payload pattern.\n\n## Always Use\n- sessionTarget: "isolated" — spawns fresh session\n- agentTurn — actually runs the agent\n- deliver: true — sends result to Telegram\n- Target Derek's ID directly`,
    tags: ['cron', 'bobby', 'fix', 'pattern'],
    category: 'lesson',
  },
  {
    date: '2026-02-03',
    title: 'Overnight Sessions Feature Shipped',
    preview: 'Shipped the overnight sessions page. Agents can now run background tasks while Derek sleeps...',
    content: `# Overnight Sessions — Shipped\n\n## Features\n- Agents run background tasks autonomously\n- Morning summary of all overnight activity\n- Configurable per-agent schedules\n- Auto-commit results to workspace repos\n\n## Impact\nDerek wakes up to completed research, organized data, and pending decisions.`,
    tags: ['overnight', 'feature', 'shipped', 'agents'],
    category: 'event',
  },
  {
    date: '2026-02-02',
    title: 'Cardinal Rule Established',
    preview: 'Never lie to Derek. Never say something is done unless it IS done. Document everything...',
    content: `# Cardinal Rule — NEVER LIE TO DEREK\n\n## The Rule\nNEVER say something is done unless it IS done.\nNEVER say something is saved unless the file EXISTS.\nDOCUMENT EVERYTHING.\n\n## Verification Process\n1. VERIFY — Check the file/commit/output actually exists\n2. CONFIRM — Read it back, make sure it's real\n3. THEN tell Derek it's done`,
    tags: ['cardinal-rule', 'honesty', 'verification', 'critical'],
    category: 'decision',
  },
  {
    date: '2026-02-01',
    title: 'Memory System Overhaul',
    preview: 'Context window ≠ memory files. Important distinction learned after losing context in long sessions...',
    content: `# Memory System — Lessons\n\n## Key Distinction\n- **Memory files** = persistent, survives sessions\n- **Context window** = live chat buffer, has hard limits, gets truncated\n\n## Fix\n1. Write to disk IMMEDIATELY\n2. Log important events RIGHT WHEN they happen\n3. Start fresh sessions for distinct tasks\n4. Use /compact proactively`,
    tags: ['memory', 'context', 'lesson', 'system'],
    category: 'lesson',
  },
  {
    date: '2026-01-31',
    title: 'MILO Agent Team Formed',
    preview: 'Full agent team established: Milo (Chief of Staff), Anders (Architect), Paula (Creative Director)...',
    content: `# MILO Agent Team — Formed\n\n## The Team\n- **Milo** — Chief of Staff (orchestration)\n- **Anders** — Full Stack Architect (code, deployment)\n- **Paula** — Creative Director (design, brand)\n- **Bobby** — Trading Advisor (markets, options)\n- **Dwight** — Intelligence Officer (monitoring, briefs)\n- **Dax** — Social Media Strategist (content, trends)\n- **Tony** — Restaurant Operations (menu, inventory)\n- **Remy** — Restaurant Marketing (social, promos)\n- **Wendy** — Personal Assistant (family, wellness)`,
    tags: ['team', 'agents', 'milestone', 'formation'],
    category: 'event',
  },
  {
    date: '2026-01-30',
    title: 'DB Tech OS Idea Conceived',
    preview: 'Initial concept for a personal operating system dashboard. Mission control for all agent activity...',
    content: `# DB Tech OS — Concept\n\n## Vision\nA personal operating system dashboard that serves as mission control for:\n- All agent activity and coordination\n- Project management and tracking\n- Market monitoring and trading\n- Content pipeline management\n- Personal operations\n\n## Goal\nMake it look like you're running a space station command center.`,
    tags: ['concept', 'idea', 'vision', 'origin'],
    category: 'idea',
  },
];

/* ───────────────── Render Markdown Lines ───────────────── */
function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: '13px', color: T.secondary, lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <div key={i} style={{ fontSize: '18px', fontWeight: 700, color: T.amber, fontFamily: "'JetBrains Mono', monospace", margin: '0 0 12px' }}>{line.slice(2)}</div>;
        }
        if (line.startsWith('## ')) {
          return <div key={i} style={{ fontSize: '15px', fontWeight: 600, color: T.text, margin: '16px 0 8px' }}>{line.slice(3)}</div>;
        }
        if (line.startsWith('- **')) {
          const m = line.match(/^- \*\*(.+?)\*\*(.*)$/);
          if (m) return <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}><span style={{ color: T.amber }}>›</span><span><strong style={{ color: T.text }}>{m[1]}</strong><span>{m[2]}</span></span></div>;
        }
        if (line.startsWith('- ')) {
          return <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}><span style={{ color: T.amber }}>›</span><span>{line.slice(2)}</span></div>;
        }
        if (line.match(/^\d+\./)) {
          return <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}><span style={{ color: T.amber, fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', minWidth: '16px', fontWeight: 600 }}>{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
        }
        if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

/* ───────────────── Timeline Node ───────────────── */
function TimelineNode({ entry, isExpanded, onToggle }: { entry: MemoryEntry; isExpanded: boolean; onToggle: () => void }) {
  const cat = CATEGORY_COLORS[entry.category];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', marginBottom: 0 }}>
      {/* Timeline track */}
      <div style={{ position: 'absolute', left: '24px', top: 0, bottom: '-1px', width: '2px', background: `linear-gradient(to bottom, ${cat.text}40, ${T.border})`, zIndex: 0 }} />
      {/* Node dot */}
      <div style={{ width: '50px', flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: '18px', zIndex: 1 }}>
        <div style={{
          width: isExpanded ? '14px' : '10px', height: isExpanded ? '14px' : '10px',
          borderRadius: '50%', background: isExpanded ? cat.text : T.card,
          border: `2px solid ${cat.text}`, boxShadow: isExpanded ? `0 0 12px ${cat.text}66` : 'none',
          transition: 'all 0.3s ease',
        }} />
      </div>
      {/* Card */}
      <div
        onClick={onToggle}
        style={{
          flex: 1, background: isExpanded ? T.elevated : T.card,
          border: `1px solid ${isExpanded ? cat.text + '40' : T.border}`,
          borderLeft: `3px solid ${cat.text}`, borderRadius: '8px',
          padding: isExpanded ? '20px' : '16px', marginBottom: '12px',
          cursor: 'pointer', transition: 'all 0.25s ease', overflow: 'hidden',
        }}
        onMouseEnter={e => { if (!isExpanded) { e.currentTarget.style.borderColor = cat.text + '40'; e.currentTarget.style.boxShadow = `0 0 20px ${cat.text}15`; } }}
        onMouseLeave={e => { if (!isExpanded) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.borderLeftColor = cat.text; e.currentTarget.style.boxShadow = 'none'; } }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isExpanded ? '12px' : '6px', flexWrap: 'wrap' }}>
          <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: cat.text, flexShrink: 0 }}>{cat.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' as const }}>{entry.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '4px', background: cat.bg, color: cat.text, fontWeight: 600, textTransform: 'uppercase' as const }}>{entry.category}</span>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>{entry.date}</span>
            <span style={{ fontSize: '12px', color: T.muted, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {/* Preview */}
        {!isExpanded && (
          <div style={{ fontSize: '12px', color: T.secondary, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, paddingLeft: '38px' }}>{entry.preview}</div>
        )}
        {/* Expanded */}
        {isExpanded && (
          <div style={{ paddingLeft: '38px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {entry.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px', borderRadius: '4px', background: T.elevated, color: T.secondary, border: `1px solid ${T.border}` }}>#{tag}</span>
              ))}
            </div>
            <MarkdownContent text={entry.content} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── Graph Minimap ───────────────── */
function GraphMinimap({ entries, selectedIndex }: { entries: MemoryEntry[]; selectedIndex: number | null }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: T.muted, marginBottom: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
        Knowledge Graph · {entries.length} nodes
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
        {entries.map((entry, i) => {
          const cat = CATEGORY_COLORS[entry.category];
          const isSel = selectedIndex === i;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <div title={`${entry.date}: ${entry.title}`} style={{
                width: isSel ? '24px' : '16px', height: isSel ? '24px' : '16px',
                borderRadius: '4px', background: isSel ? cat.text : cat.bg,
                border: `1.5px solid ${cat.text}`, boxShadow: isSel ? `0 0 8px ${cat.text}66` : 'none',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', color: isSel ? '#000' : cat.text,
              }}>{isSel && cat.icon}</div>
              {i < entries.length - 1 && (
                <div style={{ width: '12px', height: '2px', background: `linear-gradient(to right, ${cat.text}60, ${CATEGORY_COLORS[entries[i + 1].category].text}60)`, borderRadius: '1px' }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_COLORS).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: val.bg, border: `1px solid ${val.text}` }} />
            <span style={{ fontSize: '10px', color: T.muted, fontFamily: "'JetBrains Mono', monospace", textTransform: 'capitalize' as const }}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */
export default function SecondBrainPage() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const filteredEntries = useMemo(() => {
    return MEMORY_ENTRIES.filter(entry => {
      if (search) {
        const q = search.toLowerCase();
        if (!(entry.title.toLowerCase().includes(q) || entry.preview.toLowerCase().includes(q) || entry.content.toLowerCase().includes(q) || entry.tags.some(t => t.toLowerCase().includes(q)))) return false;
      }
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
      if (dateFrom && entry.date < dateFrom) return false;
      if (dateTo && entry.date > dateTo) return false;
      return true;
    });
  }, [search, categoryFilter, dateFrom, dateTo]);

  const selectedIndex = useMemo(() => {
    const keys = Object.entries(expanded).filter(([, v]) => v).map(([k]) => parseInt(k));
    return keys.length > 0 ? keys[0] : null;
  }, [expanded]);

  const toggleEntry = useCallback((i: number) => setExpanded(p => ({ ...p, [i]: !p[i] })), []);

  const categories = ['all', 'decision', 'note', 'lesson', 'event', 'idea'];

  return (
    <OpsGuard>
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: '28px', fontWeight: 700, color: T.amber, textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Second Brain</h1>
            <p style={{ color: T.secondary, margin: 0, fontSize: '14px' }}>Memory bank · Decision log · Knowledge graph · {MEMORY_ENTRIES.length} entries</p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: T.muted, pointerEvents: 'none' }}>⌕</div>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search memories, decisions, notes..."
              style={{
                width: '100%', padding: '12px 16px 12px 40px', background: T.card,
                border: `1px solid ${T.border}`, borderRadius: '10px', color: T.text,
                fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '24px', padding: '14px 16px', background: T.card, borderRadius: '8px', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {categories.map(cat => {
                const isActive = categoryFilter === cat;
                const cs = cat !== 'all' ? CATEGORY_COLORS[cat] : null;
                return (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', border: 'none',
                    background: isActive ? (cs ? cs.bg : 'rgba(245,158,11,0.18)') : T.elevated,
                    color: isActive ? (cs ? cs.text : T.amber) : T.secondary,
                    textTransform: 'capitalize' as const, transition: 'all 0.2s',
                  }}>{cat}</button>
                );
              })}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>From</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '5px 10px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' }} />
              <span style={{ fontSize: '11px', color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>To</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '5px 10px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' }} />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ padding: '4px 8px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '4px', color: T.muted, fontSize: '11px', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>✕</button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '12px 16px', background: T.card, borderRadius: '8px', border: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: T.amber }}>{filteredEntries.length}</span>
              <span style={{ fontSize: '12px', color: T.secondary }}>{filteredEntries.length === MEMORY_ENTRIES.length ? 'total entries' : 'matching'}</span>
            </div>
            <div style={{ width: 1, background: T.border, alignSelf: 'stretch' }} />
            {Object.entries(CATEGORY_COLORS).map(([cat, s]) => {
              const c = filteredEntries.filter(e => e.category === cat).length;
              if (!c) return null;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.text }} />
                  <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: s.text }}>{c}</span>
                  <span style={{ fontSize: '11px', color: T.muted, textTransform: 'capitalize' as const }}>{cat}s</span>
                </div>
              );
            })}
          </div>

          {/* Graph Minimap */}
          <GraphMinimap entries={filteredEntries} selectedIndex={selectedIndex} />

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {filteredEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '14px' }}>No entries match your search</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters or search terms</div>
              </div>
            ) : (
              filteredEntries.map((entry, i) => (
                <TimelineNode key={`${entry.date}-${i}`} entry={entry} isExpanded={!!expanded[i]} onToggle={() => toggleEntry(i)} />
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            Second Brain · Memory Bank · {MEMORY_ENTRIES.length} entries loaded
          </div>
        </div>
      </div>

      <style>{`
        @keyframes contentFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </OpsGuard>
  );
}
