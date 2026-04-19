import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
  return _stripe;
}

export function getSiteUrl(req?: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}

// $20 to submit a listing
export const LISTING_PRICE_CENTS = 2000;

// Featured price tiers — 1/2/3 months with progressive discount
export const FEATURED_TIERS: Record<1 | 2 | 3, { cents: number; label: string; perMonth: string }> = {
  1: { cents: 5000, label: "$50", perMonth: "$50/mo" },
  2: { cents: 8900, label: "$89", perMonth: "$44.50/mo" },
  3: { cents: 11900, label: "$119", perMonth: "$39.67/mo" },
};

// Sidebar ad — flat $100 / 30 days
export const AD_PRICE_CENTS = 10000;
