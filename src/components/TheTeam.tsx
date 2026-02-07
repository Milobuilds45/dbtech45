"use client";
import { useEffect, useRef } from "react";

export default function TheTeam() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Animate stat bars when visible
            const statFills = entry.target.querySelectorAll('.team-stat-fill');
            statFills.forEach((fill) => {
              const width = fill.getAttribute('data-width');
              if (width) {
                setTimeout(() => {
                  (fill as HTMLElement).style.width = width;
                }, 300);
              }
            });
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

  const agents = [
    {
      avatar: "🎯",
      name: "Milo",
      role: "Head PA",
      desc: "Chief orchestrator. Routes tasks, manages priorities, keeps the machine running."
    },
    {
      avatar: "🎨",
      name: "Paula",
      role: "Creative Director",
      desc: "Design systems, brand identity, UI/UX. Makes everything look intentional."
    },
    {
      avatar: "⚡",
      name: "Anders",
      role: "Developer",
      desc: "Full-stack engineer. Turns designs into deployed, production-grade code."
    },
    {
      avatar: "📊",
      name: "Bobby",
      role: "Trading Advisor",
      desc: "Market analysis, signal generation, risk management. The edge finder."
    },
    {
      avatar: "📢",
      name: "Remy",
      role: "Marketing",
      desc: "Growth strategy, audience building, campaign execution. Gets eyes on the work."
    },
    {
      avatar: "⚙️",
      name: "Tony",
      role: "Operations",
      desc: "Systems, infrastructure, workflows. The invisible hand that keeps it all stable."
    },
    {
      avatar: "✍️",
      name: "Dax",
      role: "Content",
      desc: "Writing, newsletters, storytelling. Turns ideas into words that land."
    },
    {
      avatar: "🔍",
      name: "Webb",
      role: "Research",
      desc: "Deep dives, competitive analysis, data synthesis. Brings receipts."
    },
    {
      avatar: "📰",
      name: "Dwight",
      role: "News Intel",
      desc: "Real-time news monitoring, event detection, macro awareness. Always watching."
    },
    {
      avatar: "🏋️",
      name: "Wendy",
      role: "Performance Coach",
      desc: "Habits, focus, energy management. The accountability partner that doesn't quit."
    }
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="team" aria-label="AI Team section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">ps aux --team</div>
            <h2 className="section-title">The Team</h2>
            <p className="section-subtitle">10 AI agents. One mission. Ship things that matter.</p>
          </div>

          <div className="team-stats reveal">
            <div className="team-stat">
              <div className="team-stat-label">Tasks Running</div>
              <div className="team-stat-bar">
                <div className="team-stat-fill amber" data-width="78%"></div>
              </div>
              <div className="team-stat-value">78% capacity</div>
            </div>
            <div className="team-stat">
              <div className="team-stat-label">CPU Usage</div>
              <div className="team-stat-bar">
                <div className="team-stat-fill green" data-width="62%"></div>
              </div>
              <div className="team-stat-value">62% utilized</div>
            </div>
            <div className="team-stat">
              <div className="team-stat-label">Memory</div>
              <div className="team-stat-bar">
                <div className="team-stat-fill blue" data-width="45%"></div>
              </div>
              <div className="team-stat-value">45% allocated</div>
            </div>
          </div>

          <div className="agents-grid">
            {agents.map((agent, index) => (
              <div key={index} className="agent-card reveal">
                <div className="agent-avatar">{agent.avatar}</div>
                <div className="agent-info">
                  <div className="agent-name">
                    {agent.name} <span className="agent-status"></span>
                  </div>
                  <div className="agent-role">{agent.role}</div>
                  <div className="agent-desc">{agent.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}