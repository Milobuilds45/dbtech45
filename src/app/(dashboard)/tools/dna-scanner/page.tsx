'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { brand } from '@/lib/brand';
import {
  ChevronRight, ChevronLeft, Download, Mail,
  Target, TrendingUp, DollarSign, Megaphone,
  Settings, BarChart3, Shield, Dna, X, Calendar, ExternalLink,
  Briefcase, ArrowRight, CheckCircle2, AlertTriangle, Search, Activity
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
   Abyssal UI Components
   ═══════════════════════════════════════════════════════ */

const AbyssalBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#020617]" />
    <div className="absolute inset-0 opacity-20" 
         style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, #1e293b 0%, transparent 80%)' }} />
    <div className="marine-snow absolute inset-0" />
  </div>
);

const HUDTag = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`inline-block px-3 py-1 border border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-[10px] font-bold tracking-widest rounded uppercase ${className}`}>
    {children}
  </div>
);

const BentoCard = ({ children, className = "", onClick, active = false }: { children: React.ReactNode, className?: string, onClick?: () => void, active?: boolean }) => (
  <div 
    onClick={onClick}
    className={`relative group bg-slate-900/50 border-2 transition-all duration-300 rounded-2xl overflow-hidden p-6 cursor-pointer
               ${active ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-slate-800 hover:border-slate-700'} 
               ${className}`}
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

const Sparkline = ({ score }: { score: number }) => {
  const points = [10, 40, 25, 60, 45, 80, 50, 95]; // Simulated momentum
  const color = score > 0 ? scoreColor(score) : '#475569';
  return (
    <svg width="100" height="30" className="opacity-50">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.map((p, i) => `${i * 14},${30 - (p * 0.3)}`).join(' ')}
      />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Scanner Logic
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
      if (s) {
        setEmail(s);
        setUnlocked(true);
      }
    } catch { /* empty */ }
  }, []);

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else if (unlocked) runFinalScan();
    else setShowEmail(true);
  };

  const runFinalScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 2500);
  };

  const handleEmailSubmit = (e: string) => {
    setEmail(e);
    setUnlocked(true);
    setShowEmail(false);
    runFinalScan();
    try { localStorage.setItem('dna-scanner-email', e); } catch { /* empty */ }
  };

  const os = overallScore(answers);
  const op = overallPct(answers);

  if (isScanning) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
        <AbyssalBackground />
        <div className="z-10 text-center">
          <Dna className="w-24 h-24 text-amber-500 animate-spin-slow mb-8 mx-auto" />
          <h2 className="text-4xl font-bold font-mono tracking-tighter text-white mb-4">SYNTHESIZING DNA ARCHETYPE</h2>
          <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-amber-500 animate-progress" />
          </div>
          <p className="mt-4 text-slate-500 font-mono text-sm tracking-widest uppercase animate-pulse">
            Processing 7 critical dimensions...
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8 relative">
        <AbyssalBackground />
        <div className="max-w-6xl mx-auto relative z-10">
           {/* Result Header */}
           <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
              <div>
                <HUDTag className="mb-4">ANALYSIS: COMPLETE // CLASS: {overallLabel(op).toUpperCase()}</HUDTag>
                <h1 className="text-6xl font-black tracking-tighter glow-text mb-2 uppercase">BUSINESS DNA BRIEF</h1>
                <p className="text-slate-400 font-medium">Diagnostic report generated for {email}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => generatePDF(answers, email, null, businessCtx, checks)}
                  className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Download size={18} /> EXPORT PDF
                </button>
                <button 
                  onClick={() => { setShowResults(false); setStep(-1); setAnswers({}); setChecks({}); }}
                  className="border border-slate-700 text-slate-400 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  NEW SCAN
                </button>
              </div>
           </div>

           {/* Executive Grid */}
           <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <BentoCard className="lg:col-span-2 flex flex-col md:flex-row items-center gap-12 py-12">
                 <div className="relative">
                    <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-black text-amber-500 leading-none">{os}</div>
                        <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-1">CORE INDEX</div>
                      </div>
                    </div>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="96" cy="96" r="92" fill="none" 
                        stroke="currentColor" strokeWidth="8" 
                        className="text-amber-500" 
                        strokeDasharray="578" 
                        strokeDashoffset={578 - (578 * os / 10)} 
                        strokeLinecap="round"
                      />
                    </svg>
                 </div>
                 <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4 uppercase tracking-tight">{overallLabel(op)}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      {op >= 70 
                        ? "Your business shows lethal efficiency in its current environment. Scale-ready DNA detected." 
                        : op >= 50 
                        ? "Viable core detected. Structural weaknesses in secondary layers are slowing extraction speed." 
                        : "Critical DNA degradation. Total restructuring required to survive high-pressure environments."}
                    </p>
                    <div className="flex gap-4">
                       <div className="px-4 py-2 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Efficiency</div>
                          <div className="text-lg font-bold">{op}%</div>
                       </div>
                       <div className="px-4 py-2 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Volatility</div>
                          <div className="text-lg font-bold">{op < 50 ? "HIGH" : "LOW"}</div>
                       </div>
                    </div>
                 </div>
              </BentoCard>

              <BentoCard className="bg-amber-500/5 border-amber-500/30">
                 <h4 className="font-bold text-amber-500 mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
                   <Target size={16} /> Top Tactical Gaps
                 </h4>
                 <div className="space-y-4">
                    {getPriorityActions(answers).map((p, i) => (
                      <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-slate-400">{p.layerName.toUpperCase()}</span>
                           <span className="text-xs font-bold text-amber-500">{p.score}/10</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-tight font-medium">{p.action}</p>
                      </div>
                    ))}
                 </div>
              </BentoCard>
           </div>

           {/* Dimensional Breakdown */}
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LAYERS.map((l) => {
                const sc = layerScore(l.id, answers);
                return (
                  <BentoCard key={l.id} className="group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-3 bg-slate-800 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                          {ICONS[l.iconName]}
                       </div>
                       <div className="text-right">
                          <div className="text-2xl font-black text-white">{sc}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">LAYER {l.id}</div>
                       </div>
                    </div>
                    <h4 className="text-lg font-bold mb-2 uppercase tracking-tight">{l.name}</h4>
                    <div className="flex items-center gap-4 mb-4">
                       <Sparkline score={sc} />
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Momentum</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 h-10">{layerRec(l.id, sc)}</p>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                       <span className={`text-xs font-bold uppercase tracking-widest ${sc >= 7 ? 'text-green-500' : sc >= 5 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {scoreLabel(sc)}
                       </span>
                    </div>
                  </BentoCard>
                );
              })}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 relative selection:bg-amber-500 selection:text-black">
      <AbyssalBackground />
      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress { animation: progress 2.5s ease-in-out; }
        .glow-text { text-shadow: 0 0 30px rgba(245, 158, 11, 0.4); }
        .marine-snow { background: radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.05) 0%, transparent 70%); }
      `}</style>

      {showEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-slate-900 border-2 border-amber-500 p-10 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.2)]">
              <div className="text-center mb-8">
                 <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-500/20">
                    <Mail size={40} />
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic">EXTRACT DNA REPORT</h2>
                 <p className="text-slate-400">Unlock the full abyssal intelligence brief and priority tactical plays.</p>
              </div>
              <input 
                type="email" 
                placeholder="OPERATOR@COMMAND.IO"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-mono mb-4 focus:border-amber-500 outline-none transition-all uppercase tracking-widest"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                onClick={() => handleEmailSubmit(email)}
                className="w-full bg-amber-500 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95"
              >
                AUTHORIZE EXTRACTION
              </button>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10 pt-20">
        {/* Progress HUD */}
        <div className="grid grid-cols-8 gap-2 mb-12">
           <div 
             className={`h-1 rounded-full transition-all duration-500 ${step >= -1 ? 'bg-amber-500' : 'bg-slate-800'}`} 
             style={{ boxShadow: step >= -1 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none' }}
           />
           {[1,2,3,4,5,6,7].map((i) => (
             <div 
               key={i} 
               className={`h-1 rounded-full transition-all duration-500 ${step >= i-1 ? 'bg-amber-500' : 'bg-slate-800'}`}
               style={{ boxShadow: step >= i-1 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none' }}
             />
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
           {/* Left Column: Context & Selection */}
           <div className="lg:col-span-1 space-y-6">
              <div>
                <HUDTag className="mb-4">SYSTEMS_CHECK // ID: {step === -1 ? 'INIT' : `LAYER_0${step + 1}`}</HUDTag>
                <h1 className="text-6xl font-black tracking-tighter leading-none glow-text uppercase italic">
                  DNA<br/><span className="text-amber-500">SCANNER</span>
                </h1>
                <p className="text-slate-400 mt-6 text-lg font-medium">
                  {step === -1 
                    ? "Initialize your business profile to begin the deep-layer diagnostic scan." 
                    : `Analyzing ${LAYERS[step].name}. Complete the self-assessment for dimensionality.`}
                </p>
              </div>

              {/* Dimensional Overview (Bento Preview) */}
              <div className="grid grid-cols-4 gap-2 pt-8 border-t border-slate-800">
                 {LAYERS.map((l, i) => (
                   <div key={l.id} className={`p-2 rounded-lg border flex items-center justify-center transition-all ${step === i ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                      {ICONS[l.iconName]}
                   </div>
                 ))}
                 <div className="p-2 bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Activity size={20} />
                 </div>
              </div>
           </div>

           {/* Right Column: Interaction */}
           <div className="lg:col-span-2">
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl relative">
                {/* HUD Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20 animate-scan pointer-events-none" />
                
                {step === -1 ? (
                   <div className="space-y-10">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Search size={14} /> Description Protocol
                        </div>
                        <textarea 
                          className="w-full bg-slate-950 border border-slate-800 p-6 rounded-2xl text-slate-300 font-medium text-lg focus:border-amber-500 outline-none transition-all min-h-[160px]"
                          placeholder="Describe your business mission in 2-3 sentences..."
                          value={businessCtx.description || ''}
                          onChange={(e) => setBusinessCtx({...businessCtx, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                         {[
                           { label: 'Archetype', options: BUSINESS_TYPES, key: 'type' },
                           { label: 'Lifecycle', options: BUSINESS_STAGES, key: 'stage' },
                           { label: 'Payload', options: TEAM_SIZES, key: 'teamSize' },
                           { label: 'Strategic Goal', options: PRIMARY_GOALS, key: 'goal' },
                         ].map((item) => (
                           <div key={item.label}>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{item.label}</div>
                              <select 
                                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-bold outline-none cursor-pointer hover:border-slate-700 transition-all appearance-none uppercase text-xs tracking-wider"
                                value={businessCtx[item.key as keyof BusinessContext] || ''}
                                onChange={(e) => setBusinessCtx({...businessCtx, [item.key]: e.target.value})}
                              >
                                 <option value="">SELECT_{item.label.toUpperCase()}</option>
                                 {item.options.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                           </div>
                         ))}
                      </div>

                      <button 
                        onClick={() => setStep(0)}
                        className="w-full group bg-amber-500 text-black py-6 rounded-2xl font-black text-xl uppercase tracking-tighter italic hover:bg-amber-400 transition-all flex items-center justify-center gap-3"
                      >
                        INITIATE DIAGNOSTIC <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                      </button>
                   </div>
                ) : (
                   <div className="space-y-12">
                      <div className="flex justify-between items-center">
                         <div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic">{LAYERS[step].name}</h2>
                            <p className="text-slate-400 font-medium">Dimension {step + 1} of 7</p>
                         </div>
                         <div className="text-right">
                            <div className="text-4xl font-black text-amber-500 leading-none">
                               {layerScore(LAYERS[step].id, answers)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">LAYER_SCORE</div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         {LAYERS[step].questions.map((q, qi) => (
                            <div key={q.id} className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                               <div className="flex gap-4 mb-4">
                                  <span className="text-amber-500 font-mono font-bold">0{qi+1}</span>
                                  <h4 className="text-lg font-bold text-slate-200 leading-tight">{q.question}</h4>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-3 mb-6">
                                   {q.checkboxes.map(cb => {
                                      const checked = checks[q.id]?.[cb.id];
                                      return (
                                        <button 
                                          key={cb.id}
                                          onClick={() => {
                                             const newChecks = { ...checks };
                                             if (!newChecks[q.id]) newChecks[q.id] = {};
                                             newChecks[q.id][cb.id] = !newChecks[q.id][cb.id];
                                             setChecks(newChecks);
                                             const suggested = scoreFromCheckboxes(q.id, newChecks);
                                             setAnswers({...answers, [q.id]: suggested});
                                          }}
                                          className={`text-left p-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all
                                                     ${checked ? 'bg-amber-500 border-amber-500 text-black' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                        >
                                           {cb.label}
                                        </button>
                                      );
                                   })}
                                </div>

                                <div className="flex justify-between items-center gap-4">
                                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Density</div>
                                   <div className="flex-1 flex gap-1">
                                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <button 
                                          key={n}
                                          onClick={() => setAnswers({...answers, [q.id]: n})}
                                          className={`flex-1 h-6 rounded-sm transition-all ${answers[q.id] === n ? 'bg-amber-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                                        />
                                      ))}
                                   </div>
                                   <div className="w-8 text-center font-mono font-bold text-amber-500">{answers[q.id] || 0}</div>
                                </div>
                            </div>
                         ))}
                      </div>

                      <div className="flex gap-4">
                         <button 
                           onClick={() => setStep(step - 1)}
                           className="flex-1 border border-slate-800 py-6 rounded-2xl font-black text-slate-500 uppercase tracking-widest hover:text-white hover:bg-slate-800 transition-all"
                         >
                            PREV_LAYER
                         </button>
                         <button 
                           onClick={handleNext}
                           className="flex-[2] bg-amber-500 text-black py-6 rounded-2xl font-black text-xl uppercase tracking-tighter italic hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                         >
                            {step === 6 ? 'CALCULATE DNA ARCHETYPE' : 'NEXT_LAYER'} <ArrowRight />
                         </button>
                      </div>
                   </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
