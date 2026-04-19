import Link from "next/link";

export const metadata = { title: "Thanks — AffiliateDeals" };

export default function ThanksPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  return (
    <div className="container-page max-w-xl py-16 text-center">
      {status === "paid" ? (
        <>
          <h1 className="text-3xl font-bold text-ink-900">Payment received 🎉</h1>
          <p className="mt-2 text-sm text-ink-600">
            If you added the featured boost, your listing is live now. Otherwise we'll review
            and publish within 24 hours. Receipt is in your inbox.
          </p>
        </>
      ) : status === "cancel" ? (
        <>
          <h1 className="text-3xl font-bold text-ink-900">Payment cancelled</h1>
          <p className="mt-2 text-sm text-ink-600">
            No charge made. Your submission wasn't saved — pop back to the form any time to try again.
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
