
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const comparisonSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  summary: z.string().min(10),
  platformAId: z.string(),
  platformBId: z.string(),
  introduction: z.string().min(20),
  conclusion: z.string().min(20),
  published: z.preprocess((val) => val === "on", z.boolean()),
}).refine(data => data.platformAId !== data.platformBId, {
    message: "Platform A and Platform B cannot be the same.",
    path: ["platformBId"],
});

function parseDynamicArray(formData: FormData, arrayName: string) {
    const keys = Array.from(formData.keys());
    
    const items: Record<string, Record<string, any>> = {};

    const regex = new RegExp(`^${arrayName}\\[(\\d+)\\]\\[(.*?)\\]$`);

    for (const key of keys) {
        const match = key.match(regex);
        if (match) {
            const [, index, field] = match;
            if (!items[index]) {
                items[index] = {};
            }
            items[index][field] = formData.get(key);
        }
    }
    return Object.values(items).filter(item => {
      // Filter out empty items before processing
      return Object.values(item).some(value => value !== '');
    });
}

export async function createComparison(prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = comparisonSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const factsData = parseDynamicArray(formData, 'facts').map(fact => ({
      title: fact.title as string,
      platformAValue: fact.platformAValue as string,
      platformBValue: fact.platformBValue as string,
  }));

  const faqsData = parseDynamicArray(formData, 'faqs').map(faq => ({
      question: faq.question as string,
      answer: faq.answer as string,
  }));

  try {
    await prisma.comparison.create({ 
        data: {
            ...validatedFields.data,
            facts: {
                create: factsData
            },
            faqs: {
                create: faqsData
            }
        }
    });
    revalidatePath('/admin/comparisons');
    revalidatePath('/compare');
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create comparison.' };
  }

  redirect('/admin/comparisons');
}

export async function updateComparison(id: string, prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }
  
  const data = Object.fromEntries(formData.entries());
  const validatedFields = comparisonSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  const factsData = parseDynamicArray(formData, 'facts');
  const faqsData = parseDynamicArray(formData, 'faqs');
  
  try {
    await prisma.$transaction(async (tx) => {
        await tx.comparison.update({
            where: { id },
            data: {
                ...validatedFields.data,
                facts: { deleteMany: {} }, // Clear existing facts
                faqs: { deleteMany: {} }, // Clear existing FAQs
            },
        });
        
        if (factsData.length > 0) {
            await tx.fact.createMany({
                data: factsData.map(fact => ({
                    ...fact,
                    comparisonId: id,
                })) as any,
            });
        }
        
        if (faqsData.length > 0) {
             await tx.faq.createMany({
                data: faqsData.map(faq => ({
                    ...faq,
                    comparisonId: id,
                })) as any,
            });
        }
    });
    
    revalidatePath('/admin/comparisons');
    revalidatePath(`/compare/${validatedFields.data.slug}`);
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update comparison.' };
  }

  redirect('/admin/comparisons');
}

export async function deleteComparison(prevState: { error: string | null }, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Comparison ID is missing." };
  }
  try {
    await prisma.comparison.delete({ where: { id } });
    revalidatePath('/admin/comparisons');
    revalidatePath('/compare');
    return { error: null };
  } catch (error)
  {
    console.error(error);
    return { error: 'Failed to delete comparison.' };
  }
}
