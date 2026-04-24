"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ActionState } from "@/types/actions";

const comparisonSchema = z
  .object({
    title: z.string().min(3),
    slug: z.string().min(3),
    summary: z.string().min(10),
    categoryId: z.string().min(1, "A category must be selected"),
    platformAId: z.string(),
    platformBId: z.string(),
    introduction: z.string().min(20),
    content: z.string().optional(),
    conclusion: z.string().min(20),
    published: z.preprocess((val) => val === "on", z.boolean()),
  })
  .refine((data) => data.platformAId !== data.platformBId, {
    message: "Platform A and Platform B cannot be the same.",
    path: ["platformBId"],
  });

function parseDynamicArray(formData: FormData, arrayName: string) {
  const keys = Array.from(formData.keys());

  const items: Record<string, Record<string, string | null>> = {};

  const regex = new RegExp(`^${arrayName}\\[(\\d+)\\]\\[(.*?)\\]$`);

  for (const key of keys) {
    const match = key.match(regex);
    if (match) {
      const [, index, field] = match;
      if (!items[index]) {
        items[index] = {};
      }
      items[index][field] = formData.get(key) as string | null;
    }
  }
  return Object.values(items).filter((item) => {
    // Filter out empty items before processing
    return Object.values(item).some((value) => value !== "");
  });
}

export async function createComparison(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = comparisonSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const factsData = parseDynamicArray(formData, "facts").map((fact) => ({
    title: fact.title as string,
    platformAValue: fact.platformAValue as string,
    platformBValue: fact.platformBValue as string,
  }));

  const faqsData = parseDynamicArray(formData, "faqs").map((faq) => ({
    question: faq.question as string,
    answer: faq.answer as string,
  }));

  try {
    await prisma.comparison.create({
      data: {
        ...validatedFields.data,
        facts: {
          create: factsData,
        },
        faqs: {
          create: faqsData,
        },
      },
    });
    revalidatePath("/admin/comparisons");
    revalidatePath("/compare");
  } catch (error) {
    console.error(error);
    return { error: "Failed to create comparison." };
  }

  redirect("/admin/comparisons");
}

export async function updateComparison(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = comparisonSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const factsData = parseDynamicArray(formData, "facts");
  const faqsData = parseDynamicArray(formData, "faqs");

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.comparison.update({
        where: { id },
        data: {
          ...validatedFields.data,
          facts: { deleteMany: {} }, // Clear existing facts
          faqs: { deleteMany: {} }, // Clear existing FAQs
        },
      });

      await tx.fact.createMany({
        data: factsData.map((fact) => ({
          title: fact.title as string,
          platformAValue: fact.platformAValue as string,
          platformBValue: fact.platformBValue as string,
          comparisonId: id,
        })),
      });

      if (faqsData.length > 0) {
        await tx.faq.createMany({
          data: faqsData.map((faq) => ({
            question: faq.question as string,
            answer: faq.answer as string,
            comparisonId: id,
          })),
        });
      }
    });

    revalidatePath("/admin/comparisons");
    revalidatePath(`/compare/${validatedFields.data.slug}`);
  } catch (error) {
    console.error(error);
    return { error: "Failed to update comparison." };
  }

  redirect("/admin/comparisons");
}

export async function deleteComparison(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Comparison ID is missing." };
  }
  try {
    await prisma.comparison.delete({ where: { id } });
    revalidatePath("/admin/comparisons");
    revalidatePath("/compare");
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete comparison." };
  }
}
