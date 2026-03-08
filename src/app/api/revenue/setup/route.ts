import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    message: 'Create these tables in Supabase Dashboard:',
    sql: [
      'CREATE TABLE revenue_streams (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, monthly_amount numeric NOT NULL DEFAULT 0, type text NOT NULL DEFAULT \'saas\', created_at timestamptz DEFAULT now());',
      'CREATE TABLE revenue_snapshots (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), month text NOT NULL, total_mrr numeric NOT NULL DEFAULT 0, created_at timestamptz DEFAULT now());',
      'CREATE UNIQUE INDEX revenue_snapshots_month ON revenue_snapshots(month);',
    ],
  });
}
