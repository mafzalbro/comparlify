"use client";

import React, { Suspense } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import dynamic from "next/dynamic";
import { ShieldCheck, Cpu, Zap, ArrowRightLeft } from "lucide-react";

const UniversalConverter = dynamic(
  () =>
    import("@/components/tools/converters/universal-converter").then(
      (mod) => mod.UniversalConverter,
    ),
  { ssr: false },
);

interface ConversionPageProps {
  params: Promise<{ from: string; to: string }>;
}

export default function ConversionPage({ params }: ConversionPageProps) {
  const { from, to } = React.use(params);

  return (
    <div className="min-h-screen text-foreground">
      {/* Background atmosphere blobs */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Page Hero */}
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 space-y-4 pt-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            Privacy-First · 100% Client-Side
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            Universal <span className="text-primary italic">Converter</span>
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium tracking-wide max-w-xl mx-auto leading-relaxed opacity-70">
            Convert any file format right here in your browser. No uploads, no
            servers, no data leaving your device — ever.
          </p>
        </MotionDiv>

        {/* Converter Tool */}
        <Suspense
          fallback={
            <div className="h-64 bg-card/20 rounded-2xl animate-pulse" />
          }
        >
          <UniversalConverter initialFrom={from} initialTo={to} />
        </Suspense>

        {/* Feature Pills */}
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12"
        >
          {[
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Privacy First",
              desc: "Your files never leave your browser. Everything runs in local RAM — nothing is uploaded.",
            },
            {
              icon: <Cpu className="h-5 w-5" />,
              title: "Neural Engine",
              desc: "High-fidelity rendering at 2x resolution. Preserve vectors, colors, and layout precision.",
            },
            {
              icon: <ArrowRightLeft className="h-5 w-5" />,
              title: "Multi-Format",
              desc: "PDF, JPG, PNG, WEBP, HTML, ZIP, and many more — one unified conversion interface.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl hover:bg-card/50 hover:border-primary/10 transition-all duration-300 group"
            >
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-1">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed opacity-70">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </MotionDiv>
      </div>
    </div>
  );
}
