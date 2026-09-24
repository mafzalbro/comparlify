"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, List } from "lucide-react";

import { ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RegexTester() {
  const [pattern, setPattern] = useState("\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("Contact us at support@comparlify.com or info@domain.org for help!");
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePreset = (presetType: "email" | "url" | "phone" | "ip") => {
    if (presetType === "email") {
      setPattern("\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b");
      setTestText("Reach out to admin@comparlify.com or contact@hello.co");
    } else if (presetType === "url") {
      setPattern("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)");
      setTestText("Visit https://www.comparlify.com or http://sub.domain.org/path?q=123");
    } else if (presetType === "phone") {
      setPattern("\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}");
      setTestText("Call us at +1-800-555-0199 or 415-555-2671 now!");
    } else if (presetType === "ip") {
      setPattern("\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b");
      setTestText("Server IP is 192.168.1.1 and gateway is 10.0.0.254");
    }
    toast({ title: "Preset Applied", description: `Loaded ${presetType.toUpperCase()} pattern sample.` });
  };

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const list: any[] = [];
      let match;

      if (flags.includes("g")) {
        // Reset lastIndex
        regex.lastIndex = 0;
        while ((match = regex.exec(testText)) !== null) {
          list.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          // Prevent infinite loops with zero-width matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          list.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid regular expression.");
      setMatches([]);
    }
  }, [pattern, flags, testText]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card/30 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">
            Regex Studio & Inspector
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Client
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground mr-1 hidden sm:inline">Presets:</span>
          {(["email", "url", "phone", "ip"] as const).map(p => (
            <button
              key={p}
              onClick={() => handlePreset(p)}
              className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold transition-all uppercase"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column: Regex input */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Regular Expression
            </label>
            <div className="flex rounded-xl border border-border/30 bg-secondary/10 overflow-hidden font-mono text-xs items-center px-3 gap-1">
              <span className="text-muted-foreground/60">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="pattern"
                className="flex-1 py-2.5 bg-transparent focus:outline-none text-foreground border-none"
              />
              <span className="text-muted-foreground/60">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
                className="w-12 py-2.5 bg-transparent text-primary font-bold focus:outline-none border-none text-center"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] font-bold text-muted-foreground/60">Common Flags:</span>
            <button
              onClick={() => setFlags(f => f.includes("g") ? f.replace("g", "") : f + "g")}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                flags.includes("g") ? "bg-primary/10 border-primary text-primary" : "border-border/30"
              }`}
            >
              g (global)
            </button>
            <button
              onClick={() => setFlags(f => f.includes("i") ? f.replace("i", "") : f + "i")}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                flags.includes("i") ? "bg-primary/10 border-primary text-primary" : "border-border/30"
              }`}
            >
              i (insensitive)
            </button>
            <button
              onClick={() => setFlags(f => f.includes("m") ? f.replace("m", "") : f + "m")}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                flags.includes("m") ? "bg-primary/10 border-primary text-primary" : "border-border/30"
              }`}
            >
              m (multiline)
            </button>
          </div>

          {error ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Regex compiles successfully!</span>
            </div>
          )}
        </div>

        {/* Right column: Test text and highlights */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Test String
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to match against here..."
              className="w-full h-40 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Captured matches list */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <List className="h-4 w-4 text-primary" /> Matches found ({matches.length})
            </h3>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {matches.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border/10 bg-secondary/30 text-xs font-mono">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-primary">Match #{idx + 1}</span>
                      <span className="text-muted-foreground">Index {m.index}</span>
                    </div>
                    <div className="text-foreground bg-primary/10 px-1.5 py-0.5 rounded w-fit select-all">
                      {m.text}
                    </div>
                    {m.groups.length > 0 && (
                      <div className="mt-2 space-y-0.5 text-[10px] border-t border-border/10 pt-2 text-muted-foreground">
                        {m.groups.map((g: string, gIdx: number) => (
                          <div key={gIdx}>
                            Group {gIdx + 1}: <strong className="text-foreground font-mono">"{g || "null"}"</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No active matches found. Try modifying your expression or string.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
