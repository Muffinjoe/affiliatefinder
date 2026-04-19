"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CATEGORIES, CATEGORY_COUNTS, COMMISSION_TYPES, SORT_TABS } from "@/lib/programs";

export function DirectoryControls() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  function buildHref(updates: Record<string, string | null>): string {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v || v === "all" || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `/browse?${qs}` : "/browse";
  }

  function go(updates: Record<string, string | null>) {
    startTransition(() => router.push(buildHref(updates)));
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    go({ q });
  }

  const category = sp.get("category") ?? "all";
  const commission = sp.get("commission") ?? "all";
  const sort = sp.get("sort") ?? "featured";
  const total = Object.values(CATEGORY_COUNTS).reduce((a, b) => a + b, 0);

  const commissionPills: { key: string; label: string }[] = [
    { key: "all", label: "All commissions" },
    ...COMMISSION_TYPES.map((c) => ({ key: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search + category */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search programs, categories, networks…"
              className="input pl-9"
              aria-label="Search programs"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              🔍
            </span>
          </div>
        </form>
        <select
          value={category}
          onChange={(e) => go({ category: e.target.value })}
          className="input sm:w-auto"
          aria-label="Category"
        >
          <option value="all">All categories ({total})</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c} ({CATEGORY_COUNTS[c]})
            </option>
          ))}
        </select>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-ink-200">
        {SORT_TABS.map((t) => {
          const active = sort === t.key;
          return (
            <button
              key={t.key}
              type="button"
              title={t.hint}
              onClick={() => go({ sort: t.key })}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-500 hover:text-ink-800"
              }`}
            >
              {t.label}
              {t.key === "hot" && <span className="ml-1 text-[10px]">🔥</span>}
            </button>
          );
        })}
        {pending && <span className="ml-auto self-center text-xs text-ink-400">Loading…</span>}
      </div>

      {/* Commission type pills */}
      <div className="-mt-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-medium text-ink-500">Commission:</span>
        {commissionPills.map((p) => {
          const active = commission === p.key || (p.key === "all" && commission === "all");
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => go({ commission: p.key })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
              }`}
            >
              {p.label}
            </button>
          );
        })}
        {(category !== "all" || commission !== "all" || (sp.get("q") ?? "")) && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              startTransition(() => router.push("/browse"));
            }}
            className="ml-auto text-xs text-ink-500 underline-offset-2 hover:text-ink-800 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
