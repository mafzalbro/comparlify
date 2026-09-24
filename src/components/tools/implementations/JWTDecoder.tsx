"use client";

import React, { useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";

import { Sparkles, Wand2, ShieldCheck, KeyRound, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JWTDecoder() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [meta, setMeta] = useState<{
    issuedAt?: string;
    expiresAt?: string;
    isExpired?: boolean;
  } | null>(null);
  const { toast } = useToast();

  const sampleJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  const handleLoadSample = () => {
    setInput(sampleJWT);
    setError(null);
    try {
      const parts = sampleJWT.split(".");
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) base64 += "=";
        return decodeURIComponent(escape(window.atob(base64)));
      };
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setMeta({
        issuedAt: new Date(decodedPayload.iat * 1000).toLocaleString(),
        expiresAt: "N/A (No exp claim)",
        isExpired: false
      });
      toast({ title: "Sample JWT Loaded", description: "Sample token decoded successfully." });
    } catch (_) {}
  };

  const handleDecode = () => {
    if (!input.trim()) {
      setHeader("");
      setPayload("");
      setError(null);
      setMeta(null);
      return;
    }

    const parts = input.trim().split(".");
    if (parts.length < 2 || parts.length > 3) {
      setError("Invalid JWT format. Tokens must consist of 3 dot-separated segments (Header, Payload, Signature).");
      setHeader("");
      setPayload("");
      setMeta(null);
      return;
    }

    try {
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        return decodeURIComponent(
          escape(window.atob(base64))
        );
      };

      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setError(null);

      // Metadata / Expiration tracking
      const metadata: typeof meta = {};
      if (decodedPayload.iat) {
        metadata.issuedAt = new Date(decodedPayload.iat * 1000).toLocaleString();
      }
      if (decodedPayload.exp) {
        const expTime = decodedPayload.exp * 1000;
        metadata.expiresAt = new Date(expTime).toLocaleString();
        metadata.isExpired = Date.now() > expTime;
      }
      setMeta(metadata);
    } catch (err) {
      setError("Failed to parse JWT segments. Please verify that this is a valid base64-encoded token.");
      setHeader("");
      setPayload("");
      setMeta(null);
    }
  };

  const handleClear = () => {
    setInput("");
    setHeader("");
    setPayload("");
    setError(null);
    setMeta(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card/30 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">
            JWT Studio Inspector
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Client
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
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            Paste Raw JWT Token
          </label>
          <span className="text-[10px] font-mono text-muted-foreground">
            {input ? `${input.length} chars` : "Empty"}
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ..."
          className="w-full h-20 sm:h-24 p-3 sm:p-4 rounded-xl border border-border/30 bg-muted/40 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed text-foreground break-all"
        />

        <button
          onClick={handleDecode}
          className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Wand2 className="h-3.5 w-3.5" /> Decode JWT Token
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {header && payload && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                Header (Algorithm & Type)
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(header);
                  setCopiedHeader(true);
                  setTimeout(() => setCopiedHeader(false), 2000);
                  toast({ title: "Copied!", description: "JWT Header copied." });
                }}
                className="p-1 rounded bg-secondary hover:bg-primary/20 text-foreground transition-colors"
              >
                {copiedHeader ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-border/30 text-xs font-mono text-purple-400 overflow-auto h-48 sm:h-60 leading-relaxed">
              {header}
            </pre>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Payload (Claims & Data)
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(payload);
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                  toast({ title: "Copied!", description: "JWT Payload copied." });
                }}
                className="p-1 rounded bg-secondary hover:bg-primary/20 text-foreground transition-colors"
              >
                {copiedPayload ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-border/30 text-xs font-mono text-emerald-400 overflow-auto h-48 sm:h-60 leading-relaxed">
              {payload}
            </pre>
          </div>
        </div>
      )}

      {meta && (meta.issuedAt || meta.expiresAt) && (
        <div className="p-3 sm:p-4 rounded-xl border border-border/30 bg-card/20 flex flex-wrap gap-4 sm:gap-6 text-xs">
          {meta.issuedAt && (
            <div>
              <span className="text-muted-foreground font-semibold">Issued At: </span>
              <strong className="text-foreground">{meta.issuedAt}</strong>
            </div>
          )}
          {meta.expiresAt && (
            <div>
              <span className="text-muted-foreground font-semibold">Expires At: </span>
              <strong className="text-foreground">{meta.expiresAt}</strong>
              {meta.isExpired !== undefined && (
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  meta.isExpired ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  {meta.isExpired ? "EXPIRED" : "ACTIVE"}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
