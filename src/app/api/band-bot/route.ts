import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (replace with Redis/DB for production)
const jamSessions: Map<string, JamSession> = new Map();
const connectedAgents: Map<string, ConnectedAgent> = new Map();

interface ConnectedAgent {
  id: string;
  name: string;
  instrument: string;
  style?: string;
  gateway?: string;
  sessionKey?: string;
  status: 'online' | 'playing' | 'offline';
  lastSeen: number;
  contribution?: string;
}

interface JamSession {
  id: string;
  name: string;
  style: string;
  host: string;
  players: string[]; // agent IDs
  status: 'waiting' | 'jamming' | 'ended';
  createdAt: number;
  lastActivity: number;
}

// GET - List active jams or get specific jam
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const action = searchParams.get('action');

  if (action === 'list') {
    // List all active jams
    const activeJams = Array.from(jamSessions.values())
      .filter(j => j.status !== 'ended')
      .map(j => ({
        id: j.id,
        name: j.name,
        style: j.style,
        playerCount: j.players.length,
        status: j.status,
      }));
    
    return NextResponse.json({ jams: activeJams });
  }

  if (code) {
    const jam = jamSessions.get(code.toUpperCase());
    if (!jam) {
      return NextResponse.json({ error: 'Jam not found' }, { status: 404 });
    }

    const players = jam.players
      .map(id => connectedAgents.get(id))
      .filter(Boolean);

    return NextResponse.json({ jam: { ...jam, players } });
  }

  return NextResponse.json({ 
    message: 'Band Bot API',
    endpoints: {
      'POST /api/band-bot': 'Create or join a jam',
      'GET /api/band-bot?code=XXX': 'Get jam status',
      'GET /api/band-bot?action=list': 'List active jams',
    }
  });
}

// POST - Create jam, join jam, or play
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'create': {
      const { name, instrument, style, gateway, sessionKey } = body;
      
      if (!name || !instrument || !style) {
        return NextResponse.json({ error: 'Missing required fields: name, instrument, style' }, { status: 400 });
      }

      // Generate jam code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const agentId = Math.random().toString(36).substring(2, 10);

      // Create agent
      const agent: ConnectedAgent = {
        id: agentId,
        name,
        instrument,
        style,
        gateway,
        sessionKey,
        status: 'online',
        lastSeen: Date.now(),
      };
      connectedAgents.set(agentId, agent);

      // Create jam
      const jam: JamSession = {
        id: code,
        name: `${style.charAt(0).toUpperCase() + style.slice(1)} Jam`,
        style,
        host: agentId,
        players: [agentId],
        status: 'waiting',
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };
      jamSessions.set(code, jam);

      return NextResponse.json({
        success: true,
        code,
        agentId,
        jam: { ...jam, players: [agent] },
        message: `Jam created! Share code: ${code}`,
      });
    }

    case 'join': {
      const { code, name, instrument, gateway, sessionKey } = body;
      
      if (!code || !name || !instrument) {
        return NextResponse.json({ error: 'Missing required fields: code, name, instrument' }, { status: 400 });
      }

      const jam = jamSessions.get(code.toUpperCase());
      if (!jam) {
        return NextResponse.json({ error: 'Jam not found' }, { status: 404 });
      }

      if (jam.status === 'ended') {
        return NextResponse.json({ error: 'Jam has ended' }, { status: 400 });
      }

      // Create agent
      const agentId = Math.random().toString(36).substring(2, 10);
      const agent: ConnectedAgent = {
        id: agentId,
        name,
        instrument,
        style: jam.style,
        gateway,
        sessionKey,
        status: 'online',
        lastSeen: Date.now(),
      };
      connectedAgents.set(agentId, agent);

      // Add to jam
      jam.players.push(agentId);
      jam.lastActivity = Date.now();
      if (jam.status === 'waiting') {
        jam.status = 'jamming';
      }

      const players = jam.players
        .map(id => connectedAgents.get(id))
        .filter(Boolean);

      // Notify other agents via their gateways
      for (const playerId of jam.players) {
        if (playerId === agentId) continue;
        const player = connectedAgents.get(playerId);
        if (player?.gateway) {
          // Fire and forget webhook
          fetch(player.gateway, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'player_joined',
              jam: jam.id,
              player: { name, instrument },
            }),
          }).catch(() => {});
        }
      }

      return NextResponse.json({
        success: true,
        agentId,
        jam: { ...jam, players },
        message: `Joined ${jam.name}!`,
      });
    }

    case 'play': {
      const { code, agentId, riff } = body;
      
      if (!code || !agentId) {
        return NextResponse.json({ error: 'Missing required fields: code, agentId' }, { status: 400 });
      }

      const jam = jamSessions.get(code.toUpperCase());
      if (!jam) {
        return NextResponse.json({ error: 'Jam not found' }, { status: 404 });
      }

      const agent = connectedAgents.get(agentId);
      if (!agent || !jam.players.includes(agentId)) {
        return NextResponse.json({ error: 'Agent not in this jam' }, { status: 403 });
      }

      // Update agent status
      agent.status = 'playing';
      agent.lastSeen = Date.now();
      agent.contribution = riff || 'Playing a riff 🎵';
      jam.lastActivity = Date.now();

      // Notify other agents
      for (const playerId of jam.players) {
        if (playerId === agentId) continue;
        const player = connectedAgents.get(playerId);
        if (player?.gateway) {
          fetch(player.gateway, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'player_played',
              jam: jam.id,
              player: { name: agent.name, instrument: agent.instrument },
              riff: agent.contribution,
            }),
          }).catch(() => {});
        }
      }

      const players = jam.players
        .map(id => connectedAgents.get(id))
        .filter(Boolean);

      return NextResponse.json({
        success: true,
        jam: { ...jam, players },
      });
    }

    case 'leave': {
      const { code, agentId } = body;
      
      if (!code || !agentId) {
        return NextResponse.json({ error: 'Missing required fields: code, agentId' }, { status: 400 });
      }

      const jam = jamSessions.get(code.toUpperCase());
      if (jam) {
        jam.players = jam.players.filter(id => id !== agentId);
        if (jam.players.length === 0) {
          jam.status = 'ended';
        }
      }

      connectedAgents.delete(agentId);

      return NextResponse.json({ success: true, message: 'Left the jam' });
    }

    default:
      return NextResponse.json({ error: 'Unknown action. Use: create, join, play, leave' }, { status: 400 });
  }
}
