import Link from "next/link";

export const metadata = { title: "Pricing — AffiliateFinder" };

export default function PricingPage({ searchParams }: { searchParams: { slug?: string } }) {
  const slug = searchParams.slug;
  return (
    <div className="container-page max-w-5xl py-12">
      <div className="text-center">
        <span className="pill-accent">Pricing</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Simple, one-time pricing.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500">
          Pay once, get found forever. No subscriptions, no listing renewals.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Plan
          name="Listing"
          price="$20"
          cadence="one-time, listed forever"
          blurb="Everything you need to get discovered."
          features={[
            "Listed in the directory — permanent",
            "Own program page with commission, cookie, network",
            "Searchable + category / commission-type filters",
            "Reviewed and published within 24 hours",
          ]}
          cta={{ href: "/submit", label: "Submit listing — $20" }}
        />
        <Plan
          name="Listing + Featured"
          price="$70"
          cadence="$20 listing + $50 featured (30 days)"
          highlighted
          badge="Most popular"
          blurb="Maximum visibility from day one."
          features={[
            "Everything in Listing",
            "Pinned to top of directory & homepage",
            "Top of its category",
            "Featured badge on your listing",
            "Skip the review queue — goes live instantly",
          ]}
          cta={{ href: `/submit${slug ? `?slug=${slug}` : ""}`, label: "Submit + feature — $70" }}
        />
      </div>

      <div className="mt-4 rounded-lg border border-ink-200 bg-white p-5 text-center text-sm text-ink-600">
        Already listed? Boost any program for just $50/month featured.{" "}
        <a
          href="mailto:joe@primeeight.co.uk?subject=AffiliateFinder featured upgrade"
          className="font-medium text-accent hover:underline"
        >
          Email us →
        </a>
      </div>

      <div className="mt-12 rounded-xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-bold text-ink-900">FAQ</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Faq q="Is the $20 one-time?">
            Yes. Pay once, stay in the directory. No subscription, no annual renewal.
          </Faq>
          <Faq q="How fast does a featured listing go live?">
            Immediately after payment. You'll get a receipt and a link to your live page.
          </Faq>
          <Faq q="What if I want to test first?">
            Every listing is reviewed before publishing — if we reject, you'll get a refund.
            Reach out any time.
          </Faq>
          <Faq q="Can I upgrade to featured later?">
            Yep — email joe@primeeight.co.uk and we'll invoice the $50 boost for your existing listing.
          </Faq>
          <Faq q="Can I claim an existing listing?">
            Submit with the same URL, email us from the domain, and we'll transfer ownership — no re-charge.
          </Faq>
          <Faq q="Do you offer refunds?">
            Full refund if we reject your listing. After approval, all sales final.
          </Faq>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/submit" className="btn-accent h-11 px-6">List your program</Link>
      </div>
    </div>
  );
}

function Plan({
  name,
  price,
  cadence,
  blurb,
  features,
  cta,
  highlighted,
  badge,
}: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: { href: string; label: string };
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div className={`p-6 ${highlighted ? "card-accent" : "card"}`}>
      {badge && <span className="pill-accent mb-2">{badge}</span>}
      <h3 className="text-base font-bold text-ink-900">{name}</h3>
      <p className="mt-0.5 text-xs text-ink-500">{blurb}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-ink-900">{price}</span>
        <span className="ml-1 text-xs text-ink-500">{cadence}</span>
      </div>
      <ul className="mt-4 space-y-1.5 text-xs text-ink-700">
        {features.map((f) => (
          <li key={f} className="flex gap-2"><span className="text-accent">✓</span><span>{f}</span></li>
        ))}
      </ul>
      <Link href={cta.href} className={`mt-5 h-10 ${highlighted ? "btn-accent" : "btn-outline"}`}>
        {cta.label}
      </Link>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-ink-900">{q}</div>
      <p className="mt-1 text-xs text-ink-600">{children}</p>
    </div>
  );
}
