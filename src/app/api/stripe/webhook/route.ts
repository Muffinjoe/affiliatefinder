import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { notifyAdmin } from "@/lib/email";
import { getSubmission, setSubmissionStatus, toggleFeatured } from "@/lib/submissions";

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
    const submissionId = meta.submission_id ? String(meta.submission_id) : null;
    const featuredFlag = String(meta.featured ?? "0") === "1";

    if (meta.kind === "listing" && submissionId) {
      try {
        const sub = await getSubmission(submissionId);
        if (sub) {
          if (featuredFlag) {
            // Paid for featured add-on — auto-approve + feature
            sub.paidFeatured = true;
            await setSubmissionStatus(sub.id, "approved");
            await toggleFeatured(sub.slug, true);
          }
          // Otherwise leave as pending for admin review.
        }
        const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
        await notifyAdmin(
          `💰 Payment received — ${meta.program_name ?? submissionId}`,
          `
            <h2>Listing paid ($${amount})</h2>
            <ul>
              <li>Submission: ${submissionId}</li>
              <li>Program: ${meta.program_name ?? "—"}</li>
              <li>Contact: ${meta.contact_email ?? "—"}</li>
              <li>Featured add-on: ${featuredFlag ? "YES — auto-approved + pinned" : "no — still needs admin approval"}</li>
              <li>Stripe session: ${session.id}</li>
            </ul>
          `
        );
      } catch (err) {
        console.error("[stripe webhook] handler failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
