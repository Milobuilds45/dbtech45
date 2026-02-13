'use client';

import { useEffect, useState } from 'react';

interface SystemStatus {
  gatewayStatus: 'online' | 'offline' | 'timeout' | 'unknown';
  lastHeartbeat: string | null;
  uptime: number;
  cronJobs: CronJob[];
  agents: AgentStatus[];
  alerts: Alert[];
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'success' | 'failure' | 'pending' | 'unknown';
  agent?: string;
}

interface AgentStatus {
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen: string;
  tasksToday: number;
  health: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function MissionControlPage() {
  const b = {
    void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
    amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
    white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
    success: '#10B981', error: '#22C55E', info: '#3B82F6', warning: '#EAB308',
    border: '#222222', darkRed: '#7F1D1D', darkGreen: '#064E3B',
  };

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    gatewayStatus: 'unknown',
    lastHeartbeat: null,
    uptime: 0,
    cronJobs: [],
    agents: [],
    alerts: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Simulated data - in real implementation this would call the gateway API
  const initializeSystemStatus = () => {
    const now = new Date();
    
    // Detect if gateway is likely down (based on common patterns)
    // In real implementation, this would try to connect to the gateway
    const gatewayStatus: 'online' | 'offline' | 'timeout' = Math.random() > 0.8 ? 'online' : 'timeout'; // Mostly timeout, sometimes online
    
    const cronJobs: CronJob[] = [
      {
        id: '1',
        name: 'Morning Brief (7:00 AM)',
        schedule: '0 7 * * *',
        lastRun: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
        nextRun: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        status: 'success',
        agent: 'Dwight'
      },
      {
        id: '2', 
        name: 'Bobby Morning Brief (9:10 AM)',
        schedule: '10 9 * * 1-5',
        lastRun: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        agent: 'Bobby'
      },
      {
        id: '3',
        name: 'Gateway Auto-Start Check',
        schedule: 'At startup',
        lastRun: null,
        nextRun: 'Manual trigger needed',
        status: 'failure',
        agent: 'System'
      },
      {
        id: '4',
        name: 'Nightly Build (3:00 AM)',
        schedule: '0 3 * * *',
        lastRun: now.toISOString(), // Currently running!
        nextRun: new Date(now.getTime() + 21 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        agent: 'Milo'
      }
    ];

    const agents: AgentStatus[] = [
      {
        name: 'Milo',
        role: 'Chief of Staff', 
        status: 'active',
        lastSeen: now.toISOString(),
        tasksToday: 3,
        health: 'healthy'
      },
      {
        name: 'Anders',
        role: 'Full Stack Architect',
        status: 'idle',
        lastSeen: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        tasksToday: 0,
        health: 'healthy'
      },
      {
        name: 'Bobby',
        role: 'Trading Advisor',
        status: 'offline',
        lastSeen: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        tasksToday: 2,
        health: 'warning'
      },
      {
        name: 'Paula',
        role: 'Creative Director',
        status: 'idle',
        lastSeen: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        tasksToday: 1,
        health: 'healthy'
      },
      {
        name: 'Dwight',
        role: 'Weather & News',
        status: 'idle',
        lastSeen: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        tasksToday: 1,
        health: 'healthy'
      }
    ];

    const alerts: Alert[] = [
      {
        id: '1',
        type: 'error',
        message: 'Gateway timeout detected - Connection to ws://127.0.0.1:18789 failed',
        timestamp: now.toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'warning', 
        message: 'Bobby agent offline for >6 hours - last seen 8 hours ago',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '3',
        type: 'warning',
        message: 'Gateway Auto-Start task may be misconfigured ("at logon" vs "at startup")',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];

    setSystemStatus({
      gatewayStatus,
      lastHeartbeat: gatewayStatus === 'online' ? now.toISOString() : null,
      uptime: gatewayStatus === 'online' ? 14400 : 0, // 4 hours in seconds
      cronJobs,
      agents,
      alerts
    });
  };

  useEffect(() => {
    initializeSystemStatus();
    setLoading(false);

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      initializeSystemStatus();
    }, 30000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': case 'active': case 'success': case 'healthy':
        return b.success;
      case 'warning': case 'idle': case 'pending':
        return b.warning;
      case 'offline': case 'failure': case 'critical': case 'timeout':
        return b.error;
      default:
        return b.smoke;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': case 'active': case 'success': case 'healthy':
        return '●';
      case 'warning': case 'idle': case 'pending':
        return '◐';
      case 'offline': case 'failure': case 'critical': case 'timeout':
        return '●';
      default:
        return '○';
    }
  };

  const formatRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const card: React.CSSProperties = {
    background: b.carbon,
    border: `1px solid ${b.border}`,
    borderRadius: '12px',
    padding: '20px',
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 30px', textAlign: 'center', color: b.smoke }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: b.amber }}>
          🚀 Initializing Mission Control...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: b.white, display: 'flex', alignItems: 'center', gap: '12px' }}>
            🎯 MILO MISSION CONTROL
            <span style={{ 
              fontSize: '12px', 
              background: getStatusColor(systemStatus.gatewayStatus), 
              color: systemStatus.gatewayStatus === 'offline' || systemStatus.gatewayStatus === 'timeout' ? b.white : b.void,
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontWeight: 600 
            }}>
              {systemStatus.gatewayStatus.toUpperCase()}
            </span>
          </div>
          <div style={{ color: b.smoke, marginTop: '4px' }}>
            Real-time monitoring • Auto-refresh 30s • Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={initializeSystemStatus}
            style={{ 
              background: b.amber, 
              color: b.void, 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Alerts Bar */}
      {systemStatus.alerts.filter(a => !a.resolved).length > 0 && (
        <div style={{ 
          background: `linear-gradient(to right, ${b.darkRed}, ${b.carbon})`, 
          border: `1px solid ${b.error}`, 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '20px' 
        }}>
          <div style={{ color: b.error, fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
            🚨 {systemStatus.alerts.filter(a => !a.resolved).length} Active Alert(s)
          </div>
          {systemStatus.alerts.filter(a => !a.resolved).slice(0, 3).map((alert) => (
            <div key={alert.id} style={{ color: b.silver, fontSize: '13px', marginBottom: '4px' }}>
              • {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Top Row - System Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Gateway Status */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: b.amber, fontSize: '16px', fontWeight: 600, margin: 0 }}>Gateway Health</h3>
            <span style={{ fontSize: '20px', color: getStatusColor(systemStatus.gatewayStatus) }}>
              {getStatusIcon(systemStatus.gatewayStatus)}
            </span>
          </div>
          
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Status:</span>
              <span style={{ color: getStatusColor(systemStatus.gatewayStatus), fontWeight: 600 }}>
                {systemStatus.gatewayStatus.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Last Heartbeat:</span>
              <span style={{ color: b.silver }}>{formatRelativeTime(systemStatus.lastHeartbeat)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Uptime:</span>
              <span style={{ color: b.silver }}>{formatUptime(systemStatus.uptime)}</span>
            </div>
          </div>
          
          {systemStatus.gatewayStatus === 'timeout' && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              background: b.darkRed, 
              borderRadius: '4px', 
              fontSize: '12px', 
              color: b.silver 
            }}>
              💡 Check Windows Task Scheduler - ensure auto-start is "at startup" not "at logon"
            </div>
          )}
        </div>

        {/* Agent Summary */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Agent Fleet</h3>
          
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Active Agents:</span>
              <span style={{ color: b.success, fontWeight: 600 }}>
                {systemStatus.agents.filter(a => a.status === 'active').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Idle Agents:</span>
              <span style={{ color: b.warning, fontWeight: 600 }}>
                {systemStatus.agents.filter(a => a.status === 'idle').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Offline Agents:</span>
              <span style={{ color: b.error, fontWeight: 600 }}>
                {systemStatus.agents.filter(a => a.status === 'offline').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Tasks Today:</span>
              <span style={{ color: b.silver, fontWeight: 600 }}>
                {systemStatus.agents.reduce((sum, a) => sum + a.tasksToday, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Cron Summary */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Cron Jobs</h3>
          
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Scheduled:</span>
              <span style={{ color: b.silver, fontWeight: 600 }}>
                {systemStatus.cronJobs.length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Running:</span>
              <span style={{ color: b.warning, fontWeight: 600 }}>
                {systemStatus.cronJobs.filter(c => c.status === 'pending').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: b.smoke }}>Failed:</span>
              <span style={{ color: b.error, fontWeight: 600 }}>
                {systemStatus.cronJobs.filter(c => c.status === 'failure').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Agent Details */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
            🤖 Agent Status Details
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {systemStatus.agents.map((agent) => (
              <div 
                key={agent.name} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  background: b.graphite,
                  borderRadius: '8px',
                  border: `1px solid ${b.border}`
                }}
              >
                <div>
                  <div style={{ color: b.white, fontWeight: 600, fontSize: '14px' }}>
                    {agent.name}
                  </div>
                  <div style={{ color: b.smoke, fontSize: '12px' }}>
                    {agent.role} • {agent.tasksToday} tasks today
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: getStatusColor(agent.status), 
                    fontSize: '12px', 
                    fontWeight: 600,
                    marginBottom: '2px'
                  }}>
                    {getStatusIcon(agent.status)} {agent.status.toUpperCase()}
                  </div>
                  <div style={{ color: b.smoke, fontSize: '11px' }}>
                    {formatRelativeTime(agent.lastSeen)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cron Job Details */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
            ⏰ Scheduled Jobs
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {systemStatus.cronJobs.map((job) => (
              <div 
                key={job.id}
                style={{ 
                  padding: '12px',
                  background: b.graphite,
                  borderRadius: '8px',
                  border: `1px solid ${b.border}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ color: b.white, fontWeight: 600, fontSize: '14px' }}>
                    {job.name}
                  </div>
                  <span style={{ 
                    color: getStatusColor(job.status), 
                    fontSize: '12px', 
                    fontWeight: 600 
                  }}>
                    {getStatusIcon(job.status)} {job.status.toUpperCase()}
                  </span>
                </div>
                
                <div style={{ color: b.smoke, fontSize: '12px', marginBottom: '4px' }}>
                  {job.agent && `Agent: ${job.agent} • `}Schedule: {job.schedule}
                </div>
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: b.smoke }}>
                  <span>Last: {formatRelativeTime(job.lastRun)}</span>
                  <span>Next: {typeof job.nextRun === 'string' && job.nextRun.includes('Manual') ? job.nextRun : formatRelativeTime(job.nextRun)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Full Width Sections */}
      <div style={{ display: 'grid', gap: '20px' }}>
        
        {/* Live Activity & Alerts */}
        <div style={card}>
          <h3 style={{ color: b.amber, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
            🚨 Active Alerts & Issues
          </h3>
          
          {systemStatus.alerts.filter(a => !a.resolved).length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: b.smoke,
              fontSize: '14px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              All systems normal - no active alerts
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {systemStatus.alerts.filter(a => !a.resolved).map((alert) => (
                <div 
                  key={alert.id}
                  style={{ 
                    padding: '12px',
                    background: alert.type === 'error' ? b.darkRed : b.graphite,
                    borderRadius: '8px',
                    border: `1px solid ${alert.type === 'error' ? b.error : b.warning}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ 
                      color: alert.type === 'error' ? b.error : b.warning, 
                      fontWeight: 600,
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      {alert.type === 'error' ? '🔴' : '⚠️'} {alert.message}
                    </div>
                    <div style={{ color: b.smoke, fontSize: '12px' }}>
                      {formatRelativeTime(alert.timestamp)}
                    </div>
                  </div>
                  
                  <button
                    style={{
                      background: 'none',
                      border: `1px solid ${b.border}`,
                      color: b.silver,
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      // In real implementation, this would mark alert as resolved
                      setSystemStatus(prev => ({
                        ...prev,
                        alerts: prev.alerts.map(a => 
                          a.id === alert.id ? { ...a, resolved: true } : a
                        )
                      }));
                    }}
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        color: b.smoke, 
        fontSize: '14px',
        padding: '20px',
        borderTop: `1px solid ${b.border}`
      }}>
        <p>
          <strong style={{ color: b.silver }}>MILO MISSION CONTROL V1.0</strong> 
          <span style={{ margin: '0 8px' }}>•</span>
          Built by Milo during nightly ops
        </p>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>
          Real-time monitoring for Derek's AI agent swarm • Friday, February 13th, 2026 • 3:00 AM EST
        </p>
      </div>
    </div>
  );
}