
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cloneCampaignAction } from '@/app/actions/emails';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button';

interface CloneCampaignButtonProps extends Pick<ButtonProps, 'size'> {
  campaignId: string;
}

export function CloneCampaignButton({ campaignId, size }: CloneCampaignButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleClone = () => {
    startTransition(async () => {
      const result = await cloneCampaignAction(campaignId);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.success && result.newCampaignId) {
        toast({
          title: 'Campaign Cloned!',
          description: 'A new draft has been created.',
        });
        router.push(`/admin/emails/edit/${result.newCampaignId}`);
      }
    });
  };

  return (
    <Button
      variant={size === 'sm' ? 'ghost' : 'outline'}
      size={size}
      onClick={handleClone}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      Clone
    </Button>
  );
}
