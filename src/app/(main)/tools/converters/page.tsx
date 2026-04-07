"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Sheet,
  BookOpen,
  MonitorPlay,
  ArrowRight,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumb";

import { CONVERSION_PATHS, SUPPORTED_FORMATS } from "@/components/tools/converters/constants";
import type { FormatCategory } from "@/components/tools/converters/types";

// ── Tool definitions (Derived from constants) ───────────────────────────────

interface ConversionTool {
  from: string;
  to: string;
  label: string;
  category: FormatCategory;
  local: boolean;
  popular?: boolean;
}

// ── Category config ─────────────────────────────────────────────────────────

const CATEGORIES: { id: FormatCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all",          label: "All Tools",     icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "document",     label: "Documents",     icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "image",        label: "Images",        icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: "video",        label: "Video",         icon: <Film className="h-3.5 w-3.5" /> },
  { id: "audio",        label: "Audio",         icon: <Music className="h-3.5 w-3.5" /> },
  { id: "spreadsheet",  label: "Spreadsheets",  icon: <Sheet className="h-3.5 w-3.5" /> },
  { id: "presentation", label: "Presentations", icon: <MonitorPlay className="h-3.5 w-3.5" /> },
  { id: "ebook",        label: "eBooks",        icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: "archive",      label: "Archives",      icon: <Archive className="h-3.5 w-3.5" /> },
];

// ── Tool card ────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: ConversionTool }) {
  return (
    <Link
      href={`/tools/converters/${tool.from}/${tool.to}`}
      className="group relative flex flex-col gap-2.5 p-4 bg-card/40 hover:bg-card/80 border border-border/10 hover:border-primary/20 rounded-2xl transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Badge row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
            .{tool.from.toUpperCase()}
          </span>
          <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            .{tool.to.toUpperCase()}
          </span>
        </div>
        {tool.local ? (
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/70 flex items-center gap-0.5">
            <ShieldCheck className="h-2.5 w-2.5" /> Local
          </span>
        ) : (
          <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/50 flex items-center gap-0.5">
            ☁ Cloud
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">
        {tool.label}
      </p>

      {/* Popular star */}
      {tool.popular && (
        <span className="absolute top-2.5 right-10 text-amber-400/50 text-[10px]">★</span>
      )}
    </Link>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ConverterSuitePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FormatCategory | "all">("all");

  const TOOLS = useMemo(() => {
    const flattened: ConversionTool[] = [];
    CONVERSION_PATHS.forEach(path => {
      path.to.forEach(toId => {
        // Skip self-conversions except for compress/local formats
        if (path.from === toId && path.driver !== 'compress-pdf' && path.driver !== 'image-to-image') return;
        
        const fromFormat = SUPPORTED_FORMATS.find(f => f.id === path.from);
        const toFormat = SUPPORTED_FORMATS.find(f => f.id === toId);
        
        if (!fromFormat || !toFormat) return;

        // Determine category (prefer path-specific category if defined, otherwise use fromFormat category)
        const category = path.category || fromFormat.category;

        flattened.push({
          from: path.from,
          to: toId,
          label: `${fromFormat.name} to ${toFormat.name}`,
          category: category,
          local: path.driver !== 'cloud-remote',
          popular: path.popular
        });
      });
    });
    // Remove duplicates based on from-to pair (CONVERSION_PATHS might have overlapping defs)
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
    return TOOLS.filter(t => {
      const matchesSearch =
        !q ||
        t.label.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "all" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, TOOLS]);

  const popularTools = useMemo(() => TOOLS.filter(t => t.popular), [TOOLS]);

  return (
    <div className="min-h-screen text-foreground">
      {/* Atmosphere blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs 
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Converters" }
          ]}
          className="mb-8 pl-4 md:pl-0"
        />
        <div className="space-y-10">

        {/* ── Hero + Search ──────────────────────────────────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="pt-4 text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            Reliable Conversion Engine v4.0.2
          </div>

          <div>
            <h1 className="text-4xl md:text-[4.5rem] font-black tracking-tighter leading-none mb-3">
              Converter <span className="text-primary italic">Suite</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium max-w-lg mx-auto opacity-70 leading-relaxed">
              Every file conversion you'll ever need. Most tools run <strong className="text-foreground opacity-90">directly in your browser</strong> — zero uploads, instant results.
            </p>
          </div>

          {/* Giant search bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search tools — try "PDF to JPG", "MP3", "compress"...'
              className="h-14 pl-14 pr-6 text-sm font-medium bg-card/60 backdrop-blur-xl border-border/20 rounded-2xl shadow-lg placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </MotionDiv>

        {/* ── Category Pills ─────────────────────────────────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border
                ${activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.04]"
                  : "bg-card/40 text-muted-foreground border-border/10 hover:bg-card/80 hover:border-border/20 hover:text-foreground"
                }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </MotionDiv>

        {/* ── Popular (when no search/filter active) ─────────────────── */}
        {!search && activeCategory === "all" && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                ⭐ Most Popular
              </span>
              <div className="flex-1 h-px bg-border/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {popularTools.map(t => (
                <ToolCard key={`${t.from}-${t.to}`} tool={t} />
              ))}
            </div>
          </MotionDiv>
        )}

        {/* ── All / Filtered results ─────────────────────────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="space-y-4 pb-16"
        >
          {/* Section header */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              {search
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                : activeCategory === "all"
                ? "All Tools"
                : CATEGORIES.find(c => c.id === activeCategory)?.label}
            </span>
            <div className="flex-1 h-px bg-border/10" />
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(t => (
                <ToolCard key={`${t.from}-${t.to}-${t.label}`} tool={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="text-5xl opacity-20">🔍</div>
              <p className="text-sm font-bold text-muted-foreground opacity-60">
                No tools found for <span className="text-foreground">"{search}"</span>
              </p>
              <p className="text-xs text-muted-foreground opacity-40">
                Try a format name like "PDF", "MP4", or "XLSX"
              </p>
              <button
                onClick={() => setSearch("")}
                className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </MotionDiv>
      </div>
    </div>
  </div>
  );
}
