"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Loader2,
  RotateCw,
  Trash2,
  CheckSquare,
  Square,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, degrees } from "pdf-lib";
import { PDFSession } from "./PDFSession";
import { getCachedPdfWorkerUrl } from "./pdfWorkerLoader";
import { useRouter } from "next/navigation";

const PDFJS_VERSION = "3.11.174";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 300;
const MAX_CANVAS_SIDE = 8000;

export interface PDFPageItem {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270 (added on top of the page's own rotation)
  selected: boolean;
  thumbnailUrl: string;
}

interface PDFWorkspaceProps {
  onProcess?: (
    pages: PDFPageItem[],
    pdfDoc: PDFDocument,
  ) => Promise<Uint8Array>;
  processButtonLabel?: string;
  toolSlug?: string;
  /** Force compress mode regardless of toolSlug */
  mode?: "copy" | "compress";
}

/* ── helpers ──────────────────────────────────────────────────── */

const formatBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(2)} MB`;

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Loads pdfjs AND configures its worker before returning, so callers can never
 * hit "No workerSrc specified" because of effect ordering.
 * Tip: for production, self-host the worker file instead of using the CDN.
 */
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      try {
        const lib = await import("pdfjs-dist");
        const v = lib.version || PDFJS_VERSION;
        const workerUrl = await getCachedPdfWorkerUrl(v);
        lib.GlobalWorkerOptions.workerSrc = workerUrl;
        return lib;
      } catch (err) {
        pdfjsPromise = null;
        throw err;
      }
    })();
  }
  return pdfjsPromise;
}

/**
 * Rasterize pages to JPEGs and rebuild a PDF. Output pages keep the ORIGINAL
 * page size; `scale` only controls image resolution (72 dpi × scale).
 * Trade-off: text is no longer selectable.
 */
async function rasterizePagesToPdf(
  pages: PDFPageItem[],
  sourceBytes: Uint8Array,
  options: { quality: number; scale: number },
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const pdfjsLib = await getPdfjs();
  // pdfjs may transfer (detach) the buffer it receives, so hand it a copy.
  const src = await pdfjsLib.getDocument({ data: sourceBytes.slice() }).promise;
  const out = await PDFDocument.create();

  try {
    for (let n = 0; n < pages.length; n++) {
      const pageItem = pages[n];
      const page = await src.getPage(pageItem.originalIndex + 1);

      const base = page.getViewport({ scale: 1 }); // true page size in points
      const safeScale = Math.min(
        options.scale,
        MAX_CANVAS_SIDE / Math.max(base.width, base.height),
      );
      const viewport = page.getViewport({ scale: safeScale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not acquire 2D canvas context");

      // JPEG has no alpha: without this, transparent pages turn black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport } as any).promise;

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", options.quality),
      );
      if (!blob) throw new Error(`Could not encode page ${n + 1}`);
      const jpegBytes = new Uint8Array(await blob.arrayBuffer());

      // free canvas memory right away (matters on big documents / mobile)
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();

      const img = await out.embedJpg(jpegBytes);
      const outPage = out.addPage([base.width, base.height]);
      outPage.drawImage(img, {
        x: 0,
        y: 0,
        width: base.width,
        height: base.height,
      });
      if (pageItem.rotation !== 0)
        outPage.setRotation(degrees(pageItem.rotation));

      onProgress?.(n + 1, pages.length);
      await tick(); // let the UI repaint between pages
    }
  } finally {
    src.destroy();
  }

  return await out.save({ useObjectStreams: true });
}

/* ── component ────────────────────────────────────────────────── */

export function PDFWorkspace({
  onProcess,
  processButtonLabel = "Export PDF Studio",
  toolSlug = "pdf-suite",
  mode,
}: PDFWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [thumbProgress, setThumbProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [procProgress, setProcProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);

  // Results
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [compressionNote, setCompressionNote] = useState<string | null>(null);

  // Compression controls (scale 1.5 ≈ 108 dpi: readable text, still small)
  const [compressQuality, setCompressQuality] = useState(0.6);
  const [compressScale, setCompressScale] = useState(1.5);

  const originalBytesRef = useRef<Uint8Array | null>(null);
  const loadedPageCountRef = useRef(0);
  const loadIdRef = useRef(0);

  const { toast } = useToast();
  const router = useRouter();

  const isCompressionMode =
    mode === "compress" || (toolSlug || "").toLowerCase().includes("compress");

  /* ── loading ─────────────────────────────────────────────────── */

  /** `bytes` must be a private copy: this component keeps it for later passes. */
  const loadPDFBytes = async (bytes: Uint8Array) => {
    const loadId = ++loadIdRef.current;
    const stale = () => loadId !== loadIdRef.current;

    setLoading(true);
    setPages([]);
    setPdfDoc(null);
    setProcessedBytes(null);
    setCompressionNote(null);
    setThumbProgress(null);

    try {
      const doc = await PDFDocument.load(bytes);
      const total = doc.getPageCount();
      if (total > MAX_PAGES)
        throw new Error(
          `This PDF has ${total} pages. The workspace supports up to ${MAX_PAGES}.`,
        );

      const pdfjsLib = await getPdfjs();
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;

      const extracted: PDFPageItem[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        if (stale()) {
          pdf.destroy();
          return;
        }
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not acquire 2D canvas context");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport } as any).promise;
        const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();

        extracted.push({
          id: `${i}-${loadId}`,
          originalIndex: i - 1,
          rotation: 0,
          selected: true,
          thumbnailUrl,
        });
        setThumbProgress({ done: i, total: pdf.numPages });
        if (i % 4 === 0) await tick();
      }
      pdf.destroy();
      if (stale()) return;

      originalBytesRef.current = bytes;
      loadedPageCountRef.current = extracted.length;
      setPdfDoc(doc);
      setPages(extracted);
    } catch (err: any) {
      if (stale()) return;
      console.error(err);
      const encrypted = /encrypt|password/i.test(String(err?.message));
      toast({
        variant: "destructive",
        title: "Couldn't open this PDF",
        description: encrypted
          ? "This PDF is password-protected. Remove the password first, then try again."
          : err?.message || "The file may be corrupted or isn't a valid PDF.",
      });
      // Don't leave a "loaded" file with nothing in the workspace
      setFile(null);
      setPages([]);
      setPdfDoc(null);
      originalBytesRef.current = null;
    } finally {
      if (!stale()) {
        setLoading(false);
        setThumbProgress(null);
      }
    }
  };

  // Restore the working PDF from an active session
  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      const session = await PDFSession.loadAsync();
      if (cancelled || !session) return;
      const bytes = new Uint8Array(session.data); // private copy
      setOriginalSize(bytes.byteLength);
      setFile(new File([bytes], session.name, { type: "application/pdf" }));
      loadPDFBytes(bytes.slice());
      toast({
        title: "Working PDF restored",
        description: `Loaded "${session.name}" from your active PDF session.`,
      });
    };
    restoreSession();
    return () => {
      cancelled = true;
      loadIdRef.current++; // cancel any in-flight load on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({
        variant: "destructive",
        title: "Not a PDF",
        description: "Choose a file ending in .pdf.",
      });
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `The limit is ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
      });
      return;
    }

    setFile(selected);
    setOriginalSize(selected.size);
    const bytes = new Uint8Array(await selected.arrayBuffer());
    loadPDFBytes(bytes);
  };

  /* ── page actions ────────────────────────────────────────────── */

  const handleRotatePage = (id: string) =>
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p,
      ),
    );

  const handleToggleSelect = (id: string) =>
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    );

  const handleDeletePage = (id: string) =>
    setPages((prev) => prev.filter((p) => p.id !== id));

  const handleSelectAll = (select: boolean) =>
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));

  /* ── processing ──────────────────────────────────────────────── */

  const defaultProcessHandler = async (
    selectedPages: PDFPageItem[],
    originalPdfDoc: PDFDocument,
  ): Promise<Uint8Array> => {
    const newPdf = await PDFDocument.create();
    const copied = await newPdf.copyPages(
      originalPdfDoc,
      selectedPages.map((p) => p.originalIndex),
    );
    copied.forEach((page, i) => {
      const extra = selectedPages[i].rotation;
      if (extra !== 0) {
        const native = page.getRotation().angle;
        page.setRotation(degrees((((native + extra) % 360) + 360) % 360));
      }
      newPdf.addPage(page);
    });
    return await newPdf.save({ useObjectStreams: true });
  };

  const handleAction = async () => {
    if (!pdfDoc || pages.length === 0) return;

    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      toast({
        variant: "destructive",
        title: "No pages selected",
        description: "Select at least one page to process.",
      });
      return;
    }

    setProcessing(true);
    setProcProgress(null);
    setCompressionNote(null);
    await tick(); // let the spinner paint before heavy work

    try {
      const processFn = onProcess || defaultProcessHandler;
      const structuralBytes = await processFn(selectedPages, pdfDoc);

      // "Untouched" = nothing deleted, deselected or rotated
      const untouched =
        selectedPages.length === loadedPageCountRef.current &&
        selectedPages.every((p) => p.rotation === 0);

      let finalBytes = structuralBytes;
      let note: string | null = null;

      if (isCompressionMode && !onProcess && originalBytesRef.current) {
        const candidates: { bytes: Uint8Array; kind: string }[] = [
          { bytes: structuralBytes, kind: "structural" },
        ];
        if (untouched)
          candidates.push({
            bytes: originalBytesRef.current,
            kind: "original",
          });

        try {
          const compressed = await rasterizePagesToPdf(
            selectedPages,
            originalBytesRef.current,
            { quality: compressQuality, scale: compressScale },
            (done, total) => setProcProgress({ done, total }),
          );
          candidates.push({ bytes: compressed, kind: "compressed" });
        } catch (err) {
          console.error("Compression failed", err);
          note =
            "The compression engine couldn't re-encode these pages, so the original structure was kept.";
        }

        const best = candidates.reduce((a, b) =>
          b.bytes.byteLength < a.bytes.byteLength ? b : a,
        );
        finalBytes = best.bytes;
        if (!note && best.kind !== "compressed") {
          note =
            best.kind === "original"
              ? "Compressing would have made the file larger, so your original was kept. This PDF is likely already optimized. Try a lower quality or render scale."
              : "Compressing would have made the file larger, so a plain copy was kept. Try a lower quality or render scale.";
        }
      }

      setCompressionNote(note);
      setProcessedBytes(finalBytes);
      setResultSize(finalBytes.byteLength);

      if (file) PDFSession.save(file.name, finalBytes);

      const delta = originalSize - finalBytes.byteLength;
      const pct = originalSize > 0 ? (delta / originalSize) * 100 : 0;

      if (isCompressionMode) {
        toast({
          title: delta > 0 && pct >= 1 ? "Compressed" : "Little or no change",
          description:
            delta > 0 && pct >= 1
              ? `Reduced by ${formatBytes(delta)} (${pct.toFixed(1)}%).`
              : "This PDF is already well optimized.",
        });
      } else {
        toast({
          title: "Done",
          description: "Your PDF is ready and saved to your active session.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Operation failed",
        description: err?.message || "Couldn't build the new PDF.",
      });
    } finally {
      setProcessing(false);
      setProcProgress(null);
    }
  };

  /* ── result actions ──────────────────────────────────────────── */

  const handleDownload = () => {
    if (!processedBytes || !file) return;
    const base = file.name
      .replace(/\.pdf$/i, "")
      .replace(/-(compressed|edited)$/i, "");
    const suffix = isCompressionMode ? "compressed" : "edited";
    const blob = new Blob([processedBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}-${suffix}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  /** Load the RESULT back into the workspace so what you see matches what's saved. */
  const keepEditingResult = () => {
    if (!processedBytes || !file) return;
    const bytes = processedBytes.slice();
    setFile(new File([bytes], file.name, { type: "application/pdf" }));
    setOriginalSize(bytes.byteLength);
    loadPDFBytes(bytes.slice());
  };

  /** Bring back every page of the currently loaded document (undo deletes). */
  const restoreOriginalPages = () => {
    if (originalBytesRef.current)
      loadPDFBytes(originalBytesRef.current.slice());
  };

  const handlePipelineAction = (targetToolSlug: string) => {
    router.push(`/tools/pdf/${targetToolSlug}`);
  };

  const clearSession = () => {
    loadIdRef.current++;
    setFile(null);
    setPages([]);
    setPdfDoc(null);
    setProcessedBytes(null);
    setCompressionNote(null);
    setLoading(false);
    originalBytesRef.current = null;
    PDFSession.clear();
  };

  const sizeDelta = originalSize - resultSize;
  const sizePct = originalSize > 0 ? (sizeDelta / originalSize) * 100 : 0;
  const selectedCount = pages.filter((p) => p.selected).length;

  /* ── render ──────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* File selection */}
      {!file ? (
        <div className="border-2 border-dashed border-border/40 hover:border-primary/45 rounded-2xl p-10 text-center cursor-pointer relative bg-secondary/10 transition-colors">
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            aria-label="Upload a PDF"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-primary opacity-60" />
            <h3 className="text-sm font-bold text-foreground">
              Upload your PDF
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Drag and drop or click to choose a PDF (up to{" "}
              {MAX_FILE_BYTES / 1024 / 1024} MB, {MAX_PAGES} pages). It never
              leaves your device.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-secondary/20 border border-border/30 rounded-xl gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={clearSession}
            className="text-xs font-bold text-destructive hover:underline shrink-0"
          >
            Close file
          </button>
        </div>
      )}

      {/* Loading previews */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Generating page previews
            {thumbProgress
              ? ` (${thumbProgress.done}/${thumbProgress.total})`
              : "…"}
          </p>
        </div>
      )}

      {/* Success state */}
      {processedBytes && (
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 text-emerald-500">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground">
                Your PDF is ready
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Saved to your active session, so you can use it in another tool.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border/10 py-4 font-mono text-xs">
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                Before
              </span>
              <span className="text-foreground font-bold">
                {formatBytes(originalSize)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                After
              </span>
              <span className="text-foreground font-bold">
                {formatBytes(resultSize)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                Size change
              </span>
              {originalSize === 0 ? (
                <span className="text-muted-foreground font-bold">—</span>
              ) : Math.abs(sizePct) < 0.5 ? (
                <span className="text-amber-500 font-bold">No change</span>
              ) : sizeDelta > 0 ? (
                <span className="text-emerald-500 font-bold">
                  {sizePct.toFixed(1)}% smaller
                </span>
              ) : (
                <span className="text-rose-500 font-bold">
                  {Math.abs(sizePct).toFixed(1)}% larger
                </span>
              )}
            </div>
          </div>

          {compressionNote && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{compressionNote}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button
              onClick={keepEditingResult}
              className="py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold text-muted-foreground transition-all flex items-center justify-center gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" /> Keep editing this result
            </button>
          </div>

          <div className="pt-4 border-t border-border/10 space-y-3">
            <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Do more with this PDF
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                "compress",
                "split",
                "rotate",
                "delete-pages",
                "pdf-to-text",
              ].map((actionSlug) => {
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

      {/* Compression controls */}
      {isCompressionMode && pages.length > 0 && !processedBytes && (
        <div className="p-4 rounded-xl border border-border/20 bg-secondary/10 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Gauge className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Compression settings
            </span>
          </div>
          <fieldset
            disabled={processing}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-0 p-0 m-0 min-w-0"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  JPEG quality
                </label>
                <span className="text-[11px] font-mono font-bold">
                  {Math.round(compressQuality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                step={5}
                value={Math.round(compressQuality * 100)}
                onChange={(e) =>
                  setCompressQuality(Number(e.target.value) / 100)
                }
                className="w-full accent-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Resolution
                </label>
                <span className="text-[11px] font-mono font-bold">
                  ≈ {Math.round(compressScale * 72)} DPI
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={250}
                step={10}
                value={Math.round(compressScale * 100)}
                onChange={(e) => setCompressScale(Number(e.target.value) / 100)}
                className="w-full accent-primary"
              />
            </div>
          </fieldset>
          <p className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
            <span>
              Compression turns pages into images, so text can no longer be
              selected or searched. It works best on scanned or image-heavy
              PDFs. Your original is kept automatically if the result would be
              larger.
            </span>
          </p>
        </div>
      )}

      {/* Empty state after deleting every page */}
      {file && !loading && !processedBytes && pages.length === 0 && pdfDoc && (
        <div className="p-6 rounded-xl border border-border/20 bg-secondary/10 text-center space-y-3">
          <p className="text-sm font-bold text-foreground">
            All pages were removed
          </p>
          <button
            onClick={restoreOriginalPages}
            className="text-xs font-bold text-primary hover:underline"
          >
            Restore all pages
          </button>
        </div>
      )}

      {/* Workspace */}
      {pages.length > 0 && !processedBytes && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/10 pb-3.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectAll(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
              >
                Select all
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                onClick={() => handleSelectAll(false)}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:underline"
              >
                Clear selection
              </button>
              {pages.length < loadedPageCountRef.current && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <button
                    onClick={restoreOriginalPages}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:underline"
                  >
                    Restore deleted pages
                  </button>
                </>
              )}
            </div>
            <div className="text-[11px] font-bold text-muted-foreground">
              Pages: <span className="text-foreground">{pages.length}</span>
              {" · "}
              Included: <span className="text-primary">{selectedCount}</span>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Only checked pages are exported. Deleting a page removes it from
            this view.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                className={`relative rounded-xl border p-2.5 flex flex-col items-center justify-between transition-all group bg-card/25 ${
                  page.selected
                    ? "border-primary/40 shadow-sm shadow-primary/5 bg-primary/[0.02]"
                    : "border-border/10 opacity-70"
                }`}
              >
                <button
                  onClick={() => handleToggleSelect(page.id)}
                  aria-label={`${page.selected ? "Exclude" : "Include"} page ${idx + 1}`}
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/20 z-10 text-primary transition-transform group-hover:scale-105"
                >
                  {page.selected ? (
                    <CheckSquare className="h-3.5 w-3.5" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-muted-foreground/60" />
                  )}
                </button>

                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-background/80 border border-border/20 text-[9px] font-bold text-foreground z-10">
                  Page {idx + 1}
                </div>

                <div className="w-full flex items-center justify-center p-3 relative h-36">
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${idx + 1}`}
                    className="max-h-full max-w-full rounded border border-border/10 shadow-sm transition-transform"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                </div>

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
                    aria-label={`Delete page ${idx + 1}`}
                    className="p-1 rounded bg-secondary/40 hover:bg-rose-500/10 border border-border/30 text-destructive transition-all"
                    title="Delete page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAction}
            disabled={processing || selectedCount === 0}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {procProgress
                  ? `Compressing page ${procProgress.done}/${procProgress.total}…`
                  : "Working…"}
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
