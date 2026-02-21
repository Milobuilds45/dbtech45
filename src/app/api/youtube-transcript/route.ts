import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
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

// ─── METHOD 1: Direct YouTube innertube API (no dependencies) ───
async function fetchTranscriptDirect(videoId: string): Promise<{ segments: { text: string; startMs: number }[] } | null> {
  try {
    // Step 1: Get the video page to extract serialized share entity and other params
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await pageRes.text();

    // Find the captions JSON by counting braces
    const captionsIdx = html.indexOf('"captions":');
    if (captionsIdx === -1) return null;

    let depth = 0;
    let start = captionsIdx + '"captions":'.length;
    let jsonStart = start;
    // Skip whitespace
    while (html[jsonStart] === ' ') jsonStart++;
    let i = jsonStart;
    for (; i < html.length; i++) {
      if (html[i] === '{') depth++;
      if (html[i] === '}') depth--;
      if (depth === 0) break;
    }
    const captionsJson = html.substring(jsonStart, i + 1);
    const captions = JSON.parse(captionsJson);

    const tracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || tracks.length === 0) return null;

    // Prefer English, then any language
    const enTrack = tracks.find((t: { languageCode: string }) => t.languageCode === 'en') ||
                    tracks.find((t: { languageCode: string }) => t.languageCode.startsWith('en')) ||
                    tracks[0];

    if (!enTrack?.baseUrl) return null;

    // Fetch the transcript XML
    const transcriptUrl = enTrack.baseUrl + '&fmt=json3';
    const transcriptRes = await fetch(transcriptUrl);
    if (!transcriptRes.ok) return null;
    const transcriptData = await transcriptRes.json();

    const segments = (transcriptData.events || [])
      .filter((e: { segs?: { utf8: string }[] }) => e.segs && e.segs.length > 0)
      .map((e: { tStartMs: number; segs: { utf8: string }[] }) => ({
        text: e.segs.map((s: { utf8: string }) => s.utf8).join('').replace(/\n/g, ' ').trim(),
        startMs: e.tStartMs || 0,
      }))
      .filter((s: { text: string }) => s.text.length > 0 && s.text !== '\n');

    if (segments.length === 0) return null;
    return { segments };
  } catch (err) {
    console.error('Direct transcript fetch failed:', err);
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
      text: t.text.replace(/\n/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim(),
      startMs: Math.round(t.offset),
    })).filter((s: { text: string }) => s.text.length > 0);

    if (segments.length === 0) return null;
    return { segments };
  } catch (err) {
    console.error('youtube-transcript package failed:', err);
    return null;
  }
}

// ─── METHOD 3: yt-dlp binary (local dev only, fallback) ───
async function fetchTranscriptYtdlp(videoId: string): Promise<{ segments: { text: string; startMs: number }[] } | null> {
  const tmpDir = os.tmpdir();
  const outBase = path.join(tmpDir, `yt-transcript-${videoId}-${Date.now()}`);

  // Find yt-dlp
  let ytdlp = 'yt-dlp';
  if (process.platform === 'win32') {
    const winPath = 'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe';
    try {
      await fs.access(winPath);
      ytdlp = `"${winPath}"`;
    } catch { /* use PATH */ }
  }

  const cmd = `${ytdlp} --write-subs --write-auto-subs --sub-lang en --skip-download --sub-format json3 -o "${outBase}" "https://www.youtube.com/watch?v=${videoId}" --no-warnings --no-check-certificates`;

  try {
    await execAsync(cmd, { timeout: 45000 });
  } catch (err) {
    console.error('yt-dlp failed:', err);
    return null;
  }

  // Find subtitle files
  const tmpDirFiles = await fs.readdir(tmpDir);
  const baseName = path.basename(outBase);
  const subFiles = tmpDirFiles
    .filter(f => f.startsWith(baseName) && f.endsWith('.json3'))
    .sort((a, b) => a.length - b.length);

  if (subFiles.length === 0) return null;

  const subFile = path.join(tmpDir, subFiles[0]);
  let subData: string;
  try {
    subData = await fs.readFile(subFile, 'utf-8');
  } catch {
    return null;
  }

  const json = JSON.parse(subData);
  const segments = (json.events || [])
    .filter((e: { segs?: { utf8: string }[] }) => e.segs && e.segs.length > 0)
    .map((e: { tStartMs: number; segs: { utf8: string }[] }) => ({
      text: e.segs.map((s: { utf8: string }) => s.utf8).join('').replace(/\n/g, ' ').trim(),
      startMs: e.tStartMs || 0,
    }))
    .filter((s: { text: string }) => s.text.length > 0 && s.text !== '\n');

  // Cleanup
  for (const f of subFiles) {
    try { await fs.unlink(path.join(tmpDir, f)); } catch { /* ignore */ }
  }

  if (segments.length === 0) return null;
  return { segments };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });

    // Try methods in order: direct API → npm package → yt-dlp binary
    console.log(`[transcript] Trying direct API for ${videoId}...`);
    let result = await fetchTranscriptDirect(videoId);

    if (!result) {
      console.log(`[transcript] Direct failed, trying youtube-transcript package...`);
      result = await fetchTranscriptPackage(videoId);
    }

    if (!result) {
      console.log(`[transcript] Package failed, trying yt-dlp...`);
      result = await fetchTranscriptYtdlp(videoId);
    }

    if (!result) {
      return NextResponse.json({
        error: 'Could not extract transcript. The video may not have captions, or YouTube is blocking requests. Try again in a minute.',
      }, { status: 404 });
    }

    // Get title and channel
    let title = 'YouTube Video';
    let channel = 'Unknown Channel';
    try {
      const oembed = await fetch(`https://noembed.com/embed?url=https://youtube.com/watch?v=${videoId}`);
      const oembedData = await oembed.json();
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) channel = oembedData.author_name;
    } catch { /* ignore */ }

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
    console.error('Transcript error:', err);
    return NextResponse.json({ error: 'Failed to fetch transcript. Please try again.' }, { status: 500 });
  }
}
