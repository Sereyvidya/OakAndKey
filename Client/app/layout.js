import { Manrope, Sora } from "next/font/google";
import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata = {
  title: "AngkorListing Studio",
  description: "Create modern listing flyers and social assets quickly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${sora.variable} font-sans antialiased`}
      >
        <header className="sticky top-0 z-30 border-b border-[var(--card-border)]/80 bg-[color:var(--surface)]/86 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[var(--brand-soft)] blur-md" />
                <Image
                  src="/angkorlisting-logo.png"
                  alt="AngkorListing Logo"
                  width={42}
                  height={42}
                  className="relative rounded-full object-contain ring-1 ring-black/5"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[color:var(--ink-strong)] sm:text-2xl">
                  AngkorListing
                </h1>
                <p className="text-xs font-medium tracking-[0.18em] text-[color:var(--ink-muted)] uppercase">
                  Creative Studio
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
