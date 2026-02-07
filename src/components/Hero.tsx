"use client";

import { useEffect, useState } from "react";

const BIO_LINES = [
  "Dad of 7",
  "Restaurant owner",
  "Trader",
  "Builder",
  "Turning ideas into products that ship.",
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Radial gradient orbs */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue/[0.03] blur-[100px]" />
        <div className="absolute top-1/3 right-[10%] w-[400px] h-[400px] rounded-full bg-purple/[0.02] blur-[90px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-4 sm:px-6">
        {/* System status bar */}
        <div
          className="terminal-card inline-flex items-center gap-2 px-4 py-2 mb-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div className="terminal-header !p-0 !bg-transparent !border-0 flex items-center gap-1.5 mr-2">
            <span className="terminal-dot" style={{ background: "#ff5f56" }} />
            <span className="terminal-dot" style={{ background: "#ffbd2e" }} />
            <span className="terminal-dot" style={{ background: "#27c93f" }} />
          </div>
          <span className="font-mono text-xs text-faint">
            dbtech45@forge:~$
          </span>
          <span className="font-mono text-xs text-amber">system --status</span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
          }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-9xl font-display font-black tracking-tighter amber-text">
            DBTECH45
          </h1>
          <p className="text-blue font-mono text-sm tracking-[0.3em] uppercase mt-3">
            {"// SYSTEM ONLINE"}
          </p>
        </div>

        {/* Tagline */}
        <div
          className="mt-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
          }}
        >
          <p className="cmd-prompt font-mono text-base sm:text-lg text-amber">
            IMAGINATION &rarr; IMPLEMENTATION
          </p>
        </div>

        {/* Bio lines */}
        <div className="mt-8 flex flex-col items-center gap-2">
          {BIO_LINES.map((line, i) => (
            <div
              key={i}
              className="font-mono text-sm text-body"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${700 + i * 80}ms, transform 0.5s ease ${700 + i * 80}ms`,
              }}
            >
              <span className="amber-text mr-2">{">"}</span>
              {line}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.6s ease 1.2s, transform 0.6s ease 1.2s",
          }}
        >
          <a
            href="#projects"
            className="accent-card px-8 py-3 font-mono text-sm text-amber border-amber/30 hover:border-amber transition-colors"
          >
            [EXPLORE PROJECTS]
          </a>
          <a
            href="mailto:derek@dbtech45.com"
            className="bg-amber text-black font-mono text-sm font-bold px-8 py-3 rounded-lg hover:bg-amber-dim transition-colors"
          >
            [OPEN CHANNEL]
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s ease 1.6s",
        }}
      >
        <span
          className="font-mono text-amber text-lg"
          style={{
            display: "inline-block",
            animation: "float-gentle 2s ease-in-out infinite",
          }}
        >
          &#x2588;
        </span>
      </div>
    </section>
  );
}
