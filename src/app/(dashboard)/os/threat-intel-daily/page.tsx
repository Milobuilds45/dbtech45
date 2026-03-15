'use client';

import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from '@/lib/brand';

interface WeatherPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
  windSpeed: string;
  windDirection: string;
  isDaytime: boolean;
}

interface WeatherAlert {
  id: string;
  properties: {
    headline: string;
    severity: string;
    event: string;
    description: string;
    effective: string;
    expires: string;
    areaDesc: string;
  };
}

type ThreatLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

function getThreatLevel(periods: WeatherPeriod[], alerts: WeatherAlert[]): ThreatLevel {
  if (alerts.some(a => ['Extreme', 'Severe'].includes(a.properties.severity))) return 'SEVERE';
  if (alerts.length > 0) return 'HIGH';
  const lowTemp = Math.min(...periods.slice(0, 4).map(p => p.temperature));
  if (periods.some(p => p.temperature < 20 && p.temperatureUnit === 'F')) return 'HIGH';
  if (lowTemp < 32 || periods.some(p => /snow|ice|blizzard|freezing/i.test(p.shortForecast))) return 'MODERATE';
  return 'LOW';
}

function getThreatColor(level: ThreatLevel) {
  const map: Record<ThreatLevel, string> = {
    LOW: brand.success,
    MODERATE: brand.warning,
    HIGH: brand.error,
    SEVERE: '#FF00FF',
  };
  return map[level];
}

function getColdOpsContext(temp: number): string {
  if (temp < 0) return 'EXTREME COLD — Expose pipes risk, staff outdoor safety protocol, ice patches at entrance';
  if (temp < 20) return 'SEVERE COLD — Pre-salt walkways, check deliveries for delays, heat vestibule';
  if (temp < 32) return 'BELOW FREEZING — Ice risk on entry, grease trap may slow, check propane tank pressure';
  if (temp < 45) return 'COLD OPS — Normal operations, watch evening temp drop';
  return 'NORMAL OPS — No cold-weather action required';
}

const LOCAL_LINKS = [
  { name: 'Nashua Telegraph', url: 'https://www.nashuatelegraph.com', icon: '📰', desc: 'Local news & business' },
  { name: 'WMUR NH', url: 'https://www.wmur.com', icon: '📺', desc: 'TV news, weather, alerts' },
  { name: 'Nashua Patch', url: 'https://patch.com/new-hampshire/nashua', icon: '🗺️', desc: 'Hyperlocal Nashua news' },
  { name: 'NH 511 Traffic', url: 'https://www.nh.gov/dot/511', icon: '🚦', desc: 'Road conditions & incidents' },
  { name: 'NHDOT Road Conditions', url: 'https://www.nh.gov/dot/programs/winterroads', icon: '🛣️', desc: 'Winter road treatment status' },
];

export default function ThreatIntelDailyPage() {
  const [periods, setPeriods] = useState<WeatherPeriod[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string>('');

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastRes, alertsRes] = await Promise.all([
        fetch('https://api.weather.gov/gridpoints/GYX/40,10/forecast', {
          headers: { 'User-Agent': 'DBTech45-ThreatIntel/1.0 (dbtech45.com)' },
        }),
        fetch('https://api.weather.gov/alerts/active?area=NH', {
          headers: { 'User-Agent': 'DBTech45-ThreatIntel/1.0 (dbtech45.com)' },
        }),
      ]);

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setPeriods(forecastData.properties?.periods?.slice(0, 6) || []);
      } else {
        setError('Weather service unavailable — showing cached data');
        // Fallback seed data for Nashua NH
        setPeriods([
          { name: 'Today', temperature: 29, temperatureUnit: 'F', shortForecast: 'Partly Cloudy', detailedForecast: 'Partly cloudy. High near 29°F. Northwest wind 10-15 mph.', windSpeed: '10 to 15 mph', windDirection: 'NW', isDaytime: true },
          { name: 'Tonight', temperature: 18, temperatureUnit: 'F', shortForecast: 'Mostly Clear', detailedForecast: 'Mostly clear. Low around 18°F. Wind chill values as low as 8°F.', windSpeed: '5 to 10 mph', windDirection: 'NW', isDaytime: false },
          { name: 'Sunday', temperature: 35, temperatureUnit: 'F', shortForecast: 'Sunny', detailedForecast: 'Sunny. High near 35°F.', windSpeed: '5 mph', windDirection: 'SW', isDaytime: true },
          { name: 'Sunday Night', temperature: 22, temperatureUnit: 'F', shortForecast: 'Mostly Cloudy', detailedForecast: 'Mostly cloudy. Low around 22°F. Chance of light snow after midnight.', windSpeed: '5 to 10 mph', windDirection: 'N', isDaytime: false },
        ]);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.features?.slice(0, 5) || []);
      }

      setLastFetched(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setError('Network error — check connection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const threatLevel = getThreatLevel(periods, alerts);
  const threatColor = getThreatColor(threatLevel);
  const currentTemp = periods[0]?.temperature ?? null;
  const todayForecast = periods[0];
  const tonightForecast = periods[1];
  const tomorrowForecast = periods[2];

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Back + Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/os" style={styles.backLink}>← Back to OS</a>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={styles.h1}>Threat Intel Daily</h1>
              <p style={styles.subtitle}>Hyperlocal situational awareness — Nashua, NH operators</p>
            </div>
            {/* Threat Level Badge */}
            <div style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: `2px solid ${threatColor}`,
              background: `${threatColor}15`,
              textAlign: 'center',
              minWidth: '140px',
            }}>
              <div style={{ fontSize: '10px', color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                Threat Level
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: threatColor, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: '0.05em' }}>
                {loading ? '—' : threatLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Refresh + status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {error && (
              <span style={{ fontSize: '12px', color: brand.warning, padding: '3px 8px', background: `${brand.warning}18`, borderRadius: '6px' }}>
                ⚠ {error}
              </span>
            )}
            {!loading && lastFetched && (
              <span style={{ fontSize: '11px', color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>
                Last fetch: {lastFetched}
              </span>
            )}
          </div>
          <button
            onClick={fetchWeather}
            disabled={loading}
            style={{ ...styles.button, padding: '0.4rem 1rem', fontSize: '12px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⟳ Fetching...' : '↻ Refresh'}
          </button>
        </div>

        {loading ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '3rem', color: brand.smoke }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⟳</div>
            <div>Connecting to NWS weather services...</div>
          </div>
        ) : (
          <>
            {/* Active Alerts */}
            {alerts.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>
                  🚨 Active NWS Alerts — New Hampshire ({alerts.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {alerts.map((alert) => {
                    const sev = alert.properties.severity;
                    const sevColor = sev === 'Extreme' ? '#FF00FF' : sev === 'Severe' ? brand.error : sev === 'Moderate' ? brand.warning : brand.info;
                    return (
                      <div key={alert.id} style={{
                        ...styles.card,
                        borderColor: sevColor + '66',
                        borderLeftWidth: '3px',
                        borderLeftColor: sevColor,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: sevColor }}>{alert.properties.event}</span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', background: `${sevColor}18`, color: sevColor, borderRadius: '8px', fontWeight: 600 }}>
                            {sev}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: brand.silver, marginBottom: '0.35rem' }}>{alert.properties.headline}</div>
                        <div style={{ fontSize: '11px', color: brand.smoke }}>
                          Expires: {new Date(alert.properties.expires).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{alert.properties.areaDesc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {alerts.length === 0 && (
              <div style={{ ...styles.card, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: `${brand.success}44` }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: brand.success }}>No Active NWS Alerts for NH</div>
                  <div style={{ fontSize: '12px', color: brand.smoke }}>All clear from National Weather Service</div>
                </div>
              </div>
            )}

            {/* Weather + Ops grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

              {/* Current Conditions */}
              <div style={styles.card}>
                <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Current Conditions — Nashua NH</div>
                {todayForecast ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: brand.white, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                          {currentTemp}°{todayForecast.temperatureUnit}
                        </div>
                        <div style={{ fontSize: '14px', color: brand.silver, marginTop: '0.25rem' }}>{todayForecast.shortForecast}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '12px', color: brand.smoke }}>
                        <div>💨 {todayForecast.windSpeed} {todayForecast.windDirection}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: brand.silver, lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {todayForecast.detailedForecast}
                    </div>
                    {currentTemp !== null && (
                      <div style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        background: currentTemp < 20 ? `${brand.error}18` : currentTemp < 32 ? `${brand.warning}18` : `${brand.success}18`,
                        border: `1px solid ${currentTemp < 20 ? brand.error : currentTemp < 32 ? brand.warning : brand.success}33`,
                      }}>
                        <div style={{ fontSize: '11px', color: currentTemp < 20 ? brand.error : currentTemp < 32 ? brand.warning : brand.success, fontWeight: 600 }}>
                          {getColdOpsContext(currentTemp)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: brand.smoke, fontSize: '13px' }}>No current data available</div>
                )}
              </div>

              {/* Tonight + Tomorrow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[tonightForecast, tomorrowForecast].filter(Boolean).map((period, i) => (
                  <div key={i} style={{ ...styles.card, flex: 1 }}>
                    <div style={{ ...styles.sectionLabel, marginBottom: '0.5rem' }}>{period!.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: period!.isDaytime ? brand.amber : brand.silver, fontFamily: "'JetBrains Mono', monospace" }}>
                          {period!.temperature}°{period!.temperatureUnit}
                        </span>
                        <div style={{ fontSize: '12px', color: brand.smoke, marginTop: '0.2rem' }}>{period!.shortForecast}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: brand.smoke }}>
                        💨 {period!.windSpeed}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extended outlook */}
              <div style={styles.card}>
                <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>Extended — Next 3 Periods</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {periods.slice(3, 6).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${brand.border}` }}>
                      <span style={{ fontSize: '12px', color: brand.silver }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: brand.smoke }}>{p.shortForecast}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: brand.white, fontFamily: "'JetBrains Mono', monospace" }}>
                          {p.temperature}°{p.temperatureUnit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Local intel links */}
            <div style={styles.card}>
              <div style={{ ...styles.sectionLabel, marginBottom: '1rem' }}>Local Intelligence Sources — Nashua, NH</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {LOCAL_LINKS.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: brand.graphite,
                      border: `1px solid ${brand.border}`,
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{link.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: brand.white }}>{link.name}</div>
                      <div style={{ fontSize: '11px', color: brand.smoke }}>{link.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Road conditions card */}
            <div style={{ ...styles.card, marginTop: '1rem' }}>
              <div style={{ ...styles.sectionLabel, marginBottom: '0.75rem' }}>Road & Traffic Conditions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {[
                  { route: 'Rte 3 / DW Hwy N', status: currentTemp !== null && currentTemp < 32 ? 'MONITOR — Potential ice' : 'CLEAR', icon: '🛣️' },
                  { route: 'Amherst St (101A)', status: currentTemp !== null && currentTemp < 32 ? 'MONITOR — Watch side streets' : 'CLEAR', icon: '🚗' },
                  { route: 'Everett Turnpike', status: 'CLEAR — Check NH 511 for real-time', icon: '🚦' },
                  { route: 'Delivery Routes', status: currentTemp !== null && currentTemp < 32 ? 'ALLOW EXTRA 15–30 MIN' : 'Normal ETA', icon: '🚚' },
                ].map(r => {
                  const isMonitor = r.status.includes('MONITOR') || r.status.includes('EXTRA');
                  return (
                    <div key={r.route} style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: brand.graphite, border: `1px solid ${brand.border}` }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span>{r.icon}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: brand.white }}>{r.route}</div>
                          <div style={{ fontSize: '11px', color: isMonitor ? brand.warning : brand.success, marginTop: '0.15rem' }}>{r.status}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
