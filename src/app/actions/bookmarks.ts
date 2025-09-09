
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const bookmarkSchema = z
  .object({
    postId: z.string().optional(),
    comparisonId: z.string().optional(),
    path: z.string(),
  })
  .refine((data) => data.postId || data.comparisonId, {
    message: "Either postId or comparisonId must be provided.",
  });

export async function toggleBookmarkAction(
  input: z.infer<typeof bookmarkSchema>
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be logged in to bookmark content." };
  }

  const { postId, comparisonId, path } = input;
  const { id: userId } = session.user;

  const whereClause = {
    userId,
    postId: postId || null,
    comparisonId: comparisonId || null,
  };

  // Prisma needs a unique identifier for findUnique, so we construct one.
  // The schema has @@unique([userId, postId, comparisonId])
  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId_comparisonId: whereClause,
    },
  });

  try {
    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      revalidatePath(path);
      revalidatePath("/panel");
      return { success: true, bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          postId: postId,
          comparisonId: comparisonId,
        },
      });
      revalidatePath(path);
      revalidatePath("/panel");
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}

const isBookmarkedSchema = z
  .object({
    postId: z.string().optional(),
    comparisonId: z.string().optional(),
  })
  .refine((data) => data.postId || data.comparisonId, {
    message: "Either postId or comparisonId must be provided.",
  });

export async function isBookmarkedAction(
  input: z.infer<typeof isBookmarkedSchema>
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) {
    return false;
  }

  const { postId, comparisonId } = input;
  const { id: userId } = session.user;

  const whereClause = {
    userId,
    postId: postId || null,
    comparisonId: comparisonId || null,
  };

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId_comparisonId: whereClause
    },
  });

  return !!bookmark;
}
