const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ltoejmkktovxrsqtopeg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0b2VqbWtrdG92eHJzcXRvcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDAwNDMsImV4cCI6MjA4NjQxNjA0M30.g683Moc8_bNERl5sU5z72nFdscThc0HAzce97E6uMDc"
);

async function main() {
  // Test basic connection
  const { data, error } = await supabase.from("todos").select("id").limit(1);
  console.log("Connection test:", error ? "FAIL: " + error.message : "OK");

  // Try inserting into calendar_events to see if table exists
  const { error: insertErr } = await supabase.from("calendar_events").select("id").limit(1);
  if (insertErr) {
    console.log("calendar_events doesn't exist:", insertErr.message);
    console.log("\nTable needs to be created. Trying RPC...");
    
    // Attempt RPC (won't work with anon, but let's try)
    const { error: rpcErr } = await supabase.rpc("exec_sql", { 
      query: "CREATE TABLE IF NOT EXISTS calendar_events (id uuid primary key default gen_random_uuid(), title text not null, date date not null, time time, color text default '#F59E0B', category text, notes text, created_at timestamptz default now(), updated_at timestamptz default now())" 
    });
    
    if (rpcErr) {
      console.log("RPC failed:", rpcErr.message);
      console.log("\n=== NEED MANUAL ACTION ===");
      console.log("Go to: https://supabase.com/dashboard/project/ltoejmkktovxrsqtopeg/sql/new");
      console.log("Run this SQL:\n");
      console.log(`CREATE TABLE IF NOT EXISTS calendar_events (
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

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON calendar_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events (date);`);
    } else {
      console.log("Table created via RPC!");
    }
  } else {
    console.log("calendar_events table already exists!");
  }
}

main().catch(console.error);
