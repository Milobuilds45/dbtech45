"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [displayedLines, setDisplayedLines] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const terminalLines = [
    { text: "$ ./boot --system dbtech45", delay: 200 },
    { text: "[OK] Loading identity...", delay: 800 },
    { text: "[OK] Modules: trader, builder, father", delay: 1400 },
    { text: "[OK] AI agents: 10 online", delay: 2000 },
    { text: "[OK] Status: shipping daily", delay: 2600 },
    { text: "$ echo \"ready\"", delay: 3200 },
  ];

  useEffect(() => {
    terminalLines.forEach((line, index) => {
      setTimeout(() => setDisplayedLines(index + 1), line.delay);
    });
    setTimeout(() => setShowContent(true), 3800);
  }, []);

  return (
    <section className="hero" id="hero" aria-label="Hero section">
      <div className="hero-content">
        <div className="hero-terminal" role="presentation">
          <div className="terminal-bar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-bar-title">dbtech45 &mdash; zsh</span>
          </div>
          <div className="terminal-body">
            {terminalLines.map((line, index) => (
              <div
                key={index}
                className={`typed-line ${index < displayedLines ? "show" : ""}`}
              >
                {line.text.startsWith("$") ? (
                  <>
                    <span className="prompt-char">$</span>
                    {line.text.slice(1)}
                  </>
                ) : (
                  <>
                    <span className="amber-text">[OK]</span>
                    {line.text.slice(4)}
                  </>
                )}
                {index === terminalLines.length - 1 &&
                  index < displayedLines && (
                    <span className="cursor-blink" />
                  )}
              </div>
            ))}
          </div>
        </div>

        <div className={`hero-text-block ${showContent ? "show" : ""}`}>
          <h1 className="hero-headline">
            Fueled by Caffeine<br />and Chaos
          </h1>
          <p className="hero-sub">
            I'm Derek. Dad of 7. Futures trader. Restaurant owner.<br />
            Self-taught builder running 9 AI agents. Shipping daily.
          </p>
          <div className="hero-ctas">
            <a href="#projects" className="btn btn-primary">
              See what I'm building &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
