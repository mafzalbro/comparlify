
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCog } from "lucide-react";
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <UserCog className="mr-2 h-4 w-4" />
                        Change Role
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => onRoleChange('USER')} disabled={isPending || isCurrentUser || user.role === 'USER'}>
                            Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRoleChange('ADMIN')} disabled={isPending || isCurrentUser || user.role === 'ADMIN'}>
                            Set as Admin
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

