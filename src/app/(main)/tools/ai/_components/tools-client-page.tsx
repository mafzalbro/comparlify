"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search as SearchIcon,
  Wand2,
  Sparkles,
  Zap,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { type Tool, categories, type ToolCategory } from "../tools";
import { AIGenericForm } from "@/components/ai-generic-form";
import { Card } from "@/components/ui/card";
import { iconMap } from "../tools";
import { MotionDiv } from "@/components/motion-wrapper";
import { cn } from "@/lib/utils";

export function ToolsClientPage({ allTools }: { allTools: Tool[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  const allCategories: (ToolCategory | "All")[] = ["All", ...categories];

  // Get active category from URL or default to 'All'
  const activeCategory = searchParams.get("category") || "All";

  // Find the first tool in the filtered list or the first tool overall
  const getInitialTool = (category: ToolCategory | "All") => {
    const filtered = allTools.filter(
      (tool) =>
        (category === "All" || tool.category === category) &&
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return filtered.length > 0 ? filtered[0] : null;
  };

  const [activeTool, setActiveTool] = useState<Tool | null>(
    getInitialTool(activeCategory as ToolCategory | "All"),
  );

  const handleTabChange = (category: string) => {
    const firstToolInNewCategory = getInitialTool(
      category as ToolCategory | "All",
    );
    setActiveTool(firstToolInNewCategory);
    router.push(`/tools/ai?category=${category}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-32 text-primary/5 -rotate-12 translate-x-24 -translate-y-24 select-none pointer-events-none">
        <Sparkles className="h-96 w-96" />
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-24 relative z-10"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 shadow-sm">
          <Wand2 className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Elite AI Dispatch
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-[1]">
          The Intelligence <span className="text-primary italic">Suite</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          A collection of high-signal AI models calibrated for surgical
          precision in content and strategy.
        </p>
      </MotionDiv>

      <Tabs
        value={activeCategory}
        onValueChange={handleTabChange}
        className="w-full relative z-10"
      >
        <div className="flex justify-center mb-16">
          <TabsList className="flex flex-wrap h-auto p-1.5 bg-card/60 backdrop-blur-3xl rounded-[1.5rem] border border-border/10 shadow-2xl">
            {allCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-500"
              >
                {category.replace(/([A-Z])/g, " $1").trim()}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {allCategories.map((category) => {
          const filteredTools = allTools.filter(
            (tool) =>
              (category === "All" || tool.category === category) &&
              tool.title.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          return (
            <TabsContent
              key={category}
              value={category}
              className="mt-0 ring-offset-background focus-visible:outline-none"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <MotionDiv
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1 lg:sticky lg:h-[calc(100vh-240px)] lg:top-36 self-start bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2rem] p-6 shadow-2xl flex flex-col"
                >
                  <div className="relative mb-8">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                    <Input
                      placeholder="Scan models..."
                      className="pl-12 h-14 bg-background/50 border-border/10 rounded-2xl focus-visible:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/40"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        const currentIsVisible = filteredTools.some(
                          (t) => t.id === activeTool?.id,
                        );
                        if (!currentIsVisible && filteredTools.length > 0) {
                          setActiveTool(filteredTools[0]);
                        } else if (filteredTools.length === 0) {
                          setActiveTool(null);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool) => (
                        <button
                          key={tool.slug}
                          onClick={() => setActiveTool(tool)}
                          className={cn(
                            "w-full text-left p-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden flex flex-col gap-2",
                            activeTool?.slug === tool.slug
                              ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]"
                              : "hover:bg-primary/5 text-muted-foreground hover:text-foreground border border-transparent",
                          )}
                        >
                          <div className="font-black text-xs uppercase tracking-widest relative z-10 flex items-center justify-between">
                            {tool.title}
                            {activeTool?.slug === tool.slug && (
                              <Zap className="h-3 w-3 animate-pulse" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "text-[10px] line-clamp-1 font-bold tracking-wider relative z-10",
                              activeTool?.slug === tool.slug
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground/40",
                            )}
                          >
                            {tool.description}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-12 text-center text-[10px] text-muted-foreground/40 italic font-black uppercase tracking-widest">
                        Zero Match Signal.
                      </div>
                    )}
                  </div>
                </MotionDiv>
                <div className="lg:col-span-3">
                  {activeTool ? (
                    <MotionDiv
                      key={activeTool.id}
                      initial={{ opacity: 0, scale: 0.98, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-12"
                    >
                      <div className="p-8 rounded-[2rem] bg-card/30 backdrop-blur-3xl border border-primary/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-8 -translate-y-8">
                          <BrainCircuit className="h-32 w-32" />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                          <div className="p-6 bg-primary/10 rounded-[1.5rem] shadow-inner text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-700">
                            {React.createElement(
                              iconMap[activeTool.Icon] || Wand2,
                              {
                                className:
                                  "h-12 w-12 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]",
                              },
                            )}
                          </div>
                          <div className="space-y-4 text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                              Active Intelligence Model
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tight">
                              {activeTool.title}
                            </h2>
                            <p className="text-lg text-muted-foreground/80 leading-relaxed font-medium max-w-2xl">
                              {activeTool.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-1 bg-border/5 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] backdrop-blur-3xl border border-border/5">
                        <div className="bg-card/40 rounded-[2.3rem] overflow-hidden p-6 md:p-10">
                          <AIGenericForm
                            key={activeTool.id}
                            tool={activeTool}
                          />
                        </div>
                      </div>
                    </MotionDiv>
                  ) : (
                    <Card className="flex items-center justify-center p-20 min-h-[500px] border-2 border-dashed border-border/10 rounded-[3rem] bg-secondary/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-pattern-light opacity-5 pointer-events-none"></div>
                      <div className="text-center text-muted-foreground max-w-sm relative z-10 space-y-8">
                        <div className="p-8 bg-muted rounded-[2rem] w-fit mx-auto border border-border/10 shadow-inner">
                          <Wand2 className="h-12 w-12 opacity-10" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">
                            Initializing Hub
                          </h3>
                          <p className="text-lg font-medium leading-relaxed">
                            Select an active intelligence model from the sidebar
                            to begin content generation protocols.
                          </p>
                        </div>
                        <div className="flex justify-center pt-8">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                            Awaiting Selection{" "}
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
