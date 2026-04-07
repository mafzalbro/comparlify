"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useState } from "react";
import { unsubscribeUserAction } from "@/app/actions/emails";
import { Loader2, MailCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function UnsubscribeComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, formAction, isPending] = useActionState(
    unsubscribeUserAction.bind(null, token || ""),
    { error: undefined, success: false, email: null },
  );

  if (!token) {
    return (
      <ErrorCard
        title="Invalid Link"
        message="This unsubscribe link is invalid or has expired."
      />
    );
  }

  if (state.success) {
    return (
      <Card className="max-w-md mx-auto text-center rounded-3xl bg-card/60 backdrop-blur-xl border-border/10 shadow-2xl p-6">
        <CardHeader>
          <MailCheck className="h-12 w-12 mx-auto text-green-500" />
          <CardTitle className="mt-4">Successfully Unsubscribed</CardTitle>
          <CardDescription>
            You have been unsubscribed from our mailing list. You will no longer
            receive marketing emails from us.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            asChild
            className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/10"
          >
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (state.error) {
    return (
      <ErrorCard
        title="Unsubscription Failed"
        message={state.error.toString()}
      />
    );
  }

  return (
    <Card className="max-w-md mx-auto text-center rounded-3xl bg-card/60 backdrop-blur-xl border-border/10 shadow-2xl p-6">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Confirm Unsubscription</CardTitle>
          <CardDescription>
            Are you sure you want to unsubscribe from our newsletter? You'll
            miss out on updates, new tools, and exclusive content.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            type="submit"
            variant="destructive"
            className="w-full h-12 rounded-xl font-bold shadow-md shadow-destructive/20"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Yes, Unsubscribe Me"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card className="max-w-md mx-auto text-center rounded-3xl bg-card/60 backdrop-blur-xl border-border/10 shadow-2xl p-6">
      <CardHeader>
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          asChild
          className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/10"
        >
          <Link href="/">Return to Homepage</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="container py-32 min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <UnsubscribeComponent />
        </Suspense>
      </div>
    </div>
  );
}
