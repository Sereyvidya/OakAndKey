"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/app/lib/auth/store";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { hasCompleteFlyerData } from "@/app/lib/flyer/guards";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface NavItem {
  href: string;
  label: string;
  requiresCompleteInfo?: boolean;
  /** Only shown to signed-in users. */
  requiresAuth?: boolean;
}

const ALL_NAV: NavItem[] = [
  { href: "/", label: "About" },
  { href: "/listings", label: "My Listings", requiresAuth: true },
  { href: "/property/general", label: "Information" },
  { href: "/property/flyer", label: "Flyer", requiresCompleteInfo: true },
  { href: "/property/captions", label: "Captions", requiresCompleteInfo: true },
];

export default function PropertyNav() {
  const pathname = usePathname();
  const signedIn = useAuthStore((s) => Boolean(s.user));
  const nav = ALL_NAV.filter((item) => !item.requiresAuth || signedIn);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);

  const canViewFlyer = hasCompleteFlyerData({ formData, images });
  const activeItem = nav.find((item) => pathname === item.href) ?? nav[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getHref = (item: NavItem) => {
    if (item.requiresCompleteInfo && !canViewFlyer) return pathname;
    return item.href;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <nav className="hidden items-center gap-6 whitespace-nowrap lg:flex lg:gap-8">
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
              className={[
                "group relative pb-2 text-base font-semibold tracking-[0.02em] transition-colors duration-200",
                active
                  ? "text-[var(--ink-strong)]"
                  : blocked
                    ? "cursor-not-allowed text-[var(--ink-muted)] opacity-45"
                    : "text-[var(--ink-soft)] hover:text-[var(--ink-strong)]",
              ].join(" ")}
            >
              {item.label}

              <span
                className={[
                  "absolute bottom-0 left-0 h-[2px] rounded-full bg-[var(--brand)] transition-all duration-300",
                  active
                    ? "w-full opacity-100"
                    : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
                ].join(" ")}
              />
            </Link>
          );
        })}
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="border-b-[2px] border-[var(--brand)] px-1 pb-1 text-base font-semibold whitespace-nowrap text-[var(--ink-strong)] transition-colors hover:text-[var(--brand-strong)] focus:outline-none"
        >
          <span className="flex items-center gap-1">
            {activeItem.label}
            <FiChevronDown
              className={[
                "h-4 w-4 transition-transform duration-200",
                open ? "rotate-180" : "",
              ].join(" ")}
            />
          </span>
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-4 w-27 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-3 py-2 shadow-[0_14px_30px_rgba(20,26,36,0.10)]">
            {nav
              .filter((item) => item.href !== pathname)
              .map((item) => {
                const active = pathname === item.href;
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
                    className={[
                      "group block py-1.5 text-right text-base font-semibold transition-colors",
                      active
                        ? "text-[var(--ink-strong)]"
                        : blocked
                          ? "cursor-not-allowed text-[var(--ink-muted)] opacity-45"
                          : "text-[var(--ink-soft)] hover:text-[var(--ink-strong)]",
                    ].join(" ")}
                  >
                    <span className="inline-block">
                      {item.label}

                      <span
                        className={[
                          "mt-1 ml-auto block h-[2px] rounded-full bg-[var(--brand)] transition-all duration-300",
                          active
                            ? "w-full opacity-100"
                            : blocked
                              ? "w-0 opacity-0"
                              : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
                        ].join(" ")}
                      />
                    </span>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
