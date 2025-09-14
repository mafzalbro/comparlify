'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function TempDirectLogin() {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            await signIn('credentials', {
                userId: 'direct-login', // Special key for the credentials provider
                redirect: true,
                callbackUrl: '/admin',
            });
        });
    }

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
            <Button onClick={handleClick} disabled={isPending} variant="secondary" className="w-full">
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Direct Login as Admin
            </Button>
        </>
    )
}
