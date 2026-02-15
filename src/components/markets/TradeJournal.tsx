'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { brand } from '@/lib/brand';
import { supabase } from '@/lib/supabase';

interface Trade {
  id: string;
  date: string;
  ticker: string;
  direction: string;
  entry: number;
  exit: number | null;
  quantity: number;
  pnl: number | null;
  pnl_percent: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
}

interface JournalStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

type Period = 'today' | 'week' | 'month' | 'all';
type SortKey = 'date' | 'ticker' | 'pnl';

const M = "'JetBrains Mono','Fira Code',monospace";
const fp = (v: number) => v >= 0 ? `+$${v.toFixed(2)}` : `-$${Math.abs(v).toFixed(2)}`;

const emptyForm = { ticker: '', direction: 'LONG', entry: '', exit: '', quantity: '1', notes: '', tags: '' };

export default function TradeJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('trade_journal')
        .select('*')
        .order('date', { ascending: false });
      setTrades((data || []) as Trade[]);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  // Filter by period
  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter(t => {
      if (period === 'all') return true;
      const d = new Date(t.date);
      if (period === 'today') return d.toDateString() === now.toDateString();
      if (period === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [trades, period]);

  // Sort
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'ticker') cmp = a.ticker.localeCompare(b.ticker);
      else if (sortKey === 'pnl') cmp = (a.pnl || 0) - (b.pnl || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredTrades, sortKey, sortDir]);

  // Stats
  const stats: JournalStats = useMemo(() => {
    const closed = filteredTrades.filter(t => t.pnl != null);
    const wins = closed.filter(t => (t.pnl || 0) > 0);
    const losses = closed.filter(t => (t.pnl || 0) <= 0);
    const totalPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + Math.abs(t.pnl || 0), 0) / losses.length : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    return {
      totalTrades: closed.length,
      wins: wins.length,
      losses: losses.length,
      winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
      totalPnl,
      avgWin,
      avgLoss,
      profitFactor: Math.min(profitFactor, 99.9),
    };
  }, [filteredTrades]);

  // Period stats summary
  const periodStats = useMemo(() => {
    const periods: { key: Period; label: string }[] = [
      { key: 'today', label: 'TODAY' },
      { key: 'week', label: 'THIS WEEK' },
      { key: 'month', label: 'THIS MONTH' },
      { key: 'all', label: 'ALL TIME' },
    ];

    return periods.map(p => {
      const now = new Date();
      const filtered = trades.filter(t => {
        if (p.key === 'all') return true;
        const d = new Date(t.date);
        if (p.key === 'today') return d.toDateString() === now.toDateString();
        if (p.key === 'week') {
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        }
        if (p.key === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
      const closed = filtered.filter(t => t.pnl != null);
      const wins = closed.filter(t => (t.pnl || 0) > 0);
      const losses = closed.filter(t => (t.pnl || 0) <= 0);
      const pnl = closed.reduce((s, t) => s + (t.pnl || 0), 0);
      return { ...p, pnl, wins: wins.length, losses: losses.length };
    });
  }, [trades]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleSave = async () => {
    if (!form.ticker || !form.entry) return;
    setSaving(true);
    try {
      const entry = parseFloat(form.entry);
      const exit = form.exit ? parseFloat(form.exit) : null;
      const qty = parseFloat(form.quantity) || 1;
      const isShort = form.direction === 'SHORT' || form.direction === 'PUT';
      const pnl = exit != null ? (isShort ? (entry - exit) * qty : (exit - entry) * qty) : null;
      const pnl_percent = exit != null && entry > 0 ? (isShort ? ((entry - exit) / entry) * 100 : ((exit - entry) / entry) * 100) : null;

      const record = {
        ticker: form.ticker.toUpperCase(),
        direction: form.direction,
        entry,
        exit,
        quantity: qty,
        pnl: pnl != null ? +pnl.toFixed(2) : null,
        pnl_percent: pnl_percent != null ? +pnl_percent.toFixed(2) : null,
        notes: form.notes || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        date: new Date().toISOString().split('T')[0],
      };

      if (editing) {
        await supabase.from('trade_journal').update(record).eq('id', editing);
      } else {
        await supabase.from('trade_journal').insert(record);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditing(null);
      fetchTrades();
    } catch {} finally { setSaving(false); }
  };

  const handleEdit = (t: Trade) => {
    setForm({
      ticker: t.ticker,
      direction: t.direction,
      entry: String(t.entry),
      exit: t.exit != null ? String(t.exit) : '',
      quantity: String(t.quantity),
      notes: t.notes || '',
      tags: (t.tags || []).join(', '),
    });
    setEditing(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('trade_journal').delete().eq('id', id);
    fetchTrades();
  };

  const exportCSV = () => {
    const headers = 'Date,Ticker,Direction,Entry,Exit,Quantity,P&L,P&L%,Notes,Tags\n';
    const rows = sortedTrades.map(t =>
      `${t.date},${t.ticker},${t.direction},${t.entry},${t.exit || ''},${t.quantity},${t.pnl || ''},${t.pnl_percent || ''},${(t.notes || '').replace(/,/g, ';')},${(t.tags || []).join('|')}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trade-journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const ths: React.CSSProperties = { textAlign: 'right', fontSize: 10, color: brand.smoke, fontFamily: M, padding: '6px 8px', borderBottom: `1px solid ${brand.border}`, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer' };
  const thl: React.CSSProperties = { ...ths, textAlign: 'left' };
  const tds: React.CSSProperties = { textAlign: 'right', fontSize: 12, color: brand.silver, fontFamily: M, padding: '6px 8px', borderBottom: `1px solid ${brand.border}` };
  const tdl: React.CSSProperties = { ...tds, textAlign: 'left' };
  const inputStyle: React.CSSProperties = { background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: 4, color: brand.white, fontFamily: M, fontSize: 12, padding: '6px 10px', width: '100%' };

  return (
    <div style={{
      background: brand.carbon,
      border: `1px solid ${brand.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, background: brand.graphite,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>📓</span>
          <span style={{
            color: brand.amber, fontWeight: 700, fontSize: 13,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>TRADE JOURNAL</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{ background: 'none', border: `1px solid ${brand.border}`, borderRadius: 4, color: brand.smoke, cursor: 'pointer', fontSize: 10, padding: '4px 10px', fontFamily: M }}>📤 CSV</button>
          <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }} style={{
            background: brand.amber, color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer',
            fontSize: 11, padding: '4px 12px', fontWeight: 700, fontFamily: M,
          }}>+ NEW TRADE</button>
        </div>
      </div>

      {/* Period Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderBottom: `1px solid ${brand.border}` }}>
        {periodStats.map(p => (
          <div
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              borderRight: `1px solid ${brand.border}`,
              background: period === p.key ? 'rgba(245,158,11,0.06)' : 'transparent',
              borderBottom: period === p.key ? `2px solid ${brand.amber}` : '2px solid transparent',
            }}
          >
            <div style={{ fontSize: 9, color: period === p.key ? brand.amber : brand.smoke, fontWeight: 700, fontFamily: M, letterSpacing: '0.05em', marginBottom: 4 }}>
              {p.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: M, color: p.pnl >= 0 ? '#22C55E' : '#EF4444' }}>
              {fp(p.pnl)}
            </div>
            <div style={{ fontSize: 10, fontFamily: M, color: brand.smoke }}>
              {p.wins}W / {p.losses}L
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, background: 'rgba(245,158,11,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>TICKER</label>
              <input value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value.toUpperCase() })} placeholder="AAPL" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>DIRECTION</label>
              <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
                <option value="CALL">CALL</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>ENTRY</label>
              <input type="number" step="0.01" value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>EXIT</label>
              <input type="number" step="0.01" value={form.exit} onChange={e => setForm({ ...form, exit: e.target.value })} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>QTY</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="1" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8 }}>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>NOTES</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Trade notes..." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: brand.smoke, fontFamily: M }}>TAGS</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="scalp, earnings" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <button onClick={handleSave} disabled={saving || !form.ticker || !form.entry} style={{
                background: brand.amber, color: '#000', border: 'none', borderRadius: 4,
                cursor: 'pointer', fontSize: 11, padding: '6px 16px', fontWeight: 700, fontFamily: M,
                opacity: saving || !form.ticker || !form.entry ? 0.5 : 1,
              }}>{editing ? 'UPDATE' : 'SAVE'}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} style={{
                background: 'none', border: `1px solid ${brand.border}`, borderRadius: 4,
                color: brand.smoke, cursor: 'pointer', fontSize: 11, padding: '6px 12px', fontFamily: M,
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: M }}>
            <span style={{ animation: 'axp 1.5s ease-in-out infinite' }}>Loading trades...</span>
          </div>
        ) : sortedTrades.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: brand.smoke, fontSize: 12, fontFamily: M }}>
            No trades for this period. Click + NEW TRADE to add one.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} style={thl}>DATE {sortKey === 'date' ? (sortDir === 'desc' ? '▾' : '▴') : ''}</th>
                <th onClick={() => handleSort('ticker')} style={thl}>TICKER {sortKey === 'ticker' ? (sortDir === 'desc' ? '▾' : '▴') : ''}</th>
                <th style={thl}>DIR</th>
                <th style={ths}>ENTRY</th>
                <th style={ths}>EXIT</th>
                <th style={ths}>QTY</th>
                <th onClick={() => handleSort('pnl')} style={ths}>P&L {sortKey === 'pnl' ? (sortDir === 'desc' ? '▾' : '▴') : ''}</th>
                <th style={thl}>NOTES</th>
                <th style={{ ...ths, width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map(t => (
                <tr key={t.id}>
                  <td style={{ ...tdl, fontSize: 11 }}>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td style={{ ...tdl, color: brand.amber, fontWeight: 600 }}>{t.ticker}</td>
                  <td style={tdl}>
                    <span style={{
                      padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, fontFamily: M,
                      color: t.direction === 'LONG' || t.direction === 'CALL' ? '#22C55E' : '#EF4444',
                      background: t.direction === 'LONG' || t.direction === 'CALL' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    }}>{t.direction}</span>
                  </td>
                  <td style={{ ...tds, color: brand.white }}>${t.entry.toFixed(2)}</td>
                  <td style={tds}>{t.exit != null ? `$${t.exit.toFixed(2)}` : '--'}</td>
                  <td style={tds}>{t.quantity}</td>
                  <td style={{
                    ...tds, fontWeight: 700,
                    color: t.pnl != null ? (t.pnl >= 0 ? '#22C55E' : '#EF4444') : brand.smoke,
                  }}>{t.pnl != null ? fp(t.pnl) : '--'}</td>
                  <td style={{ ...tdl, fontSize: 10, color: brand.smoke, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.notes || ''}
                  </td>
                  <td style={tds}>
                    <button onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', color: brand.smoke, cursor: 'pointer', fontSize: 11, padding: '0 3px' }}>✎</button>
                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 11, padding: '0 3px' }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      {stats.totalTrades > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px',
          borderTop: `1px solid ${brand.border}`, fontSize: 10, fontFamily: M, color: brand.smoke,
          flexWrap: 'wrap',
        }}>
          <span>Win Rate: <span style={{ color: stats.winRate >= 60 ? '#22C55E' : stats.winRate >= 50 ? '#EAB308' : '#EF4444', fontWeight: 700 }}>{stats.winRate.toFixed(0)}%</span></span>
          <span>Profit Factor: <span style={{ color: brand.white, fontWeight: 700 }}>{stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(1)}</span></span>
          <span>Avg Win: <span style={{ color: '#22C55E', fontWeight: 700 }}>{fp(stats.avgWin)}</span></span>
          <span>Avg Loss: <span style={{ color: '#EF4444', fontWeight: 700 }}>-${stats.avgLoss.toFixed(2)}</span></span>
        </div>
      )}
    </div>
  );
}
