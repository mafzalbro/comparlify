"use client";

import React, { useState, useEffect } from "react";
import { FileText, Loader2, RotateCw, Trash2, CheckSquare, Square, Download, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { PDFSession } from "./PDFSession";
import { useRouter } from "next/navigation";

const PDFJS_VERSION = "3.11.174";

export interface PDFPageItem {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
  thumbnailUrl: string;
}

interface PDFWorkspaceProps {
  onProcess: (pages: PDFPageItem[], pdfDoc: PDFDocument) => Promise<Uint8Array>;
  processButtonLabel: string;
  toolSlug: string;
}

export function PDFWorkspace({ onProcess, processButtonLabel, toolSlug }: PDFWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);

  // Results / Success state
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [resultSize, setResultSize] = useState<number>(0);

  const { toast } = useToast();
  const router = useRouter();

  // Load PDF buffer into Workspace
  const loadPDFBuffer = async (buffer: ArrayBuffer, fileName: string) => {
    setLoading(true);
    setPages([]);
    setProcessedBytes(null);

    try {
      const doc = await PDFDocument.load(buffer);
      setPdfDoc(doc);

      const pdfjsLib = await import("pdfjs-dist");
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
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
  };

  // Check for active persistent session on mount
  useEffect(() => {
    const session = PDFSession.get();
    if (session) {
      setOriginalSize(session.data.byteLength);
      setFile(new File([session.data as any], session.name, { type: "application/pdf" }));
      loadPDFBuffer(session.data.buffer as any, session.name);
      toast({
        title: "Working PDF Restored",
        description: `Loaded "${session.name}" from your active PDF session.`,
      });
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      const buffer = await selectedFile.arrayBuffer();
      loadPDFBuffer(buffer, selectedFile.name);
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
      const bytes = await onProcess(pages, pdfDoc);
      setProcessedBytes(bytes);
      setResultSize(bytes.byteLength);

      // Save resulting bytes to the persistent session
      if (file) {
        PDFSession.save(file.name, bytes);
      }

      toast({
        title: "Success!",
        description: "Your PDF has been processed and saved to your active session.",
      });
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

  const handleDownload = () => {
    if (!processedBytes || !file) return;
    const blob = new Blob([processedBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `processed_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePipelineAction = (targetToolSlug: string) => {
    // Navigate and let the Session get loaded automatically on that page
    router.push(`/tools/pdf/${targetToolSlug}`);
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
              setProcessedBytes(null);
              PDFSession.clear();
            }}
            className="text-xs font-bold text-destructive hover:underline"
          >
            Clear Working Session
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

      {/* ── SUCCESS PIPELINE STATE (After processing completes) ────────── */}
      {processedBytes && (
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 text-emerald-500">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground">Operation Completed Successfully!</h3>
              <p className="text-xs text-muted-foreground font-medium">Your working document is updated and saved in memory.</p>
            </div>
          </div>

          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border/10 py-4 font-mono text-xs">
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">Original Size</span>
              <span className="text-foreground font-bold">{(originalSize / 1024).toFixed(2)} KB</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">Result Size</span>
              <span className="text-foreground font-bold">{(resultSize / 1024).toFixed(2)} KB</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">Saved Efficiency</span>
              <span className="text-emerald-500 font-bold">
                {originalSize > resultSize
                  ? `${(((originalSize - resultSize) / originalSize) * 100).toFixed(0)}% Smaller`
                  : "Optimized Structurally"
                }
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="h-4 w-4" /> Download Processed PDF
            </button>
            <button
              onClick={() => setProcessedBytes(null)}
              className="py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold text-muted-foreground transition-all"
            >
              Reset Workspace
            </button>
          </div>

          {/* Do More Pipeline Actions */}
          <div className="pt-4 border-t border-border/10 space-y-3">
            <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Do more with this PDF
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["compress", "split", "rotate", "delete-pages", "pdf-to-text"].map((actionSlug) => {
                // Don't show current tool action
                if (actionSlug === toolSlug) return null;
                const labelMap: Record<string, string> = {
                  compress: "Compress PDF",
                  split: "Split pages",
                  rotate: "Rotate pages",
                  "delete-pages": "Delete pages",
                  "pdf-to-text": "Extract text",
                };
                return (
                  <button
                    key={actionSlug}
                    onClick={() => handlePipelineAction(actionSlug)}
                    className="p-3 text-left rounded-xl border border-border/20 bg-secondary/15 hover:bg-secondary/30 hover:border-primary/30 transition-all text-xs font-bold text-foreground flex items-center justify-between group"
                  >
                    <span>{labelMap[actionSlug]}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Workspace ────────────────────────────────────────────── */}
      {pages.length > 0 && !processedBytes && (
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
