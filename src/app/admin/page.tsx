import { isAdminAuthed } from "@/lib/auth";
import { listAllSubmissions, getFeaturedSlugs } from "@/lib/submissions";
import { AdminPanel } from "./AdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — AffiliateFinder", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: { error?: string } }) {
  if (!isAdminAuthed()) {
    return (
      <div className="container-page max-w-sm py-16">
        <h1 className="text-xl font-bold text-ink-900">Admin</h1>
        <p className="mt-1 text-xs text-ink-500">Enter the moderation password to continue.</p>
        {searchParams.error === "invalid" && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            Wrong password. Try again.
          </div>
        )}
        <form action="/api/admin/login" method="POST" className="mt-4 space-y-3">
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
            className="input"
          />
          <button type="submit" className="btn-accent h-10 w-full">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  const [subs, featured] = await Promise.all([listAllSubmissions(), getFeaturedSlugs()]);

  return <AdminPanel submissions={subs} featuredSlugs={[...featured]} />;
}
