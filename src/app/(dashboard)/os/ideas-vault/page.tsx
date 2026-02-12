'use client';
import { useState, useEffect, Suspense } from "react";
import { brand, styles } from "@/lib/brand";
import { useSearchParams } from "next/navigation";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'spark' | 'shaping' | 'building' | 'shipped';
  category: string;
  created_at: string;
}

const STAGES = [
  { key: 'spark', label: 'Spark', color: '#10B981' },
  { key: 'shaping', label: 'Beginning Stages', color: '#A855F7' },
  { key: 'building', label: 'Building', color: '#F59E0B' },
  { key: 'shipped', label: 'Shipped', color: '#3B82F6' },
] as const;

const DEFAULT_IDEAS: Idea[] = [
  { id: '1', title: 'AI-Powered Menu Optimizer', description: 'Use AI to analyze menu performance and suggest pricing/placement changes to maximize revenue per cover.', priority: 'high', status: 'spark', category: 'general', created_at: '2026-02-10T10:00:00Z' },
  { id: '2', title: 'Family Task Gamification App', description: 'Turn household chores into a game for kids. Points, leaderboards, rewards. Built for big families.', priority: 'medium', status: 'shaping', category: 'general', created_at: '2026-02-09T14:00:00Z' },
  { id: '3', title: 'Sermon Notes App', description: 'Simple app for taking structured sermon notes with auto-tagging of Bible references and sharing with small groups.', priority: 'medium', status: 'spark', category: 'general', created_at: '2026-02-08T09:00:00Z' },
  { id: '4', title: 'Local Restaurant Review Aggregator', description: 'Aggregate reviews from Google, Yelp, TripAdvisor into one dashboard for restaurant owners. Show sentiment trends.', priority: 'low', status: 'spark', category: 'general', created_at: '2026-02-07T16:00:00Z' },
  { id: '5', title: 'Kids Allowance Tracker', description: 'Digital allowance system where kids can see savings goals, earn bonuses for tasks. Teaches money management early.', priority: 'high', status: 'building', category: 'general', created_at: '2026-02-06T11:00:00Z' },
];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export default function IdeasVaultPage() {
  return (
    <Suspense fallback={<div style={styles.page}><div style={styles.container}><p style={{ color: '#888' }}>Loading...</p></div></div>}>
      <IdeasVault />
    </Suspense>
  );
}

function IdeasVault() {
  const searchParams = useSearchParams();
  const [newIdea, setNewIdea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>(DEFAULT_IDEAS);
  const [showArchive, setShowArchive] = useState(false);

  // Check for incoming idea from SaaS page via query params
  useEffect(() => {
    const title = searchParams.get('add_title');
    const desc = searchParams.get('add_desc');
    if (title) {
      const exists = ideas.some(i => i.title === title);
      if (!exists) {
        setIdeas(prev => [{
          id: genId(),
          title,
          description: desc || null,
          priority: 'high' as const,
          status: 'spark' as const,
          category: 'general',
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const addIdea = () => {
    if (!newIdea.trim()) return;
    setIdeas(prev => [{
      id: genId(),
      title: newIdea.trim(),
      description: newDescription.trim() || null,
      priority: 'medium' as const,
      status: 'spark' as const,
      category: 'general',
      created_at: new Date().toISOString(),
    }, ...prev]);
    setNewIdea('');
    setNewDescription('');
  };

  const updateStatus = (id: string, status: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: status as Idea['status'] } : i));
  };

  const archiveIdea = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, category: 'archived' } : i));
  };

  const restoreIdea = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, category: 'general' } : i));
  };

  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const promoteToKanban = (idea: Idea) => {
    window.location.href = `/os/kanban?add_title=${encodeURIComponent(idea.title)}&add_desc=${encodeURIComponent(idea.description || '')}`;
  };

  const activeIdeas = ideas.filter(i => i.category !== 'archived');
  const archivedIdeas = ideas.filter(i => i.category === 'archived');
  const stageInfo = (status: string) => STAGES.find(s => s.key === status) || STAGES[0];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Ideas Vault</h1>
        <p style={styles.subtitle}>
          The pipeline. From spark to shipped. {activeIdeas.length} active, {archivedIdeas.length} archived.
        </p>

        {/* New Idea Input */}
        <div style={{ ...styles.card, marginBottom: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>New Idea</h3>
          <input type="text" placeholder="What's the idea?" value={newIdea} onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIdea()}
            style={{ ...styles.input, marginBottom: '1rem' }} />
          <textarea placeholder="Expand on it..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
            style={{ ...styles.input, height: '80px', resize: 'none', marginBottom: '1rem' }} />
          <button onClick={addIdea} style={styles.button} disabled={!newIdea.trim()}>Commit Idea</button>
        </div>

        {/* Stage Legend */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: brand.smoke, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flow:</span>
          {STAGES.map((s, i) => (
            <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
              <span style={{ color: brand.silver, fontSize: '12px' }}>{s.label}</span>
              {i < STAGES.length - 1 && <span style={{ color: brand.smoke, fontSize: '12px' }}>&rarr;</span>}
            </span>
          ))}
          <span style={{ color: brand.smoke, fontSize: '12px' }}>&rarr;</span>
          <span style={{ color: brand.smoke, fontSize: '12px' }}>Kanban Todo</span>
        </div>

        {/* Active Ideas */}
        <div style={styles.grid}>
          {activeIdeas.map((idea) => {
            const stage = stageInfo(idea.status);
            return (
              <div key={idea.id} style={{ ...styles.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `3px solid ${stage.color}` }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: brand.white, margin: 0, fontSize: '16px' }}>{idea.title}</h4>
                    <span style={styles.badge(stage.color)}>{stage.label}</span>
                  </div>
                  <p style={{ color: brand.silver, lineHeight: '1.5', fontSize: '14px', marginBottom: '1rem' }}>
                    {idea.description || 'No description yet.'}
                  </p>
                </div>
                <div style={{ borderTop: `1px solid ${brand.border}`, paddingTop: '0.75rem' }}>
                  {/* Status Buttons */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {STAGES.map(s => (
                      <button key={s.key} onClick={() => updateStatus(idea.id, s.key)}
                        style={{
                          padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          cursor: 'pointer',
                          border: idea.status === s.key ? 'none' : `1px solid ${brand.border}`,
                          background: idea.status === s.key ? s.color : 'transparent',
                          color: idea.status === s.key ? brand.void : brand.smoke,
                          transition: 'all 0.15s',
                        }}>{s.label}</button>
                    ))}
                  </div>
                  {/* Action Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: brand.smoke }}>
                      {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => promoteToKanban(idea)}
                        style={{
                          background: 'none', border: `1px solid ${brand.amber}`, borderRadius: '4px',
                          padding: '2px 8px', color: brand.amber, cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                        }}
                        title="Promote to Kanban Todo">To Kanban</button>
                      <button onClick={() => archiveIdea(idea.id)}
                        style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '11px', opacity: 0.6 }}
                        title="Archive idea">Archive</button>
                      <button onClick={() => deleteIdea(idea.id)}
                        style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '14px', opacity: 0.4 }}
                        title="Delete idea">x</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Archive Section */}
        {archivedIdeas.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => setShowArchive(!showArchive)}
              style={{
                background: 'none', border: `1px solid ${brand.border}`, borderRadius: '8px',
                padding: '8px 16px', color: brand.smoke, cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                marginBottom: '16px',
              }}>
              {showArchive ? 'Hide' : 'Show'} Archive ({archivedIdeas.length})
            </button>
            {showArchive && (
              <div style={styles.grid}>
                {archivedIdeas.map((idea) => (
                  <div key={idea.id} style={{ ...styles.card, opacity: 0.6, borderLeft: `3px solid ${brand.smoke}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: brand.smoke, margin: 0, fontSize: '14px', textDecoration: 'line-through' }}>{idea.title}</h4>
                    </div>
                    <p style={{ color: brand.smoke, fontSize: '13px', marginBottom: '0.75rem' }}>{idea.description || 'No description'}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => restoreIdea(idea.id)}
                        style={{ background: 'none', border: `1px solid ${brand.amber}`, borderRadius: '4px', padding: '2px 8px', color: brand.amber, cursor: 'pointer', fontSize: '11px' }}>
                        Restore
                      </button>
                      <button onClick={() => deleteIdea(idea.id)}
                        style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
