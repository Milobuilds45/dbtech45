import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { type DeepPitch } from '@/lib/agent-pitches-data';
import { CheckCircle2, TrendingUp, Search, Target, Briefcase, Zap, Globe, MessageSquare, ListChecks, Square, CheckSquare } from 'lucide-react';
import { brand } from '@/lib/brand';

export function DeepPitchDashboard({ pitch, color }: { pitch: DeepPitch, color: string }) {
  return (
    <div className="flex flex-col gap-6 mt-4 p-2 bg-[#0A0A0B] rounded-lg">
      
      {/* HEADER & TAGS */}
      <div className="flex flex-wrap gap-2 mb-2">
        {pitch.tags.map((tag, i) => (
          <Badge key={i} variant="secondary" className="bg-[#1A1A1D] text-gray-300 hover:bg-[#1A1A1D] border-none font-medium text-xs px-3 py-1">
            <Zap className="w-3 h-3 mr-1.5" style={{ color }} /> {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - Deep Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Executive Summary */}
          <div className="space-y-4 text-[15px] leading-relaxed text-gray-300">
            {pitch.executiveSummary.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <Separator className="bg-[#1A1A1D]" />

          {/* Offer Value Ladder */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5" style={{ color }} /> Offer Structure
            </h3>
            <div className="flex flex-col gap-4 pl-4 border-l-2" style={{ borderColor: `${color}30` }}>
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-1">Lead Magnet</div>
                <div className="font-semibold text-gray-200">{pitch.offerLadder.leadMagnet.title}</div>
                <div className="text-sm text-gray-400 mt-1">{pitch.offerLadder.leadMagnet.desc}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-1">Frontend ({pitch.offerLadder.frontend.price})</div>
                <div className="font-semibold text-gray-200">{pitch.offerLadder.frontend.title}</div>
                <div className="text-sm text-gray-400 mt-1">{pitch.offerLadder.frontend.desc}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-1">Core ({pitch.offerLadder.core.price})</div>
                <div className="font-semibold text-gray-200">{pitch.offerLadder.core.title}</div>
                <div className="text-sm text-gray-400 mt-1">{pitch.offerLadder.core.desc}</div>
              </div>
            </div>
          </div>

          {/* Analysis Sections */}
          {[
            { title: 'Why Now?', content: pitch.sections.whyNow },
            { title: 'Proof & Signals', content: pitch.sections.proofAndSignals },
            { title: 'The Market Gap', content: pitch.sections.marketGap },
            { title: 'Execution Plan', content: pitch.sections.executionPlan }
          ].map((sec, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-xl font-semibold text-white tracking-tight">{sec.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-300">{sec.content}</p>
            </div>
          ))}

        </div>

        {/* RIGHT COLUMN - Metrics & Cards */}
        <div className="flex flex-col gap-4">
          
          {/* Top Score Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-[#111113] border-[#1A1A1D]">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="text-[11px] font-semibold uppercase text-gray-500">Opportunity</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{pitch.scores.opportunity}</span>
                  <span className="text-xs text-gray-400">/ 10</span>
                </div>
                <Progress value={pitch.scores.opportunity * 10} className="h-1 mt-2 bg-[#1A1A1D] [&>div>div]:bg-amber-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#111113] border-[#1A1A1D]">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="text-[11px] font-semibold uppercase text-gray-500">Problem Pain</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{pitch.scores.problem}</span>
                  <span className="text-xs text-gray-400">/ 10</span>
                </div>
                <Progress value={pitch.scores.problem * 10} className="h-1 mt-2 bg-[#1A1A1D] [&>div>div]:bg-red-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#111113] border-[#1A1A1D]">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="text-[11px] font-semibold uppercase text-gray-500">Feasibility</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{pitch.scores.feasibility}</span>
                  <span className="text-xs text-gray-400">/ 10</span>
                </div>
                <Progress value={pitch.scores.feasibility * 10} className="h-1 mt-2 bg-[#1A1A1D] [&>div>div]:bg-blue-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#111113] border-[#1A1A1D]">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="text-[11px] font-semibold uppercase text-gray-500">Why Now</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{pitch.scores.whyNow}</span>
                  <span className="text-xs text-gray-400">/ 10</span>
                </div>
                <Progress value={pitch.scores.whyNow * 10} className="h-1 mt-2 bg-[#1A1A1D] [&>div>div]:bg-amber-500" />
              </CardContent>
            </Card>
          </div>

          {/* Business Fit */}
          <Card className="bg-[#111113] border-[#1A1A1D]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-200">Business Fit</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Revenue Potential</span>
                  <span className="text-sm font-medium text-white">{pitch.businessFit.revenuePotential}</span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10">$$$</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Execution Difficulty</span>
                  <span className="text-sm font-medium text-white">{pitch.businessFit.executionDifficulty} / 10</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Go-To Market</span>
                  <span className="text-sm font-medium text-white">{pitch.businessFit.goToMarket} / 10</span>
                </div>
              </div>
              <Separator className="bg-[#1A1A1D]" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><Target className="w-3 h-3" /> Right for You?</span>
                <span className="text-xs text-gray-300 leading-snug">{pitch.businessFit.targetFounder}</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Keywords */}
          <Card className="bg-[#111113] border-[#1A1A1D]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-200">Top Keywords</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-3">
              {pitch.keywords.map((kw, i) => (
                <div key={i} className="flex justify-between items-center bg-[#141416] p-2 rounded border border-[#1A1A1D]">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-200">{kw.term}</span>
                    <span className="text-[10px] text-green-400">{kw.growth} growth</span>
                  </div>
                  <span className="text-xs text-gray-400">{kw.volume}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card className="bg-[#111113] border-[#1A1A1D]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-200">Categorization</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div><div className="text-[10px] text-gray-500 uppercase">Type</div><div className="text-xs text-gray-200">{pitch.categorization.type}</div></div>
                <div><div className="text-[10px] text-gray-500 uppercase">Market</div><div className="text-xs text-gray-200">{pitch.categorization.market}</div></div>
                <div><div className="text-[10px] text-gray-500 uppercase">Target</div><div className="text-xs text-gray-200">{pitch.categorization.target}</div></div>
                <div><div className="text-[10px] text-gray-500 uppercase">Main Competitor</div><div className="text-xs text-gray-200">{pitch.categorization.competitor}</div></div>
                <div className="col-span-2"><div className="text-[10px] text-gray-500 uppercase">Trend Analysis</div><div className="text-xs text-gray-400 mt-1 leading-snug">{pitch.categorization.trendAnalysis}</div></div>
              </div>
            </CardContent>
          </Card>

          {/* Community Signals */}
          <Card className="bg-[#111113] border-[#1A1A1D]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-200">Community Signals</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-3">
              {pitch.communitySignals.map((sig, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#1A1A1D] flex items-center justify-center text-gray-400">
                    {sig.platform.includes('Twitter') || sig.platform.includes('X') ? <MessageSquare className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-200">{sig.platform}</span>
                    <span className="text-[11px] text-gray-400">{sig.count} {sig.text}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* BUILD GUIDE — Step by Step */}
      {pitch.buildGuide && pitch.buildGuide.length > 0 && (
        <>
          <Separator className="bg-[#1A1A1D] my-2" />
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <ListChecks className="w-5 h-5" style={{ color }} /> What We're Building
            </h3>
            <div className="flex flex-col gap-3">
              {pitch.buildGuide.map((step) => (
                <div key={step.step} className="flex gap-3 p-4 rounded-lg border border-[#1A1A1D] bg-[#0d0d0f] hover:border-[#2A2A2D] transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <Square className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500 tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>STEP {step.step}</span>
                      <span className="text-[11px] text-gray-600">—</span>
                      <span className="text-sm font-semibold text-gray-200 tracking-tight">{step.title}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-gray-400">{step.description}</p>
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
