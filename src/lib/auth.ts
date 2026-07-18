import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import { Role } from "@prisma/client";
import { createNotification } from "./notifications";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub || profile.id,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: "USER" as Role,
          onboarded: false,
          newsletter: false,
          suspended: false,
        };
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: `${profile.id}`,
          email: profile.email,
          name: profile.name,
          image: profile.avatar_url,
          role: "USER" as Role,
          onboarded: false,
          newsletter: false,
          suspended: false,
        };
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== "development") return null;

        if (credentials?.userId) {
          const user = await prisma.user.findUnique({
            where: { id: credentials.userId as string },
          });
          if (user) {
            if (user.suspended) {
              throw new Error("This account is currently suspended.");
            }
            return user;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (dbUser?.suspended) {
        return false; 
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "USER";
        token.onboarded = (user as any).onboarded ?? false;
        token.newsletter = (user as any).newsletter ?? false;
        token.suspended = (user as any).suspended ?? false;
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboarded: true, role: true, newsletter: true, suspended: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.onboarded = dbUser.onboarded;
          token.newsletter = dbUser.newsletter;
          token.suspended = dbUser.suspended;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
         session.user.id = token.id as string;
         session.user.role = token.role as Role;
         session.user.onboarded = token.onboarded as boolean;
         session.user.newsletter = token.newsletter as boolean;
         session.user.suspended = token.suspended as boolean;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: user.email === "comparlify@gmail.com" ? "ADMIN" : "USER",
          },
        });
      }
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: "NEW_USER_REGISTERED",
          message: `New user signed up: ${user.name || user.email}`,
          link: `/admin/users`,
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};

export const { handlers, auth, signIn: nextAuthSignIn, signOut: nextAuthSignOut } = NextAuth(authOptions);

// Re-export GET/POST handlers for route.ts compatibility
export const { GET, POST } = handlers;

// Client-side helper re-exports
export { signIn, signOut } from "next-auth/react";
