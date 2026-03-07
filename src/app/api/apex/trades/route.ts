export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — load all trades (optionally filter by account_key)
export async function GET(req: NextRequest) {
  const accountKey = req.nextUrl.searchParams.get('account');

  let query = getSupabase()
    .from('apex_trades')
    .select('*')
    .order('sold_timestamp', { ascending: false });

  if (accountKey) {
    query = query.eq('account_key', accountKey);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trades: data });
}

// POST — upsert trades (idempotent via buy_fill_id + sell_fill_id)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_key, trades } = body as {
    account_key: string;
    trades: {
      symbol: string;
      qty: number;
      buy_price: number;
      sell_price: number;
      pnl: number;
      bought_timestamp: string;
      sold_timestamp: string;
      duration: string;
      trade_date: string;
      buy_fill_id: string;
      sell_fill_id: string;
    }[];
  };

  if (!account_key || !trades?.length) {
    return NextResponse.json({ error: 'account_key and trades required' }, { status: 400 });
  }

  // Upsert trades — on conflict (account_key, buy_fill_id, sell_fill_id) update
  const rows = trades.map(t => ({
    account_key,
    symbol: t.symbol,
    qty: t.qty,
    buy_price: t.buy_price,
    sell_price: t.sell_price,
    pnl: t.pnl,
    bought_timestamp: t.bought_timestamp,
    sold_timestamp: t.sold_timestamp,
    duration: t.duration,
    trade_date: t.trade_date,
    buy_fill_id: t.buy_fill_id,
    sell_fill_id: t.sell_fill_id,
  }));

  const { data, error } = await getSupabase()
    .from('apex_trades')
    .upsert(rows, { onConflict: 'account_key,buy_fill_id,sell_fill_id' })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: data?.length || 0 });
}
