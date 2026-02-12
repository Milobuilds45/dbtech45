'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from "@/lib/brand";
import { Calendar, ChevronLeft, ChevronRight, Newspaper, TrendingUp, Lightbulb, CheckSquare, Users, Sun, CloudRain, Cloud, Zap, MapPin, ExternalLink, RefreshCw } from 'lucide-react';

interface Brief {
  id: string;
  date: string;
  generatedAt: string;
  location: string;
  sections: {
    news: Array<{ title: string; summary: string; source: string; relevance: string; url?: string }>;
    marketSnapshot: { premarket: string; keyLevels: string[]; overnight: string };
    businessIdeas: Array<{ title: string; description: string; effort: string }>;
    todaysTasks: Array<{ task: string; priority: 'high' | 'medium' | 'low'; source: string }>;
    agentRecommendations: Array<{ task: string; agent: string; reason: string }>;
    overnightActivity: Array<{ agent: string; action: string; time: string }>;
    weather: { temp: string; condition: string; high: string; low: string; humidity?: string; wind?: string };
    quote: { text: string; author: string };
  };
}

// Fallback data while loading
const EMPTY_BRIEF: Brief = {
  id: 'loading',
  date: new Date().toISOString().split('T')[0],
  generatedAt: '--',
  location: 'Nashua, NH',
  sections: {
    news: [],
    marketSnapshot: { premarket: 'Loading...', keyLevels: [], overnight: '' },
    businessIdeas: [],
    todaysTasks: [],
    agentRecommendations: [],
    overnightActivity: [],
    weather: { temp: '--', condition: 'Loading', high: '--', low: '--' },
    quote: { text: 'Loading...', author: '' }
  }
};

export default function MorningBrief() {
  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('today');
  
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetchBrief();
  }, [selectedDate]);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/morning-brief');
      const data = await res.json();
      setBrief(data);
    } catch (e) {
      console.error('Failed to fetch brief:', e);
    } finally {
      setLoading(false);
    }
  };

  const WeatherIcon = brief.sections.weather.condition?.includes('Cloud') ? Cloud : 
                      brief.sections.weather.condition?.includes('Rain') ? CloudRain : Sun;

  const priorityColor = (p: string) => p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.smoke;

  const getRelevanceColor = (rel: string) => {
    if (rel.includes('Celtics')) return '#007A33';
    if (rel.includes('Red Sox')) return '#BD3039';
    if (rel.includes('Patriots')) return '#002244';
    if (rel.includes('Local')) return brand.info;
    if (rel.includes('Trading')) return brand.success;
    if (rel.includes('AI') || rel.includes('Tech')) return brand.amber;
    return brand.smoke;
  };

  return (
    <div style={{ ...styles.page, background: '#0A0A0A' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Newspaper Header */}
        <div style={{ borderBottom: `3px solid ${brand.amber}`, paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} style={{ color: brand.smoke }} />
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>{brief.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>
                Generated {brief.generatedAt}
              </span>
              <button 
                onClick={fetchBrief}
                disabled={loading}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: 4,
                  opacity: loading ? 0.5 : 1
                }}
              >
                <RefreshCw size={14} style={{ color: brand.smoke, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
          </div>
          
          <h1 style={{ 
            fontFamily: "'Georgia', 'Times New Roman', serif", 
            fontSize: 48, 
            fontWeight: 400, 
            color: brand.white, 
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: 8
          }}>
            The DB Tech Daily
          </h1>
          
          <div style={{ textAlign: 'center', color: brand.smoke, fontSize: 14, fontStyle: 'italic' }}>
            {formattedDate}
          </div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: brand.amber }}>
              "Trade by day. Build by night. Dad of 7 always."
            </span>
          </div>
        </div>

        {/* Top Row: Weather + Quote */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
          {/* Weather */}
          <div style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: 16 }}>
            <WeatherIcon size={40} style={{ color: brand.amber }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: brand.white }}>{brief.sections.weather.temp}</div>
              <div style={{ fontSize: 12, color: brand.smoke }}>{brief.sections.weather.condition}</div>
              <div style={{ fontSize: 11, color: brand.smoke }}>
                H: {brief.sections.weather.high} · L: {brief.sections.weather.low}
                {brief.sections.weather.humidity && ` · ${brief.sections.weather.humidity}`}
              </div>
            </div>
          </div>
          
          {/* Quote */}
          <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontStyle: 'italic', color: brand.silver, lineHeight: 1.6 }}>
              "{brief.sections.quote.text}"
            </div>
            <div style={{ fontSize: 12, color: brand.smoke, marginTop: 8 }}>— {brief.sections.quote.author}</div>
          </div>
        </div>

        {/* Market Snapshot */}
        <div style={{ ...styles.card, marginBottom: 24, borderLeft: `4px solid ${brand.success}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={18} style={{ color: brand.success }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Market Snapshot</h2>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: brand.success, marginBottom: 12 }}>{brief.sections.marketSnapshot.premarket}</div>
          {brief.sections.marketSnapshot.keyLevels.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {brief.sections.marketSnapshot.keyLevels.map((level, i) => (
                <div key={i} style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: brand.silver }}>
                  {level}
                </div>
              ))}
            </div>
          )}
          {brief.sections.marketSnapshot.overnight && (
            <div style={{ fontSize: 11, color: brand.smoke, marginTop: 12 }}>{brief.sections.marketSnapshot.overnight}</div>
          )}
        </div>

        {/* News - Full Width */}
        <div style={{ ...styles.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
            <Newspaper size={18} style={{ color: brand.amber }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Headlines</h2>
            <span style={{ fontSize: 11, color: brand.smoke, marginLeft: 'auto' }}>Nashua, NH · Boston Sports · Tech</span>
          </div>
          
          {brief.sections.news.length === 0 ? (
            <div style={{ color: brand.smoke, fontSize: 13, padding: 20, textAlign: 'center' }}>
              {loading ? 'Loading news...' : 'No news available'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {brief.sections.news.map((item, i) => (
                <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${brand.border}` }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ 
                      fontSize: 10, 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      background: `${getRelevanceColor(item.relevance)}20`, 
                      color: getRelevanceColor(item.relevance),
                      fontWeight: 600
                    }}>
                      {item.relevance}
                    </span>
                    <span style={{ fontSize: 10, color: brand.smoke }}>{item.source}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 6, lineHeight: 1.4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.5 }}>
                    {item.summary?.slice(0, 150)}{item.summary?.length > 150 ? '...' : ''}
                  </div>
                  {item.url && item.url !== '#' && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 4, 
                        fontSize: 11, 
                        color: brand.amber, 
                        marginTop: 8,
                        textDecoration: 'none'
                      }}
                    >
                      Read more <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          
          {/* Today's Tasks */}
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <CheckSquare size={18} style={{ color: brand.info }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Today's Tasks</h2>
            </div>
            {brief.sections.todaysTasks.length === 0 ? (
              <div style={{ color: brand.smoke, fontSize: 13, padding: 10 }}>No tasks scheduled</div>
            ) : (
              brief.sections.todaysTasks.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < brief.sections.todaysTasks.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor(item.priority), marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: brand.white, marginBottom: 2 }}>{item.task}</div>
                    <div style={{ fontSize: 11, color: brand.smoke }}>via {item.source}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Agent Recommendations */}
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <Users size={18} style={{ color: '#A855F7' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Work Together Today</h2>
            </div>
            {brief.sections.agentRecommendations.length === 0 ? (
              <div style={{ color: brand.smoke, fontSize: 13, padding: 10 }}>No recommendations yet</div>
            ) : (
              brief.sections.agentRecommendations.map((item, i) => (
                <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < brief.sections.agentRecommendations.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#A855F7' }}>{item.agent}</span>
                    <span style={{ fontSize: 10, color: brand.smoke }}>recommends</span>
                  </div>
                  <div style={{ fontSize: 13, color: brand.white, marginBottom: 4 }}>{item.task}</div>
                  <div style={{ fontSize: 11, color: brand.smoke, fontStyle: 'italic' }}>{item.reason}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Business Ideas */}
        {brief.sections.businessIdeas.length > 0 && (
          <div style={{ ...styles.card, marginBottom: 24, borderLeft: `4px solid ${brand.amber}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Lightbulb size={18} style={{ color: brand.amber }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Business Ideas</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {brief.sections.businessIdeas.map((idea, i) => (
                <div key={i} style={{ padding: 16, background: 'rgba(245,158,11,0.05)', borderRadius: 8, border: `1px solid ${brand.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: brand.amber, marginBottom: 6 }}>{idea.title}</div>
                  <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.5, marginBottom: 8 }}>{idea.description}</div>
                  <div style={{ fontSize: 11, color: brand.smoke }}>⏱ {idea.effort}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overnight Activity */}
        {brief.sections.overnightActivity.length > 0 && (
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <Zap size={18} style={{ color: brand.success }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Overnight Activity</h2>
            </div>
            {brief.sections.overnightActivity.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < brief.sections.overnightActivity.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke, minWidth: 70 }}>{item.time}</div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: brand.amber }}>{item.agent}</span>
                  <span style={{ fontSize: 12, color: brand.silver }}> {item.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '32px 0', borderTop: `1px solid ${brand.border}`, marginTop: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: brand.smoke }}>
            DB TECH OS · Morning Brief · {new Date().getFullYear()}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
