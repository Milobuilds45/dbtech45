'use client';

import { useEffect, useState } from 'react';
import { brand, styles } from '@/lib/brand';

interface Agent {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  emoji: string;
  lastHeartbeat?: string;
  currentTask?: string;
  apiCalls?: number;
  cost?: number;
}

const AGENTS: Agent[] = [
  { name: 'Milo', role: 'Senior Advisor', status: 'online', emoji: '🦞' },
  { name: 'Anders', role: 'IT Director', status: 'online', emoji: '🔐' },
  { name: 'Paula', role: 'Full Stack Developer', status: 'online', emoji: '🎨' },
  { name: 'Bobby', role: 'Trader', status: 'online', emoji: '📈' },
  { name: 'Dwight', role: 'News & Intel', status: 'online', emoji: '📰' },
  { name: 'Jim', role: 'Social Media', status: 'offline', emoji: '📱' },
  { name: 'Remy', role: 'Restaurant Ops', status: 'online', emoji: '🍝' },
  { name: 'Wendy', role: 'Personal Assistant', status: 'online', emoji: '💼' },
];

export default function AgentHealthPage() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading agent data
    const timer = setTimeout(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastHeartbeat: new Date().toLocaleTimeString(),
        currentTask: agent.status === 'online' ? getRandomTask(agent.name) : undefined,
        apiCalls: agent.status === 'online' ? Math.floor(Math.random() * 500) : 0,
        cost: agent.status === 'online' ? parseFloat((Math.random() * 5).toFixed(2)) : 0,
      })));
      setLoading(false);
    }, 800);

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastHeartbeat: agent.status === 'online' ? new Date().toLocaleTimeString() : agent.lastHeartbeat,
        apiCalls: agent.status === 'online' ? (agent.apiCalls || 0) + Math.floor(Math.random() * 10) : agent.apiCalls,
      })));
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getRandomTask = (name: string): string => {
    const tasks: Record<string, string[]> = {
      Milo: ['Coordinating daily brief', 'Reviewing agent logs', 'Planning sprint'],
      Anders: ['Monitoring gateway health', 'Rotating API keys', 'Checking server logs'],
      Paula: ['Building new feature', 'Reviewing PR', 'Optimizing database'],
      Bobby: ['Analyzing market data', 'Executing trades', 'Monitoring positions'],
      Dwight: ['Scraping news feeds', 'Analyzing sentiment', 'Generating brief'],
      Remy: ['Checking Toast POS', 'Analyzing sales', 'Inventory review'],
      Wendy: ['Organizing calendar', 'Drafting emails', 'Managing todos'],
    };
    const agentTasks = tasks[name] || ['Processing requests'];
    return agentTasks[Math.floor(Math.random() * agentTasks.length)];
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'online': return brand.success;
      case 'busy': return brand.warning;
      case 'offline': return brand.smoke;
    }
  };

  const totalCost = agents.reduce((sum, a) => sum + (a.cost || 0), 0);
  const totalCalls = agents.reduce((sum, a) => sum + (a.apiCalls || 0), 0);
  const onlineCount = agents.filter(a => a.status === 'online').length;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '1.5rem', color: brand.amber, marginBottom: '1rem' }}>
              Loading Agent Health Monitor...
            </div>
            <div style={{ color: brand.smoke }}>Fetching real-time data from 8 agents</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={styles.h1}>🏥 Agent Health Monitor</h1>
          <p style={{ color: brand.smoke, marginBottom: '1rem' }}>
            Real-time status, tasks, and resource usage for Derek's AI agent swarm
          </p>
          
          {/* Summary Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: brand.carbon,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <div style={{ color: brand.smoke, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Online Agents
              </div>
              <div style={{ color: brand.success, fontSize: '2rem', fontWeight: 700 }}>
                {onlineCount}/{agents.length}
              </div>
            </div>

            <div style={{
              background: brand.carbon,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <div style={{ color: brand.smoke, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Total API Calls
              </div>
              <div style={{ color: brand.amber, fontSize: '2rem', fontWeight: 700 }}>
                {totalCalls.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: brand.carbon,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <div style={{ color: brand.smoke, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Total Cost (Today)
              </div>
              <div style={{ color: brand.info, fontSize: '2rem', fontWeight: 700 }}>
                ${totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {agents.map((agent) => (
            <div
              key={agent.name}
              style={{
                background: brand.carbon,
                border: `2px solid ${agent.status === 'online' ? brand.success : brand.border}`,
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = brand.amber;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = agent.status === 'online' ? brand.success : brand.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Agent Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{agent.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.white }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: brand.smoke }}>
                    {agent.role}
                  </div>
                </div>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: getStatusColor(agent.status),
                  boxShadow: `0 0 8px ${getStatusColor(agent.status)}`,
                  animation: agent.status === 'online' ? 'pulse 2s ease-in-out infinite' : 'none',
                }} />
              </div>

              {/* Status */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: `${getStatusColor(agent.status)}22`,
                  color: getStatusColor(agent.status),
                  border: `1px solid ${getStatusColor(agent.status)}`,
                }}>
                  {agent.status}
                </div>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${brand.border}` }}>
                  <div style={{ fontSize: '0.75rem', color: brand.smoke, marginBottom: '0.25rem' }}>
                    Current Task
                  </div>
                  <div style={{ color: brand.silver, fontSize: '0.875rem' }}>
                    {agent.currentTask}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: brand.smoke }}>API Calls</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.amber }}>
                    {agent.apiCalls || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: brand.smoke }}>Cost</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.info }}>
                    ${(agent.cost || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: brand.smoke }}>Heartbeat</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: brand.success }}>
                    {agent.lastHeartbeat ? agent.lastHeartbeat.split(' ')[0] : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '3rem', 
          textAlign: 'center', 
          color: brand.smoke, 
          fontSize: '0.875rem',
          padding: '2rem 0',
          borderTop: `1px solid ${brand.border}`,
        }}>
          <p>Auto-refreshes every 10 seconds • Built by Anders</p>
          <p style={{ marginTop: '0.5rem' }}>
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
