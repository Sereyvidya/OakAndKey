import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Noto_Sans_Khmer, Sora } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import PropertyNav from "./components/PropertyNav";
import LanguageSync from "./components/LanguageSync";
import LanguageToggle from "./components/LanguageToggle";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

// Khmer needs its own font: the Latin fonts above have no Khmer glyphs.
const khmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-khmer",
});

export const metadata: Metadata = {
  title: "Oak & Key Studio",
  description: "Create modern listing flyers and social assets quickly.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${manrope.variable} ${sora.variable} ${khmer.variable} font-sans antialiased`}
      >
        <LanguageSync />
        <header className="sticky top-0 z-30 border-b border-[var(--card-border)]/80 bg-[color:var(--surface)]/86 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-8 py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/Logo.png"
                alt="Oak & Key Logo"
                width={300}
                height={80}
                className="h-12 w-auto shrink-0"
                priority
              />

              <div className="leading-none">
                <h1 className="text-2xl font-semibold text-[color:var(--ink-strong)]">
                  Oak & Key
                </h1>
                <p className="text-xs font-medium tracking-[0.18em] text-[color:var(--ink-muted)] uppercase">
                  Creative Studio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PropertyNav />
              <LanguageToggle />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
