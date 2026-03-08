'use client';

import { brand, styles } from '@/lib/brand';
import Link from 'next/link';
import { Rocket, Youtube, Twitter, Facebook, Calendar, Activity, TrendingUp, Ship, Mail } from 'lucide-react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planning' | 'archived';
  href: string;
  icon: React.ReactNode;
  category: 'project' | 'feature' | 'legacy';
}

const initiatives: Initiative[] = [
  // New Projects (Paula)
  {
    id: 'x-thread-clipper',
    title: 'X Thread Clipper',
    description: 'Turn viral X threads into visual quote cards + auto-post to Instagram/LinkedIn',
    status: 'planning',
    href: '/os/x-thread-clipper',
    icon: <Twitter size={18} />,
    category: 'project',
  },
  {
    id: 'fb-group-intel',
    title: 'Facebook Group Intel',
    description: 'Monitor target groups (AI, trading, entrepreneurship) and extract trending topics daily',
    status: 'planning',
    href: '/os/fb-group-intel',
    icon: <Facebook size={18} />,
    category: 'project',
  },
  {
    id: 'yt-shorts-gen',
    title: 'YT Shorts Generator',
    description: 'Auto-extract best moments from long-form YT videos → short-form clips for TikTok/YT Shorts',
    status: 'planning',
    href: '/os/yt-shorts-gen',
    icon: <Youtube size={18} />,
    category: 'project',
  },
  
  // New Mission Control Features (Paula)
  {
    id: 'social-dashboard',
    title: 'Social Media Dashboard',
    description: 'Unified view: X mentions, YT comments, FB group activity all in one feed',
    status: 'planning',
    href: '/os/mission-control#social',
    icon: <Activity size={18} />,
    category: 'feature',
  },
  {
    id: 'content-calendar',
    title: 'Content Calendar',
    description: 'Visual timeline of all scheduled posts across X/YT/FB with auto-reminders',
    status: 'planning',
    href: '/os/mission-control#calendar',
    icon: <Calendar size={18} />,
    category: 'feature',
  },
  {
    id: 'engagement-heatmap',
    title: 'Engagement Heatmap',
    description: 'Shows when Derek\'s audience is most active on each platform for optimal posting times',
    status: 'planning',
    href: '/os/mission-control#heatmap',
    icon: <TrendingUp size={18} />,
    category: 'feature',
  },
  
  // Legacy initiatives (already exist)
  {
    id: 'ship-or-kill',
    title: 'Ship or Kill',
    description: 'Focus board: max 2 active ships, everything else freezes or dies',
    status: 'active',
    href: '/os/ship-or-kill',
    icon: <Ship size={18} />,
    category: 'legacy',
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Weekly newsletter management and automation',
    status: 'active',
    href: '/os/newsletter',
    icon: <Mail size={18} />,
    category: 'legacy',
  },
];

const statusColor = (status: Initiative['status']) => {
  if (status === 'active') return brand.success;
  if (status === 'planning') return brand.amber;
  return brand.smoke;
};

const statusLabel = (status: Initiative['status']) => {
  if (status === 'active') return 'Active';
  if (status === 'planning') return 'Planning';
  return 'Archived';
};

export default function AgentInitiativesPage() {
  const projects = initiatives.filter(i => i.category === 'project');
  const features = initiatives.filter(i => i.category === 'feature');
  const legacy = initiatives.filter(i => i.category === 'legacy');

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
            Agent-driven projects and features. Built autonomously, shipped with Derek's approval.
          </p>
        </div>

        {/* New Projects Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: brand.white, margin: 0 }}>
              New Projects
            </h2>
            <span style={{ fontSize: '0.75rem', color: brand.smoke, fontFamily: M }}>
              ({projects.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {projects.map(item => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    ...styles.card,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: `1px solid ${brand.border}`,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = brand.amber)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = brand.border)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ color: brand.amber, flexShrink: 0, marginTop: 2 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: brand.white, margin: 0, marginBottom: 4 }}>
                        {item.title}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        color: statusColor(item.status),
                        fontFamily: M,
                        textTransform: 'uppercase',
                        background: `${statusColor(item.status)}15`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}>
                        {statusLabel(item.status)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: brand.smoke, lineHeight: 1.5, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* New Features Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: brand.white, margin: 0 }}>
              Mission Control Features
            </h2>
            <span style={{ fontSize: '0.75rem', color: brand.smoke, fontFamily: M }}>
              ({features.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {features.map(item => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    ...styles.card,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: `1px solid ${brand.border}`,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = brand.amber)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = brand.border)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ color: brand.amber, flexShrink: 0, marginTop: 2 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: brand.white, margin: 0, marginBottom: 4 }}>
                        {item.title}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        color: statusColor(item.status),
                        fontFamily: M,
                        textTransform: 'uppercase',
                        background: `${statusColor(item.status)}15`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}>
                        {statusLabel(item.status)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: brand.smoke, lineHeight: 1.5, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Legacy Initiatives */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: brand.white, margin: 0 }}>
              Ongoing Initiatives
            </h2>
            <span style={{ fontSize: '0.75rem', color: brand.smoke, fontFamily: M }}>
              ({legacy.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {legacy.map(item => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    ...styles.card,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: `1px solid ${brand.border}`,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = brand.success)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = brand.border)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ color: brand.success, flexShrink: 0, marginTop: 2 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: brand.white, margin: 0, marginBottom: 4 }}>
                        {item.title}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        color: statusColor(item.status),
                        fontFamily: M,
                        textTransform: 'uppercase',
                        background: `${statusColor(item.status)}15`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}>
                        {statusLabel(item.status)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: brand.smoke, lineHeight: 1.5, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
