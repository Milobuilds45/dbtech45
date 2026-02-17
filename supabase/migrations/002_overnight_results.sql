-- Overnight Results table for caching overnight agent session data
-- Used by /api/overnight endpoint to persist cron results from gateway

CREATE TABLE overnight_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  agent TEXT NOT NULL,
  agent_color TEXT DEFAULT '#737373',
  type TEXT DEFAULT 'analysis',
  title TEXT NOT NULL,
  summary TEXT,
  details JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  timestamp TEXT,
  icon TEXT DEFAULT '◈',
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
  duration_ms INTEGER,
  error_message TEXT,
  cron_name TEXT,
  cron_id TEXT,
  source TEXT DEFAULT 'cron' CHECK (source IN ('cron', 'commit', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_overnight_results_date ON overnight_results(date DESC);
CREATE INDEX idx_overnight_results_agent ON overnight_results(agent);
CREATE INDEX idx_overnight_results_status ON overnight_results(status);
CREATE INDEX idx_overnight_results_cron_id ON overnight_results(cron_id);

-- RLS
ALTER TABLE overnight_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for overnight_results" ON overnight_results FOR ALL USING (true);
