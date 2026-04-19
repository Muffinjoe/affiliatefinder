import Link from "next/link";
import { ALL_PROGRAMS, filterPrograms, SortKey } from "@/lib/programs";
import { DirectoryControls } from "@/components/DirectoryControls";
import { ProgramRow } from "@/components/ProgramCard";

export const metadata = { title: "Browse — AffiliateFinder" };

type SP = { q?: string; category?: string; sort?: string };

export default function BrowsePage({ searchParams }: { searchParams: SP }) {
  const sort = (searchParams.sort as SortKey | undefined) ?? "featured";
  const results = filterPrograms(ALL_PROGRAMS, {
    q: searchParams.q,
    category: searchParams.category,
    sort,
  });

  return (
    <div className="container-page py-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Browse programs</h1>
          <p className="mt-1 text-sm text-ink-500">
            {results.length} of {ALL_PROGRAMS.length} programs
            {searchParams.category && searchParams.category !== "all" ? ` in ${searchParams.category}` : ""}.
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
          results.slice(0, 200).map((p) => <ProgramRow key={p.slug} program={p} />)
        )}
      </div>

      {results.length > 200 && (
        <p className="mt-4 text-center text-xs text-ink-400">
          Showing first 200 results. Refine your search to see more.
        </p>
      )}
    </div>
  );
}
