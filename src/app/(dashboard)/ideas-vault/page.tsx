'use client';
import { useState, useEffect } from "react";
import { brand, styles } from "@/lib/brand";
import { supabase, type Idea } from "@/lib/supabase";

export default function IdeasVault() {
  const [newIdea, setNewIdea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIdeas = async () => {
    const { data } = await supabase.from('ideas_vault').select('*').order('created_at', { ascending: false });
    if (data) setIdeas(data);
    setLoading(false);
  };

  useEffect(() => { loadIdeas(); }, []);

  const addIdea = async () => {
    if (!newIdea.trim()) return;
    const { error } = await supabase.from('ideas_vault').insert({
      title: newIdea.trim(),
      description: newDescription.trim() || null,
      status: 'spark',
      priority: 'medium',
    });
    if (!error) {
      setNewIdea('');
      setNewDescription('');
      loadIdeas();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ideas_vault').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    loadIdeas();
  };

  const deleteIdea = async (id: string) => {
    await supabase.from('ideas_vault').delete().eq('id', id);
    loadIdeas();
  };

  const stageColor = (s: string) => s === 'building' ? brand.warning : s === 'shipped' ? brand.info : s === 'shaping' ? '#A855F7' : brand.success;
  const stageLabel = (s: string) => s === 'building' ? 'Building' : s === 'shipped' ? 'Shipped' : s === 'shaping' ? 'Shaping' : 'Spark';
  const stages = ['spark', 'shaping', 'building', 'shipped'];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Ideas Vault</h1>
        <p style={styles.subtitle}>The pipeline. From spark to shipped. {!loading && `${ideas.length} ideas tracked.`}</p>

        <div style={{ ...styles.card, marginBottom: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>New Idea</h3>
          <input type="text" placeholder="What's the idea?" value={newIdea} onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIdea()}
            style={{ ...styles.input, marginBottom: '1rem' }} />
          <textarea placeholder="Expand on it..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
            style={{ ...styles.input, height: '80px', resize: 'none', marginBottom: '1rem' }} />
          <button onClick={addIdea} style={styles.button} disabled={!newIdea.trim()}>Commit Idea</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: brand.smoke, padding: '40px' }}>Loading ideas from Supabase...</div>
        ) : (
          <div style={styles.grid}>
            {ideas.map((idea) => (
              <div key={idea.id} style={{ ...styles.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: brand.white, margin: 0, fontSize: '16px' }}>{idea.title}</h4>
                    <span style={styles.badge(stageColor(idea.status))}>{stageLabel(idea.status)}</span>
                  </div>
                  <p style={{ color: brand.silver, lineHeight: '1.5', fontSize: '14px', marginBottom: '1rem' }}>
                    {idea.description || 'No description yet.'}
                  </p>
                </div>
                <div style={{ borderTop: `1px solid ${brand.border}`, paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {stages.map(s => (
                      <button key={s} onClick={() => updateStatus(idea.id, s)}
                        style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                          cursor: 'pointer', textTransform: 'uppercase',
                          border: idea.status === s ? 'none' : `1px solid ${brand.border}`,
                          background: idea.status === s ? stageColor(s) : 'transparent',
                          color: idea.status === s ? brand.void : brand.smoke,
                        }}>{s}</button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => deleteIdea(idea.id)}
                      style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: '12px', opacity: 0.5 }}
                      title="Delete idea">x</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.smoke }}>
                    <span>{new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span style={{ color: stageColor(idea.status) }}>{idea.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
