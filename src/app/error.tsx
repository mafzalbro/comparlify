
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
            <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
            Oops! Something went wrong.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
            We've encountered an unexpected error. Please try again, or if the problem persists, contact our support team.
        </p>
         <pre className="mt-4 text-xs text-muted-foreground bg-muted p-2 rounded-md max-w-full overflow-x-auto">
            Error Digest: {error.digest || 'N/A'}
        </pre>
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
  );
}
