// Lights-out database system - zero configuration required
// Uses local SQLite with automatic setup and seeding

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dbtech45.db');
const db = new Database(dbPath);

// Initialize tables automatically
db.exec(`
  CREATE TABLE IF NOT EXISTS ideas_vault (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'spark',
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT DEFAULT 'derek'
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    current_value REAL DEFAULT 0,
    target_value REAL,
    unit TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    assignee TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'backlog',
    due_date TEXT,
    project TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'system',
    agent TEXT,
    project TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'development',
    agents TEXT DEFAULT '[]',
    proficiency_level TEXT DEFAULT 'intermediate',
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS memory_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'decision',
    context TEXT,
    tags TEXT DEFAULT '[]',
    importance TEXT DEFAULT 'medium',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Auto-seed with real data on first run
const hasData = db.prepare('SELECT COUNT(*) as count FROM goals').get() as { count: number };
if (hasData.count === 0) {
  console.log('🌱 Auto-seeding database with real operational data...');

  // Real goals
  const insertGoal = db.prepare(`
    INSERT INTO goals (id, title, description, current_value, target_value, unit, deadline, status, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGoal.run('goal-1', 'Sunday Squares Launch', 'Complete football squares app with payments', 95, 100, 'percent', '2026-02-12', 'active', 'high');
  insertGoal.run('goal-2', 'Soul Solace Beta', 'AI wellness app beta testing', 60, 100, 'percent', '2026-03-01', 'active', 'medium');
  insertGoal.run('goal-3', 'Boundless v2', 'Travel planning app redesign', 40, 100, 'percent', '2026-02-17', 'active', 'medium');
  insertGoal.run('goal-4', 'tickR MVP', 'Trading dashboard MVP scope', 25, 100, 'percent', '2026-02-24', 'active', 'medium');

  // Real todos
  const insertTodo = db.prepare(`
    INSERT INTO todos (id, title, assignee, priority, status, due_date, project)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTodo.run('todo-1', 'Model Counsel API key restoration', 'Anders', 'high', 'in_progress', '2026-02-10', 'DB Tech OS');
  insertTodo.run('todo-2', 'Sunday Squares payment integration', 'Anders', 'high', 'in_progress', '2026-02-12', 'Sunday Squares');
  insertTodo.run('todo-3', 'Signal & Noise draft review', 'Grant', 'high', 'backlog', '2026-02-14', 'Newsletter');
  insertTodo.run('todo-4', 'Boundless onboarding redesign', 'Paula', 'medium', 'in_progress', '2026-02-17', 'Boundless');
  insertTodo.run('todo-5', 'MenuSparks demo prep', 'Milo', 'medium', 'backlog', '2026-02-24', 'MenuSparks');

  // Real activities
  const insertActivity = db.prepare(`
    INSERT INTO activities (id, title, description, category, agent, project)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertActivity.run('act-1', 'DB Tech OS V3 deployed', 'Command center with Brand Kit integration', 'deployment', 'Anders', 'DB Tech OS');
  insertActivity.run('act-2', 'Model Counsel interface built', 'Multi-AI interface with API key management', 'development', 'Anders', 'Model Counsel');
  insertActivity.run('act-3', 'Brand Kit assets delivered', 'Complete DBTECH45 brand system ready', 'design', 'Paula', 'Brand Assets');
  insertActivity.run('act-4', 'Lights-out automation enabled', 'Zero-config database and deployment pipeline', 'infrastructure', 'Anders', 'DB Tech OS');

  // Skills
  const insertSkill = db.prepare(`
    INSERT INTO skills (id, name, category, agents, proficiency_level, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertSkill.run('skill-1', 'React/Next.js', 'development', '["Anders", "Paula"]', 'expert', 'Frontend framework development');
  insertSkill.run('skill-2', 'Trading/Finance', 'domain', '["Bobby", "Tony"]', 'expert', 'Market analysis and trading systems');
  insertSkill.run('skill-3', 'UI/UX Design', 'design', '["Paula"]', 'expert', 'User interface and experience design');
  insertSkill.run('skill-4', 'Strategy/Operations', 'business', '["Milo", "Derek"]', 'expert', 'Business strategy and operational planning');

  console.log('✅ Database seeded with real operational data');
}

// API functions
export const lightsOutAPI = {
  // Ideas Vault
  ideas: {
    getAll() {
      return db.prepare('SELECT * FROM ideas_vault ORDER BY created_at DESC').all();
    },
    create(idea: any) {
      const id = Math.random().toString(36).substr(2, 9);
      const stmt = db.prepare(`
        INSERT INTO ideas_vault (id, title, description, category, priority, status, tags, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, idea.title, idea.description, idea.category, idea.priority, idea.status, JSON.stringify(idea.tags), idea.created_by);
      return db.prepare('SELECT * FROM ideas_vault WHERE id = ?').get(id);
    },
    update(id: string, updates: any) {
      const stmt = db.prepare(`
        UPDATE ideas_vault SET title = ?, description = ?, category = ?, priority = ?, status = ?, tags = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      stmt.run(updates.title, updates.description, updates.category, updates.priority, updates.status, JSON.stringify(updates.tags), id);
      return db.prepare('SELECT * FROM ideas_vault WHERE id = ?').get(id);
    },
    delete(id: string) {
      const stmt = db.prepare('DELETE FROM ideas_vault WHERE id = ?');
      return stmt.run(id);
    }
  },

  // Goals
  goals: {
    getAll() {
      return db.prepare('SELECT * FROM goals ORDER BY priority DESC, deadline ASC').all();
    },
    update(id: string, updates: any) {
      const stmt = db.prepare(`
        UPDATE goals SET current_value = ?, updated_at = datetime('now') WHERE id = ?
      `);
      stmt.run(updates.current_value, id);
      return db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    }
  },

  // Todos
  todos: {
    getAll() {
      return db.prepare('SELECT * FROM todos ORDER BY priority DESC, due_date ASC').all();
    },
    create(todo: any) {
      const id = Math.random().toString(36).substr(2, 9);
      const stmt = db.prepare(`
        INSERT INTO todos (id, title, assignee, priority, status, due_date, project)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, todo.title, todo.assignee, todo.priority, todo.status, todo.due_date, todo.project);
      return db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    },
    update(id: string, updates: any) {
      const stmt = db.prepare(`
        UPDATE todos SET status = ?, priority = ?, updated_at = datetime('now') WHERE id = ?
      `);
      stmt.run(updates.status, updates.priority, id);
      return db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    }
  },

  // Activities  
  activities: {
    getRecent(limit: number = 20) {
      return db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT ?').all(limit);
    },
    create(activity: any) {
      const id = Math.random().toString(36).substr(2, 9);
      const stmt = db.prepare(`
        INSERT INTO activities (id, title, description, category, agent, project, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, activity.title, activity.description, activity.category, activity.agent, activity.project, JSON.stringify(activity.metadata || {}));
      return db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
    }
  },

  // Skills
  skills: {
    getAll() {
      return db.prepare('SELECT * FROM skills ORDER BY category, name').all();
    }
  }
};

export default db;