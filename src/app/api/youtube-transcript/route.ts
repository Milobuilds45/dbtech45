import { NextRequest, NextResponse } from 'next/server';

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

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\n/g, ' ')
    .trim();
}

// ─── METHOD 1: Innertube API (YouTube's internal API) ───
async function fetchViaInnertube(videoId: string): Promise<{ segments: { text: string; startMs: number }[]; title: string; channel: string } | null> {
  try {
    // First get the page to extract the API key and initial player response
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!pageRes.ok) {
      console.error(`[innertube] Page fetch failed: ${pageRes.status}`);
      return null;
    }

    const html = await pageRes.text();

    // Extract title
    let title = 'YouTube Video';
    const titleMatch = html.match(/"title":"(.*?)"/);
    if (titleMatch) title = JSON.parse(`"${titleMatch[1]}"`);

    // Extract channel
    let channel = 'Unknown';
    const channelMatch = html.match(/"ownerChannelName":"(.*?)"/);
    if (channelMatch) channel = JSON.parse(`"${channelMatch[1]}"`);

    // Extract captions data from playerResponse
    const captionsIdx = html.indexOf('"captions":');
    if (captionsIdx === -1) {
      console.log('[innertube] No captions found in page');
      return null;
    }

    // Parse the captions JSON object by tracking brace depth
    let depth = 0;
    let start = html.indexOf('{', captionsIdx);
    for (let i = start; i < html.length; i++) {
      if (html[i] === '{') depth++;
      if (html[i] === '}') depth--;
      if (depth === 0) {
        const captionsJson = html.substring(start, i + 1);
        try {
          const captions = JSON.parse(captionsJson);
          const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
          if (!tracks || tracks.length === 0) {
            console.log('[innertube] No caption tracks');
            return null;
          }

          // Prefer English
          const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en')
            || tracks.find((t: { languageCode: string }) => t.languageCode.startsWith('en'))
            || tracks[0];

          if (!track?.baseUrl) return null;

          // Fetch transcript as JSON3 format
          const transcriptRes = await fetch(track.baseUrl + '&fmt=json3', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          if (!transcriptRes.ok) {
            console.error(`[innertube] Transcript fetch failed: ${transcriptRes.status}`);
            // Try XML format as fallback
            const xmlRes = await fetch(track.baseUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });
            if (xmlRes.ok) {
              const xml = await xmlRes.text();
              return parseXmlTranscript(xml, title, channel);
            }
            return null;
          }

          const data = await transcriptRes.json();
          const segments = (data.events || [])
            .filter((e: { segs?: { utf8: string }[] }) => e.segs && e.segs.length > 0)
            .map((e: { tStartMs: number; segs: { utf8: string }[] }) => ({
              text: e.segs.map((s: { utf8: string }) => s.utf8).join('').replace(/\n/g, ' ').trim(),
              startMs: e.tStartMs || 0,
            }))
            .filter((s: { text: string }) => s.text.length > 0 && s.text !== '\n');

          if (segments.length === 0) return null;
          return { segments, title, channel };
        } catch (e) {
          console.error('[innertube] JSON parse error:', e);
        }
        break;
      }
    }
    return null;
  } catch (err) {
    console.error('[innertube] Error:', err);
    return null;
  }
}

function parseXmlTranscript(xml: string, title: string, channel: string): { segments: { text: string; startMs: number }[]; title: string; channel: string } | null {
  // Parse XML transcript format: <text start="1.23" dur="4.56">text here</text>
  const segments: { text: string; startMs: number }[] = [];
  const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const startMs = Math.round(parseFloat(match[1]) * 1000);
    const text = decodeHtmlEntities(match[2]);
    if (text.length > 0) {
      segments.push({ text, startMs });
    }
  }
  if (segments.length === 0) return null;
  return { segments, title, channel };
}

// ─── METHOD 2: youtube-transcript npm package ───
async function fetchViaPackage(videoId: string): Promise<{ segments: { text: string; startMs: number }[] } | null> {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) return null;

    const segments = transcript.map((t: { text: string; offset: number }) => ({
      text: decodeHtmlEntities(t.text),
      startMs: Math.round(t.offset),
    })).filter((s: { text: string }) => s.text.length > 0);

    return segments.length > 0 ? { segments } : null;
  } catch (err) {
    console.error('[package] Error:', err);
    return null;
  }
}

// ─── METHOD 3: Third-party transcript proxy APIs ───
async function fetchViaProxy(videoId: string): Promise<{ segments: { text: string; startMs: number }[]; title?: string; channel?: string } | null> {
  // Try multiple free transcript proxy services
  const proxies = [
    `https://yt.lemnoslife.com/noKey/captions?part=snippet&videoId=${videoId}`,
    `https://deserving-harmony-production.up.railway.app/transcript?videoId=${videoId}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;

      const data = await res.json();

      // Handle yt.lemnoslife format
      if (data.items) {
        for (const item of data.items) {
          if (item.snippet?.language === 'en' || item.snippet?.trackKind === 'asr') {
            const captionUrl = item.snippet?.baseUrl;
            if (captionUrl) {
              const captionRes = await fetch(captionUrl + '&fmt=json3');
              if (captionRes.ok) {
                const captionData = await captionRes.json();
                const segments = (captionData.events || [])
                  .filter((e: { segs?: { utf8: string }[] }) => e.segs)
                  .map((e: { tStartMs: number; segs: { utf8: string }[] }) => ({
                    text: e.segs.map((s: { utf8: string }) => s.utf8).join('').replace(/\n/g, ' ').trim(),
                    startMs: e.tStartMs || 0,
                  }))
                  .filter((s: { text: string }) => s.text.length > 0);
                if (segments.length > 0) return { segments };
              }
            }
          }
        }
      }

      // Handle generic transcript array format
      if (Array.isArray(data) && data.length > 0 && data[0].text) {
        const segments = data.map((t: { text: string; start?: number; offset?: number }) => ({
          text: decodeHtmlEntities(t.text),
          startMs: Math.round((t.start || t.offset || 0) * 1000),
        })).filter((s: { text: string }) => s.text.length > 0);
        if (segments.length > 0) return { segments };
      }
    } catch (err) {
      console.error(`[proxy] ${proxyUrl} failed:`, err);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const videoId = extractVideoId(url.trim());
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL. Paste a youtube.com or youtu.be link.' }, { status: 400 });

    // Try methods in order of reliability
    console.log(`[transcript] Starting extraction for ${videoId}`);

    // Method 1: Direct innertube
    console.log('[transcript] Method 1: Innertube...');
    let result = await fetchViaInnertube(videoId);
    let title = result?.title || 'YouTube Video';
    let channel = result?.channel || 'Unknown';

    // Method 2: npm package
    if (!result) {
      console.log('[transcript] Method 2: npm package...');
      const pkgResult = await fetchViaPackage(videoId);
      if (pkgResult) result = { ...pkgResult, title, channel };
    }

    // Method 3: Proxy APIs
    if (!result) {
      console.log('[transcript] Method 3: Proxy APIs...');
      const proxyResult = await fetchViaProxy(videoId);
      if (proxyResult) {
        result = {
          segments: proxyResult.segments,
          title: proxyResult.title || title,
          channel: proxyResult.channel || channel,
        };
      }
    }

    if (!result || result.segments.length === 0) {
      return NextResponse.json({
        error: 'Could not extract transcript. The video may not have captions, or YouTube is blocking requests from this server. Try a different video or try again later.',
      }, { status: 404 });
    }

    // Get title/channel from oembed if we don't have them
    if (title === 'YouTube Video') {
      try {
        const oembed = await fetch(`https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`, {
          signal: AbortSignal.timeout(5000),
        });
        const oembedData = await oembed.json();
        if (oembedData.title) title = oembedData.title;
        if (oembedData.author_name) channel = oembedData.author_name;
      } catch { /* ignore */ }
    }

    const timestamped = result.segments
      .map(s => `[${formatTimestamp(s.startMs)}] ${s.text}`)
      .join('\n');
    const plain = result.segments.map(s => s.text).join(' ');

    return NextResponse.json({
      videoId,
      title,
      channel,
      language: 'en',
      segmentCount: result.segments.length,
      timestamped,
      plain,
    });
  } catch (err) {
    console.error('[transcript] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error extracting transcript. Please try again.' }, { status: 500 });
  }
}
