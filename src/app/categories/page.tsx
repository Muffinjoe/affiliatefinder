import Link from "next/link";
import { CATEGORIES, CATEGORY_COUNTS } from "@/lib/programs";

export const metadata = {
  title: "All categories — AffiliateFinder",
  description: "Browse affiliate programs by category on AffiliateFinder.co.",
};

export default function CategoriesPage() {
  const sorted = CATEGORIES.map((c) => ({ name: c, count: CATEGORY_COUNTS[c] })).sort(
    (a, b) => b.count - a.count
  );
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-ink-900">All categories</h1>
      <p className="mt-1 text-sm text-ink-500">{CATEGORIES.length} categories · {Object.values(CATEGORY_COUNTS).reduce((a, b) => a + b, 0)} programs</p>
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c) => (
          <Link
            key={c.name}
            href={`/browse?category=${encodeURIComponent(c.name)}`}
            className="card flex items-center justify-between p-4 hover:border-accent-500"
          >
            <span className="text-sm font-semibold text-ink-900">{c.name}</span>
            <span className="text-xs text-ink-500">{c.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
