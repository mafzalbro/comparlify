import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const config = {
  matcher: ['/admin/:path*'],
};

export async function middleware(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    const loginUrl = new URL('/login', req.url);
    // Optionally, you can add a 'from' query parameter to redirect back after login
    // loginUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
