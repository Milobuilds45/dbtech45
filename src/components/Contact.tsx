"use client";
import { useEffect, useRef, useState } from "react";
import { Mail, Send } from "lucide-react";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      
      if (res.ok) {
        setStatus('success');
        setFormState({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

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
            {/* Contact Form Card */}
            <div className="connect-card connect-form-card">
              <div className="connect-card-icon">
                <Mail size={32} strokeWidth={1.5} />
              </div>
              <h3 className="connect-card-title">Send a Message</h3>
              
              {status === 'success' ? (
                <div className="contact-success">
                  <p>Message sent! I'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formState.name}
                    onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                    required
                    className="contact-input"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={formState.email}
                    onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
                    required
                    className="contact-input"
                  />
                  <textarea
                    placeholder="Your message"
                    value={formState.message}
                    onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                    required
                    rows={4}
                    className="contact-input contact-textarea"
                  />
                  <button 
                    type="submit" 
                    disabled={status === 'sending'}
                    className="contact-submit"
                  >
                    {status === 'sending' ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                  {status === 'error' && (
                    <p className="contact-error">Something went wrong. Try again.</p>
                  )}
                </form>
              )}
            </div>

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
