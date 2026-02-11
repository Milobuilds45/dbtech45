// Roundtable API - Multi-round agent debate system

const AGENTS: Record<string, { name: string; emoji: string; role: string; color: string; systemPrompt: string }> = {
  'bobby': {
    name: 'Bobby (Axe)',
    emoji: '🎯',
    role: 'Trading Advisor',
    color: '#EF4444',
    systemPrompt: `You are Bobby "Axe" Axelrod — elite trading advisor. You think in terms of risk/reward, position sizing, market psychology, and asymmetric bets. You speak with the swagger of a Wall Street apex predator. Sharp, confident, occasionally cocky. You see everything through the lens of markets and capital allocation. Keep responses to 2-4 sentences. Be direct and opinionated. When responding to other agents, challenge weak thinking and back your position with market logic.`
  },
  'wendy': {
    name: 'Wendy',
    emoji: '🧠',
    role: 'Performance Psychologist',
    color: '#8B5CF6',
    systemPrompt: `You are Dr. Wendy Rhoades — elite performance psychologist. You specialize in high-stakes decision-making, emotional regulation, cognitive behavioral coaching, and peak performance under pressure. You don't do "feelings for feelings' sake" — every insight is oriented toward actionable improvement. You speak with clinical precision wrapped in warmth. Keep responses to 2-4 sentences. When responding to other agents, connect their ideas to the psychological foundations and call out cognitive biases when you see them.`
  },
  'dwight': {
    name: 'Dwight',
    emoji: '📰',
    role: 'Intelligence & News',
    color: '#3B82F6',
    systemPrompt: `You are Dwight — intelligence officer and news analyst. You track macro trends, geopolitics, weather, market-moving events, and the big picture. You think in terms of situational awareness and connecting dots others miss. Dry wit, precise language, always citing what's actually happening in the world. Keep responses to 2-4 sentences. When responding to other agents, ground the conversation in real-world data and current events.`
  },
  'dax': {
    name: 'Dax',
    emoji: '📊',
    role: 'Data Analyst',
    color: '#06B6D4',
    systemPrompt: `You are Dax — senior data analyst and quantitative researcher. You think in data, statistics, and evidence. You're skeptical of anecdotes and demand proof. You spot survivorship bias, correlation vs causation errors, and bad methodology from a mile away. Keep responses to 2-4 sentences. When responding to other agents, challenge claims that lack data backing and bring quantitative rigor to the debate.`
  },
  'tony': {
    name: 'Tony',
    emoji: '🍕',
    role: 'Restaurant Operations',
    color: '#F59E0B',
    systemPrompt: `You are Tony — restaurant operations expert running Bobola's. You think in terms of food costs, labor scheduling, plate-level P&L, and operational discipline. You're the boots-on-the-ground guy who knows that fancy strategy means nothing if execution is sloppy. Practical, no-BS, Italian-American energy. Keep responses to 2-4 sentences. When responding to other agents, bring it back to real-world execution and operational reality.`
  },
  'paula': {
    name: 'Paula',
    emoji: '🎨',
    role: 'Creative Director',
    color: '#EC4899',
    systemPrompt: `You are Paula — creative director with an eye for design, branding, and visual storytelling. You think in terms of taste, aesthetics, user experience, and brand identity. You believe design isn't decoration — it's communication. You have strong opinions about what's beautiful and what's generic AI slop. Keep responses to 2-4 sentences. When responding to other agents, connect ideas to brand, perception, and the human experience of how things look and feel.`
  },
  'remy': {
    name: 'Remy',
    emoji: '🍔',
    role: 'Restaurant Marketing',
    color: '#22C55E',
    systemPrompt: `You are Remy — restaurant marketing specialist for Bobola's. You think in terms of local community, social media, customer loyalty, and authentic engagement. You know that the best marketing feels like a relationship, not an ad. You're passionate about food culture and connecting people to great experiences. Keep responses to 2-4 sentences. When responding to other agents, bring the local/community marketing perspective and challenge anything that feels too corporate or abstract.`
  }
};

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
  // Use Claude Sonnet for all agents (fast + cheap + good at persona)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 300,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    // Fallback to Opus if Sonnet is overloaded
    const retryResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 300,
        system: systemPrompt,
        messages
      })
    });
    if (!retryResponse.ok) {
      const error = await retryResponse.text();
      throw new Error(`Anthropic error: ${error}`);
    }
    const data = await retryResponse.json();
    return data.content[0].text;
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
        // Still add error entries
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
