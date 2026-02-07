export default function SoulPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Soul Solace
          </h1>
          <p className="text-xl text-gray-300 mb-4">AI-Powered Prayer Assistant</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Access authentic scriptural prayers and traditional liturgy for your spiritual path. 
            Get personalized prayer guidance with theological grounding across multiple religious traditions.
          </p>
        </div>

        {/* Direct Link to Working App */}
        <div className="text-center mb-16">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 max-w-md mx-auto">
            <div className="text-4xl mb-4">🙏</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Launch Prayer Assistant</h2>
            <p className="text-gray-400 mb-6">
              Experience authentic prayers from multiple faith traditions with AI guidance
            </p>
            <a
              href="https://soulsolace.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              Open Soul Solace →
            </a>
            <p className="text-xs text-gray-500 mt-3">Opens in new window</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="text-3xl mb-4">✝️</div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Multi-Faith Support</h3>
            <p className="text-gray-400 text-sm">Christianity, Judaism, Islam, Buddhism, Hinduism, and more</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">AI-Generated Prayers</h3>
            <p className="text-gray-400 text-sm">Personalized prayers based on your spiritual needs and tradition</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Mobile Friendly</h3>
            <p className="text-gray-400 text-sm">Works seamlessly on all devices for prayer on the go</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="bg-amber-500 text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">1</div>
              <h3 className="font-semibold text-white mb-2">Choose Faith</h3>
              <p className="text-gray-400 text-sm">Select your religious tradition from our supported faiths</p>
            </div>
            <div>
              <div className="bg-amber-500 text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">2</div>
              <h3 className="font-semibold text-white mb-2">Share Request</h3>
              <p className="text-gray-400 text-sm">Tell us what you'd like to pray about - healing, guidance, gratitude</p>
            </div>
            <div>
              <div className="bg-amber-500 text-black rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">3</div>
              <h3 className="font-semibold text-white mb-2">Receive Prayer</h3>
              <p className="text-gray-400 text-sm">Get an authentic, respectful prayer tailored to your tradition</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <a 
            href="/"
            className="text-amber-400 hover:text-amber-300 transition-colors font-mono"
          >
            ← Back to DBTech45
          </a>
          <p className="text-gray-500 text-xs mt-6">
            Prayers are generated with respect for religious traditions. 
            For personal spiritual guidance, consult your religious leader.
          </p>
        </div>
      </div>
    </div>
  );
}