"use client";

import React, { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UUIDGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateUUIDv4 = () => {
    // Cryptographically secure standard RFC 4122 UUID v4
    const cryptoObj = window.crypto;
    const buffer = new Uint32Array(4);
    cryptoObj.getRandomValues(buffer);

    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    if (!hyphens) {
      uuid = uuid.replace(/-/g, "");
    }
    return uppercase ? uuid.toUpperCase() : uuid.toLowerCase();
  };

  const handleGenerate = () => {
    const list: string[] = [];
    const limit = Math.max(1, Math.min(100, quantity));
    for (let i = 0; i < limit; i++) {
      list.push(generateUUIDv4());
    }
    setUuids(list);
  };

  const handleCopyAll = () => {
    if (uuids.length === 0) return;
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: `All ${uuids.length} UUIDs copied to clipboard.`,
    });
  };

  // Generate on mount
  React.useEffect(() => {
    handleGenerate();
  }, [quantity, uppercase, hyphens]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Quantity */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Quantity (Max 100)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            className="w-full p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Casing / Formatting */}
        <div className="flex flex-wrap gap-4 py-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-border/30 text-primary focus:ring-0"
            />
            Uppercase
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded border-border/30 text-primary focus:ring-0"
            />
            Include Hyphens
          </label>
        </div>

        {/* Buttons */}
        <button
          onClick={handleGenerate}
          className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
        </button>
      </div>

      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Generated Results ({uuids.length})
            </span>
            <button
              onClick={handleCopyAll}
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground overflow-auto max-h-60 leading-relaxed space-y-1">
            {uuids.map((uuid, idx) => (
              <div key={idx} className="hover:text-primary transition-colors cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(uuid);
                toast({ title: "Copied!", description: `UUID #${idx + 1} copied.` });
              }}>
                {uuid}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
