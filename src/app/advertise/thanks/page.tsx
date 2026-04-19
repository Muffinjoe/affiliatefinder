import Link from "next/link";

export const metadata = { title: "Thanks — AffiliateFinder" };

export default function AdThanksPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  return (
    <div className="container-page max-w-xl py-16 text-center">
      {status === "paid" ? (
        <>
          <h1 className="text-3xl font-bold text-ink-900">Payment received 🎉</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your ad goes through a quick review (under 4 hours) and then runs for 30 days.
            Receipt is in your inbox.
          </p>
        </>
      ) : status === "cancel" ? (
        <>
          <h1 className="text-3xl font-bold text-ink-900">Payment cancelled</h1>
          <p className="mt-2 text-sm text-ink-600">No charge made. Pop back to the form to try again.</p>
        </>
      ) : (
        <h1 className="text-3xl font-bold text-ink-900">Thanks!</h1>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="btn-accent">Back home</Link>
      </div>
    </div>
  );
}
