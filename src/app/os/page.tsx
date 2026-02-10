'use client';

import { useState, useCallback, useRef } from 'react';

interface ModelConfig {
  id: string;
  name: string;
  color: string;
  provider: string;
}

interface ModelResponse {
  modelId: string;
  name: string;
  color: string;
  content: string | null;
  error?: string;
  tokens: { input: number; output: number };
  latencyMs: number;
}

const MODELS: ModelConfig[] = [
  { id: 'claude-opus', name: 'Claude Opus 4.6', color: '#D97706', provider: 'Anthropic' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', color: '#EA580C', provider: 'Anthropic' },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', color: '#2563EB', provider: 'Google' },
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', color: '#0891B2', provider: 'Google' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', color: '#059669', provider: 'OpenAI' },
  { id: 'llama-70b', name: 'Llama 3.3 70B', color: '#7C3AED', provider: 'Groq' },
];

export default function ModelCounsel() {
  const [question, setQuestion] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['claude-sonnet', 'gemini-flash', 'gpt-4-turbo']);
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = useCallback((modelId: string) => {
    setCollapsed(prev => ({ ...prev, [modelId]: !prev[modelId] }));
  }, []);

  const toggleModel = useCallback((modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  }, []);

  const askModels = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    if (selectedModels.length === 0) {
      setError('Please select at least one model');
      return;
    }

    setLoading(true);
    setError(null);
    setResponses([]);

    try {
      const res = await fetch('/api/model-counsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, models: selectedModels })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get responses');
      }

      setResponses(data.responses);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070b] text-[#eef0f6]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0c0d14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-[#8b8fa8] hover:text-white transition-colors">
              ← Back
            </a>
            <div className="w-px h-6 bg-white/10" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-[#00d4ff] to-[#6366f1] bg-clip-text text-transparent">
              Model Counsel
            </h1>
          </div>
          <div className="text-sm text-[#8b8fa8] font-mono">
            {selectedModels.length} models selected
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Model Selection */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[#8b8fa8] mb-4 uppercase tracking-wider">
            Select Models
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {MODELS.map(model => (
              <label
                key={model.id}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedModels.includes(model.id)
                    ? 'border-current bg-white/[0.02]'
                    : 'border-white/5 bg-[#11121c]/70 hover:border-white/10'
                  }
                `}
                style={{ 
                  borderColor: selectedModels.includes(model.id) ? model.color : undefined,
                  boxShadow: selectedModels.includes(model.id) ? `0 0 20px ${model.color}30` : undefined
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model.id)}
                  onChange={() => toggleModel(model.id)}
                  className="sr-only"
                />
                <span
                  className="w-2 h-2 rounded-full transition-opacity"
                  style={{
                    backgroundColor: model.color,
                    opacity: selectedModels.includes(model.id) ? 1 : 0.4,
                    boxShadow: selectedModels.includes(model.id) ? `0 0 8px ${model.color}` : undefined
                  }}
                />
                <span className={`text-sm font-medium ${selectedModels.includes(model.id) ? 'text-white' : 'text-[#8b8fa8]'}`}>
                  {model.name}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Question Input */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[#8b8fa8] mb-4 uppercase tracking-wider">
            Your Question
          </h2>
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something to compare how different models respond..."
              className="w-full min-h-[140px] p-4 rounded-xl border border-white/5 bg-[#0e0f18] text-white 
                       placeholder:text-[#505470] resize-y transition-all
                       focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  askModels();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#505470]">
              ⌘ + Enter to send
            </div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <button
            onClick={askModels}
            disabled={loading || selectedModels.length === 0}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#6366f1] text-white font-semibold 
                     rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-[#00d4ff]/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Consulting models...
              </span>
            ) : (
              `Ask ${selectedModels.length} Model${selectedModels.length !== 1 ? 's' : ''}`
            )}
          </button>
        </section>

        {/* Responses */}
        {responses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[#8b8fa8] uppercase tracking-wider">
                Responses
              </h2>
              <span className="text-xs text-[#505470] font-mono">
                {responses.filter(r => r.content).length}/{responses.length} succeeded
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {responses.map((response) => (
                <div
                  key={response.modelId}
                  className="rounded-xl border border-white/5 bg-[#11121c]/70 overflow-hidden
                           hover:border-white/10 transition-all"
                >
                  {/* Response Header - Clickable */}
                  <button
                    onClick={() => toggleCollapse(response.modelId)}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#13141f] 
                             hover:bg-[#181922] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`transition-transform duration-200 text-[#505470] text-xs ${collapsed[response.modelId] ? '' : 'rotate-90'}`}
                      >
                        ▶
                      </span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: response.color }}
                      />
                      <span className="font-semibold text-sm text-white">
                        {response.name}
                      </span>
                      {response.error && (
                        <span className="text-xs text-red-400 ml-2">error</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs font-mono text-[#505470]">
                      <span>{response.latencyMs}ms</span>
                      <span>{response.tokens.input + response.tokens.output} tok</span>
                    </div>
                  </button>

                  {/* Response Content - Collapsible */}
                  <div 
                    className={`transition-all duration-200 ease-in-out overflow-hidden ${
                      collapsed[response.modelId] ? 'max-h-0' : 'max-h-[400px]'
                    }`}
                  >
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      {response.error ? (
                        <div className="text-red-400 text-sm">
                          Error: {response.error}
                        </div>
                      ) : (
                        <div className="text-sm text-[#8b8fa8] leading-relaxed whitespace-pre-wrap">
                          {response.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && responses.length === 0 && (
          <div className="text-center py-16 text-[#505470]">
            <div className="text-4xl mb-4">🤖</div>
            <div className="text-lg font-medium text-[#8b8fa8] mb-2">
              Ask multiple AI models at once
            </div>
            <div className="text-sm">
              Compare responses from Claude, GPT, Gemini, and Llama side-by-side
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[#505470]">
          DB TECH OS — Model Counsel
        </div>
      </footer>
    </div>
  );
}
