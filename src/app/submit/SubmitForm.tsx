"use client";

import { useState, FormEvent } from "react";
import { CATEGORIES } from "@/lib/programs";

export function SubmitForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [wantsFeatured, setWantsFeatured] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      url: fd.get("url"),
      signup_url: fd.get("signup_url"),
      category: fd.get("category"),
      commission: fd.get("commission"),
      cookie_days: fd.get("cookie_days"),
      network: fd.get("network"),
      short_description: fd.get("short_description"),
      description: fd.get("description"),
      tags: String(fd.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      contact_email: fd.get("contact_email"),
      wantsFeatured,
    };
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <div className="font-semibold">Submitted — thanks.</div>
        <p className="mt-1">
          We'll review and publish within 24 hours. You'll hear back at the email you provided.
          Want to skip the queue?{" "}
          <a href="/pricing" className="underline">
            Boost it to the top for $50
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Program name *</label>
          <input name="name" required maxLength={80} className="input" placeholder="Acme" />
        </div>
        <div>
          <label className="label">Category *</label>
          <select name="category" required defaultValue="SaaS" className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Website URL *</label>
          <input name="url" required type="url" className="input" placeholder="https://acme.com" />
        </div>
        <div>
          <label className="label">Affiliate signup URL *</label>
          <input name="signup_url" required type="url" className="input" placeholder="https://acme.com/partners" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label">Commission *</label>
          <input name="commission" required className="input" placeholder="30% recurring, 20% one-time, $100 flat…" />
        </div>
        <div>
          <label className="label">Cookie (days)</label>
          <input name="cookie_days" type="number" min={0} max={365} className="input" placeholder="60" />
        </div>
      </div>

      <div>
        <label className="label">Network <span className="text-ink-400">(optional)</span></label>
        <input name="network" className="input" placeholder="in-house, PartnerStack, Impact, CJ, Awin, Rewardful…" />
      </div>

      <div>
        <label className="label">Short description *</label>
        <input name="short_description" required maxLength={140} className="input" placeholder="What your product does, in one line." />
      </div>

      <div>
        <label className="label">Full description *</label>
        <textarea name="description" required rows={5} maxLength={2000} className="input" placeholder="Who's it for? What do they get? Any perks that matter for affiliates?" />
      </div>

      <div>
        <label className="label">Tags (comma separated)</label>
        <input name="tags" className="input" placeholder="saas, marketing, analytics" />
      </div>

      <div>
        <label className="label">Your email *</label>
        <input name="contact_email" required type="email" className="input" placeholder="you@acme.com" />
        <p className="mt-1 text-[11px] text-ink-500">Used for listing confirmations and payout questions only.</p>
      </div>

      <div className={`rounded-lg border p-5 transition-colors ${wantsFeatured ? "border-accent bg-accent-50" : "border-ink-200 bg-gradient-to-br from-emerald-50 to-white"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">Featured boost</div>
            <h3 className="mt-0.5 text-base font-bold text-ink-900">Pin your program to the top</h3>
            <p className="mt-1 text-xs text-ink-600">Homepage feature + category-top placement for 30 days.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-ink-900">$50<span className="ml-1 text-xs font-medium text-ink-500">one-time</span></div>
            <div className="text-[10px] text-ink-400">Promo pricing</div>
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-ink-700">
          <li className="flex gap-2"><span className="text-accent">✓</span> Pinned to the top of the directory</li>
          <li className="flex gap-2"><span className="text-accent">✓</span> Highlighted on the homepage</li>
          <li className="flex gap-2"><span className="text-accent">✓</span> Skip the review queue — goes live instantly</li>
        </ul>
        <label className={`mt-4 flex cursor-pointer items-center gap-3 rounded-md border bg-white px-4 py-3 transition-colors ${wantsFeatured ? "border-accent" : "border-ink-200 hover:border-ink-400"}`}>
          <input
            type="checkbox"
            checked={wantsFeatured}
            onChange={(e) => setWantsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-accent focus:ring-accent"
          />
          <span className="flex-1 text-sm font-semibold text-ink-900">Feature my program for $50</span>
          {wantsFeatured && <span className="text-[11px] font-medium text-accent">Selected</span>}
        </label>
        {wantsFeatured && <p className="mt-2 text-[11px] text-ink-500">You'll be redirected to Stripe Checkout after submitting.</p>}
      </div>

      {error && <div className="text-xs text-rose-600">{error}</div>}

      <button type="submit" disabled={state === "loading"} className="btn-accent h-11 w-full">
        {state === "loading" ? "Submitting…" : wantsFeatured ? "Submit & pay $50" : "Submit for review"}
      </button>
    </form>
  );
}
