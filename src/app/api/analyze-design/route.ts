import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    // Call Gemini vision API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${(process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this website design screenshot and extract the design system. Return ONLY valid JSON with this exact structure:
{
  "colors": [
    { "hex": "#000000", "name": "primary", "usage": "background" }
  ],
  "typography": {
    "families": ["Inter", "Roboto"],
    "sizes": ["12px", "14px", "16px", "20px", "24px"]
  },
  "spacing": {
    "scale": ["4px", "8px", "12px", "16px", "24px", "32px"]
  },
  "components": ["buttons", "cards", "navigation"]
}

Be precise. Extract actual hex values from the screenshot. Identify font families if visible. Note spacing patterns.`
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
            temperature: 0.2,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('Gemini API error:', error);
      return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Design analysis error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
