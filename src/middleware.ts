
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";

type AdminArea = {
    path: string;
    roles: Role[];
};

const adminAreas: AdminArea[] = [
    { path: '/admin/content', roles: ['ADMIN', 'EDITOR'] },
    { path: '/admin/blog', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
    { path: '/admin/comparisons', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
    { path: '/admin/news', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
    { path: '/admin/community', roles: ['ADMIN', 'EDITOR', 'MODERATOR'] },
    { path: '/admin/media', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
    { path: '/admin/legal', roles: ['ADMIN'] },
    { path: '/admin/platforms', roles: ['ADMIN', 'EDITOR'] },
    { path: '/admin/features', roles: ['ADMIN', 'EDITOR'] },
    { path: '/admin/emails', roles: ['ADMIN'] },
    { path: '/admin/comments', roles: ['ADMIN', 'MODERATOR'] },
    { path: '/admin/contacts', roles: ['ADMIN', 'SUPPORT'] },
    { path: '/admin/users', roles: ['ADMIN'] },
    { path: '/admin/settings', roles: ['ADMIN'] },
    // The main admin dashboard is often admin-only for stats, 
    // but can be opened up if needed.
    { path: '/admin', roles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'SUPPORT'] } 
];

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/panel", "/admin", "/tools"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle role-based access for the admin area
  if (pathname.startsWith("/admin") && token) {
      const userRole = token.role as Role;

      // Find the most specific matching admin area
      const matchingArea = adminAreas
          .filter(area => pathname.startsWith(area.path))
          .sort((a, b) => b.path.length - a.path.length)[0];

      if (matchingArea) {
          // If a matching area is found, check if the user's role is included
          if (!matchingArea.roles.includes(userRole)) {
              // If not, redirect to the root (or a specific "access denied" page)
              return NextResponse.redirect(new URL("/", req.url));
          }
      } else {
           // If no specific area matches (e.g., /admin/some-unknown-path), deny access for non-admins
           if (userRole !== 'ADMIN') {
                return NextResponse.redirect(new URL("/", req.url));
           }
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/panel/:path*",
    "/tools/:path*",
  ],
};
