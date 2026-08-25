"use client";

import React from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { ShieldCheck, Layers, Users, TrendingUp } from "lucide-react";

export function VerifiedStacksHero() {
    return (
        <section className="relative py-12 overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10 text-center">
                <MotionDiv
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-4 shadow-xs">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Verified Stacks</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                        Proven <span className="text-primary italic">Stacks</span> for <span className="text-emerald-500 italic">Leading</span> Creators
                    </h1>

                    <p className="text-muted-foreground text-xs md:text-sm max-w-xl mx-auto font-medium leading-relaxed mb-8 italic">
                        Stop guessing your technology. See the exact software used by successful course creators 
                        to manage 5,000+ students with high reliability and zero technical confusion.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                        {[
                            { label: "Verified Platforms", value: "45+", icon: Layers },
                            { label: "Active Stacks", value: "128", icon: Users },
                            { label: "Verification Rate", value: "98%", icon: ShieldCheck },
                            { label: "Efficiency Gain", value: "24%", icon: TrendingUp },
                        ].map((stat, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors flex flex-col items-center group shadow-xs">
                                <stat.icon className="h-4 w-4 text-primary mb-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xl font-extrabold tracking-tight italic">{stat.value}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 opacity-70">
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
