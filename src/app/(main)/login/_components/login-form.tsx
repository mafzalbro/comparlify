
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { Github } from 'lucide-react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl });
  };

  return (
    <>
      <Button
        className="w-full"
        variant="outline"
        onClick={() => handleSignIn('google')}
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button>
      <Button
        className="w-full"
        variant="outline"
        onClick={() => handleSignIn('github')}
      >
        <Github className="mr-2 h-5 w-5" />
        Sign in with GitHub
      </Button>
    </>
  );
}
