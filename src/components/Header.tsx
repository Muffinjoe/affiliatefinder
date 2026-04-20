"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/pricing", label: "Pricing" },
  { href: "/advertise", label: "Advertise" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent-500 to-accent text-white shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4 L18 4 L20 6 L20 12 L12.4 19.6 A1.5 1.5 0 0 1 10.3 19.6 L4.4 13.7 A1.5 1.5 0 0 1 4.4 11.6 Z" />
              <circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span>AffiliateDeals<span className="text-accent">.co</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="btn-ghost">
              {l.label}
            </Link>
          ))}
          <Link href="/submit" className="btn-accent ml-1">Add program</Link>
        </nav>

        {/* Mobile burger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {open ? (
              <>
                <path d="M6 6 L18 18" />
                <path d="M18 6 L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7 L20 7" />
                <path d="M4 12 L20 12" />
                <path d="M4 17 L20 17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-20 bg-ink-900/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 top-14 z-30 border-b border-ink-200 bg-white shadow-lg md:hidden">
            <nav className="container-page flex flex-col gap-1 py-3 text-sm">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-ink-800 hover:bg-ink-100"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/submit"
                className="btn-accent mt-2 h-10"
              >
                Add program
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
