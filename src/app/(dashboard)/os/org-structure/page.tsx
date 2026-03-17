'use client';

import { useEffect, useMemo, useState } from 'react';

type Member = {
  name: string;
  role: string;
  initials: string;
  color: string;
  hasAvatar?: boolean;
};

type Room = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isolated?: boolean;
  members?: Member[];
  notes?: string[];
  addSlotLabel?: string;
};

const VIEW_W = 1000;
const VIEW_H = 700;

const themeVoid = {
  page: '#060a11',
  panel: '#0b1019',
  room: '#101724',
  card: '#161f30',
  cardSoft: '#121a29',
  border: '#22314b',
  borderSoft: '#172233',
  text: '#f7f9fc',
  muted: '#7f8ba5',
  grid: 'rgba(135, 151, 180, 0.07)',
  hall: 'rgba(180, 188, 204, 0.08)',
  hallLine: 'rgba(210, 217, 230, 0.18)',
  success: '#10B981',
  amber: '#F59E0B',
};

const themeCyber = {
  page: '#050e07',
  panel: '#08150b',
  room: '#0a1a10',
  card: '#0e2216',
  cardSoft: '#0a180f',
  border: 'rgba(16, 202, 120, 0.24)',
  borderSoft: 'rgba(16, 202, 120, 0.15)',
  text: '#effff4',
  muted: '#7ea08a',
  grid: 'rgba(16, 202, 120, 0.06)',
  hall: 'rgba(16, 202, 120, 0.08)',
  hallLine: 'rgba(16, 202, 120, 0.20)',
  success: '#39ff7e',
  amber: '#10ca78',
};

const rooms: Room[] = [
  {
    id: 'executive',
    label: 'Executive Suite',
    color: '#F59E0B',
    x: 160,
    y: 250,
    w: 240,
    h: 120,
    members: [
      { name: 'Derek', role: 'CEO / Founder', initials: 'D', color: '#F59E0B', hasAvatar: true },
    ],
  },
  {
    id: 'command',
    label: 'Central Command',
    color: '#34D399',
    x: 450,
    y: 250,
    w: 340,
    h: 220,
    members: [
      { name: 'Ted', role: 'COO', initials: 'TD', color: '#d4a574', hasAvatar: true },
      { name: 'Milo', role: 'Senior Advisor', initials: 'MI', color: '#A855F7', hasAvatar: true },
    ],
    notes: [
      'Routes priority work across all rooms',
      'Turns requests into shipping decisions',
      'Keeps leadership aligned and unblocked',
    ],
    addSlotLabel: 'Add chief',
  },
  {
    id: 'creative-tech',
    label: 'Creative + Tech Wing',
    color: '#F59E0B',
    x: 780,
    y: 115,
    w: 260,
    h: 210,
    members: [
      { name: 'Paula', role: 'Creative Director', initials: 'PA', color: '#EC4899', hasAvatar: true },
      { name: 'Anders', role: 'IT / Engineering', initials: 'AN', color: '#F97316', hasAvatar: true },
    ],
    notes: ['Brand systems', 'Build + implementation'],
    addSlotLabel: 'Add builder',
  },
  {
    id: 'ops-intel',
    label: 'Ops + Intel Wing',
    color: '#60A5FA',
    x: 780,
    y: 355,
    w: 280,
    h: 250,
    members: [
      { name: 'Bobby', role: 'Trading', initials: 'BO', color: '#22C55E', hasAvatar: true },
      { name: 'Remy', role: 'Restaurant Ops', initials: 'RM', color: '#EAB308', hasAvatar: true },
      { name: 'Trent', role: 'Intel', initials: 'TR', color: '#EF4444' },
    ],
    notes: ['Markets', 'Operations', 'Intel'],
    addSlotLabel: 'Add operator',
  },
  {
    id: 'growth-social',
    label: 'Growth + Social Wing',
    color: '#34D399',
    x: 780,
    y: 620,
    w: 340,
    h: 250,
    members: [
      { name: 'Michael', role: 'Sales', initials: 'MS', color: '#F59E0B' },
      { name: 'Dwight', role: 'Intel', initials: 'DW', color: '#6366F1', hasAvatar: true },
      { name: 'Jim', role: 'Social', initials: 'JH', color: '#06B6D4' },
    ],
    notes: ['Audience growth', 'Sales / outreach'],
    addSlotLabel: 'Add closer',
  },
  {
    id: 'personal',
    label: 'Personal Suite',
    color: '#8B5CF6',
    x: 450,
    y: 600,
    w: 260,
    h: 170,
    isolated: true,
    members: [
      { name: 'Wendy', role: 'Personal', initials: 'WN', color: '#8B5CF6', hasAvatar: true },
    ],
    notes: ['Private lane'],
    addSlotLabel: 'Add support',
  },
];

function pctX(n: number) {
  return `${(n / VIEW_W) * 100}%`;
}

function pctY(n: number) {
  return `${(n / VIEW_H) * 100}%`;
}

function path(points: Array<[number, number]>) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function Port({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={12} height={12} rx={3} fill={color} opacity="0.18" />
      <rect x={x - 3} y={y - 3} width={6} height={6} rx={1.5} fill={color} opacity="0.9" />
    </g>
  );
}

function Avatar({ member, theme }: { member: Member; theme: typeof themeVoid }) {
  if (member.hasAvatar) {
    const src = member.name === 'Derek'
      ? '/derek-avatar.png'
      : `/os/agents/${member.name.toLowerCase()}.png?v=2`;

    return (
      <div
        style={{
          width: 44,
          height: 44,
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
        width: 44,
        height: 44,
        borderRadius: 8,
        background: member.color,
        color: '#05070b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 800,
        fontFamily: "'JetBrains Mono', monospace",
        flexShrink: 0,
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
        border: `1px solid ${member.color}45`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
      }}
    >
      <Avatar member={member} theme={theme} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: theme.text, fontSize: 13, fontWeight: 700, lineHeight: 1.15 }}>{member.name}</div>
        <div style={{ color: theme.muted, fontSize: 11, marginTop: 4, lineHeight: 1.1 }}>{member.role}</div>
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

function AddSlot({ label, theme }: { label?: string; theme: typeof themeVoid }) {
  if (!label) return null;
  return (
    <div
      style={{
        border: `1px dashed ${theme.border}`,
        background: theme.cardSoft,
        borderRadius: 10,
        padding: '14px 12px',
        color: theme.muted,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 54,
      }}
    >
      + {label}
    </div>
  );
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

  const hallways = useMemo(() => [
    {
      id: 'execToCommand',
      color: '#34D399',
      path: path([
        [280, 250],
        [280, 250],
      ])
    },
    {
      id: 'commandToCreative',
      color: '#F59E0B',
      path: path([
        [620, 210],
        [650, 210],
        [650, 115],
        [650, 115],
      ])
    },
    {
      id: 'commandToOps',
      color: '#60A5FA',
      path: path([
        [620, 295],
        [640, 295],
      ])
    },
    {
      id: 'opsToGrowth',
      color: '#34D399',
      path: path([
        [780, 480],
        [780, 495],
      ])
    },
    {
      id: 'commandToPersonal',
      color: '#8B5CF6',
      path: path([
        [450, 360],
        [450, 515],
      ])
    }
  ], []);

  const chips = rooms.map((room) => ({ id: room.id, label: room.label, color: room.color }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.page,
        padding: 18,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
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
          <div style={{ color: theme.text, fontSize: 17, fontWeight: 800, letterSpacing: 0.2 }}>
            ARCHITECTURAL ORG PLAN
          </div>

          <div
            style={{
              flex: 1,
              maxWidth: 360,
              background: theme.page,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: '10px 12px',
              color: theme.muted,
              fontSize: 12,
            }}
          >
            Search rooms, agents, roles...
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
                  color: pill === 'GPT' ? '#7ef3bf' : theme.muted,
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
          {chips.map((chip) => (
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
                fontWeight: 700,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: chip.color, display: 'inline-block' }} />
              {chip.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 18px 18px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: `${VIEW_W} / ${VIEW_H}`,
              background: theme.page,
              borderRadius: 14,
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
              {hallways.map((hw) => (
                <g key={hw.id}>
                  <path
                    d={hw.path}
                    fill="none"
                    stroke={theme.hall}
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={hw.path}
                    fill="none"
                    stroke={hw.color}
                    strokeWidth="2"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    opacity="0.6"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2.4s" repeatCount="indefinite" />
                  </path>
                </g>
              ))}

              <Port x={280} y={250} color="#F59E0B" />
              <Port x={280} y={250} color="#34D399" />
              <Port x={620} y={210} color="#34D399" />
              <Port x={650} y={115} color="#F59E0B" />
              <Port x={620} y={295} color="#34D399" />
              <Port x={640} y={355} color="#60A5FA" />
              <Port x={780} y={480} color="#60A5FA" />
              <Port x={780} y={495} color="#34D399" />
              <Port x={450} y={360} color="#34D399" />
              <Port x={450} y={515} color="#8B5CF6" />
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
                    border: `1px solid ${isHovered ? room.color : room.color + '40'}`,
                    borderStyle: room.isolated ? 'dashed' : 'solid',
                    borderRadius: 14,
                    boxShadow: isHovered ? `0 12px 34px ${room.color}18` : '0 8px 26px rgba(0,0,0,0.18)',
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
                    <div style={{ color: theme.muted, fontSize: 10 }}>{room.members?.length || 0} active</div>
                  </div>

                  {room.id === 'executive' && room.members?.[0] ? (
                    <div style={{ maxWidth: 160, margin: '10px auto 0' }}>
                      <MemberCard member={room.members[0]} theme={theme} />
                    </div>
                  ) : null}

                  {room.id === 'command' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, height: 'calc(100% - 34px)' }}>
                      <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                        {room.members?.map((member) => <MemberCard key={member.name} member={member} theme={theme} />)}
                        <AddSlot label={room.addSlotLabel} theme={theme} />
                      </div>
                      <div style={{ background: theme.card, border: `1px solid ${theme.borderSoft}`, borderRadius: 10, padding: 12 }}>
                        <div style={{ color: theme.text, fontSize: 11, fontWeight: 800, marginBottom: 8 }}>Command Notes</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {room.notes?.map((note) => (
                            <div key={note} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ width: 6, height: 6, borderRadius: 999, background: room.color, marginTop: 5, flexShrink: 0 }} />
                              <span style={{ color: theme.muted, fontSize: 10, lineHeight: 1.45 }}>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {room.id !== 'executive' && room.id !== 'command' && room.id !== 'growth-social' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {room.members?.map((member) => <MemberCard key={member.name} member={member} theme={theme} />)}
                        <AddSlot label={room.addSlotLabel} theme={theme} />
                      </div>
                      {room.notes?.length ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {room.notes.map((note) => (
                            <div
                              key={note}
                              style={{
                                fontSize: 10,
                                color: theme.muted,
                                padding: '6px 8px',
                                borderRadius: 8,
                                background: theme.cardSoft,
                                border: `1px solid ${theme.borderSoft}`,
                              }}
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  {room.id === 'growth-social' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 'calc(100% - 34px)' }}>
                      {room.members?.[0] && <MemberCard member={room.members[0]} theme={theme} />}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {room.members?.[1] && <MemberCard member={room.members[1]} theme={theme} />}
                        {room.members?.[2] && <MemberCard member={room.members[2]} theme={theme} />}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
