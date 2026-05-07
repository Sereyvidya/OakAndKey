// app/components/PropertyNav.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/property/general", label: "General Information" },
  { href: "/property/flyer", label: "Flyer Builder" },
  { href: "/property/captions", label: "Social Captions" },
];

export default function PropertyNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeItem = nav.find((item) => pathname === item.href) ?? nav[0];

  return (
    <div className="relative">
      <nav className="hidden items-center gap-6 md:flex">
        {nav.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "text-sm font-semibold text-[var(--brand)]"
                  : "text-sm font-semibold text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl border border-[var(--card-border)] px-4 py-2 text-sm font-semibold"
        >
          {activeItem.label} ▾
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)] p-2 shadow-lg">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[color:var(--cream)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
