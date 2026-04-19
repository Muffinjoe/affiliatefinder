import { cookies } from "next/headers";

const ADMIN_COOKIE = "af_admin";

export function isAdminAuthed(): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const got = cookies().get(ADMIN_COOKIE)?.value;
  return got === expected;
}

export function setAdminCookie(password: string) {
  cookies().set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAdminCookie() {
  cookies().delete(ADMIN_COOKIE);
}
