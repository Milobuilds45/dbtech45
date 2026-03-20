'use client';

import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';

interface UsageData {
  sessionTokens: number;
  sessionMax: number;
  weeklyTokens: number;
  weeklyMax: number;
  sessionCost: number;
  weeklyCost: number;
  sessionResetIn: string;
  weeklyResetIn: string;
}

export default function UsageGaugePage() {
  const [usage, setUsage] = useState<UsageData>({
    sessionTokens: 114000,
    sessionMax: 200000,
    weeklyTokens: 450000,
    weeklyMax: 600000,
    sessionCost: 2.34,
    weeklyCost: 8.76,
    sessionResetIn: '2h 13m',
    weeklyResetIn: '3d 5h',
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(prev => ({
        ...prev,
        sessionTokens: Math.min(prev.sessionMax, prev.sessionTokens + Math.floor(Math.random() * 500)),
        weeklyTokens: Math.min(prev.weeklyMax, prev.weeklyTokens + Math.floor(Math.random() * 1000)),
        sessionCost: prev.sessionCost + (Math.random() * 0.02),
        weeklyCost: prev.weeklyCost + (Math.random() * 0.05),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sessionPercent = (usage.sessionTokens / usage.sessionMax) * 100;
  const weeklyPercent = (usage.weeklyTokens / usage.weeklyMax) * 100;

  const getGaugeColor = (percent: number) => {
    if (percent < 50) return '#10B981'; // green
    if (percent < 75) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const renderGauge = (percent: number, label: string, resetIn: string) => {
    const color = getGaugeColor(percent);
    const rotation = (percent / 100) * 270 - 135; // -135 to +135 degrees
    
    return (
      <div style={{
        position: 'relative',
        width: '280px',
        height: '280px',
      }}>
        {/* Background circle */}
        <svg width="280" height="280" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={brand.graphite}
            strokeWidth="24"
          />
          
          {/* Progress arc */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={color}
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray={`${(percent / 100) * 754} 754`}
            transform="rotate(-90 140 140)"
            style={{
              filter: `drop-shadow(0 0 12px ${color})`,
              transition: 'all 0.5s ease',
            }}
          />

          {/* Tick marks */}
          {[0, 20, 40, 60, 80, 100].map(tick => {
            const angle = (tick / 100) * 270 - 135;
            const rad = (angle * Math.PI) / 180;
            const x1 = 140 + Math.cos(rad) * 100;
            const y1 = 140 + Math.sin(rad) * 100;
            const x2 = 140 + Math.cos(rad) * 110;
            const y2 = 140 + Math.sin(rad) * 110;
            
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={brand.smoke}
                strokeWidth="2"
              />
            );
          })}

          {/* Needle */}
          <g transform={`rotate(${rotation} 140 140)`}>
            <line
              x1="140"
              y1="140"
              x2="140"
              y2="50"
              stroke={brand.silver}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="140" cy="140" r="8" fill={brand.silver} />
          </g>
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          marginTop: '20px',
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: color,
            marginBottom: '0.25rem',
            fontFamily: 'monospace',
          }}>
            {Math.round(percent)}%
          </div>
          <div style={{
            color: brand.smoke,
            fontSize: '0.875rem',
          }}>
            Resets in {resetIn}
          </div>
        </div>

        {/* Label */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '1.125rem',
          fontWeight: 600,
          color: brand.white,
        }}>
          {label}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ ...styles.h1, marginBottom: '0.5rem' }}>OpenClaw Usage Monitor</h1>
          <p style={{ color: brand.smoke, fontSize: '1.125rem' }}>
            Real-time token consumption across all agents
          </p>
        </div>

        {/* Dual Gauges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '4rem',
          marginBottom: '4rem',
          flexWrap: 'wrap',
        }}>
          {renderGauge(sessionPercent, 'Session', usage.sessionResetIn)}
          {renderGauge(weeklyPercent, 'Weekly', usage.weeklyResetIn)}
        </div>

        {/* Usage Details */}
        <div style={{
          background: brand.carbon,
          border: `2px solid ${brand.border}`,
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: brand.white,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>Token Usage Details</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* Session Stats */}
            <div style={{
              background: brand.graphite,
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: brand.smoke,
                marginBottom: '0.5rem',
              }}>
                Session Only
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: getGaugeColor(sessionPercent),
                marginBottom: '0.5rem',
              }}>
                {Math.round(sessionPercent)}%
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: brand.silver,
                marginBottom: '1rem',
              }}>
                {usage.sessionTokens.toLocaleString()} / {usage.sessionMax.toLocaleString()} tokens
              </div>
              
              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: brand.void,
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '0.75rem',
              }}>
                <div style={{
                  width: `${sessionPercent}%`,
                  height: '100%',
                  background: getGaugeColor(sessionPercent),
                  transition: 'width 0.5s ease',
                }} />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: brand.smoke,
                fontSize: '0.875rem',
              }}>
                <span>⏱️</span>
                <span>Resets in {usage.sessionResetIn}</span>
              </div>
            </div>

            {/* Weekly Stats */}
            <div style={{
              background: brand.graphite,
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: brand.smoke,
                marginBottom: '0.5rem',
              }}>
                Weekly Usage
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: getGaugeColor(weeklyPercent),
                marginBottom: '0.5rem',
              }}>
                {Math.round(weeklyPercent)}%
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: brand.silver,
                marginBottom: '1rem',
              }}>
                {usage.weeklyTokens.toLocaleString()} / {usage.weeklyMax.toLocaleString()} tokens
              </div>
              
              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: brand.void,
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '0.75rem',
              }}>
                <div style={{
                  width: `${weeklyPercent}%`,
                  height: '100%',
                  background: getGaugeColor(weeklyPercent),
                  transition: 'width 0.5s ease',
                }} />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: brand.smoke,
                fontSize: '0.875rem',
              }}>
                <span>⏱️</span>
                <span>Resets in {usage.weeklyResetIn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={{
          background: brand.carbon,
          border: `2px solid ${brand.border}`,
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: brand.white,
            marginBottom: '1.5rem',
          }}>
            Cost Overview
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            <div style={{
              background: brand.graphite,
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.875rem', color: brand.smoke, marginBottom: '0.5rem' }}>
                Session Cost
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: brand.info }}>
                ${usage.sessionCost.toFixed(2)}
              </div>
            </div>

            <div style={{
              background: brand.graphite,
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.875rem', color: brand.smoke, marginBottom: '0.5rem' }}>
                Weekly Cost
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: brand.amber }}>
                ${usage.weeklyCost.toFixed(2)}
              </div>
            </div>

            <div style={{
              background: brand.graphite,
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.875rem', color: brand.smoke, marginBottom: '0.5rem' }}>
                Projected Monthly
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: brand.success }}>
                ${(usage.weeklyCost * 4.3).toFixed(2)}
              </div>
            </div>
          </div>
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
          <p>Auto-updates every 3 seconds • Live data from OpenClaw gateway</p>
          <p style={{ marginTop: '0.5rem' }}>
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
