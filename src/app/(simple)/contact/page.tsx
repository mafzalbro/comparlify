
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { sendContactMessageAction } from '@/app/actions/contact';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Loader2, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';
import { Breadcrumbs } from '@/components/breadcrumb';
import type { SiteContent } from '@prisma/client';
import { getContent } from '@/lib/content';
import { useState } from 'react';

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

export default function ContactPage() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(sendContactMessageAction, {
    error: null,
    success: false,
  });

   const [content, setContent] = useState<Record<string, string>>({});
    useEffect(() => {
        const fetchContent = async () => {
            const fetchedContent = await getContent();
            setContent(fetchedContent);
        }
        fetchContent();
    }, []);

   useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);


  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Contact' },
        ]}
        className="mb-8"
      />
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            {content['contact.hero.title']}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            {content['contact.hero.subtitle']}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">{content['contact.email.title']}</h3>
                <p className="text-muted-foreground">{content['contact.email.description']}</p>
                <a href={`mailto:${content['contact.email.value']}`} className="text-primary font-medium hover:underline">{content['contact.email.value']}</a>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">{content['contact.phone.title']}</h3>
                <p className="text-muted-foreground">{content['contact.phone.description']}</p>
                <a href={`tel:${content['contact.phone.value']}`} className="text-primary font-medium hover:underline">{content['contact.phone.value']}</a>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">{content['contact.office.title']}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{content['contact.office.description']}</p>
              </div>
            </div>
          </div>
          
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
        </div>
      </div>
    </div>
  )
}
