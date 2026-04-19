import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES } from "@/lib/programs";
import { notifyAdmin } from "@/lib/email";
import { getStripe, getSiteUrl, FEATURED_PRICE_CENTS } from "@/lib/stripe";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(2).max(80),
  url: z.string().url(),
  signup_url: z.string().url(),
  category: z.string().refine((c) => (CATEGORIES as string[]).includes(c), { message: "Invalid category" }),
  commission: z.string().min(1).max(200),
  cookie_days: z.union([z.string(), z.number()]).optional().nullable(),
  network: z.string().max(80).optional().nullable(),
  short_description: z.string().min(5).max(160),
  description: z.string().min(20).max(3000),
  tags: z.array(z.string()).max(10).optional(),
  contact_email: z.string().email(),
  wantsFeatured: z.boolean().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const html = `
    <h2>New AffiliateFinder submission</h2>
    <p><strong>${escapeHtml(d.name)}</strong> — ${escapeHtml(d.category)}</p>
    <p>${escapeHtml(d.short_description)}</p>
    <ul>
      <li>Website: <a href="${d.url}">${d.url}</a></li>
      <li>Signup: <a href="${d.signup_url}">${d.signup_url}</a></li>
      <li>Commission: ${escapeHtml(d.commission)}</li>
      <li>Cookie: ${d.cookie_days ?? "—"} days</li>
      <li>Network: ${escapeHtml(d.network ?? "—")}</li>
      <li>Tags: ${escapeHtml((d.tags ?? []).join(", "))}</li>
      <li>Contact: ${escapeHtml(d.contact_email)}</li>
      <li>Featured upsell: ${d.wantsFeatured ? "YES ($50)" : "no"}</li>
    </ul>
    <p>${escapeHtml(d.description).replace(/\n/g, "<br/>")}</p>
  `;
  await notifyAdmin(`[AffiliateFinder] ${d.name} submitted${d.wantsFeatured ? " (Featured)" : ""}`, html);

  let checkoutUrl: string | null = null;
  if (d.wantsFeatured && process.env.STRIPE_SECRET_KEY) {
    try {
      const siteUrl = getSiteUrl(req);
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: d.contact_email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: FEATURED_PRICE_CENTS,
              product_data: {
                name: `Featured listing — ${d.name}`,
                description: "30-day featured placement on AffiliateFinder.co — homepage + category top.",
              },
            },
          },
        ],
        success_url: `${siteUrl}/submit/thanks?featured=success`,
        cancel_url: `${siteUrl}/submit/thanks?featured=cancel`,
        metadata: {
          kind: "featured_listing",
          program_name: d.name,
          contact_email: d.contact_email,
          website: d.url,
        },
      });
      checkoutUrl = session.url;
    } catch (err) {
      console.error("[stripe] featured checkout error:", err);
    }
  }

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
