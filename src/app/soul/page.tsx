import Link from 'next/link';

export default function SoulPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Soul Solace
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              AI-Powered Prayer Assistant
            </p>
            <p className="text-gray-400 leading-relaxed">
              Access authentic scriptural prayers and traditional liturgy for your spiritual path. 
              Get personalized prayer guidance with theological grounding across multiple religious traditions.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-2xl mb-3">🙏</div>
              <h3 className="text-lg font-semibold mb-2 text-amber-400">Authentic Prayers</h3>
              <p className="text-sm text-gray-400">Scripturally grounded prayers from various religious traditions</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2 text-amber-400">AI-Powered</h3>
              <p className="text-sm text-gray-400">Intelligent prayer suggestions based on your spiritual needs</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="text-lg font-semibold mb-2 text-amber-400">Multi-Faith</h3>
              <p className="text-sm text-gray-400">Support for Christianity, Judaism, Islam, Buddhism, and more</p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <div className="space-y-3">
              <a
                href="https://soulsolace.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105"
              >
                Launch Soul Solace →
              </a>
              <div className="text-sm text-gray-400">
                <p>Alternative link if above doesn&apos;t work:</p>
                <a 
                  href="https://soulsolace.vercel.app/soulsolace"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Direct App Link
                </a>
              </div>
            </div>
          </div>

          {/* Back to main site */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <Link 
              href="/"
              className="text-amber-400 hover:text-amber-300 transition-colors font-mono text-sm"
            >
              ← Back to DBTech45
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}