-- YouTube Transcripts Archive
CREATE TABLE IF NOT EXISTS yt_transcripts (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT 'Unknown',
  description TEXT DEFAULT '',
  summary TEXT,
  language TEXT DEFAULT 'en',
  segment_count INTEGER DEFAULT 0,
  timestamped TEXT DEFAULT '',
  plain TEXT DEFAULT '',
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_yt_transcripts_video_id ON yt_transcripts(video_id);
CREATE INDEX IF NOT EXISTS idx_yt_transcripts_channel ON yt_transcripts(channel);
CREATE INDEX IF NOT EXISTS idx_yt_transcripts_archived_at ON yt_transcripts(archived_at DESC);

-- RLS
ALTER TABLE yt_transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to yt_transcripts" ON yt_transcripts FOR ALL USING (true) WITH CHECK (true);
