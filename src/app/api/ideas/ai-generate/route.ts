import { NextResponse } from 'next/server';

const AGENT_PERSONAS: Record<string, string> = {
  bobby: 'You are Bobby, a trading and finance expert. Your ideas focus on retail trading tools, options flow, market analysis, portfolio management, and financial data products.',
  tony: 'You are Tony, a restaurant and food industry expert. Your ideas focus on restaurant operations, kitchen management, food cost optimization, menu engineering, and hospitality tech.',
  paula: 'You are Paula, a design and branding expert. Your ideas focus on brand identity, UI/UX tools, design automation, creative asset generation, and visual communication platforms.',
  anders: 'You are Anders, a full-stack developer and DevTools expert. Your ideas focus on developer tools, deployment automation, code generation, API platforms, and engineering productivity.',
  dwight: 'You are Dwight, a competitive intelligence and research expert. Your ideas focus on market research, trend detection, intelligence gathering, data analysis, and strategic insights.',
  dax: 'You are Dax, a data storytelling and analytics expert. Your ideas focus on data visualization, business intelligence, report automation, predictive analytics, and dashboard tools.',
  milo: 'You are Milo, a business operations and coordination expert. Your ideas focus on workflow automation, team coordination, project management, multi-agent systems, and operational efficiency.',
  remy: 'You are Remy, a content creation and marketing expert. Your ideas focus on social media tools, content generation, SEO automation, viral marketing, and audience growth platforms.',
  wendy: 'You are Wendy, a performance coaching and habits expert. Your ideas focus on habit tracking, personal productivity, wellness optimization, coaching tools, and behavioral change platforms.',
};

const CREATIVITY_PROMPTS: Record<string, string> = {
  simple: 'Generate a SIMPLE, low-risk, proven-model SaaS idea. Think: straightforward tool that solves an obvious pain point. Quick to build (2-3 weeks), easy to monetize, small but real market. Keep it grounded and executable.',
  creative: 'Generate a CREATIVE SaaS idea with a unique angle. Think: novel combination of existing concepts, fresh approach to a known problem. Medium risk, 4-8 weeks to build, clear path to $500K+ ARR. Push boundaries but stay realistic.',
  experimental: 'Generate an EXPERIMENTAL, high-risk/high-reward SaaS idea. Think: cutting-edge tech, emerging markets, bold bets. Could be massive or could fail completely. 8-16 weeks to build. Include honest risk assessment of why this might NOT work.',
};

export async function POST(request: Request) {
  try {
    const { agentIds, creativity, mode, existingTitles } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const ideas = [];

    if (mode === 'collaborative' && agentIds.length >= 2) {
      const agentNames = agentIds.map((id: string) => {
        const personas = Object.entries(AGENT_PERSONAS);
        const found = personas.find(([k]) => k === id);
        return found ? id.charAt(0).toUpperCase() + id.slice(1) : id;
      });

      const prompt = `You are a team of AI agents: ${agentNames.join(', ')}. Each has their own expertise:
${agentIds.map((id: string) => AGENT_PERSONAS[id] || '').filter(Boolean).join('\n')}

${CREATIVITY_PROMPTS[creativity] || CREATIVITY_PROMPTS.creative}

Generate ONE collaborative SaaS idea that combines the expertise of ALL these agents into something none could build alone.

${existingTitles?.length ? `IMPORTANT: Do NOT generate ideas with these titles (already exist): ${existingTitles.join(', ')}. Create something completely different.` : ''}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "title": "Product Name",
  "description": "2-3 sentence pitch",
  "problemSolved": "What specific pain point this addresses",
  "targetMarket": "Who buys this and market size",
  "businessModel": "Pricing model with specific numbers",
  "revenueProjection": "Realistic ARR projection with subscriber math",
  "competitiveAdvantage": "Why this wins against alternatives",
  "developmentTime": "Realistic timeline with milestones",
  "riskAssessment": "Honest assessment of what could go wrong",
  "marketSize": "small|medium|large|massive",
  "agentConfidence": 1-5
}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Anthropic API error:', err);
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        ideas.push({
          id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agentId: 'collaborative',
          agentName: agentNames.join(' + '),
          ...parsed,
          tags: [...agentIds, 'collaborative', creativity],
          status: 'submitted',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to parse AI response:', text);
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
    } else {
      // Individual mode - generate one idea per agent in parallel
      const promises = agentIds.map(async (agentId: string) => {
        const persona = AGENT_PERSONAS[agentId];
        if (!persona) return null;

        const agentName = agentId.charAt(0).toUpperCase() + agentId.slice(1);
        const prompt = `${persona}

${CREATIVITY_PROMPTS[creativity] || CREATIVITY_PROMPTS.creative}

Generate ONE unique SaaS business idea based on your expertise.

${existingTitles?.length ? `IMPORTANT: Do NOT generate ideas with these titles (already exist): ${existingTitles.join(', ')}. Create something completely different and original.` : ''}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "title": "Product Name",
  "description": "2-3 sentence pitch",
  "problemSolved": "What specific pain point this addresses",
  "targetMarket": "Who buys this and market size",
  "businessModel": "Pricing model with specific numbers",
  "revenueProjection": "Realistic ARR projection with subscriber math",
  "competitiveAdvantage": "Why this wins against alternatives",
  "developmentTime": "Realistic timeline with milestones",
  "riskAssessment": "Honest assessment of what could go wrong",
  "marketSize": "small|medium|large|massive",
  "agentConfidence": 1-5
}`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const text = data.content?.[0]?.text || '';
        try {
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return {
            id: `${agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            agentId,
            agentName,
            ...parsed,
            tags: [agentId, creativity],
            status: 'submitted',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      ideas.push(...results.filter(Boolean));
    }

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
