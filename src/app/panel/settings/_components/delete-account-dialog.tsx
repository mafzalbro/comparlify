
'use client';

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteSelfAction } from '@/app/actions/user';
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
import { Loader2, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'next-auth/react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <AlertDialogAction asChild>
            <Button variant="destructive" type="submit" disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete My Account
            </Button>
        </AlertDialogAction>
    )
}

export function DeleteAccountDialog() {
  const [state, formAction] = useActionState(deleteSelfAction, { error: null, success: false });
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
        toast({
            title: 'Account Deleted',
            description: 'Your account has been successfully deleted.',
        });
        signOut({ callbackUrl: '/' });
    }
    if (state.error) {
        toast({
            title: 'Error',
            description: state.error,
            variant: 'destructive'
        })
    }
  }, [state, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">Delete My Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><TriangleAlert />Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account, and remove all your data from our servers.
              {state?.error && <p className="text-destructive mt-2">{state.error}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
