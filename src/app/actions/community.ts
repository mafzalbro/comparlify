
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import type { ForumPostStatus, ForumTopicStatus } from "@prisma/client";

const createTopicSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters long.").max(150),
    content: z.string().min(20, "Content must be at least 20 characters long.").max(10000),
    categoryId: z.string(),
});

export async function createTopicAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to create a topic." };
    }

    const validatedFields = createTopicSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }
    
    const { title, content, categoryId } = validatedFields.data;

    try {
        const category = await prisma.forumCategory.findUnique({ where: { id: categoryId }});
        if (!category) return { error: "Category not found." };
        
        await prisma.forumTopic.create({
            data: {
                title,
                content,
                categoryId,
                authorId: session.user.id,
                status: 'PENDING'
            }
        });

        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                type: 'NEW_FORUM_CONTENT',
                message: `New topic "${title}" is awaiting approval.`,
                link: '/admin/community'
            });
        }

        revalidatePath(`/community/category/${category.slug}`);
        return { success: true, message: "Your topic has been submitted for review." };

    } catch (e) {
        console.error(e);
        return { error: "Failed to create topic." };
    }
}


const createPostSchema = z.object({
    content: z.string().min(1, "Reply cannot be empty.").max(10000),
    topicId: z.string(),
});


export async function createPostAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to reply." };
    }

    const validatedFields = createPostSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: "Invalid data provided." };
    }

    const { content, topicId } = validatedFields.data;

    try {
        const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } });
        if (!topic) return { error: "Topic not found." };

        await prisma.forumPost.create({
            data: {
                content,
                topicId,
                authorId: session.user.id,
                status: 'PENDING'
            }
        });

        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                type: 'NEW_FORUM_CONTENT',
                message: `New reply in "${topic.title}" is awaiting approval.`,
                link: '/admin/community'
            });
        }
        
        revalidatePath(`/community/topic/${topicId}`);
        return { success: true, message: "Your reply has been submitted for review." };

    } catch(e) {
        console.error(e);
        return { error: "Failed to post reply." };
    }
}


export async function updateCommunityItemStatus(
    itemId: string,
    itemType: 'TOPIC' | 'POST',
    status: ForumTopicStatus | ForumPostStatus
) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }

    try {
        if (itemType === 'TOPIC') {
            const topic = await prisma.forumTopic.update({
                where: { id: itemId },
                data: { status: status as ForumTopicStatus },
                include: { category: true }
            });
            revalidatePath(`/admin/community`);
            revalidatePath(`/community/category/${topic.category.slug}`);
            revalidatePath(`/community/topic/${topic.id}`);
        } else { // POST
            const post = await prisma.forumPost.update({
                where: { id: itemId },
                data: { status: status as ForumPostStatus },
                include: { topic: true }
            });
            revalidatePath(`/admin/community`);
            revalidatePath(`/community/topic/${post.topic.id}`);
        }
    } catch (e) {
        console.error(e);
        throw new Error(`Failed to update ${itemType.toLowerCase()} status.`);
    }
}


export async function deleteCommunityItemAction(itemId: string, itemType: 'TOPIC' | 'POST') {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  try {
    if (itemType === 'TOPIC') {
      const topic = await prisma.forumTopic.findUnique({
        where: { id: itemId },
        include: { category: true }
      });
      if (!topic) return { error: 'Topic not found.' };

      await prisma.forumTopic.delete({ where: { id: itemId } });
      revalidatePath(`/admin/community`);
      revalidatePath(`/community/category/${topic.category.slug}`);
    } else { // POST
      const post = await prisma.forumPost.findUnique({
        where: { id: itemId },
        include: { topic: true }
      });
      if (!post) return { error: 'Post not found.' };

      await prisma.forumPost.delete({ where: { id: itemId } });
      revalidatePath(`/admin/community`);
      revalidatePath(`/community/topic/${post.topic.id}`);
    }
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: `Failed to delete ${itemType.toLowerCase()}.` };
  }
}
