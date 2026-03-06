import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, channel, plain, timestamped } = await req.json();
    if (!plain && !timestamped) return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });

    // Use timestamped version if available — this lets Gemini reference specific moments
    const source = timestamped || plain;
    
    // Send more of the transcript for better coverage
    const maxChars = source.length > 30000 ? 15000 : source.length > 15000 ? 10000 : source.length;
    const truncated = source.length > maxChars ? source.substring(0, maxChars) + '\n...[truncated]' : source;

    const apiKey = process.env.GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;
    
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
              text: `You are summarizing a YouTube video transcript into a TL;DR with timestamped key moments.

RULES:
- Line 1: A single sentence TL;DR (the one takeaway from the whole video)
- Then list KEY MOMENTS as bullet points
- EVERY bullet MUST start with a timestamp in [M:SS] or [H:MM:SS] format${hasTimestamps ? ' — use the actual timestamps from the transcript' : ''}
- Format: - [TIMESTAMP] Short description of what happens/is said (max 15 words)
- For longer videos (20+ min), group bullets under section headers using **Header**
- Be SPECIFIC — include product names, version numbers, features, prices, people mentioned
- No filler like "the speaker discusses" — just the facts
- Pick the MOST IMPORTANT moments — announcements, key features, opinions, conclusions
- For a 5 min video: 4-5 timestamped bullets
- For a 15 min video: 6-8 timestamped bullets
- For a 30+ min video: 8-12 timestamped bullets with section headers
- For a 60+ min video: 12-16 timestamped bullets with section headers

EXAMPLE OUTPUT:
GPT-5 is here with native multimodal reasoning, but 5.4 is the real leap with autonomous agents.

**GPT-5 Launch**
- [0:42] OpenAI officially announces GPT-5 with 1M token context window
- [2:15] Pricing: $30/month for Plus, API at $15/1M tokens
- [4:08] Live demo shows native image understanding without plugins

**GPT-5.4 Features**
- [8:30] Autonomous agent mode can browse web, write code, execute tasks
- [11:22] "Computer Use" feature similar to Claude but faster
- [14:05] Sam Altman says 5.4 is "the most capable AI system ever built"

**Reactions**
- [18:40] Benchmark comparison: beats Claude 3.5 on MMLU by 4 points
- [22:10] Pricing controversy — Pro tier jumps to $200/month

Video: "${title}" by ${channel}
Transcript length: ~${Math.round((plain || '').length / 5)} words

Transcript:
${truncated}`,
            }],
          }],
          generationConfig: {
            maxOutputTokens: 800,
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
