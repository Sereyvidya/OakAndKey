"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { hasCompleteFlyerData } from "@/app/lib/flyer/guards";

const nav = [
  { href: "/property/general", label: "Information" },
  { href: "/property/flyer", label: "Flyer", requiresCompleteInfo: true },
  { href: "/property/captions", label: "Captions", requiresCompleteInfo: true },
];

export default function PropertyNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);

  const canViewFlyer = hasCompleteFlyerData({ formData, images });

  const activeItem = nav.find((item) => pathname === item.href) ?? nav[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getHref = (item) => {
    if (item.requiresCompleteInfo && !canViewFlyer) {
      return pathname;
    }

    return item.href;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <nav className="hidden items-center gap-6 md:flex">
        {nav.map((item) => {
          const active = pathname === item.href;
          const blocked = item.requiresCompleteInfo && !canViewFlyer;

          return (
            <Link
              key={item.href}
              href={getHref(item)}
              onClick={(e) => {
                if (blocked) e.preventDefault();
              }}
              aria-disabled={blocked}
              className={
                active
                  ? "font-semibold text-[var(--brand)]"
                  : blocked
                    ? "cursor-not-allowed font-semibold text-[color:var(--ink-soft)] opacity-50"
                    : "font-semibold text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-xl border border-[var(--card-border)] px-4 py-2 text-sm font-semibold"
        >
          {activeItem.label} ▾
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)] p-2 shadow-lg">
            {nav.map((item) => {
              const blocked = item.requiresCompleteInfo && !canViewFlyer;

              return (
                <Link
                  key={item.href}
                  href={getHref(item)}
                  onClick={(e) => {
                    if (blocked) e.preventDefault();
                    setOpen(false);
                  }}
                  aria-disabled={blocked}
                  className={
                    blocked
                      ? "block cursor-not-allowed rounded-xl px-3 py-2 text-sm font-semibold opacity-50"
                      : "block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[color:var(--cream)]"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
