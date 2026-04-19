import type { MetadataRoute } from "next";
import { ALL_PROGRAMS, CATEGORIES } from "@/lib/programs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://affiliatefinder.co";
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
  const cats = CATEGORIES.map((c) => ({
    url: `${base}/browse?category=${encodeURIComponent(c)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const programs = ALL_PROGRAMS.map((p) => ({
    url: `${base}/p/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
  return [...staticPages, ...cats, ...programs];
}
