"use client";

/**
 * ImageWorkspace — left tool rail + top action bar + canvas.
 *
 * Layout:
 *   Top bar     [tool switcher] · tool options (lg+) · format pills · result chip · Download / ZIP · Export
 *   Left rail   Compress / Resize / Crop / Rotate / Info (lg+ vertical, otherwise a strip above the canvas)
 *   Options     below lg the tool options sit in a thin strip under the top bar
 *   Canvas      infinite pan/zoom workspace, floating toolbar, crop overlay, compare slider
 *   Drawer      Info tab and Base64 output (a flex child, never covers the canvas)
 *   Footer      one strip: thumbnails + image/format status
 *
 * Behaviour, export pipeline and every limit/warning are unchanged.
 * Optional prop `toolSwitcher`: your tool dropdown, rendered at the left of the top bar.
 * TooltipProvider lives in app/layout.tsx. Tooltips render in a portal.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Upload,
  Download,
  Loader2,
  Settings2,
  Sparkles,
  Crop,
  Maximize2,
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
  Hand,
  MousePointer2,
  Undo2,
  Redo2,
  Scan,
  LayoutGrid,
  Command as CommandIcon,
  Search,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ════════════════════════════════════════════════════════════════
   TOOLTIP HELPER
════════════════════════════════════════════════════════════════ */

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
type CanvasTool = "select" | "hand";

interface CropBox {
  x: number;
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
  x: number;
  y: number;
  dw: number;
}

interface ResizeSettings {
  mode: ResizeMode;
  width: number | null;
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
  kept: boolean;
  warnings: string[];
}

interface ParsedMode {
  view: View;
  tab: Tab;
  source: Fmt | null;
  target: Fmt | null;
}

interface Cam {
  x: number;
  y: number;
  zoom: number;
}

interface LayoutSnap {
  id: string;
  x: number;
  y: number;
  dw: number;
}

interface Cmd {
  id: string;
  group: string;
  label: string;
  keywords?: string;
  shortcut?: string;
  icon?: React.ComponentType<{ className?: string }>;
  run: () => void;
}

const MAX_FILES = 50;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 12000;
const MAX_PIXELS = 80_000_000;
const MIN_CROP_PCT = 5;
const CONCURRENCY = 2;

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 6;
const GRID_COLS = 4;
const CELL_W = 560;
const CELL_H = 460;
const MAX_DISPLAY_W = 480;
const MAX_DISPLAY_H = 360;
const LAYOUT_EASE = "320ms cubic-bezier(0.22, 1, 0.36, 1)";
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const CHECKER =
  "conic-gradient(rgba(128,128,128,0.22) 90deg, transparent 90deg 180deg, rgba(128,128,128,0.22) 180deg 270deg, transparent 270deg)";

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

const itemH = (i: { dw: number; width: number; height: number }) =>
  i.width > 0 ? (i.dw * i.height) / i.width : i.dw * 0.75;

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
  toolSwitcher,
}: {
  defaultMode?: string;
  /** Optional: your tool dropdown. Rendered at the left of the top bar. */
  toolSwitcher?: React.ReactNode;
}) {
  const { toast } = useToast();
  const mode = useMemo(() => parseMode(defaultMode), [defaultMode]);
  const view = mode.view;

  // Files
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const [cam, setCamState] = useState<Cam>({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<CanvasTool>("select");
  const [spaceDown, setSpaceDown] = useState(false);
  const [viewSize, setViewSize] = useState({ w: 800, h: 500 });
  const [marquee, setMarquee] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [showChecker, setShowChecker] = useState(true);
  const [splitPosition, setSplitPosition] = useState(50);
  const [viewSide, setViewSide] = useState<"original" | "result">("result");
  const [showResult, setShowResult] = useState(false);
  const [layoutAnim, setLayoutAnim] = useState(false);
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const paletteListRef = useRef<HTMLDivElement>(null);

  // Settings
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
  const viewRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const draggingSlider = useRef(false);
  const startRef = useRef(0);
  const runIdRef = useRef(0);
  const idRef = useRef(0);
  const mountedRef = useRef(true);
  const itemsRef = useRef(items);
  const resultsRef = useRef(results);
  itemsRef.current = items;
  resultsRef.current = results;
  const camRef = useRef<Cam>(cam);
  const animRef = useRef(0);
  const camTargetRef = useRef<Cam | null>(null);
  const layoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spaceRef = useRef(false);
  const pinchRef = useRef(false);
  const pinchStart = useRef<{
    d0: number;
    mid: [number, number];
    cam: Cam;
  } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const layoutPast = useRef<LayoutSnap[][]>([]);
  const layoutFuture = useRef<LayoutSnap[][]>([]);
  const lastNudge = useRef(0);
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  const keyUpRef = useRef<(e: KeyboardEvent) => void>(() => {});
  const pasteRef = useRef<(e: ClipboardEvent) => void>(() => {});

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

  const applyLabel =
    items.length === 0
      ? "Add images first"
      : pendingCount === 0
        ? "All done"
        : compressionMode === "target" && !targetValid
          ? "Invalid size"
          : view === "convert"
            ? `Convert${pendingCount > 1 ? ` (${pendingCount})` : ""}`
            : `Export${pendingCount > 1 ? ` (${pendingCount})` : ""}`;

  const applyTipLabel =
    items.length === 0
      ? "Add images first"
      : pendingCount === 0
        ? "Everything is already processed"
        : compressionMode === "target" && !targetValid
          ? "Enter a valid target size in the options bar"
          : `Apply settings and export${pendingCount > 1 ? ` ${pendingCount} images` : ""}`;

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

  /* ── Camera ──────────────────────────────────────────────────── */

  /** Instant camera set. Any manual pan/zoom cancels a running glide. */
  const setCam = (c: Cam) => {
    cancelAnimationFrame(animRef.current);
    camTargetRef.current = null;
    camRef.current = c;
    setCamState(c);
  };

  /** Smoothly glide the camera to `to` (zoom eases geometrically, so it feels even). */
  const flyTo = (to: Cam, ms = 320) => {
    cancelAnimationFrame(animRef.current);
    const from = { ...camRef.current };
    if (prefersReducedMotion() || ms <= 0) return setCam(to);
    camTargetRef.current = to;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const c: Cam =
        k >= 1
          ? to
          : {
              zoom: from.zoom * Math.pow(to.zoom / from.zoom, e),
              x: from.x + (to.x - from.x) * e,
              y: from.y + (to.y - from.y) * e,
            };
      camRef.current = c;
      setCamState(c);
      if (k < 1) animRef.current = requestAnimationFrame(step);
      else camTargetRef.current = null;
    };
    animRef.current = requestAnimationFrame(step);
  };

  const zoomAt = (px: number, py: number, nz: number) => {
    const c = camTargetRef.current ?? camRef.current;
    const z = clamp(nz, MIN_ZOOM, MAX_ZOOM);
    const wx = (px - c.x) / c.zoom;
    const wy = (py - c.y) / c.zoom;
    flyTo({ zoom: z, x: px - wx * z, y: py - wy * z }, 220);
  };

  const zoomBy = (f: number) =>
    zoomAt(
      viewSize.w / 2,
      viewSize.h / 2,
      (camTargetRef.current ?? camRef.current).zoom * f,
    );

  const fitView = (list: ImageItem[], maxZoom = 1.25) => {
    if (list.length === 0) {
      flyTo({ x: viewSize.w / 2, y: viewSize.h / 2, zoom: 1 });
      return;
    }
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const i of list) {
      x0 = Math.min(x0, i.x);
      y0 = Math.min(y0, i.y);
      x1 = Math.max(x1, i.x + i.dw);
      y1 = Math.max(y1, i.y + itemH(i));
    }
    const pad = 64;
    const z = clamp(
      Math.min(
        (viewSize.w - pad * 2) / Math.max(1, x1 - x0),
        (viewSize.h - pad * 2) / Math.max(1, y1 - y0),
      ),
      MIN_ZOOM,
      maxZoom,
    );
    flyTo({
      zoom: z,
      x: viewSize.w / 2 - ((x0 + x1) / 2) * z,
      y: viewSize.h / 2 - ((y0 + y1) / 2) * z,
    });
  };

  /* ── Layout history ──────────────────────────────────────────── */

  const snapLayout = (): LayoutSnap[] =>
    itemsRef.current.map((i) => ({ id: i.id, x: i.x, y: i.y, dw: i.dw }));

  const pushLayout = () => {
    layoutPast.current.push(snapLayout());
    if (layoutPast.current.length > 50) layoutPast.current.shift();
    layoutFuture.current = [];
    bump();
  };

  const restoreLayout = (snap: LayoutSnap[]) =>
    setItems((p) =>
      p.map((i) => {
        const s = snap.find((x) => x.id === i.id);
        return s ? { ...i, x: s.x, y: s.y, dw: s.dw } : i;
      }),
    );

  /** Turns on position/size transitions briefly so items glide to their new place. */
  const animateLayout = () => {
    if (prefersReducedMotion()) return;
    setLayoutAnim(true);
    if (layoutTimer.current) clearTimeout(layoutTimer.current);
    layoutTimer.current = setTimeout(() => setLayoutAnim(false), 400);
  };

  const undoLayout = () => {
    const prev = layoutPast.current.pop();
    if (!prev) return;
    animateLayout();
    layoutFuture.current.push(snapLayout());
    restoreLayout(prev);
    bump();
  };

  const redoLayout = () => {
    const next = layoutFuture.current.pop();
    if (!next) return;
    animateLayout();
    layoutPast.current.push(snapLayout());
    restoreLayout(next);
    bump();
  };

  const arrange = () => {
    if (items.length === 0) return;
    animateLayout();
    pushLayout();
    const next = items.map((i, idx) => ({
      ...i,
      x: (idx % GRID_COLS) * CELL_W + (CELL_W - i.dw) / 2,
      y: Math.floor(idx / GRID_COLS) * CELL_H + (CELL_H - itemH(i)) / 2,
    }));
    setItems(next);
    fitView(next);
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
    setSelectedIds([]);
    setResults({});
    setErrors({});
    layoutPast.current = [];
    layoutFuture.current = [];
  };

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
    setShowResult(false);
    setCam({ x: 0, y: 0, zoom: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultMode]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animRef.current);
      if (layoutTimer.current) clearTimeout(layoutTimer.current);
      runIdRef.current++;
      itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
      Object.values(resultsRef.current).forEach((r) =>
        URL.revokeObjectURL(r.url),
      );
    };
  }, []);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setViewSize({
        w: Math.max(1, Math.round(r.width)),
        h: Math.max(1, Math.round(r.height)),
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      if (itemsRef.current.length === 0) return;
      cancelAnimationFrame(animRef.current);
      camTargetRef.current = null;
      const r = el.getBoundingClientRect();
      const c = camRef.current;
      if (ev.ctrlKey || ev.metaKey) {
        const px = ev.clientX - r.left;
        const py = ev.clientY - r.top;
        const z = clamp(
          c.zoom * Math.exp(-ev.deltaY * 0.0125),
          MIN_ZOOM,
          MAX_ZOOM,
        );
        const wx = (px - c.x) / c.zoom;
        const wy = (py - c.y) / c.zoom;
        camRef.current = { zoom: z, x: px - wx * z, y: py - wy * z };
      } else {
        camRef.current = { ...c, x: c.x - ev.deltaX, y: c.y - ev.deltaY };
      }
      setCamState(camRef.current);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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

  // Result popover: close on outside click, and when there is nothing to show.
  useEffect(() => {
    if (!showResult) return;
    const onDown = (e: PointerEvent) => {
      const n = e.target as Node;
      if (chipRef.current?.contains(n) || popRef.current?.contains(n)) return;
      setShowResult(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [showResult]);
  useEffect(() => {
    if (!activeResult && !activeError) setShowResult(false);
  }, [activeResult, activeError]);

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

  const addFiles = async (incoming: File[], at?: [number, number]) => {
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
    const existing = itemsRef.current;
    const created: ImageItem[] = [];
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
      const w = meta?.width ?? 0;
      const h = meta?.height ?? 0;
      const s = w > 0 ? Math.min(MAX_DISPLAY_W / w, MAX_DISPLAY_H / h, 1) : 1;
      const dw = w > 0 ? Math.max(120, Math.round(w * s)) : 320;
      const dh = w > 0 ? (dw * h) / w : dw * 0.75;
      const idx = existing.length + created.length;
      const single = accepted.length === 1 && at;
      const item: ImageItem = {
        id: `img-${++idRef.current}`,
        file: f,
        mime,
        url: URL.createObjectURL(f),
        width: w,
        height: h,
        hasAlpha: meta?.hasAlpha ?? false,
        crop: FULL_CROP,
        x: single
          ? at[0] - dw / 2
          : (idx % GRID_COLS) * CELL_W + (CELL_W - dw) / 2,
        y: single
          ? at[1] - dh / 2
          : Math.floor(idx / GRID_COLS) * CELL_H + (CELL_H - dh) / 2,
        dw,
      };
      created.push(item);
      setItems((p) => [...p, item]);
      setActiveId((cur) => cur ?? item.id);
    }
    if (mountedRef.current) setIsLoadingFiles(false);

    if (created.length) {
      setSelectedIds(created.map((i) => i.id));
      setActiveId(created[0].id);
      fitView([...existing, ...created]);
    }

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

  const removeItems = (ids: string[]) => {
    if (ids.length === 0 || isProcessing) return;
    invalidate(ids);
    const set = new Set(ids);
    const firstIdx = items.findIndex((i) => set.has(i.id));
    items
      .filter((i) => set.has(i.id))
      .forEach((i) => URL.revokeObjectURL(i.url));
    const next = items.filter((i) => !set.has(i.id));
    setItems(next);
    setSelectedIds((p) => p.filter((id) => !set.has(id)));
    if (activeId && set.has(activeId))
      setActiveId(
        next[Math.min(Math.max(0, firstIdx), next.length - 1)]?.id ?? null,
      );
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeItems([id]);
  };

  const focusItem = (item: ImageItem) => {
    setActiveId(item.id);
    setSelectedIds([item.id]);
    fitView([item], 1);
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
        const k = W / (ratio * H);
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

  /* ── Processing pipeline ─────────────────────────────────────── */

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
          out.ctx.fillStyle = "#ffffff";
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

  /* ── Compare slider ──────────────────────────────────────────── */

  const moveSlider = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSplitPosition(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100));
  };

  /* ── Canvas interaction ──────────────────────────────────────── */

  const track = (
    e: React.PointerEvent<HTMLElement>,
    onMove: (ev: PointerEvent) => void,
    onEnd?: () => void,
  ) => {
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const up = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      onEnd?.();
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };

  const startPan = (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX;
    const sy = e.clientY;
    const c0 = { ...camRef.current };
    track(e, (ev) => {
      if (pinchRef.current) return;
      setCam({ ...c0, x: c0.x + ev.clientX - sx, y: c0.y + ev.clientY - sy });
    });
  };

  const wantsPan = (e: React.PointerEvent) =>
    e.button === 1 || tool === "hand" || spaceRef.current;

  const onViewPointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2 && itemsRef.current.length > 0) {
      const pts = [...pointersRef.current.values()];
      const r = e.currentTarget.getBoundingClientRect();
      pinchRef.current = true;
      pinchStart.current = {
        d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
        mid: [
          (pts[0].x + pts[1].x) / 2 - r.left,
          (pts[0].y + pts[1].y) / 2 - r.top,
        ],
        cam: { ...camRef.current },
      };
    }
  };
  const onViewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = pinchStart.current;
    if (
      !pinchRef.current ||
      !ps ||
      pointersRef.current.size < 2 ||
      itemsRef.current.length === 0
    )
      return;
    const pts = [...pointersRef.current.values()];
    const r = e.currentTarget.getBoundingClientRect();
    const mx = (pts[0].x + pts[1].x) / 2 - r.left;
    const my = (pts[0].y + pts[1].y) / 2 - r.top;
    const z = clamp(
      (ps.cam.zoom * Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)) /
        ps.d0,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    const wx = (ps.mid[0] - ps.cam.x) / ps.cam.zoom;
    const wy = (ps.mid[1] - ps.cam.y) / ps.cam.zoom;
    setCam({ zoom: z, x: mx - wx * z, y: my - wy * z });
  };
  const onViewPointerEndCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = false;
      pinchStart.current = null;
    }
  };

  const onViewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pinchRef.current) return;
    if (wantsPan(e)) return startPan(e);
    if (e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x0 = e.clientX - r.left;
    const y0 = e.clientY - r.top;
    const base = e.shiftKey ? selectedIds : [];
    if (!e.shiftKey) setSelectedIds([]);
    track(
      e,
      (ev) => {
        if (pinchRef.current) return;
        const x1 = ev.clientX - r.left;
        const y1 = ev.clientY - r.top;
        const m = {
          x: Math.min(x0, x1),
          y: Math.min(y0, y1),
          w: Math.abs(x1 - x0),
          h: Math.abs(y1 - y0),
        };
        setMarquee(m);
        const c = camRef.current;
        const wx0 = (m.x - c.x) / c.zoom;
        const wy0 = (m.y - c.y) / c.zoom;
        const wx1 = (m.x + m.w - c.x) / c.zoom;
        const wy1 = (m.y + m.h - c.y) / c.zoom;
        const hits = itemsRef.current
          .filter(
            (i) =>
              i.x <= wx1 &&
              i.x + i.dw >= wx0 &&
              i.y <= wy1 &&
              i.y + itemH(i) >= wy0,
          )
          .map((i) => i.id);
        setSelectedIds([...new Set([...base, ...hits])]);
        if (hits.length)
          setActiveId((cur) => (cur && hits.includes(cur) ? cur : hits[0]));
      },
      () => setMarquee(null),
    );
  };

  const onItemPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    item: ImageItem,
  ) => {
    if (pinchRef.current) return;
    if (wantsPan(e)) return startPan(e);
    if (e.button !== 0) return;
    e.stopPropagation();

    let ids = selectedIds;
    let collapse = false;
    if (e.shiftKey) {
      ids = ids.includes(item.id)
        ? ids.filter((i) => i !== item.id)
        : [...ids, item.id];
      setSelectedIds(ids);
      if (!ids.includes(item.id)) return;
      setActiveId(item.id);
    } else if (!ids.includes(item.id)) {
      ids = [item.id];
      setSelectedIds(ids);
      setActiveId(item.id);
    } else {
      setActiveId(item.id);
      collapse = ids.length > 1;
    }

    const sx = e.clientX;
    const sy = e.clientY;
    const orig = new Map(
      itemsRef.current
        .filter((i) => ids.includes(i.id))
        .map((i) => [i.id, { x: i.x, y: i.y }]),
    );
    let moved = false;
    track(
      e,
      (ev) => {
        if (pinchRef.current) return;
        const z = camRef.current.zoom;
        const dx = (ev.clientX - sx) / z;
        const dy = (ev.clientY - sy) / z;
        if (!moved) {
          if (Math.hypot(dx, dy) * z < 3) return;
          moved = true;
          pushLayout();
        }
        setItems((p) =>
          p.map((i) => {
            const o = orig.get(i.id);
            return o ? { ...i, x: o.x + dx, y: o.y + dy } : i;
          }),
        );
      },
      () => {
        if (!moved && collapse) setSelectedIds([item.id]);
      },
    );
  };

  const onResizeHandleDown = (
    e: React.PointerEvent<HTMLDivElement>,
    item: ImageItem,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX;
    const dw0 = item.dw;
    let moved = false;
    track(e, (ev) => {
      if (!moved) {
        moved = true;
        pushLayout();
      }
      const nd = clamp(dw0 + (ev.clientX - sx) / camRef.current.zoom, 60, 5000);
      setItems((p) => p.map((i) => (i.id === item.id ? { ...i, dw: nd } : i)));
    });
  };

  /* ── Save (Ctrl+S) & command palette ─────────────────────────── */

  const saveShortcut = () => {
    if (isProcessing) return;
    if (items.length === 0)
      return void toast({
        title: "Nothing to save",
        description: "Add images first.",
      });
    if (canRun) return void handleProcess();
    if (resultList.length > 1) return void downloadZip();
    if (activeResult) return void downloadSingle();
    if (resultList.length === 1) {
      triggerDownload(resultList[0].url, resultList[0].name);
      return;
    }
    toast({ variant: "destructive", title: "Nothing to save yet" });
  };

  const openPalette = () => {
    setPaletteQuery("");
    setPaletteIdx(0);
    setPaletteOpen(true);
  };

  const buildCommands = (): Cmd[] => {
    const has = items.length > 0;
    const list: Cmd[] = [];
    const add = (c: Cmd, when = true) => when && list.push(c);

    // File
    add(
      {
        id: "add",
        group: "File",
        label: "Add images…",
        keywords: "import upload open",
        icon: Plus,
        run: () => fileInputRef.current?.click(),
      },
      !isProcessing && items.length < MAX_FILES,
    );
    add(
      {
        id: "export",
        group: "File",
        label: view === "convert" ? "Convert" : "Export",
        shortcut: "Ctrl+S",
        keywords: "save apply run process",
        icon: Settings2,
        run: handleProcess,
      },
      canRun,
    );
    add(
      {
        id: "dl",
        group: "File",
        label: "Download this image",
        keywords: "save",
        icon: Download,
        run: downloadSingle,
      },
      !!activeResult,
    );
    add(
      {
        id: "zip",
        group: "File",
        label: `Download all ${resultList.length} as ZIP`,
        icon: FileArchive,
        run: downloadZip,
      },
      resultList.length > 1,
    );
    add(
      {
        id: "clear",
        group: "File",
        label: "Remove all images",
        keywords: "clear reset",
        icon: X,
        run: clearAll,
      },
      has && !isProcessing,
    );

    // Tools
    if (editing)
      TAB_DEFS.forEach((t) =>
        add({
          id: `tab-${t.id}`,
          group: "Tools",
          label: `Go to ${t.label}`,
          icon: t.icon,
          run: () => setActiveTab(t.id),
        }),
      );

    // Output
    if (editing)
      (["original", "webp", "jpeg", "png"] as TargetFormat[]).forEach((f) =>
        add(
          {
            id: `fmt-${f}`,
            group: "Format",
            icon: Layers,
            keywords: "export output convert",
            label:
              f === "original"
                ? "Format: keep original"
                : `Format: ${f === "jpeg" ? "JPG" : f.toUpperCase()}`,
            run: () => setTargetFormat(f),
          },
          !isProcessing,
        ),
      );
    if (view !== "base64" && targetFormat !== "png")
      (Object.keys(QUALITY) as QualityPreset[]).forEach((p) =>
        add(
          {
            id: `q-${p}`,
            group: "Quality",
            icon: Sparkles,
            keywords: "compress",
            label: `Quality: ${QUALITY_LABEL[p]} (${Math.round(QUALITY[p] * 100)}%)`,
            run: () => {
              setQualityPreset(p);
              setCompressionMode("quality");
            },
          },
          !isProcessing,
        ),
      );
    add(
      {
        id: "q-target",
        group: "Quality",
        label: "Compress to a max file size",
        icon: Sparkles,
        keywords: "target kb limit",
        run: () => {
          setActiveTab("compress");
          setCompressionMode("target");
        },
      },
      editing && !isProcessing,
    );

    // Transform
    if (editing && !isProcessing) {
      add({
        id: "rot-l",
        group: "Transform",
        label: "Rotate left 90°",
        icon: RotateCcw,
        run: () => setRotation((r) => (r + 270) % 360),
      });
      add({
        id: "rot-r",
        group: "Transform",
        label: "Rotate right 90°",
        icon: RotateCw,
        run: () => setRotation((r) => (r + 90) % 360),
      });
      add({
        id: "flip-h",
        group: "Transform",
        label: "Flip horizontal",
        icon: FlipHorizontal,
        keywords: "mirror",
        run: () => setFlipH((v) => !v),
      });
      add({
        id: "flip-v",
        group: "Transform",
        label: "Flip vertical",
        icon: FlipVertical,
        keywords: "mirror",
        run: () => setFlipV((v) => !v),
      });
      add(
        {
          id: "reset-edits",
          group: "Transform",
          label: "Reset resize, rotate and flip",
          icon: X,
          run: () => {
            setResize(DEFAULT_RESIZE);
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
          },
        },
        resizeActive || rotateActive || flipActive,
      );
      add(
        {
          id: "reset-crop",
          group: "Transform",
          label: "Reset crop on all images",
          icon: Crop,
          run: () => {
            setItems((p) => p.map((i) => ({ ...i, crop: FULL_CROP })));
            invalidate();
          },
        },
        cropCount > 0,
      );
    }

    // View
    add(
      {
        id: "zin",
        group: "View",
        label: "Zoom in",
        shortcut: "+",
        icon: ZoomIn,
        run: () => zoomBy(1.2),
      },
      has,
    );
    add(
      {
        id: "zout",
        group: "View",
        label: "Zoom out",
        shortcut: "-",
        icon: ZoomOut,
        run: () => zoomBy(1 / 1.2),
      },
      has,
    );
    add(
      {
        id: "z100",
        group: "View",
        label: "Zoom to 100%",
        shortcut: "Ctrl+0",
        icon: Scan,
        run: () => zoomAt(viewSize.w / 2, viewSize.h / 2, 1),
      },
      has,
    );
    add(
      {
        id: "fit",
        group: "View",
        label: "Fit all images",
        shortcut: "Shift+1",
        icon: Scan,
        run: () => fitView(items),
      },
      has,
    );
    add(
      {
        id: "focus",
        group: "View",
        label: "Focus selected image",
        shortcut: "Shift+2",
        icon: Scan,
        run: () => activeItem && fitView([activeItem], 1),
      },
      !!activeItem,
    );
    add(
      {
        id: "grid",
        group: "View",
        label: "Arrange in a grid",
        icon: LayoutGrid,
        run: arrange,
      },
      items.length > 1,
    );
    add({
      id: "checker",
      group: "View",
      label: "Toggle transparency grid",
      icon: Layers,
      keywords: "checkerboard",
      run: () => setShowChecker((v) => !v),
    });
    add({
      id: "t-sel",
      group: "View",
      label: "Select tool",
      shortcut: "V",
      icon: MousePointer2,
      run: () => setTool("select"),
    });
    add({
      id: "t-hand",
      group: "View",
      label: "Hand tool (pan)",
      shortcut: "H",
      icon: Hand,
      run: () => setTool("hand"),
    });

    // Edit
    add(
      {
        id: "undo",
        group: "Edit",
        label: "Undo move",
        shortcut: "Ctrl+Z",
        icon: Undo2,
        run: undoLayout,
      },
      layoutPast.current.length > 0,
    );
    add(
      {
        id: "redo",
        group: "Edit",
        label: "Redo move",
        shortcut: "Ctrl+Shift+Z",
        icon: Redo2,
        run: redoLayout,
      },
      layoutFuture.current.length > 0,
    );
    add(
      {
        id: "all",
        group: "Edit",
        label: "Select all",
        shortcut: "Ctrl+A",
        run: () => setSelectedIds(items.map((i) => i.id)),
      },
      has,
    );
    add(
      {
        id: "del",
        group: "Edit",
        label: `Delete selected (${selectedIds.length})`,
        shortcut: "Del",
        icon: X,
        run: () => removeItems(selectedIds),
      },
      selectedIds.length > 0 && !isProcessing,
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

  /* ── Keyboard & paste ────────────────────────────────────────── */

  keyRef.current = (ev: KeyboardEvent) => {
    const mod = ev.ctrlKey || ev.metaKey;
    const k =
      mod && /^Key[A-Z]$/.test(ev.code)
        ? ev.code.slice(3).toLowerCase()
        : ev.key.toLowerCase();

    if (mod && k === "s") {
      ev.preventDefault();
      if (!ev.repeat) saveShortcut();
      return;
    }
    if (
      (mod && (k === "k" || ev.code === "Slash")) ||
      (ev.altKey && ev.code === "Slash")
    ) {
      ev.preventDefault();
      if (paletteOpen) setPaletteOpen(false);
      else openPalette();
      return;
    }
    if (paletteOpen) return;

    const t = ev.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable)
    )
      return;
    if (ev.key === " ") {
      if (t?.tagName === "BUTTON") return;
      ev.preventDefault();
      if (!spaceRef.current) {
        spaceRef.current = true;
        setSpaceDown(true);
      }
      return;
    }
    if (mod) {
      if (k === "z") {
        ev.preventDefault();
        return ev.shiftKey ? redoLayout() : undoLayout();
      }
      if (k === "y") {
        ev.preventDefault();
        return redoLayout();
      }
      if (k === "a") {
        ev.preventDefault();
        return setSelectedIds(itemsRef.current.map((i) => i.id));
      }
      if (k === "0") {
        ev.preventDefault();
        return zoomAt(viewSize.w / 2, viewSize.h / 2, 1);
      }
      return;
    }
    if (ev.key === "Delete" || ev.key === "Backspace") {
      if (selectedIds.length) {
        ev.preventDefault();
        removeItems(selectedIds);
      }
      return;
    }
    if (ev.key === "Escape") {
      setShowResult(false);
      return setSelectedIds([]);
    }
    if (ev.key.startsWith("Arrow") && selectedIds.length) {
      ev.preventDefault();
      const step = ev.shiftKey ? 10 : 1;
      const dx =
        ev.key === "ArrowLeft" ? -step : ev.key === "ArrowRight" ? step : 0;
      const dy =
        ev.key === "ArrowUp" ? -step : ev.key === "ArrowDown" ? step : 0;
      const now = Date.now();
      if (now - lastNudge.current > 600) pushLayout();
      lastNudge.current = now;
      return setItems((p) =>
        p.map((i) =>
          selectedIds.includes(i.id) ? { ...i, x: i.x + dx, y: i.y + dy } : i,
        ),
      );
    }
    if (ev.altKey) return;
    if (ev.shiftKey && ev.code === "Digit1") return fitView(itemsRef.current);
    if (ev.shiftKey && ev.code === "Digit2")
      return activeItem ? fitView([activeItem], 1) : undefined;
    if (itemsRef.current.length === 0) return;
    if (k === "=" || k === "+") return zoomBy(1.2);
    if (k === "-") return zoomBy(1 / 1.2);
    if (k === "v") return setTool("select");
    if (k === "h") return setTool("hand");
  };
  keyUpRef.current = (ev: KeyboardEvent) => {
    if (ev.key === " " && spaceRef.current) {
      spaceRef.current = false;
      setSpaceDown(false);
    }
  };
  pasteRef.current = (ev: ClipboardEvent) => {
    const t = ev.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
    )
      return;
    const files = Array.from(ev.clipboardData?.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) {
      ev.preventDefault();
      addFiles(files);
    }
  };

  useEffect(() => {
    const kd = (e: KeyboardEvent) => keyRef.current(e);
    const ku = (e: KeyboardEvent) => keyUpRef.current(e);
    const pa = (e: ClipboardEvent) => pasteRef.current(e);
    window.addEventListener("keydown", kd, true);
    window.addEventListener("keyup", ku, true);
    window.addEventListener("paste", pa);
    return () => {
      window.removeEventListener("keydown", kd, true);
      window.removeEventListener("keyup", ku, true);
      window.removeEventListener("paste", pa);
    };
  }, []);

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

  const z = cam.zoom;
  const inv = 1 / z; // keeps handles, labels and chips a constant on-screen size

  /** Live rotate/flip preview, fitted back into the item's box when turned 90°/270°. */
  const previewFor = (item: ImageItem): string | undefined => {
    if (!editing) return undefined;
    const h = itemH(item);
    const k =
      rotation === 90 || rotation === 270
        ? Math.min(item.dw / h, h / item.dw)
        : 1;
    return `scale(${k}) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) rotate(${rotation}deg)`;
  };

  const comparable =
    !!activeResult &&
    !!activeItem &&
    activeItem.width > 0 &&
    Math.abs(
      activeResult.width / activeResult.height -
        activeItem.width / activeItem.height,
    ) < 0.01;

  const scaledChip = (origin: string): React.CSSProperties => ({
    transform: `scale(${inv})`,
    transformOrigin: origin,
  });

  const renderItemBody = (item: ImageItem) => {
    const isActive = activeItem?.id === item.id;
    const res = results[item.id];
    const imgCls =
      "absolute inset-0 w-full h-full object-contain pointer-events-none select-none";

    // ── Crop (original image + dimmed outside + draggable crop box)
    if (isActive && activeTab === "crop" && editing) {
      const c = item.crop;
      const hs = 20 * inv;
      const corner = (h: Handle, pos: React.CSSProperties, cursor: string) => (
        <div
          onPointerDown={(e) => startCropDrag(e, h)}
          style={{
            touchAction: "none",
            width: hs,
            height: hs,
            borderWidth: 2 * inv,
            ...pos,
          }}
          className={`absolute rounded-sm bg-primary border-background shadow z-10 ${cursor}`}
        />
      );
      const o = -hs / 2;
      return (
        <div ref={cropContainerRef} className="absolute inset-0 select-none">
          <img
            src={item.url}
            alt="Source"
            draggable={false}
            className={imgCls}
          />
          <div
            className="absolute inset-0 bg-black/60 pointer-events-none"
            style={{
              clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${c.x}% ${c.y}%, ${c.x}% ${c.y + c.h}%, ${c.x + c.w}% ${c.y + c.h}%, ${c.x + c.w}% ${c.y}%, ${c.x}% ${c.y}%)`,
            }}
          />
          <div
            onPointerDown={(e) => startCropDrag(e, "move")}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.w}%`,
              height: `${c.h}%`,
              touchAction: "none",
              borderWidth: 1.5 * inv,
            }}
            className="absolute border border-primary bg-primary/10 cursor-move"
          >
            {corner("nw", { top: o, left: o }, "cursor-nwse-resize")}
            {corner("ne", { top: o, right: o }, "cursor-nesw-resize")}
            {corner("sw", { bottom: o, left: o }, "cursor-nesw-resize")}
            {corner("se", { bottom: o, right: o }, "cursor-nwse-resize")}
          </div>
        </div>
      );
    }

    // ── Result view for the active item: slider (same shape) or original/result toggle
    if (isActive && res && activeTab !== "info" && view !== "base64") {
      if (comparable) {
        const knob = 28 * inv;
        return (
          <div
            ref={sliderRef}
            className="absolute inset-0 overflow-hidden select-none"
          >
            <img
              src={item.url}
              alt="Original"
              draggable={false}
              className={imgCls}
            />
            <div
              style={{
                clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`,
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <img
                src={res.url}
                alt="Result"
                draggable={false}
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div
              style={{
                left: `${splitPosition}%`,
                width: knob,
                marginLeft: -knob / 2,
                touchAction: "none",
              }}
              className="absolute top-0 bottom-0 z-20 cursor-ew-resize flex items-center justify-center"
              onPointerDown={(e) => {
                e.stopPropagation();
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
              <div
                style={{ width: 2 * inv }}
                className="absolute inset-y-0 bg-primary"
              />
              <div
                style={{ width: knob, height: knob, borderWidth: 2 * inv }}
                className="relative rounded-full bg-primary border-background flex items-center justify-center shrink-0"
              >
                <ArrowRightLeft
                  style={{ width: 14 * inv, height: 14 * inv }}
                  className="text-primary-foreground"
                />
              </div>
            </div>
            <div
              style={{ ...scaledChip("top left"), top: 8 * inv, left: 8 * inv }}
              className="absolute bg-background/90 text-foreground text-[10px] font-black px-2 py-1 rounded border border-border/50 z-10 whitespace-nowrap pointer-events-none"
            >
              Original · {formatBytes(res.originalSize)}
            </div>
            <div
              style={{
                ...scaledChip("top right"),
                top: 8 * inv,
                right: 8 * inv,
              }}
              className="absolute bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded z-10 whitespace-nowrap pointer-events-none"
            >
              Result · {formatBytes(res.newSize)}
            </div>
          </div>
        );
      }
      const showOriginal = viewSide === "original";
      return (
        <div className="absolute inset-0">
          <img
            src={showOriginal ? item.url : res.url}
            alt={showOriginal ? "Original" : "Result"}
            draggable={false}
            className={imgCls}
          />
          <div
            style={{
              ...scaledChip("top center"),
              top: 8 * inv,
              left: "50%",
              marginLeft: "-50px",
            }}
            className="absolute flex bg-background/90 p-1 rounded-md border border-border/50 text-[10px] font-black z-10"
            onPointerDown={(e) => e.stopPropagation()}
          >
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
        </div>
      );
    }

    // ── Plain item: shows its result once processed, otherwise the original with live rotate/flip preview
    return (
      <img
        src={res ? res.url : item.url}
        alt={item.file.name}
        draggable={false}
        className={`${imgCls} transition-transform duration-200`}
        style={{ transform: res ? undefined : previewFor(item) }}
      />
    );
  };

  const renderItem = (item: ImageItem) => {
    const isActive = activeItem?.id === item.id;
    const isSelected = selectedIds.includes(item.id);
    const hasResult = !!results[item.id];
    const hasError = !!errors[item.id];
    const h = itemH(item);
    const cropping = isActive && activeTab === "crop" && editing;
    return (
      <div
        key={item.id}
        onPointerDown={(e) => onItemPointerDown(e, item)}
        style={{
          left: item.x,
          top: item.y,
          width: item.dw,
          height: h,
          touchAction: "none",
          backgroundImage: showChecker ? CHECKER : undefined,
          backgroundSize: showChecker
            ? `${16 * inv}px ${16 * inv}px`
            : undefined,
          cursor: tool === "hand" || spaceDown ? "grab" : "default",
          transition: layoutAnim
            ? `left ${LAYOUT_EASE}, top ${LAYOUT_EASE}, width ${LAYOUT_EASE}, height ${LAYOUT_EASE}`
            : undefined,
        }}
        className="absolute bg-card/40 shadow-2xl"
      >
        {/* name + status */}
        <div
          style={{
            ...scaledChip("left bottom"),
            width: item.dw * z,
            bottom: "100%",
            paddingBottom: 4,
            transition: layoutAnim ? `width ${LAYOUT_EASE}` : undefined,
          }}
          className="absolute left-0 flex items-center gap-1.5 pointer-events-none"
        >
          {(hasResult || hasError) && (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${hasError ? "bg-rose-500" : "bg-emerald-500"}`}
            />
          )}
          <span
            className={`truncate text-[11px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}
            title={errors[item.id] ?? item.file.name}
          >
            {item.file.name}
          </span>
          {item.width > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
              {item.width}×{item.height}
            </span>
          )}
        </div>

        {renderItemBody(item)}

        {/* selection outline */}
        {(isSelected || isActive) && (
          <div
            className={`absolute pointer-events-none border-primary ${isSelected ? "" : "opacity-40"}`}
            style={{
              inset: -1.5 * inv,
              borderWidth: 2 * inv,
              borderStyle: isSelected ? "solid" : "dashed",
            }}
          />
        )}

        {/* corner handle: resize the preview on the canvas */}
        {isActive && isSelected && !cropping && selectedIds.length === 1 && (
          <div
            onPointerDown={(e) => onResizeHandleDown(e, item)}
            style={{
              width: 12 * inv,
              height: 12 * inv,
              right: -6 * inv,
              bottom: -6 * inv,
              borderWidth: 2 * inv,
              touchAction: "none",
            }}
            className="absolute rounded-sm bg-primary border-background cursor-nwse-resize z-30"
          />
        )}
      </div>
    );
  };

  const renderCanvas = () => (
    <div
      ref={viewRef}
      onPointerDownCapture={onViewPointerDownCapture}
      onPointerMove={onViewPointerMove}
      onPointerUpCapture={onViewPointerEndCapture}
      onPointerCancelCapture={onViewPointerEndCapture}
      onPointerDown={onViewPointerDown}
      className="flex-1 min-h-0 relative overflow-hidden bg-muted/20"
      style={{
        touchAction: "none",
        cursor: tool === "hand" || spaceDown ? "grab" : "default",
        backgroundImage:
          "radial-gradient(circle, rgba(128,128,128,0.35) 1px, transparent 1.5px)",
        backgroundSize: `${24 * z}px ${24 * z}px`,
        backgroundPosition: `${cam.x}px ${cam.y}px`,
      }}
    >
      {/* world: everything inside is positioned in canvas units */}
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${z})`,
          transformOrigin: "0 0",
        }}
      >
        {items.map(renderItem)}
      </div>

      {/* empty state: upload card */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div
            onClick={() => fileInputRef.current?.click()}
            onPointerDown={(e) => e.stopPropagation()}
            className={`pointer-events-auto w-full max-w-xl border-2 border-dashed rounded-xl p-12 sm:p-16 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group bg-background/50 backdrop-blur-sm ${
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
              Drag and drop, paste, or click to browse. Up to {MAX_FILES} files,{" "}
              {MAX_FILE_BYTES / 1024 / 1024} MB each. Files never leave your
              device.
            </p>
          </div>
        </div>
      )}

      {/* marquee */}
      {marquee && (
        <div
          className="absolute border border-primary bg-primary/10 pointer-events-none z-30"
          style={{
            left: marquee.x,
            top: marquee.y,
            width: marquee.w,
            height: marquee.h,
          }}
        />
      )}

      {/* toolbar */}
      <div
        className="absolute top-2 left-2 z-40 flex items-center gap-0.5 bg-card/90 backdrop-blur-xl border border-border/40 rounded-xl p-1 shadow-lg max-w-[calc(100%-2rem)] overflow-x-auto ring-1 ring-black/10"
        onPointerDown={(e) => e.stopPropagation()}
        data-nowheel
      >
        <Tip label="Select (V)">
          <button
            aria-label="Select tool (V)"
            onClick={() => setTool("select")}
            className={`p-1.5 rounded-lg transition-all ${tool === "select" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"}`}
          >
            <MousePointer2 className="h-4 w-4" />
          </button>
        </Tip>
        <Tip label="Pan (H, or hold Space)">
          <button
            aria-label="Hand tool (H)"
            onClick={() => setTool("hand")}
            className={`p-1.5 rounded-lg transition-all ${tool === "hand" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"}`}
          >
            <Hand className="h-4 w-4" />
          </button>
        </Tip>
        <div className="w-px h-4 bg-border/40 mx-1" />
        <Tip label="Undo move (Ctrl+Z)">
          <button
            aria-label="Undo move"
            disabled={layoutPast.current.length === 0}
            onClick={undoLayout}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          >
            <Undo2 className="h-4 w-4" />
          </button>
        </Tip>
        <Tip label="Redo move (Ctrl+Shift+Z)">
          <button
            aria-label="Redo move"
            disabled={layoutFuture.current.length === 0}
            onClick={redoLayout}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </Tip>
        <div className="w-px h-4 bg-border/40 mx-1" />
        <Tip label="Zoom out">
          <button
            aria-label="Zoom out"
            onClick={() => zoomBy(1 / 1.2)}
            disabled={items.length === 0}
            className="p-1.5 hover:bg-secondary/80 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </Tip>
        <Tip label="Reset zoom to 100%">
          <button
            onClick={() => zoomAt(viewSize.w / 2, viewSize.h / 2, 1)}
            disabled={items.length === 0}
            className="text-xs font-mono font-bold w-12 text-center text-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {Math.round(z * 100)}%
          </button>
        </Tip>
        <Tip label="Zoom in">
          <button
            aria-label="Zoom in"
            onClick={() => zoomBy(1.2)}
            disabled={items.length === 0}
            className="p-1.5 hover:bg-secondary/80 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </Tip>
        <Tip label="Fit all (Shift+1) · Focus selected (Shift+2)">
          <button
            aria-label="Fit all images"
            onClick={() => fitView(items)}
            disabled={items.length === 0}
            className="p-1.5 hover:bg-secondary/80 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Scan className="h-4 w-4" />
          </button>
        </Tip>
        <Tip label="Arrange in a grid">
          <button
            aria-label="Arrange in a grid"
            disabled={items.length < 2}
            onClick={arrange}
            className="p-1.5 hover:bg-secondary/80 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </Tip>
        <div className="w-px h-4 bg-border/40 mx-1" />
        <Tip label="Toggle transparency grid">
          <button
            aria-label="Toggle transparency grid"
            onClick={() => setShowChecker((v) => !v)}
            className={`p-1.5 rounded-lg transition-all ${showChecker ? "bg-primary/10 text-primary ring-1 ring-primary/40" : "hover:bg-secondary/80 text-muted-foreground"}`}
          >
            <Layers className="h-4 w-4" />
          </button>
        </Tip>
      </div>
    </div>
  );

  /* ── Shared small styles ─────────────────────────────────────── */

  const label =
    "text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap";
  const segBtn = (on: boolean) =>
    `h-6 px-2.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all ${on ? "bg-primary/10 text-primary ring-1 ring-primary/40 font-black" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`;
  const optBtn = (on: boolean) =>
    `h-7 px-2.5 rounded-md border text-[11px] font-bold whitespace-nowrap transition-all ${on ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border/80"}`;
  const numInput =
    "w-16 h-7 px-1.5 bg-background border border-border/40 rounded-md text-xs font-mono text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary";
  const group = "flex items-center gap-2 shrink-0";
  const divider = <div className="w-px h-5 bg-border/40 shrink-0" />;
  const segWrap =
    "flex items-center gap-0.5 bg-secondary/30 p-0.5 rounded-xl border border-border/30 shrink-0";

  const totalOrig = resultList.reduce((s, r) => s + r.originalSize, 0);
  const totalNew = resultList.reduce((s, r) => s + r.newSize, 0);

  const chip = (text: string, onClear: () => void) => (
    <span
      key={text}
      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold whitespace-nowrap shrink-0"
    >
      {text}
      <Tip label={`Clear ${text}`}>
        <button
          onClick={onClear}
          aria-label={`Remove ${text}`}
          className="p-0.5 rounded-full hover:bg-primary/20"
        >
          <X className="h-3 w-3" />
        </button>
      </Tip>
    </span>
  );

  /* ── Options bar (horizontal, per active tool) ───────────────── */

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
      <>
        {divider}
        <div className={group} title="Applied on export">
          <span className={label}>Edits</span>
          {chips}
        </div>
      </>
    );
  };

  const renderQualityPresets = () => (
    <div className={group}>
      {(Object.keys(QUALITY) as QualityPreset[]).map((p) => (
        <Tip
          key={p}
          label={`${QUALITY_LABEL[p]} quality · ${Math.round(QUALITY[p] * 100)}%`}
        >
          <button
            onClick={() => setQualityPreset(p)}
            className={optBtn(qualityPreset === p)}
          >
            {QUALITY_LABEL[p]}
            <span className="ml-1.5 font-mono font-normal opacity-70">
              {Math.round(QUALITY[p] * 100)}%
            </span>
          </button>
        </Tip>
      ))}
    </div>
  );

  const renderCompress = () => (
    <>
      <div className={segWrap}>
        <Tip label="Choose a quality preset">
          <button
            onClick={() => setCompressionMode("quality")}
            className={segBtn(compressionMode === "quality")}
          >
            Quality
          </button>
        </Tip>
        <Tip label="Compress down to a maximum file size">
          <button
            onClick={() => setCompressionMode("target")}
            className={segBtn(compressionMode === "target")}
          >
            Max file size
          </button>
        </Tip>
      </div>

      {compressionMode === "quality" ? (
        renderQualityPresets()
      ) : (
        <div className={group}>
          <span className={label}>Keep under</span>
          <input
            type="number"
            min={5}
            value={targetKbText}
            onChange={(e) => setTargetKbText(e.target.value)}
            className={`${numInput} text-primary font-bold`}
          />
          <span className="text-[11px] font-bold text-muted-foreground">
            KB
          </span>
          <input
            type="range"
            min={10}
            max={5000}
            step={10}
            value={targetValid ? clamp(targetKb, 10, 5000) : 150}
            onChange={(e) => setTargetKbText(e.target.value)}
            className="w-32 h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          {!targetValid && (
            <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap">
              Enter at least 5 KB.
            </span>
          )}
        </div>
      )}

      {compressionMode === "target" && targetValid && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          Lowers quality first, then dimensions if needed.
        </span>
      )}
      {anyPng && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 inline-flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-primary" />
          PNG is lossless. Use WebP or JPG for smaller files.
        </span>
      )}
      {alphaToJpeg && (
        <span className="text-[10px] text-amber-500 whitespace-nowrap shrink-0 inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          JPG fills transparency with white.
        </span>
      )}
    </>
  );

  const renderResize = () => (
    <>
      <div className={segWrap}>
        {(["pixels", "percent"] as ResizeMode[]).map((m) => (
          <Tip
            key={m}
            label={
              m === "pixels"
                ? "Set exact width and height in pixels"
                : "Scale by percentage"
            }
          >
            <button
              onClick={() => setResize((r) => ({ ...r, mode: m }))}
              className={`${segBtn(resize.mode === m)} capitalize`}
            >
              {m}
            </button>
          </Tip>
        ))}
      </div>

      {resize.mode === "pixels" ? (
        <div className={group}>
          <span className={label}>W</span>
          <input
            type="number"
            min={1}
            value={resize.width ?? outDims?.[0] ?? ""}
            onChange={(e) => setDim("width", e.target.value)}
            className={numInput}
          />
          <span className={label}>H</span>
          <input
            type="number"
            min={1}
            value={resize.height ?? outDims?.[1] ?? ""}
            onChange={(e) => setDim("height", e.target.value)}
            className={numInput}
          />
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground cursor-pointer whitespace-nowrap">
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
            Lock ratio
          </label>
        </div>
      ) : (
        <div className={group}>
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
            className={`${numInput} text-primary font-bold`}
          />
          <span className="text-[11px] font-bold text-muted-foreground">%</span>
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
            className="w-28 h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          {[25, 50, 75, 100].map((p) => (
            <Tip key={p} label={`Scale to ${p}%`}>
              <button
                onClick={() => setResize((r) => ({ ...r, percent: p }))}
                className={optBtn(resize.percent === p)}
              >
                {p}%
              </button>
            </Tip>
          ))}
        </div>
      )}

      {outDims && (
        <span
          className={`text-[10px] font-mono whitespace-nowrap shrink-0 ${outTooLarge ? "text-rose-500" : "text-muted-foreground"}`}
        >
          Output {outDims[0]} × {outDims[1]} px
          {outTooLarge && ` (too large, max ${MAX_SIDE})`}
        </span>
      )}
      {items.length > 1 && resize.mode === "pixels" && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          {resize.lock
            ? "Applies to all images, each keeps its ratio."
            : "Every image is forced to this size."}
        </span>
      )}
      {resizeActive && (
        <Tip label="Reset resize settings">
          <button
            onClick={() => setResize(DEFAULT_RESIZE)}
            className="text-[11px] font-bold text-primary hover:underline whitespace-nowrap"
          >
            Reset
          </button>
        </Tip>
      )}
    </>
  );

  const renderCrop = () => {
    const px = activeItem ? cropPx(activeItem) : null;
    return (
      <>
        <div className={group}>
          <span className={label}>Ratio</span>
          {ASPECTS.map((a) => (
            <Tip
              key={a.label}
              label={
                a.value === null
                  ? "Free-form crop (no aspect lock)"
                  : `Lock crop to ${a.label}`
              }
            >
              <button
                onClick={() => applyAspect(a.value)}
                className={optBtn(cropRatio === a.value)}
              >
                {a.label}
              </button>
            </Tip>
          ))}
        </div>
        {px && (
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap shrink-0">
            {px.sw} × {px.sh} px
          </span>
        )}
        <Tip label="Clear the crop selection">
          <button
            onClick={() => {
              if (activeItem) updateCrop(activeItem.id, FULL_CROP);
            }}
            className="text-[11px] font-bold text-primary hover:underline whitespace-nowrap"
          >
            Reset crop
          </button>
        </Tip>
        {items.length > 1 && activeItem && (
          <Tip label="Apply this crop box to every image">
            <button
              onClick={() => {
                const c = activeItem.crop;
                setItems((p) => p.map((i) => ({ ...i, crop: c })));
                invalidate();
              }}
              className="text-[11px] font-bold text-primary hover:underline whitespace-nowrap"
            >
              Apply to all
            </button>
          </Tip>
        )}
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          {items.length > 1 ? "Crop is set per image. " : ""}Applied before
          rotation.
        </span>
      </>
    );
  };

  const renderRotate = () => (
    <>
      <div className={group}>
        <Tip label="Rotate 90° left">
          <button
            onClick={() => setRotation((r) => (r + 270) % 360)}
            className={`${optBtn(false)} inline-flex items-center gap-1.5`}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Left
          </button>
        </Tip>
        <Tip label="Rotate 90° right">
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className={`${optBtn(false)} inline-flex items-center gap-1.5`}
          >
            <RotateCw className="h-3.5 w-3.5" /> Right
          </button>
        </Tip>
      </div>
      {divider}
      <div className={group}>
        {[0, 90, 180, 270].map((deg) => (
          <Tip key={deg} label={`Rotate ${deg}°`}>
            <button
              onClick={() => setRotation(deg)}
              className={`${optBtn(rotation === deg)} font-mono`}
            >
              {deg}°
            </button>
          </Tip>
        ))}
      </div>
      {divider}
      <div className={group}>
        <Tip label="Mirror horizontally">
          <button
            onClick={() => setFlipH((v) => !v)}
            className={`${optBtn(flipH)} inline-flex items-center gap-1.5`}
          >
            <FlipHorizontal className="h-3.5 w-3.5" /> Flip H
          </button>
        </Tip>
        <Tip label="Mirror vertically">
          <button
            onClick={() => setFlipV((v) => !v)}
            className={`${optBtn(flipV)} inline-flex items-center gap-1.5`}
          >
            <FlipVertical className="h-3.5 w-3.5" /> Flip V
          </button>
        </Tip>
      </div>
    </>
  );

  const renderConvertOptions = () => (
    <>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
        Converting to{" "}
        <span className="font-black text-foreground">
          {targetFormat === "jpeg" ? "JPG" : targetFormat.toUpperCase()}
        </span>
      </span>
      {targetFormat !== "png" ? (
        renderQualityPresets()
      ) : (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          PNG is lossless, so there's no quality setting.
        </span>
      )}
      {alphaToJpeg && (
        <span className="text-[10px] text-amber-500 whitespace-nowrap shrink-0 inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          Transparent areas will be filled with white.
        </span>
      )}
    </>
  );

  const showOptionsBar =
    view === "convert" || (editing && activeTab !== "info");

  /** Tool settings. Shown inside the top bar on lg+, and in a strip below it on smaller screens. */
  const renderToolOptions = () =>
    showOptionsBar ? (
      <fieldset
        disabled={isProcessing}
        className="contents disabled:opacity-60"
      >
        {view === "convert" && renderConvertOptions()}
        {editing && activeTab === "compress" && renderCompress()}
        {editing && activeTab === "resize" && renderResize()}
        {editing && activeTab === "crop" && renderCrop()}
        {editing && activeTab === "rotate" && renderRotate()}
        {editing && renderEditChips()}
      </fieldset>
    ) : null;

  const renderOptionsBar = () =>
    showOptionsBar ? (
      <div
        data-nowheel
        className="lg:hidden shrink-0 h-9 border-b border-border/40 bg-card/70 backdrop-blur-md flex items-center gap-2.5 px-2 overflow-x-auto scrollbar-none z-30"
      >
        {renderToolOptions()}
      </div>
    ) : null;

  /* ── Drawer content (Info + Base64) ──────────────────────────── */

  const renderInfo = () => (
    <div className="space-y-3">
      {activeItem ? (
        <div className="p-2.5 bg-background rounded-lg border border-border/30 space-y-1.5 font-mono text-[11px] text-muted-foreground">
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
      <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
        Exported files don't include the original metadata (EXIF, location,
        camera, colour profile). Colours may shift slightly for wide-gamut
        images.
      </p>
      <div className="p-2.5 bg-background rounded-lg border border-border/30 text-[11px] text-muted-foreground leading-relaxed space-y-1">
        <p className="font-black uppercase tracking-widest text-[9px]">
          Canvas shortcuts
        </p>
        <p>
          Space-drag or Hand pans · Ctrl/⌘-scroll or pinch zooms · Shift+1 fits
          all · Shift+2 focuses the selected image · Shift-click or drag a box
          to multi-select · Delete removes · Arrows nudge · Ctrl+Z undoes a
          move.
        </p>
      </div>
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
        <div className="p-2.5 bg-background rounded-lg border border-border/30 font-mono text-[11px] text-muted-foreground space-y-1">
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
          <p className="text-[11px] text-amber-500 leading-relaxed flex gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
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
                className="w-full h-20 p-2 pr-9 bg-muted/40 border border-border/30 rounded-lg text-[10px] font-mono resize-none"
              />
              <Tip
                label={`Copy ${b.key}`}
                className="absolute top-1.5 right-1.5"
              >
                <button
                  onClick={() => copyText(b.value, b.key)}
                  aria-label={`Copy ${b.key}`}
                  className="p-1 bg-primary text-primary-foreground rounded shadow hover:bg-primary/90"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </Tip>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Encodes your original file as-is. Nothing is re-compressed.
        </p>
      </div>
    );
  };

  const drawerOpen = view === "base64" || (editing && activeTab === "info");

  const renderDrawer = () => {
    if (!drawerOpen) return null;
    return (
      <aside
        data-nowheel
        className="shrink-0 flex flex-col bg-card/80 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-border/40 max-h-[45vh] lg:max-h-none lg:w-64 w-full min-h-0"
      >
        <div className="h-10 px-3 border-b border-border/30 shrink-0 flex items-center justify-between">
          <span className="text-[11px] font-black text-foreground">
            {view === "base64" ? "Base64 output" : "Image info"}
          </span>
          {view !== "base64" && (
            <Tip label="Close">
              <button
                aria-label="Close info"
                onClick={() => setActiveTab("compress")}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              >
                <X className="h-4 w-4" />
              </button>
            </Tip>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          {view === "base64" ? renderBase64() : renderInfo()}
        </div>
      </aside>
    );
  };

  /* ── Left rail ───────────────────────────────────────────────── */

  const renderRail = () => {
    if (!editing) return null;
    return (
      <nav
        data-nowheel
        aria-label="Tools"
        className="shrink-0 flex flex-row lg:flex-col items-stretch gap-0.5 p-1 overflow-x-auto lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border/40 bg-card/70 lg:w-[68px] scrollbar-none"
      >
        {TAB_DEFS.map((t) => {
          const Icon = t.icon;
          const on = activeTab === t.id;
          return (
            <Tip
              key={t.id}
              label={t.label}
              side="right"
              className="inline-flex flex-1 lg:flex-none"
            >
              <button
                onClick={() => setActiveTab(t.id)}
                aria-pressed={on}
                className={`w-full min-w-[56px] flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all ${
                  on
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="text-[10px] font-bold leading-none">
                  {t.label}
                </span>
              </button>
            </Tip>
          );
        })}
      </nav>
    );
  };

  /* ── Result card (opened from the top-bar chip) ──────────────── */

  const renderResultCard = () => {
    if (activeError)
      return (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-[11px] text-rose-500 flex gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      );
    if (!activeResult) return null;
    const delta = pctChange(activeResult.originalSize, activeResult.newSize);
    return (
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between gap-3 font-mono font-bold">
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
          <div className="pt-1.5 mt-1.5 border-t border-border/30 text-muted-foreground font-mono">
            All {resultList.length}: {formatBytes(totalOrig)} →{" "}
            {formatBytes(totalNew)} ({pctChange(totalOrig, totalNew)}%)
          </div>
        )}
      </div>
    );
  };

  const renderResultChip = () => {
    if (!activeError && !activeResult) return null;
    const delta = activeResult
      ? pctChange(activeResult.originalSize, activeResult.newSize)
      : 0;
    const hasWarn = !!activeResult && activeResult.warnings.length > 0;
    return (
      <div ref={chipRef} className="relative shrink-0">
        <button
          onClick={() => setShowResult((v) => !v)}
          aria-expanded={showResult}
          className={`h-7 px-2 rounded-md border text-[11px] font-mono font-bold inline-flex items-center gap-1.5 transition-all ${
            activeError
              ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
              : "border-border/40 bg-background text-foreground hover:border-border/80"
          }`}
        >
          {activeError ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5" /> Failed
            </>
          ) : activeResult ? (
            <>
              <span className="hidden md:inline">
                {formatBytes(activeResult.originalSize)} →{" "}
                {formatBytes(activeResult.newSize)}
              </span>
              <span
                className={delta > 0 ? "text-amber-500" : "text-emerald-500"}
              >
                {delta > 0 ? `+${delta}%` : `${delta}%`}
              </span>
              {hasWarn && <AlertTriangle className="h-3 w-3 text-amber-500" />}
            </>
          ) : null}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showResult ? "rotate-180" : ""}`}
          />
        </button>
        {showResult &&
          (() => {
            const r = chipRef.current?.getBoundingClientRect();
            return (
              <div
                ref={popRef}
                style={{
                  top: (r?.bottom ?? 48) + 8,
                  right: Math.max(8, window.innerWidth - (r?.right ?? 0)),
                }}
                className="fixed w-80 max-w-[calc(100vw-1rem)] z-50 rounded-xl border border-border/50 bg-card shadow-2xl p-3"
              >
                {renderResultCard()}
              </div>
            );
          })()}
      </div>
    );
  };

  const renderPalette = () => {
    if (!paletteOpen) return null;
    const idx = Math.min(paletteIdx, Math.max(0, paletteCmds.length - 1));
    return (
      <div
        data-nowheel
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex items-start justify-center pt-[12vh] px-3"
        onPointerDown={() => setPaletteOpen(false)}
      >
        <div
          role="dialog"
          aria-label="Command palette"
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 h-11 border-b border-border/40">
            <style>{`
    div[role="dialog"] input.cmdk-input,
    div[role="dialog"] input.cmdk-input:hover,
    div[role="dialog"] input.cmdk-input:focus,
    div[role="dialog"] input.cmdk-input:focus-visible,
    div[role="dialog"] input.cmdk-input:active,
    div[role="dialog"] input.cmdk-input:-webkit-autofill {
      background: transparent !important;
      background-color: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;
      height: 100% !important;
      -webkit-appearance: none;
      appearance: none;
    }
  `}</style>
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
              placeholder="Search commands…  (resize, rotate, webp, zoom…)"
              className="no-smooth cmdk-input flex-1 min-w-0 bg-transparent border-0 p-0 text-sm text-foreground placeholder:text-muted-foreground"
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
                    data-idx={i}
                    onClick={() => runCommand(c)}
                    onPointerMove={() => setPaletteIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                      i === idx
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/60"
                    }`}
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
            <span>Ctrl+S exports / downloads</span>
          </div>
        </div>
      </div>
    );
  };

  /* ── Top bar ─────────────────────────────────────────────────── */

  const modeLabel =
    view === "convert" && mode.source && mode.target
      ? `${mode.source === "jpeg" ? "JPG" : mode.source.toUpperCase()} → ${mode.target === "jpeg" ? "JPG" : mode.target.toUpperCase()}`
      : view === "base64"
        ? "Image to Base64"
        : (TAB_DEFS.find((t) => t.id === activeTab)?.label ?? "Editor");

  const renderTopBar = () => (
    <header
      data-nowheel
      className="shrink-0 h-10 border-b border-border/40 bg-card flex items-center gap-2 px-2 z-40"
    >
      <div className="flex items-center gap-3 min-w-0 shrink">
        {toolSwitcher}
        <span
          className={`hidden sm:block text-xs font-black text-foreground truncate ${showOptionsBar ? "lg:hidden 2xl:block" : ""}`}
        >
          {modeLabel}
        </span>
      </div>

      <div
        data-nowheel
        className="hidden lg:flex flex-1 min-w-0 items-center gap-2.5 overflow-x-auto scrollbar-none px-1"
      >
        {renderToolOptions()}
      </div>
      <div className="flex-1 lg:hidden" />

      <Tip label="Commands (Ctrl+K)">
        <button
          onClick={openPalette}
          aria-label="Open command palette"
          className="h-7 px-2 rounded-md border border-border/40 bg-background text-muted-foreground hover:text-foreground hover:border-border/80 inline-flex items-center gap-1.5 text-[11px] font-bold shrink-0 transition-all"
        >
          <CommandIcon className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Commands</span>
          <kbd className="hidden xl:inline font-mono text-[10px] opacity-70">
            Ctrl K
          </kbd>
        </button>
      </Tip>

      {view !== "base64" && (
        <div className="flex items-center gap-2 min-w-0 lg:shrink-0">
          <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-none">
            {view === "editor" && (
              <div className={segWrap}>
                {(["original", "webp", "jpeg", "png"] as TargetFormat[]).map(
                  (f) => {
                    const tip =
                      f === "original"
                        ? "Keep the original format"
                        : f === "jpeg"
                          ? "Export as JPG"
                          : `Export as ${f.toUpperCase()}`;
                    return (
                      <Tip key={f} label={tip}>
                        <button
                          disabled={isProcessing}
                          onClick={() => setTargetFormat(f)}
                          className={`${segBtn(targetFormat === f)} disabled:opacity-50`}
                        >
                          {f === "original"
                            ? "Same"
                            : f === "jpeg"
                              ? "JPG"
                              : f.toUpperCase()}
                        </button>
                      </Tip>
                    );
                  },
                )}
              </div>
            )}

            {renderResultChip()}

            {activeResult && (
              <Tip label="Download this image">
                <button
                  onClick={downloadSingle}
                  className="h-7 px-2.5 rounded-md bg-emerald-500 text-white text-[11px] font-black shadow hover:bg-emerald-400 inline-flex items-center gap-1.5 transition-all active:scale-[0.98] shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Download</span>
                </button>
              </Tip>
            )}

            {resultList.length > 1 && (
              <Tip
                label={
                  isZipping
                    ? "Creating ZIP…"
                    : `Download all ${resultList.length} as ZIP`
                }
              >
                <button
                  onClick={downloadZip}
                  disabled={isZipping}
                  className="h-7 px-2.5 rounded-md border border-emerald-500/60 text-emerald-500 text-[11px] font-black hover:bg-emerald-500/10 inline-flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-[0.98] shrink-0"
                >
                  {isZipping ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileArchive className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden md:inline">ZIP</span> (
                  {resultList.length})
                </button>
              </Tip>
            )}
          </div>

          <Tip label={applyTipLabel}>
            <button
              onClick={handleProcess}
              disabled={!canRun}
              className="relative overflow-hidden h-7 min-w-[96px] px-3 rounded-md text-[11px] font-black tracking-wide shadow transition-all flex items-center justify-center bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 shrink-0"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-black/30 transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center gap-1.5">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span className="whitespace-nowrap">
                      {progress}%{eta && ` · ${eta}`}
                    </span>
                  </>
                ) : (
                  <>
                    <Settings2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{applyLabel}</span>
                  </>
                )}
              </div>
            </button>
          </Tip>
        </div>
      )}
    </header>
  );

  /* ── Footer ──────────────────────────────────────────────────── */

  const renderThumbs = () =>
    items.length > 0 && (
      <div
        data-nowheel
        className="h-11 bg-card/70 border-t border-border/40 flex items-center gap-3 px-2 shrink-0 z-30"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 scrollbar-none">
          {items.map((item) => {
            const hasResult = !!results[item.id];
            const hasError = !!errors[item.id];
            const isSelected = activeItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => focusItem(item)}
                title={errors[item.id] ?? item.file.name}
                className={`relative w-8 h-8 rounded-md overflow-hidden cursor-pointer group shrink-0 transition-all ${
                  isSelected
                    ? "ring-2 ring-primary"
                    : "ring-1 ring-border/50 hover:ring-primary/60 opacity-80 hover:opacity-100"
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
                    className={`absolute bottom-0.5 left-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-background ${hasError ? "bg-rose-500" : "bg-emerald-500"}`}
                  />
                )}
                {!isProcessing && (
                  <button
                    aria-label={`Remove ${item.file.name}`}
                    onClick={(e) => removeItem(item.id, e)}
                    className="absolute top-0 right-0 bg-black/70 hover:bg-rose-500 text-white rounded-bl p-px opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            );
          })}
          {!isProcessing && items.length < MAX_FILES && (
            <Tip label="Add more images" side="top">
              <button
                aria-label="Add more images"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-md border border-dashed border-border/70 hover:border-primary hover:bg-primary/10 flex items-center justify-center shrink-0 transition-all group"
              >
                {isLoadingFiles ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
            </Tip>
          )}
        </div>
        <div className="hidden md:flex gap-3 shrink-0 text-[10px] text-muted-foreground font-mono">
          {activeItem && (
            <span>
              {activeItem.width} × {activeItem.height} px ·{" "}
              {formatBytes(activeItem.file.size)}
            </span>
          )}
          <span>
            {items.length} image{items.length > 1 ? "s" : ""}
            {selectedIds.length > 1 ? ` · ${selectedIds.length} selected` : ""}
          </span>
          {view !== "base64" && (
            <span>
              {targetFormat === "original"
                ? "ORIGINAL"
                : targetFormat === "jpeg"
                  ? "JPG"
                  : targetFormat.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );

  /* ════════════════════════════════════════════════════════════════
     LAYOUT
  ════════════════════════════════════════════════════════════════ */

  return (
    <div className="flex flex-col bg-background overflow-hidden w-full h-full flex-1 min-h-0 border-none rounded-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple
        accept={acceptAttr}
        className="hidden"
      />

      {renderPalette()}

      {renderTopBar()}

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {renderRail()}

        {/* canvas column: options bar → canvas → thumbnails → status */}
        <div
          className="flex-1 min-w-0 min-h-50 lg:min-h-80 flex flex-col relative overflow-hidden"
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
            const files = Array.from(e.dataTransfer.files);
            const r = viewRef.current?.getBoundingClientRect();
            const c = camRef.current;
            addFiles(
              files,
              r
                ? [
                    (e.clientX - r.left - c.x) / c.zoom,
                    (e.clientY - r.top - c.y) / c.zoom,
                  ]
                : undefined,
            );
          }}
        >
          {renderOptionsBar()}
          {renderCanvas()}
          {renderThumbs()}
        </div>

        {renderDrawer()}
      </div>
    </div>
  );
}
