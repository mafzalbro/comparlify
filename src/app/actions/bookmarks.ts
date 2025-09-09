
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const bookmarkSchema = z.object({
    contentId: z.string(),
    contentType: z.enum(["POST", "COMPARISON"]),
    path: z.string(),
});

export async function toggleBookmarkAction(input: z.infer<typeof bookmarkSchema>) {
    const session = await auth();
    if (!session?.user) {
        return { error: "You must be logged in to bookmark content." };
    }

    const { contentId, contentType, path } = input;
    const { id: userId } = session.user;

    const existingBookmark = await prisma.bookmark.findUnique({
        where: {
            userId_contentType_contentId: {
                userId,
                contentType,
                contentId,
            }
        }
    });

    try {
        if (existingBookmark) {
            await prisma.bookmark.delete({
                where: { id: existingBookmark.id }
            });
            revalidatePath(path);
            revalidatePath('/panel');
            return { success: true, bookmarked: false };
        } else {
            await prisma.bookmark.create({
                data: {
                    userId,
                    contentType,
                    contentId,
                }
            });
            revalidatePath(path);
            revalidatePath('/panel');
            return { success: true, bookmarked: true };
        }
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong. Please try again." };
    }
}


const isBookmarkedSchema = z.object({
    contentId: z.string(),
    contentType: z.enum(["POST", "COMPARISON"]),
});

export async function isBookmarkedAction(input: z.infer<typeof isBookmarkedSchema>): Promise<boolean> {
    const session = await auth();
    if (!session?.user) {
        return false;
    }

    const { contentId, contentType } = input;
    const { id: userId } = session.user;

    const bookmark = await prisma.bookmark.count({
        where: {
            userId,
            contentType,
            contentId,
        }
    });

    return bookmark > 0;
}
