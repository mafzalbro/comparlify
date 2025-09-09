
import prisma from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationProps {
    userId: string;
    type: NotificationType;
    message: string;
    link: string;
}

export async function createNotification(props: CreateNotificationProps) {
    try {
        await prisma.notification.create({
            data: {
                userId: props.userId,
                type: props.type,
                message: props.message,
                link: props.link,
            }
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
}
