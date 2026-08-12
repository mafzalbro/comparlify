"use client";

import React, { useState, useEffect } from "react";
import { FileText, Loader2, RotateCw, Trash2, CheckSquare, Square, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, degrees } from "pdf-lib";

const PDFJS_VERSION = "3.11.174";

export interface PDFPageItem {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
  thumbnailUrl: string;
}

interface PDFWorkspaceProps {
  onProcess: (pages: PDFPageItem[], pdfDoc: PDFDocument) => Promise<void>;
  processButtonLabel: string;
}

export function PDFWorkspace({ onProcess, processButtonLabel }: PDFWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        const v = pdfjsLib.version || PDFJS_VERSION;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.min.mjs`;
      }).catch((err) => console.error("Could not load pdfjs-dist", err));
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      setPages([]);

      try {
        const fileBuffer = await selectedFile.arrayBuffer();
        const doc = await PDFDocument.load(fileBuffer);
        setPdfDoc(doc);

        const pdfjsLib = await import("pdfjs-dist");
        const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
        const pdf = await loadingTask.promise;

        const extractedPages: PDFPageItem[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport } as any).promise;
            const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);

            extractedPages.push({
              id: `${i}-${Date.now()}`,
              originalIndex: i - 1,
              rotation: 0,
              selected: true,
              thumbnailUrl,
            });
          }
        }

        setPages(extractedPages);
      } catch (err) {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Error Loading PDF",
          description: "Failed to render visual page previews. This PDF might be encrypted or corrupted.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const handleToggleSelect = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleDeletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const handleAction = async () => {
    if (!pdfDoc || pages.length === 0) return;
    setProcessing(true);
    try {
      await onProcess(pages, pdfDoc);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: err.message || "Failed to compile the new PDF document.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── File Selection ────────────────────────────────────────── */}
      {!file ? (
        <div className="border-2 border-dashed border-border/40 hover:border-primary/45 rounded-2xl p-10 text-center cursor-pointer relative bg-secondary/10 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-primary opacity-60" />
            <h3 className="text-sm font-bold text-foreground">Upload your PDF workspace file</h3>
            <p className="text-xs text-muted-foreground font-medium">Drag and drop or click to choose a local PDF</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-secondary/20 border border-border/30 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
              <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setPages([]);
              setPdfDoc(null);
            }}
            className="text-xs font-bold text-destructive hover:underline"
          >
            Choose Another File
          </button>
        </div>
      )}

      {/* ── Loading Previews ─────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Generating visual page thumbnails...</p>
        </div>
      )}

      {/* ── Workspace ────────────────────────────────────────────── */}
      {pages.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/10 pb-3.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
              >
                Select All
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                onClick={() => handleSelectAll(false)}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:underline"
              >
                Clear Selection
              </button>
            </div>
            <div className="text-[11px] font-bold text-muted-foreground">
              Total Pages in Workspace: <span className="text-foreground">{pages.length}</span>
            </div>
          </div>

          {/* Grid of thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                className={`relative rounded-xl border p-2.5 flex flex-col items-center justify-between transition-all group bg-card/25 ${
                  page.selected ? "border-primary/40 shadow-sm shadow-primary/5 bg-primary/[0.02]" : "border-border/10 opacity-70"
                }`}
              >
                {/* Checkbox overlay */}
                <button
                  onClick={() => handleToggleSelect(page.id)}
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/20 z-10 text-primary transition-transform group-hover:scale-105"
                >
                  {page.selected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5 text-muted-foreground/60" />}
                </button>

                {/* Page number */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-background/80 border border-border/20 text-[9px] font-bold text-foreground z-10">
                  Page {idx + 1}
                </div>

                {/* Thumbnail image */}
                <div className="w-full flex items-center justify-center p-3 relative h-36">
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${idx + 1}`}
                    className="max-h-full max-w-full rounded border border-border/10 shadow-sm transition-transform"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                </div>

                {/* Page actions */}
                <div className="w-full flex items-center justify-between border-t border-border/10 pt-2 mt-2 gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRotatePage(page.id)}
                    className="flex-1 py-1 rounded bg-secondary/40 hover:bg-secondary border border-border/30 hover:text-primary transition-all flex items-center justify-center gap-1 text-[10px] font-bold"
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-3 w-3" /> Rotate
                  </button>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="p-1 rounded bg-secondary/40 hover:bg-rose-500/10 border border-border/30 text-destructive transition-all"
                    title="Delete Page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAction}
            disabled={processing || !pages.some((p) => p.selected)}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Compiling Document...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> {processButtonLabel}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
