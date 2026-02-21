'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { fetchTranscriptClient } from '@/lib/youtube-client';
import {
  Play, Youtube, Tv, Brain, ChevronDown, ChevronRight, ChevronUp,
  Copy, Check, Download, FileText, Trash2, ExternalLink, Clock,
  Loader2, Sparkles, Archive, X, Search
} from 'lucide-react';

const M = "'JetBrains Mono','Fira Code',monospace";

interface ArchivedTranscript {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  description: string;
  summary?: string;
  language: string;
  segmentCount: number;
  timestamped: string;
  plain: string;
  archivedAt: string;
}

function updateArchiveItem(id: string, updates: Partial<ArchivedTranscript>) {
  const archive = getArchive();
  const idx = archive.findIndex(a => a.id === id);
  if (idx >= 0) {
    archive[idx] = { ...archive[idx], ...updates };
    localStorage.setItem('yt-transcripts', JSON.stringify(archive));
  }
  return archive;
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

function SummaryDisplay({ summary }: { summary: string }) {
  // Parse the summary — each line starting with • or - or * or a number is a bullet
  const lines = summary.split('\n').filter(l => l.trim().length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Check if it's a section header (starts with ** or ## or all caps short line)
        const isHeader = (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
          trimmed.startsWith('## ') || trimmed.startsWith('# ');
        // Check if it's a bullet point
        const isBullet = /^[•\-\*]\s/.test(trimmed) || /^\d+[\.\)]\s/.test(trimmed);
        const cleanText = trimmed
          .replace(/^[•\-\*]\s*/, '')
          .replace(/^\d+[\.\)]\s*/, '')
          .replace(/^\*\*/, '')
          .replace(/\*\*$/, '')
          .replace(/^##?\s*/, '');

        if (isHeader) {
          return (
            <div key={i} style={{
              color: brand.amber, fontSize: '0.75rem', fontFamily: M,
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
              marginTop: i > 0 ? 8 : 0,
            }}>
              {cleanText}
            </div>
          );
        }

        if (isBullet) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: brand.amber, fontSize: '0.7rem', marginTop: 2, flexShrink: 0 }}>›</span>
              <span style={{ color: brand.silver, fontSize: '0.8rem', lineHeight: 1.5 }}>{cleanText}</span>
            </div>
          );
        }

        // Regular text line
        return (
          <div key={i} style={{ color: brand.silver, fontSize: '0.8rem', lineHeight: 1.5 }}>
            {trimmed}
          </div>
        );
      })}
    </div>
  );
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
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function handleSummarize(item: ArchivedTranscript) {
    if (item.summary) return;
    setSummarizing(item.id);
    try {
      const res = await fetch('/api/youtube-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, channel: item.channel, plain: item.plain }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        const updated = updateArchiveItem(item.id, { summary: data.summary });
        setArchive(updated);
      }
    } catch { /* ignore */ }
    setSummarizing(null);
  }

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
      const data = await fetchTranscriptClient(url.trim());
      setResult(data);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transcript. Please try again.');
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
    setDeleteConfirm(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: brand.amber, fontSize: '1.75rem', fontWeight: 700, fontFamily: M, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Youtube size={28} /> YouTube Transcript Maker
          </h1>
          <p style={{ color: brand.smoke, fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Paste a YouTube URL &rarr; get the full transcript &middot; auto-archived
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
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t === 'extract' ? <><Search size={14} /> Extract</> : <><Archive size={14} /> Archive ({archive.length})</>}
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
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {loading ? <><Loader2 size={14} className="animate-spin" /> extracting</> : <><Play size={14} /> Extract</>}
              </button>
            </form>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: `1px solid ${brand.error}`,
                borderRadius: 8, padding: '12px 16px', color: brand.error,
                fontFamily: M, fontSize: '0.8rem', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <X size={14} /> {error}
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
                    <span style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>{result.language}</span>
                    <span style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>{result.segmentCount} segments</span>
                    <span style={{ color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>{result.videoId}</span>
                    <span style={{ color: brand.success, fontSize: '0.75rem', fontFamily: M, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> archived
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowTimestamps(!showTimestamps)} style={{
                    background: brand.graphite, border: `1px solid ${showTimestamps ? brand.amber : brand.border}`,
                    borderRadius: 6, padding: '8px 14px', color: showTimestamps ? brand.amber : brand.silver,
                    fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Clock size={12} /> {showTimestamps ? 'timestamps: on' : 'timestamps: off'}
                  </button>
                  <button onClick={() => handleCopy()} style={{
                    background: copied ? brand.success : brand.graphite,
                    border: `1px solid ${copied ? brand.success : brand.border}`,
                    borderRadius: 6, padding: '8px 14px',
                    color: copied ? brand.void : brand.silver,
                    fontFamily: M, fontSize: '0.75rem', cursor: 'pointer', fontWeight: copied ? 700 : 400,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {copied ? <><Check size={12} /> copied</> : <><Copy size={12} /> copy</>}
                  </button>
                  <button onClick={() => handleDownload('txt')} style={{
                    background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                    padding: '8px 14px', color: brand.silver, fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}><Download size={12} /> .txt</button>
                  <button onClick={() => handleDownload('md')} style={{
                    background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                    padding: '8px 14px', color: brand.silver, fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}><FileText size={12} /> .md</button>
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
                    {/* Collapsed header */}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ color: brand.smoke, fontSize: '0.7rem', fontFamily: M }}>
                              {formatDate(item.archivedAt)}
                            </span>
                            <span style={{ color: brand.amber, fontSize: '0.7rem', fontFamily: M }}>
                              {item.segmentCount} segments
                            </span>
                            <a
                              href={`https://youtube.com/watch?v=${item.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ color: '#f87171', fontSize: '0.7rem', fontFamily: M, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Play size={10} /> watch on youtube
                            </a>
                          </div>
                          <div style={{ color: brand.white, fontSize: '0.9rem', fontWeight: 600, marginBottom: 3 }}>
                            {item.title}
                          </div>
                          <div style={{ color: brand.amber, fontSize: '0.8rem', fontFamily: M, marginBottom: 6, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Tv size={13} /> {item.channel}
                          </div>
                          <div style={{ color: brand.silver, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.7 }}>
                            {item.description}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                          <button
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            style={{ background: 'none', border: 'none', color: brand.amber, cursor: 'pointer', padding: 0 }}
                          >
                            {expandedId === item.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => handleSummarize(item)}
                          disabled={summarizing === item.id}
                          style={{
                            background: item.summary ? 'rgba(16,185,129,0.1)' : brand.graphite,
                            border: `1px solid ${item.summary ? brand.success : brand.border}`,
                            borderRadius: 6, padding: '5px 10px',
                            color: item.summary ? brand.success : brand.silver,
                            fontFamily: M, fontSize: '0.7rem', cursor: summarizing === item.id ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          {summarizing === item.id ? (
                            <><Loader2 size={11} /> summarizing</>
                          ) : item.summary ? (
                            <><Check size={11} /> TL;DR ready</>
                          ) : (
                            <><Brain size={11} /> TL;DR</>
                          )}
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`,
                            borderRadius: 6, padding: '5px 10px',
                            color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          {expandedId === item.id ? <><ChevronUp size={11} /> collapse</> : <><ChevronDown size={11} /> full transcript</>}
                        </button>
                        <button
                          onClick={() => {
                            if (deleteConfirm === item.id) {
                              handleDelete(item.id);
                            } else {
                              setDeleteConfirm(item.id);
                              setTimeout(() => setDeleteConfirm(null), 3000);
                            }
                          }}
                          style={{
                            background: deleteConfirm === item.id ? 'rgba(239,68,68,0.15)' : brand.graphite,
                            border: `1px solid ${deleteConfirm === item.id ? brand.error : brand.border}`,
                            borderRadius: 6, padding: '5px 10px',
                            color: deleteConfirm === item.id ? brand.error : 'rgba(239,68,68,0.5)',
                            fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                            marginLeft: 'auto',
                          }}
                          onMouseEnter={e => { if (deleteConfirm !== item.id) e.currentTarget.style.color = brand.error }}
                          onMouseLeave={e => { if (deleteConfirm !== item.id) e.currentTarget.style.color = 'rgba(239,68,68,0.5)' }}
                        >
                          <Trash2 size={11} /> {deleteConfirm === item.id ? 'confirm delete' : 'delete'}
                        </button>
                      </div>

                      {/* Summary display */}
                      {item.summary && (
                        <div style={{
                          marginTop: 10, background: 'rgba(16,185,129,0.05)',
                          border: `1px solid rgba(16,185,129,0.2)`,
                          borderRadius: 8, padding: '12px 14px',
                        }}>
                          <div style={{ color: brand.success, fontSize: '0.7rem', fontFamily: M, marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Sparkles size={12} /> TL;DR
                          </div>
                          <SummaryDisplay summary={item.summary} />
                        </div>
                      )}
                    </div>

                    {/* Expanded content */}
                    {expandedId === item.id && (
                      <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${brand.border}` }}>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                          <button onClick={() => handleCopy(item.timestamped)} style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}><Copy size={11} /> copy</button>
                          <button onClick={() => handleDownload('txt', item.title, item.videoId, item.timestamped, item.plain)} style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}><Download size={11} /> .txt</button>
                          <button onClick={() => handleDownload('md', item.title, item.videoId, item.timestamped, item.plain)} style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}><FileText size={11} /> .md</button>
                          <a href={`https://youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noopener noreferrer" style={{
                            background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: brand.silver, fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
                          }}><ExternalLink size={11} /> video</a>
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
