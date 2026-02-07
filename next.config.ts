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
      // Soul Solace
      {
        source: "/soul",
        destination: "https://soulsolace.vercel.app/soulsolace",
      },
      {
        source: "/soul/:path*",
        destination: "https://soulsolace.vercel.app/soulsolace/:path*",
      },
      // DB Tech OS
      {
        source: "/os",
        destination: "https://dbtech-os.vercel.app/",
      },
      {
        source: "/os/:path*",
        destination: "https://dbtech-os.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;
