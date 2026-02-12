-- ON-DEMAND IDEA SYSTEM DATABASE SCHEMA
-- Extends existing tables for real-time idea generation

-- Add source tracking to existing SaaS ideas
ALTER TABLE IF EXISTS saas_ideas 
ADD COLUMN IF NOT EXISTS generated_by TEXT,
ADD COLUMN IF NOT EXISTS request_context TEXT, 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web',
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;

-- Add source tracking to existing assist resources  
ALTER TABLE IF EXISTS assist_resources
ADD COLUMN IF NOT EXISTS generated_by TEXT,
ADD COLUMN IF NOT EXISTS request_context TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web', 
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;

-- Create if tables don't exist
CREATE TABLE IF NOT EXISTS saas_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_solved TEXT,
  target_market TEXT,
  business_model TEXT,
  revenue_projection TEXT,
  competitive_advantage TEXT,
  tags TEXT[] DEFAULT '{}',
  derek_rating INTEGER,
  derek_feedback TEXT,
  agent_confidence INTEGER DEFAULT 3,
  market_size TEXT DEFAULT 'medium',
  development_time TEXT,
  status TEXT DEFAULT 'submitted',
  generated_by TEXT,
  request_context TEXT,
  platform TEXT DEFAULT 'web',
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assist_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  use_case TEXT NOT NULL,
  rating INTEGER DEFAULT 3,
  useful_for TEXT[] DEFAULT '{}',
  github_stars INTEGER,
  last_updated DATE,
  pricing TEXT,
  generated_by TEXT,
  request_context TEXT,
  platform TEXT DEFAULT 'web',
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_saas_ideas_generated ON saas_ideas(generated_by, auto_generated, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assist_resources_generated ON assist_resources(generated_by, auto_generated, created_at DESC);

-- Real-time subscriptions for Supabase
ALTER TABLE saas_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assist_resources ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (Derek's system)
CREATE POLICY IF NOT EXISTS "Allow all for Derek" ON saas_ideas FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for Derek" ON assist_resources FOR ALL USING (true);