import Reveal from "@/components/Reveal";

export default function About() {
  return (
    <section id="about" className="section-anchor py-20 md:py-28 px-4 sm:px-6">
      <Reveal className="mb-12">
        <p className="ascii-divider">
          {"\u2550".repeat(15)} [ ABOUT ] {"\u2550".repeat(15)}
        </p>
      </Reveal>

      <Reveal delay={100} className="max-w-4xl mx-auto">
        <div className="terminal-card">
          <div className="terminal-header">
            <span className="terminal-dot" style={{ background: "#ff5f56" }} />
            <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
            <span className="terminal-dot" style={{ background: "#27c93f" }} />
            <span className="font-mono text-xs text-faint ml-2">
              derek@dbtech45:~/about
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-0">
            {/* whoami */}
            <Reveal delay={200} className="mb-8">
              <p className="font-mono text-sm">
                <span className="text-amber font-bold">$ </span>
                <span className="text-amber">whoami</span>
              </p>
              <p className="font-mono text-sm text-heading mt-1 pl-4">
                {">"} Derek Bobola &mdash; Dad of 7, restaurant owner, trader, builder
              </p>
            </Reveal>

            {/* cat stats.json */}
            <Reveal delay={400} className="mb-8">
              <p className="font-mono text-sm">
                <span className="text-amber font-bold">$ </span>
                <span className="text-amber">cat stats.json</span>
              </p>
              <div className="font-mono text-sm mt-1 pl-4">
                <p className="text-faint">{"{"}</p>
                <p>
                  <span className="text-blue">{`  "kids"`}</span>
                  <span className="text-faint">:</span>
                  {"        "}
                  <span className="text-purple">7</span>
                  <span className="text-faint">,</span>
                </p>
                <p>
                  <span className="text-blue">{`  "restaurants"`}</span>
                  <span className="text-faint">:</span>
                  {" "}
                  <span className="text-purple">4</span>
                  <span className="text-faint">,</span>
                </p>
                <p>
                  <span className="text-blue">{`  "repos"`}</span>
                  <span className="text-faint">:</span>
                  {"       "}
                  <span className="text-purple">27</span>
                  <span className="text-faint">,</span>
                </p>
                <p>
                  <span className="text-blue">{`  "ai_agents"`}</span>
                  <span className="text-faint">:</span>
                  {"   "}
                  <span className="text-purple">9</span>
                  <span className="text-faint">,</span>
                </p>
                <p>
                  <span className="text-blue">{`  "status"`}</span>
                  <span className="text-faint">:</span>
                  {"      "}
                  <span className="text-amber">{`"always shipping"`}</span>
                </p>
                <p className="text-faint">{"}"}</p>
              </div>
            </Reveal>

            {/* cat bio.txt */}
            <Reveal delay={600} className="mb-8">
              <p className="font-mono text-sm">
                <span className="text-amber font-bold">$ </span>
                <span className="text-amber">cat bio.txt</span>
              </p>
              <div className="font-mono text-sm text-body mt-1 pl-4 leading-relaxed">
                <p>
                  I run restaurants during the day, trade the markets before
                </p>
                <p>
                  the bell, build apps after the kids go to bed, and raise
                </p>
                <p>
                  seven humans in between. I don&apos;t wait for permission to
                </p>
                <p>build. If the idea won&apos;t leave me alone, I ship it.</p>
              </div>
            </Reveal>

            {/* ls -la identity/ */}
            <Reveal delay={800}>
              <p className="font-mono text-sm">
                <span className="text-amber font-bold">$ </span>
                <span className="text-amber">ls -la identity/</span>
              </p>
              <div className="font-mono text-sm mt-1 pl-4 space-y-0.5">
                <p>
                  <span className="text-faint">drwxr-xr-x  </span>
                  <span className="text-amber">father/</span>
                </p>
                <p>
                  <span className="text-faint">drwxr-xr-x  </span>
                  <span className="text-amber">operator/</span>
                </p>
                <p>
                  <span className="text-faint">drwxr-xr-x  </span>
                  <span className="text-amber">trader/</span>
                </p>
                <p>
                  <span className="text-faint">drwxr-xr-x  </span>
                  <span className="text-amber">builder/</span>
                </p>
                <p>
                  <span className="text-faint">-rw-r--r--  </span>
                  <span className="text-blue">README.md</span>
                </p>
                <p className="text-amber italic pl-12 mt-1 leading-relaxed">
                  &quot;You don&apos;t need a CS degree. You need a<br />
                  {" "}problem that pisses you off and the<br />
                  {" "}stubbornness to solve it.&quot;
                </p>
              </div>
            </Reveal>

            {/* Blinking cursor */}
            <div className="pt-6">
              <span className="font-mono text-sm text-amber font-bold">$ </span>
              <span
                className="inline-block w-[8px] h-[16px] bg-amber"
                style={{
                  animation: "blink-caret 0.75s step-end infinite",
                }}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
