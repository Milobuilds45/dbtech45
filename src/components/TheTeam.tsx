"use client";
import { useEffect, useRef } from "react";

export default function TheTeam() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      sectionRef.current.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }
    return () => observer.disconnect();
  }, []);

  const miloAgent = {
    name: "Milo",
    role: "Head of Staff",
    desc: "Routes every task, manages priorities, orchestrates the swarm. The brain that never sleeps.",
    color: "amber",
    icon: "🧠",
  };

  const agents = [
    { name: "Paula", role: "Creative Director", desc: "Brand identity, UI/UX, design systems. Makes chaos look intentional.", color: "amber", icon: "🎨" },
    { name: "Anders", role: "Full Stack Dev", desc: "Turns designs into production code. Ships fast, breaks nothing.", color: "blue", icon: "⚡" },
    { name: "Bobby", role: "Trading Advisor", desc: "Market analysis, signal generation, risk management. Always watching.", color: "green", icon: "📊" },
    { name: "Remy", role: "Marketing", desc: "Growth strategy, audience building, campaign execution.", color: "amber", icon: "📣" },
    { name: "Tony", role: "Operations", desc: "Systems, infrastructure, workflows. The invisible hand.", color: "green", icon: "⚙️" },
    { name: "Dax", role: "Content", desc: "Newsletters, storytelling. Turns ideas into words that land.", color: "amber", icon: "✍️" },
    { name: "Webb", role: "Research", desc: "Deep dives, competitive analysis, data synthesis.", color: "blue", icon: "🔍" },
    { name: "Dwight", role: "News Intel", desc: "Real-time monitoring, event detection, macro awareness.", color: "blue", icon: "📡" },
    { name: "Wendy", role: "Performance Coach", desc: "Habits, focus, energy management. Never quits on you.", color: "green", icon: "🎯" },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case "amber": return "agent-color-amber";
      case "green": return "agent-color-green";
      case "blue": return "agent-color-blue";
      default: return "agent-color-amber";
    }
  };

  return (
    <>
      <hr className="section-divider" />
      <section className="section swarm-section" id="swarm" aria-label="AI Swarm section" ref={sectionRef}>
        {/* Background decoration */}
        <div className="swarm-bg-grid" aria-hidden="true" />
        
        <div className="container">
          <div className="reveal swarm-header">
            <p className="section-command-clean">&gt; the-swarm</p>
            <h2 className="section-title">The Swarm</h2>
            <p className="section-subtitle">
              I don't have a team of 50. I have 10 AI agents who never sleep, never complain, and never miss a deadline.
            </p>
          </div>

          {/* Milo - The Leader */}
          <div className="swarm-leader reveal">
            <div className={`agent-card-leader ${getColorClass(miloAgent.color)}`}>
              <div className="agent-leader-glow" aria-hidden="true" />
              <div className="agent-leader-icon">{miloAgent.icon}</div>
              <div className="agent-leader-content">
                <div className="agent-leader-header">
                  <span className="agent-leader-name">{miloAgent.name}</span>
                  <span className="agent-status-pulse" />
                </div>
                <span className="agent-leader-role">{miloAgent.role}</span>
                <p className="agent-leader-desc">{miloAgent.desc}</p>
              </div>
              <div className="agent-leader-badge">COORDINATOR</div>
            </div>
          </div>

          {/* Connection lines visual */}
          <div className="swarm-connections reveal" aria-hidden="true">
            <svg className="connection-svg" viewBox="0 0 800 60" preserveAspectRatio="none">
              <path className="connection-line" d="M400,0 L100,60" />
              <path className="connection-line" d="M400,0 L250,60" />
              <path className="connection-line" d="M400,0 L400,60" />
              <path className="connection-line" d="M400,0 L550,60" />
              <path className="connection-line" d="M400,0 L700,60" />
            </svg>
          </div>

          {/* Agent Grid */}
          <div className="swarm-grid">
            {agents.map((agent, index) => (
              <div 
                key={index} 
                className={`agent-card-v2 ${getColorClass(agent.color)} reveal`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="agent-card-icon">{agent.icon}</div>
                <div className="agent-card-content">
                  <div className="agent-card-header">
                    <span className="agent-card-name">{agent.name}</span>
                    <span className="agent-status-dot" />
                  </div>
                  <span className={`agent-card-role ${getColorClass(agent.color)}`}>{agent.role}</span>
                  <p className="agent-card-desc">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="swarm-stats reveal">
            <div className="swarm-stat">
              <span className="swarm-stat-value">24/7</span>
              <span className="swarm-stat-label">Uptime</span>
            </div>
            <div className="swarm-stat-divider" />
            <div className="swarm-stat">
              <span className="swarm-stat-value">10</span>
              <span className="swarm-stat-label">Agents</span>
            </div>
            <div className="swarm-stat-divider" />
            <div className="swarm-stat">
              <span className="swarm-stat-value">∞</span>
              <span className="swarm-stat-label">Tasks/Day</span>
            </div>
            <div className="swarm-stat-divider" />
            <div className="swarm-stat">
              <span className="swarm-stat-value">0</span>
              <span className="swarm-stat-label">Sick Days</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
