"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Trash2, Code2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Sparkles, Wand2, ShieldCheck } from "lucide-react";

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
      features: ["JSON Studio", "PDF Tools", "Calculators"],
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
      toast({ title: "Sample Loaded", description: "JSON sample loaded and formatted instantly." });
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
    <div className="space-y-3 sm:space-y-5">
      {/* Interactive Tool Studio Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card/30 backdrop-blur-xl px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">
            JSON Studio Engine
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
        {/* Input panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              Raw JSON Input
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                {input ? `${input.length} chars` : "Empty"}
              </span>
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
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste raw JSON here... e.g. {"name":"John", "age":30}'
            className="w-full h-48 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-muted/40 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground"
          />

          <div className="flex gap-2">
            <button
              onClick={handleFormat}
              className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Wand2 className="h-3.5 w-3.5" /> Format JSON
            </button>
            <button
              onClick={handleMinify}
              className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Minify
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Formatted Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Syntax Valid
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-secondary hover:bg-primary/20 transition-colors text-foreground"
                  title="Copy JSON"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1 rounded-md bg-secondary hover:bg-primary/20 transition-colors text-foreground"
                  title="Download .json"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">Awaiting format</span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="w-full h-48 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-slate-950 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
