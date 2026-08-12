"use client";

import React, { useState } from "react";
import { Check, Copy, RefreshCw, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeConfusing, setExcludeConfusing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    let lowerChars = "abcdefghijklmnopqrstuvwxyz";
    let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numChars = "0123456789";
    let symChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeConfusing) {
      lowerChars = lowerChars.replace(/[il]/g, "");
      upperChars = upperChars.replace(/[IO]/g, "");
      numChars = numChars.replace(/[01]/g, "");
      symChars = symChars.replace(/[|:;.,<>]/g, "");
    }

    let charPool = "";
    if (lowercase) charPool += lowerChars;
    if (uppercase) charPool += upperChars;
    if (numbers) charPool += numChars;
    if (symbols) charPool += symChars;

    if (!charPool) return "Please select at least one character type.";

    const cryptoObj = window.crypto;
    const array = new Uint8Array(length);
    cryptoObj.getRandomValues(array);

    let password = "";
    for (let i = 0; i < length; i++) {
      password += charPool[array[i] % charPool.length];
    }
    return password;
  };

  const handleGenerate = () => {
    const list: string[] = [];
    const limit = Math.max(1, Math.min(20, quantity));
    for (let i = 0; i < limit; i++) {
      list.push(generatePassword());
    }
    setPasswords(list);
  };

  const handleCopyAll = () => {
    if (passwords.length === 0) return;
    navigator.clipboard.writeText(passwords.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Passwords copied to clipboard.",
    });
  };

  // Run generation on load/change
  React.useEffect(() => {
    handleGenerate();
  }, [length, uppercase, lowercase, numbers, symbols, excludeConfusing, quantity]);

  // Calculate entropy/strength
  const getStrength = () => {
    let poolSize = 0;
    if (lowercase) poolSize += 26;
    if (uppercase) poolSize += 26;
    if (numbers) poolSize += 10;
    if (symbols) poolSize += 26;

    if (poolSize === 0) return { label: "No options selected", color: "text-destructive" };

    const entropy = Math.log2(poolSize) * length;
    if (entropy < 40) return { label: "Weak (Easy to crack)", color: "text-destructive", bg: "bg-destructive/10" };
    if (entropy < 60) return { label: "Moderate (Standard safety)", color: "text-amber-500", bg: "bg-amber-500/10" };
    if (entropy < 80) return { label: "Strong (High security)", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    return { label: "Absolute Fortress (Unbreakable)", color: "text-cyan-500", bg: "bg-cyan-500/10" };
  };

  const strength = getStrength();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        {/* Length Slider */}
        <div className="flex flex-col space-y-2 lg:col-span-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Password Length: <span className="text-primary text-sm font-bold">{length}</span>
            </label>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="w-full accent-primary bg-secondary h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Quantity (Bulk)
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            className="w-full p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Character Type Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-2 border-y border-border/10">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="rounded border-border/30 text-primary focus:ring-0"
          />
          Lowercase (a-z)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-border/30 text-primary focus:ring-0"
          />
          Uppercase (A-Z)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
          <input
            type="checkbox"
            checked={numbers}
            onChange={(e) => setNumbers(e.target.checked)}
            className="rounded border-border/30 text-primary focus:ring-0"
          />
          Numbers (0-9)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
          <input
            type="checkbox"
            checked={symbols}
            onChange={(e) => setSymbols(e.target.checked)}
            className="rounded border-border/30 text-primary focus:ring-0"
          />
          Special Symbols
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground col-span-2 lg:col-span-1">
          <input
            type="checkbox"
            checked={excludeConfusing}
            onChange={(e) => setExcludeConfusing(e.target.checked)}
            className="rounded border-border/30 text-primary focus:ring-0"
          />
          Avoid Ambiguous (l, 1, o, 0)
        </label>
      </div>

      {/* Password Strength Banner */}
      {strength && (
        <div className={`p-4 rounded-xl border border-border/10 flex items-center justify-between text-xs font-bold ${strength.bg}`}>
          <span className="flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Security Strength:
          </span>
          <span className={strength.color}>{strength.label}</span>
        </div>
      )}

      {/* Results */}
      {passwords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Generated Credentials
            </span>
            <button
              onClick={handleCopyAll}
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-secondary/30 font-mono text-xs text-foreground overflow-auto max-h-60 leading-relaxed space-y-2">
            {passwords.map((pw, idx) => (
              <div
                key={idx}
                className="hover:text-primary transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-secondary/20 flex items-center justify-between"
                onClick={() => {
                  navigator.clipboard.writeText(pw);
                  toast({ title: "Copied!", description: `Password #${idx + 1} copied.` });
                }}
              >
                <span>{pw}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase opacity-60 group-hover:opacity-100">Click to Copy</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
