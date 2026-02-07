import Reveal from "@/components/Reveal";

const AGENTS = [
  { pid: "001", name: "milo",   role: "chief-of-staff",       cpu: 92.1, mem: "2.4GB" },
  { pid: "002", name: "bobby",  role: "trading-advisor",      cpu: 87.3, mem: "1.8GB" },
  { pid: "003", name: "anders", role: "full-stack-architect",  cpu: 78.5, mem: "3.2GB" },
  { pid: "004", name: "paula",  role: "creative-director",     cpu: 71.2, mem: "2.1GB" },
  { pid: "005", name: "wendy",  role: "performance-coach",     cpu: 65.8, mem: "1.2GB" },
  { pid: "006", name: "grant",  role: "content-strategist",    cpu: 69.4, mem: "1.6GB" },
  { pid: "007", name: "tony",   role: "restaurant-ops",        cpu: 73.1, mem: "1.4GB" },
  { pid: "008", name: "remy",   role: "restaurant-marketing",  cpu: 67.9, mem: "1.3GB" },
  { pid: "009", name: "dwight", role: "weather-news",          cpu: 54.2, mem: "0.9GB" },
  { pid: "010", name: "dax",    role: "data-analyst",          cpu: 82.6, mem: "2.8GB" },
];

function cpuColor(cpu: number): string {
  if (cpu > 80) return "text-red";
  if (cpu > 60) return "text-amber";
  return "text-green";
}

function bar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width);
  return "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
}

export default function TheTeam() {
  return (
    <section id="the-team" className="section-anchor py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="ascii-divider mb-10">
            {"\u2550".repeat(15)} [ THE TEAM ] {"\u2550".repeat(15)}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="amber-text font-display text-3xl md:text-4xl font-bold mb-2">
            THE TEAM
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-body font-mono text-sm mb-8">
            10 AI Agents. One Mission. Zero Excuses.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="terminal-card">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: "#ff5f56" }} />
              <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
              <span className="terminal-dot" style={{ background: "#27c93f" }} />
              <span className="font-mono text-xs text-faint ml-2">
                htop &mdash; 10 processes running
              </span>
            </div>

            <div className="p-4 md:p-6">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <div className="grid grid-cols-[48px_90px_1fr_72px_72px_90px] gap-x-3 text-faint font-mono text-xs uppercase tracking-wider border-b border-edge pb-2 mb-2">
                  <span>PID</span>
                  <span>Name</span>
                  <span>Role</span>
                  <span>CPU%</span>
                  <span>MEM</span>
                  <span>Status</span>
                </div>

                {AGENTS.map((a, i) => (
                  <Reveal key={a.pid} delay={200 + i * 50}>
                    <div className="grid grid-cols-[48px_90px_1fr_72px_72px_90px] gap-x-3 items-center py-1.5 border-b border-edge/30 last:border-b-0 hover:bg-amber-ghost/40 transition-colors duration-200 font-mono text-xs md:text-sm">
                      <span className="text-faint">{a.pid}</span>
                      <span className="text-blue font-semibold">{a.name}</span>
                      <span className="text-body">{a.role}</span>
                      <span className={`${cpuColor(a.cpu)} font-semibold`}>
                        {a.cpu.toFixed(1)}%
                      </span>
                      <span className="text-faint">{a.mem}</span>
                      <span className="status-live text-green text-xs">
                        RUNNING
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col gap-3">
                {AGENTS.map((a, i) => (
                  <Reveal key={a.pid} delay={200 + i * 50}>
                    <div className="accent-card p-4 font-mono">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-faint text-[10px]">
                            PID {a.pid}
                          </span>
                          <span className="text-blue font-semibold text-sm">
                            {a.name}
                          </span>
                        </div>
                        <span className="status-live text-green text-xs">
                          RUNNING
                        </span>
                      </div>
                      <p className="text-body text-xs mb-2">{a.role}</p>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span>
                          CPU:{" "}
                          <span className={`${cpuColor(a.cpu)} font-semibold`}>
                            {a.cpu.toFixed(1)}%
                          </span>
                        </span>
                        <span className="text-faint">MEM: {a.mem}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Summary */}
              <Reveal delay={750}>
                <div className="mt-6 pt-4 border-t border-edge font-mono text-xs space-y-2">
                  <p className="text-body">
                    <span className="text-heading font-semibold">Tasks:</span>{" "}
                    10 total,{" "}
                    <span className="text-green">10 running</span>,{" "}
                    <span className="text-faint">0 sleeping</span>
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-heading font-semibold w-8">CPU:</span>
                    <span className="text-amber">74.2%</span>
                    <div className="process-bar flex-1 max-w-xs">
                      <div
                        className="process-bar-fill"
                        style={{ width: "74.2%" }}
                      />
                    </div>
                    <span className="text-faint tracking-widest text-[10px] hidden sm:inline">
                      [{bar(74.2, 26)}]
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-heading font-semibold w-8">Mem:</span>
                    <span className="text-amber">18.7GB / 32.0GB</span>
                    <div className="process-bar flex-1 max-w-xs">
                      <div
                        className="process-bar-fill"
                        style={{ width: "58.4%" }}
                      />
                    </div>
                    <span className="text-faint tracking-widest text-[10px] hidden sm:inline">
                      [{bar(58.4, 26)}]
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
