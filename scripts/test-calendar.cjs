const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ltoejmkktovxrsqtopeg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0b2VqbWtrdG92eHJzcXRvcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDAwNDMsImV4cCI6MjA4NjQxNjA0M30.g683Moc8_bNERl5sU5z72nFdscThc0HAzce97E6uMDc"
);

async function main() {
  // INSERT
  const { data: inserted, error: insertErr } = await supabase
    .from("calendar_events")
    .insert({ title: "TEST EVENT", date: "2026-03-07", time: "10:00", color: "#F59E0B" })
    .select()
    .single();

  if (insertErr) { console.log("INSERT FAIL:", insertErr.message); return; }
  console.log("INSERT OK:", inserted.id, inserted.title, inserted.date);

  // READ
  const { data: rows, error: readErr } = await supabase
    .from("calendar_events")
    .select("*");

  if (readErr) { console.log("READ FAIL:", readErr.message); return; }
  console.log("READ OK:", rows.length, "events");

  // DELETE test event
  const { error: delErr } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", inserted.id);

  if (delErr) { console.log("DELETE FAIL:", delErr.message); return; }
  console.log("DELETE OK — test event cleaned up");

  console.log("\n✅ Calendar table fully working. Insert/Read/Delete all pass.");
}

main().catch(console.error);
