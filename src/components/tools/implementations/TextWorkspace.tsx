"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Settings2,
  Type,
  Filter,
  ArrowDownUp,
  GitCompare,
  Search,
  Link2,
  Clock,
  MessageSquare,
  Hash,
  Download,
  Code2,
  ListOrdered,
  Workflow,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextWorkspaceProps {
  defaultMode?: string;
}

export function TextWorkspace({ defaultMode = "count" }: TextWorkspaceProps) {
  const { toast } = useToast();

  // Mode mapping helper from tool slug
  const resolvedTab = useMemo(() => {
    switch (defaultMode) {
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
      case "text-reverser":
      case "sort":
        return "sort";
      case "text-diff-checker":
      case "diff":
        return "diff";
      case "find-and-replace":
      case "replace":
        return "replace";
      case "slug-generator":
      case "slug":
        return "slug";
      default:
        return "count";
    }
  }, [defaultMode]);

  const [activeTab, setActiveTab] = useState<string>(resolvedTab);
  useEffect(() => {
    setActiveTab(resolvedTab);
  }, [resolvedTab]);

  // Main text buffer
  const [text, setText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // --- Diff Checker States ---
  const [originalText, setOriginalText] = useState<string>("");
  const [modifiedText, setModifiedText] = useState<string>("");

  // --- Find & Replace States ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [replaceTerm, setReplaceTerm] = useState<string>("");
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(false);

  // --- Slug Generator States ---
  const [slugSeparator, setSlugSeparator] = useState<string>("-");
  const [slugRemoveStopWords, setSlugRemoveStopWords] = useState<boolean>(true);
  const [slugLowercase, setSlugLowercase] = useState<boolean>(true);
  const [slugMaxLength, setSlugMaxLength] = useState<number>(80);

  // --- Clean & Deduplicate States ---
  const [caseSensitiveDedupe, setCaseSensitiveDedupe] = useState<boolean>(false);

  // --- Sort & Reverse States ---
  const [sortMode, setSortMode] = useState<"alpha" | "numeric" | "length" | "natural">("alpha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reverseMode, setReverseMode] = useState<"chars" | "words" | "lines">("chars");

  // --- Text to Structured Data State ---
  const [structFormat, setStructFormat] = useState<"json" | "csv" | "markdown" | "sql">("json");
  const [structDelimiter, setStructSeparator] = useState<string>(",");

  // --- Pipeline Mode Chainer States ---
  const [pipelineChain, setPipelineChain] = useState<string[]>(["trim", "empty", "dedupe", "slug"]);

  // --- Syllable Counter Helper for Flesch Score ---
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // --- Live Metrics Analysis ---
  const stats = useMemo(() => {
    const raw = text;
    const charsTotal = raw.length;
    const charsNoSpaces = raw.replace(/\s/g, "").length;
    const wordsList = raw.trim() ? raw.trim().split(/\s+/).filter(Boolean) : [];
    const words = wordsList.length;
    const lines = raw ? raw.split("\n").length : 0;
    const sentencesList = raw.trim() ? raw.match(/[^.!?]+[.!?]+/g) || [raw] : [];
    const sentences = sentencesList.length || 1;
    const paragraphs = raw.trim() ? raw.split(/\n\s*\n/).filter(Boolean).length : 0;

    // Time calculations
    const readTimeMinutes = Math.ceil(words / 200);
    const speakTimeMinutes = Math.ceil(words / 130);

    // Sentence metrics
    const longestSentenceWords = sentencesList.reduce((max, s) => {
      const cnt = s.trim().split(/\s+/).filter(Boolean).length;
      return Math.max(max, cnt);
    }, 0);
    const avgSentenceWords = sentences > 0 ? (words / sentences).toFixed(1) : "0";

    // Flesch Reading Ease Calculation
    let totalSyllables = 0;
    wordsList.forEach(w => { totalSyllables += countSyllables(w); });
    let fleschScore = 100;
    let fleschGrade = "Easy / Standard";
    if (words > 0 && sentences > 0) {
      fleschScore = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words));
      fleschScore = Math.max(0, Math.min(100, fleschScore));
      if (fleschScore >= 80) fleschGrade = "Very Easy";
      else if (fleschScore >= 60) fleschGrade = "Standard / Moderate";
      else if (fleschScore >= 40) fleschGrade = "Difficult / Academic";
      else fleschGrade = "Very Complex";
    }

    // Keyword Density Top 5
    const freqMap: Record<string, number> = {};
    const stopWords = new Set(["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "is", "or", "an", "will", "my", "all", "would", "there", "their", "what"]);
    wordsList.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean.length >= 3 && !stopWords.has(clean)) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kw, count]) => ({
        word: kw,
        count,
        pct: words > 0 ? ((count / words) * 100).toFixed(1) : "0"
      }));

    return {
      words,
      charsTotal,
      charsNoSpaces,
      lines,
      sentences,
      paragraphs,
      readTimeMinutes: words > 0 ? `${readTimeMinutes} min` : "0 min",
      speakTimeMinutes: words > 0 ? `${speakTimeMinutes} min` : "0 min",
      longestSentenceWords,
      avgSentenceWords,
      fleschScore,
      fleschGrade,
      topKeywords
    };
  }, [text]);

  // Copy helper
  const handleCopy = (strToCopy?: string) => {
    const content = strToCopy ?? text;
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied!", description: "Text copied to your clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  // Download helper
  const handleDownload = (contentStr?: string, filename = "text_output_comparlify.txt") => {
    const content = contentStr ?? text;
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Case Converters ---
  const applyCasing = (mode: string) => {
    if (!text) return;
    let result = text;
    const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]+|[0-9]+/g) || [text];

    switch (mode) {
      case "camel":
        result = words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join("");
        break;
      case "pascal":
        result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
        break;
      case "snake":
        result = words.map(w => w.toLowerCase()).join("_");
        break;
      case "kebab":
        result = words.map(w => w.toLowerCase()).join("-");
        break;
      case "constant":
        result = words.map(w => w.toUpperCase()).join("_");
        break;
      case "title":
        result = text.toLowerCase().replace(/(?:^|\s|-)\S/g, m => m.toUpperCase());
        break;
      case "sentence":
        result = text.toLowerCase().replace(/(^\s*|[.!?]\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
        break;
      case "dot":
        result = words.map(w => w.toLowerCase()).join(".");
        break;
      case "path":
        result = words.map(w => w.toLowerCase()).join("/");
        break;
    }
    setText(result);
    toast({ title: "Casing Transformed", description: `Applied ${mode.toUpperCase()} case.` });
  };

  // --- Clean Operations ---
  const removeDuplicates = () => {
    const lines = text.split("\n");
    const seen = new Set<string>();
    const result: string[] = [];

    lines.forEach(line => {
      const key = caseSensitiveDedupe ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    });

    setText(result.join("\n"));
    toast({ title: "Duplicates Removed", description: `Cleaned ${lines.length - result.length} duplicate lines.` });
  };

  const removeEmptyLines = () => {
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    setText(lines.join("\n"));
    toast({ title: "Empty Lines Stripped", description: "All blank lines removed." });
  };

  // --- Sort Operations ---
  const runSort = () => {
    let lines = text.split("\n");
    lines.sort((a, b) => {
      if (sortMode === "numeric") {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return sortOrder === "asc" ? numA - numB : numB - numA;
      } else if (sortMode === "length") {
        return sortOrder === "asc" ? a.length - b.length : b.length - a.length;
      } else if (sortMode === "natural") {
        return sortOrder === "asc" ? a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }) : b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" });
      } else {
        return sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      }
    });
    setText(lines.join("\n"));
    toast({ title: "Lines Sorted", description: `Sorted ${lines.length} lines (${sortMode.toUpperCase()}).` });
  };

  const runReverse = () => {
    if (reverseMode === "chars") {
      setText(text.split("").reverse().join(""));
    } else if (reverseMode === "words") {
      setText(text.split(" ").reverse().join(" "));
    } else {
      setText(text.split("\n").reverse().join("\n"));
    }
    toast({ title: "Text Reversed", description: `Reversed text by ${reverseMode}.` });
  };

  // --- Find & Replace Execution ---
  const runReplace = () => {
    if (!searchTerm) return;
    try {
      let flags = "g";
      if (!matchCase) flags += "i";

      let pattern = searchTerm;
      if (!useRegex) {
        pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }

      const regex = new RegExp(pattern, flags);
      const newText = text.replace(regex, replaceTerm);
      setText(newText);
      toast({ title: "Replacement Complete", description: "Search & replace executed." });
    } catch (e) {
      toast({ variant: "destructive", title: "Regex Syntax Error", description: "Invalid Regular Expression pattern." });
    }
  };

  // --- Slug Generator ---
  const generatedSlug = useMemo(() => {
    if (!text) return "";
    let str = text;
    if (slugLowercase) str = str.toLowerCase();

    if (slugRemoveStopWords) {
      const stopWords = ["a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"];
      const re = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");
      str = str.replace(re, "");
    }

    str = str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/gi, "")
      .trim()
      .replace(/\s+/g, slugSeparator)
      .replace(new RegExp(`\\${slugSeparator}+`, "g"), slugSeparator);

    return str.substring(0, slugMaxLength);
  }, [text, slugSeparator, slugRemoveStopWords, slugLowercase, slugMaxLength]);

  // --- Text to Structured Data Converter ---
  const structuredDataOutput = useMemo(() => {
    if (!text.trim()) return "";
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return "";

    const rows = lines.map(line => line.split(structDelimiter).map(cell => cell.trim()));

    if (structFormat === "json") {
      if (rows.length > 1) {
        const headers = rows[0];
        const jsonList = rows.slice(1).map(r => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h || `col_${i + 1}`] = r[i] || "";
          });
          return obj;
        });
        return JSON.stringify(jsonList, null, 2);
      }
      return JSON.stringify(rows.map(r => r[0]), null, 2);
    } else if (structFormat === "markdown") {
      if (rows.length === 0) return "";
      const headers = rows[0];
      const sep = headers.map(() => "---").join(" | ");
      const body = rows.slice(1).map(r => r.join(" | ")).join("\n");
      return `| ${headers.join(" | ")} |\n| ${sep} |\n${body ? `| ${body} |` : ""}`;
    } else if (structFormat === "sql") {
      if (rows.length < 2) return "";
      const headers = rows[0].map(h => `\`${h.replace(/[^a-zA-Z0-9_]/g, "")}\``).join(", ");
      const insertRows = rows.slice(1).map(r => `(${r.map(v => `'${v.replace(/'/g, "''")}'`).join(", ")})`).join(",\n  ");
      return `INSERT INTO \`table_name\` (${headers})\nVALUES\n  ${insertRows};`;
    } else {
      // CSV Export
      return rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    }
  }, [text, structFormat, structDelimiter]);

  // --- Pipeline Chainer Execution ---
  const runPipelineChain = () => {
    if (!text) return;
    let res = text;

    pipelineChain.forEach(step => {
      if (step === "trim") {
        res = res.split("\n").map(l => l.trim()).join("\n");
      } else if (step === "empty") {
        res = res.split("\n").filter(l => l.trim().length > 0).join("\n");
      } else if (step === "dedupe") {
        const seen = new Set<string>();
        res = res.split("\n").filter(l => {
          const k = l.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        }).join("\n");
      } else if (step === "sort") {
        res = res.split("\n").sort((a, b) => a.localeCompare(b)).join("\n");
      } else if (step === "lower") {
        res = res.toLowerCase();
      } else if (step === "slug") {
        res = res.toLowerCase().replace(/[^a-z0-9\s-]/gi, "").trim().replace(/\s+/g, "-");
      }
    });

    setText(res);
    toast({ title: "Pipeline Chain Executed", description: `Applied ${pipelineChain.length} transformation steps.` });
  };

  // --- Smart Diff Calculation Helper ---
  const diffResult = useMemo(() => {
    if (activeTab !== "diff") return { rows: [], similarity: 100, addedChars: 0, removedChars: 0 };
    const origLines = originalText.split("\n");
    const modLines = modifiedText.split("\n");

    const maxLen = Math.max(origLines.length, modLines.length);
    const rows = [];
    let sameCount = 0;
    let addedChars = 0;
    let removedChars = 0;

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i];
      const mod = modLines[i];

      if (orig === mod) {
        sameCount++;
        rows.push({ type: "same", orig, mod });
      } else if (orig !== undefined && mod === undefined) {
        removedChars += orig.length;
        rows.push({ type: "removed", orig, mod: "" });
      } else if (orig === undefined && mod !== undefined) {
        addedChars += mod.length;
        rows.push({ type: "added", orig: "", mod });
      } else {
        removedChars += orig.length;
        addedChars += mod.length;
        rows.push({ type: "modified", orig, mod });
      }
    }

    const similarity = maxLen > 0 ? Math.round((sameCount / maxLen) * 100) : 100;
    return { rows, similarity, addedChars, removedChars };
  }, [originalText, modifiedText, activeTab]);

  return (
    <div className="space-y-4">
      {/* Zero-Server Privacy Pill */}
      <div className="flex items-center justify-between gap-3 bg-card/30 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-foreground truncate">
            <span className="font-bold">Zero-Server Text Intelligence Editor</span> · 100% in-browser private computation.
          </p>
        </div>
        <div className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          RAM Engine
        </div>
      </div>

      {/* Top Real-time Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {[
          { label: "Words", value: stats.words },
          { label: "Characters", value: stats.charsTotal },
          { label: "No Spaces", value: stats.charsNoSpaces },
          { label: "Lines", value: stats.lines },
          { label: "Sentences", value: stats.sentences },
          { label: "Read Time", value: stats.readTimeMinutes },
          { label: "Speak Time", value: stats.speakTimeMinutes }
        ].map((item, i) => (
          <div key={i} className="bg-card/20 rounded-xl border border-border/20 p-2.5 text-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">{item.label}</span>
            <span className="text-sm font-mono font-black text-foreground mt-0.5 block">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Social Limits Bar */}
      <div className="bg-card/20 rounded-xl border border-border/20 p-3 space-y-2">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Live Social & SEO Constraints</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {[
            { name: "Twitter / X", max: 280, current: stats.charsTotal },
            { name: "LinkedIn Post", max: 3000, current: stats.charsTotal },
            { name: "SEO Meta Title", max: 60, current: stats.charsTotal },
            { name: "SEO Meta Desc", max: 160, current: stats.charsTotal }
          ].map((platform, idx) => {
            const pct = Math.min(Math.round((platform.current / platform.max) * 100), 100);
            const isExceeded = platform.current > platform.max;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">{platform.name}</span>
                  <span className={isExceeded ? "text-rose-500 font-bold" : "text-foreground font-mono"}>
                    {platform.current}/{platform.max}
                  </span>
                </div>
                <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isExceeded ? "bg-rose-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/30 rounded-xl p-4 space-y-4">
        {/* Workspace Tab Header */}
        <div className="flex border-b border-border/20 pb-2.5 overflow-x-auto gap-1">
          {[
            { id: "count", label: "Analyze", icon: Hash },
            { id: "case", label: "Case", icon: Type },
            { id: "clean", label: "Deduplicate", icon: Filter },
            { id: "sort", label: "Sort/Reverse", icon: ArrowDownUp },
            { id: "diff", label: "Smart Diff", icon: GitCompare },
            { id: "replace", label: "Find/Replace", icon: Search },
            { id: "slug", label: "Slug", icon: Link2 },
            { id: "struct", label: "Structured Data", icon: Code2 },
            { id: "pipeline", label: "Pipeline", icon: Workflow }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* EDITOR AREA (Single Buffer vs Diff Double Buffer) */}
        {activeTab === "diff" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Original Text</label>
              <textarea
                value={originalText}
                onChange={e => setOriginalText(e.target.value)}
                placeholder="Paste original text here..."
                className="w-full h-44 p-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Modified Text</label>
              <textarea
                value={modifiedText}
                onChange={e => setModifiedText(e.target.value)}
                placeholder="Paste modified text here..."
                className="w-full h-44 p-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono outline-none resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Text Input Editor Buffer</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setText("")}
                  className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Clear Buffer
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type text to process..."
              className="w-full h-48 p-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono outline-none resize-none"
            />
          </div>
        )}

        {/* TAB SPECIFIC OPERATION CONTROLS */}

        {/* TAB 1: ANALYZE & READABILITY SCORE */}
        {activeTab === "count" && (
          <div className="space-y-4 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Readability Box */}
              <div className="p-3.5 bg-secondary/10 rounded-xl border border-border/20 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" /> Flesch Readability Analysis
                </span>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-foreground">{stats.fleschScore} / 100</span>
                    <span className="text-[10px] text-muted-foreground block font-semibold">{stats.fleschGrade}</span>
                  </div>
                  <div className="text-right font-mono text-[10px] text-muted-foreground space-y-0.5">
                    <div>Avg sentence: <span className="font-bold text-foreground">{stats.avgSentenceWords} words</span></div>
                    <div>Max sentence: <span className="font-bold text-foreground">{stats.longestSentenceWords} words</span></div>
                  </div>
                </div>
              </div>

              {/* Keyword Density Table */}
              <div className="p-3.5 bg-secondary/10 rounded-xl border border-border/20 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Top Keyword Frequency</span>
                <div className="space-y-1">
                  {stats.topKeywords.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground">Type text above to analyze top keyword density.</span>
                  ) : (
                    stats.topKeywords.map((kw, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-foreground font-bold">{kw.word}</span>
                        <span className="text-muted-foreground text-[10px]">{kw.count}× ({kw.pct}%)</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CASE CONVERTER */}
        {activeTab === "case" && (
          <div className="space-y-3 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Apply Case Transformation</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: "camel", label: "camelCase" },
                { id: "pascal", label: "PascalCase" },
                { id: "snake", label: "snake_case" },
                { id: "kebab", label: "kebab-case" },
                { id: "constant", label: "CONSTANT_CASE" },
                { id: "title", label: "Title Case" },
                { id: "sentence", label: "Sentence case" },
                { id: "dot", label: "dot.case" },
                { id: "path", label: "path/case" }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => applyCasing(c.id)}
                  className="py-2 px-3 rounded-xl border border-border/20 hover:border-primary/40 hover:bg-primary/5 text-xs font-black transition-all"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLEAN & DEDUPLICATE */}
        {activeTab === "clean" && (
          <div className="space-y-3 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={caseSensitiveDedupe}
                  onChange={e => setCaseSensitiveDedupe(e.target.checked)}
                  className="rounded border-border/30 bg-background accent-primary"
                />
                Case-sensitive deduplication
              </label>

              <div className="flex gap-2">
                <button
                  onClick={removeDuplicates}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider"
                >
                  Remove Duplicate Lines
                </button>
                <button
                  onClick={removeEmptyLines}
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/30"
                >
                  Strip Empty Lines
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SORT & REVERSE */}
        {activeTab === "sort" && (
          <div className="space-y-4 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-3 bg-secondary/10 rounded-xl border border-border/20">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Sort Lines</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["alpha", "numeric", "length", "natural"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSortMode(mode)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase ${
                        sortMode === mode ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex-1 py-1.5 rounded-lg border border-border/20 text-[10px] font-bold uppercase"
                  >
                    Order: {sortOrder.toUpperCase()}
                  </button>
                  <button
                    onClick={runSort}
                    className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase"
                  >
                    Apply Sort
                  </button>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-secondary/10 rounded-xl border border-border/20">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Reverse Text</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["chars", "words", "lines"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setReverseMode(m)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase ${
                        reverseMode === m ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={runReverse}
                  className="w-full mt-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase"
                >
                  Reverse Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEXT DIFF CHECKER VIEW */}
        {activeTab === "diff" && (
          <div className="space-y-3 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unified Visual Diff Analysis</label>
              <div className="flex gap-3 text-xs font-mono font-bold">
                <span className="text-primary">Similarity: {diffResult.similarity}%</span>
                <span className="text-emerald-500">+{diffResult.addedChars} chars</span>
                <span className="text-rose-500">-{diffResult.removedChars} chars</span>
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-border/30 font-mono text-[11px] max-h-52 overflow-y-auto space-y-1">
              {diffResult.rows.length === 0 ? (
                <span className="text-muted-foreground">Enter original and modified text above to compute diff.</span>
              ) : (
                diffResult.rows.map((row, idx) => {
                  if (row.type === "added") {
                    return <div key={idx} className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">+ {row.mod}</div>;
                  } else if (row.type === "removed") {
                    return <div key={idx} className="bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded">- {row.orig}</div>;
                  } else if (row.type === "modified") {
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded">- {row.orig}</div>
                        <div className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">+ {row.mod}</div>
                      </div>
                    );
                  }
                  return <div key={idx} className="text-slate-400 px-2 py-0.5">{row.orig}</div>;
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 6: FIND & REPLACE */}
        {activeTab === "replace" && (
          <div className="space-y-3 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Find text or pattern..."
                className="h-10 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono font-bold"
              />
              <input
                type="text"
                value={replaceTerm}
                onChange={e => setReplaceTerm(e.target.value)}
                placeholder="Replace with..."
                className="h-10 px-3 bg-muted/40 border border-border/30 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="rounded accent-primary" /> Match Case
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} className="rounded accent-primary" /> Whole Word
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} className="rounded accent-primary" /> Regex
                </label>
              </div>

              <button
                onClick={runReplace}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider"
              >
                Replace All
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: SLUG GENERATOR */}
        {activeTab === "slug" && (
          <div className="space-y-4 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="p-3.5 bg-secondary/15 rounded-xl border border-border/20 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Generated SEO Slug</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono font-bold text-primary break-all">{generatedSlug || "your-slug-will-appear-here"}</span>
                <button
                  onClick={() => handleCopy(generatedSlug)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy Slug
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: TEXT TO STRUCTURED DATA */}
        {activeTab === "struct" && (
          <div className="space-y-3 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                {(["json", "csv", "markdown", "sql"] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setStructFormat(fmt)}
                    className={`py-1.5 px-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      structFormat === fmt ? "border-primary bg-primary/10 text-primary" : "border-border/20 text-muted-foreground"
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleCopy(structuredDataOutput)}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy Structured Output
              </button>
            </div>

            <textarea
              readOnly
              value={structuredDataOutput}
              placeholder="Structured output will render here..."
              className="w-full h-36 p-3 bg-slate-950 border border-border/30 rounded-xl text-xs font-mono text-emerald-400 outline-none resize-none"
            />
          </div>
        )}

        {/* TAB 9: PIPELINE MODE CHAINER */}
        {activeTab === "pipeline" && (
          <div className="space-y-3 pt-2 border-t border-border/10 animate-in fade-in duration-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Sequential Transformation Chain</span>
            <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
              {pipelineChain.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-secondary/30 px-2.5 py-1 rounded-lg border border-border/20">
                  <span className="text-foreground font-bold">{idx + 1}. {step}</span>
                </div>
              ))}
            </div>
            <button
              onClick={runPipelineChain}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Workflow className="h-4 w-4" /> Run Execution Pipeline
            </button>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/20">
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy()}
              disabled={!text}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Output"}
            </button>
            <button
              onClick={() => handleDownload()}
              disabled={!text}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/30 text-foreground text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
