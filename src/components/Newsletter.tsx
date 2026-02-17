"use client";
import { useEffect, useRef } from "react";
import { TrendingUp, ChefHat, ArrowRight } from "lucide-react";

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
            {/* Signal & Noise Card */}
            <a href="/newsletter/signal-noise" className="newsletter-card-v2 newsletter-card-amber">
              <div className="newsletter-card-glow"></div>
              <div className="newsletter-card-content">
                <div className="newsletter-card-badge">Coming Soon</div>
                <div className="newsletter-card-icon-wrap amber">
                  <TrendingUp size={28} strokeWidth={2} />
                </div>
                <h3 className="newsletter-card-title">Signal & Noise</h3>
                <span className="newsletter-card-freq">Daily</span>
                <p className="newsletter-card-desc">
                  Market intelligence filtered through 15 years of trading. Technical analysis, macro themes, conviction plays.
                </p>
                <span className="newsletter-card-cta">
                  Get Early Access <ArrowRight size={14} />
                </span>
              </div>
            </a>

            {/* The Operator Card */}
            <a href="/newsletter/operator" className="newsletter-card-v2 newsletter-card-green">
              <div className="newsletter-card-glow"></div>
              <div className="newsletter-card-content">
                <div className="newsletter-card-badge green">Coming Soon</div>
                <div className="newsletter-card-icon-wrap green">
                  <ChefHat size={28} strokeWidth={2} />
                </div>
                <h3 className="newsletter-card-title">The Operator</h3>
                <span className="newsletter-card-freq green">Weekly</span>
                <p className="newsletter-card-desc">
                  Real talk for independent restaurant owners. Operations, margins, staffing, survival tactics.
                </p>
                <span className="newsletter-card-cta green">
                  Get Early Access <ArrowRight size={14} />
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
