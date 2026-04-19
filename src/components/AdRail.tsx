import Link from "next/link";
import Image from "next/image";
import { listActiveAds, type Ad } from "@/lib/ads";

const SLOTS_PER_RAIL = 4;

export async function AdRail({ side }: { side: "left" | "right" }) {
  const ads = await listActiveAds();
  // Stable split: left rail gets even-indexed ads, right rail gets odd-indexed.
  const slice = ads.filter((_, i) => (side === "left" ? i % 2 === 0 : i % 2 === 1)).slice(0, SLOTS_PER_RAIL);
  const fillers = Array.from({ length: Math.max(0, SLOTS_PER_RAIL - slice.length) });
  // The last slot on the right rail is always the "Advertise here" CTA.
  const showCTA = side === "right";

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 flex flex-col gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          Sponsored
        </div>
        {slice.map((ad) => <AdCard key={ad.id} ad={ad} />)}
        {fillers.slice(0, fillers.length - (showCTA ? 1 : 0)).map((_, i) => (
          <PlaceholderCard key={`f${i}`} />
        ))}
        {showCTA && <AdvertiseCTA />}
      </div>
    </aside>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="card group block overflow-hidden p-3 transition-colors hover:border-accent-500"
    >
      {ad.imageUrl && (
        <div className="-mx-3 -mt-3 mb-2 aspect-[3/2] overflow-hidden bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="text-sm font-semibold text-ink-900 group-hover:text-accent-600">
        {ad.headline}
      </div>
      <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-ink-500">{ad.body}</p>
    </a>
  );
}

function PlaceholderCard() {
  return (
    <div className="card flex h-32 items-center justify-center p-3 text-[11px] text-ink-300">
      Available
    </div>
  );
}

function AdvertiseCTA() {
  return (
    <Link
      href="/advertise"
      className="card-accent group flex flex-col items-start justify-center p-3 text-left transition-transform hover:-translate-y-0.5"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
        Advertise here →
      </span>
      <span className="mt-1 text-sm font-bold text-ink-900">
        Reach thousands of affiliates
      </span>
      <span className="mt-1 text-[11px] text-ink-600">
        $100 / 30 days. Image, headline, and link.
      </span>
    </Link>
  );
}
