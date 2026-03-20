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

// ─── Avatar ───────────────────────────────────────────────────────────────

function Avatar({ m }: { m: Member }) {
  if (m.hasAvatar) {
    const src = m.name === 'Derek' ? '/derek-avatar.png' : `/os/agents/${m.name.toLowerCase()}.png?v=2`;
    return (
      <div style={{ width: 38, height: 38, borderRadius: 7, overflow: 'hidden', border: `1.5px solid ${m.color}`, background: '#000', flexShrink: 0 }}>
        <img src={src} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 7,
      background: m.color, color: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0,
    }}>
      {m.initials}
    </div>
  );
}

function Card({ m }: { m: Member }) {
  return (
    <div style={{
      background: 'rgba(12,18,32,0.9)', border: `1px solid ${m.color}30`,
      borderRadius: 8, padding: '8px 10px',
      display: 'flex', alignItems: 'center', gap: 9,
    }}>
      <Avatar m={m} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#eef2ff', fontSize: 12, fontWeight: 700 }}>{m.name}</div>
        <div style={{ color: '#4a5a7a', fontSize: 10, marginTop: 2 }}>{m.role}</div>
      </div>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981', flexShrink: 0 }} />
    </div>
  );
}

function Slot({ label }: { label: string }) {
  return (
    <div style={{
      border: '1px dashed #1a2540', borderRadius: 8,
      padding: '9px 10px', color: '#2a3a58',
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
      textTransform: 'uppercase', textAlign: 'center',
    }}>
      + {label}
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span style={{
      fontSize: 10, color: '#2e3f5e', padding: '3px 8px',
      borderRadius: 5, background: 'rgba(5,8,18,0.7)', border: '1px solid #111d30',
    }}>{text}</span>
  );
}

// ─── Room wrapper ─────────────────────────────────────────────────────────

function Room({
  id, label, color, isolated = false, children, hovered, onHover,
}: {
  id: string; label: string; color: string; isolated?: boolean;
  children: React.ReactNode; hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  return (
    <div
      id={`room-${id}`}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: '#07090f',
        border: `1px ${isolated ? 'dashed' : 'solid'} ${hovered ? color + '90' : color + '30'}`,
        borderRadius: 13,
        padding: 13,
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        transition: 'border-color 0.2s',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
        <span style={{ color, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─── SVG path helper ──────────────────────────────────────────────────────

function makePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) < 2) return `M${x1} ${y1}L${x2} ${y2}`;
  if (Math.abs(dy) < 2) return `M${x1} ${y1}L${x2} ${y2}`;

  // Elbow: go halfway horizontally, then full vertical
  const midX = x1 + dx / 2;
  const r = Math.min(10, Math.abs(dx) / 2, Math.abs(dy) / 2);
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

type Edge = 'right' | 'left' | 'bottom' | 'top';

function edgePoint(rect: DOMRect, containerRect: DOMRect, edge: Edge): [number, number] {
  const x = rect.left - containerRect.left;
  const y = rect.top  - containerRect.top;
  switch (edge) {
    case 'right':  return [x + rect.width,       y + rect.height / 2];
    case 'left':   return [x,                    y + rect.height / 2];
    case 'bottom': return [x + rect.width / 2,   y + rect.height];
    case 'top':    return [x + rect.width / 2,   y];
  }
}

const WIRES: Array<[string, Edge, string, Edge, string]> = [
  ['executive', 'bottom', 'command',  'top',   '#F59E0B'],
  ['command',   'right',  'creative', 'left',  '#EC4899'],
  ['command',   'right',  'ops',      'left',  '#60A5FA'],
  ['ops',       'bottom', 'growth',   'top',   '#34D399'],
  ['command',   'bottom', 'personal', 'top',   '#8B5CF6'],
];

// ─── Main page ────────────────────────────────────────────────────────────

export default function OrgStructurePage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef   = useRef<SVGSVGElement>(null);

  const drawWires = useCallback(() => {
    const container = canvasRef.current;
    const svg       = svgRef.current;
    if (!container || !svg) return;

    const cb = container.getBoundingClientRect();

    // Clear old paths
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    for (const [fromId, fromEdge, toId, toEdge, color] of WIRES) {
      const fromEl = document.getElementById(`room-${fromId}`);
      const toEl   = document.getElementById(`room-${toId}`);
      if (!fromEl || !toEl) continue;

      const [x1, y1] = edgePoint(fromEl.getBoundingClientRect(), cb, fromEdge);
      const [x2, y2] = edgePoint(toEl.getBoundingClientRect(),   cb, toEdge);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', makePath(x1, y1, x2, y2));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.5');
      svg.appendChild(path);
    }
  }, []);

  useEffect(() => {
    // Draw after first paint
    const id = requestAnimationFrame(() => {
      drawWires();
    });

    // Re-draw on resize
    const ro = new ResizeObserver(() => drawWires());
    if (canvasRef.current) ro.observe(canvasRef.current);

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [drawWires]);

  const ROOM_CHIPS = [
    { id: 'executive', label: 'Executive Suite',     color: '#F59E0B' },
    { id: 'command',   label: 'Central Command',     color: '#34D399' },
    { id: 'creative',  label: 'Creative + Tech',     color: '#EC4899' },
    { id: 'ops',       label: 'Ops + Intel',         color: '#60A5FA' },
    { id: 'personal',  label: 'Personal Suite',      color: '#8B5CF6' },
    { id: 'growth',    label: 'Growth + Social',     color: '#34D399' },
  ];

  return (
    <div style={{
      height: '100%',
      background: '#000',
      padding: '18px 22px',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <div style={{
        flex: 1,
        border: '1px solid #10192a',
        borderRadius: 15,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px', borderBottom: '1px solid #0c1422', flexShrink: 0,
        }}>
          <span style={{ color: '#eef2ff', fontSize: 14, fontWeight: 800, letterSpacing: 0.3 }}>
            ARCHITECTURAL ORG PLAN
          </span>
          <div style={{
            maxWidth: 300, background: '#020408', border: '1px solid #10192a',
            borderRadius: 8, padding: '7px 12px', color: '#2a3a58', fontSize: 11, flex: 1,
          }}>
            Search rooms, agents, roles...
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {['List', 'Canvas', 'Office', 'GPT'].map(p => (
              <div key={p} style={{
                padding: '5px 11px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                border: `1px solid ${p === 'GPT' ? '#1a6048' : '#10192a'}`,
                background: p === 'GPT' ? 'rgba(16,185,129,0.08)' : 'transparent',
                color: p === 'GPT' ? '#5edba8' : '#2a3a58',
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Chips */}
        <div style={{ padding: '8px 18px 4px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
          {ROOM_CHIPS.map(r => (
            <div key={r.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 6,
              border: `1px solid ${hovered === r.id ? r.color + '55' : '#10192a'}`,
              background: hovered === r.id ? `${r.color}10` : 'transparent',
              color: hovered === r.id ? r.color : '#2a3a58',
              fontSize: 10, fontWeight: 700, cursor: 'default', transition: 'all 0.15s',
            }}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span style={{ width: 5, height: 5, borderRadius: 1, background: r.color }} />
              {r.label}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, padding: '8px 16px 16px', overflow: 'hidden', display: 'flex' }}>
          <div
            ref={canvasRef}
            style={{
              flex: 1,
              background: '#020408',
              borderRadius: 11,
              border: '1px solid #0c1422',
              position: 'relative',
              overflow: 'auto',
            }}
          >
            {/* Dot grid bg */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'radial-gradient(circle, #151f35 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              zIndex: 0,
            }} />

            {/* SVG wire overlay */}
            <svg
              ref={svgRef}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 3,
                overflow: 'visible',
              }}
            />

            {/* 2-column room grid */}
            <div style={{
              position: 'relative', zIndex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              padding: 18,
              minHeight: '100%',
              boxSizing: 'border-box',
            }}>

              {/* ROW 1 */}
              {/* Executive Suite */}
              <Room id="executive" label="Executive Suite" color="#F59E0B" hovered={hovered === 'executive'} onHover={setHovered}>
                <Card m={DEREK} />
              </Room>

              {/* Creative + Tech Wing */}
              <Room id="creative" label="Creative + Tech Wing" color="#EC4899" hovered={hovered === 'creative'} onHover={setHovered}>
                <Card m={PAULA} />
                <Card m={ANDERS} />
                <Slot label="Add builder" />
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <Tag text="Brand systems" /><Tag text="Build + implementation" />
                </div>
              </Room>

              {/* ROW 2 */}
              {/* Central Command */}
              <Room id="command" label="Central Command" color="#34D399" hovered={hovered === 'command'} onHover={setHovered}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <Card m={TED} />
                    <Card m={MILO_M} />
                    <Slot label="Add chief" />
                  </div>
                  <div style={{
                    background: 'rgba(10,16,28,0.9)', border: '1px solid #101e30',
                    borderRadius: 9, padding: '10px',
                  }}>
                    <div style={{ color: '#eef2ff', fontSize: 10, fontWeight: 800, marginBottom: 7 }}>Command Notes</div>
                    {[
                      'Routes priority work across all rooms',
                      'Turns requests into shipping decisions',
                      'Keeps leadership aligned and unblocked',
                    ].map(n => (
                      <div key={n} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#34D399', marginTop: 5, flexShrink: 0 }} />
                        <span style={{ color: '#2e4060', fontSize: 10, lineHeight: 1.5 }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Room>

              {/* Ops + Intel Wing */}
              <Room id="ops" label="Ops + Intel Wing" color="#60A5FA" hovered={hovered === 'ops'} onHover={setHovered}>
                <Card m={BOBBY} />
                <Card m={REMY_M} />
                <Card m={TRENT} />
                <Slot label="Add operator" />
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <Tag text="Markets" /><Tag text="Operations" /><Tag text="Intel" />
                </div>
              </Room>

              {/* ROW 3 */}
              {/* Personal Suite */}
              <Room id="personal" label="Personal Suite" color="#8B5CF6" isolated hovered={hovered === 'personal'} onHover={setHovered}>
                <Card m={WENDY} />
                <Slot label="Add support" />
                <Tag text="Private lane" />
              </Room>

              {/* Growth + Social Wing */}
              <Room id="growth" label="Growth + Social Wing" color="#34D399" hovered={hovered === 'growth'} onHover={setHovered}>
                <Card m={MICHAEL} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Card m={DWIGHT} />
                  <Card m={JIM} />
                </div>
                <Slot label="Add closer" />
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <Tag text="Audience growth" /><Tag text="Sales / outreach" />
                </div>
              </Room>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
