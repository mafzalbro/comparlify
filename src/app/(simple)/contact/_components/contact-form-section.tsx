
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { sendContactMessageAction } from '@/app/actions/contact';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send Message
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
        <form ref={formRef} action={formAction} className="space-y-6 bg-card p-8 rounded-lg shadow-md">
            <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your Name" defaultValue={session?.user?.name ?? ''} required />
            {typeof state.error !== 'string' && state.error?.name && <p className="text-sm text-destructive">{state.error.name[0]}</p>}
            </div>
            <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" defaultValue={session?.user?.email ?? ''} required />
            {typeof state.error !== 'string' && state.error?.email && <p className="text-sm text-destructive">{state.error.email[0]}</p>}
            </div>
            <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" placeholder="How can we help you?" rows={5} required />
            {typeof state.error !== 'string' && state.error?.message && <p className="text-sm text-destructive">{state.error.message[0]}</p>}
            </div>

            {state.success && (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 !text-green-500" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                        Your message has been sent successfully. We'll get back to you soon.
                    </AlertDescription>
                </Alert>
            )}

            {typeof state.error === 'string' && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {state.error}
                    </AlertDescription>
                </Alert>
            )}

            <SubmitButton />
        </form>
    );
}
