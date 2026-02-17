import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/overnight-plans.json');

interface Suggestion {
  id: string;
  agentId: string;
  agentName: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  category: 'research' | 'development' | 'content' | 'analysis' | 'planning' | 'other';
  estimatedHours: number;
  status: 'suggested' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  result: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DailyPlan {
  suggestions: Suggestion[];
  notes: string;
  approved: boolean;
}

interface PlansData {
  plans: Record<string, DailyPlan>;
  lastUpdated: string;
}

function readPlans(): PlansData {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as PlansData;
  } catch {
    return { plans: {}, lastUpdated: new Date().toISOString() };
  }
}

function writePlans(data: PlansData): void {
  data.lastUpdated = new Date().toISOString();
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/overnight-plans?date=2026-02-14
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
  }

  const data = readPlans();
  const plan = data.plans[date] || null;

  if (!plan) {
    return NextResponse.json({
      date,
      suggestions: [],
      notes: '',
      approved: false,
      empty: true,
    });
  }

  return NextResponse.json({
    date,
    ...plan,
    empty: false,
  });
}

// POST /api/overnight-plans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, date, suggestionId, status, notes } = body as {
      action: string;
      date: string;
      suggestionId?: string;
      status?: string;
      notes?: string;
    };

    if (!action || !date) {
      return NextResponse.json({ error: 'Missing action or date' }, { status: 400 });
    }

    const data = readPlans();

    // Ensure the plan exists for this date
    if (!data.plans[date]) {
      data.plans[date] = { suggestions: [], notes: '', approved: false };
    }

    const plan = data.plans[date];

    switch (action) {
      case 'approve':
        plan.approved = true;
        break;

      case 'reject':
        plan.approved = false;
        break;

      case 'update-notes':
        if (typeof notes === 'string') {
          plan.notes = notes;
        }
        break;

      case 'update-status':
        if (!suggestionId || !status) {
          return NextResponse.json({ error: 'Missing suggestionId or status' }, { status: 400 });
        }
        const suggestion = plan.suggestions.find(s => s.id === suggestionId);
        if (!suggestion) {
          return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }
        suggestion.status = status as Suggestion['status'];
        suggestion.updatedAt = new Date().toISOString();
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    writePlans(data);

    return NextResponse.json({ ok: true, plan: data.plans[date] });
  } catch (error) {
    console.error('Overnight plans POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
