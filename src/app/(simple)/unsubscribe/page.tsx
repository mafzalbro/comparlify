'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect, useState } from 'react';
import { unsubscribeUserAction } from '@/app/actions/emails';
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function UnsubscribeComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, formAction, isPending] = useActionState(unsubscribeUserAction.bind(null, token || ''), { error: null, success: false, email: null });

  if (!token) {
    return <ErrorCard title="Invalid Link" message="This unsubscribe link is invalid or has expired." />;
  }

  if (state.success) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <MailCheck className="h-12 w-12 mx-auto text-green-500" />
          <CardTitle className="mt-4">Successfully Unsubscribed</CardTitle>
          <CardDescription>
            You have been unsubscribed from our mailing list. You will no longer receive marketing emails from us.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (state.error) {
    return <ErrorCard title="Unsubscription Failed" message={state.error} />;
  }

  return (
    <Card className="max-w-md mx-auto text-center">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Confirm Unsubscription</CardTitle>
          <CardDescription>
            Are you sure you want to unsubscribe from our newsletter? You'll miss out on updates, new tools, and exclusive content.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Yes, Unsubscribe Me'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function ErrorCard({ title, message }: { title: string, message: string }) {
    return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
                <CardTitle className="mt-4">{title}</CardTitle>
                <CardDescription>
                    {message}
                </CardDescription>
            </CardHeader>
             <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/">Return to Homepage</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function UnsubscribePage() {
  return (
    <div className="container py-24">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <UnsubscribeComponent />
      </Suspense>
    </div>
  );
}
