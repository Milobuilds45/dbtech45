import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DBTech45 - Fueled by Caffeine and Chaos",
  description:
    "Derek Bobola - Dad of 7. Futures trader. Restaurant owner. Self-taught builder running 9 AI agents. Shipping daily.",
  themeColor: "#0A0A0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
