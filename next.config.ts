import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Sunday Squares
      {
        source: "/sundaysquares",
        destination: "https://sunday-squares.vercel.app",
      },
      {
        source: "/sundaysquares/:path*",
        destination: "https://sunday-squares.vercel.app/:path*",
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
    ];
  },
};

export default nextConfig;
