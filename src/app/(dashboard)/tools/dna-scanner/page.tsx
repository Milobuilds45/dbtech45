'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';
import {
  ChevronRight, ChevronLeft, Download, Mail,
  Target, TrendingUp, DollarSign, Megaphone,
  Settings, BarChart3, Shield, Dna, X, Calendar, ExternalLink,
} from 'lucide-react';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import {
  LAYERS, layerScore, layerDone, overallScore, overallPct,
  scoreColor, scoreLabel, layerRec, generatePDF,
  type Answers,
} from './_helpers';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ICONS: Record<string, React.ReactNode> = {
  Target: <Target size={20} />, TrendingUp: <TrendingUp size={20} />,
  DollarSign: <DollarSign size={20} />, Megaphone: <Megaphone size={20} />,
  Settings: <Settings size={20} />, BarChart3: <BarChart3 size={20} />,
  Shield: <Shield size={20} />,
};

/* ═══════════════ Sub-components ═══════════════ */

function ScoreSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = ['', 'Very Low', 'Low', 'Below Avg', 'Average', 'Moderate', 'Good', 'Strong', 'Very Strong', 'Excellent', 'World Class'];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: brand.smoke, fontSize: '13px' }}>Score</span>
        <span style={{ color: value > 0 ? scoreColor(value) : brand.smoke, fontSize: '14px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", transition: 'color 0.3s' }}>
          {value > 0 ? `${value}/10 — ${labels[value]}` : 'Select a score'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, height: '36px', borderRadius: '6px', cursor: 'pointer',
            border: value === n ? `2px solid ${brand.amber}` : '1px solid #27272A',
            background: value === n ? 'rgba(245,158,11,0.15)' : '#18181B',
            color: value === n ? brand.amber : brand.smoke,
            fontSize: '13px', fontWeight: value === n ? 700 : 400,
            fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.15s',
          }}>
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (anim / 10) * c}
          style={{ transition: 'stroke 0.5s' }} />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={color}
          style={{ fontSize: size * 0.28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px` }}>
          {anim.toFixed(1)}
        </text>
      </svg>
      {label && <span style={{ color: brand.silver, fontSize: '13px', fontWeight: 500 }}>{label}</span>}
    </div>
  );
}

function EmailModal({ onSubmit, onClose }: { onSubmit: (e: string) => void; onClose: () => void }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const go = () => {
    if (!val || !val.includes('@') || !val.includes('.')) { setErr('Please enter a valid email'); return; }
    onSubmit(val);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111111', borderRadius: '12px', border: `1px solid ${brand.border}`, padding: '40px', maxWidth: '460px', width: '90%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer' }}><X size={20} /></button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Mail size={28} color={brand.amber} />
          </div>
          <h2 style={{ color: brand.white, fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Your DNA Report is Ready</h2>
          <p style={{ color: brand.silver, fontSize: '14px', lineHeight: 1.6 }}>
            Enter your email to unlock your full Business DNA Analysis — including personalized recommendations and a downloadable PDF report.
          </p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input type="email" value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && go()} placeholder="you@company.com"
            style={{ width: '100%', padding: '14px 16px', background: '#18181B',
              border: `1px solid ${err ? '#EF4444' : '#27272A'}`, borderRadius: '8px',
              color: brand.white, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          {err && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px' }}>{err}</p>}
        </div>
        <button onClick={go} style={{ width: '100%', padding: '14px', background: brand.amber,
          color: brand.void, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
          Unlock My DNA Report →
        </button>
        <p style={{ color: brand.smoke, fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>No spam. Your data stays private.</p>
      </div>
    </div>
  );
}

/* ═══════════════ Results View ═══════════════ */

function ResultsView({ answers, email, onBack, onReset }: {
  answers: Answers; email: string; onBack: () => void; onReset: () => void;
}) {
  const chartRef = useRef<ChartJS<'radar'> | null>(null);
  const os = overallScore(answers);
  const op = overallPct(answers);

  const radarData = {
    labels: LAYERS.map(l => l.shortName),
    datasets: [{
      label: 'Business DNA Score',
      data: LAYERS.map(l => layerScore(l.id, answers)),
      backgroundColor: 'rgba(245,158,11,0.15)',
      borderColor: '#F59E0B', borderWidth: 2,
      pointBackgroundColor: '#F59E0B', pointBorderColor: '#FCD34D',
      pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
    }],
  };

  const radarOpts = {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#111111', titleColor: '#FAFAFA', bodyColor: '#A1A1AA', borderColor: '#27272A', borderWidth: 1, padding: 12 },
    },
    scales: {
      r: {
        min: 0, max: 10, beginAtZero: true,
        ticks: { stepSize: 2, color: '#71717A', backdropColor: 'transparent', font: { size: 11, family: "'JetBrains Mono', monospace" } },
        grid: { color: 'rgba(39,39,42,0.6)' },
        angleLines: { color: 'rgba(39,39,42,0.6)' },
        pointLabels: { color: '#A1A1AA', font: { size: 13, weight: 600 as const, family: "'Inter', sans-serif" } },
      },
    },
  };

  const dlPDF = async () => {
    const canvas = chartRef.current?.canvas || null;
    await generatePDF(answers, email, canvas);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #27272A', borderRadius: '8px', color: brand.silver, padding: '8px', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: brand.amber, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Dna size={28} /> Business DNA Results
          </h1>
          <p style={{ color: brand.silver, margin: '4px 0 0', fontSize: '14px' }}>Your 7-Layer Business Analysis</p>
        </div>
      </div>

      {/* Overall Score */}
      <div style={{ background: '#111111', borderRadius: '12px', border: '1px solid #27272A', padding: '32px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        <ScoreRing score={os} size={140} />
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Overall Score: {os}/10</h2>
          <p style={{ color: scoreColor(os), fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>
            {scoreLabel(os)} ({op}%)
          </p>
          <p style={{ color: brand.silver, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            {op >= 70 ? 'Your business shows strong DNA across most dimensions. Fine-tune weak spots for exceptional results.'
              : op >= 50 ? 'Solid foundation with clear growth opportunities. Focus on lowest-scoring layers for biggest impact.'
              : 'Significant room for improvement. You now have a clear roadmap for exactly where to focus.'}
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div style={{ background: '#111111', borderRadius: '12px', border: '1px solid #27272A', padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>DNA Profile</h3>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Radar ref={chartRef as React.RefObject<ChartJS<'radar'>>} data={radarData} options={radarOpts} />
        </div>
      </div>

      {/* Layer Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {LAYERS.map(l => {
          const sc = layerScore(l.id, answers);
          return (
            <div key={l.id} style={{ background: '#111111', borderRadius: '12px', border: '1px solid #27272A', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: brand.amber }}>{ICONS[l.iconName]}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{l.name}</span>
                </div>
                <span style={{ color: scoreColor(sc), fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}>
                  {sc}/10
                </span>
              </div>
              <div style={{ background: '#18181B', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${(sc / 10) * 100}%`, background: scoreColor(sc), borderRadius: '4px', transition: 'width 0.8s ease' }} />
              </div>
              <p style={{ color: brand.smoke, fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{layerRec(l.id, sc)}</p>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
        <button onClick={dlPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: brand.amber, color: brand.void, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
          <Download size={18} /> Download PDF Report
        </button>
        <button onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: '#18181B', color: brand.silver, border: '1px solid #27272A', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Retake Assessment
        </button>
      </div>

      {/* Consultation Upsell */}
      {op < 50 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)', padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: brand.amber, margin: '0 0 8px' }}>
            Your Business Needs Expert Guidance
          </h3>
          <p style={{ color: brand.silver, fontSize: '15px', lineHeight: 1.6, margin: '0 0 20px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Scoring below 50% means there are critical gaps in your business DNA. A strategy consultation can help you prioritize and build a clear action plan.
          </p>
          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: brand.amber, color: brand.void, borderRadius: '8px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
            <Calendar size={18} /> Book a Free Strategy Call <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Main Page ═══════════════ */

export default function DNAScannerPage() {
  const [curLayer, setCurLayer] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [trans, setTrans] = useState(false);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');

  useEffect(() => {
    try {
      const s = localStorage.getItem('dna-scanner-email');
      if (s) { setEmail(s); setUnlocked(true); }
    } catch { /* empty */ }
  }, []);

  const layer = LAYERS[curLayer];
  const allDone = LAYERS.every(l => layerDone(l.id, answers));

  const goTo = useCallback((i: number) => {
    setDir(i > curLayer ? 'fwd' : 'back');
    setTrans(true);
    setTimeout(() => { setCurLayer(i); setTrans(false); }, 200);
  }, [curLayer]);

  const handleNext = useCallback(() => {
    if (curLayer < 6) goTo(curLayer + 1);
    else if (allDone) { if (unlocked) setShowResults(true); else setShowEmail(true); }
  }, [curLayer, allDone, unlocked, goTo]);

  const handleBack = useCallback(() => {
    if (curLayer > 0) goTo(curLayer - 1);
  }, [curLayer, goTo]);

  const handleEmailSubmit = useCallback((e: string) => {
    setEmail(e); setUnlocked(true); setShowEmail(false); setShowResults(true);
    try { localStorage.setItem('dna-scanner-email', e); } catch { /* empty */ }
  }, []);

  const slideStyle: React.CSSProperties = {
    opacity: trans ? 0 : 1,
    transform: trans ? `translateX(${dir === 'fwd' ? '30px' : '-30px'})` : 'translateX(0)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  };

  if (showResults) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
        <ResultsView answers={answers} email={email}
          onBack={() => setShowResults(false)}
          onReset={() => { setShowResults(false); setCurLayer(0); setAnswers({}); }} />
      </div>
    );
  }

  const curLayerScore = layerScore(layer.id, answers);
  const curLayerDone = layerDone(layer.id, answers);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      {showEmail && <EmailModal onSubmit={handleEmailSubmit} onClose={() => setShowEmail(false)} />}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245,158,11,0.12)', marginBottom: '16px' }}>
            <Dna size={28} color={brand.amber} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: brand.white, margin: '0 0 8px' }}>Business DNA Scanner</h1>
          <p style={{ color: brand.silver, fontSize: '15px', margin: 0 }}>Analyze your business across 7 critical dimensions</p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            {LAYERS.map((l, i) => {
              const done = layerDone(l.id, answers);
              const active = i === curLayer;
              return (
                <button key={l.id} onClick={() => goTo(i)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1,
                  }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: done ? brand.amber : active ? 'rgba(245,158,11,0.2)' : '#18181B',
                    color: done ? brand.void : active ? brand.amber : brand.smoke,
                    border: active ? `2px solid ${brand.amber}` : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                    {done ? '✓' : l.id}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: active ? 600 : 400,
                    color: active ? brand.amber : done ? brand.silver : brand.smoke,
                    transition: 'color 0.2s', whiteSpace: 'nowrap',
                  }}>
                    {l.shortName}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Progress track */}
          <div style={{ background: '#18181B', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${brand.amber}, #FCD34D)`,
              width: `${((curLayer + (curLayerDone ? 1 : 0)) / 7) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Layer Card */}
        <div style={slideStyle}>
          <div style={{ background: '#111111', borderRadius: '12px', border: '1px solid #27272A', padding: '32px', marginBottom: '24px' }}>
            {/* Layer Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.amber }}>
                {ICONS[layer.iconName]}
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Layer {layer.id}: {layer.name}
                </h2>
                <p style={{ color: brand.smoke, fontSize: '13px', margin: '2px 0 0' }}>
                  Question {curLayer + 1} of 7 layers • 4 questions each
                </p>
              </div>
              {curLayerDone && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: `${scoreColor(curLayerScore)}15`, border: `1px solid ${scoreColor(curLayerScore)}30` }}>
                  <span style={{ color: scoreColor(curLayerScore), fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>
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
                <div key={q.id} style={{ paddingTop: qi > 0 ? '20px' : 0, borderTop: qi > 0 ? '1px solid #1E1E1E' : 'none' }}>
                  <div style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: brand.amber, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', flexShrink: 0 }}>
                      Q{qi + 1}
                    </span>
                    <p style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: brand.white, lineHeight: 1.4 }}>
                      {q.question}
                    </p>
                  </div>
                  <p style={{ color: brand.smoke, fontSize: '13px', margin: '4px 0 12px 28px', lineHeight: 1.4 }}>
                    {q.description}
                  </p>
                  <div style={{ marginLeft: '28px' }}>
                    <ScoreSlider value={answers[q.id] || 0} onChange={v => setAnswers(prev => ({ ...prev, [q.id]: v }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button onClick={handleBack} disabled={curLayer === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px',
              background: '#18181B', color: curLayer === 0 ? '#333' : brand.silver,
              border: '1px solid #27272A', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, cursor: curLayer === 0 ? 'not-allowed' : 'pointer',
            }}>
            <ChevronLeft size={16} /> Previous
          </button>

          <button onClick={handleNext}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px',
              background: curLayer === 6 && allDone ? brand.amber : curLayerDone ? brand.amber : '#27272A',
              color: (curLayerDone || (curLayer === 6 && allDone)) ? brand.void : brand.smoke,
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.2s',
            }}>
            {curLayer === 6
              ? (allDone ? 'View Results →' : 'Complete All Layers')
              : (<>Next Layer <ChevronRight size={16} /></>)}
          </button>
        </div>

        {/* Layer score summary strip */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {LAYERS.map(l => {
            const sc = layerScore(l.id, answers);
            const done = layerDone(l.id, answers);
            return (
              <div key={l.id} style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                background: done ? `${scoreColor(sc)}15` : '#18181B',
                border: `1px solid ${done ? scoreColor(sc) + '40' : '#27272A'}`,
                color: done ? scoreColor(sc) : brand.smoke,
                fontWeight: done ? 600 : 400,
              }}>
                L{l.id}: {done ? `${sc}/10` : '—'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
