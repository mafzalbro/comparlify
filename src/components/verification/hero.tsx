"use client";

import React from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { ShieldCheck, Layers, Users, TrendingUp } from "lucide-react";

export function VerifiedStacksHero() {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] animate-pulse delay-1000" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 text-center">
                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-8">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Stacks</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                        Proven <span className="text-primary italic">Stacks</span> for <br />
                        <span className="text-emerald-500 italic">Leading</span> Creators
                    </h1>

                    <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed mb-12 italic">
                        Stop guessing your technology. See the exact software used by successful course creators 
                        to manage 5,000+ students with high reliability and zero technical confusion.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                        {[
                            { label: "Verified Platforms", value: "45+", icon: Layers },
                            { label: "Active Stacks", value: "128", icon: Users },
                            { label: "Verification Rate", value: "98%", icon: ShieldCheck },
                            { label: "Efficiency Gain", value: "24%", icon: TrendingUp },
                        ].map((stat, idx) => (
                            <div key={idx} className="p-6 rounded-4xl bg-card/40 backdrop-blur-3xl border border-border/10 flex flex-col items-center group hover:border-primary/20 transition-all duration-500">
                                <stat.icon className="h-5 w-5 text-primary mb-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                                <span className="text-2xl font-black tracking-tighter italic">{stat.value}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
}
