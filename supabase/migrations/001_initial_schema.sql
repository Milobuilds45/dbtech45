-- DB Tech OS Database Schema
-- Ideas Vault, Todo items, Goals, Memory, Activity logs

-- Ideas Vault table
CREATE TABLE ideas_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'spark' CHECK (status IN ('spark', 'shaping', 'building', 'shipped')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT DEFAULT 'derek'
);

-- Goals and projects tracking
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'project',
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Master Todo items
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),
  due_date DATE,
  project TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity logs
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'system',
  agent TEXT,
  project TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Skills inventory
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'development',
  agents TEXT[] DEFAULT '{}',
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Memory/context tracking
CREATE TABLE memory_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'decision',
  context TEXT,
  tags TEXT[] DEFAULT '{}',
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX idx_ideas_vault_status ON ideas_vault(status);
CREATE INDEX idx_ideas_vault_priority ON ideas_vault(priority);
CREATE INDEX idx_ideas_vault_created_at ON ideas_vault(created_at);

CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_deadline ON goals(deadline);

CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_assignee ON todos(assignee);

CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_agent ON activities(agent);

-- RLS (Row Level Security) policies
ALTER TABLE ideas_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (Derek's workspace)
CREATE POLICY "Allow all for authenticated users" ON ideas_vault FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON goals FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON todos FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON skills FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON memory_entries FOR ALL USING (true);

-- Insert some initial data
INSERT INTO goals (title, description, current_value, target_value, unit, deadline, status, priority) VALUES
('Sunday Squares Launch', 'Complete football squares app with payments', 95, 100, 'percent', '2026-02-12', 'active', 'high'),
('Soul Solace Beta', 'AI wellness app beta testing', 60, 100, 'percent', '2026-03-01', 'active', 'medium'),
('Boundless v2', 'Travel planning app redesign', 40, 100, 'percent', '2026-02-17', 'active', 'medium'),
('tickR MVP', 'Trading dashboard scope', 25, 100, 'percent', '2026-02-24', 'active', 'medium');

INSERT INTO todos (title, assignee, priority, status, due_date, project) VALUES
('Sunday Squares payment integration', 'Anders', 'high', 'in_progress', '2026-02-12', 'Sunday Squares'),
('Signal & Noise draft review', 'Grant', 'high', 'backlog', '2026-02-14', 'Newsletter'),
('Boundless onboarding redesign', 'Paula', 'medium', 'in_progress', '2026-02-17', 'Boundless'),
('MenuSparks demo prep', 'Milo', 'medium', 'backlog', '2026-02-24', 'MenuSparks');

INSERT INTO skills (name, category, agents, proficiency_level, description) VALUES
('React/Next.js', 'development', ARRAY['Anders', 'Paula'], 'expert', 'Frontend framework development'),
('Trading/Finance', 'domain', ARRAY['Bobby', 'Tony'], 'expert', 'Market analysis and trading systems'),
('UI/UX Design', 'design', ARRAY['Paula'], 'expert', 'User interface and experience design'),
('Strategy/Operations', 'business', ARRAY['Milo', 'Derek'], 'expert', 'Business strategy and operational planning'),
('Content Writing', 'content', ARRAY['Dax', 'Remy'], 'expert', 'Marketing copy and technical writing'),
('Python/Data', 'development', ARRAY['Anders'], 'advanced', 'Backend development and data processing');

INSERT INTO activities (title, description, category, agent) VALUES
('DB Tech OS V3 deployed', 'Command center with Brand Kit integration', 'deployment', 'Anders'),
('Model Counsel interface built', 'Multi-AI interface with API key management', 'development', 'Anders'),
('Brand Kit assets delivered', 'Complete DBTECH45 brand system ready', 'design', 'Paula'),
('Real data pipeline connected', 'Supabase integration for persistent storage', 'infrastructure', 'Anders');