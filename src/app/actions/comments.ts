
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { CommentStatus } from "@prisma/client";
import { cache } from "react";
import { createNotification } from "@/lib/notifications";


const addCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
    postId: z.string(),
});

export async function addCommentAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to comment.", success: false };
    }

    const validatedFields = addCommentSchema.safeParse({
        content: formData.get("content"),
        postId: formData.get("postId"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid comment data.", success: false };
    }

    try {
        const post = await prisma.post.findUnique({ where: { id: validatedFields.data.postId }, select: { slug: true, title: true }});
        if (!post) {
             return { error: "Post not found.", success: false };
        }

        await prisma.comment.create({
            data: {
                content: validatedFields.data.content,
                postId: validatedFields.data.postId,
                authorId: session.user.id,
                status: 'PENDING',
            },
        });
        
        // Notify all admins about the new comment
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                type: 'NEW_COMMENT_AWAITING_APPROVAL',
                message: `New comment from ${session.user.name} on "${post.title}"`,
                link: '/admin/comments?status=PENDING'
            });
        }
        
        revalidatePath(`/blog/${post.slug}`);
        revalidatePath('/admin/comments');
        return { error: null, success: true }
    } catch (error) {
        console.error(error);
        return { error: "Failed to add comment.", success: false };
    }
}

const updateCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
    commentId: z.string(),
});

export async function updateCommentAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to edit comments.", success: false };
    }

    const validatedFields = updateCommentSchema.safeParse({
        content: formData.get("content"),
        commentId: formData.get("commentId"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid comment data.", success: false };
    }
    
    const { commentId, content } = validatedFields.data;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== session.user.id) {
        return { error: "You are not authorized to edit this comment.", success: false };
    }

    try {
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                content,
                status: 'PENDING' // Re-submit for approval after edit
            }
        });
        
        const post = await prisma.post.findUnique({ where: { id: comment.postId }, select: { slug: true }});
        if (post) {
          revalidatePath(`/blog/${post.slug}`);
        }
        revalidatePath('/admin/comments');
        return { error: null, success: true };
    } catch(error) {
        console.error(error);
        return { error: "Failed to update comment.", success: false };
    }
}


export async function approveCommentAction(commentId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }
    
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true }});
    if (!comment) throw new Error("Comment not found");

    await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'APPROVED' },
    });
    
    // Create a notification for the comment author
    if (comment.authorId !== session.user.id) { // Don't notify admin for their own actions
        await createNotification({
            userId: comment.authorId,
            type: 'COMMENT_APPROVED',
            message: `Your comment on "${comment.post.title}" was approved.`,
            link: `/blog/${comment.post.slug}#comments`
        });
    }

    revalidatePath('/admin/comments');
    revalidatePath(`/blog/${comment.post.slug}`);
}

export async function rejectCommentAction(commentId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }
    await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'REJECTED' },
    });
    revalidatePath('/admin/comments');
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: { select: { slug: true }}}});
    if (comment) {
        revalidatePath(`/blog/${comment.post.slug}`);
    }
}

export async function bulkUpdateCommentStatusAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }
    
    const commentIds = formData.getAll('commentIds') as string[];
    const status = formData.get('status') as CommentStatus;

    if (!commentIds || commentIds.length === 0) {
        return { error: "No comments selected." };
    }
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return { error: "Invalid status provided." };
    }

    try {
        await prisma.comment.updateMany({
            where: {
                id: { in: commentIds },
            },
            data: {
                status: status,
            },
        });
        revalidatePath('/admin/comments');
        revalidatePath('/blog', 'layout'); // Revalidate all blog pages
        return { success: `${commentIds.length} comments updated to ${status.toLowerCase()}.` };
    } catch (e) {
        return { error: "Failed to update comments." };
    }
}
