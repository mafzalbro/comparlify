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
     <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-max">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-headline mt-4">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href="/login">Back to Login</Link>
            </Button>
        </CardFooter>
      </Card>
  );
}
