import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const password = form?.get("password");
  const expected = process.env.ADMIN_PASSWORD;
  const origin = new URL(req.url).origin;

  if (!expected || typeof password !== "string" || password !== expected) {
    return NextResponse.redirect(new URL("/admin?error=invalid", origin), { status: 303 });
  }
  setAdminCookie(password);
  return NextResponse.redirect(new URL("/admin", origin), { status: 303 });
}
