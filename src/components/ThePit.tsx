import Reveal from "@/components/Reveal";

const TICKERS = [
  { sym: "ES", val: "5247.50", dir: "up", pct: "+0.82%" },
  { sym: "NQ", val: "18432.00", dir: "up", pct: "+1.21%" },
  { sym: "SPY", val: "523.18", dir: "up", pct: "+0.64%" },
  { sym: "VIX", val: "14.32", dir: "down", pct: "-3.10%" },
  { sym: "/GC", val: "2847.60", dir: "up", pct: "+0.45%" },
  { sym: "BTC", val: "98420", dir: "up", pct: "+2.41%" },
  { sym: "10Y", val: "4.18%", dir: "down", pct: "-0.02" },
  { sym: "DXY", val: "103.42", dir: "down", pct: "-0.31%" },
] as const;

const ALERTS = [
  {
    time: "14:32:01",
    tag: "ALERT",
    tagClass: "text-amber",
    msg: "0DTE puts showing unusual volume \u2014 watching closely",
  },
  {
    time: "14:28:45",
    tag: "NOTE",
    tagClass: "text-blue",
    msg: "ES holding support at 5,180 \u2014 bullish bias into NFP",
  },
  {
    time: "14:15:22",
    tag: "MACRO",
    tagClass: "text-purple",
    msg: "2/10 spread just flipped positive \u2014 pay attention",
  },
];

export default function ThePit() {
  return (
    <section id="the-pit" className="section-anchor py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="ascii-divider mb-10">
            {"\u2550".repeat(15)} [ THE PIT ] {"\u2550".repeat(15)}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="amber-text font-display text-3xl md:text-4xl font-bold mb-2">
            THE PIT
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-body font-mono text-sm mb-8">
            Where the money moves.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT — Market Feed */}
          <Reveal delay={160}>
            <div className="terminal-card h-full flex flex-col">
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: "#ff5f56" }} />
                <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
                <span className="terminal-dot" style={{ background: "#27c93f" }} />
                <span className="font-mono text-xs text-faint ml-2">
                  bobby@dbtech45:~/trading/feed
                </span>
              </div>

              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-6">
                  {TICKERS.map((t) => (
                    <div
                      key={t.sym}
                      className="flex items-baseline gap-2 font-mono text-xs md:text-sm"
                    >
                      <span className="text-heading font-semibold w-10 shrink-0">
                        {t.sym}
                      </span>
                      <span className="text-amber font-semibold">
                        {t.val}
                      </span>
                      <span
                        className={
                          t.dir === "up" ? "text-green" : "text-red"
                        }
                      >
                        {t.dir === "up" ? "\u25B2" : "\u25BC"} {t.pct}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-edge mb-4" />

                <div className="flex flex-col gap-2">
                  {ALERTS.map((a, i) => (
                    <Reveal key={a.time} delay={300 + i * 80}>
                      <p className="font-mono text-xs leading-relaxed">
                        <span className="text-faint">[{a.time}]</span>{" "}
                        <span className={`${a.tagClass} font-semibold`}>
                          {a.tag}:
                        </span>{" "}
                        <span className="text-body">{a.msg}</span>
                      </p>
                    </Reveal>
                  ))}
                </div>

                <p className="mt-auto pt-4 font-mono text-xs text-faint">
                  <span className="text-amber">$</span>{" "}
                  <span className="inline-block w-[6px] h-3.5 bg-amber/70 animate-[blink-caret_0.75s_step-end_infinite]" />
                </p>
              </div>
            </div>
          </Reveal>

          {/* RIGHT — Signal & Noise */}
          <Reveal delay={240}>
            <div className="terminal-card h-full flex flex-col">
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: "#ff5f56" }} />
                <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
                <span className="terminal-dot" style={{ background: "#27c93f" }} />
                <span className="font-mono text-xs text-faint ml-2">
                  signal-noise &mdash; v0.1.0-beta
                </span>
              </div>

              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <h3 className="amber-text font-display text-2xl font-bold mb-1">
                  SIGNAL &amp; NOISE
                </h3>
                <p className="text-body text-sm mb-1">
                  AI-powered daily market intelligence
                </p>
                <p className="text-faint text-xs font-mono mb-6">
                  Powered by Bobby // Trading Advisor AI
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <input
                    type="email"
                    placeholder="operator@terminal.sh"
                    aria-label="Email address"
                    className="flex-1 bg-terminal border border-edge rounded px-3 py-2 font-mono text-sm text-heading placeholder:text-faint/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 transition-colors"
                  />
                  <button
                    type="button"
                    className="shrink-0 border border-amber text-amber font-mono text-xs font-semibold px-4 py-2 rounded hover:bg-amber/10 transition-colors duration-200 tracking-wide"
                  >
                    [SUBSCRIBE]
                  </button>
                </div>

                <div className="mt-auto">
                  <p className="font-mono text-xs text-faint mb-2">
                    Building newsletter engine...{" "}
                    <span className="text-amber">67%</span>
                  </p>
                  <div className="process-bar">
                    <div
                      className="process-bar-fill"
                      style={{ width: "67%" }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-faint mt-2 tracking-widest">
                    {"█".repeat(8)}{"░".repeat(4)} 67%
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
