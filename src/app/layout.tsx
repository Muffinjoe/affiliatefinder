import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AffiliateDeals — Find affiliate programs fast",
  description:
    "Browse a curated directory of affiliate programs. List yours for free. Pay to get featured.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://affiliatedeals.co"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-50 text-ink-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur">
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
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/browse" className="btn-ghost">Browse</Link>
          <Link href="/categories" className="btn-ghost hidden sm:inline-flex">Categories</Link>
          <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">Pricing</Link>
          <Link href="/advertise" className="btn-ghost hidden md:inline-flex">Advertise</Link>
          <Link href="/submit" className="btn-accent ml-1">Add program</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:items-center">
        <div>© {new Date().getFullYear()} AffiliateDeals.co</div>
        <div className="flex flex-wrap gap-4">
          <Link href="/browse" className="hover:text-ink-800">Browse</Link>
          <Link href="/categories" className="hover:text-ink-800">Categories</Link>
          <Link href="/submit" className="hover:text-ink-800">Add program</Link>
          <Link href="/advertise" className="hover:text-ink-800">Advertise</Link>
          <Link href="/pricing" className="hover:text-ink-800">Pricing</Link>
          <Link href="/sitemap" className="hover:text-ink-800">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
