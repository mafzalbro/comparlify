import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Sparkles, Rocket, Globe, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { RegisterForm } from "./_components/register-form";
import { MotionDiv } from "@/components/motion-wrapper";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full relative flex items-center justify-center overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px] animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-20 items-center px-4 md:px-6 py-12">
        {/* Visual Brand Side */}
        <MotionDiv
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Rocket className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Create Your Account
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[0.9]">
              Join the <br />{" "}
              <span className="text-primary italic">Creator Community.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
              Join thousands of course creators. Create your free account and
              start comparing platforms today.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-lg">
            {[
              {
                icon: Globe,
                title: "Global Network",
                desc: "Connect with creators worldwide.",
              },
              {
                icon: Sparkles,
                title: "AI Tools",
                desc: "Access the full AI toolkit.",
              },
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-wider text-xs">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-2" />
            Back to Home
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
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <UserPlus className="h-7 w-7" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-foreground mb-4">
                Create <span className="text-primary">Account</span>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-medium">
                Get started in seconds. It's completely free.
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
                <RegisterForm />
              </Suspense>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/10"></span>
                </div>
                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]">
                  <span className="bg-transparent px-4 text-muted-foreground">
                    Secure Sign Up
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground font-medium">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-black hover:underline underline-offset-4"
                >
                  Access Account
                </Link>
              </p>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
