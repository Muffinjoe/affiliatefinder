import { AdvertiseForm } from "./AdvertiseForm";

export const metadata = { title: "Advertise — AffiliateFinder" };

export default function AdvertisePage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <div className="text-center">
        <span className="pill-accent">Sidebar advertising</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
          Get in front of thousands of affiliates.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Your ad runs in the sidebar of the homepage and the directory for{" "}
          <span className="font-semibold text-ink-900">30 days</span>. Image, headline, and link
          included. <span className="font-semibold text-accent">$100 flat.</span>
        </p>
      </div>
      <div className="card-accent mt-6 p-6">
        <AdvertiseForm />
      </div>
      <p className="mt-4 text-center text-xs text-ink-500">
        Ads go to a quick manual review (under 4 hours). If we reject, you'll get a full refund.
      </p>
    </div>
  );
}
