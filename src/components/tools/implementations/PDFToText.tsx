"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  FileText,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Download,
  CheckSquare,
  Square,
  Search,
  BookOpen,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdfToText } from "./pdf-actions";

export const PDFToText = forwardRef(
  ({ initialFile }: { initialFile?: File | null }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [extractedPages, setExtractedPages] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<"page" | "all">("page");
    const [focusedPage, setFocusedPage] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { toast } = useToast();
    const extractedRef = useRef(false);
    const listRef = useRef<HTMLDivElement>(null);
    const anchorIndexRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      triggerAction: () => {
        if (file) handleExtract(file);
      },
    }));

    useEffect(() => {
      if (initialFile && !extractedRef.current) {
        extractedRef.current = true;
        setFile(initialFile);
        handleExtract(initialFile);
      }
    }, [initialFile]);

    useEffect(() => {
      if (viewMode === "page" && listRef.current) {
        const activeEl = listRef.current.querySelector(
          `[data-page-idx="${focusedPage}"]`,
        );
        if (activeEl) {
          activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }, [focusedPage, viewMode]);

    const handleExtract = async (targetFile: File) => {
      if (!targetFile) return;
      setProcessing(true);
      setError(null);
      setExtractedPages([]);
      setViewMode("page");
      setFocusedPage(0);
      setSelectedPages(new Set());

      try {
        const pagesText = await pdfToText(targetFile);
        if (pagesText.every((t) => !t.trim())) {
          setError(
            "No selectable text found. This might be a scanned document containing only images.",
          );
        } else {
          setExtractedPages(pagesText);
          setSelectedPages(new Set(pagesText.map((_, i) => i)));
          toast({
            title: "Success!",
            description: `Text extracted from ${pagesText.length} pages.`,
          });
        }
      } catch (err: any) {
        setError(
          "Failed to extract text. Some PDFs are encrypted or corrupted.",
        );
      } finally {
        setProcessing(false);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        extractedRef.current = false;
        handleExtract(e.target.files[0]);
      }
    };

    const setPageSelection = (idx: number, isSelected: boolean) => {
      setSelectedPages((prev) => {
        const next = new Set(prev);
        if (isSelected) next.add(idx);
        else next.delete(idx);
        return next;
      });
    };

    const togglePageSelection = (idx: number) => {
      setSelectedPages((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
      anchorIndexRef.current = idx;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const direction = e.key === "ArrowDown" ? 1 : -1;
        let nextIndex = focusedPage + direction;
        nextIndex = Math.max(0, Math.min(nextIndex, extractedPages.length - 1));

        if (e.shiftKey) {
          if (anchorIndexRef.current === null)
            anchorIndexRef.current = focusedPage;

          const anchor = anchorIndexRef.current;
          const start = Math.min(anchor, nextIndex);
          const end = Math.max(anchor, nextIndex);

          const newSelection = new Set(selectedPages);
          for (let i = start; i <= end; i++) {
            newSelection.add(i);
          }
          setSelectedPages(newSelection);
        } else {
          anchorIndexRef.current = nextIndex;
        }

        setFocusedPage(nextIndex);
        setViewMode("page");
      } else if (e.key === " ") {
        e.preventDefault();
        togglePageSelection(focusedPage);
      } else if (e.key === "Enter") {
        e.preventDefault();
        setViewMode((v) => (v === "all" ? "page" : "all"));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedPages(new Set(extractedPages.map((_, i) => i)));
      }
    };

    const displayedText =
      viewMode === "all"
        ? extractedPages
            .map((text, i) => `--- Page ${i + 1} ---\n${text}`)
            .join("\n\n")
        : extractedPages[focusedPage] || "";

    const wordCount = displayedText.trim()
      ? displayedText.trim().split(/\s+/).length
      : 0;
    const charCount = displayedText.length;

    const visiblePages = extractedPages
      .map((text, idx) => ({ text, idx }))
      .filter(
        (p) =>
          !searchQuery ||
          p.text.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return (
      <div className="flex flex-col h-full w-full bg-background overflow-hidden text-foreground">
        {!file && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm font-bold">
              Waiting for file from workspace...
            </p>
          </div>
        )}

        {processing ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Extracting text from pages...
            </p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-2">
              Couldn't extract text
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
          </div>
        ) : extractedPages.length > 0 ? (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* SIDEBAR - Flush to left/right edges */}
            <aside
              className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-border/40 bg-card/30 flex flex-col min-h-0 focus:outline-none"
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <div className="p-3 border-b border-border/30 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 bg-background border border-border/40 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-2.5 space-y-1"
              >
                {!searchQuery && (
                  <div
                    onClick={() => setViewMode("all")}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors border mb-2 ${
                      viewMode === "all"
                        ? "bg-primary/10 border-primary/30"
                        : "bg-transparent border-transparent hover:bg-secondary/40"
                    }`}
                  >
                    <BookOpen
                      className={`mt-0.5 shrink-0 h-4 w-4 ${
                        viewMode === "all"
                          ? "text-primary"
                          : "text-muted-foreground/60"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-[11px] font-bold block mb-0.5 ${
                          viewMode === "all"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        See All Pages
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        View entire document text
                      </p>
                    </div>
                  </div>
                )}

                {visiblePages.map((p) => {
                  const isSelected = selectedPages.has(p.idx);
                  const isFocused =
                    viewMode === "page" && focusedPage === p.idx;
                  return (
                    <div
                      key={p.idx}
                      data-page-idx={p.idx}
                      onClick={() => {
                        setViewMode("page");
                        setFocusedPage(p.idx);
                        anchorIndexRef.current = p.idx;
                      }}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all border ${
                        isFocused
                          ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                          : "bg-transparent border-transparent hover:bg-secondary/40"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePageSelection(p.idx);
                        }}
                        className={`mt-0.5 shrink-0 transition-colors ${
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-[11px] font-bold block mb-0.5 ${
                            isFocused ? "text-primary" : "text-foreground"
                          }`}
                        >
                          Page {p.idx + 1}
                        </span>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                          {p.text.trim() || "(No text)"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2 border-t border-border/30 bg-muted/10 shrink-0 hidden lg:flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border border-border/50 px-1 rounded">
                    ↑↓
                  </kbd>{" "}
                  Nav
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border border-border/50 px-1 rounded">
                    Space
                  </kbd>{" "}
                  Sel
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border border-border/50 px-1 rounded">
                    Shift
                  </kbd>{" "}
                  Range
                </span>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-background">
              <div className="flex items-center justify-between px-5 h-12 border-b border-border/40 bg-card/30 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    {viewMode === "all" ? (
                      <>
                        <BookOpen className="h-4 w-4 text-primary" /> All Pages
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 text-primary" /> Page{" "}
                        {focusedPage + 1}
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground border-l border-border/40 pl-3 font-mono">
                    {wordCount} words · {charCount} chars
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "all" ? "page" : "all")
                    }
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 hover:bg-secondary text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors border border-border/40"
                  >
                    {viewMode === "all"
                      ? "View Page by Page"
                      : "View All Pages"}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(displayedText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-md hover:bg-background/50 border border-transparent hover:border-border/40"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy Text"}
                  </button>
                </div>
              </div>

              {/* Textarea with exact padding (p-8) to ensure text breathes from all 4 sides */}
              <textarea
                value={displayedText}
                readOnly
                spellCheck={false}
                className="flex-1 w-full p-6 sm:p-8 bg-transparent font-mono text-[13px] leading-relaxed text-foreground/90 focus:outline-none resize-none whitespace-pre-wrap selection:bg-primary/20"
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
