import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center text-center px-4 py-20 min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-in zoom-in duration-700">
          <Compass className="h-8 w-8 text-primary animate-pulse" />
        </div>

        <h1 className="text-[6rem] md:text-[10rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 animate-in slide-in-from-bottom-8 duration-700 delay-100">
          404
        </h1>

        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
            Signal <span className="text-primary italic">Lost</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            The coordinates you provided lead to uncharted territory. The
            requested page cannot be found in our database.
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-center animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <Button
            asChild
            size="lg"
            className="rounded-xl h-14 px-8 font-bold text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Base
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl h-14 px-8 font-bold text-base bg-background/50 backdrop-blur-md border-border/50 hover:bg-muted transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>

      {/* Decorative blurry elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>
    </div>
  );
}
