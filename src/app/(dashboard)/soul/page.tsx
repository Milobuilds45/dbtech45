export default function SoulPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Soul Solace
          </h1>
          <p className="text-xl text-gray-300 mb-8">AI-Powered Prayer Assistant</p>
          
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 mb-8">
            <div className="text-4xl mb-4">🙏</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              Soul Solace is currently being rebuilt to provide authentic prayers 
              from multiple religious traditions with AI guidance.
            </p>
            <div className="text-left space-y-2 text-sm text-gray-500">
              <div>• Multi-faith support (Christianity, Judaism, Islam, Buddhism, etc.)</div>
              <div>• Personalized prayer generation</div>
              <div>• Scriptural grounding and authenticity</div>
              <div>• Mobile-responsive design</div>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-black px-8 py-4 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              ← Back to DBTech45
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}