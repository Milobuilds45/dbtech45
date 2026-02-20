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

    // Use yt-dlp to download subtitles (use full path for reliability)
    const ytdlp = process.platform === 'win32'
      ? 'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe'
      : 'yt-dlp';
    const cmd = `"${ytdlp}" --write-subs --write-auto-subs --sub-lang en --skip-download --sub-format json3 -o "${outBase}" "https://www.youtube.com/watch?v=${videoId}" --no-warnings --no-check-certificates`;

    let cmdResult;
    try {
      cmdResult = await execAsync(cmd, { timeout: 45000 });
      console.log('yt-dlp stdout:', cmdResult.stdout);
      if (cmdResult.stderr) console.log('yt-dlp stderr:', cmdResult.stderr);
    } catch (cmdErr: unknown) {
      const e = cmdErr as { stdout?: string; stderr?: string; message?: string };
      console.error('yt-dlp failed:', e.stderr || e.stdout || e.message);
      return NextResponse.json({ error: `Failed to extract subtitles: ${e.stderr || e.message || 'Unknown error'}` }, { status: 404 });
    }

    // Find the subtitle file — yt-dlp may name it .en.json3 or .en-orig.json3 etc.
    const tmpDirFiles = await fs.readdir(tmpDir);
    const baseName = path.basename(outBase);
    const subFiles = tmpDirFiles
      .filter(f => f.startsWith(baseName) && f.endsWith('.json3'))
      .sort((a, b) => {
        // Prefer non-auto (manual) subs — shorter filename usually means manual
        return a.length - b.length;
      });

    if (subFiles.length === 0) {
      return NextResponse.json({ error: 'No English captions found for this video.' }, { status: 404 });
    }

    const subFile = path.join(tmpDir, subFiles[0]);
    let subData: string;
    try {
      subData = await fs.readFile(subFile, 'utf-8');
    } catch {
      return NextResponse.json({ error: 'Failed to read subtitle file.' }, { status: 500 });
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

    // Cleanup temp files
    for (const f of subFiles) {
      try { await fs.unlink(path.join(tmpDir, f)); } catch { /* ignore */ }
    }

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
