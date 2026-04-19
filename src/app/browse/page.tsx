import Link from "next/link";
import { getDirectory, filterPrograms, SortKey } from "@/lib/programs";
import { getViewsCached, thisWeekCounts } from "@/lib/views";
import { DirectoryControls } from "@/components/DirectoryControls";
import { ProgramRow } from "@/components/ProgramCard";
import { AdRail } from "@/components/AdRail";

export const metadata = { title: "Browse — AffiliateDeals" };
export const revalidate = 60;

type SP = { q?: string; category?: string; commission?: string; sort?: string };

export default async function BrowsePage({ searchParams }: { searchParams: SP }) {
  const sort = (searchParams.sort as SortKey | undefined) ?? "featured";
  const [{ programs, featured }, viewsDoc] = await Promise.all([getDirectory(), getViewsCached()]);
  const week = thisWeekCounts(viewsDoc);
  const results = filterPrograms(programs, featured, {
    q: searchParams.q,
    category: searchParams.category,
    commission: searchParams.commission,
    sort,
    views: { total: viewsDoc.total, week },
  });

  const filterLabel = [
    searchParams.category && searchParams.category !== "all" ? searchParams.category : null,
    searchParams.commission && searchParams.commission !== "all" ? `${searchParams.commission} commission` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[200px_minmax(0,1fr)_200px] xl:gap-8">
        <AdRail side="left" />
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">Browse programs</h1>
              <p className="mt-1 text-sm text-ink-500">
                {results.length} of {programs.length} programs
                {filterLabel ? ` — ${filterLabel}` : ""}.
              </p>
            </div>
            <Link href="/submit" className="btn-accent">List yours</Link>
          </div>

          <DirectoryControls />

          <div className="mt-5 space-y-2">
            {results.length === 0 ? (
              <div className="card p-8 text-center text-sm text-ink-500">
                No programs match. Clear filters or{" "}
                <Link href="/submit" className="text-accent underline">add a new one</Link>.
              </div>
            ) : (
              results.slice(0, 200).map((p) => (
                <ProgramRow
                  key={p.slug}
                  program={p}
                  featured={featured.has(p.slug)}
                  viewCount={
                    sort === "popular"
                      ? viewsDoc.total[p.slug]
                      : sort === "hot"
                        ? week[p.slug]
                        : undefined
                  }
                  viewCountLabel={sort === "popular" ? "views" : sort === "hot" ? "this week" : undefined}
                />
              ))
            )}
          </div>

          {results.length > 200 && (
            <p className="mt-4 text-center text-xs text-ink-400">
              Showing first 200 results. Refine your search to see more.
            </p>
          )}
        </div>
        <AdRail side="right" />
      </div>
    </div>
  );
}
