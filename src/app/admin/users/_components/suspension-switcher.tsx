
'use client';

import { useTransition } from 'react';
import type { User } from '@prisma/client';
import { updateUserSuspension } from '@/app/actions/user';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SuspensionSwitcherProps {
  user: User;
  currentUserId?: string;
}

export function SuspensionSwitcher({ user, currentUserId }: SuspensionSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isCurrentUser = user.id === currentUserId;

  const onSuspensionChange = (suspended: boolean) => {
    if (isCurrentUser) {
      toast({
        title: 'Action Forbidden',
        description: 'You cannot suspend your own account.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateUserSuspension(user.id, suspended);
        toast({
          title: 'Success!',
          description: `Successfully ${suspended ? 'suspended' : 'unsuspended'} ${user.name}.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message || 'Failed to update suspension status.',
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
        <Switch
          id={`suspend-${user.id}`}
          checked={user.suspended}
          onCheckedChange={onSuspensionChange}
          disabled={isPending || isCurrentUser}
          aria-label={user.suspended ? `Unsuspend ${user.name}` : `Suspend ${user.name}`}
        />
      )}
      <Label htmlFor={`suspend-${user.id}`} className={user.suspended ? "text-destructive" : "text-muted-foreground"}>
          {user.suspended ? 'Suspended' : 'Active'}
      </Label>
    </div>
  );
}
