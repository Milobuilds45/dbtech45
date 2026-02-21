// Roundtable API - Multi-round agent debate system
import { AGENT_PERSONALITIES } from '@/lib/agent-personalities';

const AGENTS: Record<string, { name: string; emoji: string; role: string; color: string; systemPrompt: string }> = Object.fromEntries(
  Object.entries(AGENT_PERSONALITIES).map(([id, a]) => [id, {
    name: a.displayName,
    emoji: a.emoji,
    role: a.role,
    color: a.color,
    systemPrompt: a.systemPrompt,
  }])
);

interface RoundMessage {
  agentId: string;
  round: number;
  content: string;
  latencyMs: number;
}

async function callAgent(
  agentId: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  // Try Gemini 2.0 Flash first (Free/Fast)
  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    try {
      // Convert messages to Gemini format
      // System prompt goes into 'system_instruction' or prepended to first user message
      // Gemini roles: 'user' -> 'user', 'assistant' -> 'model'
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          system_instruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { maxOutputTokens: 400, temperature: 0.8 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text;
        }
      }
      // If Gemini fails, fall through to Anthropic check
      const errText = await response.text();
      console.warn(`Gemini Roundtable failed for ${agentId}: ${errText}`);
    } catch (e) {
      console.error('Gemini error:', e);
    }
  }

  // Fallback to Anthropic (requires pre-paid credits)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No API keys configured (checked GOOGLE_API_KEY and ANTHROPIC_API_KEY)');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6', // Updated to 4.6
      max_tokens: 300,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    const error = await response.text();
    // Check specifically for credit balance error
    if (error.includes('credit balance is too low')) {
      throw new Error('Anthropic API credit balance is too low. Please add credits or configure GOOGLE_API_KEY for free tier.');
    }
    throw new Error(`Anthropic error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function GET() {
  const agents = Object.fromEntries(
    Object.entries(AGENTS).map(([id, a]) => [id, { name: a.name, emoji: a.emoji, role: a.role, color: a.color }])
  );
  return Response.json({ agents });
}

export async function POST(request: Request) {
  try {
    const { topic, agents: selectedAgents, rounds = 2 } = await request.json();

    if (!topic || !selectedAgents || selectedAgents.length === 0) {
      return Response.json({ error: 'Missing topic or agents' }, { status: 400 });
    }

    const maxRounds = Math.min(rounds, 4);
    const allMessages: RoundMessage[] = [];

    // ROUND 1: Independent answers
    const round1Results = await Promise.allSettled(
      selectedAgents.map(async (agentId: string) => {
        const agent = AGENTS[agentId];
        if (!agent) throw new Error(`Unknown agent: ${agentId}`);
        const start = Date.now();
        const content = await callAgent(agentId, agent.systemPrompt, [
          { role: 'user', content: `Topic for discussion: "${topic}"\n\nGive your opening take.` }
        ]);
        return { agentId, round: 1, content, latencyMs: Date.now() - start };
      })
    );

    for (const result of round1Results) {
      if (result.status === 'fulfilled') {
        allMessages.push(result.value);
      } else {
        const idx = round1Results.indexOf(result);
        allMessages.push({
          agentId: selectedAgents[idx],
          round: 1,
          content: `[Error: ${result.reason.message}]`,
          latencyMs: 0
        });
      }
    }

    // ROUNDS 2+: Agents respond to each other
    for (let round = 2; round <= maxRounds; round++) {
      // Build conversation context from all previous rounds
      const previousDiscussion = allMessages
        .filter(m => m.round < round)
        .map(m => {
          const agent = AGENTS[m.agentId];
          return `${agent?.emoji || '🤖'} ${agent?.name || m.agentId} (Round ${m.round}): ${m.content}`;
        })
        .join('\n\n');

      const roundResults = await Promise.allSettled(
        selectedAgents.map(async (agentId: string) => {
          const agent = AGENTS[agentId];
          if (!agent) throw new Error(`Unknown agent: ${agentId}`);
          const start = Date.now();

          const prompt = round === maxRounds
            ? `Here's the discussion so far:\n\n${previousDiscussion}\n\nThis is the final round. Give your closing argument or final take. Do you agree with anyone? Disagree? What's the bottom line?`
            : `Here's the discussion so far:\n\n${previousDiscussion}\n\nRespond to the other agents. Challenge someone you disagree with, build on someone you agree with, or introduce a new angle they're all missing.`;

          const content = await callAgent(agentId, agent.systemPrompt, [
            { role: 'user', content: `Topic: "${topic}"` },
            { role: 'assistant', content: allMessages.find(m => m.agentId === agentId && m.round === 1)?.content || '' },
            { role: 'user', content: prompt }
          ]);
          return { agentId, round, content, latencyMs: Date.now() - start };
        })
      );

      for (const result of roundResults) {
        if (result.status === 'fulfilled') {
          allMessages.push(result.value);
        }
      }
    }

    // Format response
    const formattedAgents = Object.fromEntries(
      Object.entries(AGENTS)
        .filter(([id]) => selectedAgents.includes(id))
        .map(([id, a]) => [id, { name: a.name, emoji: a.emoji, role: a.role, color: a.color }])
    );

    return Response.json({
      success: true,
      topic,
      totalRounds: maxRounds,
      messages: allMessages,
      agents: formattedAgents
    });

  } catch (error) {
    console.error('Roundtable error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
