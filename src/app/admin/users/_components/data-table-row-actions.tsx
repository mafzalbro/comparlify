
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCog, Loader2 } from "lucide-react";
import type { User, Role } from "@prisma/client";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole } from "@/app/actions/user";

interface DataTableRowActionsProps {
    user: User;
    currentUserId?: string;
}

export function DataTableRowActions({ user, currentUserId }: DataTableRowActionsProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const isCurrentUser = user.id === currentUserId;

    const onRoleChange = (newRole: Role) => {
        if (isCurrentUser) {
            toast({
                title: "Action Forbidden",
                description: "You cannot change your own role.",
                variant: "destructive"
            });
            return;
        }

        startTransition(async () => {
            try {
                await updateUserRole(user.id, newRole);
                toast({
                    title: 'Success!',
                    description: `Successfully updated ${user.name}'s role to ${newRole}.`,
                });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: (error as Error).message || 'Failed to update role.',
                    variant: 'destructive',
                });
            }
        });
    };

    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const buttonText = `Make ${nextRole.charAt(0) + nextRole.slice(1).toLowerCase()}`;

    return (
        <div className="flex justify-end items-center">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onRoleChange(nextRole)}
                disabled={isPending || isCurrentUser}
                className="w-[120px]"
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <UserCog className="mr-2 h-4 w-4" />
                )}
                {buttonText}
            </Button>
        </div>
    );
}
