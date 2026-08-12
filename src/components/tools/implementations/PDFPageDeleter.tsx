"use client";

import React from "react";
import { PDFWorkspace, PDFPageItem } from "./PDFWorkspace";
import { PDFDocument, degrees } from "pdf-lib";

export function PDFPageDeleter() {
  const handleProcess = async (pages: PDFPageItem[], pdfDoc: PDFDocument) => {
    // Only compile selected pages (effectively deleting non-selected or binned pages!)
    const pagesToKeep = pages
      .filter((p) => p.selected)
      .map((p) => p.originalIndex);

    if (pagesToKeep.length === 0) {
      throw new Error("You cannot delete all pages. Please keep at least one page.");
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(pdfDoc, pagesToKeep);

    copiedPages.forEach((page, idx) => {
      const pageConfig = pages.filter((p) => p.selected)[idx];
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
    a.download = "deleted_pages_result.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Delete unwanted pages using an interactive visual layout. Click the trash icon or deselect page previews below to remove them, and download your cleaned PDF instantly.
      </p>
      <PDFWorkspace
        onProcess={handleProcess}
        processButtonLabel="Delete Unselected Pages & Save PDF"
      />
    </div>
  );
}
