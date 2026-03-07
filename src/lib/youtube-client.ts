// Client-side YouTube transcript extraction
// Primary: server-side API (has yt-dlp, Whisper, multiple fallbacks)
// Fallback: server extracts caption URL → client fetches caption XML (avoids ip=0.0.0.0)

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/\n/g, ' ').trim();
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface TranscriptResult {
  videoId: string;
  title: string;
  channel: string;
  description: string;
  language: string;
  method?: string;
  segmentCount: number;
  timestamped: string;
  plain: string;
}

// Parse caption XML into segments
function parseCaptionXml(xml: string): { text: string; startSec: number }[] {
  const segments: { text: string; startSec: number }[] = [];
  const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const text = decodeHtmlEntities(match[2]);
    if (text.length > 0) {
      segments.push({ text, startSec: parseFloat(match[1]) });
    }
  }
  return segments;
}

export async function fetchTranscriptClient(url: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(url.trim());
  if (!videoId) throw new Error('Invalid YouTube URL. Paste a youtube.com or youtu.be link.');

  // Step 1: Try server-side API (has yt-dlp, Whisper, multiple fallbacks)
  try {
    const res = await fetch('/api/youtube-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(120000),
    });
    
    const data = await res.json();
    
    if (res.ok && data.segmentCount > 0) {
      return data;
    }
    
    // Server returned captionUrl for client-side fetch (ASR workaround)
    if (data.captionUrl && data.title) {
      console.log('[transcript] Server returned caption URL for client-side fetch...');
      try {
        const captionRes = await fetch(data.captionUrl, {
          signal: AbortSignal.timeout(15000),
        });
        const xml = await captionRes.text();
        const segments = parseCaptionXml(xml);
        
        if (segments.length > 0) {
          console.log(`[transcript] Client-side caption fetch: ${segments.length} segments`);
          const timestamped = segments.map(s => `[${formatTimestamp(s.startSec)}] ${s.text}`).join('\n');
          const plain = segments.map(s => s.text).join(' ');
          return {
            videoId,
            title: data.title,
            channel: data.channel || 'Unknown',
            description: data.description || '',
            language: data.language || 'en',
            method: 'client-caption',
            segmentCount: segments.length,
            timestamped,
            plain,
          };
        }
      } catch (err) {
        console.error('[transcript] Client caption fetch failed:', err);
      }
    }
    
    console.log('[transcript] Server API failed, no client fallback available');
  } catch (err: unknown) {
    const error = err as Error;
    console.log('[transcript] Server error:', error.message);
  }

  // Step 3: Get at least title/channel for error context
  let title = 'this video';
  try {
    const oembed = await fetch(`https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await oembed.json();
    if (data.title) title = `"${data.title}"`;
  } catch { /* ignore */ }

  throw new Error(`Could not extract transcript for ${title}. The video may not have any captions (manual or auto-generated).`);
}
