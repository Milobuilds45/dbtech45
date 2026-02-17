import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SKILLS_PATH = path.join(process.cwd(), 'public', 'data', 'agent-skills.json');

// GET: Read current skills data
export async function GET() {
  try {
    const raw = await fs.readFile(SKILLS_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read skills data' }, { status: 500 });
  }
}

// PATCH: Update a specific agent's skill rating
// Body: { agentId: string, category: string, delta: number }
// delta is capped at +1 per call, minimum 1, maximum 10
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, category, delta } = body;

    if (!agentId || !category) {
      return NextResponse.json({ error: 'agentId and category required' }, { status: 400 });
    }

    const validCategories = ['technical', 'business', 'core', 'autonomy', 'awareness'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }

    // Cap delta at +1 per update -- no big jumps
    const safeDelta = Math.min(Math.max(Number(delta) || 0.5, 0.5), 1);

    const raw = await fs.readFile(SKILLS_PATH, 'utf-8');
    const data = JSON.parse(raw);

    if (!data.agents[agentId]) {
      return NextResponse.json({ error: `Agent ${agentId} not found` }, { status: 404 });
    }

    const currentRating = data.agents[agentId].ratings[category] || 5;
    const newRating = Math.min(currentRating + safeDelta, 10);

    // Don't update if already at max
    if (currentRating >= 10) {
      return NextResponse.json({
        ok: true,
        agentId,
        category,
        previousRating: currentRating,
        newRating: currentRating,
        message: 'Already at maximum rating',
      });
    }

    data.agents[agentId].ratings[category] = Math.round(newRating * 10) / 10; // keep 1 decimal
    data.lastUpdated = new Date().toISOString();

    await fs.writeFile(SKILLS_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      ok: true,
      agentId,
      category,
      previousRating: currentRating,
      newRating: data.agents[agentId].ratings[category],
    });
  } catch (error) {
    console.error('Failed to update agent skills:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
