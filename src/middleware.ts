
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const protectedRoutes = ['/admin', '/profile', '/panel'];
const adminRoutes = ['/admin'];

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAdminRoute && session.user?.role !== 'ADMIN') {
    // Redirect non-admins from admin routes
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/panel/:path*'],
};
