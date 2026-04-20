import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { notifyAdmin } from "@/lib/email";
import { getSubmission, setSubmissionStatus, setFeaturedFor } from "@/lib/submissions";
import { activateAd } from "@/lib/ads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const amount = ((session.amount_total ?? 0) / 100).toFixed(2);

    if (meta.kind === "listing" && meta.submission_id) {
      const submissionId = String(meta.submission_id);
      const months = Math.max(0, Math.min(3, Number(meta.featured_months ?? "0")));
      try {
        const sub = await getSubmission(submissionId);
        if (sub) {
          // Auto-approve every paid listing. Featured purchases additionally
          // pin to the top for the chosen duration. Admin can still unpublish
          // anything dodgy from /admin.
          await setSubmissionStatus(sub.id, "approved");
          if (months > 0) {
            sub.paidFeatured = true;
            await setFeaturedFor(sub.slug, months);
          }
        }
        await notifyAdmin(
          `💰 Payment received — ${meta.program_name ?? submissionId}`,
          `
            <h2>Listing paid ($${amount}) — auto-approved</h2>
            <ul>
              <li>Submission: ${submissionId}</li>
              <li>Featured: ${months > 0 ? `${months} month${months > 1 ? "s" : ""} — pinned` : "no"}</li>
              <li>Stripe session: ${session.id}</li>
            </ul>
          `
        );
      } catch (err) {
        console.error("[stripe webhook] listing handler failed:", err);
      }
    } else if (meta.kind === "sidebar_ad" && meta.ad_id) {
      try {
        const ad = await activateAd(String(meta.ad_id));
        await notifyAdmin(
          `📣 Ad paid — ${meta.headline ?? meta.ad_id}`,
          `
            <h2>Sidebar ad paid ($${amount})</h2>
            <ul>
              <li>Ad: ${meta.ad_id}</li>
              <li>Headline: ${meta.headline ?? "—"}</li>
              <li>Contact: ${meta.contact_email ?? "—"}</li>
              <li>Activated: ${ad?.activatedAt ?? "—"} → expires ${ad?.untilISO ?? "—"}</li>
            </ul>
          `
        );
      } catch (err) {
        console.error("[stripe webhook] ad handler failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
