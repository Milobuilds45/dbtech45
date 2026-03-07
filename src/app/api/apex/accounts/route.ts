export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list all registered accounts
export async function GET() {
  const { data, error } = await getSupabase()
    .from('apex_accounts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ accounts: data });
}

// POST — register or update an account
export async function POST(req: NextRequest) {
  const { account_key, display_name } = await req.json();

  if (!account_key || !display_name) {
    return NextResponse.json({ error: 'account_key and display_name required' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('apex_accounts')
    .upsert(
      { account_key, display_name },
      { onConflict: 'account_key' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ account: data });
}
