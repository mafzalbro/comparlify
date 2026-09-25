"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Trash2, Code2, AlertCircle, Sparkles, Wand2, ShieldCheck, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleJSON = JSON.stringify(
    {
      appName: "Comparlify",
      version: "2.0.0",
      features: ["JSON Studio", "PDF Suite", "Financial Calculators"],
      config: { active: true, maxUsers: 1000, theme: "dark" }
    },
    null,
    2
  );

  const handleLoadSample = () => {
    setInput(sampleJSON);
    setError(null);
    try {
      const parsed = JSON.parse(sampleJSON);
      const space = indent === "tab" ? "\t" : parseInt(indent, 10);
      setOutput(JSON.stringify(parsed, null, space));
      toast({ title: "Sample Loaded", description: "JSON sample loaded and formatted." });
    } catch (_) {}
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setError("Please enter some JSON to format.");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const space = indent === "tab" ? "\t" : parseInt(indent, 10);
      const formatted = JSON.stringify(parsed, null, space);
      setOutput(formatted);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
      setOutput("");
    }
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
      description: "Formatted JSON copied to clipboard.",
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
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
    <div className="space-y-4">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/50 backdrop-blur-xl px-4 py-3 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block leading-tight">
              JSON Formatter & Beautifier
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Surgical RFC 8259 Client-Side Parsing Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> Sample
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-destructive/10 hover:text-destructive border border-border/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-primary" /> Input Raw JSON
            </label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                {input ? `${input.length} chars` : "0 chars"}
              </span>
              <select
                value={indent}
                onChange={(e) => setIndent(e.target.value)}
                className="text-[11px] bg-background/90 border border-border/60 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40 font-bold text-foreground transition-all shadow-inner"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tabs</option>
              </select>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste raw JSON here... e.g. {"name":"John", "age":30}'
            className="w-full h-64 sm:h-96 p-4 rounded-2xl border border-border/50 bg-background/80 dark:bg-slate-950/70 font-mono text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:outline-none resize-none leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-inner transition-all selection:bg-primary/30"
          />

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={handleFormat}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:bg-primary/90 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md shadow-primary/10"
            >
              <Wand2 className="h-4 w-4" /> Format JSON
            </button>
            <button
              onClick={handleMinify}
              className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-foreground text-xs font-bold transition-all active:scale-[0.99] flex items-center gap-1.5"
            >
              <Minimize2 className="h-3.5 w-3.5" /> Minify
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Formatted Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Valid JSON
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-primary/20 border border-border/30 transition-all text-foreground"
                  title="Copy JSON"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-primary/20 border border-border/30 transition-all text-foreground"
                  title="Download .json"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono font-medium">Awaiting Input</span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here automatically..."
            className="w-full h-64 sm:h-96 p-4 rounded-2xl border border-border/50 bg-slate-950/90 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed shadow-inner selection:bg-emerald-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold leading-relaxed shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
