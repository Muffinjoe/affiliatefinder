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

// $50 one-time featured boost
export const FEATURED_PRICE_CENTS = 5000;
