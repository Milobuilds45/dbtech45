import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const TABLE = 'yt_transcripts';

// GET - Load all archived transcripts
export async function GET() {
  if (!supabase) return NextResponse.json({ transcripts: [] });

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('archived_at', { ascending: false });

    if (error) {
      // Table might not exist yet — return empty
      console.error('[transcripts] Load error:', error.message);
      return NextResponse.json({ transcripts: [] });
    }

    return NextResponse.json({ transcripts: data || [] });
  } catch (err) {
    console.error('[transcripts] Error:', err);
    return NextResponse.json({ transcripts: [] });
  }
}

// POST - Save a new transcript
export async function POST(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'No database configured' }, { status: 500 });

  try {
    const body = await req.json();
    const { id, videoId, title, channel, description, summary, language, segmentCount, timestamped, plain, archivedAt } = body;

    const { error } = await supabase.from(TABLE).upsert({
      id,
      video_id: videoId,
      title,
      channel: channel || 'Unknown',
      description: description || '',
      summary: summary || null,
      language: language || 'en',
      segment_count: segmentCount || 0,
      timestamped: timestamped || '',
      plain: plain || '',
      archived_at: archivedAt || new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.error('[transcripts] Save error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[transcripts] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update a transcript (e.g., add summary)
export async function PATCH(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'No database configured' }, { status: 500 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Convert camelCase to snake_case for Supabase
    const dbUpdates: Record<string, unknown> = {};
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
    if (updates.title !== undefined) dbUpdates.title = updates.title;

    const { error } = await supabase.from(TABLE).update(dbUpdates).eq('id', id);

    if (error) {
      console.error('[transcripts] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[transcripts] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove a transcript
export async function DELETE(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'No database configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase.from(TABLE).delete().eq('id', id);

    if (error) {
      console.error('[transcripts] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[transcripts] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
