import { NextRequest, NextResponse } from 'next/server';

// In-memory store for autonomous ideas (in production, use a database)
// For now, we'll use a simple JSON file or return them for client-side storage
let autonomousIdeas: AutonomousIdea[] = [];

interface AutonomousIdea {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  problemSolved?: string;
  targetMarket?: string;
  businessModel?: string;
  revenueProjection?: string;
  competitiveAdvantage?: string;
  developmentTime?: string;
  riskAssessment?: string;
  tags: string[];
  agentConfidence?: number;
  marketSize?: 'small' | 'medium' | 'large' | 'massive';
  status: 'submitted' | 'reviewed' | 'approved' | 'building' | 'rejected' | 'launched';
  createdAt: string;
  updatedAt: string;
  source: 'autonomous';
  context?: string; // What triggered this idea (overnight build, heartbeat, etc.)
}

// GET - Retrieve all autonomous ideas
export async function GET() {
  return NextResponse.json({
    success: true,
    ideas: autonomousIdeas,
    count: autonomousIdeas.length,
  });
}

// POST - Agent submits a new autonomous idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      agentId,
      agentName,
      title,
      description,
      problemSolved,
      targetMarket,
      businessModel,
      revenueProjection,
      competitiveAdvantage,
      developmentTime,
      riskAssessment,
      tags = [],
      agentConfidence = 3,
      marketSize = 'medium',
      context,
    } = body;

    // Validate required fields
    if (!agentId || !agentName || !title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: agentId, agentName, title, description' },
        { status: 400 }
      );
    }

    const newIdea: AutonomousIdea = {
      id: `auto-${agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      agentName,
      title,
      description,
      problemSolved: problemSolved || 'Not specified',
      targetMarket: targetMarket || 'Not specified',
      businessModel: businessModel || 'Not specified',
      revenueProjection: revenueProjection || 'TBD',
      competitiveAdvantage: competitiveAdvantage || 'Not specified',
      developmentTime: developmentTime || 'TBD',
      riskAssessment: riskAssessment || 'Not assessed',
      tags: [...tags, agentId, 'autonomous'],
      agentConfidence,
      marketSize,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'autonomous',
      context,
    };

    autonomousIdeas.unshift(newIdea);

    return NextResponse.json({
      success: true,
      idea: newIdea,
      message: `Idea "${title}" submitted by ${agentName}`,
    });
  } catch (error) {
    console.error('Error creating autonomous idea:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an idea (for cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('id');

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: 'Missing idea id' },
        { status: 400 }
      );
    }

    const index = autonomousIdeas.findIndex(i => i.id === ideaId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    const removed = autonomousIdeas.splice(index, 1)[0];
    return NextResponse.json({
      success: true,
      removed,
    });
  } catch (error) {
    console.error('Error deleting autonomous idea:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
