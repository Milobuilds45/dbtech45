'use client';

import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import {
  ChevronDown, ChevronRight, Plus, X, Trash2, ArrowRight,
  User, Clock, Lightbulb, CheckCircle2, XCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pitch {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  tldr: string; // 3 sentences max
  fullPlan: string; // comprehensive plan
  date: string; // ISO date
  time: string; // HH:MM
  status: 'pending' | 'approved' | 'nixed';
}

// ─── Agent Registry ───────────────────────────────────────────────────────────
const agents = [
  { id: 'bobby', name: 'Bobby Axelrod', emoji: '💰', role: 'Chief Investment Officer', color: '#10B981' },
  { id: 'paula', name: 'Paula', emoji: '🎨', role: 'Creative & Design', color: '#EC4899' },
  { id: 'anders', name: 'Anders', emoji: '⚙️', role: 'IT / DevOps', color: '#3B82F6' },
  { id: 'wendy', name: 'Wendy', emoji: '🧘', role: 'Personal & Wellness', color: '#8B5CF6' },
  { id: 'remy', name: 'Remy', emoji: '🍽️', role: 'Restaurant Ops', color: '#F97316' },
  { id: 'dwight', name: 'Dwight', emoji: '🕵️', role: 'Research & Intel', color: '#EAB308' },
  { id: 'milo', name: 'Milo', emoji: '📋', role: 'Senior Advisor & Systems', color: '#6366F1' },
  { id: 'ted', name: 'Ted', emoji: '⚽', role: 'President & COO', color: '#F59E0B' },
];

const STORAGE_KEY = 'agent-pitches-v2';
const NIXED_KEY = 'agent-pitches-nixed';

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

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPitches(JSON.parse(stored));
      const storedNixed = localStorage.getItem(NIXED_KEY);
      if (storedNixed) setNixedPitches(JSON.parse(storedNixed));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pitches));
  }, [pitches]);
  useEffect(() => {
    localStorage.setItem(NIXED_KEY, JSON.stringify(nixedPitches));
  }, [nixedPitches]);

  // Filter pitches for selected agent
  const agentPitches = selectedAgent
    ? pitches.filter(p => p.agentId === selectedAgent && p.status === 'pending')
    : [];

  const approvedPitches = selectedAgent
    ? pitches.filter(p => p.agentId === selectedAgent && p.status === 'approved')
    : [];

  const agentNixed = selectedAgent
    ? nixedPitches.filter(p => p.agentId === selectedAgent)
    : [];

  // Get pitch counts per agent
  const getPitchCount = (agentId: string) =>
    pitches.filter(p => p.agentId === agentId && p.status === 'pending').length;

  // Add to Kanban (Supabase todos table)
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
      setPitches(prev => prev.map(p =>
        p.id === pitch.id ? { ...p, status: 'approved' as const } : p
      ));
      setKanbanMsg(`"${pitch.title}" added to Kanban → To Do`);
      setTimeout(() => setKanbanMsg(null), 3000);
    }
  };

  // Nix idea
  const nixIdea = (pitch: Pitch) => {
    setPitches(prev => prev.filter(p => p.id !== pitch.id));
    setNixedPitches(prev => [...prev, { ...pitch, status: 'nixed' as const }]);
    setNixMsg(`"${pitch.title}" nixed`);
    setTimeout(() => setNixMsg(null), 2000);
  };

  // Restore nixed idea
  const restoreIdea = (pitch: Pitch) => {
    setNixedPitches(prev => prev.filter(p => p.id !== pitch.id));
    setPitches(prev => [...prev, { ...pitch, status: 'pending' as const }]);
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const totalPending = pitches.filter(p => p.status === 'pending').length;
  const totalApproved = pitches.filter(p => p.status === 'approved').length;
  const totalNixed = nixedPitches.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: brand.void,
      color: brand.white,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: brand.amber,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Agent Initiatives
          </h1>
          <p style={{ fontSize: '14px', color: brand.smoke }}>
            Agents pitch ideas. You decide what gets built.
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginTop: '16px',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ color: brand.silver }}>
              PENDING <span style={{ color: brand.amber, fontWeight: 600 }}>{totalPending}</span>
            </span>
            <span style={{ color: brand.silver }}>
              APPROVED <span style={{ color: brand.success, fontWeight: 600 }}>{totalApproved}</span>
            </span>
            <span style={{ color: brand.silver }}>
              NIXED <span style={{ color: brand.error, fontWeight: 600 }}>{totalNixed}</span>
            </span>
          </div>
        </div>

        {/* Toast messages */}
        {kanbanMsg && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
            padding: '12px 20px', background: brand.success, color: '#000',
            borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}>
            <CheckCircle2 size={16} /> {kanbanMsg}
          </div>
        )}
        {nixMsg && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
            padding: '12px 20px', background: brand.error, color: '#fff',
            borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
          }}>
            <XCircle size={16} /> {nixMsg}
          </div>
        )}

        {/* Main layout: agent list + pitch feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          {/* Left: Agent list */}
          <div style={{
            background: brand.carbon,
            border: `1px solid ${brand.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${brand.border}`,
              fontSize: '11px',
              fontWeight: 600,
              color: brand.smoke,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              The Team
            </div>
            {agents.map(agent => {
              const count = getPitchCount(agent.id);
              const isSelected = selectedAgent === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                    borderLeft: isSelected ? `3px solid ${agent.color}` : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{agent.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? brand.white : brand.silver,
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: brand.smoke,
                      marginTop: '2px',
                    }}>
                      {agent.role}
                    </div>
                  </div>
                  {count > 0 && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: brand.amber,
                      background: 'rgba(245, 158, 11, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}>
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Pitch feed */}
          <div>
            {!selectedAgent ? (
              /* No agent selected — overview */
              <div style={{
                background: brand.carbon,
                border: `1px solid ${brand.border}`,
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
              }}>
                <Lightbulb size={48} color={brand.smoke} style={{ marginBottom: '16px' }} />
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: brand.white,
                  marginBottom: '8px',
                }}>
                  Select an agent to see their pitches
                </h2>
                <p style={{ fontSize: '14px', color: brand.smoke, maxWidth: '400px', margin: '0 auto' }}>
                  Each agent submits ideas with a brief summary. You decide what gets built by adding it to the Kanban board — or nix it.
                </p>

                {/* Quick overview: agents with pending pitches */}
                {totalPending > 0 && (
                  <div style={{ marginTop: '30px' }}>
                    <div style={{
                      fontSize: '11px', color: brand.smoke, textTransform: 'uppercase',
                      letterSpacing: '1px', marginBottom: '12px',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      Agents with pending pitches
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {agents.filter(a => getPitchCount(a.id) > 0).map(a => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedAgent(a.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', background: brand.graphite,
                            border: `1px solid ${brand.border}`, borderRadius: '8px',
                            color: brand.white, fontSize: '13px', cursor: 'pointer',
                          }}
                        >
                          <span>{a.emoji}</span> {a.name}
                          <span style={{
                            fontSize: '11px', fontWeight: 600, color: brand.amber,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {getPitchCount(a.id)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Agent selected — show their pitches */
              <div>
                {/* Agent header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  marginBottom: '20px', padding: '16px 20px',
                  background: brand.carbon, border: `1px solid ${brand.border}`,
                  borderRadius: '12px', borderLeft: `4px solid ${selectedAgentData?.color}`,
                }}>
                  <span style={{ fontSize: '32px' }}>{selectedAgentData?.emoji}</span>
                  <div>
                    <h2 style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '20px', fontWeight: 700, color: brand.white,
                    }}>
                      {selectedAgentData?.name}
                    </h2>
                    <div style={{ fontSize: '12px', color: brand.smoke }}>{selectedAgentData?.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: brand.amber }}>PENDING {agentPitches.length}</span>
                    <span style={{ color: brand.success }}>APPROVED {approvedPitches.length}</span>
                    <span style={{ color: brand.error }}>NIXED {agentNixed.length}</span>
                  </div>
                </div>

                {/* Pending pitches */}
                {agentPitches.length === 0 && approvedPitches.length === 0 && agentNixed.length === 0 ? (
                  <div style={{
                    background: brand.carbon, border: `1px solid ${brand.border}`,
                    borderRadius: '12px', padding: '40px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💤</div>
                    <p style={{ color: brand.smoke, fontSize: '14px' }}>
                      No pitches from {selectedAgentData?.name} yet. They&apos;ll show up here when submitted.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Pending section */}
                    {agentPitches.length > 0 && (
                      <>
                        <div style={{
                          fontSize: '11px', color: brand.smoke, textTransform: 'uppercase',
                          letterSpacing: '1px', padding: '0 4px',
                          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                        }}>
                          Pending Review
                        </div>
                        {agentPitches.map(pitch => (
                          <PitchCard
                            key={pitch.id}
                            pitch={pitch}
                            expanded={expandedPitch === pitch.id}
                            onToggle={() => setExpandedPitch(expandedPitch === pitch.id ? null : pitch.id)}
                            onApprove={() => addToKanban(pitch)}
                            onNix={() => nixIdea(pitch)}
                            agentColor={selectedAgentData?.color || brand.amber}
                          />
                        ))}
                      </>
                    )}

                    {/* Approved section */}
                    {approvedPitches.length > 0 && (
                      <>
                        <div style={{
                          fontSize: '11px', color: brand.success, textTransform: 'uppercase',
                          letterSpacing: '1px', padding: '12px 4px 0',
                          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                        }}>
                          ✅ Approved — On Kanban
                        </div>
                        {approvedPitches.map(pitch => (
                          <div key={pitch.id} style={{
                            background: brand.carbon, border: `1px solid rgba(16, 185, 129, 0.3)`,
                            borderRadius: '10px', padding: '14px 18px',
                            opacity: 0.7,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <CheckCircle2 size={16} color={brand.success} />
                              <span style={{ fontSize: '14px', fontWeight: 600, color: brand.white }}>{pitch.title}</span>
                              <span style={{
                                fontSize: '10px', color: brand.smoke, marginLeft: 'auto',
                                fontFamily: "'JetBrains Mono', monospace",
                              }}>
                                {formatDate(pitch.date)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Nixed section */}
                    {agentNixed.length > 0 && (
                      <>
                        <div style={{
                          fontSize: '11px', color: brand.error, textTransform: 'uppercase',
                          letterSpacing: '1px', padding: '12px 4px 0',
                          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                        }}>
                          ❌ Nixed
                        </div>
                        {agentNixed.map(pitch => (
                          <div key={pitch.id} style={{
                            background: brand.carbon, border: `1px solid rgba(239, 68, 68, 0.2)`,
                            borderRadius: '10px', padding: '14px 18px',
                            opacity: 0.5,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <XCircle size={16} color={brand.error} />
                              <span style={{ fontSize: '14px', color: brand.silver, textDecoration: 'line-through' }}>{pitch.title}</span>
                              <button
                                onClick={() => restoreIdea(pitch)}
                                style={{
                                  marginLeft: 'auto', fontSize: '11px', color: brand.smoke,
                                  background: 'none', border: `1px solid ${brand.border}`,
                                  borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                                }}
                              >
                                Restore
                              </button>
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

// ─── Pitch Card Component ─────────────────────────────────────────────────────
function PitchCard({
  pitch, expanded, onToggle, onApprove, onNix, agentColor,
}: {
  pitch: Pitch;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onNix: () => void;
  agentColor: string;
}) {
  return (
    <div style={{
      background: brand.carbon,
      border: `1px solid ${expanded ? agentColor : brand.border}`,
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}>
      {/* Summary row: Date - Time - Name - TLDR */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '16px 18px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        {/* Date/Time block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '80px',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: brand.smoke,
          }}>
            {formatDate(pitch.date)}
          </span>
          <span style={{
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            color: brand.smoke,
            opacity: 0.6,
          }}>
            {formatTime(pitch.time)}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '36px', background: brand.border, flexShrink: 0 }} />

        {/* Title + TLDR */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 600,
            color: brand.white,
            marginBottom: '4px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {pitch.title}
          </div>
          <div style={{
            fontSize: '13px',
            color: brand.silver,
            lineHeight: 1.5,
          }}>
            {pitch.tldr}
          </div>
        </div>

        {/* Expand arrow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: expanded ? agentColor : brand.smoke,
          transition: 'transform 0.2s ease, color 0.2s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0,
          marginTop: '4px',
        }}>
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Expanded: full plan + actions */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${brand.border}`,
          padding: '20px 18px',
          background: brand.graphite,
        }}>
          {/* Full plan */}
          <div style={{
            fontSize: '13px',
            color: brand.silver,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            marginBottom: '20px',
          }}>
            {pitch.fullPlan}
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px',
            borderTop: `1px solid ${brand.border}`,
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: brand.amber,
                color: brand.void,
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.15s ease',
              }}
            >
              <Plus size={16} />
              Add to Kanban
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNix(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'transparent',
                color: brand.error,
                border: `1px solid ${brand.error}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 size={16} />
              Nix Idea
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
