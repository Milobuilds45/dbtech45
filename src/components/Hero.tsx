"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [displayedLines, setDisplayedLines] = useState(0);
  const [taglineText, setTaglineText] = useState("");

  const terminalLines = [
    { text: "$ ./boot --system dbtech45", delay: 200 },
    { text: "[OK] Loading identity...", delay: 800 },
    { text: "[OK] Modules: trader, builder, father", delay: 1400 },
    { text: "[OK] AI agents: 10 online", delay: 2000 },
    { text: "[OK] Status: shipping daily", delay: 2600 },
    { text: "$ echo \"ready\"", delay: 3200 }
  ];

  const taglineFullText = "Imagination → Implementation";

  useEffect(() => {
    // Terminal typing animation
    terminalLines.forEach((line, index) => {
      setTimeout(() => {
        setDisplayedLines(index + 1);
      }, line.delay);
    });

    // Tagline typing animation
    setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i <= taglineFullText.length) {
          setTaglineText(taglineFullText.slice(0, i));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
    }, 3800);
  }, []);

  return (
    <section className="hero" id="hero" aria-label="Hero section">
      <div className="hero-content">
        <div className="hero-terminal" role="presentation">
          <div className="terminal-bar">
            <span className="terminal-dot red"></span>
            <span className="terminal-dot yellow"></span>
            <span className="terminal-dot green"></span>
            <span className="terminal-bar-title">dbtech45 — zsh</span>
          </div>
          <div className="terminal-body">
            {terminalLines.map((line, index) => (
              <div
                key={index}
                className={`typed-line ${index < displayedLines ? 'show' : ''}`}
              >
                {line.text.startsWith('$') ? (
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
                {index === terminalLines.length - 1 && index < displayedLines && (
                  <span className="cursor-blink"></span>
                )}
              </div>
            ))}
          </div>
        </div>
        <h1 className="hero-name">DBTECH45</h1>
        <p className="hero-tagline" aria-label="Imagination to Implementation">
          {taglineText}
        </p>
        <p className="hero-sub">Trade by day. Build by night. Dad of 7 always.</p>
        <div className="hero-ctas">
          <a href="#projects" className="btn btn-primary">→ Explore Projects</a>
          <a href="#connect" className="btn btn-secondary">⌘ Open Channel</a>
        </div>
      </div>
    </section>
  );
}