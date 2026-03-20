import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const TABLE = 'research_history';

// GET - Load all research history
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ history: [] });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ history: data || [] });
  } catch (err: any) {
    console.error('[research-history] GET error:', err);
    return NextResponse.json({ history: [] });
  }
}

// POST - Save new research session
export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { query, summary, results, duration, usedCredits } = body;

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        query,
        summary,
        results: JSON.stringify(results || []),
        duration,
        used_credits: usedCredits || false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[research-history] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Remove a research session
export async function DELETE(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[research-history] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
