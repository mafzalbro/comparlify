'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from "next/link";
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: { title: string, message: string } } = {
    default: {
        title: 'Authentication Error',
        message: 'An unexpected error occurred. Please try signing in again.'
    },
    OAuthAccountNotLinked: {
        title: 'Account Not Linked',
        message: 'This email is already associated with another provider. Please sign in using the method you originally used.'
    },
    CredentialsSignin: {
        title: 'Sign In Failed',
        message: 'Incorrect credentials. Please check your details and try again.'
    }
  }
  
  const { title, message } = errorMessages[error as string] || errorMessages.default;


  return (
     <Card className="mx-auto max-w-sm bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl shadow-md p-4">
        <CardHeader className="text-center p-2">
          <div className="mx-auto bg-destructive/10 p-2.5 rounded-full w-max">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-extrabold mt-3">{title}</CardTitle>
          <CardDescription className="text-xs font-medium">{message}</CardDescription>
        </CardHeader>
        <CardFooter className="p-2 pt-4">
            <Button asChild className="w-full rounded-xl h-10 font-extrabold uppercase tracking-widest text-xs">
                <Link href="/login">Back to Login</Link>
            </Button>
        </CardFooter>
      </Card>
  );
}
