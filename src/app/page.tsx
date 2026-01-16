"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Project card data
const projects = [
  {
    id: "about",
    title: "About Me",
    description: "Proudly sleep-deprived dad of seven—powered by caffeine and creativity.",
    icon: "🤖",
    href: "/about",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "code-canvas",
    title: "Code Canvas",
    description: "Where code meets canvas—crafting engaging web experiences with precision and flair.",
    icon: "</>" ,
    href: "/code-canvas",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "the-pit",
    title: "The Pit",
    description: "Futures, options, charting & my prop firm journey.",
    icon: "📈",
    href: "/the-pit",
    color: "from-green-500/20 to-teal-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "launchpad",
    title: "Launchpad",
    description: "Fueling new ventures—solo projects and collaborations that take flight.",
    icon: "💡",
    href: "/launchpad",
    color: "from-yellow-500/20 to-green-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "sharp-notes",
    title: "Sharp Notes",
    description: "Sports analytics, betting picks & mock draft strategy.",
    icon: "🏈",
    href: "/sharp-notes",
    color: "from-green-500/20 to-cyan-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "junk-drawer",
    title: "The Junk Drawer",
    description: "Bookmarks, gadgets & whatever else catches my eye.",
    icon: "🗄️",
    href: "/junk-drawer",
    color: "from-pink-500/20 to-purple-500/20",
    iconColor: "text-pink-400",
  },
];

// Logo component
function DBLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 blur-3xl rounded-full scale-150" />

      {/* Logo image */}
      <div className="relative">
        <Image
          src="/logo.png"
          alt="DBtech45 - imagination to implementation"
          width={400}
          height={400}
          priority
          className="w-[280px] md:w-[400px] h-auto"
        />
      </div>
    </div>
  );
}

// Project card component
function ProjectCard({ project }: { project: typeof projects[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={project.href}
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative overflow-hidden rounded-xl
        bg-[#1a1a1a] border border-[#2a2a2a]
        p-6 transition-all duration-300
        hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10
        ${isHovered ? 'scale-[1.02]' : ''}
      `}>
        {/* Gradient overlay on hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${project.color}
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
        `} />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className={`text-3xl mb-4 ${project.iconColor || ''}`}>
            {project.icon}
          </div>

          {/* Title with arrow */}
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-3">
            {project.title}
            <span className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <DBLogo />

        {/* CTA Button */}
        <button
          onClick={() => {
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-12 px-8 py-4 rounded-full bg-gradient-to-r from-green-400 to-teal-400
                     text-black font-semibold text-lg
                     hover:from-green-300 hover:to-teal-300
                     transition-all duration-300 transform hover:scale-105
                     shadow-lg shadow-green-500/25"
        >
          Let&apos;s Build
        </button>
      </section>

      {/* Projects Section */}
      <section id="projects" className="px-4 py-16 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Explore the Lab
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A collection of ideas, projects, and experiments. Click any card to dive deeper.
          </p>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-[#1a1a1a]">
        <p>
          Built with caffeine and code
        </p>
        <p className="mt-2 text-gray-600">
          © {new Date().getFullYear()} DBtech45
        </p>
      </footer>
    </main>
  );
}
