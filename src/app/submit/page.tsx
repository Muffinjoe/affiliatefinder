import { SubmitForm } from "./SubmitForm";

export const metadata = { title: "Add a program — AffiliateFinder" };

export default function SubmitPage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-2xl font-bold text-ink-900">List your affiliate program</h1>
      <p className="mt-1 text-sm text-ink-600">
        $29 gets you a permanent directory listing, reviewed within 24 hours.
        Add <span className="font-medium text-accent">$50</span> for 30-day featured placement
        — pinned to homepage, top of category, auto-approved.
      </p>
      <div className="card mt-6 p-6">
        <SubmitForm />
      </div>
    </div>
  );
}
