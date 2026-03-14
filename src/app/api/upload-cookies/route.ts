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
    const { cookies, cookiesBase64 } = body;

    let cookieContent: string;
    
    if (cookiesBase64) {
      // Decode from base64
      cookieContent = Buffer.from(cookiesBase64, 'base64').toString('utf-8');
    } else if (cookies && typeof cookies === 'string') {
      cookieContent = cookies;
    } else {
      console.error('[cookie-upload] Invalid cookies data. Type:', typeof cookies, 'Body keys:', Object.keys(body));
      return NextResponse.json({ 
        error: 'Invalid cookies data - provide either "cookies" or "cookiesBase64"'
      }, { status: 400 });
    }

    await fs.writeFile('/tmp/youtube_cookies.txt', cookieContent, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cookies uploaded successfully',
      lines: cookieContent.split('\n').length 
    });
  } catch (err: any) {
    console.error('[cookie-upload] Error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
