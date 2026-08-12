"use client";

import React from "react";
import { PDFWorkspace, PDFPageItem } from "./PDFWorkspace";
import { PDFDocument, degrees } from "pdf-lib";

export function PDFRotator() {
  const handleProcess = async (pages: PDFPageItem[], pdfDoc: PDFDocument) => {
    // Rotates and compiles all pages
    const pagesToCompile = pages.map((p) => p.originalIndex);

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(pdfDoc, pagesToCompile);

    copiedPages.forEach((page, idx) => {
      const pageConfig = pages[idx];
      if (pageConfig && pageConfig.rotation > 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + pageConfig.rotation) % 360));
      }
      newDoc.addPage(page);
    });

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "rotated_document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Rotate specific or all PDF pages visually in your browser. Select page previews below, apply 90° right rotations, and download your perfectly oriented document.
      </p>
      <PDFWorkspace
        onProcess={handleProcess}
        processButtonLabel="Apply Rotations & Export PDF"
      />
    </div>
  );
}
