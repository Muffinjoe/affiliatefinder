import Link from "next/link";

export const metadata = { title: "Thanks — AffiliateFinder" };

export default function ThanksPage({ searchParams }: { searchParams: { featured?: string } }) {
  const state = searchParams.featured;
  return (
    <div className="container-page max-w-xl py-16 text-center">
      {state === "success" ? (
        <>
          <h1 className="text-3xl font-bold text-ink-900">Payment received 🎉</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your listing will go live as a featured program within 1 hour.
            We've emailed you a receipt.
          </p>
        </>
      ) : state === "cancel" ? (
        <>
          <h1 className="text-3xl font-bold text-ink-900">No payment taken</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your free listing is still submitted and queued for review. You can
            upgrade any time from the pricing page.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-ink-900">Thanks — we got it.</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your listing is in the review queue. We usually publish within 24 hours.
          </p>
        </>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/browse" className="btn-outline">Browse directory</Link>
        <Link href="/" className="btn-accent">Back home</Link>
      </div>
    </div>
  );
}
