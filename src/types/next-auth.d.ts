
import { type DefaultSession } from 'next-auth';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: Role;
      /** The user's onboarding status. */
      onboarded: boolean;
      /** The user's newsletter subscription status. */
      newsletter: boolean;
      /** The user's suspension status */
      suspended: boolean;
      /**
       * By default, TypeScript merges new interface properties.
       * Ref: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
       */
    } & DefaultSession['user'];
  }

  interface User {
      role: Role;
      onboarded: boolean;
      newsletter: boolean;
      suspended: boolean;
  }
}

declare module '@auth/core/jwt' {
    interface JWT {
        role: Role;
        onboarded: boolean;
        newsletter: boolean;
        suspended: boolean;
    }
}
