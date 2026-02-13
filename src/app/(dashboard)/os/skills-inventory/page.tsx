'use client';
import { useState, useMemo } from 'react';

/* ───────────────── Design Tokens (Paula's spec) ───────────────── */
const T = {
  bg:        '#0A0A0A',
  card:      '#111111',
  elevated:  '#18181B',
  amber:     '#F59E0B',
  text:      '#FAFAFA',
  secondary: '#A1A1AA',
  muted:     '#71717A',
  border:    '#27272A',
  green:     '#22C55E',
  red:       '#EF4444',
};

const levelColor: Record<string, { bg: string; text: string }> = {
  Expert:       { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E' },
  Advanced:     { bg: 'rgba(59,130,246,0.15)',  text: '#3B82F6' },
  Intermediate: { bg: 'rgba(168,85,247,0.15)',  text: '#A855F7' },
};

/* ───────────────── Interfaces ───────────────── */
interface Skill { name: string; level: 'Expert' | 'Advanced' | 'Intermediate'; desc: string }
interface Agent {
  name: string; role: string; color: string; icon: string; description: string;
  coreSkills: Skill[]; technicalSkills: Skill[]; businessSkills: Skill[];
}
interface InventorySkill { name: string; icon: string; purpose: string; ready: boolean; dependency?: string }
interface SkillCategory { name: string; color: string; skills: InventorySkill[] }
type ViewMode = 'agent' | 'category' | 'status';
type FilterCategory = 'All' | 'Technical' | 'Business' | 'Core';

/* ───────────────── Agent Data ───────────────── */
const AGENTS: Agent[] = [
  {
    name: 'Milo', role: 'Chief of Staff', color: '#A855F7', icon: '⚡',
    description: 'Orchestrates agent collaboration, manages priorities, coordinates sprints, and maintains system memory',
    coreSkills: [
      { name: 'Agent Coordination', level: 'Expert', desc: 'Routes tasks between agents, manages handoffs, prevents conflicts' },
      { name: 'Strategic Planning', level: 'Expert', desc: 'Long-term roadmaps, resource allocation, priority frameworks' },
      { name: 'Memory Management', level: 'Expert', desc: 'Git workflows, documentation systems, knowledge preservation' },
      { name: 'Sprint Coordination', level: 'Expert', desc: 'Agile methodology, daily standups, retrospectives' },
    ],
    technicalSkills: [
      { name: 'Git/GitHub', level: 'Advanced', desc: 'Version control, branch management, collaboration workflows' },
      { name: 'Cron Scheduling', level: 'Advanced', desc: 'Automated task scheduling, recurring briefings' },
      { name: 'Session Routing', level: 'Advanced', desc: 'Inter-agent communication, message queuing' },
      { name: 'File Management', level: 'Expert', desc: 'Workspace organization, backup strategies' },
    ],
    businessSkills: [
      { name: 'Project Management', level: 'Expert', desc: 'Resource allocation, timeline management, stakeholder coordination' },
      { name: 'Quality Assurance', level: 'Advanced', desc: 'Testing protocols, verification procedures' },
      { name: 'Documentation', level: 'Expert', desc: 'Knowledge capture, process documentation, training materials' },
    ],
  },
  {
    name: 'Anders', role: 'Full Stack Architect', color: '#F97316', icon: 'AN',
    description: 'Builds and deploys production applications, manages infrastructure, handles complex integrations',
    coreSkills: [
      { name: 'Next.js Development', level: 'Expert', desc: 'Full-stack React applications, SSR, API routes, performance optimization' },
      { name: 'TypeScript', level: 'Expert', desc: 'Type-safe development, complex type definitions, advanced patterns' },
      { name: 'Database Design', level: 'Advanced', desc: 'Supabase, PostgreSQL, schema design, query optimization' },
      { name: 'Deployment', level: 'Expert', desc: 'Vercel, CI/CD pipelines, environment management, monitoring' },
    ],
    technicalSkills: [
      { name: 'React/JSX', level: 'Expert', desc: 'Component architecture, hooks, state management, performance' },
      { name: 'Node.js/Express', level: 'Advanced', desc: 'Backend development, API design, middleware, authentication' },
      { name: 'Tailwind CSS', level: 'Advanced', desc: 'Responsive design, custom configurations, component styling' },
      { name: 'Python', level: 'Advanced', desc: 'Automation scripts, data processing, API integrations' },
      { name: 'Docker', level: 'Intermediate', desc: 'Containerization, deployment strategies' },
      { name: 'AWS/Cloud', level: 'Intermediate', desc: 'Cloud infrastructure, serverless functions' },
    ],
    businessSkills: [
      { name: 'Code Review', level: 'Expert', desc: 'Quality assurance, security audits, performance analysis' },
      { name: 'Technical Architecture', level: 'Expert', desc: 'System design, scalability planning, technology selection' },
      { name: 'DevOps', level: 'Advanced', desc: 'Build processes, deployment automation, monitoring' },
    ],
  },
  {
    name: 'Paula', role: 'Creative Director', color: '#EC4899', icon: '✦',
    description: 'Designs visual systems, creates brand identity, builds user interfaces with anti-AI-slop aesthetic',
    coreSkills: [
      { name: 'UI/UX Design', level: 'Expert', desc: 'User interface design, experience optimization, usability testing' },
      { name: 'Brand Identity', level: 'Expert', desc: 'Logo design, visual systems, brand guidelines, consistency' },
      { name: 'Design Systems', level: 'Expert', desc: 'Component libraries, style guides, scalable design patterns' },
      { name: 'Visual Hierarchy', level: 'Expert', desc: 'Typography, spacing, color theory, information architecture' },
    ],
    technicalSkills: [
      { name: 'Figma', level: 'Expert', desc: 'Design tools, prototyping, collaboration workflows' },
      { name: 'Adobe Creative Suite', level: 'Advanced', desc: 'Photoshop, Illustrator, InDesign, video editing' },
      { name: 'Frontend Design', level: 'Advanced', desc: 'CSS, responsive design, animation, micro-interactions' },
      { name: 'Sketch/Framer', level: 'Intermediate', desc: 'Alternative design tools, prototyping' },
      { name: 'Web Standards', level: 'Advanced', desc: 'Accessibility, performance, browser compatibility' },
    ],
    businessSkills: [
      { name: 'Brand Strategy', level: 'Expert', desc: 'Market positioning, competitive analysis, brand differentiation' },
      { name: 'Design Research', level: 'Advanced', desc: 'User testing, market research, trend analysis' },
      { name: 'Client Communication', level: 'Advanced', desc: 'Design presentations, stakeholder management' },
    ],
  },
  {
    name: 'Bobby', role: 'Trading Advisor', color: '#EF4444', icon: 'AX',
    description: 'Analyzes markets, generates trading signals, manages risk, provides investment education',
    coreSkills: [
      { name: 'Market Analysis', level: 'Expert', desc: 'Technical analysis, chart patterns, market structure, sentiment' },
      { name: 'Options Trading', level: 'Expert', desc: 'Complex strategies, risk/reward analysis, Greeks, volatility' },
      { name: 'Risk Management', level: 'Expert', desc: 'Position sizing, stop losses, portfolio theory, drawdown control' },
      { name: 'Trade Execution', level: 'Expert', desc: 'Order flow, timing, market mechanics, slippage management' },
    ],
    technicalSkills: [
      { name: 'TradingView', level: 'Expert', desc: 'Charting, indicators, alerts, market scanning' },
      { name: 'Financial APIs', level: 'Advanced', desc: 'Polygon, Alpha Vantage, real-time data integration' },
      { name: 'Python/Trading', level: 'Advanced', desc: 'Backtesting, algorithmic trading, data analysis' },
      { name: 'Excel/Modeling', level: 'Advanced', desc: 'Financial models, options calculators, scenario analysis' },
      { name: 'Bloomberg Terminal', level: 'Intermediate', desc: 'Professional data terminals, research tools' },
    ],
    businessSkills: [
      { name: 'Investment Research', level: 'Expert', desc: 'Company analysis, valuation models, sector trends' },
      { name: 'Financial Education', level: 'Expert', desc: 'Teaching concepts, risk awareness, strategy explanation' },
      { name: 'Portfolio Management', level: 'Advanced', desc: 'Asset allocation, diversification, rebalancing' },
    ],
  },
  {
    name: 'Dwight', role: 'Intelligence Officer', color: '#3B82F6', icon: 'DW',
    description: 'Monitors systems, provides briefings, analyzes performance, manages intelligence gathering',
    coreSkills: [
      { name: 'System Monitoring', level: 'Expert', desc: 'Performance tracking, health checks, anomaly detection' },
      { name: 'Intelligence Analysis', level: 'Expert', desc: 'Data synthesis, pattern recognition, threat assessment' },
      { name: 'News Aggregation', level: 'Expert', desc: 'Source filtering, relevance scoring, briefing compilation' },
      { name: 'Weather/Environment', level: 'Advanced', desc: 'Meteorological data, environmental impact analysis' },
    ],
    technicalSkills: [
      { name: 'Web Scraping', level: 'Advanced', desc: 'Data collection, automated monitoring, API integration' },
      { name: 'News APIs', level: 'Advanced', desc: 'Real-time feeds, content filtering, sentiment analysis' },
      { name: 'Monitoring Tools', level: 'Advanced', desc: 'System dashboards, alerting, log analysis' },
      { name: 'Data Processing', level: 'Advanced', desc: 'ETL pipelines, data cleaning, analysis workflows' },
    ],
    businessSkills: [
      { name: 'Brief Writing', level: 'Expert', desc: 'Executive summaries, actionable intelligence, clear communication' },
      { name: 'Trend Analysis', level: 'Advanced', desc: 'Pattern identification, forecasting, scenario planning' },
      { name: 'Risk Assessment', level: 'Advanced', desc: 'Threat evaluation, mitigation strategies' },
    ],
  },
  {
    name: 'Dax', role: 'Social Media Strategist', color: '#06B6D4', icon: 'DX',
    description: 'Analyzes social trends, creates content strategies, manages digital presence and engagement',
    coreSkills: [
      { name: 'Social Media Strategy', level: 'Expert', desc: 'Platform optimization, engagement tactics, growth strategies' },
      { name: 'Content Planning', level: 'Expert', desc: 'Editorial calendars, content themes, posting schedules' },
      { name: 'Trend Analysis', level: 'Expert', desc: 'Hashtag research, viral content patterns, timing optimization' },
      { name: 'Analytics & Reporting', level: 'Expert', desc: 'Performance metrics, ROI analysis, audience insights' },
    ],
    technicalSkills: [
      { name: 'X/Twitter API', level: 'Advanced', desc: 'Real-time monitoring, automation, data extraction' },
      { name: 'Google Trends', level: 'Advanced', desc: 'Search volume analysis, trend forecasting' },
      { name: 'Social Analytics', level: 'Advanced', desc: 'Engagement metrics, reach analysis, conversion tracking' },
      { name: 'Grok X Search', level: 'Advanced', desc: 'Social sentiment analysis, real-time monitoring' },
      { name: 'Content Automation', level: 'Intermediate', desc: 'Scheduling tools, automated responses' },
    ],
    businessSkills: [
      { name: 'Brand Voice', level: 'Expert', desc: 'Consistent messaging, tone development, brand personality' },
      { name: 'Community Management', level: 'Advanced', desc: 'Audience engagement, relationship building' },
      { name: 'Competitive Analysis', level: 'Advanced', desc: 'Competitor monitoring, benchmarking, differentiation' },
    ],
  },
  {
    name: 'Tony', role: 'Restaurant Operations', color: '#EAB308', icon: 'TN',
    description: 'Manages restaurant operations, optimizes costs, handles inventory and staff scheduling',
    coreSkills: [
      { name: 'Menu Engineering', level: 'Expert', desc: 'Cost analysis, profitability optimization, pricing strategies' },
      { name: 'Inventory Management', level: 'Expert', desc: 'Stock control, waste reduction, supplier relations' },
      { name: 'Staff Scheduling', level: 'Expert', desc: 'Labor optimization, shift management, productivity tracking' },
      { name: 'Cost Control', level: 'Expert', desc: 'Food costs, labor costs, operational efficiency' },
    ],
    technicalSkills: [
      { name: 'Toast POS', level: 'Expert', desc: 'Point of sale systems, reporting, integration' },
      { name: 'Restaurant Software', level: 'Advanced', desc: 'Scheduling systems, inventory tools, analytics' },
      { name: 'Supply Chain', level: 'Advanced', desc: 'Vendor management, procurement, logistics' },
      { name: 'Financial Analysis', level: 'Advanced', desc: 'P&L analysis, margin optimization' },
    ],
    businessSkills: [
      { name: 'Operations Management', level: 'Expert', desc: 'Process optimization, quality control, compliance' },
      { name: 'Team Leadership', level: 'Advanced', desc: 'Staff training, performance management' },
      { name: 'Customer Service', level: 'Advanced', desc: 'Service standards, complaint resolution' },
    ],
  },
  {
    name: 'Remy', role: 'Restaurant Marketing', color: '#22C55E', icon: 'RM',
    description: 'Drives restaurant marketing, manages social media, creates promotional campaigns and local outreach',
    coreSkills: [
      { name: 'Restaurant Marketing', level: 'Expert', desc: 'Local marketing, seasonal campaigns, community engagement' },
      { name: 'Social Media Management', level: 'Expert', desc: 'Facebook, Instagram, content creation, audience building' },
      { name: 'Promotional Strategy', level: 'Expert', desc: 'Special events, holiday campaigns, loyalty programs' },
      { name: 'Content Creation', level: 'Expert', desc: 'Food photography, video content, storytelling' },
    ],
    technicalSkills: [
      { name: 'Meta Business', level: 'Advanced', desc: 'Facebook Ads, Instagram promotion, audience targeting' },
      { name: 'Google My Business', level: 'Advanced', desc: 'Local SEO, reviews management, business listings' },
      { name: 'Design Tools', level: 'Intermediate', desc: 'Canva, basic graphics, social media templates' },
      { name: 'Analytics', level: 'Advanced', desc: 'Social metrics, campaign performance, ROI tracking' },
    ],
    businessSkills: [
      { name: 'Local Marketing', level: 'Expert', desc: 'Community outreach, partnerships, event marketing' },
      { name: 'Customer Retention', level: 'Advanced', desc: 'Loyalty programs, repeat customer strategies' },
      { name: 'Brand Building', level: 'Advanced', desc: 'Restaurant identity, customer experience' },
    ],
  },
  {
    name: 'Wendy', role: 'Personal Assistant', color: '#8B5CF6', icon: 'WR',
    description: 'Manages personal matters, family coordination, wellness tracking, and lifestyle optimization',
    coreSkills: [
      { name: 'Family Coordination', level: 'Expert', desc: '7-child logistics, scheduling, activity management' },
      { name: 'Personal Wellness', level: 'Expert', desc: 'Health tracking, habit formation, lifestyle optimization' },
      { name: 'Calendar Management', level: 'Expert', desc: 'Multi-person scheduling, conflict resolution, time blocking' },
      { name: 'Personal Development', level: 'Expert', desc: 'Goal setting, progress tracking, motivation strategies' },
    ],
    technicalSkills: [
      { name: 'Calendar Systems', level: 'Advanced', desc: 'iCloud, Google Calendar, family sharing, automation' },
      { name: 'Health Apps', level: 'Advanced', desc: 'Fitness tracking, nutrition logging, wellness metrics' },
      { name: 'Family Apps', level: 'Advanced', desc: 'Shared calendars, location sharing, communication tools' },
      { name: 'Voice Synthesis', level: 'Advanced', desc: 'ElevenLabs TTS, voice generation, audio content' },
    ],
    businessSkills: [
      { name: 'Life Coaching', level: 'Advanced', desc: 'Behavioral change, habit design, accountability' },
      { name: 'Stress Management', level: 'Advanced', desc: 'Work-life balance, mindfulness, relaxation techniques' },
      { name: 'Organization Systems', level: 'Expert', desc: 'Personal productivity, space organization, workflow design' },
    ],
  },
];

const COLLABORATIONS = [
  { title: 'Frontend Development', agents: ['Anders', 'Paula'], desc: 'Anders (Expert) + Paula (Advanced Design) → Production UI/UX', color: T.amber },
  { title: 'Marketing Automation', agents: ['Dax', 'Remy', 'Paula'], desc: 'Dax (Strategy) + Remy (Content) + Paula (Design) → Campaigns', color: '#3B82F6' },
  { title: 'Business Intelligence', agents: ['Dwight', 'Bobby'], desc: 'Dwight (Monitoring) + Bobby (Analysis) → Strategic Insights', color: '#22C55E' },
  { title: 'Operations Management', agents: ['Tony', 'Milo'], desc: 'Tony (Restaurant) + Milo (Coordination) → Efficiency', color: '#8B5CF6' },
  { title: 'Family & Wellness', agents: ['Wendy', 'Milo'], desc: 'Wendy (Personal) + Milo (Scheduling) → Life Balance', color: '#EC4899' },
  { title: 'Content Pipeline', agents: ['Paula', 'Dax', 'Anders'], desc: 'Paula (Design) + Dax (Strategy) + Anders (Deploy) → Full Pipeline', color: '#06B6D4' },
];

/* ───────────────── Inventory Skill Data (from SKILLS_INVENTORY.md) ───────────────── */
const READY_CATEGORIES: SkillCategory[] = [
  {
    name: 'Development & Integration', color: '#3B82F6',
    skills: [
      { name: 'coding-agent', icon: '🧩', purpose: 'Run Codex CLI, Claude Code, OpenCode via background process', ready: true },
      { name: 'gemini', icon: '♊️', purpose: 'Gemini CLI for Q&A, summaries, generation', ready: true },
      { name: 'github', icon: '📦', purpose: 'GitHub CLI - issues, PRs, CI runs, API queries', ready: true },
      { name: 'mcporter', icon: '📦', purpose: 'MCP servers/tools - list, configure, auth, call directly', ready: true },
      { name: 'skill-creator', icon: '📦', purpose: 'Create/update AgentSkills - design, structure, package', ready: true },
      { name: 'notion', icon: '📝', purpose: 'Notion API - pages, databases, blocks management', ready: true },
      { name: 'slack', icon: '📦', purpose: 'Slack control - reactions, pins, channel/DM management', ready: true },
    ],
  },
  {
    name: 'Content & Communication', color: '#8B5CF6',
    skills: [
      { name: 'bird', icon: '🐦', purpose: 'X/Twitter CLI - reading, searching, posting, engagement', ready: true },
      { name: 'bluebubbles', icon: '📦', purpose: 'BlueBubbles channel plugin - extension, REST, webhooks', ready: true },
      { name: 'content-research-writer', icon: '📦', purpose: 'Research, citations, hooks, outlines, feedback', ready: true },
      { name: 'daily-brief', icon: '📰', purpose: 'Personalized morning news briefing', ready: true },
      { name: 'deep-research', icon: '📦', purpose: 'Autonomous Gemini research - market analysis, reviews', ready: true },
      { name: 'technews', icon: '📦', purpose: 'TechMeme aggregation with social media reactions', ready: true },
      { name: 'internal-comms', icon: '📦', purpose: 'Status reports, updates, newsletters, incident reports', ready: true },
      { name: 'work-report', icon: '📦', purpose: 'Git commit reports - daily standup, weekly summaries', ready: true },
    ],
  },
  {
    name: 'Design & Creative', color: '#EC4899',
    skills: [
      { name: 'algorithmic-art', icon: '📦', purpose: 'p5.js generative art with seeded randomness', ready: true },
      { name: 'brand-guidelines', icon: '📦', purpose: 'Consistent brand colors and typography application', ready: true },
      { name: 'canvas-design', icon: '📦', purpose: 'Visual art in PNG/PDF with design philosophy', ready: true },
      { name: 'frontend-design', icon: '📦', purpose: 'Production-grade interfaces avoiding AI aesthetics', ready: true },
      { name: 'ui-ux-pro-max', icon: '📦', purpose: '50 styles, 21 palettes, 50 fonts, 9 stacks', ready: true },
      { name: 'web-asset-generator', icon: '📦', purpose: 'Favicons, app icons, social media meta images', ready: true },
      { name: 'remotion-video-toolkit', icon: '📦', purpose: 'Programmatic video with React - animations, rendering', ready: true },
      { name: 'music', icon: '📦', purpose: 'ElevenLabs Music API - tracks, lyrics, compositions', ready: true },
      { name: 'sound-effects', icon: '📦', purpose: 'Audio textures, ambient sounds, UI sounds', ready: true },
    ],
  },
  {
    name: 'Business Intelligence', color: '#F59E0B',
    skills: [
      { name: 'market-intel', icon: '📊', purpose: 'Foodservice commodity prices, supply chain', ready: true },
      { name: 'options-scan', icon: '📈', purpose: 'Mispriced options and unusual activity scanning', ready: true },
      { name: 'twitter-monitor', icon: '🐦', purpose: 'Monitor specific Twitter/X accounts for posts', ready: true },
      { name: 'x-trends', icon: '🐦', purpose: 'X/Twitter trending topics in coding, AI, tools', ready: true },
      { name: 'brainstorming', icon: '📦', purpose: 'Transform ideas into designs through questioning', ready: true },
      { name: 'conventional-commits', icon: '📦', purpose: 'Standard commit message formatting', ready: true },
      { name: 'executing-plans', icon: '📦', purpose: 'Execute implementation plans with checkpoints', ready: true },
      { name: 'pdf-processing', icon: '📦', purpose: 'Read, extract, process PDFs with Python', ready: true },
    ],
  },
  {
    name: 'AI & Voice Technologies', color: '#06B6D4',
    skills: [
      { name: 'agents', icon: '📦', purpose: 'ElevenLabs voice AI assistants and characters', ready: true },
      { name: 'setup-api-key', icon: '📦', purpose: 'ElevenLabs API key setup guide', ready: true },
      { name: 'speech-to-text', icon: '📦', purpose: 'ElevenLabs Scribe v2 transcription', ready: true },
      { name: 'text-to-speech', icon: '📦', purpose: 'ElevenLabs voice synthesis in 70+ languages', ready: true },
      { name: 'mcp-builder', icon: '📦', purpose: 'Build MCP servers for external API integration', ready: true },
    ],
  },
  {
    name: 'System Architecture', color: '#A855F7',
    skills: [
      { name: 'context-optimization', icon: '📦', purpose: 'Token efficiency, compaction, partitioning', ready: true },
      { name: 'memory-systems', icon: '📦', purpose: 'Agent memory architectures, knowledge graphs', ready: true },
      { name: 'multi-agent-patterns', icon: '📦', purpose: 'Supervisor, swarm, hierarchical coordination', ready: true },
      { name: 'project-context-sync', icon: '📦', purpose: 'Living project state docs updated per commit', ready: true },
    ],
  },
];

const MISSING_CATEGORIES: SkillCategory[] = [
  {
    name: 'Security & Authentication', color: '#EF4444',
    skills: [
      { name: '1password', icon: '🔐', purpose: '1Password CLI integration', ready: false, dependency: '1Password CLI' },
      { name: 'oracle', icon: '🧿', purpose: 'Oracle CLI prompt + file bundling', ready: false, dependency: 'Oracle CLI' },
      { name: 'session-logs', icon: '📜', purpose: 'Search/analyze session logs with jq', ready: false, dependency: 'jq CLI' },
    ],
  },
  {
    name: 'Apple Ecosystem', color: '#EF4444',
    skills: [
      { name: 'apple-notes', icon: '📝', purpose: 'Apple Notes via memo CLI', ready: false, dependency: 'memo CLI (macOS)' },
      { name: 'apple-reminders', icon: '⏰', purpose: 'Apple Reminders via remindctl CLI', ready: false, dependency: 'remindctl CLI (macOS)' },
      { name: 'bear-notes', icon: '🐻', purpose: 'Bear notes via grizzly CLI', ready: false, dependency: 'grizzly CLI (macOS)' },
      { name: 'things-mac', icon: '✅', purpose: 'Things 3 task management', ready: false, dependency: 'Things 3 (macOS)' },
    ],
  },
  {
    name: 'Media & Entertainment', color: '#EF4444',
    skills: [
      { name: 'camsnap', icon: '📸', purpose: 'RTSP/ONVIF camera capture', ready: false, dependency: 'RTSP camera setup' },
      { name: 'gifgrep', icon: '🧲', purpose: 'GIF provider search with CLI/TUI', ready: false, dependency: 'gifgrep CLI' },
      { name: 'songsee', icon: '🌊', purpose: 'Audio spectrograms and visualizations', ready: false, dependency: 'songsee CLI' },
      { name: 'sonoscli', icon: '🔊', purpose: 'Sonos speaker control', ready: false, dependency: 'Sonos network + CLI' },
      { name: 'spotify-player', icon: '🎵', purpose: 'Terminal Spotify via spogo', ready: false, dependency: 'spogo CLI + Spotify Premium' },
      { name: 'video-frames', icon: '🎞️', purpose: 'Video frame extraction with ffmpeg', ready: false, dependency: 'ffmpeg' },
      { name: 'voice-call', icon: '📞', purpose: 'Clawdbot voice call plugin', ready: false, dependency: 'Voice call plugin' },
    ],
  },
  {
    name: 'Communication & Productivity', color: '#EF4444',
    skills: [
      { name: 'himalaya', icon: '📧', purpose: 'IMAP/SMTP email management', ready: false, dependency: 'himalaya CLI' },
      { name: 'imsg', icon: '📨', purpose: 'iMessage/SMS CLI', ready: false, dependency: 'imsg CLI (macOS)' },
      { name: 'wacli', icon: '📱', purpose: 'WhatsApp message sending/sync', ready: false, dependency: 'wacli CLI' },
      { name: 'summarize', icon: '🧾', purpose: 'URL/podcast/file summarization', ready: false, dependency: 'summarize CLI' },
      { name: 'tmux', icon: '🧵', purpose: 'Remote tmux session control', ready: false, dependency: 'tmux' },
      { name: 'trello', icon: '📋', purpose: 'Trello boards, lists, cards management', ready: false, dependency: 'Trello API key' },
      { name: 'blogwatcher', icon: '📰', purpose: 'Blog/RSS feed monitoring', ready: false, dependency: 'blogwatcher CLI' },
      { name: 'clawdhub', icon: '📦', purpose: 'ClawdHub CLI for skill management', ready: false, dependency: 'clawdhub CLI' },
    ],
  },
  {
    name: 'Smart Home & IoT', color: '#EF4444',
    skills: [
      { name: 'eightctl', icon: '🎛️', purpose: 'Eight Sleep pod control', ready: false, dependency: 'Eight Sleep + eightctl' },
      { name: 'blucli', icon: '🫐', purpose: 'BluOS CLI for audio systems', ready: false, dependency: 'blucli CLI' },
      { name: 'openhue', icon: '💡', purpose: 'Philips Hue lights/scenes control', ready: false, dependency: 'Hue Bridge + openhue' },
      { name: 'weather', icon: '🌤️', purpose: 'Weather and forecasts', ready: false, dependency: 'Weather API key' },
    ],
  },
  {
    name: 'Development Tools', color: '#EF4444',
    skills: [
      { name: 'nano-banana-pro', icon: '🍌', purpose: 'Gemini 3 Pro image generation/editing', ready: false, dependency: 'Gemini Pro API' },
      { name: 'nano-pdf', icon: '📄', purpose: 'Natural language PDF editing', ready: false, dependency: 'nano-pdf CLI' },
      { name: 'openai-image-gen', icon: '🖼️', purpose: 'Batch OpenAI image generation', ready: false, dependency: 'OpenAI API key' },
      { name: 'openai-whisper', icon: '🎙️', purpose: 'Local speech-to-text (no API)', ready: false, dependency: 'whisper model' },
      { name: 'openai-whisper-api', icon: '☁️', purpose: 'OpenAI Whisper API transcription', ready: false, dependency: 'OpenAI API key' },
      { name: 'sherpa-onnx-tts', icon: '🗣️', purpose: 'Local offline text-to-speech', ready: false, dependency: 'sherpa-onnx runtime' },
    ],
  },
  {
    name: 'Location & Places', color: '#EF4444',
    skills: [
      { name: 'goplaces', icon: '📍', purpose: 'Google Places API queries', ready: false, dependency: 'Google Places API key' },
      { name: 'local-places', icon: '📍', purpose: 'Google Places proxy on localhost', ready: false, dependency: 'Local proxy server' },
      { name: 'ordercli', icon: '🛵', purpose: 'Foodora/Deliveroo order checking', ready: false, dependency: 'ordercli CLI' },
    ],
  },
  {
    name: 'Google Workspace & Automation', color: '#EF4444',
    skills: [
      { name: 'gog', icon: '🎮', purpose: 'Google Workspace CLI (Gmail, Calendar, Drive)', ready: false, dependency: 'Google OAuth setup' },
      { name: 'peekaboo', icon: '👀', purpose: 'macOS UI capture and automation', ready: false, dependency: 'peekaboo (macOS)' },
      { name: 'sag', icon: '🗣️', purpose: 'ElevenLabs TTS with mac-style say UX', ready: false, dependency: 'sag CLI' },
    ],
  },
  {
    name: 'Analysis & Monitoring', color: '#EF4444',
    skills: [
      { name: 'model-usage', icon: '📊', purpose: 'CodexBar cost/usage summaries', ready: false, dependency: 'CodexBar' },
      { name: 'repo-scan', icon: '🔍', purpose: 'GitHub repo gap analysis', ready: false, dependency: 'repo-scan CLI' },
      { name: 'sherpa-onnx-tts-2', icon: '🗣️', purpose: 'Offline TTS via sherpa-onnx', ready: false, dependency: 'sherpa-onnx runtime' },
    ],
  },
];

const ALL_INVENTORY_SKILLS: InventorySkill[] = [
  ...READY_CATEGORIES.flatMap(c => c.skills),
  ...MISSING_CATEGORIES.flatMap(c => c.skills),
];
const TOTAL_SKILLS = 82;
const READY_COUNT = 41;
const MISSING_COUNT = 41;

/* ───────────────── Helpers ───────────────── */
function totalSkills(a: Agent) { return a.coreSkills.length + a.technicalSkills.length + a.businessSkills.length; }

function hasSkillInCategory(a: Agent, cat: FilterCategory, query: string): boolean {
  const q = query.toLowerCase();
  const match = (s: Skill) => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  if (cat === 'All') return [...a.coreSkills, ...a.technicalSkills, ...a.businessSkills].some(match);
  if (cat === 'Technical') return a.technicalSkills.some(match);
  if (cat === 'Business') return a.businessSkills.some(match);
  return a.coreSkills.some(match);
}

/* ───────────────── Reusable Components ───────────────── */
function ProgressBar({ count, max, color }: { count: number; max: number; color: string }) {
  const pct = Math.min((count / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.secondary, minWidth: 16, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const c = levelColor[level] || levelColor.Intermediate;
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.text,
    }}>{level}</span>
  );
}

function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      padding: '2px 10px', borderRadius: 4,
      background: ready ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      color: ready ? T.green : T.red, letterSpacing: 0.5,
    }}>{ready ? 'READY' : 'MISSING'}</span>
  );
}

function InventorySkillRow({ skill }: { skill: InventorySkill }) {
  return (
    <div style={{
      padding: '12px 14px', background: T.elevated, borderRadius: 6, border: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'flex-start', gap: 12, opacity: skill.ready ? 1 : 0.7,
    }}>
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{skill.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: T.text }}>{skill.name}</span>
          <StatusBadge ready={skill.ready} />
        </div>
        <div style={{ fontSize: 12, color: T.secondary, lineHeight: 1.4 }}>{skill.purpose}</div>
        {!skill.ready && skill.dependency && (
          <div style={{ fontSize: 11, color: T.red, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            ⚠ Needs: {skill.dependency}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── Category Card ───────────────── */
function CategoryCard({ category, defaultOpen = false }: { category: SkillCategory; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const readyCount = category.skills.filter(s => s.ready).length;
  const totalCount = category.skills.length;
  return (
    <div style={{ background: T.card, borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          color: T.text, textAlign: 'left',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: category.skills[0]?.ready ? T.green : T.red }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: category.color }}>{category.name}</div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{readyCount}/{totalCount} skills ready</div>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 6,
          background: readyCount === totalCount ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          color: readyCount === totalCount ? T.green : T.red,
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
        }}>{readyCount === totalCount ? '100%' : `${Math.round((readyCount / totalCount) * 100)}%`}</div>
        <span style={{ fontSize: 12, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {category.skills.map((skill, i) => <InventorySkillRow key={i} skill={skill} />)}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Agent Card ───────────────── */
function AgentCard({ agent, expanded, onToggle }: { agent: Agent; expanded: boolean; onToggle: () => void }) {
  const allSkills = [...agent.coreSkills, ...agent.technicalSkills, ...agent.businessSkills];
  const top3 = allSkills.slice(0, 3);
  const maxCat = Math.max(agent.technicalSkills.length, agent.businessSkills.length, agent.coreSkills.length);
  return (
    <div
      style={{
        background: T.card, borderRadius: 8, padding: 20,
        border: `1px solid ${expanded ? T.amber : T.border}`,
        borderLeft: expanded ? `3px solid ${T.amber}` : `1px solid ${T.border}`,
        transition: 'border-color 0.25s ease', cursor: 'default',
      }}
      onMouseEnter={e => { if (!expanded) (e.currentTarget.style.borderColor = T.amber); }}
      onMouseLeave={e => { if (!expanded) (e.currentTarget.style.borderColor = T.border); }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: agent.color,
        }}>{agent.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{agent.name}</span>
            <span style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: '2px 8px',
              borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: T.amber,
            }}>{totalSkills(agent)} skills</span>
          </div>
          <div style={{ fontSize: 12, color: agent.color, fontWeight: 500 }}>{agent.role}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: T.secondary, lineHeight: 1.5, margin: '0 0 16px' }}>{agent.description}</p>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>SKILL BREAKDOWN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Technical', count: agent.technicalSkills.length, color: '#3B82F6' },
            { label: 'Business', count: agent.businessSkills.length, color: '#22C55E' },
            { label: 'Core', count: agent.coreSkills.length, color: T.amber },
          ].map(bar => (
            <div key={bar.label}>
              <span style={{ fontSize: 11, color: T.secondary }}>{bar.label}</span>
              <ProgressBar count={bar.count} max={maxCat + 2} color={bar.color} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>TOP SKILLS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {top3.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: T.elevated, borderRadius: 6 }}>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: T.text }}>{s.name}</span>
              <LevelBadge level={s.level} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '8px 0', background: 'none', border: `1px solid ${T.border}`,
          borderRadius: 6, color: T.amber, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = T.amber)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
      >
        {expanded ? '▲ Collapse' : `▼ View All ${totalSkills(agent)} Skills`}
      </button>
      {expanded && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {([
            { label: 'CORE SKILLS', skills: agent.coreSkills, accent: T.amber },
            { label: 'TECHNICAL SKILLS', skills: agent.technicalSkills, accent: '#3B82F6' },
            { label: 'BUSINESS SKILLS', skills: agent.businessSkills, accent: '#22C55E' },
          ] as const).map(section => (
            <div key={section.label}>
              <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: section.accent, marginBottom: 8 }}>{section.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.skills.map((s, j) => (
                  <div key={j} style={{ padding: '10px 12px', background: T.elevated, borderRadius: 6, border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: T.text }}>{s.name}</span>
                      <LevelBadge level={s.level} />
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────── By Category View ───────────────── */
function CategoryView({ search }: { search: string }) {
  const q = search.toLowerCase();
  const filterCat = (cat: SkillCategory): SkillCategory | null => {
    if (!q) return cat;
    const filtered = cat.skills.filter(s => s.name.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q));
    return filtered.length === 0 ? null : { ...cat, skills: filtered };
  };
  const readyCats = READY_CATEGORIES.map(filterCat).filter(Boolean) as SkillCategory[];
  const missingCats = MISSING_CATEGORIES.map(filterCat).filter(Boolean) as SkillCategory[];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.green, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
          READY SKILLS — {READY_COUNT} Available
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {readyCats.map((cat, i) => <CategoryCard key={i} category={cat} defaultOpen={i === 0} />)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.red, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.red, display: 'inline-block' }} />
          MISSING DEPENDENCIES — {MISSING_COUNT} Unavailable
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {missingCats.map((cat, i) => <CategoryCard key={i} category={cat} />)}
        </div>
      </div>
      {readyCats.length === 0 && missingCats.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>No skills match &ldquo;{search}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── By Status View ───────────────── */
function StatusView({ search }: { search: string }) {
  const q = search.toLowerCase();
  const filterSkills = (skills: InventorySkill[]) => !q ? skills : skills.filter(s => s.name.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q));
  const ready = filterSkills(ALL_INVENTORY_SKILLS.filter(s => s.ready));
  const missing = filterSkills(ALL_INVENTORY_SKILLS.filter(s => !s.ready));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.green, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
          READY ({ready.length})
        </div>
        <style>{`.status-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}@media(max-width:768px){.status-grid{grid-template-columns:1fr!important}}`}</style>
        <div className="status-grid">{ready.map((s, i) => <InventorySkillRow key={i} skill={s} />)}</div>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: T.red, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: T.red, display: 'inline-block' }} />
          MISSING ({missing.length})
        </div>
        <div className="status-grid">{missing.map((s, i) => <InventorySkillRow key={i} skill={s} />)}</div>
      </div>
      {ready.length === 0 && missing.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>No skills match &ldquo;{search}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */
export default function SkillsInventory() {
  const [viewMode, setViewMode] = useState<ViewMode>('agent');
  const [filter, setFilter] = useState<FilterCategory>('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [matrixOpen, setMatrixOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search && filter === 'All') return AGENTS;
    return AGENTS.filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      if (a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)) return true;
      return hasSkillInCategory(a, filter, search);
    });
  }, [filter, search]);

  const toggle = (name: string) => setExpanded(p => ({ ...p, [name]: !p[name] }));
  const chips: FilterCategory[] = ['All', 'Technical', 'Business', 'Core'];
  const views: { key: ViewMode; label: string }[] = [
    { key: 'agent', label: 'By Agent' },
    { key: 'category', label: 'By Category' },
    { key: 'status', label: 'By Status' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: T.amber, margin: '0 0 6px' }}>Skills Inventory</h1>
          <p style={{ color: T.secondary, margin: 0, fontSize: 14 }}>
            Comprehensive capability matrix · {AGENTS.length} agents · {AGENTS.reduce((s, a) => s + totalSkills(a), 0)}+ agent skills
          </p>
        </div>
        {/* Stats Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24,
          padding: '16px 20px', background: T.card, borderRadius: 8, border: `1px solid ${T.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: T.amber }}>{TOTAL_SKILLS}</span>
            <span style={{ fontSize: 12, color: T.secondary }}>total skills</span>
          </div>
          <div style={{ width: 1, background: T.border, alignSelf: 'stretch' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
            <span style={{ fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: T.green }}>{READY_COUNT}</span>
            <span style={{ fontSize: 12, color: T.secondary }}>ready</span>
          </div>
          <div style={{ width: 1, background: T.border, alignSelf: 'stretch' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.red }} />
            <span style={{ fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: T.red }}>{MISSING_COUNT}</span>
            <span style={{ fontSize: 12, color: T.secondary }}>missing dependencies</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 120, height: 8, borderRadius: 4, overflow: 'hidden', background: T.border }}>
              <div style={{ width: '50%', height: '100%', background: `linear-gradient(90deg, ${T.green}, ${T.amber})`, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>50%</span>
          </div>
        </div>
        {/* View Toggle */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
            {views.map(v => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                style={{
                  padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', border: 'none',
                  background: viewMode === v.key ? T.amber : 'transparent',
                  color: viewMode === v.key ? '#000' : T.secondary, transition: 'all 0.2s',
                }}
              >{v.label}</button>
            ))}
          </div>
        </div>
        {/* Filter Bar + Search */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
          marginBottom: 28, padding: '14px 16px', background: T.card, borderRadius: 8, border: `1px solid ${T.border}`,
        }}>
          {viewMode === 'agent' && chips.map(c => (
            <button
              key={c} onClick={() => setFilter(c)}
              style={{
                padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', border: 'none',
                background: filter === c ? 'rgba(245,158,11,0.18)' : T.elevated,
                color: filter === c ? T.amber : T.secondary, transition: 'all 0.2s',
              }}
            >{c}</button>
          ))}
          <div style={{ flex: 1, minWidth: 180 }}>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={viewMode === 'agent' ? 'Search skills, agents...' : 'Search skills...'}
              style={{
                width: '100%', padding: '7px 12px', background: T.elevated, border: `1px solid ${T.border}`,
                borderRadius: 6, color: T.text, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = T.amber)}
              onBlur={e => (e.currentTarget.style.borderColor = T.border)}
            />
          </div>
        </div>
        {/* Agent View */}
        {viewMode === 'agent' && (
          <>
            <style>{`.skills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media(max-width:1024px){.skills-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:640px){.skills-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="skills-grid">
              {filtered.map(agent => (
                <AgentCard key={agent.name} agent={agent} expanded={!!expanded[agent.name]} onToggle={() => toggle(agent.name)} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14 }}>No agents match &ldquo;{search}&rdquo; in {filter} skills</div>
              </div>
            )}
          </>
        )}
        {viewMode === 'category' && <CategoryView search={search} />}
        {viewMode === 'status' && <StatusView search={search} />}
        {/* Collaboration Matrix */}
        {viewMode === 'agent' && (
          <div style={{ marginTop: 48 }}>
            <button
              onClick={() => setMatrixOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '16px 20px', background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 8, cursor: 'pointer', color: T.text, textAlign: 'left', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = T.amber)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, color: T.amber, flex: 1 }}>COLLABORATION MATRIX</span>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: T.muted }}>{matrixOpen ? '▲ Collapse' : '▼ Expand'}</span>
            </button>
            {matrixOpen && (
              <div style={{
                marginTop: -1, padding: 20, background: T.card, borderRadius: '0 0 8px 8px',
                border: `1px solid ${T.border}`, borderTop: 'none',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16,
              }}>
                {COLLABORATIONS.map((c, i) => (
                  <div key={i} style={{ padding: 16, background: T.elevated, borderRadius: 8, borderLeft: `3px solid ${c.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.color, marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: T.secondary, lineHeight: 1.5 }}>{c.desc}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.agents.map(a => (
                        <span key={a} style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 4,
                          background: 'rgba(245,158,11,0.1)', color: T.amber, fontFamily: "'JetBrains Mono', monospace",
                        }}>{a}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}