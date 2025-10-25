
'use client';

import { useTransition } from 'react';
import type { User, Role } from '@prisma/client';
import { updateUserRole } from '@/app/actions/user';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RoleSwitcherProps {
  user: User;
  currentUserId?: string;
}

export function RoleSwitcher({ user, currentUserId }: RoleSwitcherProps) {
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
    <div className="flex items-center gap-2">
        {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
            <Select
                defaultValue={user.role}
                onValueChange={(value: Role) => onRoleChange(value)}
                disabled={isPending || isCurrentUser}
            >
                <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="AUTHOR">Author</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
            </Select>
        )}
    </div>
  );
}
