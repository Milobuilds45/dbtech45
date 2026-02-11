"use client";
import { useEffect, useRef } from "react";

export default function About() {
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
      <section className="section" id="about" aria-label="About section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <p className="section-command-clean">&gt; about</p>
            <h2 className="section-title">The Story</h2>
          </div>
          <div className="about-grid">
            <div className="about-bio reveal">
              <p>
                I didn't go to MIT. I went to the school of <strong>"figure it out or go broke trying."</strong>
              </p>
              <p>
                By day I'm in the pit &mdash; trading futures, reading macro, building conviction. By night I'm shipping code with a swarm of AI agents who never sleep. In between, I'm raising 7 kids and running restaurants.
              </p>
              <p>
                People say I'm spread too thin. I say I'm fueled by caffeine and chaos.
              </p>
            </div>
            <div className="stats-grid reveal">
              <div className="stat-card">
                <div className="stat-number">7</div>
                <div className="stat-label">Kids</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">4</div>
                <div className="stat-label">Restaurants</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">10</div>
                <div className="stat-label">AI Agents</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">∞</div>
                <div className="stat-label">Coffee</div>
              </div>
            </div>
          </div>
          <blockquote className="about-quote reveal">
            "You don't need a CS degree. You need a problem that pisses you off and the stubbornness to solve it."
            <span className="attribution">&mdash; Derek Bobola</span>
          </blockquote>
        </div>
      </section>
    </>
  );
}
