
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export const getNotifications = cache(async () => {
    const session = await auth();
    if (!session?.user?.id) {
        return { notifications: [], unreadCount: 0 };
    }
    
    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    
    const unreadCount = await prisma.notification.count({
        where: { userId: session.user.id, read: false }
    });

    return { notifications, unreadCount };
});


export async function markAllNotificationsAsRead() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }
    
    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, read: false },
            data: { read: true }
        });

        // Revalidate paths that show the notification bell
        revalidatePath('/admin/layout');
        revalidatePath('/panel/layout');
        
        return { success: true };
    } catch (error) {
        console.error("Failed to mark notifications as read", error);
        return { error: "Could not update notifications" };
    }
}
