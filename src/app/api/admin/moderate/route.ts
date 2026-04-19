import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import {
  deleteSubmission,
  setSubmissionStatus,
  toggleFeatured,
  setFeaturedFor,
  getSubmission,
} from "@/lib/submissions";
import { setAdStatus, deleteAd, activateAd } from "@/lib/ads";
import { notifyAdmin } from "@/lib/email";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { action, id, slug, on, months } = body ?? {};

  try {
    if (action === "approve" && id) {
      const sub = await setSubmissionStatus(id, "approved");
      if (sub) await notifyApplicant(sub.contact_email, sub.name, sub.slug, "approved");
      return NextResponse.json({ ok: true });
    }
    if (action === "reject" && id) {
      const sub = await setSubmissionStatus(id, "rejected");
      if (sub) await notifyApplicant(sub.contact_email, sub.name, sub.slug, "rejected");
      return NextResponse.json({ ok: true });
    }
    if (action === "delete" && id) {
      await deleteSubmission(id);
      return NextResponse.json({ ok: true });
    }
    if (action === "feature" && slug) {
      if (typeof months === "number" && months > 0) {
        await setFeaturedFor(slug, Math.min(12, Math.max(1, months)));
      } else {
        await toggleFeatured(slug, !!on);
      }
      return NextResponse.json({ ok: true });
    }
    if (action === "ad-approve" && id) {
      await activateAd(String(id));
      return NextResponse.json({ ok: true });
    }
    if (action === "ad-reject" && id) {
      await setAdStatus(String(id), "rejected");
      return NextResponse.json({ ok: true });
    }
    if (action === "ad-delete" && id) {
      await deleteAd(String(id));
      return NextResponse.json({ ok: true });
    }
    if (action === "reveal" && id) {
      const sub = await getSubmission(id);
      return NextResponse.json({ ok: true, submission: sub });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin moderate] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function notifyApplicant(
  email: string,
  name: string,
  slug: string,
  decision: "approved" | "rejected"
) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "AffiliateDeals <noreply@affiliatedeals.co>";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://affiliatedeals.co";
  if (!key) return;
  const resend = new Resend(key);
  const subject =
    decision === "approved"
      ? `Your ${name} listing is live on AffiliateDeals`
      : `Your ${name} listing wasn't approved`;
  const html =
    decision === "approved"
      ? `<p>Good news — <strong>${name}</strong> is live in the directory.</p>
         <p><a href="${site}/p/${slug}">View it here →</a></p>
         <p>Want more reach? Boost it for $50 for 30-day featured placement.</p>`
      : `<p>Hi — we weren't able to approve <strong>${name}</strong> at this time.</p>
         <p>Common reasons: duplicate, broken signup link, or incomplete details.
         Reply to this email if you'd like to discuss.</p>`;
  try {
    await resend.emails.send({ from, to: email, subject, html });
  } catch (err) {
    console.error("[admin notify applicant] failed:", err);
  }
  await notifyAdmin(`[admin] ${decision}: ${name}`, html);
}
