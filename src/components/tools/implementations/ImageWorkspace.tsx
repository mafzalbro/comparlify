"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import {
  Upload,
  Download,
  Loader2,
  Settings2,
  Sparkles,
  Crop,
  Maximize2,
  Minimize2,
  RotateCw,
  RotateCcw,
  Copy,
  ZoomIn,
  ZoomOut,
  Layers,
  ArrowRightLeft,
  Info,
  FileArchive,
  X,
  Plus,
  FlipHorizontal,
  FlipVertical,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
════════════════════════════════════════════════════════════════ */

type Fmt = "webp" | "jpeg" | "png";
type TargetFormat = Fmt | "original";
type View = "editor" | "convert" | "base64";
type Tab = "compress" | "resize" | "crop" | "rotate" | "info";
type QualityPreset = "high" | "balanced" | "smallest";
type CompressionMode = "quality" | "target";
type ResizeMode = "pixels" | "percent";
type Handle = "move" | "nw" | "ne" | "sw" | "se";

interface CropBox {
  x: number; // all values are % of the source image
  y: number;
  w: number;
  h: number;
}

interface ImageItem {
  id: string;
  file: File;
  mime: string;
  url: string;
  width: number;
  height: number;
  hasAlpha: boolean;
  crop: CropBox;
}

interface ResizeSettings {
  mode: ResizeMode;
  width: number | null; // null = "not set"
  height: number | null;
  percent: number;
  lock: boolean;
}

interface ProcessedResult {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
  format: string;
  kept: boolean; // original file was returned because re-encoding made it bigger
  warnings: string[];
}

interface ParsedMode {
  view: View;
  tab: Tab;
  source: Fmt | null;
  target: Fmt | null;
}

const MAX_FILES = 50;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 12000;
const MAX_PIXELS = 80_000_000;
const MIN_CROP_PCT = 5;
const CONCURRENCY = 2;

const MIME: Record<Fmt, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
};
const EXT: Record<Fmt, string> = { webp: "webp", jpeg: "jpg", png: "png" };
const QUALITY: Record<QualityPreset, number> = {
  high: 0.95,
  balanced: 0.85,
  smallest: 0.65,
};
const QUALITY_LABEL: Record<QualityPreset, string> = {
  high: "High",
  balanced: "Balanced",
  smallest: "Smallest",
};
const FULL_CROP: CropBox = { x: 0, y: 0, w: 100, h: 100 };
const DEFAULT_RESIZE: ResizeSettings = {
  mode: "pixels",
  width: null,
  height: null,
  percent: 100,
  lock: true,
};
const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];
const TAB_DEFS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "compress", label: "Compress", icon: Sparkles },
  { id: "resize", label: "Resize", icon: Maximize2 },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "rotate", label: "Rotate", icon: RotateCw },
  { id: "info", label: "Info", icon: Info },
];

/* ════════════════════════════════════════════════════════════════
   PURE HELPERS
════════════════════════════════════════════════════════════════ */

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const normFmt = (s: string): Fmt | null =>
  s === "jpg" || s === "jpeg"
    ? "jpeg"
    : s === "png"
      ? "png"
      : s === "webp"
        ? "webp"
        : null;

const fmtFromMime = (m: string): Fmt | null =>
  m === "image/png"
    ? "png"
    : m === "image/jpeg"
      ? "jpeg"
      : m === "image/webp"
        ? "webp"
        : null;

const mimeFromFile = (f: File): string => {
  if (f.type) return f.type;
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext] ?? "";
};

const formatBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(2)} MB`;

const baseName = (n: string) => {
  const i = n.lastIndexOf(".");
  return i > 0 ? n.slice(0, i) : n;
};

const pctChange = (orig: number, next: number) =>
  orig > 0 ? Math.round(((next - orig) / orig) * 100) : 0;

const preview = (text: string, max = 400) =>
  text.length > max
    ? `${text.slice(0, max)}… (${text.length.toLocaleString()} characters)`
    : text;

const TAB_IDS = ["compress", "resize", "crop", "rotate"];

function parseMode(mode: string): ParsedMode {
  if (mode === "image-to-base64")
    return { view: "base64", tab: "info", source: null, target: null };
  const m = mode.match(/^(jpg|jpeg|png|webp)-to-(jpg|jpeg|png|webp)$/);
  if (m) {
    const source = normFmt(m[1]);
    const target = normFmt(m[2]);
    if (source && target)
      return { view: "convert", tab: "compress", source, target };
  }
  const tab = (TAB_IDS.includes(mode) ? mode : "compress") as Tab;
  return { view: "editor", tab, source: null, target: null };
}

const initialPreset = (m: ParsedMode): QualityPreset =>
  m.view === "editor" && m.tab !== "compress" ? "high" : "balanced";

function isResizeActive(r: ResizeSettings) {
  return r.mode === "percent"
    ? r.percent !== 100
    : r.width !== null || r.height !== null;
}

function calcSize(cw: number, ch: number, r: ResizeSettings): [number, number] {
  if (r.mode === "percent") {
    const f = clamp(r.percent, 1, 1000) / 100;
    return [Math.max(1, Math.round(cw * f)), Math.max(1, Math.round(ch * f))];
  }
  let w = r.width;
  let h = r.height;
  if (w === null && h === null) return [cw, ch];
  if (r.lock) {
    if (w !== null) h = Math.round((ch * w) / cw);
    else w = Math.round((cw * (h as number)) / ch);
  } else {
    w = w ?? cw;
    h = h ?? ch;
  }
  return [Math.max(1, w as number), Math.max(1, h as number)];
}

function cropPx(item: { width: number; height: number; crop: CropBox }) {
  const { width: W, height: H, crop } = item;
  const sx = clamp(Math.round((crop.x / 100) * W), 0, Math.max(0, W - 1));
  const sy = clamp(Math.round((crop.y / 100) * H), 0, Math.max(0, H - 1));
  const sw = clamp(Math.round((crop.w / 100) * W), 1, Math.max(1, W - sx));
  const sh = clamp(Math.round((crop.h / 100) * H), 1, Math.max(1, H - sy));
  return { sx, sy, sw, sh, active: sx > 0 || sy > 0 || sw < W || sh < H };
}

function triggerDownload(href: string, filename: string, revoke = false) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

/* ── Canvas helpers ───────────────────────────────────────────── */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("This image is too large for your browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { c, ctx };
}

/** Downscales in halving steps so large reductions stay sharp (no aliasing). */
function scaleToCanvas(
  src: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dw: number,
  dh: number,
): HTMLCanvasElement {
  let cur: CanvasImageSource = src;
  let cx = sx;
  let cy = sy;
  let cw = sw;
  let ch = sh;
  while (cw / 2 > dw || ch / 2 > dh) {
    const nw = Math.max(dw, Math.ceil(cw / 2));
    const nh = Math.max(dh, Math.ceil(ch / 2));
    const step = makeCanvas(nw, nh);
    step.ctx.drawImage(cur, cx, cy, cw, ch, 0, 0, nw, nh);
    cur = step.c;
    cx = 0;
    cy = 0;
    cw = nw;
    ch = nh;
  }
  const out = makeCanvas(dw, dh);
  out.ctx.drawImage(cur, cx, cy, cw, ch, 0, 0, dw, dh);
  return out.c;
}

function canvasToBlob(
  c: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (b) => {
        if (!b)
          return reject(
            new Error("Your browser couldn't encode this image (too large?)."),
          );
        if (b.type && b.type !== mime)
          return reject(
            new Error(
              `Your browser can't export ${mime.split("/")[1].toUpperCase()} files.`,
            ),
          );
        resolve(b);
      },
      mime,
      quality,
    );
  });
}

function detectAlpha(bitmap: ImageBitmap): boolean {
  const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return true;
  return false;
}

async function analyzeFile(file: File, mime: string) {
  try {
    const bmp = await createImageBitmap(file);
    const out = {
      width: bmp.width,
      height: bmp.height,
      hasAlpha:
        mime === "image/png" || mime === "image/webp"
          ? detectAlpha(bmp)
          : false,
    };
    bmp.close();
    return out;
  } catch {
    return null;
  }
}

/** Highest quality (<= target bytes) via binary search. */
async function searchQuality(
  c: HTMLCanvasElement,
  mime: string,
  targetBytes: number,
  tick: () => Promise<void>,
): Promise<{ blob: Blob | null; smallest: Blob }> {
  const hi = await canvasToBlob(c, mime, 0.95);
  await tick();
  if (hi.size <= targetBytes) return { blob: hi, smallest: hi };
  const lo = await canvasToBlob(c, mime, 0.2);
  await tick();
  if (lo.size > targetBytes) return { blob: null, smallest: lo };
  let best = lo;
  let qLo = 0.2;
  let qHi = 0.95;
  for (let i = 0; i < 6; i++) {
    const q = (qLo + qHi) / 2;
    const b = await canvasToBlob(c, mime, q);
    await tick();
    if (b.size <= targetBytes) {
      best = b;
      qLo = q;
    } else qHi = q;
  }
  return { blob: best, smallest: lo };
}

/** Max-size compression: lowers quality first, then dimensions, and reports both. */
async function encodeToTarget(
  canvas: HTMLCanvasElement,
  mime: string,
  targetBytes: number,
  onProgress?: (p: number) => void,
) {
  const warnings: string[] = [];
  let steps = 0;
  const tick = async () => {
    steps++;
    onProgress?.(Math.min(95, steps * 6));
    await new Promise((r) => setTimeout(r, 0));
  };
  let scale = 1;
  let smallest: { blob: Blob; w: number; h: number } | null = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    const w = Math.max(1, Math.round(canvas.width * scale));
    const h = Math.max(1, Math.round(canvas.height * scale));
    const c =
      scale === 1
        ? canvas
        : scaleToCanvas(canvas, 0, 0, canvas.width, canvas.height, w, h);
    const r = await searchQuality(c, mime, targetBytes, tick);
    if (r.blob) {
      if (scale < 1)
        warnings.push(
          `Dimensions reduced from ${canvas.width}×${canvas.height} to ${w}×${h} px to reach the target size.`,
        );
      return { blob: r.blob, width: w, height: h, warnings };
    }
    smallest = { blob: r.smallest, w, h };
    scale *= clamp(Math.sqrt(targetBytes / r.smallest.size) * 0.95, 0.3, 0.9);
    if (Math.min(canvas.width, canvas.height) * scale < 16) break;
  }
  warnings.push(
    `Couldn't reach ${formatBytes(targetBytes)}. This is the smallest result possible.`,
  );
  const s = smallest as { blob: Blob; w: number; h: number };
  return { blob: s.blob, width: s.w, height: s.h, warnings };
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */

export function ImageWorkspace({
  defaultMode = "compress",
}: {
  defaultMode?: string;
}) {
  const { toast } = useToast();
  const mode = useMemo(() => parseMode(defaultMode), [defaultMode]);
  const view = mode.view;

  // Files
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Results
  const [results, setResults] = useState<Record<string, ProcessedResult>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState("");

  // UI
  const [activeTab, setActiveTab] = useState<Tab>(mode.tab);
  const [zoom, setZoom] = useState(1);
  const [showChecker, setShowChecker] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [viewSide, setViewSide] = useState<"original" | "result">("result");

  // Settings (global, applied to every image)
  const [targetFormat, setTargetFormat] = useState<TargetFormat>(
    mode.view === "convert" && mode.target ? mode.target : "original",
  );
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>(
    initialPreset(mode),
  );
  const [compressionMode, setCompressionMode] =
    useState<CompressionMode>("quality");
  const [targetKbText, setTargetKbText] = useState("150");
  const [resize, setResize] = useState<ResizeSettings>(DEFAULT_RESIZE);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [cropRatio, setCropRatio] = useState<number | null>(null);

  // Base64
  const [b64, setB64] = useState<{ id: string; dataUri: string } | null>(null);
  const [b64Loading, setB64Loading] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const draggingSlider = useRef(false);
  const startRef = useRef(0);
  const runIdRef = useRef(0);
  const idRef = useRef(0);
  const mountedRef = useRef(true);
  const itemsRef = useRef(items);
  const resultsRef = useRef(results);
  itemsRef.current = items;
  resultsRef.current = results;

  /* ── Derived ─────────────────────────────────────────────────── */

  const activeItem = items.find((i) => i.id === activeId) ?? items[0] ?? null;
  const activeResult = activeItem ? results[activeItem.id] : undefined;
  const activeError = activeItem ? errors[activeItem.id] : undefined;
  const editing = view === "editor";
  const resizeActive = editing && isResizeActive(resize);
  const flipActive = editing && (flipH || flipV);
  const rotateActive = editing && rotation !== 0;
  const cropCount = editing ? items.filter((i) => cropPx(i).active).length : 0;
  const targetKb = Number(targetKbText);
  const targetValid = Number.isFinite(targetKb) && targetKb >= 5;
  const resultList = items.map((i) => results[i.id]).filter(Boolean);
  const pendingCount = items.filter((i) => !results[i.id]).length;
  const canRun =
    !isProcessing &&
    pendingCount > 0 &&
    (compressionMode !== "target" || targetValid);

  const allowedMimes = useMemo(
    () =>
      view === "convert" && mode.source
        ? [MIME[mode.source]]
        : view === "base64"
          ? ["image/png", "image/jpeg", "image/webp", "image/gif"]
          : ["image/png", "image/jpeg", "image/webp"],
    [view, mode.source],
  );
  const acceptAttr =
    view === "convert" && mode.source
      ? `${MIME[mode.source]},${mode.source === "jpeg" ? ".jpg,.jpeg" : `.${mode.source}`}`
      : allowedMimes.join(",");

  const resolveFormat = (item: ImageItem): Fmt =>
    targetFormat === "original"
      ? (fmtFromMime(item.mime) ?? "webp")
      : targetFormat;

  const anyPng = items.some((i) => resolveFormat(i) === "png");
  const alphaToJpeg = items.some(
    (i) => i.hasAlpha && resolveFormat(i) === "jpeg",
  );

  const orientedDims = (item: ImageItem): [number, number] => {
    const c = cropPx(item);
    return rotation === 90 || rotation === 270 ? [c.sh, c.sw] : [c.sw, c.sh];
  };

  /* ── Result bookkeeping ──────────────────────────────────────── */

  const invalidate = (ids?: string[]) => {
    const cur = resultsRef.current;
    const targets = ids ?? Object.keys(cur);
    const hit = targets.filter((id) => cur[id]);
    hit.forEach((id) => URL.revokeObjectURL(cur[id].url));
    if (hit.length)
      setResults((p) => {
        const n = { ...p };
        hit.forEach((id) => delete n[id]);
        return n;
      });
    setErrors((p) => {
      if (!targets.some((id) => id in p)) return p;
      const n = { ...p };
      targets.forEach((id) => delete n[id]);
      return n;
    });
  };

  const clearAll = () => {
    itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
    Object.values(resultsRef.current).forEach((r) =>
      URL.revokeObjectURL(r.url),
    );
    setItems([]);
    setActiveId(null);
    setResults({});
    setErrors({});
  };

  // Changing any global setting makes existing results stale → drop them.
  const settingsSig = JSON.stringify({
    targetFormat,
    qualityPreset,
    compressionMode,
    targetKbText,
    resize,
    rotation,
    flipH,
    flipV,
  });
  useEffect(() => {
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsSig]);

  // Tool switched by the hub: reset everything for the new tool.
  const prevMode = useRef(defaultMode);
  useEffect(() => {
    if (prevMode.current === defaultMode) return;
    prevMode.current = defaultMode;
    clearAll();
    setActiveTab(mode.tab);
    setTargetFormat(
      mode.view === "convert" && mode.target ? mode.target : "original",
    );
    setQualityPreset(initialPreset(mode));
    setCompressionMode("quality");
    setResize(DEFAULT_RESIZE);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropRatio(null);
    setB64(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultMode]);

  // Unmount cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runIdRef.current++;
      itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
      Object.values(resultsRef.current).forEach((r) =>
        URL.revokeObjectURL(r.url),
      );
    };
  }, []);

  // Escape closes fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  // ETA
  useEffect(() => {
    if (!isProcessing) return;
    const t = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      if (progress >= 100) setEta("Finalizing…");
      else if (progress > 2) {
        const remaining = Math.max(0, (elapsed / progress) * 100 - elapsed);
        const s = Math.ceil(remaining / 1000);
        setEta(
          s > 60
            ? `~${Math.floor(s / 60)}m ${s % 60}s left`
            : s > 0
              ? `~${s}s left`
              : "Almost done…",
        );
      } else setEta("Calculating…");
    }, 300);
    return () => clearInterval(t);
  }, [isProcessing, progress]);

  // Base64: read the ORIGINAL file (no re-encoding)
  useEffect(() => {
    if (view !== "base64" || !activeItem) {
      setB64(null);
      return;
    }
    let cancelled = false;
    setB64Loading(true);
    const id = activeItem.id;
    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      setB64({ id, dataUri: String(reader.result) });
      setB64Loading(false);
    };
    reader.onerror = () => {
      if (cancelled) return;
      setB64(null);
      setB64Loading(false);
      toast({ variant: "destructive", title: "Couldn't read this file" });
    };
    reader.readAsDataURL(activeItem.file);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeItem?.id]);

  /* ── File handling ───────────────────────────────────────────── */

  const addFiles = async (incoming: File[]) => {
    if (incoming.length === 0 || isProcessing) return;
    const rejected: string[] = [];
    const accepted: File[] = [];
    let slots = MAX_FILES - itemsRef.current.length;

    for (const f of incoming) {
      const mime = mimeFromFile(f);
      if (!allowedMimes.includes(mime))
        rejected.push(`${f.name}: unsupported file type`);
      else if (f.size > MAX_FILE_BYTES)
        rejected.push(
          `${f.name}: larger than ${MAX_FILE_BYTES / 1024 / 1024} MB`,
        );
      else if (slots <= 0)
        rejected.push(`${f.name}: limit of ${MAX_FILES} images reached`);
      else {
        accepted.push(f);
        slots--;
      }
    }

    setIsLoadingFiles(true);
    for (const f of accepted) {
      const mime = mimeFromFile(f);
      const meta = await analyzeFile(f, mime);
      if (!mountedRef.current) return;
      if (!meta && view !== "base64") {
        rejected.push(`${f.name}: couldn't be read as an image`);
        continue;
      }
      if (meta && meta.width * meta.height > MAX_PIXELS) {
        rejected.push(`${f.name}: more than ${MAX_PIXELS / 1e6} megapixels`);
        continue;
      }
      const item: ImageItem = {
        id: `img-${++idRef.current}`,
        file: f,
        mime,
        url: URL.createObjectURL(f),
        width: meta?.width ?? 0,
        height: meta?.height ?? 0,
        hasAlpha: meta?.hasAlpha ?? false,
        crop: FULL_CROP,
      };
      setItems((p) => [...p, item]);
      setActiveId((cur) => cur ?? item.id);
    }
    if (mountedRef.current) setIsLoadingFiles(false);

    if (rejected.length) {
      toast({
        variant: "destructive",
        title: `${rejected.length} file${rejected.length > 1 ? "s" : ""} skipped`,
        description:
          rejected.slice(0, 3).join(" • ") +
          (rejected.length > 3 ? ` …and ${rejected.length - 3} more` : ""),
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    invalidate([id]);
    URL.revokeObjectURL(items[idx].url);
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    if (activeId === id || !next.some((i) => i.id === activeId))
      setActiveId(next[Math.min(idx, next.length - 1)]?.id ?? null);
  };

  /* ── Crop ────────────────────────────────────────────────────── */

  const updateCrop = (id: string, crop: CropBox) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, crop } : i)));
    invalidate([id]);
  };

  const applyAspect = (ratio: number | null) => {
    setCropRatio(ratio);
    if (!ratio || !activeItem) return;
    const { width: W, height: H } = activeItem;
    let w: number;
    let h: number;
    if (ratio >= W / H) {
      w = 100;
      h = (100 * W) / (ratio * H);
    } else {
      h = 100;
      w = (100 * ratio * H) / W;
    }
    updateCrop(activeItem.id, { x: (100 - w) / 2, y: (100 - h) / 2, w, h });
  };

  const startCropDrag = (
    e: React.PointerEvent<HTMLElement>,
    handle: Handle,
  ) => {
    if (!activeItem || isProcessing || !cropContainerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = cropContainerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const b = { ...activeItem.crop };
    const id = activeItem.id;
    const W = activeItem.width;
    const H = activeItem.height;
    const ratio = cropRatio;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      if (handle === "move") {
        updateCrop(id, {
          ...b,
          x: clamp(b.x + dx, 0, 100 - b.w),
          y: clamp(b.y + dy, 0, 100 - b.h),
        });
        return;
      }
      let l = b.x;
      let t = b.y;
      let r = b.x + b.w;
      let bt = b.y + b.h;
      if (handle.includes("w")) l = clamp(l + dx, 0, r - MIN_CROP_PCT);
      if (handle.includes("e")) r = clamp(r + dx, l + MIN_CROP_PCT, 100);
      if (handle.includes("n")) t = clamp(t + dy, 0, bt - MIN_CROP_PCT);
      if (handle.includes("s")) bt = clamp(bt + dy, t + MIN_CROP_PCT, 100);

      if (ratio) {
        const k = W / (ratio * H); // height% per width%
        const anchorBottom = handle.includes("n");
        const anchorRight = handle.includes("w");
        let w = r - l;
        let h = w * k;
        const maxH = anchorBottom ? bt : 100 - t;
        const maxW = anchorRight ? r : 100 - l;
        if (h > maxH) {
          h = maxH;
          w = h / k;
        }
        if (w > maxW) {
          w = maxW;
          h = w * k;
        }
        if (anchorRight) l = r - w;
        else r = l + w;
        if (anchorBottom) t = bt - h;
        else bt = t + h;
      }
      updateCrop(id, { x: l, y: t, w: r - l, h: bt - t });
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  /* ── Processing pipeline (crop → resize → rotate/flip → encode) ─ */

  const opsFor = (item: ImageItem): string[] => {
    const o: string[] = [];
    if (editing && cropPx(item).active) o.push("cropped");
    if (resizeActive) o.push("resized");
    if (rotateActive) o.push("rotated");
    if (flipActive) o.push("flipped");
    return o;
  };

  const buildName = (item: ImageItem, fmt: Fmt) => {
    const ops = opsFor(item);
    const suffix =
      ops.length === 0
        ? fmtFromMime(item.mime) === fmt
          ? "-compressed"
          : ""
        : ops.length === 1
          ? `-${ops[0]}`
          : "-edited";
    return `${baseName(item.file.name)}${suffix}.${EXT[fmt]}`;
  };

  const processItem = async (
    item: ImageItem,
    onProgress?: (p: number) => void,
  ): Promise<ProcessedResult> => {
    const bitmap = await createImageBitmap(item.file);
    try {
      const srcFmt = fmtFromMime(item.mime);
      const fmt = resolveFormat(item);
      const mime = MIME[fmt];
      const warnings: string[] = [];

      const crop = editing
        ? cropPx({
            width: bitmap.width,
            height: bitmap.height,
            crop: item.crop,
          })
        : { sx: 0, sy: 0, sw: bitmap.width, sh: bitmap.height, active: false };
      const rot = editing ? rotation : 0;
      const fx = editing && flipH;
      const fy = editing && flipV;
      const swap = rot === 90 || rot === 270;
      const ow = swap ? crop.sh : crop.sw;
      const oh = swap ? crop.sw : crop.sh;
      const [fw, fh] = resizeActive ? calcSize(ow, oh, resize) : [ow, oh];

      if (fw > MAX_SIDE || fh > MAX_SIDE || fw * fh > MAX_PIXELS)
        throw new Error(
          `Output of ${fw}×${fh} px is too large (max ${MAX_SIDE} px per side).`,
        );

      const [dw, dh] = swap ? [fh, fw] : [fw, fh];
      let canvas = scaleToCanvas(
        bitmap,
        crop.sx,
        crop.sy,
        crop.sw,
        crop.sh,
        dw,
        dh,
      );

      if (rot !== 0 || fx || fy || fmt === "jpeg") {
        const out = makeCanvas(fw, fh);
        if (fmt === "jpeg") {
          out.ctx.fillStyle = "#ffffff"; // JPEG has no alpha
          out.ctx.fillRect(0, 0, fw, fh);
        }
        out.ctx.translate(fw / 2, fh / 2);
        out.ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
        out.ctx.rotate((rot * Math.PI) / 180);
        out.ctx.drawImage(canvas, -dw / 2, -dh / 2);
        canvas = out.c;
      }

      if (item.hasAlpha && fmt === "jpeg")
        warnings.push(
          "Transparent areas were filled with white (JPEG has no transparency).",
        );

      let blob: Blob;
      let outW = fw;
      let outH = fh;
      if (compressionMode === "target" && fmt !== "png") {
        const r = await encodeToTarget(
          canvas,
          mime,
          targetKb * 1024,
          onProgress,
        );
        blob = r.blob;
        outW = r.width;
        outH = r.height;
        warnings.push(...r.warnings);
      } else {
        if (compressionMode === "target" && fmt === "png")
          warnings.push(
            "PNG is lossless, so a target size can't be applied. Use WebP or JPEG.",
          );
        blob = await canvasToBlob(
          canvas,
          mime,
          fmt === "png" ? undefined : QUALITY[qualityPreset],
        );
      }

      // Never hand back something bigger when nothing else was requested.
      const geometryChanged =
        crop.active ||
        rot !== 0 ||
        fx ||
        fy ||
        outW !== bitmap.width ||
        outH !== bitmap.height;
      let kept = false;
      if (!geometryChanged && srcFmt === fmt && blob.size >= item.file.size) {
        blob = item.file;
        kept = true;
      }

      return {
        id: item.id,
        name: kept ? item.file.name : buildName(item, fmt),
        blob,
        url: URL.createObjectURL(blob),
        originalSize: item.file.size,
        newSize: blob.size,
        width: kept ? bitmap.width : outW,
        height: kept ? bitmap.height : outH,
        format: EXT[fmt].toUpperCase(),
        kept,
        warnings,
      };
    } finally {
      bitmap.close();
    }
  };

  const handleProcess = async () => {
    if (!canRun) return;
    const pending = items.filter((i) => !results[i.id]);
    const run = ++runIdRef.current;
    setIsProcessing(true);
    setProgress(0);
    setEta("Starting…");
    startRef.current = Date.now();
    setErrors({});

    let done = 0;
    let ok = 0;
    let failed = 0;
    let next = 0;

    const worker = async () => {
      for (;;) {
        const idx = next++;
        if (idx >= pending.length) return;
        const item = pending[idx];
        try {
          const res = await processItem(
            item,
            pending.length === 1 ? setProgress : undefined,
          );
          if (!mountedRef.current || runIdRef.current !== run) {
            URL.revokeObjectURL(res.url);
            return;
          }
          setResults((p) => ({ ...p, [item.id]: res }));
          ok++;
        } catch (err) {
          failed++;
          const message =
            err instanceof Error ? err.message : "Processing failed.";
          if (mountedRef.current)
            setErrors((p) => ({ ...p, [item.id]: message }));
        }
        done++;
        if (pending.length > 1 && mountedRef.current)
          setProgress(Math.round((done / pending.length) * 100));
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker),
    );
    if (!mountedRef.current || runIdRef.current !== run) return;
    setProgress(100);
    setIsProcessing(false);

    if (failed > 0)
      toast({
        variant: "destructive",
        title: `${ok} of ${pending.length} processed`,
        description: `${failed} failed. Select the image with a red mark to see why.`,
      });
    else if (pending.length > 1)
      toast({
        title: "Batch complete",
        description: `Processed ${ok} images.`,
      });
  };

  /* ── Downloads ───────────────────────────────────────────────── */

  const downloadSingle = () => {
    if (activeResult) triggerDownload(activeResult.url, activeResult.name);
  };

  const downloadZip = async () => {
    if (resultList.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const used = new Map<string, number>();
      for (const r of resultList) {
        const key = r.name.toLowerCase();
        const n = used.get(key) ?? 0;
        used.set(key, n + 1);
        const dot = r.name.lastIndexOf(".");
        const name =
          n === 0
            ? r.name
            : `${r.name.slice(0, dot)}-${n + 1}${r.name.slice(dot)}`;
        zip.file(name, r.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(
        URL.createObjectURL(blob),
        `images-${Date.now()}.zip`,
        true,
      );
    } catch {
      toast({ variant: "destructive", title: "Couldn't create the ZIP file" });
    } finally {
      setIsZipping(false);
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied` });
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
      });
    }
  };

  /* ── Slider ──────────────────────────────────────────────────── */

  const moveSlider = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSplitPosition(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100));
  };

  /* ── Resize field handlers ───────────────────────────────────── */

  const setDim = (axis: "width" | "height", raw: string) => {
    const v = parseInt(raw, 10);
    setResize((r) => {
      if (!v || v <= 0) return { ...r, [axis]: null };
      if (r.lock)
        return axis === "width"
          ? { ...r, width: v, height: null }
          : { ...r, height: v, width: null };
      return { ...r, [axis]: v };
    });
  };

  const baseDims = activeItem && editing ? orientedDims(activeItem) : null;
  const outDims = baseDims
    ? resizeActive
      ? calcSize(baseDims[0], baseDims[1], resize)
      : baseDims
    : null;
  const outTooLarge =
    !!outDims &&
    (outDims[0] > MAX_SIDE ||
      outDims[1] > MAX_SIDE ||
      outDims[0] * outDims[1] > MAX_PIXELS);

  /* ════════════════════════════════════════════════════════════════
     RENDER PIECES
  ════════════════════════════════════════════════════════════════ */

  const previewTransform = editing
    ? `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) rotate(${rotation}deg)`
    : undefined;

  const comparable =
    !!activeResult &&
    !!activeItem &&
    activeItem.width > 0 &&
    Math.abs(
      activeResult.width / activeResult.height -
        activeItem.width / activeItem.height,
    ) < 0.01;

  const renderCanvas = () => {
    if (!activeItem) {
      return (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-xl border-2 border-dashed rounded-xl p-12 sm:p-16 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group bg-background/50 backdrop-blur-sm ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border/60 hover:border-primary/50 hover:bg-background/80"
          }`}
        >
          <div
            className={`p-4 rounded-xl mb-4 transition-transform duration-300 ${
              isDragging
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-secondary text-secondary-foreground group-hover:scale-110"
            }`}
          >
            {isLoadingFiles ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-foreground">
            {view === "convert" && mode.source
              ? `Upload ${mode.source === "jpeg" ? "JPG" : mode.source.toUpperCase()} files`
              : view === "base64"
                ? "Upload an image"
                : "Import images"}
          </h3>
          <p className="text-xs text-muted-foreground font-medium text-center max-w-sm">
            Drag and drop, or click to browse. Up to {MAX_FILES} files,{" "}
            {MAX_FILE_BYTES / 1024 / 1024} MB each. Files never leave your
            device.
          </p>
        </div>
      );
    }

    const frame = "shadow-2xl border border-border/50";

    // ── Crop view
    if (activeTab === "crop" && editing) {
      const c = activeItem.crop;
      const corner = (h: Handle, pos: string, cursor: string) => (
        <div
          onPointerDown={(e) => startCropDrag(e, h)}
          style={{ touchAction: "none" }}
          className={`absolute w-5 h-5 rounded-sm bg-primary border-2 border-background shadow z-10 ${pos} ${cursor}`}
        />
      );
      return (
        <div
          ref={cropContainerRef}
          className="relative inline-block select-none max-h-[60vh]"
        >
          <img
            src={activeItem.url}
            alt="Source"
            draggable={false}
            className={`max-h-[60vh] max-w-full object-contain pointer-events-none block ${frame}`}
          />
          <div
            onPointerDown={(e) => startCropDrag(e, "move")}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.w}%`,
              height: `${c.h}%`,
              touchAction: "none",
            }}
            className="absolute border border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move"
          >
            {corner("nw", "-top-2 -left-2", "cursor-nwse-resize")}
            {corner("ne", "-top-2 -right-2", "cursor-nesw-resize")}
            {corner("sw", "-bottom-2 -left-2", "cursor-nesw-resize")}
            {corner("se", "-bottom-2 -right-2", "cursor-nwse-resize")}
          </div>
        </div>
      );
    }

    // ── Result: slider (same shape) or original/result toggle (different shape)
    if (activeResult && activeTab !== "info" && view !== "base64") {
      if (comparable) {
        return (
          <div
            ref={sliderRef}
            style={{ touchAction: "pan-y" }}
            className={`relative inline-block max-h-[60vh] max-w-full select-none cursor-ew-resize overflow-hidden ${frame}`}
            onPointerDown={(e) => {
              draggingSlider.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              moveSlider(e.clientX);
            }}
            onPointerMove={(e) => {
              if (draggingSlider.current) moveSlider(e.clientX);
            }}
            onPointerUp={() => {
              draggingSlider.current = false;
            }}
            onPointerCancel={() => {
              draggingSlider.current = false;
            }}
          >
            <img
              src={activeItem.url}
              alt="Original"
              draggable={false}
              className="max-h-[60vh] max-w-full object-contain pointer-events-none block"
            />
            <div
              style={{
                clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`,
              }}
              className="absolute inset-0"
            >
              <img
                src={activeResult.url}
                alt="Result"
                draggable={false}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </div>
            <div
              style={{ left: `${splitPosition}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 flex items-center justify-center"
            >
              <div className="w-7 h-7 rounded-full bg-primary border-2 border-background flex items-center justify-center shrink-0">
                <ArrowRightLeft className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </div>
            <div className="absolute top-2 left-2 bg-background/90 text-foreground text-[10px] font-black px-2 py-1 rounded border border-border/50 z-10">
              Original · {formatBytes(activeResult.originalSize)}
            </div>
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded z-10">
              Result · {formatBytes(activeResult.newSize)}
            </div>
          </div>
        );
      }
      const showOriginal = viewSide === "original";
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex bg-background/90 p-1 rounded-md border border-border/50 text-[10px] font-black">
            {(["original", "result"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setViewSide(s)}
                className={`px-3 py-1 rounded capitalize ${viewSide === s ? "bg-card text-foreground shadow border border-border/50" : "text-muted-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <img
            src={showOriginal ? activeItem.url : activeResult.url}
            alt={showOriginal ? "Original" : "Result"}
            className={`max-h-[55vh] max-w-full object-contain ${frame}`}
          />
        </div>
      );
    }

    // ── Plain preview (with live rotate/flip preview)
    return (
      <img
        src={activeItem.url}
        alt="Workspace"
        className={`max-h-[60vh] max-w-full object-contain transition-transform duration-200 ${frame}`}
        style={{ transform: previewTransform }}
      />
    );
  };

  const chip = (label: string, onClear: () => void) => (
    <span
      key={label}
      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
    >
      {label}
      <button
        onClick={onClear}
        aria-label={`Remove ${label}`}
        className="p-0.5 rounded-full hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );

  const label =
    "text-[9px] font-black uppercase tracking-widest text-muted-foreground";
  const segBtn = (on: boolean) =>
    `flex-1 py-1.5 rounded text-[10px] font-black transition-all ${on ? "bg-card text-foreground shadow border border-border/50" : "text-muted-foreground hover:text-foreground"}`;
  const optBtn = (on: boolean) =>
    `py-1.5 px-2 rounded border text-[10px] font-black transition-all ${on ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`;
  const numInput =
    "w-full h-8 px-2 bg-background border border-border/40 rounded text-[11px] font-mono text-foreground text-center";

  const totalOrig = resultList.reduce((s, r) => s + r.originalSize, 0);
  const totalNew = resultList.reduce((s, r) => s + r.newSize, 0);

  /* ── Panel body per view / tab ───────────────────────────────── */

  const renderEditChips = () => {
    const chips: React.ReactNode[] = [];
    if (cropCount > 0)
      chips.push(
        chip(`Crop${cropCount > 1 ? ` (${cropCount})` : ""}`, () => {
          setItems((p) => p.map((i) => ({ ...i, crop: FULL_CROP })));
          invalidate();
        }),
      );
    if (resizeActive)
      chips.push(chip("Resize", () => setResize(DEFAULT_RESIZE)));
    if (rotateActive)
      chips.push(chip(`Rotate ${rotation}°`, () => setRotation(0)));
    if (flipActive)
      chips.push(
        chip("Flip", () => {
          setFlipH(false);
          setFlipV(false);
        }),
      );
    if (chips.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <span className={label}>
          Edits applied on export{items.length > 1 ? " (all images)" : ""}
        </span>
        <div className="flex flex-wrap gap-1.5">{chips}</div>
      </div>
    );
  };

  const renderCompress = () => (
    <div className="space-y-3">
      <div className="flex bg-background p-1 rounded-md border border-border/40">
        <button
          onClick={() => setCompressionMode("quality")}
          className={segBtn(compressionMode === "quality")}
        >
          Quality
        </button>
        <button
          onClick={() => setCompressionMode("target")}
          className={segBtn(compressionMode === "target")}
        >
          Max file size
        </button>
      </div>

      {compressionMode === "quality" ? (
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(QUALITY) as QualityPreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setQualityPreset(p)}
              className={`p-2 rounded border text-left flex flex-col transition-all ${qualityPreset === p ? "border-primary bg-primary/10 text-primary" : "border-border/30 hover:border-border/60 text-foreground"}`}
            >
              <span className="text-[10px] font-black">{QUALITY_LABEL[p]}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">
                {Math.round(QUALITY[p] * 100)}%
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 p-3 bg-background rounded-md border border-border/40">
          <div className="flex items-center justify-between">
            <span className={label}>Keep under</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={5}
                value={targetKbText}
                onChange={(e) => setTargetKbText(e.target.value)}
                className="w-24 h-8 px-2 bg-card border border-border/50 rounded text-[11px] font-mono font-black text-primary text-center focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] font-bold text-muted-foreground">
                KB
              </span>
            </div>
          </div>
          <input
            type="range"
            min={10}
            max={5000}
            step={10}
            value={targetValid ? clamp(targetKb, 10, 5000) : 150}
            onChange={(e) => setTargetKbText(e.target.value)}
            className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          {!targetValid && (
            <p className="text-[10px] text-rose-500">Enter at least 5 KB.</p>
          )}
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Lowers quality first. Only if that isn't enough, dimensions are
            reduced, and you'll be told when that happens. Files already under
            the limit are left as they are.
          </p>
        </div>
      )}

      {anyPng && (
        <p className="text-[10px] text-muted-foreground leading-relaxed flex gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
          PNG is lossless: quality settings don't change PNG output. Export as
          WebP or JPEG for much smaller files.
        </p>
      )}
      {alphaToJpeg && (
        <p className="text-[10px] text-amber-500 leading-relaxed flex gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Some images have transparency. JPEG will fill it with white.
        </p>
      )}
    </div>
  );

  const renderResize = () => (
    <div className="space-y-3">
      <div className="flex bg-background p-1 rounded-md border border-border/40">
        {(["pixels", "percent"] as ResizeMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setResize((r) => ({ ...r, mode: m }))}
            className={`${segBtn(resize.mode === m)} capitalize`}
          >
            {m}
          </button>
        ))}
      </div>

      {resize.mode === "pixels" ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={`${label} block mb-1`}>Width</span>
              <input
                type="number"
                min={1}
                value={resize.width ?? outDims?.[0] ?? ""}
                onChange={(e) => setDim("width", e.target.value)}
                className={numInput}
              />
            </div>
            <div>
              <span className={`${label} block mb-1`}>Height</span>
              <input
                type="number"
                min={1}
                value={resize.height ?? outDims?.[1] ?? ""}
                onChange={(e) => setDim("height", e.target.value)}
                className={numInput}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={resize.lock}
              onChange={(e) =>
                setResize((r) => ({
                  ...r,
                  lock: e.target.checked,
                  height:
                    e.target.checked && r.width !== null ? null : r.height,
                }))
              }
              className="rounded border-border/50 bg-background accent-primary"
            />
            Lock aspect ratio
          </label>
          {items.length > 1 && (
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {resize.lock
                ? "Applies to every image. Each image keeps its own proportions."
                : "Every image is forced to this exact size."}
            </p>
          )}
        </>
      ) : (
        <div className="space-y-2 p-3 bg-background rounded-md border border-border/40">
          <div className="flex items-center justify-between">
            <span className={label}>Scale</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={400}
                value={resize.percent}
                onChange={(e) =>
                  setResize((r) => ({
                    ...r,
                    percent: clamp(parseInt(e.target.value, 10) || 100, 1, 400),
                  }))
                }
                className="w-20 h-8 px-2 bg-card border border-border/50 rounded text-[11px] font-mono font-black text-primary text-center"
              />
              <span className="text-[10px] font-bold text-muted-foreground">
                %
              </span>
            </div>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={clamp(resize.percent, 10, 200)}
            onChange={(e) =>
              setResize((r) => ({
                ...r,
                percent: parseInt(e.target.value, 10),
              }))
            }
            className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => setResize((r) => ({ ...r, percent: p }))}
                className={optBtn(resize.percent === p)}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>
      )}

      {outDims && (
        <p
          className={`text-[10px] font-mono ${outTooLarge ? "text-rose-500" : "text-muted-foreground"}`}
        >
          Output: {outDims[0]} × {outDims[1]} px
          {outTooLarge && ` (too large, max ${MAX_SIDE} px per side)`}
        </p>
      )}
      {resizeActive && (
        <button
          onClick={() => setResize(DEFAULT_RESIZE)}
          className="text-[10px] font-bold text-primary hover:underline"
        >
          Reset size
        </button>
      )}
    </div>
  );

  const renderCrop = () => {
    const px = activeItem ? cropPx(activeItem) : null;
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <span className={label}>Aspect ratio</span>
          <div className="grid grid-cols-3 gap-1.5">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                onClick={() => applyAspect(a.value)}
                className={optBtn(cropRatio === a.value)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
        {px && (
          <p className="text-[10px] font-mono text-muted-foreground">
            Selection: {px.sw} × {px.sh} px
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <button
            onClick={() => {
              if (activeItem) updateCrop(activeItem.id, FULL_CROP);
            }}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            Reset crop
          </button>
          {items.length > 1 && activeItem && (
            <button
              onClick={() => {
                const c = activeItem.crop;
                setItems((p) => p.map((i) => ({ ...i, crop: c })));
                invalidate();
              }}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Apply this crop to all
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {items.length > 1
            ? "Crop is set per image. Select a thumbnail to adjust it. "
            : ""}
          Crop is applied before any rotation.
        </p>
      </div>
    );
  };

  const renderRotate = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setRotation((r) => (r + 270) % 360)}
          className={`${optBtn(false)} flex items-center justify-center gap-1.5`}
        >
          <RotateCcw className="h-3.5 w-3.5" /> 90° left
        </button>
        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className={`${optBtn(false)} flex items-center justify-center gap-1.5`}
        >
          <RotateCw className="h-3.5 w-3.5" /> 90° right
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[0, 90, 180, 270].map((deg) => (
          <button
            key={deg}
            onClick={() => setRotation(deg)}
            className={`${optBtn(rotation === deg)} font-mono`}
          >
            {deg}°
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setFlipH((v) => !v)}
          className={`${optBtn(flipH)} flex items-center justify-center gap-1.5`}
        >
          <FlipHorizontal className="h-3.5 w-3.5" /> Flip horizontal
        </button>
        <button
          onClick={() => setFlipV((v) => !v)}
          className={`${optBtn(flipV)} flex items-center justify-center gap-1.5`}
        >
          <FlipVertical className="h-3.5 w-3.5" /> Flip vertical
        </button>
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="space-y-3">
      {activeItem ? (
        <div className="p-2 bg-background rounded border border-border/30 space-y-1 font-mono text-[10px] text-muted-foreground">
          {[
            ["Name", activeItem.file.name],
            ["Format", activeItem.mime || "unknown"],
            ["Dimensions", `${activeItem.width} × ${activeItem.height} px`],
            ["Size", formatBytes(activeItem.file.size)],
            ["Transparency", activeItem.hasAlpha ? "Yes" : "No"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span>{k}</span>
              <span className="text-foreground truncate">{v}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Add an image to see its details.
        </p>
      )}
      <p className="text-[10px] text-muted-foreground leading-relaxed flex gap-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
        Exported files don't include the original metadata (EXIF, location,
        camera, colour profile). Colours may shift slightly for wide-gamut
        images.
      </p>
    </div>
  );

  const renderBase64 = () => {
    const dataUri = b64 && b64.id === activeItem?.id ? b64.dataUri : null;
    if (!activeItem)
      return (
        <p className="text-[11px] text-muted-foreground">
          Add an image to generate its Base64 code.
        </p>
      );
    if (b64Loading || !dataUri)
      return (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Encoding…
        </div>
      );
    const raw = dataUri.slice(dataUri.indexOf(",") + 1);
    const alt = baseName(activeItem.file.name).replace(/[-_]/g, " ");
    const dims =
      activeItem.width > 0
        ? ` width="${activeItem.width}" height="${activeItem.height}"`
        : "";
    const blocks = [
      { key: "Data URI", value: dataUri },
      { key: "Raw Base64", value: raw },
      {
        key: "HTML <img>",
        value: `<img src="${dataUri}" alt="${alt}"${dims} />`,
      },
      { key: "CSS", value: `background-image: url("${dataUri}");` },
    ];
    return (
      <div className="space-y-3">
        <div className="p-2 bg-background rounded border border-border/30 font-mono text-[10px] text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>File</span>
            <span className="text-foreground">
              {formatBytes(activeItem.file.size)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Base64 text</span>
            <span className="text-foreground">{formatBytes(raw.length)}</span>
          </div>
        </div>
        {raw.length > 100 * 1024 && (
          <p className="text-[10px] text-amber-500 leading-relaxed flex gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Base64 is about 33% larger than the file. For images over ~100 KB, a
            normal image file usually loads faster than inlining.
          </p>
        )}
        {blocks.map((b) => (
          <div key={b.key} className="space-y-1">
            <span className={label}>{b.key}</span>
            <div className="relative">
              <textarea
                readOnly
                value={preview(b.value)}
                className="w-full h-16 p-2 pr-9 bg-muted/40 border border-border/30 rounded text-[9px] font-mono resize-none"
              />
              <button
                onClick={() => copyText(b.value, b.key)}
                aria-label={`Copy ${b.key}`}
                className="absolute top-1.5 right-1.5 p-1 bg-primary text-primary-foreground rounded shadow hover:bg-primary/90"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Encodes your original file as-is. Nothing is re-compressed.
        </p>
      </div>
    );
  };

  /* ── Action bar ──────────────────────────────────────────────── */

  const renderResultCard = () => {
    if (activeError)
      return (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-[10px] text-rose-500 flex gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      );
    if (!activeResult) return null;
    const delta = pctChange(activeResult.originalSize, activeResult.newSize);
    return (
      <div className="rounded-md border border-border/40 bg-background p-2 space-y-1 text-[10px]">
        <div className="flex justify-between font-mono font-bold">
          <span className="text-foreground">
            {formatBytes(activeResult.originalSize)} →{" "}
            {formatBytes(activeResult.newSize)}
          </span>
          <span className={delta > 0 ? "text-amber-500" : "text-emerald-500"}>
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
        <div className="text-muted-foreground font-mono">
          {activeResult.width} × {activeResult.height} px ·{" "}
          {activeResult.format}
        </div>
        {activeResult.kept && (
          <div className="text-muted-foreground">
            Already well compressed. Your original file was kept.
          </div>
        )}
        {!activeResult.kept && delta > 0 && (
          <div className="text-amber-500">
            This result is larger than the original.
          </div>
        )}
        {activeResult.warnings.map((w) => (
          <div key={w} className="text-amber-500 flex gap-1">
            <AlertTriangle className="h-3 w-3 shrink-0 mt-px" /> {w}
          </div>
        ))}
        {resultList.length > 1 && (
          <div className="pt-1 mt-1 border-t border-border/30 text-muted-foreground font-mono">
            All {resultList.length}: {formatBytes(totalOrig)} →{" "}
            {formatBytes(totalNew)} ({pctChange(totalOrig, totalNew)}%)
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════
     LAYOUT
  ════════════════════════════════════════════════════════════════ */

  const content = (
    <div
      className={`flex flex-col lg:flex-row bg-background overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[99999] m-0 rounded-none w-screen h-[100dvh] border-none"
          : "lg:h-[calc(100dvh-120px)] -m-4 sm:-m-6 rounded-xl border border-border/40"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple
        accept={acceptAttr}
        className="hidden"
      />

      {/* ── LEFT: canvas ── */}
      <div
        className="flex-1 flex flex-col relative overflow-hidden min-h-[360px]"
        style={{
          backgroundColor: "hsl(var(--muted) / 0.2)",
          backgroundImage: showChecker
            ? "conic-gradient(var(--border) 90deg, transparent 90deg 180deg, var(--border) 180deg 270deg, transparent 270deg)"
            : "none",
          backgroundSize: "20px 20px",
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragging(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur-md border border-border/50 rounded-md p-1 shadow-lg">
          <button
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.1, +(z - 0.1).toFixed(2)))}
            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Reset zoom"
            className="text-[11px] font-mono font-bold w-12 text-center text-foreground"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(5, +(z + 0.1).toFixed(2)))}
            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            aria-label="Toggle transparency grid"
            onClick={() => setShowChecker((v) => !v)}
            className={`p-1.5 rounded ${showChecker ? "bg-primary/20 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
            title="Toggle transparency grid"
          >
            <Layers className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 pt-16 overflow-auto relative">
          <div
            className="relative flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {renderCanvas()}
          </div>
        </div>

        {items.length > 0 && (
          <div className="h-24 bg-background/95 backdrop-blur-md border-t border-border/40 flex items-center gap-3 px-4 overflow-x-auto shrink-0 z-30">
            {items.map((item) => {
              const hasResult = !!results[item.id];
              const hasError = !!errors[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  title={errors[item.id] ?? item.file.name}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer group flex-shrink-0 transition-all ${
                    activeItem?.id === item.id
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent hover:border-border/80 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={item.url}
                    className="w-full h-full object-cover"
                    alt={item.file.name}
                    draggable={false}
                  />
                  {(hasResult || hasError) && (
                    <span
                      className={`absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full border border-background ${hasError ? "bg-rose-500" : "bg-emerald-500"}`}
                    />
                  )}
                  {!isProcessing && (
                    <button
                      aria-label={`Remove ${item.file.name}`}
                      onClick={(e) => removeItem(item.id, e)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-rose-500 text-white rounded-full p-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
            {!isProcessing && items.length < MAX_FILES && (
              <button
                aria-label="Add more images"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center flex-shrink-0 transition-all group"
              >
                {isLoadingFiles ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                )}
              </button>
            )}
          </div>
        )}

        <div className="h-8 bg-card border-t border-border/40 flex items-center px-4 justify-between shrink-0 text-[10px] text-muted-foreground font-mono z-20">
          <div className="flex gap-4">
            <span>
              {activeItem
                ? `${activeItem.width} × ${activeItem.height} px`
                : "No image"}
            </span>
            {activeItem && <span>{formatBytes(activeItem.file.size)}</span>}
            {items.length > 1 && <span>{items.length} images</span>}
          </div>
          <div className="flex gap-4">
            {view !== "base64" && (
              <span>
                {targetFormat === "original"
                  ? "ORIGINAL FORMAT"
                  : targetFormat.toUpperCase()}
              </span>
            )}
            <span>
              {view === "convert"
                ? "CONVERT"
                : view === "base64"
                  ? "BASE64"
                  : activeTab.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: properties ── */}
      <aside className="bg-card border-t lg:border-t-0 lg:border-l border-border/40 flex flex-col w-full lg:w-80 shrink-0 lg:h-full z-40">
        <div className="h-10 border-b border-border/40 flex items-center justify-between px-3 shrink-0 bg-muted/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
            {view === "convert"
              ? "Convert"
              : view === "base64"
                ? "Base64"
                : "Properties"}
          </span>
          <button
            aria-label={isFullscreen ? "Exit fullscreen" : "Maximize workspace"}
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="flex-1 min-h-0 lg:overflow-y-auto">
          <fieldset
            disabled={isProcessing}
            className="p-3 space-y-4 min-w-0 border-0 m-0 disabled:opacity-60"
          >
            {view === "editor" && (
              <>
                <div className="flex bg-background p-1 rounded-md border border-border/40">
                  {TAB_DEFS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 min-w-0 py-1.5 rounded text-[9px] font-black flex flex-col items-center gap-1 transition-all ${
                          activeTab === t.id
                            ? "bg-card text-foreground shadow-sm border border-border/50"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" /> {t.label}
                      </button>
                    );
                  })}
                </div>
                {renderEditChips()}
                {activeTab === "compress" && renderCompress()}
                {activeTab === "resize" && renderResize()}
                {activeTab === "crop" && renderCrop()}
                {activeTab === "rotate" && renderRotate()}
                {activeTab === "info" && renderInfo()}
              </>
            )}
            {view === "convert" && (
              <div className="space-y-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Converting to{" "}
                  <span className="font-black text-foreground">
                    {targetFormat === "jpeg"
                      ? "JPG"
                      : targetFormat.toUpperCase()}
                  </span>
                  . Choose the quality, then convert.
                </p>
                {targetFormat !== "png" ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(QUALITY) as QualityPreset[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setQualityPreset(p)}
                        className={`p-2 rounded border text-left flex flex-col ${qualityPreset === p ? "border-primary bg-primary/10 text-primary" : "border-border/30 text-foreground"}`}
                      >
                        <span className="text-[10px] font-black">
                          {QUALITY_LABEL[p]}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">
                          {Math.round(QUALITY[p] * 100)}%
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    PNG is lossless, so there's no quality setting.
                  </p>
                )}
                {alphaToJpeg && (
                  <p className="text-[10px] text-amber-500">
                    Transparent areas will be filled with white.
                  </p>
                )}
              </div>
            )}
            {view === "base64" && renderBase64()}
          </fieldset>
        </div>

        {view !== "base64" && (
          <div className="p-3 border-t border-border/40 bg-card lg:bg-muted/20 shrink-0 space-y-3 sticky bottom-0 lg:static z-30">
            {renderResultCard()}

            {view === "editor" && (
              <div className="space-y-1.5">
                <span className={label}>Output format</span>
                <div className="grid grid-cols-4 gap-1">
                  {(["original", "webp", "jpeg", "png"] as TargetFormat[]).map(
                    (f) => (
                      <button
                        key={f}
                        disabled={isProcessing}
                        onClick={() => setTargetFormat(f)}
                        className={`py-1.5 rounded border text-[10px] font-black transition-all ${targetFormat === f ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
                      >
                        {f === "original"
                          ? "Same"
                          : f === "jpeg"
                            ? "JPG"
                            : f.toUpperCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!canRun}
              className="relative overflow-hidden w-full py-2.5 rounded text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-black/30 transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center gap-2 w-full px-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span className="truncate">
                      {progress}% {eta && `· ${eta}`}
                    </span>
                  </>
                ) : (
                  <>
                    <Settings2 className="h-4 w-4 shrink-0" />
                    {items.length === 0
                      ? "Add images first"
                      : pendingCount === 0
                        ? "All processed"
                        : `${view === "convert" ? "Convert" : "Apply & export"}${pendingCount > 1 ? ` (${pendingCount})` : ""}`}
                  </>
                )}
              </div>
            </button>

            {activeResult && (
              <button
                onClick={downloadSingle}
                className="w-full py-2.5 rounded bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-400 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download this image
              </button>
            )}
            {resultList.length > 1 && (
              <button
                onClick={downloadZip}
                disabled={isZipping}
                className="w-full py-2.5 rounded border border-emerald-500 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isZipping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileArchive className="h-4 w-4" />
                )}
                Download all as ZIP ({resultList.length})
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );

  if (isFullscreen && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
