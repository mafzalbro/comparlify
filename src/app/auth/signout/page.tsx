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
    <Card className="max-w-sm text-center">
      <CardHeader>
        <CardTitle>Signing Out</CardTitle>
        <CardDescription>Please wait while we securely sign you out.</CardDescription>
      </CardHeader>
      <CardContent>
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      </CardContent>
    </Card>
  );
}
