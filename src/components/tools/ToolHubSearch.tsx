"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, ChevronRight, ArrowRight, Sparkles, Filter, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToolDefinition } from "@/data/tools/registry";
import { useScroll, useMotionValueEvent } from "framer-motion";

interface CategoryMeta {
  name: string;
  description: string;
  subcategories: Record<string, string>;
}

interface ToolHubSearchProps {
  tools: ToolDefinition[];
  categories: Record<string, CategoryMeta>;
}

export function ToolHubSearch({ tools, categories }: ToolHubSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 10) {
      setIsHeaderHidden(true);
    } else {
      setIsHeaderHidden(false);
    }
  });

  // Category Filter Pills
  const categoryOptions = useMemo(() => {
    return [
      { id: "all", label: "All Tools", count: tools.length },
      ...Object.entries(categories).map(([key, cat]) => ({
        id: key,
        label: cat.name,
        count: tools.filter((t) => t.category === key).length,
      })),
    ];
  }, [tools, categories]);

  // Filter logic
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category match
      if (selectedCategory !== "all" && tool.category !== selectedCategory) {
        return false;
      }

      // Query match
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const titleMatch = tool.title.toLowerCase().includes(q);
      const descMatch = tool.description.toLowerCase().includes(q);
      const catMatch = tool.category.toLowerCase().includes(q);
      const subMatch = tool.subcategory ? tool.subcategory.toLowerCase().includes(q) : false;
      const tagMatch = tool.tag ? tool.tag.toLowerCase().includes(q) : false;

      return titleMatch || descMatch || catMatch || subMatch || tagMatch;
    });
  }, [tools, searchQuery, selectedCategory]);

  const isSearching = searchQuery.trim().length > 0 || selectedCategory !== "all";

  return (
    <div className="space-y-10">
      {/* Sticky Search Bar & Category Filter Bar */}
      <div
        className={`sticky z-40 transition-all duration-300 ${
          isHeaderHidden ? "top-3" : "top-20"
        }`}
      >
        <div
          className={`bg-card/70 border border-border/50 backdrop-blur-xl rounded-2xl shadow-xl transition-all duration-300 ${
            isScrolled ? "p-3 sm:p-4 shadow-2xl ring-1 ring-primary/20 space-y-2.5" : "p-4 sm:p-6 space-y-4"
          }`}
        >
          {/* Search Input Box */}
          <div className="relative flex items-center">
            <Search className={`absolute left-4 text-muted-foreground pointer-events-none transition-all ${isScrolled ? "h-4 w-4 left-3.5" : "h-5 w-5"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 80+ tools (e.g., 'JSON', 'PDF', 'ROI', 'SEO', 'Compressor', 'Salary')..."
              className={`w-full bg-background/70 border border-border/50 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all shadow-inner ${
                isScrolled ? "pl-9 pr-9 py-2 text-xs sm:text-sm" : "pl-11 pr-11 py-3.5 text-sm"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
            <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider pr-2 border-r border-border/30 shrink-0">
              <Filter className="h-3.5 w-3.5 mr-1 text-primary" /> Filter:
            </div>
            {categoryOptions.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                    isScrolled ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
                  } ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/30"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTERED RESULTS VIEW (Active search or category filter) */}
      {isSearching ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Search Results
              </h2>
              <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border/30">
                {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"} found
              </span>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              Reset Filters
            </button>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/20 border border-dashed border-border/40 rounded-2xl p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No tools matched your search</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any tools matching &quot;{searchQuery}&quot;. Try adjusting your query or category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Clear Search & View All Tools
              </button>
            </div>
          )}
        </div>
      ) : (
        /* DEFAULT VIEW: Categorized Master Section */
        <div className="space-y-16">
          {Object.entries(categories).map(([catId, cat]) => {
            const catTools = tools.filter((t) => t.category === catId);
            if (catTools.length === 0) return null;

            return (
              <div key={catId} className="space-y-6">
                <div className="border-b border-border/10 pb-4 flex items-end justify-between">
                  <div>
                    <Link href={`/tools/${catId}`} className="group inline-flex items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h2>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      {cat.description}
                    </p>
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground bg-card/60 px-2.5 py-1 rounded-full border border-border/30">
                    {catTools.length} utilities
                  </span>
                </div>

                {/* Subcategories (if any) or Grid of tools directly */}
                {Object.keys(cat.subcategories || {}).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(cat.subcategories).map(([subId, subName]) => {
                      const subTools = catTools.filter((t) => t.subcategory === subId);
                      if (subTools.length === 0) return null;
                      return (
                        <div key={subId} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary/80">
                              {subName}
                            </h3>
                            <div className="h-px bg-border/20 flex-1" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {subTools.map((tool) => (
                              <ToolCard key={tool.id} tool={tool} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper Tool Card Component
function ToolCard({ tool }: { tool: ToolDefinition }) {
  const href = tool.subcategory
    ? `/tools/${tool.category}/${tool.subcategory}/${tool.slug}`
    : `/tools/${tool.category}/${tool.slug}`;

  return (
    <Link href={href} className="group block h-full">
      <Card className="p-5 h-full bg-card/20 hover:bg-card/40 border border-border/40 hover:border-primary/30 transition-all duration-300 rounded-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              {tool.title}
              {tool.tag === "🔥" && (
                <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  New
                </span>
              )}
            </h4>
            {tool.status && (
              <span className="text-[9px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/15">
                {tool.status}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {tool.description}
          </p>
        </div>
        <div className="mt-5 pt-3.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-primary uppercase tracking-wider">
          <span>Initialize Tool</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
