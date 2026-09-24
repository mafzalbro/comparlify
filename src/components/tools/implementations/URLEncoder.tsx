"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { ShieldCheck, Sparkles, Wand2, Link } from "lucide-react";

export function URLEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("component"); // "uri" or "component"
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleURL = "https://www.comparlify.com/tools?search=platform comparison&category=developer tools";

  const handleLoadSample = () => {
    setInput(sampleURL);
    const encoded = mode === "component" ? encodeURIComponent(sampleURL) : encodeURI(sampleURL);
    setOutput(encoded);
    toast({ title: "Sample URL Loaded", description: "Sample URL percent-encoded." });
  };

  const handleEncode = () => {
    if (!input) {
      setOutput("");
      return;
    }
    try {
      const encoded = mode === "component" ? encodeURIComponent(input) : encodeURI(input);
      setOutput(encoded);
    } catch (err) {
      setOutput("Encoding error.");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Encoded URL copied.",
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
            <Link className="h-3.5 w-3.5 text-primary" /> URL Percent Encoder
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
              Plaintext Input
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="text-[11px] bg-secondary border border-border/40 px-2 py-0.5 rounded-md focus:outline-none font-semibold text-foreground"
            >
              <option value="component">Query Component (Strict)</option>
              <option value="uri">Full URL (Lenient)</option>
            </select>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URL query string or path to encode..."
            className="w-full h-44 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-muted/40 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground"
          />

          <button
            onClick={handleEncode}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Wand2 className="h-3.5 w-3.5" /> Percent-Encode URL
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Percent-Encoded Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Encoded
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-secondary hover:bg-primary/20 transition-colors text-foreground"
                  title="Copy URL"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">Awaiting encoding</span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Encoded URL string will appear here..."
            className="w-full h-44 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-slate-950 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed break-all"
          />
        </div>
      </div>
    </div>
  );
}
