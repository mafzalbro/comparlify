import NextLink from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Button } from "@/components/ui/button";

interface ScaleCTAProps {
  subtitle?: string;
  buttonText?: string;
}

export function ScaleCTA({ subtitle, buttonText }: ScaleCTAProps) {
  return (
    <section className="relative overflow-hidden bg-transparent py-32 md:py-48 mt-24">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-[0.01]"></div>
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/3 rounded-full blur-[120px]"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-10">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 bg-primary/10 rounded-4xl flex items-center justify-center text-primary shadow-2xl shadow-primary/10 animate-bounce"
          >
            <Zap className="h-10 w-10 drop-shadow-lg" />
          </MotionDiv>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9] mb-4">
              Ready to <span className="text-primary italic">Scale?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              {subtitle ||
                "Stop guessing. Start building with precise creator intelligence."}
            </p>
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 items-center pt-8"
          >
            <Button
              size="xl"
              className="rounded-full px-14 h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 group hover:scale-105 active:scale-95 transition-all"
              asChild
            >
              <NextLink href="/register">
                {buttonText || "Initialize Account"}
                <ArrowRight className="ml-4 h-6 w-6 transition-transform group-hover:translate-x-3" />
              </NextLink>
            </Button>
            <NextLink
              href="/login"
              className="text-sm font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest"
            >
              Existing User Access
            </NextLink>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
