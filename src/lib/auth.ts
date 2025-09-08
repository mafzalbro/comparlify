// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import prisma from "./prisma";
import { Role } from "@prisma/client";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // ✅ edge-safe
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Runs at login
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        token.id = dbUser?.id;
        token.role = dbUser?.role ?? "USER";
        token.onboarded = dbUser?.onboarded ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email === "mafzalbro@gmail.com" && user.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
      return true;
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
    },
  },
  pages: {
    signIn: "/login",
  },
});
