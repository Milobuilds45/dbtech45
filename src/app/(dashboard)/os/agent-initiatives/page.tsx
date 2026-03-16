'use client';

import { brand, styles } from '@/lib/brand';
import Link from 'next/link';
import { useState } from 'react';
import {
  Rocket, ChevronDown, ChevronRight,
  TrendingUp, BarChart3, Radio,
  Palette, Paintbrush, Code2,
  Monitor, Shield, Zap,
  Brain, Scale, Clock,
  ChefHat, Bell, Radar,
  FileSearch, Wheat, ClipboardCheck,
  Database, Satellite, Flame,
  Users
} from 'lucide-react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'building' | 'shipped' | 'planning';
  href: string;
  icon: React.ReactNode;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  initiatives: Initiative[];
}

const agents: Agent[] = [
  {
    id: 'bobby',
    name: 'Bobby Axelrod',
    role: 'Chief Investment Officer',
    emoji: '💰',
    color: '#10B981',
    initiatives: [
      {
        id: 'ghost-trades',
        title: 'Ghost Trades',
        description: 'Paper trading simulator with leaderboard. $100K fake capital, real market data, public rankings. Fantasy football for options traders.',
        status: 'building',
        href: '/os/ghost-trades',
        icon: <TrendingUp size={18} />,
      },
      {
        id: 'earnings-whisper-wall',
        title: 'Earnings Whisper Wall',
        description: 'Crowdsourced earnings predictions. Users submit estimates before reports. Crowd consensus vs Wall Street vs actual — visualized in real-time.',
        status: 'building',
        href: '/os/earnings-wall',
        icon: <BarChart3 size={18} />,
      },
      {
        id: 'flow-radar',
        title: 'Flow Radar',
        description: 'Unusual options activity feed with AI translation. Big bets translated from raw data into plain English one-liners. Bloomberg Terminal for normal people.',
        status: 'building',
        href: '/os/flow-radar',
        icon: <Radio size={18} />,
      },
    ],
  },
  {
    id: 'paula',
    name: 'Paula',
    role: 'Creative & Design',
    emoji: '🎨',
    color: '#EC4899',
    initiatives: [
      {
        id: 'prototype-to-production',
        title: 'Prototype → Production',
        description: 'Design a component in Figma or screenshot it. AI generates production-ready Next.js + Tailwind code in seconds. No more design→dev handoff friction.',
        status: 'building',
        href: '/os/prototype-to-prod',
        icon: <Code2 size={18} />,
      },
      {
        id: 'brand-chameleon',
        title: 'Brand Chameleon',
        description: 'Upload a logo/brand and the entire Mission Control instantly re-skins itself to match. Live preview before committing. Perfect for white-label demos.',
        status: 'building',
        href: '/os/brand-chameleon',
        icon: <Paintbrush size={18} />,
      },
      {
        id: 'design-dna-scanner',
        title: 'Design DNA Scanner',
        description: 'Upload any website screenshot and get a full design system breakdown — colors, typography, spacing, components — as a downloadable Tailwind config.',
        status: 'building',
        href: '/os/design-dna',
        icon: <Palette size={18} />,
      },
    ],
  },
  {
    id: 'anders',
    name: 'Anders',
    role: 'IT / DevOps / Engineering',
    emoji: '⚙️',
    color: '#3B82F6',
    initiatives: [
      {
        id: 'one-click-deploy',
        title: 'One-Click Agent Deploy',
        description: 'Single button creates a new agent — Telegram bot, OpenClaw workspace, SOUL.md, config files — live in under 60 seconds.',
        status: 'building',
        href: '/os/one-click-deploy',
        // TODO: Anders didn't build this yet
        icon: <Zap size={18} />,
      },
      {
        id: 'agent-health-monitor',
        title: 'Agent Health Monitor',
        description: 'Real-time swarm dashboard. See all agents\' status, current tasks, API usage, costs, and last heartbeat. Click an agent to see live logs.',
        status: 'building',
        href: '/os/agent-health',
        icon: <Monitor size={18} />,
      },
      {
        id: 'credential-vault',
        title: 'Credential Vault UI',
        description: 'Secure web interface for agent credential management. Grant/revoke access per agent with expiration times and full audit trails.',
        status: 'building',
        href: '/os/credential-vault',
        // TODO: Anders didn't build this yet
        icon: <Shield size={18} />,
      },
    ],
  },
  {
    id: 'wendy',
    name: 'Wendy',
    role: 'Personal & Wellness',
    emoji: '🧘',
    color: '#8B5CF6',
    initiatives: [
      {
        id: 'twenty-year-clock',
        title: 'The 20-Year Clock',
        description: 'Life prioritization tool. If you had 20 years left, what would you stop doing today? Ruthless priority stack with weekly accountability.',
        status: 'building',
        href: '/os/twenty-year-clock',
        icon: <Clock size={18} />,
      },
      {
        id: 'decision-audit',
        title: 'The Decision Audit',
        description: 'Pre-decision framework. Five diagnostic questions that separate fear from intuition. Outputs clear-headed summary — a $500/hr coach in a page.',
        status: 'building',
        href: '/os/decision-audit',
        icon: <Scale size={18} />,
      },
      {
        id: 'pattern-mirror',
        title: 'The Pattern Mirror',
        description: 'Weekly emotional debrief — 3 questions, 90 seconds. AI analyzes recurring themes. Monthly mirror report shows blind spots in plain language.',
        status: 'building',
        href: '/os/pattern-mirror',
        icon: <Brain size={18} />,
      },
    ],
  },
  {
    id: 'remy',
    name: 'Remy',
    role: 'Restaurant Ops & Marketing',
    emoji: '🍽️',
    color: '#F97316',
    initiatives: [
      {
        id: 'slow-night-sos',
        title: 'Slow Night SOS',
        description: 'Detects when a restaurant trends 30% below pace by 3pm. Auto-triggers same-day customer outreach. Turns dead nights into recoverable nights.',
        status: 'building',
        href: '/os/slow-night-sos',
        icon: <Bell size={18} />,
      },
      {
        id: 'competitor-radar',
        title: 'Competitor Radar',
        description: 'Weekly automated scan of competing restaurants\' social, reviews, and specials by zip code. Market intelligence that chains pay $10K/month for.',
        status: 'building',
        href: '/os/competitor-radar',
        icon: <Radar size={18} />,
      },
      {
        id: 'menu-autopilot',
        title: 'Menu Autopilot',
        description: 'AI reads Toast POS sales data weekly and generates "push this, drop that" menu recommendations. What to feature, what to 86, what combos boost average check.',
        status: 'building',
        href: '/os/menu-autopilot',
        icon: <ChefHat size={18} />,
      },
    ],
  },
  {
    id: 'dwight',
    name: 'Dwight K. Schrute III',
    role: 'Research & Intelligence',
    emoji: '🕵️',
    color: '#EAB308',
    initiatives: [
      {
        id: 'threat-intel-daily',
        title: 'Threat Intel Daily',
        description: 'Hyperlocal AI intelligence brief every morning — weather, news, traffic, crime, supply chain disruptions — customized per zip code for busy operators.',
        status: 'building',
        href: '/os/threat-intel-daily',
        icon: <FileSearch size={18} />,
      },
      {
        id: 'commodity-radar',
        title: 'Commodity Radar',
        description: 'Real-time USDA + futures data translator. Converts food commodity price movements into plain English alerts for restaurant owners.',
        status: 'building',
        href: '/os/commodity-radar',
        icon: <Wheat size={18} />,
      },
      {
        id: 'agent-audit-log',
        title: 'Agent Audit Log',
        description: 'Public-facing dashboard showing what the AI team actually did today — commits, briefs delivered, tasks completed. Proof of work for potential clients.',
        status: 'building',
        href: '/os/agent-audit-log',
        icon: <ClipboardCheck size={18} />,
      },
    ],
  },
  {
    id: 'milo',
    name: 'Milo',
    role: 'Senior Advisor & Systems',
    emoji: '📋',
    color: '#6366F1',
    initiatives: [
      {
        id: 'the-forge',
        title: 'The Forge',
        description: 'Idea → Shipped Product pipeline. Drop a raw idea in, system generates spec, assigns agents, tracks progress, deploys. Derek only approves checkpoints.',
        status: 'shipped',
        href: '/os/the-forge',
        icon: <Flame size={18} />,
      },
      {
        id: 'time-machine',
        title: 'Time Machine',
        description: 'Rewind any agent, project, or decision to any point in history. Full context reconstruction from memory files, git, and transcripts.',
        status: 'shipped',
        href: '/os/time-machine',
        icon: <Database size={18} />,
      },
      {
        id: 'mission-control-live',
        title: 'Mission Control (Live)',
        description: 'Real-time operational feed — token usage, active sessions, cron jobs, deployments, blockers. Air traffic control for the swarm.',
        status: 'shipped',
        href: '/os/live-dashboard',
        icon: <Satellite size={18} />,
      },
    ],
  },
];

const statusColor = (status: Initiative['status']) => {
  if (status === 'shipped') return brand.success;
  if (status === 'building') return brand.amber;
  return brand.smoke;
};

const statusLabel = (status: Initiative['status']) => {
  if (status === 'shipped') return '✅ Shipped';
  if (status === 'building') return '🔨 Building';
  return '📋 Planning';
};

export default function AgentInitiativesPage() {
  const [openAgents, setOpenAgents] = useState<Set<string>>(new Set(agents.map(a => a.id)));

  const toggleAgent = (id: string) => {
    setOpenAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalInitiatives = agents.reduce((sum, a) => sum + a.initiatives.length, 0);
  const shippedCount = agents.reduce((sum, a) => sum + a.initiatives.filter(i => i.status === 'shipped').length, 0);
  const buildingCount = agents.reduce((sum, a) => sum + a.initiatives.filter(i => i.status === 'building').length, 0);

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Rocket size={28} style={{ color: brand.amber }} />
            <h1 style={styles.h1}>Agent Initiatives</h1>
          </div>
          <p style={styles.subtitle}>
            Agent-driven products and features. Built autonomously, shipped with Derek&apos;s approval.
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: '2rem', marginTop: '1rem',
            padding: '0.75rem 1.25rem', backgroundColor: brand.carbon,
            borderRadius: 8, border: `1px solid ${brand.border}`,
            fontFamily: M, fontSize: '0.8rem',
          }}>
            <div>
              <span style={{ color: brand.smoke }}>Total: </span>
              <span style={{ color: brand.white, fontWeight: 700 }}>{totalInitiatives}</span>
            </div>
            <div>
              <span style={{ color: brand.smoke }}>Shipped: </span>
              <span style={{ color: brand.success, fontWeight: 700 }}>{shippedCount}</span>
            </div>
            <div>
              <span style={{ color: brand.smoke }}>Building: </span>
              <span style={{ color: brand.amber, fontWeight: 700 }}>{buildingCount}</span>
            </div>
            <div>
              <span style={{ color: brand.smoke }}>Agents: </span>
              <span style={{ color: brand.white, fontWeight: 700 }}>{agents.length}</span>
            </div>
          </div>
        </div>

        {/* Agent Accordions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {agents.map(agent => {
            const isOpen = openAgents.has(agent.id);
            const agentShipped = agent.initiatives.filter(i => i.status === 'shipped').length;
            const agentBuilding = agent.initiatives.filter(i => i.status === 'building').length;

            return (
              <div key={agent.id} style={{
                backgroundColor: brand.carbon,
                borderRadius: 12,
                border: `1px solid ${isOpen ? agent.color + '40' : brand.border}`,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                {/* Agent Header (clickable) */}
                <button
                  onClick={() => toggleAgent(agent.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '1.25rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: brand.white,
                    textAlign: 'left',
                  }}
                >
                  {isOpen
                    ? <ChevronDown size={20} style={{ color: agent.color, flexShrink: 0 }} />
                    : <ChevronRight size={20} style={{ color: brand.smoke, flexShrink: 0 }} />
                  }
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{agent.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: isOpen ? agent.color : brand.white }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: brand.smoke, marginTop: 2 }}>
                      {agent.role}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {agentShipped > 0 && (
                      <span style={{
                        fontSize: '0.7rem', fontFamily: M, color: brand.success,
                        background: `${brand.success}15`, padding: '3px 8px', borderRadius: 4,
                      }}>
                        {agentShipped} shipped
                      </span>
                    )}
                    {agentBuilding > 0 && (
                      <span style={{
                        fontSize: '0.7rem', fontFamily: M, color: brand.amber,
                        background: `${brand.amber}15`, padding: '3px 8px', borderRadius: 4,
                      }}>
                        {agentBuilding} building
                      </span>
                    )}
                  </div>
                </button>

                {/* Initiatives Dropdown */}
                {isOpen && (
                  <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {agent.initiatives.map(initiative => (
                      <Link key={initiative.id} href={initiative.href} style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '1rem 1.25rem',
                            backgroundColor: brand.graphite,
                            borderRadius: 8,
                            border: `1px solid ${brand.border}`,
                            cursor: 'pointer',
                            transition: 'border-color 0.2s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = agent.color)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = brand.border)}
                        >
                          <div style={{ color: agent.color, flexShrink: 0, marginTop: 2 }}>
                            {initiative.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: brand.white }}>
                                {initiative.title}
                              </span>
                              <span style={{
                                fontSize: '0.65rem', fontFamily: M,
                                color: statusColor(initiative.status),
                                background: `${statusColor(initiative.status)}15`,
                                padding: '2px 8px', borderRadius: 4,
                                fontWeight: 600, textTransform: 'uppercase',
                              }}>
                                {statusLabel(initiative.status)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: brand.smoke, lineHeight: 1.5, margin: 0 }}>
                              {initiative.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
