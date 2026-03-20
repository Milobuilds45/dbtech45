'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────

type Member = {
  name: string;
  role: string;
  initials: string;
  color: string;
  hasAvatar?: boolean;
};

// ─── Members ──────────────────────────────────────────────────────────────

const DEREK:   Member = { name: 'Derek',   role: 'CEO / Founder',     initials: 'D',  color: '#F59E0B', hasAvatar: true };
const TED:     Member = { name: 'Ted',     role: 'COO',               initials: 'TD', color: '#d4a574', hasAvatar: true };
const MILO_M:  Member = { name: 'Milo',    role: 'Senior Advisor',    initials: 'MI', color: '#A855F7', hasAvatar: true };
const PAULA:   Member = { name: 'Paula',   role: 'Creative Director', initials: 'PA', color: '#EC4899', hasAvatar: true };
const ANDERS:  Member = { name: 'Anders',  role: 'IT / Engineering',  initials: 'AN', color: '#F97316', hasAvatar: true };
const BOBBY:   Member = { name: 'Bobby',   role: 'Trading',           initials: 'BO', color: '#22C55E', hasAvatar: true };
const REMY_M:  Member = { name: 'Remy',    role: 'Restaurant Ops',    initials: 'RM', color: '#EAB308', hasAvatar: true };
const TRENT:   Member = { name: 'Trent',   role: 'Intel',             initials: 'TR', color: '#EF4444' };
const MICHAEL: Member = { name: 'Michael', role: 'Sales',             initials: 'MS', color: '#F59E0B' };
const DWIGHT:  Member = { name: 'Dwight',  role: 'Intel',             initials: 'DW', color: '#6366F1', hasAvatar: true };
const JIM:     Member = { name: 'Jim',     role: 'Social',            initials: 'JH', color: '#06B6D4' };
const WENDY:   Member = { name: 'Wendy',   role: 'Personal',          initials: 'WN', color: '#8B5CF6', hasAvatar: true };

// ─── Layout ───────────────────────────────────────────────────────────────
//
//  TOP-DOWN hierarchy, left → right flow:
//
//  COL 0 (x=60)       COL 1 (x=360)        COL 2 (x=700)
//  ─────────────────  ───────────────────   ──────────────────────────────
//  [ Derek / Exec ]──▶[ Command           ] ──▶ [ Creative + Tech  ]
//                     [ Ted, Milo         ]  │
//                                            ├──▶ [ Ops + Intel     ]
//                                            │
//                                            └──▶ [ Growth + Social ]
//
//  [ Wendy / Personal ]  ← connected from Derek only, sits below Derek
//
//  Node width = 280px.  Positions are top-left corners.

const NODE_W = 280;

interface RoomDef {
  id: string;
  label: string;
  color: string;
  left: number;
  top: number;
  isolated?: boolean;
  members: Member[];
  notes?: string[];
  addSlot?: string;
  tags?: string[];
}

const ROOMS: RoomDef[] = [
  // COL 0
  {
    id: 'executive',
    label: 'Executive Suite',
    color: '#F59E0B',
    left: 60, top: 80,
    members: [DEREK],
    addSlot: 'Your seat',
  },
  {
    id: 'personal',
    label: 'Personal Suite',
    color: '#8B5CF6',
    left: 60, top: 310,
    isolated: true,
    members: [WENDY],
    tags: ['Private lane'],
    addSlot: 'Add support',
  },

  // COL 1
  {
    id: 'command',
    label: 'Central Command',
    color: '#34D399',
    left: 400, top: 80,
    members: [TED, MILO_M],
    notes: [
      'Routes priority work across all rooms',
      'Turns requests into shipping decisions',
      'Keeps leadership aligned & unblocked',
    ],
    addSlot: 'Add chief',
  },

  // COL 2
  {
    id: 'creative',
    label: 'Creative + Tech Wing',
    color: '#EC4899',
    left: 760, top: 60,
    members: [PAULA, ANDERS],
    tags: ['Brand systems', 'Build + implementation'],
    addSlot: 'Add builder',
  },
  {
    id: 'ops',
    label: 'Ops + Intel Wing',
    color: '#60A5FA',
    left: 760, top: 380,
    members: [BOBBY, REMY_M, TRENT],
    tags: ['Markets', 'Operations', 'Intel'],
    addSlot: 'Add operator',
  },
  {
    id: 'growth',
    label: 'Growth + Social Wing',
    color: '#34D399',
    left: 760, top: 730,
    members: [MICHAEL, DWIGHT, JIM],
    tags: ['Audience growth', 'Sales / outreach'],
    addSlot: 'Add closer',
  },
];

// ─── Wire definitions ─────────────────────────────────────────────────────
// [fromId, fromEdge, toId, toEdge, color]
// Edges: top | bottom | left | right

type Edge = 'top' | 'bottom' | 'left' | 'right';

const WIRES: Array<[string, Edge, string, Edge, string]> = [
  // Derek → Command
  ['executive', 'right', 'command',  'left',  '#F59E0B'],
  // Derek → Wendy (direct, private)
  ['executive', 'bottom', 'personal', 'top',   '#8B5CF6'],
  // Command → Creative
  ['command',   'right',  'creative', 'left',  '#EC4899'],
  // Command → Ops
  ['command',   'right',  'ops',      'left',  '#60A5FA'],
  // Command → Growth
  ['command',   'right',  'growth',   'left',  '#34D399'],
];

// ─── Path builder (N8N-style orthogonal elbow) ────────────────────────────

function makePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) < 2) return `M${x1} ${y1}L${x2} ${y2}`;
  if (Math.abs(dy) < 2) return `M${x1} ${y1}L${x2} ${y2}`;

  const midX = x1 + dx / 2;
  const r = Math.min(12, Math.abs(dx) / 2, Math.abs(dy) / 2);
  const hd = dx > 0 ? 1 : -1;
  const vd = dy > 0 ? 1 : -1;

  return [
    `M${x1} ${y1}`,
    `L${midX - hd * r} ${y1}`,
    `Q${midX} ${y1} ${midX} ${y1 + vd * r}`,
    `L${midX} ${y2 - vd * r}`,
    `Q${midX} ${y2} ${midX + hd * r} ${y2}`,
    `L${x2} ${y2}`,
  ].join('');
}

function getEdgePoint(el: HTMLElement, edge: Edge, scrollEl: HTMLElement): [number, number] {
  const er = el.getBoundingClientRect();
  const sr = scrollEl.getBoundingClientRect();
  const x = er.left - sr.left + scrollEl.scrollLeft;
  const y = er.top  - sr.top  + scrollEl.scrollTop;
  const w = er.width;
  const h = er.height;
  switch (edge) {
    case 'right':  return [x + w,      y + h / 2];
    case 'left':   return [x,          y + h / 2];
    case 'bottom': return [x + w / 2,  y + h];
    case 'top':    return [x + w / 2,  y];
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────

function Avatar({ m }: { m: Member }) {
  const S = 36;
  if (m.hasAvatar) {
    const src = m.name === 'Derek' ? '/derek-avatar.png' : `/os/agents/${m.name.toLowerCase()}.png?v=2`;
    return (
      <div style={{ width: S, height: S, borderRadius: 7, overflow: 'hidden', border: `1.5px solid ${m.color}`, background: '#000', flexShrink: 0 }}>
        <img src={src} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: S, height: S, borderRadius: 7,
      background: m.color, color: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0,
    }}>{m.initials}</div>
  );
}

function MemberRow({ m }: { m: Member }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 10px',
      background: 'rgba(8,12,22,0.9)',
      border: `1px solid ${m.color}22`,
      borderRadius: 8,
    }}>
      <Avatar m={m} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#e8eeff', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{m.name}</div>
        <div style={{ color: '#35486a', fontSize: 11, marginTop: 2 }}>{m.role}</div>
      </div>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981aa', flexShrink: 0 }} />
    </div>
  );
}

// ─── Room node ────────────────────────────────────────────────────────────

function RoomNode({ room, hovered, onHover }: {
  room: RoomDef;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const { id, label, color, left, top, isolated, members, notes, addSlot, tags } = room;

  return (
    <div
      id={`room-${id}`}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: 'absolute',
        left,
        top,
        width: NODE_W,
        background: hovered ? '#0c1120' : '#080c18',
        border: `1px ${isolated ? 'dashed' : 'solid'} ${hovered ? color + 'cc' : color + '38'}`,
        borderRadius: 13,
        padding: '12px 12px 10px',
        boxShadow: hovered
          ? `0 0 32px ${color}22, 0 4px 20px rgba(0,0,0,0.6)`
          : `0 2px 14px rgba(0,0,0,0.5)`,
        transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
        <span style={{ color, fontSize: 9, fontWeight: 800, letterSpacing: 1.1, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>

      {/* Members */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {members.map(m => <MemberRow key={m.name} m={m} />)}
      </div>

      {/* Notes */}
      {notes && (
        <div style={{
          marginTop: 8,
          background: 'rgba(5,8,18,0.95)', border: '1px solid #0d1c2e',
          borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {notes.map(n => (
            <div key={n} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
              <span style={{ color: '#263850', fontSize: 10, lineHeight: 1.5 }}>{n}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add slot */}
      {addSlot && (
        <div style={{
          marginTop: 7,
          border: '1px dashed #111e32', borderRadius: 7,
          padding: '7px 10px', color: '#1e2e48',
          fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
          textTransform: 'uppercase', textAlign: 'center',
        }}>
          + {addSlot}
        </div>
      )}

      {/* Tags */}
      {tags && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
          {tags.map(t => (
            <span key={t} style={{
              fontSize: 9, color: '#243550', padding: '3px 7px',
              borderRadius: 5, background: 'rgba(3,5,14,0.9)', border: '1px solid #0d1a2c',
            }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

const CANVAS_W = 1120;
const CANVAS_H = 1040;

export default function OrgStructurePage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);

  const drawWires = useCallback(() => {
    const scroll = scrollRef.current;
    const svg    = svgRef.current;
    if (!scroll || !svg) return;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    for (const [fromId, fromEdge, toId, toEdge, color] of WIRES) {
      const fromEl = document.getElementById(`room-${fromId}`) as HTMLElement | null;
      const toEl   = document.getElementById(`room-${toId}`)   as HTMLElement | null;
      if (!fromEl || !toEl) continue;

      const [x1, y1] = getEdgePoint(fromEl, fromEdge, scroll);
      const [x2, y2] = getEdgePoint(toEl,   toEdge,   scroll);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', makePath(x1, y1, x2, y2));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.55');
      svg.appendChild(path);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTimeout(drawWires, 40));
    const ro = new ResizeObserver(() => drawWires());
    if (scrollRef.current) ro.observe(scrollRef.current);
    return () => { cancelAnimationFrame(frame); ro.disconnect(); };
  }, [drawWires]);

  const CHIPS = ROOMS.map(r => ({ id: r.id, label: r.label, color: r.color }));

  return (
    <div style={{
      height: '100%',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 20px',
        borderBottom: '1px solid #0a1220',
        flexShrink: 0,
      }}>
        <span style={{ color: '#e8eeff', fontSize: 13, fontWeight: 800, letterSpacing: 0.5 }}>
          ARCHITECTURAL ORG PLAN
        </span>
        <div style={{
          maxWidth: 260, flex: 1,
          background: '#020407', border: '1px solid #0a1220',
          borderRadius: 8, padding: '6px 12px', color: '#182030', fontSize: 11,
        }}>
          Search rooms, agents, roles...
        </div>
        <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>
          {['List', 'Canvas', 'Office', 'GPT'].map(p => (
            <div key={p} style={{
              padding: '5px 11px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              border: `1px solid ${p === 'GPT' ? '#1a6048' : '#0a1220'}`,
              background: p === 'GPT' ? 'rgba(16,185,129,0.08)' : 'transparent',
              color: p === 'GPT' ? '#5edba8' : '#1e2d44',
            }}>{p}</div>
          ))}
        </div>
      </div>

      {/* Chips */}
      <div style={{ padding: '7px 20px 5px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {CHIPS.map(r => (
          <div
            key={r.id}
            onMouseEnter={() => setHovered(r.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 9px', borderRadius: 6, cursor: 'default',
              border: `1px solid ${hovered === r.id ? r.color + '60' : '#0a1220'}`,
              background: hovered === r.id ? `${r.color}10` : 'transparent',
              color: hovered === r.id ? r.color : '#1e2d44',
              fontSize: 10, fontWeight: 700, transition: 'all 0.15s',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 1, background: r.color }} />
            {r.label}
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          margin: '7px 16px 16px',
          borderRadius: 12,
          border: '1px solid #0a1220',
          background: '#020407',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(circle, #111e35 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Fixed-size canvas */}
        <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, zIndex: 1 }}>

          {/* SVG wires */}
          <svg
            ref={svgRef}
            style={{
              position: 'absolute', inset: 0,
              width: CANVAS_W, height: CANVAS_H,
              pointerEvents: 'none', zIndex: 1,
              overflow: 'visible',
            }}
          />

          {/* Rooms */}
          {ROOMS.map(room => (
            <RoomNode
              key={room.id}
              room={room}
              hovered={hovered === room.id}
              onHover={setHovered}
            />
          ))}

        </div>
      </div>
    </div>
  );
}
