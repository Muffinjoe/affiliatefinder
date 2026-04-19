import Link from "next/link";
import { getDirectory, CATEGORY_COUNTS, CATEGORIES, filterPrograms } from "@/lib/programs";
import { ProgramCard } from "@/components/ProgramCard";
import { AdRail } from "@/components/AdRail";
import { seededShuffle, rotationSeed } from "@/lib/shuffle";

const FEATURED_HOMEPAGE_SLOTS = 4;
export const revalidate = 60;

export default async function HomePage() {
  const { programs, featured } = await getDirectory();
  // Rotate which featured listings appear in the 4 homepage slots — fresh
  // order on every 60s revalidation.
  const featuredPool = programs.filter((p) => featured.has(p.slug));
  const featuredList = seededShuffle(featuredPool, rotationSeed()).slice(0, FEATURED_HOMEPAGE_SLOTS);
  const fresh = filterPrograms(programs, featured, { sort: "newest" }).slice(0, 8);
  const topCats = CATEGORIES
    .map((c) => ({ name: c, count: CATEGORY_COUNTS[c] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[200px_minmax(0,1fr)_200px] xl:gap-8">
        <AdRail side="left" />
        <div className="mx-auto w-full max-w-4xl">
          <section className="mx-auto max-w-3xl text-center">
            <span className="pill-accent">The directory for affiliate programs</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Find affiliate programs fast.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500 sm:text-base">
              Browse {programs.length}+ affiliate programs across {CATEGORIES.length} categories.
              List your own program for $20. Add a featured boost from $50.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link href="/browse" className="btn-accent h-10 px-5">Browse programs</Link>
              <Link href="/submit" className="btn-outline h-10 px-5">List your program</Link>
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-ink-900">Featured programs</h2>
              <Link href="/pricing" className="text-xs text-accent hover:underline">
                Get featured →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {featuredList.map((p) => <ProgramCard key={p.slug} program={p} featured />)}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-3 text-base font-semibold text-ink-900">Popular categories</h2>
            <div className="flex flex-wrap gap-2">
              {topCats.map((c) => (
                <Link
                  key={c.name}
                  href={`/browse?category=${encodeURIComponent(c.name)}`}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:border-accent hover:text-accent"
                >
                  {c.name} <span className="text-ink-400">({c.count})</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-ink-900">Recently added</h2>
              <Link href="/browse?sort=newest" className="text-xs text-accent hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fresh.map((p) => (
                <ProgramCard key={p.slug} program={p} featured={featured.has(p.slug)} />
              ))}
            </div>
          </section>

          <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">For affiliates</div>
              <h3 className="mt-1 text-lg font-bold text-ink-900">Discover programs that pay</h3>
              <p className="mt-1 text-sm text-ink-500">
                Every listing shows commission, cookie window, payout terms, and the network — so
                you can pick winners without clicking through.
              </p>
              <Link href="/browse" className="btn-outline mt-3 h-9">Browse directory</Link>
            </div>
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">For companies</div>
              <h3 className="mt-1 text-lg font-bold text-ink-900">Get in front of more affiliates</h3>
              <p className="mt-1 text-sm text-ink-500">
                $20 for a permanent listing. Add featured boost from $50/month, with discounts
                for 2- or 3-month plans.
              </p>
              <Link href="/pricing" className="btn-accent mt-3 h-9">See pricing</Link>
            </div>
          </section>
        </div>
        <AdRail side="right" />
      </div>
    </div>
  );
}
