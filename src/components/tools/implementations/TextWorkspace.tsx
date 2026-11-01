"use client";

import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
  GitCompare,
  Link2,
  Download,
  Workflow,
  BarChart3,
  Undo2,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  ArrowLeftRight,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
════════════════════════════════════════════════════════════════ */

type TabId =
  | "count"
  | "case"
  | "clean"
  | "sort"
  | "reverse"
  | "diff"
  | "replace"
  | "slug"
  | "struct"
  | "pipeline";

const TABS: { id: TabId; label: string }[] = [
  { id: "count", label: "Analyze" },
  { id: "case", label: "Case" },
  { id: "clean", label: "Clean" },
  { id: "sort", label: "Sort" },
  { id: "reverse", label: "Reverse" },
  { id: "diff", label: "Diff" },
  { id: "replace", label: "Find & Replace" },
  { id: "slug", label: "Slug" },
  { id: "struct", label: "Data" },
  { id: "pipeline", label: "Pipeline" },
];

function resolveTab(mode: string): TabId {
  switch (mode) {
    case "word-counter":
    case "character-counter":
    case "count":
      return "count";
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
    case "pipeline":
      return "pipeline";
    default:
      return "count";
  }
}

const SAMPLES: Record<TabId, string> = {
  count:
    "Comparlify is an all-in-one platform intelligence engine and developer utility suite. It helps creators evaluate software options, analyze migration costs, and compute expected ROI across platforms like Teachable, Skool, Mighty Networks, and Kajabi.",
  case: "the quick brown fox jumps over the lazy dog",
  clean: "banana\nApple\ncherry\napple\n\n  banana  \nDate\n\ncherry",
  sort: "banana\nApple\ncherry\n10\n2\ndate\n1,000",
  reverse: "Hello world\nThis is a test",
  diff: "",
  replace:
    "The cat sat on the mat. The catalog lists every cat breed.\nPrice: $5 each.",
  slug: "10 Best Tools for Creators: The Complete Guide (2026)",
  struct:
    'name,age,city\nAisha,28,Lahore\nBilal,34,Karachi\n"Khan, Omar",41,Islamabad',
  pipeline: "  banana  \nApple\n\ncherry\napple\nbanana\nDate",
};

const MAX_DIFF_CELLS = 9_000_000;
const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0e00-\u0e7f]/;

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
   PURE HELPERS
════════════════════════════════════════════════════════════════ */

const splitLines = (t: string) => t.split(/\r?\n/);

/** Applies fn to the lines but keeps a trailing newline at the END (not the top). */
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

/** Whitespace words; Intl.Segmenter for CJK/Thai where there are no spaces. */
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
  const m = t.match(/[^.!?。！？؟۔]+(?:[.!?。！？؟۔]+|$)/g);
  return (m ?? [t]).map((s) => s.trim()).filter(Boolean);
}

function countSyllables(raw: string): number {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|e)$/, "").replace(/^y/, "");
  const m = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

function formatDuration(words: number, wpm: number) {
  const secs = Math.round((words / wpm) * 60);
  if (secs < 60) return `${secs} sec`;
  return `${Math.round(secs / 60)} min`;
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

/* ── Case ─────────────────────────────────────────────────────── */

// Unicode-aware: keeps é, ü, Cyrillic, Arabic/Urdu, Devanagari, CJK intact.
const WORD_RE =
  /\p{Lu}{2,}(?=\p{Lu}\p{Ll}|(?!\p{L}))|\p{Lu}?\p{Ll}+\p{N}*|\p{Lu}+|[\p{Lo}\p{M}]+|\p{N}+/gu;

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

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
        .replace(/(^|[\s\-("“[])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
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

/* ── Clean / sort / reverse ───────────────────────────────────── */

function dedupeLines(
  lines: string[],
  caseSensitive: boolean,
  ignoreOuterSpace: boolean,
) {
  const seen = new Set<string>();
  return lines.filter((line) => {
    if (line.trim() === "") return true; // blank lines aren't "duplicates"
    let key = ignoreOuterSpace ? line.trim() : line;
    if (!caseSensitive) key = key.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type SortMode = "alpha" | "numeric" | "length" | "natural";

function sortLines(text: string, mode: SortMode, order: "asc" | "desc") {
  const dir = order === "asc" ? 1 : -1;
  const num = (s: string) => parseFloat(s.trim().replace(/,/g, ""));
  return mapLines(text, (lines) =>
    [...lines].sort((a, b) => {
      if (mode === "numeric") {
        const na = num(a);
        const nb = num(b);
        const aN = Number.isNaN(na);
        const bN = Number.isNaN(nb);
        if (aN && bN) return a.localeCompare(b);
        if (aN) return 1; // non-numbers always go last
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

type ReverseMode = "chars" | "each" | "words" | "lines";

function reverseText(text: string, mode: ReverseMode) {
  if (mode === "chars") return graphemes(text).reverse().join("");
  if (mode === "lines") return mapLines(text, (l) => [...l].reverse());
  if (mode === "each")
    return mapLines(text, (l) => l.map((x) => graphemes(x).reverse().join("")));
  // words: reverse word order inside each line, keep spacing and line structure
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

/* ── Find & replace ───────────────────────────────────────────── */

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

/* ── Slug ─────────────────────────────────────────────────────── */

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
  if (o.keepUnicode) {
    s = s.replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, "");
  } else {
    s = s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s_-]/g, "");
  }
  let tokens = s.split(/[\s_-]+/).filter(Boolean);
  if (o.stopWords) {
    const kept = tokens.filter((t) => !SLUG_STOP_WORDS.has(t.toLowerCase()));
    if (kept.length > 0) tokens = kept; // never strip everything
  }
  let out = tokens.join(o.sep);
  const max = Math.max(1, o.maxLength);
  if (out.length > max) {
    out = out.slice(0, max);
    if (o.sep) {
      const cut = out.lastIndexOf(o.sep);
      // cut back to a whole word when that doesn't throw everything away
      if (cut > 0 && tokens.join(o.sep).charAt(max) !== o.sep)
        out = out.slice(0, cut);
      while (o.sep && out.endsWith(o.sep)) out = out.slice(0, -o.sep.length);
    }
  }
  return out;
}

/* ── Diff ─────────────────────────────────────────────────────── */

interface DiffOp<T> {
  type: "same" | "added" | "removed";
  value: T;
}

function diffSeq<T>(
  a: T[],
  b: T[],
  key: (x: T) => string,
): { ops: DiffOp<T>[]; tooLarge: boolean } {
  const ka = a.map(key);
  const kb = b.map(key);

  // Trim common head/tail first: cheap, and shrinks the expensive part a lot.
  let p = 0;
  while (p < ka.length && p < kb.length && ka[p] === kb[p]) p++;
  let sa = ka.length;
  let sb = kb.length;
  while (sa > p && sb > p && ka[sa - 1] === kb[sb - 1]) {
    sa--;
    sb--;
  }

  const head: DiffOp<T>[] = [];
  for (let i = 0; i < p; i++) head.push({ type: "same", value: b[i] });
  const tail: DiffOp<T>[] = [];
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
        ...ma.map((v): DiffOp<T> => ({ type: "removed", value: v })),
        ...mb.map((v): DiffOp<T> => ({ type: "added", value: v })),
        ...tail,
      ],
      tooLarge: true,
    };
  }

  const W = m + 1;
  const dp = new Uint32Array((n + 1) * W);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i * W + j] =
        xa[i - 1] === xb[j - 1]
          ? dp[(i - 1) * W + j - 1] + 1
          : Math.max(dp[(i - 1) * W + j], dp[i * W + j - 1]);
    }
  }

  const mid: DiffOp<T>[] = [];
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

/* ── Structured data ──────────────────────────────────────────── */

type StructFormat = "json" | "csv" | "markdown" | "sql";
type Dialect = "mysql" | "ansi";

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

function buildStructured(
  rows: string[][],
  fmt: StructFormat,
  o: {
    hasHeader: boolean;
    inferTypes: boolean;
    tableName: string;
    dialect: Dialect;
  },
): string {
  if (rows.length === 0) return "";
  const cols = Math.max(...rows.map((r) => r.length));

  // headers: fill blanks, make duplicates unique
  const used = new Map<string, number>();
  const headers = Array.from({ length: cols }, (_, i) => {
    const raw = o.hasHeader ? (rows[0][i] ?? "").trim() : "";
    const base = raw || `col_${i + 1}`;
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n === 0 ? base : `${base}_${n + 1}`;
  });
  const body = o.hasHeader ? rows.slice(1) : rows;
  const cell = (r: string[], i: number) => r[i] ?? "";

  if (fmt === "json") {
    if (!o.hasHeader)
      return JSON.stringify(
        body.map((r) =>
          headers.map((_, i) =>
            o.inferTypes ? inferValue(cell(r, i)) : cell(r, i),
          ),
        ),
        null,
        2,
      );
    return JSON.stringify(
      body.map((r) => {
        const obj: Record<string, string | number | boolean> = {};
        headers.forEach((h, i) => {
          obj[h] = o.inferTypes ? inferValue(cell(r, i)) : cell(r, i);
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

  if (fmt === "sql") {
    const q = (id: string) => (o.dialect === "mysql" ? `\`${id}\`` : `"${id}"`);
    const ident = (s: string, fallback: string) =>
      s
        .trim()
        .replace(/[^\p{L}\p{N}_]+/gu, "_")
        .replace(/^_+|_+$/g, "") || fallback;
    const table = ident(o.tableName, "table_name");
    const colNames = headers.map((h, i) => q(ident(h, `col_${i + 1}`)));
    const val = (v: string) => {
      if (v === "") return "NULL";
      if (isSafeNumber(v)) return v;
      let s = v.replace(/'/g, "''");
      if (o.dialect === "mysql") s = s.replace(/\\/g, "\\\\");
      return `'${s}'`;
    };
    if (body.length === 0) return "";
    const values = body
      .map((r) => `(${headers.map((_, i) => val(cell(r, i))).join(", ")})`)
      .join(",\n  ");
    return `INSERT INTO ${q(table)} (${colNames.join(", ")})\nVALUES\n  ${values};`;
  }

  // csv (normalized to comma, quoting only when needed)
  const csvCell = (c: string) =>
    /[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c;
  const all = o.hasHeader ? [headers, ...body] : body;
  return all
    .map((r) => headers.map((_, i) => csvCell(cell(r, i))).join(","))
    .join("\n");
}

/* ── Pipeline ─────────────────────────────────────────────────── */

const PIPELINE_STEPS: Record<
  string,
  { label: string; run: (t: string) => string }
> = {
  trim: {
    label: "Trim lines",
    run: (t) => mapLines(t, (l) => l.map((x) => x.trim())),
  },
  collapse: {
    label: "Collapse spaces",
    run: (t) => mapLines(t, (l) => l.map((x) => x.replace(/[ \t]+/g, " "))),
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

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */

interface TextWorkspaceProps {
  defaultMode?: string;
}

const card =
  "bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl";
const smallLabel =
  "text-[10px] font-black uppercase tracking-widest text-muted-foreground block";
const chipBtn = (on: boolean) =>
  `py-1 px-2 rounded text-[10px] font-bold uppercase transition-all ${
    on
      ? "bg-primary text-primary-foreground"
      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
  }`;
const primaryBtn =
  "px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all disabled:opacity-50";
const secondaryBtn =
  "px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/30 active:scale-95 transition-all disabled:opacity-50";
const textInput =
  "h-8 px-2.5 bg-background/50 border border-border/30 rounded-lg text-xs font-mono text-foreground w-full";

export function TextWorkspace({ defaultMode = "count" }: TextWorkspaceProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>(resolveTab(defaultMode));
  useEffect(() => {
    setActiveTab(resolveTab(defaultMode));
  }, [defaultMode]);

  const [text, setText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Diff
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [diffMode, setDiffMode] = useState<"line" | "word">("line");
  const [diffIgnoreWS, setDiffIgnoreWS] = useState(false);
  const [diffIgnoreCase, setDiffIgnoreCase] = useState(false);

  // Replace
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  // Slug
  const [slugSep, setSlugSep] = useState("-");
  const [slugStop, setSlugStop] = useState(true);
  const [slugLower, setSlugLower] = useState(true);
  const [slugMax, setSlugMax] = useState(80);
  const [slugUnicode, setSlugUnicode] = useState(false);

  // Clean / sort / reverse
  const [dedupeCase, setDedupeCase] = useState(false);
  const [dedupeTrim, setDedupeTrim] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reverseMode, setReverseMode] = useState<ReverseMode>("chars");

  // Data
  const [structFormat, setStructFormat] = useState<StructFormat>("json");
  const [structDelim, setStructDelim] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [tableName, setTableName] = useState("my_table");
  const [dialect, setDialect] = useState<Dialect>("mysql");

  // Pipeline
  const [chain, setChain] = useState<string[]>([
    "trim",
    "empty",
    "dedupe",
    "sortAsc",
  ]);

  // Heavy work runs on a deferred copy so typing stays instant.
  const dText = useDeferredValue(text);
  const dOrig = useDeferredValue(originalText);
  const dMod = useDeferredValue(modifiedText);

  /* ── history ─────────────────────────────────────────────────── */

  const commit = (next: string, title: string, description: string) => {
    if (next === text) {
      toast({
        title: "No changes",
        description: "The text already matches this result.",
      });
      return;
    }
    setHistory((h) => [...h.slice(-19), text]);
    setText(next);
    toast({ title, description });
  };

  const undo = () => {
    if (history.length === 0) return;
    setText(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  /* ── clipboard / download ────────────────────────────────────── */

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
    toast({ title: "Copied!", description: "Copied to your clipboard." });
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
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

  /* ── stats ───────────────────────────────────────────────────── */

  const wordsList = useMemo(() => tokenizeWords(dText), [dText]);

  const basic = useMemo(() => {
    const words = wordsList.length;
    const sentences = splitSentences(dText).length;
    return {
      words,
      chars: countCodePoints(dText),
      charsNoSpaces: countCodePoints(dText.replace(/\s/g, "")),
      lines: dText ? splitLines(dText).length : 0,
      sentences,
      paragraphs: dText.trim()
        ? dText.split(/\n\s*\n/).filter((s) => s.trim()).length
        : 0,
      readTime: formatDuration(words, 200),
      speakTime: formatDuration(words, 130),
    };
  }, [dText, wordsList]);

  const analysis = useMemo(() => {
    if (activeTab !== "count") return null;
    const sentenceList = splitSentences(dText);
    const words = wordsList.length;
    const sentences = sentenceList.length;

    const latinWords = wordsList.filter((w) => /[a-z]/i.test(w)).length;
    const isEnglishLike = words > 0 && latinWords / words >= 0.7;

    let flesch: number | null = null;
    let grade = "";
    if (isEnglishLike && sentences > 0) {
      const syll = wordsList.reduce((s, w) => s + countSyllables(w), 0);
      flesch = Math.round(
        206.835 - 1.015 * (words / sentences) - 84.6 * (syll / words),
      );
      flesch = Math.max(0, Math.min(100, flesch));
      grade =
        flesch >= 80
          ? "Very easy"
          : flesch >= 60
            ? "Standard"
            : flesch >= 40
              ? "Difficult"
              : "Very complex";
    }

    const longest = sentenceList.reduce(
      (max, s) => Math.max(max, s.split(/\s+/).filter(Boolean).length),
      0,
    );

    const freq: Record<string, number> = {};
    wordsList.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      if (clean.length >= 3 && !STOP_WORDS.has(clean))
        freq[clean] = (freq[clean] || 0) + 1;
    });
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => ({
        word,
        count,
        pct: words > 0 ? ((count / words) * 100).toFixed(1) : "0",
      }));

    return {
      flesch,
      grade,
      isEnglishLike,
      longest,
      avg: sentences > 0 ? (words / sentences).toFixed(1) : "0",
      keywords,
    };
  }, [activeTab, dText, wordsList]);

  /* ── derived outputs ─────────────────────────────────────────── */

  const slugOutput = useMemo(() => {
    if (activeTab !== "slug" || !dText.trim()) return "";
    const opts: SlugOptions = {
      sep: slugSep,
      lowercase: slugLower,
      stopWords: slugStop,
      maxLength: slugMax,
      keepUnicode: slugUnicode,
    };
    return splitLines(dText)
      .filter((l) => l.trim())
      .map((l) => slugify(l, opts))
      .join("\n");
  }, [activeTab, dText, slugSep, slugLower, slugStop, slugMax, slugUnicode]);

  const structOutput = useMemo(() => {
    if (activeTab !== "struct" || !dText.trim()) return "";
    return buildStructured(parseDelimited(dText, structDelim), structFormat, {
      hasHeader,
      inferTypes,
      tableName,
      dialect,
    });
  }, [
    activeTab,
    dText,
    structDelim,
    structFormat,
    hasHeader,
    inferTypes,
    tableName,
    dialect,
  ]);

  const matchInfo = useMemo(() => {
    if (activeTab !== "replace" || !searchTerm)
      return { count: 0, error: null as string | null };
    try {
      const re = buildRegex(searchTerm, { matchCase, useRegex, wholeWord });
      let count = 0;
      for (const _ of dText.matchAll(re)) {
        count++;
        if (count >= 100000) break;
      }
      return { count, error: null as string | null };
    } catch (e: any) {
      return { count: 0, error: e?.message ?? "Invalid pattern" };
    }
  }, [activeTab, dText, searchTerm, matchCase, useRegex, wholeWord]);

  const diffResult = useMemo(() => {
    if (activeTab !== "diff") return null;
    if (!dOrig && !dMod) return null;

    const norm = (s: string) => {
      let k = s;
      if (diffIgnoreWS) k = k.replace(/\s+/g, " ").trim();
      if (diffIgnoreCase) k = k.toLowerCase();
      return k;
    };

    const tokens = (s: string) =>
      s ? s.split(/(\s+)/).filter((t) => t !== "") : [];
    const a = diffMode === "line" ? splitLines(dOrig) : tokens(dOrig);
    const b = diffMode === "line" ? splitLines(dMod) : tokens(dMod);
    const { ops, tooLarge } = diffSeq<string>(a, b, norm);

    const countable = (v: string) => diffMode === "line" || v.trim() !== "";
    let same = 0;
    let removedUnits = 0;
    let addedUnits = 0;
    let addedChars = 0;
    let removedChars = 0;
    ops.forEach((op) => {
      if (op.type === "same") {
        if (countable(op.value)) same++;
      } else if (op.type === "added") {
        addedChars += op.value.length;
        if (countable(op.value)) addedUnits++;
      } else {
        removedChars += op.value.length;
        if (countable(op.value)) removedUnits++;
      }
    });
    const maxLen = Math.max(same + removedUnits, same + addedUnits);
    const similarity = maxLen > 0 ? Math.round((same / maxLen) * 100) : 100;
    const identical = ops.every((o) => o.type === "same");

    const exported =
      diffMode === "line"
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
      similarity,
      addedChars,
      removedChars,
      identical,
      exported,
    };
  }, [activeTab, dOrig, dMod, diffMode, diffIgnoreWS, diffIgnoreCase]);

  /* ── actions ─────────────────────────────────────────────────── */

  const loadSample = () => {
    if (activeTab === "diff") {
      setOriginalText(
        "Comparlify provides platform comparison tools for digital creators, educators, and developers.",
      );
      setModifiedText(
        "Comparlify offers platform comparison utilities for online creators, course builders, and software engineers.",
      );
      setDiffMode("word");
      toast({
        title: "Sample loaded",
        description: "Switched to word-level diff.",
      });
      return;
    }
    commit(
      SAMPLES[activeTab],
      "Sample loaded",
      "Sample text is in the editor.",
    );
  };

  const clearAll = () => {
    if (activeTab === "diff") {
      setOriginalText("");
      setModifiedText("");
      return;
    }
    if (!text) return;
    commit("", "Cleared", "Use Undo to bring it back.");
  };

  const runDedupe = () => {
    const before = splitLines(text).length;
    const next = mapLines(text, (l) => dedupeLines(l, dedupeCase, dedupeTrim));
    const removed = before - splitLines(next).length;
    if (removed === 0) {
      toast({ title: "No duplicates found" });
      return;
    }
    commit(
      next,
      "Duplicates removed",
      `Removed ${removed} duplicate line${removed > 1 ? "s" : ""}.`,
    );
  };

  const runEmpty = () => {
    const next = mapLines(text, (l) => l.filter((x) => x.trim() !== ""));
    commit(next, "Empty lines removed", "All blank lines were stripped.");
  };

  const runTrim = () =>
    commit(
      PIPELINE_STEPS.trim.run(text),
      "Lines trimmed",
      "Leading and trailing spaces removed.",
    );

  const runReplace = () => {
    if (!searchTerm) {
      toast({ variant: "destructive", title: "Enter something to find" });
      return;
    }
    if (matchInfo.error) {
      toast({
        variant: "destructive",
        title: "Invalid pattern",
        description: matchInfo.error,
      });
      return;
    }
    if (matchInfo.count === 0) {
      toast({ title: "No matches found" });
      return;
    }
    const re = buildRegex(searchTerm, { matchCase, useRegex, wholeWord });
    // Plain mode: replacement is literal ($& etc. are NOT special). Regex mode: $1 works.
    const next = useRegex
      ? text.replace(re, replaceTerm)
      : text.replace(re, () => replaceTerm);
    commit(
      next,
      "Replaced",
      `${matchInfo.count} match${matchInfo.count > 1 ? "es" : ""} replaced.`,
    );
  };

  const runPipeline = () => {
    if (!text || chain.length === 0) return;
    const next = chain.reduce((acc, id) => PIPELINE_STEPS[id].run(acc), text);
    commit(
      next,
      "Pipeline applied",
      `Ran ${chain.length} step${chain.length > 1 ? "s" : ""}.`,
    );
  };

  const moveStep = (i: number, dir: -1 | 1) =>
    setChain((c) => {
      const j = i + dir;
      if (j < 0 || j >= c.length) return c;
      const n = [...c];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const structExt: Record<StructFormat, string> = {
    json: "json",
    csv: "csv",
    markdown: "md",
    sql: "sql",
  };

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */

  const isDiff = activeTab === "diff";

  const renderDiffBody = () => {
    if (!diffResult)
      return (
        <span className="text-muted-foreground italic">
          Enter the original and modified text above to see the differences.
        </span>
      );
    const { ops } = diffResult;
    if (diffMode === "word")
      return (
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
      );
    return (
      <div className="space-y-1">
        {ops.map((o, i) => {
          const body = o.value === "" ? "\u00A0" : o.value;
          if (o.type === "added")
            return (
              <div
                key={i}
                className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-2 rounded-lg border-l-4 border-emerald-500 font-semibold whitespace-pre-wrap break-words"
              >
                + {body}
              </div>
            );
          if (o.type === "removed")
            return (
              <div
                key={i}
                className="bg-rose-500/20 text-rose-700 dark:text-rose-300 p-2 rounded-lg border-l-4 border-rose-500 font-semibold whitespace-pre-wrap break-words"
              >
                - {body}
              </div>
            );
          return (
            <div
              key={i}
              className="text-muted-foreground p-1.5 whitespace-pre-wrap break-words"
            >
              {body}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Tab bar ── */}
      <div
        role="tablist"
        aria-label="Text tools"
        className="flex gap-1.5 overflow-x-auto pb-1 -mb-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-wide transition-all ${
              activeTab === t.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Editor ── */}
      <div className={`${card} p-4 sm:p-6 space-y-4`}>
        <div className="flex items-center justify-between gap-3 border-b border-border/20 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              {isDiff ? "Compare two texts" : "Text input"}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={loadSample}
              className="text-xs font-bold text-primary flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> Sample
            </button>
            {!isDiff && (
              <button
                onClick={undo}
                disabled={history.length === 0}
                className="text-xs font-bold text-foreground flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-all disabled:opacity-40"
              >
                <Undo2 className="h-3.5 w-3.5" /> Undo
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-xs font-bold text-rose-500 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {isDiff ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Original",
                  value: originalText,
                  set: setOriginalText,
                },
                {
                  label: "Modified",
                  value: modifiedText,
                  set: setModifiedText,
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    {f.label} text
                  </label>
                  <textarea
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    aria-label={`${f.label} text`}
                    placeholder={`Paste ${f.label.toLowerCase()} text here...`}
                    className="w-full h-44 sm:h-52 p-4 bg-background/60 border border-border/40 rounded-2xl text-sm font-mono outline-none resize-none text-foreground focus:ring-2 focus:ring-primary/50 shadow-inner"
                  />
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-5 bg-card/80 border border-border/40 rounded-2xl space-y-3 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <GitCompare className="h-4 w-4" /> Visual diff
                </label>
                {diffResult && (
                  <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                    <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary">
                      Similarity: {diffResult.similarity}%
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      +{diffResult.addedChars} chars
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      −{diffResult.removedChars} chars
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex gap-1">
                  {(["line", "word"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setDiffMode(m)}
                      className={chipBtn(diffMode === m)}
                    >
                      {m === "line" ? "By line" : "By word"}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diffIgnoreWS}
                    onChange={(e) => setDiffIgnoreWS(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  Ignore whitespace
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diffIgnoreCase}
                    onChange={(e) => setDiffIgnoreCase(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  Ignore case
                </label>
                <button
                  onClick={() => {
                    setOriginalText(modifiedText);
                    setModifiedText(originalText);
                  }}
                  className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Swap
                </button>
              </div>

              {diffResult?.tooLarge && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  These texts are too different and too large to match
                  precisely, so the changed middle part is shown as one replaced
                  block.
                </p>
              )}
              {diffResult?.identical && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  The two texts are identical.
                </p>
              )}

              <div className="p-4 bg-background/80 rounded-xl border border-border/30 font-mono text-xs sm:text-sm max-h-80 overflow-y-auto">
                {renderDiffBody()}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Text input"
              placeholder="Paste or type your text here..."
              className="w-full h-52 sm:h-64 p-4 sm:p-5 bg-background/60 border border-border/40 rounded-2xl text-sm sm:text-base font-mono outline-none resize-y text-foreground focus:ring-2 focus:ring-primary/50 shadow-inner leading-relaxed"
            />

            {activeTab === "slug" && (
              <div className="p-4 sm:p-5 bg-card/80 border border-primary/30 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Link2 className="h-4 w-4" /> Generated slug
                    {slugOutput.includes("\n") ? "s (one per line)" : ""}
                  </span>
                  <button
                    onClick={() => copyValue(slugOutput, "slug")}
                    disabled={!slugOutput}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {copiedKey === "slug" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </button>
                </div>
                <pre className="p-3 bg-background/80 rounded-xl border border-border/30 text-sm sm:text-base font-mono font-bold text-primary whitespace-pre-wrap break-all select-all min-h-[3rem]">
                  {slugOutput || "your-slug-will-appear-here"}
                </pre>
                {!slugOutput && text.trim() && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Nothing is left after removing unsupported characters. If
                    your text isn't in the Latin alphabet, turn on "Keep
                    non-Latin letters".
                  </p>
                )}
              </div>
            )}

            {activeTab === "struct" && (
              <div className="p-4 sm:p-5 bg-card/80 border border-primary/30 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">
                    Output ({structFormat.toUpperCase()})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyValue(structOutput, "struct")}
                      disabled={!structOutput}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {copiedKey === "struct" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copy
                    </button>
                    <button
                      onClick={() =>
                        downloadValue(
                          structOutput,
                          `data.${structExt[structFormat]}`,
                        )
                      }
                      disabled={!structOutput}
                      className="px-3 py-1.5 rounded-xl bg-secondary border border-border/40 text-foreground text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" /> .
                      {structExt[structFormat]}
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={structOutput}
                  aria-label="Structured output"
                  placeholder="Paste CSV (or TSV) above. The converted output appears here."
                  className="w-full h-44 p-4 bg-background/80 border border-border/40 rounded-xl text-xs sm:text-sm font-mono text-foreground outline-none resize-y"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/20">
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            {isDiff ? (
              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                {diffMode === "line" ? "Line" : "Word"} diff
              </span>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                  Words:{" "}
                  <strong className="text-sm font-black">{basic.words}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-card/60 border border-border/30 text-foreground">
                  Chars:{" "}
                  <strong className="text-sm font-black">{basic.chars}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-card/60 border border-border/30 text-foreground hidden sm:inline-block">
                  Lines:{" "}
                  <strong className="text-sm font-black">{basic.lines}</strong>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                copyValue(isDiff ? (diffResult?.exported ?? "") : text, "main")
              }
              disabled={isDiff ? !diffResult : !text}
              className={`${primaryBtn} flex items-center gap-1.5`}
            >
              {copiedKey === "main" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedKey === "main" ? "Copied!" : isDiff ? "Copy diff" : "Copy"}
            </button>
            <button
              onClick={() =>
                isDiff
                  ? downloadValue(diffResult?.exported ?? "", "diff.txt")
                  : downloadValue(text, "text.txt")
              }
              disabled={isDiff ? !diffResult : !text}
              className={`${secondaryBtn} flex items-center gap-1.5`}
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        </div>
      </div>

      {/* ── Options panel ── */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl p-3.5 sm:p-4 shadow-md">
        {activeTab === "count" && (
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Live analysis.</span>{" "}
            Counts and readability update as you type. Nothing is changed in
            your text.
          </p>
        )}

        {activeTab === "case" && (
          <div className="space-y-2.5">
            <span className={smallLabel}>
              Convert case (multi-line text is converted line by line)
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
              {[
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
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() =>
                    commit(
                      convertCase(text, id),
                      "Case converted",
                      `Applied ${label}.`,
                    )
                  }
                  disabled={!text}
                  className="py-1.5 px-2 rounded-lg border border-border/30 bg-background/50 hover:border-primary hover:bg-primary/10 text-[11px] font-bold transition-all text-foreground truncate active:scale-95 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "clean" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dedupeCase}
                  onChange={(e) => setDedupeCase(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-primary"
                />
                Case-sensitive
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dedupeTrim}
                  onChange={(e) => setDedupeTrim(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-primary"
                />
                Ignore spaces around lines
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runDedupe}
                disabled={!text}
                className={primaryBtn}
              >
                Remove duplicate lines
              </button>
              <button
                onClick={runEmpty}
                disabled={!text}
                className={secondaryBtn}
              >
                Remove empty lines
              </button>
              <button
                onClick={runTrim}
                disabled={!text}
                className={secondaryBtn}
              >
                Trim each line
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The first occurrence of each line is kept. Blank lines are not
              treated as duplicates.
            </p>
          </div>
        )}

        {activeTab === "sort" && (
          <div className="space-y-2 p-2.5 bg-background/50 rounded-lg border border-border/30">
            <span className={smallLabel}>Sort lines</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {(
                [
                  ["alpha", "A–Z"],
                  ["natural", "Natural (2 < 10)"],
                  ["numeric", "Numeric"],
                  ["length", "Length"],
                ] as [SortMode, string][]
              ).map(([m, l]) => (
                <button
                  key={m}
                  onClick={() => setSortMode(m)}
                  className={chipBtn(sortMode === m)}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="flex-1 py-1 rounded border border-border/30 text-[10px] font-bold uppercase text-foreground"
              >
                Order: {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
              <button
                onClick={() =>
                  commit(
                    sortLines(text, sortMode, sortOrder),
                    "Lines sorted",
                    `Sorted by ${sortMode}.`,
                  )
                }
                disabled={!text}
                className={primaryBtn}
              >
                Sort
              </button>
            </div>
            {sortMode === "numeric" && (
              <p className="text-[11px] text-muted-foreground">
                Lines that aren't numbers are placed last.
              </p>
            )}
          </div>
        )}

        {activeTab === "reverse" && (
          <div className="space-y-2 p-2.5 bg-background/50 rounded-lg border border-border/30">
            <span className={smallLabel}>Reverse text</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {(
                [
                  ["chars", "Whole text"],
                  ["each", "Each line"],
                  ["words", "Word order"],
                  ["lines", "Line order"],
                ] as [ReverseMode, string][]
              ).map(([m, l]) => (
                <button
                  key={m}
                  onClick={() => setReverseMode(m)}
                  className={chipBtn(reverseMode === m)}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                commit(
                  reverseText(text, reverseMode),
                  "Text reversed",
                  "Reversal applied.",
                )
              }
              disabled={!text}
              className={`${primaryBtn} w-full mt-1`}
            >
              Reverse
            </button>
          </div>
        )}

        {activeTab === "diff" && (
          <p className="text-xs text-muted-foreground italic">
            Use "By word" for sentences and paragraphs, "By line" for lists and
            code.
          </p>
        )}

        {activeTab === "replace" && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Find"
                placeholder="Find..."
                className={textInput}
              />
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                aria-label="Replace with"
                placeholder="Replace with..."
                className={textInput}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                {(
                  [
                    ["Match case", matchCase, setMatchCase],
                    ["Whole word", wholeWord, setWholeWord],
                    ["Regex", useRegex, setUseRegex],
                  ] as [string, boolean, (v: boolean) => void][]
                ).map(([l, v, set]) => (
                  <label
                    key={l}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={v}
                      onChange={(e) => set(e.target.checked)}
                      className="rounded accent-primary"
                    />
                    {l}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {searchTerm && (
                  <span
                    className={`text-[11px] font-mono font-bold ${matchInfo.error ? "text-rose-500" : "text-muted-foreground"}`}
                  >
                    {matchInfo.error
                      ? "Invalid pattern"
                      : `${matchInfo.count} match${matchInfo.count === 1 ? "" : "es"}`}
                  </span>
                )}
                <button
                  onClick={runReplace}
                  disabled={!text || !searchTerm}
                  className={primaryBtn}
                >
                  Replace all
                </button>
              </div>
            </div>
            {useRegex && (
              <p className="text-[11px] text-muted-foreground">
                Use $1, $2… in the replacement to reuse capture groups.
              </p>
            )}
          </div>
        )}

        {activeTab === "slug" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
              <div>
                <span className={`${smallLabel} mb-1`}>Separator</span>
                <div className="flex gap-1">
                  {[
                    ["-", "Hyphen"],
                    ["_", "Underscore"],
                    [".", "Dot"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setSlugSep(v)}
                      className={chipBtn(slugSep === v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className={`${smallLabel} mb-1`}>Max length</span>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={slugMax}
                  onChange={(e) =>
                    setSlugMax(
                      Math.min(
                        200,
                        Math.max(1, parseInt(e.target.value, 10) || 80),
                      ),
                    )
                  }
                  aria-label="Maximum slug length"
                  className="h-8 w-20 px-2 bg-background/50 border border-border/30 rounded-lg text-xs font-mono text-foreground text-center"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slugLower}
                  onChange={(e) => setSlugLower(e.target.checked)}
                  className="rounded accent-primary"
                />
                Lowercase
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slugStop}
                  onChange={(e) => setSlugStop(e.target.checked)}
                  className="rounded accent-primary"
                />
                Remove filler words (the, and, of…)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slugUnicode}
                  onChange={(e) => setSlugUnicode(e.target.checked)}
                  className="rounded accent-primary"
                />
                Keep non-Latin letters (Urdu, Arabic, Cyrillic…)
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Each line becomes its own slug. Accents are removed (é → e) unless
              you keep non-Latin letters.
            </p>
          </div>
        )}

        {activeTab === "struct" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <span className={`${smallLabel} mb-1`}>Convert to</span>
                <div className="flex gap-1.5">
                  {(["json", "csv", "markdown", "sql"] as StructFormat[]).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setStructFormat(f)}
                        className={`py-1 px-2.5 rounded-lg border text-[10px] font-black uppercase transition-all ${structFormat === f ? "border-primary bg-primary/10 text-primary" : "border-border/20 text-muted-foreground"}`}
                      >
                        {f === "markdown" ? "Markdown table" : f}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div>
                <span className={`${smallLabel} mb-1`}>Input separator</span>
                <select
                  value={structDelim}
                  onChange={(e) => setStructDelim(e.target.value)}
                  aria-label="Input separator"
                  className="h-8 px-2 bg-background/50 border border-border/30 rounded-lg text-xs text-foreground"
                >
                  <option value=",">Comma</option>
                  <option value=";">Semicolon</option>
                  <option value={"\t"}>Tab</option>
                  <option value="|">Pipe</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded accent-primary"
                />
                First row is the header
              </label>
              {structFormat === "json" && (
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inferTypes}
                    onChange={(e) => setInferTypes(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  Detect numbers and true/false
                </label>
              )}
            </div>
            {structFormat === "sql" && (
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  aria-label="Table name"
                  placeholder="table name"
                  className="h-8 px-2.5 bg-background/50 border border-border/30 rounded-lg text-xs font-mono text-foreground w-44"
                />
                <div className="flex gap-1">
                  {(
                    [
                      ["mysql", "MySQL (`)"],
                      ["ansi", 'Postgres / ANSI (")'],
                    ] as [Dialect, string][]
                  ).map(([d, l]) => (
                    <button
                      key={d}
                      onClick={() => setDialect(d)}
                      className={chipBtn(dialect === d)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Empty cells become NULL.
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "pipeline" && (
          <div className="space-y-3">
            <span className={smallLabel}>Steps run top to bottom</span>
            {chain.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add a step below to build your pipeline.
              </p>
            ) : (
              <ol className="space-y-1.5">
                {chain.map((id, i) => (
                  <li
                    key={`${id}-${i}`}
                    className="flex items-center gap-2 bg-background/50 border border-border/30 rounded-lg px-2.5 py-1.5"
                  >
                    <span className="text-[10px] font-mono font-bold text-muted-foreground w-4">
                      {i + 1}.
                    </span>
                    <span className="flex-1 text-xs font-bold text-foreground">
                      {PIPELINE_STEPS[id].label}
                    </span>
                    <button
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveStep(i, 1)}
                      disabled={i === chain.length - 1}
                      aria-label="Move down"
                      className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setChain((c) => c.filter((_, k) => k !== i))
                      }
                      aria-label="Remove step"
                      className="p-1 rounded hover:bg-rose-500/10 text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PIPELINE_STEPS).map(([id, s]) => (
                <button
                  key={id}
                  onClick={() => setChain((c) => [...c, id])}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/30 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  <Plus className="h-3 w-3" /> {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={runPipeline}
              disabled={!text || chain.length === 0}
              className={`${primaryBtn} w-full flex items-center justify-center gap-1.5`}
            >
              <Workflow className="h-3.5 w-3.5" /> Run pipeline
            </button>
          </div>
        )}
      </div>

      {/* ── Analytics (Analyze tab) ── */}
      {activeTab === "count" && (
        <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl p-3.5 sm:p-4 space-y-4 shadow-md">
          <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Text analytics
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Words", basic.words],
              ["Characters", basic.chars],
              ["No spaces", basic.charsNoSpaces],
              ["Sentences", basic.sentences],
              ["Paragraphs", basic.paragraphs],
              ["Lines", basic.lines],
              ["Reading time", basic.readTime],
              ["Speaking time", basic.speakTime],
            ].map(([l, v]) => (
              <div
                key={l}
                className="bg-background/50 p-2.5 rounded-lg border border-border/20"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  {l}
                </span>
                <span className="text-lg font-black text-foreground font-mono">
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <span className={smallLabel}>Length limits (approximate)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { name: "X / Twitter", max: 280 },
                { name: "LinkedIn post", max: 3000 },
                { name: "SEO title", max: 60 },
                { name: "SEO description", max: 160 },
              ].map((p) => {
                const pct = Math.min(
                  Math.round((basic.chars / p.max) * 100),
                  100,
                );
                const over = basic.chars > p.max;
                return (
                  <div
                    key={p.name}
                    className="bg-background/50 p-2 rounded-lg border border-border/20 space-y-1"
                  >
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground truncate">
                        {p.name}
                      </span>
                      <span
                        className={
                          over
                            ? "text-rose-500 font-extrabold"
                            : "text-foreground font-mono"
                        }
                      >
                        {basic.chars}/{p.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${over ? "bg-rose-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Platforms count differently: X counts links as 23 characters, and
              Google truncates titles by pixel width, not characters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="p-3 bg-background/50 rounded-lg border border-border/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                  Flesch reading ease
                </span>
                {analysis?.flesch != null ? (
                  <>
                    <span className="text-xl font-black text-foreground">
                      {analysis.flesch}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        / 100
                      </span>
                    </span>
                    <span className="text-[10px] text-primary font-bold block">
                      {analysis.grade}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground block mt-1">
                    {basic.words === 0
                      ? "—"
                      : "Available for English text only."}
                  </span>
                )}
              </div>
              <div className="text-right font-mono text-[10px] text-muted-foreground space-y-0.5">
                <div>
                  Avg:{" "}
                  <span className="font-bold text-foreground">
                    {analysis?.avg ?? "0"} words/sentence
                  </span>
                </div>
                <div>
                  Longest:{" "}
                  <span className="font-bold text-foreground">
                    {analysis?.longest ?? 0} words
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-background/50 rounded-lg border border-border/20 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                Top keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {!analysis || analysis.keywords.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">
                    Type some text to see keyword density.
                  </span>
                ) : (
                  analysis.keywords.map((kw) => (
                    <span
                      key={kw.word}
                      className="px-2 py-0.5 rounded bg-card/60 border border-border/20 text-[10px] font-mono font-bold text-foreground"
                    >
                      {kw.word} ({kw.count}× · {kw.pct}%)
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy strip ── */}
      <div className="flex items-center justify-between gap-3 bg-card/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border/20 text-muted-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <p className="text-[11px] font-medium truncate">
            <span className="font-bold text-foreground">
              Zero-server text engine
            </span>{" "}
            · everything runs in your browser.
          </p>
        </div>
        <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
          Client-side
        </div>
      </div>
    </div>
  );
}
