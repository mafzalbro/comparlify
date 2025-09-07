'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogIn, TriangleAlert } from 'lucide-react';

interface AuthFormProps {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  state: { error: string | null; success: boolean };
  buttonLabel: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

export function AuthForm({
  title,
  description,
  action,
  state,
  buttonLabel,
  footerText,
  footerLink,
  footerLinkText,
}: AuthFormProps) {
  return (
    <Card className="mx-auto max-w-sm">
      <form action={action}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {state.error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton label={buttonLabel} />
          <div className="text-sm text-center text-muted-foreground">
            {footerText}{' '}
            <Link href={footerLink} className="text-primary hover:underline">
              {footerLinkText}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
