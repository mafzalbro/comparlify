// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import { Role } from "@prisma/client";
import { createNotification } from "./notifications";
import { Adapter } from "next-auth/adapters";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" }, // ✅ edge-safe
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: "USER",
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
          role: "USER",
          onboarded: false,
          newsletter: false,
          suspended: false,
        };
      },
    }),
    Credentials({
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
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });
      if (dbUser?.suspended) {
        return false; // Reject sign-in if user is suspended
      }
      return true;
    },
    async jwt({ token }) {
      const user = token.email
        ? await prisma.user.findUnique({ where: { email: token.email } })
        : null;

      // On initial sign-in, add the user ID and other details to the token
      if (user) {
        if (user.suspended) {
          throw new Error("User is suspended");
        }
        token.id = user.id;
        token.role = user.role ?? "USER";
        token.image = user.image ?? "";
        token.onboarded = user.onboarded ?? false;
        token.newsletter = user.newsletter ?? false;
        token.suspended = user.suspended ?? false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.image = token.image as string;
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
            image: user.image,
          },
        });
      }
      // Notify all admins about the new user
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
    error: "/auth/error", // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (Optional) Used for E-mail providers
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
});
