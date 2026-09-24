"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { ShieldCheck, Sparkles, Wand2, FileCode2 } from "lucide-react";

export function CSSFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleCSS = `.container{max-width:1200px;margin:0 auto;padding:16px;}.card{background:#1e1e2e;border-radius:12px;border:1px solid rgba(255,255,255,0.1);transition:all 0.2s ease;}.card:hover{border-color:#3b82f6;}`;

  const handleLoadSample = () => {
    setInput(sampleCSS);
    const formatted = formatCSS(sampleCSS, indent);
    setOutput(formatted);
    toast({ title: "Sample CSS Loaded", description: "Beautified sample CSS stylesheet." });
  };

  const formatCSS = (css: string, spacing: string) => {
    // Basic CSS Beautifier
    let formatted = "";
    const tabString = spacing === "tab" ? "\t" : " ".repeat(parseInt(spacing, 10));
    let depth = 0;

    // Clean extra white space
    let cleaned = css
      .replace(/\s*([{\};:])\s*/g, "$1") // strip spaces around curly braces, colons, semicolons
      .replace(/\s+/g, " ")             // reduce multiple spaces
      .trim();

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (char === "{") {
        formatted += " {\n" + tabString.repeat(depth + 1);
        depth++;
      } else if (char === "}") {
        depth = Math.max(0, depth - 1);
        formatted = formatted.trimEnd() + "\n" + tabString.repeat(depth) + "}\n\n" + tabString.repeat(depth);
      } else if (char === ";") {
        formatted += ";\n" + tabString.repeat(depth);
      } else if (char === ":") {
        formatted += ": ";
      } else {
        formatted += char;
      }
    }

    return formatted.replace(/\n\s*\n/g, "\n\n").trim();
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const formatted = formatCSS(input.trim(), indent);
    setOutput(formatted);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Beautified CSS copied.",
    });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card/30 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
            <FileCode2 className="h-3.5 w-3.5 text-primary" /> CSS Studio Formatter
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Client
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Sparkles className="h-3 w-3" /> Load Sample
          </button>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-destructive/10 hover:text-destructive border border-border/30 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Raw CSS Input
            </label>
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
              className="text-[11px] bg-secondary border border-border/40 px-2 py-0.5 rounded-md focus:outline-none font-semibold text-foreground"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=".btn{background:red;color:#fff;} .card{padding:20px;}"
            className="w-full h-44 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-muted/40 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground"
          />

          <button
            onClick={handleFormat}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Wand2 className="h-3.5 w-3.5" /> Format CSS
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Formatted CSS Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Formatted
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-secondary hover:bg-primary/20 transition-colors text-foreground"
                  title="Copy CSS"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">Awaiting formatting</span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Formatted CSS stylesheet will appear here..."
            className="w-full h-44 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-slate-950 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
