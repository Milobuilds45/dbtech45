'use client';

import { useEffect, useState } from 'react';

const voidColors = {
  void: '#1a1a1a', carbon: '#222222', graphite: '#2a2a2a',
  amber: '#F59E0B', white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', border: '#333333',
};

const cyberColors = {
  void: '#0d1117', carbon: '#161b22', graphite: '#1f2428',
  amber: '#10ca78', white: '#f0f0f0', silver: '#A3A3A3', smoke: '#737373',
  success: '#39ff7e', border: '#30363d',
};

// n8n-style layout - flowing left to right
const AGENTS = [
  // Level 1 - CEO
  { name: 'Derek', role: 'CEO', initials: 'D', color: '#F59E0B', x: 15, y: 40, hasAvatar: true },
  
  // Level 2 - Executives
  { name: 'Ted', role: 'COO', initials: 'TD', color: '#d4a574', x: 35, y: 25, hasAvatar: true },
  { name: 'Milo', role: 'Advisor', initials: 'MI', color: '#A855F7', x: 35, y: 55 },
  
  // Level 3 - Team (Ted's reports)
  { name: 'Paula', role: 'Creative', initials: 'PA', color: '#EC4899', x: 55, y: 15 },
  { name: 'Anders', role: 'IT', initials: 'AN', color: '#F97316', x: 55, y: 35 },
  
  // Level 3 - Team (Milo's reports)
  { name: 'Bobby', role: 'Trading', initials: 'BO', color: '#22C55E', x: 55, y: 50 },
  { name: 'Remy', role: 'Restaurant', initials: 'RM', color: '#EAB308', x: 55, y: 65 },
  { name: 'Dwight', role: 'Intel', initials: 'DW', color: '#6366F1', x: 55, y: 80 },
  
  // Level 4 - Under Dwight (spread vertically)
  { name: 'Jim', role: 'Social', initials: 'JH', color: '#06B6D4', x: 75, y: 73 },
  { name: 'Michael', role: 'Sales', initials: 'MS', color: '#F59E0B', x: 75, y: 87 },
  
  // Separate - Wendy
  { name: 'Wendy', role: 'Personal', initials: 'WN', color: '#8B5CF6', x: 20, y: 90, isolated: true },
];

const CONNECTIONS = [
  // Derek → Executives (amber)
  { from: 'Derek', to: 'Ted', color: '#F59E0B' },
  { from: 'Derek', to: 'Milo', color: '#F59E0B' },
  { from: 'Derek', to: 'Wendy', color: '#8B5CF6', dashed: true },
  
  // Ted → Team (warm colors)
  { from: 'Ted', to: 'Paula', color: '#EC4899' },
  { from: 'Ted', to: 'Anders', color: '#F97316' },
  
  // Milo → Team (cool colors)
  { from: 'Milo', to: 'Bobby', color: '#22C55E' },
  { from: 'Milo', to: 'Remy', color: '#EAB308' },
  { from: 'Milo', to: 'Dwight', color: '#6366F1' },
  
  // Dwight → Jim & Michael
  { from: 'Dwight', to: 'Jim', color: '#06B6D4' },
  { from: 'Dwight', to: 'Michael', color: '#F59E0B' },
  
  // Collaboration links (dotted, lighter)
  { from: 'Paula', to: 'Anders', color: '#EC4899', collaboration: true },
  { from: 'Ted', to: 'Milo', color: '#A855F7', collaboration: true },
  { from: 'Jim', to: 'Michael', color: '#06B6D4', collaboration: true },
];

export default function OrgStructurePage() {
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);

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

  // n8n-style smooth bezier curves
  const getConnectionPath = (from: typeof AGENTS[0], to: typeof AGENTS[0], isCollaboration = false) => {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;
    
    if (isCollaboration) {
      // Collaboration links - gentle arc above/below
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const arc = y1 < y2 ? -8 : 8; // Arc direction based on vertical position
      
      return `M ${x1} ${y1} Q ${midX} ${midY + arc} ${x2} ${y2}`;
    } else {
      // Hierarchical flow - horizontal S-curve
      const dx = Math.abs(x2 - x1);
      const cpOffset = Math.min(dx * 0.5, 15);
      
      const cp1x = x1 + cpOffset;
      const cp1y = y1;
      const cp2x = x2 - cpOffset;
      const cp2y = y2;
      
      return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    }
  };

  return (
    <div style={{ 
      padding: '30px', 
      background: b.void, 
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: b.white }}>
            Organization Chart
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: b.smoke,
            padding: '4px 10px',
            borderRadius: '4px',
            background: b.carbon,
            border: `1px solid ${b.border}`,
          }}>
            9 active
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '80vh',
          background: b.carbon,
          borderRadius: '8px',
          border: `1px solid ${b.border}`,
          overflow: 'hidden',
        }}>
          {/* Grid dots (n8n style) */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.5" fill={b.border} opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>

          {/* Connection paths */}
          <svg 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              pointerEvents: 'none',
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {CONNECTIONS.map((conn, i) => {
              const fromAgent = AGENTS.find(a => a.name === conn.from);
              const toAgent = AGENTS.find(a => a.name === conn.to);
              if (!fromAgent || !toAgent) return null;
              
              const isHovered = hoveredConnection === i || hoveredAgent === conn.from || hoveredAgent === conn.to;
              const lineColor = conn.color || b.border;
              const isCollaboration = conn.collaboration;
              
              return (
                <g key={i}>
                  {/* Main solid path */}
                  <path
                    d={getConnectionPath(fromAgent, toAgent, isCollaboration)}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={isHovered ? "0.3" : "0.2"}
                    opacity={isCollaboration ? 0.3 : 0.5}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  
                  {/* Animated flowing dots (only on hierarchical connections) */}
                  {!isCollaboration && (
                    <circle
                      r="0.5"
                      fill={lineColor}
                      opacity="0.8"
                    >
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path={getConnectionPath(fromAgent, toAgent, false)}
                      />
                    </circle>
                  )}
                  
                  {/* Collaboration lines get subtle pulse */}
                  {isCollaboration && (
                    <path
                      d={getConnectionPath(fromAgent, toAgent, true)}
                      fill="none"
                      stroke={lineColor}
                      strokeWidth="0.15"
                      strokeDasharray="2 4"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="6"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Agent Nodes (n8n card style) */}
          {AGENTS.map((agent) => {
            const isHovered = hoveredAgent === agent.name;
            
            return (
              <div
                key={agent.name}
                style={{
                  position: 'absolute',
                  left: `calc(${agent.x}% - 70px)`,
                  top: `calc(${agent.y}% - 35px)`,
                  width: '140px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  zIndex: isHovered ? 100 : 10,
                }}
                onMouseEnter={() => setHoveredAgent(agent.name)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {/* n8n-style card */}
                <div style={{
                  background: b.graphite,
                  border: `2px solid ${isHovered ? agent.color : b.border}`,
                  borderRadius: '8px',
                  borderStyle: agent.isolated ? 'dashed' : 'solid',
                  padding: '12px',
                  boxShadow: isHovered 
                    ? `0 4px 12px ${agent.color}30, 0 0 0 3px ${agent.color}15` 
                    : '0 2px 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  {/* Icon/Avatar row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Icon */}
                    {agent.hasAvatar ? (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: `2px solid ${agent.color}`,
                        background: b.void,
                        flexShrink: 0,
                      }}>
                        <img 
                          src={agent.name === 'Derek' ? '/derek-avatar.png' : `/os/agents/${agent.name.toLowerCase()}.png?v=1`}
                          alt={agent.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: agent.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#000',
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}>
                        {agent.initials}
                      </div>
                    )}
                    
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: b.white,
                      }}>
                        {agent.name}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: b.smoke,
                      }}>
                        {agent.role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '10px',
                    color: b.smoke,
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: b.success,
                      boxShadow: `0 0 4px ${b.success}`,
                    }} />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
