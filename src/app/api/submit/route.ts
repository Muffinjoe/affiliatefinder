import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES, COMMISSION_TYPES } from "@/lib/programs";
import { createSubmission } from "@/lib/submissions";
import { notifyAdmin } from "@/lib/email";
import {
  getStripe,
  getSiteUrl,
  FEATURED_PRICE_CENTS,
  LISTING_PRICE_CENTS,
} from "@/lib/stripe";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(2).max(80),
  url: z.string().url(),
  signup_url: z.string().url(),
  category: z.string().refine((c) => (CATEGORIES as string[]).includes(c), { message: "Invalid category" }),
  commission: z.string().min(1).max(200),
  commission_type: z.enum(COMMISSION_TYPES).optional(),
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

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  }

  let submission;
  try {
    submission = await createSubmission({
      name: d.name,
      url: d.url,
      signup_url: d.signup_url,
      category: d.category,
      commission: d.commission,
      commission_type: d.commission_type,
      cookie_days: d.cookie_days ?? null,
      network: d.network ?? null,
      short_description: d.short_description,
      description: d.description,
      tags: d.tags ?? [],
      contact_email: d.contact_email,
      wants_featured: !!d.wantsFeatured,
    });
  } catch (err) {
    console.error("[submit] blob write failed:", err);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  const siteUrl = getSiteUrl(req);
  const lineItems: any[] = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: LISTING_PRICE_CENTS,
        product_data: {
          name: `Listing — ${d.name}`,
          description: "AffiliateFinder.co directory listing.",
        },
      },
    },
  ];
  if (d.wantsFeatured) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: FEATURED_PRICE_CENTS,
        product_data: {
          name: `Featured boost — ${d.name}`,
          description: "30-day featured placement (homepage + category top).",
        },
      },
    });
  }

  let checkoutUrl: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: d.contact_email,
      line_items: lineItems,
      success_url: `${siteUrl}/submit/thanks?status=paid`,
      cancel_url: `${siteUrl}/submit/thanks?status=cancel`,
      metadata: {
        kind: "listing",
        submission_id: submission.id,
        featured: d.wantsFeatured ? "1" : "0",
        program_name: d.name,
        contact_email: d.contact_email,
        website: d.url,
      },
    });
    checkoutUrl = session.url;
  } catch (err) {
    console.error("[stripe] checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }

  const adminUrl = `${siteUrl}/admin`;
  await notifyAdmin(
    `[AffiliateFinder] ${d.name} submitted${d.wantsFeatured ? " (+Featured)" : ""}`,
    `
      <h2>New submission (awaiting payment)</h2>
      <p><strong>${escapeHtml(d.name)}</strong> — ${escapeHtml(d.category)} · ${escapeHtml(d.commission_type ?? "—")}</p>
      <p>${escapeHtml(d.short_description)}</p>
      <ul>
        <li>Website: <a href="${d.url}">${d.url}</a></li>
        <li>Signup: <a href="${d.signup_url}">${d.signup_url}</a></li>
        <li>Commission: ${escapeHtml(d.commission)}</li>
        <li>Contact: ${escapeHtml(d.contact_email)}</li>
        <li>Bundle: $${(LISTING_PRICE_CENTS / 100) + (d.wantsFeatured ? FEATURED_PRICE_CENTS / 100 : 0)} ${d.wantsFeatured ? "(listing + featured)" : "(listing)"}</li>
      </ul>
      <p><a href="${adminUrl}">→ Review in admin</a></p>
    `
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
