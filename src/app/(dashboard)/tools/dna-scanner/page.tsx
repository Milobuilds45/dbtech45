'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';
import {
  ChevronRight, ChevronLeft, Download, Mail,
  Target, TrendingUp, DollarSign, Megaphone,
  Settings, BarChart3, Shield, Dna, X, Calendar, ExternalLink,
  Briefcase, ArrowRight, CheckCircle2, AlertTriangle, Search, Activity, Layers
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
   Brand-native UI Components (Dark + Amber + Bento)
   ═══════════════════════════════════════════════════════ */

const HUDTag = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span
    className={className}
    style={{
      display: 'inline-block', padding: '4px 12px',
      background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.25)`,
      color: brand.amber, fontFamily: "'JetBrains Mono', monospace",
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
      borderRadius: '6px', textTransform: 'uppercase',
    }}
  >
    {children}
  </span>
);

const BentoCard = ({ children, style: extraStyle, active, onClick }: {
  children: React.ReactNode, style?: React.CSSProperties, active?: boolean, onClick?: () => void
}) => (
  <div
    onClick={onClick}
    style={{
      background: brand.carbon, border: `1px solid ${active ? brand.amber : brand.border}`,
      borderRadius: '16px', padding: '24px', cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: active ? `0 0 20px rgba(245,158,11,0.1)` : 'none',
      ...extraStyle,
    }}
  >
    {children}
  </div>
);

const Sparkline = ({ score }: { score: number }) => {
  const pts = [10, 40, 25, 60, 45, 80, 50, 95];
  return (
    <svg width="80" height="24" style={{ opacity: 0.6 }}>
      <polyline fill="none" stroke={score >= 7 ? brand.success : score >= 5 ? brand.amber : brand.error}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        points={pts.map((p, i) => `${i * 11},${24 - (p * 0.22)}`).join(' ')} />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Scanner
   ═══════════════════════════════════════════════════════ */

export default function DNAScannerPage() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [checks, setChecks] = useState<CheckboxSelections>({});
  const [businessCtx, setBusinessCtx] = useState<BusinessContext>({});
  const [showResults, setShowResults] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem('dna-scanner-email');
      if (s) { setEmail(s); setUnlocked(true); }
    } catch {}
  }, []);

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else if (unlocked) runFinalScan();
    else setShowEmail(true);
  };

  const runFinalScan = () => {
    setIsScanning(true);
    setTimeout(() => { setIsScanning(false); setShowResults(true); }, 2200);
  };

  const handleEmailSubmit = (e: string) => {
    setEmail(e); setUnlocked(true); setShowEmail(false); runFinalScan();
    try { localStorage.setItem('dna-scanner-email', e); } catch {}
  };

  const os = overallScore(answers);
  const op = overallPct(answers);

  const pageStyle: React.CSSProperties = { minHeight: '100vh', padding: '32px', fontFamily: "'Inter', sans-serif" };
  const labelStyle: React.CSSProperties = { color: brand.smoke, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui" };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 16px', background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '12px', color: brand.white, fontWeight: 600, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', outline: 'none', fontFamily: "'Inter', sans-serif" };
  const btnPrimary: React.CSSProperties = { width: '100%', padding: '20px', background: brand.amber, color: brand.void, border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: "'Inter', sans-serif" };

  /* ─── Scanning Animation ─── */
  if (isScanning) {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes dna-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes dna-progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
        <Dna size={64} color={brand.amber} style={{ animation: 'dna-spin 8s linear infinite', marginBottom: '32px' }} />
        <h2 style={{ color: brand.white, fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '16px', textTransform: 'uppercase' }}>
          Synthesizing DNA Profile
        </h2>
        <div style={{ width: '256px', height: '4px', background: brand.graphite, borderRadius: '4px', overflow: 'hidden', border: `1px solid ${brand.border}` }}>
          <div style={{ height: '100%', background: brand.amber, animation: 'dna-progress 2.2s ease-in-out' }} />
        </div>
        <p style={{ ...labelStyle, marginTop: '16px', color: brand.smoke }}>Processing 7 dimensions...</p>
      </div>
    );
  }

  /* ─── Results ─── */
  if (showResults) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', borderBottom: `1px solid ${brand.border}`, paddingBottom: '32px', marginBottom: '40px' }}>
            <div>
              <HUDTag>{overallLabel(op).toUpperCase()} // DIAGNOSTIC COMPLETE</HUDTag>
              <h1 style={{ color: brand.white, fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', marginTop: '12px', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui" }}>
                DNA Intelligence Report
              </h1>
              <p style={{ color: brand.smoke, marginTop: '4px' }}>Prepared for {email} &bull; {new Date().toLocaleDateString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => generatePDF(answers, email, null, businessCtx, checks)}
                style={{ padding: '12px 24px', background: brand.amber, color: brand.void, border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Export PDF
              </button>
              <button onClick={() => { setShowResults(false); setStep(-1); setAnswers({}); setChecks({}); }}
                style={{ padding: '12px 24px', background: 'transparent', color: brand.silver, border: `1px solid ${brand.border}`, borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                New Scan
              </button>
            </div>
          </div>

          {/* Executive Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <BentoCard style={{ display: 'flex', alignItems: 'center', gap: '48px', padding: '40px' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: `6px solid ${brand.graphite}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: brand.amber, lineHeight: 1 }}>{os}</div>
                    <div style={{ ...labelStyle, marginTop: '4px' }}>Core Index</div>
                  </div>
                </div>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="80" cy="80" r="74" fill="none" stroke={brand.amber} strokeWidth="6"
                    strokeDasharray="465" strokeDashoffset={465 - (465 * os / 10)} strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: brand.white, fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>{overallLabel(op)}</h3>
                <p style={{ color: brand.silver, lineHeight: 1.6, marginBottom: '20px' }}>
                  {op >= 70 ? "High structural integrity. Scale-ready DNA detected." :
                   op >= 50 ? "Viable core with moderate risk. Optimize underperforming layers." :
                   "Critical vulnerabilities detected. Immediate intervention required."}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ padding: '8px 16px', background: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.border}` }}>
                    <div style={labelStyle}>Efficiency</div>
                    <div style={{ color: brand.amber, fontSize: '18px', fontWeight: 900 }}>{op}%</div>
                  </div>
                  <div style={{ padding: '8px 16px', background: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.border}` }}>
                    <div style={labelStyle}>Risk</div>
                    <div style={{ color: brand.white, fontSize: '18px', fontWeight: 900 }}>{op < 50 ? "HIGH" : "LOW"}</div>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.2)' }}>
              <h4 style={{ color: brand.amber, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={14} /> Priority Actions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getPriorityActions(answers).map((p, i) => (
                  <div key={i} style={{ padding: '14px', background: brand.graphite, borderRadius: '12px', border: `1px solid ${brand.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={labelStyle}>{p.layerName}</span>
                      <span style={{ ...labelStyle, color: brand.amber, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{p.score}/10</span>
                    </div>
                    <p style={{ color: brand.silver, fontSize: '12px', fontWeight: 600, lineHeight: 1.4 }}>{p.action}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Layer Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {LAYERS.map((l) => {
              const sc = layerScore(l.id, answers);
              return (
                <BentoCard key={l.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ padding: '10px', background: brand.graphite, borderRadius: '10px', color: brand.amber }}>{ICONS[l.iconName]}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: brand.white }}>{sc}</div>
                      <div style={labelStyle}>Layer {l.id}</div>
                    </div>
                  </div>
                  <h4 style={{ color: brand.white, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>{l.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkline score={sc} />
                    <span style={labelStyle}>Trend</span>
                  </div>
                  <p style={{ color: brand.smoke, fontSize: '12px', lineHeight: 1.5, marginBottom: '16px', minHeight: '36px' }}>{layerRec(l.id, sc)}</p>
                  <div style={{ borderTop: `1px solid ${brand.border}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={labelStyle}>Status</span>
                    <span style={{ ...labelStyle, color: sc >= 7 ? brand.success : sc >= 5 ? brand.amber : brand.error }}>{scoreLabel(sc)}</span>
                  </div>
                </BentoCard>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main Form ─── */
  return (
    <div style={pageStyle}>
      {/* Email Modal */}
      {showEmail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: brand.carbon, border: `1px solid ${brand.amber}`, padding: '48px', borderRadius: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 0 40px rgba(245,158,11,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(245,158,11,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Mail size={32} color={brand.amber} />
              </div>
              <h2 style={{ color: brand.white, fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Unlock Report</h2>
              <p style={{ color: brand.smoke }}>Enter your email to access the full diagnostic brief.</p>
            </div>
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ ...inputStyle, marginBottom: '16px', textTransform: 'none', fontSize: '14px' }} />
            <button onClick={() => handleEmailSubmit(email)} style={btnPrimary}>Access Report</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', maxWidth: '400px', margin: '0 auto 48px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= i - 1 ? brand.amber : brand.border, transition: 'background 0.3s', boxShadow: step >= i - 1 ? '0 0 8px rgba(245,158,11,0.3)' : 'none' }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '48px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <HUDTag>Diagnostic // Step {step + 2} of 8</HUDTag>
            <h1 style={{ color: brand.white, fontSize: '48px', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', marginTop: '16px', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui" }}>
              Business<br /><span style={{ color: brand.amber }}>DNA Scanner</span>
            </h1>
            <p style={{ color: brand.silver, marginTop: '24px', fontSize: '16px', lineHeight: 1.6 }}>
              {step === -1
                ? "Set your business context to begin the 7-layer diagnostic scan."
                : `Analyzing ${LAYERS[step].name}. Rate your maturity across each data point.`}
            </p>

            {/* Layer Grid Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '40px', paddingTop: '24px', borderTop: `1px solid ${brand.border}` }}>
              {LAYERS.map((l, i) => (
                <div key={l.id} style={{
                  padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step === i ? brand.amber : brand.graphite,
                  border: `1px solid ${step === i ? brand.amber : brand.border}`,
                  color: step === i ? brand.void : brand.smoke,
                  transition: 'all 0.2s',
                }}>
                  {ICONS[l.iconName]}
                </div>
              ))}
              <div style={{ padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.graphite, border: `1px solid ${brand.border}`, color: brand.smoke }}>
                <Activity size={20} />
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <BentoCard style={{ padding: '40px', borderRadius: '24px' }}>
              {step === -1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div>
                    <div style={{ ...labelStyle, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Search size={12} color={brand.amber} /> Business Overview
                    </div>
                    <textarea
                      placeholder="Describe your business model and value proposition..."
                      value={businessCtx.description || ''}
                      onChange={(e) => setBusinessCtx({ ...businessCtx, description: e.target.value })}
                      style={{ ...inputStyle, minHeight: '140px', textTransform: 'none', fontSize: '14px', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {[
                      { label: 'Archetype', options: BUSINESS_TYPES, key: 'type' },
                      { label: 'Stage', options: BUSINESS_STAGES, key: 'stage' },
                      { label: 'Team Size', options: TEAM_SIZES, key: 'teamSize' },
                      { label: 'Goal', options: PRIMARY_GOALS, key: 'goal' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div style={{ ...labelStyle, marginBottom: '8px' }}>{item.label}</div>
                        <select value={businessCtx[item.key as keyof BusinessContext] || ''}
                          onChange={(e) => setBusinessCtx({ ...businessCtx, [item.key]: e.target.value })}
                          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}>
                          <option value="">Select...</option>
                          {item.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(0)} style={btnPrimary}>
                    Start Diagnostic <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Layer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${brand.border}`, paddingBottom: '20px' }}>
                    <div>
                      <h2 style={{ color: brand.white, fontSize: '28px', fontWeight: 900, textTransform: 'uppercase' }}>Layer {step + 1}</h2>
                      <p style={{ color: brand.amber, fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{LAYERS[step].name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '36px', fontWeight: 900, color: brand.amber, lineHeight: 1 }}>{layerScore(LAYERS[step].id, answers)}</div>
                      <div style={labelStyle}>Score</div>
                    </div>
                  </div>

                  {/* Questions */}
                  {LAYERS[step].questions.map((q, qi) => (
                    <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ color: brand.amber, fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, fontSize: '16px' }}>0{qi + 1}</span>
                        <h4 style={{ color: brand.white, fontSize: '16px', fontWeight: 700, lineHeight: 1.4 }}>{q.question}</h4>
                      </div>

                      {/* Checkboxes */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingLeft: '32px' }}>
                        {q.checkboxes.map(cb => {
                          const checked = checks[q.id]?.[cb.id];
                          return (
                            <button key={cb.id}
                              onClick={() => {
                                const nc = { ...checks };
                                if (!nc[q.id]) nc[q.id] = {};
                                nc[q.id][cb.id] = !nc[q.id][cb.id];
                                setChecks(nc);
                                setAnswers({ ...answers, [q.id]: scoreFromCheckboxes(q.id, nc) });
                              }}
                              style={{
                                textAlign: 'left', padding: '12px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s',
                                background: checked ? brand.amber : brand.graphite,
                                border: `1px solid ${checked ? brand.amber : brand.border}`,
                                color: checked ? brand.void : brand.smoke,
                              }}
                            >
                              {cb.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Density Slider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '32px' }}>
                        <span style={labelStyle}>Density</span>
                        <div style={{ flex: 1, display: 'flex', gap: '4px', height: '10px' }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <button key={n} onClick={() => setAnswers({ ...answers, [q.id]: n })}
                              style={{
                                flex: 1, borderRadius: '2px', cursor: 'pointer', border: 'none', transition: 'background 0.15s',
                                background: answers[q.id] === n ? brand.amber : brand.graphite,
                              }} />
                          ))}
                        </div>
                        <span style={{ width: '28px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: brand.amber, fontSize: '14px' }}>
                          {answers[q.id] || 0}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Nav */}
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                    <button onClick={() => setStep(step - 1)}
                      style={{ flex: 1, padding: '16px', background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: '14px', color: brand.smoke, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em' }}>
                      Previous
                    </button>
                    <button onClick={handleNext}
                      style={{ ...btnPrimary, flex: 2, width: 'auto', borderRadius: '14px', fontSize: '14px' }}>
                      {step === 6 ? 'Generate Report' : 'Next Layer'} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
