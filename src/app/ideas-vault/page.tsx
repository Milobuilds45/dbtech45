'use client';
import { useState } from "react";

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
      const newHash = Math.random().toString(36).substring(2, 9);
      setIdeas([...ideas, {
        id: newHash,
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'building': return '#f59e0b';
      case 'spark': return '#22c55e';
      case 'shipped': return '#3b82f6';
      default: return '#999';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'building': return 'Building';
      case 'spark': return 'Spark';
      case 'shipped': return 'Shipped';
      default: return stage;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#e2e8f0', padding: '2rem', fontFamily: "'Inter', monospace" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '0.5rem' }}>Ideas Vault</h1>
          <p style={{ color: '#999' }}>The pipeline. From spark to shipped — everything passes through here.</p>
        </div>

        {/* Add New Idea */}
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #333' }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '1rem', fontSize: '16px' }}>New Idea</h3>
          <input
            type="text"
            placeholder="What's the idea?"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#00ff00',
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}
          />
          <textarea
            placeholder="Expand on it..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#00ff00',
              fontFamily: 'monospace',
              height: '80px',
              resize: 'none',
              marginBottom: '1rem'
            }}
          />
          <button
            onClick={addIdea}
            style={{
              backgroundColor: '#00ff00',
              color: '#000',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Commit Idea
          </button>
        </div>

        {/* Ideas Grid — tiles side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {ideas.map((idea) => (
            <div key={idea.id} style={{
              backgroundColor: '#111',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#00ff00', margin: 0, fontSize: '16px' }}>{idea.title}</h4>
                  <span style={{
                    color: getStageColor(idea.stage),
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontWeight: 500
                  }}>
                    {getStageLabel(idea.stage)}
                  </span>
                </div>
                <p style={{ color: '#999', lineHeight: '1.5', fontSize: '14px', marginBottom: '1rem' }}>
                  {idea.description}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', borderTop: '1px solid #222', paddingTop: '0.75rem' }}>
                <span>{idea.date}</span>
                <span style={{ color: getStageColor(idea.stage) }}>{idea.priority}</span>
                <span style={{ color: '#555' }}>{idea.id}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}
