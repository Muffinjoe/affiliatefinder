"use client";

import { useState, FormEvent } from "react";

export function AdvertiseForm() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      headline: fd.get("headline"),
      body: fd.get("body"),
      url: fd.get("url"),
      imageUrl: fd.get("imageUrl") || null,
      contact_email: fd.get("contact_email"),
    };
    try {
      const res = await fetch("/api/advertise", {
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
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px]">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Headline *</label>
          <input
            name="headline"
            required
            maxLength={50}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="input"
            placeholder="One-line hook"
          />
          <p className="mt-1 text-[11px] text-ink-400">{headline.length}/50 — keep it punchy</p>
        </div>
        <div>
          <label className="label">Short body *</label>
          <textarea
            name="body"
            required
            maxLength={140}
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input"
            placeholder="What's the offer? Who's it for?"
          />
          <p className="mt-1 text-[11px] text-ink-400">{body.length}/140</p>
        </div>
        <div>
          <label className="label">Click-through URL *</label>
          <input
            name="url"
            required
            type="url"
            className="input"
            placeholder="https://yoursite.com/landing"
          />
        </div>
        <div>
          <label className="label">Image URL <span className="text-ink-400">(optional, recommended)</span></label>
          <input
            name="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="input"
            placeholder="https://… 600×400 jpg or png"
          />
          <p className="mt-1 text-[11px] text-ink-400">
            Host your own image. Best size: 600×400. We'll crop to 3:2.
          </p>
        </div>
        <div>
          <label className="label">Your email *</label>
          <input
            name="contact_email"
            required
            type="email"
            className="input"
            placeholder="you@company.com"
          />
        </div>

        {error && <div className="text-xs text-rose-600">{error}</div>}

        <button type="submit" disabled={state === "loading"} className="btn-accent h-11 w-full">
          {state === "loading" ? "Redirecting to checkout…" : "Continue to payment — $100"}
        </button>
      </form>

      {/* Live preview */}
      <div>
        <div className="label">Preview</div>
        <div className="card overflow-hidden p-3">
          {imageUrl ? (
            <div className="-mx-3 -mt-3 mb-2 aspect-[3/2] overflow-hidden bg-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-full w-full object-cover" onError={(e) => ((e.currentTarget.style.display = "none"))} />
            </div>
          ) : (
            <div className="-mx-3 -mt-3 mb-2 flex aspect-[3/2] items-center justify-center bg-ink-100 text-[10px] text-ink-400">
              image preview
            </div>
          )}
          <div className="text-sm font-semibold text-ink-900">
            {headline || "Your headline"}
          </div>
          <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-ink-500">
            {body || "Your short body copy goes here."}
          </p>
        </div>
        <p className="mt-2 text-[10px] text-ink-400">
          Shown in the sidebar on home + browse pages.
        </p>
      </div>
    </div>
  );
}
