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
async function fetchCaptions(videoId: string): Promise<{ segments: { text: string; startMs: number }[]; title: string; channel: string; description?: string; captionUrl?: string } | null> {
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+934',
      },
    });
    const html = await pageRes.text();

    let title = 'YouTube Video';
    const titleMatch = html.match(/"title":"(.*?)"/);
    if (titleMatch) try { title = JSON.parse(`"${titleMatch[1]}"`); } catch {}

    let channel = 'Unknown';
    const channelMatch = html.match(/"ownerChannelName":"(.*?)"/);
    if (channelMatch) try { channel = JSON.parse(`"${channelMatch[1]}"`); } catch {}

    let description = '';
    const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (descMatch) try { description = JSON.parse(`"${descMatch[1]}"`).substring(0, 300); } catch {}

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
        if (!tracks?.length) return { segments: [], title, channel, description };

        const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en')
          || tracks.find((t: { languageCode: string }) => t.languageCode?.startsWith('en'))
          || tracks[0];

        if (!track?.baseUrl) return { segments: [], title, channel, description };

        const tRes = await fetch(track.baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        const tText = await tRes.text();
        
        // If caption XML is empty, return the URL so client can fetch it (ASR ip=0.0.0.0 workaround)
        if (!tText || tText.length === 0) {
          console.log('[captions] Caption URL returned empty — returning URL for client-side fetch');
          return { segments: [], title, channel, description, captionUrl: track.baseUrl };
        }

        const segments: { text: string; startMs: number }[] = [];
        const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
        let match;
        while ((match = regex.exec(tText)) !== null) {
          const text = decodeHtmlEntities(match[2]);
          if (text.length > 0) segments.push({ text, startMs: Math.round(parseFloat(match[1]) * 1000) });
        }
        return { segments, title, channel, description };
      }
    }
    return null;
  } catch (err) {
    console.error('[captions] Error:', err);
    return null;
  }
}

// ─── METHOD 1B: Retry page scrape with consent cookie + different UA (for Vercel) ───
async function fetchCaptionsRetry(videoId: string): Promise<{ segments: { text: string; startMs: number }[]; title: string; channel: string; description?: string; captionUrl?: string } | null> {
  try {
    // Try with Linux UA + consent cookie + different referer — bypasses GDPR/bot walls
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US&has_verified=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+934; PREF=hl=en&gl=US',
        'Referer': 'https://www.google.com/',
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
    if (captionsIdx === -1) {
      console.log('[retry-scrape] No captions block in page');
      return null;
    }

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

        console.log(`[retry-scrape] Found track: lang=${track.languageCode}, kind=${track.kind || 'manual'}`);

        const tRes = await fetch(track.baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
        });
        const tText = await tRes.text();
        if (!tText || tText.length === 0) {
          console.log('[retry-scrape] Caption URL returned empty — returning URL for client-side fetch');
          return { segments: [], title, channel, captionUrl: track.baseUrl };
        }

        const segments: { text: string; startMs: number }[] = [];
        const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
        let match;
        while ((match = regex.exec(tText)) !== null) {
          const text = decodeHtmlEntities(match[2]);
          if (text.length > 0) segments.push({ text, startMs: Math.round(parseFloat(match[1]) * 1000) });
        }

        console.log(`[retry-scrape] Got ${segments.length} segments`);
        return { segments, title, channel };
      }
    }
    return null;
  } catch (err) {
    console.error('[retry-scrape] Error:', err);
    return null;
  }
}

// ─── METHOD 2: Python youtube-transcript-api (RELIABLE) ───
async function fetchTranscriptPython(videoId: string): Promise<{ segments: { text: string; startMs: number }[] } | null> {
  try {
    // Use Python library which bypasses YouTube's cloud IP blocking
    const pythonScript = `
from youtube_transcript_api import YouTubeTranscriptApi
import json
import sys

try:
    ytt = YouTubeTranscriptApi()
    result = ytt.fetch('${videoId}')
    segments = [{"text": s.text, "startMs": int(s.start * 1000)} for s in result]
    print(json.dumps(segments))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`;
    
    const { stdout } = await execAsync(`python3 -c ${JSON.stringify(pythonScript)}`, { timeout: 30000 });
    const data = JSON.parse(stdout.trim());
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`[python-transcript] Got ${data.length} segments`);
      return { segments: data };
    }
    
    return null;
  } catch (err) {
    console.error('[python-transcript] Error:', err);
    return null;
  }
}

// ─── METHOD 2B: youtube-transcript npm package (fallback) ───
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

  // Priority: bundled binary → PATH → system paths → python module
  const bundledBinary = path.join(process.cwd(), 'bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  let ytdlp = 'yt-dlp';
  
  try {
    await fs.access(bundledBinary);
    ytdlp = process.platform === 'win32' ? `"${bundledBinary}"` : bundledBinary;
    console.log('[yt-dlp] Using bundled binary:', ytdlp);
  } catch {
    // Bundled binary not found, try PATH and system locations
    if (process.platform === 'win32') {
      const winPaths = [
        'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe',
        'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe',
      ];
      for (const wp of winPaths) {
        try { await fs.access(wp); ytdlp = `"${wp}"`; break; } catch { /* try next */ }
      }
    } else {
      const linuxPaths = ['/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp', '/root/.local/bin/yt-dlp'];
      let found = false;
      for (const lp of linuxPaths) {
        try { await fs.access(lp); ytdlp = lp; found = true; break; } catch { /* try next */ }
      }
      if (!found) {
        try {
          await execAsync('python3 -m yt_dlp --version', { timeout: 5000 });
          ytdlp = 'python3 -m yt_dlp';
        } catch {
          console.error('[yt-dlp] Not found anywhere');
          return null;
        }
      }
    }
  }

  const cmd = `${ytdlp} --cookies /tmp/youtube_cookies.txt --write-subs --write-auto-subs --sub-lang "en" --skip-download --sub-format json3 -o "${outBase}" "https://www.youtube.com/watch?v=${videoId}" --no-check-certificates --ignore-no-formats-error --print after_move:filepath --verbose 2>&1`;

  console.log('[yt-dlp] Running command:', cmd);
  
  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 45000 });
    console.log('[yt-dlp] FULL OUTPUT:', stdout);
    if (stderr) console.log('[yt-dlp] STDERR:', stderr);
  } catch (err: any) {
    console.error('[yt-dlp] Warning/Error from executable (may still have output):', err.message || err);
    if (err.stdout) console.log('[yt-dlp] Error stdout:', err.stdout);
    if (err.stderr) console.log('[yt-dlp] Error stderr:', err.stderr);
    // DO NOT return null here. yt-dlp often throws a non-zero exit code if it fails to grab 
    // secondary subtitle tracks (like en-orig vs en), but the primary .json3 file may still have been written.
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

  const bundledBinary = path.join(process.cwd(), 'bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  let ytdlp = 'yt-dlp';
  
  try {
    await fs.access(bundledBinary);
    ytdlp = process.platform === 'win32' ? `"${bundledBinary}"` : bundledBinary;
  } catch {
    if (process.platform === 'win32') {
      const winPaths = [
        'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe',
        'C:\\Users\\derek\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe',
      ];
      for (const wp of winPaths) {
        try { await fs.access(wp); ytdlp = `"${wp}"`; break; } catch { /* try next */ }
      }
    } else {
      const linuxPaths = ['/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp', '/root/.local/bin/yt-dlp'];
      let found = false;
      for (const lp of linuxPaths) {
        try { await fs.access(lp); ytdlp = lp; found = true; break; } catch { /* try next */ }
      }
      if (!found) {
        try {
          await execAsync('python3 -m yt_dlp --version', { timeout: 5000 });
          ytdlp = 'python3 -m yt_dlp';
        } catch {
          console.error('[whisper] yt-dlp not found');
          return null;
        }
      }
    }
  }

  const cmd = `${ytdlp} --cookies /tmp/youtube_cookies.txt -f "bestaudio[ext=m4a]/bestaudio" -o "${audioFile}" "https://www.youtube.com/watch?v=${videoId}" --no-warnings --no-check-certificates`;

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
    let description = '';
    let method = 'captions';
    let segments: { text: string; startSec: number }[] = [];
    let captionUrl: string | undefined;

    // Try fast caption methods first (unless forceWhisper)
    if (!forceWhisper) {
      console.log(`[transcript] Method 1: direct scrape for ${videoId}...`);
      const captionResult = await fetchCaptions(videoId);

      if (captionResult) {
        title = captionResult.title;
        channel = captionResult.channel;
        if (captionResult.description) description = captionResult.description;
        if (captionResult.captionUrl) captionUrl = captionResult.captionUrl;
        if (captionResult.segments.length > 0) {
          segments = captionResult.segments.map(s => ({ text: s.text, startSec: s.startMs / 1000 }));
          method = 'captions';
        }
      }

      if (segments.length === 0) {
        console.log(`[transcript] Method 1B: retry scrape with consent cookie for ${videoId}...`);
        const retryResult = await fetchCaptionsRetry(videoId);
        if (retryResult) {
          if (retryResult.title !== 'YouTube Video') title = retryResult.title;
          if (retryResult.channel !== 'Unknown') channel = retryResult.channel;
          if (retryResult.description) description = retryResult.description;
          if (retryResult.captionUrl) captionUrl = retryResult.captionUrl;
          if (retryResult.segments.length > 0) {
            segments = retryResult.segments.map(s => ({ text: s.text, startSec: s.startMs / 1000 }));
            method = 'captions-retry';
          }
        }
      }

      if (segments.length === 0) {
        console.log(`[transcript] Method 2: Python youtube-transcript-api for ${videoId}...`);
        const pythonResult = await fetchTranscriptPython(videoId);
        if (pythonResult && pythonResult.segments.length > 0) {
          segments = pythonResult.segments.map(s => ({ text: s.text, startSec: s.startMs / 1000 }));
          method = 'python';
        }
      }

      if (segments.length === 0) {
        console.log(`[transcript] Method 2B: youtube-transcript package for ${videoId}...`);
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

    // If still no segments but we have a caption URL, return it for client-side fetch
    if (segments.length === 0 && captionUrl) {
      console.log(`[transcript] Returning captionUrl for client-side fetch`);
      return NextResponse.json({
        videoId, title, channel, description, language: 'en',
        captionUrl, segmentCount: 0,
        error: 'Server could not fetch captions (IP-locked). Client will retry.',
      }, { status: 200 }); // 200 so client processes the captionUrl
    }

    if (segments.length === 0) {
      // No transcript available — return metadata so UI can show AI web summary instead of an error
      return NextResponse.json({
        videoId,
        title,
        channel,
        description,
        language: 'en',
        noTranscript: true,
        segmentCount: 0,
        timestamped: '',
        plain: '',
      }, { status: 200 });
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