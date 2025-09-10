
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative flex flex-col items-center justify-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6 border border-destructive/20">
                <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
                Oops! Something Went Wrong
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
                We've encountered an unexpected error. Our team has been notified, but you can also try again or go back home.
            </p>
            {error.digest && (
                <div className="mt-6 text-xs text-muted-foreground bg-muted p-2 rounded-md font-mono">
                    Error ID: {error.digest}
                </div>
            )}
            <div className="mt-8 flex gap-4">
                <Button onClick={() => reset()} size="lg">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Try Again
                </Button>
                <Button asChild variant="outline" size="lg">
                    <a href="/">
                        <Home className="mr-2 h-5 w-5" />
                        Go Back Home
                    </a>
                </Button>
            </div>
        </div>
    </div>
  );
}
