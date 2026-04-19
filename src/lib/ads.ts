import { put, list, del } from "@vercel/blob";

const PREFIX = "affiliatefinder/ads/";

export type AdStatus = "pending" | "active" | "rejected";

export type Ad = {
  id: string;
  headline: string;
  body: string;
  url: string;
  imageUrl?: string | null;
  contact_email: string;
  status: AdStatus;
  paid: boolean;
  createdAt: string;
  activatedAt?: string;
  untilISO?: string; // 30-day window from activation
};

function token(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

function makeId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function writeAd(ad: Ad): Promise<void> {
  await put(`${PREFIX}${ad.id}.json`, JSON.stringify(ad), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: token(),
    cacheControlMaxAge: 0,
  });
}

export async function createAd(input: {
  headline: string;
  body: string;
  url: string;
  imageUrl?: string | null;
  contact_email: string;
}): Promise<Ad> {
  const ad: Ad = {
    id: makeId(),
    headline: input.headline,
    body: input.body,
    url: input.url,
    imageUrl: input.imageUrl ?? null,
    contact_email: input.contact_email,
    status: "pending",
    paid: false,
    createdAt: new Date().toISOString(),
  };
  await writeAd(ad);
  return ad;
}

export async function listAds(): Promise<Ad[]> {
  const t = token();
  if (!t) return [];
  const all: Ad[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, token: t });
    for (const blob of page.blobs) {
      try {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (!res.ok) continue;
        const json = (await res.json()) as Ad;
        all.push(json);
      } catch (err) {
        console.error("[ads] failed to load", blob.pathname, err);
      }
    }
    cursor = page.cursor;
  } while (cursor);
  return all;
}

export async function listActiveAds(): Promise<Ad[]> {
  const all = await listAds();
  const now = Date.now();
  return all
    .filter((a) => a.status === "active" && a.paid)
    .filter((a) => !a.untilISO || new Date(a.untilISO).getTime() > now)
    .sort((a, b) => (a.activatedAt ?? "").localeCompare(b.activatedAt ?? ""));
}

export async function getAd(id: string): Promise<Ad | null> {
  const all = await listAds();
  return all.find((a) => a.id === id) ?? null;
}

export async function activateAd(id: string): Promise<Ad | null> {
  const ad = await getAd(id);
  if (!ad) return null;
  ad.paid = true;
  ad.status = "active";
  ad.activatedAt = new Date().toISOString();
  const until = new Date();
  until.setUTCDate(until.getUTCDate() + 30);
  ad.untilISO = until.toISOString();
  await writeAd(ad);
  return ad;
}

export async function setAdStatus(id: string, status: AdStatus): Promise<Ad | null> {
  const ad = await getAd(id);
  if (!ad) return null;
  ad.status = status;
  await writeAd(ad);
  return ad;
}

export async function deleteAd(id: string): Promise<void> {
  await del(`${PREFIX}${id}.json`, { token: token() });
}
