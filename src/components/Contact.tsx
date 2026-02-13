"use client";
import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";

export default function Contact() {
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
      <section className="section" id="connect" aria-label="Contact section" ref={sectionRef}>
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <p className="section-command-clean" style={{ justifyContent: "center" }}>&gt; contact</p>
            <h2 className="section-title">Open a Channel</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Got a project? Want to collaborate? Always open to interesting conversations.
            </p>
          </div>
          <div className="connect-options reveal">
            {/* Email Card */}
            <a href="mailto:hello@dbtech45.com" className="connect-card">
              <div className="connect-card-icon">
                <Mail size={32} strokeWidth={1.5} />
              </div>
              <h3 className="connect-card-title">Email</h3>
              <p className="connect-card-desc">hello@dbtech45.com</p>
            </a>

            {/* X/Twitter Card */}
            <a href="https://x.com/dbtech45" className="connect-card" target="_blank" rel="noopener noreferrer">
              <div className="connect-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <h3 className="connect-card-title">X</h3>
              <p className="connect-card-desc">@dbtech45</p>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
