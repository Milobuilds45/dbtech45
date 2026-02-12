'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from "@/lib/brand";
import { Calendar, ChevronLeft, ChevronRight, Newspaper, TrendingUp, Lightbulb, CheckSquare, Users, Sun, CloudRain, Cloud, Zap } from 'lucide-react';

interface Brief {
  id: string;
  date: string;
  generatedAt: string;
  sections: {
    news: Array<{ title: string; summary: string; source: string; relevance: string }>;
    marketSnapshot: { premarket: string; keyLevels: string[]; overnight: string };
    businessIdeas: Array<{ title: string; description: string; effort: string }>;
    todaysTasks: Array<{ task: string; priority: 'high' | 'medium' | 'low'; source: string }>;
    agentRecommendations: Array<{ task: string; agent: string; reason: string }>;
    overnightActivity: Array<{ agent: string; action: string; time: string }>;
    weather: { temp: string; condition: string; high: string; low: string };
    quote: { text: string; author: string };
  };
}

// Sample data - will be replaced with API/database
const SAMPLE_BRIEF: Brief = {
  id: 'brief-2024-02-12',
  date: '2024-02-12',
  generatedAt: '6:00 AM',
  sections: {
    news: [
      { title: 'OpenAI Announces GPT-5 Development Timeline', summary: 'Sam Altman hints at major capabilities upgrade coming Q3 2024, focus on reasoning and multi-modal integration.', source: 'TechCrunch', relevance: 'AI/Building' },
      { title: 'Retail Traders Return to Options Markets', summary: 'Options volume hits 2024 high as retail participation surges on tech earnings momentum.', source: 'Bloomberg', relevance: 'Trading' },
      { title: 'Small Business AI Adoption Doubles', summary: 'Survey shows 47% of small businesses now use AI tools daily, up from 23% last year.', source: 'WSJ', relevance: 'SaaS/Building' },
    ],
    marketSnapshot: {
      premarket: 'ES +0.3% | NQ +0.5% | Futures green across the board',
      keyLevels: ['ES Support: 6040 | Resistance: 6080', 'NQ Support: 17,800 | Resistance: 18,000', 'VIX at 14.2 (low vol environment)'],
      overnight: 'Asia closed mixed. Europe up 0.4%. Dollar slightly weaker.'
    },
    businessIdeas: [
      { title: 'AI Receipt Scanner for Restaurants', description: 'Snap photo → extract line items → auto-categorize expenses. Perfect for Bobola\'s cost tracking.', effort: '2-3 weeks' },
      { title: 'Parent Coordination App', description: 'AI assigns household tasks across family members based on schedules. Built for large families.', effort: '4-6 weeks' },
      { title: 'Trading Journal Voice Assistant', description: 'Speak your trades, AI logs and analyzes patterns. No typing required.', effort: '3-4 weeks' },
    ],
    todaysTasks: [
      { task: 'Review Sunday Squares final QA', priority: 'high', source: 'Milo' },
      { task: 'Approve Concrete Before Curtains landing page', priority: 'high', source: 'Paula' },
      { task: 'Check ES 6040 support level for potential entry', priority: 'medium', source: 'Bobby' },
      { task: 'Weekly family calendar sync', priority: 'medium', source: 'Personal' },
      { task: 'Review agent overnight commits', priority: 'low', source: 'System' },
    ],
    agentRecommendations: [
      { task: 'Deploy MenuSparks v2 to production', agent: 'Anders', reason: 'All tests passing, ready for launch' },
      { task: 'Write Signal & Noise #13 draft', agent: 'Dax', reason: 'Wednesday deadline approaching' },
      { task: 'Brand refresh for The Pour Plan', agent: 'Paula', reason: 'Design assets complete, needs review' },
    ],
    overnightActivity: [
      { agent: 'Anders', action: 'Deployed AxeCap Terminal hotfix', time: '2:34 AM' },
      { agent: 'Milo', action: 'Updated project priorities for Q1', time: '11:45 PM' },
      { agent: 'Bobby', action: 'Generated morning market analysis', time: '5:30 AM' },
    ],
    weather: { temp: '42°F', condition: 'Partly Cloudy', high: '52°F', low: '38°F' },
    quote: { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' }
  }
};

const DATES = [
  { date: '2024-02-12', label: 'Today' },
  { date: '2024-02-11', label: 'Yesterday' },
  { date: '2024-02-10', label: 'Feb 10' },
  { date: '2024-02-09', label: 'Feb 9' },
  { date: '2024-02-08', label: 'Feb 8' },
];

export default function MorningBrief() {
  const [selectedDate, setSelectedDate] = useState(DATES[0].date);
  const [brief, setBrief] = useState<Brief>(SAMPLE_BRIEF);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const WeatherIcon = brief.sections.weather.condition.includes('Cloud') ? Cloud : 
                      brief.sections.weather.condition.includes('Rain') ? CloudRain : Sun;

  const priorityColor = (p: string) => p === 'high' ? brand.error : p === 'medium' ? brand.amber : brand.smoke;

  return (
    <div style={{ ...styles.page, background: '#0A0A0A' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Newspaper Header */}
        <div style={{ borderBottom: `3px solid ${brand.amber}`, paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Vol. MMXXIV · No. {now.getDate()}
            </div>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: brand.smoke }}>
              Generated at {brief.generatedAt}
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

          {/* Date Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {DATES.map(d => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: selectedDate === d.date ? brand.amber : 'transparent',
                  color: selectedDate === d.date ? brand.void : brand.smoke,
                  border: `1px solid ${selectedDate === d.date ? brand.amber : brand.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {d.label}
              </button>
            ))}
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
              <div style={{ fontSize: 11, color: brand.smoke }}>H: {brief.sections.weather.high} · L: {brief.sections.weather.low}</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {brief.sections.marketSnapshot.keyLevels.map((level, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: brand.silver }}>
                {level}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: brand.smoke, marginTop: 12 }}>{brief.sections.marketSnapshot.overnight}</div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          
          {/* News */}
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <Newspaper size={18} style={{ color: brand.amber }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Headlines</h2>
            </div>
            {brief.sections.news.map((item, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < brief.sections.news.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 4, lineHeight: 1.4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.5, marginBottom: 6 }}>{item.summary}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: brand.smoke }}>{item.source}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: brand.amber }}>{item.relevance}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Tasks */}
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <CheckSquare size={18} style={{ color: brand.info }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Today's Tasks</h2>
            </div>
            {brief.sections.todaysTasks.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < brief.sections.todaysTasks.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor(item.priority), marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: brand.white, marginBottom: 2 }}>{item.task}</div>
                  <div style={{ fontSize: 11, color: brand.smoke }}>via {item.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Ideas */}
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

        {/* Agent Recommendations + Overnight Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* Agent Recommendations */}
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <Users size={18} style={{ color: '#A855F7' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Work Together Today</h2>
            </div>
            {brief.sections.agentRecommendations.map((item, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < brief.sections.agentRecommendations.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#A855F7' }}>{item.agent}</span>
                  <span style={{ fontSize: 10, color: brand.smoke }}>recommends</span>
                </div>
                <div style={{ fontSize: 13, color: brand.white, marginBottom: 4 }}>{item.task}</div>
                <div style={{ fontSize: 11, color: brand.smoke, fontStyle: 'italic' }}>{item.reason}</div>
              </div>
            ))}
          </div>

          {/* Overnight Activity */}
          <div style={{ ...styles.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
              <Zap size={18} style={{ color: brand.success }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: brand.white, margin: 0 }}>Overnight Activity</h2>
            </div>
            {brief.sections.overnightActivity.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < brief.sections.overnightActivity.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: brand.smoke, minWidth: 60 }}>{item.time}</div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: brand.amber }}>{item.agent}</span>
                  <span style={{ fontSize: 12, color: brand.silver }}> {item.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '32px 0', borderTop: `1px solid ${brand.border}`, marginTop: 32 }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 12, color: brand.smoke, fontStyle: 'italic' }}>
            "Trade by day. Build by night. Dad of 7 always."
          </div>
        </div>
      </div>
    </div>
  );
}
