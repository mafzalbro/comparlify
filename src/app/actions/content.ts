
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface UpdateContentState {
  error: string | null;
  success: boolean;
}

export async function updateContentAction(
  prevState: UpdateContentState,
  formData: FormData
): Promise<UpdateContentState> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized', success: false };
  }

  const updates = Array.from(formData.entries());

  try {
    await prisma.$transaction(
      updates.map(([key, value]) =>
        prisma.siteContent.update({
          where: { key },
          data: { value: value as string },
        })
      )
    );

    revalidatePath('/', 'layout'); // Revalidate all pages
    return { error: null, success: true };
  } catch (error) {
    console.error('Failed to update site content:', error);
    return { error: 'Failed to update content.', success: false };
  }
}
