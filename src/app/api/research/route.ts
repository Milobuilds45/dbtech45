import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { query, depth = 'balanced', useScrapeCreators = false } = await req.json();
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Find skill root
    const possiblePaths = [
      path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'openclaw', 'skills', 'last30days'),
      path.join(os.homedir(), '.agents', 'skills', 'last30days'),
      path.join(os.homedir(), '.openclaw', 'skills', 'last30days'),
    ];

    let skillRoot: string | null = null;
    for (const p of possiblePaths) {
      try {
        const scriptPath = path.join(p, 'scripts', 'last30days.py');
        await execAsync(`python3 -c "import os; exit(0 if os.path.exists('${scriptPath.replace(/\\/g, '\\\\')}') else 1)"`);
        skillRoot = p;
        break;
      } catch {}
    }

    if (!skillRoot) {
      return NextResponse.json({ 
        error: 'last30days skill not found',
        details: 'Run: openclaw skills info last30days',
      }, { status: 500 });
    }

    const scriptPath = path.join(skillRoot, 'scripts', 'last30days.py');
    
    // Depth flag
    const depthFlag = depth === 'quick' ? '--quick' : depth === 'deep' ? '--deep' : '';
    
    // Sources flag - if useScrapeCreators is false, only use X (not reddit/tiktok/instagram)
    const sourcesFlag = useScrapeCreators ? '--sources both' : '--sources x';
    
    // Run research (5 minute timeout)
    let stdout = '';
    let stderr = '';
    
    try {
      const result = await execAsync(
        `chcp 65001 > nul && python3 "${scriptPath}" "${query.replace(/"/g, '\\"')}" ${depthFlag} ${sourcesFlag} --emit=compact --no-native-web`,
        {
          timeout: 300000, // 5 minutes
          maxBuffer: 10 * 1024 * 1024, // 10MB
          encoding: 'utf8',
          shell: 'cmd.exe', // Use cmd to set codepage
          env: {
            ...process.env,
            SKILL_ROOT: skillRoot,
            PYTHONIOENCODING: 'utf-8',
          },
        }
      );
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error: any) {
      // Script crashes on file write but stderr has all the data we need
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      
      // If we got data, continue parsing; otherwise re-throw
      if (!stderr || stderr.length < 100) {
        throw error;
      }
      console.log('[research] Script crashed but recovered data from stderr');
    }

    // Parse output for stats and summary
    const output = stdout + stderr;
    
    console.log('[research] stdout length:', stdout.length);
    console.log('[research] stderr length:', stderr.length);
    console.log('[research] combined length:', output.length);
    console.log('[research] has YouTube:', output.includes('YouTube'));
    console.log('[research] has HN:', output.includes('HN'));
    console.log('[research] first 500 chars:', output.substring(0, 500));

    // The script collected data but might have crashed on file write
    // Check if we got actual results in the output
    if (!output.includes('YouTube') && !output.includes('HN')) {
      console.log('[research] No data found in output - NO YOUTUBE OR HN MARKERS');
      return NextResponse.json({
        error: 'No results found',
        details: 'The search completed but no relevant content was discovered. Try a different query or check API keys.',
      }, { status: 200 }); // Return 200 so frontend doesn't show generic error
    }

    // Extract clean summary (everything from "## Research Results" to "---")
    const summaryMatch = output.match(/## Research Results:[\s\S]*?(?=\n---\n)/);
    const summary = summaryMatch ? summaryMatch[0] : 'Research complete';

    // Extract duration
    const durationMatch = output.match(/Research complete \((\d+\.\d+)s\)|✓ Research complete/);
    const duration = durationMatch && durationMatch[1] ? Math.round(parseFloat(durationMatch[1])) : 180;

    const results: any[] = [];

    // Parse YouTube videos - format: **videoId** (score:N) Author (date) [views, likes]
    // Title is on next line with indent
    const ytSection = output.match(/### YouTube Videos([\s\S]*?)(?=###|---)/);
    if (ytSection) {
      const ytMatches = ytSection[1].matchAll(/\*\*([A-Za-z0-9_-]{11})\*\* \(score:(\d+)\) ([^\(]+) \((\d{4}-\d{2}-\d{2})\)[^\n]*\n\s+([^\n]+)\n\s+https:\/\/www\.youtube\.com\/watch\?v=\1/g);
      for (const match of ytMatches) {
        results.push({
          id: match[1],
          source: 'youtube',
          title: match[5].trim(),
          snippet: '',
          url: `https://www.youtube.com/watch?v=${match[1]}`,
          score: parseInt(match[2]),
          timestamp: match[4],
          author: match[3].trim(),
        });
      }
    }

    // Parse Hacker News stories - format: **HNN** (score:N) hn/user (date) [pts, cmt]
    // Title is on next line with indent
    const hnSection = output.match(/### Hacker News Stories([\s\S]*?)(?=###|---)/);
    if (hnSection) {
      const hnMatches = hnSection[1].matchAll(/\*\*HN\d+\*\* \(score:(\d+)\) hn\/([^\s]+)[^\n]*\n\s+([^\n]+)\n\s+https:\/\/news\.ycombinator\.com\/item\?id=(\d+)/g);
      for (const match of hnMatches) {
        results.push({
          id: match[4],
          source: 'hn',
          title: match[3].trim(),
          snippet: '',
          url: `https://news.ycombinator.com/item?id=${match[4]}`,
          score: parseInt(match[1]),
          timestamp: 'recently',
          author: `hn/${match[2]}`,
        });
      }
    }

    console.log('[research] Parsed results:', results.length);

    return NextResponse.json({
      summary,
      results,
      duration,
    });

  } catch (err: any) {
    console.error('[research] Error:', err);
    return NextResponse.json({ 
      error: 'Research failed',
      details: err.message,
    }, { status: 500 });
  }
}
