'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { brand, styles } from '@/lib/brand';
import type { FlowItem } from '@/app/api/flow-radar/route';

const M = "'JetBrains Mono','Fira Code',monospace";
const FOLLOWUP_KEY = 'flow_radar_followup_v1';

type FollowupStatus = 'won' | 'lost' | 'open';
interface FollowupStore { [id: string]: FollowupStatus; }

function loadFollowup(): FollowupStore {
  if (typeof window === 'undefined') return {};
  try { const r = localStorage.getItem(FOLLOWUP_KEY); if (r) return JSON.parse(r); } catch {}
  return {};
}
function saveFollowup(s: FollowupStore) {
  if (typeof window !== 'undefined') localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(s));
}

function isMarketHours(): boolean {
  const now = new Date();
  const et = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const h = parseInt(et.find(p => p.type === 'hour')?.value ?? '0');
  const m = parseInt(et.find(p => p.type === 'minute')?.value ?? '0');
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = h * 60 + m;
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

function formatPremium(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function formatVol(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function FlowRadar() {
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [followup, setFollowup] = useState<FollowupStore>({});
  const [countdown, setCountdown] = useState(60);

  // Filters
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  const [minPremium, setMinPremium] = useState(0);
  const [tickerSearch, setTickerSearch] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setFollowup(loadFollowup()); }, []);

  const fetchFlow = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flow-radar', { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { flows: FlowItem[]; source: 'live' | 'demo' };
      setFlows(data.flows ?? []);
      setSource(data.source ?? 'demo');
      setLastRefresh(new Date());
      setCountdown(60);
    } catch (e) {
      console.error('Flow radar fetch:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 60s during market hours
  useEffect(() => {
    fetchFlow();

    if (isMarketHours()) {
      intervalRef.current = setInterval(fetchFlow, 60_000);
      countdownRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchFlow]);

  function setFollowupStatus(id: string, status: FollowupStatus) {
    const updated = { ...followup, [id]: status };
    setFollowup(updated);
    saveFollowup(updated);
  }

  const filtered = flows.filter(f => {
    if (sentimentFilter !== 'all' && f.sentiment !== sentimentFilter) return false;
    if (f.premium < minPremium * 1_000) return false;
    if (tickerSearch && !f.ticker.includes(tickerSearch.toUpperCase())) return false;
    return true;
  });

  const bullishCount = flows.filter(f => f.sentiment === 'bullish').length;
  const bearishCount = flows.filter(f => f.sentiment === 'bearish').length;
  const totalPremium = flows.reduce((s, f) => s + f.premium, 0);
  const bullPremium = flows.filter(f => f.sentiment === 'bullish').reduce((s, f) => s + f.premium, 0);
  const bearPremium = flows.filter(f => f.sentiment === 'bearish').reduce((s, f) => s + f.premium, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/os" style={styles.backLink}>← Back to OS</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
          <div>
            <h1 style={styles.h1}>Flow Radar</h1>
            <p style={styles.subtitle}>Unusual options activity — large bets, decoded in plain English</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: source === 'live' ? brand.success : brand.amber, display: 'inline-block' }} />
              <span style={{ color: source === 'live' ? brand.success : brand.amber, fontSize: '12px', fontFamily: M }}>
                {source === 'live' ? 'LIVE' : 'DEMO DATA'}
              </span>
            </div>
            {lastRefresh && (
              <div style={{ color: brand.smoke, fontSize: '11px', fontFamily: M }}>
                Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
            {isMarketHours() && (
              <div style={{ color: brand.smoke, fontSize: '11px' }}>
                Auto-refresh in {countdown}s
              </div>
            )}
            <button onClick={fetchFlow} disabled={loading} style={{ ...styles.button, padding: '0.4rem 1rem', fontSize: '12px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Loading...' : '⟳ Refresh'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Premium', value: formatPremium(totalPremium), color: brand.amber },
            { label: 'Bullish Flow', value: formatPremium(bullPremium), color: brand.success },
            { label: 'Bearish Flow', value: formatPremium(bearPremium), color: brand.error },
            { label: 'Bull Calls', value: String(bullishCount), color: brand.success },
            { label: 'Bear Puts', value: String(bearishCount), color: brand.error },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, textAlign: 'center' as const, padding: '1rem' }}>
              <div style={{ ...styles.sectionLabel, marginBottom: '0.4rem' }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: '1.05rem', fontWeight: 700, fontFamily: M }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ ...styles.card, marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
          {/* Sentiment toggle */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['all', 'bullish', 'bearish'] as const).map(s => (
              <button key={s} onClick={() => setSentimentFilter(s)} style={{
                ...styles.button,
                padding: '0.4rem 0.9rem',
                fontSize: '12px',
                backgroundColor: sentimentFilter === s ? (s === 'bullish' ? brand.success : s === 'bearish' ? brand.error : brand.amber) : brand.graphite,
                color: sentimentFilter === s ? '#000' : brand.silver,
                textTransform: 'capitalize' as const,
              }}>
                {s === 'bullish' ? '▲ ' : s === 'bearish' ? '▼ ' : ''}{s}
              </button>
            ))}
          </div>

          {/* Min premium */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={styles.sectionLabel}>Min Premium:</span>
            <select
              value={minPremium}
              onChange={e => setMinPremium(Number(e.target.value))}
              style={{ ...styles.input, width: 'auto', padding: '0.4rem 0.6rem', fontSize: '12px' }}
            >
              {[0, 100, 250, 500, 1000, 2500, 5000].map(v => (
                <option key={v} value={v}>{v === 0 ? 'Any' : `$${v}K+`}</option>
              ))}
            </select>
          </div>

          {/* Ticker search */}
          <input
            value={tickerSearch}
            onChange={e => setTickerSearch(e.target.value.toUpperCase())}
            placeholder="Filter ticker..."
            style={{ ...styles.input, width: '140px', padding: '0.4rem 0.6rem', fontSize: '12px' }}
          />

          <span style={{ color: brand.smoke, fontSize: '12px', marginLeft: 'auto' }}>
            {filtered.length} flows
          </span>
        </div>

        {/* Flow feed */}
        {loading && flows.length === 0 ? (
          <div style={{ ...styles.card, textAlign: 'center' as const, padding: '3rem', color: brand.smoke }}>
            Loading options flow data...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...styles.card, textAlign: 'center' as const, padding: '3rem', color: brand.smoke }}>
            No flows match your filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
            {filtered.map(flow => {
              const fu = followup[flow.id] ?? 'open';
              const isBull = flow.sentiment === 'bullish';
              const accentColor = isBull ? brand.success : brand.error;
              const expired = new Date(flow.expiry) < new Date();

              return (
                <div
                  key={flow.id}
                  style={{
                    ...styles.card,
                    border: `1px solid ${fu === 'won' ? brand.success : fu === 'lost' ? brand.error : brand.border}`,
                    borderLeft: `3px solid ${accentColor}`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
                    {/* Left: ticker + contract */}
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: brand.amber, fontFamily: M, fontSize: '1rem', fontWeight: 700 }}>{flow.ticker}</span>
                        <span style={{ ...styles.badge(accentColor), fontWeight: 700 }}>
                          {isBull ? '▲' : '▼'} {flow.contractType}
                        </span>
                        {flow.isDemo && <span style={{ ...styles.badge(brand.smoke), fontSize: '10px' }}>DEMO</span>}
                      </div>
                      <div style={{ color: brand.white, fontFamily: M, fontSize: '13px' }}>
                        ${flow.strike} · {new Date(flow.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </div>
                      <div style={{ color: brand.smoke, fontSize: '11px', marginTop: '0.2rem' }}>
                        {expired ? 'EXPIRED' : `${flow.daysToExpiry}d to expiry`}
                      </div>
                    </div>

                    {/* Mid: metrics */}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const, flex: 1 }}>
                      <div>
                        <div style={styles.sectionLabel}>Premium</div>
                        <div style={{ color: brand.amber, fontFamily: M, fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>{formatPremium(flow.premium)}</div>
                      </div>
                      <div>
                        <div style={styles.sectionLabel}>Volume</div>
                        <div style={{ color: brand.white, fontFamily: M, fontSize: '14px', marginTop: '0.2rem' }}>{formatVol(flow.volume)}</div>
                      </div>
                      <div>
                        <div style={styles.sectionLabel}>Open Interest</div>
                        <div style={{ color: brand.white, fontFamily: M, fontSize: '14px', marginTop: '0.2rem' }}>{formatVol(flow.openInterest)}</div>
                      </div>
                      <div>
                        <div style={styles.sectionLabel}>Vol/OI Ratio</div>
                        <div style={{ color: brand.amber, fontFamily: M, fontSize: '14px', fontWeight: 700, marginTop: '0.2rem' }}>{flow.volOiRatio.toFixed(1)}x</div>
                      </div>
                      <div>
                        <div style={styles.sectionLabel}>Time</div>
                        <div style={{ color: brand.smoke, fontFamily: M, fontSize: '12px', marginTop: '0.2rem' }}>{timeAgo(flow.timestamp)}</div>
                      </div>
                    </div>

                    {/* Right: follow-up */}
                    {(expired || flow.daysToExpiry <= 0) && (
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', alignItems: 'flex-end' }}>
                        <div style={styles.sectionLabel}>Did it pay off?</div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {(['won', 'open', 'lost'] as const).map(s => (
                            <button key={s} onClick={() => setFollowupStatus(flow.id, s)} style={{
                              ...styles.button,
                              padding: '0.3rem 0.6rem',
                              fontSize: '11px',
                              backgroundColor: fu === s ? (s === 'won' ? brand.success : s === 'lost' ? brand.error : brand.smoke) : brand.graphite,
                              color: fu === s ? '#000' : brand.smoke,
                            }}>
                              {s === 'won' ? '✓ Won' : s === 'lost' ? '✗ Lost' : '? Open'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Translation */}
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', backgroundColor: brand.graphite, borderRadius: '6px', borderLeft: `2px solid ${accentColor}` }}>
                    <span style={{ color: brand.silver, fontSize: '13px', fontStyle: 'italic' }}>
                      {flow.translation}
                    </span>
                  </div>

                  {/* Follow-up result badge */}
                  {fu !== 'open' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ ...styles.badge(fu === 'won' ? brand.success : brand.error), fontWeight: 700 }}>
                        {fu === 'won' ? '✓ BET PAID OFF' : '✗ BET EXPIRED WORTHLESS'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Follow-up summary */}
        {Object.keys(followup).length > 0 && (
          <div style={{ ...styles.card, marginTop: '2rem' }}>
            <h2 style={{ color: brand.amber, marginBottom: '1rem', fontFamily: "'Space Grotesk', system-ui", fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
              Follow-Up Tracker
            </h2>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' as const }}>
              {[
                { label: 'Tracked', value: Object.keys(followup).length, color: brand.white },
                { label: 'Won', value: Object.values(followup).filter(v => v === 'won').length, color: brand.success },
                { label: 'Lost', value: Object.values(followup).filter(v => v === 'lost').length, color: brand.error },
              ].map(s => (
                <div key={s.label}>
                  <div style={styles.sectionLabel}>{s.label}</div>
                  <div style={{ color: s.color, fontFamily: M, fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{s.value}</div>
                </div>
              ))}
              {(() => {
                const resolved = Object.values(followup).filter(v => v !== 'open');
                const wins = resolved.filter(v => v === 'won').length;
                const rate = resolved.length > 0 ? (wins / resolved.length * 100).toFixed(0) : null;
                return rate !== null ? (
                  <div>
                    <div style={styles.sectionLabel}>Win Rate</div>
                    <div style={{ color: brand.amber, fontFamily: M, fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{rate}%</div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
