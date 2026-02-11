import { NextRequest, NextResponse } from 'next/server'
import { lightsOutAPI } from '@/lib/db-local'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    let data;
    
    switch (type) {
      case 'ideas':
        data = lightsOutAPI.ideas.getAll();
        break;
      case 'goals':
        data = lightsOutAPI.goals.getAll();
        break;
      case 'todos':
        data = lightsOutAPI.todos.getAll();
        break;
      case 'activities':
        data = lightsOutAPI.activities.getRecent(10);
        break;
      case 'skills':
        data = lightsOutAPI.skills.getAll();
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Lights-out API error:', error);
    return NextResponse.json({ success: false, error: 'API request failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, action, data, id } = await request.json();
    let result;

    switch (type) {
      case 'ideas':
        if (action === 'create') {
          result = lightsOutAPI.ideas.create(data);
        } else if (action === 'update' && id) {
          result = lightsOutAPI.ideas.update(id, data);
        } else if (action === 'delete' && id) {
          result = lightsOutAPI.ideas.delete(id);
        }
        break;
        
      case 'todos':
        if (action === 'create') {
          result = lightsOutAPI.todos.create(data);
        } else if (action === 'update' && id) {
          result = lightsOutAPI.todos.update(id, data);
        }
        break;
        
      case 'activities':
        if (action === 'create') {
          result = lightsOutAPI.activities.create(data);
        }
        break;
        
      case 'goals':
        if (action === 'update' && id) {
          result = lightsOutAPI.goals.update(id, data);
        }
        break;
        
      default:
        return NextResponse.json({ success: false, error: 'Invalid type or action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Lights-out API POST error:', error);
    return NextResponse.json({ success: false, error: 'API request failed' }, { status: 500 });
  }
}