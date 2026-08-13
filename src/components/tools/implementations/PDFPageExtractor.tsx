"use client";

import React from "react";
import { PDFWorkspace, PDFPageItem } from "./PDFWorkspace";
import { PDFDocument, degrees } from "pdf-lib";

export function PDFPageExtractor() {
  const handleProcess = async (pages: PDFPageItem[], pdfDoc: PDFDocument) => {
    const pagesToExtract = pages
      .filter((p) => p.selected)
      .map((p) => p.originalIndex);

    if (pagesToExtract.length === 0) {
      throw new Error("Please select at least one page to extract.");
    }

    const extractedDoc = await PDFDocument.create();
    const copiedPages = await extractedDoc.copyPages(pdfDoc, pagesToExtract);

    copiedPages.forEach((page, idx) => {
      const pageConfig = pages.filter((p) => p.selected)[idx];
      if (pageConfig && pageConfig.rotation > 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + pageConfig.rotation) % 360));
      }
      extractedDoc.addPage(page);
    });

    const pdfBytes = await extractedDoc.save();
    return pdfBytes;
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Extract pages visually from your PDF document in high-fidelity. Select specific thumbnails below, correct any page orientations, and export immediately.
      </p>
      <PDFWorkspace
        onProcess={handleProcess}
        processButtonLabel="Extract & Export Selected Pages"
        toolSlug="split"
      />
    </div>
  );
}
