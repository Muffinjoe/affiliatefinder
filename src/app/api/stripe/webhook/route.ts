import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { notifyAdmin } from "@/lib/email";

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
    if (meta.kind === "featured_listing") {
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
      await notifyAdmin(
        `💰 Featured purchased — ${meta.program_name}`,
        `
          <h2>Featured listing paid ($${amount})</h2>
          <ul>
            <li>Program: ${meta.program_name}</li>
            <li>Website: ${meta.website}</li>
            <li>Contact: ${meta.contact_email}</li>
            <li>Session: ${session.id}</li>
          </ul>
          <p>Add the slug to <code>FEATURED_SLUGS</code> in <code>src/lib/programs.ts</code>.</p>
        `
      );
    }
  }

  return NextResponse.json({ received: true });
}
