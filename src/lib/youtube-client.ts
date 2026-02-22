// Client-side YouTube transcript extraction
// Fetches via a CORS proxy since YouTube blocks cross-origin requests from browsers

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
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value.replace(/\n/g, ' ').trim();
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface TranscriptResult {
  videoId: string;
  title: string;
  channel: string;
  language: string;
  segmentCount: number;
  timestamped: string;
  plain: string;
}

// Approach: Use third-party APIs that reliably extract YouTube transcripts
export async function fetchTranscriptClient(url: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(url.trim());
  if (!videoId) throw new Error('Invalid YouTube URL. Paste a youtube.com or youtu.be link.');

  // Get title/channel from oembed
  let title = 'YouTube Video';
  let channel = 'Unknown';
  try {
    const oembed = await fetch(`https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`);
    const oembedData = await oembed.json();
    if (oembedData.title) title = oembedData.title;
    if (oembedData.author_name) channel = oembedData.author_name;
  } catch { /* ignore */ }

  // Method 1: Use our server-side proxy that pipes through YouTube's page
  try {
    const res = await fetch('/api/youtube-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(300000), // 5 minutes to allow for Whisper fallback
    });
    if (res.ok) {
      const data = await res.json();
      if (data.segmentCount > 0) return data;
    }
  } catch { /* fall through */ }

  // Method 2: Use Invidious instances (open-source YouTube frontends with APIs)
  const invidiousInstances = [
    'https://vid.puffyan.us',
    'https://invidious.snopyta.org',
    'https://y.com.sb',
    'https://invidious.fdn.fr',
  ];

  for (const instance of invidiousInstances) {
    try {
      const res = await fetch(`${instance}/api/v1/captions/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const captions = data.captions || data;
      if (!Array.isArray(captions) || captions.length === 0) continue;

      // Find English captions
      const enCap = captions.find((c: { language_code: string }) => c.language_code === 'en')
        || captions.find((c: { language_code: string }) => c.language_code?.startsWith('en'))
        || captions[0];

      if (!enCap?.url) continue;

      // Fetch the actual caption content
      const capUrl = enCap.url.startsWith('http') ? enCap.url : `${instance}${enCap.url}`;
      const capRes = await fetch(capUrl, { signal: AbortSignal.timeout(8000) });
      if (!capRes.ok) continue;

      const capText = await capRes.text();

      // Parse XML captions
      const segments: { text: string; startMs: number }[] = [];
      const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
      let match;
      while ((match = regex.exec(capText)) !== null) {
        const text = decodeHtmlEntities(match[2]);
        if (text.length > 0) {
          segments.push({ text, startMs: Math.round(parseFloat(match[1]) * 1000) });
        }
      }

      if (segments.length > 0) {
        return {
          videoId,
          title,
          channel,
          language: enCap.language_code || 'en',
          segmentCount: segments.length,
          timestamped: segments.map(s => `[${formatTimestamp(s.startMs)}] ${s.text}`).join('\n'),
          plain: segments.map(s => s.text).join(' '),
        };
      }
    } catch { continue; }
  }

  // Method 3: Use a CORS proxy to fetch YouTube page directly from browser
  const corsProxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];

  for (const proxyFn of corsProxies) {
    try {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetch(proxyFn(ytUrl), {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const captionsIdx = html.indexOf('"captions":');
      if (captionsIdx === -1) continue;

      let depth = 0;
      const start = html.indexOf('{', captionsIdx);
      for (let i = start; i < html.length; i++) {
        if (html[i] === '{') depth++;
        if (html[i] === '}') depth--;
        if (depth === 0) {
          const captions = JSON.parse(html.substring(start, i + 1));
          const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
          if (!tracks || tracks.length === 0) break;

          const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en') || tracks[0];
          if (!track?.baseUrl) break;

          // Fetch transcript through proxy
          const capRes = await fetch(proxyFn(track.baseUrl), { signal: AbortSignal.timeout(10000) });
          if (!capRes.ok) break;

          const capText = await capRes.text();
          if (capText.length === 0) break;

          const segments: { text: string; startMs: number }[] = [];

          // Try JSON3 parse
          try {
            const data = JSON.parse(capText);
            for (const e of data.events || []) {
              if (e.segs) {
                const text = e.segs.map((s: { utf8: string }) => s.utf8).join('').replace(/\n/g, ' ').trim();
                if (text.length > 0) segments.push({ text, startMs: e.tStartMs || 0 });
              }
            }
          } catch {
            // Parse as XML
            const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
            let match;
            while ((match = regex.exec(capText)) !== null) {
              const text = decodeHtmlEntities(match[2]);
              if (text.length > 0) segments.push({ text, startMs: Math.round(parseFloat(match[1]) * 1000) });
            }
          }

          if (segments.length > 0) {
            return {
              videoId,
              title,
              channel,
              language: track.languageCode || 'en',
              segmentCount: segments.length,
              timestamped: segments.map(s => `[${formatTimestamp(s.startMs)}] ${s.text}`).join('\n'),
              plain: segments.map(s => s.text).join(' '),
            };
          }
          break;
        }
      }
    } catch { continue; }
  }

  throw new Error('Could not extract transcript. YouTube may be blocking requests. Try a different video.');
}
