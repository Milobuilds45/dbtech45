import Link from "next/link";

export default function JunkDrawerPage() {
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
          <span className="text-5xl">🗄️</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white">The Junk Drawer</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            Bookmarks, gadgets & whatever else catches my eye.
          </p>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">The Collection</h2>
            <p className="text-gray-400 mb-6">
              Random finds, cool tools, interesting reads, and things I don't want to forget.
            </p>
            <p className="text-gray-500 italic">Coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
