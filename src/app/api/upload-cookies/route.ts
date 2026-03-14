import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';

const ADMIN_KEY = process.env.COOKIE_UPLOAD_KEY || 'dbtech45-cookies-2026';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${ADMIN_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cookies } = body;

    if (!cookies || typeof cookies !== 'string') {
      console.error('[cookie-upload] Invalid cookies data. Type:', typeof cookies, 'Body keys:', Object.keys(body));
      return NextResponse.json({ 
        error: 'Invalid cookies data', 
        received: typeof cookies,
        bodyKeys: Object.keys(body)
      }, { status: 400 });
    }

    await fs.writeFile('/tmp/youtube_cookies.txt', cookies, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cookies uploaded successfully',
      lines: cookies.split('\n').length 
    });
  } catch (err: any) {
    console.error('[cookie-upload] Error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
