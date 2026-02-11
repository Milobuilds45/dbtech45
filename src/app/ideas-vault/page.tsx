'use client';
import { useState } from "react";

export default function IdeasVault() {
  const [newIdea, setNewIdea] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [ideas, setIdeas] = useState([
    {
      hash: "a1b2c3d",
      title: "Voice Trading Journal",
      description: "AI voice assistant that listens to trades and automatically journals them. Just speak your entries/exits and it logs everything.",
      stage: "spark",
      priority: "High",
      date: "Feb 8"
    },
    {
      hash: "e4f5g6h",
      title: "Family Task Coordinator", 
      description: "AI that automatically assigns and tracks household tasks across 9 family members. Smart scheduling based on availability and preferences.",
      stage: "building",
      priority: "High", 
      date: "Feb 5"
    },
    {
      hash: "i7j8k9l",
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
        hash: newHash,
        title: newIdea,
        description: newDescription,
        stage: "spark",
        priority: "Medium",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }]);
      setNewIdea('');
      setNewDescription('');
    }
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'building': return '#f59e0b';
      case 'spark': return '#22c55e';
      case 'shipped': return '#3b82f6';
      default: return '#999';
    }
  };

  const getStageLabel = (stage: string) => {
    switch(stage) {
      case 'building': return '● Building';
      case 'spark': return '○ Spark';
      case 'shipped': return '✅ Shipped';
      default: return stage;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#00ff00', padding: '2rem' }}>
      <div className="terminal" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'monospace' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: '#666' }}>derek@dbtech45:~$ </span>
          <span>git log --oneline --graph ideas/</span>
        </div>
        
        <h1 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>💡 Ideas Vault</h1>
        <p style={{ color: '#999', marginBottom: '2rem' }}>The pipeline. From spark to shipped — everything passes through here.</p>
        
        {/* Add New Idea */}
        <div style={{ backgroundColor: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #333' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>+ Add New Idea</h3>
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
            Commit Idea →
          </button>
        </div>

        {/* Ideas by Stage */}
        <div style={{ marginBottom: '2rem' }}>
          {['building', 'spark', 'shipped'].map(stage => {
            const stageIdeas = ideas.filter(idea => idea.stage === stage);
            if (stageIdeas.length === 0) return null;
            
            return (
              <div key={stage} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  color: getStageColor(stage), 
                  marginBottom: '1rem',
                  textTransform: 'capitalize'
                }}>
                  {getStageLabel(stage)}
                </h3>
                {stageIdeas.map((idea, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#111', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    border: '1px solid #333'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ color: '#666', marginRight: '1rem', fontSize: '14px' }}>{idea.hash}</span>
                      <h4 style={{ color: '#00ff00', margin: 0, flex: 1 }}>{idea.title}</h4>
                      <span style={{ 
                        color: getStageColor(idea.stage), 
                        fontSize: '12px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {idea.priority}
                      </span>
                    </div>
                    <p style={{ color: '#999', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                      {idea.description}
                    </p>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {idea.date} • {getStageLabel(idea.stage)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={{ color: '#666', textDecoration: 'none' }}>← Back to OS Command Center</a>
        </div>
      </div>
    </div>
  );
}