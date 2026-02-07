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
            <li><a href="#about">whoami</a></li>
            <li><a href="#projects">projects</a></li>
            <li><a href="#pit">the_pit</a></li>
            <li><a href="#team">team</a></li>
            <li><a href="#newsletters">newsletters</a></li>
            <li><a href="#tools">tools</a></li>
            <li><a href="#connect">connect</a></li>
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
        <a href="#about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ whoami</a>
        <a href="#projects" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ ls projects</a>
        <a href="#pit" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ market</a>
        <a href="#team" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ ps aux</a>
        <a href="#ideas" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ git log</a>
        <a href="#newsletters" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ cat subs</a>
        <a href="#tools" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ ./tools</a>
        <a href="#connect" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>$ ssh connect</a>
      </div>
    </>
  );
}