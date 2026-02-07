import Reveal from "@/components/Reveal";

const BRANCHES = [
  { type: "building", graph: "*", msg: "tickR MVP — Paper trading mode for kids" },
  { type: "building", graph: "*", msg: "Signal & Noise v1 — Newsletter pipeline with Bobby" },
  { type: "divider", graph: "|" },
  { type: "shaping", graph: "| *", msg: "Receipt Scanner — Auto-categorize expenses" },
  { type: "shaping", graph: "| *", msg: "Kitchen Cost Tracker — Real-time food cost alerts" },
  { type: "merge", graph: "|/" },
  { type: "spark", graph: "| *", msg: "AI Meal Planner — Weekly meal plans by budget" },
  { type: "spark", graph: "| *", msg: "Contractor Bidder — Compare home project bids" },
  { type: "spark", graph: "| *", msg: "Family Calendar AI — Smart scheduling for 7 kids" },
  { type: "merge", graph: "|/" },
  { type: "shipped", graph: "*", msg: 'init — "Every product starts as a spark"' },
] as const;

const TAG_STYLES: Record<string, string> = {
  building: "text-amber",
  shaping: "text-blue",
  spark: "text-purple",
  shipped: "text-faint",
};

const TAG_LABELS: Record<string, string> = {
  building: "[Building]",
  shaping: "[Shaping]",
  spark: "[Spark]",
  shipped: "[Shipped]",
};

export default function IdeasLab() {
  return (
    <section id="ideas-lab" className="section-anchor py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="ascii-divider mb-12">
            {`═══════════════ [ THE LAB ] ═══════════════`}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="text-3xl md:text-5xl font-display font-black amber-text mb-8">
            IDEAS LAB
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <div className="terminal-card">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: "#ff5f56" }} />
              <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
              <span className="terminal-dot" style={{ background: "#27c93f" }} />
              <span className="ml-2 text-faint text-xs font-mono">
                derek@dbtech45:~/lab (main)
              </span>
            </div>

            <div className="p-5 md:p-6 font-mono text-sm space-y-0.5">
              <p className="text-body mb-3">
                <span className="text-amber font-bold">$ </span>
                <span className="text-heading">
                  git log --graph --oneline --all
                </span>
              </p>

              <div className="h-px bg-edge mb-3" />

              {BRANCHES.map((branch, i) => {
                if (branch.type === "divider") {
                  return (
                    <p key={i} className="text-amber leading-6 select-none">
                      {branch.graph}
                    </p>
                  );
                }

                if (branch.type === "merge") {
                  return (
                    <p key={i} className="text-amber leading-6 select-none">
                      {branch.graph}
                    </p>
                  );
                }

                const tag = TAG_LABELS[branch.type];
                const tagColor = TAG_STYLES[branch.type];

                const isShipped = branch.type === "shipped";
                const msgParts = isShipped && branch.msg
                  ? branch.msg.split("— ")
                  : null;

                return (
                  <p key={i} className="leading-6">
                    <span className="text-amber">{branch.graph} </span>
                    <span className={`${tagColor} font-bold`}>{tag}</span>
                    <span className="text-heading">
                      {" "}
                      {isShipped && msgParts ? (
                        <>
                          {msgParts[0]}—{" "}
                          <span className="text-amber italic">
                            {msgParts[1]}
                          </span>
                        </>
                      ) : (
                        branch.msg
                      )}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-6 font-mono text-sm">
            <p className="text-body">
              <span className="text-amber font-bold">$ </span>
              <span className="text-heading">echo &apos;</span>
              <a
                href="mailto:derek@dbtech45.com?subject=Idea%20Submission&body=Here%27s%20my%20idea..."
                className="text-blue hover:underline"
              >
                Got an idea? Submit it
              </a>
              <span className="text-heading">&apos;</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
