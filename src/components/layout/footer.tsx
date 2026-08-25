"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { subscribeAction } from "@/app/actions/subscriptions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  Github,
  Twitter,
  Linkedin,
  Loader2,
  Mail,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-xl px-6 h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span className="flex items-center gap-2">
          Join <Send className="h-3 w-3" />
        </span>
      )}
    </Button>
  );
}

interface FooterContent {
  "footer.tagline"?: string;
  "footer.newsletter.title"?: string;
  "footer.newsletter.subtitle"?: string;
  "footer.navLinks.navigate"?: string;
  "footer.navLinks.company"?: string;
}

interface FooterProps {
  content: FooterContent;
  siteName: string;
}

type FooterLink = {
  label: string;
  href: string;
};

export default function Footer({ content, siteName }: FooterProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(subscribeAction, {
    message: null,
    error: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: "Successfully Subscribed",
        description: state.message,
      });
      formRef.current?.reset();
    }
    if (state.error) {
      toast({
        title: "Subscription Error",
        description: state.error.toString(),
        variant: "destructive",
      });
    }
  }, [state, toast]);

  let navigateLinks: FooterLink[] = [];
  let companyLinks: FooterLink[] = [];

  try {
    if (content["footer.navLinks.navigate"]) {
      navigateLinks = JSON.parse(content["footer.navLinks.navigate"]);
    }
    if (content["footer.navLinks.company"]) {
      companyLinks = JSON.parse(content["footer.navLinks.company"]);
    }
  } catch (e) {
    console.error("Failed to parse footer links from site content:", e);
  }

  return (
    <footer className="relative bg-background/50 backdrop-blur-md pt-16 pb-10 overflow-hidden border-t border-border/20">
      {/* Background Visuals */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-10"></div>

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        {/* Newsletter Callout */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-6 md:p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-lg relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-8 -translate-y-8 select-none pointer-events-none">
            <Sparkles className="h-48 w-48" />
          </div>

          <div className="max-w-xl text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Mail className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                Intelligence Delivery
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              Stay Ahead of the <span className="text-primary italic">Curve.</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Weekly deep-dives into creator tech and platform shifts, delivered with surgical precision.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form ref={formRef} action={formAction} className="relative group">
              <div className="relative flex p-1 bg-background/80 border border-border/30 rounded-xl shadow-md items-center gap-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email address..."
                  className="bg-transparent border-none h-10 focus-visible:ring-0! text-xs font-medium px-3 mt-0!"
                  required
                />
                <SubmitButton />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/60 text-center font-bold uppercase tracking-widest">
                Join 50,000+ creators today.
              </p>
            </form>
          </div>
        </MotionDiv>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="space-y-8">
            <Logo siteName={siteName} />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs font-medium">
              {content["footer.tagline"] ||
                "Expert insights for the modern creator economy. Detailed comparisons for side-by-side clarity."}
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/10 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:col-span-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-8 h-px bg-primary/30"></span> Navigate
              </h3>
              <ul className="space-y-4">
                {navigateLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-8 h-px bg-primary/30"></span> Company
              </h3>
              <ul className="space-y-4">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-px bg-primary/30"></span> Transparency
            </h3>
            <div className="p-6 rounded-4xl bg-secondary/30 border border-border/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Verified Hub
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                All comparisons are verified by our internal audit team for data
                accuracy and objectivity.
              </p>
              <Link
                href="/about"
                className="block text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
              >
                Learn about our audit &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          {/* <div className="flex gap-8 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
            <span>Status: Operational</span>
            <span className="hidden md:inline">IP: 127.0.0.1 (Local Node)</span>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
