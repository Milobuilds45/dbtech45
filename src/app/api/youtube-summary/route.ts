import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, channel, plain, timestamped, noTranscript, description } = await req.json();
    if (!plain && !timestamped && !noTranscript) return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });

    const apiKey = process.env.GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;

    // ── No-transcript mode: synthesize from web knowledge ──
    if (noTranscript) {
      if (!apiKey) {
        return NextResponse.json({
          summary: `**No Transcript Available**\n- This video does not have captions or auto-generated subtitles\n- AI summary unavailable without a Google AI key`,
        });
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI assistant summarizing a YouTube video based on its title, channel, and description — no transcript is available.

Video: "${title}" by ${channel}
Description: ${description || 'No description available'}

Based on what you know about this video, channel, and topic, provide a helpful overview. Be upfront that this is based on available metadata and your knowledge, not the actual transcript.

FORMAT:
- Line 1: One sentence describing what this video is about
- **What This Video Covers** — 4-6 bullet points on the likely topics covered based on the title/description/channel
- **About the Channel** — 1-2 sentences about the creator/channel if you know them
- **Related Topics** — 3-4 bullet points of related concepts a viewer of this video might be interested in

Be specific and helpful. If you don't know details about this specific video, say so honestly but still provide value based on what the title/channel suggests.
Note at the end: ⚠️ Summary based on video metadata — no transcript was available.`,
              }],
            }],
            generationConfig: {
              maxOutputTokens: 600,
              temperature: 0.3,
            },
          }),
        }
      );

      if (!res.ok) {
        return NextResponse.json({ summary: '**Summary unavailable** — could not reach AI service.' });
      }
      const data = await res.json();
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary unavailable.';
      return NextResponse.json({ summary });
    }

    // ── Normal mode: summarize from transcript ──
    // Use timestamped version if available — this lets Gemini reference specific moments
    const source = timestamped || plain;

    // Send more of the transcript for better coverage
    const maxChars = source.length > 30000 ? 15000 : source.length > 15000 ? 10000 : source.length;
    const truncated = source.length > maxChars ? source.substring(0, maxChars) + '\n...[truncated]' : source;

    if (!apiKey) {
      const sentences = plain.split(/[.!?]+/).filter((s: string) => s.trim().length > 20).slice(0, 5);
      return NextResponse.json({
        summary: `**Key Points**\n- ${sentences.map((s: string) => s.trim()).join('\n- ')}`,
      });
    }

    const hasTimestamps = !!timestamped;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are summarizing a YouTube video transcript. Produce a clean, structured breakdown.

OUTPUT FORMAT (use exactly these section headers):

Line 1: One sentence TL;DR — the single most important takeaway.

**CHAPTERS**
List the major chapters/topics${hasTimestamps ? ' with real timestamps from the transcript' : ''}.
Format: - [TIMESTAMP] Chapter title (3-5 words)
- 3-8 chapters depending on video length

**KEY MOMENTS**
The most important specific facts, demos, announcements, or insights.
- EVERY bullet starts with [TIMESTAMP]
- Be SPECIFIC — names, numbers, prices, features, quotes
- No filler like "the speaker discusses"
- 5 min video: 4-5 bullets | 15 min: 6-8 | 30+ min: 10-12 | 60+ min: 14-16

**KEY QUOTES**
3-5 verbatim quotes from the speaker. Pick the most insightful, surprising, or memorable lines.
Format: › "Exact quote from video" [TIMESTAMP]

RULES:
- ${hasTimestamps ? 'Use actual timestamps from the transcript' : 'Estimate timestamps based on position in transcript'}
- Be specific — include product names, version numbers, prices, people
- Quotes must be verbatim (or very close) — not paraphrased

EXAMPLE:
GPT-5 is here and the $200/month Pro tier is already causing controversy.

**CHAPTERS**
- [0:00] Intro & context
- [2:15] GPT-5 launch announcement
- [8:30] Autonomous agent features
- [18:40] Benchmark comparisons
- [22:10] Pricing breakdown

**KEY MOMENTS**
- [0:42] OpenAI announces GPT-5 with 1M token context window
- [2:15] Pricing: $30/month Plus, API at $15/1M tokens
- [4:08] Live demo: native image understanding without plugins
- [8:30] Agent mode browses web, writes code, executes tasks
- [14:05] Sam Altman calls it "the most capable AI system ever built"
- [22:10] Pro tier jumps from $20 to $200/month — community backlash

**KEY QUOTES**
› "This is the model we've been building toward for three years" [1:22]
› "Computer Use is faster than Claude's implementation by 40%" [9:45]
› "We're not ready to talk about GPT-6 yet, but it's coming" [25:10]

Video: "${title}" by ${channel}
Transcript length: ~${Math.round((plain || '').length / 5)} words

Transcript:
${truncated}`,
            }],
          }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      const sentences = (plain || '').split(/[.!?]+/).filter((s: string) => s.trim().length > 20).slice(0, 5);
      return NextResponse.json({
        summary: `**Key Points**\n- ${sentences.map((s: string) => s.trim()).join('\n- ')}`,
      });
    }

    const data = await res.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary unavailable.';

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Summary error:', err);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
