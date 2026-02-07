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
    size: "1.8M",
    name: "soul-solace/",
    href: "/soulsolace",
    desc: "Prayer, wellness, spiritual grounding",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "1.2M",
    name: "sunday-squares/",
    href: "/sundaysquares",
    desc: "Football squares with friends",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "2.1M",
    name: "boundless/",
    href: "/boundless",
    desc: "Daily journaling for growth & clarity",
  },
  {
    perm: "drwxr--r--",
    status: "BUILD" as const,
    size: "0.4M",
    name: "ticker/",
    href: "https://tick-r.vercel.app",
    desc: "Teaching kids investing fundamentals",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.7M",
    name: "spend-signal/",
    href: "https://spendsignal.vercel.app",
    desc: "Smart spending tracker & money leaks",
  },
  {
    perm: "drw-------",
    status: "BUILD" as const,
    size: "0.2M",
    name: "concrete-before-curtains/",
    href: "#",
    desc: "Build foundations first, substance over aesthetics",
  },
  {
    perm: "drw-------",
    status: "BUILD" as const,
    size: "0.1M",
    name: "mojo/",
    href: "#",
    desc: "Coming soon",
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
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.6M",
    name: "menusparks/",
    href: "https://menusparks.vercel.app",
    desc: "AI menu optimization for restaurants",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "1.1M",
    name: "bobolas/",
    href: "https://bobolasnashua.com",
    desc: "Official restaurant site for Bobola's",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.5M",
    name: "picforge/",
    href: "https://picforge.vercel.app",
    desc: "AI image generation & editing",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.4M",
    name: "back-nine/",
    href: "https://backnineshop.com",
    desc: "Golf scoring & handicap tracking",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.3M",
    name: "locals-diner/",
    href: "https://localsdiner.com",
    desc: "Local restaurant discovery guide",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.5M",
    name: "inventory-buddy/",
    href: "https://inventorybuddy-delta.vercel.app",
    desc: "Inventory tracking for small business",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.3M",
    name: "scheduler/",
    href: "https://scheduler-hazel-three.vercel.app",
    desc: "Scheduling & calendar management",
  },
  {
    perm: "drwxr-xr-x",
    status: "LIVE" as const,
    size: "0.2M",
    name: "santa25/",
    href: "https://santa25.vercel.app",
    desc: "Secret Santa gift exchange organizer",
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
                        {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
                          {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
