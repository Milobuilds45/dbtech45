'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Upload, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  FileSpreadsheet, BarChart3, Activity,
  CheckSquare, Square, X,
  Calendar, ArrowUpRight, ArrowDownRight, Wallet, Clock, Target,
  Zap, Award, Timer, LineChart, List, Loader2, Save, Database
} from 'lucide-react';

// ─── Brand ───
const C = {
  void: '#06070B',
  carbon: '#0a0b10',
  slab: '#0e1017',
  graphite: '#12131a',
  surface: '#16171f',
  amber: '#F59E0B',
  amberMuted: 'rgba(245,158,11,0.6)',
  amberGhost: 'rgba(245,158,11,0.08)',
  white: '#F5F5F5',
  silver: '#9ca3af',
  smoke: 'rgba(255,255,255,0.45)',
  dim: 'rgba(255,255,255,0.25)',
  border: 'rgba(245,158,11,0.1)',
  borderActive: 'rgba(245,158,11,0.25)',
  green: '#10B981',
  greenBright: '#34D399',
  greenGhost: 'rgba(16,185,129,0.08)',
  greenGlow: 'rgba(16,185,129,0.15)',
  red: '#EF4444',
  redGhost: 'rgba(239,68,68,0.08)',
  redGlow: 'rgba(239,68,68,0.15)',
};
const M = "'JetBrains Mono', monospace";
const S = "'Space Grotesk', sans-serif";

// ─── Types ───
interface Trade {
  symbol: string;
  qty: number;
  buyPrice: number;
  sellPrice: number;
  pnl: number;
  boughtTimestamp: string;
  soldTimestamp: string;
  duration: string;
  account: string;
  date: string;
}

interface DaySummary {
  date: string;
  trades: number;
  pnl: number;
  wins: number;
  losses: number;
  contracts: number;
  symbols: string[];
}

interface AccountData {
  name: string;
  trades: Trade[];
  totalPnl: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  bestDay: number;
  worstDay: number;
  avgDailyPnl: number;
  totalContracts: number;
  tradingDays: number;
  greenDays: number;
  redDays: number;
  symbols: string[];
  dailySummaries: DaySummary[];
}

// ─── Parsers ───
function parseApexTradeCSV(text: string, fileName: string): Trade[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const idx = {
    symbol: headers.indexOf('symbol'),
    qty: headers.indexOf('qty'),
    buyPrice: headers.findIndex(h => h === 'buyprice'),
    sellPrice: headers.findIndex(h => h === 'sellprice'),
    pnl: headers.indexOf('pnl'),
    bought: headers.findIndex(h => h === 'boughttimestamp'),
    sold: headers.findIndex(h => h === 'soldtimestamp'),
    duration: headers.indexOf('duration'),
  };
  if (idx.pnl < 0) return [];

  const accountName = fileName.replace(/\.(csv|txt)$/i, '').replace(/^file_\d+---[a-f0-9-]+$/i, '') || 'Account';
  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols: string[] = [];
    let cur = '', inQ = false;
    for (const c of line) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
    cols.push(cur.trim());

    const get = (i: number) => i >= 0 && i < cols.length ? cols[i] : '';
    const parsePnl = (raw: string) => {
      const s = raw.replace(/[$,]/g, '');
      return s.startsWith('(') && s.endsWith(')') ? -parseFloat(s.slice(1, -1)) : parseFloat(s) || 0;
    };

    const rawTs = get(idx.sold) || get(idx.bought);
    let date = '';
    const m = rawTs.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) date = `${m[3]}-${m[1]}-${m[2]}`;

    trades.push({
      symbol: get(idx.symbol) || 'N/A', qty: parseInt(get(idx.qty)) || 1,
      buyPrice: parseFloat(get(idx.buyPrice)) || 0, sellPrice: parseFloat(get(idx.sellPrice)) || 0,
      pnl: parsePnl(get(idx.pnl)), boughtTimestamp: get(idx.bought), soldTimestamp: get(idx.sold),
      duration: get(idx.duration) || '', account: accountName, date,
    });
  }
  return trades;
}

function parseApexDailyCSV(text: string, fileName: string): Trade[] | null {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;
  const h = lines[0].toLowerCase();
  if (!h.includes('total amount') && !h.includes('total_amount') && !h.includes('total realized pnl')) return null;

  const trades: Trade[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols: string[] = []; let cur = '', inQ = false;
    for (const c of lines[i]) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
    cols.push(cur.trim());
    if (cols.length < 5) continue;
    const pnl = parseFloat(cols[4]?.replace(/[$,]/g, '') || '0');
    if (pnl === 0) continue;
    trades.push({
      symbol: 'DAILY', qty: 0, buyPrice: 0, sellPrice: 0, pnl,
      boughtTimestamp: cols[2] || '', soldTimestamp: cols[2] || '',
      duration: 'daily', account: cols[1] || fileName.replace(/\.(csv|txt)$/i, ''), date: cols[2] || '',
    });
  }
  return trades;
}

// ─── Stats ───
function calcStats(trades: Trade[], name: string): AccountData {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
  const gp = wins.reduce((s, t) => s + t.pnl, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const totalContracts = trades.reduce((s, t) => s + t.qty, 0);

  const dMap = new Map<string, DaySummary>();
  trades.forEach(t => {
    const ex = dMap.get(t.date);
    if (ex) {
      ex.trades++; ex.pnl += t.pnl; ex.wins += t.pnl > 0 ? 1 : 0; ex.losses += t.pnl < 0 ? 1 : 0;
      ex.contracts += t.qty; if (!ex.symbols.includes(t.symbol)) ex.symbols.push(t.symbol);
    } else {
      dMap.set(t.date, { date: t.date, trades: 1, pnl: t.pnl, wins: t.pnl > 0 ? 1 : 0, losses: t.pnl < 0 ? 1 : 0, contracts: t.qty, symbols: [t.symbol] });
    }
  });

  const daily = [...dMap.values()].sort((a, b) => a.date.localeCompare(b.date));
  const greenDays = daily.filter(d => d.pnl > 0).length;
  const redDays = daily.filter(d => d.pnl < 0).length;

  return {
    name, trades, totalPnl, totalTrades: trades.length, wins: wins.length, losses: losses.length,
    winRate: trades.length ? (wins.length / trades.length) * 100 : 0, avgWin, avgLoss,
    profitFactor: gl > 0 ? gp / gl : gp > 0 ? Infinity : 0,
    bestTrade: wins.length ? Math.max(...wins.map(t => t.pnl)) : 0,
    worstTrade: losses.length ? Math.min(...losses.map(t => t.pnl)) : 0,
    bestDay: daily.length ? Math.max(...daily.map(d => d.pnl)) : 0,
    worstDay: daily.length ? Math.min(...daily.map(d => d.pnl)) : 0,
    avgDailyPnl: daily.length ? totalPnl / daily.length : 0,
    totalContracts, tradingDays: daily.length, greenDays, redDays,
    symbols: [...new Set(trades.map(t => t.symbol))], dailySummaries: daily,
  };
}

// ─── Helpers ───
function fmt(n: number) {
  const f = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${f}` : `$${f}`;
}
function pct(n: number) { return `${n.toFixed(1)}%`; }
function pc(n: number) { return n > 0 ? C.green : n < 0 ? C.red : C.silver; }
function shortAcct(n: string) { return n.length > 12 ? n.slice(0, 6) + '…' + n.slice(-3) : n; }
function fmtDate(d: string) {
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return d; }
}

type ViewTab = 'overview' | 'trades' | 'daily';

// ─── Supabase helpers ───
interface DbAccount { account_key: string; display_name: string; }
interface DbTrade {
  account_key: string; symbol: string; qty: number;
  buy_price: number; sell_price: number; pnl: number;
  bought_timestamp: string; sold_timestamp: string;
  duration: string; trade_date: string;
  buy_fill_id: string; sell_fill_id: string;
}

// Derive a stable account key from the buyFillId prefix (first 9 digits)
function deriveAccountKey(trades: Trade[]): string {
  for (const t of trades) {
    if (t.boughtTimestamp) {
      // Find the buyFillId from the raw CSV parsing — we stored it implicitly
      // Use the first 9 chars of the buyFillId field
      // Since we don't store it on the Trade object directly, derive from pattern
    }
  }
  // Fallback: hash of first trade's buy timestamp + symbol
  const first = trades[0];
  return `acct_${first.boughtTimestamp.replace(/[^0-9]/g, '').slice(0, 12)}`;
}

// Extended trade type with fill IDs for persistence
interface TradeWithIds extends Trade {
  buyFillId: string;
  sellFillId: string;
}

// Extended parser that also returns fill IDs
function parseApexTradeCSVWithIds(text: string, fileName: string): TradeWithIds[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const idx = {
    symbol: headers.indexOf('symbol'),
    qty: headers.indexOf('qty'),
    buyPrice: headers.findIndex(h => h === 'buyprice'),
    sellPrice: headers.findIndex(h => h === 'sellprice'),
    pnl: headers.indexOf('pnl'),
    bought: headers.findIndex(h => h === 'boughttimestamp'),
    sold: headers.findIndex(h => h === 'soldtimestamp'),
    duration: headers.indexOf('duration'),
    buyFillId: headers.findIndex(h => h === 'buyfillid'),
    sellFillId: headers.findIndex(h => h === 'sellfillid'),
  };
  if (idx.pnl < 0) return [];

  const accountName = fileName.replace(/\.(csv|txt)$/i, '').replace(/^file_\d+---[a-f0-9-]+$/i, '') || 'Account';
  const trades: TradeWithIds[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols: string[] = [];
    let cur = '', inQ = false;
    for (const c of line) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
    cols.push(cur.trim());

    const get = (i: number) => i >= 0 && i < cols.length ? cols[i] : '';
    const parsePnl = (raw: string) => {
      const s = raw.replace(/[$,]/g, '');
      return s.startsWith('(') && s.endsWith(')') ? -parseFloat(s.slice(1, -1)) : parseFloat(s) || 0;
    };

    const rawTs = get(idx.sold) || get(idx.bought);
    let date = '';
    const m = rawTs.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) date = `${m[3]}-${m[1]}-${m[2]}`;

    const buyFillId = get(idx.buyFillId);
    const sellFillId = get(idx.sellFillId);

    trades.push({
      symbol: get(idx.symbol) || 'N/A', qty: parseInt(get(idx.qty)) || 1,
      buyPrice: parseFloat(get(idx.buyPrice)) || 0, sellPrice: parseFloat(get(idx.sellPrice)) || 0,
      pnl: parsePnl(get(idx.pnl)), boughtTimestamp: get(idx.bought), soldTimestamp: get(idx.sold),
      duration: get(idx.duration) || '', account: accountName, date,
      buyFillId, sellFillId,
    });
  }
  return trades;
}

// Derive account key from fill IDs (first 9 digits of buyFillId = unique per account)
function getAccountKeyFromFills(trades: TradeWithIds[]): string {
  const first = trades.find(t => t.buyFillId);
  if (first?.buyFillId) {
    return first.buyFillId.slice(0, 9);
  }
  // Fallback
  return `manual_${Date.now()}`;
}

// ─── Component ───
export default function ApexPage() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<ViewTab>('overview');
  const [tSort, setTSort] = useState({ col: 'time', dir: 'desc' as 'asc' | 'desc' });
  const [dSort, setDSort] = useState({ col: 'date', dir: 'desc' as 'asc' | 'desc' });
  const [symFilter, setSymFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [accountKeyMap, setAccountKeyMap] = useState<Map<string, string>>(new Map()); // key → display_name
  const [namingModal, setNamingModal] = useState<{ key: string; trades: TradeWithIds[] } | null>(null);
  const [nameInput, setNameInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  // ─── Load from Supabase on mount ───
  useEffect(() => {
    async function loadFromDb() {
      try {
        // Load registered accounts
        const acctRes = await fetch('/api/apex/accounts');
        const acctData = await acctRes.json();
        if (acctData.accounts) {
          const map = new Map<string, string>();
          acctData.accounts.forEach((a: DbAccount) => map.set(a.account_key, a.display_name));
          setAccountKeyMap(map);
        }

        // Load all trades
        const tradeRes = await fetch('/api/apex/trades');
        const tradeData = await tradeRes.json();
        if (tradeData.trades && tradeData.trades.length > 0) {
          // Group trades by account_key and build AccountData
          const byKey = new Map<string, Trade[]>();
          tradeData.trades.forEach((t: DbTrade) => {
            const key = t.account_key;
            if (!byKey.has(key)) byKey.set(key, []);
            byKey.get(key)!.push({
              symbol: t.symbol, qty: t.qty,
              buyPrice: t.buy_price, sellPrice: t.sell_price,
              pnl: Number(t.pnl),
              boughtTimestamp: t.bought_timestamp, soldTimestamp: t.sold_timestamp,
              duration: t.duration,
              account: acctData.accounts?.find((a: DbAccount) => a.account_key === key)?.display_name || key,
              date: t.trade_date,
            });
          });

          const loadedAccounts: AccountData[] = [];
          byKey.forEach((trades, key) => {
            const name = acctData.accounts?.find((a: DbAccount) => a.account_key === key)?.display_name || key;
            trades.forEach(t => t.account = name);
            loadedAccounts.push(calcStats(trades, name));
          });

          setAccounts(loadedAccounts);
          setSelected(new Set(loadedAccounts.map(a => a.name)));
        }
        setDbStatus('ok');
      } catch (err) {
        console.error('Failed to load from DB:', err);
        setDbStatus('error');
      } finally {
        setLoading(false);
      }
    }
    loadFromDb();
  }, []);

  // ─── Save trades to Supabase ───
  async function saveToDb(accountKey: string, displayName: string, trades: TradeWithIds[]) {
    setSaving(true);
    try {
      // Register/update account
      await fetch('/api/apex/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_key: accountKey, display_name: displayName }),
      });

      // Upsert trades in batches of 500
      const dbTrades = trades.map(t => ({
        symbol: t.symbol, qty: t.qty,
        buy_price: t.buyPrice, sell_price: t.sellPrice,
        pnl: t.pnl,
        bought_timestamp: t.boughtTimestamp, sold_timestamp: t.soldTimestamp,
        duration: t.duration,
        trade_date: t.date,
        buy_fill_id: t.buyFillId, sell_fill_id: t.sellFillId,
      }));

      for (let i = 0; i < dbTrades.length; i += 500) {
        const batch = dbTrades.slice(i, i + 500);
        await fetch('/api/apex/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_key: accountKey, trades: batch }),
        });
      }

      // Update local key map
      setAccountKeyMap(prev => new Map([...prev, [accountKey, displayName]]));
      setDbStatus('ok');
    } catch (err) {
      console.error('Failed to save to DB:', err);
      setDbStatus('error');
    } finally {
      setSaving(false);
    }
  }

  // ─── Import handler with naming + persistence ───
  const onUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const text = await files[i].text();

      // Try daily format first
      const dailyTrades = parseApexDailyCSV(text, files[i].name);
      if (dailyTrades && dailyTrades.length > 0) {
        // Daily format — no fill IDs, handle separately
        const byAcct = new Map<string, Trade[]>();
        dailyTrades.forEach(t => { if (!byAcct.has(t.account)) byAcct.set(t.account, []); byAcct.get(t.account)!.push(t); });
        byAcct.forEach((at, name) => {
          at.forEach(t => t.account = name);
          const stats = calcStats(at, name);
          setAccounts(prev => {
            const idx = prev.findIndex(a => a.name === name);
            if (idx >= 0) { const u = [...prev]; u[idx] = stats; return u; }
            return [...prev, stats];
          });
          setSelected(prev => new Set([...prev, name]));
        });
        continue;
      }

      // Parse trade-level CSV with fill IDs
      const tradesWithIds = parseApexTradeCSVWithIds(text, files[i].name);
      if (!tradesWithIds.length) continue;

      const accountKey = getAccountKeyFromFills(tradesWithIds);

      // Check if this account is already named
      const existingName = accountKeyMap.get(accountKey);
      if (existingName) {
        // Account already registered — just save new trades
        tradesWithIds.forEach(t => t.account = existingName);
        const stats = calcStats(tradesWithIds, existingName);
        setAccounts(prev => {
          const idx = prev.findIndex(a => a.name === existingName);
          if (idx >= 0) {
            // Merge trades
            const merged = [...prev[idx].trades, ...tradesWithIds.filter(newT =>
              !prev[idx].trades.some(oldT =>
                oldT.boughtTimestamp === newT.boughtTimestamp && oldT.soldTimestamp === newT.soldTimestamp && oldT.pnl === newT.pnl
              )
            )];
            const u = [...prev];
            u[idx] = calcStats(merged, existingName);
            return u;
          }
          return [...prev, stats];
        });
        setSelected(prev => new Set([...prev, existingName]));

        // Save to DB
        saveToDb(accountKey, existingName, tradesWithIds);
      } else {
        // New account — prompt for name
        setNamingModal({ key: accountKey, trades: tradesWithIds });
        setNameInput('');
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }, [accountKeyMap]);

  // ─── Handle naming confirmation ───
  const confirmAccountName = useCallback(() => {
    if (!namingModal || !nameInput.trim()) return;
    const { key, trades } = namingModal;
    const name = nameInput.trim();

    trades.forEach(t => t.account = name);
    const stats = calcStats(trades, name);

    setAccounts(prev => {
      const idx = prev.findIndex(a => a.name === name);
      if (idx >= 0) { const u = [...prev]; u[idx] = stats; return u; }
      return [...prev, stats];
    });
    setSelected(prev => new Set([...prev, name]));

    // Save to DB
    saveToDb(key, name, trades);

    setNamingModal(null);
    setNameInput('');
  }, [namingModal, nameInput]);

  const toggle = (n: string) => setSelected(prev => { const s = new Set(prev); if (s.has(n)) s.delete(n); else s.add(n); return s; });
  const remove = (n: string) => { setAccounts(p => p.filter(a => a.name !== n)); setSelected(p => { const s = new Set(p); s.delete(n); return s; }); };

  const combined = useMemo(() => {
    const sel = accounts.filter(a => selected.has(a.name));
    if (!sel.length) return null;
    return calcStats(sel.flatMap(a => a.trades), 'Combined');
  }, [accounts, selected]);

  const filteredTrades = useMemo(() => {
    if (!combined) return [];
    let t = [...combined.trades];
    if (symFilter) t = t.filter(x => x.symbol.toLowerCase().includes(symFilter.toLowerCase()));
    t.sort((a, b) => {
      const d = tSort.dir === 'asc' ? 1 : -1;
      if (tSort.col === 'time') return d * (a.soldTimestamp || a.boughtTimestamp).localeCompare(b.soldTimestamp || b.boughtTimestamp);
      if (tSort.col === 'pnl') return d * (a.pnl - b.pnl);
      if (tSort.col === 'qty') return d * (a.qty - b.qty);
      if (tSort.col === 'symbol') return d * a.symbol.localeCompare(b.symbol);
      return 0;
    });
    return t;
  }, [combined, symFilter, tSort]);

  const sortedDaily = useMemo(() => {
    if (!combined) return [];
    const ds = [...combined.dailySummaries];
    const d = dSort.dir === 'asc' ? 1 : -1;
    return ds.sort((a, b) => {
      if (dSort.col === 'date') return d * a.date.localeCompare(b.date);
      if (dSort.col === 'pnl') return d * (a.pnl - b.pnl);
      if (dSort.col === 'trades') return d * (a.trades - b.trades);
      return 0;
    });
  }, [combined, dSort]);

  const cumData = useMemo(() => {
    if (!combined) return [];
    let c = 0;
    return combined.dailySummaries.map(d => { c += d.pnl; return { ...d, cum: c }; });
  }, [combined]);

  const handleTSort = (col: string) => setTSort(p => ({ col, dir: p.col === col && p.dir === 'desc' ? 'asc' : 'desc' }));
  const handleDSort = (col: string) => setDSort(p => ({ col, dir: p.col === col && p.dir === 'desc' ? 'asc' : 'desc' }));

  // ─── Render ───
  const isUp = combined && combined.totalPnl >= 0;
  const accent = isUp ? C.green : C.red;
  const accentGlow = isUp ? C.greenGlow : C.redGlow;
  const accentGhost = isUp ? C.greenGhost : C.redGhost;

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: 1440, margin: '0 auto', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: C.amber, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontFamily: M, fontSize: '0.7rem', color: C.smoke, marginTop: 12 }}>Loading trades...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1440, margin: '0 auto', minHeight: '100vh' }}>
      {/* ─── NAMING MODAL ─── */}
      {namingModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: C.carbon, border: `1px solid ${C.borderActive}`,
            borderRadius: 16, padding: '32px', width: 400, maxWidth: '90vw',
          }}>
            <div style={{ fontFamily: S, fontSize: '1.1rem', color: C.white, fontWeight: 700, marginBottom: 8 }}>
              Name This Account
            </div>
            <div style={{ fontFamily: M, fontSize: '0.65rem', color: C.smoke, marginBottom: 4 }}>
              Account key: <span style={{ color: C.amber }}>{namingModal.key}</span>
            </div>
            <div style={{ fontFamily: M, fontSize: '0.6rem', color: C.dim, marginBottom: 20 }}>
              {namingModal.trades.length} trades found. Give this account a name you&apos;ll recognize
              (e.g. &quot;APEX...018&quot; or &quot;Account 1&quot;).
            </div>
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmAccountName()}
              placeholder="e.g. APEX3377030000018"
              style={{
                width: '100%', padding: '10px 14px',
                background: C.slab, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.white, fontFamily: M, fontSize: '0.8rem',
                outline: 'none', marginBottom: 16, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setNamingModal(null)} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 16px', color: C.smoke,
                fontFamily: M, fontSize: '0.7rem', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={confirmAccountName} disabled={!nameInput.trim()} style={{
                background: nameInput.trim() ? C.amber : C.slab,
                border: 'none', borderRadius: 8, padding: '8px 20px',
                color: nameInput.trim() ? C.void : C.dim,
                fontFamily: M, fontSize: '0.7rem', fontWeight: 700, cursor: nameInput.trim() ? 'pointer' : 'default',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={13} /> Save
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.amberGhost} 0%, transparent 100%)`,
            border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart3 size={20} style={{ color: C.amber }} />
          </div>
          <div>
            <h1 style={{ color: C.white, fontSize: '1.25rem', fontFamily: S, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Apex Trader
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ color: C.dim, fontFamily: M, fontSize: '0.6rem', margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {accounts.length} account{accounts.length !== 1 ? 's' : ''}{combined ? ` · ${combined.totalTrades} fills` : ''}
              </p>
              {/* DB status indicator */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: M, fontSize: '0.5rem', color: dbStatus === 'ok' ? C.green : dbStatus === 'error' ? C.red : C.amber,
              }}>
                <Database size={9} />
                {saving ? 'SAVING...' : dbStatus === 'ok' ? 'SYNCED' : dbStatus === 'error' ? 'OFFLINE' : '...'}
              </span>
            </div>
          </div>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".csv,.txt" multiple onChange={onUpload} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{
            background: C.amber, color: C.void, border: 'none', borderRadius: 8,
            padding: '9px 18px', fontFamily: M, fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Upload size={14} /> IMPORT
          </button>
        </div>
      </div>

      {/* ─── EMPTY STATE ─── */}
      {accounts.length === 0 && (
        <div style={{
          background: C.carbon, border: `1px dashed ${C.borderActive}`,
          borderRadius: 16, padding: '5rem 2rem', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${C.amberGhost}, transparent 70%)`, pointerEvents: 'none' }} />
          <FileSpreadsheet size={44} style={{ color: C.amber, marginBottom: 20, position: 'relative' }} />
          <div style={{ color: C.white, fontSize: '1.15rem', fontFamily: S, fontWeight: 600, marginBottom: 6, position: 'relative' }}>
            Drop your Apex CSVs
          </div>
          <div style={{ color: C.smoke, fontFamily: M, fontSize: '0.72rem', marginBottom: 28, maxWidth: 440, margin: '0 auto 28px', position: 'relative', lineHeight: 1.7 }}>
            One file per account. Import all five at once to see your combined P&L across every funded account.
          </div>
          <button onClick={() => fileRef.current?.click()} style={{
            background: C.amber, color: C.void, border: 'none', borderRadius: 10,
            padding: '12px 32px', fontFamily: M, fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto', position: 'relative',
          }}>
            <Upload size={16} /> Choose Files
          </button>
        </div>
      )}

      {accounts.length > 0 && combined && (
        <>
          {/* ─── ACCOUNT PILLS ─── */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setSelected(new Set(accounts.map(a => a.name)))} style={{
              background: selected.size === accounts.length ? C.amberGhost : 'transparent',
              border: `1px solid ${selected.size === accounts.length ? C.amber : C.border}`,
              borderRadius: 20, padding: '5px 14px',
              color: selected.size === accounts.length ? C.amber : C.smoke,
              fontFamily: M, fontSize: '0.62rem', cursor: 'pointer', fontWeight: 600,
            }}>ALL</button>
            {accounts.map(a => (
              <button key={a.name} onClick={() => toggle(a.name)} style={{
                background: selected.has(a.name) ? C.amberGhost : C.slab,
                border: `1px solid ${selected.has(a.name) ? C.borderActive : C.border}`,
                borderRadius: 20, padding: '5px 14px',
                color: selected.has(a.name) ? C.white : C.silver,
                fontFamily: M, fontSize: '0.62rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc(a.totalPnl) }} />
                {shortAcct(a.name)}
                <span style={{ color: pc(a.totalPnl), fontWeight: 600 }}>{a.totalPnl >= 0 ? '+' : ''}{fmt(a.totalPnl)}</span>
                <X size={9} style={{ color: C.dim, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); remove(a.name); }} />
              </button>
            ))}
          </div>

          {/* ─── HERO P&L ─── */}
          <div style={{
            background: C.carbon, borderRadius: 16, padding: '40px 32px 32px',
            marginBottom: 16, position: 'relative', overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}>
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
              width: 600, height: 300, borderRadius: '50%',
              background: `radial-gradient(ellipse, ${accentGlow} 0%, transparent 70%)`,
              pointerEvents: 'none', filter: 'blur(40px)',
            }} />
            {/* Grid lines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />

            <div style={{ position: 'relative', textAlign: 'center' }}>
              {/* Label */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: accentGhost, borderRadius: 20, padding: '4px 14px',
                marginBottom: 16,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent }} />
                <span style={{ fontFamily: M, fontSize: '0.58rem', color: accent, fontWeight: 600, letterSpacing: '0.12em' }}>
                  {selected.size === accounts.length ? 'ALL ACCOUNTS' : `${selected.size} OF ${accounts.length}`} · COMBINED P&L
                </span>
              </div>

              {/* The Number */}
              <div style={{
                color: accent,
                fontFamily: S, fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800,
                lineHeight: 0.95, marginBottom: 24, letterSpacing: '-0.02em',
                textShadow: `0 0 60px ${accentGlow}`,
              }}>
                {combined.totalPnl >= 0 ? '+' : ''}{fmt(combined.totalPnl)}
              </div>

              {/* Metric Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: 0, maxWidth: 700, margin: '0 auto',
                background: C.slab, borderRadius: 12, overflow: 'hidden',
                border: `1px solid ${C.border}`,
              }}>
                {[
                  { label: 'TRADES', value: `${combined.totalTrades}`, color: C.white },
                  { label: 'WIN RATE', value: pct(combined.winRate), color: combined.winRate >= 50 ? C.green : C.red },
                  { label: 'PF', value: combined.profitFactor === Infinity ? '∞' : combined.profitFactor.toFixed(2), color: combined.profitFactor >= 1 ? C.green : C.red },
                  { label: 'GREEN', value: `${combined.greenDays}d`, color: C.green },
                  { label: 'RED', value: `${combined.redDays}d`, color: C.red },
                  { label: 'AVG WIN', value: fmt(combined.avgWin), color: C.green },
                  { label: 'AVG LOSS', value: fmt(combined.avgLoss), color: C.red },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '14px 0', textAlign: 'center',
                    borderRight: i < 6 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{ fontFamily: M, fontSize: '0.48rem', color: C.dim, letterSpacing: '0.12em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: M, fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── TAB BAR ─── */}
          <div style={{
            display: 'inline-flex', gap: 2,
            background: C.slab, borderRadius: 10, padding: 3,
            marginBottom: 16, border: `1px solid ${C.border}`,
          }}>
            {[
              { key: 'overview' as ViewTab, label: 'Overview', icon: <LineChart size={13} /> },
              { key: 'trades' as ViewTab, label: 'Fills', icon: <List size={13} /> },
              { key: 'daily' as ViewTab, label: 'Calendar', icon: <Calendar size={13} /> },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: tab === t.key ? C.surface : 'transparent',
                border: tab === t.key ? `1px solid ${C.borderActive}` : '1px solid transparent',
                borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
                color: tab === t.key ? C.white : C.smoke,
                fontFamily: M, fontSize: '0.65rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.12s ease',
              }}>
                <span style={{ color: tab === t.key ? C.amber : C.dim }}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
          {tab === 'overview' && (
            <>
              {/* Top Stats — compact horizontal strip */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 8, marginBottom: 16,
              }}>
                {[
                  { icon: <ArrowUpRight size={14} />, label: 'Best Trade', value: `+${fmt(combined.bestTrade)}`, color: C.green },
                  { icon: <ArrowDownRight size={14} />, label: 'Worst Trade', value: fmt(combined.worstTrade), color: C.red },
                  { icon: <TrendingUp size={14} />, label: 'Best Day', value: `+${fmt(combined.bestDay)}`, color: C.green },
                  { icon: <TrendingDown size={14} />, label: 'Worst Day', value: fmt(combined.worstDay), color: combined.worstDay < 0 ? C.red : C.silver },
                  { icon: <Timer size={14} />, label: 'Avg/Day', value: `${combined.avgDailyPnl >= 0 ? '+' : ''}${fmt(combined.avgDailyPnl)}`, color: pc(combined.avgDailyPnl) },
                  { icon: <Wallet size={14} />, label: 'Contracts', value: combined.totalContracts.toLocaleString(), color: C.amber },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: C.carbon, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: s.color === C.green ? C.greenGhost : s.color === C.red ? C.redGhost : C.amberGhost,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.color, flexShrink: 0,
                    }}>{s.icon}</div>
                    <div>
                      <div style={{ fontFamily: M, fontSize: '0.5rem', color: C.dim, letterSpacing: '0.1em' }}>{s.label.toUpperCase()}</div>
                      <div style={{ fontFamily: M, fontSize: '0.88rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Equity Curve + Daily Bars side-by-side on wide screens */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 12, marginBottom: 16 }}>
                {/* Equity Curve */}
                <div style={{
                  background: C.carbon, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LineChart size={13} style={{ color: C.amber }} />
                      <span style={{ fontFamily: M, fontSize: '0.6rem', color: C.smoke, letterSpacing: '0.1em' }}>EQUITY CURVE</span>
                    </div>
                    <span style={{ fontFamily: M, fontSize: '0.55rem', color: C.dim }}>
                      {cumData.length > 0 && `${fmtDate(cumData[0].date)} – ${fmtDate(cumData[cumData.length - 1].date)}`}
                    </span>
                  </div>
                  <div style={{ height: 200 }}>
                    {cumData.length > 1 && (
                      <svg viewBox="0 0 1000 200" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={accent} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const vals = cumData.map(d => d.cum);
                          const mx = Math.max(...vals, 0), mn = Math.min(...vals, 0);
                          const rng = mx - mn || 1;
                          const pad = 10, h = 200 - pad * 2;
                          const step = 1000 / (cumData.length - 1 || 1);
                          const zy = pad + ((mx - 0) / rng) * h;

                          const pts = cumData.map((d, i) => ({ x: i * step, y: pad + ((mx - d.cum) / rng) * h }));
                          const poly = pts.map(p => `${p.x},${p.y}`).join(' ');

                          return (
                            <>
                              {/* Grid */}
                              {[0, 1, 2, 3, 4].map(i => {
                                const y = pad + (i / 4) * h;
                                return <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.03)" />;
                              })}
                              <line x1="0" y1={zy} x2="1000" y2={zy} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />

                              {/* Area fill */}
                              <polygon points={`0,${zy} ${poly} 1000,${zy}`} fill="url(#eqFill)" />

                              {/* Line */}
                              <polyline points={poly} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" />

                              {/* End pulse */}
                              <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="12" fill={accent} opacity="0.08" />
                              <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill={accent} opacity="0.3" />
                              <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={accent} />
                            </>
                          );
                        })()}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Daily P&L Bars */}
                <div style={{
                  background: C.carbon, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '18px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <BarChart3 size={13} style={{ color: C.amber }} />
                    <span style={{ fontFamily: M, fontSize: '0.6rem', color: C.smoke, letterSpacing: '0.1em' }}>DAILY P&L</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 130 }}>
                    {combined.dailySummaries.map((d, i) => {
                      const mx = Math.max(...combined.dailySummaries.map(x => Math.abs(x.pnl)), 1);
                      const hp = (Math.abs(d.pnl) / mx) * 100;
                      const up = d.pnl >= 0;
                      return (
                        <div key={i} style={{
                          flex: '1 1 0', maxWidth: 50, minWidth: 14,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
                          height: '100%', justifyContent: 'flex-end',
                        }}>
                          <div style={{
                            width: '100%',
                            height: `${Math.max(hp, 6)}%`,
                            background: up
                              ? `linear-gradient(180deg, ${C.green} 0%, rgba(16,185,129,0.3) 100%)`
                              : `linear-gradient(180deg, ${C.red} 0%, rgba(239,68,68,0.3) 100%)`,
                            borderRadius: '4px 4px 1px 1px',
                            opacity: 0.85,
                            transition: 'opacity 0.15s',
                            cursor: 'default',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Dollar amounts under each bar */}
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {combined.dailySummaries.map((d, i) => (
                      <div key={i} style={{
                        flex: '1 1 0', maxWidth: 50, minWidth: 14,
                        textAlign: 'center',
                        fontFamily: M, fontSize: '0.48rem', fontWeight: 600,
                        color: pc(d.pnl), lineHeight: 1.2,
                      }}>
                        {d.pnl < 0 ? '-' : '+'}{Math.abs(d.pnl) >= 1000 ? `$${(Math.abs(d.pnl) / 1000).toFixed(1)}k` : `$${Math.abs(d.pnl).toFixed(0)}`}
                      </div>
                    ))}
                  </div>
                  {/* Date labels under amounts */}
                  <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                    {combined.dailySummaries.map((d, i) => (
                      <div key={i} style={{
                        flex: '1 1 0', maxWidth: 50, minWidth: 14,
                        textAlign: 'center',
                        fontFamily: M, fontSize: '0.42rem',
                        color: C.dim, lineHeight: 1.2,
                      }}>
                        {fmtDate(d.date)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Per-Account Cards */}
              {accounts.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
                  {accounts.filter(a => selected.has(a.name)).map(a => {
                    const up = a.totalPnl >= 0;
                    return (
                      <div key={a.name} style={{
                        background: C.carbon, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden',
                      }}>
                        {/* Top accent bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: up ? C.green : C.red, opacity: 0.5 }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontFamily: M, fontSize: '0.72rem', color: C.white, fontWeight: 600 }}>{shortAcct(a.name)}</div>
                            <div style={{ fontFamily: M, fontSize: '0.5rem', color: C.dim, marginTop: 2 }}>{a.totalTrades} fills · {a.tradingDays} days</div>
                          </div>
                          <div style={{ fontFamily: M, fontSize: '1.05rem', fontWeight: 800, color: pc(a.totalPnl) }}>
                            {a.totalPnl >= 0 ? '+' : ''}{fmt(a.totalPnl)}
                          </div>
                        </div>

                        {/* Sparkline */}
                        <div style={{ height: 32, marginBottom: 10, opacity: 0.7 }}>
                          <svg viewBox="0 0 200 32" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                            {(() => {
                              if (a.dailySummaries.length < 2) return null;
                              let c = 0;
                              const data = a.dailySummaries.map(d => { c += d.pnl; return c; });
                              const mx = Math.max(...data, 0), mn = Math.min(...data, 0), rng = mx - mn || 1;
                              const step = 200 / (data.length - 1);
                              const pts = data.map((v, i) => `${i * step},${30 - ((v - mn) / rng) * 26 - 2}`).join(' ');
                              return (
                                <>
                                  <defs>
                                    <linearGradient id={`sp-${a.name}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={c >= 0 ? C.green : C.red} stopOpacity="0.15" />
                                      <stop offset="100%" stopColor={c >= 0 ? C.green : C.red} stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  <polygon points={`0,32 ${pts} 200,32`} fill={`url(#sp-${a.name})`} />
                                  <polyline points={pts} fill="none" stroke={c >= 0 ? C.green : C.red} strokeWidth="1.5" />
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                          {[
                            { l: 'Win%', v: pct(a.winRate), c: a.winRate >= 50 ? C.green : C.red },
                            { l: 'PF', v: a.profitFactor === Infinity ? '∞' : a.profitFactor.toFixed(2), c: a.profitFactor >= 1 ? C.green : C.red },
                            { l: 'Green', v: `${a.greenDays}/${a.tradingDays}`, c: C.green },
                          ].map((s, i) => (
                            <div key={i} style={{
                              background: C.slab, borderRadius: 6, padding: '6px 8px', textAlign: 'center',
                            }}>
                              <div style={{ fontFamily: M, fontSize: '0.45rem', color: C.dim, letterSpacing: '0.08em' }}>{s.l}</div>
                              <div style={{ fontFamily: M, fontSize: '0.72rem', fontWeight: 700, color: s.c }}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ═══════════════ FILLS TAB ═══════════════ */}
          {tab === 'trades' && (
            <div style={{ background: C.carbon, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={13} style={{ color: C.amber }} />
                  <span style={{ color: C.white, fontFamily: M, fontSize: '0.68rem', fontWeight: 700 }}>{filteredTrades.length} fills</span>
                </div>
                <input placeholder="symbol..." value={symFilter} onChange={e => setSymFilter(e.target.value)} style={{
                  background: C.slab, border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: '5px 10px', color: C.white, fontFamily: M, fontSize: '0.65rem', width: 100, outline: 'none',
                }} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: M, fontSize: '0.65rem' }}>
                  <thead>
                    <tr>
                      {[
                        { key: 'time', label: 'TIME', align: 'left' as const },
                        { key: 'symbol', label: 'SYM', align: 'left' as const },
                        { key: 'qty', label: 'QTY', align: 'right' as const },
                        { key: 'pnl', label: 'P&L', align: 'right' as const },
                        ...(selected.size > 1 ? [{ key: 'acct', label: 'ACCT', align: 'right' as const }] : []),
                        { key: 'dur', label: 'DUR', align: 'right' as const },
                      ].map(col => (
                        <th key={col.key} onClick={() => handleTSort(col.key)} style={{
                          padding: '9px 12px', textAlign: col.align, cursor: 'pointer', userSelect: 'none',
                          color: tSort.col === col.key ? C.amber : C.dim,
                          fontSize: '0.55rem', letterSpacing: '0.1em', fontWeight: 600,
                          borderBottom: `1px solid ${C.border}`,
                          background: C.slab,
                        }}>
                          {col.label} {tSort.col === col.key && (tSort.dir === 'asc' ? '↑' : '↓')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.slice(0, 250).map((t, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.02)` }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.slab; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '7px 12px', color: C.silver, fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                          {t.soldTimestamp || t.boughtTimestamp}
                        </td>
                        <td style={{ padding: '7px 12px', color: C.white, fontWeight: 600 }}>{t.symbol}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', color: C.silver }}>{t.qty}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: pc(t.pnl) }}>
                          {t.pnl >= 0 ? '+' : ''}{fmt(t.pnl)}
                        </td>
                        {selected.size > 1 && (
                          <td style={{ padding: '7px 12px', textAlign: 'right', color: C.dim, fontSize: '0.55rem' }}>{shortAcct(t.account)}</td>
                        )}
                        <td style={{ padding: '7px 12px', textAlign: 'right', color: C.dim, fontSize: '0.58rem' }}>{t.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTrades.length > 250 && (
                  <div style={{ padding: 10, textAlign: 'center', color: C.dim, fontFamily: M, fontSize: '0.65rem' }}>
                    250 of {filteredTrades.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ CALENDAR TAB ═══════════════ */}
          {tab === 'daily' && (
            <div style={{ background: C.carbon, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Calendar size={13} style={{ color: C.amber }} />
                <span style={{ color: C.white, fontFamily: M, fontSize: '0.68rem', fontWeight: 700 }}>{sortedDaily.length} trading days</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: M, fontSize: '0.65rem' }}>
                  <thead>
                    <tr>
                      {[
                        { key: 'date', label: 'DATE', align: 'left' as const },
                        { key: 'pnl', label: 'P&L', align: 'right' as const },
                        { key: 'trades', label: 'FILLS', align: 'right' as const },
                        { key: 'wl', label: 'W/L', align: 'right' as const },
                        { key: 'contracts', label: 'QTY', align: 'right' as const },
                        { key: 'symbols', label: 'SYMBOLS', align: 'right' as const },
                      ].map(col => (
                        <th key={col.key} onClick={() => handleDSort(col.key)} style={{
                          padding: '9px 16px', textAlign: col.align, cursor: 'pointer', userSelect: 'none',
                          color: dSort.col === col.key ? C.amber : C.dim,
                          fontSize: '0.55rem', letterSpacing: '0.1em', fontWeight: 600,
                          borderBottom: `1px solid ${C.border}`, background: C.slab,
                        }}>
                          {col.label} {dSort.col === col.key && (dSort.dir === 'asc' ? '↑' : '↓')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDaily.map((d, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.02)` }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.slab; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '9px 16px', color: C.silver }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              width: 3, height: 16, borderRadius: 2,
                              background: d.pnl > 0 ? C.green : d.pnl < 0 ? C.red : C.dim,
                            }} />
                            {fmtDate(d.date)}
                          </span>
                        </td>
                        <td style={{ padding: '9px 16px', textAlign: 'right', fontWeight: 700, color: pc(d.pnl), fontSize: '0.72rem' }}>
                          {d.pnl >= 0 ? '+' : ''}{fmt(d.pnl)}
                        </td>
                        <td style={{ padding: '9px 16px', textAlign: 'right', color: C.white }}>{d.trades}</td>
                        <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                          <span style={{ color: C.green, fontWeight: 600 }}>{d.wins}</span>
                          <span style={{ color: C.dim }}>/</span>
                          <span style={{ color: C.red, fontWeight: 600 }}>{d.losses}</span>
                        </td>
                        <td style={{ padding: '9px 16px', textAlign: 'right', color: C.silver }}>{d.contracts}</td>
                        <td style={{ padding: '9px 16px', textAlign: 'right', color: C.dim, fontSize: '0.58rem' }}>{d.symbols.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
