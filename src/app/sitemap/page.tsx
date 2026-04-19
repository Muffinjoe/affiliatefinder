import Link from "next/link";
import { STATIC_PROGRAMS, CATEGORIES } from "@/lib/programs";

export const metadata = {
  title: "Sitemap — AffiliateDeals",
  description: "Every page on AffiliateDeals.co — main sections, categories, and all 750+ affiliate programs.",
};

export default function SitemapPage() {
  const byCategory = new Map<string, typeof STATIC_PROGRAMS>();
  for (const p of STATIC_PROGRAMS) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  for (const list of byCategory.values()) list.sort((a, b) => a.name.localeCompare(b.name));
  const cats = [...CATEGORIES].sort();

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-ink-900">Sitemap</h1>
      <p className="mt-1 text-sm text-ink-500">
        Every page on AffiliateDeals.co. The XML version for crawlers lives at{" "}
        <Link href="/sitemap.xml" className="text-accent hover:underline">/sitemap.xml</Link>.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Main pages</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-700 sm:grid-cols-3 md:grid-cols-4">
          {[
            ["/", "Home"],
            ["/browse", "Browse"],
            ["/categories", "Categories"],
            ["/submit", "Add a program"],
            ["/advertise", "Advertise"],
            ["/pricing", "Pricing"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="hover:text-accent">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Categories</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link
              key={c}
              href={`/browse?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:border-accent hover:text-accent"
            >
              {c} <span className="text-ink-400">({byCategory.get(c)?.length ?? 0})</span>
            </Link>
          ))}
        </div>
      </section>

      {cats.map((cat) => {
        const list = byCategory.get(cat) ?? [];
        return (
          <section key={cat} className="mt-8" id={`cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}>
            <h2 className="text-sm font-semibold text-ink-900">
              {cat} <span className="text-xs font-normal text-ink-500">({list.length})</span>
            </h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-ink-700 sm:grid-cols-3 md:grid-cols-4">
              {list.map((p) => (
                <li key={p.slug} className="truncate">
                  <Link href={`/p/${p.slug}`} className="hover:text-accent">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
