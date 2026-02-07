"use client";

import { useEffect } from 'react';

export default function SoulPage() {
  useEffect(() => {
    // Simple redirect for now to get it working
    window.location.href = 'https://soulsolace.vercel.app/soulsolace';
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="font-mono text-amber-500">Loading Soul Solace...</p>
        <p className="text-sm text-gray-400 mt-2">AI-powered prayer assistance</p>
      </div>
    </div>
  );
}