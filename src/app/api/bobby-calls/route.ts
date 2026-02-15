import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════════════════════
   Bobby's Live Calls API — Reads from Supabase bobby_calls table
   ═══════════════════════════════════════════════════════════════════════════ */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

interface BobbyCall {
  id: string;
  ticker: string;
  direction: string;
  entry: number;
  target: number | null;
  stop: number | null;
  conviction: number;
  status: string;
  entry_date: string;
  exit_date: string | null;
  exit_price: number | null;
  pnl_percent: number | null;
  notes: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ active: [], recent: [], stats: getEmptyStats() });
    }

    // Fetch active calls
    const { data: activeCalls } = await sb
      .from('bobby_calls')
      .select('*')
      .eq('status', 'active')
      .order('entry_date', { ascending: false });

    // Fetch recent closed calls
    const { data: recentCalls } = await sb
      .from('bobby_calls')
      .select('*')
      .neq('status', 'active')
      .order('exit_date', { ascending: false })
      .limit(10);

    // All calls for stats
    const { data: allCalls } = await sb
      .from('bobby_calls')
      .select('*')
      .neq('status', 'active');

    const active = (activeCalls || []).map(formatCall);
    const recent = (recentCalls || []).map(formatCall);
    const stats = calculateStats(allCalls || []);

    return NextResponse.json({
      active,
      recent,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Bobby calls error:', error);
    return NextResponse.json({ error: 'Failed to fetch calls', active: [], recent: [], stats: getEmptyStats() }, { status: 500 });
  }
}

function formatCall(c: BobbyCall) {
  return {
    id: c.id,
    ticker: c.ticker,
    direction: c.direction,
    entry: Number(c.entry),
    target: c.target ? Number(c.target) : null,
    stop: c.stop ? Number(c.stop) : null,
    conviction: c.conviction || 3,
    status: c.status,
    entryDate: c.entry_date,
    exitDate: c.exit_date,
    exitPrice: c.exit_price ? Number(c.exit_price) : null,
    pnlPercent: c.pnl_percent ? Number(c.pnl_percent) : null,
    notes: c.notes,
  };
}

function calculateStats(calls: BobbyCall[]) {
  const wins = calls.filter(c => c.status === 'won');
  const losses = calls.filter(c => c.status === 'lost');
  const total = wins.length + losses.length;

  const avgWin = wins.length > 0
    ? wins.reduce((s, c) => s + (Number(c.pnl_percent) || 0), 0) / wins.length
    : 0;
  const avgLoss = losses.length > 0
    ? losses.reduce((s, c) => s + Math.abs(Number(c.pnl_percent) || 0), 0) / losses.length
    : 0;

  // Current streak
  const sorted = [...calls].sort((a, b) => (b.exit_date || '').localeCompare(a.exit_date || ''));
  let streak = 0;
  let streakType: 'win' | 'loss' = 'win';
  for (const c of sorted) {
    if (streak === 0) {
      streakType = c.status === 'won' ? 'win' : 'loss';
      streak = 1;
    } else if ((c.status === 'won' && streakType === 'win') || (c.status === 'lost' && streakType === 'loss')) {
      streak++;
    } else break;
  }

  return {
    totalWins: wins.length,
    totalLosses: losses.length,
    winRate: total > 0 ? +((wins.length / total) * 100).toFixed(1) : 0,
    avgWinPercent: +avgWin.toFixed(1),
    avgLossPercent: +avgLoss.toFixed(1),
    currentStreak: streak,
    streakType,
  };
}

function getEmptyStats() {
  return { totalWins: 0, totalLosses: 0, winRate: 0, avgWinPercent: 0, avgLossPercent: 0, currentStreak: 0, streakType: 'win' as const };
}
