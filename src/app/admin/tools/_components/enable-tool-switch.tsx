
'use client';

import { useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateToolStatus } from '@/app/actions/tools';
import { Loader2 } from 'lucide-react';

interface EnableToolSwitchProps {
  toolId: string;
  isEnabled: boolean;
}

export function EnableToolSwitch({ toolId, isEnabled }: EnableToolSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCheckedChange = (checked: boolean) => {
    startTransition(async () => {
      const result = await updateToolStatus(toolId, checked);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: `Tool status updated.` });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          id={`enable-${toolId}`}
          checked={isEnabled}
          onCheckedChange={handleCheckedChange}
          disabled={isPending}
          aria-label={isEnabled ? 'Disable tool' : 'Enable tool'}
        />
      )}
      <Label htmlFor={`enable-${toolId}`} className={isEnabled ? 'text-foreground' : 'text-muted-foreground'}>
        {isEnabled ? 'Enabled' : 'Disabled'}
      </Label>
    </div>
  );
}
