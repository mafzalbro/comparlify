
'use client';

import { useTransition } from 'react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import prisma from '@/lib/prisma';
import { Separator } from '@/components/ui/separator';

async function directLoginAction() {
    'use server';
    const email = 'mafzalbro@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        // This server-side signIn is what we'll use, but we need a client component to trigger it.
        // The actual signIn call will happen on the client after this action returns the userId.
        return { userId: user.id };
    }
    return { userId: null };
}


export function TempDirectLogin() {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            const { userId } = await directLoginAction();
            if (userId) {
                await signIn('credentials', {
                    userId: userId,
                    redirect: true,
                    callbackUrl: '/',
                });
            } else {
                console.error("Direct login user not found.");
            }
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
