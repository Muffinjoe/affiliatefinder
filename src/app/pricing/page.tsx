import Link from "next/link";

export const metadata = { title: "Pricing — AffiliateFinder" };

export default function PricingPage({ searchParams }: { searchParams: { slug?: string } }) {
  const slug = searchParams.slug;
  return (
    <div className="container-page max-w-5xl py-12">
      <div className="text-center">
        <span className="pill-accent">Pricing</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Free for affiliates. Pay to stand out.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500">
          Listing is free for every affiliate program. Pay for visibility when you want it.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Plan
          name="Free listing"
          price="$0"
          cadence="forever"
          blurb="Everything you need to get discovered."
          features={[
            "Listed in the full directory",
            "Own program page with commission, cookie, network",
            "Search + category filters",
            "Quick review (24h)",
          ]}
          cta={{ href: "/submit", label: "Add your program" }}
        />
        <Plan
          name="Featured boost"
          price="$50"
          cadence="one-time, 30 days"
          highlighted
          badge="Most popular"
          blurb="Pinned across the site for a month."
          features={[
            "Pinned to top of directory",
            "Highlighted on homepage",
            "Top of its category",
            "Skip the review queue (goes live instantly)",
            "Featured badge on your listing",
          ]}
          cta={{ href: `/submit${slug ? `?slug=${slug}` : ""}`, label: "Get featured for $50" }}
        />
        <Plan
          name="Boosted placement"
          price="Custom"
          cadence="talk to us"
          blurb="Longer commitments & sponsor slots."
          features={[
            "3-month or annual featured",
            "Homepage sponsor slot",
            "Newsletter inclusion",
            "Custom placement in category pages",
          ]}
          cta={{ href: "mailto:joe@primeeight.co.uk?subject=AffiliateFinder sponsor enquiry", label: "Contact us" }}
        />
      </div>

      <div className="mt-12 rounded-xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-bold text-ink-900">FAQ</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Faq q="Is the free listing really free?">
            Yes. Every affiliate program can list for free, forever. We make money on upgrades.
          </Faq>
          <Faq q="How fast does a featured listing go live?">
            Immediately after payment. You'll get a receipt by email and a link to your live page.
          </Faq>
          <Faq q="How do you verify programs?">
            We check the signup URL, confirm the program is live, and review commission claims.
            Verified programs get a ✓ badge.
          </Faq>
          <Faq q="Can I claim an existing listing?">
            Yes — submit with the same URL and email us from the domain. We'll transfer ownership.
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
    <div className={`card p-6 ${highlighted ? "border-accent-500 ring-1 ring-accent-500/20 shadow-sm" : ""}`}>
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
