"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2, AlertCircle, Sparkles, Wand2, ShieldCheck, Binary } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Base64Decoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleBase64 = "Q29tcGFybGlmeTogVGhlIFVsdGltYXRlIFBsYXRmb3JtICYgRGV2ZWxvcGVyIFV0aWxpdHkgU3VpdGU=";

  const handleLoadSample = () => {
    setInput(sampleBase64);
    setError(null);
    try {
      const decoded = decodeURIComponent(escape(window.atob(sampleBase64)));
      setOutput(decoded);
      toast({ title: "Sample Loaded", description: "Base64 sample loaded and decoded." });
    } catch (_) {}
  };

  const handleDecode = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const cleanedInput = input.replace(/\s+/g, "");
      const decoded = decodeURIComponent(escape(window.atob(cleanedInput)));
      setOutput(decoded);
      setError(null);
    } catch (err: any) {
      setError("Decoding failed. Please make sure you entered a valid Base64 string.");
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
      description: "Decoded plaintext copied.",
    });
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
              Base64 Decoder Studio
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Client-Side Plaintext Decoding Engine
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
              <Binary className="h-3.5 w-3.5 text-primary" /> Base64 String Input
            </label>
            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
              {input ? `${input.length} chars` : "0 chars"}
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your Base64 encoded string here..."
            className="w-full h-64 sm:h-96 p-4 rounded-2xl border border-border/50 bg-background/80 dark:bg-slate-950/70 font-mono text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:outline-none resize-none leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-inner transition-all selection:bg-primary/30 break-all"
          />

          <button
            onClick={handleDecode}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:bg-primary/90 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md shadow-primary/10"
          >
            <Wand2 className="h-4 w-4" /> Decode to Plaintext
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Decoded Plaintext Output
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {output.length} chars
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-primary/20 border border-border/30 transition-all text-foreground"
                  title="Copy Decoded Text"
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
            placeholder="Decoded plaintext will appear here..."
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
