'use client';

import React from 'react';

interface GaugeProps {
  label: string;
  value: number;        // current value
  max: number;          // max value for the gauge
  unit?: string;        // e.g., 'tokens', '$'
  color?: string;       // needle/accent color
  size?: number;        // width/height in px
  formatValue?: (v: number) => string;
  subLabel?: string;    // small text under the value
}

export function UsageGauge({
  label,
  value,
  max,
  unit = '',
  color = '#F59E0B',
  size = 160,
  formatValue,
  subLabel,
}: GaugeProps) {
  const pct = Math.min(value / max, 1);
  // Gauge arc: from -135° to +135° (270° total sweep)
  const startAngle = -135;
  const endAngle = 135;
  const sweep = endAngle - startAngle;
  const needleAngle = startAngle + pct * sweep;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38; // radius of the arc
  const strokeW = size * 0.06;

  // Convert degrees to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Arc path helper
  const arcPath = (startDeg: number, endDeg: number, radius: number) => {
    const s = toRad(startDeg - 90); // SVG rotates 90° from math convention
    const e = toRad(endDeg - 90);
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Needle endpoint
  const needleLen = r * 0.85;
  const needleRad = toRad(needleAngle - 90);
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  // Display value
  const displayValue = formatValue ? formatValue(value) : (
    value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` :
    value >= 1_000 ? `${(value / 1_000).toFixed(0)}K` :
    value.toFixed(value < 10 ? 2 : 0)
  );

  // Tick marks
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  // Warning color zones
  const getArcColor = (segment: number) => {
    if (segment < 0.6) return '#1A1A1D';
    if (segment < 0.8) return '#422006';
    return '#7F1D1D';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Background arc segments for color zones */}
        {[0, 0.2, 0.4, 0.6, 0.8].map((seg, i) => {
          const segEnd = Math.min(seg + 0.2, 1);
          const segStartAngle = startAngle + seg * sweep;
          const segEndAngle = startAngle + segEnd * sweep;
          return (
            <path
              key={i}
              d={arcPath(segStartAngle, segEndAngle, r)}
              fill="none"
              stroke={getArcColor(seg)}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          );
        })}

        {/* Active arc (filled portion) */}
        {pct > 0.005 && (
          <path
            d={arcPath(startAngle, startAngle + pct * sweep, r)}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
          />
        )}

        {/* Tick marks */}
        {ticks.map((t, i) => {
          const tickAngle = toRad(startAngle + t * sweep - 90);
          const inner = r - strokeW * 0.8;
          const outer = r + strokeW * 0.8;
          return (
            <line
              key={i}
              x1={cx + inner * Math.cos(tickAngle)}
              y1={cy + inner * Math.sin(tickAngle)}
              x2={cx + outer * Math.cos(tickAngle)}
              y2={cy + outer * Math.sin(tickAngle)}
              stroke="#3f3f46"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}60)`, transition: 'all 0.8s ease-out' }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={color} />

        {/* Value display */}
        <text
          x={cx}
          y={cy + r * 0.35}
          textAnchor="middle"
          fill="#fff"
          fontSize={size * 0.12}
          fontWeight={700}
          fontFamily="'JetBrains Mono', monospace"
        >
          {unit === '$' ? '$' : ''}{displayValue}{unit && unit !== '$' ? ` ${unit}` : ''}
        </text>

        {subLabel && (
          <text
            x={cx}
            y={cy + r * 0.55}
            textAnchor="middle"
            fill="#71717a"
            fontSize={size * 0.065}
            fontFamily="Inter, sans-serif"
          >
            {subLabel}
          </text>
        )}
      </svg>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#a1a1aa',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </span>
    </div>
  );
}
