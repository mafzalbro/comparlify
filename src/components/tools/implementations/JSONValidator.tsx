"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

import { ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JSONValidator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    isValid: boolean;
    message: string;
    details?: { line?: number; column?: number };
  } | null>(null);
  const { toast } = useToast();

  const sampleJSON = `{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "id": "usr_99812",\n    "roles": ["admin", "editor"]\n  }\n}`;

  const handleLoadSample = () => {
    setInput(sampleJSON);
    setResult({
      isValid: true,
      message: "Valid JSON! Your document complies perfectly with standard RFC 8259 specifications."
    });
    toast({ title: "Sample Loaded", description: "Validated sample JSON document." });
  };

  const handleValidate = () => {
    if (!input.trim()) {
      setResult({
        isValid: false,
        message: "Please enter some JSON text to validate.",
      });
      return;
    }

    try {
      JSON.parse(input);
      setResult({
        isValid: true,
        message: "Valid JSON! Your document complies perfectly with standard RFC 8259 specifications.",
      });
    } catch (err: any) {
      const errMsg = err.message || "Invalid JSON syntax.";
      let line: number | undefined;
      let column: number | undefined;

      // Extract line/column from standard Chrome/V8 JSON.parse errors
      // e.g. "Unexpected token } in JSON at position 24" or "Expected double-quoted property name in JSON at line 2 column 5"
      const lineMatch = errMsg.match(/line (\d+)/i);
      const colMatch = errMsg.match(/column (\d+)/i);
      if (lineMatch) {
        line = parseInt(lineMatch[1], 10);
      }
      if (colMatch) {
        column = parseInt(colMatch[1], 10);
      }

      setResult({
        isValid: false,
        message: errMsg,
        details: { line, column },
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card/30 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">
            JSON Validator Studio
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> RFC 8259
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

      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            JSON Syntax Document
          </label>
          <span className="text-[10px] font-mono text-muted-foreground">
            {input ? `${input.length} chars` : "Empty"}
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. {"name": "Alice", "age": 25}'
          className="w-full h-48 sm:h-80 p-3 sm:p-4 rounded-xl border border-border/30 bg-muted/40 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground"
        />

        <button
          onClick={handleValidate}
          className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Wand2 className="h-3.5 w-3.5" /> Validate JSON Syntax
        </button>
      </div>

      {result && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            result.isValid
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          <div className="flex gap-3">
            {result.isValid ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <div className="space-y-1">
              <h4 className="text-sm font-bold tracking-tight">
                {result.isValid ? "Validation Successful" : "Validation Failed"}
              </h4>
              <p className="text-xs font-medium leading-relaxed">
                {result.message}
              </p>
              {result.details && (result.details.line || result.details.column) && (
                <div className="text-[10px] font-mono mt-2 bg-secondary/40 border border-border/10 py-1.5 px-2.5 rounded-lg w-fit">
                  {result.details.line && <span>Line: {result.details.line}</span>}
                  {result.details.column && <span className="ml-3">Column: {result.details.column}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
