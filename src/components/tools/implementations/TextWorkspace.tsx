"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useReducer,
  useDeferredValue,
} from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  Type,
  Eraser,
  ArrowUpDown,
  FlipHorizontal,
  Replace,
  Link2,
  Table,
  GitCompare,
  Workflow,
  Search,
  Code2,
  Quote,
  Undo2,
  Redo2,
  Copy,
  Check,
  Download,
  Upload,
  ClipboardPaste,
  Trash2,
  Command,
  Maximize2,
  Minimize2,
  WrapText,
  ListOrdered,
  Minus,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ArrowLeftRight,
  Eye,
  CornerDownLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

/* ════════════════════════════════════════════════════════════════
   TOOLS
════════════════════════════════════════════════════════════════ */

type ToolId =
  | "analyze"
  | "case"
  | "clean"
  | "sort"
  | "reverse"
  | "replace"
  | "slug"
  | "struct"
  | "encode"
  | "extract"
  | "diff"
  | "pipeline"
  | "lorem";

type Icon = React.ComponentType<{ className?: string }>;

const TOOLS: {
  id: ToolId;
  label: string;
  icon: Icon;
  group: string;
  desc: string;
}[] = [
  {
    id: "analyze",
    label: "Analyze",
    icon: BarChart3,
    group: "Insights",
    desc: "Live counts, readability, keywords and length limits.",
  },
  {
    id: "diff",
    label: "Compare",
    icon: GitCompare,
    group: "Insights",
    desc: "See exactly what changed between two texts.",
  },
  {
    id: "case",
    label: "Case",
    icon: Type,
    group: "Transform",
    desc: "UPPER, lower, Title, camelCase, snake_case and more.",
  },
  {
    id: "clean",
    label: "Clean",
    icon: Eraser,
    group: "Transform",
    desc: "Tidy lines: trim, dedupe, strip junk, add prefixes or numbers.",
  },
  {
    id: "sort",
    label: "Sort",
    icon: ArrowUpDown,
    group: "Transform",
    desc: "Sort or shuffle lines.",
  },
  {
    id: "reverse",
    label: "Reverse",
    icon: FlipHorizontal,
    group: "Transform",
    desc: "Reverse text, lines, or word order.",
  },
  {
    id: "replace",
    label: "Find & Replace",
    icon: Replace,
    group: "Transform",
    desc: "Search with regex, step through matches, replace one or all.",
  },
  {
    id: "slug",
    label: "Slug",
    icon: Link2,
    group: "Convert",
    desc: "SEO-friendly URL slugs, one per line.",
  },
  {
    id: "struct",
    label: "Data",
    icon: Table,
    group: "Convert",
    desc: "Turn CSV/TSV into JSON, SQL, Markdown, HTML and more.",
  },
  {
    id: "encode",
    label: "Encode",
    icon: Code2,
    group: "Convert",
    desc: "Base64, URL, HTML entities, hex, binary, Morse, ROT13.",
  },
  {
    id: "extract",
    label: "Extract",
    icon: Search,
    group: "Convert",
    desc: "Pull emails, links, numbers, hashtags and more out of text.",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: Workflow,
    group: "Automate",
    desc: "Chain steps and run them all at once.",
  },
  {
    id: "lorem",
    label: "Generate",
    icon: Quote,
    group: "Automate",
    desc: "Placeholder text by paragraph, sentence or word.",
  },
];

const GROUPS = ["Insights", "Transform", "Convert", "Automate"];

// Tools whose output is the same text with a transformation (can target a selection)
const SCOPED = new Set<ToolId>([
  "case",
  "clean",
  "sort",
  "reverse",
  "encode",
  "pipeline",
]);
const NO_APPLY = new Set<ToolId>(["analyze", "diff"]);

function resolveTool(mode: string): ToolId {
  switch (mode) {
    case "word-counter":
    case "character-counter":
    case "count":
    case "analyze":
      return "analyze";
    case "case-converter":
    case "case":
      return "case";
    case "remove-duplicate-lines":
    case "remove-empty-lines":
    case "clean":
      return "clean";
    case "text-sorter":
    case "sort":
      return "sort";
    case "text-reverser":
    case "reverse":
      return "reverse";
    case "text-diff-checker":
    case "diff":
      return "diff";
    case "find-and-replace":
    case "replace":
      return "replace";
    case "slug-generator":
    case "slug":
      return "slug";
    case "struct":
    case "text-to-data":
      return "struct";
    case "encode":
      return "encode";
    case "extract":
      return "extract";
    case "pipeline":
      return "pipeline";
    case "lorem":
    case "generate":
      return "lorem";
    default:
      return "analyze";
  }
}

/* ════════════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════════ */

type SortMode = "alpha" | "natural" | "numeric" | "length" | "random";
type ReverseMode = "chars" | "each" | "words" | "lines";
type StructFormat = "json" | "csv" | "tsv" | "markdown" | "sql" | "html";

interface Settings {
  caseMode: string;
  // clean
  cInvisible: boolean;
  cQuotes: boolean;
  cAccents: boolean;
  cPunct: boolean;
  cCollapse: boolean;
  cTrim: boolean;
  cEmpty: boolean;
  cDedupe: boolean;
  cDedupeCase: boolean;
  cPrefix: string;
  cSuffix: string;
  cNumber: boolean;
  // sort
  sortMode: SortMode;
  sortOrder: "asc" | "desc";
  sortSeed: number;
  // reverse
  reverseMode: ReverseMode;
  // replace
  find: string;
  repl: string;
  matchCase: boolean;
  useRegex: boolean;
  wholeWord: boolean;
  // slug
  slugSep: string;
  slugLower: boolean;
  slugStop: boolean;
  slugMax: number;
  slugUnicode: boolean;
  // data
  dFormat: StructFormat;
  dDelim: string;
  dHeader: boolean;
  dInfer: boolean;
  dTable: string;
  dDialect: "mysql" | "ansi";
  // extract
  xKinds: string[];
  xUnique: boolean;
  xSort: boolean;
  // encode
  eFormat: string;
  eDir: "encode" | "decode";
  eUrlSafe: boolean;
  // lorem
  lUnit: "paragraphs" | "sentences" | "words";
  lCount: number;
  lStart: boolean;
  lSeed: number;
  // pipeline
  chain: string[];
  // diff
  diffMode: "line" | "word";
  diffIgnoreWS: boolean;
  diffIgnoreCase: boolean;
  // analyze
  keyword: string;
}

const DEFAULT_S: Settings = {
  caseMode: "title",
  cInvisible: true,
  cQuotes: false,
  cAccents: false,
  cPunct: false,
  cCollapse: true,
  cTrim: true,
  cEmpty: true,
  cDedupe: false,
  cDedupeCase: false,
  cPrefix: "",
  cSuffix: "",
  cNumber: false,
  sortMode: "natural",
  sortOrder: "asc",
  sortSeed: 1,
  reverseMode: "chars",
  find: "",
  repl: "",
  matchCase: false,
  useRegex: false,
  wholeWord: false,
  slugSep: "-",
  slugLower: true,
  slugStop: true,
  slugMax: 80,
  slugUnicode: false,
  dFormat: "json",
  dDelim: ",",
  dHeader: true,
  dInfer: true,
  dTable: "my_table",
  dDialect: "mysql",
  xKinds: ["email"],
  xUnique: true,
  xSort: false,
  eFormat: "base64",
  eDir: "encode",
  eUrlSafe: false,
  lUnit: "paragraphs",
  lCount: 3,
  lStart: true,
  lSeed: 7,
  chain: ["invisible", "trim", "empty", "dedupe", "sortAsc"],
  diffMode: "line",
  diffIgnoreWS: false,
  diffIgnoreCase: false,
  keyword: "",
};

const SAMPLES: Record<ToolId, string> = {
  analyze:
    "Comparlify is an all-in-one platform intelligence engine and developer utility suite. It helps creators evaluate software options, analyze migration costs, and compute expected ROI across platforms like Teachable, Skool, Mighty Networks, and Kajabi. Choosing the right platform can save creators thousands of dollars every year.",
  case: "the quick brown fox jumps over the lazy dog",
  clean:
    "  banana  \nApple\n\n\u201Csmart quotes\u201D here\ncherry\napple\nbanana\n\nDate   with   gaps",
  sort: "banana\nApple\ncherry\n10\n2\ndate\n1,000",
  reverse: "Hello world\nThis is a test",
  replace:
    "The cat sat on the mat. The catalog lists every cat breed.\nPrice: $5 each.",
  slug: "10 Best Tools for Creators: The Complete Guide (2026)\nCaf\u00E9 M\u00FCnster & Cr\u00EApes \u2013 Top 5 Spots",
  struct:
    'name,age,city\nAisha,28,Lahore\nBilal,34,Karachi\n"Khan, Omar",41,Islamabad',
  encode: "Hello, World! \u{1F44B} caf\u00E9",
  extract:
    "Contact sales@example.com or support@example.org. Docs: https://example.com/docs, www.example.net. Call +92 300 1234567. Tags: #growth #SaaS, thanks @comparlify! Server 192.168.1.10 on 2026-03-14.",
  diff: "Comparlify provides platform comparison tools for digital creators, educators, and developers.",
  pipeline: "  banana  \nApple\n\ncherry\napple\nbanana\nDate",
  lorem: "",
};

const DIFF_SAMPLE_B =
  "Comparlify offers platform comparison utilities for online creators, course builders, and software engineers.";

/* ════════════════════════════════════════════════════════════════
   BASIC TEXT HELPERS
════════════════════════════════════════════════════════════════ */

const splitLines = (t: string) => t.split(/\r?\n/);

/** Applies fn to lines but keeps a trailing newline at the END. */
function mapLines(text: string, fn: (lines: string[]) => string[]) {
  const trailing = /\r?\n$/.test(text);
  const body = trailing ? text.replace(/\r?\n$/, "") : text;
  const out = fn(splitLines(body)).join("\n");
  return trailing ? out + "\n" : out;
}

function countCodePoints(s: string) {
  let n = 0;
  for (const _ of s) n++;
  return n;
}

const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0e00-\u0e7f]/;

function tokenizeWords(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  if (CJK_RE.test(t) && typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new (Intl as any).Segmenter(undefined, { granularity: "word" });
    return Array.from(
      seg.segment(t) as Iterable<{ segment: string; isWordLike?: boolean }>,
    )
      .filter((s) => s.isWordLike)
      .map((s) => s.segment);
  }
  return t.split(/\s+/);
}

function splitSentences(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const m = t.match(
    /[^.!?\u3002\uFF01\uFF1F\u061F\u06D4]+(?:[.!?\u3002\uFF01\uFF1F\u061F\u06D4]+|$)/g,
  );
  return (m ?? [t]).map((s) => s.trim()).filter(Boolean);
}

function countSyllables(raw: string): number {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!w || w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|e)$/, "").replace(/^y/, "");
  const m = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

function formatDuration(words: number, wpm: number) {
  const secs = Math.round((words / wpm) * 60);
  return secs < 60 ? `${secs} sec` : `${Math.round(secs / 60)} min`;
}

function graphemes(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new (Intl as any).Segmenter(undefined, {
      granularity: "grapheme",
    });
    return Array.from(
      seg.segment(s) as Iterable<{ segment: string }>,
      (x) => x.segment,
    );
  }
  return Array.from(s);
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STOP_WORDS = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "is",
  "or",
  "an",
  "will",
  "my",
  "all",
  "would",
  "there",
  "their",
  "what",
  "are",
  "was",
  "were",
  "has",
  "had",
  "its",
  "they",
  "we",
  "can",
  "your",
  "our",
  "so",
  "if",
  "about",
  "which",
  "when",
  "who",
]);

const SLUG_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "if",
  "in",
  "into",
  "is",
  "it",
  "no",
  "not",
  "of",
  "on",
  "or",
  "such",
  "that",
  "the",
  "their",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "will",
  "with",
]);

/* ════════════════════════════════════════════════════════════════
   TRANSFORMS
════════════════════════════════════════════════════════════════ */

// Unicode-aware word splitting: keeps é, ü, Cyrillic, Arabic/Urdu, Devanagari, CJK.
const WORD_RE =
  /\p{Lu}{2,}(?=\p{Lu}\p{Ll}|(?!\p{L}))|\p{Lu}?\p{Ll}+\p{N}*|\p{Lu}+|[\p{Lo}\p{M}]+|\p{N}+/gu;

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const CASE_OPTIONS: [string, string][] = [
  ["upper", "UPPERCASE"],
  ["lower", "lowercase"],
  ["title", "Title Case"],
  ["sentence", "Sentence case"],
  ["swap", "sWAP cASE"],
  ["camel", "camelCase"],
  ["pascal", "PascalCase"],
  ["snake", "snake_case"],
  ["kebab", "kebab-case"],
  ["constant", "CONSTANT_CASE"],
  ["dot", "dot.case"],
  ["path", "path/case"],
];

function convertCase(text: string, mode: string): string {
  const perLine = (join: (w: string[]) => string) =>
    mapLines(text, (lines) =>
      lines.map((l) => join(l.normalize("NFC").match(WORD_RE) ?? [])),
    );
  switch (mode) {
    case "camel":
      return perLine((w) =>
        w.map((x, i) => (i === 0 ? x.toLowerCase() : cap(x))).join(""),
      );
    case "pascal":
      return perLine((w) => w.map(cap).join(""));
    case "snake":
      return perLine((w) => w.map((x) => x.toLowerCase()).join("_"));
    case "kebab":
      return perLine((w) => w.map((x) => x.toLowerCase()).join("-"));
    case "constant":
      return perLine((w) => w.map((x) => x.toUpperCase()).join("_"));
    case "dot":
      return perLine((w) => w.map((x) => x.toLowerCase()).join("."));
    case "path":
      return perLine((w) => w.map((x) => x.toLowerCase()).join("/"));
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "swap":
      return Array.from(text, (c) =>
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(),
      ).join("");
    case "title":
      return text
        .toLowerCase()
        .replace(
          /(^|[\s\-("\u201C[])(\p{L})/gu,
          (_, p, c) => p + c.toUpperCase(),
        );
    case "sentence":
      return text
        .toLowerCase()
        .replace(
          /(^|[.!?]\s+|\n\s*)(\p{Ll})/gu,
          (_, p, c) => p + c.toUpperCase(),
        );
    default:
      return text;
  }
}

function dedupeLines(
  lines: string[],
  caseSensitive: boolean,
  ignoreOuterSpace: boolean,
) {
  const seen = new Set<string>();
  return lines.filter((line) => {
    if (line.trim() === "") return true; // blank lines are not "duplicates"
    let key = ignoreOuterSpace ? line.trim() : line;
    if (!caseSensitive) key = key.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const removeInvisible = (t: string) =>
  t
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/[\u00A0\u2007\u202F]/g, " ");

const straightenQuotes = (t: string) =>
  t
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"');

const SPECIAL_LETTERS: Record<string, string> = {
  "\u00DF": "ss",
  "\u00E6": "ae",
  "\u00C6": "AE",
  "\u00F8": "o",
  "\u00D8": "O",
  "\u0142": "l",
  "\u0141": "L",
  "\u0111": "d",
  "\u0110": "D",
  "\u0153": "oe",
  "\u0152": "OE",
};

function stripAccents(t: string) {
  return t
    .normalize("NFD")
    .replace(/([A-Za-z])[\u0300-\u036f]+/g, "$1")
    .normalize("NFC")
    .replace(
      /[\u00DF\u00E6\u00C6\u00F8\u00D8\u0142\u0141\u0111\u0110\u0153\u0152]/g,
      (c) => SPECIAL_LETTERS[c] ?? c,
    );
}

const stripPunct = (t: string) => t.replace(/[^\p{L}\p{M}\p{N}\s]/gu, "");

function cleanText(t: string, s: Settings): string {
  let r = t;
  if (s.cInvisible) r = removeInvisible(r);
  if (s.cQuotes) r = straightenQuotes(r);
  if (s.cAccents) r = stripAccents(r);
  if (s.cPunct) r = stripPunct(r);
  return mapLines(r, (lines) => {
    let L = lines;
    if (s.cCollapse) L = L.map((x) => x.replace(/[ \t]{2,}/g, " "));
    if (s.cTrim) L = L.map((x) => x.trim());
    if (s.cEmpty) L = L.filter((x) => x.trim() !== "");
    if (s.cDedupe) L = dedupeLines(L, s.cDedupeCase, true);
    if (s.cPrefix || s.cSuffix)
      L = L.map((x) => (x.trim() === "" ? x : s.cPrefix + x + s.cSuffix));
    if (s.cNumber) {
      const w = String(L.filter((x) => x.trim() !== "").length).length;
      let n = 0;
      L = L.map((x) =>
        x.trim() === "" ? x : `${String(++n).padStart(w, " ")}. ${x}`,
      );
    }
    return L;
  });
}

function sortLines(
  text: string,
  mode: Exclude<SortMode, "random">,
  order: "asc" | "desc",
) {
  const dir = order === "asc" ? 1 : -1;
  const num = (x: string) => parseFloat(x.trim().replace(/,/g, ""));
  return mapLines(text, (lines) =>
    [...lines].sort((a, b) => {
      if (mode === "numeric") {
        const na = num(a);
        const nb = num(b);
        const aN = Number.isNaN(na);
        const bN = Number.isNaN(nb);
        if (aN && bN) return a.localeCompare(b);
        if (aN) return 1; // non-numbers always last
        if (bN) return -1;
        return (na - nb) * dir;
      }
      if (mode === "length")
        return (a.length - b.length) * dir || a.localeCompare(b);
      if (mode === "natural")
        return (
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          }) * dir
        );
      return a.localeCompare(b) * dir;
    }),
  );
}

function shuffleLines(text: string, seed: number) {
  return mapLines(text, (lines) => {
    const a = [...lines];
    const r = rng(seed);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
}

function reverseText(text: string, mode: ReverseMode) {
  if (mode === "chars") return graphemes(text).reverse().join("");
  if (mode === "lines") return mapLines(text, (l) => [...l].reverse());
  if (mode === "each")
    return mapLines(text, (l) => l.map((x) => graphemes(x).reverse().join("")));
  return mapLines(text, (lines) =>
    lines.map((line) => {
      const m = line.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
      const parts = m[2].split(/(\s+)/);
      const words = parts.filter((_, i) => i % 2 === 0).reverse();
      return (
        m[1] +
        parts.map((p, i) => (i % 2 === 0 ? words[i / 2] : p)).join("") +
        m[3]
      );
    }),
  );
}

function buildRegex(
  search: string,
  o: { matchCase: boolean; useRegex: boolean; wholeWord: boolean },
) {
  const base = o.useRegex
    ? search
    : search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = "g" + (o.matchCase ? "" : "i") + (o.useRegex ? "m" : "");
  if (o.wholeWord) {
    try {
      return new RegExp(
        `(?<![\\p{L}\\p{N}_])(?:${base})(?![\\p{L}\\p{N}_])`,
        flags + "u",
      );
    } catch {
      return new RegExp(`\\b(?:${base})\\b`, flags);
    }
  }
  return new RegExp(base, flags);
}

function collectMatches(text: string, s: Settings, cap = 20000) {
  if (!s.find) return [];
  const re = buildRegex(s.find, s);
  const out: { i: number; len: number }[] = [];
  for (const m of text.matchAll(re)) {
    if (m[0].length === 0) continue;
    out.push({ i: m.index ?? 0, len: m[0].length });
    if (out.length >= cap) break;
  }
  return out;
}

const REGEX_PRESETS: [string, string][] = [
  ["", "Presets…"],
  ["\\s{2,}", "Extra spaces"],
  ["<[^>]+>", "HTML tags"],
  ["\\d+", "Numbers"],
  ["[\\w.+-]+@[\\w-]+\\.[\\w.]+", "Emails"],
  ["https?://\\S+", "URLs"],
  ["^\\s+|\\s+$", "Leading/trailing space"],
  ["^$\\n", "Empty lines"],
];

interface SlugOptions {
  sep: string;
  lowercase: boolean;
  stopWords: boolean;
  maxLength: number;
  keepUnicode: boolean;
}

function slugify(input: string, o: SlugOptions): string {
  let s = input.normalize("NFC");
  if (o.lowercase) s = s.toLowerCase();
  if (o.keepUnicode) s = s.replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, "");
  else s = stripAccents(s).replace(/[^a-zA-Z0-9\s_-]/g, "");
  let tokens = s.split(/[\s_-]+/).filter(Boolean);
  if (o.stopWords) {
    const kept = tokens.filter((t) => !SLUG_STOP_WORDS.has(t.toLowerCase()));
    if (kept.length > 0) tokens = kept;
  }
  const full = tokens.join(o.sep);
  const max = Math.max(1, o.maxLength);
  if (full.length <= max) return full;
  let out = full.slice(0, max);
  if (o.sep) {
    if (full.charAt(max) !== o.sep) {
      const cut = out.lastIndexOf(o.sep);
      if (cut > 0) out = out.slice(0, cut);
    }
    while (out.endsWith(o.sep)) out = out.slice(0, -o.sep.length);
  }
  return out;
}

/* ── Data conversion ───────────────────────────────────────────── */

function parseDelimited(input: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += c;
    } else if (c === '"' && cell.trim() === "") {
      cell = "";
      inQuotes = true;
    } else if (c === delim) {
      row.push(cell.trim());
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const NUM_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const isSafeNumber = (v: string) =>
  NUM_RE.test(v) && v.replace(/[-.]/g, "").length <= 15;

function inferValue(v: string): string | number | boolean {
  if (isSafeNumber(v)) return Number(v);
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

const escHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function buildStructured(rows: string[][], s: Settings): string {
  if (rows.length === 0) return "";
  const cols = Math.max(...rows.map((r) => r.length));
  const used = new Map<string, number>();
  const headers = Array.from({ length: cols }, (_, i) => {
    const raw = s.dHeader ? (rows[0][i] ?? "").trim() : "";
    const base = raw || `col_${i + 1}`;
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n === 0 ? base : `${base}_${n + 1}`;
  });
  const body = s.dHeader ? rows.slice(1) : rows;
  const cell = (r: string[], i: number) => r[i] ?? "";
  const fmt = s.dFormat;

  if (fmt === "json") {
    if (!s.dHeader)
      return JSON.stringify(
        body.map((r) =>
          headers.map((_, i) =>
            s.dInfer ? inferValue(cell(r, i)) : cell(r, i),
          ),
        ),
        null,
        2,
      );
    return JSON.stringify(
      body.map((r) => {
        const obj: Record<string, string | number | boolean> = {};
        headers.forEach((h, i) => {
          obj[h] = s.dInfer ? inferValue(cell(r, i)) : cell(r, i);
        });
        return obj;
      }),
      null,
      2,
    );
  }

  if (fmt === "markdown") {
    const esc = (c: string) =>
      c.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
    const line = (cells: string[]) => `| ${cells.map(esc).join(" | ")} |`;
    return [
      line(headers),
      `| ${headers.map(() => "---").join(" | ")} |`,
      ...body.map((r) => line(headers.map((_, i) => cell(r, i)))),
    ].join("\n");
  }

  if (fmt === "html") {
    const tr = (cells: string[], tag: string) =>
      `    <tr>${cells.map((c) => `<${tag}>${escHtml(c)}</${tag}>`).join("")}</tr>`;
    return [
      "<table>",
      "  <thead>",
      tr(headers, "th"),
      "  </thead>",
      "  <tbody>",
      ...body.map((r) =>
        tr(
          headers.map((_, i) => cell(r, i)),
          "td",
        ),
      ),
      "  </tbody>",
      "</table>",
    ].join("\n");
  }

  if (fmt === "sql") {
    const q = (id: string) =>
      s.dDialect === "mysql" ? `\`${id}\`` : `"${id}"`;
    const ident = (x: string, fb: string) =>
      x
        .trim()
        .replace(/[^\p{L}\p{N}_]+/gu, "_")
        .replace(/^_+|_+$/g, "") || fb;
    const table = ident(s.dTable, "table_name");
    const colNames = headers.map((h, i) => q(ident(h, `col_${i + 1}`)));
    const val = (v: string) => {
      if (v === "") return "NULL";
      if (isSafeNumber(v)) return v;
      let e = v.replace(/'/g, "''");
      if (s.dDialect === "mysql") e = e.replace(/\\/g, "\\\\");
      return `'${e}'`;
    };
    if (body.length === 0) return "";
    const values = body
      .map((r) => `(${headers.map((_, i) => val(cell(r, i))).join(", ")})`)
      .join(",\n  ");
    return `INSERT INTO ${q(table)} (${colNames.join(", ")})\nVALUES\n  ${values};`;
  }

  const all = s.dHeader ? [headers, ...body] : body;
  if (fmt === "tsv")
    return all
      .map((r) =>
        headers.map((_, i) => cell(r, i).replace(/[\t\r\n]+/g, " ")).join("\t"),
      )
      .join("\n");
  const csvCell = (c: string) =>
    /[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c;
  return all
    .map((r) => headers.map((_, i) => csvCell(cell(r, i))).join(","))
    .join("\n");
}

/* ── Encoding ──────────────────────────────────────────────────── */

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  euro: "\u20AC",
  pound: "\u00A3",
  yen: "\u00A5",
  cent: "\u00A2",
  deg: "\u00B0",
  plusmn: "\u00B1",
  times: "\u00D7",
  divide: "\u00F7",
  laquo: "\u00AB",
  raquo: "\u00BB",
  bull: "\u2022",
  middot: "\u00B7",
  sect: "\u00A7",
  para: "\u00B6",
  hearts: "\u2665",
};

const MORSE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};
const MORSE_REV = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
);

const toBytes = (t: string) => new TextEncoder().encode(t);
function fromBytes(b: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(b);
  } catch {
    throw new Error("The decoded bytes aren't valid UTF-8 text.");
  }
}

/**
 * Returns an array where each entry is the visual line number shown on
 * that row of the textarea, or 0 for "continuation row" (blank in gutter).
 * Accounts for soft-wrap by measuring each logical line in an off-screen
 * mirror with identical width / font / tab-size.
 */
function computeVisualLineNumbers(
  ta: HTMLTextAreaElement,
  value: string,
): number[] {
  const lines = value.split("\n");
  if (lines.length === 0) return [];

  const cs = window.getComputedStyle(ta);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const width = ta.clientWidth - padL - padR;
  if (width <= 0) return lines.map((_, i) => i + 1);

  const mirror = document.createElement("div");
  mirror.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "pointer-events:none",
    "top:-99999px",
    "left:-99999px",
    `width:${width}px`,
    "white-space:pre-wrap",
    "overflow-wrap:break-word",
    "word-break:normal",
    `font-family:${cs.fontFamily}`,
    `font-size:${cs.fontSize}`,
    `font-weight:${cs.fontWeight}`,
    `font-style:${cs.fontStyle}`,
    `letter-spacing:${cs.letterSpacing}`,
    `line-height:${cs.lineHeight}`,
    `tab-size:${cs.tabSize}`,
  ].join(";");
  document.body.appendChild(mirror);

  const lineHeightPx =
    parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6;
  const out: number[] = [];
  let counter = 0;

  for (const line of lines) {
    // \u00a0 keeps empty lines 1 row tall (0 would measure 0px)
    mirror.textContent = line === "" ? "\u00a0" : line;
    const h = mirror.getBoundingClientRect().height;
    const rows = Math.max(1, Math.round(h / lineHeightPx));
    counter++;
    out.push(counter);
    for (let i = 1; i < rows; i++) out.push(0);
  }

  document.body.removeChild(mirror);
  return out;
}

function encodeText(t: string, s: Settings): string {
  const enc = s.eDir === "encode";
  switch (s.eFormat) {
    case "base64": {
      if (enc) {
        const bytes = toBytes(t);
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000)
          bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        const b64 = btoa(bin);
        return s.eUrlSafe
          ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
          : b64;
      }
      let b = t.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
      if (b.length % 4 === 1) throw new Error("This isn't valid Base64.");
      if (b.length % 4) b += "=".repeat(4 - (b.length % 4));
      let bin: string;
      try {
        bin = atob(b);
      } catch {
        throw new Error("This isn't valid Base64.");
      }
      return fromBytes(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    }
    case "url":
      if (enc) return encodeURIComponent(t);
      try {
        return decodeURIComponent(t);
      } catch {
        throw new Error("This isn't valid URL encoding.");
      }
    case "html":
      if (enc) return escHtml(t);
      return t.replace(
        /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi,
        (m, g: string) => {
          if (g[0] === "#") {
            const cp =
              g[1].toLowerCase() === "x"
                ? parseInt(g.slice(2), 16)
                : parseInt(g.slice(1), 10);
            return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
          }
          return HTML_ENTITIES[g.toLowerCase()] ?? m;
        },
      );
    case "hex": {
      if (enc)
        return Array.from(toBytes(t), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join(" ");
      const h = t.replace(/\\x|0x/gi, "").replace(/[\s,:-]/g, "");
      if (!/^[0-9a-f]*$/i.test(h) || h.length % 2)
        throw new Error("This isn't valid hex.");
      const bytes = new Uint8Array(h.length / 2);
      for (let i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(h.substr(i * 2, 2), 16);
      return fromBytes(bytes);
    }
    case "binary": {
      if (enc)
        return Array.from(toBytes(t), (b) =>
          b.toString(2).padStart(8, "0"),
        ).join(" ");
      const b = t.replace(/\s+/g, "");
      if (!/^[01]*$/.test(b) || b.length % 8)
        throw new Error("Binary must be groups of 8 bits (0 and 1).");
      const bytes = new Uint8Array(b.length / 8);
      for (let i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(b.substr(i * 8, 8), 2);
      return fromBytes(bytes);
    }
    case "rot13":
      return t.replace(/[a-z]/gi, (c) => {
        const base = c <= "Z" ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
    case "unicode":
      if (enc)
        return Array.from(t, (c) => {
          const cp = c.codePointAt(0)!;
          if (cp < 128) return c;
          return cp > 0xffff
            ? `\\u{${cp.toString(16)}}`
            : `\\u${cp.toString(16).padStart(4, "0")}`;
        }).join("");
      return t.replace(
        /\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})/gi,
        (m, a?: string, b?: string) => {
          const cp = parseInt((a ?? b) as string, 16);
          return cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
        },
      );
    case "morse":
      if (enc)
        return mapLines(t, (lines) =>
          lines.map((line) =>
            line
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .map((w) =>
                Array.from(w.toUpperCase())
                  .map((ch) => MORSE[ch])
                  .filter(Boolean)
                  .join(" "),
              )
              .filter(Boolean)
              .join(" / "),
          ),
        );
      return mapLines(t, (lines) =>
        lines.map((line) =>
          line
            .replace(/[\u2022\u00B7]/g, ".")
            .replace(/[\u2212\u2013\u2014]/g, "-")
            .trim()
            .split(/\s*\/\s*|\s{3,}/)
            .map((w) =>
              w
                .split(/\s+/)
                .filter(Boolean)
                .map((code) => MORSE_REV[code] ?? "?")
                .join(""),
            )
            .join(" "),
        ),
      );
    default:
      return t;
  }
}

const ENCODE_FORMATS: [string, string][] = [
  ["base64", "Base64"],
  ["url", "URL"],
  ["html", "HTML entities"],
  ["hex", "Hex"],
  ["binary", "Binary"],
  ["morse", "Morse code"],
  ["rot13", "ROT13"],
  ["unicode", "Unicode escapes"],
];

/* ── Extract ───────────────────────────────────────────────────── */

const EXTRACTORS: Record<
  string,
  {
    label: string;
    re: RegExp;
    clean?: (m: string) => string | null;
    skip?: (text: string, idx: number) => boolean;
  }
> = {
  email: {
    label: "Emails",
    re: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/gu,
  },
  url: {
    label: "Links",
    re: /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi,
    clean: (m) => m.replace(/[.,;:!?)\]}'"]+$/, ""),
  },
  phone: {
    label: "Phones",
    re: /\+?\d[\d\s().-]{6,}\d/g,
    clean: (m) => {
      const d = m.replace(/\D/g, "");
      return d.length >= 8 && d.length <= 15 ? m.trim() : null;
    },
  },
  number: { label: "Numbers", re: /-?\d[\d,]*(?:\.\d+)?/g },
  hashtag: { label: "#Hashtags", re: /#[\p{L}\p{N}_]+/gu },
  mention: {
    label: "@Mentions",
    re: /@[\p{L}\p{N}_]{2,}/gu,
    skip: (text, idx) => idx > 0 && /[\p{L}\p{N}_.]/u.test(text[idx - 1]),
  },
  date: {
    label: "Dates",
    re: /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g,
  },
  ip: {
    label: "IPv4",
    re: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  },
  color: { label: "Hex colors", re: /#(?:[0-9a-fA-F]{3}){1,2}\b/g },
};

function extractItems(
  text: string,
  kinds: string[],
  unique: boolean,
  sort: boolean,
) {
  const meta: Record<string, number> = {};
  let all: string[] = [];
  for (const k of kinds) {
    const ex = EXTRACTORS[k];
    if (!ex) continue;
    let n = 0;
    for (const m of text.matchAll(ex.re)) {
      if (ex.skip?.(text, m.index ?? 0)) continue;
      let v: string | null = m[0];
      if (ex.clean) v = ex.clean(v);
      if (!v) continue;
      all.push(v);
      n++;
      if (all.length > 200000) break;
    }
    meta[k] = n;
  }
  if (unique) {
    const seen = new Set<string>();
    all = all.filter((v) => {
      const key = v.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (sort)
    all.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );
  return { out: all.join("\n"), meta, total: all.length };
}

/* ── Lorem ─────────────────────────────────────────────────────── */

const LOREM =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

function loremText(
  unit: Settings["lUnit"],
  countRaw: number,
  start: boolean,
  seed: number,
) {
  const r = rng(seed);
  const pick = () => LOREM[Math.floor(r() * LOREM.length)];
  const sentence = (first: boolean) => {
    if (first && start)
      return "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    const n = 6 + Math.floor(r() * 9);
    const w = Array.from({ length: n }, pick);
    if (n > 8) w[Math.floor(n / 2)] += ",";
    const t = w.join(" ");
    return t.charAt(0).toUpperCase() + t.slice(1) + ".";
  };
  if (unit === "words") {
    const count = Math.min(2000, Math.max(1, countRaw));
    const words = start ? ["lorem", "ipsum", "dolor", "sit", "amet"] : [];
    while (words.length < count) words.push(pick());
    return words.slice(0, count).join(" ");
  }
  if (unit === "sentences") {
    const count = Math.min(300, Math.max(1, countRaw));
    return Array.from({ length: count }, (_, i) => sentence(i === 0)).join(" ");
  }
  const count = Math.min(50, Math.max(1, countRaw));
  return Array.from({ length: count }, (_, p) => {
    const n = 3 + Math.floor(r() * 4);
    return Array.from({ length: n }, (_, i) =>
      sentence(p === 0 && i === 0),
    ).join(" ");
  }).join("\n\n");
}

/* ── Pipeline ──────────────────────────────────────────────────── */

const PIPELINE_STEPS: Record<
  string,
  { label: string; run: (t: string) => string }
> = {
  invisible: { label: "Remove invisible chars", run: removeInvisible },
  quotes: { label: "Straighten quotes", run: straightenQuotes },
  accents: { label: "Remove accents", run: stripAccents },
  punct: { label: "Remove punctuation", run: stripPunct },
  trim: {
    label: "Trim lines",
    run: (t) => mapLines(t, (l) => l.map((x) => x.trim())),
  },
  collapse: {
    label: "Collapse spaces",
    run: (t) => mapLines(t, (l) => l.map((x) => x.replace(/[ \t]{2,}/g, " "))),
  },
  empty: {
    label: "Remove empty lines",
    run: (t) => mapLines(t, (l) => l.filter((x) => x.trim() !== "")),
  },
  dedupe: {
    label: "Remove duplicates",
    run: (t) => mapLines(t, (l) => dedupeLines(l, false, true)),
  },
  sortAsc: { label: "Sort A→Z", run: (t) => sortLines(t, "natural", "asc") },
  sortDesc: { label: "Sort Z→A", run: (t) => sortLines(t, "natural", "desc") },
  reverse: { label: "Reverse line order", run: (t) => reverseText(t, "lines") },
  lower: { label: "lowercase", run: (t) => t.toLowerCase() },
  upper: { label: "UPPERCASE", run: (t) => t.toUpperCase() },
  titleCase: { label: "Title Case", run: (t) => convertCase(t, "title") },
  numberLines: {
    label: "Number lines",
    run: (t) =>
      mapLines(t, (l) => {
        let n = 0;
        return l.map((x) => (x.trim() === "" ? x : `${++n}. ${x}`));
      }),
  },
  slug: {
    label: "Slugify each line",
    run: (t) =>
      mapLines(t, (l) =>
        l.map((x) =>
          slugify(x, {
            sep: "-",
            lowercase: true,
            stopWords: false,
            maxLength: 200,
            keepUnicode: false,
          }),
        ),
      ),
  },
};

const PIPELINE_PRESETS: { label: string; chain: string[] }[] = [
  {
    label: "Clean list",
    chain: ["invisible", "trim", "collapse", "empty", "dedupe", "sortAsc"],
  },
  { label: "Slug list", chain: ["trim", "empty", "dedupe", "slug"] },
  {
    label: "Tidy paragraph",
    chain: ["invisible", "quotes", "collapse", "trim"],
  },
  {
    label: "Keyword list",
    chain: ["lower", "punct", "empty", "dedupe", "sortAsc"],
  },
];

/* ── Diff ──────────────────────────────────────────────────────── */

interface DiffOp {
  type: "same" | "added" | "removed";
  value: string;
}

const MAX_DIFF_CELLS = 9_000_000;

function diffSeq(
  a: string[],
  b: string[],
  key: (x: string) => string,
): { ops: DiffOp[]; tooLarge: boolean } {
  const ka = a.map(key);
  const kb = b.map(key);
  let p = 0;
  while (p < ka.length && p < kb.length && ka[p] === kb[p]) p++;
  let sa = ka.length;
  let sb = kb.length;
  while (sa > p && sb > p && ka[sa - 1] === kb[sb - 1]) {
    sa--;
    sb--;
  }
  const head: DiffOp[] = [];
  for (let i = 0; i < p; i++) head.push({ type: "same", value: b[i] });
  const tail: DiffOp[] = [];
  for (let i = sa; i < ka.length; i++)
    tail.push({ type: "same", value: b[sb + (i - sa)] });

  const ma = a.slice(p, sa);
  const mb = b.slice(p, sb);
  const xa = ka.slice(p, sa);
  const xb = kb.slice(p, sb);
  const n = ma.length;
  const m = mb.length;

  if ((n + 1) * (m + 1) > MAX_DIFF_CELLS) {
    return {
      ops: [
        ...head,
        ...ma.map((v): DiffOp => ({ type: "removed", value: v })),
        ...mb.map((v): DiffOp => ({ type: "added", value: v })),
        ...tail,
      ],
      tooLarge: true,
    };
  }

  const W = m + 1;
  const dp = new Uint32Array((n + 1) * W);
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i * W + j] =
        xa[i - 1] === xb[j - 1]
          ? dp[(i - 1) * W + j - 1] + 1
          : Math.max(dp[(i - 1) * W + j], dp[i * W + j - 1]);

  const mid: DiffOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && xa[i - 1] === xb[j - 1]) {
      mid.push({ type: "same", value: mb[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i * W + j - 1] >= dp[(i - 1) * W + j])) {
      mid.push({ type: "added", value: mb[j - 1] });
      j--;
    } else {
      mid.push({ type: "removed", value: ma[i - 1] });
      i--;
    }
  }
  mid.reverse();
  return { ops: [...head, ...mid, ...tail], tooLarge: false };
}

/* ════════════════════════════════════════════════════════════════
   RESULT COMPUTATION
════════════════════════════════════════════════════════════════ */

interface Result {
  out: string;
  error?: string;
  note?: string;
  count?: number;
  meta?: Record<string, number>;
}

function compute(
  tool: ToolId,
  text: string,
  s: Settings,
  scope: { a: number; b: number } | null,
): Result {
  const inPlace = (fn: (t: string) => string) =>
    scope
      ? text.slice(0, scope.a) +
        fn(text.slice(scope.a, scope.b)) +
        text.slice(scope.b)
      : fn(text);
  try {
    switch (tool) {
      case "case":
        return { out: inPlace((t) => convertCase(t, s.caseMode)) };
      case "clean":
        return { out: inPlace((t) => cleanText(t, s)) };
      case "sort":
        return {
          out: inPlace((t) =>
            s.sortMode === "random"
              ? shuffleLines(t, s.sortSeed)
              : sortLines(t, s.sortMode, s.sortOrder),
          ),
        };
      case "reverse":
        return { out: inPlace((t) => reverseText(t, s.reverseMode)) };
      case "encode":
        return { out: inPlace((t) => encodeText(t, s)) };
      case "pipeline":
        return {
          out: inPlace((t) =>
            s.chain.reduce((acc, id) => PIPELINE_STEPS[id]?.run(acc) ?? acc, t),
          ),
        };
      case "replace": {
        if (!s.find) return { out: text, count: 0 };
        const re = buildRegex(s.find, s);
        let count = 0;
        for (const m of text.matchAll(re)) {
          if (m[0].length === 0) continue;
          if (++count >= 100000) break;
        }
        const out = s.useRegex
          ? text.replace(re, s.repl)
          : text.replace(re, () => s.repl);
        return { out, count };
      }
      case "slug": {
        if (!text.trim()) return { out: "" };
        const opts: SlugOptions = {
          sep: s.slugSep,
          lowercase: s.slugLower,
          stopWords: s.slugStop,
          maxLength: s.slugMax,
          keepUnicode: s.slugUnicode,
        };
        const out = splitLines(text)
          .filter((l) => l.trim())
          .map((l) => slugify(l, opts))
          .join("\n");
        return {
          out,
          note:
            !out.replace(/\n/g, "") && text.trim()
              ? 'Nothing is left after removing unsupported characters. For non-Latin text, turn on "Keep non-Latin letters".'
              : undefined,
        };
      }
      case "struct":
        return {
          out: text.trim()
            ? buildStructured(parseDelimited(text, s.dDelim), s)
            : "",
        };
      case "extract": {
        const r = extractItems(text, s.xKinds, s.xUnique, s.xSort);
        return {
          out: r.out,
          count: r.total,
          meta: r.meta,
          note: text.trim() && r.total === 0 ? "No matches found." : undefined,
        };
      }
      case "lorem":
        return { out: loremText(s.lUnit, s.lCount, s.lStart, s.lSeed) };
      default:
        return { out: "" };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    return {
      out: "",
      error: tool === "replace" ? `Invalid pattern: ${msg}` : msg,
    };
  }
}

/* ════════════════════════════════════════════════════════════════
   SMALL UI PIECES
════════════════════════════════════════════════════════════════ */

const iconBtn =
  "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed";
const miniBtn =
  "px-2 py-1 rounded-md border border-border/40 bg-background hover:bg-secondary text-[11px] font-bold text-foreground inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const primaryBtn =
  "px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center gap-1 hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed";
const inputCls =
  "h-7 w-full px-2 bg-background border border-border/40 rounded-md text-[11px] font-mono text-foreground focus:outline-none focus:border-primary";
const labelCls =
  "text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1";

function Splitter({
  dir,
  onDrag,
}: {
  dir: "v" | "h"; // v = vertical line, drags horizontally; h = horizontal line, drags vertically
  onDrag: (delta: number) => void;
}) {
  const [active, setActive] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(true);
    let lastX = e.clientX;
    let lastY = e.clientY;

    const onMove = (ev: PointerEvent) => {
      const d = dir === "v" ? ev.clientX - lastX : ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;
      if (d !== 0) onDrag(d);
    };
    const onUp = () => {
      setActive(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.body.style.cursor = dir === "v" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 24 : 6;
    let delta = 0;
    if (dir === "v" && e.key === "ArrowLeft") delta = -step;
    else if (dir === "v" && e.key === "ArrowRight") delta = step;
    else if (dir === "h" && e.key === "ArrowUp") delta = -step;
    else if (dir === "h" && e.key === "ArrowDown") delta = step;
    if (delta !== 0) {
      e.preventDefault();
      onDrag(delta);
    }
  };

  return (
    <div
      role="separator"
      aria-orientation={dir === "v" ? "vertical" : "horizontal"}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={`shrink-0 touch-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 ${
        dir === "v" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
      } ${active ? "bg-primary" : "bg-border/50 hover:bg-primary/60"}`}
    />
  );
}

function Tip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6} className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function Seg({
  value,
  options,
  onChange,
  cols,
}: {
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`py-1 px-1.5 rounded-md border text-[10px] font-bold transition-all truncate ${
            value === v
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Opt({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded accent-primary"
      />
      {label}
    </label>
  );
}

function EditorPane({
  value,
  onChange,
  readOnly,
  taRef,
  wrap,
  lineNumbers,
  fontSize,
  placeholder,
  ariaLabel,
  onSelect,
  onDropFile,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  taRef?: React.Ref<HTMLTextAreaElement>;
  wrap: boolean;
  lineNumbers: boolean;
  fontSize: number;
  placeholder?: string;
  ariaLabel: string;
  onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onDropFile?: (f: File) => void;
}) {
  const gutterRef = useRef<HTMLPreElement>(null);
  const localTaRef = useRef<HTMLTextAreaElement | null>(null);

  // Combined ref — callers may pass their own taRef (e.g. mainRef)
  const setTaRef = (el: HTMLTextAreaElement | null) => {
    localTaRef.current = el;
    if (!taRef) return;
    if (typeof taRef === "function") taRef(el);
    else
      (taRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
        el;
  };

  const logicalLines = useMemo(() => value.split("\n").length, [value]);
  const wantGutter = lineNumbers && logicalLines <= 50000;

  // Visual line numbers only needed when wrap is on
  const [visualNums, setVisualNums] = useState<number[]>([]);

  useEffect(() => {
    if (!wantGutter || !wrap) {
      setVisualNums([]);
      return;
    }
    const el = localTaRef.current;
    if (!el) return;

    let raf = 0;
    let ro: ResizeObserver | null = null;

    const measure = () => {
      try {
        setVisualNums(computeVisualLineNumbers(el, value));
      } catch {
        setVisualNums([]);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      ro.observe(el);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [wantGutter, wrap, value, fontSize]);

  // Prefer visual numbers (when measured); otherwise fall back to logical
  const useVisual = wrap && visualNums.length > 0;
  const gutterText = useMemo(() => {
    if (!wantGutter) return "";
    if (useVisual) {
      return visualNums.map((n) => (n === 0 ? " " : String(n))).join("\n");
    }
    return Array.from({ length: logicalLines }, (_, i) => i + 1).join("\n");
  }, [wantGutter, useVisual, visualNums, logicalLines]);

  const showGutter = wantGutter && gutterText.length > 0;
  const maxGutterNum = useVisual ? visualNums.length : logicalLines;

  return (
    <div className="flex-1 min-h-0 flex relative">
      {showGutter && (
        <pre
          ref={gutterRef}
          aria-hidden
          className="select-none text-right text-muted-foreground bg-muted/30 border-r border-border/50 overflow-hidden m-0 shrink-0 font-mono"
          style={{
            fontSize,
            lineHeight: 1.6,
            padding: "8px 8px 8px 10px",
            minWidth: `${String(maxGutterNum).length + 2}ch`,
          }}
        >
          {gutterText}
        </pre>
      )}
      <textarea
        ref={setTaRef}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onSelect={onSelect}
        onScroll={(e) => {
          if (gutterRef.current)
            gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        onDragOver={onDropFile ? (e) => e.preventDefault() : undefined}
        onDrop={
          onDropFile
            ? (e) => {
                const f = e.dataTransfer.files?.[0];
                if (f) {
                  e.preventDefault();
                  onDropFile(f);
                }
              }
            : undefined
        }
        wrap={wrap ? "soft" : "off"}
        spellCheck={false}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-full resize-none bg-transparent text-foreground outline-none font-mono"
        style={{ fontSize, lineHeight: 1.6, padding: "8px 12px", tabSize: 2 }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */

const LS_TEXT = "tw:text";
const LS_PREFS = "tw:prefs";
const MAX_OPEN_BYTES = 5 * 1024 * 1024;

const LS_SIZES = "tw:sizes";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

interface Sizes {
  railW: number;
  inspW: number;
  editorSplit: number; // % of editor row given to the input pane
  diffRatio: number; // % of the panels wrapper given to the diff pane
}

const DEFAULT_SIZES: Sizes = {
  railW: 160,
  inspW: 288,
  editorSplit: 50,
  diffRatio: 40,
};

const SIZE_LIMITS: Record<keyof Sizes, [number, number]> = {
  railW: [120, 260],
  inspW: [220, 460],
  editorSplit: [25, 75],
  diffRatio: [25, 75],
};

interface PaletteAction {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
}

export function TextWorkspace({
  defaultMode = "count",
}: {
  defaultMode?: string;
}) {
  const { toast } = useToast();

  const [tool, setTool] = useState<ToolId>(resolveTool(defaultMode));
  useEffect(() => {
    setTool(resolveTool(defaultMode));
  }, [defaultMode]);

  /* ── text + history ──────────────────────────────────────────── */

  const [text, setText] = useState("");
  const textRef = useRef("");
  textRef.current = text;
  const pastRef = useRef<string[]>([]);
  const futureRef = useRef<string[]>([]);
  const lastEditRef = useRef(0);
  const [, force] = useReducer((x: number) => x + 1, 0);

  const LS_TOOL_ORDER = "tw:toolOrder";

  const buildDefaultOrder = (): Record<string, ToolId[]> => {
    const o: Record<string, ToolId[]> = {};
    GROUPS.forEach((g) => {
      o[g] = TOOLS.filter((t) => t.group === g).map((t) => t.id);
    });
    return o;
  };

  const [toolOrder, setToolOrder] =
    useState<Record<string, ToolId[]>>(buildDefaultOrder);
  const [dragTool, setDragTool] = useState<ToolId | null>(null);
  const [dragOver, setDragOver] = useState<ToolId | null>(null);

  const moveTool = (id: ToolId, dir: -1 | 1) => {
    const def = TOOLS.find((t) => t.id === id);
    if (!def) return;
    const list = [...toolOrder[def.group]];
    const i = list.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setToolOrder({ ...toolOrder, [def.group]: list });
  };

  const setTextTracked = (next: string, mode: "type" | "commit") => {
    const cur = textRef.current;
    if (next === cur) return;
    const now = Date.now();
    if (
      mode === "commit" ||
      now - lastEditRef.current > 900 ||
      pastRef.current.length === 0
    ) {
      pastRef.current.push(cur);
      const limit = cur.length > 200_000 ? 15 : 100;
      if (pastRef.current.length > limit) pastRef.current.shift();
    }
    lastEditRef.current = mode === "commit" ? 0 : now;
    futureRef.current = [];
    textRef.current = next;
    setText(next);
    force();
  };

  const undo = () => {
    if (pastRef.current.length === 0) return;
    futureRef.current.push(textRef.current);
    const prev = pastRef.current.pop() as string;
    textRef.current = prev;
    lastEditRef.current = 0;
    setText(prev);
    force();
  };

  const redo = () => {
    if (futureRef.current.length === 0) return;
    pastRef.current.push(textRef.current);
    const nxt = futureRef.current.pop() as string;
    textRef.current = nxt;
    lastEditRef.current = 0;
    setText(nxt);
    force();
  };

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  /* ── settings & ui state ─────────────────────────────────────── */

  const [s, setS] = useState<Settings>(DEFAULT_S);
  const patch = (p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p }));

  const [diffB, setDiffB] = useState("");
  const [sel, setSel] = useState({ a: 0, b: 0 });
  const [caret, setCaret] = useState({ ln: 1, col: 1 });
  const [scopeSel, setScopeSel] = useState(true);
  const [wrap, setWrap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [fullscreen, setFullscreen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const paletteListRef = useRef<HTMLUListElement>(null);

  // Keep the highlighted item visible as paletteIdx changes (arrow keys / search)
  useEffect(() => {
    if (!palette) return;
    const list = paletteListRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${paletteIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [palette, paletteIdx, paletteQuery]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  /* ── resizable layout ────────────────────────────────────────── */

  const [sizes, setSizes] = useState<Sizes>(DEFAULT_SIZES);
  const mainColRef = useRef<HTMLDivElement>(null);
  const editorsRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SIZES);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<Sizes>;
      const next: Sizes = { ...DEFAULT_SIZES };
      for (const k of Object.keys(SIZE_LIMITS) as (keyof Sizes)[]) {
        const [lo, hi] = SIZE_LIMITS[k];
        if (typeof p[k] === "number" && Number.isFinite(p[k]))
          next[k] = clamp(p[k] as number, lo, hi);
      }
      setSizes(next);
    } catch {
      /* ignore bad storage */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_SIZES, JSON.stringify(sizes));
    } catch {
      /* ignore */
    }
  }, [hydrated, sizes]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const mainRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dText = useDeferredValue(text);
  const dB = useDeferredValue(diffB);

  /* ── persistence ─────────────────────────────────────────────── */

  useEffect(() => {
    try {
      const t = localStorage.getItem(LS_TEXT);
      if (t) {
        textRef.current = t;
        setText(t);
        toast({
          title: "Session restored",
          description: "Your last text was loaded from this browser.",
        });
      }
      const p = localStorage.getItem(LS_PREFS);
      if (p) {
        const o = JSON.parse(p);
        if (typeof o.wrap === "boolean") setWrap(o.wrap);
        if (typeof o.lineNumbers === "boolean") setLineNumbers(o.lineNumbers);
        if (typeof o.fontSize === "number")
          setFontSize(Math.min(22, Math.max(10, o.fontSize)));
        if (typeof o.scopeSel === "boolean") setScopeSel(o.scopeSel);
        if (o.s && typeof o.s === "object") {
          const merged = { ...DEFAULT_S, ...o.s, keyword: "" } as Settings;
          merged.chain = (
            Array.isArray(merged.chain) ? merged.chain : DEFAULT_S.chain
          ).filter((id: string) => id in PIPELINE_STEPS);
          merged.xKinds = (
            Array.isArray(merged.xKinds) ? merged.xKinds : DEFAULT_S.xKinds
          ).filter((k: string) => k in EXTRACTORS);
          setS(merged);
        }
      }
    } catch {
      /* storage unavailable: carry on without persistence */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_TOOL_ORDER);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const fixed: Record<string, ToolId[]> = {};
      for (const g of GROUPS) {
        const expected = TOOLS.filter((t) => t.group === g).map((t) => t.id);
        const set = new Set(expected);
        const given = Array.isArray(parsed[g]) ? (parsed[g] as string[]) : [];
        const list = given.filter((id) => set.has(id as ToolId)) as ToolId[];
        for (const id of expected) if (!list.includes(id)) list.push(id);
        fixed[g] = list;
      }
      setToolOrder(fixed);
    } catch {
      /* ignore bad storage */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_TOOL_ORDER, JSON.stringify(toolOrder));
    } catch {
      /* storage full / unavailable */
    }
  }, [hydrated, toolOrder]);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      try {
        if (text.length <= 2_000_000) {
          localStorage.setItem(LS_TEXT, text);
          setSaved(true);
        } else setSaved(false);
        localStorage.setItem(
          LS_PREFS,
          JSON.stringify({
            wrap,
            lineNumbers,
            fontSize,
            scopeSel,
            s: { ...s, keyword: "" },
          }),
        );
      } catch {
        setSaved(false);
      }
    }, 600);
    return () => clearTimeout(id);
  }, [hydrated, text, wrap, lineNumbers, fontSize, scopeSel, s]);

  /* ── selection tracking ──────────────────────────────────────── */

  const syncSel = (ta: HTMLTextAreaElement) => {
    const a = ta.selectionStart;
    const b = ta.selectionEnd;
    setSel((p) => (p.a === a && p.b === b ? p : { a, b }));
    const head = ta.value.slice(0, b);
    const ln = head.split("\n").length;
    const col = b - (head.lastIndexOf("\n") + 1) + 1;
    setCaret((p) => (p.ln === ln && p.col === col ? p : { ln, col }));
  };

  const scope = useMemo(
    () =>
      scopeSel && SCOPED.has(tool) && sel.b > sel.a
        ? { a: sel.a, b: Math.min(sel.b, dText.length) }
        : null,
    [scopeSel, tool, sel.a, sel.b, dText.length],
  );

  /* ── derived data ────────────────────────────────────────────── */

  const result = useMemo(
    () => compute(tool, dText, s, scope),
    [tool, dText, s, scope],
  );

  const wordsList = useMemo(() => tokenizeWords(dText), [dText]);
  const basic = useMemo(
    () => ({
      words: wordsList.length,
      chars: countCodePoints(dText),
      charsNoSpaces: countCodePoints(dText.replace(/\s/g, "")),
      lines: dText ? splitLines(dText).length : 0,
      sentences: splitSentences(dText).length,
      paragraphs: dText.trim()
        ? dText.split(/\n\s*\n/).filter((x) => x.trim()).length
        : 0,
      readTime: formatDuration(wordsList.length, 200),
      speakTime: formatDuration(wordsList.length, 130),
    }),
    [dText, wordsList],
  );

  const outStats = useMemo(
    () => ({
      chars: countCodePoints(result.out),
      lines: result.out ? splitLines(result.out).length : 0,
    }),
    [result.out],
  );

  const analysis = useMemo(() => {
    if (tool !== "analyze") return null;
    const sentenceList = splitSentences(dText);
    const words = wordsList.length;
    const sentences = sentenceList.length;
    const latin = wordsList.filter((w) => /[a-z]/i.test(w)).length;
    const english = words > 0 && latin / words >= 0.7;

    let flesch: number | null = null;
    let grade = "";
    if (english && sentences > 0) {
      const syll = wordsList.reduce((a, w) => a + countSyllables(w), 0);
      flesch = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            206.835 - 1.015 * (words / sentences) - 84.6 * (syll / words),
          ),
        ),
      );
      grade =
        flesch >= 80
          ? "Very easy"
          : flesch >= 60
            ? "Standard"
            : flesch >= 40
              ? "Difficult"
              : "Very complex";
    }

    const cleaned = wordsList
      .map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""))
      .filter(Boolean);
    const freq = new Map<string, number>();
    cleaned.forEach((w) => {
      if (w.length >= 3 && !STOP_WORDS.has(w))
        freq.set(w, (freq.get(w) ?? 0) + 1);
    });
    const keywords = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const bi = new Map<string, number>();
    for (let i = 0; i < cleaned.length - 1; i++) {
      const a = cleaned[i];
      const b = cleaned[i + 1];
      if (
        a.length < 3 ||
        b.length < 3 ||
        STOP_WORDS.has(a) ||
        STOP_WORDS.has(b)
      )
        continue;
      const k = `${a} ${b}`;
      bi.set(k, (bi.get(k) ?? 0) + 1);
    }
    const phrases = [...bi.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const avgWord = cleaned.length
      ? (cleaned.reduce((a, w) => a + w.length, 0) / cleaned.length).toFixed(1)
      : "0";
    const longest = sentenceList.reduce(
      (m, x) => Math.max(m, x.split(/\s+/).filter(Boolean).length),
      0,
    );

    let kwCount = 0;
    const kw = s.keyword.trim();
    if (kw) {
      const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      for (const _ of dText.matchAll(re)) kwCount++;
    }

    return {
      flesch,
      grade,
      english,
      keywords,
      phrases,
      unique: new Set(cleaned).size,
      avgWord,
      avgSentence: sentences > 0 ? (words / sentences).toFixed(1) : "0",
      longest,
      kwCount,
    };
  }, [tool, dText, wordsList, s.keyword]);

  const diffView = useMemo(() => {
    if (tool !== "diff" || (!dText && !dB)) return null;
    const norm = (x: string) => {
      let k = x;
      if (s.diffIgnoreWS) k = k.replace(/\s+/g, " ").trim();
      if (s.diffIgnoreCase) k = k.toLowerCase();
      return k;
    };
    const tokens = (x: string) =>
      x ? x.split(/(\s+)/).filter((t) => t !== "") : [];
    const a = s.diffMode === "line" ? splitLines(dText) : tokens(dText);
    const b = s.diffMode === "line" ? splitLines(dB) : tokens(dB);
    const { ops, tooLarge } = diffSeq(a, b, norm);
    const countable = (v: string) => s.diffMode === "line" || v.trim() !== "";
    let same = 0;
    let rem = 0;
    let add = 0;
    let addChars = 0;
    let remChars = 0;
    ops.forEach((o) => {
      if (o.type === "same") {
        if (countable(o.value)) same++;
      } else if (o.type === "added") {
        addChars += o.value.length;
        if (countable(o.value)) add++;
      } else {
        remChars += o.value.length;
        if (countable(o.value)) rem++;
      }
    });
    const maxLen = Math.max(same + rem, same + add);
    const exported =
      s.diffMode === "line"
        ? ops
            .map(
              (o) =>
                (o.type === "added"
                  ? "+ "
                  : o.type === "removed"
                    ? "- "
                    : "  ") + o.value,
            )
            .join("\n")
        : ops
            .map((o) =>
              o.type === "added"
                ? `{+${o.value}+}`
                : o.type === "removed"
                  ? `[-${o.value}-]`
                  : o.value,
            )
            .join("");
    return {
      ops,
      tooLarge,
      similarity: maxLen > 0 ? Math.round((same / maxLen) * 100) : 100,
      addChars,
      remChars,
      identical: ops.every((o) => o.type === "same"),
      exported,
    };
  }, [tool, dText, dB, s.diffMode, s.diffIgnoreWS, s.diffIgnoreCase]);

  /* ── actions ─────────────────────────────────────────────────── */

  const copyValue = async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("copy failed");
      } catch {
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Your browser blocked clipboard access.",
        });
        return;
      }
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  };

  const downloadValue = (content: string, filename: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const outputFilename = () => {
    if (tool === "struct")
      return `data.${{ json: "json", csv: "csv", tsv: "tsv", markdown: "md", sql: "sql", html: "html" }[s.dFormat]}`;
    if (tool === "slug") return "slugs.txt";
    if (tool === "extract") return "extracted.txt";
    return "output.txt";
  };

  const copyOutput = () => {
    if (tool === "diff") copyValue(diffView?.exported ?? "", "out");
    else if (tool === "analyze") copyValue(textRef.current, "out");
    else copyValue(result.out, "out");
  };

  const applyOutput = () => {
    if (NO_APPLY.has(tool)) return;
    // Recompute from the freshest text so Apply never uses stale data.
    const sc =
      scopeSel && SCOPED.has(tool) && sel.b > sel.a
        ? { a: sel.a, b: Math.min(sel.b, textRef.current.length) }
        : null;
    const r = compute(tool, textRef.current, s, sc);
    if (r.error) {
      toast({
        variant: "destructive",
        title: "Can't apply",
        description: r.error,
      });
      return;
    }
    if (r.out === textRef.current) {
      toast({
        title: "No changes",
        description: "The output matches your input.",
      });
      return;
    }
    setTextTracked(r.out, "commit");
    setSel({ a: 0, b: 0 });
    toast({ title: "Applied to input", description: "Press Ctrl+Z to undo." });
  };

  const showChanges = () => {
    setDiffB(result.out);
    setTool("diff");
  };

  const clearAll = () => {
    if (tool === "diff") {
      setDiffB("");
      if (textRef.current) setTextTracked("", "commit");
      return;
    }
    if (!textRef.current) return;
    setTextTracked("", "commit");
    toast({ title: "Cleared", description: "Press Ctrl+Z to bring it back." });
  };

  const loadSample = () => {
    if (tool === "diff") {
      setTextTracked(SAMPLES.diff, "commit");
      setDiffB(DIFF_SAMPLE_B);
      patch({ diffMode: "word" });
      return;
    }
    setTextTracked(SAMPLES[tool] || SAMPLES.analyze, "commit");
  };

  const openFile = async (f: File) => {
    if (f.size > MAX_OPEN_BYTES) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "The limit is 5 MB.",
      });
      return;
    }
    try {
      const t = await f.text();
      if (t.includes("\u0000")) {
        toast({
          variant: "destructive",
          title: "Not a text file",
          description: "This looks like a binary file.",
        });
        return;
      }
      setTextTracked(t, "commit");
      toast({
        title: `Opened ${f.name}`,
        description: `${t.length.toLocaleString()} characters loaded.`,
      });
    } catch {
      toast({ variant: "destructive", title: "Couldn't read that file" });
    }
  };

  const pasteClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (!t) {
        toast({ title: "Clipboard is empty" });
        return;
      }
      setTextTracked(t, "commit");
    } catch {
      toast({
        variant: "destructive",
        title: "Paste blocked",
        description: "Click the editor and press Ctrl+V instead.",
      });
    }
  };

  const swapDiff = () => {
    const b = diffB;
    setDiffB(textRef.current);
    setTextTracked(b, "commit");
  };

  /* find & replace navigation */

  const selectMatch = (m: { i: number; len: number }) => {
    const ta = mainRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(m.i, m.i + m.len);
    const line = textRef.current.slice(0, m.i).split("\n").length - 1;
    ta.scrollTop = Math.max(0, line * fontSize * 1.6 - ta.clientHeight / 2);
    syncSel(ta);
  };

  const gotoMatch = (dir: 1 | -1) => {
    const ta = mainRef.current;
    if (!ta || !s.find) return;
    let ms: { i: number; len: number }[];
    try {
      ms = collectMatches(textRef.current, s);
    } catch {
      return;
    }
    if (ms.length === 0) {
      toast({ title: "No matches" });
      return;
    }
    const hasSel = ta.selectionEnd > ta.selectionStart;
    const from = ta.selectionStart;
    let idx: number;
    if (dir === 1) {
      idx = ms.findIndex((m) => (hasSel ? m.i > from : m.i >= from));
      if (idx < 0) idx = 0;
    } else {
      idx = -1;
      for (let i = ms.length - 1; i >= 0; i--) {
        if (ms[i].i < from) {
          idx = i;
          break;
        }
      }
      if (idx < 0) idx = ms.length - 1;
    }
    selectMatch(ms[idx]);
  };

  const replaceCurrent = () => {
    const ta = mainRef.current;
    if (!ta || !s.find) return;
    const a = ta.selectionStart;
    const b = ta.selectionEnd;
    let ms: { i: number; len: number }[];
    try {
      ms = collectMatches(textRef.current, s);
    } catch {
      return;
    }
    const m = ms.find((x) => x.i === a && x.len === b - a);
    if (!m) {
      gotoMatch(1);
      return;
    }
    const cur = textRef.current;
    let rep = s.repl;
    if (s.useRegex) {
      const re = buildRegex(s.find, s);
      const single = new RegExp(re.source, re.flags.replace("g", ""));
      rep = cur.slice(a, b).replace(single, s.repl);
    }
    setTextTracked(cur.slice(0, a) + rep + cur.slice(b), "commit");
    requestAnimationFrame(() => {
      const t2 = mainRef.current;
      if (!t2) return;
      t2.setSelectionRange(a + rep.length, a + rep.length);
      gotoMatch(1);
    });
  };

  /* pipeline chain editing */

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= s.chain.length) return;
    const n = [...s.chain];
    [n[i], n[j]] = [n[j], n[i]];
    patch({ chain: n });
  };

  const toggleLineNumbers = () => {
    setLineNumbers((v) => !v);
  };

  /* ── command palette ─────────────────────────────────────────── */

  const actions: PaletteAction[] = [
    ...TOOLS.map((t) => ({
      id: `tool-${t.id}`,
      label: `Open ${t.label}`,
      group: "Tools",
      hint: t.desc,
      run: () => setTool(t.id),
    })),
    { id: "undo", label: "Undo", group: "Edit", hint: "Ctrl+Z", run: undo },
    { id: "redo", label: "Redo", group: "Edit", hint: "Ctrl+Y", run: redo },
    {
      id: "copy",
      label: "Copy output",
      group: "Output",
      hint: "Alt+C",
      run: copyOutput,
    },
    {
      id: "apply",
      label: "Apply output to input",
      group: "Output",
      hint: "Ctrl+Enter",
      run: applyOutput,
    },
    {
      id: "dl",
      label: "Download output",
      group: "Output",
      run: () =>
        downloadValue(
          tool === "diff"
            ? (diffView?.exported ?? "")
            : tool === "analyze"
              ? textRef.current
              : result.out,
          tool === "analyze"
            ? "text.txt"
            : tool === "diff"
              ? "diff.txt"
              : outputFilename(),
        ),
    },
    {
      id: "changes",
      label: "Show changes (compare input vs output)",
      group: "Output",
      run: showChanges,
    },
    {
      id: "open",
      label: "Open file…",
      group: "File",
      run: () => fileRef.current?.click(),
    },
    {
      id: "paste",
      label: "Paste from clipboard",
      group: "File",
      run: pasteClipboard,
    },
    { id: "sample", label: "Load sample text", group: "File", run: loadSample },
    { id: "clear", label: "Clear text", group: "File", run: clearAll },
    {
      id: "wrap",
      label: wrap ? "Turn word wrap off" : "Turn word wrap on",
      group: "View",
      run: () => setWrap((v) => !v),
    },
    {
      id: "ln",
      label: lineNumbers ? "Hide line numbers" : "Show line numbers",
      group: "View",
      run: toggleLineNumbers,
    },
    {
      id: "fplus",
      label: "Increase font size",
      group: "View",
      run: () => setFontSize((f) => Math.min(22, f + 1)),
    },
    {
      id: "fminus",
      label: "Decrease font size",
      group: "View",
      run: () => setFontSize((f) => Math.max(10, f - 1)),
    },
    {
      id: "full",
      label: fullscreen ? "Exit full screen" : "Full screen",
      group: "View",
      run: () => setFullscreen((v) => !v),
    },
  ];

  // Rebuilt when the palette opens, so the action closures always see fresh state.
  const filteredActions = useMemo(() => {
    const words = paletteQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return actions.filter((a) => {
      const hay = `${a.label} ${a.group}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteQuery, palette, wrap, lineNumbers, fullscreen, tool]);

  const closePalette = () => {
    setPalette(false);
    setPaletteQuery("");
    setPaletteIdx(0);
    setTimeout(() => mainRef.current?.focus(), 0);
  };

  const runPaletteAction = (a?: PaletteAction) => {
    if (!a) return;
    closePalette();
    setTimeout(a.run, 0);
  };

  const onRootKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    const target = e.target as HTMLElement;
    const isMain = target === mainRef.current;
    const inOtherField =
      !isMain &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT");

    if (mod && k === "k") {
      e.preventDefault();
      setPalette(true);
      return;
    }
    if (mod && k === "enter") {
      e.preventDefault();
      applyOutput();
      return;
    }
    if (mod && !e.shiftKey && k === "z" && !inOtherField) {
      e.preventDefault();
      undo();
      return;
    }
    if (mod && (k === "y" || (e.shiftKey && k === "z")) && !inOtherField) {
      e.preventDefault();
      redo();
      return;
    }
    if (e.altKey && e.code === "KeyC") {
      e.preventDefault();
      copyOutput();
      return;
    }

    if (
      e.altKey &&
      e.shiftKey &&
      (e.key === "ArrowUp" || e.key === "ArrowDown")
    ) {
      e.preventDefault();
      moveTool(tool, e.key === "ArrowUp" ? -1 : 1);
      return;
    }

    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const flat = GROUPS.flatMap((g) => toolOrder[g]);
      const i = flat.indexOf(tool);
      if (i === -1) return;
      const n =
        (i + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % flat.length;
      setTool(flat[n]);
      return;
    }
    if (e.key === "Escape" && fullscreen && !palette) setFullscreen(false);
  };

  /* ════════════════════════════════════════════════════════════════
     RENDER PIECES
  ════════════════════════════════════════════════════════════════ */

  const activeTool = TOOLS.find((t) => t.id === tool)!;
  const ToolIcon = activeTool.icon;
  const canApplyNow =
    !NO_APPLY.has(tool) && !result.error && result.out !== text;

  const renderDiff = () => {
    if (!diffView)
      return (
        <p className="p-4 text-xs text-muted-foreground italic">
          Type or paste the original on the left and the modified text on the
          right.
        </p>
      );
    const { ops } = diffView;
    return (
      <div className="p-3 font-mono text-xs sm:text-[13px] space-y-2">
        {diffView.tooLarge && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex gap-1.5 font-sans">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            These texts are too large and too different to match precisely, so
            the changed middle part is shown as one replaced block.
          </p>
        )}
        {diffView.identical && (
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-sans">
            The two texts are identical.
          </p>
        )}
        {s.diffMode === "word" ? (
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {ops.map((o, i) =>
              o.type === "added" ? (
                <span
                  key={i}
                  className="bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 rounded px-0.5"
                >
                  {o.value}
                </span>
              ) : o.type === "removed" ? (
                <span
                  key={i}
                  className="bg-rose-500/25 text-rose-700 dark:text-rose-300 line-through rounded px-0.5"
                >
                  {o.value}
                </span>
              ) : (
                <span key={i}>{o.value}</span>
              ),
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {ops.map((o, i) => {
              const body = o.value === "" ? "\u00A0" : o.value;
              if (o.type === "added")
                return (
                  <div
                    key={i}
                    className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border-l-4 border-emerald-500 whitespace-pre-wrap break-words"
                  >
                    + {body}
                  </div>
                );
              if (o.type === "removed")
                return (
                  <div
                    key={i}
                    className="bg-rose-500/20 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border-l-4 border-rose-500 whitespace-pre-wrap break-words"
                  >
                    − {body}
                  </div>
                );
              return (
                <div
                  key={i}
                  className="text-muted-foreground px-2 py-0.5 whitespace-pre-wrap break-words"
                >
                  {body}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAnalyze = () => {
    const cards: [string, string | number][] = [
      ["Words", basic.words],
      ["Characters", basic.chars],
      ["No spaces", basic.charsNoSpaces],
      ["Sentences", basic.sentences],
      ["Paragraphs", basic.paragraphs],
      ["Lines", basic.lines],
      ["Unique words", analysis?.unique ?? 0],
      ["Avg word length", analysis?.avgWord ?? "0"],
      ["Reading time", basic.readTime],
      ["Speaking time", basic.speakTime],
    ];
    const limits: [string, number][] = [
      ["X / Twitter", 280],
      ["LinkedIn post", 3000],
      ["SEO title", 60],
      ["SEO description", 160],
    ];
    const maxKw = analysis?.keywords[0]?.[1] ?? 1;
    return (
      <div className="p-3 space-y-4 overflow-y-auto h-full">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
          {cards.map(([l, v]) => (
            <div
              key={l}
              className="bg-card/60 border border-border/30 rounded-lg px-2.5 py-2"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                {l}
              </span>
              <span className="text-base font-black text-foreground font-mono">
                {v}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
              Readability
            </span>
            {analysis?.flesch != null ? (
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-foreground leading-none">
                  {analysis.flesch}
                </span>
                <span className="text-xs font-bold text-primary pb-0.5">
                  {analysis.grade}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {basic.words === 0
                  ? "Type some text to score it."
                  : "Flesch scoring works for English text only."}
              </p>
            )}
            <div className="text-[11px] font-mono text-muted-foreground">
              Avg sentence
              <b className="text-foreground">{analysis?.avgSentence ?? 0}</b>
              words · Longest
              <b className="text-foreground">{analysis?.longest ?? 0}</b>
            </div>
          </div>

          <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
              Length limits (approximate)
            </span>
            {limits.map(([n, max]) => {
              const over = basic.chars > max;
              return (
                <div key={n} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground">{n}</span>
                    <span
                      className={
                        over ? "text-rose-500" : "text-foreground font-mono"
                      }
                    >
                      {basic.chars}/{max}
                    </span>
                  </div>
                  <div className="h-1 bg-border/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${over ? "bg-rose-500" : "bg-primary"}`}
                      style={{
                        width: `${Math.min(100, (basic.chars / max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
              Top keywords
            </span>
            {!analysis || analysis.keywords.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Type some text to see keyword density.
              </p>
            ) : (
              analysis.keywords.map(([w, c]) => (
                <div key={w} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 truncate font-mono font-bold text-foreground">
                    {w}
                  </span>
                  <div className="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(c / maxKw) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 text-right font-mono text-muted-foreground">
                    {c}× ·
                    {basic.words ? ((c / basic.words) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary block">
              Repeated phrases
            </span>
            {!analysis || analysis.phrases.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No two-word phrase repeats yet.
              </p>
            ) : (
              analysis.phrases.map(([p, c]) => (
                <div key={p} className="flex justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground">
                    {p}
                  </span>
                  <span className="font-mono text-muted-foreground">{c}×</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInspector = () => {
    switch (tool) {
      case "analyze":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Track a keyword or phrase</span>
              <input
                value={s.keyword}
                onChange={(e) => patch({ keyword: e.target.value })}
                placeholder="e.g. creator platform"
                className={inputCls}
                aria-label="Keyword to track"
              />
            </div>
            {s.keyword.trim() && analysis && (
              <div className="rounded-lg border border-border/30 bg-card/60 p-2.5 text-[11px] font-mono">
                <b className="text-foreground">{analysis.kwCount}</b> occurrence
                {analysis.kwCount === 1 ? "" : "s"} ·
                <b className="text-foreground">
                  {basic.words
                    ? ((analysis.kwCount / basic.words) * 100).toFixed(2)
                    : "0"}
                  %
                </b>
                density
              </div>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Everything updates as you type. Scores use your text only and
              nothing leaves this browser.
            </p>
          </div>
        );
      case "case":
        return (
          <div className="space-y-2">
            <span className={labelCls}>Case style</span>
            <div className="grid grid-cols-2 gap-1.5">
              {CASE_OPTIONS.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => patch({ caseMode: id })}
                  className={`py-1.5 px-2 rounded-md border text-[11px] font-bold truncate transition-all ${
                    s.caseMode === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-foreground hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Programmer cases (camel, snake…) work line by line.
            </p>
          </div>
        );
      case "clean":
        return (
          <div className="space-y-2.5">
            <span className={labelCls}>Whitespace</span>
            <Opt
              label="Trim each line"
              checked={s.cTrim}
              onChange={(v) => patch({ cTrim: v })}
            />
            <Opt
              label="Collapse repeated spaces"
              checked={s.cCollapse}
              onChange={(v) => patch({ cCollapse: v })}
            />
            <Opt
              label="Remove empty lines"
              checked={s.cEmpty}
              onChange={(v) => patch({ cEmpty: v })}
            />
            <span className={`${labelCls} pt-1`}>Characters</span>
            <Opt
              label="Remove invisible characters"
              checked={s.cInvisible}
              onChange={(v) => patch({ cInvisible: v })}
            />
            <Opt
              label="Straighten smart quotes"
              checked={s.cQuotes}
              onChange={(v) => patch({ cQuotes: v })}
            />
            <Opt
              label="Remove accents (é → e)"
              checked={s.cAccents}
              onChange={(v) => patch({ cAccents: v })}
            />
            <Opt
              label="Remove punctuation"
              checked={s.cPunct}
              onChange={(v) => patch({ cPunct: v })}
            />
            <span className={`${labelCls} pt-1`}>Lines</span>
            <Opt
              label="Remove duplicate lines"
              checked={s.cDedupe}
              onChange={(v) => patch({ cDedupe: v })}
            />
            {s.cDedupe && (
              <div className="pl-5">
                <Opt
                  label="Case-sensitive"
                  checked={s.cDedupeCase}
                  onChange={(v) => patch({ cDedupeCase: v })}
                />
              </div>
            )}
            <Opt
              label="Number the lines"
              checked={s.cNumber}
              onChange={(v) => patch({ cNumber: v })}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={labelCls}>Add prefix</span>
                <input
                  value={s.cPrefix}
                  onChange={(e) => patch({ cPrefix: e.target.value })}
                  className={inputCls}
                  aria-label="Prefix"
                  placeholder="- "
                />
              </div>
              <div>
                <span className={labelCls}>Add suffix</span>
                <input
                  value={s.cSuffix}
                  onChange={(e) => patch({ cSuffix: e.target.value })}
                  className={inputCls}
                  aria-label="Suffix"
                  placeholder=","
                />
              </div>
            </div>
          </div>
        );
      case "sort":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Sort by</span>
              <Seg
                cols={2}
                value={s.sortMode}
                onChange={(v) => patch({ sortMode: v as SortMode })}
                options={[
                  ["natural", "Natural (2 < 10)"],
                  ["alpha", "A–Z"],
                  ["numeric", "Numeric"],
                  ["length", "Length"],
                  ["random", "Shuffle"],
                ]}
              />
            </div>
            {s.sortMode === "random" ? (
              <button
                onClick={() => patch({ sortSeed: s.sortSeed + 1 })}
                className={`${miniBtn} w-full justify-center`}
              >
                Shuffle again
              </button>
            ) : (
              <div>
                <span className={labelCls}>Order</span>
                <Seg
                  value={s.sortOrder}
                  onChange={(v) => patch({ sortOrder: v as "asc" | "desc" })}
                  options={[
                    ["asc", "Ascending"],
                    ["desc", "Descending"],
                  ]}
                />
              </div>
            )}
            {s.sortMode === "numeric" && (
              <p className="text-[11px] text-muted-foreground">
                Lines that aren't numbers are placed last.
              </p>
            )}
          </div>
        );
      case "reverse":
        return (
          <div className="space-y-2">
            <span className={labelCls}>Reverse</span>
            <Seg
              cols={2}
              value={s.reverseMode}
              onChange={(v) => patch({ reverseMode: v as ReverseMode })}
              options={[
                ["chars", "Whole text"],
                ["each", "Each line"],
                ["words", "Word order"],
                ["lines", "Line order"],
              ]}
            />
          </div>
        );
      case "replace":
        return (
          <div className="space-y-2.5">
            <div>
              <span className={labelCls}>Find</span>
              <input
                value={s.find}
                onChange={(e) => patch({ find: e.target.value })}
                className={inputCls}
                aria-label="Find"
                placeholder="Search for…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    gotoMatch(e.shiftKey ? -1 : 1);
                  }
                }}
              />
            </div>
            <div>
              <span className={labelCls}>Replace with</span>
              <input
                value={s.repl}
                onChange={(e) => patch({ repl: e.target.value })}
                className={inputCls}
                aria-label="Replace with"
                placeholder="Replacement…"
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <Opt
                label="Match case"
                checked={s.matchCase}
                onChange={(v) => patch({ matchCase: v })}
              />
              <Opt
                label="Whole word"
                checked={s.wholeWord}
                onChange={(v) => patch({ wholeWord: v })}
              />
              <Opt
                label="Regex"
                checked={s.useRegex}
                onChange={(v) => patch({ useRegex: v })}
              />
            </div>
            {s.useRegex && (
              <select
                value=""
                onChange={(e) =>
                  e.target.value && patch({ find: e.target.value })
                }
                className="h-7 w-full px-2 bg-background border border-border/40 rounded-md text-[11px] text-foreground"
                aria-label="Regex presets"
              >
                {REGEX_PRESETS.map(([v, l]) => (
                  <option key={l} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => gotoMatch(-1)}
                disabled={!s.find}
                className={miniBtn}
                aria-label="Previous match"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => gotoMatch(1)}
                disabled={!s.find}
                className={miniBtn}
                aria-label="Next match"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={replaceCurrent}
                disabled={!s.find}
                className={`${miniBtn} flex-1 justify-center`}
              >
                Replace this
              </button>
              <span
                className={`text-[11px] font-mono font-bold ${result.error ? "text-rose-500" : "text-muted-foreground"}`}
              >
                {s.find
                  ? result.error
                    ? "Invalid"
                    : `${result.count ?? 0}`
                  : ""}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The output shows every match replaced. Press <b>Apply</b> to
              replace all.{s.useRegex ? " Use $1, $2… for capture groups." : ""}
            </p>
          </div>
        );
      case "slug":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Separator</span>
              <Seg
                value={s.slugSep}
                onChange={(v) => patch({ slugSep: v })}
                options={[
                  ["-", "Hyphen"],
                  ["_", "Underscore"],
                  [".", "Dot"],
                ]}
              />
            </div>
            <div>
              <span className={labelCls}>Max length</span>
              <input
                type="number"
                min={10}
                max={200}
                value={s.slugMax}
                onChange={(e) =>
                  patch({
                    slugMax: Math.min(
                      200,
                      Math.max(1, parseInt(e.target.value, 10) || 80),
                    ),
                  })
                }
                className={inputCls}
                aria-label="Maximum slug length"
              />
            </div>
            <Opt
              label="Lowercase"
              checked={s.slugLower}
              onChange={(v) => patch({ slugLower: v })}
            />
            <Opt
              label="Remove filler words (the, and, of…)"
              checked={s.slugStop}
              onChange={(v) => patch({ slugStop: v })}
            />
            <Opt
              label="Keep non-Latin letters (Urdu, Arabic…)"
              checked={s.slugUnicode}
              onChange={(v) => patch({ slugUnicode: v })}
            />
            <p className="text-[11px] text-muted-foreground">
              Each line becomes its own slug.
            </p>
          </div>
        );
      case "struct":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Convert to</span>
              <Seg
                cols={3}
                value={s.dFormat}
                onChange={(v) => patch({ dFormat: v as StructFormat })}
                options={[
                  ["json", "JSON"],
                  ["csv", "CSV"],
                  ["tsv", "TSV"],
                  ["markdown", "Markdown"],
                  ["sql", "SQL"],
                  ["html", "HTML"],
                ]}
              />
            </div>
            <div>
              <span className={labelCls}>Input separator</span>
              <Seg
                cols={4}
                value={s.dDelim}
                onChange={(v) => patch({ dDelim: v })}
                options={[
                  [",", "Comma"],
                  [";", "Semi"],
                  ["\t", "Tab"],
                  ["|", "Pipe"],
                ]}
              />
            </div>
            <Opt
              label="First row is the header"
              checked={s.dHeader}
              onChange={(v) => patch({ dHeader: v })}
            />
            {s.dFormat === "json" && (
              <Opt
                label="Detect numbers and true/false"
                checked={s.dInfer}
                onChange={(v) => patch({ dInfer: v })}
              />
            )}
            {s.dFormat === "sql" && (
              <div className="space-y-2">
                <div>
                  <span className={labelCls}>Table name</span>
                  <input
                    value={s.dTable}
                    onChange={(e) => patch({ dTable: e.target.value })}
                    className={inputCls}
                    aria-label="Table name"
                  />
                </div>
                <Seg
                  value={s.dDialect}
                  onChange={(v) => patch({ dDialect: v as "mysql" | "ansi" })}
                  options={[
                    ["mysql", "MySQL"],
                    ["ansi", "Postgres/ANSI"],
                  ]}
                />
                <p className="text-[11px] text-muted-foreground">
                  Empty cells become NULL.
                </p>
              </div>
            )}
          </div>
        );
      case "encode":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Format</span>
              <select
                value={s.eFormat}
                onChange={(e) => patch({ eFormat: e.target.value })}
                className="h-7 w-full px-2 bg-background border border-border/40 rounded-md text-[11px] text-foreground"
                aria-label="Encoding format"
              >
                {ENCODE_FORMATS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {s.eFormat !== "rot13" && (
              <div>
                <span className={labelCls}>Direction</span>
                <Seg
                  value={s.eDir}
                  onChange={(v) => patch({ eDir: v as "encode" | "decode" })}
                  options={[
                    ["encode", "Encode"],
                    ["decode", "Decode"],
                  ]}
                />
              </div>
            )}
            {s.eFormat === "base64" && s.eDir === "encode" && (
              <Opt
                label="URL-safe (- and _, no padding)"
                checked={s.eUrlSafe}
                onChange={(v) => patch({ eUrlSafe: v })}
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              Fully UTF-8 safe. Select part of the text to encode only that
              part.
            </p>
          </div>
        );
      case "extract":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Find</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(EXTRACTORS).map(([k, ex]) => {
                  const on = s.xKinds.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() =>
                        patch({
                          xKinds: on
                            ? s.xKinds.filter((x) => x !== k)
                            : [...s.xKinds, k],
                        })
                      }
                      className={`px-2 py-1 rounded-md border text-[10px] font-bold transition-all ${on ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
                    >
                      {ex.label}
                      {result.meta && k in result.meta
                        ? ` · ${result.meta[k]}`
                        : ""}
                    </button>
                  );
                })}
              </div>
            </div>
            <Opt
              label="Remove duplicates"
              checked={s.xUnique}
              onChange={(v) => patch({ xUnique: v })}
            />
            <Opt
              label="Sort results"
              checked={s.xSort}
              onChange={(v) => patch({ xSort: v })}
            />
          </div>
        );
      case "diff":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Compare by</span>
              <Seg
                value={s.diffMode}
                onChange={(v) => patch({ diffMode: v as "line" | "word" })}
                options={[
                  ["line", "Line"],
                  ["word", "Word"],
                ]}
              />
            </div>
            <Opt
              label="Ignore whitespace"
              checked={s.diffIgnoreWS}
              onChange={(v) => patch({ diffIgnoreWS: v })}
            />
            <Opt
              label="Ignore case"
              checked={s.diffIgnoreCase}
              onChange={(v) => patch({ diffIgnoreCase: v })}
            />
            <button
              onClick={swapDiff}
              className={`${miniBtn} w-full justify-center`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Swap sides
            </button>
            <p className="text-[11px] text-muted-foreground">
              Tip: use "Changes" on any other tool to compare your input with
              its output.
            </p>
          </div>
        );
      case "pipeline":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {PIPELINE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => patch({ chain: p.chain })}
                    className={miniBtn}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={labelCls}>Steps (run top to bottom)</span>
              {s.chain.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Add a step below.
                </p>
              ) : (
                <ol className="space-y-1">
                  {s.chain.map((id, i) => (
                    <li
                      key={`${id}-${i}`}
                      className="flex items-center gap-1 bg-background border border-border/40 rounded-md pl-2 pr-0.5 py-0.5"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-[11px] font-bold text-foreground truncate">
                        {PIPELINE_STEPS[id]?.label}
                      </span>
                      <button
                        onClick={() => moveStep(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className={iconBtn}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveStep(i, 1)}
                        disabled={i === s.chain.length - 1}
                        aria-label="Move down"
                        className={iconBtn}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() =>
                          patch({ chain: s.chain.filter((_, k) => k !== i) })
                        }
                        aria-label="Remove step"
                        className={`${iconBtn} hover:text-rose-500`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div>
              <span className={labelCls}>Add a step</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(PIPELINE_STEPS).map(([id, st]) => (
                  <button
                    key={id}
                    onClick={() => patch({ chain: [...s.chain, id] })}
                    className="px-1.5 py-0.5 rounded border border-border/40 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 inline-flex items-center gap-0.5"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case "lorem":
        return (
          <div className="space-y-3">
            <div>
              <span className={labelCls}>Generate</span>
              <Seg
                value={s.lUnit}
                onChange={(v) => patch({ lUnit: v as Settings["lUnit"] })}
                options={[
                  ["paragraphs", "Paragraphs"],
                  ["sentences", "Sentences"],
                  ["words", "Words"],
                ]}
              />
            </div>
            <div>
              <span className={labelCls}>Amount</span>
              <input
                type="number"
                min={1}
                max={
                  s.lUnit === "words"
                    ? 2000
                    : s.lUnit === "sentences"
                      ? 300
                      : 50
                }
                value={s.lCount}
                onChange={(e) =>
                  patch({
                    lCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className={inputCls}
                aria-label="Amount"
              />
            </div>
            <Opt
              label='Start with "Lorem ipsum…"'
              checked={s.lStart}
              onChange={(v) => patch({ lStart: v })}
            />
            <button
              onClick={() => patch({ lSeed: s.lSeed + 1 })}
              className={`${miniBtn} w-full justify-center`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Regenerate
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  /* ════════════════════════════════════════════════════════════════
     LAYOUT
  ════════════════════════════════════════════════════════════════ */

  const hasSelection = sel.b > sel.a;
  const selWords =
    hasSelection && sel.b - sel.a < 200_000
      ? tokenizeWords(text.slice(sel.a, sel.b)).length
      : 0;

  const ui = (
    <div
      onKeyDown={onRootKeyDown}
      className={`flex flex-col bg-background text-foreground overflow-hidden ${
        fullscreen
          ? "fixed inset-0 z-[99999]"
          : "rounded-xl border border-border/40"
      }`}
      style={
        fullscreen
          ? { height: "100dvh", width: "100vw" }
          : { height: "100%", width: "100%", flex: 1 }


      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.csv,.tsv,.json,.log,.html,.xml,.yml,.yaml,.js,.ts,.css,.sql,text/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) openFile(f);
        }}
      />

      {/* Top bar */}
      <div className="h-10 shrink-0 flex items-center gap-1 px-2 border-b border-border/40 bg-card/50 overflow-x-auto">
        <span className="flex items-center gap-1.5 pr-2 mr-1 border-r border-border/40 text-[11px] font-black uppercase tracking-widest text-foreground shrink-0">
          <ToolIcon className="h-3.5 w-3.5 text-primary" /> {activeTool.label}
        </span>
        <Tip content="Open file">
          <button
            onClick={() => fileRef.current?.click()}
            className={iconBtn}
            aria-label="Open file"
          >
            <Upload className="h-4 w-4" />
          </button>
        </Tip>
        <Tip content="Paste from clipboard">
          <button
            onClick={pasteClipboard}
            className={iconBtn}
            aria-label="Paste from clipboard"
          >
            <ClipboardPaste className="h-4 w-4" />
          </button>
        </Tip>
        <Tip content="Load sample">
          <button
            onClick={loadSample}
            className={iconBtn}
            aria-label="Load sample"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </Tip>
        <span className="w-px h-4 bg-border/60 mx-1 shrink-0" />
        <Tip content="Undo (Ctrl+Z)">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={iconBtn}
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
        </Tip>
        <Tip content="Redo (Ctrl+Y)">
          <button
            onClick={redo}
            disabled={!canRedo}
            className={iconBtn}
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </Tip>
        <Tip content="Clear">
          <button
            onClick={clearAll}
            className={`${iconBtn} hover:text-rose-500`}
            aria-label="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Tip>
        <div className="flex-1" />
        <button
          onClick={() => setPalette(true)}
          className="shrink-0 hidden sm:flex items-center gap-2 h-7 px-2.5 rounded-md border border-border/40 bg-background text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          aria-label="Open command palette"
        >
          <Command className="h-3 w-3" /> Search actions
          <kbd className="font-mono text-[10px] px-1 rounded bg-secondary">
            Ctrl K
          </kbd>
        </button>
        <button
          onClick={() => setPalette(true)}
          className={`${iconBtn} sm:hidden`}
          aria-label="Open command palette"
        >
          <Command className="h-4 w-4" />
        </button>
        <span className="w-px h-4 bg-border/60 mx-1 shrink-0" />
        <Tip content="Word wrap">
          <button
            onClick={() => setWrap((v) => !v)}
            className={`${iconBtn} ${wrap ? "text-primary bg-primary/10" : ""}`}
            aria-label="Toggle word wrap"
          >
            <WrapText className="h-4 w-4" />
          </button>
        </Tip>
        <Tip content={lineNumbers ? "Hide line numbers" : "Show line numbers"}>
          <button
            onClick={toggleLineNumbers}
            className={`${iconBtn} ${lineNumbers ? "text-primary bg-primary/10" : ""}`}
            aria-label="Toggle line numbers"
            aria-pressed={lineNumbers}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </Tip>
        <Tip content="Smaller text">
          <button
            onClick={() => setFontSize((f) => Math.max(10, f - 1))}
            className={iconBtn}
            aria-label="Smaller text"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </Tip>
        <span className="text-[10px] font-mono text-muted-foreground w-5 text-center">
          {fontSize}
        </span>
        <Tip content="Larger text">
          <button
            onClick={() => setFontSize((f) => Math.min(22, f + 1))}
            className={iconBtn}
            aria-label="Larger text"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </Tip>
        <Tip content={fullscreen ? "Exit full screen" : "Full screen"}>
          <button
            onClick={() => setFullscreen((v) => !v)}
            className={iconBtn}
            aria-label="Toggle full screen"
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </Tip>
      </div>

      <div
        className="flex-1 min-h-0 flex"
        style={{ flexDirection: isDesktop ? "row" : "column" }}
      >
        {/* Tool rail */}
        <nav
          aria-label="Tools"
          className="shrink-0 gap-0.5 p-1.5 border-border/40 bg-card/30"
          style={{
            display: "flex",
            flexDirection: isDesktop ? "column" : "row",
            alignItems: isDesktop ? "stretch" : "center",
            width: isDesktop ? sizes.railW : "auto",
            maxWidth: "100%",
            overflowX: isDesktop ? "hidden" : "auto",
            overflowY: isDesktop ? "auto" : "hidden",
            borderBottomWidth: isDesktop ? 0 : 1,
            borderRightWidth: 0,
          }}
        >
          {GROUPS.map((g) => (
            <div
              key={g}
              className="gap-0.5 shrink-0"
              style={{
                display: "flex",
                flexDirection: isDesktop ? "column" : "row",
                alignItems: isDesktop ? "stretch" : "center",
                marginBottom: isDesktop ? 6 : 0,
              }}
            >
              {isDesktop && (
                <span className="px-2 pt-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                  {g}
                </span>
              )}
              {(toolOrder[g] ?? []).map((id) => {
                const t = TOOLS.find((x) => x.id === id)!;
                const TIcon = t.icon;
                const isDragging = dragTool === id;
                const isOver =
                  dragOver === id &&
                  dragTool !== null &&
                  TOOLS.find((x) => x.id === dragTool)?.group === g;

                return (
                  <Tip key={id} content={t.desc}>
                    <button
                      onClick={() => setTool(id)}
                      draggable
                      onDragStart={(e) => {
                        setDragTool(id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", id);
                      }}
                      onDragOver={(e) => {
                        if (!dragTool || dragTool === id) return;
                        if (TOOLS.find((x) => x.id === dragTool)?.group !== g)
                          return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOver !== id) setDragOver(id);
                      }}
                      onDragLeave={() =>
                        setDragOver((cur) => (cur === id ? null : cur))
                      }
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!dragTool || dragTool === id) {
                          setDragTool(null);
                          setDragOver(null);
                          return;
                        }
                        if (TOOLS.find((x) => x.id === dragTool)?.group !== g) {
                          setDragTool(null);
                          setDragOver(null);
                          return;
                        }
                        const list = [...toolOrder[g]];
                        const from = list.indexOf(dragTool);
                        const to = list.indexOf(id);
                        if (from >= 0 && to >= 0) {
                          list.splice(from, 1);
                          list.splice(to, 0, dragTool);
                          setToolOrder({ ...toolOrder, [g]: list });
                        }
                        setDragTool(null);
                        setDragOver(null);
                      }}
                      onDragEnd={() => {
                        setDragTool(null);
                        setDragOver(null);
                      }}
                      aria-current={tool === id}
                      className={`shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap cursor-grab active:cursor-grabbing ${
                        isDragging ? "opacity-30" : ""
                      } ${isOver ? "bg-primary/20" : ""} ${
                        tool === id
                          ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <TIcon className="h-3.5 w-3.5 shrink-0" /> {t.label}
                    </button>
                  </Tip>
                );
              })}
            </div>
          ))}
        </nav>

        {isDesktop && (
          <Splitter
            dir="v"
            onDrag={(d) =>
              setSizes((s) => ({
                ...s,
                railW: clamp(
                  s.railW + d,
                  SIZE_LIMITS.railW[0],
                  SIZE_LIMITS.railW[1],
                ),
              }))
            }
          />
        )}

        {/* Main */}
        <div ref={mainColRef} className="flex-1 min-w-0 min-h-0 flex flex-col">
          {/* Panels wrapper (editors + diff) */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Editors row */}
            <div
              ref={editorsRowRef}
              className="min-h-0"
              style={{
                display: "flex",
                flexDirection: isDesktop ? "row" : "column",
                flex:
                  tool === "diff" && isDesktop
                    ? `${100 - sizes.diffRatio} 1 0%`
                    : "1 1 0%",
              }}
            >
              {/* Input */}
              <section
                className="bg-background flex flex-col min-w-0 min-h-0 overflow-hidden"
                style={
                  isDesktop
                    ? { flex: `${sizes.editorSplit} 1 0%` }
                    : { height: 260, width: "100%", flex: "none" }
                }
              >
                <header className="h-8 shrink-0 px-3 flex items-center justify-between border-b border-border/30 bg-muted/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {tool === "diff" ? "Original" : "Input"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {basic.lines} lines · {basic.chars} chars
                  </span>
                </header>
                <EditorPane
                  taRef={mainRef}
                  value={text}
                  onChange={(v) => setTextTracked(v, "type")}
                  wrap={wrap}
                  lineNumbers={lineNumbers}
                  fontSize={fontSize}
                  ariaLabel="Text input"
                  placeholder={
                    tool === "lorem"
                      ? "Generated text appears on the right. Your input isn't needed here."
                      : "Type, paste, or drop a file here…"
                  }
                  onSelect={(e) => syncSel(e.currentTarget)}
                  onDropFile={openFile}
                />
              </section>

              {isDesktop && (
                <Splitter
                  dir="v"
                  onDrag={(d) => {
                    const w = editorsRowRef.current?.clientWidth || 800;
                    setSizes((s) => ({
                      ...s,
                      editorSplit: clamp(
                        s.editorSplit + (d / w) * 100,
                        SIZE_LIMITS.editorSplit[0],
                        SIZE_LIMITS.editorSplit[1],
                      ),
                    }));
                  }}
                />
              )}

              {/* Output / modified */}
              <section
                className="bg-background flex flex-col min-w-0 min-h-0 overflow-hidden"
                style={
                  isDesktop
                    ? { flex: `${100 - sizes.editorSplit} 1 0%` }
                    : { height: 260, width: "100%", flex: "none" }
                }
              >
                {tool === "diff" ? (
                  <>
                    <header className="h-8 shrink-0 px-3 flex items-center justify-between border-b border-border/30 bg-muted/20">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Modified
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {dB ? splitLines(dB).length : 0} lines
                      </span>
                    </header>
                    <EditorPane
                      value={diffB}
                      onChange={setDiffB}
                      wrap={wrap}
                      lineNumbers={lineNumbers}
                      fontSize={fontSize}
                      ariaLabel="Modified text"
                      placeholder="Paste the modified version here…"
                    />
                  </>
                ) : (
                  <>
                    <header className="h-8 shrink-0 px-2 flex items-center gap-1.5 border-b border-border/30 bg-muted/20 overflow-x-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1 shrink-0">
                        {tool === "analyze" ? "Insights" : "Output"}
                      </span>
                      {SCOPED.has(tool) && hasSelection && (
                        <Tip content="Toggle between the selected text and the whole text">
                          <button
                            onClick={() => setScopeSel((v) => !v)}
                            className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              scopeSel
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/40 text-muted-foreground"
                            }`}
                          >
                            {scopeSel
                              ? `Selection · ${sel.b - sel.a}`
                              : "All text"}
                          </button>
                        </Tip>
                      )}
                      <div className="flex-1" />
                      {tool !== "analyze" && (
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0 hidden sm:inline">
                          {outStats.lines} lines · {outStats.chars} chars
                        </span>
                      )}
                      {!NO_APPLY.has(tool) && (
                        <Tip content="Compare input with output">
                          <button
                            onClick={showChanges}
                            disabled={!result.out}
                            className={`${miniBtn} shrink-0`}
                          >
                            <Eye className="h-3 w-3" /> Changes
                          </button>
                        </Tip>
                      )}
                      <button
                        onClick={copyOutput}
                        disabled={tool !== "analyze" && !result.out}
                        className={`${miniBtn} shrink-0`}
                      >
                        {copiedKey === "out" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedKey === "out" ? "Copied" : "Copy"}
                      </button>
                      {tool !== "analyze" && (
                        <button
                          onClick={() =>
                            downloadValue(result.out, outputFilename())
                          }
                          disabled={!result.out}
                          className={`${miniBtn} shrink-0`}
                          aria-label="Download output"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      )}
                      {!NO_APPLY.has(tool) && (
                        <Tip content="Replace your input with this output (Ctrl+Enter)">
                          <button
                            onClick={applyOutput}
                            disabled={!canApplyNow}
                            className={`${primaryBtn} shrink-0`}
                          >
                            <CornerDownLeft className="h-3 w-3" /> Apply
                          </button>
                        </Tip>
                      )}
                    </header>
                    {result.error && (
                      <div className="px-3 py-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 border-b border-rose-500/20 flex gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {result.error}
                      </div>
                    )}
                    {result.note && !result.error && (
                      <div className="px-3 py-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border-b border-amber-500/20">
                        {result.note}
                      </div>
                    )}
                    {tool === "analyze" ? (
                      renderAnalyze()
                    ) : (
                      <EditorPane
                        value={result.out}
                        readOnly
                        wrap={wrap}
                        lineNumbers={lineNumbers}
                        fontSize={fontSize}
                        ariaLabel="Output"
                        placeholder="The result appears here instantly."
                      />
                    )}
                  </>
                )}
              </section>
            </div>

            {/* Diff splitter + panel */}
            {tool === "diff" && (
              <>
                {isDesktop && (
                  <Splitter
                    dir="h"
                    onDrag={(d) => {
                      const h = (mainColRef.current?.clientHeight ?? 600) - 24;
                      setSizes((s) => ({
                        ...s,
                        diffRatio: clamp(
                          s.diffRatio + (d / Math.max(1, h)) * 100,
                          SIZE_LIMITS.diffRatio[0],
                          SIZE_LIMITS.diffRatio[1],
                        ),
                      }));
                    }}
                  />
                )}
                <section
                  className="flex flex-col bg-background min-h-0 overflow-hidden"
                  style={{
                    flex: isDesktop ? `${sizes.diffRatio} 1 0%` : "none",
                    minHeight: isDesktop ? undefined : 220,
                    borderTopWidth: isDesktop ? 0 : 1,
                  }}
                >
                  <header className="h-8 shrink-0 px-3 flex items-center justify-between border-b border-border/30 bg-muted/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Differences
                    </span>
                    {diffView && (
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                        <span className="text-primary">
                          {diffView.similarity}% similar
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +{diffView.addChars}
                        </span>
                        <span className="text-rose-600 dark:text-rose-400">
                          −{diffView.remChars}
                        </span>
                      </div>
                    )}
                  </header>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {renderDiff()}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Status bar */}
          <footer className="h-6 shrink-0 flex items-center gap-3 px-3 border-t border-border/40 bg-card/50 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
            <span>
              Ln {caret.ln}, Col {caret.col}
            </span>
            {hasSelection && (
              <span className="text-primary">
                {sel.b - sel.a} selected{selWords ? ` · ${selWords} words` : ""}
              </span>
            )}
            <span>{basic.words} words</span>
            <span>{basic.chars} chars</span>
            <span className="hidden sm:inline">~{basic.readTime} read</span>
            <span className="flex-1" />
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Private ·
              runs in your browser
            </span>
            <span
              className={saved ? "text-emerald-600 dark:text-emerald-400" : ""}
            >
              {saved ? "Autosaved ✓" : "Not saved"}
            </span>
            <span>UTF-8</span>
          </footer>
        </div>

        {isDesktop && (
          <Splitter
            dir="v"
            onDrag={(d) =>
              setSizes((s) => ({
                ...s,
                inspW: clamp(
                  s.inspW - d,
                  SIZE_LIMITS.inspW[0],
                  SIZE_LIMITS.inspW[1],
                ),
              }))
            }
          />
        )}

        {/* Inspector */}
        <aside
          className="shrink-0 border-border/40 bg-card/30 flex flex-col min-h-0"
          style={{
            width: isDesktop ? sizes.inspW : "auto",
            maxHeight: isDesktop ? "none" : 420,
            borderTopWidth: isDesktop ? 0 : 1,
            borderLeftWidth: 0,
          }}
        >
          <header className="h-8 shrink-0 px-3 flex items-center border-b border-border/30 bg-muted/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Options
            </span>
          </header>
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {activeTool.desc}
            </p>
            {renderInspector()}
          </div>
          <div className="shrink-0 px-3 py-2 border-t border-border/30 text-[10px] text-muted-foreground leading-relaxed">
            <b className="text-foreground">Tips:</b> select text to transform
            only that part ·
            <kbd className="font-mono px-1 rounded bg-secondary">Ctrl K</kbd>
            search ·
            <kbd className="font-mono px-1 rounded bg-secondary">Ctrl ↵</kbd>
            apply ·
            <kbd className="font-mono px-1 rounded bg-secondary">Alt ↑↓</kbd>
            switch tool ·
            <kbd className="font-mono px-1 rounded bg-secondary">
              drag edges
            </kbd>
            resize
          </div>
        </aside>
      </div>

      {/* Command palette */}
      {palette && (
        <div
          className="fixed inset-0 z-[100000] flex items-start justify-center pt-[12vh] pb-4 px-2 bg-black/40 backdrop-blur-sm"
          onMouseDown={closePalette}
        >
          <div
            className="w-[min(92vw,540px)] max-h-[calc(100dvh-12vh-2rem)] flex flex-col rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={paletteQuery}
              onChange={(e) => {
                setPaletteQuery(e.target.value);
                setPaletteIdx(0);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setPaletteIdx((i) =>
                    Math.min(filteredActions.length - 1, i + 1),
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setPaletteIdx((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  runPaletteAction(filteredActions[paletteIdx]);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  closePalette();
                }
              }}
              placeholder="Type a tool or action…"
              aria-label="Command palette"
              className="w-full h-11 px-4 bg-transparent border-b border-border/40 text-sm text-foreground outline-none"
            />
            <ul
              ref={paletteListRef}
              role="listbox"
              className="flex-1 min-h-0 overflow-y-auto p-1 overscroll-contain"
            >
              {" "}
              {filteredActions.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No matching actions.
                </li>
              )}
              {filteredActions.map((a, i) => (
                <li
                  key={a.id}
                  data-idx={i}
                  role="option"
                  aria-selected={i === paletteIdx}
                  onMouseEnter={() => setPaletteIdx(i)}
                  onClick={() => runPaletteAction(a)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer text-xs ${i === paletteIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                >
                  <span className="font-bold truncate">{a.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {a.hint && a.hint.length < 14 && (
                      <kbd className="font-mono text-[10px] px-1 rounded bg-secondary">
                        {a.hint}
                      </kbd>
                    )}
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                      {a.group}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  if (fullscreen && typeof document !== "undefined")
    return createPortal(ui, document.body);
  return ui;
}
