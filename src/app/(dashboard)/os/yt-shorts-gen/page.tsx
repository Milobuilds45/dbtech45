'use client';

import { brand, styles } from '@/lib/brand';
import { Youtube, Scissors, Sparkles, Video, Download, Zap } from 'lucide-react';

const M = "'JetBrains Mono','Fira Code',monospace";

export default function YTShortsGenPage() {
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Youtube size={28} style={{ color: brand.amber }} />
            <h1 style={styles.h1}>YT Shorts Generator</h1>
          </div>
          <p style={styles.subtitle}>
            Auto-extract best moments from long-form YT videos → short-form clips for TikTok/YT Shorts.
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
              { icon: <Youtube size={16} />, title: 'Video Analysis', desc: 'Paste any YT URL → auto-analyze transcript + engagement signals' },
              { icon: <Sparkles size={16} />, title: 'AI Moment Detection', desc: 'Gemini identifies viral-worthy moments (hooks, punchlines, insights)' },
              { icon: <Scissors size={16} />, title: 'Auto-Clipping', desc: 'Extract 15-60s clips with perfect framing (9:16 vertical)' },
              { icon: <Video size={16} />, title: 'Captions Overlay', desc: 'Auto-generate animated captions for accessibility + retention' },
              { icon: <Download size={16} />, title: 'Multi-Export', desc: 'Export for YT Shorts, TikTok, Instagram Reels (optimized for each)' },
              { icon: <Zap size={16} />, title: 'Batch Processing', desc: 'Queue multiple videos → auto-process overnight' },
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

        {/* Use Cases */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: brand.white, marginBottom: '1rem' }}>
            Use Cases
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              'Podcast highlights',
              'Course promos',
              'Interview best moments',
              'Trading breakdowns',
              'Tutorial clips',
              'Product demos',
            ].map(useCase => (
              <span key={useCase} style={{
                fontSize: '0.75rem',
                fontFamily: M,
                color: brand.smoke,
                background: brand.graphite,
                padding: '4px 12px',
                borderRadius: 4,
                border: `1px solid ${brand.border}`,
              }}>
                {useCase}
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
            {['yt-dlp', 'FFmpeg', 'Gemini 3 Pro', 'Whisper (transcription)', 'Canvas API', 'Sharp'].map(tech => (
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
