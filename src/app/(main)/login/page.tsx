import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound, Sparkles, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import { TempDirectLogin } from "./_components/temp-direct-login";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";
import { MotionDiv } from "@/components/motion-wrapper";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full relative flex items-center justify-center overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center px-4 md:px-6 py-12">
        {/* Visual Brand Side */}
        <MotionDiv
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Intelligence Access
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[0.9]">
              Re-Join the <br />{" "}
              <span className="text-primary italic">Elite Network.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
              Access your saved intelligence, participate in verified
              discussions, and use our suite of AI architecture tools.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-md">
            {[
              {
                icon: ShieldCheck,
                title: "Secure Authentication",
                desc: "Military-grade data protection.",
              },
              {
                icon: Zap,
                title: "Instant Sync",
                desc: "Your bookmarks, everywhere.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-6 items-start p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl"
              >
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-foreground uppercase tracking-wider text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" />
            Back to Global Feed
          </Link>
        </MotionDiv>

        {/* Form Side */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md bg-card/60 backdrop-blur-3xl border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden p-6 md:p-10">
            <CardHeader className="text-center p-0 mb-8">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 animate-pulse">
                <KeyRound className="h-7 w-7" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-foreground mb-4">
                Welcome <span className="text-primary">Back</span>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-medium">
                Initiate secure login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              <Suspense
                fallback={
                  <div className="h-[200px] flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary animate-spin" />
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/10"></span>
                </div>
                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]">
                  <span className="bg-transparent px-4 text-muted-foreground">
                    Certified Identity
                  </span>
                </div>
              </div>
              {process.env.NODE_ENV === "development" && (
                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
                  <TempDirectLogin />
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground font-medium">
                Don't have an archive?{" "}
                <Link
                  href="/register"
                  className="text-primary font-black hover:underline underline-offset-4"
                >
                  Initialize Account
                </Link>
              </p>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
