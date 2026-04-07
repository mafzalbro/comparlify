"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  X
} from "lucide-react";
import { CONVERSION_PATHS, SUPPORTED_FORMATS } from "@/components/tools/converters/constants";
import type { FormatCategory } from "@/components/tools/converters/types";
import { cn } from "@/lib/utils";

interface ConversionTool {
  from: string;
  to: string;
  label: string;
  category: FormatCategory;
  local: boolean;
  popular?: boolean;
}

const TRENDING_CONVERTERS = [
  { from: "pdf",  to: "png",  label: "PDF → PNG",    local: true },
  { from: "pdf",  to: "jpg",  label: "PDF → JPG",    local: true },
  { from: "jpg",  to: "pdf",  label: "JPG → PDF",    local: true },
  { from: "png",  to: "jpg",  label: "PNG → JPG",    local: true },
  { from: "html", to: "png",  label: "HTML → PNG",   local: true },
  { from: "jpg",  to: "webp", label: "JPG → WEBP",   local: true },
  { from: "pdf",  to: "pdf",  label: "Compress PDF", local: true },
  { from: "pptx", to: "pdf",  label: "PPTX → PDF",  local: false },
  { from: "xlsx", to: "csv",  label: "XLSX → CSV",   local: false },
  { from: "epub", to: "pdf",  label: "EPUB → PDF",   local: false },
];

export function ConverterDashboardSection({ moduleNumber }: { moduleNumber?: string }) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const ALL_TOOLS = useMemo(() => {
    const flattened: ConversionTool[] = [];
    CONVERSION_PATHS.forEach(path => {
      path.to.forEach(toId => {
        if (path.from === toId && path.driver !== 'compress-pdf' && path.driver !== 'image-to-image') return;
        const fromFormat = SUPPORTED_FORMATS.find(f => f.id === path.from);
        const toFormat = SUPPORTED_FORMATS.find(f => f.id === toId);
        if (!fromFormat || !toFormat) return;
        flattened.push({
          from: path.from,
          to: toId,
          label: `${fromFormat.name} to ${toFormat.name}`,
          category: path.category || fromFormat.category,
          local: path.driver !== 'cloud-remote',
          popular: path.popular
        });
      });
    });
    const seen = new Set<string>();
    return flattened.filter(t => {
      const key = `${t.from}-${t.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return isExpanded ? ALL_TOOLS : ALL_TOOLS.filter(t => TRENDING_CONVERTERS.some(tr => tr.from === t.from && tr.to === t.to)).slice(0, 10);
    return ALL_TOOLS.filter(t => 
      t.label.toLowerCase().includes(q) || 
      t.from.toLowerCase().includes(q) || 
      t.to.toLowerCase().includes(q)
    );
  }, [search, isExpanded, ALL_TOOLS]);

  const showAllPrompt = !search && !isExpanded;

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/10 pb-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
            Multimedia Hub
          </h2>
          <p className="text-muted-foreground font-medium">
            Instant document and media conversion — 100% in your browser. Zero uploads, absolute privacy.
          </p>
        </div>
        
        <div className="flex flex-col md:items-end gap-4">
          {moduleNumber && (
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              Module {moduleNumber}
            </div>
          )}
          {/* Global Search Option */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 60+ converters..."
              className="h-11 pl-11 pr-10 rounded-xl bg-card/60 border-border/10 focus:border-primary/30 focus:ring-primary/10 transition-all text-xs font-bold uppercase tracking-wider"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((tool, i) => (
          <MotionDiv
            key={`${tool.from}-${tool.to}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <Link
              href={`/tools/converters/${tool.from}/${tool.to}`}
              className="group flex flex-col gap-3 p-5 bg-card/40 hover:bg-card/80 border border-border/10 hover:border-primary/20 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground tracking-wider group-hover:bg-muted/80 transition-colors">
                    {tool.from.toUpperCase()}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary tracking-wider">
                    {tool.to.toUpperCase()}
                  </span>
                </div>
                {tool.local && (
                  <ShieldCheck className="h-3 w-3 text-emerald-400/40" />
                )}
              </div>
              
              <p className="text-xs font-black tracking-tight text-foreground/80 group-hover:text-primary transition-colors line-clamp-1">
                {tool.label}
              </p>
              
              <div className="flex items-center justify-between mt-1">
                <span className={cn(
                  "text-[8px] font-bold tracking-wide uppercase",
                  tool.local ? "text-emerald-400/60" : "text-blue-400/50"
                )}>
                  {tool.local ? "🛡 Local" : "☁ Cloud"}
                </span>
                <ChevronRight className="h-3 w-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </Link>
          </MotionDiv>
        ))}

        {/* "See all" card when only trending is shown */}
        {showAllPrompt && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full group flex flex-col items-center justify-center gap-3 p-5 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 rounded-2xl transition-all duration-300 hover:-translate-y-1 min-h-[120px]"
            >
              <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary text-center leading-tight">
                Inspect All<br/>60+ Converters
              </span>
            </button>
          </MotionDiv>
        )}
      </div>

      {search && filtered.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-4xl border border-dashed border-border/20">
          <p className="text-sm font-bold text-muted-foreground opacity-60">
            Scanning archives... no converter found for <span className="text-foreground">"{search}"</span>
          </p>
        </div>
      )}
    </div>
  );
}
