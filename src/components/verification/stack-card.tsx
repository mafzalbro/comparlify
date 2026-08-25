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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Card className="h-full bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors rounded-2xl overflow-hidden flex flex-col p-5 relative shadow-md">
                {stack.isVerified && (
                    <div className="absolute top-5 right-5 z-20">
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-extrabold uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" /> Verified Stack
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-9 w-9 border border-primary/20">
                        <AvatarImage src={stack.user.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xs">
                            {stack.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="text-xs font-extrabold tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">
                            {stack.user.name || "Anonymous Creator"}
                        </h4>
                        <div className="flex items-center gap-1.5">
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

                <div className="flex-1 space-y-3">
                    <div>
                        <h3 className="text-base font-extrabold tracking-tight mb-1 line-clamp-1 italic">
                            {stack.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                            {stack.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        {stack.platforms.slice(0, 3).map((sp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-muted/40 border border-border/10 flex items-center justify-center p-1 overflow-hidden">
                                        <img src={sp.platform.logoUrl} alt={sp.platform.name} className="h-full w-full object-contain transition-all duration-300" />
                                    </div>
                                    <span className="text-xs font-extrabold tracking-tight">{sp.platform.name}</span>
                                </div>
                                <span className="text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground/60 italic">{sp.role}</span>
                            </div>
                        ))}
                        {stack.platforms.length > 3 && (
                            <div className="text-center py-0.5">
                                <span className="text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground/50">+{stack.platforms.length - 3} More Components</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-primary opacity-60" />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">High Efficiency</span>
                    </div>
                    {stack.verificationUrl && (
                        <Link 
                            href={stack.verificationUrl} 
                            target="_blank"
                            className="p-1.5 rounded-lg bg-muted/40 border border-border/20 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    )}
                </div>
            </Card>
        </MotionDiv>
    );
}
