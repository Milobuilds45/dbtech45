import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { type DeepPitch } from '@/lib/agent-pitches-data';
import { Target, Briefcase, Zap, Globe, MessageSquare, ListChecks, Square } from 'lucide-react';

export function DeepPitchDashboard({ pitch, color }: { pitch: DeepPitch; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '16px', padding: '8px 0' }}>

      {/* TAGS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {pitch.tags.map((tag, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#1A1A1D', color: '#d4d4d8', fontSize: '12px', fontWeight: 500,
            padding: '5px 12px', borderRadius: '6px',
          }}>
            <Zap size={12} style={{ color }} /> {tag}
          </span>
        ))}
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pitch.executiveSummary.map((p, i) => (
          <p key={i} style={{ fontSize: '15px', lineHeight: 1.75, color: '#d4d4d8' }}>{p}</p>
        ))}
      </div>

      <Separator className="bg-[#1A1A1D]" />

      {/* SCORES — 4 cards in a row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Opportunity', value: pitch.scores.opportunity, barColor: color },
          { label: 'Problem', value: pitch.scores.problem, barColor: '#EF4444' },
          { label: 'Feasibility', value: pitch.scores.feasibility, barColor: '#3B82F6' },
          { label: 'Why Now', value: pitch.scores.whyNow, barColor: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', padding: '16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{s.value}</span>
              <span style={{ fontSize: '12px', color: '#71717a' }}>/ 10</span>
            </div>
            <div style={{ height: '4px', background: '#1A1A1D', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.value * 10}%`, background: s.barColor, borderRadius: '4px', transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>

        {/* LEFT — Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Offer Ladder */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} style={{ color }} /> Offer Structure
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px', borderLeft: `2px solid ${color}30` }}>
              {[
                { label: 'LEAD MAGNET', ...pitch.offerLadder.leadMagnet, price: 'Free' },
                { label: `FRONTEND (${pitch.offerLadder.frontend.price})`, ...pitch.offerLadder.frontend },
                { label: `CORE (${pitch.offerLadder.core.price})`, ...pitch.offerLadder.core },
              ].map((tier, i) => (
                <div key={i}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#71717a', marginBottom: '4px' }}>{tier.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7' }}>{tier.title}</div>
                  <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px' }}>{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Sections */}
          {[
            { title: 'Why Now?', text: pitch.sections.whyNow },
            { title: 'Proof & Signals', text: pitch.sections.proofAndSignals },
            { title: 'The Market Gap', text: pitch.sections.marketGap },
            { title: 'Execution Plan', text: pitch.sections.executionPlan },
          ].map((sec, i) => (
            <div key={i}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>{sec.title}</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#a1a1aa' }}>{sec.text}</p>
            </div>
          ))}
        </div>

        {/* RIGHT — Sidebar cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Business Fit */}
          <div style={{ background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '16px' }}>Business Fit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>Revenue Potential</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginTop: '2px' }}>{pitch.businessFit.revenuePotential}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>Execution</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{pitch.businessFit.executionDifficulty} / 10</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>Go-To-Market</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{pitch.businessFit.goToMarket} / 10</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #1A1A1D', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: '#71717a', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Target size={12} /> Right for You?
                </div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5 }}>{pitch.businessFit.targetFounder}</div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div style={{ background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '14px' }}>Top Keywords</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pitch.keywords.map((kw, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#141416', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1A1A1D',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#e4e4e7' }}>{kw.term}</div>
                    <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px' }}>{kw.growth} growth</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>{kw.volume}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categorization */}
          <div style={{ background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '14px' }}>Categorization</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { l: 'TYPE', v: pitch.categorization.type },
                { l: 'MARKET', v: pitch.categorization.market },
                { l: 'TARGET', v: pitch.categorization.target },
                { l: 'COMPETITOR', v: pitch.categorization.competitor },
              ].map((c, i) => (
                <div key={i}>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#52525b' }}>{c.l}</div>
                  <div style={{ fontSize: '12px', color: '#d4d4d8', marginTop: '2px' }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', borderTop: '1px solid #1A1A1D', paddingTop: '12px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#52525b' }}>TREND</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px', lineHeight: 1.5 }}>{pitch.categorization.trendAnalysis}</div>
            </div>
          </div>

          {/* Community Signals */}
          <div style={{ background: '#111113', border: '1px solid #1A1A1D', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', marginBottom: '14px' }}>Community Signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pitch.communitySignals.map((sig, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', background: '#1A1A1D',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {sig.platform.includes('Twitter') || sig.platform.includes('X') ? <MessageSquare size={14} color="#71717a" /> : <Globe size={14} color="#71717a" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#e4e4e7' }}>{sig.platform}</div>
                    <div style={{ fontSize: '11px', color: '#71717a' }}>{sig.count} {sig.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BUILD GUIDE */}
      {pitch.buildGuide && pitch.buildGuide.length > 0 && (
        <>
          <Separator className="bg-[#1A1A1D]" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListChecks size={18} style={{ color }} /> What We're Building
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pitch.buildGuide.map((step) => (
                <div key={step.step} style={{
                  display: 'flex', gap: '14px', padding: '16px', borderRadius: '10px',
                  border: '1px solid #1A1A1D', background: '#0d0d0f',
                }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    <Square size={16} color="#52525b" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>STEP {step.step}</span>
                      <span style={{ fontSize: '11px', color: '#3f3f46' }}>—</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7' }}>{step.title}</span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#a1a1aa' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
