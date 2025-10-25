
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

    return null; // Actions are now handled by RoleSwitcher and SuspensionSwitcher
}
