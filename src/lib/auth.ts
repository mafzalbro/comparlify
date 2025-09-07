import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import prisma from './prisma';
import type { Adapter } from 'next-auth/adapters';

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
    async session({ session, user }) {
      if (user.email === 'mafzalbro@gmail.com' && user.role !== 'ADMIN') {
        user.role = 'ADMIN';
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
      }
      session.user.role = user.role;
      session.user.id = user.id;
      return session;
    },
    async signIn({ user }) {
      if (user.email === 'mafzalbro@gmail.com') {
         const dbUser = await prisma.user.findUnique({
           where: { email: user.email },
         });
         if (dbUser) {
           if (dbUser.role !== 'ADMIN') {
             await prisma.user.update({
               where: { id: dbUser.id },
               data: { role: 'ADMIN' },
             });
           }
           user.role = 'ADMIN';
         }
      }
      return true;
    },
  },
  events: {
    async createUser(message) {
      if (message.user.email === 'mafzalbro@gmail.com') {
        await prisma.user.update({
          where: { id: message.user.id },
          data: { role: 'ADMIN' },
        });
      }
    },
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error', // Optional: Custom error page
  },
});
