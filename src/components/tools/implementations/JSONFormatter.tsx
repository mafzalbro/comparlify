"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Trash2, Code2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              Raw JSON Input
            </label>
            <div className="flex items-center gap-3">
              <select
                value={indent}
                onChange={(e) => setIndent(e.target.value)}
                className="text-xs bg-secondary border border-border/40 px-2 py-1 rounded-md focus:outline-none"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tabs</option>
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
            placeholder='Paste your raw JSON here... e.g. {"name":"John", "age":30}'
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex gap-2">
            <button
              onClick={handleFormat}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Format JSON
            </button>
            <button
              onClick={handleMinify}
              className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Minify
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-7">
            <label className="text-sm font-bold text-foreground">
              Formatted Output
            </label>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  title="Copy JSON"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                  title="Download .json"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground focus:outline-none resize-none leading-relaxed"
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
