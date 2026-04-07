"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { subscribeAction } from "@/app/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function SubmitButton({
  className,
  text = "Secure Access",
}: {
  className?: string;
  text?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className={cn(
        "rounded-xl px-8 h-12 font-bold uppercase tracking-wider text-[11px] shadow-lg transition-all hover:scale-105 active:scale-95",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {text}
          <ArrowRight className="ml-3 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

interface PremiumNewsletterFormProps {
  buttonClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  accentColor?: string; // e.g. 'primary' or 'blue-500'
  buttonText?: string;
}

export function PremiumNewsletterForm({
  buttonClassName,
  inputClassName,
  containerClassName,
  accentColor = "primary",
  buttonText = "Subscribe",
}: PremiumNewsletterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(subscribeAction, {
    message: null,
    error: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: "Success!",
        description: state.message,
      });
      formRef.current?.reset();
    }
    if (state.error) {
      toast({
        title: "Subscription Error",
        description: state.error.toString(),
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const ringColor =
    accentColor === "primary"
      ? "group-focus-within:ring-primary/10"
      : "group-focus-within:ring-blue-500/10";

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn(
        "flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto bg-card/60 backdrop-blur-3xl p-2 rounded-2xl border border-border/10 shadow-xl transition-all group",
        ringColor,
        containerClassName,
      )}
    >
      <input
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className={cn(
          "h-12 px-6 rounded-xl bg-background/20 border-none flex-1 focus:outline-none text-base font-medium placeholder:text-muted-foreground/40 transition-all",
          inputClassName,
        )}
      />
      <SubmitButton className={buttonClassName} text={buttonText} />
    </form>
  );
}
