import { NextRequest, NextResponse } from 'next/server'

// Derek's personal API keys - should be in environment variables
const API_KEYS = {
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  openai: process.env.OPENAI_API_KEY || '',
  google: process.env.GOOGLE_API_KEY || '',
  groq: process.env.GROQ_API_KEY || ''
};

export async function POST(request: NextRequest) {
  try {
    const { model, provider, message } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    let response;

    switch (provider) {
      case 'anthropic':
        response = await callAnthropic(model, message);
        break;
      case 'openai':
        response = await callOpenAI(model, message);
        break;
      case 'google':
        response = await callGoogle(model, message);
        break;
      case 'groq':
        response = await callGroq(model, message);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid provider' }, { status: 400 });
    }

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Personal AI API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function callAnthropic(model: string, message: string): Promise<string> {
  if (!API_KEYS.anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const modelMap: { [key: string]: string } = {
    'claude-opus-4.6': 'claude-3-opus-20240229',
    'claude-sonnet-4.5': 'claude-3-5-sonnet-20241022'
  };

  const anthropicModel = modelMap[model] || 'claude-3-5-sonnet-20241022';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEYS.anthropic,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(model: string, message: string): Promise<string> {
  if (!API_KEYS.openai) {
    throw new Error('OpenAI API key not configured');
  }

  const openaiModel = 'gpt-4-turbo-preview';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEYS.openai}`
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGoogle(model: string, message: string): Promise<string> {
  if (!API_KEYS.google) {
    throw new Error('Google API key not configured');
  }

  const geminiModel = model.includes('flash') ? 'gemini-1.5-flash' : 'gemini-1.5-pro';

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${API_KEYS.google}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: message
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callGroq(model: string, message: string): Promise<string> {
  if (!API_KEYS.groq) {
    throw new Error('Groq API key not configured');
  }

  const groqModel = 'llama-3.1-70b-versatile';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEYS.groq}`
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}