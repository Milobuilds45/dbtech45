import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OS_USER: process.env.OS_USER || "derek",
    OS_PASSWORD: process.env.OS_PASSWORD || "caffeine45",
  },
  async rewrites() {
    return {
      // beforeFiles: Next.js pages take priority over proxy rewrites
      beforeFiles: [],
      afterFiles: [
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
      ],
      // fallback: only proxy to Hetzner if no Next.js page matches
      fallback: [
        {
          source: "/os",
          destination: "http://qs0cowgkgs0w48oc88kswooc.178.156.253.81.sslip.io/",
        },
        {
          source: "/os/:path*",
          destination: "http://qs0cowgkgs0w48oc88kswooc.178.156.253.81.sslip.io/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
