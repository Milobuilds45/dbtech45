import Link from "next/link";

export default function LaunchpadPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-green-400 hover:text-green-300 mb-8 inline-block"
        >
          ← Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">💡</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Launchpad</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            Fueling new ventures—solo projects and collaborations that take flight.
          </p>

          <div className="grid gap-6 mt-8">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">MenuSparks</h3>
              <p className="text-gray-400">AI-powered menu optimization for restaurants</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">The Pour Plan</h3>
              <p className="text-gray-400">Menu optimization concept for bars</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">Meet the Feed</h3>
              <p className="text-gray-400">Social media content and engagement platform</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
