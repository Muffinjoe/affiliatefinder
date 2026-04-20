import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import { Header } from "@/components/Header";

const UMAMI_WEBSITE_ID = "54733c70-f420-4bd0-96d4-3fd39fc3c473";
const GOOGLE_ADS_ID = "AW-17945112356";

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
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
        </Script>

        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
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
