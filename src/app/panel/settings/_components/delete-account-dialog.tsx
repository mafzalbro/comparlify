"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { deleteSelfAction } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { Loader2, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
      <Button
        variant="destructive"
        type="submit"
        disabled={pending}
        className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-destructive/20"
      >
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Execute Purge
      </Button>
    </AlertDialogAction>
  );
}

export function DeleteAccountDialog() {
  const [state, formAction] = useActionState(deleteSelfAction, {
    error: undefined,
    success: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      signOut({ callbackUrl: "/" });
    }
    if (state.error) {
      toast({
        title: "Error",
        description: state.error.toString(),
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-destructive/20 hover:scale-[1.02] transition-transform"
        >
          Terminate Node
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card/90 backdrop-blur-3xl border-destructive/20 rounded-[2.5rem] p-10 max-w-lg">
        <form action={formAction}>
          <AlertDialogHeader className="space-y-6">
            <AlertDialogTitle className="flex items-center gap-4 text-2xl font-black uppercase tracking-tight text-destructive">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TriangleAlert className="h-6 w-6" />
              </div>
              Absolute Termination?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed font-medium">
              This protocol is irreversible. Executing this will permanently
              purge your identity node and all associated research data from the
              neural network.
              {state?.error && (
                <p className="text-destructive mt-4 font-bold uppercase tracking-widest text-xs">
                  {state.error.toString()}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest border-border/10 hover:bg-secondary/10">
              Abort
            </AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
