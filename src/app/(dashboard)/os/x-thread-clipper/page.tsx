'use client';

import { brand, styles } from '@/lib/brand';
import { Twitter, Download, Image as ImageIcon, Instagram, Linkedin, Sparkles } from 'lucide-react';

const M = "'JetBrains Mono','Fira Code',monospace";

export default function XThreadClipperPage() {
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Twitter size={28} style={{ color: brand.amber }} />
            <h1 style={styles.h1}>X Thread Clipper</h1>
          </div>
          <p style={styles.subtitle}>
            Turn viral X threads into visual quote cards. Auto-post to Instagram & LinkedIn.
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
              { icon: <Twitter size={16} />, title: 'Thread Import', desc: 'Paste any X thread URL → auto-extract tweets' },
              { icon: <ImageIcon size={16} />, title: 'Visual Cards', desc: 'Each tweet becomes a branded quote card with typography' },
              { icon: <Instagram size={16} />, title: 'Instagram Export', desc: 'Carousel-ready cards sized for IG' },
              { icon: <Linkedin size={16} />, title: 'LinkedIn Export', desc: 'Professional layout for LinkedIn carousels' },
              { icon: <Download size={16} />, title: 'Bulk Download', desc: 'Export all cards as PNG + PDF' },
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

        {/* Tech Stack */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: brand.white, marginBottom: '1rem' }}>
            Tech Stack
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['X API', 'Canvas API', 'Next.js', 'Sharp', 'InstagramAPI', 'LinkedIn API'].map(tech => (
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
