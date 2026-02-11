'use client';

import { useState, useRef } from 'react';
import { brand, styles } from "@/lib/brand";

interface Project {
  title: string;
  desc: string;
  status: string;
  progress: number;
  color: string;
}

const INITIAL_PROJECTS: Project[] = [
  // Shipped / Live
  { title: "Signal & Noise", desc: "Daily trading newsletter filtering market noise into actionable intelligence.", status: "Shipped", progress: 100, color: brand.success },
  { title: "Sunday Squares", desc: "Football squares game app — digital pools for game day with auto-scoring and payouts.", status: "Shipped", progress: 100, color: brand.success },
  { title: "TipSplit Pro", desc: "Professional tip calculator built for the restaurant industry.", status: "Shipped", progress: 100, color: brand.success },
  { title: "DBTech45.com", desc: "Personal site. Caffeine & Chaos brand. Homepage, /os command center, newsletters.", status: "Shipped", progress: 100, color: brand.success },
  { title: "DB Tech OS", desc: "Personal command center dashboard. Agent status, projects, markets, memory bank.", status: "Shipped", progress: 100, color: brand.success },
  { title: "Model Counsel", desc: "Multi-model AI comparison tool. Ask one question, get parallel responses from 7 LLMs.", status: "Shipped", progress: 100, color: brand.success },
  { title: "The Roundtable", desc: "AI agent debate system. Drop a topic, watch your agents argue it out in rounds.", status: "Shipped", progress: 100, color: brand.success },

  // Building
  { title: "tickR", desc: "Real-time trading dashboard with AI-powered signals, journaling, and performance analytics.", status: "Building", progress: 75, color: brand.amber },
  { title: "Soul Solace", desc: "AI-powered mental wellness companion — daily reflections, mood tracking, guided prayers.", status: "Building", progress: 60, color: brand.amber },
  { title: "Soul Solace V2", desc: "Complete rebuild with enhanced prayer engine, multi-faith support, and new UI.", status: "Building", progress: 45, color: brand.amber },
  { title: "Boundless", desc: "AI journaling app. Deeper thinking through guided prompts and reflections.", status: "Building", progress: 40, color: brand.amber },
  { title: "Kitchen Cost Tracker", desc: "Restaurant food cost and inventory management system for multi-unit operators.", status: "Building", progress: 30, color: brand.amber },
  { title: "SharpEdge AI", desc: "AI-powered trading edge finder. Pattern recognition and signal detection.", status: "Building", progress: 35, color: brand.amber },
  { title: "PickSix Pro", desc: "NFL picks and predictions platform with AI-powered analysis.", status: "Building", progress: 40, color: brand.amber },
  { title: "Ledgr", desc: "Financial ledger and bookkeeping tool for small business operators.", status: "Building", progress: 25, color: brand.amber },
  { title: "TradeScope Daily", desc: "Automated daily market briefing with AI-curated insights and trade ideas.", status: "Building", progress: 30, color: brand.amber },
  { title: "Bobby's Edge", desc: "AI trading advisor system. Market analysis, risk management, signal generation.", status: "Building", progress: 50, color: brand.amber },
  { title: "Mojo", desc: "Motivation and momentum tracker. Daily energy scoring and habit streaks.", status: "Building", progress: 20, color: brand.amber },
  { title: "Band Bot", desc: "AI-powered band/music discovery and playlist curation tool.", status: "Building", progress: 25, color: brand.amber },

  // Shaping
  { title: "Bobola's Promo", desc: "Restaurant promotional system — deals, events, and customer engagement for Bobola's.", status: "Shaping", progress: 15, color: brand.warning },
  { title: "Restaurant Accounting", desc: "Full accounting system built for restaurant operators. P&L, payroll, vendor management.", status: "Shaping", progress: 15, color: brand.warning },
  { title: "Trade Journal", desc: "Structured trading journal with tagging, review cycles, and performance analytics.", status: "Shaping", progress: 15, color: brand.warning },
  { title: "Trading X Account", desc: "Automated trading content and market commentary for X/Twitter.", status: "Shaping", progress: 10, color: brand.warning },
  { title: "Daily Pulse", desc: "Morning briefing system — news, markets, schedule, priorities in one view.", status: "Shaping", progress: 15, color: brand.warning },
  { title: "Concrete Before Curtains", desc: "Derek's book/content project. Build the foundation before the decoration.", status: "Shaping", progress: 20, color: brand.warning },
  { title: "Voice AI", desc: "Voice-powered AI assistant experiments. Conversational agents and voice UX.", status: "Shaping", progress: 10, color: brand.warning },
  { title: "SwarmKit", desc: "Framework for orchestrating multi-agent AI swarms. The infrastructure behind the team.", status: "Shaping", progress: 15, color: brand.warning },

  // Spark
  { title: "AI Idea Validator", desc: "Drop a business idea, get AI-powered validation with market analysis and scoring.", status: "Spark", progress: 5, color: brand.smoke },
  { title: "Receipt Scanner", desc: "Snap a receipt, extract line items, categorize expenses. OCR meets organization.", status: "Spark", progress: 5, color: brand.smoke },
  { title: "AI Meal Planner", desc: "Weekly meal planning powered by AI — dietary preferences, budget, family size aware.", status: "Spark", progress: 5, color: brand.smoke },
  { title: "Contractor Bidder", desc: "Streamlined contractor bidding platform with scope management and comparison tools.", status: "Spark", progress: 5, color: brand.smoke },
  { title: "Family Calendar AI", desc: "Smart family scheduling that coordinates 9 people's lives with AI conflict resolution.", status: "Spark", progress: 5, color: brand.smoke },
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [filter, setFilter] = useState<string>('all');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...projects];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, dragged);
    setProjects(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status.toLowerCase() === filter);
  const counts = {
    all: projects.length,
    shipped: projects.filter(p => p.status === 'Shipped').length,
    building: projects.filter(p => p.status === 'Building').length,
    shaping: projects.filter(p => p.status === 'Shaping').length,
    spark: projects.filter(p => p.status === 'Spark').length,
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Projects</h1>
        <p style={styles.subtitle}>
          {projects.length} projects. Drag to reorder priorities.
        </p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(['all', 'shipped', 'building', 'shaping', 'spark'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${filter === f ? brand.amber : brand.border}`,
                background: filter === f ? 'rgba(245, 158, 11, 0.1)' : brand.carbon,
                color: filter === f ? brand.amber : brand.smoke,
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          {filtered.map((p, i) => (
            <div
              key={`${p.title}-${i}`}
              draggable
              onDragStart={() => handleDragStart(projects.indexOf(p))}
              onDragEnter={() => handleDragEnter(projects.indexOf(p))}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              style={{
                ...styles.card,
                cursor: 'grab',
                userSelect: 'none' as const,
                transition: 'border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = brand.amber;
                e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = brand.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: brand.smoke, fontSize: '13px', fontWeight: 600, opacity: 0.4 }}>#{projects.indexOf(p) + 1}</span>
                  <h3 style={{ color: brand.white, margin: 0, fontSize: '16px' }}>{p.title}</h3>
                </div>
                <span style={{ color: p.color, fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '10px', background: `${p.color}15` }}>{p.status}</span>
              </div>
              <p style={{ color: brand.silver, fontSize: '13px', lineHeight: '1.5', marginBottom: '0.75rem' }}>{p.desc}</p>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                  <span style={{ color: brand.smoke }}>Progress</span>
                  <span style={{ color: p.color }}>{p.progress}%</span>
                </div>
                <div style={{ background: brand.graphite, height: '3px', borderRadius: '2px' }}>
                  <div style={{ background: p.color, width: `${p.progress}%`, height: '100%', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
