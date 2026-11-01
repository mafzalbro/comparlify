"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Zap,
  Home,
  ChevronRight,
  ChevronLeft,
  Terminal,
  FileText,
  Image as ImageIcon,
  Calculator as CalcIcon,
  Globe,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface SubToolOption {
  id: string;
  label: string;
  slug: string;
  path: string;
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
  allTools: any[];
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
  allTools,
  selectedCategory,
  activeSubTool,
  activeCategoryLabel,
  activeCategoryIconName,
}: ToolSidebarInteractiveProps) {
  const router = useRouter();
  const [inSubNavView, setInSubNavView] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const ActiveIcon = ICON_MAP[activeCategoryIconName] || Globe;

  // Global search across ALL tools
  const displayedTools = useMemo(() => {
    if (!searchQuery.trim()) return subToolOptions;

    const q = searchQuery.toLowerCase();
    return allTools
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q),
      )
      .map((t) => ({
        id: t.id,
        label: t.title,
        slug: t.slug,
        path: t.subcategory
          ? `/tools/${t.category}/${t.subcategory}/${t.slug}`
          : `/tools/${t.category}/${t.slug}`,
      }))
      .slice(0, 15);
  }, [searchQuery, subToolOptions, allTools]);

  const handleSubToolClick = (sub: SubToolOption) => {
    router.push(sub.path);
    const targetElem = document.getElementById(sub.id);
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCategoryClick = (catId: string) => {
    setSearchQuery("");
    let defaultSub = "text-studio";
    if (catId === "pdf") defaultSub = "pdf-suite";
    else if (catId === "image") defaultSub = "image-studio";
    else if (catId === "calculators") defaultSub = "percentage-calculator";
    else if (catId === "web") defaultSub = "url-analyzer";

    router.push(`/tools/${catId}/${defaultSub}`);

    if (isCollapsed) setIsCollapsed(false);
    setInSubNavView(true);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-card/40 border-b md:border-b-0 md:border-r border-border/30 backdrop-blur-xl flex flex-col justify-between shrink-0 h-auto md:h-full z-20 overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header & Collapse Toggle */}
        <div
          className={`p-4 border-b border-border/20 flex items-center shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
              C
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-xs tracking-tight text-foreground whitespace-nowrap">
                Comparlify Tools
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors ${isCollapsed ? "hidden" : "block"}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Expand Toggle (Visible only when collapsed) */}
        {isCollapsed && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search Bar (Only when expanded) */}
        {!isCollapsed && (
          <div className="p-3 shrink-0">
            <div className="relative flex items-center">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="h-9 bg-background/50 border-border/30 rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Nav Area */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 ${isCollapsed ? "px-2 py-2" : "px-3 pb-4"}`}
        >
          {/* Framer Motion AnimatePresence for smooth list filtering */}
          <AnimatePresence mode="popLayout" initial={false}>
            {searchQuery && !isCollapsed ? (
              /* SEARCH RESULTS VIEW */
              <motion.div
                key="search-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <div className="px-1 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
                  <span>Search Results</span>
                  <span>{displayedTools.length}</span>
                </div>

                {displayedTools.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 text-center text-xs text-muted-foreground"
                  >
                    No tools found for "{searchQuery}"
                  </motion.div>
                ) : (
                  displayedTools.map((sub) => {
                    const isActive =
                      activeSubTool === sub.id || activeSubTool === sub.slug;
                    return (
                      <motion.button
                        key={sub.id}
                        layout // FLIP animation for smooth repositioning
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleSubToolClick(sub)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg font-semibold text-xs transition-colors relative ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        <span className="truncate block">{sub.label}</span>
                      </motion.button>
                    );
                  })
                )}
              </motion.div>
            ) : inSubNavView && subToolOptions.length > 1 && !isCollapsed ? (
              /* SUB-TOOL VIEW (Expanded) */
              <motion.div
                key="subtool-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <button
                  onClick={() => setInSubNavView(false)}
                  className="w-full mb-2 mt-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground text-xs font-bold flex items-center gap-1.5 border border-border/30 transition-all group"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180 text-primary transition-transform group-hover:-translate-x-0.5" />
                  <span>All Workspaces</span>
                </button>

                <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
                  <ActiveIcon className="h-3 w-3" />
                  {activeCategoryLabel}
                </div>

                {subToolOptions.map((sub) => {
                  const isActive =
                    activeSubTool === sub.id || activeSubTool === sub.slug;
                  return (
                    <motion.button
                      key={sub.id}
                      layout
                      onClick={() => handleSubToolClick(sub)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-between group relative ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-item"
                          className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="truncate">{sub.label}</span>
                      {isActive && (
                        <Zap className="h-3 w-3 shrink-0 ml-1 fill-primary" />
                      )}
                      {!isActive && (
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              /* WORKSPACE CATEGORY VIEW (Expanded or Collapsed) */
              <motion.div
                key="category-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`space-y-1 ${isCollapsed ? "pt-2" : ""}`}
              >
                {!isCollapsed && (
                  <div className="px-1 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Workspaces
                  </div>
                )}

                {/* Collapsed Back Button & Active Icon */}
                {isCollapsed && inSubNavView && subToolOptions.length > 1 && (
                  <>
                    <button
                      onClick={() => setInSubNavView(false)}
                      className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground flex items-center justify-center transition-all group"
                      title="Back to Workspaces"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180 text-primary" />
                    </button>
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <ActiveIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </>
                )}

                {/* Standard Category List */}
                {(!inSubNavView || subToolOptions.length <= 1 || isCollapsed) &&
                  workspaceTabs.map((tab) => {
                    const Icon = ICON_MAP[tab.iconName] || Globe;
                    const isActive = selectedCategory === tab.id;

                    if (isCollapsed) {
                      return (
                        <motion.button
                          layout
                          key={tab.id}
                          onClick={() => handleCategoryClick(tab.id)}
                          className={`w-10 h-10 mx-auto rounded-xl font-semibold text-xs transition-colors flex items-center justify-center group relative mb-1 ${
                            isActive
                              ? "text-primary bg-primary/10 border border-primary/20 shadow-sm"
                              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                          }`}
                          title={tab.label}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {isActive && (
                            <div className="absolute -left-1 w-1 h-4 bg-primary rounded-r-md" />
                          )}
                        </motion.button>
                      );
                    }

                    return (
                      <motion.button
                        layout
                        key={tab.id}
                        onClick={() => handleCategoryClick(tab.id)}
                        className={`w-full px-2.5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-between group ${
                          isActive
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </motion.button>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer (Home Button) */}
      <div
        className={`border-t border-border/20 shrink-0 ${isCollapsed ? "p-2 flex justify-center" : "p-3"}`}
      >
        <Link
          href="/"
          className={`flex items-center transition-all group ${
            isCollapsed
              ? "justify-center w-10 h-10 rounded-xl bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
              : "w-full justify-between px-2.5 py-2 rounded-lg bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/20"
          }`}
          title={isCollapsed ? "Return Home" : undefined}
        >
          {isCollapsed ? (
            <Home className="h-4 w-4 text-primary" />
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Home className="h-3 w-3 text-primary" /> Return Home
              </span>
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 text-muted-foreground" />
            </>
          )}
        </Link>
      </div>
    </motion.aside>
  );
}
