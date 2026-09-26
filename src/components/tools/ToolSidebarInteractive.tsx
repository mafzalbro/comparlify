"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Zap,
  Home,
  ChevronRight,
  Terminal,
  FileText,
  Image as ImageIcon,
  Calculator as CalcIcon,
  Globe,
} from "lucide-react";

interface SubToolOption {
  id: string;
  label: string;
  slug: string;
}

interface WorkspaceTab {
  id: string;
  label: string;
  iconName: string;
  count: number;
}

interface ToolSidebarInteractiveProps {
  workspaceTabs: WorkspaceTab[];
  subToolOptions: SubToolOption[];
  selectedCategory: string;
  activeSubTool: string;
  activeCategoryLabel: string;
  activeCategoryIconName: string;
}

const ICON_MAP: Record<string, any> = {
  Terminal,
  FileText,
  ImageIcon,
  CalcIcon,
  Globe,
};

export function ToolSidebarInteractive({
  workspaceTabs,
  subToolOptions,
  selectedCategory,
  activeSubTool,
  activeCategoryLabel,
  activeCategoryIconName,
}: ToolSidebarInteractiveProps) {
  const router = useRouter();
  const [inSubNavView, setInSubNavView] = useState<boolean>(true);

  const hasMultipleSubTools = subToolOptions.length > 1;
  const ActiveIcon = ICON_MAP[activeCategoryIconName] || Globe;

  const handleSubToolClick = (sub: SubToolOption) => {
    const targetPath = `/tools/${selectedCategory}/${sub.slug}`;
    router.push(targetPath);

    // If scrolling on a full page view (e.g. Web Diagnostics)
    const targetElem = document.getElementById(sub.id);
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCategoryClick = (catId: string) => {
    let defaultSub = "text-studio";
    if (catId === "pdf") defaultSub = "pdf-suite";
    else if (catId === "image") defaultSub = "image-studio";
    else if (catId === "calculators") defaultSub = "percentage-calculator";
    else if (catId === "web") defaultSub = "url-analyzer";

    router.push(`/tools/${catId}/${defaultSub}`);
  };

  return (
    <aside className="w-full md:w-56 bg-card/40 border-b md:border-b-0 md:border-r border-border/30 backdrop-blur-xl flex flex-col justify-between p-3 shrink-0 h-auto md:h-full z-20">
      <div className="space-y-3">
        {/* Logo */}
        <div className="flex items-center justify-between px-1 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
              C
            </div>
            <span className="font-extrabold text-xs tracking-tight text-foreground block leading-none">
              Comparlify Tools
            </span>
          </div>
        </div>

        <div className="h-px bg-border/20" />

        {/* DYNAMIC SIDEBAR LIST */}
        {inSubNavView && hasMultipleSubTools ? (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
            <button
              onClick={() => setInSubNavView(false)}
              className="w-full mb-2 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground text-xs font-bold flex items-center gap-1.5 border border-border/30 transition-all group"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180 text-primary transition-transform group-hover:-translate-x-0.5" />
              <span>All Workspaces</span>
            </button>

            <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
              <ActiveIcon className="h-3 w-3" />
              {activeCategoryLabel}
            </div>

            <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-none pr-0.5">
              {subToolOptions.map((sub) => {
                const isActive = activeSubTool === sub.id || activeSubTool === sub.slug;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubToolClick(sub)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-between border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                        : "bg-background/20 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/15"
                    }`}
                  >
                    <span className="truncate">{sub.label}</span>
                    {isActive && <Zap className="h-3 w-3 shrink-0 ml-1 fill-primary-foreground" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5">
              Workspaces:
            </div>
            {workspaceTabs.map((tab) => {
              const Icon = ICON_MAP[tab.iconName] || Globe;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleCategoryClick(tab.id)}
                  className={`w-full px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-between border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                      : "bg-background/20 hover:bg-secondary/70 text-muted-foreground hover:text-foreground border-border/15"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="pt-2 border-t border-border/20 mt-3 md:mt-0">
        <Link
          href="/"
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-background/50 hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/20 transition-all group"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Home className="h-3 w-3 text-primary" /> Return Home
          </span>
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
}
