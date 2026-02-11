"use client";
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="#" className="nav-logo" aria-label="DBTech45 Home">
            <span className="prompt">~/</span>DBTech45
          </a>
          <ul className="nav-links">
            <li><a href="#about"><span className="nav-prompt">&gt;</span>about<span className="nav-slash">/</span></a></li>
            <li><a href="#projects"><span className="nav-prompt">&gt;</span>projects<span className="nav-slash">/</span></a></li>
            <li><a href="#pit"><span className="nav-prompt">&gt;</span>pit<span className="nav-slash">/</span></a></li>
            <li><a href="#team"><span className="nav-prompt">&gt;</span>team<span className="nav-slash">/</span></a></li>
            <li><a href="#ideas"><span className="nav-prompt">&gt;</span>lab<span className="nav-slash">/</span></a></li>
            <li><a href="/os"><span className="nav-prompt">&gt;</span>os<span className="nav-slash">/</span></a></li>
            <li><a href="#connect"><span className="nav-prompt">&gt;</span>contact<span className="nav-slash">/</span></a></li>
          </ul>
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
            aria-label="Toggle menu" 
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <a href="#about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>about<span className="nav-slash">/</span></a>
        <a href="#projects" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>projects<span className="nav-slash">/</span></a>
        <a href="#pit" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>pit<span className="nav-slash">/</span></a>
        <a href="#team" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>team<span className="nav-slash">/</span></a>
        <a href="#ideas" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>lab<span className="nav-slash">/</span></a>
        <a href="/os" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>os<span className="nav-slash">/</span></a>
        <a href="#connect" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-prompt">&gt;</span>contact<span className="nav-slash">/</span></a>
      </div>
    </>
  );
}