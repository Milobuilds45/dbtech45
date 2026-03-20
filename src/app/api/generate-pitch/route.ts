import { NextResponse } from 'next/server';

const GEMINI_KEY = process.env.GEMINI_API_KEY_V2 || 'AIzaSyAydhdM1XhL6IjMQcMcJujRJwqse59jIyM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const agentPersonalities: Record<string, { role: string; voice: string }> = {
  ted: { role: 'CEO & Visionary', voice: 'Visionary founder. Direct, strategic, sees the big picture. Talks about market timing, category creation, and moving fast. Uses phrases like "Alright, listen" and "This is the kind of thing that starts small and becomes a category."' },
  milo: { role: 'Senior Advisor & Systems', voice: 'Systems thinker. Methodical, three-phase plans, thinks in frameworks. Talks about scalability, automation, and compounding advantages. Calm, confident, always has a plan B.' },
  paula: { role: 'Creative Director', voice: 'Bold designer. Typography-first, strong opinions. "The design IS the product." Talks about visual moats, brand identity, virality through aesthetics. Challenges weak ideas directly.' },
  anders: { role: 'Lead Developer', voice: 'No-nonsense builder. "Ship it day one." Talks about tech stack, architecture, API design. Hates overengineering. Wants to build the MVP in a weekend and iterate.' },
  bobby: { role: 'Trading & Finance', voice: 'Wall Street shark. Talks in risk/reward, asymmetric bets, unit economics. Uses financial metaphors. "The risk/reward here is asymmetric in our favor." Numbers-driven.' },
  remy: { role: 'Marketing & Growth', voice: 'Community-first marketer. Word-of-mouth operator. Thinks about virality loops, content marketing, influencer partnerships. "Let the users do the talking."' },
  wendy: { role: 'Personal & Wellness', voice: 'Human-centered. Empathy-led design thinking. Talks about user pain points, emotional journeys, accessibility. Cares deeply about the human experience.' },
  dwight: { role: 'Intelligence & Research', voice: 'Intel analyst. Surgical precision. Finds stories before mainstream catches up. Talks about signals, patterns, data sources. "Not a conspiracy theorist — a conspiracy analyst."' },
  jim: { role: 'Data & Analytics', voice: 'Data scientist. Lets numbers do the talking. Dry wit. Quantifies everything — bear case, base case, bull case. "I modeled three scenarios." A/B tests everything.' },
};

const creativityPrompts: Record<string, string> = {
  simple: 'Generate a SIMPLE, practical, low-risk business idea. Something that can be built in a weekend and start making money quickly. Think micro-SaaS, simple tools, basic automation.',
  creative: 'Generate a CREATIVE business idea that combines two unexpected domains. Something innovative but still feasible. Think unique angles on existing markets, creative twists on proven models.',
  experimental: 'Generate an EXPERIMENTAL, high-risk high-reward business idea. Something bold, potentially category-creating. Think bleeding-edge tech, new paradigms, moonshot ideas that could 10x.',
};

export async function POST(req: Request) {
  try {
    const { agentId, creativity, existingTitles } = await req.json();
    const agent = agentPersonalities[agentId];
    if (!agent) return NextResponse.json({ error: 'Unknown agent' }, { status: 400 });

    const avoidList = (existingTitles || []).slice(0, 20).join(', ');

    const prompt = `You are ${agent.role} at a tech company run by a dad-of-7 builder/trader named Derek. Your voice: ${agent.voice}

${creativityPrompts[creativity] || creativityPrompts.creative}

${avoidList ? `IMPORTANT: Do NOT generate any of these ideas (already pitched): ${avoidList}. Come up with something COMPLETELY DIFFERENT.` : ''}

Generate a unique SaaS/app/platform business pitch. Return ONLY valid JSON (no markdown, no code fences, no explanation) in this exact structure:

{
  "title": "Product Name: Short Tagline",
  "tldr": "2-3 sentence plain English explanation of what this is and why someone would pay for it.",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "executiveSummary": ["Paragraph 1 in your unique voice — 3-4 sentences about the opportunity.", "Paragraph 2 — why YOU specifically see this working, with your domain expertise.", "Paragraph 3 — the bottom line on why this is worth building NOW."],
  "scores": { "opportunity": 8, "problem": 7, "feasibility": 6, "whyNow": 9 },
  "businessFit": { "revenuePotential": "$500K-$2M ARR", "executionDifficulty": 6, "goToMarket": 8, "targetFounder": "Description of ideal founder for this" },
  "offerLadder": {
    "leadMagnet": { "title": "Free thing name", "desc": "What it is and why people want it" },
    "frontend": { "title": "Paid tier name", "desc": "What you get", "price": "$X/month" },
    "core": { "title": "Premium tier name", "desc": "Full access description", "price": "$X/month" }
  },
  "sections": {
    "whyNow": "Full paragraph on market timing — why this moment matters. Include specific trends, data points, cultural shifts.",
    "proofAndSignals": "Full paragraph on evidence this will work — communities, searches, competitor traction, social proof.",
    "marketGap": "Full paragraph on what existing solutions miss and where the white space is.",
    "executionPlan": "Full paragraph on go-to-market — first 100 users, growth loops, distribution channels."
  },
  "keywords": [
    { "term": "search term 1", "volume": "XX.XK", "growth": "+XX%" },
    { "term": "search term 2", "volume": "XX.XK", "growth": "+XX%" },
    { "term": "search term 3", "volume": "XX.XK", "growth": "+XX%" }
  ],
  "categorization": { "type": "SaaS/Tool/Platform", "market": "Market category", "target": "Target audience", "competitor": "Main competitor", "trendAnalysis": "One sentence on the macro trend" },
  "communitySignals": [
    { "platform": "Platform name", "count": 25, "text": "what was found" },
    { "platform": "Platform name", "count": 10, "text": "what was found" }
  ],
  "buildGuide": [
    { "step": 1, "title": "STEP TITLE IN CAPS", "description": "Detailed 3-4 sentence description of what to build, how to build it, and why it matters. Be specific about tech choices." },
    { "step": 2, "title": "STEP TITLE IN CAPS", "description": "Next step..." },
    { "step": 3, "title": "STEP TITLE IN CAPS", "description": "Next step..." },
    { "step": 4, "title": "STEP TITLE IN CAPS", "description": "Next step..." },
    { "step": 5, "title": "STEP TITLE IN CAPS", "description": "Next step..." }
  ]
}

Make the idea SPECIFIC and UNIQUE. Not generic. Clear niche, clear customer, clear revenue model. Write in your authentic voice.`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 4000 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: `Gemini API error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON — strip markdown fences if present
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```\s*$/, '');
    }

    const pitch = JSON.parse(jsonStr);
    return NextResponse.json(pitch);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate pitch error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
