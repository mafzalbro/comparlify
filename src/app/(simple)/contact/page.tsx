import { getContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/breadcrumb";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { ContactFormSection } from "./_components/contact-form-section";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ContactPage() {
  const content = await getContent();

  const contactMethods = [
    {
      Icon: Mail,
      title: content["contact.email.title"],
      description: content["contact.email.description"],
      value: content["contact.email.value"],
      href: `mailto:${content["contact.email.value"]}`,
    },
    {
      Icon: Phone,
      title: content["contact.phone.title"],
      description: content["contact.phone.description"],
      value: content["contact.phone.value"],
      href: `tel:${content["contact.phone.value"]}`,
    },
    {
      Icon: MapPin,
      title: content["contact.office.title"],
      description: content["contact.office.description"],
      value: content["contact.office.description"],
      href: null, // No link for address usually
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Contact Hero */}
      <section className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: "Contact" }]}
                className="mb-4 justify-center"
              />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">
                  Support Desk
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                {content["contact.hero.title"]}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-12">
                {content["contact.hero.subtitle"]}
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>

      <div className="container mx-auto py-6 px-4 md:px-8 max-w-screen-2xl">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Methods & Trust Points */}
          <div className="lg:col-span-5 space-y-12">
            <MotionDiv
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                {contactMethods.map((method, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-6 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-primary/20 group"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      <method.Icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight">
                        {method.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {method.description}
                      </p>
                      {method.href ? (
                        <a
                          href={method.href}
                          className="inline-block text-xl font-black text-primary hover:underline underline-offset-8 decoration-primary/30"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <p className="text-xl font-black text-foreground whitespace-pre-line leading-snug">
                          {method.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-16 border-t border-border/10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2">
                      <ShieldCheck className="h-4 w-4" /> Security
                    </div>
                    <h4 className="text-lg font-bold">100% Encrypted</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your data remains private and secure with AES-256
                      encryption across all channels.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2">
                      <Clock className="h-4 w-4" /> Global Support
                    </div>
                    <h4 className="text-lg font-bold">Responds In 4H</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our team is available across multiple time zones to
                      help you worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>

          {/* Right Column: High-Signal Contact Form */}
          <div className="lg:col-span-7">
            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-[4rem] p-8 md:p-10 bg-card/60 backdrop-blur-3xl border border-primary/20 shadow-[0_45px_100px_-20px_rgba(var(--primary-rgb),0.2)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
                  <Sparkles className="h-48 w-48" />
                </div>
                <div className="relative z-10">
                  <div className="mb-8">
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-[8px] font-black uppercase tracking-widest mb-4">
                      Get In Touch
                    </Badge>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                      Send us a{" "}
                      <span className="text-primary italic">Priority</span>{" "}
                      Message
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      We'll get back to you as soon as possible.
                    </p>
                  </div>
                  <ContactFormSection />
                </div>
              </Card>
            </MotionDiv>
          </div>
        </div>
      </div>

      {/* Dynamic Map/Footer Area Hint Could Go Here */}
      <section className="container mx-auto max-w-screen-xl py-10 px-1.5 md:px-8">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-[3.5rem] bg-secondary/50 border border-border/10 text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <Globe className="h-8 w-8 text-primary/60" />
              <p className="font-bold text-lg">Remote First</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Global Presence
              </p>
            </div>
            <div className="h-12 w-px bg-border/20 hidden md:block"></div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-primary/60" />
              <p className="font-bold text-lg">Instant Response</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Via Chat Window
              </p>
            </div>
          </div>
        </MotionDiv>
      </section>
    </div>
  );
}
