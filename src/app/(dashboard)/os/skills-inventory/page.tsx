'use client';
import { useState, useMemo, useEffect } from 'react';
import OpsGuard from '@/components/OpsGuard';

/* ───────────────── Design Tokens (Paula's spec) ───────────────── */
const T = {
  bg:        '#0A0A0A',
  card:      '#111111',
  elevated:  '#18181B',
  amber:     '#F59E0B',
  text:      '#FAFAFA',
  secondary: '#A1A1AA',
  muted:     '#71717A',
  border:    '#27272A',
  green:     '#22C55E',
  red:       '#EF4444',
};

const levelColor: Record<string, { bg: string; text: string }> = {
  Expert:       { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E' },
  Advanced:     { bg: 'rgba(59,130,246,0.15)',  text: '#3B82F6' },
  Intermediate: { bg: 'rgba(168,85,247,0.15)',  text: '#A855F7' },
};

/* ───────────────── Interfaces ───────────────── */
interface Skill { name: string; level: 'Expert' | 'Advanced' | 'Intermediate'; desc: string }

interface AgentSkill {
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate';
  category: 'technical' | 'business' | 'core';
  addedDate: string;
}

interface AgentConfig {
  name: string;
  role: string;
  color: string;
  icon: string;
  description: string;
  ratings: {
    technical: number;
    business: number;
    core: number;
    autonomy: number;
    awareness: number;
  };
  skills: AgentSkill[];
  notes: string;
}

interface AgentConfigData {
  lastUpdated: string;
  agents: Record<string, AgentConfig>;
  ratingScale: Record<string, string>;
}

// Helper to get top skills sorted by level
const getTopSkills = (skills: AgentSkill[], count: number = 3): AgentSkill[] => {
  const levelOrder = { 'Expert': 0, 'Advanced': 1, 'Intermediate': 2 };
  return [...skills]
    .sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
    .slice(0, count);
};

interface InventorySkill { name: string; icon: string; purpose: string; ready: boolean; dependency?: string }
interface SkillCategory { name: string; color: string; skills: InventorySkill[] }
type ViewMode = 'agent' | 'category' | 'status';

/* ───────────────── Fetch Functions ───────────────── */
const fetchAgentSkills = async (): Promise<AgentConfigData | null> => {
  try {
    const response = await fetch('/data/agent-skills.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch agent skills');
    return await response.json();
  } catch (error) {
    console.error('Error fetching agent skills:', error);
    return null;
  }
};

/* ───────────────── Skills Data ───────────────── */
interface SkillData {
  skills: {
    name: string;
    source: string;
    category: string;
    description: string;
    lastModified: string;
    sizeBytes: number;
  }[];
}

const fetchSkillsData = async (): Promise<SkillData> => {
  try {
    const response = await fetch('/data/skills.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch skills data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skills data:', error);
    return { skills: [] };
  }
};

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'development': '🧩', 'content': '📝', 'design': '🎨', 'finance': '💰',
    'data': '📊', 'system': '⚙️', 'voice-audio': '🎵', 'business': '💼',
    'research': '🔍', 'automation': '🤖', 'default': '📦'
  };
  return icons[category] || icons.default;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'development': '#3B82F6', 'content': '#8B5CF6', 'design': '#EC4899',
    'finance': '#22C55E', 'data': '#F97316', 'system': '#8B5A2B',
    'voice-audio': '#06B6D4', 'business': '#F59E0B', 'research': '#DC2626',
    'automation': '#6366F1', 'default': '#71717A'
  };
  return colors[category] || colors.default;
};

const convertSkillsData = (data: SkillData): { categories: SkillCategory[], allSkills: InventorySkill[] } => {
  const skillsByCategory: Record<string, InventorySkill[]> = {};
  data.skills.forEach(skill => {
    if (!skillsByCategory[skill.category]) skillsByCategory[skill.category] = [];
    skillsByCategory[skill.category].push({
      name: skill.name,
      icon: getCategoryIcon(skill.category),
      purpose: skill.description || `${skill.name} skill`,
      ready: true
    });
  });
  const categories: SkillCategory[] = Object.entries(skillsByCategory).map(([name, skills]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
    color: getCategoryColor(name),
    skills
  }));
  const allSkills = data.skills.map(skill => ({
    name: skill.name,
    icon: getCategoryIcon(skill.category),
    purpose: skill.description || `${skill.name} skill`,
    ready: true
  }));
  return { categories, allSkills };
};

/* ───────────────── Reusable Components ───────────────── */
function ratingColor(rating: number): string {
  if (rating <= 3) return '#EF4444';  // red
  if (rating <= 6) return '#F59E0B';  // amber
  return '#22C55E';                    // green
}

function RatingBar({ rating, max = 10 }: { rating: number; max?: number; color?: string }) {
  const pct = Math.min((rating / max) * 100, 100);
  const barColor = ratingColor(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: barColor, minWidth: 16, textAlign: 'right', fontWeight: 600 }}>{rating}</span>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const c = levelColor[level] || levelColor.Intermediate;
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.text,
    }}>{level}</span>
  );
}

function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      padding: '2px 10px', borderRadius: 4,
      background: ready ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      color: ready ? T.green : T.red, letterSpacing: 0.5,
    }}>{ready ? 'READY' : 'MISSING'}</span>
  );
}

function InventorySkillRow({ skill }: { skill: InventorySkill }) {
  return (
    <div style={{
      padding: '12px 14px', background: T.elevated, borderRadius: 6, border: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'flex-start', gap: 12, opacity: skill.ready ? 1 : 0.7,
    }}>
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{skill.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: T.text }}>{skill.name}</span>
          <StatusBadge ready={skill.ready} />
        </div>
        <div style={{ fontSize: 12, color: T.secondary, lineHeight: 1.4 }}>{skill.purpose}</div>
        {!skill.ready && skill.dependency && (
          <div style={{ fontSize: 11, color: T.red, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            ⚠ Needs: {skill.dependency}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── Category Card ───────────────── */
function CategoryCard({ category, defaultOpen = false }: { category: SkillCategory; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const readyCount = category.skills.filter(s => s.ready).length;
  const totalCount = category.skills.length;
  return (
    <div style={{ background: T.card, borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          color: T.text, textAlign: 'left',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: category.skills[0]?.ready ? T.green : T.red }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: category.color }}>{category.name}</div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{readyCount}/{totalCount} skills ready</div>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 6,
          background: readyCount === totalCount ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          color: readyCount === totalCount ? T.green : T.red,
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
        }}>{readyCount === totalCount ? '100%' : `${Math.round((readyCount / totalCount) * 100)}%`}</div>
        <span style={{ fontSize: 12, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {category.skills.map((skill, i) => <InventorySkillRow key={i} skill={skill} />)}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Agent Card (Data-Driven) ───────────────── */
function AgentCard({ agent, expanded, onToggle }: { agent: AgentConfig; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        background: T.card, borderRadius: 8, padding: 20,
        border: `1px solid ${expanded ? T.amber : T.border}`,
        borderLeft: expanded ? `3px solid ${T.amber}` : `1px solid ${T.border}`,
        transition: 'border-color 0.25s ease', cursor: 'default',
      }}
      onMouseEnter={e => { if (!expanded) (e.currentTarget.style.borderColor = T.amber); }}
      onMouseLeave={e => { if (!expanded) (e.currentTarget.style.borderColor = T.border); }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: agent.color,
        }}>{agent.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{agent.name}</span>
            <span style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px',
              borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: T.amber,
            }}>{agent.skills.length} skills</span>
          </div>
          <div style={{ fontSize: 12, color: agent.color, fontWeight: 500 }}>{agent.role}</div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: T.secondary, lineHeight: 1.5, margin: '0 0 16px' }}>{agent.description}</p>

      {/* Skill Breakdown - Now using RATINGS (1-6 scale) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>SKILL BREAKDOWN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Technical', rating: agent.ratings.technical, color: '#3B82F6' },
            { label: 'Business', rating: agent.ratings.business, color: '#EF4444' },
            { label: 'Core', rating: agent.ratings.core, color: T.amber },
            { label: 'Autonomy', rating: agent.ratings.autonomy, color: '#8B5CF6' },
            { label: 'Awareness', rating: agent.ratings.awareness, color: '#06B6D4' },
          ].map(bar => (
            <div key={bar.label}>
              <span style={{ fontSize: 11, color: T.secondary }}>{bar.label}</span>
              <RatingBar rating={bar.rating} max={10} color={bar.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Top Skills (auto-sorted by level) */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>TOP SKILLS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {getTopSkills(agent.skills, 3).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: T.elevated, borderRadius: 6 }}>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: T.text }}>{s.name}</span>
              <LevelBadge level={s.level} />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded: All Skills by Category + Notes */}
      {expanded && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* All Skills grouped by category */}
          {(['core', 'technical', 'business'] as const).map(category => {
            const categorySkills = agent.skills.filter(s => s.category === category);
            if (categorySkills.length === 0) return null;
            const categoryColors = { core: T.amber, technical: '#3B82F6', business: '#EF4444' };
            const categoryLabels = { core: 'CORE SKILLS', technical: 'TECHNICAL SKILLS', business: 'BUSINESS SKILLS' };
            return (
              <div key={category}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: categoryColors[category], marginBottom: 8 }}>
                  {categoryLabels[category]} ({categorySkills.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {categorySkills.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: T.elevated, borderRadius: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.text }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 9, color: T.muted }}>{s.addedDate}</span>
                        <LevelBadge level={s.level} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Development Notes */}
          {agent.notes && (
            <div style={{ padding: '10px 12px', background: T.elevated, borderRadius: 6, borderLeft: `3px solid ${T.amber}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 4 }}>DEVELOPMENT NOTES</div>
              <div style={{ fontSize: 12, color: T.secondary, lineHeight: 1.4 }}>{agent.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '8px 0', background: 'none', border: `1px solid ${T.border}`,
          borderRadius: 6, color: T.amber, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = T.amber)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
      >
        {expanded ? '▲ Collapse' : `▼ View Details`}
      </button>
    </div>
  );
}

/* ───────────────── Category View ───────────────── */
function CategoryView({ search, categories }: { search: string, categories: SkillCategory[] }) {
  const q = search.toLowerCase();
  const filterCat = (cat: SkillCategory): SkillCategory | null => {
    if (!q) return cat;
    const filtered = cat.skills.filter(s => s.name.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q));
    return filtered.length === 0 ? null : { ...cat, skills: filtered };
  };
  const filteredCats = categories.map(filterCat).filter(Boolean) as SkillCategory[];
  const totalSkills = categories.reduce((acc, cat) => acc + cat.skills.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.green, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
          AVAILABLE SKILLS — {totalSkills} Total
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredCats.map((cat, i) => <CategoryCard key={i} category={cat} defaultOpen={i === 0} />)}
        </div>
      </div>
      {filteredCats.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>No skills match &ldquo;{search}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Status View ───────────────── */
function StatusView({ search, skills }: { search: string, skills: InventorySkill[] }) {
  const q = search.toLowerCase();
  const filterSkills = (skillList: InventorySkill[]) => !q ? skillList : skillList.filter(s => s.name.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q));
  const ready = filterSkills(skills.filter(s => s.ready));
  const missing = filterSkills(skills.filter(s => !s.ready));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.green, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
          READY ({ready.length})
        </div>
        <style>{`.status-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}@media(max-width:768px){.status-grid{grid-template-columns:1fr!important}}`}</style>
        <div className="status-grid">{ready.map((s, i) => <InventorySkillRow key={i} skill={s} />)}</div>
      </div>
      {missing.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.red, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: T.red, display: 'inline-block' }} />
            MISSING ({missing.length})
          </div>
          <div className="status-grid">{missing.map((s, i) => <InventorySkillRow key={i} skill={s} />)}</div>
        </div>
      )}
      {ready.length === 0 && missing.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>No skills match &ldquo;{search}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */
export default function SkillsInventory() {
  const [viewMode, setViewMode] = useState<ViewMode>('agent');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Agent configs from JSON
  const [agentConfigs, setAgentConfigs] = useState<AgentConfigData | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Skills data
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [allSkills, setAllSkills] = useState<InventorySkill[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setConfigLoading(true);

      // Load agent skills
      const configs = await fetchAgentSkills();
      if (configs) {
        setAgentConfigs(configs);
        setLastUpdated(configs.lastUpdated);
      }

      // Load skills
      const skillsData = await fetchSkillsData();
      const { categories, allSkills: skills } = convertSkillsData(skillsData);
      setSkillCategories(categories);
      setAllSkills(skills);

      setConfigLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const agents = useMemo(() => {
    if (!agentConfigs) return [];
    return Object.values(agentConfigs.agents);
  }, [agentConfigs]);

  const filteredAgents = useMemo(() => {
    if (!search) return agents;
    const q = search.toLowerCase();
    return agents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.skills.some(s => s.name.toLowerCase().includes(q))
    );
  }, [agents, search]);

  const toggle = (name: string) => setExpanded(p => ({ ...p, [name]: !p[name] }));

  const views: { key: ViewMode; label: string }[] = [
    { key: 'agent', label: 'By Agent' },
    { key: 'category', label: 'By Category' },
    { key: 'status', label: 'By Status' },
  ];

  if (configLoading) {
    return (
      <OpsGuard>
        <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚙️</div>
            <div style={{ fontSize: 16, color: T.secondary }}>Loading skills data...</div>
          </div>
        </div>
      </OpsGuard>
    );
  }

  return (
    <OpsGuard>
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 28, fontWeight: 700, color: T.amber, textTransform: 'uppercase' as const, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Skills Inventory</h1>
            <p style={{ fontSize: 13, color: T.secondary, margin: 0 }}>
              Agent proficiency ratings • Scale 1-10 • Updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', background: T.card, borderRadius: 6, padding: 4, border: `1px solid ${T.border}` }}>
              {views.map(v => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key)}
                  style={{
                    padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer',
                    fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    background: viewMode === v.key ? T.amber : 'transparent',
                    color: viewMode === v.key ? T.bg : T.secondary,
                    transition: 'all 0.2s',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search agents or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: '10px 14px',
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
                color: T.text, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              }}
            />

            {/* Rating Scale Legend */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: T.muted }}>
              <span>Scale:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <span key={n} style={{
                  padding: '2px 5px', borderRadius: 4,
                  background: n <= 3 ? 'rgba(239,68,68,0.15)' : n <= 6 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                  color: n <= 3 ? T.red : n <= 6 ? T.amber : T.green,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Content */}
          {viewMode === 'agent' && (
            <div>
              <style>{`.agent-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}@media(max-width:1024px){.agent-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:768px){.agent-grid{grid-template-columns:1fr}}`}</style>
              <div className="agent-grid">
                {filteredAgents.map(agent => (
                  <AgentCard
                    key={agent.name}
                    agent={agent}
                    expanded={expanded[agent.name] || false}
                    onToggle={() => toggle(agent.name)}
                  />
                ))}
              </div>
              {filteredAgents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 14 }}>No agents match &ldquo;{search}&rdquo;</div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'category' && <CategoryView search={search} categories={skillCategories} />}
          {viewMode === 'status' && <StatusView search={search} skills={allSkills} />}

          {/* Footer */}
          <div style={{ marginTop: 40, textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              Data source: /data/agent-skills.json • Edit to update ratings & skills
            </p>
            <a href="/os" style={{ color: T.amber, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              ← Back to Mission Control
            </a>
          </div>
        </div>
      </div>
    </OpsGuard>
  );
}
