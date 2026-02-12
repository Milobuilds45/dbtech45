'use client';

import { useState, useRef, useEffect } from 'react';
import { brand, styles } from "@/lib/brand";

type StatusKey = 'shipped' | 'building' | 'beta' | 'planning' | 'shaping' | 'spark' | 'paused' | 'killed';

interface Project {
  title: string;
  desc: string;
  status: StatusKey;
  progress: number;
  priority: number; // 1-5 stars
}

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; order: number }> = {
  shipped:  { label: 'Shipped',  color: brand.success,  order: 0 },
  building: { label: 'Building', color: brand.amber,    order: 1 },
  beta:     { label: 'Beta',     color: '#8B5CF6',      order: 2 },
  planning: { label: 'Planning', color: brand.info,     order: 3 },
  shaping:  { label: 'Shaping',  color: brand.warning,  order: 4 },
  spark:    { label: 'Spark',    color: brand.smoke,    order: 5 },
  paused:   { label: 'Paused',   color: '#6B7280',      order: 6 },
  killed:   { label: 'Killed',   color: brand.error,    order: 7 },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as StatusKey[];

const DEFAULT_PROJECTS: Project[] = [
  // Shipped / Live
  { title: "Signal & Noise", desc: "Daily trading newsletter filtering market noise into actionable intelligence.", status: "shipped", progress: 100, priority: 5 },
  { title: "Sunday Squares", desc: "Football squares game app. Digital pools for game day with auto-scoring and payouts.", status: "shipped", progress: 100, priority: 4 },
  { title: "TipSplit Pro", desc: "Professional tip calculator built for the restaurant industry.", status: "shipped", progress: 100, priority: 3 },
  { title: "DBTech45.com", desc: "Personal site. Caffeine & Chaos brand. Homepage, /os command center, newsletters.", status: "shipped", progress: 100, priority: 5 },
  { title: "DB Tech OS", desc: "Personal command center dashboard. Agent status, projects, markets, memory bank.", status: "shipped", progress: 100, priority: 5 },
  { title: "Model Counsel", desc: "Multi-model AI comparison tool. Ask one question, get parallel responses from 7 LLMs.", status: "shipped", progress: 100, priority: 3 },
  { title: "The Roundtable", desc: "AI agent debate system. Drop a topic, watch your agents argue it out in rounds.", status: "shipped", progress: 100, priority: 3 },

  // Building
  { title: "tickR", desc: "Real-time trading dashboard with AI-powered signals, journaling, and performance analytics.", status: "building", progress: 75, priority: 5 },
  { title: "Soul Solace", desc: "AI-powered mental wellness companion. Daily reflections, mood tracking, guided prayers.", status: "building", progress: 60, priority: 4 },
  { title: "Soul Solace V2", desc: "Complete rebuild with enhanced prayer engine, multi-faith support, and new UI.", status: "building", progress: 45, priority: 4 },
  { title: "Boundless", desc: "AI journaling app. Deeper thinking through guided prompts and reflections.", status: "building", progress: 40, priority: 3 },
  { title: "Kitchen Cost Tracker", desc: "Restaurant food cost and inventory management system for multi-unit operators.", status: "building", progress: 30, priority: 3 },
  { title: "SharpEdge AI", desc: "AI-powered trading edge finder. Pattern recognition and signal detection.", status: "building", progress: 35, priority: 4 },
  { title: "PickSix Pro", desc: "NFL picks and predictions platform with AI-powered analysis.", status: "building", progress: 40, priority: 3 },
  { title: "Ledgr", desc: "Financial ledger and bookkeeping tool for small business operators.", status: "building", progress: 25, priority: 2 },
  { title: "TradeScope Daily", desc: "Automated daily market briefing with AI-curated insights and trade ideas.", status: "building", progress: 30, priority: 3 },
  { title: "Bobby's Edge", desc: "AI trading advisor system. Market analysis, risk management, signal generation.", status: "building", progress: 50, priority: 4 },
  { title: "Mojo", desc: "Motivation and momentum tracker. Daily energy scoring and habit streaks.", status: "building", progress: 20, priority: 2 },
  { title: "Band Bot", desc: "AI-powered band/music discovery and playlist curation tool.", status: "building", progress: 25, priority: 2 },

  // Shaping
  { title: "Bobola's Promo", desc: "Restaurant promotional system. Deals, events, and customer engagement for Bobola's.", status: "shaping", progress: 15, priority: 3 },
  { title: "Restaurant Accounting", desc: "Full accounting system built for restaurant operators. P&L, payroll, vendor management.", status: "shaping", progress: 15, priority: 2 },
  { title: "Trade Journal", desc: "Structured trading journal with tagging, review cycles, and performance analytics.", status: "shaping", progress: 15, priority: 3 },
  { title: "Trading X Account", desc: "Automated trading content and market commentary for X/Twitter.", status: "shaping", progress: 10, priority: 2 },
  { title: "Daily Pulse", desc: "Morning briefing system. News, markets, schedule, priorities in one view.", status: "shaping", progress: 15, priority: 3 },
  { title: "Concrete Before Curtains", desc: "Derek's book/content project. Build the foundation before the decoration.", status: "shaping", progress: 20, priority: 2 },
  { title: "Voice AI", desc: "Voice-powered AI assistant experiments. Conversational agents and voice UX.", status: "shaping", progress: 10, priority: 2 },
  { title: "SwarmKit", desc: "Framework for orchestrating multi-agent AI swarms. The infrastructure behind the team.", status: "shaping", progress: 15, priority: 3 },

  // Spark
  { title: "AI Idea Validator", desc: "Drop a business idea, get AI-powered validation with market analysis and scoring.", status: "spark", progress: 5, priority: 1 },
  { title: "Receipt Scanner", desc: "Snap a receipt, extract line items, categorize expenses. OCR meets organization.", status: "spark", progress: 5, priority: 1 },
  { title: "AI Meal Planner", desc: "Weekly meal planning powered by AI. Dietary preferences, budget, family size aware.", status: "spark", progress: 5, priority: 1 },
  { title: "Contractor Bidder", desc: "Streamlined contractor bidding platform with scope management and comparison tools.", status: "spark", progress: 5, priority: 1 },
  { title: "Family Calendar AI", desc: "Smart family scheduling that coordinates 9 people's lives with AI conflict resolution.", status: "spark", progress: 5, priority: 2 },
];

const STORAGE_KEY = 'dbtech-projects-v1';

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_PROJECTS;
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch { /* ignore */ }
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '2px' }} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={(e) => { e.stopPropagation(); onChange(star === value ? 0 : star); }}
          onMouseEnter={() => setHovered(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 1px',
            fontSize: '16px',
            lineHeight: 1,
            color: star <= (hovered || value) ? brand.amber : brand.border,
            transition: 'color 0.15s, transform 0.1s',
            transform: star <= hovered ? 'scale(1.2)' : 'scale(1)',
          }}
          title={`${star} star${star !== 1 ? 's' : ''}`}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [filter, setFilter] = useState<string>('all');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [sendingIdx, setSendingIdx] = useState<number | null>(null);
  const [sentIdxs, setSentIdxs] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'default' | 'priority' | 'status'>('default');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  // Save to localStorage on change
  const updateProjects = (updated: Project[]) => {
    setProjects(updated);
    saveProjects(updated);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...projects];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, dragged);
    updateProjects(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateStatus = (idx: number, status: StatusKey) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], status };
    // Auto-set progress for terminal statuses
    if (status === 'shipped') updated[idx].progress = 100;
    if (status === 'killed') updated[idx].progress = 0;
    if (status === 'spark') updated[idx].progress = 5;
    updateProjects(updated);
  };

  const updatePriority = (idx: number, priority: number) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], priority };
    updateProjects(updated);
  };

  const sendToKanban = (idx: number) => {
    const project = projects[idx];
    window.location.href = `/os/kanban?add_title=${encodeURIComponent(project.title)}&add_project=${encodeURIComponent(project.title)}`;
  };

  // Filtering
  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  // Sorting
  const sorted = [...filtered];
  if (sortBy === 'priority') {
    sorted.sort((a, b) => b.priority - a.priority);
  } else if (sortBy === 'status') {
    sorted.sort((a, b) => STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order);
  }

  // Counts
  const counts: Record<string, number> = { all: projects.length };
  ALL_STATUSES.forEach(s => {
    counts[s] = projects.filter(p => p.status === s).length;
  });

  // Only show filters with projects (plus 'all')
  const activeFilters = ['all', ...ALL_STATUSES.filter(s => counts[s] > 0)];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Projects</h1>
        <p style={styles.subtitle}>
          {projects.length} projects. Drag to reorder. Click stars to set priority.
        </p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {activeFilters.map(f => {
            const cfg = f === 'all' ? null : STATUS_CONFIG[f as StatusKey];
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? (cfg?.color || brand.amber) : brand.border}`,
                  background: isActive ? `${cfg?.color || brand.amber}15` : brand.carbon,
                  color: isActive ? (cfg?.color || brand.amber) : brand.smoke,
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? 'All' : cfg?.label} ({counts[f]})
              </button>
            );
          })}
        </div>

        {/* Sort controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
          <span style={{ color: brand.smoke, fontSize: '12px', fontWeight: 600 }}>SORT:</span>
          {([
            { key: 'default', label: 'Order' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
          ] as const).map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                border: sortBy === s.key ? 'none' : `1px solid ${brand.border}`,
                background: sortBy === s.key ? brand.amber : 'transparent',
                color: sortBy === s.key ? brand.void : brand.smoke,
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          {sorted.map((p, sortedIdx) => {
            const realIdx = projects.indexOf(p);
            const cfg = STATUS_CONFIG[p.status];
            const isEditing = editingIdx === realIdx;
            const isSending = sendingIdx === realIdx;
            const isSent = sentIdxs.has(realIdx);

            return (
              <div
                key={`${p.title}-${realIdx}`}
                draggable
                onDragStart={() => handleDragStart(realIdx)}
                onDragEnter={() => handleDragEnter(realIdx)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                style={{
                  ...styles.card,
                  cursor: 'grab',
                  userSelect: 'none' as const,
                  transition: 'border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
                  borderLeft: `3px solid ${cfg.color}`,
                  opacity: p.status === 'killed' ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = brand.amber;
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = brand.border;
                  e.currentTarget.style.borderLeftColor = cfg.color;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header: rank + title + status badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: brand.smoke, fontSize: '13px', fontWeight: 600, opacity: 0.4 }}>#{realIdx + 1}</span>
                    <h3 style={{ color: brand.white, margin: 0, fontSize: '16px' }}>{p.title}</h3>
                  </div>
                  <span
                    onClick={() => setEditingIdx(isEditing ? null : realIdx)}
                    style={{
                      color: cfg.color,
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: '10px',
                      background: `${cfg.color}15`,
                      cursor: 'pointer',
                      border: `1px solid transparent`,
                      transition: 'border-color 0.15s',
                    }}
                    title="Click to change status"
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Star rating */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <StarRating value={p.priority} onChange={(v) => updatePriority(realIdx, v)} />
                </div>

                {/* Description */}
                <p style={{ color: brand.silver, fontSize: '13px', lineHeight: '1.5', marginBottom: '0.75rem' }}>{p.desc}</p>

                {/* Progress bar */}
                <div style={{ marginBottom: isEditing ? '0.75rem' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                    <span style={{ color: brand.smoke }}>Progress</span>
                    <span style={{ color: cfg.color }}>{p.progress}%</span>
                  </div>
                  <div style={{ background: brand.graphite, height: '3px', borderRadius: '2px' }}>
                    <div style={{ background: cfg.color, width: `${p.progress}%`, height: '100%', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Expanded edit panel */}
                {isEditing && (
                  <div style={{
                    borderTop: `1px solid ${brand.border}`,
                    paddingTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    {/* Status selector */}
                    <div>
                      <div style={{ fontSize: '11px', color: brand.smoke, marginBottom: '6px', fontWeight: 600 }}>STATUS</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {ALL_STATUSES.map(s => {
                          const sc = STATUS_CONFIG[s];
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(realIdx, s)}
                              style={{
                                padding: '3px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: p.status === s ? 'none' : `1px solid ${brand.border}`,
                                background: p.status === s ? sc.color : 'transparent',
                                color: p.status === s ? (s === 'spark' || s === 'paused' ? brand.white : brand.void) : brand.smoke,
                                transition: 'all 0.15s',
                              }}
                            >
                              {sc.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => sendToKanban(realIdx)}
                        disabled={isSending || isSent}
                        style={{
                          background: isSent ? brand.success : 'none',
                          border: `1px solid ${isSent ? brand.success : brand.amber}`,
                          borderRadius: '4px',
                          padding: '4px 12px',
                          color: isSent ? brand.void : brand.amber,
                          cursor: isSending || isSent ? 'default' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          opacity: isSending ? 0.5 : 1,
                          transition: 'all 0.2s',
                        }}
                        title="Send to Kanban board as a new todo"
                      >
                        {isSent ? 'Sent to Kanban' : isSending ? 'Sending...' : 'Send to Kanban'}
                      </button>
                      <button
                        onClick={() => setEditingIdx(null)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: brand.amber,
                          color: brand.void,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
