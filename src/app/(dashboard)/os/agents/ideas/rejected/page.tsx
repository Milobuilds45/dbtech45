'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { brand, styles } from '@/lib/brand';
import { RotateCcw, Trash2, Star, Target, ArrowLeft, Skull } from 'lucide-react';

const REJECTED_KEY = 'dbtech-agent-ideas-rejected';
const STORAGE_KEY = 'dbtech-agent-ideas';

const AGENTS = [
  { id: 'milo', name: 'Milo', color: '#A855F7' },
  { id: 'anders', name: 'Anders', color: '#F97316' },
  { id: 'paula', name: 'Paula', color: '#EC4899' },
  { id: 'bobby', name: 'Bobby', color: '#22C55E' },
  { id: 'dwight', name: 'Dwight', color: '#6366F1' },
  { id: 'tony', name: 'Tony', color: '#EAB308' },
  { id: 'dax', name: 'Dax', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#EF4444' },
  { id: 'wendy', name: 'Wendy', color: '#8B5CF6' },
];

interface AgentIdea {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  problemSolved: string;
  targetMarket: string;
  businessModel: string;
  revenueProjection: string;
  competitiveAdvantage: string;
  developmentTime: string;
  riskAssessment: string;
  tags: string[];
  derekRating?: number;
  agentConfidence: number;
  marketSize: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  rejectedAt?: string;
  [key: string]: unknown;
}

function mktColor(s: string) { return s === 'massive' ? brand.success : s === 'large' ? brand.info : s === 'medium' ? brand.amber : brand.smoke; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }

export default function RejectedArchive() {
  const router = useRouter();
  const [rejected, setRejected] = useState<AgentIdea[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(REJECTED_KEY) || '[]');
      if (Array.isArray(stored)) setRejected(stored);
    } catch {}
    setHydrated(true);
  }, []);

  const restore = (id: string) => {
    const idea = rejected.find(i => i.id === id);
    if (!idea) return;
    // Remove from rejected
    const updated = rejected.filter(i => i.id !== id);
    localStorage.setItem(REJECTED_KEY, JSON.stringify(updated));
    setRejected(updated);
    // Add back to active ideas
    try {
      const active = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      active.unshift({ ...idea, status: 'submitted', rejectedAt: undefined });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    } catch {}
    // Go back to ideas page
    router.push('/os/agents/ideas');
  };

  const permanentDelete = (id: string) => {
    const updated = rejected.filter(i => i.id !== id);
    localStorage.setItem(REJECTED_KEY, JSON.stringify(updated));
    setRejected(updated);
  };

  const clearAll = () => {
    localStorage.removeItem(REJECTED_KEY);
    setRejected([]);
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => router.push('/os/agents/ideas')} style={{
              background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: '8px',
              padding: '8px', color: brand.smoke, cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ ...styles.h1, color: brand.error, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skull size={28} />
              Rejected Archive
            </h1>
          </div>
          {rejected.length > 0 && (
            <button onClick={clearAll} style={{
              background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: '6px',
              padding: '6px 14px', color: brand.smoke, fontSize: '12px', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}>
              Clear All
            </button>
          )}
        </div>
        <p style={styles.subtitle}>Ideas that got killed. Restore any of them if they deserve a second chance.</p>

        {/* Stats bar */}
        {rejected.length > 0 && (
          <div style={{
            display: 'flex', gap: '24px', marginBottom: '24px', padding: '12px 20px',
            background: brand.graphite, borderRadius: '8px', border: `1px solid ${brand.border}`,
          }}>
            <div style={{ color: brand.smoke, fontSize: '13px' }}>
              <span style={{ color: brand.error, fontWeight: 700, fontSize: '18px' }}>{rejected.length}</span> rejected
            </div>
            <div style={{ color: brand.smoke, fontSize: '13px' }}>
              <span style={{ color: brand.amber, fontWeight: 700, fontSize: '18px' }}>
                {rejected.filter(i => i.derekRating && i.derekRating >= 4).length}
              </span> were rated 4+
            </div>
            <div style={{ color: brand.smoke, fontSize: '13px' }}>
              Agents: {[...new Set(rejected.map(i => i.agentName))].join(', ')}
            </div>
          </div>
        )}

        {/* Empty state */}
        {rejected.length === 0 && hydrated && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '60px 40px' }}>
            <Skull size={48} style={{ color: brand.smoke, opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ color: brand.smoke, fontSize: '18px', marginBottom: '8px' }}>No rejected ideas</h3>
            <p style={{ color: brand.smoke, fontSize: '14px', marginBottom: '20px' }}>When you reject ideas from Agent Ideas, they land here.</p>
            <a href="/os/agents/ideas" style={{
              color: brand.amber, textDecoration: 'none', fontSize: '14px', fontWeight: 600,
            }}>Back to Agent Ideas</a>
          </div>
        )}

        {/* Rejected idea cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rejected.map(idea => {
            const agent = AGENTS.find(a => a.id === idea.agentId);
            const isCollab = idea.agentId === 'collaborative';

            return (
              <div key={idea.id} style={{
                ...styles.card,
                padding: 0,
                border: `1px solid rgba(239, 68, 68, 0.15)`,
                opacity: 0.9,
                overflow: 'hidden',
              }}>
                {/* Card content */}
                <div style={{ padding: '16px 20px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    {/* Agent badge */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: '#000000', border: `2px solid ${agent?.color || (isCollab ? brand.amber : brand.smoke)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: agent?.color || (isCollab ? brand.amber : brand.smoke), fontWeight: 700, fontSize: '12px', flexShrink: 0,
                      opacity: 0.6,
                    }}>
                      {isCollab ? 'CO' : idea.agentName.substring(0, 2)}
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: brand.silver, fontSize: '16px', fontWeight: 700,
                        textDecoration: 'line-through', textDecorationColor: 'rgba(239,68,68,0.4)',
                      }}>{idea.title}</div>
                      <div style={{ color: brand.smoke, fontSize: '12px' }}>
                        by {idea.agentName} {isCollab ? '(Collab)' : ''}
                      </div>
                    </div>

                    {/* Market size badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      background: `${mktColor(idea.marketSize)}15`, color: mktColor(idea.marketSize),
                      textTransform: 'uppercase', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Target size={12} />{idea.marketSize}
                    </span>

                    {/* Rejected badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      background: `${brand.error}15`, color: brand.error, textTransform: 'uppercase',
                    }}>Rejected</span>

                    {/* Stars (read-only) */}
                    {idea.derekRating && (
                      <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} style={{
                            color: s <= (idea.derekRating || 0) ? brand.amber : brand.smoke,
                            fill: s <= (idea.derekRating || 0) ? brand.amber : 'transparent',
                          }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ color: brand.smoke, fontSize: '14px', lineHeight: '1.5', margin: '0 0 12px', paddingLeft: '48px' }}>
                    {idea.description}
                  </p>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: '16px', paddingLeft: '48px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div style={{ color: brand.smoke, fontSize: '12px' }}>
                      <span style={{ color: brand.amber, fontWeight: 600 }}>Revenue:</span> {idea.revenueProjection}
                    </div>
                    <div style={{ color: brand.smoke, fontSize: '12px' }}>
                      <span style={{ color: brand.amber, fontWeight: 600 }}>Model:</span> {idea.businessModel}
                    </div>
                    <div style={{ color: brand.smoke, fontSize: '12px' }}>
                      <span style={{ color: brand.amber, fontWeight: 600 }}>Dev Time:</span> {idea.developmentTime}
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{
                    display: 'flex', gap: '16px', paddingLeft: '48px', fontSize: '11px', color: brand.smoke,
                    borderTop: `1px solid ${brand.border}`, paddingTop: '10px', marginBottom: '10px',
                  }}>
                    <span>Created: {fmtDate(idea.createdAt)}</span>
                    {idea.rejectedAt && <span>Rejected: {fmtDate(idea.rejectedAt)} at {fmtTime(idea.rejectedAt)}</span>}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', paddingLeft: '48px' }}>
                    <button onClick={() => restore(idea.id)} style={{
                      background: `${brand.amber}15`, color: brand.amber,
                      border: `1px solid ${brand.amber}40`, borderRadius: '6px',
                      padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      <RotateCcw size={13} />Restore
                    </button>
                    <button onClick={() => permanentDelete(idea.id)} style={{
                      background: 'transparent', color: brand.smoke,
                      border: `1px solid ${brand.border}`, borderRadius: '6px',
                      padding: '7px 16px', fontSize: '13px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      <Trash2 size={13} />Delete Forever
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
