"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  RotateCw,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  Download,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Pencil,
  Layers,
  Files,
  Image as ImageIcon,
  Type,
  Undo2,
  Redo2,
  Search,
  Command as CommandIcon,
  X,
  Eye,
  LayoutGrid,
  Droplet,
  Hash,
  GripVertical,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { PDFSession } from "./PDFSession";
import { getCachedPdfWorkerUrl } from "./pdfWorkerLoader";
import { useRouter } from "next/navigation";
import { MergePDF } from "./MergePDF";
import { JPGToPDF } from "./JPGToPDF";
import { PDFToText } from "./PDFToText";
import { PDFToJPG } from "./PDFToJPG";
import { PDFToPNG } from "./PDFToPNG";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PDFJS_VERSION = "3.11.174";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_PAGES = 300;
const MAX_CANVAS_SIDE = 8000;
const MAX_HISTORY = 50;

export interface PDFPageItem {
  id: string;
  originalIndex: number;
  rotation: number;
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
  mode?: "copy" | "compress";
}

type IconType = React.ComponentType<{ className?: string }>;

interface Cmd {
  id: string;
  group: string;
  label: string;
  keywords?: string;
  shortcut?: string;
  icon?: IconType;
  run: () => void;
}

const TOOLS: { id: string; label: string; icon: IconType; path: string }[] = [
  {
    id: "merge-pdf",
    label: "Merge PDF",
    icon: Files,
    path: "/tools/pdf/merge",
  },
  {
    id: "split-pdf",
    label: "Split Pages",
    icon: Layers,
    path: "/tools/pdf/split",
  },
  {
    id: "organize-pdf",
    label: "Organize Pages",
    icon: LayoutGrid,
    path: "/tools/pdf/organize",
  },
  {
    id: "compress-pdf",
    label: "Compress PDF",
    icon: Gauge,
    path: "/tools/pdf/compress",
  },
  {
    id: "pdf-rotator",
    label: "Rotate Pages",
    icon: RotateCw,
    path: "/tools/pdf/rotate",
  },
  {
    id: "watermark-pdf",
    label: "Watermark",
    icon: Droplet,
    path: "/tools/pdf/watermark",
  },
  {
    id: "page-numbers-pdf",
    label: "Page Numbers",
    icon: Hash,
    path: "/tools/pdf/page-numbers",
  },
  {
    id: "extract-pages-pdf",
    label: "Extract Pages",
    icon: Pencil,
    path: "/tools/pdf/extract-pages",
  },
  {
    id: "delete-pages-pdf",
    label: "Delete Pages",
    icon: Trash2,
    path: "/tools/pdf/delete-pages",
  },
  {
    id: "jpg-to-pdf",
    label: "JPG to PDF",
    icon: ImageIcon,
    path: "/tools/pdf/jpg-to-pdf",
  },
  {
    id: "pdf-to-jpg",
    label: "PDF to JPG",
    icon: ImageIcon,
    path: "/tools/pdf/pdf-to-jpg",
  },
  {
    id: "pdf-to-png",
    label: "PDF to PNG",
    icon: ImageIcon,
    path: "/tools/pdf/pdf-to-png",
  },
  {
    id: "pdf-to-text",
    label: "PDF to Text",
    icon: Type,
    path: "/tools/pdf/pdf-to-text",
  },
];

const SUB_TOOL_SLUGS = [
  "merge",
  "merge-pdf",
  "jpg-to-pdf",
  "pdf-to-text",
  "pdf-to-jpg",
  "pdf-to-png",
];

const QUALITY_PRESETS = [
  { label: "High", value: 0.85 },
  { label: "Balanced", value: 0.6 },
  { label: "Smallest", value: 0.35 },
];

const formatBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(2)} MB`;

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function isToolActive(toolSlug: string | undefined, id: string) {
  return (
    toolSlug === id ||
    toolSlug === id.replace("-pdf", "") ||
    (toolSlug === "rotate" && id === "pdf-rotator") ||
    (toolSlug === "compress" && id === "compress-pdf") ||
    (toolSlug === "split" && id === "split-pdf") ||
    (toolSlug === "extract-pages" && id === "extract-pages-pdf") ||
    (toolSlug === "delete-pages" && id === "delete-pages-pdf") ||
    (toolSlug === "organize" && id === "organize-pdf") ||
    (toolSlug === "watermark" && id === "watermark-pdf") ||
    (toolSlug === "page-numbers" && id === "page-numbers-pdf")
  );
}

function Tip({
  label,
  side = "bottom",
  className = "inline-flex",
  children,
}: {
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      try {
        const lib = await import("pdfjs-dist");
        const workerUrl = await getCachedPdfWorkerUrl(
          lib.version || PDFJS_VERSION,
        );
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

function pdfOptions(lib: typeof import("pdfjs-dist"), data: Uint8Array) {
  const base = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version || PDFJS_VERSION}`;
  return {
    data,
    cMapUrl: `${base}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}/standard_fonts/`,
    useSystemFonts: true,
    wasmUrl: `${base}/wasm/`,
    iccsUrl: `${base}/iccs/`,
  };
}

async function rasterizePagesToPdf(
  pages: PDFPageItem[],
  sourceBytes: Uint8Array,
  options: { quality: number; scale: number },
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const pdfjsLib = await getPdfjs();
  const src = await pdfjsLib.getDocument(
    pdfOptions(pdfjsLib, sourceBytes.slice()),
  ).promise;
  const out = await PDFDocument.create();
  try {
    for (let n = 0; n < pages.length; n++) {
      const pageItem = pages[n];
      const page = await src.getPage(pageItem.originalIndex + 1);
      const base = page.getViewport({ scale: 1 });
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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport } as any).promise;
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", options.quality),
      );
      if (!blob) throw new Error(`Could not encode page ${n + 1}`);
      const jpegBytes = new Uint8Array(await blob.arrayBuffer());
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
      await tick();
    }
  } finally {
    src.destroy();
  }
  return await out.save({ useObjectStreams: true });
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
};

export function PDFWorkspace({
  onProcess,
  processButtonLabel = "Export PDF",
  toolSlug = "pdf-suite",
  mode,
}: PDFWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);
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
  const [hl, setHl] = useState<string[]>([]);

  // Drag & Drop state for Organize mode
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);

  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [compressionNote, setCompressionNote] = useState<string | null>(null);

  const [compressQuality, setCompressQuality] = useState(0.6);
  const [compressScale, setCompressScale] = useState(1.5);
  const [pageRanges, setPageRanges] = useState<
    { id: string; from: string; to: string }[]
  >([{ id: "1", from: "", to: "" }]);

  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkSize, setWatermarkSize] = useState(60);
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const [watermarkColor, setWatermarkColor] = useState("#ff0000");

  const [pageNumberFormat, setPageNumberFormat] = useState(
    "Page {n} of {total}",
  );
  const [pageNumberSize, setPageNumberSize] = useState(12);
  const [pageNumberPosition, setPageNumberPosition] = useState<
    "bottom-center" | "bottom-right" | "bottom-left"
  >("bottom-center");
  const [pageNumberColor, setPageNumberColor] = useState("#000000");

  const [derived, setDerived] = useState(false);
  const [preview, setPreview] = useState<{
    url: string;
    size: number;
    pageNo: number;
    w: number;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewActual, setPreviewActual] = useState(false);

  const originalBytesRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<{ name: string; bytes: Uint8Array } | null>(null);
  const previewDocRef = useRef<{ bytes: Uint8Array; doc: any } | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const loadedPageCountRef = useRef(0);
  const loadIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paletteListRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<{ triggerAction: () => void } | null>(null);
  const clearedRef = useRef(false);

  const pagesRef = useRef<PDFPageItem[]>([]);
  pagesRef.current = pages;
  const past = useRef<PDFPageItem[][]>([]);
  const future = useRef<PDFPageItem[][]>([]);
  const anchorRef = useRef<string | null>(null);
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});

  const { toast } = useToast();
  const router = useRouter();

  const isCompressionMode =
    mode === "compress" || (toolSlug || "").toLowerCase().includes("compress");
  const isRotateMode = toolSlug === "rotate";
  const isDeleteMode = toolSlug === "delete-pages";
  const isSplitMode = toolSlug === "split" || toolSlug === "extract-pages";
  const isSubTool = SUB_TOOL_SLUGS.includes(toolSlug);
  const isOrganizeMode = toolSlug === "organize";
  const isWatermarkMode = toolSlug === "watermark";
  const isPageNumbersMode = toolSlug === "page-numbers";

  const commitPages = (
    updater: PDFPageItem[] | ((prev: PDFPageItem[]) => PDFPageItem[]),
  ) => {
    const cur = pagesRef.current;
    const next = typeof updater === "function" ? updater(cur) : updater;
    if (next === cur) return;
    past.current.push(cur);
    if (past.current.length > MAX_HISTORY) past.current.shift();
    future.current = [];
    pagesRef.current = next;
    setPages(next);
    PDFSession.savePages(next);
  };

  const keepHighlightIn = (list: PDFPageItem[]) => {
    const ids = new Set(list.map((p) => p.id));
    setHl((h) => h.filter((id) => ids.has(id)));
  };

  const undo = () => {
    if (processedBytes || processing) return;
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(pagesRef.current);
    pagesRef.current = prev;
    setPages(prev);
    keepHighlightIn(prev);
  };

  const redo = () => {
    if (processedBytes || processing) return;
    const next = future.current.pop();
    if (!next) return;
    past.current.push(pagesRef.current);
    pagesRef.current = next;
    setPages(next);
    keepHighlightIn(next);
  };

  const resetHistory = () => {
    past.current = [];
    future.current = [];
    anchorRef.current = null;
    setHl([]);
  };

  const loadPDFBytes = async (bytes: Uint8Array) => {
    if (isSubTool) {
      setLoading(false);
      return;
    }
    const loadId = ++loadIdRef.current;
    const stale = () => loadId !== loadIdRef.current;
    setLoading(true);
    setPages([]);
    setPdfDoc(null);
    setProcessedBytes(null);
    setCompressionNote(null);
    setThumbProgress(null);
    resetHistory();
    try {
      const doc = await PDFDocument.load(bytes);
      const total = doc.getPageCount();
      if (total > MAX_PAGES)
        throw new Error(`This PDF has ${total} pages. Max is ${MAX_PAGES}.`);
      const pdfjsLib = await getPdfjs();
      const pdf = await pdfjsLib.getDocument(
        pdfOptions(pdfjsLib, bytes.slice()),
      ).promise;
      const extracted: PDFPageItem[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        if (stale()) {
          pdf.destroy();
          return;
        }
        const page = await pdf.getPage(i);
        const baseVp = page.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({
          scale: Math.min(3, (300 * dpr) / baseVp.width),
        });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not acquire 2D canvas context");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport } as any).promise;
        const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.6);
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
      pagesRef.current = extracted;
      setPdfDoc(doc);
      setPages(extracted);
      await PDFSession.savePages(extracted);
    } catch (err: any) {
      if (stale()) return;
      console.error(err);
      const encrypted = /encrypt|password/i.test(String(err?.message));
      toast({
        variant: "destructive",
        title: "Couldn't open PDF",
        description: encrypted ? "Password protected." : err?.message,
      });
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

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      try {
        const session = await PDFSession.loadAsync();
        if (cancelled || clearedRef.current || !session) return;
        const bytes = new Uint8Array(session.data);
        setOriginalSize(bytes.byteLength);
        setFile(new File([bytes], session.name, { type: "application/pdf" }));
        sourceRef.current = { name: session.name, bytes };
        if (isSubTool) {
          setRestoringSession(false);
          return;
        }
        const cachedPages = (await PDFSession.loadPagesAsync()) as
          PDFPageItem[] | null;
        if (cancelled || clearedRef.current) return;
        if (cachedPages) {
          try {
            const doc = await PDFDocument.load(bytes);
            if (cancelled || clearedRef.current) return;
            if (
              cachedPages.reduce((m, p) => Math.max(m, p.originalIndex), -1) <
              doc.getPageCount()
            ) {
              originalBytesRef.current = bytes;
              loadedPageCountRef.current = doc.getPageCount();
              pagesRef.current = cachedPages;
              setPdfDoc(doc);
              setPages(cachedPages);
              setDerived(false);
              return;
            }
          } catch (e) {
            console.warn("Cache restore failed:", e);
          }
        }
        if (cancelled || clearedRef.current) return;
        setDerived(false);
        loadPDFBytes(bytes.slice());
      } finally {
        if (!cancelled) setRestoringSession(false);
      }
    };
    restoreSession();
    return () => {
      cancelled = true;
      loadIdRef.current++;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pagesRef.current.length > 0) PDFSession.savePages(pagesRef.current);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    )
      return toast({ variant: "destructive", title: "Not a PDF" });
    if (selected.size > MAX_FILE_BYTES)
      return toast({
        variant: "destructive",
        title: "File too large",
        description: "Max 100MB.",
      });
    clearedRef.current = false;
    setFile(selected);
    setOriginalSize(selected.size);
    const bytes = new Uint8Array(await selected.arrayBuffer());
    sourceRef.current = { name: selected.name, bytes };
    setDerived(false);
    PDFSession.save(selected.name, bytes);
    loadPDFBytes(bytes);
  };

  const rotateIds = (ids: string[], delta: number) => {
    if (ids.length === 0) return;
    const set = new Set(ids);
    commitPages((prev) =>
      prev.map((p) =>
        set.has(p.id) ? { ...p, rotation: (p.rotation + delta) % 360 } : p,
      ),
    );
  };

  const deleteIds = (ids: string[]) => {
    if (ids.length === 0) return;
    const set = new Set(ids);
    commitPages((prev) => prev.filter((p) => !set.has(p.id)));
    setHl((h) => h.filter((id) => !set.has(id)));
  };

  const setIncluded = (ids: string[] | null, value: boolean) => {
    const set = ids ? new Set(ids) : null;
    commitPages((prev) => {
      let changed = false;
      const next = prev.map((p) => {
        if ((set && !set.has(p.id)) || p.selected === value) return p;
        changed = true;
        return { ...p, selected: value };
      });
      return changed ? next : prev;
    });
  };

  const highlightWhere = (test: (index: number) => boolean) => {
    setHl(pages.filter((_, i) => test(i)).map((p) => p.id));
  };

  // Drag & Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragId !== id && dragOverId !== id) setDragOverId(id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const sourceIdx = pages.findIndex((p) => p.id === dragId);
    const targetIdx = pages.findIndex((p) => p.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const newPages = [...pages];
    const [moved] = newPages.splice(sourceIdx, 1);
    newPages.splice(targetIdx, 0, moved);

    commitPages(newPages);
    setDragId(null);
    setDragOverId(null);
  };

  // Page Ranges Logic
  const addPageRange = () => {
    setPageRanges((prev) => {
      const lastRange = prev[prev.length - 1];
      if (!lastRange || lastRange.to === "") return prev;
      const lastTo = parseInt(lastRange.to, 10);
      const nextFrom = isNaN(lastTo) ? 1 : lastTo + 1;
      if (nextFrom > pages.length) return prev;
      return [
        ...prev,
        { id: Date.now().toString(), from: nextFrom.toString(), to: "" },
      ];
    });
  };

  const updatePageRange = (id: string, field: "from" | "to", value: string) => {
    setPageRanges((prev) => {
      const newRanges = [...prev];
      const idx = newRanges.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const range = newRanges[idx];
      let numVal = parseInt(value, 10);
      if (value === "") {
        newRanges[idx] = { ...range, [field]: "" };
        return newRanges;
      }
      if (isNaN(numVal)) numVal = 1;
      numVal = Math.max(1, Math.min(numVal, pages.length));
      if (field === "from") {
        if (idx > 0) {
          const prevTo = parseInt(newRanges[idx - 1].to || "0", 10);
          if (prevTo > 0) numVal = Math.max(numVal, prevTo + 1);
        }
        const currentTo = parseInt(range.to, 10);
        if (!isNaN(currentTo) && numVal > currentTo) {
          newRanges[idx] = {
            ...range,
            from: numVal.toString(),
            to: numVal.toString(),
          };
        } else {
          newRanges[idx] = { ...range, from: numVal.toString() };
        }
      } else {
        const currentFrom = parseInt(range.from, 10);
        if (!isNaN(currentFrom) && numVal < currentFrom) {
          numVal = currentFrom;
        }
        newRanges[idx] = { ...range, to: numVal.toString() };
        for (let i = idx + 1; i < newRanges.length; i++) {
          const nextFrom = parseInt(newRanges[i].from, 10);
          if (isNaN(nextFrom) || nextFrom <= numVal) {
            newRanges[i].from = (numVal + 1).toString();
            const nextTo = parseInt(newRanges[i].to, 10);
            if (!isNaN(nextTo) && nextTo <= numVal) {
              newRanges[i].to = (numVal + 1).toString();
            }
            numVal = parseInt(newRanges[i].to || newRanges[i].from, 10);
          } else {
            break;
          }
        }
      }
      return newRanges;
    });
  };

  const removePageRange = (id: string) => {
    setPageRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const applyPageRanges = (isDelete: boolean) => {
    const pagesToKeep = new Set<number>();
    let hasValidInput = false;
    pageRanges.forEach((range) => {
      const start = parseInt(range.from, 10);
      const end = parseInt(range.to, 10) || start;
      if (!isNaN(start) && !isNaN(end)) {
        hasValidInput = true;
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= pages.length) pagesToKeep.add(i - 1);
        }
      }
    });
    if (!hasValidInput) {
      setIncluded(null, !isDelete);
      return;
    }
    commitPages((prev) =>
      prev.map((p, idx) => ({
        ...p,
        selected: isDelete ? !pagesToKeep.has(idx) : pagesToKeep.has(idx),
      })),
    );
    toast({
      title: "Ranges Applied",
      description: `Selected ${pagesToKeep.size} pages based on your ranges.`,
    });
  };

  const handleToggleSelect = (id: string) =>
    commitPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    );

  const onCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
    idx: number,
  ) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (isRotateMode && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      rotateIds([id], 90);
      return;
    }
    const additive = e.ctrlKey || e.metaKey;
    if (e.shiftKey && anchorRef.current) {
      const a = pages.findIndex((p) => p.id === anchorRef.current);
      if (a >= 0) {
        const range = pages
          .slice(Math.min(a, idx), Math.max(a, idx) + 1)
          .map((p) => p.id);
        setHl((h) => (additive ? [...new Set([...h, ...range])] : range));
        return;
      }
    }
    if (additive) {
      setHl((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
      anchorRef.current = id;
      return;
    }
    setHl([id]);
    anchorRef.current = id;
  };

  const handleAction = async () => {
    if (!pdfDoc || pages.length === 0 || processing) return;
    const selectedPages = isDeleteMode
      ? pages.filter((p) => !p.selected)
      : pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      toast({
        variant: "destructive",
        title: "No pages",
        description: isDeleteMode
          ? "You cannot delete all pages."
          : "Select at least one page.",
      });
      return;
    }
    setProcessing(true);
    setProcProgress(null);
    setCompressionNote(null);
    await tick();

    try {
      let structuralBytes: Uint8Array;
      if (onProcess) {
        structuralBytes = await onProcess(selectedPages, pdfDoc);
      } else {
        const newPdf = await PDFDocument.create();
        const copied = await newPdf.copyPages(
          pdfDoc,
          selectedPages.map((p) => p.originalIndex),
        );

        copied.forEach((page, i) => {
          const extra = selectedPages[i].rotation;
          if (extra !== 0)
            page.setRotation(degrees((page.getRotation().angle + extra) % 360));
          newPdf.addPage(page);
        });

        if (isWatermarkMode || isPageNumbersMode) {
          try {
            const font = await newPdf.embedFont(StandardFonts.Helvetica);
            const wmColor = hexToRgb(watermarkColor);
            const pnColor = hexToRgb(pageNumberColor);

            newPdf.getPages().forEach((page, i) => {
              const {
                x: cbX,
                y: cbY,
                width: cbWidth,
                height: cbHeight,
              } = page.getCropBox();

              if (isWatermarkMode && watermarkText.trim()) {
                const rad = (watermarkRotation * Math.PI) / 180;
                const textWidth = font.widthOfTextAtSize(
                  watermarkText,
                  watermarkSize,
                );
                const textHeight = font.heightAtSize(watermarkSize);

                const cx =
                  (textWidth / 2) * Math.cos(rad) -
                  (textHeight / 2) * Math.sin(rad);
                const cy =
                  (textWidth / 2) * Math.sin(rad) +
                  (textHeight / 2) * Math.cos(rad);

                page.drawText(watermarkText, {
                  x: cbX + cbWidth / 2 - cx,
                  y: cbY + cbHeight / 2 - cy,
                  size: watermarkSize,
                  font,
                  color: rgb(wmColor.r, wmColor.g, wmColor.b),
                  opacity: watermarkOpacity,
                  rotate: degrees(watermarkRotation),
                });
              }

              if (isPageNumbersMode) {
                const text = pageNumberFormat
                  .replace("{n}", String(i + 1))
                  .replace("{total}", String(newPdf.getPageCount()));

                let x =
                  cbX +
                  cbWidth / 2 -
                  font.widthOfTextAtSize(text, pageNumberSize) / 2;

                // ✅ FIXED: Moved Y up to 60 to clear the original footer
                let y = cbY + 60;

                if (pageNumberPosition === "bottom-right")
                  x =
                    cbX +
                    cbWidth -
                    font.widthOfTextAtSize(text, pageNumberSize) -
                    40;
                else if (pageNumberPosition === "bottom-left") x = cbX + 40;

                page.drawText(text, {
                  x,
                  y,
                  size: pageNumberSize,
                  font,
                  color: rgb(pnColor.r, pnColor.g, pnColor.b),
                });
              }
            });
          } catch (fontErr) {
            console.warn("Font encoding error:", fontErr);
            toast({
              variant: "destructive",
              title: "Font Error",
              description:
                "Your text contains characters not supported by the standard PDF font.",
            });
            setProcessing(false);
            return;
          }
        }

        structuralBytes = await newPdf.save({ useObjectStreams: true });
      }

      const untouched =
        selectedPages.length === loadedPageCountRef.current &&
        selectedPages.every((p) => p.rotation === 0);
      let finalBytes = structuralBytes;
      let note: string | null = null;

      if (isCompressionMode && !onProcess && originalBytesRef.current) {
        const candidates = [{ bytes: structuralBytes, kind: "structural" }];
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
          note = "Compression failed, original kept.";
        }
        const best = candidates.reduce((a, b) =>
          b.bytes.byteLength < a.bytes.byteLength ? b : a,
        );
        finalBytes = best.bytes;
        if (!note && best.kind !== "compressed")
          note = "File is already optimized. Try a lower quality.";
      }

      setCompressionNote(note);
      setProcessedBytes(finalBytes);
      setResultSize(finalBytes.byteLength);
      if (file) PDFSession.save(file.name, finalBytes);
      toast({ title: "Done", description: "Your PDF is ready." });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err?.message || "Couldn't build PDF.",
      });
    } finally {
      setProcessing(false);
      setProcProgress(null);
    }
  };

  const handlePreview = () => {
    if (!processedBytes) return;
    // Create a blob URL for the generated PDF
    const blob = new Blob([processedBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Open in a new tab
    window.open(url, "_blank");

    // Clean up the URL after 5 minutes to free memory (once the tab has loaded)
    setTimeout(() => URL.revokeObjectURL(url), 1000 * 60 * 5);
  };

  const handleDownload = () => {
    if (!processedBytes || !file) return;
    const base = file.name
      .replace(/\.pdf$/i, "")
      .replace(/-(compressed|edited)$/i, "");
    const suffix = isCompressionMode
      ? "compressed"
      : isRotateMode
        ? "rotated"
        : isDeleteMode
          ? "deleted"
          : "edited";
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

  const keepEditingResult = () => {
    if (!processedBytes || !file) return;
    const bytes = processedBytes.slice();
    setFile(new File([bytes], file.name, { type: "application/pdf" }));
    setOriginalSize(bytes.byteLength);
    setDerived(true);
    loadPDFBytes(bytes.slice());

    if (isWatermarkMode || isPageNumbersMode) {
      toast({
        title: "Editing Result",
        description: "Switched to Studio mode to prevent double-stamping.",
      });
      router.push("/tools/pdf");
    }
  };

  const restoreOriginalPages = () => {
    if (originalBytesRef.current)
      loadPDFBytes(originalBytesRef.current.slice());
  };

  const startOver = () => {
    const src = sourceRef.current;
    if (!src || processing) return;
    setFile(
      new File([src.bytes.slice()], src.name, { type: "application/pdf" }),
    );
    setOriginalSize(src.bytes.byteLength);
    setDerived(false);
    PDFSession.save(src.name, src.bytes.slice());
    loadPDFBytes(src.bytes.slice());
  };

  const clearSession = () => {
    if (processing) return;
    clearedRef.current = true;
    loadIdRef.current++;
    try {
      previewDocRef.current?.doc?.destroy?.();
    } catch {}
    previewDocRef.current = null;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFile(null);
    setPages([]);
    setPdfDoc(null);
    setProcessedBytes(null);
    setCompressionNote(null);
    setLoading(false);
    setThumbProgress(null);
    setProcessing(false);
    setProcProgress(null);
    setOriginalSize(0);
    setResultSize(0);
    setPreview(null);
    setPreviewBusy(false);
    setPreviewActual(false);
    setPageRanges([{ id: "1", from: "", to: "" }]);
    setPaletteOpen(false);
    setPaletteQuery("");
    setPaletteIdx(0);
    originalBytesRef.current = null;
    sourceRef.current = null;
    loadedPageCountRef.current = 0;
    pagesRef.current = [];
    setDerived(false);
    resetHistory();
    try {
      PDFSession.clear();
    } catch (e) {
      console.warn("Failed to clear PDFSession:", e);
    }
    toast({
      title: "PDF cleared",
      description: "Removed from this workspace.",
    });
  };

  const sizeDelta = originalSize - resultSize;
  const sizePct = originalSize > 0 ? (sizeDelta / originalSize) * 100 : 0;
  const selectedCount = isDeleteMode
    ? pages.length - pages.filter((p) => p.selected).length
    : pages.filter((p) => p.selected).length;
  const hlSet = new Set(hl);

  const editable =
    pages.length > 0 && !processedBytes && !processing && !isSubTool;
  const canUndo = editable && past.current.length > 0;
  const canRedo = editable && future.current.length > 0;
  const canProcess = editable && selectedCount > 0;

  const buildCommands = (): Cmd[] => {
    const list: Cmd[] = [];
    const add = (c: Cmd, when = true) => {
      if (when) list.push(c);
    };
    const hasHl = hl.length > 0;
    add(
      {
        id: "open",
        group: "File",
        label: "Open PDF…",
        icon: FileText,
        run: () => fileInputRef.current?.click(),
      },
      !file && !isSubTool,
    );
    add(
      {
        id: "export",
        group: "File",
        label: processButtonLabel,
        shortcut: "Ctrl+S",
        icon: Download,
        run: () => void handleAction(),
      },
      canProcess,
    );
    add(
      {
        id: "download",
        group: "File",
        label: "Download result",
        shortcut: "Ctrl+S",
        icon: Download,
        run: handleDownload,
      },
      !!processedBytes && !!file,
    );
    add(
      {
        id: "keep",
        group: "File",
        label: "Keep editing the result",
        icon: Pencil,
        run: keepEditingResult,
      },
      !!processedBytes && !!file,
    );
    add(
      {
        id: "close",
        group: "File",
        label: "Clear PDF from workspace",
        icon: X,
        run: clearSession,
      },
      !!file && !processing,
    );
    add(
      {
        id: "undo",
        group: "Edit",
        label: "Undo",
        shortcut: "Ctrl+Z",
        icon: Undo2,
        run: undo,
      },
      canUndo,
    );
    add(
      {
        id: "redo",
        group: "Edit",
        label: "Redo",
        shortcut: "Ctrl+Shift+Z",
        icon: Redo2,
        run: redo,
      },
      canRedo,
    );
    add(
      {
        id: "hl-all",
        group: "Edit",
        label: "Select all pages",
        shortcut: "Ctrl+A",
        icon: CheckSquare,
        run: () => setHl(pages.map((p) => p.id)),
      },
      editable,
    );
    add(
      {
        id: "hl-none",
        group: "Edit",
        label: "Clear selection",
        shortcut: "Esc",
        icon: Square,
        run: () => setHl([]),
      },
      editable && hasHl,
    );
    add(
      {
        id: "hl-odd",
        group: "Selection",
        label: "Select odd pages",
        icon: CheckSquare,
        run: () => highlightWhere((i) => i % 2 === 0),
      },
      editable,
    );
    add(
      {
        id: "hl-even",
        group: "Selection",
        label: "Select even pages",
        icon: CheckSquare,
        run: () => highlightWhere((i) => i % 2 === 1),
      },
      editable,
    );
    add(
      {
        id: "rot-sel-r",
        group: "Pages",
        label: `Rotate selected right (${hl.length})`,
        shortcut: "R",
        icon: RotateCw,
        run: () => rotateIds(hl, 90),
      },
      editable && hasHl,
    );
    add(
      {
        id: "rot-sel-l",
        group: "Pages",
        label: `Rotate selected left (${hl.length})`,
        shortcut: "Shift+R",
        icon: RotateCcw,
        run: () => rotateIds(hl, 270),
      },
      editable && hasHl,
    );
    add(
      {
        id: "del-sel",
        group: "Pages",
        label: `Delete selected pages (${hl.length})`,
        shortcut: "Del",
        icon: Trash2,
        run: () => deleteIds(hl),
      },
      editable && hasHl,
    );
    if (isCompressionMode && editable) {
      QUALITY_PRESETS.forEach((q) =>
        add({
          id: `q-${q.label}`,
          group: "Compression",
          label: `Quality: ${q.label} (${Math.round(q.value * 100)}%)`,
          icon: Gauge,
          run: () => setCompressQuality(q.value),
        }),
      );
    }
    TOOLS.forEach((t) =>
      add(
        {
          id: `go-${t.id}`,
          group: "Go to",
          label: t.label,
          icon: t.icon,
          run: () => router.push(t.path),
        },
        !isToolActive(toolSlug, t.id),
      ),
    );
    return list;
  };

  const paletteCmds = paletteOpen
    ? (() => {
        const terms = paletteQuery.toLowerCase().split(/\s+/).filter(Boolean);
        return buildCommands().filter((c) => {
          const hay = `${c.group} ${c.label} ${c.keywords ?? ""}`.toLowerCase();
          return terms.every((t) => hay.includes(t));
        });
      })()
    : [];

  const runCommand = (c: Cmd) => {
    setPaletteOpen(false);
    setTimeout(c.run, 0);
  };

  useEffect(() => {
    paletteListRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${paletteIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [paletteIdx, paletteOpen]);

  const previewTargetId = hl[0] ?? pages[0]?.id ?? null;
  useEffect(() => {
    const bytes = originalBytesRef.current;
    const target = pages.find((p) => p.id === previewTargetId);
    if (!isCompressionMode || !file || processedBytes || !bytes || !target) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewBusy(true);
      try {
        const lib = await getPdfjs();
        if (!previewDocRef.current || previewDocRef.current.bytes !== bytes) {
          previewDocRef.current?.doc.destroy();
          previewDocRef.current = {
            bytes,
            doc: await lib.getDocument(pdfOptions(lib, bytes.slice())).promise,
          };
        }
        const page = await previewDocRef.current.doc.getPage(
          target.originalIndex + 1,
        );
        const base = page.getViewport({ scale: 1 });
        const s = Math.min(
          compressScale,
          MAX_CANVAS_SIDE / Math.max(base.width, base.height),
        );
        const vp = page.getViewport({ scale: s });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(vp.width));
        canvas.height = Math.max(1, Math.floor(vp.height));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", compressQuality),
        );
        const w = canvas.width;
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
        if (!blob || cancelled) return;
        const url = URL.createObjectURL(blob);
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = url;
        setPreview({
          url,
          size: blob.size,
          pageNo: target.originalIndex + 1,
          w,
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    isCompressionMode,
    file,
    processedBytes,
    previewTargetId,
    compressQuality,
    compressScale,
  ]);

  useEffect(
    () => () => {
      previewDocRef.current?.doc.destroy();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  keyRef.current = (ev: KeyboardEvent) => {
    const mod = ev.ctrlKey || ev.metaKey;
    const k =
      mod && /^Key[A-Z]$/.test(ev.code)
        ? ev.code.slice(3).toLowerCase()
        : ev.key.toLowerCase();
    if (mod && k === "s") {
      ev.preventDefault();
      if (processedBytes) handleDownload();
      else if (canProcess) handleAction();
      return;
    }
    if (
      (mod && (k === "k" || ev.code === "Slash")) ||
      (ev.altKey && ev.code === "Slash")
    ) {
      ev.preventDefault();
      if (paletteOpen) setPaletteOpen(false);
      else {
        setPaletteQuery("");
        setPaletteIdx(0);
        setPaletteOpen(true);
      }
      return;
    }
    if (paletteOpen || isSubTool) return;
    const t = ev.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable)
    )
      return;
    if (mod) {
      if (!editable) return;
      if (k === "z") {
        ev.preventDefault();
        if (ev.shiftKey) redo();
        else undo();
      } else if (k === "y") {
        ev.preventDefault();
        redo();
      } else if (k === "a") {
        ev.preventDefault();
        setHl(pages.map((p) => p.id));
      }
      return;
    }
    if (ev.altKey || !editable) return;
    if (ev.key === "Delete" || ev.key === "Backspace") {
      if (hl.length) {
        ev.preventDefault();
        deleteIds(hl);
      }
      return;
    }
    if (ev.key === "Escape") {
      setHl([]);
      return;
    }
    if (ev.code === "KeyR" && hl.length) {
      ev.preventDefault();
      rotateIds(hl, ev.shiftKey ? 270 : 90);
    }
  };

  useEffect(() => {
    const kd = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", kd, true);
    return () => window.removeEventListener("keydown", kd, true);
  }, []);

  const renderPalette = () => {
    if (!paletteOpen) return null;
    const idx = Math.min(paletteIdx, Math.max(0, paletteCmds.length - 1));
    return (
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex items-start justify-center pt-[12vh] px-3"
        onPointerDown={() => setPaletteOpen(false)}
      >
        <div
          role="dialog"
          onPointerDown={(e) => e.stopPropagation()}
          className="no-smooth w-full max-w-lg rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 h-11 border-b border-border/40">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={paletteQuery}
              onChange={(e) => {
                setPaletteQuery(e.target.value);
                setPaletteIdx(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setPaletteIdx((i) => Math.min(i + 1, paletteCmds.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setPaletteIdx((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const c = paletteCmds[idx];
                  if (c) runCommand(c);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setPaletteOpen(false);
                }
              }}
              placeholder="Search commands…"
              className="no-smooth flex-1 min-w-0 bg-transparent border-0 p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">
              Esc
            </kbd>
          </div>
          <div
            ref={paletteListRef}
            className="max-h-[50vh] overflow-y-auto p-1.5"
          >
            {paletteCmds.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No matching commands.
              </p>
            )}
            {paletteCmds.map((c, i) => {
              const Icon = c.icon;
              const showGroup = i === 0 || paletteCmds[i - 1].group !== c.group;
              return (
                <React.Fragment key={c.id}>
                  {showGroup && (
                    <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {c.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-idx={i}
                    onClick={() => runCommand(c)}
                    onPointerMove={() => setPaletteIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${i === idx ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/60"}`}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <span className="flex-1 truncate font-medium">
                      {c.label}
                    </span>
                    {c.shortcut && (
                      <kbd className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">
                        {c.shortcut}
                      </kbd>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-3 h-8 border-t border-border/40 text-[10px] text-muted-foreground">
            <span>↑↓ navigate · Enter run</span>
            <span>Ctrl+S exports</span>
          </div>
        </div>
      </div>
    );
  };

  const iconBtn =
    "p-1.5 rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all";
  const bulkBtn =
    "px-2 py-1 rounded-md border border-border/40 text-[11px] font-semibold text-foreground hover:bg-secondary/60 transition-all inline-flex items-center gap-1 whitespace-nowrap shrink-0";

  return (
    <div className="flex flex-col bg-background text-foreground overflow-hidden w-full h-full flex-1 min-h-0">
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      {renderPalette()}

      {/* Top utility bar */}
      <div className="h-10 shrink-0 flex items-center justify-between px-3 border-b border-border/40 bg-card/50 overflow-hidden gap-2">
        <div className="flex items-center gap-2 min-w-0 shrink">
          <span className="flex items-center gap-1.5 pr-2 border-r border-border/40 text-[11px] font-black uppercase tracking-wider text-foreground shrink-0">
            <FileText className="h-3.5 w-3.5 text-primary" />{" "}
            {toolSlug ? toolSlug.toUpperCase() : "PDF STUDIO"}
          </span>
          {file && (
            <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[150px] sm:max-w-[300px]">
              {file.name} ({formatBytes(file.size)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {editable && (
            <>
              <Tip label="Undo (Ctrl+Z)">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  className={iconBtn}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
              </Tip>
              <Tip label="Redo (Ctrl+Shift+Z)">
                <button
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  className={iconBtn}
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>
              </Tip>
            </>
          )}
          <Tip label="Commands (Ctrl+K)">
            <button
              type="button"
              onClick={() => {
                setPaletteQuery("");
                setPaletteIdx(0);
                setPaletteOpen(true);
              }}
              className="px-2 py-1 rounded-md border border-border/40 bg-background text-muted-foreground hover:text-foreground hover:border-border/80 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              <CommandIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Commands</span>
            </button>
          </Tip>

          {file && (
            <button
              type="button"
              onClick={clearSession}
              disabled={processing}
              title="Remove this PDF from the entire workspace"
              className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-rose-500/30 text-destructive hover:bg-rose-500/10 transition-all ml-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear PDF
            </button>
          )}

          {processedBytes ? (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={keepEditingResult}
                className="hidden md:flex px-2 py-1 rounded-md border border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all items-center gap-1"
              >
                <Pencil className="h-3 w-3" /> Edit Result
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          ) : isSubTool ? (
            <button
              type="button"
              onClick={() => actionRef.current?.triggerAction()}
              disabled={!file || loading}
              className="ml-1 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> {processButtonLabel}
            </button>
          ) : (
            pages.length > 0 && (
              <button
                type="button"
                onClick={handleAction}
                disabled={processing || selectedCount === 0}
                className="ml-1 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                    {procProgress
                      ? `${procProgress.done}/${procProgress.total}…`
                      : "Working…"}
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> {processButtonLabel}
                  </>
                )}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sub-Tool Rail */}
        <nav className="shrink-0 border-b lg:border-b-0 lg:border-r border-border/40 bg-card/30 flex lg:flex-col p-1.5 gap-1 overflow-x-auto lg:overflow-y-auto w-full lg:w-48">
          <span className="hidden lg:block px-2 pt-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
            Workflows
          </span>
          {TOOLS.map((modeItem) => {
            const Icon = modeItem.icon;
            const isActive = isToolActive(toolSlug, modeItem.id);
            return (
              <button
                key={modeItem.id}
                type="button"
                onClick={() => router.push(modeItem.path)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all whitespace-nowrap shrink-0 ${isActive ? "bg-primary/10 text-primary ring-1 ring-primary/30 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{modeItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Center Canvas */}
        <div
          className={`flex-1 min-w-0 min-h-0 flex flex-col bg-background ${toolSlug === "pdf-to-text" ? "overflow-hidden" : "overflow-y-auto p-3 sm:p-4"}`}
          onClick={(e) => {
            if (
              !(e.target as HTMLElement).closest(
                "[data-page-card],[data-keep-selection]",
              )
            )
              setHl([]);
          }}
        >
          {toolSlug === "jpg-to-pdf" ? (
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              <JPGToPDF ref={actionRef} />
            </div>
          ) : restoringSession ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                Restoring workspace…
              </p>
            </div>
          ) : !file ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/40 hover:border-primary/50 rounded-xl bg-card/20 hover:bg-card/30 text-center relative transition-all cursor-pointer group m-4">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-primary/15 transition-all mb-4 shadow-inner">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-1 tracking-tight">
                Drop your PDF here, or{" "}
                <span className="text-primary underline underline-offset-2">
                  browse
                </span>
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-4">
                Upload a PDF to use this tool. Supports up to{" "}
                {MAX_FILE_BYTES / 1024 / 1024} MB and {MAX_PAGES} pages.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/40 text-[11px] font-mono text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                100% In-Browser & Private
              </div>
            </div>
          ) : toolSlug === "merge" || toolSlug === "merge-pdf" ? (
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              <MergePDF ref={actionRef} initialFile={file} />
            </div>
          ) : toolSlug === "pdf-to-text" ? (
            <div className="w-full h-full flex flex-col">
              <PDFToText ref={actionRef} initialFile={file} />
            </div>
          ) : toolSlug === "pdf-to-jpg" ? (
            <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
              <PDFToJPG ref={actionRef} initialFile={file} />
            </div>
          ) : toolSlug === "pdf-to-png" ? (
            <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
              <PDFToPNG ref={actionRef} initialFile={file} />
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                Generating previews{" "}
                {thumbProgress
                  ? `(${thumbProgress.done}/${thumbProgress.total})`
                  : "…"}
              </p>
            </div>
          ) : processedBytes ? (
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-emerald-500">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Your PDF is ready
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Processed locally.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border/20 py-4 font-mono text-xs">
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
                    Size Change
                  </span>
                  {Math.abs(sizePct) < 0.5 ? (
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
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" /> Preview PDF
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                >
                  <Download className="h-4 w-4" /> Download Result
                </button>
                <button
                  type="button"
                  onClick={keepEditingResult}
                  className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" /> Keep Editing
                </button>
                <button
                  type="button"
                  onClick={startOver}
                  className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold text-foreground transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Start Over
                </button>
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <p className="text-sm font-bold text-foreground">
                All pages were removed
              </p>
              <div className="flex items-center gap-3">
                {canUndo && (
                  <button
                    onClick={undo}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Undo
                  </button>
                )}
                <button
                  onClick={restoreOriginalPages}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Restore pages
                </button>
              </div>
            </div>
          ) : (
            <>
              {hl.length > 0 ? (
                <div
                  data-keep-selection
                  className="sticky top-0 z-20 mb-3 flex items-center gap-1.5 rounded-xl border border-border/40 bg-card/95 backdrop-blur px-2 py-1.5 overflow-x-auto"
                >
                  <span className="text-[11px] font-black text-foreground px-1 shrink-0">
                    {hl.length} selected
                  </span>
                  <button
                    onClick={() => rotateIds(hl, 270)}
                    className={bulkBtn}
                  >
                    <RotateCcw className="h-3 w-3" /> Left
                  </button>
                  <button onClick={() => rotateIds(hl, 90)} className={bulkBtn}>
                    <RotateCw className="h-3 w-3" /> Right
                  </button>
                  {!isDeleteMode && (
                    <button
                      onClick={() => setIncluded(hl, true)}
                      className={bulkBtn}
                    >
                      <CheckSquare className="h-3 w-3" /> Include
                    </button>
                  )}
                  {!isDeleteMode && (
                    <button
                      onClick={() => setIncluded(hl, false)}
                      className={bulkBtn}
                    >
                      <Square className="h-3 w-3" /> Exclude
                    </button>
                  )}
                  {isDeleteMode && (
                    <button
                      onClick={() => setIncluded(hl, true)}
                      className={`${bulkBtn} text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20`}
                    >
                      <Trash2 className="h-3 w-3" /> Mark for Delete
                    </button>
                  )}
                  {isDeleteMode && (
                    <button
                      onClick={() => setIncluded(hl, false)}
                      className={bulkBtn}
                    >
                      <Undo2 className="h-3 w-3" /> Keep
                    </button>
                  )}
                  <button
                    onClick={() => deleteIds(hl)}
                    className={`${bulkBtn} text-destructive hover:bg-rose-500/10`}
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                  <span className="flex-1" />
                  <button
                    onClick={() => setHl([])}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <p className="mb-3 text-[10px] text-muted-foreground">
                  {isRotateMode
                    ? "Click any page to rotate it 90°. Use the side panel to rotate all."
                    : isDeleteMode
                      ? "Click pages to mark them for DELETION. They will be removed when you export."
                      : isOrganizeMode
                        ? "Drag and drop the pages below to rearrange them."
                        : "Click a page to select it. Shift-click selects a range, Ctrl/⌘-click adds pages."}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {pages.map((page, idx) => {
                  const lit = hlSet.has(page.id);
                  const isDeleted = isDeleteMode && page.selected;
                  const isExcluded = !isDeleteMode && !page.selected;
                  const isDragging = dragId === page.id;
                  const isDragOver = dragOverId === page.id;

                  return (
                    <div
                      key={page.id}
                      data-page-card
                      onClick={(e) => onCardClick(e, page.id, idx)}
                      draggable={isOrganizeMode}
                      onDragStart={(e) => handleDragStart(e, page.id)}
                      onDragOver={(e) => handleDragOver(e, page.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, page.id)}
                      onDragEnd={handleDragEnd}
                      className={`relative rounded-xl border p-2 flex flex-col items-center justify-between transition-all group select-none ${
                        isOrganizeMode
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-pointer"
                      } ${
                        isDragging
                          ? "opacity-40 border-dashed border-primary"
                          : ""
                      } ${
                        isDragOver
                          ? "border-primary border-2 scale-[1.02] shadow-lg bg-primary/5 z-10"
                          : ""
                      } ${
                        lit
                          ? "border-primary border-2 bg-primary/10"
                          : isDeleted
                            ? "border-rose-500/50 bg-rose-500/10 opacity-70"
                            : isExcluded
                              ? "border-border/30 bg-card/40 opacity-60"
                              : "border-primary/40 bg-primary/[0.02]"
                      }`}
                    >
                      {isOrganizeMode ? (
                        <div className="absolute top-2 left-2 p-1.5 text-muted-foreground/50 z-10 transition-transform group-hover:scale-110">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleSelect(page.id)}
                          className={`absolute top-2 left-2 p-1.5 rounded-lg bg-background/90 hover:bg-background border border-border/40 z-10 transition-transform group-hover:scale-105 ${isDeleted ? "text-destructive" : "text-primary"}`}
                        >
                          {isDeleted ? (
                            <Trash2 className="h-3.5 w-3.5" />
                          ) : page.selected ? (
                            <CheckSquare className="h-3.5 w-3.5" />
                          ) : (
                            <Square className="h-3.5 w-3.5 text-muted-foreground/60" />
                          )}
                        </button>
                      )}

                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-background/90 border border-border/40 text-[9px] font-bold text-foreground z-10">
                        Page {idx + 1}
                      </div>

                      <div className="w-full flex items-center justify-center p-2 relative h-36">
                        <img
                          src={page.thumbnailUrl}
                          alt={`Page ${idx + 1}`}
                          draggable={false}
                          className={`max-h-full max-w-full rounded border border-border/20 shadow-xs transition-transform ${isDeleted ? "grayscale" : ""}`}
                          style={{
                            transform: `rotate(${page.rotation}deg)`,
                            scale: "1",
                            willChange: "auto",
                          }}
                        />
                        {isDeleted && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                              DELETING
                            </span>
                          </div>
                        )}
                      </div>

                      {!isOrganizeMode && (
                        <div className="w-full flex items-center justify-between border-t border-border/20 pt-2 mt-1 gap-1.5">
                          <button
                            onClick={() => rotateIds([page.id], 90)}
                            className="flex-1 py-1 rounded bg-secondary/50 hover:bg-secondary border border-border/30 hover:text-primary transition-all flex items-center justify-center gap-1 text-[10px] font-semibold"
                            title="Rotate 90°"
                          >
                            <RotateCw className="h-3 w-3" /> Rotate
                          </button>
                          <button
                            onClick={() => deleteIds([page.id])}
                            className="p-1 rounded bg-secondary/50 hover:bg-rose-500/10 border border-border/30 text-destructive transition-all"
                            title="Delete page"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Inspector / Settings Pane */}
        {file && pages.length > 0 && !processedBytes && !isSubTool ? (
          <aside className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border/40 bg-card/30 flex flex-col min-h-0">
            <header className="h-8 shrink-0 px-3 flex items-center border-b border-border/30 bg-muted/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {isRotateMode
                  ? "Rotation Options"
                  : isDeleteMode
                    ? "Delete Options"
                    : isSplitMode
                      ? "Extract Options"
                      : isOrganizeMode
                        ? "Organize Options"
                        : isWatermarkMode
                          ? "Watermark Settings"
                          : isPageNumbersMode
                            ? "Page Number Settings"
                            : "Document Options"}
              </span>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4">
              {isRotateMode && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Bulk Rotate
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        rotateIds(
                          pages.map((p) => p.id),
                          270,
                        )
                      }
                      className="py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/30 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Left 90°
                    </button>
                    <button
                      onClick={() =>
                        rotateIds(
                          pages.map((p) => p.id),
                          90,
                        )
                      }
                      className="py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/30 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className="h-3.5 w-3.5" /> Right 90°
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      commitPages((prev) =>
                        prev.map((p) => ({ ...p, rotation: 0 })),
                      )
                    }
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  >
                    Reset All Rotations
                  </button>
                </div>
              )}

              {isOrganizeMode && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Reordering
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Drag and drop the pages on the canvas to change their order.
                    The exported PDF will follow this exact sequence.
                  </p>
                </div>
              )}

              {isWatermarkMode && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="CONFIDENTIAL"
                      className="w-full h-8 px-2 bg-background border border-border/40 rounded text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Opacity</span>
                      <span className="font-mono font-bold text-foreground">
                        {Math.round(watermarkOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={Math.round(watermarkOpacity * 100)}
                      onChange={(e) =>
                        setWatermarkOpacity(Number(e.target.value) / 100)
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-mono font-bold text-foreground">
                        {watermarkSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      step={5}
                      value={watermarkSize}
                      onChange={(e) => setWatermarkSize(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Rotation</span>
                      <span className="font-mono font-bold text-foreground">
                        {watermarkRotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={watermarkRotation}
                      onChange={(e) =>
                        setWatermarkRotation(Number(e.target.value))
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Color
                    </span>
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="h-7 w-12 rounded border border-border/40 bg-background cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              )}

              {isPageNumbersMode && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Format String
                    </label>
                    <input
                      type="text"
                      value={pageNumberFormat}
                      onChange={(e) => setPageNumberFormat(e.target.value)}
                      placeholder="Page {n} of {total}"
                      className="w-full h-8 px-2 bg-background border border-border/40 rounded text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-muted-foreground mt-1">
                      Use{" "}
                      <code className="bg-secondary/50 px-1 rounded">
                        {"{n}"}
                      </code>{" "}
                      for current page,{" "}
                      <code className="bg-secondary/50 px-1 rounded">
                        {"{total}"}
                      </code>{" "}
                      for total.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Position
                    </label>
                    <select
                      value={pageNumberPosition}
                      onChange={(e) =>
                        setPageNumberPosition(e.target.value as any)
                      }
                      className="w-full h-8 px-2 bg-background border border-border/40 rounded text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Font Size</span>
                      <span className="font-mono font-bold text-foreground">
                        {pageNumberSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={24}
                      step={1}
                      value={pageNumberSize}
                      onChange={(e) =>
                        setPageNumberSize(Number(e.target.value))
                      }
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Color
                    </span>
                    <input
                      type="color"
                      value={pageNumberColor}
                      onChange={(e) => setPageNumberColor(e.target.value)}
                      className="h-7 w-12 rounded border border-border/40 bg-background cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              )}

              {(isSplitMode || isDeleteMode) &&
                (() => {
                  const lastRange = pageRanges[pageRanges.length - 1];
                  const canAddRange =
                    lastRange &&
                    lastRange.to !== "" &&
                    parseInt(lastRange.to, 10) >=
                      parseInt(lastRange.from || "0", 10);
                  return (
                    <div className="space-y-2 pb-3 border-b border-border/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Page Ranges
                      </span>
                      <div className="space-y-1.5">
                        {pageRanges.map((range, idx) => (
                          <div
                            key={range.id}
                            className="flex items-center gap-1.5"
                          >
                            <input
                              type="number"
                              placeholder="From"
                              value={range.from}
                              onChange={(e) =>
                                updatePageRange(
                                  range.id,
                                  "from",
                                  e.target.value,
                                )
                              }
                              className="w-full h-7 min-w-0 px-1.5 py-0 rounded-md bg-background border border-border/40 text-[11px] font-mono text-center outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min={
                                idx > 0 && pageRanges[idx - 1].to
                                  ? parseInt(pageRanges[idx - 1].to) + 1
                                  : 1
                              }
                              max={range.to ? parseInt(range.to) : pages.length}
                            />
                            <span className="text-muted-foreground text-[10px] shrink-0">
                              to
                            </span>
                            <input
                              type="number"
                              placeholder="To"
                              value={range.to}
                              onChange={(e) =>
                                updatePageRange(range.id, "to", e.target.value)
                              }
                              className="w-full h-7 min-w-0 px-1.5 py-0 rounded-md bg-background border border-border/40 text-[11px] font-mono text-center outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min={range.from ? parseInt(range.from) : 1}
                              max={pages.length}
                            />
                            {pageRanges.length > 1 && (
                              <button
                                onClick={() => removePageRange(range.id)}
                                className="p-1 text-destructive hover:bg-destructive/10 rounded-md shrink-0 transition-colors"
                                title="Remove range"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addPageRange}
                        disabled={!canAddRange}
                        className={`w-full py-1.5 mt-2 rounded-md border border-dashed flex items-center justify-center gap-1 transition-colors text-[10px] font-bold ${canAddRange ? "border-border/40 text-muted-foreground hover:bg-secondary/50 cursor-pointer" : "border-border/10 text-muted-foreground/30 cursor-not-allowed"}`}
                      >
                        <Plus className="h-3 w-3" /> Add Range
                      </button>
                      <button
                        onClick={() => applyPageRanges(isDeleteMode)}
                        className="w-full py-2 mt-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
                      >
                        Apply Selection
                      </button>
                      <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                        {isDeleteMode
                          ? "Pages in these ranges will be marked for deletion."
                          : "Only pages in these ranges will be extracted."}
                      </p>
                    </div>
                  );
                })()}

              {!isWatermarkMode && !isPageNumbersMode && !isOrganizeMode && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {isDeleteMode ? "Pages to Keep" : "Pages in Export"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIncluded(null, !isDeleteMode)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/30 text-[11px] font-semibold text-foreground text-center"
                    >
                      {isDeleteMode ? "Keep All" : "Include All"}
                    </button>
                    <button
                      onClick={() => setIncluded(null, isDeleteMode)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/30 text-[11px] font-semibold text-foreground text-center"
                    >
                      {isDeleteMode ? "Delete All" : "Clear"}
                    </button>
                  </div>
                </div>
              )}

              {isCompressionMode && (
                <div className="space-y-3 pt-3 border-t border-border/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Gauge className="h-3 w-3 text-primary" /> Compression
                    Tuning
                  </span>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Quality</span>
                      <span className="font-mono font-bold text-foreground">
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
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Resolution</span>
                      <span className="font-mono font-bold text-foreground">
                        ≈ {Math.round(compressScale * 72)} DPI
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={250}
                      step={10}
                      value={Math.round(compressScale * 100)}
                      onChange={(e) =>
                        setCompressScale(Number(e.target.value) / 100)
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              )}

              {isCompressionMode && (
                <div className="space-y-2 pt-3 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3 w-3 text-primary" /> Live preview
                    </span>
                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={previewActual}
                        onChange={(e) => setPreviewActual(e.target.checked)}
                        className="accent-primary"
                      />{" "}
                      Actual size
                    </label>
                  </div>
                  <div className="relative rounded-lg border border-border/30 bg-white max-h-64 min-h-[80px] overflow-auto">
                    {preview && (
                      <img
                        src={preview.url}
                        alt={`Preview`}
                        draggable={false}
                        className="no-smooth block"
                        style={
                          previewActual
                            ? { maxWidth: "none", width: preview.w }
                            : { width: "100%" }
                        }
                      />
                    )}
                    {previewBusy && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/90 border border-border/40">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {preview && (
                    <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                      Page {preview.pageNo}: {formatBytes(preview.size)}
                      <br />≈ {formatBytes(
                        preview.size * selectedCount,
                      )} for {selectedCount} pages
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 mt-auto">
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={processing || selectedCount === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:opacity-90 active:scale-98 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />{" "}
                      {procProgress
                        ? `Page ${procProgress.done}/${procProgress.total}…`
                        : "Processing…"}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> {processButtonLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        ) : !file && !isSubTool ? (
          <aside className="hidden lg:flex w-72 shrink-0 border-l border-border/40 bg-card/20 flex-col min-h-0">
            <header className="h-8 shrink-0 px-3 flex items-center border-b border-border/30 bg-muted/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Workspace Guide
              </span>
            </header>
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Local Engine
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Documents are rendered and manipulated entirely in your web
                  browser utilizing WebAssembly and HTML5 canvas. Zero server
                  uploads.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card/60 border border-border/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground block">
                  Supported Actions
                </span>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>Lossy & lossless compression</li>
                  <li>Reordering / Organizing pages</li>
                  <li>Adding watermarks & numbers</li>
                  <li>Extracting specific ranges</li>
                  <li>Reorienting & pruning pages</li>
                </ul>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {/* Bottom Status bar */}
      <footer className="h-6 shrink-0 flex items-center gap-3 px-3 border-t border-border/40 bg-card/50 text-[10px] font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
        {!isSubTool && (
          <>
            <span>Pages: {pages.length}</span>
            <span>
              {isDeleteMode ? "Kept" : "In export"}: {selectedCount}
            </span>
          </>
        )}
        {hl.length > 0 && <span>Selected: {hl.length}</span>}
        {file && <span>Size: {formatBytes(file.size)}</span>}
        <span className="flex-1" />
        <span className="hidden sm:inline">100% In-Browser</span>
        <span>Private & Zero-Storage</span>
      </footer>
    </div>
  );
}
