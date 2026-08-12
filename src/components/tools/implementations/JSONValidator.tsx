"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

export function JSONValidator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    isValid: boolean;
    message: string;
    details?: { line?: number; column?: number };
  } | null>(null);

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground">
            Enter JSON string to validate
          </label>
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 font-bold"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. {"name": "Alice", "age": 25}'
          className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
        />
        <button
          onClick={handleValidate}
          className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Validate JSON
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
