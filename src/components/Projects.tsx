import Reveal from "@/components/Reveal";

const PROJECTS = [
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "4.2M",
    name: "dbtech-os/",
    href: "/os",
    desc: "Personal operating system & AI dashboard",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "2.1M",
    name: "boundless/",
    href: "#",
    desc: "Daily journaling for growth & clarity",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "1.8M",
    name: "soul-solace/",
    href: "#",
    desc: "Prayer, wellness, spiritual grounding",
  },
  {
    perm: "drwxr--r--",
    status: "BUILD" as const,
    size: "0.9M",
    name: "signal-noise/",
    href: "#",
    desc: "AI-powered daily trading newsletter",
  },
  {
    perm: "drwxr--r--",
    status: "BUILD" as const,
    size: "0.4M",
    name: "tickr/",
    href: "#",
    desc: "Teaching kids investing fundamentals",
  },
  {
    perm: "drw-------",
    status: "PLAN" as const,
    size: "0.1M",
    name: "menusparks/",
    href: "#",
    desc: "AI menu optimization for restaurants",
  },
  {
    perm: "drw-------",
    status: "PLAN" as const,
    size: "0.0M",
    name: "spend-signal/",
    href: "#",
    desc: "Smart spending tracker & money leaks",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "1.2M",
    name: "sunday-squares/",
    href: "#",
    desc: "Super Bowl squares with friends",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.8M",
    name: "tipsplit-pro/",
    href: "#",
    desc: "Fair restaurant tip calculator",
  },
];

const STATUS_CLASS: Record<string, string> = {
  LIVE: "text-green",
  BUILD: "text-amber",
  PLAN: "text-faint",
};

export default function Projects() {
  return (
    <section id="projects" className="section-anchor py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="ascii-divider mb-10">
            {"\u2550".repeat(15)} [ PROJECTS ] {"\u2550".repeat(15)}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="terminal-card">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: "#ff5f56" }} />
              <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
              <span className="terminal-dot" style={{ background: "#27c93f" }} />
              <span className="font-mono text-xs text-faint ml-2">
                derek@dbtech45:~/projects
              </span>
            </div>

            <div className="p-4 md:p-6">
              <p className="cmd-prompt font-mono text-xs text-body mb-4">
                ls -la /projects/
              </p>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <div className="grid grid-cols-[140px_70px_56px_1fr_1fr] gap-x-4 text-faint font-mono text-xs uppercase tracking-wider border-b border-edge pb-2 mb-2">
                  <span>Permissions</span>
                  <span>Status</span>
                  <span>Size</span>
                  <span>Name</span>
                  <span>Description</span>
                </div>

                {PROJECTS.map((p, i) => (
                  <Reveal key={p.name} delay={140 + i * 60}>
                    <div className="grid grid-cols-[140px_70px_56px_1fr_1fr] gap-x-4 items-baseline py-1.5 border-b border-edge/30 last:border-b-0 hover:bg-amber-ghost/40 transition-colors duration-200">
                      <span className="text-faint font-mono text-xs">
                        {p.perm}
                      </span>
                      <span
                        className={`font-mono text-xs font-semibold ${STATUS_CLASS[p.status]}`}
                      >
                        [{p.status}]
                      </span>
                      <span className="text-faint font-mono text-xs">
                        {p.size}
                      </span>
                      <a
                        href={p.href}
                        className="text-blue font-mono font-semibold text-sm hover:underline cursor-pointer"
                      >
                        {p.name}
                      </a>
                      <span className="text-body font-mono text-sm">
                        {p.desc}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col gap-3">
                {PROJECTS.map((p, i) => (
                  <Reveal key={p.name} delay={140 + i * 60}>
                    <div className="accent-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={p.href}
                          className="text-blue font-mono font-semibold text-sm cursor-pointer"
                        >
                          {p.name}
                        </a>
                        <span
                          className={`font-mono text-xs font-semibold ${STATUS_CLASS[p.status]}`}
                        >
                          [{p.status}]
                        </span>
                      </div>
                      <p className="text-body font-mono text-xs leading-relaxed">
                        {p.desc}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-faint font-mono text-[10px]">
                        <span>{p.perm}</span>
                        <span>{p.size}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={700}>
                <p className="cmd-prompt font-mono text-xs text-body mt-6">
                  echo &quot;All mailto links &rarr;{" "}
                  <a
                    href="mailto:derek.bobola@gmail.com"
                    className="text-blue hover:underline"
                  >
                    derek.bobola@gmail.com
                  </a>
                  &quot;
                </p>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
