const NAV_ITEMS = [
  { href: "#about", label: "./about" },
  { href: "#projects", label: "./projects" },
  { href: "#the-pit", label: "./the-pit" },
  { href: "#the-team", label: "./the-team" },
  { href: "#ideas-lab", label: "./lab" },
  { href: "#contact", label: "./contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-edge py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-0.5">
            <span className="amber-text font-mono text-sm">dbtech45</span>
            <span className="text-faint text-xs font-mono">
              {`// imagination → implementation`}
            </span>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-faint text-xs font-mono hover:text-amber transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/DBtech45"
              target="_blank"
              rel="noopener noreferrer"
              className="text-faint text-xs font-mono hover:text-amber transition-colors duration-200"
            >
              X: @DBtech45
            </a>
            <a
              href="https://github.com/7LayerLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-faint text-xs font-mono hover:text-amber transition-colors duration-200"
            >
              GH: 7LayerLabs
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-faint text-xs font-mono">
            <span className="status-live">
              [SESSION ACTIVE]
            </span>
            {" "}&copy; 2026 DBTech45 &mdash; Built with caffeine and artificial intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}
