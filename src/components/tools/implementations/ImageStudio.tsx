"use client";

/**
 * ImageStudio — an infinite-canvas, scene-based image editor.
 *
 * Model:   a flat array of elements (image / rect / ellipse / arrow / text / frame).
 * Render:  one <canvas> (Canvas 2D). Camera = { x, y, zoom }.
 * State:   `elsRef` is the source of truth inside event handlers, `els` mirrors it for rendering.
 * History: immutable snapshots (cheap, because elements are never mutated in place).
 * Export:  reuses the compression pipeline from the old tool (quality presets + max-file-size search).
 * Storage: autosaves to IndexedDB. Files never leave the device.
 *
 * No new dependencies: react, jszip, lucide-react and your useToast hook.
 */

import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  MoveUpRight,
  Type,
  Frame as FrameIcon,
  ImagePlus,
  Image as ImageIcon,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Download,
  Loader2,
  Layers,
  SlidersHorizontal,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Crop,
  Grid3x3,
  FileArchive,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
════════════════════════════════════════════════════════════════ */

type Fmt = "webp" | "jpeg" | "png";
type Tool = "select" | "hand" | "rect" | "ellipse" | "arrow" | "text" | "frame";
type ElType = "image" | "rect" | "ellipse" | "arrow" | "text" | "frame";
type FontKey = "sans" | "serif" | "mono";
type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "rotate";
type ResizeHandle = Exclude<HandleId, "rotate">;
type Rect = { x: number; y: number; w: number; h: number };
type Cam = { x: number; y: number; zoom: number };
type CropBox = { x: number; y: number; w: number; h: number }; // fractions (0–1) of the source image
type ExportScope = "auto" | "selection" | "frames" | "all";
type QualityPreset = "high" | "balanced" | "smallest";

interface Filters {
  brightness: number; // %
  contrast: number; // %
  saturate: number; // %
  grayscale: number; // %
  blur: number; // world px
}

interface El {
  id: string;
  type: ElType;
  name: string;
  x: number; // top-left of the UNROTATED box, world units
  y: number;
  w: number;
  h: number;
  rotation: number; // radians, around the box centre
  opacity: number; // 0–1
  locked: boolean;
  hidden: boolean;
  flipX: boolean;
  flipY: boolean;
  // style (text uses `stroke` as its colour)
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  // text
  text: string;
  fontSize: number;
  fontFamily: FontKey;
  // image
  assetId: string | null;
  crop: CropBox;
  filters: Filters;
}

interface Asset {
  bmp: ImageBitmap;
  w: number;
  h: number;
  blob: Blob;
}

interface DrawCtx {
  assets: Map<string, Asset>;
  scale: number; // device pixels per world unit (needed for blur)
}

type Drag = { dirty: boolean } & (
  | { kind: "pan"; sx: number; sy: number; cam: Cam }
  | { kind: "pinch"; d0: number; mid: [number, number]; cam: Cam }
  | {
      kind: "move";
      start: [number, number];
      orig: Map<string, { x: number; y: number }>;
      box: Rect;
      others: Rect[];
      moved: boolean;
      toggleOff: boolean;
      hitId: string;
    }
  | { kind: "marquee"; x0: number; y0: number; base: string[] }
  | { kind: "resize"; handle: ResizeHandle; start: El }
  | { kind: "group"; handle: ResizeHandle; box: Rect; orig: El[] }
  | { kind: "rotate"; id: string }
  | { kind: "draw"; id: string; x0: number; y0: number; tool: Tool }
  | { kind: "crop"; handle: ResizeHandle; start: El }
  | { kind: "cropPan"; start: El; p0: [number, number] }
);

interface ExportJob {
  name: string;
  rect: Rect;
  clip: boolean;
  include: (e: El) => boolean;
}

interface SavedDoc {
  v: 1;
  els: El[];
  bg: string;
  grid: boolean;
  cam: Cam;
  assetIds: string[];
}

const MAX_FILES_PER_ADD = 30;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 12000;
const MAX_PIXELS = 80_000_000;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 8;
const MIN_SIZE = 4;
const MIN_CROP = 8;
const LINE_H = 1.25;
const ACCENT = "#6d5efc";
const GUIDE = "#ff4d8d";
const IMG_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

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
const FONTS: Record<FontKey, string> = {
  sans: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, Menlo, Consolas, monospace",
};
const FULL_CROP: CropBox = { x: 0, y: 0, w: 1, h: 1 };
const DEFAULT_FILTERS: Filters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  blur: 0,
};
const NAMES: Record<ElType, string> = {
  image: "Image",
  rect: "Rectangle",
  ellipse: "Ellipse",
  arrow: "Arrow",
  text: "Text",
  frame: "Frame",
};
const HDIR: Record<ResizeHandle, [number, number]> = {
  nw: [-1, -1],
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
};
const ALL8: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const CORNERS: ResizeHandle[] = ["nw", "ne", "se", "sw"];
const CURSOR: Record<HandleId, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  rotate: "grab",
};
const FRAME_PRESETS = [
  { label: "Square 1080", w: 1080, h: 1080 },
  { label: "Story 1080×1920", w: 1080, h: 1920 },
  { label: "Full HD 1920×1080", w: 1920, h: 1080 },
  { label: "Open Graph 1200×630", w: 1200, h: 630 },
  { label: "X header 1500×500", w: 1500, h: 500 },
  { label: "A4 794×1123", w: 794, h: 1123 },
];
const TOOLS: {
  id: Tool;
  label: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "select", label: "Select", key: "V", icon: MousePointer2 },
  { id: "hand", label: "Pan", key: "H", icon: Hand },
  { id: "rect", label: "Rectangle", key: "R", icon: Square },
  { id: "ellipse", label: "Ellipse", key: "O", icon: Circle },
  { id: "arrow", label: "Arrow", key: "A", icon: MoveUpRight },
  { id: "text", label: "Text", key: "T", icon: Type },
  { id: "frame", label: "Frame", key: "F", icon: FrameIcon },
];
const TYPE_ICON: Record<ElType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  rect: Square,
  ellipse: Circle,
  arrow: MoveUpRight,
  text: Type,
  frame: FrameIcon,
};

/* ════════════════════════════════════════════════════════════════
   PURE HELPERS
════════════════════════════════════════════════════════════════ */

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

let uidCounter = 0;
const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}${(uidCounter++).toString(36)}`;

const baseName = (n: string) => {
  const i = n.lastIndexOf(".");
  return i > 0 ? n.slice(0, i) : n;
};
const safeName = (n: string) =>
  n
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-") || "export";

const formatBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(2)} MB`;

const mimeOf = (f: File): string => {
  if (f.type) return f.type;
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    }[ext] ?? ""
  );
};

function triggerDownload(href: string, filename: string, revoke = false) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

const rot = (x: number, y: number, a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
};
const center = (e: Rect): [number, number] => [e.x + e.w / 2, e.y + e.h / 2];

function corners(e: El): [number, number][] {
  const [cx, cy] = center(e);
  return (
    [
      [-e.w / 2, -e.h / 2],
      [e.w / 2, -e.h / 2],
      [e.w / 2, e.h / 2],
      [-e.w / 2, e.h / 2],
    ] as [number, number][]
  ).map(([x, y]) => {
    const [rx, ry] = rot(x, y, e.rotation);
    return [cx + rx, cy + ry] as [number, number];
  });
}

function bounds(e: El): Rect {
  const pts = corners(e);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function unionBounds(list: El[]): Rect | null {
  if (!list.length) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const e of list) {
    const b = bounds(e);
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

const intersects = (a: Rect, b: Rect) =>
  a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
const contains = (outer: Rect, inner: Rect) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h;

/* ── Text ─────────────────────────────────────────────────────── */

const fontStr = (e: Pick<El, "fontSize" | "fontFamily">) =>
  `${e.fontSize}px ${FONTS[e.fontFamily]}`;

let measureCtx: CanvasRenderingContext2D | null = null;
function measureText(
  e: Pick<El, "text" | "fontSize" | "fontFamily">,
): [number, number] {
  if (!measureCtx)
    measureCtx = document.createElement("canvas").getContext("2d");
  const ctx = measureCtx;
  if (!ctx) return [8, Math.ceil(e.fontSize * LINE_H)];
  ctx.font = fontStr(e);
  const lines = (e.text || " ").split("\n");
  const w = Math.max(...lines.map((l) => ctx.measureText(l || " ").width));
  return [
    Math.max(8, Math.ceil(w)),
    Math.ceil(lines.length * e.fontSize * LINE_H),
  ];
}
const fitText = (e: El): El => {
  if (e.type !== "text") return e;
  const [w, h] = measureText(e);
  return { ...e, w, h };
};

const newEl = (type: ElType, patch: Partial<El> = {}): El =>
  fitText({
    id: uid(),
    type,
    name: NAMES[type],
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    flipX: false,
    flipY: false,
    fill: type === "frame" ? "#ffffff" : "transparent",
    stroke: type === "frame" ? "transparent" : "#1e1e1e",
    strokeWidth: type === "frame" ? 0 : 2,
    radius: 0,
    text: "",
    fontSize: 32,
    fontFamily: "sans",
    assetId: null,
    crop: FULL_CROP,
    filters: DEFAULT_FILTERS,
    ...patch,
  });

/* ── Hit testing ──────────────────────────────────────────────── */

function hitTest(
  e: El,
  wx: number,
  wy: number,
  tol: number,
  zoom: number,
): boolean {
  const [cx, cy] = center(e);
  const [lx, ly] = rot(wx - cx, wy - cy, -e.rotation);
  const hw = e.w / 2;
  const hh = e.h / 2;
  const inBox = Math.abs(lx) <= hw + tol && Math.abs(ly) <= hh + tol;
  const onBorder =
    inBox && !(Math.abs(lx) < hw - tol && Math.abs(ly) < hh - tol);
  switch (e.type) {
    case "image":
    case "text":
      return inBox;
    case "rect":
      return e.fill !== "transparent" ? inBox : onBorder;
    case "ellipse": {
      const r = Math.hypot(lx / Math.max(hw, 1), ly / Math.max(hh, 1));
      const t = tol / Math.max(1, Math.min(hw, hh));
      return e.fill !== "transparent" ? r <= 1 + t : Math.abs(r - 1) <= t;
    }
    case "arrow": {
      const fx = e.flipX ? -1 : 1;
      const fy = e.flipY ? -1 : 1;
      const ax = -hw * fx;
      const ay = -hh * fy;
      const bx = hw * fx;
      const by = hh * fy;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      const t = clamp(((lx - ax) * dx + (ly - ay) * dy) / len2, 0, 1);
      return (
        Math.hypot(lx - (ax + t * dx), ly - (ay + t * dy)) <=
        tol + e.strokeWidth / 2 + 2
      );
    }
    case "frame": {
      const title = Math.abs(lx) <= hw && ly >= -hh - 22 / zoom && ly <= -hh;
      return title || onBorder;
    }
  }
}

/* ── Drawing ──────────────────────────────────────────────────── */

function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  if (rr > 0 && typeof ctx.roundRect === "function")
    ctx.roundRect(x, y, w, h, rr);
  else ctx.rect(x, y, w, h);
}

// Note: ctx.filter is unsupported in Safari < 18; there the filters simply don't render.
function filterString(f: Filters, scale: number) {
  const p: string[] = [];
  if (f.brightness !== 100) p.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) p.push(`contrast(${f.contrast}%)`);
  if (f.saturate !== 100) p.push(`saturate(${f.saturate}%)`);
  if (f.grayscale > 0) p.push(`grayscale(${f.grayscale}%)`);
  if (f.blur > 0) p.push(`blur(${(f.blur * scale).toFixed(2)}px)`);
  return p.join(" ");
}

function drawElement(ctx: CanvasRenderingContext2D, e: El, d: DrawCtx) {
  ctx.save();
  ctx.globalAlpha = e.opacity;
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.rotate(e.rotation);
  if (e.type !== "text") ctx.scale(e.flipX ? -1 : 1, e.flipY ? -1 : 1);
  const hw = e.w / 2;
  const hh = e.h / 2;
  const hasStroke = e.strokeWidth > 0 && e.stroke !== "transparent";
  switch (e.type) {
    case "frame":
      ctx.fillStyle = e.fill;
      ctx.fillRect(-hw, -hh, e.w, e.h);
      break;
    case "rect":
    case "ellipse":
      if (e.type === "rect") rrect(ctx, -hw, -hh, e.w, e.h, e.radius);
      else {
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          Math.max(0.1, hw),
          Math.max(0.1, hh),
          0,
          0,
          Math.PI * 2,
        );
      }
      if (e.fill !== "transparent") {
        ctx.fillStyle = e.fill;
        ctx.fill();
      }
      if (hasStroke) {
        ctx.lineWidth = e.strokeWidth;
        ctx.strokeStyle = e.stroke;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      break;
    case "arrow": {
      if (!hasStroke) break;
      ctx.strokeStyle = e.stroke;
      ctx.lineWidth = e.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const ang = Math.atan2(e.h, e.w);
      const L = 10 + e.strokeWidth * 3;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh);
      ctx.lineTo(hw, hh);
      ctx.moveTo(hw - L * Math.cos(ang - 0.5), hh - L * Math.sin(ang - 0.5));
      ctx.lineTo(hw, hh);
      ctx.lineTo(hw - L * Math.cos(ang + 0.5), hh - L * Math.sin(ang + 0.5));
      ctx.stroke();
      break;
    }
    case "text": {
      ctx.fillStyle = e.stroke;
      ctx.font = fontStr(e);
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      const lh = e.fontSize * LINE_H;
      e.text
        .split("\n")
        .forEach((line, i) => ctx.fillText(line, -hw, -hh + (i + 0.5) * lh));
      break;
    }
    case "image": {
      const a = e.assetId ? d.assets.get(e.assetId) : undefined;
      if (!a) {
        ctx.fillStyle = "rgba(128,128,150,0.25)";
        ctx.fillRect(-hw, -hh, e.w, e.h);
        break;
      }
      if (e.radius > 0) {
        rrect(ctx, -hw, -hh, e.w, e.h, e.radius);
        ctx.clip();
      }
      const f = filterString(e.filters, d.scale);
      if (f) ctx.filter = f;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        a.bmp,
        e.crop.x * a.w,
        e.crop.y * a.h,
        e.crop.w * a.w,
        e.crop.h * a.h,
        -hw,
        -hh,
        e.w,
        e.h,
      );
      break;
    }
  }
  ctx.restore();
}

// While cropping, the part of the image outside the crop is shown dimmed.
function drawCropGhost(ctx: CanvasRenderingContext2D, e: El, d: DrawCtx) {
  const a = e.assetId ? d.assets.get(e.assetId) : undefined;
  if (!a) return;
  const fullW = e.w / e.crop.w;
  const fullH = e.h / e.crop.h;
  ctx.save();
  ctx.globalAlpha = 0.35 * e.opacity;
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.rotate(e.rotation);
  ctx.scale(e.flipX ? -1 : 1, e.flipY ? -1 : 1);
  ctx.drawImage(
    a.bmp,
    -e.w / 2 - e.crop.x * fullW,
    -e.h / 2 - e.crop.y * fullH,
    fullW,
    fullH,
  );
  ctx.restore();
}

/* ── Crop math (crop is stored in SOURCE space; handles work in DISPLAY space) ── */

const dispCrop = (e: El): CropBox => ({
  x: e.flipX ? 1 - e.crop.x - e.crop.w : e.crop.x,
  y: e.flipY ? 1 - e.crop.y - e.crop.h : e.crop.y,
  w: e.crop.w,
  h: e.crop.h,
}); // it's an involution: applying it to a display crop gives the source crop

function cropResize(
  s: El,
  handle: ResizeHandle,
  wx: number,
  wy: number,
): Partial<El> {
  const dc = dispCrop(s);
  const fullW = s.w / dc.w;
  const fullH = s.h / dc.h;
  const hw = s.w / 2;
  const hh = s.h / 2;
  const fl = -hw - dc.x * fullW;
  const ft = -hh - dc.y * fullH;
  const fr = fl + fullW;
  const fb = ft + fullH;
  const [cx, cy] = center(s);
  const [qx, qy] = rot(wx - cx, wy - cy, -s.rotation);
  const [hx, hy] = HDIR[handle];
  let l = -hw;
  let r = hw;
  let t = -hh;
  let b = hh;
  if (hx < 0) l = clamp(qx, fl, r - MIN_CROP);
  if (hx > 0) r = clamp(qx, l + MIN_CROP, fr);
  if (hy < 0) t = clamp(qy, ft, b - MIN_CROP);
  if (hy > 0) b = clamp(qy, t + MIN_CROP, fb);
  const nw = r - l;
  const nh = b - t;
  const [ox, oy] = rot((l + r) / 2, (t + b) / 2, s.rotation);
  const crop = dispCrop({
    ...s,
    crop: {
      x: (l - fl) / fullW,
      y: (t - ft) / fullH,
      w: nw / fullW,
      h: nh / fullH,
    },
  });
  return { x: cx + ox - nw / 2, y: cy + oy - nh / 2, w: nw, h: nh, crop };
}

function cropPan(s: El, dxw: number, dyw: number): Partial<El> {
  const dc = dispCrop(s);
  const [lx, ly] = rot(dxw, dyw, -s.rotation);
  const nx = clamp(dc.x - lx / (s.w / dc.w), 0, 1 - dc.w);
  const ny = clamp(dc.y - ly / (s.h / dc.h), 0, 1 - dc.h);
  return { crop: dispCrop({ ...s, crop: { ...dc, x: nx, y: ny } }) };
}

function resetCrop(e: El): Partial<El> {
  const dc = dispCrop(e);
  const fullW = e.w / dc.w;
  const fullH = e.h / dc.h;
  const lx = -e.w / 2 - dc.x * fullW + fullW / 2;
  const ly = -e.h / 2 - dc.y * fullH + fullH / 2;
  const [ox, oy] = rot(lx, ly, e.rotation);
  const [cx, cy] = center(e);
  return {
    x: cx + ox - fullW / 2,
    y: cy + oy - fullH / 2,
    w: fullW,
    h: fullH,
    crop: FULL_CROP,
  };
}

/* ── Transform math ───────────────────────────────────────────── */

function resizeEl(
  s: El,
  handle: ResizeHandle,
  wx: number,
  wy: number,
  shift: boolean,
): Partial<El> {
  const [hx, hy] = HDIR[handle];
  const [cx, cy] = center(s);
  const [arx, ary] = rot((-hx * s.w) / 2, (-hy * s.h) / 2, s.rotation);
  const Ax = cx + arx; // the opposite handle stays pinned
  const Ay = cy + ary;
  const [lx, ly] = rot(wx - Ax, wy - Ay, -s.rotation);
  let nw = hx ? Math.max(MIN_SIZE, hx * lx) : s.w;
  let nh = hy ? Math.max(MIN_SIZE, hy * ly) : s.h;
  const corner = hx !== 0 && hy !== 0;
  // Images and text keep their ratio on corners by default; shift toggles that (others: shift locks).
  const keep =
    corner &&
    s.w > 0 &&
    s.h > 0 &&
    (s.type === "image" || s.type === "text" ? !shift : shift);
  if (keep) {
    const k = Math.max(nw / s.w, nh / s.h);
    nw = s.w * k;
    nh = s.h * k;
  }
  let extra: Partial<El> = {};
  if (s.type === "text") {
    const fs = Math.max(6, Math.round((s.fontSize * nh) / s.h));
    [nw, nh] = measureText({ ...s, fontSize: fs });
    extra = { fontSize: fs };
  }
  const [ox, oy] = rot((hx * nw) / 2, (hy * nh) / 2, s.rotation);
  return { ...extra, x: Ax + ox - nw / 2, y: Ay + oy - nh / 2, w: nw, h: nh };
}

function resizeGroup(
  orig: El[],
  box: Rect,
  handle: ResizeHandle,
  wx: number,
  wy: number,
): Map<string, Partial<El>> {
  const [hx, hy] = HDIR[handle];
  const ax = hx < 0 ? box.x + box.w : box.x;
  const ay = hy < 0 ? box.y + box.h : box.y;
  let sx = hx ? Math.max(0.05, (hx * (wx - ax)) / Math.max(box.w, 1)) : 1;
  let sy = hy ? Math.max(0.05, (hy * (wy - ay)) / Math.max(box.h, 1)) : 1;
  if (hx && hy) {
    const k = Math.max(sx, sy);
    sx = k;
    sy = k;
  }
  const nx = hx > 0 ? ax : hx < 0 ? ax - box.w * sx : box.x;
  const ny = hy > 0 ? ay : hy < 0 ? ay - box.h * sy : box.y;
  const out = new Map<string, Partial<El>>();
  for (const e of orig) {
    const cx = nx + (e.x + e.w / 2 - box.x) * sx;
    const cy = ny + (e.y + e.h / 2 - box.y) * sy;
    let w = e.w * sx;
    let h = e.h * sy;
    let extra: Partial<El> = {};
    if (e.type === "text") {
      const fs = Math.max(6, Math.round(e.fontSize * Math.max(sx, sy)));
      [w, h] = measureText({ ...e, fontSize: fs });
      extra = { fontSize: fs };
    }
    out.set(e.id, { ...extra, x: cx - w / 2, y: cy - h / 2, w, h });
  }
  return out;
}

function snapBox(box: Rect, others: Rect[], thr: number) {
  const xs = [box.x, box.x + box.w / 2, box.x + box.w];
  const ys = [box.y, box.y + box.h / 2, box.y + box.h];
  let bx = thr + 1;
  let by = thr + 1;
  let gx: number | null = null;
  let gy: number | null = null;
  for (const o of others) {
    const oxs = [o.x, o.x + o.w / 2, o.x + o.w];
    const oys = [o.y, o.y + o.h / 2, o.y + o.h];
    for (const a of xs)
      for (const b of oxs)
        if (Math.abs(b - a) < Math.abs(bx)) {
          bx = b - a;
          gx = b;
        }
    for (const a of ys)
      for (const b of oys)
        if (Math.abs(b - a) < Math.abs(by)) {
          by = b - a;
          gy = b;
        }
  }
  const okx = Math.abs(bx) <= thr;
  const oky = Math.abs(by) <= thr;
  return {
    dx: okx ? bx : 0,
    dy: oky ? by : 0,
    gx: okx ? gx : null,
    gy: oky ? gy : null,
  };
}

/* ════════════════════════════════════════════════════════════════
   ENCODING (reused from the previous tool)
════════════════════════════════════════════════════════════════ */

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
) {
  const warnings: string[] = [];
  const tick = () => new Promise<void>((r) => setTimeout(r, 0));
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
      return { blob: r.blob, warnings };
    }
    smallest = { blob: r.smallest, w, h };
    scale *= clamp(Math.sqrt(targetBytes / r.smallest.size) * 0.95, 0.3, 0.9);
    if (Math.min(canvas.width, canvas.height) * scale < 16) break;
  }
  warnings.push(
    `Couldn't reach ${formatBytes(targetBytes)}. This is the smallest result possible.`,
  );
  return { blob: (smallest as { blob: Blob }).blob, warnings };
}

/** Renders one region of the scene. Used by every export path. */
function renderRegion(
  els: El[],
  assets: Map<string, Asset>,
  job: ExportJob,
  scale: number,
  bg: string | null,
): HTMLCanvasElement {
  const w = Math.max(1, Math.round(job.rect.w * scale));
  const h = Math.max(1, Math.round(job.rect.h * scale));
  const { c, ctx } = makeCanvas(w, h);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.scale(w / job.rect.w, h / job.rect.h);
  ctx.translate(-job.rect.x, -job.rect.y);
  if (job.clip) {
    ctx.beginPath();
    ctx.rect(job.rect.x, job.rect.y, job.rect.w, job.rect.h);
    ctx.clip();
  }
  const d: DrawCtx = { assets, scale: w / job.rect.w };
  for (const e of els) if (!e.hidden && job.include(e)) drawElement(ctx, e, d);
  return c;
}

/* ════════════════════════════════════════════════════════════════
   PERSISTENCE (IndexedDB)
════════════════════════════════════════════════════════════════ */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("image-studio", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function kv<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction("kv", mode);
    const rq = fn(tx.objectStore("kv"));
    tx.oncomplete = () => {
      db.close();
      resolve(rq.result);
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}
const kvGet = <T,>(k: string) =>
  kv<T | undefined>("readonly", (s) => s.get(k) as IDBRequest<T | undefined>);
const kvSet = (k: string, v: unknown) => kv("readwrite", (s) => s.put(v, k));
const kvDel = (k: string) => kv("readwrite", (s) => s.delete(k));

/* ════════════════════════════════════════════════════════════════
   SMALL UI PIECES (module-level so inputs never remount)
════════════════════════════════════════════════════════════════ */

const LABEL =
  "text-[9px] font-black uppercase tracking-widest text-muted-foreground";
const tbBtn = (on: boolean, disabled = false) =>
  `h-8 w-8 flex items-center justify-center rounded transition-colors ${
    disabled
      ? "opacity-40 cursor-not-allowed text-muted-foreground"
      : on
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;
const segBtn = (on: boolean) =>
  `flex-1 py-1.5 rounded text-[10px] font-black transition-all ${
    on
      ? "bg-card text-foreground shadow border border-border/50"
      : "text-muted-foreground hover:text-foreground"
  }`;
const optBtn = (on: boolean) =>
  `py-1.5 px-2 rounded border text-[10px] font-black transition-all ${
    on
      ? "border-primary bg-primary/10 text-primary"
      : "border-border/40 text-muted-foreground hover:text-foreground"
  }`;
const inputCls =
  "w-full h-8 px-2 bg-background border border-border/40 rounded text-[11px] font-mono text-foreground text-center focus:outline-none focus:border-primary";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pb-3 border-b border-border/30 last:border-0">
      <span className={LABEL}>{title}</span>
      {children}
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={tbBtn(active, disabled)}
    >
      {children}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const fmt = (v: number) => String(Math.round(v * 100) / 100);
  const [draft, setDraft] = useState(fmt(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDraft(fmt(value));
  }, [value]);
  return (
    <label className="block">
      <span className={`${LABEL} block mb-1`}>{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={draft}
        onFocus={() => (focused.current = true)}
        onBlur={() => {
          focused.current = false;
          setDraft(fmt(value));
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className={inputCls}
      />
    </label>
  );
}

function Slide({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className={LABEL}>{label}</span>
        <span className="text-[10px] font-mono text-foreground">
          {Math.round(value * 10) / 10}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  allowNone = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowNone?: boolean;
}) {
  const none = value === "transparent";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={LABEL}>{label}</span>
      <div className="flex items-center gap-1.5">
        {allowNone && (
          <button
            onClick={() => onChange(none ? "#ffffff" : "transparent")}
            className={`${optBtn(none)} !py-1`}
          >
            None
          </button>
        )}
        <input
          type="color"
          value={none ? "#ffffff" : value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 rounded border border-border/40 bg-background cursor-pointer p-0.5"
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */

export function ImageStudio() {
  const { toast } = useToast();

  /* ── State ─────────────────────────────────────────────────── */
  const [els, setEls] = useState<El[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [bg, setBg] = useState("#ffffff");
  const [grid, setGrid] = useState(true);
  const [cam, setCamState] = useState<Cam>({ x: 0, y: 0, zoom: 1 });
  const [tool, setToolState] = useState<Tool>("select");
  const [cropId, setCropIdState] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [showLayers, setShowLayers] = useState(true);
  const [showProps, setShowProps] = useState(true);
  const [panelTab, setPanelTab] = useState<"design" | "export">("design");
  const [ratioLock, setRatioLock] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Export settings
  const [exScope, setExScope] = useState<ExportScope>("auto");
  const [exScale, setExScale] = useState<number | "native">(1);
  const [exFmt, setExFmt] = useState<Fmt>("webp");
  const [exMode, setExMode] = useState<"quality" | "target">("quality");
  const [exPreset, setExPreset] = useState<QualityPreset>("balanced");
  const [exKb, setExKb] = useState("300");
  const [exTransparent, setExTransparent] = useState(true);
  const [busy, setBusy] = useState(false);

  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  /* ── Refs ──────────────────────────────────────────────────── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const elsRef = useRef<El[]>([]);
  const selRef = useRef<string[]>([]);
  const camRef = useRef<Cam>({ x: 0, y: 0, zoom: 1 });
  const toolRef = useRef<Tool>("select");
  const cropRef = useRef<string | null>(null);
  const editingRef = useRef<string | null>(null);
  const editSnap = useRef<El[] | null>(null);
  const assets = useRef(new Map<string, Asset>());
  const savedAssets = useRef(new Set<string>());
  const past = useRef<El[][]>([]);
  const future = useRef<El[][]>([]);
  const lastCp = useRef({ key: "", t: 0 });
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const spaceRef = useRef(false);
  const lastTap = useRef({ id: "", t: 0 });
  const clip = useRef<El[]>([]);
  const pasteCount = useRef(0);
  const lastPointer = useRef<[number, number] | null>(null);
  const marqueeRef = useRef<Rect | null>(null);
  const guidesRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const act = useRef({
    onKey: (_e: KeyboardEvent) => {},
    onKeyUp: (_e: KeyboardEvent) => {},
    onPaste: (_e: ClipboardEvent) => {},
  });

  /* ── Setters that keep refs and state in sync ──────────────── */
  const setAll = (next: El[]) => {
    elsRef.current = next;
    setEls(next);
  };
  const apply = (fn: (p: El[]) => El[]) => setAll(fn(elsRef.current));
  const setSel = (ids: string[]) => {
    selRef.current = ids;
    setSelected(ids);
  };
  const setCam = (c: Cam) => {
    camRef.current = c;
    setCamState(c);
  };
  const setCrop = (id: string | null) => {
    cropRef.current = id;
    setCropIdState(id);
  };
  const setTool = (t: Tool) => {
    toolRef.current = t;
    setToolState(t);
  };

  /* ── History ───────────────────────────────────────────────── */
  const pushHistory = (snap: El[]) => {
    past.current.push(snap);
    if (past.current.length > 100) past.current.shift();
    future.current = [];
  };
  // Same key within 1 s = same entry (so sliders / colour pickers don't flood history).
  const checkpoint = (key?: string) => {
    const now = Date.now();
    if (key && lastCp.current.key === key && now - lastCp.current.t < 1000) {
      lastCp.current.t = now;
      return;
    }
    lastCp.current = { key: key ?? "", t: now };
    pushHistory(elsRef.current);
  };
  const restore = (next: El[]) => {
    setAll(next);
    setSel(selRef.current.filter((id) => next.some((e) => e.id === id)));
    if (cropRef.current && !next.some((e) => e.id === cropRef.current))
      setCrop(null);
    lastCp.current = { key: "", t: 0 };
  };
  const undo = () => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(elsRef.current);
    restore(prev);
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(elsRef.current);
    restore(next);
  };

  /* ── Derived ───────────────────────────────────────────────── */
  const selEls = selected
    .map((id) => els.find((e) => e.id === id))
    .filter((e): e is El => !!e);
  const single = selEls.length === 1 ? selEls[0] : null;
  const editingEl = editingId
    ? (els.find((e) => e.id === editingId) ?? null)
    : null;
  const frames = els.filter((e) => e.type === "frame");
  const targetKb = Number(exKb);
  const targetValid = Number.isFinite(targetKb) && targetKb >= 5;

  /* ── Camera ────────────────────────────────────────────────── */
  const zoomAt = (px: number, py: number, nz: number) => {
    const c = camRef.current;
    const z = clamp(nz, MIN_ZOOM, MAX_ZOOM);
    const wx = (px - c.x) / c.zoom;
    const wy = (py - c.y) / c.zoom;
    setCam({ zoom: z, x: px - wx * z, y: py - wy * z });
  };
  const zoomBy = (f: number) =>
    zoomAt(size.w / 2, size.h / 2, camRef.current.zoom * f);
  const fitTo = (r: Rect | null, maxZoom = 2) => {
    if (!r) return setCam({ x: size.w / 2, y: size.h / 2, zoom: 1 });
    const pad = 96;
    const z = clamp(
      Math.min(
        (size.w - pad * 2) / Math.max(r.w, 1),
        (size.h - pad * 2) / Math.max(r.h, 1),
      ),
      MIN_ZOOM,
      maxZoom,
    );
    setCam({
      zoom: z,
      x: size.w / 2 - (r.x + r.w / 2) * z,
      y: size.h / 2 - (r.y + r.h / 2) * z,
    });
  };
  const fitAll = () =>
    fitTo(unionBounds(elsRef.current.filter((e) => !e.hidden)));
  const fitSelection = () => {
    const sel = elsRef.current.filter((e) => selRef.current.includes(e.id));
    fitTo(
      unionBounds(sel.length ? sel : elsRef.current.filter((e) => !e.hidden)),
    );
  };

  const canvasPt = (e: {
    clientX: number;
    clientY: number;
  }): [number, number] => {
    const r = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const toWorld = (sx: number, sy: number): [number, number] => {
    const c = camRef.current;
    return [(sx - c.x) / c.zoom, (sy - c.y) / c.zoom];
  };
  const viewCenter = (): [number, number] => toWorld(size.w / 2, size.h / 2);

  /* ── Scene operations ──────────────────────────────────────── */
  const patchSel = (patch: Partial<El>, key?: string) => {
    const ids = new Set(selRef.current);
    if (!ids.size) return;
    checkpoint(key ?? Object.keys(patch).join(","));
    apply((p) =>
      p.map((e) => (ids.has(e.id) ? fitText({ ...e, ...patch }) : e)),
    );
  };
  const patchOne = (id: string, patch: Partial<El>) => {
    checkpoint(`one:${id}:${Object.keys(patch).join(",")}`);
    apply((p) => p.map((e) => (e.id === id ? fitText({ ...e, ...patch }) : e)));
  };
  const patchFilters = (f: Partial<Filters>) => {
    const ids = new Set(selRef.current);
    checkpoint(`filters:${Object.keys(f).join(",")}`);
    apply((p) =>
      p.map((e) =>
        ids.has(e.id) && e.type === "image"
          ? { ...e, filters: { ...e.filters, ...f } }
          : e,
      ),
    );
  };
  const setDims = (axis: "w" | "h", v: number) => {
    if (!single || !(v > 0)) return;
    const val = Math.max(1, v);
    if (ratioLock && single.w > 0 && single.h > 0) {
      const k = val / single[axis];
      patchSel({ w: single.w * k, h: single.h * k }, "dims");
    } else patchSel({ [axis]: val }, "dims");
  };

  const deleteSel = () => {
    const ids = new Set(
      selRef.current.filter(
        (id) => !elsRef.current.find((e) => e.id === id)?.locked,
      ),
    );
    if (!ids.size) return;
    checkpoint();
    apply((p) => p.filter((e) => !ids.has(e.id)));
    setSel(selRef.current.filter((id) => !ids.has(id)));
    if (cropRef.current && ids.has(cropRef.current)) setCrop(null);
  };

  const cloneEls = (list: El[], dx: number, dy: number): El[] =>
    list.map((e) => ({
      ...e,
      id: uid(),
      x: e.x + dx,
      y: e.y + dy,
      locked: false,
    }));

  const duplicateSel = () => {
    const list = elsRef.current.filter((e) => selRef.current.includes(e.id));
    if (!list.length) return;
    const copies = cloneEls(list, 24, 24);
    checkpoint();
    apply((p) => [...p, ...copies]);
    setSel(copies.map((e) => e.id));
  };

  const pasteInternal = () => {
    if (!clip.current.length) return false;
    pasteCount.current += 1;
    const o = 24 * pasteCount.current;
    const copies = cloneEls(clip.current, o, o);
    checkpoint();
    apply((p) => [...p, ...copies]);
    setSel(copies.map((e) => e.id));
    return true;
  };

  const reorder = (dir: "front" | "back" | "forward" | "backward") => {
    const ids = new Set(selRef.current);
    if (!ids.size) return;
    checkpoint();
    apply((p) => {
      if (dir === "front")
        return [
          ...p.filter((e) => !ids.has(e.id)),
          ...p.filter((e) => ids.has(e.id)),
        ];
      if (dir === "back")
        return [
          ...p.filter((e) => ids.has(e.id)),
          ...p.filter((e) => !ids.has(e.id)),
        ];
      const a = [...p];
      if (dir === "forward") {
        for (let i = a.length - 2; i >= 0; i--)
          if (ids.has(a[i].id) && !ids.has(a[i + 1].id))
            [a[i], a[i + 1]] = [a[i + 1], a[i]];
      } else {
        for (let i = 1; i < a.length; i++)
          if (ids.has(a[i].id) && !ids.has(a[i - 1].id))
            [a[i], a[i - 1]] = [a[i - 1], a[i]];
      }
      return a;
    });
  };

  const align = (mode: "l" | "c" | "r" | "t" | "m" | "b") => {
    const list = elsRef.current.filter(
      (e) => selRef.current.includes(e.id) && !e.locked,
    );
    const u = unionBounds(list);
    if (!u || list.length < 2) return;
    checkpoint();
    const ids = new Set(list.map((e) => e.id));
    apply((p) =>
      p.map((e) => {
        if (!ids.has(e.id)) return e;
        const b = bounds(e);
        if (mode === "l") return { ...e, x: e.x + (u.x - b.x) };
        if (mode === "c")
          return { ...e, x: e.x + (u.x + u.w / 2 - (b.x + b.w / 2)) };
        if (mode === "r") return { ...e, x: e.x + (u.x + u.w - (b.x + b.w)) };
        if (mode === "t") return { ...e, y: e.y + (u.y - b.y) };
        if (mode === "m")
          return { ...e, y: e.y + (u.y + u.h / 2 - (b.y + b.h / 2)) };
        return { ...e, y: e.y + (u.y + u.h - (b.y + b.h)) };
      }),
    );
  };

  const rotate90 = (dir: 1 | -1) =>
    patchSel(
      {
        rotation:
          ((single?.rotation ?? 0) + (dir * Math.PI) / 2 + Math.PI * 2) %
          (Math.PI * 2),
      },
      "rot90",
    );

  const addFrame = (w: number, h: number, name?: string) => {
    const [cx, cy] = viewCenter();
    const f = newEl("frame", {
      x: cx - w / 2,
      y: cy - h / 2,
      w,
      h,
      name: name ?? `Frame ${frames.length + 1}`,
    });
    checkpoint();
    apply((p) => [f, ...p]);
    setSel([f.id]);
    fitTo({ x: f.x, y: f.y, w: f.w, h: f.h });
  };

  const resizeFrameTo = (w: number, h: number, label: string) => {
    if (!single || single.type !== "frame") return;
    patchOne(single.id, {
      w,
      h,
      name: single.name.startsWith("Frame") ? label : single.name,
    });
  };

  /* ── Images ────────────────────────────────────────────────── */
  const addImageFiles = async (files: File[], at?: [number, number]) => {
    const rejected: string[] = [];
    const created: El[] = [];
    const c = camRef.current;
    const [cx, cy] = at ?? viewCenter();
    let i = 0;
    for (const f of files.slice(0, MAX_FILES_PER_ADD)) {
      if (!IMG_MIMES.includes(mimeOf(f))) {
        rejected.push(`${f.name}: unsupported file type`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        rejected.push(
          `${f.name}: larger than ${MAX_FILE_BYTES / 1024 / 1024} MB`,
        );
        continue;
      }
      let bmp: ImageBitmap;
      try {
        bmp = await createImageBitmap(f);
      } catch {
        rejected.push(`${f.name}: couldn't be read as an image`);
        continue;
      }
      if (bmp.width * bmp.height > MAX_PIXELS) {
        bmp.close();
        rejected.push(`${f.name}: more than ${MAX_PIXELS / 1e6} megapixels`);
        continue;
      }
      const id = uid();
      assets.current.set(id, { bmp, w: bmp.width, h: bmp.height, blob: f });
      const s = Math.min(
        1,
        ((size.w / c.zoom) * 0.6) / bmp.width,
        ((size.h / c.zoom) * 0.6) / bmp.height,
      );
      const w = Math.max(8, Math.round(bmp.width * s));
      const h = Math.max(8, Math.round(bmp.height * s));
      created.push(
        newEl("image", {
          name: baseName(f.name),
          x: cx - w / 2 + i * 32,
          y: cy - h / 2 + i * 32,
          w,
          h,
          assetId: id,
        }),
      );
      i++;
    }
    if (created.length) {
      checkpoint();
      apply((p) => [...p, ...created]);
      setSel(created.map((e) => e.id));
      setTool("select");
    }
    if (rejected.length)
      toast({
        variant: "destructive",
        title: `${rejected.length} file${rejected.length > 1 ? "s" : ""} skipped`,
        description:
          rejected.slice(0, 3).join(" • ") +
          (rejected.length > 3 ? ` …and ${rejected.length - 3} more` : ""),
      });
  };

  /* ── Text editing ──────────────────────────────────────────── */
  const beginTextEdit = (id: string) => {
    editSnap.current = elsRef.current;
    editingRef.current = id;
    setEditingId(id);
  };
  const commitText = () => {
    const id = editingRef.current;
    if (!id) return;
    editingRef.current = null;
    setEditingId(null);
    const snap = editSnap.current;
    editSnap.current = null;
    const el = elsRef.current.find((e) => e.id === id);
    if (!el || !snap) return;
    const before = snap.find((e) => e.id === id);
    if (el.text.trim() === "") {
      apply((p) => p.filter((e) => e.id !== id));
      setSel(selRef.current.filter((x) => x !== id));
      if (before) pushHistory(snap);
    } else if (!before || before.text !== el.text) pushHistory(snap);
  };
  useEffect(() => {
    if (!editingId) return;
    const t = setTimeout(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }, 30);
    return () => clearTimeout(t);
  }, [editingId]);

  /* ── Handles ───────────────────────────────────────────────── */
  const getHandles = (): { id: HandleId; x: number; y: number }[] => {
    if (editingRef.current) return [];
    const c = camRef.current;
    const sel = elsRef.current.filter(
      (e) => selRef.current.includes(e.id) && !e.hidden,
    );
    if (!sel.length || sel.some((e) => e.locked)) return [];
    const mk = (id: HandleId, wx: number, wy: number) => ({
      id,
      x: wx * c.zoom + c.x,
      y: wy * c.zoom + c.y,
    });
    if (sel.length === 1) {
      const e = sel[0];
      const [cx, cy] = center(e);
      const cropping = cropRef.current === e.id;
      const ids = !cropping && e.type === "text" ? CORNERS : ALL8;
      const out = ids.map((id) => {
        const [hx, hy] = HDIR[id];
        const [rx, ry] = rot((hx * e.w) / 2, (hy * e.h) / 2, e.rotation);
        return mk(id, cx + rx, cy + ry);
      });
      if (!cropping && e.type !== "frame") {
        const [rx, ry] = rot(0, -e.h / 2 - 26 / c.zoom, e.rotation);
        out.push(mk("rotate", cx + rx, cy + ry));
      }
      return out;
    }
    const B = unionBounds(sel)!;
    return ALL8.map((id) => {
      const [hx, hy] = HDIR[id];
      return mk(id, B.x + ((hx + 1) / 2) * B.w, B.y + ((hy + 1) / 2) * B.h);
    });
  };
  const hitHandle = (
    sx: number,
    sy: number,
    touch: boolean,
  ): HandleId | null => {
    const r = touch ? 16 : 9;
    let best: HandleId | null = null;
    let bd = Infinity;
    for (const h of getHandles()) {
      const d = Math.hypot(h.x - sx, h.y - sy);
      if (d <= r && d < bd) {
        bd = d;
        best = h.id;
      }
    }
    return best;
  };
  const topHit = (wx: number, wy: number, tol: number): El | null => {
    const z = camRef.current.zoom;
    const list = elsRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (e.hidden || e.locked) continue;
      if (hitTest(e, wx, wy, tol, z)) return e;
    }
    return null;
  };
  // Moving a frame also moves what sits inside it.
  const withFrameChildren = (ids: string[]): string[] => {
    const set = new Set(ids);
    for (const f of elsRef.current) {
      if (f.type !== "frame" || !ids.includes(f.id)) continue;
      const fb = { x: f.x, y: f.y, w: f.w, h: f.h };
      for (const e of elsRef.current) {
        if (e.type === "frame" || e.locked || set.has(e.id)) continue;
        const [cx, cy] = center(e);
        if (cx >= fb.x && cx <= fb.x + fb.w && cy >= fb.y && cy <= fb.y + fb.h)
          set.add(e.id);
      }
    }
    return [...set];
  };

  /* ── Pointer interaction ───────────────────────────────────── */
  const mutate = (d: Drag, fn: (p: El[]) => El[]) => {
    if (!d.dirty) {
      checkpoint();
      d.dirty = true;
    }
    apply(fn);
  };

  const beginPinch = () => {
    const pts = [...pointers.current.values()];
    const r = canvasRef.current!.getBoundingClientRect();
    drag.current = {
      kind: "pinch",
      d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
      mid: [
        (pts[0].x + pts[1].x) / 2 - r.left,
        (pts[0].y + pts[1].y) / 2 - r.top,
      ],
      cam: { ...camRef.current },
      dirty: false,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editingRef.current) commitText();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) return beginPinch();
    if (pointers.current.size > 2) return;

    const [sx, sy] = canvasPt(e);
    const [wx, wy] = toWorld(sx, sy);
    const z = camRef.current.zoom;
    const touch = e.pointerType === "touch";
    const tol = (touch ? 10 : 5) / z;
    const t = toolRef.current;

    if (e.button === 1 || t === "hand" || spaceRef.current) {
      drag.current = {
        kind: "pan",
        sx: e.clientX,
        sy: e.clientY,
        cam: { ...camRef.current },
        dirty: false,
      };
      return;
    }
    if (e.button !== 0) return;

    // ── creation tools
    if (t !== "select") {
      if (cropRef.current) setCrop(null);
      if (t === "text") {
        const el = newEl("text", { x: wx, y: wy });
        editSnap.current = elsRef.current;
        apply((p) => [...p, el]);
        setSel([el.id]);
        editingRef.current = el.id;
        setEditingId(el.id);
        setTool("select");
        return;
      }
      const el = newEl(t as ElType, {
        x: wx,
        y: wy,
        w: 0,
        h: 0,
        name: t === "frame" ? `Frame ${frames.length + 1}` : NAMES[t as ElType],
      });
      checkpoint();
      apply((p) => (t === "frame" ? [el, ...p] : [...p, el]));
      setSel([el.id]);
      drag.current = {
        kind: "draw",
        id: el.id,
        x0: wx,
        y0: wy,
        tool: t,
        dirty: true,
      };
      return;
    }

    // ── crop mode
    if (cropRef.current) {
      const ce = elsRef.current.find((x) => x.id === cropRef.current);
      const h = hitHandle(sx, sy, touch);
      if (ce && h && h !== "rotate") {
        drag.current = { kind: "crop", handle: h, start: ce, dirty: false };
        return;
      }
      if (ce && hitTest(ce, wx, wy, 0, z)) {
        drag.current = {
          kind: "cropPan",
          start: ce,
          p0: [wx, wy],
          dirty: false,
        };
        return;
      }
      setCrop(null);
    }

    // ── transform handles
    const h = hitHandle(sx, sy, touch);
    if (h) {
      const sel = elsRef.current.filter((x) => selRef.current.includes(x.id));
      if (h === "rotate")
        drag.current = { kind: "rotate", id: sel[0].id, dirty: false };
      else if (sel.length === 1)
        drag.current = {
          kind: "resize",
          handle: h,
          start: sel[0],
          dirty: false,
        };
      else
        drag.current = {
          kind: "group",
          handle: h,
          box: unionBounds(sel)!,
          orig: sel,
          dirty: false,
        };
      return;
    }

    // ── element hit
    const hit = topHit(wx, wy, tol);
    if (hit) {
      const now = Date.now();
      const dbl =
        lastTap.current.id === hit.id && now - lastTap.current.t < 350;
      lastTap.current = { id: hit.id, t: now };
      if (dbl && !e.shiftKey) {
        if (hit.type === "image") {
          setSel([hit.id]);
          setCrop(hit.id);
          return;
        }
        if (hit.type === "text") {
          setSel([hit.id]);
          beginTextEdit(hit.id);
          return;
        }
      }
      let ids = selRef.current;
      let toggleOff = false;
      if (e.shiftKey) {
        if (ids.includes(hit.id)) toggleOff = true;
        else ids = [...ids, hit.id];
      } else if (!ids.includes(hit.id)) ids = [hit.id];
      setSel(ids);

      let moving = withFrameChildren(ids);
      let dirty = false;
      if (e.altKey && !toggleOff) {
        // alt-drag duplicates and drags the copies
        const src = elsRef.current.filter((x) => moving.includes(x.id));
        const copies = cloneEls(src, 0, 0);
        const map = new Map(src.map((s, i) => [s.id, copies[i].id]));
        checkpoint();
        dirty = true;
        apply((p) => [...p, ...copies]);
        ids = ids.map((id) => map.get(id) ?? id);
        moving = copies.map((c) => c.id);
        setSel(ids);
      }
      const mel = elsRef.current.filter(
        (x) => moving.includes(x.id) && !x.locked,
      );
      if (!mel.length) return;
      drag.current = {
        kind: "move",
        start: [wx, wy],
        orig: new Map(mel.map((m) => [m.id, { x: m.x, y: m.y }])),
        box: unionBounds(mel)!,
        others: elsRef.current
          .filter((x) => !x.hidden && !moving.includes(x.id))
          .map(bounds),
        moved: false,
        toggleOff,
        hitId: hit.id,
        dirty,
      };
      return;
    }

    // ── empty space
    if (!e.shiftKey) setSel([]);
    drag.current = {
      kind: "marquee",
      x0: wx,
      y0: wy,
      base: e.shiftKey ? selRef.current : [],
      dirty: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointers.current.has(e.pointerId))
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [sx, sy] = canvasPt(e);
    const [wx, wy] = toWorld(sx, sy);
    lastPointer.current = [wx, wy];
    const d = drag.current;

    if (!d) {
      if (e.pointerType !== "mouse") return;
      const t = toolRef.current;
      let c = "default";
      if (spaceRef.current || t === "hand") c = "grab";
      else if (t === "text") c = "text";
      else if (t !== "select") c = "crosshair";
      else {
        const h = hitHandle(sx, sy, false);
        if (h) c = CURSOR[h];
        else if (topHit(wx, wy, 5 / camRef.current.zoom)) c = "move";
      }
      if (e.currentTarget.style.cursor !== c) e.currentTarget.style.cursor = c;
      return;
    }

    switch (d.kind) {
      case "pinch": {
        if (pointers.current.size < 2) return;
        const pts = [...pointers.current.values()];
        const r = canvasRef.current!.getBoundingClientRect();
        const mx = (pts[0].x + pts[1].x) / 2 - r.left;
        const my = (pts[0].y + pts[1].y) / 2 - r.top;
        const z = clamp(
          (d.cam.zoom * Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)) /
            d.d0,
          MIN_ZOOM,
          MAX_ZOOM,
        );
        const w0x = (d.mid[0] - d.cam.x) / d.cam.zoom;
        const w0y = (d.mid[1] - d.cam.y) / d.cam.zoom;
        setCam({ zoom: z, x: mx - w0x * z, y: my - w0y * z });
        return;
      }
      case "pan":
        setCam({
          ...d.cam,
          x: d.cam.x + (e.clientX - d.sx),
          y: d.cam.y + (e.clientY - d.sy),
        });
        return;
      case "move": {
        let dx = wx - d.start[0];
        let dy = wy - d.start[1];
        if (!d.moved && Math.hypot(dx, dy) * camRef.current.zoom < 3) return;
        d.moved = true;
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) dy = 0;
          else dx = 0;
        }
        let gx: number | null = null;
        let gy: number | null = null;
        if (!(e.ctrlKey || e.metaKey)) {
          const r = snapBox(
            { x: d.box.x + dx, y: d.box.y + dy, w: d.box.w, h: d.box.h },
            d.others,
            6 / camRef.current.zoom,
          );
          dx += r.dx;
          dy += r.dy;
          gx = r.gx;
          gy = r.gy;
        }
        guidesRef.current = { x: gx, y: gy };
        mutate(d, (p) =>
          p.map((el) => {
            const o = d.orig.get(el.id);
            return o ? { ...el, x: o.x + dx, y: o.y + dy } : el;
          }),
        );
        return;
      }
      case "marquee": {
        const r = {
          x: Math.min(d.x0, wx),
          y: Math.min(d.y0, wy),
          w: Math.abs(wx - d.x0),
          h: Math.abs(wy - d.y0),
        };
        marqueeRef.current = r;
        const hits = elsRef.current
          .filter(
            (el) =>
              !el.hidden &&
              !el.locked &&
              (el.type === "frame"
                ? contains(r, bounds(el))
                : intersects(r, bounds(el))),
          )
          .map((el) => el.id);
        setSel([...new Set([...d.base, ...hits])]);
        bump();
        return;
      }
      case "resize":
        mutate(d, (p) =>
          p.map((el) =>
            el.id === d.start.id
              ? { ...el, ...resizeEl(d.start, d.handle, wx, wy, e.shiftKey) }
              : el,
          ),
        );
        return;
      case "group": {
        const patches = resizeGroup(d.orig, d.box, d.handle, wx, wy);
        mutate(d, (p) =>
          p.map((el) =>
            patches.has(el.id) ? { ...el, ...patches.get(el.id) } : el,
          ),
        );
        return;
      }
      case "rotate": {
        const el = elsRef.current.find((x) => x.id === d.id);
        if (!el) return;
        const [cx, cy] = center(el);
        let a = Math.atan2(wy - cy, wx - cx) + Math.PI / 2;
        if (e.shiftKey) a = Math.round(a / (Math.PI / 12)) * (Math.PI / 12);
        a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        mutate(d, (p) =>
          p.map((x) => (x.id === d.id ? { ...x, rotation: a } : x)),
        );
        return;
      }
      case "draw": {
        let dx = wx - d.x0;
        let dy = wy - d.y0;
        if (e.shiftKey) {
          if (d.tool === "arrow") {
            if (Math.abs(dx) > 2 * Math.abs(dy)) dy = 0;
            else if (Math.abs(dy) > 2 * Math.abs(dx)) dx = 0;
            else {
              const m = Math.max(Math.abs(dx), Math.abs(dy));
              dx = Math.sign(dx || 1) * m;
              dy = Math.sign(dy || 1) * m;
            }
          } else {
            const m = Math.max(Math.abs(dx), Math.abs(dy));
            dx = Math.sign(dx || 1) * m;
            dy = Math.sign(dy || 1) * m;
          }
        }
        const patch: Partial<El> = {
          x: Math.min(d.x0, d.x0 + dx),
          y: Math.min(d.y0, d.y0 + dy),
          w: Math.abs(dx),
          h: Math.abs(dy),
          ...(d.tool === "arrow" ? { flipX: dx < 0, flipY: dy < 0 } : {}),
        };
        apply((p) =>
          p.map((el) => (el.id === d.id ? { ...el, ...patch } : el)),
        );
        return;
      }
      case "crop":
        mutate(d, (p) =>
          p.map((el) =>
            el.id === d.start.id
              ? { ...el, ...cropResize(d.start, d.handle, wx, wy) }
              : el,
          ),
        );
        return;
      case "cropPan":
        mutate(d, (p) =>
          p.map((el) =>
            el.id === d.start.id
              ? { ...el, ...cropPan(d.start, wx - d.p0[0], wy - d.p0[1]) }
              : el,
          ),
        );
        return;
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (!d) return;
    if (d.kind === "pinch") {
      if (pointers.current.size < 2) drag.current = null;
      return;
    }
    if (d.kind === "draw") {
      const el = elsRef.current.find((x) => x.id === d.id);
      if (el && el.w < 4 && el.h < 4) {
        const def: Record<string, [number, number]> = {
          rect: [160, 100],
          ellipse: [140, 100],
          arrow: [140, 0],
          frame: [400, 300],
        };
        const [w, h] = def[d.tool] ?? [100, 100];
        apply((p) => p.map((x) => (x.id === d.id ? { ...x, w, h } : x)));
      }
      setTool("select");
    }
    if (d.kind === "move" && !d.moved && d.toggleOff)
      setSel(selRef.current.filter((id) => id !== d.hitId));
    marqueeRef.current = null;
    guidesRef.current = { x: null, y: null };
    drag.current = null;
    bump();
  };

  /* ── Keyboard & clipboard (latest closures via `act`) ──────── */
  act.current.onKey = (ev: KeyboardEvent) => {
    const t = ev.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable)
    )
      return;
    const mod = ev.ctrlKey || ev.metaKey;
    const k = ev.key.toLowerCase();
    if (ev.key === " ") {
      spaceRef.current = true;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      ev.preventDefault();
      return;
    }
    if (mod) {
      if (k === "z") {
        ev.preventDefault();
        return ev.shiftKey ? redo() : undo();
      }
      if (k === "y") {
        ev.preventDefault();
        return redo();
      }
      if (k === "a") {
        ev.preventDefault();
        return setSel(
          elsRef.current.filter((e) => !e.hidden && !e.locked).map((e) => e.id),
        );
      }
      if (k === "d") {
        ev.preventDefault();
        return duplicateSel();
      }
      if (k === "c") {
        clip.current = elsRef.current.filter((e) =>
          selRef.current.includes(e.id),
        );
        pasteCount.current = 0;
        return;
      }
      if (k === "0") {
        ev.preventDefault();
        return zoomAt(size.w / 2, size.h / 2, 1);
      }
      if (k === "]" || k === "[") {
        ev.preventDefault();
        return reorder(
          k === "]"
            ? ev.shiftKey
              ? "front"
              : "forward"
            : ev.shiftKey
              ? "back"
              : "backward",
        );
      }
      return;
    }
    if (ev.key === "Delete" || ev.key === "Backspace") {
      ev.preventDefault();
      return deleteSel();
    }
    if (ev.key === "Escape") {
      if (cropRef.current) return setCrop(null);
      setSel([]);
      return setTool("select");
    }
    if (ev.key === "Enter") {
      if (cropRef.current) return setCrop(null);
      const only = elsRef.current.filter((e) => selRef.current.includes(e.id));
      if (only.length === 1 && only[0].type === "image")
        return setCrop(only[0].id);
      if (only.length === 1 && only[0].type === "text") {
        ev.preventDefault();
        return beginTextEdit(only[0].id);
      }
      return;
    }
    if (ev.key.startsWith("Arrow")) {
      const ids = new Set(
        selRef.current.filter(
          (id) => !elsRef.current.find((e) => e.id === id)?.locked,
        ),
      );
      if (!ids.size) return;
      ev.preventDefault();
      const step = ev.shiftKey ? 10 : 1;
      const dx =
        ev.key === "ArrowLeft" ? -step : ev.key === "ArrowRight" ? step : 0;
      const dy =
        ev.key === "ArrowUp" ? -step : ev.key === "ArrowDown" ? step : 0;
      checkpoint("nudge");
      return apply((p) =>
        p.map((e) => (ids.has(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e)),
      );
    }
    if (ev.altKey) return;
    if (ev.shiftKey && ev.code === "Digit1") return fitAll();
    if (ev.shiftKey && ev.code === "Digit2") return fitSelection();
    if (ev.key === "=" || ev.key === "+") return zoomBy(1.2);
    if (ev.key === "-") return zoomBy(1 / 1.2);
    const map: Record<string, Tool> = {
      v: "select",
      h: "hand",
      r: "rect",
      o: "ellipse",
      a: "arrow",
      t: "text",
      f: "frame",
    };
    if (map[k]) return setTool(map[k]);
    if (k === "i") fileRef.current?.click();
  };
  act.current.onKeyUp = (ev: KeyboardEvent) => {
    if (ev.key === " ") {
      spaceRef.current = false;
      if (canvasRef.current) canvasRef.current.style.cursor = "default";
    }
  };
  act.current.onPaste = (ev: ClipboardEvent) => {
    const t = ev.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
    )
      return;
    const files = Array.from(ev.clipboardData?.files ?? []).filter((f) =>
      IMG_MIMES.includes(mimeOf(f)),
    );
    if (files.length) {
      ev.preventDefault();
      addImageFiles(files, lastPointer.current ?? undefined);
    } else if (pasteInternal()) ev.preventDefault();
  };

  /* ── Effects ───────────────────────────────────────────────── */
  useEffect(() => {
    const kd = (e: KeyboardEvent) => act.current.onKey(e);
    const ku = (e: KeyboardEvent) => act.current.onKeyUp(e);
    const pa = (e: ClipboardEvent) => act.current.onPaste(e);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("paste", pa);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("paste", pa);
    };
  }, []);

  // Wheel must be non-passive so we can preventDefault (pinch-zoom / page scroll).
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const r = cv.getBoundingClientRect();
      const c = camRef.current;
      if (ev.ctrlKey || ev.metaKey) {
        const z = clamp(
          c.zoom * Math.exp(-ev.deltaY * 0.0125),
          MIN_ZOOM,
          MAX_ZOOM,
        );
        const px = ev.clientX - r.left;
        const py = ev.clientY - r.top;
        const wx = (px - c.x) / c.zoom;
        const wy = (py - c.y) / c.zoom;
        camRef.current = { zoom: z, x: px - wx * z, y: py - wy * z };
      } else camRef.current = { ...c, x: c.x - ev.deltaX, y: c.y - ev.deltaY };
      setCamState(camRef.current);
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({
        w: Math.max(1, Math.round(r.width)),
        h: Math.max(1, Math.round(r.height)),
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    if (window.innerWidth < 1024) {
      setShowLayers(false);
      setShowProps(false);
    }
    return () => ro.disconnect();
  }, []);

  // Restore the last session.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const doc = await kvGet<SavedDoc>("scene");
        if (doc && alive) {
          for (const id of doc.assetIds) {
            const blob = await kvGet<Blob>(`asset:${id}`);
            if (!blob) continue;
            const bmp = await createImageBitmap(blob);
            assets.current.set(id, { bmp, w: bmp.width, h: bmp.height, blob });
            savedAssets.current.add(id);
          }
          if (!alive) return;
          setAll(
            doc.els.filter(
              (e) =>
                e.type !== "image" ||
                (e.assetId && assets.current.has(e.assetId)),
            ),
          );
          setBg(doc.bg);
          setGrid(doc.grid);
          setCam(doc.cam);
        }
      } catch {
        /* storage unavailable (private mode etc.): the editor still works, just without autosave */
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounced).
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(async () => {
      try {
        const referenced = new Set(
          els
            .filter((e) => e.type === "image" && e.assetId)
            .map((e) => e.assetId as string),
        );
        for (const id of referenced) {
          const a = assets.current.get(id);
          if (a && !savedAssets.current.has(id)) {
            await kvSet(`asset:${id}`, a.blob);
            savedAssets.current.add(id);
          }
        }
        for (const id of [...savedAssets.current]) {
          if (!referenced.has(id)) {
            await kvDel(`asset:${id}`);
            savedAssets.current.delete(id);
          }
        }
        const doc: SavedDoc = {
          v: 1,
          els,
          bg,
          grid,
          cam,
          assetIds: [...referenced],
        };
        await kvSet("scene", doc);
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [els, bg, grid, cam, hydrated]);

  useEffect(() => {
    const a = assets.current;
    return () => a.forEach((x) => x.bmp.close());
  }, []);

  /* ── Rendering ─────────────────────────────────────────────── */
  const draw = () => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = size.w;
    const H = size.h;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (grid && 20 * cam.zoom >= 8) {
      const g = 20;
      ctx.fillStyle = "rgba(128,128,150,0.35)";
      const x1 = (W - cam.x) / cam.zoom;
      const y1 = (H - cam.y) / cam.zoom;
      for (let x = Math.floor(-cam.x / cam.zoom / g) * g; x <= x1; x += g)
        for (let y = Math.floor(-cam.y / cam.zoom / g) * g; y <= y1; y += g)
          ctx.fillRect(
            x * cam.zoom + cam.x - 0.75,
            y * cam.zoom + cam.y - 0.75,
            1.5,
            1.5,
          );
    }

    // world
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.scale(cam.zoom, cam.zoom);
    const dc: DrawCtx = { assets: assets.current, scale: cam.zoom * dpr };
    for (const e of els) {
      if (e.hidden || e.id === editingId) continue;
      if (e.id === cropId && e.type === "image") drawCropGhost(ctx, e, dc);
      drawElement(ctx, e, dc);
    }
    ctx.restore();

    // overlays (CSS px)
    const w2s = (x: number, y: number): [number, number] => [
      x * cam.zoom + cam.x,
      y * cam.zoom + cam.y,
    ];
    for (const e of els) {
      if (e.type !== "frame" || e.hidden) continue;
      const [sx, sy] = w2s(e.x, e.y);
      const sw = e.w * cam.zoom;
      ctx.strokeStyle = "rgba(120,120,150,0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 0.5, sy + 0.5, sw, e.h * cam.zoom);
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, sy - 24, Math.max(0, sw), 24);
      ctx.clip();
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.fillStyle = selected.includes(e.id) ? ACCENT : "#8a8a9a";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(e.name, sx, sy - 6);
      ctx.restore();
    }

    const sel = selEls.filter((e) => !e.hidden);
    for (const e of sel) {
      const pts = corners(e).map(([x, y]) => w2s(x, y));
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = sel.length > 1 ? 1 : 1.5;
      ctx.stroke();
    }
    if (sel.length > 1) {
      const B = unionBounds(sel)!;
      const [x, y] = w2s(B.x, B.y);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, B.w * cam.zoom, B.h * cam.zoom);
      ctx.setLineDash([]);
    }
    const handles = getHandles();
    const cropping = !!cropId;
    const rotH = handles.find((h) => h.id === "rotate");
    if (rotH && sel.length === 1) {
      const [tx, ty] = w2s(
        ...(() => {
          const e = sel[0];
          const [cx, cy] = center(e);
          const [rx, ry] = rot(0, -e.h / 2, e.rotation);
          return [cx + rx, cy + ry] as [number, number];
        })(),
      );
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(rotH.x, rotH.y);
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (const h of handles) {
      ctx.beginPath();
      if (h.id === "rotate") ctx.arc(h.x, h.y, 5.5, 0, Math.PI * 2);
      else ctx.rect(h.x - 4.5, h.y - 4.5, 9, 9);
      ctx.fillStyle = cropping ? ACCENT : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (sel.length && !editingId && handles.length > 0) {
      const B = unionBounds(sel)!;
      const [x, y] = w2s(B.x + B.w / 2, B.y + B.h);
      const label = `${Math.round(sel.length === 1 ? sel[0].w : B.w)} × ${Math.round(sel.length === 1 ? sel[0].h : B.h)}`;
      ctx.font = "600 10px ui-monospace, Menlo, monospace";
      const tw = ctx.measureText(label).width + 10;
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.roundRect?.(x - tw / 2, y + 12, tw, 16, 4);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 20.5);
      ctx.textAlign = "left";
    }

    const gd = guidesRef.current;
    ctx.strokeStyle = GUIDE;
    ctx.lineWidth = 1;
    if (gd.x !== null) {
      const x = gd.x * cam.zoom + cam.x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    if (gd.y !== null) {
      const y = gd.y * cam.zoom + cam.y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    const m = marqueeRef.current;
    if (m) {
      const [x, y] = w2s(m.x, m.y);
      ctx.fillStyle = "rgba(109,94,252,0.08)";
      ctx.fillRect(x, y, m.w * cam.zoom, m.h * cam.zoom);
      ctx.strokeStyle = ACCENT;
      ctx.strokeRect(x, y, m.w * cam.zoom, m.h * cam.zoom);
    }
  };
  useEffect(() => {
    draw();
  });

  /* ── Export ────────────────────────────────────────────────── */
  const resolveScope = (): Exclude<ExportScope, "auto"> =>
    exScope !== "auto"
      ? exScope === "selection" && !selected.length
        ? "all"
        : exScope === "frames" && !frames.length
          ? "all"
          : exScope
      : selected.length
        ? "selection"
        : frames.length
          ? "frames"
          : "all";

  const buildJobs = (scope: Exclude<ExportScope, "auto">): ExportJob[] => {
    const vis = els.filter((e) => !e.hidden);
    if (scope === "frames") {
      let fs = vis.filter((e) => e.type === "frame");
      const chosen = fs.filter((f) => selected.includes(f.id));
      if (chosen.length) fs = chosen;
      return fs.map((f) => {
        const r = { x: f.x, y: f.y, w: f.w, h: f.h };
        return {
          name: f.name,
          rect: r,
          clip: true,
          include: (e: El) =>
            e.id === f.id || (e.type !== "frame" && intersects(bounds(e), r)),
        };
      });
    }
    const list =
      scope === "selection" ? vis.filter((e) => selected.includes(e.id)) : vis;
    const u = unionBounds(list);
    if (!u) return [];
    const stroked = list.filter(
      (e) => e.type !== "image" && e.type !== "frame" && e.type !== "text",
    );
    const pad = stroked.length
      ? Math.ceil(Math.max(...stroked.map((e) => e.strokeWidth)) / 2) + 2
      : 0;
    const ids = new Set(list.map((e) => e.id));
    return [
      {
        name:
          scope === "all"
            ? "canvas"
            : list.length === 1
              ? list[0].name
              : "selection",
        rect: {
          x: u.x - pad,
          y: u.y - pad,
          w: Math.max(1, u.w + pad * 2),
          h: Math.max(1, u.h + pad * 2),
        },
        clip: false,
        include: (e: El) => ids.has(e.id),
      },
    ];
  };

  // "Native" = the scale at which the source pixels of the largest image are exported 1:1.
  const nativeScale = (job: ExportJob) => {
    let m = 0;
    for (const e of els) {
      if (e.hidden || e.type !== "image" || !job.include(e)) continue;
      const a = e.assetId ? assets.current.get(e.assetId) : undefined;
      if (a) m = Math.max(m, (a.w * e.crop.w) / e.w);
    }
    return m || 1;
  };

  const jobs = buildJobs(resolveScope());
  const firstJob = jobs[0];
  const previewScale = firstJob
    ? exScale === "native"
      ? nativeScale(firstJob)
      : exScale
    : 1;
  const hasImages = els.some((e) => e.type === "image" && !e.hidden);

  const runExport = async () => {
    const list = buildJobs(resolveScope());
    if (!list.length)
      return toast({
        variant: "destructive",
        title: "Nothing to export",
        description: "Add something to the canvas first.",
      });
    if (exMode === "target" && exFmt !== "png" && !targetValid)
      return toast({ variant: "destructive", title: "Enter at least 5 KB" });
    setBusy(true);
    try {
      const out: { name: string; blob: Blob }[] = [];
      const warnings: string[] = [];
      for (const job of list) {
        const sc = exScale === "native" ? nativeScale(job) : exScale;
        const w = Math.round(job.rect.w * sc);
        const h = Math.round(job.rect.h * sc);
        if (w > MAX_SIDE || h > MAX_SIDE || w * h > MAX_PIXELS)
          throw new Error(
            `"${job.name}" would be ${w}×${h} px (max ${MAX_SIDE} px per side). Lower the scale.`,
          );
        await new Promise((r) => setTimeout(r, 0));
        const fill = exFmt === "jpeg" || !exTransparent ? bg : null;
        const canvas = renderRegion(
          elsRef.current,
          assets.current,
          job,
          sc,
          fill,
        );
        const mime = MIME[exFmt];
        let blob: Blob;
        if (exMode === "target" && exFmt !== "png") {
          const r = await encodeToTarget(canvas, mime, targetKb * 1024);
          blob = r.blob;
          warnings.push(...r.warnings.map((m) => `${job.name}: ${m}`));
        } else {
          if (exMode === "target" && exFmt === "png")
            warnings.push(
              "PNG is lossless, so a target size can't be applied. Use WebP or JPEG.",
            );
          blob = await canvasToBlob(
            canvas,
            mime,
            exFmt === "png" ? undefined : QUALITY[exPreset],
          );
        }
        const suffix = exScale === "native" || sc === 1 ? "" : `@${sc}x`;
        out.push({
          name: `${safeName(job.name)}${suffix}.${EXT[exFmt]}`,
          blob,
        });
      }
      if (out.length === 1)
        triggerDownload(URL.createObjectURL(out[0].blob), out[0].name, true);
      else {
        const zip = new JSZip();
        const used = new Map<string, number>();
        for (const o of out) {
          const n = used.get(o.name.toLowerCase()) ?? 0;
          used.set(o.name.toLowerCase(), n + 1);
          const dot = o.name.lastIndexOf(".");
          zip.file(
            n === 0
              ? o.name
              : `${o.name.slice(0, dot)}-${n + 1}${o.name.slice(dot)}`,
            o.blob,
          );
        }
        const blob = await zip.generateAsync({ type: "blob" });
        triggerDownload(
          URL.createObjectURL(blob),
          `studio-${Date.now()}.zip`,
          true,
        );
      }
      const total = out.reduce((s, o) => s + o.blob.size, 0);
      toast({
        title: out.length > 1 ? `Exported ${out.length} files` : "Exported",
        description: [
          formatBytes(total),
          ...[...new Set(warnings)].slice(0, 2),
        ].join(" • "),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  };

  /* ── Drop ──────────────────────────────────────────────────── */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    const [sx, sy] = canvasPt(e);
    addImageFiles(files, toWorld(sx, sy));
  };

  /* ════════════════════════════════════════════════════════════════
     PANELS
  ════════════════════════════════════════════════════════════════ */

  const renderLayers = () => (
    <aside className="absolute left-3 top-16 bottom-16 w-56 z-30 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl flex flex-col overflow-hidden">
      <div className="h-9 px-3 flex items-center justify-between border-b border-border/40 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
          Layers
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {els.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {els.length === 0 && (
          <p className="p-3 text-[11px] text-muted-foreground">
            Nothing here yet. Elements you add will be listed here, top layer
            first.
          </p>
        )}
        {[...els].reverse().map((e) => {
          const Icon = TYPE_ICON[e.type];
          const on = selected.includes(e.id);
          return (
            <div
              key={e.id}
              onClick={(ev) =>
                setSel(
                  ev.shiftKey || ev.metaKey || ev.ctrlKey
                    ? on
                      ? selected.filter((i) => i !== e.id)
                      : [...selected, e.id]
                    : [e.id],
                )
              }
              onDoubleClick={() => setRenamingId(e.id)}
              className={`group flex items-center gap-1.5 pl-2 pr-1 h-8 rounded cursor-pointer text-[11px] ${on ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary"} ${e.hidden ? "opacity-50" : ""}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {renamingId === e.id ? (
                <input
                  autoFocus
                  defaultValue={e.name}
                  onClick={(ev) => ev.stopPropagation()}
                  onBlur={(ev) => {
                    patchOne(e.id, { name: ev.target.value.trim() || e.name });
                    setRenamingId(null);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === "Escape")
                      (ev.target as HTMLInputElement).blur();
                    ev.stopPropagation();
                  }}
                  className="flex-1 min-w-0 h-6 px-1 bg-background border border-primary rounded text-[11px] text-foreground focus:outline-none"
                />
              ) : (
                <span className="flex-1 truncate">
                  {e.type === "text" && e.text ? e.text.split("\n")[0] : e.name}
                </span>
              )}
              <button
                aria-label={e.locked ? "Unlock" : "Lock"}
                onClick={(ev) => {
                  ev.stopPropagation();
                  patchOne(e.id, { locked: !e.locked });
                }}
                className={`p-1 rounded hover:bg-background ${e.locked ? "" : "opacity-0 group-hover:opacity-100"}`}
              >
                {e.locked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </button>
              <button
                aria-label={e.hidden ? "Show" : "Hide"}
                onClick={(ev) => {
                  ev.stopPropagation();
                  patchOne(e.id, { hidden: !e.hidden });
                }}
                className={`p-1 rounded hover:bg-background ${e.hidden ? "" : "opacity-0 group-hover:opacity-100"}`}
              >
                {e.hidden ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );

  const renderDesign = () => {
    if (!selEls.length)
      return (
        <div className="space-y-3">
          <Section title="Canvas">
            <ColorField label="Background" value={bg} onChange={setBg} />
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={grid}
                onChange={(e) => setGrid(e.target.checked)}
                className="accent-primary"
              />
              <Grid3x3 className="h-3.5 w-3.5" /> Show grid
            </label>
          </Section>
          <Section title="New frame">
            <div className="grid grid-cols-2 gap-1.5">
              {FRAME_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => addFrame(p.w, p.h, p.label)}
                  className={`${optBtn(false)} text-left leading-tight`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              A frame is a named artboard. Export each frame as its own file, or
              all of them as a ZIP.
            </p>
          </Section>
          <Section title="Shortcuts">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              V select · H pan · R rect · O ellipse · A arrow · T text · F frame
              · I import. Space-drag pans, Ctrl/⌘-scroll zooms, Shift+1 fits
              all, Shift+2 fits selection. Double-click an image to crop.
              Alt-drag duplicates. Hold Ctrl/⌘ to turn off snapping.
            </p>
          </Section>
          <button
            disabled={!els.length}
            onClick={() => {
              checkpoint();
              setAll([]);
              setSel([]);
              setCrop(null);
            }}
            className="w-full py-2 rounded border border-rose-500/50 text-rose-500 text-[10px] font-black hover:bg-rose-500/10 disabled:opacity-40"
          >
            Clear canvas (undoable)
          </button>
        </div>
      );

    const allLocked = selEls.every((e) => e.locked);
    const types = new Set(selEls.map((e) => e.type));
    const isImg = types.has("image");
    const isShape = selEls.some(
      (e) => e.type === "rect" || e.type === "ellipse",
    );
    const isStroked = selEls.some(
      (e) => e.type === "rect" || e.type === "ellipse" || e.type === "arrow",
    );
    const isText = types.has("text");
    const isFrame = single?.type === "frame";
    const imgs = selEls.filter((e) => e.type === "image");
    const f0 = imgs[0]?.filters ?? DEFAULT_FILTERS;

    return (
      <div className="space-y-3">
        <Section
          title={selEls.length > 1 ? `${selEls.length} selected` : single!.name}
        >
          <div className="flex flex-wrap gap-0.5">
            <IconBtn title="Duplicate (Ctrl+D)" onClick={duplicateSel}>
              <Copy className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Delete" onClick={deleteSel}>
              <Trash2 className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title={allLocked ? "Unlock" : "Lock"}
              onClick={() => patchSel({ locked: !allLocked }, "lock")}
              active={allLocked}
            >
              {allLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </IconBtn>
            <IconBtn
              title="Bring to front (Ctrl+Shift+])"
              onClick={() => reorder("front")}
            >
              <ArrowUpToLine className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="Bring forward (Ctrl+])"
              onClick={() => reorder("forward")}
            >
              <ChevronUp className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="Send backward (Ctrl+[)"
              onClick={() => reorder("backward")}
            >
              <ChevronDown className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="Send to back (Ctrl+Shift+[)"
              onClick={() => reorder("back")}
            >
              <ArrowDownToLine className="h-4 w-4" />
            </IconBtn>
          </div>
        </Section>

        {selEls.length > 1 && (
          <Section title="Align">
            <div className="flex gap-0.5">
              <IconBtn title="Align left" onClick={() => align("l")}>
                <AlignStartVertical className="h-4 w-4" />
              </IconBtn>
              <IconBtn title="Align centre" onClick={() => align("c")}>
                <AlignCenterVertical className="h-4 w-4" />
              </IconBtn>
              <IconBtn title="Align right" onClick={() => align("r")}>
                <AlignEndVertical className="h-4 w-4" />
              </IconBtn>
              <IconBtn title="Align top" onClick={() => align("t")}>
                <AlignStartHorizontal className="h-4 w-4" />
              </IconBtn>
              <IconBtn title="Align middle" onClick={() => align("m")}>
                <AlignCenterHorizontal className="h-4 w-4" />
              </IconBtn>
              <IconBtn title="Align bottom" onClick={() => align("b")}>
                <AlignEndHorizontal className="h-4 w-4" />
              </IconBtn>
            </div>
          </Section>
        )}

        {single && (
          <Section title="Transform">
            <div className="grid grid-cols-2 gap-2">
              <NumField
                label="X"
                value={single.x}
                onChange={(v) => patchSel({ x: v }, "x")}
              />
              <NumField
                label="Y"
                value={single.y}
                onChange={(v) => patchSel({ y: v }, "y")}
              />
              {single.type !== "text" && (
                <>
                  <NumField
                    label="Width"
                    value={single.w}
                    min={1}
                    onChange={(v) => setDims("w", v)}
                  />
                  <NumField
                    label="Height"
                    value={single.h}
                    min={1}
                    onChange={(v) => setDims("h", v)}
                  />
                </>
              )}
              {single.type !== "frame" && (
                <NumField
                  label="Rotation °"
                  value={((single.rotation * 180) / Math.PI) % 360}
                  onChange={(v) =>
                    patchSel(
                      { rotation: (((v % 360) + 360) % 360) * (Math.PI / 180) },
                      "rotation",
                    )
                  }
                />
              )}
            </div>
            {single.type !== "text" && (
              <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={ratioLock}
                  onChange={(e) => setRatioLock(e.target.checked)}
                  className="accent-primary"
                />
                Lock aspect ratio
              </label>
            )}
            {single.type !== "frame" && (
              <div className="flex gap-0.5">
                <IconBtn title="Rotate 90° left" onClick={() => rotate90(-1)}>
                  <RotateCcw className="h-4 w-4" />
                </IconBtn>
                <IconBtn title="Rotate 90° right" onClick={() => rotate90(1)}>
                  <RotateCw className="h-4 w-4" />
                </IconBtn>
                {single.type !== "text" && (
                  <>
                    <IconBtn
                      title="Flip horizontal"
                      active={single.flipX}
                      onClick={() =>
                        patchSel({ flipX: !single.flipX }, "flipx")
                      }
                    >
                      <FlipHorizontal className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      title="Flip vertical"
                      active={single.flipY}
                      onClick={() =>
                        patchSel({ flipY: !single.flipY }, "flipy")
                      }
                    >
                      <FlipVertical className="h-4 w-4" />
                    </IconBtn>
                  </>
                )}
              </div>
            )}
          </Section>
        )}

        <Section title="Appearance">
          <Slide
            label="Opacity"
            value={Math.round((single?.opacity ?? selEls[0].opacity) * 100)}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => patchSel({ opacity: v / 100 })}
          />
          {isFrame && (
            <ColorField
              label="Fill"
              value={single!.fill}
              onChange={(v) => patchSel({ fill: v })}
              allowNone
            />
          )}
          {isShape && (
            <ColorField
              label="Fill"
              value={
                selEls.find((e) => e.type === "rect" || e.type === "ellipse")!
                  .fill
              }
              onChange={(v) => patchSel({ fill: v })}
              allowNone
            />
          )}
          {isStroked && (
            <>
              <ColorField
                label="Stroke"
                value={
                  selEls.find(
                    (e) =>
                      e.type !== "image" &&
                      e.type !== "text" &&
                      e.type !== "frame",
                  )!.stroke
                }
                onChange={(v) => patchSel({ stroke: v })}
                allowNone
              />
              <Slide
                label="Stroke width"
                value={
                  selEls.find(
                    (e) =>
                      e.type !== "image" &&
                      e.type !== "text" &&
                      e.type !== "frame",
                  )!.strokeWidth
                }
                min={0}
                max={24}
                onChange={(v) => patchSel({ strokeWidth: v })}
                unit="px"
              />
            </>
          )}
          {(single?.type === "rect" || isImg) && (
            <Slide
              label="Corner radius"
              value={single?.radius ?? 0}
              min={0}
              max={Math.max(
                40,
                Math.min(single?.w ?? 200, single?.h ?? 200) / 2,
              )}
              onChange={(v) => patchSel({ radius: v })}
              unit="px"
            />
          )}
          {isText && (
            <>
              <ColorField
                label="Colour"
                value={selEls.find((e) => e.type === "text")!.stroke}
                onChange={(v) => patchSel({ stroke: v })}
              />
              <Slide
                label="Font size"
                value={selEls.find((e) => e.type === "text")!.fontSize}
                min={8}
                max={240}
                onChange={(v) => patchSel({ fontSize: Math.round(v) })}
                unit="px"
              />
              <div className="grid grid-cols-3 gap-1">
                {(["sans", "serif", "mono"] as FontKey[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => patchSel({ fontFamily: f })}
                    style={{ fontFamily: FONTS[f] }}
                    className={optBtn(
                      selEls.find((e) => e.type === "text")!.fontFamily === f,
                    )}
                  >
                    {f === "sans" ? "Sans" : f === "serif" ? "Serif" : "Mono"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Double-click text (or press Enter) to edit it.
              </p>
            </>
          )}
        </Section>

        {isFrame && (
          <Section title="Frame size">
            <input
              value={single!.name}
              onChange={(e) => patchOne(single!.id, { name: e.target.value })}
              className={`${inputCls} !text-left`}
              aria-label="Frame name"
            />
            <div className="grid grid-cols-2 gap-1.5">
              {FRAME_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => resizeFrameTo(p.w, p.h, p.label)}
                  className={`${optBtn(single!.w === p.w && single!.h === p.h)} text-left leading-tight`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {isImg && (
          <>
            <Section title="Crop">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  disabled={!single}
                  onClick={() => single && setCrop(single.id)}
                  className={`${optBtn(!!cropId)} flex items-center justify-center gap-1.5 disabled:opacity-40`}
                >
                  <Crop className="h-3.5 w-3.5" />{" "}
                  {cropId ? "Cropping…" : "Crop"}
                </button>
                <button
                  disabled={
                    !single || (single.crop.w === 1 && single.crop.h === 1)
                  }
                  onClick={() =>
                    single && patchOne(single.id, resetCrop(single))
                  }
                  className={`${optBtn(false)} disabled:opacity-40`}
                >
                  Reset crop
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Non-destructive: drag the edges to crop, drag inside to
                reposition the image. Enter or Esc to finish.
              </p>
            </Section>
            <Section title="Filters">
              <Slide
                label="Brightness"
                value={f0.brightness}
                min={0}
                max={200}
                unit="%"
                onChange={(v) => patchFilters({ brightness: v })}
              />
              <Slide
                label="Contrast"
                value={f0.contrast}
                min={0}
                max={200}
                unit="%"
                onChange={(v) => patchFilters({ contrast: v })}
              />
              <Slide
                label="Saturation"
                value={f0.saturate}
                min={0}
                max={200}
                unit="%"
                onChange={(v) => patchFilters({ saturate: v })}
              />
              <Slide
                label="Grayscale"
                value={f0.grayscale}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => patchFilters({ grayscale: v })}
              />
              <Slide
                label="Blur"
                value={f0.blur}
                min={0}
                max={40}
                step={0.5}
                unit="px"
                onChange={(v) => patchFilters({ blur: v })}
              />
              <button
                onClick={() => patchFilters(DEFAULT_FILTERS)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Reset filters
              </button>
            </Section>
          </>
        )}
      </div>
    );
  };

  const renderExport = () => {
    const resolved = resolveScope();
    const dims = firstJob
      ? `${Math.round(firstJob.rect.w * previewScale)} × ${Math.round(firstJob.rect.h * previewScale)} px`
      : "—";
    const scaleOpts: (number | "native")[] = [
      0.5,
      1,
      2,
      3,
      ...(hasImages ? (["native"] as const) : []),
    ];
    return (
      <div className="space-y-3">
        <Section title="What to export">
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                ["auto", "Auto"],
                ["selection", "Selection"],
                ["frames", "Frames"],
                ["all", "Everything"],
              ] as [ExportScope, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                disabled={
                  (v === "selection" && !selected.length) ||
                  (v === "frames" && !frames.length)
                }
                onClick={() => setExScope(v)}
                className={`${optBtn(exScope === v)} disabled:opacity-40`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {exScope === "auto"
              ? `Auto picks ${resolved === "selection" ? "your selection" : resolved === "frames" ? "your frames" : "the whole canvas"}. `
              : ""}
            {jobs.length > 1
              ? `${jobs.length} files, delivered as a ZIP.`
              : jobs.length === 1
                ? `Output: ${dims}`
                : "Nothing to export yet."}
          </p>
        </Section>

        <Section title="Scale">
          <div className="grid grid-cols-5 gap-1">
            {scaleOpts.map((s) => (
              <button
                key={String(s)}
                onClick={() => setExScale(s)}
                className={`${optBtn(exScale === s)} font-mono`}
              >
                {s === "native" ? "Orig" : `${s}x`}
              </button>
            ))}
          </div>
          {exScale === "native" && (
            <p className="text-[10px] text-muted-foreground">
              Orig exports at the image's original pixel size, so nothing is
              upscaled or thrown away.
            </p>
          )}
        </Section>

        <Section title="Format">
          <div className="flex bg-background p-1 rounded-md border border-border/40">
            {(["webp", "jpeg", "png"] as Fmt[]).map((f) => (
              <button
                key={f}
                onClick={() => setExFmt(f)}
                className={segBtn(exFmt === f)}
              >
                {f === "jpeg" ? "JPG" : f.toUpperCase()}
              </button>
            ))}
          </div>
          {exFmt !== "png" ? (
            <>
              <div className="flex bg-background p-1 rounded-md border border-border/40">
                <button
                  onClick={() => setExMode("quality")}
                  className={segBtn(exMode === "quality")}
                >
                  Quality
                </button>
                <button
                  onClick={() => setExMode("target")}
                  className={segBtn(exMode === "target")}
                >
                  Max file size
                </button>
              </div>
              {exMode === "quality" ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(QUALITY) as QualityPreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setExPreset(p)}
                      className={`p-2 rounded border text-left flex flex-col ${exPreset === p ? "border-primary bg-primary/10 text-primary" : "border-border/30 text-foreground"}`}
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
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={5}
                      value={exKb}
                      onChange={(e) => setExKb(e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-[10px] font-bold text-muted-foreground">
                      KB per file
                    </span>
                  </div>
                  {!targetValid && (
                    <p className="text-[10px] text-rose-500">
                      Enter at least 5 KB.
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Lowers quality first, then dimensions if it has to. You'll
                    be told when that happens.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              PNG is lossless. Choose WebP or JPG for much smaller files.
            </p>
          )}
          {exFmt !== "jpeg" ? (
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={exTransparent}
                onChange={(e) => setExTransparent(e.target.checked)}
                className="accent-primary"
              />
              Transparent background
            </label>
          ) : (
            <p className="text-[10px] text-amber-500 flex gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> JPG has no
              transparency. The canvas background colour is used.
            </p>
          )}
        </Section>

        <button
          onClick={runExport}
          disabled={busy || !jobs.length}
          className="w-full py-2.5 rounded bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : jobs.length > 1 ? (
            <FileArchive className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {busy
            ? "Exporting…"
            : jobs.length > 1
              ? `Export ${jobs.length} files (ZIP)`
              : "Export"}
        </button>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════
     LAYOUT
  ════════════════════════════════════════════════════════════════ */

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full min-h-[560px] overflow-hidden bg-background select-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={IMG_MIMES.join(",")}
        className="hidden"
        onChange={(e) => {
          addImageFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block outline-none"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Text editing overlay */}
      {editingEl && (
        <textarea
          ref={taRef}
          value={editingEl.text}
          spellCheck={false}
          wrap="off"
          aria-label="Edit text"
          onChange={(ev) =>
            apply((p) =>
              p.map((e) =>
                e.id === editingEl.id
                  ? fitText({ ...e, text: ev.target.value })
                  : e,
              ),
            )
          }
          onBlur={commitText}
          onKeyDown={(ev) => {
            if (
              ev.key === "Escape" ||
              (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey))
            ) {
              ev.preventDefault();
              commitText();
            }
            ev.stopPropagation();
          }}
          style={{
            position: "absolute",
            left: (editingEl.x + editingEl.w / 2) * cam.zoom + cam.x,
            top: (editingEl.y + editingEl.h / 2) * cam.zoom + cam.y,
            width: editingEl.w * cam.zoom + 6,
            height: editingEl.h * cam.zoom,
            transform: `translate(-50%, -50%) rotate(${editingEl.rotation}rad)`,
            fontSize: editingEl.fontSize * cam.zoom,
            fontFamily: FONTS[editingEl.fontFamily],
            lineHeight: LINE_H,
            color: editingEl.stroke,
            opacity: editingEl.opacity,
            padding: 0,
            margin: 0,
            border: 0,
            outline: `1px dashed ${ACCENT}`,
            outlineOffset: 3,
            background: "transparent",
            resize: "none",
            overflow: "hidden",
            whiteSpace: "pre",
            zIndex: 25,
          }}
        />
      )}

      {/* Empty state */}
      {hydrated && els.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={() => fileRef.current?.click()}
            className="pointer-events-auto max-w-sm text-center p-8 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-background/70 backdrop-blur-sm transition-colors"
          >
            <ImagePlus className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="text-sm font-black text-foreground mb-1">
              Drop images onto the canvas
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Or paste with Ctrl+V, or click to browse. Everything stays on your
              device and is saved automatically.
            </p>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 p-1 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl max-w-[calc(100%-7rem)] overflow-x-auto">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <IconBtn
              key={t.id}
              title={`${t.label} (${t.key})`}
              active={tool === t.id}
              onClick={() => setTool(t.id)}
            >
              <Icon className="h-4 w-4" />
            </IconBtn>
          );
        })}
        <div className="w-px h-5 bg-border mx-1" />
        <IconBtn
          title="Import images (I)"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </IconBtn>
      </div>

      {/* Panel toggles */}
      <div className="absolute top-3 left-3 z-40">
        <IconBtn
          title="Layers"
          active={showLayers}
          onClick={() => setShowLayers((v) => !v)}
        >
          <Layers className="h-4 w-4" />
        </IconBtn>
      </div>
      <div className="absolute top-3 right-3 z-40">
        <IconBtn
          title="Properties and export"
          active={showProps}
          onClick={() => setShowProps((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </IconBtn>
      </div>

      {showLayers && renderLayers()}

      {showProps && (
        <aside className="absolute right-3 top-16 bottom-3 w-72 max-w-[calc(100%-1.5rem)] z-30 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="p-2 border-b border-border/40 shrink-0">
            <div className="flex bg-background p-1 rounded-md border border-border/40">
              <button
                onClick={() => setPanelTab("design")}
                className={segBtn(panelTab === "design")}
              >
                Design
              </button>
              <button
                onClick={() => setPanelTab("export")}
                className={segBtn(panelTab === "export")}
              >
                Export
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {panelTab === "design" ? renderDesign() : renderExport()}
          </div>
        </aside>
      )}

      {/* Zoom / history */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-0.5 p-1 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl">
        <IconBtn
          title="Undo (Ctrl+Z)"
          disabled={!past.current.length}
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn
          title="Redo (Ctrl+Shift+Z)"
          disabled={!future.current.length}
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </IconBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <IconBtn title="Zoom out" onClick={() => zoomBy(1 / 1.2)}>
          <ZoomOut className="h-4 w-4" />
        </IconBtn>
        <button
          title="Reset to 100%"
          onClick={() => zoomAt(size.w / 2, size.h / 2, 1)}
          className="text-[11px] font-mono font-bold w-12 text-center text-foreground hover:bg-secondary rounded h-8"
        >
          {Math.round(cam.zoom * 100)}%
        </button>
        <IconBtn title="Zoom in" onClick={() => zoomBy(1.2)}>
          <ZoomIn className="h-4 w-4" />
        </IconBtn>
        <IconBtn title="Fit everything (Shift+1)" onClick={fitAll}>
          <Maximize className="h-4 w-4" />
        </IconBtn>
      </div>
    </div>
  );
}

export default ImageStudio;
