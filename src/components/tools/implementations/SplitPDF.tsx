"use client";

import React from "react";
import { PDFWorkspace, PDFPageItem } from "./PDFWorkspace";
import { PDFDocument, degrees } from "pdf-lib";

export function SplitPDF() {
  const handleProcess = async (pages: PDFPageItem[], pdfDoc: PDFDocument) => {
    // Collect 0-indexed page numbers to extract
    const pagesToExtract = pages
      .filter((p) => p.selected)
      .map((p) => p.originalIndex);

    if (pagesToExtract.length === 0) {
      throw new Error("Please select at least one page to extract.");
    }

    const splitDoc = await PDFDocument.create();
    const copiedPages = await splitDoc.copyPages(pdfDoc, pagesToExtract);

    copiedPages.forEach((page, idx) => {
      const pageConfig = pages.filter((p) => p.selected)[idx];
      if (pageConfig && pageConfig.rotation > 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + pageConfig.rotation) % 360));
      }
      splitDoc.addPage(page);
    });

    const pdfBytes = await splitDoc.save();
    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "split_document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Our premium visual Split PDF engine displays real-time page previews. Simply toggle checkboxes on the thumbnails, rotate individual pages, and compile your new document instantly.
      </p>
      <PDFWorkspace
        onProcess={handleProcess}
        processButtonLabel="Split & Extract Selected Pages"
      />
    </div>
  );
}
