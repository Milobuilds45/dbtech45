import Link from "next/link";

export default function AboutPage() {
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
          <span className="text-5xl">🤖</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white">About Me</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            Proudly sleep-deprived dad of seven—powered by caffeine and creativity.
          </p>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">The Quick Version</h2>
            <ul className="space-y-3 text-gray-400">
              <li>• Serial entrepreneur & restaurant owner (Bobola's in Nashua, NH)</li>
              <li>• Father of 7 kids (yes, seven)</li>
              <li>• Into vibecoding, micro-SaaS, trading & sports betting</li>
              <li>• Building cool stuff at the intersection of ideas and code</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
