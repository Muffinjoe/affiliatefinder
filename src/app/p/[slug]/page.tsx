import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_PROGRAMS, getProgramBySlug, isFeatured, formatCommission, filterPrograms } from "@/lib/programs";
import { ProgramCard, Logo } from "@/components/ProgramCard";

type Params = { slug: string };

export function generateStaticParams() {
  return ALL_PROGRAMS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Params }) {
  const p = getProgramBySlug(params.slug);
  if (!p) return { title: "Not found — AffiliateFinder" };
  return {
    title: `${p.name} affiliate program — AffiliateFinder`,
    description: p.short_description || p.description.slice(0, 160),
  };
}

export default function ProgramPage({ params }: { params: Params }) {
  const p = getProgramBySlug(params.slug);
  if (!p) notFound();

  const related = filterPrograms(ALL_PROGRAMS, { category: p.category, sort: "featured" })
    .filter((x) => x.slug !== p.slug)
    .slice(0, 4);

  const featured = isFeatured(p);
  const signup = p.signup_url || p.url;

  return (
    <div className="container-page py-8">
      <nav className="mb-4 text-xs text-ink-500">
        <Link href="/browse" className="hover:text-ink-800">Browse</Link>
        <span className="mx-1.5 text-ink-300">/</span>
        <Link href={`/browse?category=${encodeURIComponent(p.category)}`} className="hover:text-ink-800">
          {p.category}
        </Link>
        <span className="mx-1.5 text-ink-300">/</span>
        <span className="text-ink-700">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className={`card p-6 ${featured ? "border-accent-500 ring-1 ring-accent-500/10" : ""}`}>
            <div className="flex items-start gap-4">
              <Logo program={p} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-ink-900">{p.name}</h1>
                  {featured && <span className="pill-accent">Featured</span>}
                  {p.verified && <span className="pill">✓ Verified</span>}
                </div>
                <p className="mt-1 text-sm text-ink-600">{p.short_description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="pill">{p.category}</span>
                  {p.network && <span className="pill">via {p.network}</span>}
                  {(p.tags ?? []).slice(0, 4).map((t) => (
                    <span key={t} className="pill">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={signup}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-accent h-10 px-5"
              >
                Join program →
              </a>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline h-10 px-5"
              >
                Visit website
              </a>
            </div>
          </div>

          <section className="card mt-4 p-6">
            <h2 className="text-sm font-semibold text-ink-900">About</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{p.description}</p>
          </section>

          {p.agents?.use_cases && p.agents.use_cases.length > 0 && (
            <section className="card mt-4 p-6">
              <h2 className="text-sm font-semibold text-ink-900">Best for</h2>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {p.agents.use_cases.map((u, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Similar programs in {p.category}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {related.map((r) => <ProgramCard key={r.slug} program={r} />)}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Commission</h3>
            <div className="mt-1 text-lg font-bold text-ink-900">
              {formatCommission(p.commission)}
            </div>
            {p.commission.conditions && (
              <p className="mt-1 text-xs text-ink-500">{p.commission.conditions}</p>
            )}
            <dl className="mt-4 space-y-2 text-xs">
              <Row label="Cookie" value={p.cookie_days ? `${p.cookie_days} days` : null} />
              <Row label="Attribution" value={p.attribution} />
              <Row label="Tracking" value={p.tracking_method} />
              <Row label="Network" value={p.network} />
              <Row label="Approval" value={p.approval} />
              <Row label="Approval time" value={p.approval_time} />
              <Row label="Dedicated manager" value={p.dedicated_manager ? "Yes" : null} />
              <Row label="Marketing materials" value={p.marketing_materials ? "Provided" : null} />
              <Row label="Kind" value={p.kind} />
            </dl>
          </div>

          {p.payout && (p.payout.minimum || p.payout.frequency || (p.payout.methods && p.payout.methods.length)) && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Payout</h3>
              <dl className="mt-2 space-y-2 text-xs">
                <Row
                  label="Minimum"
                  value={p.payout.minimum ? `${p.payout.minimum} ${p.payout.currency ?? ""}`.trim() : null}
                />
                <Row label="Frequency" value={p.payout.frequency} />
                <Row
                  label="Methods"
                  value={p.payout.methods && p.payout.methods.length ? p.payout.methods.join(", ") : null}
                />
              </dl>
            </div>
          )}

          {p.restrictions && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Restrictions</h3>
              <p className="mt-1 text-xs text-ink-600">{p.restrictions}</p>
            </div>
          )}

          <div className="card bg-gradient-to-br from-accent-50 to-white p-5">
            <h3 className="text-sm font-bold text-ink-900">Run this program?</h3>
            <p className="mt-1 text-xs text-ink-600">
              Claim your listing and get featured at the top for 30 days — $50.
            </p>
            <Link href={`/pricing?slug=${p.slug}`} className="btn-accent mt-3 h-9">
              Feature this program
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right text-ink-800">{value}</dd>
    </div>
  );
}
