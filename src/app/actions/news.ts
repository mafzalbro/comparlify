"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ActionState } from "@/types/actions";

const articleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  content: z.string().min(20, "Content must be at least 20 characters long"),
  image: z.string().url("Must be a valid URL"),
  dataAiHint: z.string().optional(),
  published: z.preprocess((val) => val === "on", z.boolean()),
  platformIds: z.string().optional(), // Receive as stringified array or similar from hidden input
});

export async function createNewsArticle(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const validatedFields = articleSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const authorId = session.user.id;
    const { platformIds, ...data } = validatedFields.data;
    const platformIdArray = platformIds ? JSON.parse(platformIds) : [];

    await prisma.newsArticle.create({
      data: {
        ...data,
        authorId,
        platforms: {
          connect: platformIdArray.map((id: string) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      return {
        error: {
          slug: ["This slug is already in use. Please choose a unique one."],
        },
      };
    }
    return { error: "Failed to create article." };
  }
  redirect("/admin/news");
}

export async function updateNewsArticle(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const validatedFields = articleSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const { platformIds, ...data } = validatedFields.data;
    const platformIdArray = platformIds ? JSON.parse(platformIds) : [];

    await prisma.newsArticle.update({
      where: { id },
      data: {
        ...data,
        platforms: {
          set: platformIdArray.map((id: string) => ({ id })),
        },
      },
    });
    revalidatePath("/admin/news");
    revalidatePath(`/news/${validatedFields.data.slug}`);
  } catch (error) {
    return { error: "Failed to update article." };
  }

  redirect("/admin/news");
}

export async function deleteNewsArticle(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Article ID is missing." };
  }
  try {
    await prisma.newsArticle.delete({
      where: { id },
    });
    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { error: null };
  } catch (error) {
    return { error: "Failed to delete article." };
  }
}
