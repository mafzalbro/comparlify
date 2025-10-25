
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/panel", "/admin", "/tools"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Handle protected routes for unauthenticated users
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle role-based access for admin
  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/panel/:path*",
    "/tools/:path*",
    "/compare/:path*",
    "/blog/:path*",
    "/news/:path*",
    "/community/:path*",
  ],
};
