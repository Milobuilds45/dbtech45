import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/task-board.json');

// ─── Types ───────────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  column: 'backlog' | 'in-progress' | 'review' | 'done';
  assignedAgents: string[];
  collaborationType: 'solo' | 'sequential' | 'parallel';
  estimatedHours: number;
  agentNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskBoardData {
  tasks: Task[];
  lastUpdated: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function readData(): TaskBoardData {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as TaskBoardData;
  } catch {
    return { tasks: [], lastUpdated: new Date().toISOString() };
  }
}

function writeData(data: TaskBoardData): void {
  data.lastUpdated = new Date().toISOString();
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function uid(): string {
  return 'tb' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── GET /api/task-board ─────────────────────────────────────────────────
export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

// ─── POST /api/task-board ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description = '', priority = 'medium', column = 'backlog',
      assignedAgents = [], collaborationType = 'solo',
      estimatedHours = 1, agentNotes = '',
    } = body as Partial<Task>;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: uid(),
      title: title.trim(),
      description: description || '',
      priority: priority as Task['priority'],
      column: column as Task['column'],
      assignedAgents: assignedAgents || [],
      collaborationType: collaborationType as Task['collaborationType'],
      estimatedHours: estimatedHours || 1,
      agentNotes: agentNotes || '',
      createdAt: now,
      updatedAt: now,
    };

    const data = readData();
    data.tasks.push(task);
    writeData(data);

    return NextResponse.json({ ok: true, task });
  } catch (error) {
    console.error('Task board POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// ─── PATCH /api/task-board ───────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Partial<Task> & { id: string };

    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    const data = readData();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Apply allowed updates
    const allowed = [
      'title', 'description', 'priority', 'column',
      'assignedAgents', 'collaborationType', 'estimatedHours', 'agentNotes',
    ] as const;
    const upd = updates as unknown as Record<string, unknown>;
    const target = data.tasks[idx] as unknown as Record<string, unknown>;
    for (const key of allowed) {
      if (key in upd && upd[key] !== undefined) {
        target[key] = upd[key];
      }
    }
    data.tasks[idx].updatedAt = new Date().toISOString();

    writeData(data);
    return NextResponse.json({ ok: true, task: data.tasks[idx] });
  } catch (error) {
    console.error('Task board PATCH error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// ─── DELETE /api/task-board ──────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    const data = readData();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    data.tasks.splice(idx, 1);
    writeData(data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Task board DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
