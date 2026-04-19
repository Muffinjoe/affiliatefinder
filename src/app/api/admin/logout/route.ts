import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  clearAdminCookie();
  return NextResponse.redirect(new URL("/admin", new URL(req.url).origin), { status: 303 });
}
