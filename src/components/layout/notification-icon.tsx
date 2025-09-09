
import { Bell, UserPlus, MessageCircle } from 'lucide-react';
import type { NotificationType } from '@prisma/client';

export const NotificationIcon = ({ type }: { type: NotificationType }) => {
    switch (type) {
        case 'NEW_USER_REGISTERED':
            return <UserPlus className="h-5 w-5 text-blue-500" />;
        case 'COMMENT_APPROVED':
        case 'NEW_COMMENT_AWAITING_APPROVAL':
            return <MessageCircle className="h-5 w-5 text-green-500" />;
        default:
            return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
}
