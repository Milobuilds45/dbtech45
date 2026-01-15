import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DBtech45 | imagination → implementation",
  description: "Where ideas become reality. A hub for projects, experiments, and ventures by Derek Bobola.",
  keywords: ["dbtech", "derek bobola", "projects", "startups", "development"],
  authors: [{ name: "Derek Bobola" }],
  openGraph: {
    title: "DBtech45 | imagination → implementation",
    description: "Where ideas become reality. A hub for projects, experiments, and ventures.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
