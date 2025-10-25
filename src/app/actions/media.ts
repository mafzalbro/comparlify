
'use server';

import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { promises as fs } from 'fs';
import { join } from 'path';
import { revalidatePath } from "next/cache";

// --- Update Image Details Action ---
const updateImageSchema = z.object({
  id: z.string(),
  altText: z.string().optional(),
  filename: z.string().min(1, "Filename cannot be empty."),
});

export async function updateImageDetailsAction(input: z.infer<typeof updateImageSchema>) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: "Not authorized" };
  }
  
  const validatedFields = updateImageSchema.safeParse(input);
  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }
  
  const { id, altText, filename } = validatedFields.data;
  
  try {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return { error: 'Image not found.' };
    }
    
    // Handle file renaming if filename has changed
    if (filename !== image.filename) {
      const oldPath = join(process.cwd(), 'public', 'uploads', image.filename);
      const newPath = join(process.cwd(), 'public', 'uploads', filename);

      try {
        await fs.rename(oldPath, newPath);
      } catch (e) {
        console.error("File rename error:", e);
        return { error: "Failed to rename file on the server." };
      }
    }

    const updatedImage = await prisma.image.update({
      where: { id },
      data: {
        altText,
        filename,
        url: `/uploads/${filename}`, // Update URL in case of rename
      },
    });

    revalidatePath('/admin/media');
    return { success: true, updatedImage };

  } catch (error) {
    console.error("Update image error:", error);
    return { error: "Failed to update image details." };
  }
}

// --- Delete Image Action ---
const deleteImageSchema = z.object({
  id: z.string(),
  filename: z.string(),
});

export async function deleteImageAction(input: z.infer<typeof deleteImageSchema>) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: "Not authorized" };
  }
  
  const validatedFields = deleteImageSchema.safeParse(input);
  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }
  
  const { id, filename } = validatedFields.data;
  
  try {
    const imagePath = join(process.cwd(), 'public', 'uploads', filename);
    
    // First, delete the file from the filesystem
    try {
      await fs.unlink(imagePath);
    } catch (e: any) {
        // If file not found, we can still proceed to delete the DB record
        if (e.code !== 'ENOENT') {
            throw e;
        }
        console.warn(`File not found for deletion, but proceeding: ${imagePath}`);
    }
    
    // Then, delete the record from the database
    await prisma.image.delete({
      where: { id },
    });
    
    revalidatePath('/admin/media');
    return { success: true };

  } catch (error) {
    console.error("Delete image error:", error);
    return { error: "Failed to delete image." };
  }
}

export type ImageUsage = {
  type: 'Blog Post' | 'News Article' | 'Platform Logo';
  title: string;
  url: string;
}

export async function getImageUsage(imageUrl: string): Promise<ImageUsage[]> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return [];
  }

  const usages: ImageUsage[] = [];

  const posts = await prisma.post.findMany({
    where: { image: imageUrl },
    select: { id: true, title: true }
  });
  for (const post of posts) {
    usages.push({ type: 'Blog Post', title: post.title, url: `/admin/blog/edit/${post.id}` });
  }

  const newsArticles = await prisma.newsArticle.findMany({
    where: { image: imageUrl },
    select: { id: true, title: true }
  });
  for (const article of newsArticles) {
    usages.push({ type: 'News Article', title: article.title, url: `/admin/news/edit/${article.id}` });
  }

  const platforms = await prisma.platform.findMany({
    where: { logoUrl: imageUrl },
    select: { id: true, name: true }
  });
  for (const platform of platforms) {
    usages.push({ type: 'Platform Logo', title: platform.name, url: `/admin/platforms/edit/${platform.id}` });
  }

  return usages;
}
