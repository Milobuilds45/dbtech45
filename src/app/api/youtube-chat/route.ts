import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, title, channel, timestamped, plain, history } = await req.json();

    if (!question || (!timestamped && !plain)) {
      return NextResponse.json({ error: 'Question and transcript required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'No AI API key configured' }, { status: 500 });
    }

    const source = timestamped || plain;
    // Send generous amount of transcript for context
    const maxChars = source.length > 40000 ? 20000 : source.length;
    const transcript = source.length > maxChars ? source.substring(0, maxChars) + '\n...[truncated]' : source;

    // Build conversation history for multi-turn
    const historyContext = (history || [])
      .slice(-6) // Keep last 6 exchanges to stay within limits
      .map((h: { role: string; text: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
      .join('\n');

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant that answers questions about a specific YouTube video based on its transcript. You have COMPLETE knowledge of this video's content.

RULES:
- Answer ONLY based on what's in the transcript. If the answer isn't in the transcript, say so.
- Be specific — include exact quotes, names, numbers, and details from the video.
- When referencing a specific moment, include the timestamp in [M:SS] or [H:MM:SS] format so the user can jump to it.
- Keep answers concise but thorough. Use bullet points for lists.
- If the user asks "what did they say about X", find the exact section and quote/paraphrase it with timestamps.
- For opinion questions ("was this good?", "should I watch?"), summarize the video's perspective, don't give your own opinion.
- Be conversational and helpful, like a knowledgeable friend who just watched the video.

Video: "${title}" by ${channel}

TRANSCRIPT:
${transcript}

${historyContext ? `CONVERSATION SO FAR:\n${historyContext}\n` : ''}
User's question: ${question}

Answer:`,
            }],
          }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.3,
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
    }

    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate an answer.';

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('YouTube chat error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
