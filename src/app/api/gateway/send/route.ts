import { NextRequest, NextResponse } from 'next/server';

// Agent chat handler - sends messages to OpenClaw Gateway
export async function POST(request: NextRequest) {
  try {
    const { agentId, message } = await request.json();

    // Validate inputs
    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'Missing agentId or message' },
        { status: 400 }
      );
    }

    // Gateway configuration
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8080';
    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || '';

    // Prepare the session send request
    const gatewayRequestBody = {
      agentId: agentId,
      message: message,
      sessionTarget: 'isolated',
      wakeMode: 'immediate',
      timeoutSeconds: 30,
    };

    // Send to OpenClaw Gateway
    const gatewayResponse = await fetch(`${gatewayUrl}/api/sessions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gatewayToken && { 'Authorization': `Bearer ${gatewayToken}` })
      },
      body: JSON.stringify(gatewayRequestBody)
    });

    if (!gatewayResponse.ok) {
      const errorText = await gatewayResponse.text();
      console.error('Gateway error:', gatewayResponse.status, errorText);
      
      // Return a user-friendly error message
      return NextResponse.json(
        { 
          error: 'Failed to reach agent', 
          details: `Gateway responded with ${gatewayResponse.status}` 
        },
        { status: 503 }
      );
    }

    const gatewayResult = await gatewayResponse.json();

    // Extract the agent's response from the gateway result
    let agentMessage = 'Agent responded successfully';
    
    if (gatewayResult.result) {
      agentMessage = gatewayResult.result;
    } else if (gatewayResult.response) {
      agentMessage = gatewayResult.response;
    } else if (gatewayResult.message) {
      agentMessage = gatewayResult.message;
    }

    return NextResponse.json({ 
      success: true, 
      response: agentMessage,
      agentId: agentId
    });

  } catch (error) {
    console.error('Gateway API error:', error);

    // Handle different error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Unable to connect to agent gateway', 
          details: 'Gateway service may be offline' 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}