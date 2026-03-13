import pg from 'pg';

// Supabase direct connection (session mode)
// Format: postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
// We need the DB password. Let's try the Supabase transaction pooler instead.

// Alternative: use the Supabase REST + service_role
// But we don't have service_role. Let's try with the project's direct connection.

// The Supabase project ref is: ltoejmkktovxrsqtopeg
// Direct connection: db.ltoejmkktovxrsqtopeg.supabase.co:5432
// Pooler: aws-0-us-east-1.pooler.supabase.com:6543

// Since we don't have the DB password, let's create via the Supabase REST API
// using the service_role key. We need Derek to provide it.

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  CALENDAR TABLE SETUP                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Go to: https://supabase.com/dashboard/project/              ║
║         ltoejmkktovxrsqtopeg/sql/new                         ║
║                                                              ║
║  Paste this SQL and click RUN:                               ║
╚══════════════════════════════════════════════════════════════╝
`);

const sql = `
-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  color TEXT DEFAULT '#F59E0B',
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single-user app, behind auth)
CREATE POLICY "Allow all access" ON calendar_events
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events (date);

-- Done!
SELECT 'calendar_events table created successfully!' as result;
`;

console.log(sql);

// If SUPABASE_SERVICE_ROLE_KEY is set, create it automatically
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltoejmkktovxrsqtopeg.supabase.co';

if (serviceKey) {
  console.log('\\n🔑 Service role key found. Creating table automatically...');

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Response:', response.status);
} else {
  console.log('\\n⚠️  No SUPABASE_SERVICE_ROLE_KEY found.');
  console.log('    Copy the SQL above and run it in the Supabase SQL Editor.');
  console.log('    Dashboard → SQL Editor → New Query → Paste → Run');
}
`;

console.log(sql);
