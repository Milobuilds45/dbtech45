"use client";
import { useEffect, useRef } from "react";

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
          <div className="newsletter-hero reveal">
            <p className="section-command-clean">&gt; signal-noise</p>
            <h2 className="section-title">Signal & Noise</h2>
            <p className="newsletter-pitch">
              Daily market intelligence filtered through 15 years of trading experience.
              Technical analysis, macro themes, and conviction plays that actually matter.
            </p>
            <div className="subscribe-bar">
              <input
                type="email"
                className="subscribe-input"
                placeholder="your@email.com"
                aria-label="Email address"
              />
              <button className="btn btn-primary">Subscribe &rarr;</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
