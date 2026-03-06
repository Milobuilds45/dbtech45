'use client';
import { useState, useEffect, useRef } from 'react';
import { brand, styles } from '@/lib/brand';
import { fetchTranscriptClient } from '@/lib/youtube-client';
import {
  Play, Youtube, Tv, Brain, ChevronDown, ChevronRight, ChevronUp,
  Copy, Check, Download, FileText, Trash2, ExternalLink, Clock,
  Loader2, Sparkles, Archive, X, Search, MessageCircle, Send
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
    // Also update in DB
    fetch('/api/transcripts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => {});
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
  // Also save to DB
  fetch('/api/transcripts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).catch(() => {});
}

function removeFromArchive(id: string) {
  const archive = getArchive().filter(a => a.id !== id);
  localStorage.setItem('yt-transcripts', JSON.stringify(archive));
  // Also delete from DB
  fetch(`/api/transcripts?id=${id}`, { method: 'DELETE' }).catch(() => {});
}

function SummaryDisplay({ summary, videoId }: { summary: string; videoId?: string }) {
  const lines = summary.split('\n').filter(l => l.trim().length > 0);

  // Render text with clickable timestamps
  function renderWithTimestamps(text: string) {
    if (!videoId) return <>{text}</>;
    
    // Match [0:42], [1:23:45], (0:42), 0:42 — with or without brackets/parens
    const parts = text.split(/(\[?\(?\d{1,2}:\d{2}(?::\d{2})?\)?\]?)/g);
    
    return (
      <>
        {parts.map((part, j) => {
          const tsMatch = part.match(/^\[?\(?(\d{1,2}:\d{2}(?::\d{2})?)\)?\]?$/);
          if (tsMatch && /\d+:\d{2}/.test(tsMatch[1])) {
            const tsStr = tsMatch[1];
            const tsParts = tsStr.split(':').map(Number);
            // Sanity check — must be plausible time values
            if (tsParts.some(p => isNaN(p))) return <span key={j}>{part}</span>;
            const secs = tsParts.length === 3
              ? tsParts[0] * 3600 + tsParts[1] * 60 + tsParts[2]
              : tsParts[0] * 60 + tsParts[1];
            if (secs > 36000) return <span key={j}>{part}</span>; // Skip if > 10 hours
            return (
              <a
                key={j}
                href={`https://youtube.com/watch?v=${videoId}&t=${secs}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: brand.amber, textDecoration: 'none', fontWeight: 600,
                  fontFamily: M, cursor: 'pointer', background: 'rgba(245,158,11,0.1)',
                  padding: '1px 4px', borderRadius: 3,
                }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
              >
                {part}
              </a>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const isHeader = (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
          trimmed.startsWith('## ') || trimmed.startsWith('# ');
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
              {renderWithTimestamps(cleanText)}
            </div>
          );
        }

        if (isBullet) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: brand.amber, fontSize: '0.7rem', marginTop: 2, flexShrink: 0 }}>›</span>
              <span style={{ color: brand.silver, fontSize: '0.8rem', lineHeight: 1.5 }}>{renderWithTimestamps(cleanText)}</span>
            </div>
          );
        }

        return (
          <div key={i} style={{ color: brand.silver, fontSize: '0.8rem', lineHeight: 1.5 }}>
            {renderWithTimestamps(trimmed)}
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
    channel?: string;
    language: string;
    segmentCount: number;
    timestamped: string;
    plain: string;
    summary?: string;
  } | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [copied, setCopied] = useState(false);
  const [archive, setArchive] = useState<ArchivedTranscript[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'extract' | 'archive'>('extract');
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [summarizingCurrent, setSummarizingCurrent] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<Record<string, boolean>>({});
  const [showCurrentSummary, setShowCurrentSummary] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Archive chat state (per item)
  const [archiveChatMessages, setArchiveChatMessages] = useState<Record<string, { role: 'user' | 'ai'; text: string }[]>>({});
  const [archiveChatInput, setArchiveChatInput] = useState<Record<string, string>>({});
  const [archiveChatLoading, setArchiveChatLoading] = useState<Record<string, boolean>>({});
  const [archiveShowChat, setArchiveShowChat] = useState<Record<string, boolean>>({});
  const archiveChatEndRef = useRef<HTMLDivElement>(null);

  async function handleSummarizeCurrent(forceRegenerate = false) {
    if (!result || (result.summary && !forceRegenerate)) return;
    setSummarizingCurrent(true);
    setShowCurrentSummary(true);
    try {
      const res = await fetch('/api/youtube-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: result.title, channel: result.channel || 'Unknown', plain: result.plain, timestamped: result.timestamped }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setResult(prev => prev ? { ...prev, summary: data.summary } : null);
        const archiveList = getArchive();
        const latestArchive = archiveList.find(a => a.videoId === result.videoId);
        if (latestArchive) {
          setArchive(updateArchiveItem(latestArchive.id, { summary: data.summary }));
        }
      }
    } catch { /* ignore */ }
    setSummarizingCurrent(false);
  }

  async function handleChatSend() {
    if (!chatInput.trim() || !result || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch('/api/youtube-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          title: result.title,
          channel: result.channel || 'Unknown',
          timestamped: result.timestamped,
          plain: result.plain,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      if (res.ok && data.answer) {
        setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I couldn\'t process that question. Try again.' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function handleArchiveChatSend(item: ArchivedTranscript) {
    const input = (archiveChatInput[item.id] || '').trim();
    if (!input || archiveChatLoading[item.id]) return;
    setArchiveChatInput(prev => ({ ...prev, [item.id]: '' }));
    setArchiveChatMessages(prev => ({ ...prev, [item.id]: [...(prev[item.id] || []), { role: 'user', text: input }] }));
    setArchiveChatLoading(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => archiveChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch('/api/youtube-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          title: item.title,
          channel: item.channel || 'Unknown',
          timestamped: item.timestamped,
          plain: item.plain,
          history: (archiveChatMessages[item.id] || []).slice(-6),
        }),
      });
      const data = await res.json();
      const answer = (res.ok && data.answer) ? data.answer : 'Sorry, couldn\'t process that. Try again.';
      setArchiveChatMessages(prev => ({ ...prev, [item.id]: [...(prev[item.id] || []), { role: 'ai', text: answer }] }));
    } catch {
      setArchiveChatMessages(prev => ({ ...prev, [item.id]: [...(prev[item.id] || []), { role: 'ai', text: 'Connection error. Please try again.' }] }));
    }
    setArchiveChatLoading(prev => ({ ...prev, [item.id]: false }));
    setTimeout(() => archiveChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function handleSummarize(item: ArchivedTranscript) {
    if (item.summary) return;
    setSummarizing(item.id);
    try {
      const res = await fetch('/api/youtube-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, channel: item.channel, plain: item.plain, timestamped: item.timestamped }),
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
    // Load from localStorage first (instant)
    setArchive(getArchive());
    // Then sync from DB (may have data from other devices/sessions)
    fetch('/api/transcripts')
      .then(r => r.json())
      .then(data => {
        if (data.transcripts && data.transcripts.length > 0) {
          const dbItems: ArchivedTranscript[] = data.transcripts.map((t: any) => ({
            id: t.id,
            videoId: t.video_id,
            title: t.title,
            channel: t.channel,
            description: t.description,
            summary: t.summary,
            language: t.language,
            segmentCount: t.segment_count,
            timestamped: t.timestamped,
            plain: t.plain,
            archivedAt: t.archived_at,
          }));
          // Merge: DB is source of truth, but keep any localStorage-only items
          const localArchive = getArchive();
          const dbIds = new Set(dbItems.map(i => i.id));
          const localOnly = localArchive.filter(i => !dbIds.has(i.id));
          // Push local-only items to DB
          localOnly.forEach(item => {
            fetch('/api/transcripts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            }).catch(() => {});
          });
          const merged = [...dbItems, ...localOnly];
          merged.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
          localStorage.setItem('yt-transcripts', JSON.stringify(merged));
          setArchive(merged);
        }
      })
      .catch(() => {}); // DB unavailable — localStorage is fine
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    setChatMessages([]);
    setShowChat(false);
    setShowCurrentSummary(true);

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
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}>
                  <a href={`https://youtube.com/watch?v=${result.videoId}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                    <img
                      src={`https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`}
                      alt={result.title}
                      style={{ width: 180, height: 101, objectFit: 'cover', borderRadius: 6, border: `1px solid ${brand.border}`, display: 'block' }}
                    />
                  </a>
                  <div>
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
                  <button onClick={() => {
                    if (result.summary) {
                      // If summary exists but has no timestamps, regenerate
                      const hasTimestamps = /\[\d+:\d{2}/.test(result.summary);
                      if (!hasTimestamps && !showCurrentSummary) {
                        handleSummarizeCurrent(true);
                      } else {
                        setShowCurrentSummary(!showCurrentSummary);
                      }
                    } else {
                      handleSummarizeCurrent();
                    }
                  }} disabled={summarizingCurrent} style={{
                    background: result.summary && showCurrentSummary ? 'rgba(245,158,11,0.1)' : brand.graphite,
                    border: `1px solid ${result.summary ? brand.amber : brand.border}`, borderRadius: 6,
                    padding: '8px 14px', color: result.summary ? brand.amber : brand.silver, fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {summarizingCurrent ? <><Loader2 size={12} className="animate-spin" /> summarizing...</> :
                     result.summary ? (showCurrentSummary ? <><ChevronUp size={12} /> hide breakdown</> : <><ChevronDown size={12} /> show breakdown</>) :
                     <><Brain size={12} /> ai summarize</>}
                  </button>
                  <button onClick={() => { setShowChat(!showChat); }} style={{
                    background: showChat ? 'rgba(139, 92, 246, 0.1)' : brand.graphite,
                    border: `1px solid ${showChat ? '#8B5CF6' : brand.border}`, borderRadius: 6,
                    padding: '8px 14px', color: showChat ? '#8B5CF6' : brand.silver, fontFamily: M, fontSize: '0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <MessageCircle size={12} /> {showChat ? 'hide chat' : 'ask video'}
                  </button>
                </div>

                {result.summary && showCurrentSummary && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.05)', border: `1px solid ${brand.amber}`,
                    borderRadius: 8, padding: '16px', marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ color: brand.amber, fontFamily: M, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Brain size={14} /> KEY MOMENTS
                      </div>
                      <button
                        onClick={() => setShowCurrentSummary(false)}
                        style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', padding: 2 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <SummaryDisplay summary={result.summary} videoId={result.videoId} />
                  </div>
                )}

                {/* === ASK THIS VIDEO CHAT (inline) === */}
                {showChat && (
                  <div style={{
                    marginBottom: '1rem', background: brand.carbon, border: `1px solid #8B5CF6`,
                    borderRadius: 10, overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '12px 16px', borderBottom: `1px solid ${brand.border}`,
                      background: 'rgba(139, 92, 246, 0.05)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <MessageCircle size={14} style={{ color: '#8B5CF6' }} />
                      <span style={{ color: '#8B5CF6', fontFamily: M, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        ASK THIS VIDEO
                      </span>
                      <span style={{ color: brand.smoke, fontFamily: M, fontSize: '0.65rem', marginLeft: 'auto' }}>
                        powered by gemini flash
                      </span>
                    </div>
                    <div style={{
                      padding: '16px', maxHeight: '400px', overflowY: 'auto',
                      display: 'flex', flexDirection: 'column', gap: 12,
                      minHeight: chatMessages.length === 0 ? 80 : undefined,
                    }}>
                      {chatMessages.length === 0 && (
                        <div style={{ color: brand.smoke, fontFamily: M, fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                          Ask anything about this video — quotes, facts, timestamps, explanations...
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}>
                          <div style={{
                            background: msg.role === 'user' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 158, 11, 0.05)',
                            border: `1px solid ${msg.role === 'user' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(245, 158, 11, 0.15)'}`,
                            borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            padding: '10px 14px', maxWidth: '85%',
                          }}>
                            <div style={{ color: msg.role === 'user' ? '#C4B5FD' : brand.silver, fontSize: '0.8rem', lineHeight: 1.6, fontFamily: M }}>
                              {msg.role === 'ai' ? (
                                <SummaryDisplay summary={msg.text} videoId={result.videoId} />
                              ) : msg.text}
                            </div>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: brand.smoke, fontSize: '0.75rem', fontFamily: M }}>
                          <Loader2 size={14} className="animate-spin" /> thinking...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div style={{
                      padding: '12px 16px', borderTop: `1px solid ${brand.border}`,
                      display: 'flex', gap: 8,
                    }}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                        placeholder="What did they say about..."
                        style={{
                          flex: 1, background: brand.void, border: `1px solid ${brand.border}`,
                          borderRadius: 8, padding: '10px 14px', color: brand.white,
                          fontFamily: M, fontSize: '0.8rem', outline: 'none',
                        }}
                      />
                      <button
                        onClick={handleChatSend}
                        disabled={chatLoading || !chatInput.trim()}
                        style={{
                          background: chatLoading ? brand.graphite : '#8B5CF6',
                          border: 'none', borderRadius: 8, padding: '10px 16px',
                          color: '#fff', cursor: chatLoading ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontFamily: M, fontSize: '0.8rem', fontWeight: 600,
                          opacity: chatLoading || !chatInput.trim() ? 0.5 : 1,
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {showTimestamps ? (
                  <div style={{
                    background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: 8,
                    padding: '16px', fontFamily: M, fontSize: '0.8rem',
                    lineHeight: 1.7, maxHeight: '60vh', overflowY: 'auto',
                  }}>
                    {result.timestamped.split('\n').map((line, i) => {
                      const tsMatch = line.match(/^\[(\d+:\d{2}(?::\d{2})?)\]\s*(.*)/);
                      if (tsMatch) {
                        const tsStr = tsMatch[1];
                        const text = tsMatch[2];
                        const parts = tsStr.split(':').map(Number);
                        const secs = parts.length === 3
                          ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                          : parts[0] * 60 + parts[1];
                        return (
                          <div key={i} style={{ marginBottom: 4 }}>
                            <a
                              href={`https://youtube.com/watch?v=${result.videoId}&t=${secs}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: brand.amber, textDecoration: 'none', fontWeight: 600,
                                cursor: 'pointer', marginRight: 8,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                            >
                              [{tsStr}]
                            </a>
                            <span style={{ color: brand.silver }}>{text}</span>
                          </div>
                        );
                      }
                      return <div key={i} style={{ color: brand.silver, marginBottom: 4 }}>{line}</div>;
                    })}
                  </div>
                ) : (
                  <pre style={{
                    background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: 8,
                    padding: '16px', color: brand.silver, fontFamily: M, fontSize: '0.8rem',
                    lineHeight: 1.7, maxHeight: '60vh', overflowY: 'auto',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {result.plain}
                  </pre>
                )}

                {/* Chat is now inline above transcript */}
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
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        {/* YouTube Thumbnail */}
                        <a
                          href={`https://youtube.com/watch?v=${item.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ flexShrink: 0 }}
                        >
                          <img
                            src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                            alt={item.title}
                            style={{
                              width: 140, height: 79, objectFit: 'cover',
                              borderRadius: 6, border: `1px solid ${brand.border}`,
                              display: 'block',
                            }}
                          />
                        </a>
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
                              <Play size={10} /> watch
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
                          onClick={() => {
                            if (item.summary) {
                              setShowSummary(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                            } else {
                              handleSummarize(item);
                              setShowSummary(prev => ({ ...prev, [item.id]: true }));
                            }
                          }}
                          disabled={summarizing === item.id}
                          style={{
                            background: item.summary && showSummary[item.id] ? 'rgba(16,185,129,0.1)' : brand.graphite,
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
                            showSummary[item.id] ? <><ChevronUp size={11} /> hide breakdown</> : <><ChevronDown size={11} /> show breakdown</>
                          ) : (
                            <><Brain size={11} /> breakdown</>
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
                      {item.summary && showSummary[item.id] && (
                        <div style={{
                          marginTop: 10, background: 'rgba(16,185,129,0.05)',
                          border: `1px solid rgba(16,185,129,0.2)`,
                          borderRadius: 8, padding: '12px 14px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ color: brand.success, fontSize: '0.7rem', fontFamily: M, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Sparkles size={12} /> KEY MOMENTS
                            </div>
                            <button
                              onClick={() => setShowSummary(prev => ({ ...prev, [item.id]: false }))}
                              style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', padding: 2 }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <SummaryDisplay summary={item.summary} videoId={item.videoId} />
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
                          <button onClick={() => setArchiveShowChat(prev => ({ ...prev, [item.id]: !prev[item.id] }))} style={{
                            background: archiveShowChat[item.id] ? 'rgba(139,92,246,0.1)' : brand.graphite,
                            border: `1px solid ${archiveShowChat[item.id] ? '#8B5CF6' : brand.border}`, borderRadius: 6,
                            padding: '6px 12px', color: archiveShowChat[item.id] ? '#8B5CF6' : brand.silver,
                            fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}><MessageCircle size={11} /> {archiveShowChat[item.id] ? 'hide chat' : 'ask video'}</button>
                        </div>

                        {/* Archive Ask Video Chat */}
                        {archiveShowChat[item.id] && (
                          <div style={{ marginBottom: 12, background: brand.void, border: `1px solid #8B5CF6`, borderRadius: 8, overflow: 'hidden' }}>
                            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${brand.border}`, background: 'rgba(139,92,246,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <MessageCircle size={12} style={{ color: '#8B5CF6' }} />
                              <span style={{ color: '#8B5CF6', fontFamily: M, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>ASK THIS VIDEO</span>
                              <span style={{ color: brand.smoke, fontFamily: M, fontSize: '0.6rem', marginLeft: 'auto' }}>gemini flash</span>
                            </div>
                            <div style={{ padding: '12px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, minHeight: (archiveChatMessages[item.id] || []).length === 0 ? 60 : undefined }}>
                              {(archiveChatMessages[item.id] || []).length === 0 && (
                                <div style={{ color: brand.smoke, fontFamily: M, fontSize: '0.75rem', textAlign: 'center', padding: '12px 0' }}>
                                  Ask anything about this video...
                                </div>
                              )}
                              {(archiveChatMessages[item.id] || []).map((msg, mi) => (
                                <div key={mi} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                  <div style={{
                                    background: msg.role === 'user' ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.05)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.15)'}`,
                                    borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                                    padding: '8px 12px', maxWidth: '85%',
                                  }}>
                                    <div style={{ color: msg.role === 'user' ? '#C4B5FD' : brand.silver, fontSize: '0.75rem', lineHeight: 1.5, fontFamily: M }}>
                                      {msg.role === 'ai' ? <SummaryDisplay summary={msg.text} videoId={item.videoId} /> : msg.text}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {archiveChatLoading[item.id] && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: brand.smoke, fontSize: '0.7rem', fontFamily: M }}>
                                  <Loader2 size={12} className="animate-spin" /> thinking...
                                </div>
                              )}
                              <div ref={archiveChatEndRef} />
                            </div>
                            <div style={{ padding: '10px 12px', borderTop: `1px solid ${brand.border}`, display: 'flex', gap: 6 }}>
                              <input
                                type="text"
                                value={archiveChatInput[item.id] || ''}
                                onChange={e => setArchiveChatInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleArchiveChatSend(item); } }}
                                placeholder="What did they say about..."
                                style={{ flex: 1, background: brand.carbon, border: `1px solid ${brand.border}`, borderRadius: 6, padding: '8px 12px', color: brand.white, fontFamily: M, fontSize: '0.75rem', outline: 'none' }}
                              />
                              <button
                                onClick={() => handleArchiveChatSend(item)}
                                disabled={archiveChatLoading[item.id] || !(archiveChatInput[item.id] || '').trim()}
                                style={{ background: archiveChatLoading[item.id] ? brand.graphite : '#8B5CF6', border: 'none', borderRadius: 6, padding: '8px 14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', fontFamily: M, fontSize: '0.75rem', fontWeight: 600, opacity: archiveChatLoading[item.id] || !(archiveChatInput[item.id] || '').trim() ? 0.5 : 1 }}
                              >
                                <Send size={12} />
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{
                          background: brand.void, border: `1px solid ${brand.border}`, borderRadius: 8,
                          padding: '14px', fontFamily: M, fontSize: '0.75rem',
                          lineHeight: 1.6, maxHeight: '50vh', overflowY: 'auto',
                        }}>
                          {item.timestamped.split('\n').map((line, li) => {
                            const tsMatch = line.match(/^\[(\d+:\d{2}(?::\d{2})?)\]\s*(.*)/);
                            if (tsMatch) {
                              const tsStr = tsMatch[1];
                              const text = tsMatch[2];
                              const parts = tsStr.split(':').map(Number);
                              const secs = parts.length === 3
                                ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                                : parts[0] * 60 + parts[1];
                              return (
                                <div key={li} style={{ marginBottom: 3 }}>
                                  <a
                                    href={`https://youtube.com/watch?v=${item.videoId}&t=${secs}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: brand.amber, textDecoration: 'none', fontWeight: 600,
                                      cursor: 'pointer', marginRight: 8,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                                  >
                                    [{tsStr}]
                                  </a>
                                  <span style={{ color: brand.silver }}>{text}</span>
                                </div>
                              );
                            }
                            return <div key={li} style={{ color: brand.silver, marginBottom: 3 }}>{line}</div>;
                          })}
                        </div>
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
