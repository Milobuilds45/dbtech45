'use client';

import { useEffect, useState } from 'react';

const voidColors = {
  void: '#0a0e12', carbon: '#141820', graphite: '#1a1f2e',
  amber: '#F59E0B', white: '#FFFFFF', silver: '#A3A3A3', smoke: '#6b7280',
  success: '#10B981', border: '#1f2937',
};

const cyberColors = {
  void: '#050e07', carbon: '#07120a', graphite: '#0a1a0e',
  amber: '#10ca78', white: '#f0f0f0', silver: '#A3A3A3', smoke: '#737373',
  success: '#39ff7e', border: 'rgba(16, 202, 120, 0.2)',
};

// Departments (Rooms)
const DEPARTMENTS = [
  {
    id: 'executive',
    name: 'Executive Suite',
    color: '#F59E0B',
    position: { x: 50, y: 15 },
    size: { width: 300, height: 120 },
    members: [
      { name: 'Derek', role: 'CEO', initials: 'D', color: '#F59E0B', hasAvatar: true },
    ]
  },
  {
    id: 'leadership',
    name: 'Leadership',
    color: '#A855F7',
    position: { x: 20, y: 40 },
    size: { width: 200, height: 160 },
    members: [
      { name: 'Ted', role: 'COO', initials: 'TD', color: '#d4a574', hasAvatar: true },
      { name: 'Milo', role: 'Advisor', initials: 'MI', color: '#A855F7' },
    ]
  },
  {
    id: 'creative',
    name: 'Creative + Tech',
    color: '#EC4899',
    position: { x: 45, y: 40 },
    size: { width: 200, height: 200 },
    members: [
      { name: 'Paula', role: 'Creative', initials: 'PA', color: '#EC4899' },
      { name: 'Anders', role: 'IT', initials: 'AN', color: '#F97316' },
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    color: '#22C55E',
    position: { x: 70, y: 40 },
    size: { width: 220, height: 240 },
    members: [
      { name: 'Bobby', role: 'Trading', initials: 'BO', color: '#22C55E' },
      { name: 'Remy', role: 'Restaurant', initials: 'RM', color: '#EAB308' },
      { name: 'Dwight', role: 'Intel', initials: 'DW', color: '#6366F1' },
    ]
  },
  {
    id: 'social',
    name: 'Social Media',
    color: '#06B6D4',
    position: { x: 30, y: 75 },
    size: { width: 180, height: 160 },
    members: [
      { name: 'Jim', role: 'Social', initials: 'JH', color: '#06B6D4' },
      { name: 'Michael', role: 'Sales', initials: 'MS', color: '#F59E0B' },
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#8B5CF6',
    position: { x: 60, y: 75 },
    size: { width: 160, height: 120 },
    members: [
      { name: 'Wendy', role: 'Personal', initials: 'WN', color: '#8B5CF6' },
    ]
  },
];

export default function OrgStructurePage() {
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

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
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, []);

  const b = colorMode === 'cyber' ? cyberColors : voidColors;

  return (
    <div style={{ 
      padding: '20px', 
      background: b.void, 
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '30px',
        padding: '16px 20px',
        background: b.carbon,
        border: `1px solid ${b.border}`,
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: b.amber,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 700,
          }}>
            🏢
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: b.white }}>
            ORGANIZATIONAL CHART
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: b.smoke }}>
          <div style={{
            padding: '6px 12px',
            background: b.graphite,
            borderRadius: '6px',
            border: `1px solid ${b.border}`,
          }}>
            9 agents
          </div>
          <div style={{
            padding: '6px 12px',
            background: b.graphite,
            borderRadius: '6px',
            border: `1px solid ${b.border}`,
          }}>
            6 departments
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '85vh',
        background: b.carbon,
        borderRadius: '12px',
        border: `1px solid ${b.border}`,
        overflow: 'hidden',
      }}>
        {/* Dot grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${b.border} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.3,
        }} />

        {/* Connection lines */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Derek to Leadership */}
          <line
            x1="50%" y1="20%"
            x2="30%" y2="45%"
            stroke={b.border}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          {/* Derek to Creative */}
          <line
            x1="50%" y1="20%"
            x2="55%" y2="45%"
            stroke={b.border}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          {/* Derek to Operations */}
          <line
            x1="50%" y1="20%"
            x2="80%" y2="50%"
            stroke={b.border}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.4"
          />
        </svg>

        {/* Department Rooms */}
        {DEPARTMENTS.map((dept) => {
          const isHovered = hoveredDept === dept.id;
          
          return (
            <div
              key={dept.id}
              style={{
                position: 'absolute',
                left: `${dept.position.x}%`,
                top: `${dept.position.y}%`,
                width: `${dept.size.width}px`,
                height: `${dept.size.height}px`,
                background: `${dept.color}08`,
                border: `2px solid ${isHovered ? dept.color : dept.color + '40'}`,
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.3s ease',
                transform: `translateX(-50%) ${isHovered ? 'translateY(-4px)' : 'translateY(0)'}`,
                boxShadow: isHovered ? `0 8px 24px ${dept.color}20` : 'none',
              }}
              onMouseEnter={() => setHoveredDept(dept.id)}
              onMouseLeave={() => setHoveredDept(null)}
            >
              {/* Department Header */}
              <div style={{
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${dept.color}30`,
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: dept.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dept.color,
                    boxShadow: `0 0 8px ${dept.color}`,
                  }} />
                  {dept.name}
                </div>
              </div>

              {/* Members Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: dept.members.length > 2 ? 'repeat(2, 1fr)' : '1fr',
                gap: '10px',
              }}>
                {dept.members.map((member) => (
                  <div
                    key={member.name}
                    style={{
                      background: b.graphite,
                      border: `1px solid ${member.color}40`,
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = member.color;
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = member.color + '40';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {/* Avatar */}
                    {member.hasAvatar ? (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: `2px solid ${member.color}`,
                        background: b.void,
                        flexShrink: 0,
                      }}>
                        <img 
                          src={member.name === 'Derek' ? '/derek-avatar.png' : `/os/agents/${member.name.toLowerCase()}.png?v=1`}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: member.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#000',
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}>
                        {member.initials}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: b.white,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {member.name}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: b.smoke,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {member.role}
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: b.success,
                      boxShadow: `0 0 6px ${b.success}`,
                      flexShrink: 0,
                    }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
