import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, channel, plain } = await req.json();
    if (!plain) return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });

    // Use more text for longer videos to get better outlines
    const maxChars = plain.length > 20000 ? 8000 : 4000;
    const truncated = plain.length > maxChars ? plain.substring(0, maxChars) + '...' : plain;

    const apiKey = process.env.GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;
    
    if (!apiKey) {
      // Fallback: generate a simple extractive summary without AI
      const sentences = plain.split(/[.!?]+/).filter((s: string) => s.trim().length > 20).slice(0, 5);
      return NextResponse.json({
        summary: `**Key Points**\n- ${sentences.map((s: string) => s.trim()).join('\n- ')}`,
      });
    }

    // Use Gemini for AI summary — TL;DR outline format
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are summarizing a YouTube video transcript. Create a TL;DR outline that someone can glance at in 10 seconds and understand the entire video.

Rules:
- Start with a one-line TLDR (the single takeaway)
- Then list KEY POINTS as bullet points (use - prefix)
- For longer videos (20+ min), group bullets under section headers using **Header**
- Each bullet should be ONE short sentence, max 15 words
- Be specific — include names, numbers, tools mentioned
- No filler words, no "the speaker discusses..." — just the facts
- For a 5 min video: 3-4 bullets. For a 30 min video: 6-8 bullets with headers. For 60+ min: 8-12 bullets with headers.

Video: "${title}" by ${channel}
Transcript length: ~${Math.round(plain.length / 5)} words

Transcript:
${truncated}`,
            }],
          }],
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      // Fallback to extractive summary
      const sentences = plain.split(/[.!?]+/).filter((s: string) => s.trim().length > 20).slice(0, 5);
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
