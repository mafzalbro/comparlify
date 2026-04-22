
import { redirect } from 'next/navigation';
import { type Session } from 'next-auth';
import { Role } from '@prisma/client';

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
    { path: '/admin/tools', roles: ['ADMIN'] },
    { path: '/admin/legal', roles: ['ADMIN'] },
    { path: '/admin/platforms', roles: ['ADMIN', 'EDITOR'] },
    { path: '/admin/features', roles: ['ADMIN', 'EDITOR'] },
    { path: '/admin/emails', roles: ['ADMIN'] },
    { path: '/admin/comments', roles: ['ADMIN', 'MODERATOR'] },
    { path: '/admin/contacts', roles: ['ADMIN', 'SUPPORT'] },
    { path: '/admin/users', roles: ['ADMIN'] },
    { path: '/admin/settings', roles: ['ADMIN'] },
    { path: '/admin', roles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'SUPPORT'] }
];

const protectedRoutes = ["/panel", "/admin", "/tools"];

export async function checkAuthorization(session: Session | null, pathname: string) {
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    // 1. Check for authentication on protected routes
    if (isProtectedRoute && !session) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const loginUrl = new URL("/login", baseUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        redirect(loginUrl.pathname + loginUrl.search);
    }

    // If not a protected route, or if user is authenticated but not in admin, allow access
    if (!pathname.startsWith('/admin') || !session) {
        return;
    }
    
    // 2. Handle role-based access for the admin area
    const userRole = session.user.role;

    // Find the most specific matching admin area
    const matchingArea = adminAreas
        .filter(area => pathname.startsWith(area.path))
        .sort((a, b) => b.path.length - a.path.length)[0];

    if (matchingArea) {
        // If a matching area is found, check if the user's role is included
        if (!matchingArea.roles.includes(userRole)) {
            // If not, redirect to the root
            redirect("/");
        }
    } else {
        // If no specific area matches (e.g., /admin/some-unknown-path), deny access for non-admins
        if (userRole !== 'ADMIN') {
            redirect("/");
        }
    }
}
