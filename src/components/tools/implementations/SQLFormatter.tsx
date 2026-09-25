"use client";

import React, { useState } from "react";
import { format } from "sql-formatter";
import { Check, Copy, Trash2, AlertCircle, ShieldCheck, Sparkles, Wand2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SQLFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState("sql");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleSQL = "select u.id, u.name, u.email, r.role_name from users u inner join roles r on u.role_id=r.id where u.active=1 and u.created_at >= '2025-01-01' group by u.id, u.name, u.email, r.role_name order by u.created_at desc limit 10;";

  const handleLoadSample = () => {
    setInput(sampleSQL);
    setError(null);
    try {
      const formatted = format(sampleSQL, {
        language: dialect as any,
        tabWidth: indent === "tab" ? 4 : parseInt(indent, 10),
        useTabs: indent === "tab",
        keywordCase: "upper",
      });
      setOutput(formatted);
      toast({ title: "Sample SQL Loaded", description: "Beautified sample query." });
    } catch (_) {}
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const formatted = format(input, {
        language: dialect as any,
        tabWidth: indent === "tab" ? 4 : parseInt(indent, 10),
        useTabs: indent === "tab",
        keywordCase: "upper",
      });
      setOutput(formatted);
      setError(null);
    } catch (err: any) {
      setError(err.message || "SQL parsing exception.");
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
      description: "Beautified SQL query copied.",
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
            <Database className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block leading-tight">
              SQL Query Formatter & Beautifier
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Multi-Dialect SQL Syntax Alignment Engine
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
              <Database className="h-3.5 w-3.5 text-primary" /> Raw SQL Query
            </label>
            <div className="flex items-center gap-2">
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="text-[11px] bg-background/90 border border-border/60 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40 font-bold text-foreground transition-all shadow-inner"
              >
                <option value="sql">Standard SQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="tsql">T-SQL</option>
              </select>

              <select
                value={indent}
                onChange={(e) => setIndent(e.target.value)}
                className="text-[11px] bg-background/90 border border-border/60 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40 font-bold text-foreground transition-all shadow-inner"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tabs</option>
              </select>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT id,name,email FROM users WHERE id=5 JOIN roles ON users.role_id=roles.id..."
            className="w-full h-64 sm:h-96 p-4 rounded-2xl border border-border/50 bg-background/80 dark:bg-slate-950/70 font-mono text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary/60 focus:outline-none resize-none leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-inner transition-all selection:bg-primary/30"
          />

          <button
            onClick={handleFormat}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:bg-primary/90 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md shadow-primary/10"
          >
            <Wand2 className="h-4 w-4" /> Format SQL Query
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 h-6">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Beautified SQL Query
            </label>
            {output ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Formatted
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-primary/20 border border-border/30 transition-all text-foreground"
                  title="Copy SQL"
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
            placeholder="Capitalized and aligned SQL query will appear here..."
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
