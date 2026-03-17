'use client';

import { useEffect, useState } from 'react';

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

const rooms: Room[] = [
  {
    id: 'executive',
    label: 'Executive Suite',
    color: '#F59E0B',
    x: 140,
    y: 350,
    w: 280,
    h: 150,
    members: [
      { name: 'Derek', role: 'CEO / Founder', initials: 'D', color: '#F59E0B', hasAvatar: true },
    ],
  },
  {
    id: 'command',
    label: 'Central Command',
    color: '#34D399',
    x: 500,
    y: 350,
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
    color: '#EC4899',
    x: 870,
    y: 120,
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
    x: 870,
    y: 370,
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
    x: 870,
    y: 650,
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
    x: 500,
    y: 700,
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

// Connections: solid colored bezier curves, n8n style
const connections: Array<{ from: [number, number]; to: [number, number]; color: string }> = [
  // Executive → Command
  { from: [280, 350], to: [330, 350], color: '#F59E0B' },
  // Command → Creative
  { from: [670, 280], to: [740, 120], color: '#EC4899' },
  // Command → Ops
  { from: [670, 400], to: [730, 400], color: '#60A5FA' },
  // Ops → Growth
  { from: [870, 570], to: [870, 590], color: '#34D399' },
  // Command → Personal
  { from: [500, 460], to: [500, 615], color: '#8B5CF6' },
];

function bezierPath(from: [number, number], to: [number, number]) {
  const dx = Math.abs(to[0] - from[0]);
  const dy = Math.abs(to[1] - from[1]);
  const cx = Math.max(dx, dy) * 0.5;

  if (dx > dy) {
    // Horizontal-dominant
    return `M ${from[0]} ${from[1]} C ${from[0] + cx} ${from[1]}, ${to[0] - cx} ${to[1]}, ${to[0]} ${to[1]}`;
  } else {
    // Vertical-dominant
    return `M ${from[0]} ${from[1]} C ${from[0]} ${from[1] + cx}, ${to[0]} ${to[1] - cx}, ${to[0]} ${to[1]}`;
  }
}

function Avatar({ member }: { member: Member }) {
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
          background: '#000',
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
        color: '#000',
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

function MemberCard({ member }: { member: Member }) {
  return (
    <div
      style={{
        background: 'rgba(20, 28, 45, 0.7)',
        border: `1px solid ${member.color}45`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
      }}
    >
      <Avatar member={member} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: '#f7f9fc', fontSize: 13, fontWeight: 700, lineHeight: 1.15 }}>{member.name}</div>
        <div style={{ color: '#7f8ba5', fontSize: 11, marginTop: 4, lineHeight: 1.1 }}>{member.role}</div>
      </div>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: '#10B981',
          boxShadow: '0 0 8px #10B981',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

function AddSlot({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <div
      style={{
        border: '1px dashed #22314b',
        background: 'rgba(10, 14, 22, 0.4)',
        borderRadius: 10,
        padding: '14px 12px',
        color: '#7f8ba5',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: 'uppercase' as const,
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
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        padding: 18,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: '#000000',
          border: '1px solid #1a2235',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 18px',
            borderBottom: '1px solid #111827',
          }}
        >
          <div style={{ color: '#f7f9fc', fontSize: 17, fontWeight: 800, letterSpacing: 0.2 }}>
            ARCHITECTURAL ORG PLAN
          </div>

          <div
            style={{
              flex: 1,
              maxWidth: 360,
              background: '#000000',
              border: '1px solid #1a2235',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#7f8ba5',
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
                  border: `1px solid ${pill === 'GPT' ? '#1f7a5a' : '#1a2235'}`,
                  background: pill === 'GPT' ? 'rgba(16,185,129,0.12)' : '#000000',
                  color: pill === 'GPT' ? '#7ef3bf' : '#7f8ba5',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {pill}
              </div>
            ))}
          </div>
        </div>

        {/* Room chips */}
        <div style={{ padding: '12px 18px 6px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: '#000000',
                border: '1px solid #1a2235',
                color: '#f7f9fc',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: room.color, display: 'inline-block' }} />
              {room.label}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ padding: '10px 18px 18px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1200 / 900',
              background: '#000000',
              borderRadius: 14,
              border: '1px solid #111827',
              overflow: 'hidden',
            }}
          >
            {/* SVG Connections - solid colored bezier curves */}
            <svg
              viewBox="0 0 1200 900"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {connections.map((conn, i) => {
                const d = bezierPath(conn.from, conn.to);
                return (
                  <g key={i}>
                    {/* Glow layer */}
                    <path
                      d={d}
                      fill="none"
                      stroke={conn.color}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.25"
                      filter="url(#glow)"
                    />
                    {/* Solid line */}
                    <path
                      d={d}
                      fill="none"
                      stroke={conn.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Rooms */}
            {rooms.map((room) => {
              const isHovered = hoveredRoom === room.id;
              const pctX = `${(room.x / 1200) * 100}%`;
              const pctY = `${(room.y / 900) * 100}%`;

              return (
                <div
                  key={room.id}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  style={{
                    position: 'absolute',
                    left: pctX,
                    top: pctY,
                    width: room.w,
                    height: room.h,
                    transform: 'translate(-50%, -50%)',
                    background: '#0d111a',
                    border: `1px solid ${isHovered ? room.color : room.color + '40'}`,
                    borderStyle: room.isolated ? 'dashed' : 'solid',
                    borderRadius: 14,
                    boxShadow: isHovered
                      ? `0 0 35px ${room.color}40`
                      : `0 0 15px ${room.color}15`,
                    zIndex: isHovered ? 10 : 1,
                    padding: 14,
                    transition: 'all 0.22s ease',
                  }}
                >
                  {/* Room header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase' as const,
                        color: room.color,
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: room.color, display: 'inline-block' }} />
                      {room.label}
                    </div>
                    <div style={{ color: '#7f8ba5', fontSize: 10 }}>{room.members?.length || 0} active</div>
                  </div>

                  {/* Executive - single centered card */}
                  {room.id === 'executive' && room.members?.[0] && (
                    <div style={{ maxWidth: 200, margin: '10px auto 0' }}>
                      <MemberCard member={room.members[0]} />
                    </div>
                  )}

                  {/* Command - 2 col layout with notes */}
                  {room.id === 'command' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, height: 'calc(100% - 34px)' }}>
                      <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                        {room.members?.map((m) => <MemberCard key={m.name} member={m} />)}
                        <AddSlot label={room.addSlotLabel} />
                      </div>
                      <div style={{ background: 'rgba(20, 28, 45, 0.7)', border: '1px solid #172233', borderRadius: 10, padding: 12 }}>
                        <div style={{ color: '#f7f9fc', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>Command Notes</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {room.notes?.map((note) => (
                            <div key={note} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ width: 6, height: 6, borderRadius: 999, background: room.color, marginTop: 5, flexShrink: 0 }} />
                              <span style={{ color: '#7f8ba5', fontSize: 10, lineHeight: 1.45 }}>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Growth+Social - Michael top, Dwight left, Jim right */}
                  {room.id === 'growth-social' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 'calc(100% - 34px)' }}>
                      {room.members?.[0] && <MemberCard member={room.members[0]} />}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {room.members?.[1] && <MemberCard member={room.members[1]} />}
                        {room.members?.[2] && <MemberCard member={room.members[2]} />}
                      </div>
                    </div>
                  )}

                  {/* All other rooms - stacked cards */}
                  {room.id !== 'executive' && room.id !== 'command' && room.id !== 'growth-social' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {room.members?.map((m) => <MemberCard key={m.name} member={m} />)}
                        <AddSlot label={room.addSlotLabel} />
                      </div>
                      {room.notes?.length ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {room.notes.map((note) => (
                            <div
                              key={note}
                              style={{
                                fontSize: 10,
                                color: '#7f8ba5',
                                padding: '6px 8px',
                                borderRadius: 8,
                                background: 'rgba(10, 14, 22, 0.4)',
                                border: '1px solid #172233',
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
