import { NextResponse } from "next/server";
import { COOKIE, tokenFor } from "../../../lib/auth";

export async function POST(req) {
  const form = await req.formData();
  const pw = String(form.get("password") || "");
  const real = process.env.REPORT_PASSWORD;
  const base = new URL(req.url);
  if (!real || pw !== real) {
    return NextResponse.redirect(new URL("/login?error=1", base), 303);
  }
  const res = NextResponse.redirect(new URL("/", base), 303);
  res.cookies.set(COOKIE, await tokenFor(real), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 });
  return res;
}
