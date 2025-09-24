'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { retryFailedEmailsAction } from '@/app/actions/emails';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <AlertDialogAction asChild>
            <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Retry Now
            </Button>
        </AlertDialogAction>
    )
}

export function RetryFailedButton({ campaignId }: { campaignId: string }) {
  const [state, formAction] = useActionState(retryFailedEmailsAction, { error: null, success: false });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Retrying Failed Emails', description: 'The system is attempting to resend all failed emails for this campaign.'});
      router.refresh();
    }
    if (state.error) {
        toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast, router]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry Failed
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="campaignId" value={campaignId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Retry Failed Emails?</AlertDialogTitle>
            <AlertDialogDescription>
              This will attempt to resend the email to all recipients who previously failed. Are you sure?
              {state?.error && <p className="text-destructive mt-2">{state.error}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
