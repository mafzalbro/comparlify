
'use server';

import { signIn } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function directLoginAction() {
  const email = 'mafzalbro@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // This server-side action prepares the sign-in, but the client will finalize it.
    // The component will call the client-side signIn with this user's ID.
    return { userId: user.id };
  }
  return { userId: null };
}
