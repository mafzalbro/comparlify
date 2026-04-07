"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

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
    <div className="relative flex flex-1 flex-col items-center justify-center text-center px-4 py-20 min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-destructive/10 via-background to-background"></div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center justify-center p-6 rounded-4xl bg-destructive/10 border border-destructive/20 mb-4 animate-in zoom-in duration-700 shadow-2xl shadow-destructive/20">
          <AlertCircle className="h-12 w-12 text-destructive animate-pulse" />
        </div>

        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-100">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            System <span className="text-destructive italic">Failure</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            We've encountered an unexpected anomaly. Our engineering team has
            been notified of this disruption.
          </p>
        </div>

        {error.digest && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 delay-200 bg-card/60 backdrop-blur-md border border-border/10 p-4 rounded-2xl shadow-inner mt-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Error Digest Reference
            </p>
            <p className="text-xs font-mono text-foreground/80 bg-background/50 px-3 py-1.5 rounded-md">
              {error.digest}
            </p>
          </div>
        )}

        <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-center animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <Button
            onClick={() => reset()}
            size="lg"
            variant="default"
            className="rounded-xl h-14 px-8 font-bold text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reboot Sequence
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl h-14 px-8 font-bold text-base bg-background/50 backdrop-blur-md border-border/50 hover:bg-muted transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative blurry elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-destructive/20 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>
    </div>
  );
}
