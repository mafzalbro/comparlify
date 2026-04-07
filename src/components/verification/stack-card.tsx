"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Layers, ExternalLink, TrendingUp } from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";
import Link from "next/link";

interface StackPlatform {
    role: string;
    platform: {
        name: string;
        logoUrl: string;
    };
}

interface StackCardProps {
    stack: {
        id: string;
        title: string;
        description: string;
        isVerified: boolean;
        verificationUrl?: string | null;
        createdAt: Date | string;
        user: {
            name: string | null;
            image: string | null;
            role: string;
        };
        platforms: StackPlatform[];
    };
}

export function StackCard({ stack }: StackCardProps) {
    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Card className="h-full bg-card/40 backdrop-blur-3xl border border-border/10 hover:border-primary/40 transition-all duration-500 rounded-4xl overflow-hidden flex flex-col p-6 relative">
                {stack.isVerified && (
                    <div className="absolute top-6 right-6 z-20">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest animate-pulse">
                            <ShieldCheck className="h-3 w-3" /> Verified Stack
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={stack.user.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">
                            {stack.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="text-sm font-black tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">
                            {stack.user.name || "Anonymous Creator"}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                {stack.user.role}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-[9px] font-medium text-muted-foreground italic">
                                {new Date(stack.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-xl font-black tracking-tighter mb-2 line-clamp-1 italic">
                            {stack.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                            {stack.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {stack.platforms.slice(0, 3).map((sp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/10 group-hover:border-primary/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted/50 border border-border/5 flex items-center justify-center p-1.5 overflow-hidden">
                                        <img src={sp.platform.logoUrl} alt={sp.platform.name} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-tight">{sp.platform.name}</span>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">{sp.role}</span>
                            </div>
                        ))}
                        {stack.platforms.length > 3 && (
                            <div className="text-center py-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">+{stack.platforms.length - 3} More Components</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-primary opacity-50" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">High Efficiency</span>
                    </div>
                    {stack.verificationUrl && (
                        <Link 
                            href={stack.verificationUrl} 
                            target="_blank"
                            className="p-2 rounded-xl bg-muted/50 border border-border/10 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    )}
                </div>
            </Card>
        </MotionDiv>
    );
}
