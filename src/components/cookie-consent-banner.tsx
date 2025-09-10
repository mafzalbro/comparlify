
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie } from 'lucide-react';
import { useCookie } from '@/hooks/use-cookie';

export function CookieConsentBanner() {
  const [consent, setConsent] = useCookie('cookie-consent');

  if (consent === 'true') {
    return null;
  }

  const handleAccept = () => {
    setConsent('true');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
        <Card className="container mx-auto max-w-4xl shadow-2xl">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-4">
                     <Cookie className="h-8 w-8 text-primary mt-1 shrink-0"/>
                    <div className="text-sm">
                        <p className="font-semibold text-foreground">We use cookies</p>
                        <p className="text-muted-foreground">
                            This website uses cookies to enhance your browsing experience and analyze site traffic. By continuing to use this site, you agree to our use of cookies. Read our{' '}
                            <Link href="/privacy" className="underline hover:text-primary">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
                <Button onClick={handleAccept} className="w-full md:w-auto shrink-0">
                    Accept
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
