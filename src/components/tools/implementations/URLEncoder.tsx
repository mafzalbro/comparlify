"use client";

import React, { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function URLEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("component"); // "uri" or "component"
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">
              Plaintext Input
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
            placeholder="Enter URL query string or path to encode..."
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
          />
          <button
            onClick={handleEncode}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Encode URL
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-7">
            <label className="text-sm font-bold text-foreground">
              Percent-Encoded Output
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                title="Copy URL"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Encoded URL string will appear here..."
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground focus:outline-none resize-none leading-relaxed break-all"
          />
        </div>
      </div>
    </div>
  );
}
