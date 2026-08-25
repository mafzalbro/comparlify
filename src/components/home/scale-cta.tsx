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
    <section className="relative overflow-hidden bg-transparent py-10 md:py-14 mt-8">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>

      <div className="container mx-auto relative z-10 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-4">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-md shadow-primary/10"
          >
            <Zap className="h-6 w-6" />
          </MotionDiv>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Ready to <span className="text-primary italic">Scale?</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
              {subtitle ||
                "Stop guessing. Start building with precise creator intelligence."}
            </p>
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 items-center pt-2"
          >
            <Button
              size="default"
              className="rounded-full px-8 h-11 text-xs font-extrabold uppercase tracking-widest shadow-md shadow-primary/20 group hover:scale-102 active:scale-98 transition-all"
              asChild
            >
              <NextLink href="/register">
                {buttonText || "Initialize Account"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </NextLink>
            </Button>
            <NextLink
              href="/login"
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-widest"
            >
              Existing User Access
            </NextLink>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
