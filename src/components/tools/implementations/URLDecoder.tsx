"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function URLDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("component"); // "uri" or "component"
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDecode = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const decoded = mode === "component" ? decodeURIComponent(input) : decodeURI(input);
      setOutput(decoded);
      setError(null);
    } catch (err: any) {
      setError("Decoding failed. The string contains invalid percent sequences.");
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
      description: "Decoded URL string copied.",
    });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">
              Encoded URL Input
            </label>
            <div className="flex items-center gap-3">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="text-xs bg-secondary border border-border/40 px-2 py-1 rounded-md focus:outline-none"
              >
                <option value="component">Query Component (Strict)</option>
                <option value="uri">Full URL (Lenient)</option>
              </select>
              <button
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 font-bold"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your percent-encoded URL string here..."
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed break-all"
          />
          <button
            onClick={handleDecode}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Decode URL
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-7">
            <label className="text-sm font-bold text-foreground">
              Decoded Plaintext Output
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                title="Copy Decoded URL"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Decoded plaintext will appear here..."
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
