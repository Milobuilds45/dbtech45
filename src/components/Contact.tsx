import Reveal from "@/components/Reveal";

const ACTIONS = [
  {
    cmd: "$ buy-app",
    color: "text-amber",
    desc: "License or purchase a shipped product",
    label: "[EXECUTE]",
    mailto:
      "mailto:derek@dbtech45.com?subject=Interested%20in%20Purchasing%20a%20Product",
  },
  {
    cmd: "$ collaborate",
    color: "text-blue",
    desc: "Build something together",
    label: "[EXECUTE]",
    mailto:
      "mailto:derek@dbtech45.com?subject=Collaboration%20Inquiry",
  },
  {
    cmd: "$ say-hello",
    color: "text-green",
    desc: "No agenda. Just connect.",
    label: "[EXECUTE]",
    mailto:
      "mailto:derek@dbtech45.com?subject=Hey%20Derek%20%F0%9F%91%8B",
  },
];

const SSH_LINES = [
  { text: "$ ssh derek@dbtech45.com", style: "text-heading" },
  { text: "Connecting to derek@dbtech45.com...", style: "text-faint" },
  { text: "Connection established.", style: "text-green" },
  { text: "", style: "" },
  { text: "Available commands:", style: "text-body" },
  { text: "  buy-app       \u2192 License or purchase a shipped product", style: "text-heading" },
  { text: "  collaborate   \u2192 Build something together", style: "text-heading" },
  { text: "  say-hello     \u2192 No agenda. Just connect.", style: "text-heading" },
];

export default function Contact() {
  return (
    <section id="contact" className="section-anchor py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="ascii-divider mb-12">
            {`═══════════════ [ CONNECT ] ═══════════════`}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="text-center mb-2">
            <h2 className="text-4xl md:text-6xl font-display font-black amber-text">
              OPEN CHANNEL
            </h2>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-center text-body font-mono text-sm mb-10">
            // Accepting incoming connections
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="terminal-card">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: "#ff5f56" }} />
              <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
              <span className="terminal-dot" style={{ background: "#27c93f" }} />
              <span className="ml-2 text-faint text-xs font-mono">
                ssh derek@dbtech45.com
              </span>
            </div>

            <div className="p-5 md:p-6 font-mono text-sm space-y-1">
              {SSH_LINES.map((line, i) =>
                line.text === "" ? (
                  <div key={i} className="h-3" />
                ) : (
                  <p key={i} className={line.style}>
                    {line.text.startsWith("$ ") ? (
                      <>
                        <span className="text-amber font-bold">$ </span>
                        <span className="text-heading">
                          {line.text.slice(2)}
                        </span>
                      </>
                    ) : (
                      line.text
                    )}
                  </p>
                )
              )}

              <p className="mt-2">
                <span className="text-amber font-bold">$ </span>
                <span className="inline-block w-[2px] h-4 bg-amber align-middle animate-[blink-caret_0.75s_step-end_infinite]" />
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {ACTIONS.map((action) => (
              <a
                key={action.cmd}
                href={action.mailto}
                className="accent-card p-5 text-center block group"
              >
                <p className={`${action.color} font-mono font-bold text-sm`}>
                  {action.cmd}
                </p>
                <p className="text-body text-xs mt-2">{action.desc}</p>
                <span className="inline-block mt-3 text-amber border border-amber/30 px-4 py-1.5 font-mono text-xs tracking-wider group-hover:bg-amber group-hover:text-black transition-all duration-200">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div className="mt-10 font-mono text-sm">
            <p className="text-body mb-2">
              <span className="text-amber font-bold">$ </span>
              <span className="text-heading">cat socials.json</span>
            </p>
            <div className="terminal-card">
              <div className="p-4 font-mono text-sm">
                <p className="text-faint">{"{"}</p>
                <p className="pl-4">
                  <span className="text-faint">&quot;twitter&quot;: </span>
                  <span>&quot;</span>
                  <a
                    href="https://x.com/DBtech45"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue hover:underline"
                  >
                    @DBtech45
                  </a>
                  <span>&quot;,</span>
                </p>
                <p className="pl-4">
                  <span className="text-faint">&quot;github&quot;: </span>
                  <span>&quot;</span>
                  <a
                    href="https://github.com/7LayerLabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber hover:underline"
                  >
                    7LayerLabs
                  </a>
                  <span>&quot;</span>
                </p>
                <p className="text-faint">{"}"}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
