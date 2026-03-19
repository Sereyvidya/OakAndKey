import { Manrope, Sora } from "next/font/google";
import Image from "next/image";
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
  title: "Oak & Key Studio",
  description: "Create modern listing flyers and social assets quickly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${manrope.variable} ${sora.variable} font-sans antialiased`}
      >
        <header className="sticky top-0 z-30 border-b border-[var(--card-border)]/80 bg-[color:var(--surface)]/86 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
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
                <h1 className="text-xl font-semibold text-[color:var(--ink-strong)] sm:text-2xl">
                  Oak & Key
                </h1>
                <p className="text-xs font-medium tracking-[0.18em] text-[color:var(--ink-muted)] uppercase">
                  Creative Studio
                </p>
              </div>
            </div>

          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
