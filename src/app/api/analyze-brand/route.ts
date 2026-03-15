import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { logo } = await request.json();
    
    if (!logo) {
      return NextResponse.json({ error: 'No logo provided' }, { status: 400 });
    }

    const base64Data = logo.replace(/^data:image\/\w+;base64,/, '');
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this logo and extract a complete brand system. Return ONLY valid JSON with this structure:
{
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "heading": "Font Name",
    "body": "Font Name",
    "mono": "Monospace Font"
  },
  "vibe": "modern/classic/playful/professional/etc",
  "industry": "tech/finance/creative/etc"
}

Extract the dominant colors from the logo. Infer a cohesive color palette. Suggest typography that matches the brand's visual identity. Be precise with hex values.`
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
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('Gemini API error:', error);
      return NextResponse.json({ error: 'Failed to analyze logo' }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const brandSystem = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json(brandSystem);
  } catch (error) {
    console.error('Brand analysis error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
