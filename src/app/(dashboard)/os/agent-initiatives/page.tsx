'use client';

import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import {
  ChevronDown, Plus, Trash2,
  User, Users, Lightbulb, CheckCircle2, XCircle, Zap, Shield, Sparkles,
} from 'lucide-react';
import { generateCollaborativeIdea as generateRealCollaboration } from '@/lib/agent-collaboration';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pitch {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  tldr: string;
  fullPlan: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'nixed';
}

type IdeaMode = 'individual' | 'collaborative';
type CreativityLevel = 'simple' | 'creative' | 'experimental';

// ─── Agent Registry ───────────────────────────────────────────────────────────
const agents = [
  { id: 'bobby', name: 'Bobby Axelrod', emoji: '💰', role: 'Chief Investment Officer', color: '#10B981' },
  { id: 'paula', name: 'Paula', emoji: '🎨', role: 'Creative & Design', color: '#EC4899' },
  { id: 'anders', name: 'Anders', emoji: '⚙️', role: 'IT / DevOps', color: '#3B82F6' },
  { id: 'wendy', name: 'Wendy', emoji: '🧘', role: 'Personal & Wellness', color: '#8B5CF6' },
  { id: 'remy', name: 'Remy', emoji: '🍽️', role: 'Restaurant Ops', color: '#F97316' },
  { id: 'dwight', name: 'Dwight', emoji: '🕵️', role: 'Research & Intel', color: '#EAB308' },
  { id: 'milo', name: 'Milo', emoji: '📋', role: 'Senior Advisor & Systems', color: '#6366F1' },
  { id: 'dax', name: 'Dax', emoji: '📊', role: 'Data & Analytics', color: '#06B6D4' },
];

const STORAGE_KEY = 'agent-pitches-v2';
const NIXED_KEY = 'agent-pitches-nixed';

// ─── Idea Templates (per agent × creativity level) ───────────────────────────
interface IdeaTemplate {
  title: string;
  description: string;
  plainEnglish: string;
  problemSolved: string;
  targetMarket: string;
  businessModel: string;
  revenueProjection: string;
  competitiveAdvantage: string;
  developmentTime: string;
  riskAssessment: string;
}

const T: Record<string, Record<CreativityLevel, IdeaTemplate>> = {
  bobby: {
    simple: {
      title: 'Ticker Whisperer',
      description: 'Simple English stock alerts via text. No charts, no jargon.',
      plainEnglish: 'A texting service that sends you simple stock tips in plain English — "buy this, here\'s why" — from an AI that watches the market 24/7.',
      problemSolved: 'Normal people want stock gains but every trading app feels like a cockpit',
      targetMarket: 'Busy professionals who want extra income without learning finance jargon',
      businessModel: '$19/month subscription for daily text alerts',
      revenueProjection: 'Conservative: $114K/yr (500 subs). Aggressive: $570K/yr (2,500 subs)',
      competitiveAdvantage: 'While every app tries to impress with complexity, we make it simple enough for your mom',
      developmentTime: '48 hours for MVP',
      riskAssessment: 'Low risk — people already pay for stock advice.',
    },
    creative: {
      title: 'FlowHawk',
      description: 'Real-time options flow tracking with AI pattern recognition for retail traders.',
      plainEnglish: 'See what hedge funds are betting on in real time. When a fund drops $5M on Tesla calls, you see it instantly.',
      problemSolved: 'Retail traders miss 80% of opportunities due to lack of institutional-grade data',
      targetMarket: 'Active retail traders ($10K-$500K accounts)',
      businessModel: 'Tiered SaaS: $49/mo retail, $199/mo professional',
      revenueProjection: 'Conservative: $180K/yr. Aggressive: $1.2M/yr',
      competitiveAdvantage: 'First retail-accessible platform with institutional-grade options flow',
      developmentTime: '2-3 days MVP, 1 week to refine AI',
      riskAssessment: 'Moderate — data provider fees are high, accuracy needs validation.',
    },
    experimental: {
      title: 'SentinelVault',
      description: 'AI that reads sentiment and auto-hedges your portfolio before crashes hit.',
      plainEnglish: 'An AI bodyguard for your portfolio. Reads Twitter, news, trading data. Buys protection before you know something\'s wrong.',
      problemSolved: 'Traders get caught in sentiment-driven crashes because manual hedging is too slow',
      targetMarket: 'Professional traders with $500K+ portfolios',
      businessModel: '$2K/month + performance fees on protected losses',
      revenueProjection: 'Conservative: $480K/yr. Aggressive: $5M/yr',
      competitiveAdvantage: 'First autonomous hedging system driven by multi-source sentiment',
      developmentTime: '1 week MVP, 2-3 weeks for brokerage integrations',
      riskAssessment: 'HIGH RISK — autonomous trading carries enormous liability. Needs extensive backtesting.',
    },
  },
  paula: {
    simple: {
      title: 'MarkCraft',
      description: 'Type your business name, get 10 professional logos in 60 seconds.',
      plainEnglish: 'Type your business name, pick from 10 logos, download. No designer, no $500 bill, no two-week wait.',
      problemSolved: 'New businesses need logos now but designers take weeks and cost hundreds',
      targetMarket: 'Entrepreneurs and freelancers who need a logo today',
      businessModel: 'Free basic logos, $19 for high-res downloads',
      revenueProjection: 'Conservative: $57K/yr. Aggressive: $456K/yr',
      competitiveAdvantage: 'Speed — options in under a minute while others make you wait weeks',
      developmentTime: '24 hours for MVP',
      riskAssessment: 'Safe bet — clear demand, risk is competing with free options.',
    },
    creative: {
      title: 'Brandforge',
      description: 'AI brand identity generator — logo, colors, typography, guidelines, social templates.',
      plainEnglish: 'Give it your business name. Get your entire brand look: logo, colors, fonts, templates. Everything a $5K agency delivers, done in minutes.',
      problemSolved: 'Small businesses pay $2K-$5K for branding they could get for under $100',
      targetMarket: 'Small business owners starting new ventures',
      businessModel: 'One-time: $47 basic, $97 premium, $197 complete',
      revenueProjection: 'Conservative: $140K/yr. Aggressive: $960K/yr',
      competitiveAdvantage: 'Professional quality at 95% cost reduction',
      developmentTime: '2-3 days core engine, 1 week for templates',
      riskAssessment: 'Moderate — AI brands can feel generic. Competition from Looka is real.',
    },
    experimental: {
      title: 'MoodShift',
      description: 'Design system that adapts UI in real-time based on user emotional state.',
      plainEnglish: 'A website that tells when you\'re frustrated and simplifies itself. When you\'re engaged, it shows more options. The interface reads your mood.',
      problemSolved: 'Static designs ignore that users interact differently based on emotional state',
      targetMarket: 'Enterprise UX teams and cutting-edge product companies',
      businessModel: 'Enterprise SDK: $3K/month + consulting',
      revenueProjection: 'Conservative: $360K/yr. Aggressive: $3.6M/yr',
      competitiveAdvantage: 'First design system using behavioral signals for real-time UI adaptation',
      developmentTime: '3-5 days SDK, 2-3 weeks ML training',
      riskAssessment: 'HIGH RISK — detecting emotion from behavior alone is unreliable. No research validates this.',
    },
  },
  anders: {
    simple: {
      title: 'ShipIt',
      description: 'One-click deployment for web apps. Connect repo, click deploy, get a URL.',
      plainEnglish: 'You built a website. Click one button. It\'s live. No config, no DevOps degree. Just click and share.',
      problemSolved: 'Developers waste hours on deployment config instead of building',
      targetMarket: 'Individual developers and small teams',
      businessModel: '$5/month base + $0.01 per deployment hour',
      revenueProjection: 'Conservative: $90K/yr. Aggressive: $750K/yr',
      competitiveAdvantage: 'Simpler than Vercel. Zero config.',
      developmentTime: '24-48 hours MVP',
      riskAssessment: 'Low risk — proven market, competing on simplicity.',
    },
    creative: {
      title: 'Stackblox',
      description: 'Drag-and-drop app builder for non-technical people.',
      plainEnglish: 'Drag boxes to build a real app. Connect "Customer" to "Payment" to "Text Message", hit launch. No coding, no $45K developer bill.',
      problemSolved: 'Small businesses need custom software but developers cost more than they earn',
      targetMarket: 'Non-technical small business owners',
      businessModel: '$29/month base + $0.10 per transaction',
      revenueProjection: 'Conservative: $210K/yr. Aggressive: $2M/yr',
      competitiveAdvantage: 'Works like Squarespace but builds business logic instead of websites',
      developmentTime: '3-5 days visual editor, 2 weeks integrations',
      riskAssessment: 'Medium — need to prove non-technical people can really use it.',
    },
    experimental: {
      title: 'Archetype',
      description: 'AI that designs entire app architectures from English and generates production code.',
      plainEnglish: 'Describe your app like "Airbnb for pet sitting" — AI designs the system and writes all production-ready code.',
      problemSolved: 'Even experienced devs spend weeks architecting systems that could be generated',
      targetMarket: 'Development agencies and enterprise teams',
      businessModel: '$999 per app + $199/month maintenance',
      revenueProjection: 'Conservative: $360K/yr. Aggressive: $4M/yr',
      competitiveAdvantage: 'First AI that generates complete production-ready systems',
      developmentTime: '1 week MVP, 2-3 weeks enterprise patterns',
      riskAssessment: 'HIGH RISK — AI-generated architecture quality is inconsistent. Cursor/Copilot moving fast.',
    },
  },
  dwight: {
    simple: {
      title: 'Morning Wire',
      description: 'Personalized daily news briefings with AI summaries.',
      plainEnglish: 'Every morning: email with the 5 most important things in your industry. No scrolling. 2 minutes.',
      problemSolved: 'Busy professionals need relevant news but can\'t filter through noise',
      targetMarket: 'Executives needing industry-specific news',
      businessModel: '$19/month individual, $99/month team',
      revenueProjection: 'Conservative: $114K/yr. Aggressive: $1.1M/yr',
      competitiveAdvantage: 'Human-curated sources with AI personalization',
      developmentTime: '24 hours MVP',
      riskAssessment: 'Low risk — proven format. Main risk is differentiation.',
    },
    creative: {
      title: 'SignalFront',
      description: 'AI that detects weak signals and predicts trends before mainstream awareness.',
      plainEnglish: 'Spots trends before they blow up. You get an alert 3 weeks before everyone else finds out on TikTok.',
      problemSolved: 'Businesses react to trends instead of anticipating them',
      targetMarket: 'Strategy consultants, VCs, Fortune 500 teams',
      businessModel: 'Enterprise SaaS: $2,999/month + custom research',
      revenueProjection: 'Conservative: $540K/yr. Aggressive: $4.5M/yr',
      competitiveAdvantage: 'Only AI trained specifically on weak signal detection',
      developmentTime: '3-5 days engine, 2 weeks tuning',
      riskAssessment: 'Moderate — "predicting trends" is extraordinary. False predictions destroy credibility.',
    },
    experimental: {
      title: 'Hivemind Intel',
      description: 'Crowdsourced intelligence: human analysts + AI collaborate on research.',
      plainEnglish: 'A network of researchers and AI answering hard business questions together. Post a question, get a research report.',
      problemSolved: 'Traditional intelligence is either expensive consultants or incomplete AI',
      targetMarket: 'Large corporations needing deep intelligence',
      businessModel: '20% platform fee + $5K/month access',
      revenueProjection: 'Conservative: $1.2M/yr. Aggressive: $12M/yr',
      competitiveAdvantage: 'First platform combining human intelligence with AI scale',
      developmentTime: '1 week MVP, 3 weeks analyst network',
      riskAssessment: 'HIGH RISK — two-sided marketplace cold start. Security concerns limit enterprise adoption.',
    },
  },
  dax: {
    simple: {
      title: 'ChartDrop',
      description: 'Paste data, pick style, download beautiful chart. Three clicks.',
      plainEnglish: 'Copy numbers from spreadsheet, paste, pick a style, download. Boss thinks you hired a designer.',
      problemSolved: 'Most people need charts but find existing tools too complicated or ugly',
      targetMarket: 'Business owners, students, professionals',
      businessModel: 'Free basic, $9/month premium templates',
      revenueProjection: 'Conservative: $65K/yr. Aggressive: $432K/yr',
      competitiveAdvantage: 'Fastest chart creation with beautiful defaults',
      developmentTime: '12-24 hours MVP',
      riskAssessment: 'Low risk — thin moat but proven demand.',
    },
    creative: {
      title: 'NarrativeIQ',
      description: 'Converts raw data into executive presentations with narrative, not just charts.',
      plainEnglish: 'Upload messy spreadsheet. Get polished presentation with charts AND a story explaining what the data means. 4 minutes, not 4 hours.',
      problemSolved: 'Data analysts spend 80% of time formatting instead of finding insights',
      targetMarket: 'Data analysts, consultants, executives',
      businessModel: '$79/month individual, $299/month team',
      revenueProjection: 'Conservative: $190K/yr. Aggressive: $1.8M/yr',
      competitiveAdvantage: 'Only platform combining statistical rigor with executive narrative',
      developmentTime: '2-3 days engine, 1 week templates',
      riskAssessment: 'Moderate — AI narratives need to be accurate and non-obvious to have value.',
    },
    experimental: {
      title: 'SimVault',
      description: 'AI business simulations from real data. Test "what if" before risking real money.',
      plainEnglish: 'A "what if" machine. What if we raise prices 10%? Open a second location? Recession hits? See what happens before risking money.',
      problemSolved: 'Executives make million-dollar decisions on static spreadsheets',
      targetMarket: 'Fortune 1000 strategy teams and consulting firms',
      businessModel: '$10K setup + $2K/month per simulation',
      revenueProjection: 'Conservative: $480K/yr. Aggressive: $5M/yr',
      competitiveAdvantage: 'First business simulation using real company data and AI modeling',
      developmentTime: '1 week MVP, 2-3 weeks enterprise connectors',
      riskAssessment: 'HIGH RISK — simulation accuracy depends on data quality, which is usually terrible.',
    },
  },
  milo: {
    simple: {
      title: 'Heartbeat',
      description: '3 minutes daily — enter numbers, get green or red arrow. Business health, simplified.',
      plainEnglish: 'Type yesterday\'s sales and expenses. App shows one thing: is your business getting better or worse? Green up, red down.',
      problemSolved: 'Small business owners work hard but have no idea if they\'re making progress',
      targetMarket: 'Small businesses under 10 employees',
      businessModel: '$29/month subscription',
      revenueProjection: 'Conservative: $104K/yr. Aggressive: $870K/yr',
      competitiveAdvantage: 'Designed for corner stores, not Fortune 500. 3 minutes daily.',
      developmentTime: '24-48 hours MVP',
      riskAssessment: 'Low risk — clear value, challenge is convincing tight budgets.',
    },
    creative: {
      title: 'CommandDeck',
      description: 'One dashboard to orchestrate multiple AI agents for business automation.',
      plainEnglish: 'One command center for all your AI tools. Stop juggling 8 tools that don\'t talk to each other.',
      problemSolved: 'Businesses want AI but struggle to coordinate multiple tools',
      targetMarket: 'SMBs and operations teams',
      businessModel: '$49/month base + $19/month per agent',
      revenueProjection: 'Conservative: $234K/yr. Aggressive: $2.4M/yr',
      competitiveAdvantage: 'Only platform designed for multi-agent coordination with business context',
      developmentTime: '3-5 days MVP, 2 weeks templates',
      riskAssessment: 'Moderate — LangChain and CrewAI moving fast. Need business-specific templates.',
    },
    experimental: {
      title: 'BenchmarkCloud',
      description: 'Businesses share anonymized data to benchmark against peers. Bloomberg Terminal for SMBs.',
      plainEnglish: 'Hundreds of businesses secretly share numbers. Now you know: am I paying too much rent? Is my margin normal? Glassdoor for business performance.',
      problemSolved: 'Small businesses operate in silos, missing collective intelligence',
      targetMarket: 'Forward-thinking SMBs wanting collective optimization',
      businessModel: '$299/month participation fee',
      revenueProjection: 'Conservative: $430K/yr. Aggressive: $9M/yr',
      competitiveAdvantage: 'First collective business intelligence with privacy preservation',
      developmentTime: '1 week MVP, 3 weeks benchmarking engine',
      riskAssessment: 'HIGH RISK — businesses paranoid about sharing data. Network effects require critical mass.',
    },
  },
  remy: {
    simple: {
      title: 'PostPilot',
      description: 'Generate a week of social posts in 5 minutes from one topic.',
      plainEnglish: 'Tell it your business. Get a full week of Instagram, Twitter, Facebook posts. Copy, paste, done.',
      problemSolved: 'Business owners know they need to post but can\'t spend hours on content',
      targetMarket: 'Solo business owners and freelancers',
      businessModel: '$19/month or $179/year',
      revenueProjection: 'Conservative: $68K/yr. Aggressive: $684K/yr',
      competitiveAdvantage: 'Fastest time-to-content with brand consistency',
      developmentTime: '12-24 hours MVP',
      riskAssessment: 'Low risk — proven format, low moat.',
    },
    creative: {
      title: 'ViralScore',
      description: 'AI scores content virality before you publish and suggests optimizations.',
      plainEnglish: 'Before you post, run it through this. Score out of 100 on virality + what to change. Spell-checker for engagement.',
      problemSolved: 'Businesses publish blindly instead of predicting engagement',
      targetMarket: 'Social media managers, influencers, marketing teams',
      businessModel: '$0.50/scan or $79/month unlimited',
      revenueProjection: 'Conservative: $142K/yr. Aggressive: $1.2M/yr',
      competitiveAdvantage: 'Trained on engagement patterns humans can\'t see',
      developmentTime: '3-5 days scoring engine, 2 weeks ML training',
      riskAssessment: 'Moderate — virality prediction is inherently unreliable. Manage expectations.',
    },
    experimental: {
      title: 'CampaignHive',
      description: 'Virtual creative agency made of AI agents. One writes, one designs, one edits, one schedules.',
      plainEnglish: 'A marketing agency made entirely of AI. Describe the campaign, they execute. No human agency, no $10K retainer.',
      problemSolved: 'Content agencies are expensive and slow; single AI tools lack depth',
      targetMarket: 'Mid-market brands managing multiple campaigns',
      businessModel: '$2K-$10K per campaign + $499/month platform',
      revenueProjection: 'Conservative: $600K/yr. Aggressive: $7M/yr',
      competitiveAdvantage: 'First multi-AI creative network mimicking agency dynamics',
      developmentTime: '1 week pipeline, 2-3 weeks orchestration',
      riskAssessment: 'HIGH RISK — multi-agent creative output is inconsistent. Brand safety is a minefield.',
    },
  },
  wendy: {
    simple: {
      title: 'StreakKeeper',
      description: 'Daily habit tracker with streaks and gentle accountability nudges.',
      plainEnglish: 'Check off daily habits, watch streaks grow. Miss a day, get a gentle nudge. Simple enough you\'ll actually use it.',
      problemSolved: 'People start habits but quit in 2 weeks because trackers are too complex or boring',
      targetMarket: 'Individuals building better habits',
      businessModel: 'Free 3 habits, $9/month unlimited + coaching',
      revenueProjection: 'Conservative: $65K/yr. Aggressive: $540K/yr',
      competitiveAdvantage: 'Psychology-backed nudges that help habits stick, not just track them',
      developmentTime: '12-24 hours MVP',
      riskAssessment: 'Low risk — proven category. Coaching angle differentiates.',
    },
    creative: {
      title: 'PeakState',
      description: 'AI coaching that learns YOUR patterns and optimizes your schedule around energy.',
      plainEnglish: 'Personal coach that notices your best work at 10am and crash at 2pm, schedules accordingly. $500/hr coach for $49/month.',
      problemSolved: 'High performers plateau because generic advice ignores individual patterns',
      targetMarket: 'Professionals and entrepreneurs ($75K+ income)',
      businessModel: '$49/month individual, $199/month team',
      revenueProjection: 'Conservative: $176K/yr. Aggressive: $1.5M/yr',
      competitiveAdvantage: 'Only tool that adapts to individual energy patterns',
      developmentTime: '3-5 days tracking + coaching, 2 weeks dashboards',
      riskAssessment: 'Moderate — performance coaching is subjective, hard to prove ROI.',
    },
    experimental: {
      title: 'BurnShield',
      description: 'AI detects burnout 3 weeks before you realize it and auto-adjusts workload.',
      plainEnglish: 'Watches typing speed, hours, email patterns. Warns you before burnout. Lightens schedule automatically. Check engine light for humans.',
      problemSolved: 'Burnout costs $300B+ annually and people don\'t recognize it until too late',
      targetMarket: 'Companies with knowledge workers (prevent turnover)',
      businessModel: '$15/employee/month with wellness dashboards',
      revenueProjection: 'Conservative: $450K/yr. Aggressive: $6M/yr',
      competitiveAdvantage: 'First system predicting burnout from digital behavior',
      developmentTime: '1 week signal collection, 2-3 weeks prediction tuning',
      riskAssessment: 'HIGH RISK — employee surveillance concerns. Burnout prediction from digital signals is unvalidated.',
    },
  },
};

// ─── Generators ───────────────────────────────────────────────────────────────
function genIndividual(agentIds: string[], creativity: CreativityLevel): Pitch[] {
  const out: Pitch[] = [];
  const now = new Date();
  agentIds.forEach(agentId => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    const set = T[agentId]; if (!set) return;
    const tmpl = set[creativity]; if (!tmpl) return;
    out.push({
      id: `${agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      agentName: agent.name,
      title: tmpl.title,
      tldr: tmpl.plainEnglish || tmpl.description,
      fullPlan: [
        `**Problem:** ${tmpl.problemSolved}`,
        `**Target Market:** ${tmpl.targetMarket}`,
        `**Business Model:** ${tmpl.businessModel}`,
        `**Revenue Projection:** ${tmpl.revenueProjection}`,
        `**Competitive Advantage:** ${tmpl.competitiveAdvantage}`,
        `**Time to Build:** ${tmpl.developmentTime}`,
        `**Risk Assessment:** ${tmpl.riskAssessment}`,
      ].join('\n\n'),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      status: 'pending',
    });
  });
  return out;
}

function genCollab(agentIds: string[], creativity: CreativityLevel): Pitch {
  const now = new Date();
  try {
    const c = generateRealCollaboration(agentIds, creativity);
    const names = c.collaboratingAgents.map((cid: string) => agents.find(a => a.id === cid)?.name || cid).join(' + ');
    return {
      id: `collab-${Date.now()}`,
      agentId: 'collaborative',
      agentName: names,
      title: c.title,
      tldr: c.description,
      fullPlan: [
        `**Problem:** ${c.sevenLayers.problem}`,
        `**Target:** ${c.sevenLayers.people}`,
        `**Model:** ${c.pricing.model} — $${c.pricing.pricePoint}/mo`,
        `**Revenue:** ${c.sevenLayers.profit}`,
        `**Advantage:** ${c.competitiveAdvantage}`,
        `**Timeline:** ${c.realisticTimeline.total}`,
        `**Risk:** ${c.riskAssessment || 'TBD'}`,
      ].join('\n\n'),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      status: 'pending',
    };
  } catch {
    const names = agentIds.map(id => agents.find(a => a.id === id)?.name).filter(Boolean);
    return {
      id: `collab-${Date.now()}`,
      agentId: 'collaborative',
      agentName: names.join(' + '),
      title: `${names.join(' + ')} Collaboration`,
      tldr: `Cross-domain platform combining ${names.join(' and ')} expertise.`,
      fullPlan: `**Problem:** Complex problems need multi-disciplinary solutions.\n\n**Advantage:** Combined ${names.join(', ')} expertise\n\n**Timeline:** 4-6 weeks`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      status: 'pending',
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentInitiativesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [nixedPitches, setNixedPitches] = useState<Pitch[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [expandedPitch, setExpandedPitch] = useState<string | null>(null);
  const [kanbanMsg, setKanbanMsg] = useState<string | null>(null);
  const [nixMsg, setNixMsg] = useState<string | null>(null);

  // Generator state
  const [genAgents, setGenAgents] = useState<string[]>(agents.map(a => a.id));
  const [ideaMode, setIdeaMode] = useState<IdeaMode>('individual');
  const [creativity, setCreativity] = useState<CreativityLevel>('creative');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/data/agent-pitches.json');
        if (res.ok) {
          const filePitches: Pitch[] = await res.json();
          const stored = localStorage.getItem(STORAGE_KEY);
          const localPitches: Pitch[] = stored ? JSON.parse(stored) : [];
          const storedNixed = localStorage.getItem(NIXED_KEY);
          if (storedNixed) setNixedPitches(JSON.parse(storedNixed));
          const localIds = new Set(localPitches.map(p => p.id));
          const nixedIds = new Set((storedNixed ? JSON.parse(storedNixed) : []).map((p: Pitch) => p.id));
          const approvedIds = new Set(localPitches.filter(p => p.status === 'approved').map(p => p.id));
          const merged = filePitches.map(p => {
            if (nixedIds.has(p.id)) return { ...p, status: 'nixed' as const };
            if (approvedIds.has(p.id)) return { ...p, status: 'approved' as const };
            return p;
          });
          const fileIds = new Set(filePitches.map(p => p.id));
          const localOnly = localPitches.filter(p => !fileIds.has(p.id));
          setPitches([...merged, ...localOnly]);
        } else {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setPitches(JSON.parse(stored));
          const storedNixed = localStorage.getItem(NIXED_KEY);
          if (storedNixed) setNixedPitches(JSON.parse(storedNixed));
        }
      } catch {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setPitches(JSON.parse(stored));
          const storedNixed = localStorage.getItem(NIXED_KEY);
          if (storedNixed) setNixedPitches(JSON.parse(storedNixed));
        } catch {}
      }
    };
    load();
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(pitches)); }, [pitches]);
  useEffect(() => { localStorage.setItem(NIXED_KEY, JSON.stringify(nixedPitches)); }, [nixedPitches]);

  // Filtered
  const agentPitches = selectedAgent ? pitches.filter(p => p.agentId === selectedAgent && p.status === 'pending') : [];
  const approvedPitches = selectedAgent ? pitches.filter(p => p.agentId === selectedAgent && p.status === 'approved') : [];
  const agentNixed = selectedAgent ? nixedPitches.filter(p => p.agentId === selectedAgent) : [];
  const getPitchCount = (agentId: string) => pitches.filter(p => p.agentId === agentId && p.status === 'pending').length;
  const totalPending = pitches.filter(p => p.status === 'pending').length;
  const totalApproved = pitches.filter(p => p.status === 'approved').length;
  const totalNixed = nixedPitches.length;
  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  // Kanban
  const addToKanban = async (pitch: Pitch) => {
    const { error } = await supabase.from('todos').insert({
      title: pitch.title,
      description: `**${pitch.agentName}'s Pitch**\n\n${pitch.tldr}\n\n---\n\n${pitch.fullPlan}`,
      assignee: pitch.agentName,
      priority: 'medium',
      status: 'backlog',
      project: 'Agent Initiatives',
      tags: ['initiative', pitch.agentId],
    });
    if (!error) {
      setPitches(prev => prev.map(p => p.id === pitch.id ? { ...p, status: 'approved' as const } : p));
      setKanbanMsg(`"${pitch.title}" added to Kanban → To Do`);
      setTimeout(() => setKanbanMsg(null), 3000);
    }
  };

  const nixIdea = (pitch: Pitch) => {
    setPitches(prev => prev.filter(p => p.id !== pitch.id));
    setNixedPitches(prev => [...prev, { ...pitch, status: 'nixed' as const }]);
    setNixMsg(`"${pitch.title}" nixed`);
    setTimeout(() => setNixMsg(null), 2000);
  };

  const restoreIdea = (pitch: Pitch) => {
    setNixedPitches(prev => prev.filter(p => p.id !== pitch.id));
    setPitches(prev => [...prev, { ...pitch, status: 'pending' as const }]);
  };

  // Generator
  const toggleGenAgent = (id: string) => setGenAgents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const allGenSelected = genAgents.length === agents.length;

  const handleGenerate = () => {
    if (genAgents.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      let newPitches: Pitch[];
      if (ideaMode === 'collaborative') {
        newPitches = [genCollab(genAgents, creativity)];
      } else {
        newPitches = genIndividual(genAgents, creativity);
      }
      setPitches(prev => [...newPitches, ...prev]);
      setIsGenerating(false);
    }, 600);
  };

  const creativityConfig: { value: CreativityLevel; label: string; Icon: typeof Shield; color: string }[] = [
    { value: 'simple', label: 'Simple', Icon: Shield, color: brand.smoke },
    { value: 'creative', label: 'Creative', Icon: Lightbulb, color: brand.amber },
    { value: 'experimental', label: 'Experimental', Icon: Sparkles, color: '#A855F7' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: brand.void, color: brand.white, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>

        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700,
            color: brand.amber, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Team Initiatives
          </h1>
          <p style={{ fontSize: '14px', color: brand.smoke }}>
            Generate ideas on the fly, review agent pitches, approve or nix.
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: brand.silver }}>PENDING <span style={{ color: brand.amber, fontWeight: 600 }}>{totalPending}</span></span>
            <span style={{ color: brand.silver }}>APPROVED <span style={{ color: brand.success, fontWeight: 600 }}>{totalApproved}</span></span>
            <span style={{ color: brand.silver }}>NIXED <span style={{ color: brand.error, fontWeight: 600 }}>{totalNixed}</span></span>
          </div>
        </div>

        {/* Toasts */}
        {kanbanMsg && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, padding: '12px 20px', background: brand.success, color: '#000', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>
            <CheckCircle2 size={16} /> {kanbanMsg}
          </div>
        )}
        {nixMsg && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, padding: '12px 20px', background: brand.error, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}>
            <XCircle size={16} /> {nixMsg}
          </div>
        )}

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>

          {/* Left: Agent list */}
          <div style={{ background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${brand.border}`, fontSize: '11px', fontWeight: 600, color: brand.smoke, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Space Grotesk', sans-serif" }}>
              The Team
            </div>
            {agents.map(agent => {
              const count = getPitchCount(agent.id);
              const isSelected = selectedAgent === agent.id;
              return (
                <div key={agent.id} onClick={() => setSelectedAgent(isSelected ? null : agent.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer',
                  background: isSelected ? 'rgba(245,158,11,0.1)' : 'transparent',
                  borderLeft: isSelected ? `3px solid ${agent.color}` : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}>
                  <span style={{ fontSize: '18px' }}>{agent.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, color: isSelected ? brand.white : brand.silver }}>{agent.name}</div>
                    <div style={{ fontSize: '10px', color: brand.smoke, marginTop: '2px' }}>{agent.role}</div>
                  </div>
                  {count > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: brand.amber, background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '10px' }}>{count}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right panel */}
          <div>
            {!selectedAgent ? (
              /* ─── Generator Hub (when no agent selected) ─── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Generator card */}
                <div style={{ background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px', padding: '32px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Zap size={32} color={brand.amber} style={{ marginBottom: '12px' }} />
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 600, color: brand.white, marginBottom: '8px' }}>
                      Generate Ideas
                    </h2>
                    <p style={{ fontSize: '14px', color: brand.smoke, maxWidth: '460px', margin: '0 auto' }}>
                      Force your agents to brainstorm new initiatives. Select agents, pick a mode, and generate.
                    </p>
                  </div>

                  {/* Agent selector */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
                      <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Agents</span>
                      <button onClick={() => setGenAgents(allGenSelected ? [] : agents.map(a => a.id))} style={{ background: 'transparent', border: 'none', color: brand.amber, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
                        {allGenSelected ? 'CLEAR' : 'ALL'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {agents.map(agent => {
                        const on = genAgents.includes(agent.id);
                        return (
                          <button key={agent.id} onClick={() => toggleGenAgent(agent.id)} style={{
                            background: on ? `${agent.color}15` : brand.graphite,
                            color: brand.white, border: on ? `2px solid ${agent.color}` : `1px solid ${brand.border}`,
                            borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            opacity: on ? 1 : 0.5, boxShadow: on ? `0 0 12px ${agent.color}20` : 'none', transition: 'all 0.2s',
                          }}>
                            {agent.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode + Creativity */}
                  <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '28px' }}>
                    {/* Mode */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: brand.border }} />
                        <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Mode</span>
                        <div style={{ flex: 1, height: '1px', background: brand.border }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {([['individual', 'Individual', User] as const, ['collaborative', 'Collaborative', Users] as const]).map(([val, label, Icon]) => (
                          <button key={val} onClick={() => setIdeaMode(val)} style={{
                            background: ideaMode === val ? `${brand.amber}15` : brand.graphite,
                            color: ideaMode === val ? brand.amber : brand.white,
                            border: ideaMode === val ? `2px solid ${brand.amber}` : `1px solid ${brand.border}`,
                            borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            opacity: ideaMode === val ? 1 : 0.5, transition: 'all 0.2s',
                          }}>
                            <Icon size={14} />{label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Creativity */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: brand.border }} />
                        <span style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Creativity</span>
                        <div style={{ flex: 1, height: '1px', background: brand.border }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {creativityConfig.map(({ value, label, Icon, color }) => (
                          <button key={value} onClick={() => setCreativity(value)} style={{
                            background: creativity === value ? `${color}15` : brand.graphite,
                            color: creativity === value ? color : brand.white,
                            border: creativity === value ? `2px solid ${color}` : `1px solid ${brand.border}`,
                            borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            opacity: creativity === value ? 1 : 0.5, transition: 'all 0.2s',
                          }}>
                            <Icon size={14} />{label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate button */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={handleGenerate} disabled={isGenerating || genAgents.length === 0} style={{
                      background: (isGenerating || genAgents.length === 0) ? brand.smoke : brand.amber,
                      color: brand.void, border: 'none', borderRadius: '10px', padding: '14px 36px',
                      fontSize: '16px', fontWeight: 700, cursor: (isGenerating || genAgents.length === 0) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      opacity: (isGenerating || genAgents.length === 0) ? 0.5 : 1,
                      boxShadow: (isGenerating || genAgents.length === 0) ? 'none' : `0 0 20px ${brand.amber}40`,
                      transition: 'all 0.2s',
                    }}>
                      <Zap size={18} />
                      {isGenerating ? 'Generating...' : `Generate ${ideaMode === 'collaborative' ? 'Collaborative' : 'Individual'} Ideas (${genAgents.length})`}
                    </button>
                  </div>
                </div>

                {/* Quick overview: agents with pending pitches */}
                {totalPending > 0 && (
                  <div style={{ background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Agents with pending pitches
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {agents.filter(a => getPitchCount(a.id) > 0).map(a => (
                        <button key={a.id} onClick={() => setSelectedAgent(a.id)} style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                          background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '8px',
                          color: brand.white, fontSize: '13px', cursor: 'pointer',
                        }}>
                          <span>{a.emoji}</span> {a.name}
                          <span style={{ fontSize: '11px', fontWeight: 600, color: brand.amber, fontFamily: "'JetBrains Mono', monospace" }}>{getPitchCount(a.id)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ─── Agent selected: show their pitches ─── */
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px 20px',
                  background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px',
                  borderLeft: `4px solid ${selectedAgentData?.color}`,
                }}>
                  <span style={{ fontSize: '32px' }}>{selectedAgentData?.emoji}</span>
                  <div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: brand.white }}>{selectedAgentData?.name}</h2>
                    <div style={{ fontSize: '12px', color: brand.smoke }}>{selectedAgentData?.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: brand.amber }}>PENDING {agentPitches.length}</span>
                    <span style={{ color: brand.success }}>APPROVED {approvedPitches.length}</span>
                    <span style={{ color: brand.error }}>NIXED {agentNixed.length}</span>
                  </div>
                </div>

                {agentPitches.length === 0 && approvedPitches.length === 0 && agentNixed.length === 0 ? (
                  <div style={{ background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💤</div>
                    <p style={{ color: brand.smoke, fontSize: '14px' }}>No pitches from {selectedAgentData?.name} yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {agentPitches.length > 0 && (
                      <>
                        <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 4px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                          Pending Review
                        </div>
                        {agentPitches.map(pitch => (
                          <PitchCard key={pitch.id} pitch={pitch} expanded={expandedPitch === pitch.id}
                            onToggle={() => setExpandedPitch(expandedPitch === pitch.id ? null : pitch.id)}
                            onApprove={() => addToKanban(pitch)} onNix={() => nixIdea(pitch)}
                            agentColor={selectedAgentData?.color || brand.amber} />
                        ))}
                      </>
                    )}
                    {approvedPitches.length > 0 && (
                      <>
                        <div style={{ fontSize: '11px', color: brand.success, textTransform: 'uppercase', letterSpacing: '1px', padding: '12px 4px 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                          ✅ Approved — On Kanban
                        </div>
                        {approvedPitches.map(pitch => (
                          <div key={pitch.id} style={{ background: brand.carbon, border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px 18px', opacity: 0.7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <CheckCircle2 size={16} color={brand.success} />
                              <span style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{pitch.title}</span>
                              <span style={{ fontSize: '10px', color: brand.smoke, marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(pitch.date)}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {agentNixed.length > 0 && (
                      <>
                        <div style={{ fontSize: '11px', color: brand.error, textTransform: 'uppercase', letterSpacing: '1px', padding: '12px 4px 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                          ❌ Nixed
                        </div>
                        {agentNixed.map(pitch => (
                          <div key={pitch.id} style={{ background: brand.carbon, border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px 18px', opacity: 0.5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <XCircle size={16} color={brand.error} />
                              <span style={{ fontSize: '14px', color: brand.silver, textDecoration: 'line-through' }}>{pitch.title}</span>
                              <button onClick={() => restoreIdea(pitch)} style={{
                                marginLeft: 'auto', fontSize: '11px', color: brand.smoke, background: 'none',
                                border: `1px solid ${brand.border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                              }}>Restore</button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pitch Card ───────────────────────────────────────────────────────────────
function PitchCard({ pitch, expanded, onToggle, onApprove, onNix, agentColor }: {
  pitch: Pitch; expanded: boolean; onToggle: () => void; onApprove: () => void; onNix: () => void; agentColor: string;
}) {
  return (
    <div style={{ background: brand.carbon, border: `1px solid ${expanded ? agentColor : brand.border}`, borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 18px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>{formatDate(pitch.date)}</span>
          <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: brand.smoke, opacity: 0.6 }}>{formatTime(pitch.time)}</span>
        </div>
        <div style={{ width: '1px', height: '36px', background: brand.border, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: brand.white, marginBottom: '4px', fontFamily: "'Space Grotesk', sans-serif" }}>{pitch.title}</div>
          <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.5 }}>{pitch.tldr}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: expanded ? agentColor : brand.smoke, transition: 'transform 0.2s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, marginTop: '4px' }}>
          <ChevronDown size={20} />
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${brand.border}`, padding: '20px 18px', background: brand.graphite }}>
          <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '20px' }}>{pitch.fullPlan}</div>
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${brand.border}` }}>
            <button onClick={(e) => { e.stopPropagation(); onApprove(); }} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: brand.amber, color: brand.void,
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Plus size={16} /> Add to Kanban
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNix(); }} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'transparent', color: brand.error,
              border: `1px solid ${brand.error}`, borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Trash2 size={16} /> Nix Idea
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
