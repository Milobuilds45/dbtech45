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
   Lab/Intelligence UI Components (Ideabrowser Skin)
   ═══════════════════════════════════════════════════════ */

const LabBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0" style={{ background: '#f8fafc' }}>
    <div className="absolute inset-0 opacity-[0.03]" 
         style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    <div className="absolute top-0 left-0 w-full h-1" style={{ background: '#4f46e5' }} />
  </div>
);

const LabTag = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`inline-block px-3 py-1 bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold tracking-widest rounded border border-indigo-100 uppercase ${className}`}>
    {children}
  </div>
);

const BentoCard = ({ children, className = "", onClick, active = false }: { children: React.ReactNode, className?: string, onClick?: () => void, active?: boolean }) => (
  <div 
    onClick={onClick}
    className={`relative group bg-white border transition-all duration-300 rounded-2xl p-6 cursor-pointer
               ${active ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg shadow-sm'} 
               ${className}`}
  >
    {children}
  </div>
);

const Sparkline = ({ score }: { score: number }) => {
  const points = [10, 40, 25, 60, 45, 80, 50, 95];
  const color = score > 0 ? '#4f46e5' : '#94a3b8';
  return (
    <svg width="80" height="24" className="opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.map((p, i) => `${i * 11},${24 - (p * 0.2)}`).join(' ')}
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
    }, 2000);
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
      <div style={{ background: '#f8fafc', color: '#0f172a' }} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
        <LabBackground />
        <div className="z-10 text-center px-6">
          <Activity className="w-16 h-16 text-indigo-600 mb-8 mx-auto animate-pulse" />
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-4 uppercase">Validating Business Model DNA</h2>
          <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mx-auto border border-slate-300">
            <div className="h-full bg-indigo-600 animate-progress" />
          </div>
          <p className="mt-4 text-slate-500 font-mono text-[10px] tracking-widest uppercase">
            Cross-referencing 28 diagnostic parameters...
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div style={{ background: '#f8fafc', color: '#0f172a' }} className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 relative">
        <LabBackground />
        <div className="max-w-6xl mx-auto relative z-10">
           {/* Result Header */}
           <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8 border-b border-slate-200 pb-12">
              <div>
                <LabTag className="mb-4">DIAGNOSTIC_RESULT // {overallLabel(op).toUpperCase()}</LabTag>
                <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2 uppercase">DNA INTELLIGENCE REPORT</h1>
                <p className="text-slate-500 font-medium">Prepared for {email} • {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => generatePDF(answers, email, null, businessCtx, checks)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  <Download size={18} /> EXPORT PDF
                </button>
                <button 
                  onClick={() => { setShowResults(false); setStep(-1); setAnswers({}); setChecks({}); }}
                  className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  NEW ASSESSMENT
                </button>
              </div>
           </div>

           {/* Executive Grid */}
           <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <BentoCard className="lg:col-span-2 flex flex-col md:flex-row items-center gap-12 py-10">
                 <div className="relative">
                    <div className="w-40 h-40 rounded-full border-8 border-slate-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-black text-indigo-600 leading-none">{os}</div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">INDEX</div>
                      </div>
                    </div>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="80" cy="80" r="76" fill="none" 
                        stroke="currentColor" strokeWidth="8" 
                        className="text-indigo-600" 
                        strokeDasharray="477" 
                        strokeDashoffset={477 - (477 * os / 10)} 
                        strokeLinecap="round"
                      />
                    </svg>
                 </div>
                 <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 tracking-tight text-slate-800 uppercase">{overallLabel(op)}</h3>
                    <p className="text-slate-500 leading-relaxed mb-6 font-medium">
                      {op >= 70 
                        ? "Your business model shows high structural integrity and is prepared for rapid expansion." 
                        : op >= 50 
                        ? "Viable core detected with moderate risk. Focus on optimizing underperforming layers." 
                        : "Strategic vulnerabilities detected. The current model requires immediate intervention."}
                    </p>
                    <div className="flex gap-3">
                       <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Efficiency</div>
                          <div className="text-lg font-black text-indigo-600">{op}%</div>
                       </div>
                       <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Risk Factor</div>
                          <div className="text-lg font-black text-slate-700">{op < 50 ? "HIGH" : "LOW"}</div>
                       </div>
                    </div>
                 </div>
              </BentoCard>

              <BentoCard className="bg-indigo-50/50 border-indigo-100">
                 <h4 className="font-bold text-indigo-600 mb-6 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                   <Target size={14} /> Priority Action Plan
                 </h4>
                 <div className="space-y-4">
                    {getPriorityActions(answers).map((p, i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.layerName}</span>
                           <span className="text-[10px] font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded">{p.score}/10</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-normal font-semibold">{p.action}</p>
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
                  <BentoCard key={l.id} className="group hover:ring-2 ring-indigo-100">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-2.5 bg-slate-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {ICONS[l.iconName]}
                       </div>
                       <div className="text-right">
                          <div className="text-2xl font-black text-slate-900">{sc}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">LAYER {l.id}</div>
                       </div>
                    </div>
                    <h4 className="text-md font-bold mb-2 tracking-tight text-slate-800 uppercase">{l.shortName} Analysis</h4>
                    <div className="flex items-center gap-3 mb-4">
                       <Sparkline score={sc} />
                       <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Trend</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-6 h-8 font-medium">{layerRec(l.id, sc)}</p>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-300 uppercase">Assessment</span>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${sc >= 7 ? 'text-indigo-600' : sc >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>
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
    <div style={{ background: '#f8fafc', color: '#0f172a' }} className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 relative selection:bg-indigo-600 selection:text-white font-sans">
      <LabBackground />
      <style jsx global>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress { animation: progress 2s ease-in-out; }
      `}</style>

      {showEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white border border-slate-200 p-10 rounded-3xl max-w-lg w-full shadow-2xl">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 border border-indigo-100">
                    <Mail size={32} />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight mb-2 uppercase text-slate-900">Finalizing Report</h2>
                 <p className="text-slate-500 font-medium">Enter your credentials to extract the full tactical brief and priority action plan.</p>
              </div>
              <input 
                type="email" 
                placeholder="EMAIL@COMMAND.IO"
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-mono mb-4 focus:border-indigo-600 outline-none transition-all uppercase text-xs tracking-widest"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                onClick={() => handleEmailSubmit(email)}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                Access Diagnostic Brief
              </button>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Progress Stepper */}
        <div className="flex gap-2 mb-16 max-w-md mx-auto">
           {[...Array(8)].map((_, i) => (
             <div 
               key={i} 
               className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i-1 ? 'bg-indigo-600' : 'bg-slate-200'}`}
             />
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
           {/* Left Content */}
           <div className="lg:col-span-5 space-y-8">
              <div>
                <LabTag className="mb-4">DIAGNOSTIC_INIT // STEP_0{step + 2}</LabTag>
                <h1 className="text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 uppercase">
                  BUSINESS<br/><span className="text-indigo-600">DNA SCANNER</span>
                </h1>
                <p className="text-slate-500 mt-8 text-xl font-medium leading-relaxed max-w-md">
                  {step === -1 
                    ? "Initialize your session by documenting the core business context for cross-dimensional analysis." 
                    : `Analyzing ${LAYERS[step].name}. Evaluate your internal maturity across these 4 data points.`}
                </p>
              </div>

              {/* Grid Preview */}
              <div className="grid grid-cols-4 gap-3 pt-10 border-t border-slate-200">
                 {LAYERS.map((l, i) => (
                   <div key={l.id} className={`p-3 rounded-xl border flex items-center justify-center transition-all ${step === i ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {ICONS[l.iconName]}
                   </div>
                 ))}
                 <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                    <Layers size={20} />
                 </div>
              </div>
           </div>

           {/* Right Interactive Area */}
           <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/10" />
                
                {step === -1 ? (
                   <div className="space-y-12">
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Search size={12} className="text-indigo-600" /> Executive Summary
                        </div>
                        <textarea 
                          className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-800 font-medium text-lg focus:border-indigo-600 focus:bg-white outline-none transition-all min-h-[180px] shadow-inner"
                          placeholder="Describe the business model and primary value proposition..."
                          value={businessCtx.description || ''}
                          onChange={(e) => setBusinessCtx({...businessCtx, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                         {[
                           { label: 'Archetype', options: BUSINESS_TYPES, key: 'type' },
                           { label: 'Market Life', options: BUSINESS_STAGES, key: 'stage' },
                           { label: 'Team Load', options: TEAM_SIZES, key: 'teamSize' },
                           { label: 'Objective', options: PRIMARY_GOALS, key: 'goal' },
                         ].map((item) => (
                           <div key={item.label}>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.label}</div>
                              <select 
                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold outline-none cursor-pointer hover:border-indigo-300 hover:bg-white transition-all appearance-none uppercase text-[10px] tracking-wider"
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
                        className="w-full group bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-100 active:scale-[0.98]"
                      >
                        Start Diagnostic Scan <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                      </button>
                   </div>
                ) : (
                   <div className="space-y-12">
                      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                         <div>
                            <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Layer {step + 1}</h2>
                            <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs">{LAYERS[step].name}</p>
                         </div>
                         <div className="text-right">
                            <div className="text-5xl font-black text-indigo-600 leading-none">
                               {layerScore(LAYERS[step].id, answers)}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">DIMENSION_IQ</div>
                         </div>
                      </div>

                      <div className="space-y-10">
                         {LAYERS[step].questions.map((q, qi) => (
                            <div key={q.id} className="space-y-6">
                               <div className="flex gap-5">
                                  <span className="text-indigo-600 font-mono font-black text-lg">0{qi+1}</span>
                                  <h4 className="text-xl font-bold text-slate-800 leading-tight">{q.question}</h4>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-3 pl-10">
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
                                          className={`text-left p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all
                                                     ${checked ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-indigo-200'}`}
                                        >
                                           {cb.label}
                                        </button>
                                      );
                                   })}
                                </div>

                                <div className="flex justify-between items-center gap-6 pl-10">
                                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Density</div>
                                   <div className="flex-1 flex gap-1.5 h-3">
                                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <button 
                                          key={n}
                                          onClick={() => setAnswers({...answers, [q.id]: n})}
                                          className={`flex-1 rounded-sm transition-all ${answers[q.id] === n ? 'bg-indigo-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                                        />
                                      ))}
                                   </div>
                                   <div className="w-8 text-center font-mono font-black text-indigo-600">{answers[q.id] || 0}</div>
                                </div>
                            </div>
                         ))}
                      </div>

                      <div className="flex gap-4 pt-10">
                         <button 
                           onClick={() => setStep(step - 1)}
                           className="flex-1 border border-slate-200 py-5 rounded-2xl font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 hover:bg-slate-50 transition-all text-xs"
                         >
                            PREV_LAYER
                         </button>
                         <button 
                           onClick={handleNext}
                           className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-100 active:scale-[0.98]"
                         >
                            {step === 6 ? 'Generate Intelligence Brief' : 'Next_Layer'} <ArrowRight />
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
