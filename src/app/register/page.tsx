'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github, KeyRound } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";


export default function LoginPage() {

  const handleSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6 flex items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2"><KeyRound /> Sign Up</CardTitle>
          <CardDescription>Choose a provider below to sign up to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" variant="outline" onClick={() => handleSignIn('google')}>
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
          <Button className="w-full" variant="outline" onClick={() => handleSignIn('github')}>
            <Github className="mr-2 h-5 w-5" />
            Sign up with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
