// Client-side YouTube transcript extraction
// Simply forwards the request to our robust server-side API route

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

export interface TranscriptResult {
  videoId: string;
  title: string;
  channel: string;
  language: string;
  segmentCount: number;
  timestamped: string;
  plain: string;
}

export async function fetchTranscriptClient(url: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(url.trim());
  if (!videoId) throw new Error('Invalid YouTube URL. Paste a youtube.com or youtu.be link.');

  // Use our server-side API which has multiple robust fallbacks (captions, package, yt-dlp, whisper)
  try {
    const res = await fetch('/api/youtube-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      // Give it up to 5 minutes in case it falls back to Whisper transcription chunking
      signal: AbortSignal.timeout(300000), 
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Server returned an error.');
    }
    
    if (data.segmentCount > 0) {
      return data;
    } else {
      throw new Error('Transcript was empty.');
    }
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      throw new Error('Request timed out. The video might be too long to process right now.');
    }
    throw new Error(err.message || 'Failed to extract transcript. Please try again.');
  }
}
