'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';
// supabase imported for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { supabase } from '@/lib/supabase';
import {
  ChevronRight, ChevronLeft, Download, Mail,
  Target, TrendingUp, DollarSign, Megaphone,
  Settings, BarChart3, Shield, Dna, X, Calendar, ExternalLink,
  Briefcase, ArrowRight, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import {
  LAYERS, layerScore, layerDone, overallScore, overallPct,
  scoreColor, scoreLabel, overallLabel, layerRec, layerAction,
  generatePDF, scoreFromCheckboxes, getLayerStrengthsWeaknesses,
  getPriorityActions,
  BUSINESS_TYPES, BUSINESS_STAGES, TEAM_SIZES, PRIMARY_GOALS,
  type Answers, type CheckboxSelections, type BusinessContext,
} from './_helpers';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ICONS: Record<string, React.ReactNode> = {
  Target: <Target size={20} />, TrendingUp: <TrendingUp size={20} />,
  DollarSign: <DollarSign size={20} />, Megaphone: <Megaphone size={20} />,
  Settings: <Settings size={20} />, BarChart3: <BarChart3 size={20} />,
  Shield: <Shield size={20} />,
};

/* ═══════════════════════════════════════════════════════
   Shared Sub-components
   ═══════════════════════════════════════════════════════ */

function ScoreSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = [
    '', 'Very Low', 'Low', 'Below Avg', 'Average', 'Moderate',
    'Good', 'Strong', 'Very Strong', 'Excellent', 'World Class',
  ];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: brand.smoke, fontSize: '13px' }}>Score</span>
        <span
          style={{
            color: value > 0 ? scoreColor(value) : brand.smoke,
            fontSize: '14px', fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            transition: 'color 0.3s',
          }}
        >
          {value > 0 ? `${value}/10 — ${labels[value]}` : 'Select a score'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: '36px', borderRadius: '6px', cursor: 'pointer',
              border: value === n ? `2px solid ${brand.amber}` : '1px solid #27272A',
              background: value === n ? 'rgba(245,158,11,0.15)' : '#18181B',
              color: value === n ? brand.amber : brand.smoke,
              fontSize: '13px', fontWeight: value === n ? 700 : 400,
              fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.15s',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const [anim, setAnim] = useState(0);
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const go = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / 1200, 1);
      setAnim(score * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(go);
    };
    frame = requestAnimationFrame(go);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272A" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (anim / 10) * c}
          style={{ transition: 'stroke 0.5s' }}
        />
        <text
          x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={color}
          style={{
            fontSize: size * 0.28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        >
          {anim.toFixed(1)}
        </text>
      </svg>
      {label && <span style={{ color: brand.silver, fontSize: '13px', fontWeight: 500 }}>{label}</span>}
    </div>
  );
}

function EmailModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (e: string) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const go = () => {
    if (!val || !val.includes('@') || !val.includes('.')) {
      setErr('Please enter a valid email');
      return;
    }
    onSubmit(val);
  };
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#111111', borderRadius: '12px',
          border: `1px solid ${brand.border}`, padding: '40px',
          maxWidth: '460px', width: '90%', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: 'rgba(245,158,11,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}
          >
            <Mail size={28} color={brand.amber} />
          </div>
          <h2 style={{ color: brand.white, fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            Your DNA Report is Ready
          </h2>
          <p style={{ color: brand.silver, fontSize: '14px', lineHeight: 1.6 }}>
            Enter your email to unlock your full Business DNA Analysis — including personalized
            recommendations and a downloadable PDF report.
          </p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="you@company.com"
            style={{
              width: '100%', padding: '14px 16px', background: '#18181B',
              border: `1px solid ${err ? '#EF4444' : '#27272A'}`, borderRadius: '8px',
              color: brand.white, fontSize: '15px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {err && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px' }}>{err}</p>}
        </div>
        <button
          onClick={go}
          style={{
            width: '100%', padding: '14px', background: brand.amber,
            color: brand.void, border: 'none', borderRadius: '8px',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Unlock My DNA Report
        </button>
        <p style={{ color: brand.smoke, fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
          No spam. Your data stays private.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Step 0: Business Context Gathering
   ═══════════════════════════════════════════════════════ */

function ContextStep({
  ctx,
  onChange,
  onContinue,
}: {
  ctx: BusinessContext;
  onChange: (c: BusinessContext) => void;
  onContinue: () => void;
}) {
  const update = (patch: Partial<BusinessContext>) => onChange({ ...ctx, ...patch });

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: '#18181B',
    border: '1px solid #27272A', borderRadius: '8px', color: brand.white,
    fontSize: '14px', outline: 'none', appearance: 'none',
    WebkitAppearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  const labelStyle: React.CSSProperties = {
    color: brand.silver, fontSize: '13px', fontWeight: 600,
    marginBottom: '6px', display: 'block',
  };

  return (
    <div
      style={{
        background: '#111111', borderRadius: '12px',
        border: '1px solid #27272A', padding: '32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div
          style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: brand.amber,
          }}
        >
          <Briefcase size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: brand.white }}>
            Business Context
          </h2>
          <p style={{ color: brand.smoke, fontSize: '13px', margin: '2px 0 0' }}>
            Tell us about your business so we can personalize your analysis
          </p>
        </div>
      </div>

      {/* Option A: Business Summary */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #1E1E1E',
          }}
        >
          <span style={{ color: brand.amber, fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            OPTION A
          </span>
          <span style={{ color: brand.silver, fontSize: '13px' }}>
            Describe your business in 2-3 sentences
          </span>
        </div>
        <textarea
          value={ctx.description || ''}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="We help small businesses automate their invoicing through a SaaS platform. We're currently pre-revenue with a working MVP and 50 beta users..."
          rows={3}
          style={{
            width: '100%', padding: '14px 16px', background: '#18181B',
            border: '1px solid #27272A', borderRadius: '8px', color: brand.white,
            fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
            fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
          }}
        />
      </div>

      {/* Option B: Quick Select */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #1E1E1E',
          }}
        >
          <span style={{ color: brand.amber, fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            OPTION B
          </span>
          <span style={{ color: brand.silver, fontSize: '13px' }}>
            Quick select your business profile
          </span>
        </div>
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label style={labelStyle}>Business Type</label>
            <select
              value={ctx.type || ''}
              onChange={(e) => update({ type: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Stage</label>
            <select
              value={ctx.stage || ''}
              onChange={(e) => update({ stage: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">Select stage...</option>
              {BUSINESS_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Team Size</label>
            <select
              value={ctx.teamSize || ''}
              onChange={(e) => update({ teamSize: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">Select size...</option>
              {TEAM_SIZES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Primary Goal</label>
            <select
              value={ctx.goal || ''}
              onChange={(e) => update({ goal: e.target.value || undefined })}
              style={selectStyle}
            >
              <option value="">Select goal...</option>
              {PRIMARY_GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '14px 28px', background: brand.amber, color: brand.void,
          border: 'none', borderRadius: '8px', fontSize: '15px',
          fontWeight: 700, cursor: 'pointer', marginLeft: 'auto',
        }}
      >
        Continue to Assessment <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Checkbox Self-Assessment Component
   ═══════════════════════════════════════════════════════ */

function CheckboxAssessment({
  questionId,
  checkboxes,
  checks,
  onToggle,
}: {
  questionId: string;
  checkboxes: { id: string; label: string }[];
  checks: Record<string, boolean>;
  onToggle: (checkboxId: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
      <span style={{ color: brand.smoke, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Self-assessment (select all that apply)
      </span>
      {checkboxes.map((cb) => {
        const isChecked = checks[cb.id] || false;
        return (
          <button
            key={cb.id}
            onClick={() => onToggle(cb.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', background: isChecked ? 'rgba(245,158,11,0.08)' : '#18181B',
              border: isChecked ? `1px solid ${brand.amber}40` : '1px solid #27272A',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div
              style={{
                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                border: isChecked ? `2px solid ${brand.amber}` : '2px solid #3F3F46',
                background: isChecked ? brand.amber : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {isChecked && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              style={{
                color: isChecked ? brand.white : brand.silver,
                fontSize: '13px', lineHeight: 1.4,
              }}
            >
              {cb.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Results View — Enhanced
   ═══════════════════════════════════════════════════════ */

function ResultsView({
  answers,
  email,
  ctx,
  checks,
  onBack,
  onReset,
}: {
  answers: Answers;
  email: string;
  ctx: BusinessContext;
  checks: CheckboxSelections;
  onBack: () => void;
  onReset: () => void;
}) {
  const chartRef = useRef<ChartJS<'radar'> | null>(null);
  const os = overallScore(answers);
  const op = overallPct(answers);
  const priorities = getPriorityActions(answers);

  const radarData = {
    labels: LAYERS.map((l) => l.shortName),
    datasets: [
      {
        label: 'Business DNA Score',
        data: LAYERS.map((l) => layerScore(l.id, answers)),
        backgroundColor: 'rgba(245,158,11,0.15)',
        borderColor: '#F59E0B',
        borderWidth: 2,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#FCD34D',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const radarOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111111',
        titleColor: '#FAFAFA',
        bodyColor: '#A1A1AA',
        borderColor: '#27272A',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        beginAtZero: true,
        ticks: {
          stepSize: 2,
          color: '#71717A',
          backdropColor: 'transparent',
          font: { size: 11, family: "'JetBrains Mono', monospace" },
        },
        grid: { color: 'rgba(39,39,42,0.6)' },
        angleLines: { color: 'rgba(39,39,42,0.6)' },
        pointLabels: {
          color: '#A1A1AA',
          font: { size: 13, weight: 600 as const, family: "'Inter', sans-serif" },
        },
      },
    },
  };

  const dlPDF = async () => {
    const canvas = chartRef.current?.canvas || null;
    await generatePDF(answers, email, canvas, ctx, checks);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: '1px solid #27272A', borderRadius: '8px',
            color: brand.silver, padding: '8px', cursor: 'pointer', display: 'flex',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1
            style={{
              fontSize: '28px', fontWeight: 700, color: brand.amber, margin: 0,
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <Dna size={28} /> Business DNA Results
          </h1>
          <p style={{ color: brand.silver, margin: '4px 0 0', fontSize: '14px' }}>
            Your 7-Layer Business Analysis
          </p>
        </div>
      </div>

      {/* Business Context Header */}
      {(ctx.description || ctx.type) && (
        <div
          style={{
            background: '#111111', borderRadius: '12px', border: '1px solid #27272A',
            padding: '20px 24px', marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Briefcase size={16} color={brand.amber} />
            <span style={{ color: brand.amber, fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Business Profile
            </span>
          </div>
          {ctx.description && (
            <p style={{ color: brand.white, fontSize: '14px', lineHeight: 1.6, margin: '0 0 8px' }}>
              {ctx.description}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ctx.type && (
              <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: brand.amber, fontSize: '12px', fontWeight: 600 }}>
                {ctx.type}
              </span>
            )}
            {ctx.stage && (
              <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#18181B', border: '1px solid #27272A', color: brand.silver, fontSize: '12px', fontWeight: 500 }}>
                {ctx.stage}
              </span>
            )}
            {ctx.teamSize && (
              <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#18181B', border: '1px solid #27272A', color: brand.silver, fontSize: '12px', fontWeight: 500 }}>
                Team: {ctx.teamSize}
              </span>
            )}
            {ctx.goal && (
              <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#18181B', border: '1px solid #27272A', color: brand.silver, fontSize: '12px', fontWeight: 500 }}>
                Goal: {ctx.goal}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Overall Score Card */}
      <div
        style={{
          background: '#111111', borderRadius: '12px', border: '1px solid #27272A',
          padding: '32px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center', gap: '32px',
        }}
      >
        <ScoreRing score={os} size={140} />
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: brand.white }}>
            Overall Score: {os}/10
          </h2>
          <p
            style={{
              color: scoreColor(os), fontSize: '18px', fontWeight: 700,
              margin: '0 0 8px', fontFamily: "'Inter', sans-serif",
            }}
          >
            {overallLabel(op)}
          </p>
          {/* Progress bar */}
          <div style={{ background: '#18181B', borderRadius: '6px', height: '10px', overflow: 'hidden', marginBottom: '12px' }}>
            <div
              style={{
                height: '100%', borderRadius: '6px',
                background: `linear-gradient(90deg, ${scoreColor(os)}, ${scoreColor(os)}CC)`,
                width: `${op}%`, transition: 'width 1s ease',
              }}
            />
          </div>
          <p style={{ color: brand.silver, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            {op >= 70
              ? 'Your business shows strong DNA across most dimensions. Fine-tune weak spots for exceptional results.'
              : op >= 50
                ? 'Solid foundation with clear growth opportunities. Focus on lowest-scoring layers for biggest impact.'
                : 'Significant room for improvement. You now have a clear roadmap for exactly where to focus.'}
          </p>
        </div>
      </div>

      {/* Priority Actions */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
          borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)',
          padding: '24px', marginBottom: '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px', color: brand.amber, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} /> Top 3 Priority Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {priorities.map((p, i) => (
            <div
              key={p.layerName}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 16px', background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px', border: '1px solid #27272A',
              }}
            >
              <span
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: brand.amber, color: brand.void,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {i + 1}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: brand.white, fontSize: '14px', fontWeight: 600 }}>
                    {p.layerName}
                  </span>
                  <span
                    style={{
                      color: scoreColor(p.score), fontSize: '12px', fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {p.score}/10
                  </span>
                </div>
                <p style={{ color: brand.silver, fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  {p.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Chart */}
      <div
        style={{
          background: '#111111', borderRadius: '12px', border: '1px solid #27272A',
          padding: '32px', marginBottom: '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: brand.white }}>
          DNA Profile
        </h3>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Radar ref={chartRef as React.RefObject<ChartJS<'radar'>>} data={radarData} options={radarOpts} />
        </div>
      </div>

      {/* Layer Breakdown Cards */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px', marginBottom: '24px',
        }}
      >
        {LAYERS.map((l) => {
          const sc = layerScore(l.id, answers);
          const sw = getLayerStrengthsWeaknesses(l.id, checks);
          const action = layerAction(l.id, sc);
          return (
            <div
              key={l.id}
              style={{
                background: '#111111', borderRadius: '12px',
                border: '1px solid #27272A', padding: '20px',
              }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: brand.amber }}>{ICONS[l.iconName]}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: brand.white }}>
                    {l.name}
                  </span>
                </div>
                <span
                  style={{
                    color: scoreColor(sc), fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '15px',
                  }}
                >
                  {sc}/10
                </span>
              </div>
              {/* Score bar */}
              <div style={{ background: '#18181B', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '14px' }}>
                <div
                  style={{
                    height: '100%', width: `${(sc / 10) * 100}%`,
                    background: scoreColor(sc), borderRadius: '4px',
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
              {/* Strong points */}
              {sw.strong.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  {sw.strong.slice(0, 3).map((s) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle2 size={14} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ color: '#10B981', fontSize: '12px', lineHeight: 1.4 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Weak points */}
              {sw.weak.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  {sw.weak.slice(0, 2).map((w) => (
                    <div key={w} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                      <AlertTriangle size={14} color="#EAB308" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ color: '#EAB308', fontSize: '12px', lineHeight: 1.4 }}>{w}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Action */}
              {action && (
                <div
                  style={{
                    padding: '10px 12px', background: 'rgba(245,158,11,0.06)',
                    borderRadius: '6px', border: '1px solid rgba(245,158,11,0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ArrowRight size={14} color={brand.amber} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ color: brand.amber, fontSize: '12px', fontWeight: 600, lineHeight: 1.4 }}>
                      {action}
                    </span>
                  </div>
                </div>
              )}
              {/* Recommendation */}
              <p style={{ color: brand.smoke, fontSize: '12px', lineHeight: 1.5, margin: '10px 0 0' }}>
                {layerRec(l.id, sc)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={dlPDF}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '14px 24px', background: brand.amber, color: brand.void,
            border: 'none', borderRadius: '8px', fontSize: '15px',
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Download size={18} /> Download PDF Report
        </button>
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '14px 24px', background: '#18181B', color: brand.silver,
            border: '1px solid #27272A', borderRadius: '8px', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Retake Assessment
        </button>
      </div>

      {/* Consultation Upsell */}
      {op < 50 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
            borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)',
            padding: '32px', textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: brand.amber, margin: '0 0 8px' }}>
            Your Business Needs Expert Guidance
          </h3>
          <p
            style={{
              color: brand.silver, fontSize: '15px', lineHeight: 1.6,
              margin: '0 0 20px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto',
            }}
          >
            Scoring below 50% means there are critical gaps in your business DNA. A strategy
            consultation can help you prioritize and build a clear action plan.
          </p>
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', background: brand.amber, color: brand.void,
              borderRadius: '8px', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Calendar size={18} /> Book a Free Strategy Call <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════ */

export default function DNAScannerPage() {
  // Step: -1 = context, 0-6 = layers
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [checks, setChecks] = useState<CheckboxSelections>({});
  const [businessCtx, setBusinessCtx] = useState<BusinessContext>({});
  const [showResults, setShowResults] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [trans, setTrans] = useState(false);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');

  useEffect(() => {
    try {
      const s = localStorage.getItem('dna-scanner-email');
      if (s) {
        setEmail(s);
        setUnlocked(true);
      }
    } catch {
      /* empty */
    }
  }, []);

  const curLayer = step >= 0 ? step : 0;
  const layer = LAYERS[curLayer];
  const allDone = LAYERS.every((l) => layerDone(l.id, answers));

  const goTo = useCallback(
    (i: number) => {
      setDir(i > step ? 'fwd' : 'back');
      setTrans(true);
      setTimeout(() => {
        setStep(i);
        setTrans(false);
      }, 200);
    },
    [step],
  );

  const handleNext = useCallback(() => {
    if (step === -1) {
      goTo(0);
    } else if (step < 6) {
      goTo(step + 1);
    } else if (allDone) {
      if (unlocked) setShowResults(true);
      else setShowEmail(true);
    }
  }, [step, allDone, unlocked, goTo]);

  const handleBack = useCallback(() => {
    if (step > -1) goTo(step - 1);
  }, [step, goTo]);

  const handleEmailSubmit = useCallback((e: string) => {
    setEmail(e);
    setUnlocked(true);
    setShowEmail(false);
    setShowResults(true);
    try {
      localStorage.setItem('dna-scanner-email', e);
    } catch {
      /* empty */
    }
  }, []);

  const handleCheckboxToggle = useCallback(
    (questionId: string, checkboxId: string) => {
      setChecks((prev) => {
        const qChecks = { ...(prev[questionId] || {}) };
        qChecks[checkboxId] = !qChecks[checkboxId];
        const next = { ...prev, [questionId]: qChecks };
        // Auto-suggest score from checkboxes if user hasn't manually scored
        const suggested = scoreFromCheckboxes(questionId, next);
        if (suggested > 0) {
          setAnswers((a) => {
            // Only auto-set if current answer is 0 or was previously auto-set
            if (!a[questionId] || a[questionId] === scoreFromCheckboxes(questionId, prev)) {
              return { ...a, [questionId]: suggested };
            }
            return a;
          });
        }
        return next;
      });
    },
    [],
  );

  const slideStyle: React.CSSProperties = {
    opacity: trans ? 0 : 1,
    transform: trans ? `translateX(${dir === 'fwd' ? '30px' : '-30px'})` : 'translateX(0)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  };

  /* ── Results view ── */
  if (showResults) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
        <ResultsView
          answers={answers}
          email={email}
          ctx={businessCtx}
          checks={checks}
          onBack={() => setShowResults(false)}
          onReset={() => {
            setShowResults(false);
            setStep(-1);
            setAnswers({});
            setChecks({});
            setBusinessCtx({});
          }}
        />
      </div>
    );
  }

  /* ── Assessment view ── */
  const curLayerScore = step >= 0 ? layerScore(layer.id, answers) : 0;
  const curLayerDone = step >= 0 ? layerDone(layer.id, answers) : false;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      {showEmail && (
        <EmailModal onSubmit={handleEmailSubmit} onClose={() => setShowEmail(false)} />
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '56px', height: '56px', borderRadius: '14px',
              background: 'rgba(245,158,11,0.12)', marginBottom: '16px',
            }}
          >
            <Dna size={28} color={brand.amber} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: brand.white, margin: '0 0 8px' }}>
            Business DNA Scanner
          </h1>
          <p style={{ color: brand.silver, fontSize: '15px', margin: 0 }}>
            Analyze your business across 7 critical dimensions
          </p>
        </div>

        {/* Progress Bar — shows context dot + 7 layer dots */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            {/* Context dot */}
            <button
              onClick={() => goTo(-1)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                flex: 1,
              }}
            >
              <span
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: step > -1 ? brand.amber : step === -1 ? 'rgba(245,158,11,0.2)' : '#18181B',
                  color: step > -1 ? brand.void : step === -1 ? brand.amber : brand.smoke,
                  border: step === -1 ? `2px solid ${brand.amber}` : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {step > -1 ? '\u2713' : '0'}
              </span>
              <span
                style={{
                  fontSize: '10px', fontWeight: step === -1 ? 600 : 400,
                  color: step === -1 ? brand.amber : step > -1 ? brand.silver : brand.smoke,
                  transition: 'color 0.2s', whiteSpace: 'nowrap',
                }}
              >
                Context
              </span>
            </button>
            {/* Layer dots */}
            {LAYERS.map((l, i) => {
              const done = layerDone(l.id, answers);
              const active = i === step;
              return (
                <button
                  key={l.id}
                  onClick={() => goTo(i)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: done ? brand.amber : active ? 'rgba(245,158,11,0.2)' : '#18181B',
                      color: done ? brand.void : active ? brand.amber : brand.smoke,
                      border: active ? `2px solid ${brand.amber}` : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {done ? '\u2713' : l.id}
                  </span>
                  <span
                    style={{
                      fontSize: '10px', fontWeight: active ? 600 : 400,
                      color: active ? brand.amber : done ? brand.silver : brand.smoke,
                      transition: 'color 0.2s', whiteSpace: 'nowrap',
                    }}
                  >
                    {l.shortName}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Progress track */}
          <div style={{ background: '#18181B', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%', borderRadius: '4px',
                background: `linear-gradient(90deg, ${brand.amber}, #FCD34D)`,
                width: `${((step + 1 + (step >= 0 && curLayerDone ? 1 : 0)) / 8) * 100}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Content area with slide animation */}
        <div style={slideStyle}>
          {step === -1 ? (
            /* ── Context Step ── */
            <ContextStep
              ctx={businessCtx}
              onChange={setBusinessCtx}
              onContinue={handleNext}
            />
          ) : (
            /* ── Layer Card ── */
            <div
              style={{
                background: '#111111', borderRadius: '12px',
                border: '1px solid #27272A', padding: '32px', marginBottom: '24px',
              }}
            >
              {/* Layer Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(245,158,11,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: brand.amber,
                  }}
                >
                  {ICONS[layer.iconName]}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: brand.white }}>
                    Layer {layer.id}: {layer.name}
                  </h2>
                  <p style={{ color: brand.smoke, fontSize: '13px', margin: '2px 0 0' }}>
                    Layer {step + 1} of 7 -- 4 questions each
                  </p>
                </div>
                {curLayerDone && (
                  <div
                    style={{
                      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '8px',
                      background: `${scoreColor(curLayerScore)}15`,
                      border: `1px solid ${scoreColor(curLayerScore)}30`,
                    }}
                  >
                    <span
                      style={{
                        color: scoreColor(curLayerScore), fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
                      }}
                    >
                      {curLayerScore}/10
                    </span>
                    <span style={{ color: scoreColor(curLayerScore), fontSize: '12px' }}>
                      {scoreLabel(curLayerScore)}
                    </span>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {layer.questions.map((q, qi) => (
                  <div
                    key={q.id}
                    style={{
                      paddingTop: qi > 0 ? '20px' : 0,
                      borderTop: qi > 0 ? '1px solid #1E1E1E' : 'none',
                    }}
                  >
                    <div style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}>
                      <span
                        style={{
                          color: brand.amber, fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', flexShrink: 0,
                        }}
                      >
                        Q{qi + 1}
                      </span>
                      <p
                        style={{
                          fontSize: '15px', fontWeight: 600, margin: 0,
                          color: brand.white, lineHeight: 1.4,
                        }}
                      >
                        {q.question}
                      </p>
                    </div>
                    <p
                      style={{
                        color: brand.smoke, fontSize: '13px',
                        margin: '4px 0 12px 28px', lineHeight: 1.4,
                      }}
                    >
                      {q.description}
                    </p>
                    {/* Checkbox self-assessment */}
                    <div style={{ marginLeft: '28px' }}>
                      <CheckboxAssessment
                        questionId={q.id}
                        checkboxes={q.checkboxes}
                        checks={checks[q.id] || {}}
                        onToggle={(cbId) => handleCheckboxToggle(q.id, cbId)}
                      />
                      <ScoreSlider
                        value={answers[q.id] || 0}
                        onChange={(v) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: v }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons (only show for layer steps) */}
        {step >= 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <button
              onClick={handleBack}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '12px 20px', background: '#18181B',
                color: brand.silver, border: '1px solid #27272A',
                borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} /> {step === 0 ? 'Back to Context' : 'Previous'}
            </button>

            <button
              onClick={handleNext}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '12px 24px',
                background:
                  step === 6 && allDone
                    ? brand.amber
                    : curLayerDone
                      ? brand.amber
                      : '#27272A',
                color:
                  curLayerDone || (step === 6 && allDone) ? brand.void : brand.smoke,
                border: 'none', borderRadius: '8px', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              {step === 6 ? (
                allDone ? (
                  'View Results \u2192'
                ) : (
                  'Complete All Layers'
                )
              ) : (
                <>
                  Next Layer <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Layer score summary strip */}
        {step >= 0 && (
          <div
            style={{
              display: 'flex', gap: '8px', marginTop: '24px',
              flexWrap: 'wrap', justifyContent: 'center',
            }}
          >
            {LAYERS.map((l) => {
              const sc = layerScore(l.id, answers);
              const done = layerDone(l.id, answers);
              return (
                <div
                  key={l.id}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    background: done ? `${scoreColor(sc)}15` : '#18181B',
                    border: `1px solid ${done ? scoreColor(sc) + '40' : '#27272A'}`,
                    color: done ? scoreColor(sc) : brand.smoke,
                    fontWeight: done ? 600 : 400,
                  }}
                >
                  L{l.id}: {done ? `${sc}/10` : '\u2014'}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
