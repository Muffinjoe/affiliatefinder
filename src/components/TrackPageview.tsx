"use client";

import { useEffect } from "react";

const STORAGE_PREFIX = "af_view_";
const DEDUPE_HOURS = 6;

/**
 * Fires once per slug per browser per DEDUPE_HOURS.
 */
export function TrackPageview({ slug }: { slug: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = `${STORAGE_PREFIX}${slug}`;
      const last = Number(localStorage.getItem(key) ?? "0");
      if (Date.now() - last < DEDUPE_HOURS * 3600 * 1000) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {
      // ignore quota errors
    }
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);
  return null;
}
