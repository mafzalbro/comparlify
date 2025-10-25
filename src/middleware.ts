
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getContent } from "./lib/content";

const isModuleDisabled = async (moduleName: string, content: Record<string, string>) => {
  const key = `module.${moduleName}.enabled`;
  return content[key] === 'false';
};

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;
  const content = await getContent();

  const protectedRoutes = ["/panel", "/admin"];
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

  // Check for disabled public modules, but allow admins to access them
  if (token?.role !== "ADMIN") {
    if (pathname.startsWith('/blog') && await isModuleDisabled('blog', content)) {
      return new NextResponse(null, { status: 404 });
    }
    if (pathname.startsWith('/compare') && await isModuleDisabled('compare', content)) {
      return new NextResponse(null, { status: 404 });
    }
    if (pathname.startsWith('/news') && await isModuleDisabled('news', content)) {
      return new NextResponse(null, { status: 404 });
    }
    if (pathname.startsWith('/community') && await isModuleDisabled('community', content)) {
      return new NextResponse(null, { status: 404 });
    }
    // Tools page requires login, so it's handled by the isProtectedRoute check
  }

  // Specific check for /tools, as it's a protected route that can also be disabled
  // Admins can still access it even if disabled
  if (pathname.startsWith('/tools') && await isModuleDisabled('tools', content) && token?.role !== 'ADMIN') {
    return new NextResponse(null, { status: 404 });
  }
  
  if (pathname.startsWith('/tools') && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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

    