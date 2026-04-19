import { NextResponse } from "next/server";
import { z } from "zod";
import { createAd } from "@/lib/ads";
import { getStripe, getSiteUrl, AD_PRICE_CENTS } from "@/lib/stripe";
import { notifyAdmin } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({
  headline: z.string().min(2).max(60),
  body: z.string().min(2).max(160),
  url: z.string().url(),
  imageUrl: z.string().url().optional().nullable(),
  contact_email: z.string().email(),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  }

  let ad;
  try {
    ad = await createAd({
      headline: d.headline,
      body: d.body,
      url: d.url,
      imageUrl: d.imageUrl ?? null,
      contact_email: d.contact_email,
    });
  } catch (err) {
    console.error("[advertise] save failed:", err);
    return NextResponse.json({ error: "Failed to save ad" }, { status: 500 });
  }

  const siteUrl = getSiteUrl(req);
  let checkoutUrl: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: d.contact_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: AD_PRICE_CENTS,
            product_data: {
              name: `Sidebar ad — ${d.headline}`,
              description: "30-day sidebar placement on AffiliateFinder.co (homepage + browse).",
            },
          },
        },
      ],
      success_url: `${siteUrl}/advertise/thanks?status=paid`,
      cancel_url: `${siteUrl}/advertise/thanks?status=cancel`,
      metadata: {
        kind: "sidebar_ad",
        ad_id: ad.id,
        contact_email: d.contact_email,
        headline: d.headline,
      },
    });
    checkoutUrl = session.url;
  } catch (err) {
    console.error("[stripe] ad checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }

  await notifyAdmin(
    `[AffiliateFinder] New ad submitted — ${d.headline}`,
    `<h2>Sidebar ad (awaiting payment)</h2>
     <ul>
       <li>Headline: ${escapeHtml(d.headline)}</li>
       <li>Body: ${escapeHtml(d.body)}</li>
       <li>URL: <a href="${d.url}">${d.url}</a></li>
       <li>Image: ${d.imageUrl ?? "—"}</li>
       <li>Contact: ${escapeHtml(d.contact_email)}</li>
     </ul>`
  );

  return NextResponse.json({ ok: true, checkoutUrl });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
