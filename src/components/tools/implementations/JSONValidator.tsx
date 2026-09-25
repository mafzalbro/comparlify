"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Trash2, ShieldCheck, Sparkles, Wand2, Code2 } from "lucide-react";
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
    <div className="space-y-4">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/50 backdrop-blur-xl px-4 py-3 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block leading-tight">
              JSON Syntax Validator
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Strict RFC 8259 Compliance Verification
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

      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-primary" /> Input Document
          </label>
          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
            {input ? `${input.length} chars` : "0 chars"}
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. {"name": "Alice", "age": 25}'
          className="w-full h-64 sm:h-80 p-4 rounded-2xl border border-border/50 bg-background/80 dark:bg-slate-950/70 font-mono text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:outline-none resize-none leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-inner transition-all selection:bg-primary/30"
        />

        <button
          onClick={handleValidate}
          className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold uppercase tracking-wider transition-all hover:bg-primary/90 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md shadow-primary/10"
        >
          <Wand2 className="h-4 w-4" /> Validate JSON Syntax
        </button>
      </div>

      {result && (
        <div
          className={`p-5 rounded-2xl border transition-all shadow-md ${
            result.isValid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-destructive/15 border-destructive/30 text-destructive"
          }`}
        >
          <div className="flex gap-3">
            {result.isValid ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            )}
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold tracking-tight">
                {result.isValid ? "Validation Successful" : "Validation Failed"}
              </h4>
              <p className="text-xs font-medium leading-relaxed">
                {result.message}
              </p>
              {result.details && (result.details.line || result.details.column) && (
                <div className="text-[10px] font-mono mt-2 bg-slate-950/60 border border-border/30 py-1.5 px-3 rounded-lg w-fit text-muted-foreground">
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
