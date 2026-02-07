"use client";
import { useEffect, useRef } from "react";

export default function FreeTools() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const revealElements = sectionRef.current.querySelectorAll('.reveal');
      revealElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  const tools = [
    {
      icon: "💰",
      name: "TipSplit Pro",
      help: "./tipsplit --calculate",
      desc: "Professional tip calculator built for the restaurant industry. Handles complex splits, different tip rates, and tax calculations.",
      link: "/sundaysquares"
    },
    {
      icon: "🏈",
      name: "Sunday Squares",
      help: "./squares --generate",
      desc: "Digital football squares for your game day pool. Auto-scoring, payout tracking, and shareable boards.",
      link: "/sundaysquares"
    }
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="tools" aria-label="Free Tools section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">ls /usr/local/bin/tools/</div>
            <h2 className="section-title">Free Tools</h2>
            <p className="section-subtitle">Useful utilities I built and decided to share. No ads, no tracking, just tools that work.</p>
          </div>
          <div className="tools-grid">
            {tools.map((tool, index) => (
              <div key={index} className="tool-card reveal">
                <div className="tool-icon">{tool.icon}</div>
                <h3 className="tool-name">{tool.name}</h3>
                <div className="tool-help">{tool.help}</div>
                <p className="tool-desc">{tool.desc}</p>
                <a href={tool.link} className="btn btn-primary">Launch Tool →</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}