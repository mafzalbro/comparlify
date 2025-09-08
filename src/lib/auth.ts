import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import prisma from "./prisma";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { User as DbUser } from "@prisma/client";
import { NextResponse } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ['/admin', '/profile', '/panel'];
      const adminRoutes = ['/admin'];
      const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
      const isAdminRoute = adminRoutes.some((route) => nextUrl.pathname.startsWith(route));

      if (isProtectedRoute) {
        if (isLoggedIn) {
          if (isAdminRoute && auth.user.role !== 'ADMIN') {
            // Redirect non-admins trying to access admin routes
            return NextResponse.redirect(new URL('/', nextUrl));
          }
          // Allow logged-in users to access protected routes
          return true;
        }
        // Redirect unauthenticated users to login page
        return false; 
      }
      
      return true;
    },
    async session({
      session,
      user,
    }: {
      session: any;
      user: AdapterUser | DbUser;
    }) {
      if (user.email === "mafzalbro@gmail.com" && user.role !== "ADMIN") {
        user.role = "ADMIN";
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
      session.user.role = user.role;
      session.user.id = user.id;
      session.user.onboarded = user.onboarded;
      return session;
    },
    async signIn({ user }) {
      if (user.email === "mafzalbro@gmail.com") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          if (dbUser.role !== "ADMIN") {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: "ADMIN" },
            });
          }
        }
      }
      return true;
    },
  },
  events: {
    async createUser(message) {
      if (message.user.email === "mafzalbro@gmail.com") {
        await prisma.user.update({
          where: { id: message.user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
});
