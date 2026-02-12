'use client';
import { useState, useEffect, useCallback } from 'react';
import { brand, styles } from "@/lib/brand";

interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  volume: number;
  liquidity: number;
  endDate: string;
  yesPrice: number;
  noPrice: number;
  yesPercent: number;
  noPercent: number;
  active: boolean;
  marketCount: number;
  image?: string;
}

const REFRESH_INTERVAL = 300000; // 5 minutes

export default function Polymarket() {
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = selectedCategory 
        ? `/api/polymarket?limit=20&category=${encodeURIComponent(selectedCategory)}`
        : '/api/polymarket?limit=20';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch Polymarket data');
      
      const data = await res.json();
      setEvents(data.events || []);
      setCategories(data.categories || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Polymarket error:', err);
      setError('Failed to load prediction markets');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ ...styles.h1, fontSize: '1.5rem', letterSpacing: '0.05em' }}>Polymarket</h1>
            <p style={{ color: brand.smoke, fontSize: 12 }}>Prediction markets • Real-time odds</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastRefresh && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>
                {formatTime(lastRefresh)}
              </span>
            )}
            <button 
              onClick={fetchEvents} 
              disabled={loading}
              style={{ ...styles.button, padding: '6px 14px', fontSize: 12, opacity: loading ? 0.5 : 1 }}
            >
              {loading ? '↻ Loading...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ ...styles.card, background: 'rgba(239,68,68,0.1)', border: `1px solid ${brand.error}`, marginBottom: '1.5rem', padding: 12 }}>
            <span style={{ color: brand.error, fontSize: 13 }}>⚠ {error}</span>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                ...styles.button,
                padding: '6px 12px',
                fontSize: 11,
                background: !selectedCategory ? brand.amber : 'transparent',
                color: !selectedCategory ? brand.void : brand.smoke,
                border: `1px solid ${!selectedCategory ? brand.amber : brand.border}`,
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.button,
                  padding: '6px 12px',
                  fontSize: 11,
                  background: selectedCategory === cat ? brand.amber : 'transparent',
                  color: selectedCategory === cat ? brand.void : brand.smoke,
                  border: `1px solid ${selectedCategory === cat ? brand.amber : brand.border}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Markets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {events.map(event => (
            <a
              key={event.id}
              href={`https://polymarket.com/event/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...styles.card,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = brand.amber)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = brand.border)}
            >
              {/* Category & Volume */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: 4, 
                  fontSize: 10, 
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(245,158,11,0.1)', 
                  color: brand.amber,
                  textTransform: 'uppercase'
                }}>
                  {event.category}
                </span>
                <span style={{ fontSize: 11, color: brand.smoke }}>
                  Vol: {formatVolume(event.volume)}
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 600, color: brand.white, lineHeight: 1.4 }}>
                {event.title}
              </div>

              {/* Odds Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: brand.success, fontWeight: 600 }}>
                    YES {event.yesPercent}%
                  </span>
                  <span style={{ fontSize: 12, color: brand.error, fontWeight: 600 }}>
                    NO {event.noPercent}%
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  height: 8, 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  background: brand.border 
                }}>
                  <div style={{ 
                    width: `${event.yesPercent}%`, 
                    background: brand.success,
                    transition: 'width 0.3s'
                  }} />
                  <div style={{ 
                    width: `${event.noPercent}%`, 
                    background: brand.error,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: brand.smoke }}>
                <span>Ends: {formatDate(event.endDate)}</span>
                <span>Liquidity: {formatVolume(event.liquidity)}</span>
              </div>
            </a>
          ))}
        </div>

        {events.length === 0 && !loading && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ color: brand.smoke }}>No prediction markets found</span>
          </div>
        )}

        {loading && events.length === 0 && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ color: brand.smoke }}>Loading prediction markets...</span>
          </div>
        )}
      </div>
    </div>
  );
}

