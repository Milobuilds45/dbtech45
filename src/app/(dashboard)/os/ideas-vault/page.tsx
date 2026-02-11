'use client';
import { useState, useEffect } from "react";
import { brand, styles } from "@/lib/brand";
import { supabase, type Idea } from "@/lib/supabase";

const STAGES = [
  { key: 'spark', label: 'Spark', color: '#10B981' },
  { key: 'shaping', label: 'Beginning Stages', color: '#A855F7' },
  { key: 'building', label: 'Building', color: '#F59E0B' },
  { key: 'shipped', label: 'Shipped', color: '#3B82F6' },
] as const;

export default function IdeasVault() {
  const [newIdea, setNewIdea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);

  const loadIdeas = async () => {
    const { data } = await supabase.from('ideas_vault').select('*').order('created_at', { ascending: false });
    if (data) setIdeas(data);
    setLoading(false);
  };

  useEffect(() => { loadIdeas(); }, []);

  const addIdea = async () => {
    if (!newIdea.trim()) return;
    await supabase.from('ideas_vault').insert({
      title: newIdea.trim(),
      description: newDescription.trim() || null,
      status: 'spark',
      priority: 'medium',
    });
    setNewIdea('');
    setNewDescription('');
    loadIdeas();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ideas_vault').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    loadIdeas();
  };

  const archiveIdea = async (id: string) => {
    // Move to a special "archived" category
    await supabase.from('ideas_vault').update({ category: 'archived', updated_at: new Date().toISOString() }).eq('id', id);
    loadIdeas();
  };

  const restoreIdea = async (id: string) => {
    await supabase.from('ideas_vault').update({ category: 'general', updated_at: new Date().toISOString() }).eq('id', id);
    loadIdeas();
  };

  const deleteIdea = async (id: string) => {
    await supabase.from('ideas_vault').delete().eq('id', id);
    loadIdeas();
  };

  const promoteToKanban = async (idea: Idea) => {
    setPromoting(idea.id);
    // Create a todo from the idea
    await supabase.from('todos').insert({
      title: idea.title,
      description: idea.description,
      priority: idea.priority,
      status: 'backlog',
      project: null,
      tags: idea.tags,
    });
    // Update the idea status to building
    await supabase.from('ideas_vault').update({ status: 'building', updated_at: new Date().toISOString() }).eq('id', idea.id);
    setPromoting(null);
    loadIdeas();
  };

  const activeIdeas = ideas.filter(i => i.category !== 'archived');
  const archivedIdeas = ideas.filter(i => i.category === 'archived');

  const stageInfo = (status: string) => STAGES.find(s => s.key === status) || STAGES[0];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Ideas Vault</h1>
        <p style={styles.subtitle}>
          The pipeline. From spark to shipped. {!loading && `${activeIdeas.length} active, ${archivedIdeas.length} archived.`}
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
              <span style={{
                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color,
              }} />
              <span style={{ color: brand.silver, fontSize: '12px' }}>{s.label}</span>
              {i < STAGES.length - 1 && <span style={{ color: brand.smoke, fontSize: '12px' }}>&rarr;</span>}
            </span>
          ))}
          <span style={{ color: brand.smoke, fontSize: '12px' }}>&rarr;</span>
          <span style={{ color: brand.smoke, fontSize: '12px' }}>Kanban Todo</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: brand.smoke, padding: '40px' }}>Loading ideas from Supabase...</div>
        ) : (
          <>
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
                          <button onClick={() => promoteToKanban(idea)} disabled={promoting === idea.id}
                            style={{
                              background: 'none', border: `1px solid ${brand.amber}`, borderRadius: '4px',
                              padding: '2px 8px', color: brand.amber, cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                              opacity: promoting === idea.id ? 0.5 : 1,
                            }}
                            title="Promote to Kanban Todo">{promoting === idea.id ? 'Promoting...' : 'To Kanban'}</button>
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
          </>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
