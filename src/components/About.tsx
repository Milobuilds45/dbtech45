"use client";
import { useEffect, useRef } from "react";

export default function About() {
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

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="about" aria-label="About section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">whoami</div>
            <h2 className="section-title">The Builder Behind the Terminal</h2>
          </div>
          <div className="about-grid">
            <div className="about-bio reveal">
              <p><strong>Derek Bobola</strong> is a 45-year-old trader, restaurant owner, and self-taught technologist who builds software to solve problems he actually has.</p>
              <p>No CS degree. No VC funding. No permission asked. Just a relentless drive to turn ideas into working products — from AI-powered trading tools to restaurant management systems to apps that make life easier for a family of nine.</p>
              <p>By day, he's in the pit — trading futures, reading markets, building conviction. By night, he's shipping code, wrangling a team of AI agents, and prototyping the next thing that needs to exist.</p>
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
                <div className="stat-number">27</div>
                <div className="stat-label">Repos</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">10</div>
                <div className="stat-label">AI Agents</div>
              </div>
            </div>
          </div>
          <blockquote className="about-quote reveal">
            "You don't need a CS degree. You need a problem that pisses you off and the stubbornness to solve it."
            <span className="attribution">— Derek Bobola</span>
          </blockquote>
        </div>
      </section>
    </>
  );
}