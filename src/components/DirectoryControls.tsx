"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CATEGORIES, CATEGORY_COUNTS, COMMISSION_TYPES } from "@/lib/programs";

export function DirectoryControls() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(sp.toString());
    if (!value || value === "all" || value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.push(`/browse?${next.toString()}`);
    });
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateParam("q", q);
  }

  const category = sp.get("category") ?? "all";
  const commission = sp.get("commission") ?? "all";
  const sort = sp.get("sort") ?? "featured";

  const total = Object.values(CATEGORY_COUNTS).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSearchSubmit}>
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
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="input w-auto"
          aria-label="Category"
        >
          <option value="all">All categories ({total})</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c} ({CATEGORY_COUNTS[c]})
            </option>
          ))}
        </select>
        <select
          value={commission}
          onChange={(e) => updateParam("commission", e.target.value)}
          className="input w-auto"
          aria-label="Commission type"
        >
          <option value="all">All commission types</option>
          {COMMISSION_TYPES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="input w-auto"
          aria-label="Sort"
        >
          <option value="featured">Featured first</option>
          <option value="newest">Newest</option>
          <option value="name">A–Z</option>
        </select>
        {(category !== "all" || commission !== "all" || (sp.get("q") ?? "")) && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              startTransition(() => router.push("/browse"));
            }}
            className="btn-ghost h-9"
          >
            Clear
          </button>
        )}
        {pending && <span className="text-xs text-ink-400">Loading…</span>}
      </div>
    </div>
  );
}
