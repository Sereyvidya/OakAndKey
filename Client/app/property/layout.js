"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/property/general", label: "General Information" },
  { href: "/property/flyer", label: "Flyer Builder" },
  { href: "/property/captions", label: "Social Captions" },
];

function NavLinks({ variant = "sidebar" }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        variant === "tabs"
          ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
          : "flex flex-col gap-3"
      }
    >
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "text-base font-semibold transition sm:text-lg",
              active
                ? "text-[var(--brand)]"
                : "text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)]",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function PropertyLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8">
        {/* Mobile step nav */}
        <div className="lg:hidden">
          <div className="mb-6 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/90 p-4 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.75)]">
            <NavLinks variant="tabs" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/92 p-4 shadow-[0_16px_30px_-25px_rgba(15,23,42,0.75)] backdrop-blur">
              <NavLinks variant="sidebar" />
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
