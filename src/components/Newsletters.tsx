"use client";
import { useEffect, useRef } from "react";

export default function Newsletters() {
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

  const newsletters = [
    {
      icon: "📡",
      name: "Signal & Noise",
      frequency: "Daily",
      desc: "Market intelligence filtered through 15 years of trading experience. Technical analysis, macro themes, and conviction plays that matter.",
      link: "/newsletter/signal-noise"
    },
    {
      icon: "⚙️",
      name: "The Operator",
      frequency: "Weekly",
      desc: "Business building, productivity systems, and the art of execution. Lessons from running restaurants and shipping software.",
      link: "/newsletter/operator"
    },
    {
      icon: "👨‍👩‍👧‍👦",
      name: "Dad Stack",
      frequency: "Weekly",
      desc: "Parenting seven kids while building companies. Real talk about balance, priorities, and what actually matters in life.",
      link: "/newsletter/dad-stack"
    }
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="newsletters" aria-label="Newsletters section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">cat /etc/subscriptions</div>
            <h2 className="section-title">Newsletters</h2>
            <p className="section-subtitle">Three publications. Different perspectives. Same commitment to substance over noise.</p>
          </div>
          <div className="newsletters-grid">
            {newsletters.map((newsletter, index) => (
              <div key={index} className="newsletter-card reveal">
                <div className="newsletter-icon">{newsletter.icon}</div>
                <h3 className="newsletter-name">{newsletter.name}</h3>
                <div className="newsletter-freq">{newsletter.frequency}</div>
                <p className="newsletter-desc">{newsletter.desc}</p>
                <a href={newsletter.link} className="btn btn-primary">Subscribe</a>
              </div>
            ))}
          </div>
          <div className="subscribe-bar reveal">
            <div className="subscribe-prompt">
              <span className="prompt-char">$</span> subscribe --email
            </div>
            <input 
              type="email" 
              className="subscribe-input" 
              placeholder="your.email@domain.com" 
              aria-label="Email address"
            />
            <button className="btn btn-primary">Join →</button>
          </div>
        </div>
      </section>
    </>
  );
}