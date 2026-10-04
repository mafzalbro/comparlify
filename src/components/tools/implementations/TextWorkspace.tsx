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

  const [showFullAnalytics, setShowFullAnalytics] = useState<boolean>(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Text Area (AT THE VERY TOP) */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        {/* Header & Quick Action Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border/20 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">Text Input & Workspace Buffer</span>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={() => {
                setText("Comparlify is an all-in-one platform intelligence engine and developer utility suite. It helps creators evaluate software options, analyze migration costs, and compute expected ROI across platforms like Teachable, Skool, Mighty Networks, and Kajabi.");
                toast({ title: "Sample Text Loaded", description: "Sample paragraph loaded into buffer." });
              }}
              className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> Sample Text
            </button>
            <button
              onClick={() => setText("")}
              className="text-xs sm:text-sm font-bold text-rose-500 hover:underline flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* EDITOR AREA (Single Buffer vs Diff Double Buffer) */}
        {activeTab === "diff" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block">Original Text</label>
                  <button
                    onClick={() => {
                      setOriginalText("Comparlify provides platform comparison tools for digital creators, educators, and developers.");
                      setModifiedText("Comparlify offers platform comparison utilities for online creators, course builders, and software engineers.");
                      toast({ title: "Sample Diff Loaded", description: "Loaded sample texts for comparison." });
                    }}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Load Sample Diff
                  </button>
                </div>
                <textarea
                  value={originalText}
                  onChange={e => setOriginalText(e.target.value)}
                  placeholder="Paste original text here..."
                  className="w-full h-44 sm:h-52 p-4 bg-background/60 border border-border/40 rounded-2xl text-sm sm:text-base font-mono outline-none resize-none text-foreground focus:ring-2 focus:ring-primary/50 shadow-inner"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Modified Text</label>
                <textarea
                  value={modifiedText}
                  onChange={e => setModifiedText(e.target.value)}
                  placeholder="Paste modified text here..."
                  className="w-full h-44 sm:h-52 p-4 bg-background/60 border border-border/40 rounded-2xl text-sm sm:text-base font-mono outline-none resize-none text-foreground focus:ring-2 focus:ring-primary/50 shadow-inner"
                />
              </div>
            </div>

            {/* UNIFIED VISUAL DIFF (EXACTLY AFTER EDITORS) */}
            <div className="p-4 sm:p-5 bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <GitCompare className="h-4 w-4" /> Visual Diff Inspector
                </label>
                <div className="flex flex-wrap gap-2.5 text-xs sm:text-sm font-mono font-bold">
                  <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary">Similarity: {diffResult.similarity}%</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400">+{diffResult.addedChars} chars</span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-400">-{diffResult.removedChars} chars</span>
                </div>
              </div>
              <div className="p-4 bg-background/80 rounded-xl border border-border/30 font-mono text-xs sm:text-sm max-h-72 overflow-y-auto space-y-1.5">
                {diffResult.rows.length === 0 ? (
                  <span className="text-muted-foreground italic">Enter original and modified text above to compute diff.</span>
                ) : (
                  diffResult.rows.map((row, idx) => {
                    if (row.type === "added") {
                      return <div key={idx} className="bg-emerald-500/20 text-emerald-300 p-2 rounded-lg border-l-4 border-emerald-500 font-semibold">+ {row.mod}</div>;
                    } else if (row.type === "removed") {
                      return <div key={idx} className="bg-rose-500/20 text-rose-300 p-2 rounded-lg border-l-4 border-rose-500 font-semibold">- {row.orig}</div>;
                    } else if (row.type === "modified") {
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="bg-rose-500/20 text-rose-300 p-2 rounded-lg border-l-4 border-rose-500 font-semibold">- {row.orig}</div>
                          <div className="bg-emerald-500/20 text-emerald-300 p-2 rounded-lg border-l-4 border-emerald-500 font-semibold">+ {row.mod}</div>
                        </div>
                      );
                    }
                    return <div key={idx} className="text-muted-foreground p-1.5">{row.orig}</div>;
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type your text here to transform, clean, format or analyze..."
              className="w-full h-52 sm:h-64 p-4 sm:p-5 bg-background/60 border border-border/40 rounded-2xl text-sm sm:text-base font-mono outline-none resize-none text-foreground focus:ring-2 focus:ring-primary/50 shadow-inner leading-relaxed"
            />

            {/* TAB-SPECIFIC RESULT OUTPUTS DIRECTLY AFTER EDITOR */}
            {activeTab === "slug" && (
              <div className="p-4 sm:p-5 bg-card/80 backdrop-blur-xl border border-primary/30 rounded-2xl space-y-3 shadow-lg">
                <span className="text-xs font-black uppercase tracking-widest text-primary block flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Generated SEO Slug Output
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-background/80 rounded-xl border border-border/30">
                  <span className="text-base sm:text-lg font-mono font-bold text-primary break-all select-all">{generatedSlug || "your-slug-will-appear-here"}</span>
                  <button
                    onClick={() => handleCopy(generatedSlug)}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold shrink-0 flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Copy className="h-4 w-4" /> Copy Slug
                  </button>
                </div>
              </div>
            )}

            {activeTab === "struct" && (
              <div className="p-4 sm:p-5 bg-card/80 backdrop-blur-xl border border-primary/30 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-widest text-primary block">Structured Data Output ({structFormat.toUpperCase()})</span>
                  <button
                    onClick={() => handleCopy(structuredDataOutput)}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Output
                  </button>
                </div>
                <textarea
                  readOnly
                  value={structuredDataOutput}
                  placeholder="Structured output will render here..."
                  className="w-full h-40 p-4 bg-background/80 border border-border/40 rounded-xl text-xs sm:text-sm font-mono text-foreground outline-none resize-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Compact Combined Live Stats & Action Strip (Single Row in View) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/20">
          {/* Inline Live Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono font-bold">
            <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Words: <strong className="text-sm font-black">{stats.words}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card/60 border border-border/30 text-foreground">
              Chars: <strong className="text-sm font-black">{stats.charsTotal}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card/60 border border-border/30 text-foreground hidden sm:inline-block">
              Lines: <strong className="text-sm font-black">{stats.lines}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-card/60 border border-border/30 text-foreground hidden sm:inline-block">
              Read: <strong className="text-sm font-black">{stats.readTimeMinutes}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy()}
              disabled={!text}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95 transition-all touch-manipulation"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => handleDownload()}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/40 text-foreground text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 active:scale-95 transition-all touch-manipulation"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tool Operations Panel (COMPACTED) */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl p-3.5 sm:p-4 shadow-md">
        {/* TAB 1: ANALYZE */}
        {activeTab === "count" && (
          <div className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Live Text Analysis Active</span> — Real-time readability metrics and social length bounds displayed below.
          </div>
        )}

        {/* TAB 2: CASE CONVERTER */}
        {activeTab === "case" && (
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Apply Case Transformation</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
              {[
                { id: "camel", label: "camelCase" },
                { id: "pascal", label: "PascalCase" },
                { id: "snake", label: "snake_case" },
                { id: "kebab", label: "kebab-case" },
                { id: "constant", label: "CONSTANT" },
                { id: "title", label: "Title Case" },
                { id: "sentence", label: "Sentence" },
                { id: "dot", label: "dot.case" },
                { id: "path", label: "path/case" }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => applyCasing(c.id)}
                  className="py-1.5 px-2 rounded-lg border border-border/30 bg-background/50 hover:border-primary hover:bg-primary/10 text-[11px] font-bold transition-all text-foreground truncate active:scale-95 touch-manipulation"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLEAN & DEDUPLICATE */}
        {activeTab === "clean" && (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitiveDedupe}
                onChange={e => setCaseSensitiveDedupe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border/40 bg-background accent-primary"
              />
              Case-sensitive deduplication
            </label>

            <div className="flex w-full sm:w-auto gap-2">
              <button
                onClick={removeDuplicates}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-md"
              >
                Remove Duplicates
              </button>
              <button
                onClick={removeEmptyLines}
                className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/30"
              >
                Strip Blank Lines
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SORT & REVERSE */}
        {activeTab === "sort" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2 p-2.5 bg-background/50 rounded-lg border border-border/30">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Sort Lines</label>
              <div className="grid grid-cols-4 gap-1">
                {(["alpha", "numeric", "length", "natural"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`py-1 px-1.5 rounded text-[10px] font-bold uppercase transition-all ${sortMode === mode ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex-1 py-1 rounded border border-border/30 text-[10px] font-bold uppercase text-foreground"
                >
                  Order: {sortOrder.toUpperCase()}
                </button>
                <button
                  onClick={runSort}
                  className="px-3 py-1 rounded bg-primary text-primary-foreground text-[10px] font-black uppercase"
                >
                  Sort
                </button>
              </div>
            </div>

            <div className="space-y-2 p-2.5 bg-background/50 rounded-lg border border-border/30">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Reverse Text</label>
              <div className="grid grid-cols-3 gap-1">
                {(["chars", "words", "lines"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setReverseMode(m)}
                    className={`py-1 px-1.5 rounded text-[10px] font-bold uppercase transition-all ${reverseMode === m ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                onClick={runReverse}
                className="w-full mt-1 py-1 rounded bg-primary text-primary-foreground text-[10px] font-black uppercase"
              >
                Execute Reverse
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: DIFF VIEW */}
        {activeTab === "diff" && (
          <div className="text-xs text-muted-foreground italic">
            Live visual diff displayed directly after text inputs above.
          </div>
        )}

        {/* TAB 6: FIND & REPLACE */}
        {activeTab === "replace" && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Find pattern..."
                className="h-8 px-2.5 bg-background/50 border border-border/30 rounded-lg text-xs font-mono text-foreground"
              />
              <input
                type="text"
                value={replaceTerm}
                onChange={e => setReplaceTerm(e.target.value)}
                placeholder="Replace with..."
                className="h-8 px-2.5 bg-background/50 border border-border/30 rounded-lg text-xs font-mono text-foreground"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="rounded accent-primary" /> Case
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} className="rounded accent-primary" /> Word
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} className="rounded accent-primary" /> Regex
                </label>
              </div>

              <button
                onClick={runReplace}
                className="px-3.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase"
              >
                Replace All
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: SLUG GENERATOR */}
        {activeTab === "slug" && (
          <div className="text-xs text-muted-foreground italic">
            Generated SEO slug rendered directly after text editor above.
          </div>
        )}

        {/* TAB 8: TEXT TO STRUCTURED DATA */}
        {activeTab === "struct" && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(["json", "csv", "markdown", "sql"] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setStructFormat(fmt)}
                  className={`py-1 px-2.5 rounded-lg border text-[10px] font-black uppercase transition-all ${structFormat === fmt ? "border-primary bg-primary/10 text-primary" : "border-border/20 text-muted-foreground"}`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: PIPELINE CHAINER */}
        {activeTab === "pipeline" && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 items-center text-xs font-mono">
              {pipelineChain.map((step, idx) => (
                <span key={idx} className="bg-background/50 px-2 py-0.5 rounded border border-border/20 text-[10px] font-bold text-foreground">
                  {idx + 1}. {step}
                </span>
              ))}
            </div>
            <button
              onClick={runPipelineChain}
              className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Workflow className="h-3.5 w-3.5" /> Execute Pipeline
            </button>
          </div>
        )}
      </div>

      {/* Full Detailed Analytics Section (COMPACTED) */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-md">
        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Text Analytics & Readability
        </h4>

        {/* Social Constraints Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { name: "Twitter / X", max: 280, current: stats.charsTotal },
            { name: "LinkedIn Post", max: 3000, current: stats.charsTotal },
            { name: "SEO Meta Title", max: 60, current: stats.charsTotal },
            { name: "SEO Meta Desc", max: 160, current: stats.charsTotal }
          ].map((platform, idx) => {
            const pct = Math.min(Math.round((platform.current / platform.max) * 100), 100);
            const isExceeded = platform.current > platform.max;
            return (
              <div key={idx} className="bg-background/50 p-2 rounded-lg border border-border/20 space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground truncate">{platform.name}</span>
                  <span className={isExceeded ? "text-rose-500 font-extrabold" : "text-foreground font-mono"}>
                    {platform.current}/{platform.max}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isExceeded ? "bg-rose-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Readability & Keyword Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="p-3 bg-background/50 rounded-lg border border-border/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Flesch Ease</span>
              <span className="text-xl font-black text-foreground">{stats.fleschScore} <span className="text-xs font-medium text-muted-foreground">/ 100</span></span>
              <span className="text-[10px] text-primary font-bold block">{stats.fleschGrade}</span>
            </div>
            <div className="text-right font-mono text-[10px] text-muted-foreground space-y-0.5">
              <div>Avg: <span className="font-bold text-foreground">{stats.avgSentenceWords} words/sent</span></div>
              <div>Max: <span className="font-bold text-foreground">{stats.longestSentenceWords} words/sent</span></div>
            </div>
          </div>

          <div className="p-3 bg-background/50 rounded-lg border border-border/20 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Top Keywords</span>
            <div className="flex flex-wrap gap-1.5">
              {stats.topKeywords.length === 0 ? (
                <span className="text-[10px] text-muted-foreground">Type text above to compute density.</span>
              ) : (
                stats.topKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-card/60 border border-border/20 text-[10px] font-mono font-bold text-foreground">
                    {kw.word} ({kw.count}×)
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Zero-Server Privacy Footer */}
      <div className="flex items-center justify-between gap-3 bg-card/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border/20 text-muted-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <p className="text-[11px] font-medium truncate">
            <span className="font-bold text-foreground">Zero-Server Text Engine</span> · 100% in-browser execution.
          </p>
        </div>
        <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          Browser RAM
        </div>
      </div>
    </div>
  );
}

