"use client";

import { useEffect } from 'react';

export default function SoulPage() {
  useEffect(() => {
    // Immediate redirect
    window.location.href = 'https://soulsolace.vercel.app/soulsolace';
  }, []);

  // Show nothing while redirecting
  return null;
}