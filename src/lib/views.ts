import { put, list } from "@vercel/blob";

const PATH = "affiliatefinder/views.json";
const MAX_WEEKS = 8;

export type ViewsDoc = {
  total: Record<string, number>;
  byWeek: Record<string, Record<string, number>>; // key = ISO week (e.g. "2026-W16")
  updatedAt: string;
};

function token(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function isoWeek(d: Date = new Date()): string {
  // ISO 8601: week starts Monday, week 1 contains the year's first Thursday.
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

let cachedDoc: { doc: ViewsDoc; loadedAt: number } | null = null;
const CACHE_MS = 30_000;

async function fetchDoc(): Promise<ViewsDoc> {
  const t = token();
  if (!t) return { total: {}, byWeek: {}, updatedAt: "" };
  try {
    const page = await list({ prefix: PATH, token: t });
    const blob = page.blobs.find((b) => b.pathname === PATH);
    if (!blob) return { total: {}, byWeek: {}, updatedAt: "" };
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return { total: {}, byWeek: {}, updatedAt: "" };
    return (await res.json()) as ViewsDoc;
  } catch (err) {
    console.error("[views] fetch failed:", err);
    return { total: {}, byWeek: {}, updatedAt: "" };
  }
}

export async function getViewsCached(): Promise<ViewsDoc> {
  if (cachedDoc && Date.now() - cachedDoc.loadedAt < CACHE_MS) return cachedDoc.doc;
  const doc = await fetchDoc();
  cachedDoc = { doc, loadedAt: Date.now() };
  return doc;
}

export async function recordView(slug: string): Promise<void> {
  const t = token();
  if (!t) return;
  // Best-effort. Read latest, increment, write back. Single-writer races may
  // drop a count occasionally — fine for sort purposes.
  const doc = await fetchDoc();
  doc.total[slug] = (doc.total[slug] ?? 0) + 1;
  const week = isoWeek();
  doc.byWeek[week] = doc.byWeek[week] ?? {};
  doc.byWeek[week][slug] = (doc.byWeek[week][slug] ?? 0) + 1;

  // Trim to last MAX_WEEKS
  const weekKeys = Object.keys(doc.byWeek).sort();
  if (weekKeys.length > MAX_WEEKS) {
    for (const k of weekKeys.slice(0, weekKeys.length - MAX_WEEKS)) {
      delete doc.byWeek[k];
    }
  }
  doc.updatedAt = new Date().toISOString();

  try {
    await put(PATH, JSON.stringify(doc), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      token: t,
      cacheControlMaxAge: 0,
    });
    cachedDoc = { doc, loadedAt: Date.now() };
  } catch (err) {
    console.error("[views] write failed:", err);
  }
}

export function thisWeekCounts(doc: ViewsDoc): Record<string, number> {
  return doc.byWeek[isoWeek()] ?? {};
}
