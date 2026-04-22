// lib/auth.ts
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import { Role } from "@prisma/client";
import { createNotification } from "./notifications";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
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
            return user as any;
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "USER";
        token.onboarded = (user as any).onboarded ?? false;
        token.newsletter = (user as any).newsletter ?? false;
        token.suspended = (user as any).suspended ?? false;
      } 
      
      if (trigger === "update" && session) {
        if (session.onboarded !== undefined) token.onboarded = session.onboarded;
        if (session.role !== undefined) token.role = session.role;
        if (session.name !== undefined) token.name = session.name;
        if (session.image !== undefined) token.image = session.image;
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

// V4 to V5 Shim for App Router compatibility
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export const handlers = { GET: handler, POST: handler };

/**
 * Helper to get the session from server components.
 * Equivalent to v5's 'auth()' function.
 */
export async function auth() {
  return await getServerSession(authOptions);
}

// Re-export signOut/signIn if needed, though they usually come from next-auth/react on client
export { signIn, signOut } from "next-auth/react";
