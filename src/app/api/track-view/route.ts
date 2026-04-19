import { NextResponse } from "next/server";
import { recordView } from "@/lib/views";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug || slug.length > 80 || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  // Filter obvious bots
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|spider|crawler|preview|prerender|headless/i.test(ua)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }
  recordView(slug).catch((err) => console.error("[track-view] failed:", err));
  return NextResponse.json({ ok: true });
}
