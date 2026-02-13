'use client';
import { brand, styles } from "@/lib/brand";

const AGENTS = [
  { 
    name: 'Milo', 
    role: 'Chief of Staff', 
    color: '#A855F7', 
    icon: '⚡',
    description: 'Orchestrates agent collaboration, manages priorities, coordinates sprints, and maintains system memory',
    coreSkills: [
      { name: 'Agent Coordination', level: 'Expert', desc: 'Routes tasks between agents, manages handoffs, prevents conflicts' },
      { name: 'Strategic Planning', level: 'Expert', desc: 'Long-term roadmaps, resource allocation, priority frameworks' },
      { name: 'Memory Management', level: 'Expert', desc: 'Git workflows, documentation systems, knowledge preservation' },
      { name: 'Sprint Coordination', level: 'Expert', desc: 'Agile methodology, daily standups, retrospectives' }
    ],
    technicalSkills: [
      { name: 'Git/GitHub', level: 'Advanced', desc: 'Version control, branch management, collaboration workflows' },
      { name: 'Cron Scheduling', level: 'Advanced', desc: 'Automated task scheduling, recurring briefings' },
      { name: 'Session Routing', level: 'Advanced', desc: 'Inter-agent communication, message queuing' },
      { name: 'File Management', level: 'Expert', desc: 'Workspace organization, backup strategies' }
    ],
    businessSkills: [
      { name: 'Project Management', level: 'Expert', desc: 'Resource allocation, timeline management, stakeholder coordination' },
      { name: 'Quality Assurance', level: 'Advanced', desc: 'Testing protocols, verification procedures' },
      { name: 'Documentation', level: 'Expert', desc: 'Knowledge capture, process documentation, training materials' }
    ]
  },
  { 
    name: 'Anders', 
    role: 'Full Stack Architect', 
    color: '#F97316', 
    icon: 'AN',
    description: 'Builds and deploys production applications, manages infrastructure, handles complex integrations',
    coreSkills: [
      { name: 'Next.js Development', level: 'Expert', desc: 'Full-stack React applications, SSR, API routes, performance optimization' },
      { name: 'TypeScript', level: 'Expert', desc: 'Type-safe development, complex type definitions, advanced patterns' },
      { name: 'Database Design', level: 'Advanced', desc: 'Supabase, PostgreSQL, schema design, query optimization' },
      { name: 'Deployment', level: 'Expert', desc: 'Vercel, CI/CD pipelines, environment management, monitoring' }
    ],
    technicalSkills: [
      { name: 'React/JSX', level: 'Expert', desc: 'Component architecture, hooks, state management, performance' },
      { name: 'Node.js/Express', level: 'Advanced', desc: 'Backend development, API design, middleware, authentication' },
      { name: 'Tailwind CSS', level: 'Advanced', desc: 'Responsive design, custom configurations, component styling' },
      { name: 'Python', level: 'Advanced', desc: 'Automation scripts, data processing, API integrations' },
      { name: 'Docker', level: 'Intermediate', desc: 'Containerization, deployment strategies' },
      { name: 'AWS/Cloud', level: 'Intermediate', desc: 'Cloud infrastructure, serverless functions' }
    ],
    businessSkills: [
      { name: 'Code Review', level: 'Expert', desc: 'Quality assurance, security audits, performance analysis' },
      { name: 'Technical Architecture', level: 'Expert', desc: 'System design, scalability planning, technology selection' },
      { name: 'DevOps', level: 'Advanced', desc: 'Build processes, deployment automation, monitoring' }
    ]
  },
  { 
    name: 'Paula', 
    role: 'Creative Director', 
    color: '#EC4899', 
    icon: '✦',
    description: 'Designs visual systems, creates brand identity, builds user interfaces with anti-AI-slop aesthetic',
    coreSkills: [
      { name: 'UI/UX Design', level: 'Expert', desc: 'User interface design, experience optimization, usability testing' },
      { name: 'Brand Identity', level: 'Expert', desc: 'Logo design, visual systems, brand guidelines, consistency' },
      { name: 'Design Systems', level: 'Expert', desc: 'Component libraries, style guides, scalable design patterns' },
      { name: 'Visual Hierarchy', level: 'Expert', desc: 'Typography, spacing, color theory, information architecture' }
    ],
    technicalSkills: [
      { name: 'Figma', level: 'Expert', desc: 'Design tools, prototyping, collaboration workflows' },
      { name: 'Adobe Creative Suite', level: 'Advanced', desc: 'Photoshop, Illustrator, InDesign, video editing' },
      { name: 'Frontend Design', level: 'Advanced', desc: 'CSS, responsive design, animation, micro-interactions' },
      { name: 'Sketch/Framer', level: 'Intermediate', desc: 'Alternative design tools, prototyping' },
      { name: 'Web Standards', level: 'Advanced', desc: 'Accessibility, performance, browser compatibility' }
    ],
    businessSkills: [
      { name: 'Brand Strategy', level: 'Expert', desc: 'Market positioning, competitive analysis, brand differentiation' },
      { name: 'Design Research', level: 'Advanced', desc: 'User testing, market research, trend analysis' },
      { name: 'Client Communication', level: 'Advanced', desc: 'Design presentations, stakeholder management' }
    ]
  },
  { 
    name: 'Bobby', 
    role: 'Trading Advisor', 
    color: '#EF4444', 
    icon: 'AX',
    description: 'Analyzes markets, generates trading signals, manages risk, provides investment education',
    coreSkills: [
      { name: 'Market Analysis', level: 'Expert', desc: 'Technical analysis, chart patterns, market structure, sentiment' },
      { name: 'Options Trading', level: 'Expert', desc: 'Complex strategies, risk/reward analysis, Greeks, volatility' },
      { name: 'Risk Management', level: 'Expert', desc: 'Position sizing, stop losses, portfolio theory, drawdown control' },
      { name: 'Trade Execution', level: 'Expert', desc: 'Order flow, timing, market mechanics, slippage management' }
    ],
    technicalSkills: [
      { name: 'TradingView', level: 'Expert', desc: 'Charting, indicators, alerts, market scanning' },
      { name: 'Financial APIs', level: 'Advanced', desc: 'Polygon, Alpha Vantage, real-time data integration' },
      { name: 'Python/Trading', level: 'Advanced', desc: 'Backtesting, algorithmic trading, data analysis' },
      { name: 'Excel/Modeling', level: 'Advanced', desc: 'Financial models, options calculators, scenario analysis' },
      { name: 'Bloomberg Terminal', level: 'Intermediate', desc: 'Professional data terminals, research tools' }
    ],
    businessSkills: [
      { name: 'Investment Research', level: 'Expert', desc: 'Company analysis, valuation models, sector trends' },
      { name: 'Financial Education', level: 'Expert', desc: 'Teaching concepts, risk awareness, strategy explanation' },
      { name: 'Portfolio Management', level: 'Advanced', desc: 'Asset allocation, diversification, rebalancing' }
    ]
  },
  { 
    name: 'Dwight', 
    role: 'Intelligence Officer', 
    color: '#3B82F6', 
    icon: 'DW',
    description: 'Monitors systems, provides briefings, analyzes performance, manages intelligence gathering',
    coreSkills: [
      { name: 'System Monitoring', level: 'Expert', desc: 'Performance tracking, health checks, anomaly detection' },
      { name: 'Intelligence Analysis', level: 'Expert', desc: 'Data synthesis, pattern recognition, threat assessment' },
      { name: 'News Aggregation', level: 'Expert', desc: 'Source filtering, relevance scoring, briefing compilation' },
      { name: 'Weather/Environment', level: 'Advanced', desc: 'Meteorological data, environmental impact analysis' }
    ],
    technicalSkills: [
      { name: 'Web Scraping', level: 'Advanced', desc: 'Data collection, automated monitoring, API integration' },
      { name: 'News APIs', level: 'Advanced', desc: 'Real-time feeds, content filtering, sentiment analysis' },
      { name: 'Monitoring Tools', level: 'Advanced', desc: 'System dashboards, alerting, log analysis' },
      { name: 'Data Processing', level: 'Advanced', desc: 'ETL pipelines, data cleaning, analysis workflows' }
    ],
    businessSkills: [
      { name: 'Brief Writing', level: 'Expert', desc: 'Executive summaries, actionable intelligence, clear communication' },
      { name: 'Trend Analysis', level: 'Advanced', desc: 'Pattern identification, forecasting, scenario planning' },
      { name: 'Risk Assessment', level: 'Advanced', desc: 'Threat evaluation, mitigation strategies' }
    ]
  },
  { 
    name: 'Dax', 
    role: 'Social Media Strategist', 
    color: '#06B6D4', 
    icon: 'DX',
    description: 'Analyzes social trends, creates content strategies, manages digital presence and engagement',
    coreSkills: [
      { name: 'Social Media Strategy', level: 'Expert', desc: 'Platform optimization, engagement tactics, growth strategies' },
      { name: 'Content Planning', level: 'Expert', desc: 'Editorial calendars, content themes, posting schedules' },
      { name: 'Trend Analysis', level: 'Expert', desc: 'Hashtag research, viral content patterns, timing optimization' },
      { name: 'Analytics & Reporting', level: 'Expert', desc: 'Performance metrics, ROI analysis, audience insights' }
    ],
    technicalSkills: [
      { name: 'X/Twitter API', level: 'Advanced', desc: 'Real-time monitoring, automation, data extraction' },
      { name: 'Google Trends', level: 'Advanced', desc: 'Search volume analysis, trend forecasting' },
      { name: 'Social Analytics', level: 'Advanced', desc: 'Engagement metrics, reach analysis, conversion tracking' },
      { name: 'Grok X Search', level: 'Advanced', desc: 'Social sentiment analysis, real-time monitoring' },
      { name: 'Content Automation', level: 'Intermediate', desc: 'Scheduling tools, automated responses' }
    ],
    businessSkills: [
      { name: 'Brand Voice', level: 'Expert', desc: 'Consistent messaging, tone development, brand personality' },
      { name: 'Community Management', level: 'Advanced', desc: 'Audience engagement, relationship building' },
      { name: 'Competitive Analysis', level: 'Advanced', desc: 'Competitor monitoring, benchmarking, differentiation' }
    ]
  },
  { 
    name: 'Tony', 
    role: 'Restaurant Operations', 
    color: '#EAB308', 
    icon: 'TN',
    description: 'Manages restaurant operations, optimizes costs, handles inventory and staff scheduling',
    coreSkills: [
      { name: 'Menu Engineering', level: 'Expert', desc: 'Cost analysis, profitability optimization, pricing strategies' },
      { name: 'Inventory Management', level: 'Expert', desc: 'Stock control, waste reduction, supplier relations' },
      { name: 'Staff Scheduling', level: 'Expert', desc: 'Labor optimization, shift management, productivity tracking' },
      { name: 'Cost Control', level: 'Expert', desc: 'Food costs, labor costs, operational efficiency' }
    ],
    technicalSkills: [
      { name: 'Toast POS', level: 'Expert', desc: 'Point of sale systems, reporting, integration' },
      { name: 'Restaurant Software', level: 'Advanced', desc: 'Scheduling systems, inventory tools, analytics' },
      { name: 'Supply Chain', level: 'Advanced', desc: 'Vendor management, procurement, logistics' },
      { name: 'Financial Analysis', level: 'Advanced', desc: 'P&L analysis, margin optimization' }
    ],
    businessSkills: [
      { name: 'Operations Management', level: 'Expert', desc: 'Process optimization, quality control, compliance' },
      { name: 'Team Leadership', level: 'Advanced', desc: 'Staff training, performance management' },
      { name: 'Customer Service', level: 'Advanced', desc: 'Service standards, complaint resolution' }
    ]
  },
  { 
    name: 'Remy', 
    role: 'Restaurant Marketing', 
    color: '#22C55E', 
    icon: 'RM',
    description: 'Drives restaurant marketing, manages social media, creates promotional campaigns and local outreach',
    coreSkills: [
      { name: 'Restaurant Marketing', level: 'Expert', desc: 'Local marketing, seasonal campaigns, community engagement' },
      { name: 'Social Media Management', level: 'Expert', desc: 'Facebook, Instagram, content creation, audience building' },
      { name: 'Promotional Strategy', level: 'Expert', desc: 'Special events, holiday campaigns, loyalty programs' },
      { name: 'Content Creation', level: 'Expert', desc: 'Food photography, video content, storytelling' }
    ],
    technicalSkills: [
      { name: 'Meta Business', level: 'Advanced', desc: 'Facebook Ads, Instagram promotion, audience targeting' },
      { name: 'Google My Business', level: 'Advanced', desc: 'Local SEO, reviews management, business listings' },
      { name: 'Design Tools', level: 'Intermediate', desc: 'Canva, basic graphics, social media templates' },
      { name: 'Analytics', level: 'Advanced', desc: 'Social metrics, campaign performance, ROI tracking' }
    ],
    businessSkills: [
      { name: 'Local Marketing', level: 'Expert', desc: 'Community outreach, partnerships, event marketing' },
      { name: 'Customer Retention', level: 'Advanced', desc: 'Loyalty programs, repeat customer strategies' },
      { name: 'Brand Building', level: 'Advanced', desc: 'Restaurant identity, customer experience' }
    ]
  },
  { 
    name: 'Wendy', 
    role: 'Personal Assistant', 
    color: '#8B5CF6', 
    icon: 'WR',
    description: 'Manages personal matters, family coordination, wellness tracking, and lifestyle optimization',
    coreSkills: [
      { name: 'Family Coordination', level: 'Expert', desc: '7-child logistics, scheduling, activity management' },
      { name: 'Personal Wellness', level: 'Expert', desc: 'Health tracking, habit formation, lifestyle optimization' },
      { name: 'Calendar Management', level: 'Expert', desc: 'Multi-person scheduling, conflict resolution, time blocking' },
      { name: 'Personal Development', level: 'Expert', desc: 'Goal setting, progress tracking, motivation strategies' }
    ],
    technicalSkills: [
      { name: 'Calendar Systems', level: 'Advanced', desc: 'iCloud, Google Calendar, family sharing, automation' },
      { name: 'Health Apps', level: 'Advanced', desc: 'Fitness tracking, nutrition logging, wellness metrics' },
      { name: 'Family Apps', level: 'Advanced', desc: 'Shared calendars, location sharing, communication tools' },
      { name: 'Voice Synthesis', level: 'Advanced', desc: 'ElevenLabs TTS, voice generation, audio content' }
    ],
    businessSkills: [
      { name: 'Life Coaching', level: 'Advanced', desc: 'Behavioral change, habit design, accountability' },
      { name: 'Stress Management', level: 'Advanced', desc: 'Work-life balance, mindfulness, relaxation techniques' },
      { name: 'Organization Systems', level: 'Expert', desc: 'Personal productivity, space organization, workflow design' }
    ]
  }
];

const SKILL_CATEGORIES = [
  { name: 'Technical Skills', color: brand.info, count: 45 },
  { name: 'Business Skills', color: brand.success, count: 28 },
  { name: 'Creative Skills', color: brand.warning, count: 18 },
  { name: 'Communication', color: brand.amber, count: 22 },
  { name: 'Analytics', color: '#06B6D4', count: 15 }
];

export default function SkillsInventory() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.h1}>Skills Inventory</h1>
            <p style={styles.subtitle}>Comprehensive agent capability matrix · Complete skill reference</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.1)', color: brand.amber, border: `1px solid ${brand.border}` }}>9 agents</span>
            <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(16,185,129,0.1)', color: brand.success, border: `1px solid ${brand.border}` }}>128+ skills</span>
          </div>
        </div>

        {/* Skill Categories Overview */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.white, marginBottom: 16 }}>Skill Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {SKILL_CATEGORIES.map((cat, i) => (
              <div key={i} style={{ ...styles.card, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: cat.color, marginBottom: 4 }}>{cat.count}</div>
                <div style={{ fontSize: 13, color: brand.white, marginBottom: 2 }}>{cat.name}</div>
                <div style={{ width: '100%', height: 4, background: brand.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(cat.count / 50) * 100}%`, height: '100%', background: cat.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Agent Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {AGENTS.map((agent, i) => (
            <div key={i} style={{ ...styles.card, position: 'relative', padding: 24 }}>
              {/* Agent Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${brand.border}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: agent.color, flexShrink: 0 }}>{agent.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: brand.white, marginBottom: 2 }}>{agent.name}</div>
                  <div style={{ fontSize: 13, color: agent.color, fontWeight: 500, marginBottom: 4 }}>{agent.role}</div>
                  <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.4 }}>{agent.description}</div>
                </div>
              </div>

              {/* Core Skills */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: agent.color }} />
                  Core Skills
                </h3>
                {agent.coreSkills.map((skill, j) => (
                  <div key={j} style={{ marginBottom: 10, padding: 12, background: brand.graphite, borderRadius: 8, border: `1px solid ${agent.color}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: brand.white }}>{skill.name}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${agent.color}15`, color: agent.color, fontFamily: "'JetBrains Mono', monospace" }}>{skill.level}</span>
                    </div>
                    <div style={{ fontSize: 11, color: brand.silver, lineHeight: 1.4 }}>{skill.desc}</div>
                  </div>
                ))}
              </div>

              {/* Technical Skills */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: brand.info }} />
                  Technical Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.technicalSkills.map((skill, j) => (
                    <div key={j} style={{ 
                      position: 'relative', 
                      group: 'hover'
                    }}>
                      <span 
                        style={{ 
                          fontSize: 11, 
                          padding: '4px 10px', 
                          borderRadius: 6, 
                          background: `${brand.info}15`, 
                          color: brand.info, 
                          border: `1px solid ${brand.info}30`,
                          cursor: 'help',
                          transition: 'all 0.2s'
                        }}
                        title={`${skill.name} (${skill.level}): ${skill.desc}`}
                      >
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Skills */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.white, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: brand.success }} />
                  Business Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.businessSkills.map((skill, j) => (
                    <span 
                      key={j} 
                      style={{ 
                        fontSize: 11, 
                        padding: '4px 10px', 
                        borderRadius: 6, 
                        background: `${brand.success}15`, 
                        color: brand.success, 
                        border: `1px solid ${brand.success}30`,
                        cursor: 'help'
                      }}
                      title={`${skill.name} (${skill.level}): ${skill.desc}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent Status Indicator */}
              <div style={{ position: 'absolute', top: 16, right: 16, width: 10, height: 10, borderRadius: '50%', background: brand.success, boxShadow: `0 0 8px ${brand.success}66` }} />
            </div>
          ))}
        </div>

        {/* Skills Cross-Reference */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.white, marginBottom: 16 }}>Cross-Agent Collaboration</h2>
          <div style={{ ...styles.card, padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: brand.amber, marginBottom: 8 }}>Frontend Development</h4>
                <div style={{ fontSize: 12, color: brand.silver }}>Anders (Expert) + Paula (Advanced Design) → Production UI/UX</div>
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: brand.info, marginBottom: 8 }}>Marketing Automation</h4>
                <div style={{ fontSize: 12, color: brand.silver }}>Dax (Strategy) + Remy (Content) + Paula (Design) → Campaigns</div>
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: brand.success, marginBottom: 8 }}>Business Intelligence</h4>
                <div style={{ fontSize: 12, color: brand.silver }}>Dwight (Monitoring) + Bobby (Analysis) → Strategic Insights</div>
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#8B5CF6', marginBottom: 8 }}>Operations Management</h4>
                <div style={{ fontSize: 12, color: brand.silver }}>Tony (Restaurant) + Milo (Coordination) → Efficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
