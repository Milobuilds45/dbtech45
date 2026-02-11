"use client";
import { useEffect, useRef } from "react";

export default function Projects() {
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

  const projects = [
    {
      name: "tickR",
      desc: "AI-powered trading dashboard with real-time signals, journaling, and performance analytics.",
      status: "building",
    },
    {
      name: "Signal & Noise",
      desc: "Daily market newsletter. Filtering noise into actionable intelligence.",
      status: "live",
    },
    {
      name: "Soul Solace",
      desc: "AI wellness companion. Daily reflections, guided prayers, mood tracking.",
      status: "building",
    },
    {
      name: "Sunday Squares",
      desc: "Digital football pools with auto-scoring and real-time payouts.",
      status: "live",
    },
    {
      name: "TipSplit Pro",
      desc: "Tip calculation and splitting tool designed for restaurant industry workers.",
      status: "live",
    },
    {
      name: "Boundless",
      desc: "AI journaling app. Deeper thinking through guided prompts.",
      status: "building",
    },
    {
      name: "Kitchen Cost Tracker",
      desc: "Food cost and inventory management for multi-unit restaurant operators.",
      status: "building",
    },
    {
      name: "Receipt Scanner",
      desc: "Snap a receipt, extract line items, categorize expenses. OCR meets organization.",
      status: "shaping",
    },
    {
      name: "AI Meal Planner",
      desc: "Weekly meal planning powered by AI. Dietary preferences, budget, family size aware.",
      status: "spark",
    },
    {
      name: "Contractor Bidder",
      desc: "Streamlined contractor bidding platform with scope management and comparison tools.",
      status: "spark",
    },
    {
      name: "Family Calendar AI",
      desc: "Smart family scheduling that coordinates 9 people's lives with AI conflict resolution.",
      status: "spark",
    },
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="projects" aria-label="Projects section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <p className="section-command-clean">&gt; projects</p>
            <h2 className="section-title">What I'm Shipping</h2>
            <p className="section-subtitle">
              Real tools for real problems. If it's here, it's moving.
            </p>
          </div>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card reveal">
                <div className="project-card-top">
                  <h3 className="project-name">{project.name}</h3>
                  <span className={`project-status status-${project.status}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <p className="project-desc">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
