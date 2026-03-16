'use client';

import { useEffect, useMemo, useState } from 'react';

type Member = {
  name: string;
  role: string;
  initials: string;
  color: string;
  hasAvatar?: boolean;
  accent?: string;
};

type Room = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  lead?: Member;
  members?: Member[];
  notes?: string[];
  isolated?: boolean;
};

const VIEW_W = 1000;
const VIEW_H = 700;

const themeVoid = {
  page: '#070b12',
  panel: '#0c111b',
  room: '#101725',
  card: '#151d2d',
  border: '#223048',
  borderSoft: '#1a2438',
  text: '#f5f7fb',
  textMuted: '#7f8aa3',
  grid: 'rgba(120, 140, 180, 0.08)',
  hallway: 'rgba(160, 170, 190, 0.09)',
  hallwayLine: 'rgba(200, 208, 220, 0.18)',
  amber: '#F59E0B',
  success: '#10B981',
};

const themeCyber = {
  page: '#050e07',
  panel: '#08150b',
  room: '#0b1a10',
  card: '#0f2215',
  border: 'rgba(16, 202, 120, 0.28)',
  borderSoft: 'rgba(16, 202, 120, 0.18)',
  text: '#effff4',
  textMuted: '#83a18d',
  grid: 'rgba(16, 202, 120, 0.06)',
  hallway: 'rgba(16, 202, 120, 0.08)',
  hallwayLine: 'rgba(16, 202, 120, 0.22)',
  amber: '#10ca78',
  success: '#39ff7e',
};

const rooms: Room[] = [
  {
    id: 'executive',
    label: 'Executive Suite',
    shortLabel: 'Executive',
    color: '#F59E0B',
    x: 500,
    y: 105,
    w: 240,
    h: 88,
    lead: { name: 'Derek', role: 'CEO / Founder', initials: 'D', color: '#F59E0B', hasAvatar: true },
  },
  {
    id: 'command',
    label: 'Central Command',
    shortLabel: 'Command',
    color: '#34D399',
    x: 500,
    y: 275,
    w: 360,
    h: 170,
    members: [
      { name: 'Ted', role: 'COO', initials: 'TD', color: '#d4a574', hasAvatar: true },
      { name: 'Milo', role: 'Senior Advisor', initials: 'MI', color: '#A855F7' },
    ],
    notes: [
      'Routes high-priority work across rooms',
      'Keeps chiefs aligned on execution',
      'Turns requests into shipping decisions',
    ],
  },
  {
    id: 'creative-tech',
    label: 'Creative + Tech Wing',
    shortLabel: 'Creative Wing',
    color: '#F59E0B',
    x: 220,
    y: 360,
    w: 280,
    h: 210,
    members: [
      { name: 'Paula', role: 'Creative Director', initials: 'PA', color: '#EC4899' },
      { name: 'Anders', role: 'IT / Engineering', initials: 'AN', color: '#F97316' },
    ],
    notes: ['Design systems', 'Build + implementation'],
  },
  {
    id: 'ops-intel',
    label: 'Ops + Intel Wing',
    shortLabel: 'Ops Wing',
    color: '#60A5FA',
    x: 790,
    y: 360,
    w: 290,
    h: 210,
    members: [
      { name: 'Bobby', role: 'Trading', initials: 'BO', color: '#22C55E' },
      { name: 'Remy', role: 'Restaurant Ops', initials: 'RM', color: '#EAB308' },
      { name: 'Dwight', role: 'Intel', initials: 'DW', color: '#6366F1' },
    ],
    notes: ['Markets', 'Operations', 'Intel'],
  },
  {
    id: 'growth',
    label: 'Growth / Social Wing',
    shortLabel: 'Growth Wing',
    color: '#34D399',
    x: 290,
    y: 590,
    w: 260,
    h: 170,
    members: [
      { name: 'Jim', role: 'Social', initials: 'JH', color: '#06B6D4' },
      { name: 'Michael', role: 'Sales', initials: 'MS', color: '#F59E0B' },
    ],
    notes: ['Audience growth', 'Pipeline + outreach'],
  },
  {
    id: 'personal',
    label: 'Personal Suite',
    shortLabel: 'Personal',
    color: '#8B5CF6',
    x: 710,
    y: 590,
    w: 250,
    h: 150,
    members: [
      { name: 'Wendy', role: 'Personal', initials: 'WN', color: '#8B5CF6' },
    ],
    isolated: true,
    notes: ['Private lane'],
  },
];

function pctX(x: number) {
  return `${(x / VIEW_W) * 100}%`;
}

function pctY(y: number) {
  return `${(y / VIEW_H) * 100}%`;
}

function Avatar({ member, theme }: { member: Member; theme: typeof themeVoid }) {
  if (member.hasAvatar) {
    const src = member.name === 'Derek'
      ? '/derek-avatar.png'
      : `/os/agents/${member.name.toLowerCase()}.png?v=2`;

    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          overflow: 'hidden',
          border: `1.5px solid ${member.color}`,
          background: theme.page,
          flexShrink: 0,
        }}
      >
        <img src={src} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: member.color,
        color: '#05070b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 800,
        fontFamily: "'JetBrains Mono', monospace",
        flexShrink: 0,
        boxShadow: `0 0 0 1px ${member.color}20 inset`,
      }}
    >
      {member.initials}
    </div>
  );
}

function MemberCard({ member, theme }: { member: Member; theme: typeof themeVoid }) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${member.color}40`,
        borderRadius: 10,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 56,
      }}
    >
      <Avatar member={member} theme={theme} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: theme.text, fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>{member.name}</div>
        <div style={{ color: theme.textMuted, fontSize: 10, marginTop: 3, lineHeight: 1.1 }}>{member.role}</div>
      </div>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: theme.success,
          boxShadow: `0 0 8px ${theme.success}`,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

function orthogonalPath(points: Array<[number, number]>) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ');
}

export default function OrgStructurePage() {
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

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
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const theme = colorMode === 'cyber' ? themeCyber : themeVoid;

  const connectorPaths = useMemo(() => {
    return {
      execToCommand: orthogonalPath([
        [500, 150],
        [500, 190],
      ]),
      commandToCreative: orthogonalPath([
        [420, 360],
        [390, 360],
        [390, 420],
        [360, 420],
      ]),
      commandToOps: orthogonalPath([
        [580, 360],
        [610, 360],
        [610, 420],
        [645, 420],
      ]),
      commandToGrowth: orthogonalPath([
        [460, 360],
        [460, 500],
        [360, 500],
        [360, 505],
      ]),
      commandToPersonal: orthogonalPath([
        [540, 360],
        [540, 510],
        [585, 510],
        [585, 515],
      ]),
    };
  }, []);

  const roomChips = rooms.map((room) => ({ id: room.id, label: room.label, color: room.color }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.page,
        padding: 20,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.borderSoft}`,
          }}
        >
          <div style={{ color: theme.text, fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>
            ARCHITECTURAL ORG PLAN
          </div>

          <div
            style={{
              flex: 1,
              maxWidth: 340,
              background: theme.page,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: '10px 12px',
              color: theme.textMuted,
              fontSize: 12,
            }}
          >
            Search rooms, chiefs, agents...
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {['List', 'Canvas', 'Office', 'GPT'].map((pill) => (
              <div
                key={pill}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: `1px solid ${pill === 'GPT' ? '#1f7a5a' : theme.border}`,
                  background: pill === 'GPT' ? 'rgba(16,185,129,0.12)' : theme.page,
                  color: pill === 'GPT' ? '#7ef3bf' : theme.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {pill}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 18px 6px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {roomChips.map((chip) => (
            <div
              key={chip.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: theme.page,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: chip.color, display: 'inline-block' }} />
              {chip.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 18px 18px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: `${VIEW_W} / ${VIEW_H}`,
              background: theme.page,
              borderRadius: 12,
              border: `1px solid ${theme.borderSoft}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <defs>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {Object.values(connectorPaths).map((d, index) => (
                <g key={index}>
                  <path
                    d={d}
                    fill="none"
                    stroke={theme.hallway}
                    strokeWidth="16"
                    strokeLinecap="square"
                    strokeLinejoin="round"
                    filter="url(#softGlow)"
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke={theme.hallwayLine}
                    strokeWidth="2"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2.5s" repeatCount="indefinite" />
                  </path>
                </g>
              ))}
            </svg>

            {rooms.map((room) => {
              const isHovered = hoveredRoom === room.id;
              return (
                <div
                  key={room.id}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  style={{
                    position: 'absolute',
                    left: pctX(room.x),
                    top: pctY(room.y),
                    width: `${room.w}px`,
                    height: `${room.h}px`,
                    transform: 'translate(-50%, -50%)',
                    background: `linear-gradient(180deg, ${room.color}10, ${theme.room})`,
                    border: `1px solid ${isHovered ? room.color : room.color + '45'}`,
                    borderStyle: room.isolated ? 'dashed' : 'solid',
                    borderRadius: 12,
                    boxShadow: isHovered ? `0 12px 40px ${room.color}18` : '0 6px 24px rgba(0,0,0,0.18)',
                    padding: 14,
                    transition: 'all 0.22s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                        color: room.color,
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: room.color, display: 'inline-block' }} />
                      {room.label}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: 10 }}>{room.members?.length || (room.lead ? 1 : 0)} active</div>
                  </div>

                  {room.lead && (
                    <div style={{ maxWidth: 150, margin: '8px auto 0' }}>
                      <MemberCard member={room.lead} theme={theme} />
                    </div>
                  )}

                  {!room.lead && room.id === 'command' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, height: 'calc(100% - 32px)' }}>
                      <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                        {room.members?.map((member) => <MemberCard key={member.name} member={member} theme={theme} />)}
                      </div>
                      <div
                        style={{
                          background: theme.card,
                          border: `1px solid ${theme.border}`,
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div style={{ color: theme.text, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Command Notes</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {room.notes?.map((note) => (
                            <div key={note} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ width: 6, height: 6, borderRadius: 999, background: room.color, marginTop: 5, flexShrink: 0 }} />
                              <span style={{ color: theme.textMuted, fontSize: 10, lineHeight: 1.45 }}>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!room.lead && room.id !== 'command' && (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: room.members && room.members.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                          gap: 10,
                        }}
                      >
                        {room.members?.map((member) => <MemberCard key={member.name} member={member} theme={theme} />)}
                      </div>

                      {room.notes?.length ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {room.notes.map((note) => (
                            <div
                              key={note}
                              style={{
                                fontSize: 10,
                                color: theme.textMuted,
                                padding: '6px 8px',
                                borderRadius: 8,
                                background: theme.card,
                                border: `1px solid ${theme.borderSoft}`,
                              }}
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
