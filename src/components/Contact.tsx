"use client";
import { useEffect, useRef } from "react";

export default function Contact() {
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

  const connectOptions = [
    {
      icon: "📧",
      title: "Email",
      desc: "For business inquiries and collaboration",
      link: "mailto:derek@dbtech45.com"
    },
    {
      icon: "🐦",
      title: "Twitter",
      desc: "Daily thoughts on markets and building",
      link: "https://twitter.com/dbtech45"
    },
    {
      icon: "💼",
      title: "LinkedIn",
      desc: "Professional network and updates",
      link: "https://linkedin.com/in/derekbobola"
    }
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="connect" aria-label="Contact section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">ssh derek@dbtech45.com</div>
            <h2 className="section-title">Open a Channel</h2>
            <p className="section-subtitle">Got a project? Want to collaborate? Have a question about trading or building?</p>
          </div>
          
          <div className="connect-terminal reveal">
            <div className="terminal-bar">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-bar-title">derek@dbtech45 — ssh</span>
            </div>
            <div className="terminal-body">
              <div className="connect-line">
                <span className="prompt-char">$</span> ssh derek@dbtech45.com
              </div>
              <div className="connect-line">
                Connecting to <span className="amber-text">dbtech45.com</span>...
              </div>
              <div className="connect-line">
                <span className="amber-text">Welcome to the terminal.</span>
              </div>
              <div className="connect-line">
                <span className="prompt-char">derek@dbtech45:~$</span> echo "Always open to interesting conversations"
              </div>
              <div className="connect-line">
                Always open to interesting conversations
              </div>
              <div className="connect-line">
                <span className="prompt-char">derek@dbtech45:~$</span> <span className="cursor-blink"></span>
              </div>
            </div>
          </div>

          <div className="connect-options">
            {connectOptions.map((option, index) => (
              <a key={index} href={option.link} className="connect-card" target="_blank" rel="noopener noreferrer">
                <div className="connect-card-icon">{option.icon}</div>
                <h3 className="connect-card-title">{option.title}</h3>
                <p className="connect-card-desc">{option.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}