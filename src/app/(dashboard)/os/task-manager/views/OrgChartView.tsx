'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────

interface OrgNode {
  id: string;
  name: string;
  role: string;
  title: string;
  isHuman?: boolean;
  responsibilities: string[];
  models: string[];
  tools: string[];
  children?: OrgNode[];
}

const ORG_TREE: OrgNode = {
  id: 'derek',
  name: 'Derek',
  role: 'CEO',
  title: 'Human CEO',
  isHuman: true,
  responsibilities: ['Vision & strategy', 'Final decisions', 'Content creation', 'Capital allocation'],
  models: [],
  tools: ['Telegram', 'GitHub', 'Vercel', 'Supabase'],
  children: [
    {
      id: 'milo',
      name: 'Milo',
      role: 'COO',
      title: 'Chief Operating Officer — Orchestrator',
      responsibilities: ['Research & delegation', 'Execution & orchestration', 'Always delegates, never queues', 'Morning briefs & reporting', 'Memory maintenance'],
      models: ['Opus 4.6', 'Opus 4.5 (backup)'],
      tools: ['All agent tools', 'Cron system', 'Git', 'Web search', 'Telegram'],
      children: [
        {
          id: 'anders',
          name: 'Anders',
          role: 'CTO',
          title: 'Chief Technology Officer',
          responsibilities: ['Full-stack engineering', 'Architecture decisions', 'Deployment & DevOps', 'Code review'],
          models: ['Opus 4.6'],
          tools: ['Codex CLI', 'Git', 'Vercel CLI', 'Supabase CLI'],
          children: [
            {
              id: 'anders-backend',
              name: 'Backend / Security',
              role: 'Division',
              title: 'Backend & Security Division',
              responsibilities: ['API development', 'Database design', 'Security audits', 'Auth systems'],
              models: ['GPT 5.3 Codex', 'Opus 4.6 (failsafe)'],
              tools: ['Node.js', 'Postgres', 'Prisma'],
            },
            {
              id: 'anders-frontend',
              name: 'Frontend / DevOps',
              role: 'Division',
              title: 'Frontend & DevOps Division',
              responsibilities: ['React/Next.js development', 'UI implementation', 'CI/CD pipelines', 'Vercel deployment'],
              models: ['Opus 4.6'],
              tools: ['Next.js', 'Tailwind', 'Vercel'],
            },
            {
              id: 'dwight',
              name: 'Dwight',
              role: 'QA Lead',
              title: 'Security & QA',
              responsibilities: ['Security scanning', 'Workspace audits', 'Credential management', 'Compliance checks'],
              models: ['Gemini 3 Flash', 'Opus 4.6 (escalation)'],
              tools: ['Git', 'Security scanners', 'File system'],
            },
          ],
        },
        {
          id: 'paula',
          name: 'Paula',
          role: 'CMO',
          title: 'Chief Marketing Officer — Design',
          responsibilities: ['Brand & design', 'UI/UX vision', 'Content strategy', 'Newsletter design'],
          models: ['Opus 4.6', 'Sonnet 4.5 (output)'],
          tools: ['Figma concepts', 'HTML/CSS', 'Brand guidelines'],
          children: [
            {
              id: 'remy',
              name: 'Remy',
              role: 'Content Lead',
              title: 'Content & Newsletter',
              responsibilities: ['Newsletter content', 'Blog posts', 'Copy writing', 'Research articles'],
              models: ['Opus 4.6 (research)', 'Sonnet 4.5 (writing)'],
              tools: ['Web search', 'Markdown', 'Email service'],
            },
            {
              id: 'dax',
              name: 'Dax',
              role: 'Social Lead',
              title: 'Social Media & Hype',
              responsibilities: ['Twitter/X monitoring', 'Social posting', 'Trend analysis', 'Community engagement'],
              models: ['Gemini 3 Flash'],
              tools: ['Twitter API', 'Web search', 'Brave Search'],
            },
            {
              id: 'paula-creative',
              name: 'Creative Division',
              role: 'Division',
              title: 'Creative & Video',
              responsibilities: ['Visual design', 'Video concepts', 'Thumbnail creation', 'Brand assets'],
              models: ['Sonnet 4.5', 'Opus 4.6 (direction)'],
              tools: ['Canvas', 'Image generation', 'Remotion'],
            },
          ],
        },
        {
          id: 'bobby',
          name: 'Bobby',
          role: 'CRO',
          title: 'Chief Revenue Officer — Trading',
          responsibilities: ['Market intelligence', 'Options analysis', 'Trading signals', 'Risk assessment'],
          models: ['Opus 4.6'],
          tools: ['Yahoo Finance', 'CoinGecko', 'Options data', 'Web search'],
          children: [
            {
              id: 'tony',
              name: 'Tony',
              role: 'Ops Lead',
              title: 'Restaurant Operations',
              responsibilities: ['Restaurant ops intel', 'Vendor analysis', 'Food cost tracking', 'Staffing insights'],
              models: ['Gemini 3 Pro'],
              tools: ['Web search', 'Market data', 'USDA APIs'],
            },
            {
              id: 'wendy',
              name: 'Wendy',
              role: 'Community',
              title: 'Growth & Community',
              responsibilities: ['User engagement', 'Community management', 'Growth experiments', 'Feedback loops'],
              models: ['Gemini 3 Flash'],
              tools: ['Telegram', 'Discord', 'Analytics'],
            },
          ],
        },
      ],
    },
  ],
};

// ─── Colors ───────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  CEO: '#F59E0B',
  COO: '#3B82F6',
  CTO: '#8B5CF6',
  CMO: '#EC4899',
  CRO: '#EF4444',
  'QA Lead': '#22C55E',
  'Content Lead': '#F97316',
  'Social Lead': '#06B6D4',
  'Ops Lead': '#10B981',
  Community: '#A855F7',
  Division: '#52525B',
};

const getColor = (role: string) => ROLE_COLORS[role] || '#71717A';

// ─── Layout constants ─────────────────────────────────────────────────────

const NODE_W = 200;
const NODE_H = 72;
const H_GAP = 56;   // horizontal gap between nodes at same level
const V_GAP = 80;   // vertical gap between parent and children row
const CORNER_R = 12; // radius for rounded corners on connectors

// ─── Tree layout engine ────────────────────────────────────────────────────

interface LayoutNode {
  node: OrgNode;
  x: number;  // center x
  y: number;  // top y
  children: LayoutNode[];
}

function layoutTree(
  node: OrgNode,
  expandedNodes: Set<string>,
  depth: number = 0,
): LayoutNode {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0 && isExpanded;

  if (!hasChildren) {
    return { node, x: 0, y: depth * (NODE_H + V_GAP), children: [] };
  }

  const childLayouts = node.children!.map(c =>
    layoutTree(c, expandedNodes, depth + 1)
  );

  // Space children horizontally
  let offsetX = 0;
  for (let i = 0; i < childLayouts.length; i++) {
    const subtreeW = getSubtreeWidth(childLayouts[i]);
    shiftTree(childLayouts[i], offsetX);
    offsetX += subtreeW + H_GAP;
  }
  // Remove last H_GAP
  offsetX -= H_GAP;

  // Center parent over children
  const firstChild = childLayouts[0];
  const lastChild = childLayouts[childLayouts.length - 1];
  const childrenCenter = (firstChild.x + lastChild.x) / 2;

  return {
    node,
    x: childrenCenter,
    y: depth * (NODE_H + V_GAP),
    children: childLayouts,
  };
}

function getSubtreeWidth(layout: LayoutNode): number {
  if (layout.children.length === 0) return NODE_W;
  const allNodes = collectNodes(layout);
  const xs = allNodes.map(n => n.x);
  return Math.max(...xs) - Math.min(...xs) + NODE_W;
}

function shiftTree(layout: LayoutNode, dx: number): void {
  layout.x += dx;
  layout.children.forEach(c => shiftTree(c, dx));
}

function collectNodes(layout: LayoutNode): LayoutNode[] {
  return [layout, ...layout.children.flatMap(collectNodes)];
}

function getBounds(layout: LayoutNode): { minX: number; maxX: number; maxY: number } {
  const nodes = collectNodes(layout);
  const xs = nodes.map(n => n.x - NODE_W / 2);
  const xe = nodes.map(n => n.x + NODE_W / 2);
  const ys = nodes.map(n => n.y + NODE_H);
  return { minX: Math.min(...xs), maxX: Math.max(...xe), maxY: Math.max(...ys) };
}

// ─── SVG Connector (N8N-style orthogonal with rounded corners) ─────────────

function Connector({ parent, child }: { parent: LayoutNode; child: LayoutNode }) {
  const color = getColor(parent.node.role);

  // Parent bottom-center → child top-center
  const x1 = parent.x;
  const y1 = parent.y + NODE_H;
  const x2 = child.x;
  const y2 = child.y;

  const midY = (y1 + y2) / 2;

  // Build orthogonal path: down → horizontal → down
  // With small rounded corners
  let d: string;

  if (Math.abs(x1 - x2) < 2) {
    // Straight vertical line
    d = `M ${x1} ${y1} L ${x2} ${y2}`;
  } else {
    const goRight = x2 > x1;
    const r = Math.min(CORNER_R, Math.abs(x2 - x1) / 2, Math.abs(midY - y1));

    // Sweep flag: 0 = counter-clockwise, 1 = clockwise
    const sweep1 = goRight ? 1 : 0;
    const sweep2 = goRight ? 0 : 1;

    const cornerX1 = goRight ? x1 + r : x1 - r;
    const cornerX2 = goRight ? x2 - r : x2 + r;

    d = [
      `M ${x1} ${y1}`,
      `L ${x1} ${midY - r}`,
      `Q ${x1} ${midY} ${cornerX1} ${midY}`,
      `L ${cornerX2} ${midY}`,
      `Q ${x2} ${midY} ${x2} ${midY + r}`,
      `L ${x2} ${y2}`,
    ].join(' ');
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={`${color}50`}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  );
}

// ─── Node card ─────────────────────────────────────────────────────────────

function NodeCard({
  layout,
  selected,
  onSelect,
  onToggle,
  expandedNodes,
}: {
  layout: LayoutNode;
  selected: boolean;
  onSelect: (n: OrgNode | null) => void;
  onToggle: (id: string) => void;
  expandedNodes: Set<string>;
}) {
  const { node } = layout;
  const color = getColor(node.role);
  const hasChildren = !!(node.children && node.children.length > 0);
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div
      onClick={() => onSelect(selected ? null : node)}
      style={{
        position: 'absolute',
        left: layout.x - NODE_W / 2,
        top: layout.y,
        width: NODE_W,
        height: NODE_H,
        background: selected ? '#18181B' : '#111113',
        border: `1px solid ${selected ? color + '60' : '#27272A'}`,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
          (e.currentTarget as HTMLDivElement).style.background = '#16161A';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#27272A';
          (e.currentTarget as HTMLDivElement).style.background = '#111113';
        }
      }}
    >
      {/* Color dot */}
      <span style={{
        width: 8,
        height: 8,
        borderRadius: node.isHuman ? 2 : '50%',
        background: color,
        flexShrink: 0,
      }} />

      {/* Name + role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#FAFAFA', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {node.name}
        </div>
        <div style={{ color: '#52525B', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {node.role}
        </div>
      </div>

      {/* Expand toggle */}
      {hasChildren && (
        <button
          onClick={e => { e.stopPropagation(); onToggle(node.id); }}
          style={{
            background: 'transparent',
            border: '1px solid #27272A',
            borderRadius: 4,
            color: '#52525B',
            cursor: 'pointer',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            flexShrink: 0,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}60`;
            (e.currentTarget as HTMLButtonElement).style.color = color;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272A';
            (e.currentTarget as HTMLButtonElement).style.color = '#52525B';
          }}
        >
          {isExpanded ? '−' : '+'}
        </button>
      )}
    </div>
  );
}

// ─── Canvas renderer ───────────────────────────────────────────────────────

function renderConnectors(layout: LayoutNode): React.ReactNode[] {
  const lines: React.ReactNode[] = [];
  layout.children.forEach(child => {
    lines.push(
      <Connector key={`${layout.node.id}-${child.node.id}`} parent={layout} child={child} />
    );
    lines.push(...renderConnectors(child));
  });
  return lines;
}

function renderNodes(
  layout: LayoutNode,
  selectedId: string | null,
  onSelect: (n: OrgNode | null) => void,
  onToggle: (id: string) => void,
  expandedNodes: Set<string>,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [
    <NodeCard
      key={layout.node.id}
      layout={layout}
      selected={selectedId === layout.node.id}
      onSelect={onSelect}
      onToggle={onToggle}
      expandedNodes={expandedNodes}
    />,
  ];
  layout.children.forEach(child => {
    nodes.push(...renderNodes(child, selectedId, onSelect, onToggle, expandedNodes));
  });
  return nodes;
}

// ─── Detail Panel ──────────────────────────────────────────────────────────

function DetailPanel({ node, onClose }: { node: OrgNode; onClose: () => void }) {
  const color = getColor(node.role);
  return (
    <div style={{
      width: 340,
      flexShrink: 0,
      background: '#111113',
      border: '1px solid #27272A',
      borderRadius: 12,
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 200px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 10, height: 10,
            borderRadius: node.isHuman ? 2 : '50%',
            background: color, flexShrink: 0,
          }} />
          <div>
            <div style={{ color: '#FAFAFA', fontSize: 16, fontWeight: 700 }}>{node.name}</div>
            <div style={{ color: '#52525B', fontSize: 12, marginTop: 2 }}>{node.title}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: `${color}18`, color, border: `1px solid ${color}35`,
          }}>
            {node.role}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #27272A', borderRadius: 6,
              color: '#52525B', cursor: 'pointer', width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <div style={{ color: '#52525B', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Responsibilities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {node.responsibilities.map((r, i) => (
            <div key={i} style={{
              background: '#0D0D0F', borderRadius: 6, padding: '7px 10px',
              fontSize: 12, color: '#A1A1AA', borderLeft: `2px solid ${color}35`,
            }}>
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div>
        <div style={{ color: '#52525B', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Models
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {node.models.length > 0 ? node.models.map((m, i) => (
            <span key={i} style={{
              padding: '4px 8px', borderRadius: 6, fontSize: 11,
              background: '#1A1A1C', color: '#FAFAFA', border: '1px solid #27272A',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {m}
            </span>
          )) : (
            <span style={{ color: '#52525B', fontSize: 12, fontStyle: 'italic' }}>Human operator</span>
          )}
        </div>
      </div>

      {/* Tools */}
      <div>
        <div style={{ color: '#52525B', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Tools
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {node.tools.map((t, i) => (
            <span key={i} style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 11,
              background: '#0D0D0F', color: '#71717A', border: '1px solid #1E1E22',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

const PADDING = 40;

export default function OrgChartView() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['derek', 'milo', 'anders', 'paula', 'bobby'])
  );
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set<string>();
    const walk = (n: OrgNode) => { ids.add(n.id); n.children?.forEach(walk); };
    walk(ORG_TREE);
    setExpandedNodes(ids);
  };

  const collapseAll = () => setExpandedNodes(new Set(['derek']));

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // Compute layout
  const layout = layoutTree(ORG_TREE, expandedNodes);
  const bounds = getBounds(layout);
  const totalW = bounds.maxX - bounds.minX + PADDING * 2;
  const totalH = bounds.maxY + PADDING * 2;

  // Shift all nodes so minX = PADDING
  const shiftX = PADDING - bounds.minX;
  shiftTree(layout, shiftX);

  // Pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, [role=button]')) return;
    setIsPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStart.current) return;
    setTransform(t => ({
      ...t,
      x: panStart.current!.tx + (e.clientX - panStart.current!.mx),
      y: panStart.current!.ty + (e.clientY - panStart.current!.my),
    }));
  }, [isPanning]);

  const onMouseUp = useCallback(() => setIsPanning(false), []);

  // Zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(2, Math.max(0.3, t.scale * delta)) }));
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', gap: '1rem', padding: '1.5rem', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }}>

      {/* Left: canvas area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ color: '#52525B', fontSize: 13, margin: 0, flex: 1 }}>
            Agent hierarchy · roles · model assignments
          </p>
          {[
            { label: 'Expand All', fn: expandAll },
            { label: 'Collapse All', fn: collapseAll },
            { label: 'Reset View', fn: resetView },
          ].map(b => (
            <button
              key={b.label}
              onClick={b.fn}
              style={{
                background: '#111113', border: '1px solid #27272A', borderRadius: 7,
                padding: '5px 12px', color: '#A1A1AA', fontSize: 12, cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3F3F46')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#27272A')}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          style={{
            flex: 1,
            background: '#0A0A0C',
            border: '1px solid #1E1E22',
            borderRadius: 12,
            overflow: 'hidden',
            cursor: isPanning ? 'grabbing' : 'grab',
            position: 'relative',
          }}
        >
          {/* Dot grid background */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#27272A" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>

          {/* Transformable canvas */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              width: totalW,
              height: totalH,
            }}
          >
            {/* SVG connectors */}
            <svg
              style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
              width={totalW}
              height={totalH}
            >
              {renderConnectors(layout)}
            </svg>

            {/* Node cards */}
            <div style={{ position: 'relative', width: totalW, height: totalH }}>
              {renderNodes(
                layout,
                selectedNode?.id ?? null,
                setSelectedNode,
                toggleNode,
                expandedNodes,
              )}
            </div>
          </div>

          {/* Zoom indicator */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: '#111113', border: '1px solid #27272A', borderRadius: 6,
            padding: '3px 8px', fontSize: 11, color: '#52525B',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {Math.round(transform.scale * 100)}%
          </div>
        </div>
      </div>

      {/* Right: Detail panel */}
      {selectedNode && (
        <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
