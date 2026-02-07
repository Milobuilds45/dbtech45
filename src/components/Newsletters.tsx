import Reveal from "@/components/Reveal";

const NEWSLETTERS = [
  {
    id: 1,
    from: "signal-noise",
    subject: "Markets & Trading — AI-powered intel",
    freq: "Daily",
    status: "COMING SOON",
    desc: "AI-powered daily market intelligence. Futures, options, macro — the signal without the noise.",
  },
  {
    id: 2,
    from: "the-operator",
    subject: "Restaurant Business — Ops without insanity",
    freq: "Weekly",
    status: "COMING SOON",
    desc: "Running a restaurant without losing your mind. Operations, costs, people, and the grind.",
  },
  {
    id: 3,
    from: "dad-stack",
    subject: "Parenting + Building — Real multithreading",
    freq: "Weekly",
    status: "COMING SOON",
    desc: "Building an empire while raising 7 humans. The real multithreading.",
  },
];

export default function Newsletters() {
  return (
    <section id="newsletters" className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="ascii-divider mb-12">
            {`═══════════════ [ NEWSLETTERS ] ═══════════════`}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="terminal-card">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: "#ff5f56" }} />
              <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
              <span className="terminal-dot" style={{ background: "#27c93f" }} />
              <span className="ml-2 text-faint text-xs font-mono">
                mutt — 3 subscriptions
              </span>
            </div>

            <div className="p-5 md:p-6 font-mono text-sm">
              <div className="hidden md:grid grid-cols-[2rem_10rem_1fr_5rem_8rem] gap-2 text-faint text-xs uppercase tracking-wider mb-3 pb-2 border-b border-edge">
                <span>#</span>
                <span>FROM</span>
                <span>SUBJECT</span>
                <span>FREQ</span>
                <span>STATUS</span>
              </div>

              {NEWSLETTERS.map((nl) => (
                <div key={nl.id} className="mb-5">
                  <div className="hidden md:grid grid-cols-[2rem_10rem_1fr_5rem_8rem] gap-2 items-start leading-6">
                    <span className="text-faint">{nl.id}</span>
                    <span className="text-blue">{nl.from}</span>
                    <span className="text-heading">{nl.subject}</span>
                    <span className="text-amber">{nl.freq}</span>
                    <span className="text-green">[{nl.status}]</span>
                  </div>

                  <div className="md:hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-faint">{nl.id}</span>
                      <span className="text-blue font-bold">{nl.from}</span>
                      <span className="text-amber text-xs ml-auto">{nl.freq}</span>
                    </div>
                    <p className="text-heading text-xs pl-5">{nl.subject}</p>
                    <p className="text-green text-xs pl-5">[{nl.status}]</p>
                  </div>

                  <p className="mt-1.5 pl-0 md:pl-8 text-body text-xs leading-relaxed">
                    <span className="text-amber mr-1">{`>`}</span>
                    <span className="text-faint">{nl.from}:</span>{" "}
                    {nl.desc}
                  </p>
                </div>
              ))}

              <div className="h-px bg-edge mt-4 mb-5" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-amber font-bold shrink-0">$ </span>
                <span className="text-heading shrink-0">subscribe --email</span>
                <input
                  type="email"
                  placeholder="you@domain.com"
                  className="flex-1 min-w-0 bg-transparent border-b border-amber/30 text-amber font-mono text-sm py-1 px-1 outline-none focus:border-amber transition-colors placeholder:text-faint"
                  aria-label="Email address"
                />
                <button
                  type="button"
                  className="text-amber border border-amber/30 px-4 py-1.5 font-mono text-xs tracking-wider hover:bg-amber hover:text-black transition-all duration-200 cursor-pointer"
                >
                  [ENTER]
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
