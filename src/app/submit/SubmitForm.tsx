"use client";

import { useState, FormEvent } from "react";
import { CATEGORIES, COMMISSION_TYPES } from "@/lib/programs";

const TIERS = [
  { months: 0, price: 0, label: "No featured", per: "", save: "" },
  { months: 1, price: 50, label: "1 month", per: "$50/mo", save: "" },
  { months: 3, price: 119, label: "3 months", per: "$39.67/mo", save: "Save $31" },
] as const;

export function SubmitForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [featuredMonths, setFeaturedMonths] = useState<0 | 1 | 3>(0);

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
      commission_type: fd.get("commission_type"),
      cookie_days: fd.get("cookie_days"),
      network: fd.get("network"),
      short_description: fd.get("short_description"),
      description: fd.get("description"),
      tags: String(fd.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      contact_email: fd.get("contact_email"),
      featuredMonths,
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

  const tier = TIERS.find((t) => t.months === featuredMonths)!;
  const total = 20 + tier.price;

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
          <label className="label">Type *</label>
          <select name="commission_type" required defaultValue="recurring" className="input">
            {COMMISSION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Cookie window (days)</label>
          <input name="cookie_days" type="number" min={0} max={365} className="input" placeholder="60" />
        </div>
        <div>
          <label className="label">Network <span className="text-ink-400">(optional)</span></label>
          <input name="network" className="input" placeholder="in-house, PartnerStack, Impact, CJ, Awin…" />
        </div>
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
      </div>

      <div className="rounded-lg border border-ink-200 bg-ink-50 p-4 text-xs text-ink-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-ink-900">Base listing</div>
            <div className="text-ink-500">One-time, listed forever, approved within 24h.</div>
          </div>
          <div className="text-lg font-bold text-ink-900">$20</div>
        </div>
      </div>

      <div className={`rounded-lg border p-5 transition-colors ${featuredMonths > 0 ? "border-accent bg-accent-50" : "border-ink-200 bg-gradient-to-br from-emerald-50 to-white"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">Featured boost — pick a duration</div>
            <h3 className="mt-0.5 text-base font-bold text-ink-900">Pin your program to the top</h3>
            <p className="mt-1 text-xs text-ink-600">Homepage feature + category-top placement. Auto-approved, goes live instantly.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {TIERS.map((t) => {
            const active = t.months === featuredMonths;
            return (
              <button
                key={t.months}
                type="button"
                onClick={() => setFeaturedMonths(t.months as 0 | 1 | 3)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  active ? "border-accent bg-white shadow-sm ring-1 ring-accent/20" : "border-ink-200 bg-white hover:border-ink-400"
                }`}
              >
                <div className="text-xs font-semibold text-ink-900">{t.label}</div>
                <div className="mt-1 text-lg font-bold text-ink-900">
                  {t.price === 0 ? "—" : `$${t.price}`}
                </div>
                {t.per && <div className="text-[10px] text-ink-500">{t.per}</div>}
                {t.save && <div className="text-[10px] font-semibold text-accent">{t.save}</div>}
              </button>
            );
          })}
        </div>
        {featuredMonths > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-ink-700">
            <li className="flex gap-2"><span className="text-accent">✓</span> Pinned to top of directory + homepage for {featuredMonths} month{featuredMonths > 1 ? "s" : ""}</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Top of its category</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Auto-approved, goes live instantly</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Featured badge on your listing</li>
          </ul>
        )}
      </div>

      {error && <div className="text-xs text-rose-600">{error}</div>}

      <button type="submit" disabled={state === "loading"} className="btn-accent h-11 w-full">
        {state === "loading" ? "Redirecting to checkout…" : `Continue to payment — $${total}`}
      </button>
      <p className="text-center text-[11px] text-ink-400">
        Secure checkout via Stripe. You'll be redirected to pay before your submission goes through.
      </p>
    </form>
  );
}
