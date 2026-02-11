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

  const agents = [
    { name: "Milo", role: "Head PA", desc: "Routes tasks, manages priorities, keeps the machine running." },
    { name: "Paula", role: "Creative Director", desc: "Design systems, brand identity, UI/UX. Makes it look intentional." },
    { name: "Anders", role: "Full Stack Dev", desc: "Turns designs into deployed, production-grade code." },
    { name: "Bobby", role: "Trading Advisor", desc: "Market analysis, signal generation, risk management." },
    { name: "Remy", role: "Marketing", desc: "Growth strategy, audience building, campaign execution." },
    { name: "Tony", role: "Operations", desc: "Systems, infrastructure, workflows. The invisible hand." },
    { name: "Dax", role: "Content", desc: "Newsletters, storytelling. Turns ideas into words that land." },
    { name: "Webb", role: "Research", desc: "Deep dives, competitive analysis, data synthesis." },
    { name: "Dwight", role: "News Intel", desc: "Real-time news monitoring, event detection, macro awareness." },
    { name: "Wendy", role: "Performance Coach", desc: "Habits, focus, energy management. Never quits on you." },
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="swarm" aria-label="AI Swarm section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <p className="section-command-clean">&gt; the-swarm</p>
            <h2 className="section-title">The Swarm</h2>
            <p className="section-subtitle">
              I don't have a team of 50. I have 10 AI agents who never sleep.
            </p>
          </div>
          <div className="agents-grid">
            {agents.map((agent, index) => (
              <div key={index} className="agent-card reveal">
                <div className="agent-info">
                  <div className="agent-name">
                    {agent.name}
                    <span className="agent-status" />
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
