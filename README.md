# AffiliateFinder.co

A clean directory of affiliate programs. Free listings, paid feature boosts.

Built on top of the [open-affiliate](https://github.com/) dataset (750+ programs).

## Stack

- Next.js 14 (App Router) + Tailwind CSS
- 750+ programs imported from YAML at build time
- Stripe Checkout for the $50 featured boost (shared keys with FirstUsers)
- Resend for submission/admin notifications

## Local dev

```bash
npm install
cp .env.example .env  # fill in Stripe + Resend keys
npm run build:data    # generate src/data/programs.json from data/programs/*.yaml
npm run dev
```

## Pages

- `/` — homepage
- `/browse` — searchable, filterable directory
- `/p/[slug]` — individual program page
- `/submit` — submission form (free + $50 featured upsell)
- `/pricing` — pricing breakdown
- `/api/submit` — receives form, emails admin, optionally creates Stripe Checkout
- `/api/stripe/webhook` — flips featured flag on payment

## Featured listings

For MVP simplicity, featured slugs live in `src/lib/programs.ts` (`FEATURED_SLUGS`).
On a successful Stripe payment the webhook emails the admin to add the slug.

## Deploy

Push to GitHub, then import in Vercel. Set env vars to match `.env.example`.
