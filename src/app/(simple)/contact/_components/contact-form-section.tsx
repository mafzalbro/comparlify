"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { sendContactMessageAction } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "next-auth/react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
    >
      {pending ? (
        <>
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Synchronizing...
        </>
      ) : (
        <>
          <Send className="mr-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          Transmit Message
        </>
      )}
    </Button>
  );
}

export function ContactFormSection() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(sendContactMessageAction, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label
            htmlFor="name"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
          >
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Alex Sterling"
            defaultValue={session?.user?.name ?? ""}
            required
            className="h-12 rounded-xl bg-background/40 border-border/10 focus:ring-primary/20 transition-all text-base px-6 shadow-sm"
          />
          {typeof state.error !== "string" && state.error?.name && (
            <p className="text-[10px] font-bold text-destructive ml-1 uppercase">
              {state.error.name[0]}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <Label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
          >
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={session?.user?.email ?? ""}
            required
            className="h-12 rounded-xl bg-background/40 border-border/10 focus:ring-primary/20 transition-all text-base px-6 shadow-sm"
          />
          {typeof state.error !== "string" && state.error?.email && (
            <p className="text-[10px] font-bold text-destructive ml-1 uppercase">
              {state.error.email[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="message"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
        >
          Message Details
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="How can we help you today?"
          rows={5}
          required
          className="rounded-2xl bg-background/40 border-border/10 focus:ring-primary/20 transition-all text-base p-6 resize-none shadow-sm leading-relaxed"
        />
        {typeof state.error !== "string" && state.error?.message && (
          <p className="text-[10px] font-bold text-destructive ml-1 uppercase">
            {state.error.message[0]}
          </p>
        )}
      </div>

      {state.success && (
        <Alert className="bg-primary/5 border-primary/20 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CheckCircle className="h-6 w-6 !text-primary" />
          <AlertTitle className="text-base font-black uppercase tracking-tight mb-1">
            Message Sent
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-sm font-medium">
            We've received your request and will get back to you shortly.
          </AlertDescription>
        </Alert>
      )}

      {typeof state.error === "string" && (
        <Alert
          variant="destructive"
          className="rounded-2xl p-6 shadow-xl border-destructive/20 bg-destructive/5"
        >
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle className="text-base font-black uppercase tracking-tight mb-1">
            Error Occurred
          </AlertTitle>
          <AlertDescription className="text-sm font-medium">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      <SubmitButton />
    </form>
  );
}
