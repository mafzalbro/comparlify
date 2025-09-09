
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const platformSchema = z.object({
    name: z.string().min(2),
    website: z.string().url(),
    logoUrl: z.string().url(),
    description: z.string().min(10),
    rating: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
    easeOfUse: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
    featuresRating: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
    support: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
});

type PlatformActionState = {
    error: {
        name?: string[];
        website?: string[];
        logoUrl?: string[];
        description?: string[];
        rating?: string[];
        easeOfUse?: string[];
        featuresRating?: string[];
        support?: string[];
    } | string | null;
}


export async function createPlatform(prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const validatedFields = platformSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    await prisma.platform.create({
      data: validatedFields.data,
    });
    revalidatePath('/admin/platforms');
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create platform.' };
  }
  
  redirect('/admin/platforms');
}


export async function updatePlatform(id: string, prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const formDataObj = Object.fromEntries(formData.entries());
  
  const validatedFields = platformSchema.safeParse(formDataObj);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const featuresUpdateData = Object.entries(formDataObj)
    .filter(([key]) => key.startsWith('features['))
    .reduce((acc, [key, value]) => {
      const match = key.match(/features\[(.*?)\]\.(.*)/);
      if (match) {
        const [, featureId, field] = match;
        if (!acc[featureId]) {
          acc[featureId] = {};
        }
        acc[featureId][field] = value;
      }
      return acc;
    }, {} as Record<string, any>);


  try {
    await prisma.$transaction(async (tx) => {
      await tx.platform.update({
        where: { id },
        data: validatedFields.data,
      });

      for (const featureId in featuresUpdateData) {
        const featureData = featuresUpdateData[featureId];
        await tx.platformFeature.upsert({
          where: { platformId_featureId: { platformId: id, featureId } },
          create: {
            platformId: id,
            featureId,
            hasFeature: featureData.hasFeature === 'on',
            details: featureData.details || null,
          },
          update: {
            hasFeature: featureData.hasFeature === 'on',
            details: featureData.details || null,
          },
        });
      }
    });

    revalidatePath('/admin/platforms');
    revalidatePath(`/admin/platforms/edit/${id}`);
    revalidatePath('/compare');
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update platform.' };
  }

  redirect('/admin/platforms');
}


export async function deletePlatform(prevState: { error: string | null }, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }
  
  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Platform ID is missing." };
  }
  try {
    await prisma.platform.delete({ where: { id } });
    revalidatePath('/admin/platforms');
    revalidatePath('/compare');
    return { error: null };
  } catch (error)
  {
    console.error(error);
    return { error: 'Failed to delete platform.' };
  }
}
