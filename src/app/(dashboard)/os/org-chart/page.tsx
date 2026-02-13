'use client';

import { useState } from 'react';

// ─── Org Chart Data (mirrors Derek's agent swarm) ────────────────────────

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

// ─── Colors ──────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────

export default function OrgChartPage() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['derek', 'milo', 'anders', 'paula', 'bobby']));
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

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
    const walk = (node: OrgNode) => { ids.add(node.id); node.children?.forEach(walk); };
    walk(ORG_TREE);
    setExpandedNodes(ids);
  };

  const collapseAll = () => setExpandedNodes(new Set(['derek']));

  const getColor = (role: string) => ROLE_COLORS[role] || '#71717A';

  const renderNode = (node: OrgNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const color = getColor(node.role);

    return (
      <div key={node.id} style={{ marginLeft: depth * 28 }}>
        <div
          onClick={() => setSelectedNode(isSelected ? null : node)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            marginBottom: '2px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: isSelected ? '#1A1A1C' : 'transparent',
            border: isSelected ? `1px solid ${color}40` : '1px solid transparent',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#111115'; }}
          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Expand toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
              style={{
                background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer',
                fontSize: '0.75rem', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease',
              }}
            >
              ▶
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}

          {/* Node indicator */}
          <span style={{
            width: 10, height: 10, borderRadius: node.isHuman ? '2px' : '50%',
            background: color, flexShrink: 0,
          }} />

          {/* Name + Role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ color: '#FAFAFA', fontSize: '0.875rem', fontWeight: 600 }}>{node.name}</span>
            <span style={{ color: '#52525B', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{node.role}</span>
          </div>

          {/* Model badges */}
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            {node.models.slice(0, 2).map((m, i) => (
              <span key={i} style={{
                padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.65rem',
                background: '#1A1A1C', color: '#71717A', border: '1px solid #27272A',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {m.replace(' (backup)', '').replace(' (failsafe)', '').replace(' (output)', '').replace(' (research)', '').replace(' (writing)', '').replace(' (escalation)', '').replace(' (direction)', '')}
              </span>
            ))}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div style={{ borderLeft: `1px solid ${color}20`, marginLeft: 10 }}>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}>&gt; ops --org-chart</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FAFAFA', margin: '0.25rem 0 0' }}>Org Chart</h1>
        <p style={{ color: '#71717A', fontSize: '0.875rem', marginTop: '0.25rem' }}>Agent hierarchy, roles, and model assignments</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={expandAll} style={{ background: '#1A1A1C', border: '1px solid #27272A', borderRadius: '8px', padding: '0.5rem 1rem', color: '#A1A1AA', fontSize: '0.8rem', cursor: 'pointer' }}>
          Expand All
        </button>
        <button onClick={collapseAll} style={{ background: '#1A1A1C', border: '1px solid #27272A', borderRadius: '8px', padding: '0.5rem 1rem', color: '#A1A1AA', fontSize: '0.8rem', cursor: 'pointer' }}>
          Collapse All
        </button>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Tree */}
        <div style={{ flex: 1, background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1rem', minWidth: 0 }}>
          {renderNode(ORG_TREE)}
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <div style={{ width: 380, flexShrink: 0, background: '#111113', border: '1px solid #27272A', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: selectedNode.isHuman ? '2px' : '50%', background: getColor(selectedNode.role) }} />
                  <h2 style={{ color: '#FAFAFA', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selectedNode.name}</h2>
                </div>
                <p style={{ color: '#71717A', fontSize: '0.85rem', margin: 0 }}>{selectedNode.title}</p>
              </div>
              <span style={{
                padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                background: `${getColor(selectedNode.role)}20`, color: getColor(selectedNode.role),
                border: `1px solid ${getColor(selectedNode.role)}40`,
              }}>
                {selectedNode.role}
              </span>
            </div>

            {/* Responsibilities */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Responsibilities</h4>
              <div style={{ display: 'grid', gap: '0.375rem' }}>
                {selectedNode.responsibilities.map((r, i) => (
                  <div key={i} style={{
                    background: '#0A0A0A', borderRadius: '6px', padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem', color: '#A1A1AA', borderLeft: `2px solid ${getColor(selectedNode.role)}40`,
                  }}>
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Models */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Models</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {selectedNode.models.length > 0 ? selectedNode.models.map((m, i) => (
                  <span key={i} style={{
                    padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem',
                    background: '#1A1A1C', color: '#FAFAFA', border: '1px solid #27272A',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {m}
                  </span>
                )) : (
                  <span style={{ color: '#52525B', fontSize: '0.8rem', fontStyle: 'italic' }}>Human operator</span>
                )}
              </div>
            </div>

            {/* Tools */}
            <div>
              <h4 style={{ color: '#52525B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Tools</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {selectedNode.tools.map((t, i) => (
                  <span key={i} style={{
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                    background: '#0A0A0A', color: '#71717A', border: '1px solid #1A1A1C',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
