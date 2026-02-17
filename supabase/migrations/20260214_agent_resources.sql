-- Agent Assist Resources table
-- Replaces localStorage-based storage so state syncs across devices

CREATE TABLE IF NOT EXISTS agent_resources (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  plain_english TEXT,
  url TEXT,
  category TEXT DEFAULT 'other',
  type TEXT DEFAULT 'open-source',
  tags TEXT[] DEFAULT '{}',
  use_case TEXT,
  rating INTEGER DEFAULT 3,
  useful_for TEXT[] DEFAULT '{}',
  github_stars INTEGER,
  last_updated TEXT,
  pricing TEXT,
  added_by TEXT,
  skill_category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_agent_resources_status ON agent_resources(status);
CREATE INDEX idx_agent_resources_agent_id ON agent_resources(agent_id);
CREATE INDEX idx_agent_resources_category ON agent_resources(category);

ALTER TABLE agent_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for agent_resources" ON agent_resources FOR ALL USING (true);
