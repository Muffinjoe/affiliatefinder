import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
export const resend = key ? new Resend(key) : null;

export async function notifyAdmin(subject: string, html: string) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM ?? "AffiliateFinder <noreply@affiliatefinder.co>";
  if (!resend || !to) {
    console.warn("[email] skipped — missing RESEND_API_KEY or ADMIN_NOTIFY_EMAIL");
    return;
  }
  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}
