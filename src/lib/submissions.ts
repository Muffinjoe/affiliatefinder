import { put, list, del } from "@vercel/blob";
import type { Program } from "@/lib/programs";

/**
 * Persist submissions and the featured-slug allowlist in Vercel Blob.
 * Paths are namespaced with `affiliatefinder/` so the same Blob store
 * can be safely shared with other projects.
 */

const PREFIX = "affiliatefinder/";
const SUBMISSIONS_PREFIX = `${PREFIX}submissions/`;
const FEATURED_PATH = `${PREFIX}featured.json`;

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SubmissionInput = {
  name: string;
  url: string;
  signup_url: string;
  category: string;
  commission: string;
  commission_type?: string;
  cookie_days?: string | number | null;
  network?: string | null;
  short_description: string;
  description: string;
  tags?: string[];
  contact_email: string;
  wants_featured?: boolean;
};

export type Submission = SubmissionInput & {
  id: string;
  slug: string;
  status: SubmissionStatus;
  paidFeatured: boolean;
  createdAt: string;
  reviewedAt?: string;
};

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

function makeId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function writeSubmission(s: Submission): Promise<void> {
  const token = blobToken();
  await put(`${SUBMISSIONS_PREFIX}${s.id}.json`, JSON.stringify(s), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    cacheControlMaxAge: 0,
  });
}

export async function createSubmission(input: SubmissionInput): Promise<Submission> {
  const id = makeId();
  const submission: Submission = {
    ...input,
    id,
    slug: slugify(input.name) || `program-${id}`,
    status: "pending",
    paidFeatured: false,
    createdAt: new Date().toISOString(),
  };
  await writeSubmission(submission);
  return submission;
}

export async function listAllSubmissions(): Promise<Submission[]> {
  const token = blobToken();
  if (!token) return [];
  const all: Submission[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: SUBMISSIONS_PREFIX, cursor, token });
    for (const blob of page.blobs) {
      try {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (!res.ok) continue;
        const json = (await res.json()) as Submission;
        all.push(json);
      } catch (err) {
        console.error("[submissions] failed to load", blob.pathname, err);
      }
    }
    cursor = page.cursor;
  } while (cursor);
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const all = await listAllSubmissions();
  return all.find((s) => s.id === id) ?? null;
}

export async function setSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission | null> {
  const sub = await getSubmission(id);
  if (!sub) return null;
  sub.status = status;
  sub.reviewedAt = new Date().toISOString();
  await writeSubmission(sub);
  return sub;
}

export async function markSubmissionPaidByEmail(emailLower: string, name: string): Promise<Submission | null> {
  const all = await listAllSubmissions();
  const match = all.find(
    (s) => s.contact_email.toLowerCase() === emailLower && s.name === name
  );
  if (!match) return null;
  match.paidFeatured = true;
  // Auto-approve paid submissions
  if (match.status === "pending") {
    match.status = "approved";
    match.reviewedAt = new Date().toISOString();
  }
  await writeSubmission(match);
  return match;
}

export async function deleteSubmission(id: string): Promise<void> {
  const token = blobToken();
  await del(`${SUBMISSIONS_PREFIX}${id}.json`, { token });
}

// --- Featured slugs (overrides, with optional expiry) -----------------------

type FeaturedEntry = { slug: string; untilISO: string | null };
type FeaturedDoc = {
  entries?: FeaturedEntry[];
  slugs?: string[]; // legacy format — treated as never-expires
  updatedAt: string;
};

async function fetchFeaturedDoc(): Promise<FeaturedDoc> {
  const token = blobToken();
  if (!token) return { entries: [], updatedAt: "" };
  try {
    const page = await list({ prefix: FEATURED_PATH, token });
    const blob = page.blobs.find((b) => b.pathname === FEATURED_PATH);
    if (!blob) return { entries: [], updatedAt: "" };
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return { entries: [], updatedAt: "" };
    return (await res.json()) as FeaturedDoc;
  } catch (err) {
    console.error("[featured] read failed:", err);
    return { entries: [], updatedAt: "" };
  }
}

function liveEntries(doc: FeaturedDoc): FeaturedEntry[] {
  const now = Date.now();
  const fromEntries = (doc.entries ?? []).filter(
    (e) => !e.untilISO || new Date(e.untilISO).getTime() > now
  );
  // Migrate legacy `slugs` array on read.
  const fromLegacy = (doc.slugs ?? []).map<FeaturedEntry>((s) => ({ slug: s, untilISO: null }));
  const seen = new Set<string>();
  const out: FeaturedEntry[] = [];
  for (const e of [...fromEntries, ...fromLegacy]) {
    if (seen.has(e.slug)) continue;
    seen.add(e.slug);
    out.push(e);
  }
  return out;
}

export async function getFeaturedSlugs(): Promise<Set<string>> {
  const doc = await fetchFeaturedDoc();
  return new Set(liveEntries(doc).map((e) => e.slug));
}

export async function getFeaturedEntries(): Promise<FeaturedEntry[]> {
  const doc = await fetchFeaturedDoc();
  return liveEntries(doc);
}

async function writeFeaturedDoc(entries: FeaturedEntry[]): Promise<void> {
  const token = blobToken();
  const doc: FeaturedDoc = { entries, updatedAt: new Date().toISOString() };
  await put(FEATURED_PATH, JSON.stringify(doc), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    cacheControlMaxAge: 0,
  });
}

export async function setFeaturedFor(slug: string, months: number): Promise<void> {
  const doc = await fetchFeaturedDoc();
  const entries = liveEntries(doc).filter((e) => e.slug !== slug);
  const until = new Date();
  until.setUTCDate(until.getUTCDate() + months * 30);
  entries.push({ slug, untilISO: until.toISOString() });
  await writeFeaturedDoc(entries);
}

export async function toggleFeatured(slug: string, on: boolean): Promise<void> {
  const doc = await fetchFeaturedDoc();
  const entries = liveEntries(doc).filter((e) => e.slug !== slug);
  if (on) entries.push({ slug, untilISO: null }); // admin toggle = indefinite
  await writeFeaturedDoc(entries);
}

// --- Convert Submission → Program shape for the directory --------------------

export function submissionToProgram(s: Submission): Program {
  const cookieDays =
    typeof s.cookie_days === "number"
      ? s.cookie_days
      : s.cookie_days
        ? Number(s.cookie_days) || null
        : null;

  return {
    slug: s.slug,
    name: s.name,
    url: s.url,
    category: s.category,
    tags: s.tags ?? [],
    commission: {
      type: s.commission_type,
      rate: s.commission,
      currency: "USD",
      duration: null,
      conditions: null,
    },
    cookie_days: cookieDays,
    attribution: null,
    tracking_method: null,
    payout: undefined,
    signup_url: s.signup_url,
    approval: null,
    approval_time: null,
    restrictions: null,
    marketing_materials: null,
    api_available: null,
    dedicated_manager: null,
    dashboard_url: null,
    network: s.network ?? null,
    program_age: null,
    description: s.description,
    short_description: s.short_description,
    agents: undefined,
    verified: false,
    submitted_by: "user",
    kind: "affiliate",
    source: "user-submission",
    created_at: s.createdAt,
    updated_at: s.reviewedAt ?? s.createdAt,
    logo: null,
  };
}
