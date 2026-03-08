'use client';

import { brand, styles } from '@/lib/brand';
import { Facebook, TrendingUp, Users, Bell, BarChart3, Sparkles } from 'lucide-react';

const M = "'JetBrains Mono','Fira Code',monospace";

export default function FBGroupIntelPage() {
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Facebook size={28} style={{ color: brand.amber }} />
            <h1 style={styles.h1}>Facebook Group Intel</h1>
          </div>
          <p style={styles.subtitle}>
            Monitor target groups (AI, trading, entrepreneurship). Extract trending topics daily.
          </p>
        </div>

        {/* Status Card */}
        <div style={{
          ...styles.card,
          padding: '1.5rem',
          marginBottom: '2rem',
          background: 'rgba(245, 158, 11, 0.05)',
          border: `1px solid ${brand.amber}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Sparkles size={16} style={{ color: brand.amber }} />
            <span style={{ fontSize: '0.85rem', fontFamily: M, color: brand.amber, fontWeight: 600, textTransform: 'uppercase' }}>
              Planning Phase
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: brand.white, lineHeight: 1.6, margin: 0 }}>
            Paula is building this. Check back soon for the full experience.
          </p>
        </div>

        {/* Feature Preview */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: brand.white, marginBottom: '1rem' }}>
            Planned Features
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { icon: <Users size={16} />, title: 'Group Monitor', desc: 'Track multiple FB groups: AI, trading, entrepreneurship communities' },
              { icon: <TrendingUp size={16} />, title: 'Trending Topics', desc: 'Auto-detect most discussed topics + sentiment analysis' },
              { icon: <Bell size={16} />, title: 'Smart Alerts', desc: 'Notify when keywords spike (AI models, trading strategies, etc.)' },
              { icon: <BarChart3 size={16} />, title: 'Engagement Analytics', desc: 'Track post velocity, top contributors, engagement patterns' },
              { icon: <Facebook size={16} />, title: 'Daily Digest', desc: 'Morning brief of top discussions + opportunities' },
            ].map((feature, i) => (
              <div key={i} style={{ ...styles.card, padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ color: brand.amber, flexShrink: 0, marginTop: 2 }}>
                  {feature.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: brand.white, marginBottom: 4 }}>
                    {feature.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: brand.smoke }}>
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Groups */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: brand.white, marginBottom: '1rem' }}>
            Target Groups
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              'AI Founders & Builders',
              'Day Traders',
              'Options Flow',
              'SaaS Entrepreneurs',
              'AI Automation',
              'Indie Hackers',
            ].map(group => (
              <span key={group} style={{
                fontSize: '0.75rem',
                fontFamily: M,
                color: brand.smoke,
                background: brand.graphite,
                padding: '4px 12px',
                borderRadius: 4,
                border: `1px solid ${brand.border}`,
              }}>
                {group}
              </span>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: brand.white, marginBottom: '1rem' }}>
            Tech Stack
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Facebook Graph API', 'Playwright (scraper)', 'Gemini (sentiment)', 'Supabase', 'Cron'].map(tech => (
              <span key={tech} style={{
                fontSize: '0.75rem',
                fontFamily: M,
                color: brand.smoke,
                background: brand.graphite,
                padding: '4px 12px',
                borderRadius: 4,
                border: `1px solid ${brand.border}`,
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
