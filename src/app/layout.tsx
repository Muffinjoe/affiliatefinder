import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AffiliateFinder — Find affiliate programs fast",
  description:
    "Browse a curated directory of affiliate programs. List yours for free. Pay to get featured.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://affiliatefinder.co"),
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
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white text-sm">AF</span>
          <span>AffiliateFinder<span className="text-accent">.co</span></span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/browse" className="btn-ghost">Browse</Link>
          <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">Pricing</Link>
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
        <div>© {new Date().getFullYear()} AffiliateFinder.co</div>
        <div className="flex gap-4">
          <Link href="/browse" className="hover:text-ink-800">Browse</Link>
          <Link href="/submit" className="hover:text-ink-800">Add program</Link>
          <Link href="/pricing" className="hover:text-ink-800">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}
