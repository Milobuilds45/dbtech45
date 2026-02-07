"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#about", label: "./about" },
  { href: "#projects", label: "./projects" },
  { href: "#the-pit", label: "./the-pit" },
  { href: "#the-team", label: "./the-team" },
  { href: "#lab", label: "./lab" },
  { href: "/os", label: "./os" },
  { href: "#contact", label: "./contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300 ${
          scrolled
            ? "bg-card/90 backdrop-blur-xl border-b border-edge"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="amber-text font-mono text-sm tracking-wide flex items-center"
          >
            dbtech45
            <span className="inline-block w-[2px] h-4 bg-amber ml-0.5 animate-[blink-caret_0.75s_step-end_infinite]" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group font-mono text-xs text-faint hover:text-amber transition-colors duration-200"
              >
                <span className="text-amber/30 group-hover:text-amber transition-colors duration-200 mr-0.5">
                  {">"}
                </span>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Status + hamburger */}
          <div className="flex items-center gap-4">
            <span className="status-live font-mono text-xs text-amber hidden sm:inline-flex">
              ONLINE
            </span>

            <button
              className="lg:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 group"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`block w-5 h-[2px] bg-amber transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-[5px]" : ""
                }`}
              />
              <span
                className={`block w-5 h-[2px] bg-amber transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-[2px] bg-amber transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[5px]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-bg/98 backdrop-blur-sm flex flex-col items-start justify-center px-8 transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-6">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-mono text-xl text-faint hover:text-amber transition-colors duration-200"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateX(0)" : "translateX(-16px)",
                transition: `opacity 0.4s ease ${100 + i * 80}ms, transform 0.4s ease ${100 + i * 80}ms, color 0.2s ease`,
              }}
            >
              <span className="amber-text mr-2">{">"}</span>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-10 font-mono text-xs text-faint">
          <span
            className="status-live text-amber"
            style={{
              opacity: menuOpen ? 1 : 0,
              transition: `opacity 0.4s ease ${100 + NAV_LINKS.length * 80}ms`,
            }}
          >
            SYSTEM ONLINE
          </span>
        </div>
      </div>
    </>
  );
}
