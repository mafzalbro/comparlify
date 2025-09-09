
'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, UserPlus, MessageCircle, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markAllNotificationsAsRead, getNotifications } from '@/app/actions/notifications';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@prisma/client';

interface NotificationListProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
    switch (type) {
        case 'NEW_USER':
            return <UserPlus className="h-5 w-5 text-blue-500" />;
        case 'COMMENT_APPROVED':
            return <MessageCircle className="h-5 w-5 text-green-500" />;
        default:
            return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
}

export function NotificationList({ initialNotifications, initialUnreadCount }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // When the popover opens, if there are unread notifications, mark them as read.
    if (unreadCount > 0) {
      startTransition(async () => {
        await markAllNotificationsAsRead();
        const { notifications } = await getNotifications();
        setNotifications(notifications);
        setUnreadCount(0);
      });
    }
  }, [unreadCount]);


  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {isPending && <CheckCheck className="h-5 w-5 text-muted-foreground animate-pulse" />}
      </div>
      <ScrollArea className="flex-1">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notif) => (
              <Link href={notif.link} key={notif.id} className={cn(
                "block p-4 hover:bg-accent transition-colors",
                !notif.read && "bg-secondary/50"
              )}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                     <NotificationIcon type={notif.type} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Bell className="h-10 w-10 mb-2" />
            <p className="font-semibold">No new notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
