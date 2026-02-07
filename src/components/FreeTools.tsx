import Reveal from "@/components/Reveal";

const TOOLS = [
  {
    name: "tipsplit-pro",
    version: "v2.1.0",
    title: "TipSplit Pro",
    tagline: "Fair tip distribution for restaurants.",
    description: "Split by hours, roles, or custom rules.",
    usage: [
      "tipsplit --mode [equal|hours|role]",
      "tipsplit --team <count>",
      "tipsplit --amount <total>",
    ],
    mailto: "mailto:derek@dbtech45.com?subject=TipSplit%20Pro%20Access",
  },
  {
    name: "sunday-squares",
    version: "v1.3.0",
    title: "Sunday Squares",
    tagline: "Super Bowl squares made easy.",
    description: "Create a board. Invite friends. Play.",
    usage: [
      "squares --create <game-name>",
      "squares --join <code>",
      "squares --status",
    ],
    mailto: "mailto:derek@dbtech45.com?subject=Sunday%20Squares%20Access",
  },
];

export default function FreeTools() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="ascii-divider mb-12">
            {`═══════════════ [ FREE TOOLS ] ═══════════════`}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TOOLS.map((tool, idx) => (
            <Reveal key={tool.name} delay={100 + idx * 150}>
              <div className="terminal-card h-full flex flex-col">
                <div className="terminal-header">
                  <span className="terminal-dot" style={{ background: "#ff5f56" }} />
                  <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
                  <span className="terminal-dot" style={{ background: "#27c93f" }} />
                  <span className="ml-2 text-faint text-xs font-mono">
                    {tool.name} — {tool.version}
                  </span>
                </div>

                <div className="p-5 md:p-6 font-mono text-sm flex-1 flex flex-col">
                  <p className="text-body mb-4">
                    <span className="text-amber font-bold">$ </span>
                    <span className="text-heading">
                      {tool.name.replace("-", "")} --help
                    </span>
                  </p>

                  <div className="h-px bg-edge mb-4" />

                  <div className="space-y-1 flex-1">
                    <p className="text-heading font-bold">&nbsp;&nbsp;{tool.title}</p>
                    <p className="text-body">&nbsp;&nbsp;{tool.tagline}</p>
                    <p className="text-body">&nbsp;&nbsp;{tool.description}</p>
                    <p className="text-body">&nbsp;</p>
                    <p className="text-faint uppercase text-xs tracking-wider">
                      &nbsp;&nbsp;Usage:
                    </p>
                    {tool.usage.map((line, i) => (
                      <p key={i} className="text-heading">
                        &nbsp;&nbsp;&nbsp;&nbsp;{line}
                      </p>
                    ))}
                    <p className="text-body mt-3">
                      <span className="text-amber font-bold">&nbsp;&nbsp;$ </span>
                      <span className="inline-block w-[2px] h-4 bg-amber align-middle animate-[blink-caret_0.75s_step-end_infinite]" />
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-edge">
                    <a
                      href={tool.mailto}
                      className="block text-center text-amber border border-amber/30 px-4 py-2.5 font-mono text-xs tracking-wider hover:bg-amber hover:text-black transition-all duration-200"
                    >
                      [RUN {tool.name}]
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
