import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Sunday Squares
      {
        source: "/sundaysquares",
        destination: "https://sunday-squares.vercel.app/sundaysquares",
      },
      {
        source: "/sundaysquares/:path*",
        destination: "https://sunday-squares.vercel.app/sundaysquares/:path*",
      },
      // Boundless
      {
        source: "/boundless",
        destination: "https://boundless-ochre.vercel.app/boundless",
      },
      {
        source: "/boundless/:path*",
        destination: "https://boundless-ochre.vercel.app/boundless/:path*",
      },
      // Soulsolace
      {
        source: "/soulsolace",
        destination: "https://soulsolace.vercel.app/soulsolace",
      },
      {
        source: "/soulsolace/:path*",
        destination: "https://soulsolace.vercel.app/soulsolace/:path*",
      },
      // DB Tech OS - removed redirects, now using local routes
    ];
  },
};

export default nextConfig;
