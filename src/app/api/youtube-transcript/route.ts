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

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/\n/g, ' ').trim();
}

// ─── METHOD 1: YouTube captions (innertube page scrape) ───
async function fetchCaptions(videoId: string): Promise<{ segments: { text: string; startMs: number }[]; title: string; channel: string } | null> {
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await pageRes.text();

    let title = 'YouTube Video';
    const titleMatch = html.match(/"title":"(.*?)"/);
    if (titleMatch) try { title = JSON.parse(`"${titleMatch[1]}"`); } catch {}

    let channel = 'Unknown';
    const channelMatch = html.match(/"ownerChannelName":"(.*?)"/);
    if (channelMatch) try { channel = JSON.parse(`"${channelMatch[1]}"`); } catch {}

    const captionsIdx = html.indexOf('"captions":');
    if (captionsIdx === -1) return null;

    let depth = 0;
    const start = html.indexOf('{', captionsIdx);
    for (let i = start; i < html.length; i++) {
      if (html[i] === '{') depth++;
      if (html[i] === '}') depth--;
      if (depth === 0) {
        const captions = JSON.parse(html.substring(start, i + 1));
        const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!tracks?.length) return { segments: [], title, channel };

        const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en')
          || tracks.find((t: { languageCode: string }) => t.languageCode?.startsWith('en'))
          || tracks[0];

        if (!track?.baseUrl) return { segments: [], title, channel };

        // Try fetching transcript
        const tRes = await fetch(track.baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        const tText = await tRes.text();
        if (!tText || tText.length === 0) return { segments: [], title, channel };

        // Parse XML
        const segments: { text: string; startMs: number }[] = [];
        const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
        let match;
        while ((match = regex.exec(tText)) !== null) {
          const text = decodeHtmlEntities(match[2]);
          if (text.length > 0) segments.push({ text, startMs: Math.round(parseFloat(match[1]) * 1000) });
        }
        return { segments, title, channel };
      }
    }
    return null;
  } catch (err) {
    console.error('[captions] Error:', err);
    return null;
  }
}

// ─── METHOD 2: Whisper transcription (download audio → OpenAI Whisper API) ───
async function transcribeWithWhisper(videoId: string): Promise<{ segments: { text: string; startSec: number }[] } | null> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    console.error('[whisper] No OPENAI_API_KEY set');
    return null;
  }

  try {
    // Download audio using @distube/ytdl-core
    const ytdl = (await import('@distube/ytdl-core')).default;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    if (!ytdl.validateURL(url)) {
      console.error('[whisper] Invalid URL');
      return null;
    }

    const info = await ytdl.getInfo(url);
    // Get audio-only format, smallest file
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    if (audioFormats.length === 0) {
      console.error('[whisper] No audio formats available');
      return null;
    }

    // Pick lowest bitrate audio to minimize download size (Whisper has 25MB limit)
    const format = audioFormats.sort((a, b) => (a.audioBitrate || 999) - (b.audioBitrate || 999))[0];
    console.log(`[whisper] Downloading audio: ${format.mimeType}, bitrate: ${format.audioBitrate}kbps`);

    // Download to buffer
    const stream = ytdl.downloadFromInfo(info, { format });
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);
    console.log(`[whisper] Downloaded ${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB`);

    // Check size limit (Whisper max 25MB)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      console.error('[whisper] Audio too large for Whisper API (>25MB). Video may be too long.');
      return null;
    }

    // Determine file extension from mime type
    const ext = format.mimeType?.includes('webm') ? 'webm'
      : format.mimeType?.includes('mp4') ? 'm4a'
      : format.mimeType?.includes('ogg') ? 'ogg' : 'webm';

    // Call Whisper API with verbose_json for timestamps
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: format.mimeType || 'audio/webm' });
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');
    formData.append('language', 'en');

    console.log('[whisper] Sending to Whisper API...');
    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: formData,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      console.error(`[whisper] API error ${whisperRes.status}: ${errText}`);
      return null;
    }

    const whisperData = await whisperRes.json();
    console.log(`[whisper] Transcribed: ${whisperData.segments?.length} segments`);

    const segments = (whisperData.segments || []).map((s: { text: string; start: number }) => ({
      text: s.text.trim(),
      startSec: s.start,
    })).filter((s: { text: string }) => s.text.length > 0);

    return { segments };
  } catch (err) {
    console.error('[whisper] Error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url;
    const forceWhisper = body.forceWhisper === true;

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const videoId = extractVideoId(url.trim());
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });

    let title = 'YouTube Video';
    let channel = 'Unknown';
    let method = 'captions';

    // Try captions first (unless forceWhisper)
    if (!forceWhisper) {
      console.log(`[transcript] Trying captions for ${videoId}...`);
      const captionResult = await fetchCaptions(videoId);

      if (captionResult) {
        title = captionResult.title;
        channel = captionResult.channel;

        if (captionResult.segments.length > 0) {
          const timestamped = captionResult.segments
            .map(s => `[${formatTimestamp(s.startMs / 1000)}] ${s.text}`)
            .join('\n');
          const plain = captionResult.segments.map(s => s.text).join(' ');

          return NextResponse.json({
            videoId, title, channel, language: 'en', method: 'captions',
            segmentCount: captionResult.segments.length, timestamped, plain,
          });
        }
      }
    }

    // Fallback: Whisper transcription
    console.log(`[transcript] Using Whisper for ${videoId}...`);
    method = 'whisper';

    // Get title/channel if we don't have them
    if (title === 'YouTube Video') {
      try {
        const oembed = await fetch(`https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`, {
          signal: AbortSignal.timeout(5000),
        });
        const data = await oembed.json();
        if (data.title) title = data.title;
        if (data.author_name) channel = data.author_name;
      } catch {}
    }

    const whisperResult = await transcribeWithWhisper(videoId);

    if (!whisperResult || whisperResult.segments.length === 0) {
      return NextResponse.json({
        error: 'Could not transcribe video. The audio may be too long (>25 min) or the download was blocked.',
      }, { status: 404 });
    }

    const timestamped = whisperResult.segments
      .map(s => `[${formatTimestamp(s.startSec)}] ${s.text}`)
      .join('\n');
    const plain = whisperResult.segments.map(s => s.text).join(' ');

    return NextResponse.json({
      videoId, title, channel, language: 'en', method,
      segmentCount: whisperResult.segments.length, timestamped, plain,
    });
  } catch (err) {
    console.error('[transcript] Error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
