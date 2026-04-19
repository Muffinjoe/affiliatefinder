import { cache } from "react";
import raw from "@/data/programs.json";
import catMap from "@/data/categories.json";
import { listAllSubmissions, getFeaturedSlugs, submissionToProgram } from "@/lib/submissions";

export type Program = {
  slug: string;
  name: string;
  aliases?: string[];
  url: string;
  category: string;
  tags: string[];
  commission: {
    type?: string;
    rate?: string;
    currency?: string;
    duration?: string | null;
    conditions?: string | null;
  };
  cookie_days?: number | null;
  attribution?: string | null;
  tracking_method?: string | null;
  payout?: {
    minimum?: number | null;
    currency?: string | null;
    frequency?: string | null;
    methods?: string[];
  };
  signup_url?: string | null;
  approval?: string | null;
  approval_time?: string | null;
  restrictions?: string | null;
  marketing_materials?: boolean | null;
  api_available?: boolean | null;
  dedicated_manager?: boolean | null;
  dashboard_url?: string | null;
  network?: string | null;
  program_age?: string | null;
  description: string;
  short_description: string;
  agents?: { keywords?: string[]; use_cases?: string[] };
  verified?: boolean;
  submitted_by?: string;
  kind?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
  logo?: string | null;
};

export const STATIC_PROGRAMS: Program[] = raw as Program[];
export const CATEGORY_COUNTS: Record<string, number> = catMap as Record<string, number>;
export const CATEGORIES = Object.keys(CATEGORY_COUNTS).sort();

export const COMMISSION_TYPES = ["one-time", "recurring", "tiered", "hybrid"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

// Hardcoded fallback featured set — runtime overrides come from Vercel Blob.
const STATIC_FEATURED = new Set<string>(["ahrefs", "1password", "algolia", "activecampaign"]);

type DirectoryResult = { programs: Program[]; featured: Set<string> };

// Process-wide memo with a 60s TTL. Ensures a single build (or a burst of
// concurrent function invocations) only hits Vercel Blob once instead of
// 750+ times during static generation of /p/[slug] pages.
let directoryMemo: { at: number; promise: Promise<DirectoryResult> } | null = null;
const DIRECTORY_TTL_MS = 60_000;

async function buildDirectory(): Promise<DirectoryResult> {
  let extras: Program[] = [];
  let blobFeatured = new Set<string>();
  try {
    const [subs, feat] = await Promise.all([listAllSubmissions(), getFeaturedSlugs()]);
    extras = subs.filter((s) => s.status === "approved").map(submissionToProgram);
    blobFeatured = feat;
  } catch (err) {
    console.error("[directory] blob read failed:", err);
  }
  const seen = new Set<string>();
  const merged: Program[] = [];
  for (const p of [...extras, ...STATIC_PROGRAMS]) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    merged.push(p);
  }
  const featured = new Set<string>([...STATIC_FEATURED, ...blobFeatured]);
  return { programs: merged, featured };
}

export const getDirectory = cache(async (): Promise<DirectoryResult> => {
  const now = Date.now();
  if (directoryMemo && now - directoryMemo.at < DIRECTORY_TTL_MS) {
    return directoryMemo.promise;
  }
  const promise = buildDirectory();
  directoryMemo = { at: now, promise };
  // If the underlying call rejects, drop the memo so we retry on next call.
  promise.catch(() => {
    directoryMemo = null;
  });
  return promise;
});

export function isFeaturedIn(featured: Set<string>, p: Pick<Program, "slug">): boolean {
  return featured.has(p.slug);
}

export type SortKey = "featured" | "popular" | "hot" | "newest" | "name";

export const SORT_TABS: { key: SortKey; label: string; hint: string }[] = [
  { key: "featured", label: "Featured", hint: "Featured programs first" },
  { key: "popular", label: "Popular", hint: "Most viewed all time" },
  { key: "hot", label: "Hot", hint: "Most viewed this week" },
  { key: "newest", label: "Newest", hint: "Recently added" },
  { key: "name", label: "A–Z", hint: "Alphabetical" },
];

export type DirectoryFilter = {
  q?: string;
  category?: string;
  commission?: string;
  sort?: SortKey;
  views?: { total: Record<string, number>; week: Record<string, number> };
};

export function filterPrograms(
  programs: Program[],
  featured: Set<string>,
  f: DirectoryFilter
): Program[] {
  let out = programs;
  if (f.category && f.category !== "all") {
    out = out.filter((p) => p.category === f.category);
  }
  if (f.commission && f.commission !== "all") {
    const target = f.commission.toLowerCase();
    out = out.filter((p) => (p.commission.type ?? "").toLowerCase() === target);
  }
  if (f.q && f.q.trim()) {
    const needle = f.q.trim().toLowerCase();
    out = out.filter((p) => {
      const hay = [
        p.name,
        p.short_description,
        p.description,
        p.category,
        p.network ?? "",
        ...(p.tags ?? []),
        ...(p.aliases ?? []),
        ...(p.agents?.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }

  const sort = f.sort ?? "featured";
  const sorted = [...out];
  if (sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "newest") {
    sorted.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  } else if (sort === "popular" || sort === "hot") {
    const counts = sort === "popular" ? f.views?.total ?? {} : f.views?.week ?? {};
    sorted.sort((a, b) => {
      const af = featured.has(a.slug) ? 1 : 0;
      const bf = featured.has(b.slug) ? 1 : 0;
      if (af !== bf) return bf - af;
      const av = counts[a.slug] ?? 0;
      const bv = counts[b.slug] ?? 0;
      if (av !== bv) return bv - av;
      return a.name.localeCompare(b.name);
    });
  } else {
    sorted.sort((a, b) => {
      const af = featured.has(a.slug) ? 1 : 0;
      const bf = featured.has(b.slug) ? 1 : 0;
      if (af !== bf) return bf - af;
      return a.name.localeCompare(b.name);
    });
  }
  return sorted;
}

export function formatCommission(c: Program["commission"]): string {
  if (!c) return "—";
  const parts: string[] = [];
  if (c.rate) parts.push(String(c.rate));
  if (c.type) parts.push(`(${c.type})`);
  return parts.join(" ") || "—";
}

export function iconLetter(name: string): string {
  return (name[0] ?? "?").toUpperCase();
}
