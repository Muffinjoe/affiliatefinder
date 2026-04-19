import Link from "next/link";

export const metadata = { title: "Pricing — AffiliateDeals" };

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
          Pay once, get found forever. Featured boosts and ads are flat-fee — no subscriptions.
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
          price="from $70"
          cadence="$20 listing + featured boost"
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
          cta={{ href: `/submit${slug ? `?slug=${slug}` : ""}`, label: "Submit + feature" }}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-center text-lg font-bold text-ink-900">Featured boost — pick a duration</h2>
        <p className="text-center text-xs text-ink-500">Discounts for 2- and 3-month plans.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TierCard months={1} price={50} per="$50/mo" save={null} />
          <TierCard months={2} price={89} per="$44.50/mo" save="Save $11" highlight />
          <TierCard months={3} price={119} per="$39.67/mo" save="Save $31" />
        </div>
      </div>

      <div className="mt-10 card-accent p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Sidebar advertising</div>
            <h2 className="mt-1 text-lg font-bold text-ink-900">Sponsor card on home + browse</h2>
            <p className="mt-1 text-sm text-ink-600">
              Image, headline, body, and a click-through link in the sidebar — anywhere your audience looks.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-ink-900">$100</div>
            <div className="text-[11px] text-ink-500">30 days · flat</div>
          </div>
        </div>
        <Link href="/advertise" className="btn-accent mt-4 h-10 px-5">
          Buy a sidebar ad
        </Link>
      </div>

      <div className="mt-12 rounded-xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-bold text-ink-900">FAQ</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Faq q="Is the $20 one-time?">
            Yes. Pay once, stay in the directory. No subscription, no annual renewal.
          </Faq>
          <Faq q="Do featured listings auto-renew?">
            No. They run for the months you bought, then drop back to a regular listing. Buy more any time.
          </Faq>
          <Faq q="How fast does a featured listing go live?">
            Immediately after payment. Receipt and live link sent by email.
          </Faq>
          <Faq q="What about sidebar ads?">
            Quick manual review (under 4 hours), then runs for 30 days. Full refund if rejected.
          </Faq>
          <Faq q="Can I claim an existing listing?">
            Submit with the same URL, email us from the domain, and we'll transfer ownership — no re-charge.
          </Faq>
          <Faq q="Refunds?">
            Full refund if we reject your listing or ad. After approval, all sales final.
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

function TierCard({
  months,
  price,
  per,
  save,
  highlight,
}: {
  months: number;
  price: number;
  per: string;
  save: string | null;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? "ring-1 ring-accent/20" : ""}`}>
      <div className="text-sm font-semibold text-ink-900">{months} month{months > 1 ? "s" : ""}</div>
      <div className="mt-2 text-3xl font-bold text-ink-900">${price}</div>
      <div className="text-xs text-ink-500">{per}</div>
      {save && <div className="mt-1 text-xs font-semibold text-accent">{save}</div>}
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
