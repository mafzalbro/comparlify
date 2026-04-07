"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  markAllNotificationsAsRead,
  getNotifications,
} from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@prisma/client";
import { NotificationIcon } from "./notification-icon";

interface NotificationListProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export function NotificationList({
  initialNotifications,
  initialUnreadCount,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
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
    <div className="flex flex-col h-[480px]">
      <div className="flex items-center justify-between p-6 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-black text-sm uppercase tracking-widest">
            Notifications
          </h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
            {unreadCount} New
          </span>
        )}
      </div>
      <ScrollArea className="flex-1">
        {notifications.length > 0 ? (
          <div className="divide-y divide-primary/5">
            {notifications.map((notif) => (
              <Link
                href={notif.link}
                key={notif.id}
                className={cn(
                  "block p-5 hover:bg-primary/5 transition-all duration-300 relative group",
                  !notif.read && "bg-primary/2",
                )}
              >
                {!notif.read && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                )}
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    <NotificationIcon type={notif.type} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        "text-xs leading-relaxed font-medium transition-colors group-hover:text-primary",
                        !notif.read
                          ? "text-foreground font-bold"
                          : "text-muted-foreground",
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-4">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center text-muted-foreground/30">
              <Bell className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-xs uppercase tracking-widest">
                All Caught Up
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                No new signals detected
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
      {notifications.length > 0 && (
        <div className="p-4 border-t border-primary/10 bg-muted/20">
          <Button
            variant="ghost"
            className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
          >
            View All Dispatches
          </Button>
        </div>
      )}
    </div>
  );
}
