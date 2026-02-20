'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';

const M = "'JetBrains Mono','Fira Code',monospace";

interface ArchivedTranscript {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  description: string;
  language: string;
  segmentCount: number;
  timestamped: string;
  plain: string;
  archivedAt: string;
}

function getArchive(): ArchivedTranscript[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('yt-transcripts') || '[]');
  } catch { return []; }
}

function saveToArchive(item: ArchivedTranscript) {
  const archive = getArchive();
  archive.unshift(item);
  localStorage.setItem('yt-transcripts', JSON.stringify(archive));
}

function removeFromArchive(id: string) {
  const archive = getArchive().filter(a => a.id !== id);
  localStorage.setItem('yt-transcripts', JSON.stringify(archive));
}

export default function YouTubeTranscriptPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    videoId: string;
    title: string;
    language: string;
    segmentCount: number;
    timestamped: string;
    plain: string;
  } | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [copied, setCopied] = useState(false);
  const [archive, setArchive] = useState<ArchivedTranscript[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'extract' | 'archive'>('extract');

  useEffect(() => {
    setArchive(getArchive());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch transcript');
      } else {
        setResult(data);
        // Auto-archive
        const item: ArchivedTranscript = {
          id: `${data.videoId}-${Date.now()}`,
          videoId: data.videoId,
          title: data.title,
          channel: data.channel || 'Unknown Channel',
          description: data.plain.substring(0, 200).trim() + '...',
          language: data.language,
          segmentCount: data.segmentCount,
          timestamped: data.timestamped,
          plain: data.plain,
          archivedAt: new Date().toISOString(),
        };
        saveToArchive(item);
        setArchive(getArchive());
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text?: string) {
    const content = text || (result ? (showTimestamps ? result.timestamped : result.plain) : '');
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload(format: 'txt' | 'md', title?: string, videoId?: string, timestamped?: string, plain?: string) {
    const t = title || result?.title || 'transcript';
    const vid = videoId || result?.videoId || '';
    const ts = timestamped || result?.timestamped || '';
    const pl = plain || result?.plain || '';
    const text = showTimestamps ? ts : pl;
    const content = format === 'md'
      ? `# ${t}\n\n**Video:** https://youtube.com/watch?v=${vid}\n\n---\n\n${text}`
      : text;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${t.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.${format}`;
    a.click();
  }

  function handleDelete(id: string) {
    removeFromArchive(id);
    setArchive(getArchive());
    if (expandedId === id) setExpandedId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: brand.amber, fontSize: '1.75rem', fontWeight: 700, fontFamily: M, margin: 0 }}>
            ▶ YouTube Transcript Maker
          </h1>
          <p style={{ color: brand.smoke, fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Paste a YouTube URL → get the full transcript · auto-archived
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: `1px solid ${brand.border}`, paddingBottom: 0 }}>
          {(['extract', 'archive'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? brand.graphite : 'transparent',
              border: 'none',
              borderBottom: tab === t ? `2px solid ${brand.amber}` : '2px solid transparent',
              padding: '10px 20px',
              color: tab === t ? brand.amber : brand.smoke,
              fontFamily: M,
              fontSize: '0.8rem',
              fontWeight: tab === t ? 700 : 400,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {t === 'extract' ? '→ Extract' : `📁 Archive (${archive.length})`}
            </button>
          ))}
        </div>

        {/* === EXTRACT TAB === */}
        {tab === 'extract' && (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  flex: 1,
                  background: brand.carbon,
                  border: `1px solid ${brand.border}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: brand.white,
                  fontFamily: M,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button type="submit" disabled={loading || !url.trim()} style={{
                background: loading ? brand.graphite : brand.amber,
                color: brand.void, border: 'none', borderRadius: 8, padding: '12px 24px',
                fontWeight: 700, fontFamily: M, fontSize: '0.875rem',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading || !url.trim() ? 0.5 : 1, whiteSpace: 'nowrap',
              }}>
                {loading ? '⏳ Extracting...' : '→ Extract'}
              </button>
            </form>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: `1px solid ${brand.error}`,
                borderRadius: 8, padding: '12px 16px', color: brand.error,
                fontFamily: M, fontSize: '0.8rem', marginBottom: '1.5rem',
              }}>
                ✗ {error}
              </div>
            )}

            {result && (
              <div>
                <div style={{
                  background: brand.carbon, border: `1px solid ${brand.border}`,
                  borderRadius: 8, padding: '16px', marginBottom: '1rem',
                }}>
                  <h2 style={{ color: brand.white, fontSize: '1rem', fontWeight: 600, margin: 0, marginBottom: 8 }}>
                    {result.title}
                  </h2>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>🌐 {result.language}</span>
                    <span style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>📝 {result.segmentCount} segments</span>
                    <span style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>🔗 {result.videoId}</span>
                    <span style={{ color: brand.success, fontSize: '0.75rem', fontFamily: M }}>✓ Auto-archived</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowTimestamps(!showTimestamps)} style={{
                    background: brand.graphite, border: `1px solid ${showTimestamps ? brand.amber : brand.border}`,
                    borderRadius: 6, padding: '8px 14px', color: showTimestamps ? brand.amber : brand.silver,
                    fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                  }}>
                    ⏱ {showTimestamps ? 'Timestamps ON' : 'Timestamps OFF'}
                  </button>
                  <button onClick={() => handleCopy()} style={{
                    background: copied ? brand.success : brand.graphite,
                    border: `1px solid ${copied ? brand.success : brand.border}`,
                    borderRadius: 6, padding: '8px 14px',
                    color: copied ? brand.void : brand.silver,
                    fontFamily: M, fontSize: '0.75rem', cursor: 'pointer', fontWeight: copied ? 700 : 400,
                  }}>
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button onClick={() => handleDownload('txt')} style={{
                    background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                    padding: '8px 14px', color: brand.silver, fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                  }}>⬇ .txt</button>
                  <button onClick={() => handleDownload('md')} style={{
                    background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                    padding: '8px 14px', color: brand.silver, fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                  }}>⬇ .md</button>
                </div>

                <pre style={{
                  background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: 8,
                  padding: '16px', color: brand.silver, fontFamily: M, fontSize: '0.8rem',
                  lineHeight: 1.7, maxHeight: '60vh', overflowY: 'auto',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {showTimestamps ? result.timestamped : result.plain}
                </pre>
              </div>
            )}
          </>
        )}

        {/* === ARCHIVE TAB === */}
        {tab === 'archive' && (
          <div>
            {archive.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: brand.smoke, fontFamily: M, fontSize: '0.85rem' }}>
                No transcripts archived yet. Extract a video to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {archive.map(item => (
                  <div key={item.id} style={{
                    background: brand.carbon,
                    border: `1px solid ${expandedId === item.id ? brand.amber : brand.border}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}>
                    {/* Collapsed header — always visible */}
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      style={{
                        width: '100%', background: 'none', border: 'none', padding: '14px 16px',
                        cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ color: brand.smoke, fontSize: '0.7rem', fontFamily: M }}>
                            {formatDate(item.archivedAt)}
                          </span>
                          <span style={{ color: brand.amber, fontSize: '0.7rem', fontFamily: M }}>
                            {item.segmentCount} segments
                          </span>
                        </div>
                        <div style={{ color: brand.white, fontSize: '0.9rem', fontWeight: 600, marginBottom: 3 }}>
                          {item.title}
                        </div>
                        <div style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M, marginBottom: 4 }}>
                          {item.channel}
                        </div>
                        <div style={{ color: brand.silver, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.7 }}>
                          {item.description}
                        </div>
                      </div>
                      <span style={{ color: brand.amber, fontSize: '1.2rem', flexShrink: 0, marginTop: 4 }}>
                        {expandedId === item.id ? '▾' : '▸'}
                      </span>
                    </button>

                    {/* Expanded content */}
                    {expandedId === item.id && (
                      <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${brand.border}` }}>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                          <button onClick={() => handleCopy(item.timestamped)} style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                          }}>📋 Copy</button>
                          <button onClick={() => handleDownload('txt', item.title, item.videoId, item.timestamped, item.plain)} style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                          }}>⬇ .txt</button>
                          <button onClick={() => handleDownload('md', item.title, item.videoId, item.timestamped, item.plain)} style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                          }}>⬇ .md</button>
                          <a href={`https://youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noopener noreferrer" style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            textDecoration: 'none',
                          }}>🔗 Video</a>
                          <button onClick={() => handleDelete(item.id)} style={{
                            background: 'rgba(239,68,68,0.1)', border: `1px solid ${brand.error}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.error, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            marginLeft: 'auto',
                          }}>🗑 Delete</button>
                        </div>
                        <pre style={{
                          background: brand.void, border: `1px solid ${brand.border}`, borderRadius: 8,
                          padding: '14px', color: brand.silver, fontFamily: M, fontSize: '0.75rem',
                          lineHeight: 1.6, maxHeight: '50vh', overflowY: 'auto',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                          {item.timestamped}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
