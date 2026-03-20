import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Return curated trending topics based on Derek's interests
    const topics = [
      'AI video generation tools',
      'Claude Opus 4 vs Sonnet',
      'Gemini 3 Pro techniques',
      'Options trading strategies',
      'Restaurant POS systems',
      'Next.js 16 performance',
      'OpenClaw agent automation',
      'MCP server development',
      'Supabase realtime features',
      'YouTube AI summarization',
      'React Server Components',
      'Tailwind CSS patterns',
    ];

    return NextResponse.json({ topics });

  } catch (err) {
    console.error('[trending] Error:', err);
    return NextResponse.json({
      topics: [
        'AI video generation',
        'Claude Code techniques',
        'Options trading strategies',
        'Restaurant tech stack',
        'Next.js performance',
      ],
    });
  }
}
