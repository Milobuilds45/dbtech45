-- Apex Trader Funding - Account & Trade persistence
-- Run via Supabase Dashboard SQL Editor or `supabase db push`

-- Apex accounts registry (maps fill ID prefix → friendly name)
CREATE TABLE IF NOT EXISTS apex_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Apex trades (fill-level data from Rithmic CSVs)
CREATE TABLE IF NOT EXISTS apex_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_key TEXT NOT NULL,
  symbol TEXT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  buy_price NUMERIC(12,2),
  sell_price NUMERIC(12,2),
  pnl NUMERIC(12,2) NOT NULL,
  bought_timestamp TEXT,
  sold_timestamp TEXT,
  duration TEXT,
  trade_date DATE NOT NULL,
  buy_fill_id TEXT,
  sell_fill_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_key, buy_fill_id, sell_fill_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_apex_trades_account ON apex_trades(account_key);
CREATE INDEX IF NOT EXISTS idx_apex_trades_date ON apex_trades(trade_date);

-- RLS (Derek's personal site — open access for now)
ALTER TABLE apex_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on apex_accounts" ON apex_accounts;
CREATE POLICY "Allow all on apex_accounts" ON apex_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on apex_trades" ON apex_trades;
CREATE POLICY "Allow all on apex_trades" ON apex_trades FOR ALL USING (true) WITH CHECK (true);
