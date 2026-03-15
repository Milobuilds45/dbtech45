import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { design } = await request.json();
    
    if (!design) {
      return NextResponse.json({ error: 'No design provided' }, { status: 400 });
    }

    const base64Data = design.replace(/^data:image\/\w+;base64,/, '');
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are an expert frontend developer. Analyze this UI design and generate production-ready Next.js + Tailwind CSS code.

Requirements:
1. Use TypeScript and 'use client' directive
2. Use Tailwind CSS classes (no inline styles unless necessary)
3. Component should be fully functional and responsive
4. Use semantic HTML
5. Include proper TypeScript types
6. Follow Next.js 14+ best practices
7. Keep it clean and production-ready

Return ONLY the component code. No explanations. Just the code that can be copied directly into a .tsx file.

Example structure:
'use client';

import { useState } from 'react';

export default function ComponentName() {
  // Component logic here
  return (
    <div className="...">
      {/* UI elements */}
    </div>
  );
}

Generate the component now based on the design screenshot.`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('Gemini API error:', error);
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    let code = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up markdown code blocks if present
    code = code.replace(/^```(?:typescript|tsx|javascript|jsx)?\n/gm, '');
    code = code.replace(/\n```$/gm, '');
    code = code.trim();

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json({ 
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
