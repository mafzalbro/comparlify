
// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import { Role } from "@prisma/client";
import { createNotification } from "./notifications";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // ✅ edge-safe
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
        name: "Direct Login",
        credentials: {
          userId: { label: "User ID", type: "text" },
        },
        async authorize(credentials) {
            if (process.env.NODE_ENV === 'development' && credentials.userId === 'direct-login') {
                const adminUser = await prisma.user.findUnique({
                    where: { email: 'mafzalbro@gmail.com' }
                });
                if (adminUser) {
                  if (adminUser.suspended) {
                      throw new Error("This account is currently suspended.");
                  }
                  return adminUser;
                }
            }
            return null;
        }
    })
  ],
  callbacks: {
    async signIn({ user }) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
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
        token.onboarded = user.onboarded ?? false;
        token.newsletter = user.newsletter ?? false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.onboarded = token.onboarded as boolean;
        session.user.newsletter = token.newsletter as boolean;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email === "mafzalbro@gmail.com") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
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
