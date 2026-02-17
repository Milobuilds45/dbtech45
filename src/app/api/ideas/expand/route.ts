import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

interface ExpandRequest {
  title: string;
  description: string | null;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

async function callGemini(messages: { role: string; parts: { text: string }[] }[]) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: { maxOutputTokens: 4096, temperature: 0.8 },
        systemInstruction: {
          parts: [{
            text: `You are an idea development assistant for a builder/entrepreneur named Derek. Your job is to help him think through and develop his ideas.

Your approach:
1. On the FIRST message (when you receive just the idea title and description), analyze it and respond with:
   - A brief acknowledgment of what makes this interesting
   - 3-5 targeted questions that will help develop the idea further
   - Questions should cover: target audience, core problem being solved, how it differs from existing solutions, monetization, and MVP scope

2. On FOLLOW-UP messages, continue the conversation naturally:
   - Build on Derek's answers
   - Ask deeper follow-up questions
   - Start shaping the idea into something more concrete
   - Suggest specific features, tech approaches, or go-to-market strategies when appropriate
   - Be direct and practical — no fluff

3. When the idea feels well-developed, offer to summarize it into a structured brief with:
   - Problem statement
   - Solution overview
   - Target audience
   - Key features (MVP)
   - Tech stack suggestion
   - Next steps

Keep responses concise and actionable. Use markdown formatting. Don't be overly enthusiastic — be real.`
          }]
        }
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, history }: ExpandRequest = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Missing idea title' }, { status: 400 });
    }

    // Build conversation history for Gemini
    const messages: { role: string; parts: { text: string }[] }[] = [];

    if (!history || history.length === 0) {
      // First message — send the idea for analysis
      messages.push({
        role: 'user',
        parts: [{
          text: `I have an idea I want to develop:\n\nTitle: ${title}\n${description ? `Description: ${description}` : 'No description yet — just the title.'}\n\nHelp me think through this.`
        }]
      });
    } else {
      // Continuing conversation — include full history
      // First, set context with the original idea
      messages.push({
        role: 'user',
        parts: [{
          text: `I have an idea I want to develop:\n\nTitle: ${title}\n${description ? `Description: ${description}` : 'No description yet — just the title.'}\n\nHelp me think through this.`
        }]
      });

      // Add conversation history
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    const aiResponse = await callGemini(messages);

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Expand idea error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to expand idea' },
      { status: 500 }
    );
  }
}
