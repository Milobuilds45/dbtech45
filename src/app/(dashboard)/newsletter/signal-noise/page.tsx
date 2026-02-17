'use client';
import { useState } from 'react';
import { TrendingUp, Check } from 'lucide-react';

export default function SignalNoisePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // TODO: Connect to email service (Buttondown, ConvertKit, etc.)
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full">
        <div className="mb-8">
          <a href="/" className="text-[#f59e0b] hover:underline text-sm font-mono">
            ← Back to Home
          </a>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] mb-6">
            <TrendingUp size={32} />
          </div>
          <div className="inline-block px-3 py-1 bg-[#f59e0b]/15 text-[#f59e0b] text-xs font-mono uppercase tracking-wider rounded-full mb-4">
            Coming Soon
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Signal & Noise
          </h1>
          <p className="text-[#71717a] font-mono text-sm">Daily Market Intelligence</p>
        </div>

        <div className="bg-[#111113] border border-[#27272a] rounded-xl p-8 mb-8">
          <p className="text-[#a1a1aa] text-center mb-6 leading-relaxed">
            Market intelligence filtered through 15 years of trading experience. 
            Technical analysis, macro themes, and conviction plays that actually matter.
          </p>

          <ul className="space-y-3 mb-8">
            {[
              'Daily pre-market analysis',
              'Key levels and setups',
              'Macro themes and catalysts',
              'Options flow highlights',
              'No fluff, just signal'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                <Check size={16} className="text-[#EF4444] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EF4444]/10 text-[#EF4444] mb-4">
                <Check size={24} />
              </div>
              <p className="text-[#EF4444] font-medium mb-2">You're on the list!</p>
              <p className="text-[#71717a] text-sm">We'll notify you when Signal & Noise launches.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b] transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-[#f59e0b] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#fbbf24] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Joining...' : 'Get Early Access'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[#52525b] text-xs">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
