import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface GenerateIdeaRequest {
  agentId: string;
  agentName: string;
  type: 'saas' | 'assist';
  content: string; // Raw agent response
  platform: 'telegram' | 'web';
  requestContext?: string;
}

interface ParsedSaasIdea {
  title: string;
  description: string;
  problemSolved?: string;
  targetMarket?: string;
  businessModel?: string;
  revenueProjection?: string;
  competitiveAdvantage?: string;
  tags: string[];
  agentConfidence: number;
  marketSize: 'small' | 'medium' | 'large' | 'massive';
  developmentTime?: string;
}

interface ParsedAssistResource {
  title: string;
  description: string;
  url?: string;
  category: string;
  type: string;
  tags: string[];
  useCase: string;
  pricing?: string;
  githubStars?: number;
  usefulFor: string[];
}

// Parse agent response into structured data
function parseAgentResponse(content: string, type: 'saas' | 'assist'): ParsedSaasIdea | ParsedAssistResource | null {
  try {
    // Try to extract structured data from agent response
    // Look for patterns like:
    // Title: [...]
    // Description: [...]
    // Problem: [...]
    
    const lines = content.split('\n').map(line => line.trim());
    const data: any = {};
    
    // Extract basic fields
    const titleMatch = content.match(/\*\*(.+?)\*\*/);
    if (titleMatch) data.title = titleMatch[1];
    
    // Extract key-value pairs
    const patterns = {
      description: /(?:description|concept|what):\s*(.+?)(?:\n|$)/i,
      problemSolved: /(?:problem|solves):\s*(.+?)(?:\n|$)/i,
      targetMarket: /(?:market|target):\s*(.+?)(?:\n|$)/i,
      businessModel: /(?:model|pricing):\s*(.+?)(?:\n|$)/i,
      revenueProjection: /(?:revenue|arr):\s*(.+?)(?:\n|$)/i,
      competitiveAdvantage: /(?:advantage|edge):\s*(.+?)(?:\n|$)/i,
      useCase: /(?:use case|usage):\s*(.+?)(?:\n|$)/i,
      url: /https?:\/\/[^\s]+/,
      category: /(?:category|type):\s*(.+?)(?:\n|$)/i
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) data[key] = match[1]?.trim();
    }
    
    // Extract confidence rating
    const confMatch = content.match(/confidence[:\s]*(\d)\/5|(\d)\/5/i);
    if (confMatch) data.agentConfidence = parseInt(confMatch[1] || confMatch[2]);
    
    // Extract tags from hashtags or keywords
    const tagMatches = content.match(/#(\w+)/g);
    data.tags = tagMatches ? tagMatches.map(tag => tag.replace('#', '')) : [];
    
    // Set defaults based on type
    if (type === 'saas') {
      return {
        title: data.title || 'Untitled SaaS Idea',
        description: data.description || content.substring(0, 200),
        problemSolved: data.problemSolved,
        targetMarket: data.targetMarket,
        businessModel: data.businessModel,
        revenueProjection: data.revenueProjection,
        competitiveAdvantage: data.competitiveAdvantage,
        tags: data.tags,
        agentConfidence: data.agentConfidence || 3,
        marketSize: 'medium' as const,
        developmentTime: data.developmentTime
      };
    } else {
      return {
        title: data.title || 'Untitled Resource',
        description: data.description || content.substring(0, 200),
        url: data.url,
        category: data.category || 'tool',
        type: 'open-source',
        tags: data.tags,
        useCase: data.useCase || 'General use',
        pricing: data.pricing,
        githubStars: data.githubStars,
        usefulFor: [data.agentId || 'general']
      };
    }
  } catch (error) {
    console.error('Error parsing agent response:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { agentId, agentName, type, content, platform, requestContext }: GenerateIdeaRequest = await request.json();
    
    if (!agentId || !agentName || !type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Parse the agent response
    const parsedData = parseAgentResponse(content, type);
    if (!parsedData) {
      return NextResponse.json({ error: 'Failed to parse agent response' }, { status: 400 });
    }
    
    // Uses shared supabase client from @/lib/supabase
    
    // Save to appropriate table
    const tableName = type === 'saas' ? 'saas_ideas' : 'assist_resources';
    const dataToInsert = {
      ...parsedData,
      agent_id: agentId,
      agent_name: agentName,
      generated_by: agentId,
      request_context: requestContext,
      platform,
      auto_generated: true,
      status: type === 'saas' ? 'submitted' : undefined
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .insert(dataToInsert)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save idea' }, { status: 500 });
    }
    
    // TODO: Send WebSocket notification for real-time updates
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: `${type === 'saas' ? 'SaaS idea' : 'Resource'} saved successfully`
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}