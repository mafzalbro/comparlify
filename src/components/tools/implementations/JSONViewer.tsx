"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, AlertCircle, Trash2 } from "lucide-react";

export function JSONViewer() {
  const [input, setInput] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    if (!input.trim()) {
      setError("Please enter some JSON to parse.");
      setParsedData(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
      setParsedData(null);
    }
  };

  const handleClear = () => {
    setInput("");
    setParsedData(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">
              JSON Input
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
            placeholder='Paste your JSON here... e.g. {"name":"Alice","roles":["user","admin"]}'
            className="w-full h-80 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
          />
          <button
            onClick={handleParse}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Parse & View Tree
          </button>
        </div>

        {/* Right: Interactive Tree View */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-bold text-foreground h-7 flex items-center">
            Interactive Tree Viewer
          </label>
          <div className="w-full h-80 p-5 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs overflow-auto leading-relaxed">
            {parsedData !== null ? (
              <TreeNode value={parsedData} isLast={true} />
            ) : (
              <span className="text-muted-foreground/60">Parsed tree visual will appear here...</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── RECURSIVE TREE NODE ───────────────────────────────────────────────────────
function TreeNode({ label, value, isLast = true }: { label?: string; value: any; isLast?: boolean }) {
  const [expanded, setExpanded] = useState(true);

  const type = typeof value;

  if (value === null) {
    return (
      <div className="pl-4">
        {label && <span className="text-purple-400">"{label}": </span>}
        <span className="text-gray-400 font-bold">null</span>
        {!isLast && <span className="text-foreground">,</span>}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="pl-4">
          {label && <span className="text-purple-400">"{label}": </span>}
          <span className="text-foreground">[ ]</span>
          {!isLast && <span className="text-foreground">,</span>}
        </div>
      );
    }

    return (
      <div className="pl-4">
        <div className="flex items-center gap-1 cursor-pointer select-none py-0.5" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-primary" />}
          {label && <span className="text-purple-400">"{label}": </span>}
          <span className="text-muted-foreground">Array[{value.length}]</span>
          {!expanded && <span className="text-foreground"> [...]</span>}
        </div>
        {expanded && (
          <div className="border-l border-border/20 pl-2 ml-1.5 space-y-0.5">
            {value.map((item, idx) => (
              <TreeNode key={idx} value={item} isLast={idx === value.length - 1} />
            ))}
          </div>
        )}
        {!isLast && <span className="text-foreground">,</span>}
      </div>
    );
  }

  if (type === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return (
        <div className="pl-4">
          {label && <span className="text-purple-400">"{label}": </span>}
          <span className="text-foreground">{"{ }"}</span>
          {!isLast && <span className="text-foreground">,</span>}
        </div>
      );
    }

    return (
      <div className="pl-4">
        <div className="flex items-center gap-1 cursor-pointer select-none py-0.5" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-primary" />}
          {label && <span className="text-purple-400">"{label}": </span>}
          <span className="text-muted-foreground">Object</span>
          {!expanded && <span className="text-foreground"> {"{...}"}</span>}
        </div>
        {expanded && (
          <div className="border-l border-border/20 pl-2 ml-1.5 space-y-0.5">
            {keys.map((key, idx) => (
              <TreeNode key={key} label={key} value={value[key]} isLast={idx === keys.length - 1} />
            ))}
          </div>
        )}
        {!isLast && <span className="text-foreground">,</span>}
      </div>
    );
  }

  // Primitive Types (String, Number, Boolean)
  let renderValue = <span className="text-amber-500">{value.toString()}</span>;
  if (type === "string") {
    renderValue = <span className="text-emerald-500">"{value}"</span>;
  } else if (type === "number") {
    renderValue = <span className="text-amber-500">{value}</span>;
  } else if (type === "boolean") {
    renderValue = <span className="text-cyan-500 font-bold">{value.toString()}</span>;
  }

  return (
    <div className="pl-4 py-0.5">
      {label && <span className="text-purple-400">"{label}": </span>}
      {renderValue}
      {!isLast && <span className="text-foreground">,</span>}
    </div>
  );
}
