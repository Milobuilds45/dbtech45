'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────
interface CronJob {
  id: string; name: string; schedule: string; humanSchedule: string;
  lastRun: string | null; nextRun: string | null;
  status: 'success' | 'failure' | 'pending' | 'unknown';
  agent: string; duration?: string; description?: string;
}

// ─── Brand colors ────────────────────────────────────────────────────────
const B = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#EAB308',
  border: '#222222',
};

const AC: Record<string, string> = {
  Milo: '#A855F7', Anders: '#F97316', Paula: '#EC4899', Bobby: '#22C55E',
  Dwight: '#6366F1', Tony: '#EAB308', Dax: '#06B6D4', Remy: '#EF4444',
  Wendy: '#8B5CF6', System: '#737373',
};

const AR = [
  { name: 'Milo', role: 'Chief of Staff' },
  { name: 'Anders', role: 'Full Stack Architect' },
  { name: 'Paula', role: 'Creative Director' },
  { name: 'Bobby', role: 'Trading Advisor' },
  { name: 'Dwight', role: 'Weather & News' },
  { name: 'Tony', role: 'Tech Guru' },
  { name: 'Dax', role: 'Data Analyst' },
  { name: 'Remy', role: 'Chef & Lifestyle' },
  { name: 'Wendy', role: 'Wellness Coach' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function sc(s: string) {
  if (['online', 'active', 'success', 'healthy'].includes(s)) return B.success;
  if (['warning', 'idle', 'pending'].includes(s)) return B.warning;
  if (['offline', 'failure', 'critical', 'timeout'].includes(s)) return B.error;
  return B.smoke;
}
function sd(s: string) { return ['warning', 'idle', 'pending'].includes(s) ? '\u25D0' : '\u25CF'; }
function rt(ts: string | null): string {
  if (!ts) return 'Never';
  const d = Date.now() - new Date(ts).getTime();
  if (d < 0) {
    const m = Math.floor(Math.abs(d) / 60000);
    const h = Math.floor(m / 60);
    return h > 0 ? 'in ' + h + 'h' : 'in ' + m + 'm';
  }
  const m = Math.floor(d / 60000);
  const h = Math.floor(m / 60);
  const dy = Math.floor(h / 24);
  if (dy > 0) return dy + 'd ago';
  if (h > 0) return h + 'h ago';
  if (m > 0) return m + 'm ago';
  return 'Just now';
}

// ─── Mock data ───────────────────────────────────────────────────────────
function generateCrons(): CronJob[] {
  const n = Date.now();
  const now = new Date();
  return [
    { id: 'c1', name: 'Morning Brief', schedule: '0 7 * * *', humanSchedule: 'Every day at 7:00 AM', lastRun: new Date(n - 7 * 3600000).toISOString(), nextRun: new Date(n + 4 * 3600000).toISOString(), status: 'success', agent: 'Dwight', duration: '12s', description: 'Weather, news, calendar summary' },
    { id: 'c2', name: 'Bobby Morning Brief', schedule: '10 9 * * 1-5', humanSchedule: 'Weekdays at 9:10 AM', lastRun: new Date(n - 5 * 3600000).toISOString(), nextRun: new Date(n + 6 * 3600000).toISOString(), status: 'success', agent: 'Bobby', duration: '8s', description: 'BTC & market analysis' },
    { id: 'c3', name: 'Gateway Auto-Start', schedule: '@reboot', humanSchedule: 'At system startup', lastRun: null, nextRun: null, status: 'failure', agent: 'System', duration: '\u2014', description: 'Ensures gateway starts on boot' },
    { id: 'c4', name: 'Nightly Build', schedule: '0 3 * * *', humanSchedule: 'Every day at 3:00 AM', lastRun: now.toISOString(), nextRun: new Date(n + 21 * 3600000).toISOString(), status: 'pending', agent: 'Milo', duration: '~45s', description: 'Project builds & deploys' },
    { id: 'c5', name: 'Memory Cleanup', schedule: '0 4 * * 0', humanSchedule: 'Sundays at 4:00 AM', lastRun: new Date(n - 3 * 86400000).toISOString(), nextRun: new Date(n + 4 * 86400000).toISOString(), status: 'success', agent: 'Milo', duration: '22s', description: 'Archives old memory files' },
    { id: 'c6', name: 'Portfolio Snapshot', schedule: '0 16 * * 1-5', humanSchedule: 'Weekdays at 4:00 PM', lastRun: new Date(n - 12 * 3600000).toISOString(), nextRun: new Date(n + 8 * 3600000).toISOString(), status: 'success', agent: 'Bobby', duration: '6s', description: 'EOD portfolio & P&L' },
    { id: 'c7', name: 'Wellness Check-in', schedule: '0 12 * * *', humanSchedule: 'Every day at 12:00 PM', lastRun: new Date(n - 2 * 3600000).toISOString(), nextRun: new Date(n + 22 * 3600000).toISOString(), status: 'unknown', agent: 'Wendy', duration: '\u2014', description: 'Midday wellness reminder' },
  ];
}

// ═══ MAIN COMPONENT ═══
export default function CronMonitorView() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [cronFA, setCronFA] = useState('all');
  const [cronFS, setCronFS] = useState('all');

  const refresh = useCallback(() => { setCrons(generateCrons()); }, []);
  useEffect(() => { refresh(); const i = setInterval(refresh, 30000); return () => clearInterval(i); }, [refresh]);

  const sel: React.CSSProperties = { background: B.graphite, color: B.silver, border: '1px solid ' + B.border, borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' };
  const crd: React.CSSProperties = { background: B.carbon, border: '1px solid ' + B.border, borderRadius: '12px', padding: '20px' };
  const fCrons = crons.filter(c => (cronFA === 'all' || c.agent === cronFA) && (cronFS === 'all' || c.status === cronFS));

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: B.smoke, fontSize: '13px', fontWeight: 600, fontFamily: "'Space Grotesk', system-ui, sans-serif", textTransform: 'uppercase' as const, letterSpacing: '-0.02em' }}>Filter:</span>
        <select value={cronFA} onChange={e => setCronFA(e.target.value)} style={sel}>
          <option value="all">All Agents</option>
          {[...AR.map(a => a.name), 'System'].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={cronFS} onChange={e => setCronFS(e.target.value)} style={sel}>
          <option value="all">All Statuses</option>
          {['success', 'failure', 'pending', 'unknown'].map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span style={{ color: B.smoke, fontSize: '12px', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{fCrons.length} job{fCrons.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={crd}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px 90px', gap: '8px', padding: '8px 12px', borderBottom: '1px solid ' + B.border, fontSize: '11px', fontWeight: 700, color: B.smoke, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              <span>Name</span><span>Schedule</span><span>Agent</span><span>Last Run</span><span>Next Run</span><span>Duration</span><span>Status</span>
            </div>
            {fCrons.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: B.smoke }}>No jobs match filters</div> :
              fCrons.map(c => (
                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px 90px', gap: '8px', padding: '12px', borderBottom: '1px solid ' + B.border, alignItems: 'center', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: B.white, fontWeight: 600 }}>{c.name}</div>
                    {c.description && <div style={{ color: B.smoke, fontSize: '11px', marginTop: '2px' }}>{c.description}</div>}
                  </div>
                  <div>
                    <div style={{ color: B.silver, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{c.schedule}</div>
                    <div style={{ color: B.smoke, fontSize: '11px' }}>{c.humanSchedule}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: AC[c.agent] || B.smoke }} />
                    <span style={{ color: B.silver }}>{c.agent}</span>
                  </div>
                  <span style={{ color: B.silver, fontFamily: "'JetBrains Mono', monospace" }}>{rt(c.lastRun)}</span>
                  <span style={{ color: B.silver, fontFamily: "'JetBrains Mono', monospace" }}>{c.nextRun ? rt(c.nextRun) : 'N/A'}</span>
                  <span style={{ color: B.smoke, fontFamily: "'JetBrains Mono', monospace" }}>{c.duration || '\u2014'}</span>
                  <span style={{ color: sc(c.status), fontWeight: 600, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{sd(c.status)} {c.status.toUpperCase()}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
