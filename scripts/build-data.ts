/**
 * Convert every open-affiliate YAML file into two JSON files:
 *   src/data/programs.json    — full list, one object per program
 *   src/data/categories.json  — { category: count } map
 *
 * Run at build time so production reads a static JSON import with no fs I/O.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import YAML from "yaml";

const YAML_DIR = resolve(process.cwd(), "data/programs");
const OUT_DIR = resolve(process.cwd(), "src/data");
const LOGO_DIR = resolve(process.cwd(), "public/logos");
const LOGO_EXTS = ["png", "webp", "jpg", "jpeg", "svg"] as const;

function findLogo(slug: string): string | null {
  for (const ext of LOGO_EXTS) {
    if (existsSync(join(LOGO_DIR, `${slug}.${ext}`))) {
      return `/logos/${slug}.${ext}`;
    }
  }
  return null;
}

type Program = {
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
  agents?: {
    keywords?: string[];
    use_cases?: string[];
  };
  verified?: boolean;
  submitted_by?: string;
  kind?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
  logo?: string | null;
};

function main() {
  if (!existsSync(YAML_DIR)) {
    throw new Error(`YAML dir not found: ${YAML_DIR}. Make sure data/programs exists.`);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(YAML_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  const programs: Program[] = [];
  const catCounts: Record<string, number> = {};
  const skipped: string[] = [];

  for (const f of files) {
    const raw = readFileSync(join(YAML_DIR, f), "utf8");
    let doc: any;
    try {
      doc = YAML.parse(raw);
    } catch (err) {
      skipped.push(`${f}: parse error`);
      continue;
    }
    if (!doc || !doc.slug || !doc.name) {
      skipped.push(`${f}: missing slug/name`);
      continue;
    }

    const program: Program = {
      slug: String(doc.slug),
      name: String(doc.name),
      aliases: Array.isArray(doc.aliases) ? doc.aliases.map(String) : undefined,
      url: String(doc.url ?? ""),
      category: String(doc.category ?? "Other"),
      tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
      commission: {
        type: doc.commission?.type ? String(doc.commission.type) : undefined,
        rate: doc.commission?.rate != null ? String(doc.commission.rate) : undefined,
        currency: doc.commission?.currency ? String(doc.commission.currency) : undefined,
        duration: doc.commission?.duration ?? null,
        conditions: doc.commission?.conditions ?? null,
      },
      cookie_days: doc.cookie_days ?? null,
      attribution: doc.attribution ?? null,
      tracking_method: doc.tracking_method ?? null,
      payout: doc.payout
        ? {
            minimum: doc.payout.minimum ?? null,
            currency: doc.payout.currency ?? null,
            frequency: doc.payout.frequency ?? null,
            methods: Array.isArray(doc.payout.methods) ? doc.payout.methods.map(String) : [],
          }
        : undefined,
      signup_url: doc.signup_url ?? null,
      approval: doc.approval ?? null,
      approval_time: doc.approval_time ?? null,
      restrictions: doc.restrictions ?? null,
      marketing_materials: doc.marketing_materials ?? null,
      api_available: doc.api_available ?? null,
      dedicated_manager: doc.dedicated_manager ?? null,
      dashboard_url: doc.dashboard_url ?? null,
      network: doc.network ?? null,
      program_age: doc.program_age ?? null,
      description: String(doc.description ?? ""),
      short_description: String(doc.short_description ?? ""),
      agents: doc.agents
        ? {
            keywords: Array.isArray(doc.agents.keywords) ? doc.agents.keywords.map(String) : [],
            use_cases: Array.isArray(doc.agents.use_cases) ? doc.agents.use_cases.map(String) : [],
          }
        : undefined,
      verified: !!doc.verified,
      submitted_by: doc.submitted_by ?? undefined,
      kind: doc.kind ?? "affiliate",
      source: doc.source ?? undefined,
      created_at: doc.created_at ? String(doc.created_at) : undefined,
      updated_at: doc.updated_at ? String(doc.updated_at) : undefined,
      logo: findLogo(String(doc.slug)),
    };

    programs.push(program);
    catCounts[program.category] = (catCounts[program.category] ?? 0) + 1;
  }

  programs.sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(join(OUT_DIR, "programs.json"), JSON.stringify(programs));
  writeFileSync(join(OUT_DIR, "categories.json"), JSON.stringify(catCounts));

  const withLogos = programs.filter((p) => p.logo).length;
  console.log(`[build-data] wrote ${programs.length} programs across ${Object.keys(catCounts).length} categories (${withLogos} with logos)`);
  if (skipped.length) {
    console.warn(`[build-data] skipped ${skipped.length} files:`);
    skipped.slice(0, 10).forEach((s) => console.warn("  -", s));
  }
}

main();
