
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Post } from "@prisma/client";
import { cache } from "react";

export const getPostPreview = cache(async (slug: string): Promise<Post | null> => {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return null;
    }
    return prisma.post.findUnique({
        where: { slug },
    });
});

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(191, "Description must be 191 characters or less."),
  content: z.string().min(20, "Content must be at least 20 characters long"),
  image: z.string().url("Must be a valid URL"),
  dataAiHint: z.string().optional(),
  published: z.preprocess((val) => val === "on", z.boolean()),
});

export async function createPost(prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }
  
  const validatedFields = postSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const authorId = session.user.id;

    await prisma.post.create({
      data: {
        ...validatedFields.data,
        authorId,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (error) {
    console.error(error);
    if (error instanceof prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2000') {
            const field = (error.meta?.target as string[])?.pop();
            return { error: `The provided value for the '${field}' field is too long.` };
        }
    }
    return { error: "Failed to create post." };
  }
  redirect("/admin/blog");
}

export async function updatePost(id: string, prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const validatedFields = postSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.post.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath("/admin/blog");
    revalidatePath(`/blog/${validatedFields.data.slug}`);
  } catch (error) {
    console.error(error);
    if (error instanceof prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2000') {
            const field = (error.meta?.target as string[])?.pop();
            return { error: `The provided value for the '${field}' field is too long.` };
        }
    }
    return { error: "Failed to update post." };
  }

  redirect("/admin/blog");
}

export async function deletePost(prevState: { error: string | null }, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Post ID is missing." };
  }
  try {
    await prisma.post.delete({
      where: { id },
    });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { error: null }
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete post." };
  }
}
