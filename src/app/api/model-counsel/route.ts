// Model Counsel API - Calls multiple AI models in parallel

const MODELS: Record<string, { name: string; provider: string; model: string; color: string }> = {
  'claude-opus': {
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    model: 'claude-opus-4-6',
    color: '#D97706'
  },
  'claude-sonnet': {
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    color: '#EA580C'
  },
  'gemini-pro': {
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    model: 'gemini-3.1-pro',
    color: '#2563EB'
  },
  'gemini-flash': {
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    model: 'gemini-2.0-flash',
    color: '#0891B2'
  },
  'gpt-4.1': {
    name: 'GPT-4.1',
    provider: 'openai',
    model: 'gpt-4.1',
    color: '#059669'
  },
  'grok': {
    name: 'Grok 4.1 Fast',
    provider: 'xai',
    model: 'grok-4-1-fast',
    color: '#7C3AED'
  },
  'llama': {
    name: 'Llama 4 Scout',
    provider: 'groq',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    color: '#6366F1'
  }
};

async function callAnthropic(model: string, question: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    tokens: {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0
    }
  };
}

async function callGoogle(model: string, question: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }],
      generationConfig: { maxOutputTokens: 65536 }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${error}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    const blockReason = data.promptFeedback?.blockReason || 'Unknown';
    throw new Error(`Response blocked or empty (reason: ${blockReason})`);
  }

  const candidate = data.candidates[0];
  const finishReason = candidate.finishReason || 'Unknown';

  // Extract content if available (even partial from MAX_TOKENS)
  const hasContent = candidate.content?.parts?.length > 0 && candidate.content.parts[0].text;

  if (!hasContent && finishReason !== 'STOP') {
    throw new Error(`No content returned (finishReason: ${finishReason})`);
  }

  const text = hasContent ? candidate.content.parts[0].text : '';

  return {
    content: finishReason === 'MAX_TOKENS' ? text + '\n\n[Response truncated - hit token limit]' : text,
    tokens: {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0
    }
  };
}

async function callOpenAI(model: string, question: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokens: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0
    }
  };
}

async function callXAI(model: string, question: string) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY not configured');

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`xAI API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokens: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0
    }
  };
}

async function callGroq(model: string, question: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokens: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0
    }
  };
}

async function callModel(modelId: string, question: string) {
  const modelConfig = MODELS[modelId];
  if (!modelConfig) throw new Error(`Unknown model: ${modelId}`);

  const startTime = Date.now();
  let result;

  switch (modelConfig.provider) {
    case 'anthropic':
      result = await callAnthropic(modelConfig.model, question);
      break;
    case 'google':
      result = await callGoogle(modelConfig.model, question);
      break;
    case 'openai':
      result = await callOpenAI(modelConfig.model, question);
      break;
    case 'xai':
      result = await callXAI(modelConfig.model, question);
      break;
    case 'groq':
      result = await callGroq(modelConfig.model, question);
      break;
    default:
      throw new Error(`Unknown provider: ${modelConfig.provider}`);
  }

  return {
    modelId,
    name: modelConfig.name,
    color: modelConfig.color,
    content: result.content,
    tokens: result.tokens,
    latencyMs: Date.now() - startTime
  };
}

export async function GET() {
  return Response.json({ models: MODELS });
}

export async function POST(request: Request) {
  try {
    const { question, models } = await request.json();

    if (!question || !models || !Array.isArray(models) || models.length === 0) {
      return Response.json({ error: 'Missing question or models array' }, { status: 400 });
    }

    // Call all selected models in parallel
    const results = await Promise.allSettled(
      models.map((modelId: string) => callModel(modelId, question))
    );

    const responses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          modelId: models[index],
          name: MODELS[models[index]]?.name || models[index],
          color: MODELS[models[index]]?.color || '#666',
          error: result.reason.message,
          content: null,
          tokens: { input: 0, output: 0 },
          latencyMs: 0
        };
      }
    });

    return Response.json({
      success: true,
      responses,
      models: MODELS
    });

  } catch (error) {
    console.error('Model Counsel error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
