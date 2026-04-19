import { SubmitForm } from "./SubmitForm";

export const metadata = { title: "Add a program — AffiliateFinder" };

export default function SubmitPage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-2xl font-bold text-ink-900">List your affiliate program</h1>
      <p className="mt-1 text-sm text-ink-600">
        Free listing. Submissions go to quick review and appear in the directory within 24 hours.
        Want instant visibility? Pick the <span className="font-medium text-accent">$50 featured boost</span> below.
      </p>
      <div className="card mt-6 p-6">
        <SubmitForm />
      </div>
    </div>
  );
}
