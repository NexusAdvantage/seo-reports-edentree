import { NextResponse } from "next/server";
import { COOKIE, tokenFor } from "./lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/login")) return NextResponse.next();
  const pw = process.env.REPORT_PASSWORD;
  const ok = pw && req.cookies.get(COOKIE)?.value === (await tokenFor(pw));
  if (ok) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
