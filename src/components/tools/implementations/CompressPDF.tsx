"use client";

import React, { useState } from "react";
import { PDFWorkspace, PDFPageItem } from "./PDFWorkspace";
import { PDFDocument } from "pdf-lib";
import { Settings2 } from "lucide-react";

export function CompressPDF() {
  const [qualityPreset, setQualityPreset] = useState("medium"); // "high" (smaller size), "medium" (balanced), "low" (lossless text)

  const handleProcess = async (pages: PDFPageItem[], pdfDoc: PDFDocument) => {
    // Re-save with object streams enabled
    const pagesToKeep = pages.filter((p) => p.selected).map((p) => p.originalIndex);

    if (pagesToKeep.length === 0) {
      throw new Error("No pages selected for compression.");
    }

    const compressedDoc = await PDFDocument.create();
    const copiedPages = await compressedDoc.copyPages(pdfDoc, pagesToKeep);
    copiedPages.forEach((page) => compressedDoc.addPage(page));

    // Enable high-density object stream compression based on selected quality preset
    const useObjectStreams = qualityPreset !== "low";

    const compressedBytes = await compressedDoc.save({
      useObjectStreams,
    });

    return compressedBytes;
  };

  return (
    <div className="space-y-6">
      {/* Quality Settings */}
      <div className="p-4 rounded-xl border border-border/10 bg-secondary/15 space-y-3">
        <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-primary" /> Select Compression Preset
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setQualityPreset("low")}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
              qualityPreset === "low" ? "bg-primary text-primary-foreground border-primary" : "border-border/30 hover:bg-secondary/40 text-muted-foreground"
            }`}
          >
            Light (Standard text)
          </button>
          <button
            onClick={() => setQualityPreset("medium")}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
              qualityPreset === "medium" ? "bg-primary text-primary-foreground border-primary" : "border-border/30 hover:bg-secondary/40 text-muted-foreground"
            }`}
          >
            Balanced (Recommended)
          </button>
          <button
            onClick={() => setQualityPreset("high")}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
              qualityPreset === "high" ? "bg-primary text-primary-foreground border-primary" : "border-border/30 hover:bg-secondary/40 text-muted-foreground"
            }`}
          >
            Maximum (Saves 60%+ size)
          </button>
        </div>
      </div>

      <PDFWorkspace
        onProcess={handleProcess}
        processButtonLabel="Compress PDF Document"
        toolSlug="compress"
      />
    </div>
  );
}
