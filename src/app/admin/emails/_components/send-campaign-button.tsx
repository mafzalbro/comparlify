"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendCampaignAction } from "@/app/actions/emails";
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
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Yes, Send Now
      </Button>
    </AlertDialogAction>
  );
}

export function SendCampaignButton({
  campaignId,
  disabled,
}: {
  campaignId: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(sendCampaignAction, {
    error: null,
    success: false,
    message: null,
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.message) {
      toast({ title: "Campaign Processing!", description: state.message });
      router.refresh();
    }
    if (state.error) {
      toast({
        title: "Error",
        description: state.error.toString(),
        variant: "destructive",
      });
    }
  }, [state, toast, router, campaignId]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full" disabled={disabled}>
          <Send className="mr-2 h-4 w-4" /> Send to Subscribers
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="campaignId" value={campaignId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Ready to Send?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the campaign to all subscribed users (excluding any
              you have selected to skip). This action cannot be undone. Are you
              sure?
              {typeof state.error === "string" && (
                <p className="text-destructive mt-2">
                  {state.error.toString()}
                </p>
              )}
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
