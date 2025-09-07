import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'USER' | 'ADMIN';
      onboarded: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'USER' | 'ADMIN';
    onboarded: boolean;
  }
}
