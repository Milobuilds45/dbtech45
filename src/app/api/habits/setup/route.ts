import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(url, key);

  // Create habits table via RPC or insert defaults
  // Tables should be created in Supabase dashboard with:
  // habits: id (uuid, pk, default gen_random_uuid()), name (text), icon (text), created_at (timestamptz, default now())
  // habit_logs: id (uuid, pk, default gen_random_uuid()), habit_id (uuid, fk->habits.id), date (date), completed (bool, default false), created_at (timestamptz, default now())

  const defaultHabits = [
    { name: 'Trading Journal', icon: '📊' },
    { name: 'Build Time', icon: '💻' },
    { name: 'Read with Kids', icon: '📖' },
    { name: 'Exercise', icon: '🏋️' },
    { name: 'No Alcohol', icon: '🚫' },
  ];

  // Check if habits already exist
  const { data: existing } = await supabase.from('habits').select('id').limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Habits already set up', count: existing.length });
  }

  // Insert default habits
  const { data, error } = await supabase.from('habits').insert(defaultHabits).select();

  if (error) {
    return NextResponse.json({
      error: error.message,
      hint: 'Create tables first. Run this SQL in Supabase:\n' +
        'CREATE TABLE habits (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, icon text, created_at timestamptz DEFAULT now());\n' +
        'CREATE TABLE habit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), habit_id uuid REFERENCES habits(id) ON DELETE CASCADE, date date NOT NULL, completed boolean DEFAULT false, created_at timestamptz DEFAULT now());\n' +
        'CREATE UNIQUE INDEX habit_logs_unique ON habit_logs(habit_id, date);',
    }, { status: 500 });
  }

  return NextResponse.json({ message: 'Setup complete', habits: data });
}
