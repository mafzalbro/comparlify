"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2, Sparkles, Wand2, ShieldCheck, Binary } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleInput = "Comparlify: The Ultimate Platform & Developer Utility Suite";

  const handleLoadSample = () => {
    setInput(sampleInput);
    try {
      const encoded = window.btoa(unescape(encodeURIComponent(sampleInput)));
      setOutput(encoded);
      toast({ title: "Sample Loaded", description: "Base64 sample loaded and encoded." });
    } catch (_) {}
  };

  const handleEncode = () => {
    if (!input) {
      setOutput("");
      return;
    }
    try {
      const encoded = window.btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (err) {
      setOutput("Encoding error occurred.");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Base64 encoded string copied.",
    });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
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
              Base64 Encoder Studio
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              UTF-8 Compatible Browser Encoding Engine
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
              <Binary className="h-3.5 w-3.5 text-primary" /> Plaintext Input
            </label>
            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
              {input ? `${input.length} chars` : "0 chars"}
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter standard text or code to encode..."
            className="w-full h-64 sm:h-96 p-4 rounded-2xl border border-border/50 bg-background/80 dark:bg-slate-950/70 font-mono text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:outline-none resize-none leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-inner transition-all selection:bg-primary/30"
          />

          <button
            onClick={handleEncode}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:bg-primary/90 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md shadow-primary/10"
          >
            <Wand2 className="h-4 w-4" /> Encode to Base64
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Base64 Encoded Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {output.length} chars
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-primary/20 border border-border/30 transition-all text-foreground"
                  title="Copy Base64"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono font-medium">Awaiting Input</span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Encoded string will appear here..."
            className="w-full h-64 sm:h-96 p-4 rounded-2xl border border-border/50 bg-slate-950/90 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed break-all shadow-inner selection:bg-emerald-500/30"
          />
        </div>
      </div>
    </div>
  );
}
