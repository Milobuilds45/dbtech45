"use client";
import { useEffect, useRef } from "react";

export default function Projects() {
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

  const projects = [
    {
      icon: "📈",
      name: "tickR",
      desc: "Real-time trading dashboard with AI-powered signals, journaling, and performance analytics.",
      status: "building"
    },
    {
      icon: "📡",
      name: "Signal & Noise",
      desc: "Daily trading newsletter filtering market noise into actionable intelligence.",
      status: "shipped"
    },
    {
      icon: "🏈",
      name: "Sunday Squares",
      desc: "Football squares game app — digital pools for game day with auto-scoring and payouts.",
      status: "shipped"
    },
    {
      icon: "💰",
      name: "TipSplit Pro",
      desc: "Tip calculation and splitting tool designed for restaurant industry workers.",
      status: "shipped"
    },
    {
      icon: "🧘",
      name: "Soul Solace",
      desc: "AI-powered mental wellness companion — daily reflections, mood tracking, guided support.",
      status: "building"
    },
    {
      icon: "🌍",
      name: "Boundless",
      desc: "Travel planning tool with AI-curated itineraries, budget tracking, and local insights.",
      status: "shaping"
    },
    {
      icon: "🧾",
      name: "Receipt Scanner",
      desc: "Snap a receipt, extract line items, categorize expenses. OCR meets organization.",
      status: "shaping"
    },
    {
      icon: "📊",
      name: "Kitchen Cost Tracker",
      desc: "Restaurant food cost and inventory management system for multi-unit operators.",
      status: "building"
    },
    {
      icon: "🍽️",
      name: "AI Meal Planner",
      desc: "Weekly meal planning powered by AI — dietary preferences, budget, family size aware.",
      status: "spark"
    },
    {
      icon: "🔨",
      name: "Contractor Bidder",
      desc: "Streamlined contractor bidding platform with scope management and comparison tools.",
      status: "spark"
    },
    {
      icon: "📅",
      name: "Family Calendar AI",
      desc: "Smart family scheduling that coordinates 9 people's lives with AI conflict resolution.",
      status: "spark"
    }
  ];

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'badge-shipped';
      case 'building':
        return 'badge-building';
      case 'shaping':
        return 'badge-shaping';
      case 'spark':
        return 'badge-spark';
      default:
        return 'badge-spark';
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case 'shipped':
        return '● Shipped';
      case 'building':
        return '● Building';
      case 'shaping':
        return '● Shaping';
      case 'spark':
        return '○ Spark';
      default:
        return '○ Spark';
    }
  };

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="projects" aria-label="Projects section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">ls -la /projects/</div>
            <h2 className="section-title">What I'm Building</h2>
            <p className="section-subtitle">Real tools for real problems. Every project starts with friction and ends with a shipped product.</p>
          </div>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card reveal">
                <span className="project-icon">{project.icon}</span>
                <h3 className="project-name">{project.name}</h3>
                <p className="project-desc">{project.desc}</p>
                <span className={`project-badge ${getBadgeClass(project.status)}`}>
                  {getBadgeText(project.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}