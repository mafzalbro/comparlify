'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

export default function SignOutPage() {
  const searchParams = useSearchParams();
  const callbackUrl = decodeURIComponent(searchParams.get('callbackUrl') || '/');

  useEffect(() => {
    signOut({ callbackUrl: callbackUrl });
  }, []);

  return (
    <Card className="max-w-sm text-center bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl shadow-md p-4">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold">Signing Out</CardTitle>
        <CardDescription className="text-xs font-medium">Please wait while we securely sign you out.</CardDescription>
      </CardHeader>
      <CardContent>
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
      </CardContent>
    </Card>
  );
}
