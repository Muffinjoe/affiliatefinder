"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Submission } from "@/lib/submissions";
import type { Ad } from "@/lib/ads";

type Tab = "pending" | "approved" | "rejected" | "featured" | "ads";

export function AdminPanel({
  submissions,
  featuredSlugs,
  ads,
}: {
  submissions: Submission[];
  featuredSlugs: string[];
  ads: Ad[];
}) {
  const router = useRouter();
  const [pendingTransition, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [feature, setFeature] = useState<Set<string>>(new Set(featuredSlugs));
  const [newFeatureSlug, setNewFeatureSlug] = useState("");

  const byStatus = useMemo(
    () => ({
      pending: submissions.filter((s) => s.status === "pending"),
      approved: submissions.filter((s) => s.status === "approved"),
      rejected: submissions.filter((s) => s.status === "rejected"),
    }),
    [submissions]
  );

  const adsByStatus = useMemo(
    () => ({
      pending: ads.filter((a) => a.status === "pending"),
      active: ads.filter((a) => a.status === "active"),
      rejected: ads.filter((a) => a.status === "rejected"),
    }),
    [ads]
  );

  async function moderate(payload: any) {
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Failed: ${data.error ?? res.statusText}`);
    }
  }

  async function onAction(id: string, action: "approve" | "reject" | "delete") {
    if (action === "delete" && !confirm("Delete this submission permanently?")) return;
    setBusyId(id);
    await moderate({ action, id });
    setBusyId(null);
    startTransition(() => router.refresh());
  }

  async function onFeatureToggle(slug: string, on: boolean) {
    setFeature((prev) => {
      const next = new Set(prev);
      if (on) next.add(slug);
      else next.delete(slug);
      return next;
    });
    await moderate({ action: "feature", slug, on });
    startTransition(() => router.refresh());
  }

  async function onAdAction(id: string, action: "ad-approve" | "ad-reject" | "ad-delete") {
    if (action === "ad-delete" && !confirm("Delete this ad permanently?")) return;
    setBusyId(id);
    await moderate({ action, id });
    setBusyId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Admin</h1>
          <p className="text-xs text-ink-500">
            Pending {byStatus.pending.length} · Approved {byStatus.approved.length} · Rejected {byStatus.rejected.length} · Featured {feature.size} · Ads {ads.length}
          </p>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="btn-ghost h-9">Sign out</button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-1 border-b border-ink-200">
        {(["pending", "approved", "rejected", "featured", "ads"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            {t}{" "}
            <span className="text-ink-400">
              (
              {t === "featured"
                ? feature.size
                : t === "ads"
                  ? ads.length
                  : byStatus[t as Exclude<Tab, "featured" | "ads">].length}
              )
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "pending" && (
          <SubmissionsList items={byStatus.pending} busyId={busyId} pendingTransition={pendingTransition} onAction={onAction} featureSet={feature} onFeatureToggle={onFeatureToggle} emptyLabel="No pending submissions right now." />
        )}
        {tab === "approved" && (
          <SubmissionsList items={byStatus.approved} busyId={busyId} pendingTransition={pendingTransition} onAction={onAction} featureSet={feature} onFeatureToggle={onFeatureToggle} emptyLabel="No approved user submissions yet." />
        )}
        {tab === "rejected" && (
          <SubmissionsList items={byStatus.rejected} busyId={busyId} pendingTransition={pendingTransition} onAction={onAction} featureSet={feature} onFeatureToggle={onFeatureToggle} emptyLabel="Nothing rejected." />
        )}
        {tab === "featured" && (
          <div className="space-y-3">
            <div className="card p-4">
              <div className="text-sm font-semibold text-ink-900">Feature any program by slug</div>
              <p className="mt-0.5 text-xs text-ink-500">Indefinite (admin grant). Paid features expire automatically.</p>
              <div className="mt-3 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="slug"
                  value={newFeatureSlug}
                  onChange={(e) => setNewFeatureSlug(e.target.value.trim().toLowerCase())}
                />
                <button
                  className="btn-accent h-9"
                  disabled={!newFeatureSlug}
                  onClick={async () => {
                    await onFeatureToggle(newFeatureSlug, true);
                    setNewFeatureSlug("");
                  }}
                >
                  Add featured
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {[...feature].sort().map((slug) => (
                <div key={slug} className="card flex items-center justify-between p-3">
                  <Link href={`/p/${slug}`} className="text-sm font-semibold text-ink-900 hover:text-accent">
                    {slug}
                  </Link>
                  <button className="btn-outline h-8 text-xs" onClick={() => onFeatureToggle(slug, false)}>
                    Unfeature
                  </button>
                </div>
              ))}
              {feature.size === 0 && <div className="card p-6 text-center text-xs text-ink-400">No featured programs.</div>}
            </div>
          </div>
        )}
        {tab === "ads" && (
          <AdsList
            items={ads}
            adsByStatus={adsByStatus}
            busyId={busyId}
            pendingTransition={pendingTransition}
            onAdAction={onAdAction}
          />
        )}
      </div>
    </div>
  );
}

function SubmissionsList({
  items,
  busyId,
  pendingTransition,
  onAction,
  featureSet,
  onFeatureToggle,
  emptyLabel,
}: {
  items: Submission[];
  busyId: string | null;
  pendingTransition: boolean;
  onAction: (id: string, action: "approve" | "reject" | "delete") => void;
  featureSet: Set<string>;
  onFeatureToggle: (slug: string, on: boolean) => void;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <div className="card p-6 text-center text-xs text-ink-400">{emptyLabel}</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <div key={s.id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/p/${s.slug}`} className="text-sm font-semibold text-ink-900 hover:text-accent">{s.name}</Link>
                <span className="pill">{s.category}</span>
                {s.commission_type && <span className="pill">{s.commission_type}</span>}
                {s.paidFeatured && <span className="pill-accent">Paid · Featured</span>}
                {s.status === "approved" && featureSet.has(s.slug) && !s.paidFeatured && <span className="pill-accent">Featured</span>}
              </div>
              <p className="mt-1 text-xs text-ink-500">{s.short_description}</p>
              <div className="mt-1 text-[11px] text-ink-400">
                <span>{s.contact_email}</span> · <a href={s.url} target="_blank" rel="noreferrer" className="underline">website</a> · <a href={s.signup_url} target="_blank" rel="noreferrer" className="underline">signup</a> · {new Date(s.createdAt).toLocaleString()}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-[11px] text-ink-500">Details</summary>
                <div className="mt-2 rounded-md bg-ink-50 p-3 text-[11px] text-ink-700">
                  <p><strong>Commission:</strong> {s.commission}</p>
                  {s.cookie_days && <p><strong>Cookie:</strong> {s.cookie_days} days</p>}
                  {s.network && <p><strong>Network:</strong> {s.network}</p>}
                  {s.tags?.length ? <p><strong>Tags:</strong> {s.tags.join(", ")}</p> : null}
                  <p className="mt-2 whitespace-pre-wrap">{s.description}</p>
                </div>
              </details>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.status === "pending" && (
                <>
                  <button className="btn-accent h-9 text-xs" disabled={busyId === s.id || pendingTransition} onClick={() => onAction(s.id, "approve")}>Approve</button>
                  <button className="btn-outline h-9 text-xs" disabled={busyId === s.id || pendingTransition} onClick={() => onAction(s.id, "reject")}>Reject</button>
                </>
              )}
              {s.status === "approved" && (
                <>
                  <button className="btn-outline h-9 text-xs" onClick={() => onFeatureToggle(s.slug, !featureSet.has(s.slug))}>{featureSet.has(s.slug) ? "Unfeature" : "Feature"}</button>
                  <button className="btn-ghost h-9 text-xs" onClick={() => onAction(s.id, "reject")}>Unpublish</button>
                </>
              )}
              {s.status === "rejected" && (
                <button className="btn-outline h-9 text-xs" onClick={() => onAction(s.id, "approve")}>Re-approve</button>
              )}
              <button className="btn-ghost h-9 text-xs text-rose-700" onClick={() => onAction(s.id, "delete")}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdsList({
  items,
  adsByStatus,
  busyId,
  pendingTransition,
  onAdAction,
}: {
  items: Ad[];
  adsByStatus: { pending: Ad[]; active: Ad[]; rejected: Ad[] };
  busyId: string | null;
  pendingTransition: boolean;
  onAdAction: (id: string, action: "ad-approve" | "ad-reject" | "ad-delete") => void;
}) {
  if (items.length === 0) {
    return <div className="card p-6 text-center text-xs text-ink-400">No ads yet.</div>;
  }
  const groups: { label: string; ads: Ad[] }[] = [
    { label: `Pending payment / approval (${adsByStatus.pending.length})`, ads: adsByStatus.pending },
    { label: `Active (${adsByStatus.active.length})`, ads: adsByStatus.active },
    { label: `Rejected (${adsByStatus.rejected.length})`, ads: adsByStatus.rejected },
  ];
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">{g.label}</h3>
          {g.ads.length === 0 ? (
            <div className="card p-4 text-center text-xs text-ink-400">none</div>
          ) : (
            <div className="space-y-2">
              {g.ads.map((ad) => (
                <div key={ad.id} className="card flex flex-wrap items-start gap-3 p-3">
                  {ad.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={ad.imageUrl} alt="" className="h-16 w-24 flex-shrink-0 rounded object-cover" />
                  ) : (
                    <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded bg-ink-100 text-[10px] text-ink-400">no image</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink-900">{ad.headline}</span>
                      <span className="pill">{ad.status}</span>
                      {ad.paid && <span className="pill-accent">Paid</span>}
                    </div>
                    <p className="mt-1 text-xs text-ink-600">{ad.body}</p>
                    <div className="mt-1 text-[11px] text-ink-400">
                      <a href={ad.url} target="_blank" rel="noreferrer" className="underline">{ad.url}</a>
                      {" · "}{ad.contact_email}{" · "}submitted {new Date(ad.createdAt).toLocaleString()}
                      {ad.untilISO && ` · expires ${new Date(ad.untilISO).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ad.status !== "active" && (
                      <button className="btn-accent h-9 text-xs" disabled={busyId === ad.id || pendingTransition} onClick={() => onAdAction(ad.id, "ad-approve")}>
                        {ad.paid ? "Reactivate" : "Approve & activate"}
                      </button>
                    )}
                    {ad.status !== "rejected" && (
                      <button className="btn-outline h-9 text-xs" disabled={busyId === ad.id || pendingTransition} onClick={() => onAdAction(ad.id, "ad-reject")}>Reject</button>
                    )}
                    <button className="btn-ghost h-9 text-xs text-rose-700" disabled={busyId === ad.id || pendingTransition} onClick={() => onAdAction(ad.id, "ad-delete")}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
