
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { directLoginAction } from '../../../login/temp-direct-login-action';

export function TempDirectLogin() {
  const [isPending, startTransition] = useTransition();

  const handleDirectLogin = async () => {
    startTransition(async () => {
      const result = await directLoginAction();
      if (result.userId) {
        await signIn('credentials', { userId: result.userId, callbackUrl: '/admin' });
      }
    });
  };

  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            For Admin Use Only
          </span>
        </div>
      </div>
      <Button
        onClick={handleDirectLogin}
        disabled={isPending}
        variant="secondary"
        className="w-full"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Direct Login as Admin
      </Button>
    </>
  );
}
