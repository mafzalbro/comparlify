"use client";

import React, { useState } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { MatchWizard } from "@/components/tools/match-wizard";
import { MatchResults } from "@/components/tools/match-results";
import { createProjectWithProfile, getPlatformMatches } from "@/app/actions/projects";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumb";

export default function CreatorMatchPage() {
    const [results, setResults] = useState<any[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const { toast } = useToast();

    const handleRunAlgorithm = async (formData: any) => {
        setIsCalculating(true);
        try {
            // 1. Create Project (Persistence)
            const response = await createProjectWithProfile({}, formData);
            
            if (response.error || !response.data?.projectId) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: typeof response.error === 'string' ? response.error : "Failed to create project workspace.",
                });
                return;
            }

            // 2. Fetch real matches from the engine
            const matchData = await getPlatformMatches(response.data.projectId);
            
            // Artificial delay for "Engineer" feel
            await new Promise(r => setTimeout(r, 800));
            
            setResults(matchData);

            toast({
                title: "Match Found",
                description: `Analyzed ${matchData.length} platforms against your requirements.`,
            });
        } catch (error) {
            console.error("Match error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "The matching algorithm encountered an error.",
            });
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Breadcrumbs 
                items={[
                    { name: "Home", href: "/" },
                    { name: "Tools", href: "/tools" },
                    { name: "Platform Finder" }
                ]}
                className="mb-8 pl-4 md:pl-0"
            />
            <div className="space-y-20">
                {/* Header Section */}
                <div className="text-center space-y-6">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
                             <ShieldCheck className="h-4 w-4" /> Professional Business Tools
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
                            PLATFORM <span className="text-primary">FINDER</span> <br />
                            <span className="uppercase opacity-20">Software Matchmaker</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic opacity-70">
                            Professional guidance to find the best software for your business, based on your budget and technical needs.
                        </p>
                    </MotionDiv>
                </div>

                {/* Main Interaction Area */}
                {results.length === 0 ? (
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <MatchWizard 
                          onComplete={handleRunAlgorithm}
                          isLoading={isCalculating}
                        />
                    </MotionDiv>
                ) : (
                    <MatchResults results={results} />
                )}

                {/* Authority Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 border-t border-border/10">
                    {[
                        { title: "No AI Bias", desc: "Pure logic updated daily against platform fee structures.", icon: Zap },
                        { title: "Project Saving", desc: "Results are saved to your account for long-term planning.", icon: Sparkles },
                        { title: "Smart Ranking", desc: "Detailed ranking across budget, features, and ease of use.", icon: ShieldCheck },
                    ].map((item, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                <item.icon className="h-5 w-5 text-primary opacity-50" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest">{item.title}</h4>
                            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed opacity-60">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
