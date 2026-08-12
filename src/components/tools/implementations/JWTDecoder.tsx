"use client";

import React, { useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";

export function JWTDecoder() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    issuedAt?: string;
    expiresAt?: string;
    isExpired?: boolean;
  } | null>(null);

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground">
            Paste JWT Token
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
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ..."
          className="w-full h-24 p-4 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed break-all"
        />
        <button
          onClick={handleDecode}
          className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Decode JWT Token
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {header && payload && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Header (Algorithm & Type)
            </label>
            <pre className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-xs font-mono text-purple-400 overflow-auto h-60 leading-relaxed">
              {header}
            </pre>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Payload (Claims & Data)
            </label>
            <pre className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-xs font-mono text-emerald-400 overflow-auto h-60 leading-relaxed">
              {payload}
            </pre>
          </div>
        </div>
      )}

      {meta && (meta.issuedAt || meta.expiresAt) && (
        <div className="p-4 rounded-xl border border-border/30 bg-secondary/15 flex flex-wrap gap-6 text-xs">
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
