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

export async function POST(req: NextRequest) {
  const tmpDir = os.tmpdir();

  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });

    const outBase = path.join(tmpDir, `yt-transcript-${videoId}-${Date.now()}`);

    // Use yt-dlp to download subtitles
    const cmd = `yt-dlp --write-subs --write-auto-subs --sub-lang en --skip-download --sub-format json3 -o "${outBase}" "https://www.youtube.com/watch?v=${videoId}" --no-warnings --quiet`;

    try {
      await execAsync(cmd, { timeout: 30000 });
    } catch {
      return NextResponse.json({ error: 'Failed to extract subtitles. The video may not have captions.' }, { status: 404 });
    }

    // Find the subtitle file
    const subFile = `${outBase}.en.json3`;
    let subData: string;
    try {
      subData = await fs.readFile(subFile, 'utf-8');
    } catch {
      // Try auto-generated
      const autoFile = `${outBase}.en.json3`;
      try {
        subData = await fs.readFile(autoFile, 'utf-8');
      } catch {
        return NextResponse.json({ error: 'No English captions found for this video.' }, { status: 404 });
      }
    }

    const json = JSON.parse(subData);

    // Parse json3 format
    const segments = (json.events || [])
      .filter((e: { segs?: { utf8: string }[] }) => e.segs && e.segs.length > 0)
      .map((e: { tStartMs: number; dDurationMs: number; segs: { utf8: string }[] }) => ({
        text: e.segs.map(s => s.utf8).join('').replace(/\n/g, ' ').trim(),
        startMs: e.tStartMs || 0,
        durMs: e.dDurationMs || 0,
      }))
      .filter((s: { text: string }) => s.text.length > 0 && s.text !== '\n');

    if (segments.length === 0) {
      return NextResponse.json({ error: 'Transcript was empty.' }, { status: 404 });
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

    const timestamped = segments
      .map((s: { startMs: number; text: string }) => `[${formatTimestamp(s.startMs)}] ${s.text}`)
      .join('\n');
    const plain = segments.map((s: { text: string }) => s.text).join(' ');

    // Cleanup temp file
    try { await fs.unlink(subFile); } catch { /* ignore */ }

    return NextResponse.json({
      videoId,
      title,
      channel,
      language: 'en',
      segmentCount: segments.length,
      timestamped,
      plain,
    });
  } catch (err) {
    console.error('Transcript error:', err);
    return NextResponse.json({ error: 'Failed to fetch transcript. Please try again.' }, { status: 500 });
  }
}
