"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { MotionDiv } from "./motion-wrapper";
import { 
  CheckCircle2, 
  Circle, 
  ArrowDown, 
  Layers, 
  Terminal, 
  Zap,
  Layout,
  FileText,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  "Introduction": Play,
  "Step": Zap,
  "Phase": Layers,
  "Technical": Terminal,
  "Design": Layout,
  "Content": FileText,
  "Conclusion": CheckCircle2,
};

interface WorkflowStep {
  title: string;
  content: string;
  type: "header" | "list" | "text" | "code";
  icon?: any;
}

const MarkdownContent = dynamic(() => import("./markdown-content").then(m => m.MarkdownContent), {
  ssr: true,
});

interface WorkflowNode {
  title: string;
  content: string;
}

interface WorkflowBranch {
  title: string;
  nodes: WorkflowNode[];
}

interface WorkflowRendererProps {
  content: string;
  structuredData?: WorkflowBranch[] | null;
  isLoading?: boolean;
}

export function WorkflowRenderer({ content, structuredData, isLoading }: WorkflowRendererProps) {
  const steps = useMemo(() => {
    if (structuredData) return [];
    if (!content) return [] as WorkflowStep[];
    // ... existing parser logic as fallback ...
    const lines = content.split("\n");
    const parsedSteps: WorkflowStep[] = [];
    let currentTitle = "Overview";
    let currentContent: string[] = [];
    let currentIcon = Play;

    const pushStep = () => {
      if (currentContent.length > 0 || currentTitle !== "Overview") {
        parsedSteps.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
          type: "text",
          icon: currentIcon,
        });
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith("### ") || trimmedLine.startsWith("## ") || trimmedLine.startsWith("---")) {
        pushStep();
        currentTitle = trimmedLine.replace(/^[#\-\s]+/, "") || "Section";
        currentContent = [];
        const matchedKey = Object.keys(ICON_MAP).find(key => currentTitle.toLowerCase().includes(key.toLowerCase()));
        currentIcon = matchedKey ? ICON_MAP[matchedKey] : Circle;
      } else {
        currentContent.push(line);
      }
    }
    pushStep();
    return parsedSteps;
  }, [content, structuredData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-primary">Mapping System Logic...</p>
      </div>
    );
  }

  if (structuredData) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-12 pb-20">
        {structuredData.map((branch, bIdx) => (
          <MotionDiv
            key={bIdx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: bIdx * 0.1, type: "spring", stiffness: 100 }}
            className="group relative"
          >
            {/* Branch Header as a "Node" */}
            <div className="relative z-10 flex items-center gap-4 px-8 py-5 bg-linear-to-r from-primary to-emerald-500 text-black rounded-3xl shadow-[0_15px_35px_rgba(var(--primary-rgb),0.2)] mb-10 overflow-hidden">
               <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               <div className="p-2 bg-black/10 rounded-xl backdrop-blur-sm">
                 <Layers className="h-6 w-6" />
               </div>
               <div>
                 <h3 className="font-black uppercase tracking-tighter text-xl leading-tight">{branch.title}</h3>
                 <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{branch.nodes.length} Actions Found</p>
               </div>
            </div>
            
            {/* The Branch Path */}
            <div className="relative ml-12 pl-10 border-l-[3px] border-primary/30 space-y-8 py-2">
              {branch.nodes.map((node, nIdx) => (
                <MotionDiv
                  key={nIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (bIdx * 0.1) + (nIdx * 0.05) }}
                  className="relative"
                >
                  {/* Circle on path */}
                  <div className="absolute -left-[3.05rem] top-6 w-5 h-5 rounded-full border-[3px] border-primary bg-background shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-20 group-hover:scale-125 transition-transform" />
                  
                  {/* Connector Arm */}
                  <div className="absolute -left-[2.1rem] top-[1.4rem] w-8 h-[3px] bg-primary/30" />

                  <div className="p-6 rounded-4xl bg-card/50 border border-border/50 hover:border-primary/40 hover:bg-card/80 transition-all duration-300 group/node shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                         <span className="text-[10px] font-black">{nIdx + 1}</span>
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-tight text-foreground group-hover/node:text-primary transition-colors">
                        {node.title}
                      </h4>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed pl-2 border-l border-border/10">
                      <MarkdownContent content={node.content} className="prose dark:prose-invert prose-p:my-2 prose-headings:text-sm prose-headings:font-black prose-li:my-1" />
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10 max-w-3xl mx-auto">
      {steps.map((step: WorkflowStep, idx: number) => (
        <MotionDiv
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="relative pl-12"
        >
          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div className="absolute left-4.5 top-10 -bottom-12 w-0.5 bg-linear-to-b from-primary/50 to-transparent" />
          )}

          {/* Icon/Node */}
          <div className="absolute left-0 top-1 p-2 bg-primary/20 rounded-xl border border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
            {step.icon && <step.icon className="h-5 w-5" />}
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-black tracking-tight text-foreground uppercase italic group-hover:text-primary transition-colors">
              {step.title}
            </h4>
            <div className="p-6 rounded-3xl bg-secondary/5 border border-border/10 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all">
               <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                 <MarkdownContent content={step.content.trim()} />
               </div>
            </div>
          </div>
        </MotionDiv>
      ))}
    </div>
  );
}
