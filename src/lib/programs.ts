import raw from "@/data/programs.json";
import catMap from "@/data/categories.json";

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
};

export const ALL_PROGRAMS: Program[] = raw as Program[];
export const CATEGORY_COUNTS: Record<string, number> = catMap as Record<string, number>;
export const CATEGORIES = Object.keys(CATEGORY_COUNTS).sort();

// Featured slugs — a simple static allowlist for MVP. New featured boosts ping
// admin via email and get appended here by hand (or via a future admin tool).
export const FEATURED_SLUGS = new Set<string>([
  "ahrefs",
  "1password",
  "algolia",
  "activecampaign",
]);

export function isFeatured(p: Pick<Program, "slug">): boolean {
  return FEATURED_SLUGS.has(p.slug);
}

export function getProgramBySlug(slug: string): Program | null {
  return ALL_PROGRAMS.find((p) => p.slug === slug) ?? null;
}

export type SortKey = "featured" | "newest" | "name";

type Filter = {
  q?: string;
  category?: string;
  sort?: SortKey;
};

export function filterPrograms(programs: Program[], f: Filter): Program[] {
  let out = programs;
  if (f.category && f.category !== "all") {
    out = out.filter((p) => p.category === f.category);
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
  } else {
    sorted.sort((a, b) => {
      const af = isFeatured(a) ? 1 : 0;
      const bf = isFeatured(b) ? 1 : 0;
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
