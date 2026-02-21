import { NextRequest, NextResponse } from 'next/server';

const MAX_CHUNK_BYTES = 24 * 1024 * 1024; // 24MB per chunk (buffer under 25MB limit)

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

        const tRes = await fetch(track.baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        const tText = await tRes.text();
        if (!tText || tText.length === 0) return { segments: [], title, channel };

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

// ─── METHOD 2: Whisper transcription with CHUNKING for any length video ───
async function transcribeWithWhisper(videoId: string): Promise<{ segments: { text: string; startSec: number }[] } | null> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    console.error('[whisper] No OPENAI_API_KEY set');
    return null;
  }

  try {
    const ytdl = (await import('@distube/ytdl-core')).default;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    if (!ytdl.validateURL(url)) return null;

    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    if (audioFormats.length === 0) return null;

    // Pick lowest bitrate to keep file small
    const format = audioFormats.sort((a, b) => (a.audioBitrate || 999) - (b.audioBitrate || 999))[0];
    const bitrate = format.audioBitrate || 48;
    const durationSec = parseInt(info.videoDetails.lengthSeconds) || 0;
    console.log(`[whisper] Audio: ${format.mimeType}, ${bitrate}kbps, ${durationSec}s (${(durationSec/60).toFixed(1)} min)`);

    // Download full audio
    const stream = ytdl.downloadFromInfo(info, { format });
    const bufferChunks: Buffer[] = [];
    for await (const chunk of stream) {
      bufferChunks.push(Buffer.from(chunk));
    }
    const fullAudio = Buffer.concat(bufferChunks);
    const totalMB = fullAudio.length / 1024 / 1024;
    console.log(`[whisper] Downloaded ${totalMB.toFixed(1)}MB`);

    const ext = format.mimeType?.includes('webm') ? 'webm'
      : format.mimeType?.includes('mp4') ? 'm4a'
      : format.mimeType?.includes('ogg') ? 'ogg' : 'webm';
    const mimeType = format.mimeType || 'audio/webm';

    // Split into chunks if needed
    const numChunks = Math.ceil(fullAudio.length / MAX_CHUNK_BYTES);
    console.log(`[whisper] Splitting into ${numChunks} chunk(s)`);

    const allSegments: { text: string; startSec: number }[] = [];

    for (let i = 0; i < numChunks; i++) {
      const chunkStart = i * MAX_CHUNK_BYTES;
      const chunkEnd = Math.min((i + 1) * MAX_CHUNK_BYTES, fullAudio.length);
      const chunkBuffer = fullAudio.subarray(chunkStart, chunkEnd);

      // Estimate time offset for this chunk based on byte position
      const timeOffsetSec = durationSec > 0
        ? (chunkStart / fullAudio.length) * durationSec
        : 0;

      console.log(`[whisper] Chunk ${i + 1}/${numChunks}: ${(chunkBuffer.length / 1024 / 1024).toFixed(1)}MB, offset: ${formatTimestamp(timeOffsetSec)}`);

      const formData = new FormData();
      const blob = new Blob([chunkBuffer], { type: mimeType });
      formData.append('file', blob, `chunk-${i}.${ext}`);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'segment');
      formData.append('language', 'en');

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: formData,
      });

      if (!whisperRes.ok) {
        const errText = await whisperRes.text();
        console.error(`[whisper] Chunk ${i + 1} API error ${whisperRes.status}: ${errText}`);
        // Continue with other chunks even if one fails
        continue;
      }

      const whisperData = await whisperRes.json();
      const chunkSegments = (whisperData.segments || []).map((s: { text: string; start: number }) => ({
        text: s.text.trim(),
        startSec: s.start + timeOffsetSec, // Offset by chunk position
      })).filter((s: { text: string }) => s.text.length > 0);

      console.log(`[whisper] Chunk ${i + 1}: ${chunkSegments.length} segments`);
      allSegments.push(...chunkSegments);
    }

    // Sort by timestamp and deduplicate overlapping segments
    allSegments.sort((a, b) => a.startSec - b.startSec);

    // Remove duplicates (chunks may have overlapping content at boundaries)
    const deduped: { text: string; startSec: number }[] = [];
    for (const seg of allSegments) {
      const last = deduped[deduped.length - 1];
      if (!last || Math.abs(seg.startSec - last.startSec) > 1 || seg.text !== last.text) {
        deduped.push(seg);
      }
    }

    console.log(`[whisper] Total: ${deduped.length} segments from ${numChunks} chunks`);
    return deduped.length > 0 ? { segments: deduped } : null;
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

    // Fallback: Whisper (handles ANY length via chunking)
    console.log(`[transcript] Using Whisper for ${videoId}...`);
    method = 'whisper';

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
        error: 'Could not transcribe video. Audio download may have been blocked by YouTube.',
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
