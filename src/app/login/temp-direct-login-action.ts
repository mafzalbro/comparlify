
'use server';

import prisma from '@/lib/prisma';

export async function directLoginAction() {
  const email = 'mafzalbro@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (user) {
    return { userId: user.id };
  }
  return { userId: null };
}
