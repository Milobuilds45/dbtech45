import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface AgentIdea {
  id: string;
  agent_id: string;
  agent_name: string;
  title: string;
  description: string;
  problem_solved: string;
  target_market: string;
  business_model: string;
  revenue_projection: string;
  competitive_advantage: string;
  development_time: string;
  risk_assessment: string;
  tags: string[];
  derek_rating?: number;
  agent_confidence: number;
  market_size: 'small' | 'medium' | 'large' | 'massive';
  status: 'submitted' | 'reviewed' | 'approved' | 'building' | 'rejected' | 'launched';
  plain_english?: string;
  source: 'generated' | 'autonomous';
  created_at: string;
  updated_at: string;
}

// GET - Fetch all ideas
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('agent_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ideas: data || [] });
  } catch (err) {
    console.error('GET ideas error:', err);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

// POST - Create new idea(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ideas = Array.isArray(body.ideas) ? body.ideas : [body];

    // Map frontend field names to database column names
    const dbIdeas = ideas.map((idea: any) => ({
      id: idea.id,
      agent_id: idea.agentId || idea.agent_id,
      agent_name: idea.agentName || idea.agent_name,
      title: idea.title,
      description: idea.description,
      problem_solved: idea.problemSolved || idea.problem_solved,
      target_market: idea.targetMarket || idea.target_market,
      business_model: idea.businessModel || idea.business_model,
      revenue_projection: idea.revenueProjection || idea.revenue_projection,
      competitive_advantage: idea.competitiveAdvantage || idea.competitive_advantage,
      development_time: idea.developmentTime || idea.development_time,
      risk_assessment: idea.riskAssessment || idea.risk_assessment,
      tags: idea.tags || [],
      derek_rating: idea.derekRating || idea.derek_rating,
      agent_confidence: idea.agentConfidence || idea.agent_confidence || 3,
      market_size: idea.marketSize || idea.market_size || 'medium',
      status: idea.status || 'submitted',
      plain_english: idea.plainEnglish || idea.plain_english,
      source: idea.source || 'generated',
      created_at: idea.createdAt || idea.created_at || new Date().toISOString(),
      updated_at: idea.updatedAt || idea.updated_at || new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('agent_ideas')
      .upsert(dbIdeas, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ideas: data });
  } catch (err) {
    console.error('POST ideas error:', err);
    return NextResponse.json({ error: 'Failed to save ideas' }, { status: 500 });
  }
}

// PATCH - Update idea
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing idea id' }, { status: 400 });
    }

    // Map frontend field names to database column names
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.derekRating !== undefined) dbUpdates.derek_rating = updates.derekRating;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.agentConfidence !== undefined) dbUpdates.agent_confidence = updates.agentConfidence;

    const { data, error } = await supabase
      .from('agent_ideas')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ idea: data });
  } catch (err) {
    console.error('PATCH idea error:', err);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

// DELETE - Remove idea
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing idea id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('agent_ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE idea error:', err);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
