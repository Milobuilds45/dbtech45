import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export const maxDuration = 300; // 5 minutes max duration

const execAsync = promisify(exec);
const MAX_CHUNK_BYTES = 24 * 1024 * 1024; // 24MB per chunk

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

// ─── METHOD 2: youtube-transcript npm package ───
async function fetchTranscriptPackage(videoId: string): Promise<{ segments: { text: string; startMs: number }[] } | null> {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) return null;

    const segments = transcript.map((t: { text: string; offset: number }) => ({
      text: decodeHtmlEntities(t.text),
      startMs: Math.round(t.offset),
    })).filter((s: { text: string }) => s.text.length > 0);

    if (segments.length === 0) return null;
    return { segments };
  } catch (err) {
    console.error('[youtube-transcript package] Error:', err);
    return null;
  }
}

// ─── METHOD 3: yt-dlp binary ───
async function fetchTranscriptYtdlp(videoId: string): Promise<{ segments: { text: string; startMs: number }[] } | null> {
  const tmpDir = os.tmpdir();
  const outBase = path.join(tmpDir, `yt-transcript-${videoId}-${Date.now()}`);

  let ytdlp = 'python3 -m yt_dlp';
  if (process.platform === 'win32') {
    const winPath = 'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe';
    try {
      await fs.access(winPath);
      ytdlp = `"${winPath}"`;
    } catch { /* fallback to PATH */ }
  }

  const cmd = `${ytdlp} --extractor-args "youtube:player_client=ios" --write-subs --write-auto-subs --sub-lang "en.*" --skip-download --sub-format json3 -o "${outBase}" "https://www.youtube.com/watch?v=${videoId}" --no-warnings --no-check-certificates --ignore-no-formats-error`;

  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 45000 });
    console.log('[yt-dlp] stdout:', stdout.substring(0, 300));
    console.log('[yt-dlp] stderr:', stderr.substring(0, 300));
  } catch (err: any) {
    console.error('[yt-dlp] Error:', err.message || err);
    return null;
  }

  let subData: string | null = null;
  try {
    const tmpDirFiles = await fs.readdir(tmpDir);
    const baseName = path.basename(outBase);
    const subFiles = tmpDirFiles
      .filter(f => f.startsWith(baseName) && f.endsWith('.json3'))
      .sort((a, b) => a.length - b.length);
    
    console.log(`[yt-dlp] Looking for ${baseName}. Found: ${subFiles.length}`);

    if (subFiles.length > 0) {
      subData = await fs.readFile(path.join(tmpDir, subFiles[0]), 'utf-8');
      
      // Cleanup
      for (const f of subFiles) {
        try { await fs.unlink(path.join(tmpDir, f)); } catch { /* ignore */ }
      }
    } else {
      console.log(`[yt-dlp] No JSON3 found! All tmp files:`, tmpDirFiles.filter(f => f.includes('yt-transcript')).join(', '));
    }
  } catch (err: any) {
    console.error('[yt-dlp] Tmp file read error:', err.message);
    return null;
  }

  if (!subData) return null;

  try {
    const json = JSON.parse(subData);
    const segments = (json.events || [])
      .filter((e: { segs?: { utf8: string }[] }) => e.segs && e.segs.length > 0)
      .map((e: { tStartMs: number; segs: { utf8: string }[] }) => ({
        text: e.segs.map((s: { utf8: string }) => s.utf8).join('').replace(/\n/g, ' ').trim(),
        startMs: e.tStartMs || 0,
      }))
      .filter((s: { text: string }) => s.text.length > 0 && s.text !== '\n');

    if (segments.length === 0) return null;
    return { segments };
  } catch (err) {
    console.error('[yt-dlp] Parse error:', err);
    return null;
  }
}

// ─── METHOD 4: Whisper transcription with CHUNKING for any length video ───
async function transcribeWithWhisper(videoId: string): Promise<{ segments: { text: string; startSec: number }[] } | null> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    console.error('[whisper] No OPENAI_API_KEY set');
    return null;
  }

  const tmpDir = os.tmpdir();
  const outBase = path.join(tmpDir, `yt-audio-${videoId}-${Date.now()}`);
  const audioFile = `${outBase}.m4a`;

  let ytdlp = 'python3 -m yt_dlp';
  if (process.platform === 'win32') {
    const winPath = 'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe';
    try {
      await fs.access(winPath);
      ytdlp = `"${winPath}"`;
    } catch { /* fallback */ }
  }

  const cmd = `${ytdlp} --extractor-args "youtube:player_client=ios" -f "bestaudio[ext=m4a]/bestaudio" -o "${audioFile}" "https://www.youtube.com/watch?v=${videoId}" --no-warnings --no-check-certificates`;

  try {
    console.log(`[whisper] Downloading audio with yt-dlp for ${videoId}...`);
    await execAsync(cmd, { timeout: 120000 });
  } catch (err: any) {
    console.error('[whisper yt-dlp] Error:', err.message || err);
    return null;
  }

  try {
    const fullAudio = await fs.readFile(audioFile);
    await fs.unlink(audioFile).catch(() => {});

    const numChunks = Math.ceil(fullAudio.length / MAX_CHUNK_BYTES);
    const allSegments: { text: string; startSec: number }[] = [];

    for (let i = 0; i < numChunks; i++) {
      const chunkStart = i * MAX_CHUNK_BYTES;
      const chunkEnd = Math.min((i + 1) * MAX_CHUNK_BYTES, fullAudio.length);
      const chunkBuffer = fullAudio.subarray(chunkStart, chunkEnd);

      const formData = new FormData();
      const blob = new Blob([chunkBuffer], { type: 'audio/mp4' });
      formData.append('file', blob, `chunk-${i}.m4a`);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'segment');
      formData.append('language', 'en');

      console.log(`[whisper] Transcribing chunk ${i + 1}/${numChunks}...`);
      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: formData,
      });

      if (!whisperRes.ok) {
        console.error(`[whisper] API Error: ${whisperRes.status} ${whisperRes.statusText}`);
        continue;
      }

      const whisperData = await whisperRes.json();
      const chunkSegments = (whisperData.segments || []).map((s: { text: string; start: number }) => ({
        text: s.text.trim(),
        startSec: s.start, // Simplified, rely on Whisper's internal start times
      })).filter((s: { text: string }) => s.text.length > 0);

      allSegments.push(...chunkSegments);
    }

    allSegments.sort((a, b) => a.startSec - b.startSec);
    const deduped: { text: string; startSec: number }[] = [];
    for (const seg of allSegments) {
      const last = deduped[deduped.length - 1];
      if (!last || Math.abs(seg.startSec - last.startSec) > 1 || seg.text !== last.text) {
        deduped.push(seg);
      }
    }

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
    let segments: { text: string; startSec: number }[] = [];

    // Try fast caption methods first (unless forceWhisper)
    if (!forceWhisper) {
      console.log(`[transcript] Method 1: direct scrape for ${videoId}...`);
      const captionResult = await fetchCaptions(videoId);

      if (captionResult && captionResult.segments.length > 0) {
        title = captionResult.title;
        channel = captionResult.channel;
        segments = captionResult.segments.map(s => ({ text: s.text, startSec: s.startMs / 1000 }));
        method = 'captions';
      }

      if (segments.length === 0) {
        console.log(`[transcript] Method 2: youtube-transcript package for ${videoId}...`);
        const pkgResult = await fetchTranscriptPackage(videoId);
        if (pkgResult && pkgResult.segments.length > 0) {
          segments = pkgResult.segments.map(s => ({ text: s.text, startSec: s.startMs / 1000 }));
          method = 'package';
        }
      }

      if (segments.length === 0) {
        console.log(`[transcript] Method 3: yt-dlp binary for ${videoId}...`);
        const ytdlpResult = await fetchTranscriptYtdlp(videoId);
        if (ytdlpResult && ytdlpResult.segments.length > 0) {
          segments = ytdlpResult.segments.map(s => ({ text: s.text, startSec: s.startMs / 1000 }));
          method = 'ytdlp';
        }
      }
    }

    // Attempt to get title/channel if not retrieved yet
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

    // Fallback: Whisper (handles ANY length via chunking)
    if (segments.length === 0) {
      console.log(`[transcript] Method 4: Using Whisper for ${videoId}...`);
      const whisperResult = await transcribeWithWhisper(videoId);

      if (whisperResult && whisperResult.segments.length > 0) {
        segments = whisperResult.segments;
        method = 'whisper';
      }
    }

    if (segments.length === 0) {
      return NextResponse.json({
        error: 'Could not transcribe video. The video may not have captions, and Whisper audio download may have been blocked.',
      }, { status: 404 });
    }

    const timestamped = segments
      .map(s => `[${formatTimestamp(s.startSec)}] ${s.text}`)
      .join('\n');
    const plain = segments.map(s => s.text).join(' ');

    return NextResponse.json({
      videoId, title, channel, language: 'en', method,
      segmentCount: segments.length, timestamped, plain,
    });
  } catch (err) {
    console.error('[transcript] Error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}