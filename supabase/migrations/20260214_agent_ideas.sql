-- Agent Ideas Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agent_ideas (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  problem_solved TEXT,
  target_market TEXT,
  business_model TEXT,
  revenue_projection TEXT,
  competitive_advantage TEXT,
  development_time TEXT,
  risk_assessment TEXT,
  tags TEXT[] DEFAULT '{}',
  derek_rating INTEGER,
  agent_confidence INTEGER DEFAULT 3,
  market_size TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'submitted',
  plain_english TEXT,
  source TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_ideas_agent_id ON agent_ideas(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_ideas_status ON agent_ideas(status);
CREATE INDEX IF NOT EXISTS idx_agent_ideas_source ON agent_ideas(source);
CREATE INDEX IF NOT EXISTS idx_agent_ideas_created_at ON agent_ideas(created_at DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE agent_ideas ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (adjust as needed for your security model)
CREATE POLICY "Allow all operations on agent_ideas" ON agent_ideas
  FOR ALL USING (true) WITH CHECK (true);
