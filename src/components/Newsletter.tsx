"use client";
import { useEffect, useRef } from "react";
import { TrendingUp, ChefHat } from "lucide-react";

export default function Newsletter() {
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

  const newsletters = [
    {
      id: "signal-noise",
      icon: TrendingUp,
      title: "Signal & Noise",
      frequency: "Daily",
      description: "Market intelligence filtered through 15 years of trading experience. Technical analysis, macro themes, and conviction plays that matter.",
      href: "/newsletter/signal-noise",
      color: "var(--amber)"
    },
    {
      id: "operator",
      icon: ChefHat,
      title: "The Operator",
      frequency: "Weekly",
      description: "Real talk for independent restaurant owners. Operations, margins, staffing, and survival tactics from someone in the trenches.",
      href: "/newsletter/operator",
      color: "var(--green)"
    }
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="newsletter" aria-label="Newsletter section" ref={sectionRef}>
        <div className="container">
          <div className="reveal" style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="section-command-clean" style={{ justifyContent: "center" }}>&gt; subscribe</p>
            <h2 className="section-title">Newsletters</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Get insights delivered. No spam, no fluff — just signal.
            </p>
          </div>

          <div className="newsletter-grid reveal">
            {newsletters.map((nl) => (
              <a href={nl.href} key={nl.id} className="newsletter-card">
                <div className="newsletter-card-badge">Coming Soon</div>
                <div className="newsletter-card-icon" style={{ color: nl.color }}>
                  <nl.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="newsletter-card-title">{nl.title}</h3>
                <span className="newsletter-card-freq">{nl.frequency}</span>
                <p className="newsletter-card-desc">{nl.description}</p>
                <span className="newsletter-card-cta">Get Early Access →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
