import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getAgentCount(): Promise<number> {
  try {
    const { stdout } = await execAsync('openclaw config get agents.list', { timeout: 5000 });
    const parsed = JSON.parse(stdout);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 8; // fallback to known count
  }
}

async function getLastCommit(): Promise<string> {
  try {
    const { stdout } = await execAsync('git log -1 --format=%cr', {
      timeout: 5000,
      cwd: process.cwd(),
    });
    return stdout.trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

async function getGatewayStatus(): Promise<'UP' | 'DOWN'> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('http://127.0.0.1:18789/', { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok || res.status < 500 ? 'UP' : 'DOWN';
  } catch {
    return 'DOWN';
  }
}

export async function GET() {
  const [agents, lastCommit, gateway] = await Promise.all([
    getAgentCount(),
    getLastCommit(),
    getGatewayStatus(),
  ]);

  return NextResponse.json({
    agents,
    lastCommit,
    gateway,
    timestamp: new Date().toISOString(),
  });
}
