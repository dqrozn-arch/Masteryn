import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register", "/admin/login", "/api/admin/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"));
  if (isPublic) return NextResponse.next();

  // Admin rotaları için admin token kontrolü
  if (pathname.startsWith("/admin")) {
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!adminToken) return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Dashboard + Mesajlar için kullanıcı token kontrolü
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/messages")) {
    const userToken = req.cookies.get("session_token")?.value;
    if (!userToken) return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
