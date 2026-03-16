'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

interface DeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  message?: string;
}

const AGENT_TEMPLATES = [
  { name: 'Generic Assistant', emoji: '🤖', description: 'General-purpose AI assistant' },
  { name: 'Developer', emoji: '👨‍💻', description: 'Code review, deployment, technical tasks' },
  { name: 'Analyst', emoji: '📊', description: 'Data analysis, reporting, insights' },
  { name: 'Social Manager', emoji: '📱', description: 'Social media monitoring and engagement' },
  { name: 'Trader', emoji: '📈', description: 'Market analysis and trading operations' },
  { name: 'Operations', emoji: '⚙️', description: 'Business operations and workflows' },
];

export default function AgentDeployPage() {
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentEmoji, setAgentEmoji] = useState('🤖');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const handleDeploy = async () => {
    if (!agentName || !agentRole) {
      alert('Please fill in all fields');
      return;
    }

    setIsDeploying(true);
    setDeploymentComplete(false);

    const steps: DeploymentStep[] = [
      { name: 'Creating Telegram bot', status: 'pending' },
      { name: 'Generating workspace', status: 'pending' },
      { name: 'Writing SOUL.md', status: 'pending' },
      { name: 'Creating config files', status: 'pending' },
      { name: 'Registering in swarm', status: 'pending' },
      { name: 'Starting OpenClaw instance', status: 'pending' },
    ];

    setDeploymentSteps(steps);

    // Simulate deployment
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDeploymentSteps(prev => prev.map((step, idx) => {
        if (idx === i) return { ...step, status: 'running' };
        return step;
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setDeploymentSteps(prev => prev.map((step, idx) => {
        if (idx === i) return { 
          ...step, 
          status: 'complete',
          message: idx === 0 ? '@' + agentName.toLowerCase() + '_bot' : undefined
        };
        return step;
      }));
    }

    setDeploymentComplete(true);
    setIsDeploying(false);
  };

  const handleReset = () => {
    setAgentName('');
    setAgentRole('');
    setAgentEmoji('🤖');
    setSelectedTemplate(null);
    setDeploymentSteps([]);
    setDeploymentComplete(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h1 style={{ ...styles.h1, marginBottom: '1rem' }}>🚀 One-Click Agent Deploy</h1>
            <p style={{ color: brand.smoke, fontSize: '1.125rem' }}>
              Create and deploy a new AI agent to the swarm in under 60 seconds
            </p>
          </div>

          {!deploymentComplete ? (
            <>
              {/* Template Selection */}
              {!selectedTemplate && (
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.white, marginBottom: '1.5rem' }}>
                    1. Choose a Template
                  </h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {AGENT_TEMPLATES.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTemplate(idx);
                          setAgentRole(template.description);
                          setAgentEmoji(template.emoji);
                        }}
                        style={{
                          background: brand.carbon,
                          border: `2px solid ${brand.border}`,
                          borderRadius: '12px',
                          padding: '1.5rem 1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = brand.amber;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = brand.border;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{template.emoji}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: brand.white, marginBottom: '0.5rem' }}>
                          {template.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: brand.smoke }}>
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration Form */}
              {selectedTemplate !== null && !isDeploying && (
                <div style={{
                  background: brand.carbon,
                  border: `2px solid ${brand.amber}`,
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.white, marginBottom: '1.5rem' }}>
                    2. Configure Agent
                  </h2>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: brand.smoke, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g., Sally, Marcus, Zoe"
                      style={{
                        width: '100%',
                        background: brand.graphite,
                        border: `1px solid ${brand.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: brand.white,
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: brand.smoke, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Role *
                    </label>
                    <input
                      type="text"
                      value={agentRole}
                      onChange={(e) => setAgentRole(e.target.value)}
                      placeholder="e.g., Sales Manager, Research Analyst"
                      style={{
                        width: '100%',
                        background: brand.graphite,
                        border: `1px solid ${brand.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: brand.white,
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', color: brand.smoke, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={agentEmoji}
                      onChange={(e) => setAgentEmoji(e.target.value)}
                      placeholder="🤖"
                      maxLength={2}
                      style={{
                        width: '100px',
                        background: brand.graphite,
                        border: `1px solid ${brand.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: brand.white,
                        fontSize: '1.5rem',
                        textAlign: 'center',
                      }}
                    />
                  </div>

                  {/* Preview */}
                  <div style={{
                    background: brand.graphite,
                    border: `1px solid ${brand.border}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                  }}>
                    <div style={{ fontSize: '0.875rem', color: brand.smoke, marginBottom: '1rem' }}>
                      Preview
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '3rem' }}>{agentEmoji}</div>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.white }}>
                          {agentName || 'Agent Name'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: brand.smoke }}>
                          {agentRole || 'Role'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleDeploy}
                      disabled={!agentName || !agentRole}
                      style={{
                        flex: 1,
                        background: agentName && agentRole ? brand.amber : brand.smoke,
                        color: brand.void,
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: agentName && agentRole ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      🚀 Deploy Agent
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      style={{
                        background: 'none',
                        color: brand.smoke,
                        border: `1px solid ${brand.border}`,
                        padding: '1rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Deployment Progress */}
              {isDeploying && (
                <div style={{
                  background: brand.carbon,
                  border: `2px solid ${brand.amber}`,
                  borderRadius: '12px',
                  padding: '2rem',
                }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.white, marginBottom: '2rem' }}>
                    3. Deploying {agentName}...
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {deploymentSteps.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          background: brand.graphite,
                          borderRadius: '8px',
                          border: `1px solid ${
                            step.status === 'complete' ? brand.success :
                            step.status === 'running' ? brand.amber :
                            step.status === 'error' ? brand.error :
                            brand.border
                          }`,
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 
                            step.status === 'complete' ? brand.success :
                            step.status === 'running' ? brand.amber :
                            step.status === 'error' ? brand.error :
                            brand.smoke,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: brand.void,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>
                          {step.status === 'complete' ? '✓' : 
                           step.status === 'running' ? '●' :
                           step.status === 'error' ? '✗' : idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: brand.white, fontWeight: 600 }}>{step.name}</div>
                          {step.message && (
                            <div style={{ fontSize: '0.875rem', color: brand.smoke, marginTop: '0.25rem' }}>
                              {step.message}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Success State
            <div style={{
              background: brand.carbon,
              border: `2px solid ${brand.success}`,
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: brand.success, marginBottom: '1rem' }}>
                Agent Deployed!
              </h2>
              <p style={{ color: brand.smoke, fontSize: '1.125rem', marginBottom: '2rem' }}>
                {agentName} is now live and ready to work.
              </p>

              <div style={{
                background: brand.graphite,
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: brand.smoke }}>Telegram Bot</div>
                  <div style={{ fontSize: '1rem', color: brand.amber, fontWeight: 600 }}>
                    @{agentName.toLowerCase()}_bot
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: brand.smoke }}>Workspace</div>
                  <div style={{ fontSize: '1rem', color: brand.white, fontWeight: 600 }}>
                    C:\Users\derek\clawd-{agentName.toLowerCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: brand.smoke }}>Status</div>
                  <div style={{ fontSize: '1rem', color: brand.success, fontWeight: 600 }}>
                    Online
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                style={{
                  background: brand.amber,
                  color: brand.void,
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Deploy Another Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
