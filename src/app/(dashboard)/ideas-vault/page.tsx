'use client';
import { useState } from "react";
import { brand, styles } from "@/lib/brand";

interface Idea {
  id: string;
  title: string;
  description: string;
  stage: 'building' | 'spark' | 'shipped';
  priority: string;
  date: string;
}

export default function IdeasVault() {
  const [newIdea, setNewIdea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: "a1b2c3d",
      title: "Voice Trading Journal",
      description: "AI voice assistant that listens to trades and automatically journals them. Just speak your entries/exits and it logs everything.",
      stage: "spark",
      priority: "High",
      date: "Feb 8"
    },
    {
      id: "e4f5g6h",
      title: "Family Task Coordinator",
      description: "AI that automatically assigns and tracks household tasks across 9 family members. Smart scheduling based on availability and preferences.",
      stage: "building",
      priority: "High",
      date: "Feb 5"
    },
    {
      id: "i7j8k9l",
      title: "Receipt Text Extractor",
      description: "Snap photo of receipt, automatically extract line items and categorize expenses. Perfect for restaurant cost tracking.",
      stage: "shipped",
      priority: "Medium",
      date: "Jan 28"
    }
  ]);

  const addIdea = () => {
    if (newIdea.trim()) {
      setIdeas([...ideas, {
        id: Math.random().toString(36).substring(2, 9),
        title: newIdea,
        description: newDescription || 'No description yet.',
        stage: "spark",
        priority: "Medium",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }]);
      setNewIdea('');
      setNewDescription('');
    }
  };

  const stageColor = (s: string) => s === 'building' ? brand.warning : s === 'shipped' ? brand.info : brand.success;
  const stageLabel = (s: string) => s === 'building' ? 'Building' : s === 'shipped' ? 'Shipped' : 'Spark';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Ideas Vault</h1>
        <p style={styles.subtitle}>The pipeline. From spark to shipped.</p>

        <div style={{ ...styles.card, marginBottom: '2rem' }}>
          <h3 style={{ color: brand.white, marginBottom: '1rem', fontSize: '16px' }}>New Idea</h3>
          <input type="text" placeholder="What's the idea?" value={newIdea} onChange={(e) => setNewIdea(e.target.value)}
            style={{ ...styles.input, marginBottom: '1rem' }} />
          <textarea placeholder="Expand on it..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
            style={{ ...styles.input, height: '80px', resize: 'none', marginBottom: '1rem' }} />
          <button onClick={addIdea} style={styles.button}>Commit Idea</button>
        </div>

        <div style={styles.grid}>
          {ideas.map((idea) => (
            <div key={idea.id} style={{ ...styles.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: brand.white, margin: 0, fontSize: '16px' }}>{idea.title}</h4>
                  <span style={styles.badge(stageColor(idea.stage))}>{stageLabel(idea.stage)}</span>
                </div>
                <p style={{ color: brand.silver, lineHeight: '1.5', fontSize: '14px', marginBottom: '1rem' }}>{idea.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: brand.smoke, borderTop: `1px solid ${brand.border}`, paddingTop: '0.75rem' }}>
                <span>{idea.date}</span>
                <span style={{ color: stageColor(idea.stage) }}>{idea.priority}</span>
                <span>{idea.id}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
