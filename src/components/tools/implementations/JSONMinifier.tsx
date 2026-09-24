"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { ShieldCheck, Sparkles, Wand2, Minimize2 } from "lucide-react";

export function JSONMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleJSON = JSON.stringify({ name: "Comparlify", version: "2.0.0", active: true }, null, 2);

  const handleLoadSample = () => {
    setInput(sampleJSON);
    setError(null);
    try {
      const minified = JSON.stringify(JSON.parse(sampleJSON));
      setOutput(minified);
      toast({ title: "Sample Loaded", description: "JSON minified." });
    } catch (_) {}
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setError("Please enter some JSON to minify.");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
      setOutput("");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Minified JSON copied to clipboard.",
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card/30 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
            <Minimize2 className="h-3.5 w-3.5 text-primary" /> JSON Minifier Studio
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
              Formatted JSON Input
            </label>
            <span className="text-[10px] font-mono text-muted-foreground">
              {input ? `${input.length} chars` : "Empty"}
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste formatted JSON here..."
            className="w-full h-44 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-muted/40 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground"
          />

          <button
            onClick={handleMinify}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Wand2 className="h-3.5 w-3.5" /> Compress / Minify JSON
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Minified Single-Line Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {output.length} chars ({Math.round(((input.length - output.length) / (input.length || 1)) * 100)}% saved)
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-secondary hover:bg-primary/20 transition-colors text-foreground"
                  title="Copy JSON"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">Awaiting minification</span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Minified single-line output will appear here..."
            className="w-full h-44 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-slate-950 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed break-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}
